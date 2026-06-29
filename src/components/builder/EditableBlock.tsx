"use client";

import React, { useRef, useCallback } from "react";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { isContainer } from "@/lib/blockSchemas";
import { InlineTextEditor, type InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
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
    /** Enregistre le handle de l'éditeur actif (pour la toolbar). */
    registerEditor?: (h: InlineTextEditorHandle | null) => void;
}

const ACTION_TYPES = new Set(["code", "code-runnable", "image-card", "table", "chart", "diagram"]);

export function EditableBlock({
    block,
    parentId,
    index,
    children,
    onInsertAfter,
    registerEditor,
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
    const field = def?.inlineEditField;

    const handleEditorRef = useCallback((h: InlineTextEditorHandle | null) => {
        editorRef.current = h;
        registerEditor?.(h);
    }, [registerEditor]);
    const isSelected = selectedId === block.id;
    const isEditing = editingBlockId === block.id && Boolean(field);
    const isText = Boolean(field);
    const isAction = ACTION_TYPES.has(block.type);
    const cursor = isText ? "cursor-text" : isAction ? "cursor-pointer" : "cursor-default";

    const beginEdit = () => {
        selectBlock(block.id);
        if (field) setEditingBlock(block.id);
    };

    const commit = (next: string) => {
        if (field) updateBlock(block.id, { [field]: next });
        setEditingBlock(null);
        registerEditor?.(null);
    };

    const cancel = () => {
        setEditingBlock(null);
        registerEditor?.(null);
    };

    return (
        <div className="group/eb relative">
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
                    cursor,
                    isEditing
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30"
                        : isSelected
                          ? "border-blue-400"
                          : "border-transparent hover:border-blue-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                ].join(" ")}
            >
                {/* Handle drag */}
                <button
                    type="button"
                    aria-label="Déplacer le bloc"
                    className="absolute -left-6 top-1 z-10 hidden cursor-grab rounded p-0.5 text-slate-400 hover:text-slate-600 group-hover/eb:block"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="size-4" />
                </button>

                {/* Badge éditer */}
                {!isEditing && (
                    <span className="pointer-events-none absolute right-1 top-1 z-10 hidden items-center gap-1 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] text-white group-hover/eb:flex">
                        <Pencil className="size-3" />
                        {def?.label ?? block.type}
                    </span>
                )}

                {/* Supprimer */}
                <button
                    type="button"
                    aria-label="Supprimer le bloc"
                    className="absolute -right-6 top-1 z-10 hidden rounded p-0.5 text-slate-400 hover:text-red-600 group-hover/eb:block"
                    onClick={(e) => {
                        e.stopPropagation();
                        // getState() évite d'abonner le composant à deleteBlock (référence stable)
                        useBuilderStore.getState().deleteBlock(block.id);
                    }}
                >
                    <Trash2 className="size-4" />
                </button>

                {/* Contenu : éditeur inline OU rendu public */}
                {isEditing && field ? (
                    isContainer(block.type) ? (
                        /* Conteneur (section, list…) : éditeur du titre visible
                           en haut, enfants conservés (grisés) en dessous */
                        <div className="flex flex-col">
                            <div className="p-1">
                                <InlineTextEditor
                                    ref={handleEditorRef}
                                    value={String(block.props[field] ?? "")}
                                    onCommit={commit}
                                    onCancel={cancel}
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
                                onCancel={cancel}
                                ariaLabel={`Éditer ${def?.label ?? block.type}`}
                            />
                        </div>
                    )
                ) : (
                    children
                )}
            </div>

            {/* Erreur de validation, annoncée */}
            {blockError && (
                <p role="alert" className="mt-1 px-1 text-xs text-red-600">
                    {blockError}
                </p>
            )}

            {/* + Bloc ici (hover) */}
            <div className="flex h-0 items-center justify-center opacity-0 transition-opacity hover:opacity-100 group-hover/eb:opacity-100">
                <button
                    type="button"
                    aria-label="Insérer un bloc après ce bloc"
                    onClick={onInsertAfter}
                    className="-my-2 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500 shadow-sm hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800"
                >
                    <Plus className="size-3" /> Bloc ici
                </button>
            </div>
        </div>
    );
}
