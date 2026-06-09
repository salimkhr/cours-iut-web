"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter un bloc</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="Rechercher un type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {filtered.map((def) => (
                        <Button
                            key={def.type}
                            variant="outline"
                            className="justify-start h-auto py-3 px-3 text-sm"
                            onClick={() => handleSelect(def)}
                        >
                            <span className="font-medium">{def.label}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                                ({def.type})
                            </span>
                        </Button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                            Aucun type correspondant.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
