"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAllBlockDefinitions, createBlockInstance } from "@/lib/blockRegistry";
import { useBuilderStore } from "@/lib/store/builderStore";

interface BlockInsertDialogProps {
    open: boolean;
    onClose: () => void;
    parentId: string | null;
    index?: number;
}

export function BlockInsertDialog({ open, onClose, parentId, index }: BlockInsertDialogProps) {
    const insertBlock = useBuilderStore((s) => s.insertBlock);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const defs = getAllBlockDefinitions();

    function handleInsert(type: string) {
        const def = defs.find((d) => d.type === type);
        if (!def) return;
        const block = createBlockInstance(def);
        insertBlock(block, parentId, index);
        selectBlock(block.id);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Insérer un bloc</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 pt-2 max-h-72 overflow-y-auto">
                    {defs.map((def) => (
                        <Button
                            key={def.type}
                            variant="outline"
                            size="sm"
                            className="justify-start text-xs h-8 font-normal"
                            onClick={() => handleInsert(def.type)}
                        >
                            {def.label}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
