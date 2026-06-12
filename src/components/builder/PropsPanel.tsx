"use client";

import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { findBlock } from "@/lib/blockTreeUtils";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import { DynamicPropsEditor } from "@/components/builder/DynamicPropsEditor";
import { ColumnsEditor } from "@/components/builder/ColumnsEditor";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { useMediaQuery } from "@/hook/useMediaQuery";
import { cn } from "@/lib/utils";
import AdminSheetHeader from "@/components/admin/AdminSheetHeader";
import type { FieldDef } from "@/lib/blockRegistry";

interface PropsPanelProps {
    moduleSlug: string;
    onSave: () => Promise<void>;
    saving: boolean;
}

const TEXT_FIELD_TYPES: Array<FieldDef["type"]> = ["text", "textarea"];

export function PropsPanel({ moduleSlug, onSave, saving }: PropsPanelProps) {
    const { blocks, selectedId, selectBlock, updateBlock, deleteBlock } = useBuilderStore();
    const isMobile = useMediaQuery("(max-width: 767px)");

    const block = selectedId ? findBlock(blocks, selectedId) : undefined;
    const def = block ? getBlockDefinition(block.type) : undefined;

    function handleDelete() {
        if (!block) return;
        deleteBlock(block.id);
        selectBlock(null);
    }

    async function handleMobileSave() {
        await onSave();
        selectBlock(null);
    }

    const mobileTextFields = def?.fields.filter((f) => TEXT_FIELD_TYPES.includes(f.type)) ?? [];

    // ── Mobile : Sheet bottom drawer (comportement inchangé) ─────────────────────
    if (isMobile) {
        return (
            <Sheet open={!!selectedId && !def?.noPropsPanel} onOpenChange={(open) => !open && selectBlock(null)}>
                <SheetContent
                    side="bottom"
                    className={cn(
                        "p-0 gap-0 flex flex-col overflow-hidden",
                        "h-[85dvh] rounded-t-2xl sm:max-w-none",
                        "bg-[#f7ebd9] dark:bg-[#13110d]",
                        "border-bridge-500/45",
                        "[&>button]:text-white/80 [&>button:hover]:text-white",
                        `header-${moduleSlug}`,
                    )}
                >
                    <AdminSheetHeader
                        icon={SlidersHorizontal}
                        eyebrow={block?.type ?? "Propriétés"}
                        title={def?.label ?? (block?.type ?? "Bloc")}
                        srDescription="Éditer les propriétés du bloc sélectionné"
                        className="bg-module"
                    />
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                        {block && def && mobileTextFields.length > 0 ? (
                            <DynamicPropsEditor
                                key={block.id}
                                fields={def.fields}
                                props={block.props}
                                onChange={(newProps) => updateBlock(block.id, newProps)}
                                filterTypes={TEXT_FIELD_TYPES}
                            />
                        ) : (
                            <p className="text-sm text-bridge-500 dark:text-bridge-400">
                                Ce bloc n&apos;a pas de texte modifiable.
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                        <Button type="button" variant="ghost" className="text-brand-dark dark:text-bridge-200" onClick={() => selectBlock(null)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={() => void handleMobileSave()}
                            disabled={saving}
                            className="bg-module text-white font-semibold hover:opacity-90 transition-opacity"
                        >
                            {saving ? "Enregistrement…" : "Enregistrer"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // ── Desktop : sidebar inline (pas de Sheet, pas d'overlay, pas de portal) ────
    return (
        <div className={cn(
            "w-64 h-full flex flex-col flex-shrink-0 border-l border-bridge-500/20 dark:border-bridge-500/35 overflow-hidden",
            "bg-[#f7ebd9] dark:bg-[#13110d]",
            `header-${moduleSlug}`,
        )}>
            {block && def && !def.noPropsPanel ? (
                <>
                    {/* Header inline (pas de SheetTitle ni SheetDescription) */}
                    <div className={cn(
                        "relative flex items-center gap-3 px-4 py-4 overflow-hidden shrink-0 bg-module",
                    )}>
                        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 dark:bg-brand-dark/15 shrink-0">
                            <SlidersHorizontal className="w-4 h-4 text-white dark:text-brand-dark" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/60 dark:text-brand-dark/60 truncate">
                                {block.type}
                            </p>
                            <h2 className="text-white dark:text-brand-dark font-bold text-base leading-tight truncate">
                                {def.label ?? block.type}
                            </h2>
                        </div>
                    </div>

                    {/* Corps */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
                        <DynamicPropsEditor
                            key={block.id}
                            fields={def.fields}
                            props={block.props}
                            onChange={(newProps) => updateBlock(block.id, newProps)}
                        />
                        {block.type === "columns" && (
                            <>
                                <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-4" />
                                <ColumnsEditor block={block} />
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-4 py-3 flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-sm text-brand-dark dark:text-bridge-200"
                            onClick={() => selectBlock(null)}
                        >
                            Terminé
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 bg-destructive/5 border-destructive/25 text-destructive hover:bg-destructive/12 hover:border-destructive/40 transition-colors"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Supprimer
                        </Button>
                    </div>
                </>
            ) : (
                /* État vide */
                <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 text-center">
                    <div className="w-9 h-9 rounded-xl bg-bridge-200/60 dark:bg-bridge-700/40 flex items-center justify-center">
                        <SlidersHorizontal className="w-4 h-4 text-bridge-400 dark:text-bridge-500" />
                    </div>
                    <p className="text-xs text-bridge-400 dark:text-bridge-500 leading-relaxed max-w-[140px]">
                        Sélectionnez un bloc pour éditer ses propriétés
                    </p>
                </div>
            )}
        </div>
    );
}
