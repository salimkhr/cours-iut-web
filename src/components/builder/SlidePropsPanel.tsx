"use client";

import React from "react";
import { BlockForm } from "@/components/builder/BlockForm";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";

interface SlidePropsPanelProps {
    /** Slide courante — ses props (titre) sont toujours éditables. */
    slideId: string;
    /** Bloc sélectionné dans la slide, le cas échéant. */
    selectedId: string | null;
}

/**
 * Panneau de propriétés du canvas slide.
 *
 * `blockDefs` décrit pour chaque type ses champs éditables (titre de slide,
 * langage et étapes de highlight d'un bloc de code…), et `BlockForm` sait déjà
 * les rendre. Ce panneau est ce qui les rend enfin atteignables en mode slide :
 * la seule voie d'accès précédente passait par un arbre de blocs qui n'était
 * plus monté, et le mode slide n'exposait donc aucune de ces props.
 */
export function SlidePropsPanel({ slideId, selectedId }: SlidePropsPanelProps) {
    const blocks = useBuilderStore((s) => s.blocks);

    const selected = selectedId ? findBlock(blocks, selectedId) : null;
    // La slide elle-même est un bloc : sélectionnée, elle est déjà rendue par la
    // première section, inutile de la répéter.
    const selectedIsSlide = selected?.id === slideId;
    const selectedDef = selected ? getBlockDefinition(selected.type) : null;

    return (
        <aside
            aria-label="Propriétés"
            className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-bridge-200 bg-bridge-50 dark:border-bridge-700 dark:bg-bridge-900"
        >
            <PanelSection title="Slide">
                <BlockForm blockId={slideId} />
            </PanelSection>

            {selected && !selectedIsSlide && (
                <PanelSection title={selectedDef?.label ?? selected.type}>
                    <BlockForm blockId={selected.id} />
                </PanelSection>
            )}

            {!selected && (
                <p className="px-3 py-2 text-xs text-bridge-500 dark:text-bridge-400">
                    Sélectionnez un bloc pour éditer ses propriétés.
                </p>
            )}
        </aside>
    );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="border-b border-bridge-200 py-2 dark:border-bridge-700">
            {/* Eyebrow structurel, pattern documenté dans DESIGN.md §Typography. */}
            <h2 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-dark/70 dark:text-bridge-300/70">
                {title}
            </h2>
            {children}
        </section>
    );
}
