"use client";

import React, { useState } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { EditableBlock } from "@/components/builder/EditableBlock";
import { CodeEditorModal } from "@/components/builder/CodeEditorModal";
import { ImageEditDialog } from "@/components/builder/ImageEditDialog";
import { ContextualTopBar } from "@/components/builder/ContextualTopBar";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

interface CourseEditCanvasProps {
    onInsertAfter: (parentId: string | null, index: number) => void;
}

export function CourseEditCanvas({ onInsertAfter }: CourseEditCanvasProps) {
    const blocks = useBuilderStore((s) => s.blocks);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const [activeEditor, setActiveEditor] = useState<InlineTextEditorHandle | null>(null);
    const [codeModal, setCodeModal] = useState<{ id: string; value: string; language: string } | null>(null);
    const [imageModal, setImageModal] = useState<{ id: string } | null>(null);

    const openCodeModal = (id: string) => {
        const blk = findBlock(blocks, id);
        if (!blk) return;
        if (blk.type !== "code" && blk.type !== "code-runnable") return;
        setCodeModal({
            id,
            value: String(blk.props.code ?? blk.props.content ?? ""),
            language: String(blk.props.language ?? "javascript"),
        });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ContextualTopBar
                mode="course"
                onInsert={() => onInsertAfter(null, Number.MAX_SAFE_INTEGER)}
                onOpenCodeModal={openCodeModal}
                onEditImage={(id) => setImageModal({ id })}
                activeEditor={activeEditor}
            />

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 px-6 py-8 dark:bg-slate-950">
                <div className="mx-auto flex max-w-3xl flex-col gap-3">
                    {blocks.map((block, i) => (
                        <EditableCourseBlock
                            key={block.id}
                            block={block}
                            parentId={null}
                            index={i}
                            registerEditor={setActiveEditor}
                            onInsertAfter={onInsertAfter}
                            onOpenCodeModal={openCodeModal}
                        />
                    ))}
                </div>
            </div>

            {codeModal && (
                <CodeEditorModal
                    open
                    initialValue={codeModal.value}
                    language={codeModal.language}
                    onClose={() => setCodeModal(null)}
                    onSave={(v) => updateBlock(codeModal.id, { code: v })}
                />
            )}

            {imageModal && (
                <ImageEditDialog
                    open
                    value={String(findBlock(blocks, imageModal.id)?.props.src ?? "")}
                    onChange={(url) => updateBlock(imageModal.id, { src: url })}
                    onClose={() => setImageModal(null)}
                />
            )}
        </div>
    );
}

/** Bloc éditable récursif : wraps chaque bloc ET ses enfants dans EditableBlock. */
function EditableCourseBlock({
    block, parentId, index, registerEditor, onInsertAfter, onOpenCodeModal,
}: {
    block: Block;
    parentId: string | null;
    index: number;
    registerEditor: (h: InlineTextEditorHandle | null) => void;
    onInsertAfter: (parentId: string | null, index: number) => void;
    onOpenCodeModal: (id: string) => void;
}) {
    const def = getBlockDefinition(block.type);
    const isCode = block.type === "code" || block.type === "code-runnable";
    const Render = def?.render;

    const rendered = Render ? (
        <div
            onClick={isCode ? (e) => { e.stopPropagation(); onOpenCodeModal(block.id); } : undefined}
        >
            <Render {...block.props}>
                {block.children?.map((child, i) => (
                    <EditableCourseBlock
                        key={child.id}
                        block={child}
                        parentId={block.id}
                        index={i}
                        registerEditor={registerEditor}
                        onInsertAfter={onInsertAfter}
                        onOpenCodeModal={onOpenCodeModal}
                    />
                ))}
            </Render>
        </div>
    ) : null;

    return (
        <EditableBlock
            block={block}
            parentId={parentId}
            index={index}
            onInsertAfter={() => onInsertAfter(parentId, index + 1)}
            registerEditor={registerEditor}
        >
            {rendered}
        </EditableBlock>
    );
}
