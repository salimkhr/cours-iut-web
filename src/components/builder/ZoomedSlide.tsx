"use client";

import React, { useEffect, useRef, useState } from "react";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideChildrenRenderer } from "@/components/builder/SlideChildrenRenderer";
import { computeSlideScale, SLIDE_W, SLIDE_H, type ZoomMode } from "@/components/builder/slideScale";
import type { Block } from "@/types/CourseContent";

interface ZoomedSlideProps {
    slide: Block;
    mode: ZoomMode;
    /** Rendu enfant alternatif (mode canvas-edit : blocs enveloppés d'EditableBlock). */
    renderChildren?: (children: Block[]) => React.ReactNode;
    className?: string;
}

/**
 * Rend une slide (SlideScreen) à l'échelle via transform: scale().
 * IMPORTANT : ne rend jamais SlidesScreen (chrome de navigation).
 * Le scale crée un stacking context isolé → toute surface flottante ouverte
 * depuis l'intérieur DOIT être portée hors de ce conteneur (Dialog radix le fait).
 */
export function ZoomedSlide({ slide, mode, renderChildren, className }: ZoomedSlideProps) {
    const outerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number | null>(null);

    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;

        let raf = 0;
        const measure = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const { width, height } = el.getBoundingClientRect();
                setScale(computeSlideScale(width, height, mode));
            });
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [mode]);

    const children = slide.children ?? [];

    return (
        <div ref={outerRef} className={className} style={{ width: "100%", height: "100%" }}>
            {scale === null ? (
                <div className="h-full w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            ) : (
                <div
                    className="origin-top-left overflow-hidden rounded-lg bg-card shadow-lg"
                    style={{
                        width: SLIDE_W,
                        height: SLIDE_H,
                        transform: `scale(${scale})`,
                        pointerEvents: mode === "thumbnail" ? "none" : "auto",
                    }}
                >
                    <SlideScreen title={String(slide.props.title ?? "")}>
                        {renderChildren ? renderChildren(children) : <SlideChildrenRenderer blocks={children} />}
                    </SlideScreen>
                </div>
            )}
        </div>
    );
}
