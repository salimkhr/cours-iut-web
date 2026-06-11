"use client";

import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { BlockPaletteGrid } from "@/components/builder/BlockPaletteGrid";
import type { BlockDefinition } from "@/lib/blockRegistry";

interface BlockPaletteProps {
    open: boolean;
    onClose: () => void;
    onSelect: (def: BlockDefinition) => void;
    moduleSlug: string;
    allowedTypes?: string[];
}

export function BlockPalette({ open, onClose, onSelect, moduleSlug, allowedTypes }: BlockPaletteProps) {
    function handleSelect(def: BlockDefinition) {
        onSelect(def);
        onClose();
    }

    function handleOpenChange(isOpen: boolean) {
        if (!isOpen) onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={`max-w-lg p-0 gap-0 bg-bridge-50 dark:bg-bridge-900 border border-bridge-400/40 dark:border-bridge-500/45 shadow-[0_20px_60px_-12px_rgba(147,97,58,0.4)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.75)] overflow-hidden header-${moduleSlug} [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:opacity-70 [&>[data-slot=dialog-close]]:hover:opacity-100`}>

                {/* Header */}
                <DialogHeader className="bg-module px-5 py-4 border-b border-white/15">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 pr-8 flex-1">
                            <DialogTitle style={{ color: "rgba(255,255,255,0.92)" }} className="text-[11px] uppercase tracking-[0.2em] font-semibold leading-none">
                                Ajouter un bloc
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                {/* Grille */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <BlockPaletteGrid onSelect={handleSelect} autoFocusSearch allowedTypes={allowedTypes} />
                </div>

            </DialogContent>
        </Dialog>
    );
}
