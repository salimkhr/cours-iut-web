"use client";

import React, { useRef, useCallback, useState } from "react";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { isContainer } from "@/lib/blockSchemas";
import { InlineTextEditor, type InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import { ConfirmDeleteBlockDialog } from "@/components/builder/ConfirmDeleteBlockDialog";
import type { Block } from "@/types/CourseContent";

interface EditableBlockProps {
    block: Block;
    /** id du parent (null = racine) — pour le réordonnancement DnD. */
    parentId: string | null;
    index: number;
    /** Rendu public du bloc (def.render(...)) quand il n'est PAS en édition. */
    children: React.ReactNode;
    /** Ouvre le block picker à l'index donné sous le parent. */
    onInsertAfter: () => void;
    /** Ouvre le block picker *à l'intérieur* de ce bloc (conteneurs). */
    onInsertInside?: () => void;
    /** Enregistre le handle de l'éditeur actif (pour la toolbar). */
    registerEditor?: (h: InlineTextEditorHandle | null) => void;
    /** Classes supplémentaires sur le wrapper externe (ex. col-span pour les blocs column). */
    wrapperClassName?: string;
}

const ACTION_TYPES = new Set(["code", "code-runnable", "image-card", "table", "chart", "diagram"]);

/** Types dont le champ inline tient sur une ligne : Entrée y vaut validation. */
const SINGLE_LINE_TYPES = new Set([
    "section", "list-item", "heading", "slide", "slide-list-item",
]);

/** Un bloc sans contenu ni enfant ne se rend pas : il faut lui donner une prise. */
function isBlockEmpty(block: Block, field?: string): boolean {
    if (block.children && block.children.length > 0) return false;
    if (field) return String(block.props[field] ?? "").trim().length === 0;
    return Object.values(block.props).every(
        (v) => v === undefined || v === null || String(v).trim().length === 0
    );
}

export function EditableBlock({
    block,
    parentId,
    index,
    children,
    onInsertAfter,
    onInsertInside,
    registerEditor,
    wrapperClassName,
}: EditableBlockProps) {
    const def = getBlockDefinition(block.type);
    const selectedId = useBuilderStore((s) => s.selectedId);
    const editingBlockId = useBuilderStore((s) => s.editingBlockId);
    const blockError = useBuilderStore((s) => s.blockErrors[block.id]);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const setEditingBlock = useBuilderStore((s) => s.setEditingBlock);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const moveBlockToIndex = useBuilderStore((s) => s.moveBlockToIndex);

    const editorRef = useRef<InlineTextEditorHandle | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const field = def?.inlineEditField;

    const handleEditorRef = useCallback((h: InlineTextEditorHandle | null) => {
        editorRef.current = h;
        registerEditor?.(h);
    }, [registerEditor]);
    const isSelected = selectedId === block.id;
    const isEditing = editingBlockId === block.id && Boolean(field);
    const isText = Boolean(field);
    const isAction = ACTION_TYPES.has(block.type);
    const cursor = isText ? "cursor-text" : isAction ? "cursor-pointer" : "cursor-pointer";
    const isEmpty = isBlockEmpty(block, field);
    const inlinePlaceholder = field
        ? (def?.fields?.find((f) => f.key === field)?.placeholder ?? "Cliquez pour écrire…")
        : undefined;
    const isEmptyContainer = isContainer(block.type) && (block.children?.length ?? 0) === 0;
    /** Un séparateur n'a rien à remplir : ne pas l'inviter à le faire. */
    const hasSomethingToFill = Boolean(field) || (def?.fields?.length ?? 0) > 0 || Boolean(def?.editor);

    const beginEdit = () => {
        selectBlock(block.id);
        if (field) setEditingBlock(block.id);
    };

    const commit = (next: string) => {
        if (field) updateBlock(block.id, { [field]: next });
        setEditingBlock(null);
        registerEditor?.(null);
    };

    const requestDelete = () => {
        // Un bloc rempli ou porteur d'enfants emporte du travail avec lui :
        // on demande confirmation. Un bloc vide part sans friction.
        if (isEmpty) {
            useBuilderStore.getState().deleteBlock(block.id);
            return;
        }
        setConfirmOpen(true);
    };

    return (
        <div className={["group/eb relative", wrapperClassName].filter(Boolean).join(" ")}>
            <div
                role="article"
                tabIndex={0}
                aria-label={def?.label ?? block.type}
                onClick={(e) => {
                    e.stopPropagation();
                    beginEdit();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !isEditing) {
                        e.preventDefault();
                        beginEdit();
                    }
                }}
                draggable={!isEditing}
                onDragStart={(e) => e.dataTransfer.setData("text/block-id", block.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData("text/block-id");
                    if (draggedId && draggedId !== block.id) {
                        moveBlockToIndex(draggedId, parentId, index);
                    }
                }}
                className={[
                    "relative rounded-md border transition-colors",
                    // Un bloc vide se rendait sur 2 px de haut : impossible à
                    // viser à la souris, donc impossible à rouvrir. On lui
                    // réserve une hauteur de ligne cliquable.
                    isEmpty && !isEditing ? "min-h-9" : "",
                    cursor,
                    isEditing
                        ? "border-[var(--mod-color)] bg-[var(--mod-color)]/5 dark:bg-[var(--mod-color)]/10"
                        : isSelected
                          ? "border-[var(--mod-color)]"
                          : "border-transparent hover:border-[var(--mod-color)]/40",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color)] focus-visible:ring-offset-1",
                ].filter(Boolean).join(" ")}
            >
                {/* Handle drag */}
                <button
                    type="button"
                    aria-label="Déplacer le bloc"
                    className="absolute -left-6 top-1 z-10 hidden cursor-grab rounded p-0.5 text-bridge-500 hover:text-bridge-700 dark:text-bridge-400 dark:hover:text-bridge-200 group-hover/eb:block"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="size-4" />
                </button>

                {/* Badge éditer — cliquable : c'est souvent la seule cible
                    visible d'un bloc court, un badge inerte y renvoyait le clic
                    au canvas qui désélectionnait le bloc. */}
                {!isEditing && (
                    <button
                        type="button"
                        aria-label={`Modifier : ${def?.label ?? block.type}`}
                        onClick={(e) => { e.stopPropagation(); beginEdit(); }}
                        className="absolute -top-2.5 right-2 z-10 hidden cursor-pointer items-center gap-1 rounded bg-[var(--mod-color)] px-1.5 py-0.5 text-[11px] text-white shadow-sm transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color)] focus-visible:ring-offset-1 group-hover/eb:flex"
                    >
                        <Pencil className="size-3" />
                        {def?.label ?? block.type}
                    </button>
                )}

                {/* Supprimer */}
                <button
                    type="button"
                    aria-label="Supprimer le bloc"
                    className="absolute -right-6 top-1 z-10 hidden cursor-pointer rounded p-0.5 text-bridge-500 hover:text-red-600 dark:text-bridge-400 group-hover/eb:block"
                    onClick={(e) => {
                        e.stopPropagation();
                        requestDelete();
                    }}
                >
                    <Trash2 className="size-4" />
                </button>

                {/* Contenu : éditeur inline OU rendu public */}
                {isEditing && field ? (
                    isContainer(block.type) && (block.children?.length ?? 0) > 0 ? (
                        /* Conteneur non vide (partie, liste…) : éditeur du titre
                           visible en haut, enfants conservés (grisés) dessous.
                           Un conteneur vide n'affiche que l'éditeur, sinon le
                           texte apparaissait en double sous le champ. */
                        <div className="flex flex-col">
                            <div className="p-1">
                                <InlineTextEditor
                                    ref={handleEditorRef}
                                    value={String(block.props[field] ?? "")}
                                    onCommit={commit}
                                    singleLine={SINGLE_LINE_TYPES.has(block.type)}
                                    placeholder={inlinePlaceholder}
                                    ariaLabel={`Éditer ${def?.label ?? block.type}`}
                                />
                            </div>
                            <div className="pointer-events-none opacity-40 select-none">
                                {children}
                            </div>
                        </div>
                    ) : (
                        <div className="p-1">
                            <InlineTextEditor
                                ref={handleEditorRef}
                                value={String(block.props[field] ?? "")}
                                onCommit={commit}
                                singleLine={SINGLE_LINE_TYPES.has(block.type)}
                                placeholder={inlinePlaceholder}
                                ariaLabel={`Éditer ${def?.label ?? block.type}`}
                            />
                        </div>
                    )
                ) : (
                    <>
                        {children}
                        {isEmpty && !isEmptyContainer && hasSomethingToFill && (
                            <p className="pointer-events-none px-2 py-1.5 text-sm italic text-bridge-500 dark:text-bridge-300">
                                {field
                                    ? inlinePlaceholder
                                    : `${def?.label ?? block.type} vide — remplissez-le dans le panneau Propriétés`}
                            </p>
                        )}
                        {/* Un conteneur vide (encadré, dépliable, colonne, partie)
                            n'a aucun enfant à survoler : sans ce bouton, il était
                            impossible d'y placer quoi que ce soit. */}
                        {isEmptyContainer && onInsertInside && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onInsertInside(); }}
                                className={[
                                    "m-1 cursor-pointer items-center gap-1 rounded-md border border-dashed border-bridge-300 px-2 py-1.5 text-sm text-bridge-600 transition-colors duration-150 hover:border-[var(--mod-color)] hover:text-[var(--mod-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color)] dark:border-bridge-600 dark:text-bridge-300",
                                    // Un conteneur qui a aussi un champ propre
                                    // (partie, élément de liste) affiche déjà
                                    // quelque chose : le bouton n'apparaît qu'au
                                    // survol pour ne pas saturer le canvas.
                                    field ? "hidden group-hover/eb:inline-flex" : "inline-flex",
                                ].join(" ")}
                            >
                                <Plus className="size-3.5" />
                                Ajouter un bloc dans « {def?.label ?? block.type} »
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Erreur de validation, annoncée */}
            {blockError && (
                <p role="alert" className="mt-1 px-1 text-xs text-red-600">
                    {blockError}
                </p>
            )}

            {/* + Bloc ici (hover). Pastille compacte posée dans la gouttière
                gauche : la version centrée avec libellé recouvrait la ligne de
                texte du bloc suivant. Le libellé n'apparaît qu'au survol du
                bouton lui-même. */}
            <div className="group/ins flex h-0 items-center justify-start opacity-0 transition-opacity hover:opacity-100 group-hover/eb:opacity-100">
                <button
                    type="button"
                    aria-label="Insérer un bloc après ce bloc"
                    onClick={onInsertAfter}
                    className="-my-2 -ml-3 flex cursor-pointer items-center gap-1 rounded-full border border-bridge-300/60 bg-card px-1.5 py-0.5 text-xs text-bridge-600 shadow-sm transition-colors duration-150 hover:text-[var(--mod-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color)] dark:border-bridge-600/45 dark:text-bridge-300"
                >
                    <Plus className="size-3" />
                    <span className="hidden group-hover/ins:inline group-focus-within/ins:inline">Bloc ici</span>
                </button>
            </div>

            <ConfirmDeleteBlockDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                label={def?.label ?? block.type}
                childCount={block.children?.length ?? 0}
                onConfirm={() => useBuilderStore.getState().deleteBlock(block.id)}
            />
        </div>
    );
}
