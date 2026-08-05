"use client";

import React from "react";
import { SlidesContext, type SlidesContextType } from "@/components/Slides/context/SlidesContext";
import { SlideBlockItem } from "@/components/Slides/SlideBlockItem";
import type { Block } from "@/types/CourseContent";

/** Contexte statique : la slide est rendue figée (pas de navigation par étapes). */
export const PREVIEW_CONTEXT: SlidesContextType = {
    currentSlide: 0,
    currentStep: 0,
    slidesCount: 1,
    slideSteps: {},
    nextSlide: () => {},
    prevSlide: () => {},
    goToSlide: () => {},
    registerSteps: () => {},
    currentNotes: null,
    showNotes: false,
    setShowNotes: () => {},
    isFullscreen: false,
    toggleFullscreen: () => {},
};

export function SlideChildItem({ block, renderNested }: {
    block: Block;
    renderNested?: (child: Block, parent: Block, index: number) => React.ReactNode;
}) {
    return <SlideBlockItem block={block} renderNested={renderNested}/>;
}

/** Rend les enfants d'une slide, entourés du contexte slides statique. */
export function SlideChildrenRenderer({ blocks }: { blocks: Block[] }) {
    return (
        <SlidesContext.Provider value={PREVIEW_CONTEXT}>
            {blocks.map((child) => (
                <SlideChildItem key={child.id} block={child} />
            ))}
        </SlidesContext.Provider>
    );
}
