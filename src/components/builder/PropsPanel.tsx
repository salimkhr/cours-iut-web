"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DynamicPropsEditor } from "@/components/builder/DynamicPropsEditor";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import type { BlockDefinition } from "@/lib/blockRegistry";
import type { Block } from "@/types/CourseContent";

interface BlockFormProps {
    block: Block;
    def: BlockDefinition;
    onApply: (props: Record<string, unknown>, colSpan: "full" | "half") => void;
    onDelete: () => void;
    onMove: (direction: "up" | "down") => void;
}

function BlockForm({ block, def, onApply, onDelete, onMove }: BlockFormProps) {
    const [draftProps, setDraftProps] = useState<Record<string, unknown>>(block.props);
    const [draftColSpan, setDraftColSpan] = useState<"full" | "half">(block.colSpan ?? "full");

    return (
        <>
            <DynamicPropsEditor
                fields={def.fields}
                props={draftProps}
                onChange={setDraftProps}
            />

            <Separator className="my-4" />

            <div className="flex flex-col gap-1">
                <Label>Largeur</Label>
                <Select
                    value={draftColSpan}
                    onValueChange={(v) => setDraftColSpan(v as "full" | "half")}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full">&#9632; Pleine largeur</SelectItem>
                        <SelectItem value="half">&#9703; Moitié</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onMove("up")} title="Monter">
                    ↑
                </Button>
                <Button variant="outline" size="sm" onClick={() => onMove("down")} title="Descendre">
                    ↓
                </Button>
            </div>

            <div className="mt-4 flex gap-2">
                <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete}>
                    Suppr.
                </Button>
                <Button size="sm" className="flex-1" onClick={() => onApply(draftProps, draftColSpan)}>
                    Appliquer
                </Button>
            </div>
        </>
    );
}

interface PropsPanelProps {
    isFixed: boolean;
}

export function PropsPanel({ isFixed }: PropsPanelProps) {
    const { blocks, selectedId, selectBlock, updateBlock, deleteBlock, moveBlock } =
        useBuilderStore();

    const block = blocks.find((b) => b.id === selectedId) as Block | undefined;
    const def = block ? getBlockDefinition(block.type) : undefined;

    function handleApply(props: Record<string, unknown>, colSpan: "full" | "half") {
        if (!block) return;
        updateBlock(block.id, props, colSpan);
    }

    function handleDelete() {
        if (!block) return;
        deleteBlock(block.id);
        selectBlock(null);
    }

    const content = (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                        {def?.label ?? block?.type ?? "—"}
                    </p>
                    {block && (
                        <Badge variant="outline" className="text-xs">
                            {block.type}
                        </Badge>
                    )}
                </div>
            </div>

            <Separator />

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {block && def ? (
                    <BlockForm
                        key={block.id}
                        block={block}
                        def={def}
                        onApply={handleApply}
                        onDelete={handleDelete}
                        onMove={(dir) => moveBlock(block.id, dir)}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Cliquez sur un bloc pour l&apos;éditer.
                    </p>
                )}
            </div>
        </div>
    );

    if (isFixed) {

        return (
            <div className="w-64 border-l bg-card flex-shrink-0 h-full overflow-hidden">
                {content}
            </div>
        );
    }

    return (
        <Sheet open={!!selectedId} onOpenChange={(open) => !open && selectBlock(null)}>
            <SheetContent side="right" className="w-72 p-0">
                {content}
            </SheetContent>
        </Sheet>
    );
}
