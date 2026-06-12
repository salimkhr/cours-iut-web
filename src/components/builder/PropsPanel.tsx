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

    return (
        <Sheet open={!!selectedId} onOpenChange={(open) => !open && selectBlock(null)}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={cn(
                    "p-0 gap-0 flex flex-col overflow-hidden",
                    isMobile ? "h-[85dvh] rounded-t-2xl sm:max-w-none" : "sm:max-w-[480px]",
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

                {/* Corps */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    {block && def ? (
                        isMobile ? (
                            mobileTextFields.length > 0 ? (
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
                            )
                        ) : (
                            <>
                                <DynamicPropsEditor
                                    key={block.id}
                                    fields={def.fields}
                                    props={block.props}
                                    onChange={(newProps) => updateBlock(block.id, newProps)}
                                />
                                {block.type === "columns" && (
                                    <>
                                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6" />
                                        <ColumnsEditor block={block} />
                                    </>
                                )}
                            </>
                        )
                    ) : null}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                    {isMobile ? (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-brand-dark dark:text-bridge-200"
                                onClick={() => selectBlock(null)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={() => void handleMobileSave()}
                                disabled={saving}
                                className="bg-module text-white font-semibold hover:opacity-90 transition-opacity"
                            >
                                {saving ? "Enregistrement…" : "Enregistrer"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-brand-dark dark:text-bridge-200"
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
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
