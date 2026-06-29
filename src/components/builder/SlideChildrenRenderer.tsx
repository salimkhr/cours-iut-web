"use client";

import React from "react";
import { SlidesContext, type SlidesContextType } from "@/components/Slides/context/SlidesContext";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { renderInline } from "@/lib/inlineMarkdown";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
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

export function SlideChildItem({ block }: { block: Block }) {
    switch (block.type) {
        case "slide-text":
            return <SlideText>{renderInline(String(block.props.content ?? ""))}</SlideText>;
        case "slide-code":
            return (
                <SlideCode
                    language={String(block.props.language ?? "javascript")}
                    highlight={block.props.highlight ? String(block.props.highlight) : undefined}
                >
                    {String(block.props.code ?? "")}
                </SlideCode>
            );
        case "slide-list":
            return (
                <SlideList ordered={Boolean(block.props.ordered)}>
                    {(block.children ?? []).map((item) => (
                        <SlideListItem key={item.id}>
                            {renderInline(String(item.props.text ?? ""))}
                        </SlideListItem>
                    ))}
                </SlideList>
            );
        case "slide-note":
            return <SlideNote>{String(block.props.content ?? "")}</SlideNote>;
        case "columns":
            return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {(block.children ?? []).map((col) => (
                        <div
                            key={col.id}
                            className={`${COL_SPAN_CLASS[Number(col.props.span)] ?? "md:col-span-6"} flex flex-col gap-4 min-w-0`}
                        >
                            {(col.children ?? []).map((inner) => (
                                <SlideChildItem key={inner.id} block={inner} />
                            ))}
                        </div>
                    ))}
                </div>
            );
        default:
            return null;
    }
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
