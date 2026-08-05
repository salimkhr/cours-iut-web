"use client";

import React, { useMemo, useState } from "react";
import { Blocks } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import { EditableBlock } from "@/components/builder/EditableBlock";
import { CodeEditorModal } from "@/components/builder/CodeEditorModal";
import { ImageEditDialog } from "@/components/builder/ImageEditDialog";
import { ContextualTopBar } from "@/components/builder/ContextualTopBar";
import { CoursePropsPanel } from "@/components/builder/CoursePropsPanel";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

interface CourseEditCanvasProps {
    onInsertAfter: (parentId: string | null, index: number) => void;
}

/** Types qui ouvrent leur propre modale depuis le canvas. Le tableau, lui,
 *  s'édite dans le panneau de propriétés via `def.editor`. */
const SELF_EDITING_TYPES = new Set(["code", "code-runnable", "image-card"]);

export function CourseEditCanvas({ onInsertAfter }: CourseEditCanvasProps) {
    const blocks = useBuilderStore((s) => s.blocks);
    const moduleSlug = useBuilderStore((s) => s.moduleSlug);
    const moduleColorLight = useBuilderStore((s) => s.moduleColorLight);
    const moduleColorDark = useBuilderStore((s) => s.moduleColorDark);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const [activeEditor, setActiveEditor] = useState<InlineTextEditorHandle | null>(null);
    const [codeModal, setCodeModal] = useState<{ id: string; value: string; language: string } | null>(null);
    const [imageModal, setImageModal] = useState<{ id: string } | null>(null);
    const [propsPanelOpen, setPropsPanelOpen] = useState(false);

    const selectedId = useBuilderStore((s) => s.selectedId);
    const selectBlock = useBuilderStore((s) => s.selectBlock);

    // Une *feuille* sans édition inline ni éditeur dédié (lien de section,
    // fichier à télécharger…) n'a aucune autre porte d'entrée : le panneau
    // s'impose dès qu'un tel bloc est sélectionné. Les conteneurs en sont
    // exclus : leur contenu passe par « Ajouter un bloc dans … », et ouvrir le
    // panneau à chaque clic sur une liste décalerait le canvas sans raison.
    // Valeur dérivée — pas d'effet, donc pas de rendu en cascade.
    const selectedNeedsPanel = useMemo(() => {
        if (!selectedId) return false;
        const blk = findBlock(blocks, selectedId);
        const d = blk ? getBlockDefinition(blk.type) : null;
        if (!blk || !d) return false;
        if (d.fields.length === 0 && !d.editor) return false;
        if (d.container) return false;
        return !d.inlineEditField && !SELF_EDITING_TYPES.has(blk.type);
    }, [selectedId, blocks]);

    const showPropsPanel = propsPanelOpen || selectedNeedsPanel;

    /** Fermer le panneau désélectionne : sinon un bloc « sans autre éditeur »
     *  le rouvrirait aussitôt. */
    const closePropsPanel = () => {
        setPropsPanelOpen(false);
        if (selectedNeedsPanel) selectBlock(null);
    };

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
                propsPanelOpen={showPropsPanel}
                onTogglePropsPanel={() => {
                    if (showPropsPanel) closePropsPanel();
                    else setPropsPanelOpen(true);
                }}
            />

            <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className="min-h-0 flex-1 overflow-y-auto bg-bridge-100 px-6 py-8 dark:bg-bridge-900/40">
                    {blocks.length === 0 ? (
                        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-dashed border-bridge-300 bg-card px-6 py-10 text-center dark:border-bridge-600">
                            <Blocks className="size-7 text-bridge-500 dark:text-bridge-300" aria-hidden="true" />
                            <p className="text-base font-semibold text-brand-dark dark:text-bridge-100">
                                Ce contenu est vide
                            </p>
                            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                                Ajoutez un premier bloc — une « Partie » pour ouvrir un chapitre,
                                un « Texte » pour rédiger directement.
                            </p>
                            <button
                                type="button"
                                onClick={() => onInsertAfter(null, Number.MAX_SAFE_INTEGER)}
                                className="mt-1 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color)] focus-visible:ring-offset-1"
                                style={moduleSlug ? { backgroundColor: "var(--mod-color)" } : undefined}
                            >
                                Ajouter un bloc
                            </button>
                            <p className="text-xs text-bridge-600 dark:text-bridge-300">
                                Raccourci : Ctrl+I. Sauvegarde : Ctrl+S.
                            </p>
                        </div>
                    ) : (
                        <div
                            className={cn("mx-auto flex max-w-3xl flex-col gap-3", moduleSlug ? "header-module" : "")}
                            style={moduleSlug ? {
                                '--module-color': moduleColorLight || `var(--color-${moduleSlug})`,
                                '--module-color-dark': moduleColorDark || moduleColorLight || `var(--color-${moduleSlug})`,
                            } as React.CSSProperties : undefined}
                        >
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
                    )}
                </div>

                {showPropsPanel && <CoursePropsPanel onClose={closePropsPanel} />}
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

    const wrapperClassName = block.type === "column"
        ? (COL_SPAN_CLASS[Number(block.props.span)] ?? "md:col-span-6")
        : undefined;

    return (
        <EditableBlock
            block={block}
            parentId={parentId}
            index={index}
            onInsertAfter={() => onInsertAfter(parentId, index + 1)}
            onInsertInside={() => onInsertAfter(block.id, 0)}
            registerEditor={registerEditor}
            wrapperClassName={wrapperClassName}
        >
            {rendered}
        </EditableBlock>
    );
}
