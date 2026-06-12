"use client";

import React, { memo, useState } from "react";
import { GripVertical } from "lucide-react";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import { InlineTextEditor } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

/** Cible d'insertion calculée pendant un drag ou un clic "+". */
export interface InsertContext {
    parentId: string | null;
    parentType: string | null;
    index: number;
}

interface BlockTreeProps {
    blocks: Block[];
    parentId: string | null;
    parentType: string | null;
    depth: number;
    onInsertRequest: (ctx: InsertContext) => void;
    dropTarget?: { parentId: string | null; index: number } | null;
    dropAllowed?: boolean;
    coarsePointer?: boolean;
    isMobile?: boolean;
}

function InsertLine({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex items-center gap-2 my-1 opacity-0 hover:opacity-100 transition-opacity duration-150">
            <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
            <button
                className="bg-brand-primary text-brand-light rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-brand-accent-dark transition-colors cursor-pointer"
                onClick={onClick}
                title="Insérer un bloc ici"
                aria-label="Insérer un bloc ici"
            >
                +
            </button>
            <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
        </div>
    );
}

function DropPreviewLine({
    atIndex,
    parentId,
    dropTarget,
    dropAllowed,
}: {
    atIndex: number;
    parentId: string | null;
    dropTarget?: { parentId: string | null; index: number } | null;
    dropAllowed?: boolean;
}) {
    if (!dropTarget || dropTarget.parentId !== parentId || dropTarget.index !== atIndex) return null;
    return (
        <div className={[
            "flex items-center gap-1 my-1.5 pointer-events-none",
            dropAllowed ? "" : "opacity-50",
        ].join(" ")}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${dropAllowed ? "bg-brand-primary" : "bg-destructive"}`} />
            <div className={`flex-1 h-0.5 rounded-full ${dropAllowed ? "bg-brand-primary" : "bg-destructive"}`} />
            <div className={`w-2 h-2 rounded-full shrink-0 ${dropAllowed ? "bg-brand-primary" : "bg-destructive"}`} />
        </div>
    );
}

/** Zone droppable de fin de conteneur (sert aussi d'état vide). */
function ContainerTail({
    parentId,
    parentType,
    count,
    onInsertRequest,
}: {
    parentId: string;
    parentType: string;
    count: number;
    onInsertRequest: (ctx: InsertContext) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${parentId}:tail`,
        data: { dropZone: true, parentId, parentType, index: count },
    });

    return (
        <div
            ref={setNodeRef}
            className={[
                "rounded-md border border-dashed transition-colors my-1",
                count === 0 ? "p-3 text-center" : "p-0.5",
                isOver
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-bridge-400/30 dark:border-bridge-500/25",
            ].join(" ")}
        >
            <button
                className="w-full text-xs text-bridge-400 dark:text-bridge-500 hover:text-brand-primary transition-colors cursor-pointer"
                onClick={() => onInsertRequest({ parentId, parentType, index: count })}
            >
                + Ajouter un bloc
            </button>
        </div>
    );
}

const SortableBlock = memo(function SortableBlock({
    block,
    parentId,
    parentType,
    index,
    depth,
    onInsertRequest,
    dropTarget,
    dropAllowed,
    coarsePointer,
    isMobile,
}: {
    block: Block;
    parentId: string | null;
    parentType: string | null;
    index: number;
    depth: number;
    onInsertRequest: (ctx: InsertContext) => void;
    dropTarget?: { parentId: string | null; index: number } | null;
    dropAllowed?: boolean;
    coarsePointer?: boolean;
    isMobile?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const [editingInline, setEditingInline] = useState(false);
    const selectedId = useBuilderStore((s) => s.selectedId);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const isSelected = selectedId === block.id;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: block.id,
            data: { origin: "canvas", blockType: block.type, parentId, parentType, index },
        });

    const def = getBlockDefinition(block.type);
    const editFieldKey = def?.inlineEditField;
    const editFieldDef = editFieldKey ? def?.fields.find((f) => f.key === editFieldKey) : undefined;
    const editValue = editFieldKey ? String(block.props[editFieldKey] ?? "") : "";

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    };

    // column : cellule de grille — la classe col-span doit vivre sur le wrapper racine
    const isColumn = block.type === "column";
    const wrapperCls = isColumn
        ? `${COL_SPAN_CLASS[Number(block.props.span)] ?? "md:col-span-6"} min-w-0`
        : undefined;

    function handleInlineChange(next: string) {
        if (!editFieldKey) return;
        updateBlock(block.id, { ...block.props, [editFieldKey]: next });
    }

    function handleDoubleClick(e: React.MouseEvent) {
        if (!editFieldKey || editingInline) return;
        e.stopPropagation();
        setEditingInline(true);
    }

    if (!def) {
        return (
            <div ref={setNodeRef} style={style} className={wrapperCls}>
                <div className="text-bridge-500 dark:text-bridge-400 text-sm p-3">
                    Bloc inconnu : {block.type}
                </div>
            </div>
        );
    }

    const Render = def.render;
    const renderedChildren = def.container ? (
        <BlockTree
            blocks={block.children ?? []}
            parentId={block.id}
            parentType={block.type}
            depth={depth + 1}
            onInsertRequest={onInsertRequest}
            dropTarget={dropTarget}
            dropAllowed={dropAllowed}
            coarsePointer={coarsePointer}
            isMobile={isMobile}
        />
    ) : undefined;

    const isDropTargetBlocked = def.container && dropTarget?.parentId === block.id && !dropAllowed;

    // column : cellule structurelle — pas de chrome de sélection ni de drag handle,
    // juste la zone droppable + les enfants
    if (isColumn) {
        return (
            <div ref={setNodeRef} style={style} className={[wrapperCls, isDropTargetBlocked ? "cursor-not-allowed" : ""].filter(Boolean).join(" ")}>
                <div className="rounded-lg border border-dashed border-bridge-400/25 dark:border-bridge-500/20 p-2 h-full">
                    {renderedChildren}
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className={isDropTargetBlocked ? "cursor-not-allowed" : undefined}>
            <InsertLine onClick={() => onInsertRequest({ parentId, parentType, index })} />

            <div
                className={[
                    "relative group rounded-lg transition-all duration-150",
                    editFieldKey && !editingInline ? "cursor-text" : "cursor-pointer",
                    isSelected
                        ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-bridge-100 dark:ring-offset-bridge-900"
                        : "ring-1 ring-transparent hover:ring-bridge-400/40 dark:hover:ring-bridge-500/35",
                ].join(" ")}
                title={editFieldKey && !editingInline ? "Double-cliquez pour éditer" : undefined}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
                onDoubleClick={handleDoubleClick}
            >
                {(hovered || isSelected || (coarsePointer && !isMobile)) && (
                    <div
                        className="absolute -top-2.5 left-2 z-10 max-w-[calc(100%-3rem)] bg-brand-primary text-brand-light text-[10px] px-1.5 py-0.5 rounded font-mono tracking-wide select-none truncate"
                        title={block.type}
                    >
                        {block.type}
                    </div>
                )}

                {(hovered || isSelected || (coarsePointer && !isMobile)) && (
                    <button
                        className="absolute right-1.5 top-1.5 z-10 text-bridge-500 dark:text-bridge-400 hover:text-brand-primary cursor-grab active:cursor-grabbing transition-colors p-0.5 rounded"
                        {...attributes}
                        {...listeners}
                        title="Déplacer"
                        aria-label="Déplacer le bloc"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                )}

                <div className="p-3">
                    {editingInline && editFieldKey ? (
                        <InlineTextEditor
                            value={editValue}
                            onChange={handleInlineChange}
                            multiline={editFieldDef?.type === "textarea"}
                            placeholder={editFieldDef?.placeholder}
                            autoFocus
                            onBlur={() => setEditingInline(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    setEditingInline(false);
                                }
                            }}
                            aria-label={`Édition inline : ${editFieldDef?.label ?? editFieldKey}`}
                        />
                    ) : (
                        <Render {...block.props}>{renderedChildren}</Render>
                    )}
                </div>
            </div>
        </div>
    );
});

export function BlockTree({ blocks, parentId, parentType, depth, onInsertRequest, dropTarget, dropAllowed, coarsePointer, isMobile }: BlockTreeProps) {
    const items = blocks.map((b) => b.id);
    const isColumnsContainer = parentType === "columns";

    const content = (
        <>
            <DropPreviewLine atIndex={0} parentId={parentId} dropTarget={dropTarget} dropAllowed={dropAllowed} />
            {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                    <SortableBlock
                        block={block}
                        parentId={parentId}
                        parentType={parentType}
                        index={index}
                        depth={depth}
                        onInsertRequest={onInsertRequest}
                        dropTarget={dropTarget}
                        dropAllowed={dropAllowed}
                        coarsePointer={coarsePointer}
                        isMobile={isMobile}
                    />
                    <DropPreviewLine atIndex={index + 1} parentId={parentId} dropTarget={dropTarget} dropAllowed={dropAllowed} />
                </React.Fragment>
            ))}
            {parentId !== null && !isColumnsContainer && (
                <ContainerTail
                    parentId={parentId}
                    parentType={parentType ?? ""}
                    count={blocks.length}
                    onInsertRequest={onInsertRequest}
                />
            )}
        </>
    );

    return (
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {isColumnsContainer
                ? <div className="grid grid-cols-1 md:grid-cols-12 gap-3">{content}</div>
                : content}
        </SortableContext>
    );
}
