"use client";

import { Plus, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockNode } from "@/components/builder/BlockNode";
import { useBuilderStore } from "@/lib/store/builderStore";

interface EditorTreeProps {
    onInsertAtRoot: () => void;
}

export function EditorTree({ onInsertAtRoot }: EditorTreeProps) {
    const blocks = useBuilderStore((s) => s.blocks);
    const collapseAll = useBuilderStore((s) => s.collapseAll);
    const expandAll = useBuilderStore((s) => s.expandAll);

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* En-tête du panneau — toujours visible, ne défile pas */}
            <div className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-slate-200/70 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-1">
                    Structure
                </span>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title="Tout replier (Ctrl+–)"
                    onClick={collapseAll}
                >
                    <ChevronsDownUp className="w-3 h-3" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title="Tout déplier (Ctrl+=)"
                    onClick={expandAll}
                >
                    <ChevronsUpDown className="w-3 h-3" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Ajouter un bloc (Ctrl+I)"
                    onClick={onInsertAtRoot}
                >
                    <Plus className="w-3.5 h-3.5" />
                </Button>
            </div>

            {/* Zone scrollable — display block (pas flex), les BlockNode s'empilent naturellement */}
            {blocks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-slate-500 dark:text-slate-400">
                    <p className="text-sm text-center leading-relaxed">
                        Aucun bloc.<br />Commencez par en ajouter un.
                    </p>
                    <Button size="sm" variant="outline" onClick={onInsertAtRoot} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Ajouter un bloc
                    </Button>
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                    {blocks.map((block, i) => (
                        <BlockNode
                            key={block.id}
                            block={block}
                            depth={0}
                            indexInParent={i}
                            parentId={null}
                        />
                    ))}
                    <div className="pt-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-full gap-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs h-8 cursor-pointer"
                            onClick={onInsertAtRoot}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Ajouter un bloc à la racine
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
