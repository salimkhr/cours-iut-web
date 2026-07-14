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
        <div className="flex w-[208px] shrink-0 flex-col border-r border-bridge-200 bg-bridge-50 dark:border-bridge-700 dark:bg-bridge-900">
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
                className="m-3 inline-flex items-center justify-center gap-1 rounded-md border border-dashed border-bridge-300 py-2 text-sm text-bridge-500 hover:border-[var(--mod-color)] hover:text-[var(--mod-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color,#C2410C)] dark:border-bridge-600 dark:text-bridge-400"
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
            aria-current={active ? "step" : undefined}
            className={[
                "block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                active ? "ring-2 ring-[var(--mod-color,#C2410C)]" : "ring-1 ring-bridge-200 dark:ring-bridge-700",
            ].join(" ")}
        >
            <div className="aspect-video w-full">
                <ZoomedSlide slide={slide} mode="thumbnail" />
            </div>
            <div className="truncate bg-bridge-50 px-2 py-1 text-left text-[11px] text-brand-dark/70 dark:bg-bridge-800 dark:text-bridge-200">
                {index + 1}. {String(slide.props.title ?? "Sans titre")}
            </div>
        </button>
    );
}
