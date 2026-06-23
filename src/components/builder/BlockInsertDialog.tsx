"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAllBlockDefinitions, createBlockInstance } from "@/lib/blockRegistry";
import type { BlockCategory } from "@/lib/blockRegistry";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { canDrop } from "@/lib/blockSchemas";
import { Blocks } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER_DEFAULT: BlockCategory[] = [
    "Contenu",
    "Structure",
    "Listes",
    "Code",
    "Médias",
    "Composants",
];

const CATEGORY_ORDER_SLIDE: BlockCategory[] = ["Slides"];

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
            {children}
        </p>
    );
}

interface BlockInsertDialogProps {
    open: boolean;
    onClose: () => void;
    parentId: string | null;
    index?: number;
}

export function BlockInsertDialog({ open, onClose, parentId, index }: BlockInsertDialogProps) {
    const insertBlock = useBuilderStore((s) => s.insertBlock);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const blocks = useBuilderStore((s) => s.blocks);
    const moduleSlug = useBuilderStore((s) => s.moduleSlug);

    const contentType = useBuilderStore((s) => s.contentType);
    const allDefs = getAllBlockDefinitions();

    const parentBlock = parentId ? findBlock(blocks, parentId) : null;
    const parentType = parentBlock?.type ?? null;

    const defs = allDefs.filter((def) => canDrop(def.type, parentType));

    const categoryOrder = contentType === "slide" ? CATEGORY_ORDER_SLIDE : CATEGORY_ORDER_DEFAULT;
    const grouped = categoryOrder.reduce<{ cat: BlockCategory; items: typeof defs }[]>(
        (acc, cat) => {
            const items = defs.filter((d) => d.category === cat);
            if (items.length > 0) acc.push({ cat, items });
            return acc;
        },
        []
    );

    function handleInsert(type: string) {
        const def = allDefs.find((d) => d.type === type);
        if (!def) return;
        const block = createBlockInstance(def);
        insertBlock(block, parentId, index);
        selectBlock(block.id);
        onClose();
    }

    const contextLabel = parentBlock
        ? `dans « ${String(parentBlock.props.title ?? parentBlock.props.content ?? parentBlock.type).slice(0, 28)} »`
        : "à la racine du document";

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className={cn(
                "max-w-sm sm:max-w-md p-0 overflow-hidden",
                "border border-slate-300/60 dark:border-slate-600/40",
                "shadow-[0_22px_44px_-14px_rgba(0,0,0,0.18)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.65)]",
                "[&>button]:text-white/70 [&>button:hover]:text-white [&>button]:ring-offset-transparent [&>button:focus-visible]:ring-white/50",
            )}>
                {/* Header */}
                <div className={cn(
                    "relative flex items-center gap-3 px-5 py-3.5 pr-14 overflow-hidden",
                    moduleSlug ? `bg-${moduleSlug}` : "bg-blue-600 dark:bg-blue-700"
                )}>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 shrink-0">
                        <Blocks className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <DialogHeader className="p-0 space-y-0 text-left">
                        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/60">
                            {contextLabel}
                        </p>
                        <DialogTitle className="text-white font-bold text-base leading-tight">
                            Insérer un bloc
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-4 py-3 flex flex-col gap-3 max-h-[65vh] overflow-y-auto bg-white dark:bg-slate-900">
                    {grouped.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-5 text-slate-400 dark:text-slate-500">
                            <Blocks className="w-6 h-6 opacity-40" />
                            <p className="text-xs text-center">Aucun bloc disponible dans ce contexte.</p>
                        </div>
                    ) : (
                        grouped.map(({ cat, items }, gi) => (
                            <div key={cat}>
                                {gi > 0 && (
                                    <div className="h-px bg-slate-100 dark:bg-slate-700/60 -mx-4 mb-3" />
                                )}
                                <Eyebrow>{cat}</Eyebrow>
                                <div className="grid grid-cols-3 gap-1">
                                    {items.map((def) => {
                                        const Icon = def.icon ?? Blocks;
                                        return (
                                            <Button
                                                key={def.type}
                                                variant="outline"
                                                size="sm"
                                                className="justify-start gap-1.5 text-xs h-8 px-2.5 font-normal cursor-pointer border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-150 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:border-blue-700 dark:hover:text-blue-300"
                                                onClick={() => handleInsert(def.type)}
                                            >
                                                <Icon className="w-3 h-3 shrink-0 text-slate-400 dark:text-slate-500" />
                                                <span className="truncate">{def.label}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
