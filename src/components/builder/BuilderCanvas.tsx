"use client";

import React, { useCallback, useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { getNamedComponent } from "@/lib/namedComponents";
import { BlockPalette } from "@/components/builder/BlockPalette";
import type { Block } from "@/types/CourseContent";
import type { BlockDefinition } from "@/lib/blockRegistry";
import { v4 as uuidv4 } from "uuid";

function NamedBlockContent({ name }: { name: string }) {
    const Component = getNamedComponent(name);
    if (!Component) {
        return <div className="text-muted-foreground text-sm border border-dashed rounded p-3">{name}</div>;
    }
    return React.createElement(Component);
}

function BlockContent({ block }: { block: Block }) {
    if (block.type === "named-component") {
        return <NamedBlockContent name={String(block.props?.name ?? "")} />;
    }
    const def = getBlockDefinition(block.type);
    if (!def) {
        return <div className="text-muted-foreground text-sm">Bloc inconnu : {block.type}</div>;
    }
    const Render = def.render;
    return <Render {...block.props} />;
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
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="flex items-center gap-2 my-1 opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex-1 h-px bg-border" />
                <button
                    className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center hover:scale-110 transition-transform"
                    onClick={() => onInsertAfter(block.id)}
                    title="Insérer un bloc ici"
                >
                    +
                </button>
                <div className="flex-1 h-px bg-border" />
            </div>

            <div
                className={[
                    "relative group rounded-lg transition-all cursor-pointer",
                    isSelected
                        ? "ring-2 ring-primary ring-offset-1"
                        : "ring-1 ring-transparent hover:ring-border",
                ].join(" ")}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => onSelect(block.id)}
            >
                {(hovered || isSelected) && (
                    <div className="absolute -top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {block.type}
                    </div>
                )}

                {(hovered || isSelected) && (
                    <button
                        className="absolute right-2 top-2 z-10 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing text-sm"
                        {...attributes}
                        {...listeners}
                        title="Déplacer"
                    >
                        &#8943;
                    </button>
                )}

                <div className="p-2"><BlockContent block={block} /></div>
            </div>
        </div>
    );
}

interface BuilderCanvasProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export function BuilderCanvas({ moduleSlug, sectionSlug, contentType }: BuilderCanvasProps) {
    void moduleSlug; void sectionSlug; void contentType;
    const { blocks, selectedId, selectBlock, insertBlock, reorderBlocks } = useBuilderStore();
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [insertAfterIndex, setInsertAfterIndex] = useState<number | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIds = blocks.map((b) => b.id);
        const oldIndex = oldIds.indexOf(String(active.id));
        const newIndex = oldIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;
        const newIds = [...oldIds];
        newIds.splice(oldIndex, 1);
        newIds.splice(newIndex, 0, String(active.id));
        reorderBlocks(newIds);
    }

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
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {blocks.length === 0 && (
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground cursor-pointer hover:border-primary transition-colors"
                            onClick={openPaletteAtEnd}
                        >
                            Cliquez pour ajouter le premier bloc
                        </div>
                    )}

                    {blocks.map((block) => (
                        <SortableBlock
                            key={block.id}
                            block={block}
                            isSelected={selectedId === block.id}
                            onSelect={selectBlock}
                            onInsertAfter={openPaletteAfter}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {blocks.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-px bg-border" />
                    <button
                        className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center hover:scale-110 transition-transform"
                        onClick={openPaletteAtEnd}
                        title="Ajouter un bloc à la fin"
                    >
                        +
                    </button>
                    <div className="flex-1 h-px bg-border" />
                </div>
            )}

            <BlockPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                onSelect={handlePaletteSelect}
            />
        </div>
    );
}
