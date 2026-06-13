"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockNode } from "@/components/builder/BlockNode";
import { useBuilderStore } from "@/lib/store/builderStore";

interface EditorTreeProps {
    onInsertAtRoot: () => void;
}

export function EditorTree({ onInsertAtRoot }: EditorTreeProps) {
    const blocks = useBuilderStore((s) => s.blocks);

    return (
        <div className="flex flex-col gap-2 p-3 overflow-y-auto h-full">
            {blocks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 dark:text-slate-400">
                    <p className="text-sm">Aucun bloc. Commencez par en ajouter un.</p>
                    <Button size="sm" variant="outline" onClick={onInsertAtRoot} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Ajouter un bloc
                    </Button>
                </div>
            )}
            {blocks.map((block, i) => (
                <BlockNode
                    key={block.id}
                    block={block}
                    depth={0}
                    indexInParent={i}
                    parentId={null}
                />
            ))}
            {blocks.length > 0 && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 w-full gap-1.5 text-slate-500 hover:text-blue-600 text-xs h-8"
                    onClick={onInsertAtRoot}
                >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un bloc à la racine
                </Button>
            )}
        </div>
    );
}
