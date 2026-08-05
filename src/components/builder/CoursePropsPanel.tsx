"use client";

import { PanelRightClose, SlidersHorizontal } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { BlockForm } from "@/components/builder/BlockForm";

interface CoursePropsPanelProps {
    onClose: () => void;
}

/**
 * Panneau de propriétés du bloc sélectionné. Le canvas de cours n'exposait que
 * l'édition inline : tous les blocs sans `inlineEditField` (encadré, tableau,
 * diagramme, colonnes, dépliable, lien de section, téléchargement) étaient
 * insérables mais impossibles à remplir.
 */
export function CoursePropsPanel({ onClose }: CoursePropsPanelProps) {
    const selectedId = useBuilderStore((s) => s.selectedId);
    const blocks = useBuilderStore((s) => s.blocks);

    const selected = selectedId ? findBlock(blocks, selectedId) : null;
    const def = selected ? getBlockDefinition(selected.type) : null;

    return (
        <aside
            aria-label="Propriétés du bloc"
            className="flex w-80 shrink-0 flex-col border-l border-bridge-200 bg-bridge-50 dark:border-bridge-700 dark:bg-bridge-900"
        >
            <div className="flex items-center justify-between gap-2 border-b border-bridge-200 px-3 py-2 dark:border-bridge-700">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-dark dark:text-bridge-100">
                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                    Propriétés
                </span>
                <button
                    type="button"
                    aria-label="Fermer le panneau de propriétés"
                    onClick={onClose}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-bridge-500 transition-colors duration-150 hover:bg-bridge-100 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color)] dark:text-bridge-300 dark:hover:bg-bridge-800 dark:hover:text-bridge-100"
                >
                    <PanelRightClose className="size-4" />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-2">
                {!selected || !def ? (
                    <p className="px-3 py-2 text-sm text-bridge-600 dark:text-bridge-300">
                        Sélectionnez un bloc pour éditer ses propriétés.
                    </p>
                ) : (
                    <>
                        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-bridge-600 dark:text-bridge-300">
                            {def.label}
                        </p>
                        <BlockForm blockId={selected.id} />
                    </>
                )}
            </div>
        </aside>
    );
}
