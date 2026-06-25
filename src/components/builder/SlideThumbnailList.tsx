"use client";

import React, { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { ZoomedSlide } from "@/components/builder/ZoomedSlide";
import { useReducedMotion } from "@/components/builder/useReducedMotion";
import type { Block } from "@/types/CourseContent";

interface SlideThumbnailListProps {
    slides: Block[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
}

export function SlideThumbnailList({ slides, activeId, onSelect, onAdd }: SlideThumbnailListProps) {
    const reduced = useReducedMotion();

    return (
        <div className="flex w-[208px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {slides.map((slide, i) => (
                    <Thumbnail
                        key={slide.id}
                        slide={slide}
                        index={i}
                        active={slide.id === activeId}
                        reduced={reduced}
                        onSelect={() => onSelect(slide.id)}
                    />
                ))}
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="m-3 inline-flex items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600"
            >
                <Plus className="size-4" /> Slide
            </button>
        </div>
    );
}

function Thumbnail({
    slide, index, active, reduced, onSelect,
}: {
    slide: Block;
    index: number;
    active: boolean;
    reduced: boolean;
    onSelect: () => void;
}) {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (active) ref.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }, [active, reduced]);

    return (
        <button
            ref={ref}
            type="button"
            onClick={onSelect}
            title={String(slide.props.title ?? "Sans titre")}
            aria-label={`Slide ${index + 1} : ${String(slide.props.title ?? "Sans titre")}`}
            aria-current={active}
            className={[
                "block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                active ? "ring-2 ring-blue-500" : "ring-1 ring-slate-200 dark:ring-slate-700",
            ].join(" ")}
        >
            <div className="aspect-video w-full">
                <ZoomedSlide slide={slide} mode="thumbnail" />
            </div>
            <div className="truncate bg-white px-2 py-1 text-left text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {index + 1}. {String(slide.props.title ?? "Sans titre")}
            </div>
        </button>
    );
}
