"use client";

import React, { useCallback, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "@/lib/store/builderStore";
import { createBlockInstance, getAllBlockDefinitions } from "@/lib/blockRegistry";
import { canDrop } from "@/lib/blockSchemas";
import { BlockPalette } from "@/components/builder/BlockPalette";
import { BlockTree, type InsertContext } from "@/components/builder/BlockTree";
import type { BlockDefinition } from "@/lib/blockRegistry";

interface BuilderCanvasProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    dropTarget: { parentId: string | null; parentType: string | null; index: number } | null;
    dropAllowed: boolean;
}

export function BuilderCanvas({ moduleSlug, sectionSlug, contentType, dropTarget, dropAllowed }: BuilderCanvasProps) {
    void sectionSlug; void contentType;
    const { blocks, selectBlock, insertBlock } = useBuilderStore();
    const [paletteCtx, setPaletteCtx] = useState<InsertContext | null>(null);

    const { setNodeRef: setCanvasRef } = useDroppable({
        id: "canvas",
        data: { dropZone: true, parentId: null, parentType: null, index: blocks.length },
    });

    const handleInsertRequest = useCallback((ctx: InsertContext) => {
        setPaletteCtx(ctx);
    }, []);

    const handlePaletteSelect = useCallback(
        (def: BlockDefinition) => {
            if (!paletteCtx) return;
            const newBlock = createBlockInstance(def);
            insertBlock(newBlock, paletteCtx.parentId, paletteCtx.index);
            selectBlock(newBlock.id);
        },
        [insertBlock, selectBlock, paletteCtx]
    );

    const allowedTypes = paletteCtx
        ? getAllBlockDefinitions()
            .map((d) => d.type)
            .filter((t) => canDrop(t, paletteCtx.parentType))
        : undefined;

    return (
        <div
            ref={setCanvasRef}
            className="flex-1 overflow-y-auto p-4 min-h-0 bg-bridge-100/20 dark:bg-bridge-900/40"
            onClick={() => selectBlock(null)}
        >
            {blocks.length === 0 && (
                <div
                    className="border-2 border-dashed border-bridge-400/40 dark:border-bridge-500/30 rounded-xl p-12 text-center text-bridge-500 dark:text-bridge-400 cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary hover:text-brand-primary transition-colors duration-200"
                    onClick={() => setPaletteCtx({ parentId: null, parentType: null, index: 0 })}
                >
                    <div className="text-sm font-medium">Aucun bloc pour l&apos;instant</div>
                    <div className="text-xs mt-1 opacity-70">Cliquez pour ajouter le premier bloc</div>
                </div>
            )}

            <BlockTree
                blocks={blocks}
                parentId={null}
                parentType={null}
                depth={1}
                onInsertRequest={handleInsertRequest}
                dropTarget={dropTarget}
                dropAllowed={dropAllowed}
            />

            {blocks.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
                    <button
                        className="bg-brand-primary text-brand-light rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-brand-accent-dark transition-colors cursor-pointer"
                        onClick={() => setPaletteCtx({ parentId: null, parentType: null, index: blocks.length })}
                        title="Ajouter un bloc à la fin"
                        aria-label="Ajouter un bloc à la fin"
                    >
                        +
                    </button>
                    <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
                </div>
            )}

            <BlockPalette
                open={paletteCtx !== null}
                onClose={() => setPaletteCtx(null)}
                onSelect={handlePaletteSelect}
                moduleSlug={moduleSlug}
                allowedTypes={allowedTypes}
            />
        </div>
    );
}
