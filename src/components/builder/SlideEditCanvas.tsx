"use client";

import React, { useState } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { ZoomedSlide } from "@/components/builder/ZoomedSlide";
import { EditableBlock } from "@/components/builder/EditableBlock";
import { ContextualTopBar } from "@/components/builder/ContextualTopBar";
import { CodeEditorModal } from "@/components/builder/CodeEditorModal";
import { SlideChildItem } from "@/components/builder/SlideChildrenRenderer";
import { SlidePropsPanel } from "@/components/builder/SlidePropsPanel";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

interface SlideEditCanvasProps {
    slide: Block;
    position: { index: number; total: number };
    /** Rang de section (le badge suit le titre, pas la position). */
    order?: number;
    onInsertAfter: (parentId: string | null, index: number) => void;
}

export function SlideEditCanvas({ slide, position, order, onInsertAfter }: SlideEditCanvasProps) {
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const moduleSlug = useBuilderStore((s) => s.moduleSlug);
    const moduleColorLight = useBuilderStore((s) => s.moduleColorLight);
    const moduleColorDark = useBuilderStore((s) => s.moduleColorDark);
    const selectedId = useBuilderStore((s) => s.selectedId);
    const [activeEditor, setActiveEditor] = useState<InlineTextEditorHandle | null>(null);
    const [codeModal, setCodeModal] = useState<{ id: string; value: string; language: string } | null>(null);

    /** Un bloc de slide + ses descendants, chacun enveloppé pour être
     *  sélectionnable. Sans récursivité, les items d'une liste de slide
     *  n'étaient jamais rendus comme blocs : impossible d'y écrire. */
    const renderBlock = (block: Block, parentId: string, index: number): React.ReactNode => (
        <EditableBlock
            key={block.id}
            block={block}
            parentId={parentId}
            index={index}
            onInsertAfter={() => onInsertAfter(parentId, index + 1)}
            onInsertInside={() => onInsertAfter(block.id, 0)}
            registerEditor={setActiveEditor}
        >
            {block.type === "slide-note" ? (
                // SlideNote ne rend rien dans la slide (réservé au panneau
                // notes du player) : sans cet aperçu, le bloc mesurait 2 px et
                // devenait impossible à retrouver dans l'éditeur.
                <p className="rounded border border-dashed border-bridge-400/60 px-2 py-1 text-sm text-bridge-300">
                    <span className="font-semibold">Note présentateur — </span>
                    {String(block.props.content ?? "") || "vide"}
                </p>
            ) : (
                <SlideChildItem
                    block={block}
                    renderNested={(child, parent, i) => renderBlock(child, parent.id, i)}
                />
            )}
        </EditableBlock>
    );

    const renderChildren = (children: Block[]) => (
        <>{children.map((child, i) => renderBlock(child, slide.id, i))}</>
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

            <div className="flex min-h-0 flex-1">
                <div
                    className={`flex min-h-0 flex-1 items-center justify-center bg-bridge-900 p-8${moduleSlug ? " header-module" : ""}`}
                    style={moduleSlug ? {
                        '--module-color': moduleColorLight || `var(--color-${moduleSlug})`,
                        '--module-color-dark': moduleColorDark || moduleColorLight || `var(--color-${moduleSlug})`,
                    } as React.CSSProperties : undefined}
                >
                    <div className="aspect-[8/5] w-full max-w-6xl">
                        <ZoomedSlide slide={slide} mode="canvas-edit" order={order} renderChildren={renderChildren} />
                    </div>
                </div>

                <SlidePropsPanel slideId={slide.id} selectedId={selectedId} />
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
