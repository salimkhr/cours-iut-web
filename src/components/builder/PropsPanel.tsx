"use client";

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
import type { Block } from "@/types/CourseContent";

interface PropsPanelProps {
    isFixed: boolean;
}

export function PropsPanel({ isFixed }: PropsPanelProps) {
    const { blocks, selectedId, selectBlock, updateBlock, deleteBlock, moveBlock } =
        useBuilderStore();

    const block = blocks.find((b) => b.id === selectedId) as Block | undefined;
    const def = block ? getBlockDefinition(block.type) : undefined;

    function handleDelete() {
        if (!block) return;
        deleteBlock(block.id);
        selectBlock(null);
    }

    const content = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-3 pb-2.5 flex items-center justify-between gap-2 border-b border-bridge-500/20 dark:border-bridge-500/35">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary dark:text-brand-primary">
                    {def?.label ?? (block ? block.type : "Propriétés")}
                </p>
                {block && (
                    <Badge
                        variant="outline"
                        className="text-[10px] font-mono h-5 px-1.5 border-bridge-400/40 dark:border-bridge-500/40 text-bridge-600 dark:text-bridge-400"
                    >
                        {block.type}
                    </Badge>
                )}
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
                                updateBlock(block.id, newProps, block.colSpan ?? "full")
                            }
                        />

                        <Separator className="my-4 bg-bridge-400/20 dark:bg-bridge-500/25" />

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[11px] uppercase tracking-[0.15em] font-semibold text-bridge-600 dark:text-bridge-400">
                                Largeur
                            </Label>
                            <Select
                                value={block.colSpan ?? "full"}
                                onValueChange={(v) =>
                                    updateBlock(block.id, block.props, v as "full" | "half")
                                }
                            >
                                <SelectTrigger className="h-8 text-sm border-bridge-400/40 dark:border-bridge-500/40 bg-bridge-50 dark:bg-bridge-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-bridge-50 dark:bg-bridge-900 border-bridge-400/40 dark:border-bridge-500/40">
                                    <SelectItem value="full">Pleine largeur</SelectItem>
                                    <SelectItem value="half">Moitié</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator className="my-4 bg-bridge-400/20 dark:bg-bridge-500/25" />

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs border-bridge-400/40 dark:border-bridge-500/40 text-bridge-700 dark:text-bridge-300 hover:bg-bridge-100 dark:hover:bg-bridge-800"
                                onClick={() => moveBlock(block.id, "up")}
                                title="Monter"
                            >
                                ↑ Monter
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs border-bridge-400/40 dark:border-bridge-500/40 text-bridge-700 dark:text-bridge-300 hover:bg-bridge-100 dark:hover:bg-bridge-800"
                                onClick={() => moveBlock(block.id, "down")}
                                title="Descendre"
                            >
                                ↓ Descendre
                            </Button>
                        </div>

                        <div className="mt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                                onClick={handleDelete}
                            >
                                Supprimer le bloc
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-bridge-500 dark:text-bridge-400 text-center mt-8 leading-relaxed">
                        Sélectionnez un bloc<br />pour l&apos;éditer.
                    </p>
                )}
            </div>
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
                className="w-72 p-0 bg-bridge-50 dark:bg-bridge-900 border-l border-bridge-500/20 dark:border-bridge-500/35"
            >
                {content}
            </SheetContent>
        </Sheet>
    );
}
