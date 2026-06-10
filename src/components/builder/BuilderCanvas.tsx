"use client";

import React, { useCallback, useState } from "react";
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
import { getNamedComponent } from "@/lib/namedComponents";
import { BlockPalette } from "@/components/builder/BlockPalette";
import type { Block } from "@/types/CourseContent";
import type { BlockDefinition } from "@/lib/blockRegistry";
import { v4 as uuidv4 } from "uuid";

function groupByColSpan(blocks: Block[]): Block[][] {
    const groups: Block[][] = [];
    let i = 0;
    while (i < blocks.length) {
        const block = blocks[i];
        if (block.colSpan === "half" && blocks[i + 1]?.colSpan === "half") {
            groups.push([block, blocks[i + 1]]);
            i += 2;
        } else {
            groups.push([block]);
            i += 1;
        }
    }
    return groups;
}

function NamedBlockContent({ name }: { name: string }) {
    const Component = getNamedComponent(name);
    if (!Component) {
        return (
            <div className="text-bridge-500 dark:text-bridge-400 text-sm border border-dashed border-bridge-400/40 dark:border-bridge-500/30 rounded p-3">
                Composant introuvable : {name}
            </div>
        );
    }
    return React.createElement(Component);
}

function BlockContent({ block }: { block: Block }) {
    if (block.type === "named-component") {
        return <NamedBlockContent name={String(block.props?.name ?? "")} />;
    }
    const def = getBlockDefinition(block.type);
    if (!def) {
        return (
            <div className="text-bridge-500 dark:text-bridge-400 text-sm">
                Bloc inconnu : {block.type}
            </div>
        );
    }
    const Render = def.render;
    return <Render {...block.props} />;
}

function InsertPreview() {
    return (
        <div className="flex items-center gap-1 my-1.5 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
            <div className="flex-1 h-0.5 bg-brand-primary rounded-full" />
            <div className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
        </div>
    );
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

function SortableBlock({
    block,
    isSelected,
    onSelect,
    onInsertAfter,
}: {
    block: Block;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onInsertAfter: (afterId: string) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <InsertLine onClick={() => onInsertAfter(block.id)} />

            <div
                className={[
                    "relative group rounded-lg transition-all duration-150 cursor-pointer",
                    isSelected
                        ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-bridge-100 dark:ring-offset-bridge-900"
                        : "ring-1 ring-transparent hover:ring-bridge-400/40 dark:hover:ring-bridge-500/35",
                ].join(" ")}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
            >
                {/* Block type label */}
                {(hovered || isSelected) && (
                    <div className="absolute -top-2.5 left-2 z-10 bg-brand-primary text-brand-light text-[10px] px-1.5 py-0.5 rounded font-mono tracking-wide select-none">
                        {block.type}
                    </div>
                )}

                {/* Drag handle */}
                {(hovered || isSelected) && (
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
                    <BlockContent block={block} />
                </div>
            </div>
        </div>
    );
}

interface BuilderCanvasProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    insertPreviewAfter?: string | null;
}

export function BuilderCanvas({ moduleSlug, sectionSlug, contentType, insertPreviewAfter }: BuilderCanvasProps) {
    void sectionSlug; void contentType;
    const { blocks, selectedId, selectBlock, insertBlock } = useBuilderStore();
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [insertAfterIndex, setInsertAfterIndex] = useState<number | undefined>(undefined);

    const { setNodeRef: setCanvasRef } = useDroppable({ id: "canvas" });

    function openPaletteAfter(blockId: string) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        setInsertAfterIndex(idx + 1);
        setPaletteOpen(true);
    }

    function openPaletteAtEnd() {
        setInsertAfterIndex(undefined);
        setPaletteOpen(true);
    }

    const handlePaletteSelect = useCallback(
        (def: BlockDefinition) => {
            const newBlock: Block = {
                id: uuidv4(),
                type: def.type,
                props: { ...def.defaultProps },
                colSpan: "full",
            };
            insertBlock(newBlock, insertAfterIndex);
            selectBlock(newBlock.id);
        },
        [insertBlock, selectBlock, insertAfterIndex]
    );

    return (
        <div
            ref={setCanvasRef}
            className="flex-1 overflow-y-auto p-4 min-h-0 bg-bridge-100/20 dark:bg-bridge-900/40"
            onClick={() => selectBlock(null)}
        >
            <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
            >
                {blocks.length === 0 && (
                    <div
                        className="border-2 border-dashed border-bridge-400/40 dark:border-bridge-500/30 rounded-xl p-12 text-center text-bridge-500 dark:text-bridge-400 cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary hover:text-brand-primary transition-colors duration-200"
                        onClick={openPaletteAtEnd}
                    >
                        <div className="text-sm font-medium">Aucun bloc pour l&apos;instant</div>
                        <div className="text-xs mt-1 opacity-70">Cliquez pour ajouter le premier bloc</div>
                    </div>
                )}

                {groupByColSpan(blocks).map((group, gi) => {
                    const showPreview = group.some((b) => b.id === insertPreviewAfter);
                    return (
                        <React.Fragment key={group.length === 1 ? group[0].id : `group-${gi}`}>
                            {group.length === 1 ? (
                                <SortableBlock
                                    block={group[0]}
                                    isSelected={selectedId === group[0].id}
                                    onSelect={selectBlock}
                                    onInsertAfter={openPaletteAfter}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {group.map((block) => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            isSelected={selectedId === block.id}
                                            onSelect={selectBlock}
                                            onInsertAfter={openPaletteAfter}
                                        />
                                    ))}
                                </div>
                            )}
                            {showPreview && <InsertPreview />}
                        </React.Fragment>
                    );
                })}
            </SortableContext>

            {/* Preview en fin de liste (canvas vide ou zone sous les blocs) */}
            {insertPreviewAfter === "canvas" && <InsertPreview />}

            {/* Bouton d'ajout bas de liste */}
            {blocks.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
                    <button
                        className="bg-brand-primary text-brand-light rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-brand-accent-dark transition-colors cursor-pointer"
                        onClick={openPaletteAtEnd}
                        title="Ajouter un bloc à la fin"
                        aria-label="Ajouter un bloc à la fin"
                    >
                        +
                    </button>
                    <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
                </div>
            )}

            <BlockPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                onSelect={handlePaletteSelect}
                moduleSlug={moduleSlug}
            />
        </div>
    );
}
