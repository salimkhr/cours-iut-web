"use client";

import React, { useEffect, useRef, useState } from "react";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { isTransitionSlide } from "@/components/Slides/SlideBlocksRenderer";
import { PREVIEW_CONTEXT, SlideChildrenRenderer } from "@/components/builder/SlideChildrenRenderer";
import { SlidesContext } from "@/components/Slides/context/SlidesContext";
import { computeSlideScale, getSlideFrameSize, type ZoomMode } from "@/components/builder/slideScale";
import type { Block } from "@/types/CourseContent";

interface ZoomedSlideProps {
    slide: Block;
    mode: ZoomMode;
    /** Rang de la slide dans le deck, affiché dans le badge du bandeau de titre. */
    order?: number;
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
export function ZoomedSlide({ slide, mode, order, renderChildren, className }: ZoomedSlideProps) {
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
    const frame = getSlideFrameSize(mode);

    return (
        <div ref={outerRef} className={className} style={{ width: "100%", height: "100%" }}>
            {scale === null ? (
                <div className="h-full w-full animate-pulse rounded-lg bg-bridge-200/70 dark:bg-bridge-700/55" />
            ) : (
                <div
                    className="origin-top-left overflow-hidden rounded-lg bg-card shadow-lg"
                    style={{
                        width: frame.width,
                        height: frame.height,
                        transform: `scale(${scale})`,
                        pointerEvents: mode === "thumbnail" ? "none" : "auto",
                    }}
                >
                    {/* SlideScreen consomme lui-meme le contexte (eyebrow module
                        et section) : le provider doit l'englober, pas seulement
                        ses enfants, sinon l'apercu du builder leve
                        « useSlides must be used within SlidesContext.Provider ». */}
                    <SlidesContext.Provider value={PREVIEW_CONTEXT}>
                        {/* Une transition ne porte NI bandeau NI numéro, quel que
                            soit le titre de sa slide : c'est le type qui décide,
                            pas la saisie. Même règle que dans le player, sinon
                            l'aperçu du builder mentirait sur le rendu réel. */}
                        {isTransitionSlide(slide) ? (
                            // Hors de SlideScreen, rien ne donne sa hauteur au
                            // bloc : sans ce conteneur, le `h-full` de la
                            // transition retombe sur la hauteur du texte et la
                            // photo se réduit à un bandeau.
                            // Hors de SlideScreen, rien ne donne sa hauteur au
                            // bloc. Suffit en mode vignette ; en mode édition,
                            // l'enveloppe EditableBlock reste de hauteur auto et
                            // l'aperçu montre la transition en bandeau haut —
                            // le rendu du player, lui, est correct.
                            <div className="flex h-full w-full flex-col">
                                {renderChildren ? renderChildren(children) : <SlideChildrenRenderer blocks={children} />}
                            </div>
                        ) : (
                            <SlideScreen title={String(slide.props.title ?? "")} order={order}>
                                {renderChildren ? renderChildren(children) : <SlideChildrenRenderer blocks={children} />}
                            </SlideScreen>
                        )}
                    </SlidesContext.Provider>
                </div>
            )}
        </div>
    );
}
