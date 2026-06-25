"use client";

import React, { useState } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { EditableBlock } from "@/components/builder/EditableBlock";
import { CodeEditorModal } from "@/components/builder/CodeEditorModal";
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

    const openCodeModal = (id: string) => {
        const blk = findBlock(blocks, id);
        if (!blk) return;
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
                activeEditor={activeEditor}
            />

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 px-6 py-8 dark:bg-slate-950">
                <div className="mx-auto flex max-w-3xl flex-col gap-3">
                    {blocks.map((block, i) => (
                        <CourseBlock
                            key={block.id}
                            block={block}
                            index={i}
                            onInsertAfter={() => onInsertAfter(null, i + 1)}
                            registerEditor={setActiveEditor}
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
        </div>
    );
}

function CourseBlock({
    block, index, onInsertAfter, registerEditor, onOpenCodeModal,
}: {
    block: Block;
    index: number;
    onInsertAfter: () => void;
    registerEditor: (h: InlineTextEditorHandle | null) => void;
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
                {block.children?.map((c) => (
                    <RenderChild key={c.id} block={c} />
                ))}
            </Render>
        </div>
    ) : null;

    return (
        <EditableBlock
            block={block}
            parentId={null}
            index={index}
            onInsertAfter={onInsertAfter}
            registerEditor={registerEditor}
        >
            {rendered}
        </EditableBlock>
    );
}

function RenderChild({ block }: { block: Block }) {
    const def = getBlockDefinition(block.type);
    const Render = def?.render;
    if (!Render) return null;
    return (
        <Render {...block.props}>
            {block.children?.map((c) => <RenderChild key={c.id} block={c} />)}
        </Render>
    );
}
