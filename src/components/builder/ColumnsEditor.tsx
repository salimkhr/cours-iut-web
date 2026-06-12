"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBuilderStore } from "@/lib/store/builderStore";
import { COLUMN_PRESETS } from "@/lib/blockSchemas";
import { v4 as uuidv4 } from "uuid";
import type { Block } from "@/types/CourseContent";

interface ColumnsEditorProps {
    block: Block; // le bloc columns sélectionné
}

export function ColumnsEditor({ block }: ColumnsEditorProps) {
    const updateChildren = useBuilderStore((s) => s.updateChildren);
    const columns = block.children ?? [];

    function applyPreset(spans: number[]) {
        const next: Block[] = spans.map((span, i) => {
            const existing = columns[i];
            if (existing) {
                return { ...existing, props: { ...existing.props, span } };
            }
            return { id: uuidv4(), type: "column", props: { span }, children: [] };
        });
        // Colonnes en trop : fusionner leur contenu dans la dernière colonne
        // conservée plutôt que de le supprimer silencieusement.
        const dropped = columns.slice(spans.length);
        if (dropped.length > 0) {
            const last = next[next.length - 1];
            next[next.length - 1] = {
                ...last,
                children: [
                    ...(last.children ?? []),
                    ...dropped.flatMap((c) => c.children ?? []),
                ],
            };
        }
        updateChildren(block.id, next);
    }

    const current = columns.map((c) => Number(c.props.span)).join("/");

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-brand-dark dark:text-bridge-200">
                Disposition
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
                {COLUMN_PRESETS.map((preset) => {
                    const isActive = preset.spans.join("/") === current;
                    return (
                        <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset(preset.spans)}
                            className={[
                                "h-8 text-xs",
                                isActive
                                    ? "border-brand-primary/60 bg-brand-primary/10 text-brand-primary"
                                    : "border-bridge-500/45 text-brand-dark dark:text-bridge-300 bg-bridge-100/60 dark:bg-bridge-800/60 hover:border-brand-primary/40 hover:text-brand-primary",
                            ].join(" ")}
                        >
                            {preset.label}
                        </Button>
                    );
                })}
            </div>
            <p className="text-xs text-bridge-500 dark:text-bridge-400 mt-1">
                Réduire le nombre de colonnes fusionne leur contenu dans la dernière colonne.
            </p>
        </div>
    );
}
