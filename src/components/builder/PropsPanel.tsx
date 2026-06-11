"use client";

import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { findBlock } from "@/lib/blockTreeUtils";
import { SlidersHorizontal, Plus, Trash2, MousePointerClick } from "lucide-react";
import { DynamicPropsEditor } from "@/components/builder/DynamicPropsEditor";
import { BlockPaletteGrid } from "@/components/builder/BlockPaletteGrid";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import type { Block } from "@/types/CourseContent";
import type { BlockDefinition } from "@/lib/blockRegistry";
import { v4 as uuidv4 } from "uuid";

interface PropsPanelProps {
    isFixed: boolean;
    moduleSlug: string;
}

export function PropsPanel({ isFixed, moduleSlug }: PropsPanelProps) {
    const { blocks, selectedId, selectBlock, insertBlock, updateBlock, deleteBlock } =
        useBuilderStore();

    const block = selectedId ? findBlock(blocks, selectedId) : undefined;
    const def = block ? getBlockDefinition(block.type) : undefined;

    function handleDelete() {
        if (!block) return;
        deleteBlock(block.id);
        selectBlock(null);
    }

    const content = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-module px-4 py-3 flex items-center gap-3 border-b border-white/15 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    {block
                        ? <SlidersHorizontal className="w-4 h-4 text-white" />
                        : <Plus className="w-4 h-4 text-white" />
                    }
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <p style={{ color: "rgba(255,255,255,0.92)" }} className="text-[11px] uppercase tracking-[0.2em] font-semibold leading-none truncate">
                        {def?.label ?? (block ? block.type : "Ajouter un bloc")}
                    </p>
                    {block && (
                        <span className="text-[10px] font-mono text-white/55 leading-none">
                            {block.type}
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {block && def ? (
                    <>
                        <DynamicPropsEditor
                            key={block.id}
                            fields={def.fields}
                            props={block.props}
                            onChange={(newProps) =>
                                updateBlock(block.id, newProps)
                            }
                        />
                    </>
                ) : (
                    <div className="flex flex-col -mx-4 -my-4 h-full">
                        {/* Hint sélection */}
                        <div className="flex flex-col items-center gap-2 pt-6 pb-4 px-4">
                            <div className="w-9 h-9 rounded-xl bg-bridge-200/60 dark:bg-bridge-700/40 flex items-center justify-center">
                                <MousePointerClick className="w-4 h-4 text-bridge-400 dark:text-bridge-500" />
                            </div>
                            <p className="text-xs text-bridge-400 dark:text-bridge-500 text-center leading-relaxed">
                                Sélectionnez un bloc<br />pour l&apos;éditer.
                            </p>
                        </div>

                        {/* Séparateur "ou" */}
                        <div className="flex items-center gap-2.5 px-4 py-1">
                            <div className="flex-1 h-px bg-bridge-400/20 dark:bg-bridge-500/20" />
                            <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-bridge-400 dark:text-bridge-500">ou</span>
                            <div className="flex-1 h-px bg-bridge-400/20 dark:bg-bridge-500/20" />
                        </div>

                        {/* Palette d'ajout */}
                        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
                            <BlockPaletteGrid
                                compact
                                draggable
                                onSelect={(def: BlockDefinition) => {
                                    const newBlock: Block = {
                                        id: uuidv4(),
                                        type: def.type,
                                        props: { ...def.defaultProps },
                                    };
                                    insertBlock(newBlock, null);
                                    selectBlock(newBlock.id);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer actions */}
            {block && (
                <div className="shrink-0 border-t border-bridge-400/20 dark:border-bridge-500/25 px-3 py-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs gap-1.5 bg-destructive/5 border-destructive/25 text-destructive hover:bg-destructive/12 hover:border-destructive/40 transition-colors"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-3 h-3" /> Supprimer le bloc
                    </Button>
                </div>
            )}
        </div>
    );

    if (isFixed) {
        return (
            <div className="w-64 border-l border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/80 dark:bg-bridge-900/80 flex-shrink-0 h-full overflow-hidden">
                {content}
            </div>
        );
    }

    return (
        <Sheet open={!!selectedId} onOpenChange={(open) => !open && selectBlock(null)}>
            <SheetContent
                side="right"
                className={`w-72 p-0 bg-bridge-50 dark:bg-bridge-900 border-l border-bridge-500/20 dark:border-bridge-500/35 header-${moduleSlug}`}
            >
                {content}
            </SheetContent>
        </Sheet>
    );
}
