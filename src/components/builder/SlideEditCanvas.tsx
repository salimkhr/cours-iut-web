"use client";

import React, { useState } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { ZoomedSlide } from "@/components/builder/ZoomedSlide";
import { EditableBlock } from "@/components/builder/EditableBlock";
import { ContextualTopBar } from "@/components/builder/ContextualTopBar";
import { CodeEditorModal } from "@/components/builder/CodeEditorModal";
import { SlideChildItem } from "@/components/builder/SlideChildrenRenderer";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

interface SlideEditCanvasProps {
    slide: Block;
    position: { index: number; total: number };
    onInsertAfter: (parentId: string | null, index: number) => void;
}

export function SlideEditCanvas({ slide, position, onInsertAfter }: SlideEditCanvasProps) {
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const moduleSlug = useBuilderStore((s) => s.moduleSlug);
    const moduleColorLight = useBuilderStore((s) => s.moduleColorLight);
    const moduleColorDark = useBuilderStore((s) => s.moduleColorDark);
    const [activeEditor, setActiveEditor] = useState<InlineTextEditorHandle | null>(null);
    const [codeModal, setCodeModal] = useState<{ id: string; value: string; language: string } | null>(null);

    const renderChildren = (children: Block[]) => (
        <>
            {children.map((child, i) => (
                <EditableBlock
                    key={child.id}
                    block={child}
                    parentId={slide.id}
                    index={i}
                    onInsertAfter={() => onInsertAfter(slide.id, i + 1)}
                    registerEditor={setActiveEditor}
                >
                    <SlideChildItem block={child} />
                </EditableBlock>
            ))}
        </>
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ContextualTopBar
                mode="slide"
                onInsert={() => onInsertAfter(slide.id, Number.MAX_SAFE_INTEGER)}
                onOpenBackground={() => { /* picker de fond — itération suivante */ }}
                onOpenCodeModal={(id) => {
                    const c = (slide.children ?? []).find((x) => x.id === id);
                    if (c) setCodeModal({ id, value: String(c.props.code ?? ""), language: String(c.props.language ?? "javascript") });
                }}
                activeEditor={activeEditor}
                slidePosition={position}
            />

            <div
                className={`flex min-h-0 flex-1 items-center justify-center bg-slate-800 p-8${moduleSlug ? " header-module" : ""}`}
                style={moduleSlug ? {
                    '--module-color': moduleColorLight || `var(--color-${moduleSlug})`,
                    '--module-color-dark': moduleColorDark || moduleColorLight || `var(--color-${moduleSlug})`,
                } as React.CSSProperties : undefined}
            >
                <div className="aspect-video w-full max-w-5xl">
                    <ZoomedSlide slide={slide} mode="canvas-edit" renderChildren={renderChildren} />
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
