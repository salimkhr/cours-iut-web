"use client";

import React from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { SlidesContext, type SlidesContextType } from "@/components/Slides/context/SlidesContext";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { renderInline } from "@/lib/inlineMarkdown";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import type { Block } from "@/types/CourseContent";

const PREVIEW_CONTEXT: SlidesContextType = {
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
    isMobile: false,
};

export function SlidePreviewList({ moduleSlug, sectionSlug }: { moduleSlug: string; sectionSlug: string }) {
    const blocks = useBuilderStore((s) => s.blocks);
    const slideBlocks = blocks.filter((b) => b.type === "slide");

    const previewUrl = `/${moduleSlug}/${sectionSlug}/slide`;

    return (
        <div className="flex flex-col flex-1 min-h-0 border-l border-slate-300/40 dark:border-slate-600/30 bg-white dark:bg-slate-950">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-300/30 dark:border-slate-600/20 bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500">
                    Aperçu — {slideBlocks.length} slide{slideBlocks.length !== 1 ? "s" : ""}
                </span>
                <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors ml-auto"
                >
                    Ouvrir ↗
                </a>
            </div>

            {slideBlocks.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center text-slate-400 text-sm p-8">
                    <p>Aucune slide. Ajoutez un bloc <strong>Slide</strong>.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 p-4 overflow-y-auto">
                    {slideBlocks.map((slide, i) => (
                        <SlidePreviewCard key={slide.id} slide={slide} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}

function SlidePreviewCard({ slide, index }: { slide: Block; index: number }) {
    return (
        <SlidesContext.Provider value={PREVIEW_CONTEXT}>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
                        {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {String(slide.props.title || "Sans titre")}
                    </span>
                </div>
                <div className="p-4 min-h-[80px] bg-white dark:bg-slate-900">
                    {(slide.children ?? []).map((child) => (
                        <SlideBlockPreviewItem key={child.id} block={child} />
                    ))}
                </div>
            </div>
        </SlidesContext.Provider>
    );
}

function SlideBlockPreviewItem({ block }: { block: Block }) {
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
                                <SlideBlockPreviewItem key={inner.id} block={inner} />
                            ))}
                        </div>
                    ))}
                </div>
            );
        default:
            return null;
    }
}
