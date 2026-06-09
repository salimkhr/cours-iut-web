"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAllBlockDefinitions } from "@/lib/blockRegistry";
import type { BlockDefinition } from "@/lib/blockRegistry";

interface BlockPaletteProps {
    open: boolean;
    onClose: () => void;
    onSelect: (def: BlockDefinition) => void;
}

export function BlockPalette({ open, onClose, onSelect }: BlockPaletteProps) {
    const [search, setSearch] = useState("");
    const definitions = getAllBlockDefinitions();

    const filtered = definitions.filter(
        (d) =>
            d.label.toLowerCase().includes(search.toLowerCase()) ||
            d.type.toLowerCase().includes(search.toLowerCase())
    );

    function handleSelect(def: BlockDefinition) {
        onSelect(def);
        onClose();
        setSearch("");
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm bg-bridge-50 dark:bg-bridge-900 border border-bridge-400/40 dark:border-bridge-500/45 shadow-[0_12px_40px_-12px_rgba(147,97,58,0.4)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
                <DialogHeader>
                    <DialogTitle className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary dark:text-brand-primary">
                        Ajouter un bloc
                    </DialogTitle>
                </DialogHeader>

                <Input
                    placeholder="Rechercher un type de bloc…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="h-8 text-sm border-bridge-400/40 dark:border-bridge-500/40 bg-bridge-100/50 dark:bg-bridge-800/50"
                />

                <div className="grid grid-cols-2 gap-2 mt-1">
                    {filtered.map((def) => (
                        <button
                            key={def.type}
                            className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left border border-bridge-400/35 dark:border-bridge-500/35 bg-bridge-100/60 dark:bg-bridge-800/60 hover:bg-bridge-200/70 dark:hover:bg-bridge-700/70 hover:border-brand-primary/40 transition-colors duration-150 cursor-pointer"
                            onClick={() => handleSelect(def)}
                        >
                            <span className="text-sm font-medium text-bridge-800 dark:text-bridge-100">
                                {def.label}
                            </span>
                            <span className="text-[10px] font-mono text-bridge-500 dark:text-bridge-400">
                                {def.type}
                            </span>
                        </button>
                    ))}

                    {filtered.length === 0 && (
                        <p className="col-span-2 text-sm text-bridge-500 dark:text-bridge-400 text-center py-6">
                            Aucun type correspondant.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
