"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronRight, Trash2, Plus, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/store/builderStore";
import { isContainer, canDrop } from "@/lib/blockSchemas";
import { getBlockDefinition, getAllBlockDefinitions, createBlockInstance } from "@/lib/blockRegistry";
import { BlockForm } from "@/components/builder/BlockForm";
import { BlockInsertDialog } from "@/components/builder/BlockInsertDialog";
import type { Block } from "@/types/CourseContent";

interface BlockNodeProps {
    block: Block;
    depth?: number;
    indexInParent: number;
    parentId: string | null;
}

export function BlockNode({ block, depth = 0, indexInParent, parentId }: BlockNodeProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [insertChildOpen, setInsertChildOpen] = useState(false);
    const [insertAfterOpen, setInsertAfterOpen] = useState(false);
    const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const deleteBlock = useBuilderStore((s) => s.deleteBlock);
    const selectedId = useBuilderStore((s) => s.selectedId);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const blockErrors = useBuilderStore((s) => s.blockErrors);
    const collapsed = useBuilderStore((s) => !!s.collapsedIds[block.id]);
    const toggleCollapse = useBuilderStore((s) => s.toggleCollapse);
    const errorMessage = blockErrors[block.id];

    const insertBlock = useBuilderStore((s) => s.insertBlock);

    const isCollapsible = isContainer(block.type);
    const hasChildren = (block.children?.length ?? 0) > 0;
    const def = getBlockDefinition(block.type);

    const contentPreview = String(
        block.props.title ?? block.props.content ?? block.props.text ?? block.props.code ?? ""
    ).slice(0, 50);

    // Si un seul type enfant possible → insertion directe sans dialog
    const allowedChildDefs = isContainer(block.type)
        ? getAllBlockDefinitions().filter((d) => canDrop(d.type, block.type))
        : [];
    const singleChildDef = allowedChildDefs.length === 1 ? allowedChildDefs[0] : null;

    function insertSingleChild() {
        if (!singleChildDef) return;
        const newBlock = createBlockInstance(singleChildDef);
        insertBlock(newBlock, block.id, Number.MAX_SAFE_INTEGER);
        selectBlock(newBlock.id);
    }

    function handleDeleteClick() {
        if (confirmDelete) {
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
            deleteBlock(block.id);
        } else {
            setConfirmDelete(true);
            confirmTimer.current = setTimeout(() => setConfirmDelete(false), 1500);
        }
    }

    const isSelected = selectedId === block.id;

    return (
        <div
            className={cn(
                "border rounded-lg overflow-hidden transition-colors",
                errorMessage
                    ? "border-red-400/70 bg-red-50/60 dark:border-red-600/50 dark:bg-red-950/20"
                    : isSelected
                        ? "border-blue-500/60 bg-blue-500/5"
                        : "border-slate-300/40 dark:border-slate-600/30 bg-slate-50/60 dark:bg-slate-800/40",
                depth > 0 && "ml-4"
            )}
        >
            {/* En-tête du nœud */}
            <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
                onClick={() => selectBlock(isSelected ? null : block.id)}
            >
                {isCollapsible && (
                    <button
                        className="text-slate-400 hover:text-slate-600 shrink-0"
                        onClick={(e) => { e.stopPropagation(); toggleCollapse(block.id); }}
                        aria-label={collapsed ? "Déplier" : "Replier"}
                    >
                        {collapsed
                            ? <ChevronRight className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />
                        }
                    </button>
                )}
                {errorMessage && (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" aria-label={errorMessage} />
                )}
                <span className={cn(
                    "text-[10px] font-mono shrink-0 uppercase tracking-wide",
                    errorMessage ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                )}>
                    {def?.label ?? block.type}
                </span>
                {contentPreview && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">
                        {contentPreview}
                    </span>
                )}
                <div className="flex items-center gap-1 shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                    {isContainer(block.type) && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-slate-400 hover:text-blue-600"
                            title={singleChildDef ? `Ajouter ${singleChildDef.label}` : "Ajouter un bloc enfant"}
                            onClick={singleChildDef ? insertSingleChild : () => setInsertChildOpen(true)}
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-slate-400 hover:text-blue-600"
                        title="Ajouter un bloc après"
                        onClick={() => setInsertAfterOpen(true)}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                            "h-6 w-6 transition-colors",
                            confirmDelete
                                ? "text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20"
                                : "text-slate-400 hover:text-red-500"
                        )}
                        title={confirmDelete ? "Confirmer la suppression" : "Supprimer ce bloc"}
                        onClick={handleDeleteClick}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Message d'erreur */}
            {errorMessage && (
                <div className="px-3 py-1.5 border-t border-red-300/40 dark:border-red-600/30 bg-red-50/80 dark:bg-red-950/30">
                    <p className="text-[11px] text-red-600 dark:text-red-400 leading-snug">{errorMessage}</p>
                </div>
            )}

            {/* Formulaire inline si sélectionné */}
            {isSelected && !collapsed && (
                <div className="border-t border-slate-300/30 dark:border-slate-600/20">
                    <BlockForm blockId={block.id} />
                </div>
            )}

            {/* Enfants */}
            {!collapsed && (hasChildren || isContainer(block.type)) && (
                <div className="flex flex-col gap-2 p-2 border-t border-slate-300/30 dark:border-slate-600/20">
                    {block.children!.map((child, i) => (
                        <BlockNode
                            key={child.id}
                            block={child}
                            depth={depth + 1}
                            indexInParent={i}
                            parentId={block.id}
                        />
                    ))}
                    {singleChildDef && (
                        <button
                            onClick={insertSingleChild}
                            className="flex items-center gap-1.5 w-full px-2 py-1 rounded text-[11px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-colors duration-150 cursor-pointer"
                        >
                            <Plus className="w-3 h-3 shrink-0" />
                            Ajouter {singleChildDef.label}
                        </button>
                    )}
                </div>
            )}

            {/* Dialogs d'insertion */}
            <BlockInsertDialog
                open={insertChildOpen}
                onClose={() => setInsertChildOpen(false)}
                parentId={block.id}
                index={Number.MAX_SAFE_INTEGER}
            />
            <BlockInsertDialog
                open={insertAfterOpen}
                onClose={() => setInsertAfterOpen(false)}
                parentId={parentId}
                index={indexInParent + 1}
            />
        </div>
    );
}
