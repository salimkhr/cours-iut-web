'use client';
import React, {useEffect, useMemo} from 'react';
import CodeCard, {CodeCardProps} from "@/components/Cards/CodeCard";
import {cn} from "@/lib/utils";
import {useSlides} from "@/components/Slides/context/SlidesContext";

interface SlideCodeProps extends CodeCardProps {
    size?: "default" | "large" | "xl";
    highlight?: string;
}

// Interlignes en ratio, pas en rem : `xl` déclarait 1.75rem d'interligne pour
// 2rem de police — plus petit que la police elle-même. Le highlighter imposait
// heureusement son propre 1.5, mais la valeur fausse servait encore au calcul
// de défilement des étapes (voir plus bas).
export const slideCodeTextMetrics = {
    default: {fontSize: "1.2rem", lineHeight: "1.5"},
    large: {fontSize: "1.4rem", lineHeight: "1.5"},
    xl: {fontSize: "1.6rem", lineHeight: "1.5"},
} as const;

export const SlideCode: React.FC<SlideCodeProps> = ({
                                                        className,
                                                        size = "xl",
                                                        highlight,
                                                        ...props
                                                    }) => {
    const {currentStep, registerSteps} = useSlides();
    const {fontSize, lineHeight} = slideCodeTextMetrics[size];
    const rootRef = React.useRef<HTMLDivElement>(null);

    const highlightGroups = useMemo(() => {
        if (!highlight) return [];
        return highlight.split('|').map(group => group.trim());
    }, [highlight]);

    useEffect(() => {
        if (highlightGroups.length > 0) {
            registerSteps(highlightGroups.length - 1);
        }
    }, [highlightGroups.length, registerSteps]);

    const currentHighlight = highlightGroups[currentStep] || "";

    useEffect(() => {
        if (!currentHighlight || !rootRef.current) return;

        const firstHighlightedLine = currentHighlight.split(',')[0].split('-')[0].trim();
        const lineNumber = parseInt(firstHighlightedLine);

        if (isNaN(lineNumber)) return;

        const container = rootRef.current.querySelector<HTMLElement>('[data-code-scroll]');
        // Le rendu du highlighter émet une ligne = un span bloc.
        const line = container?.querySelectorAll<HTMLElement>('code > span')[lineNumber - 1];
        if (!container || !line) return;

        // On mesure la ligne au lieu de la calculer : l'ancien
        // `parseFloat(lineHeight) * 16` donnait 28px pour des lignes rendues à
        // 48px, soit un défilement 40 % trop court — la ligne visée finissait
        // souvent sous le bord du cadre.
        const lineTop = line.getBoundingClientRect().top
            - container.getBoundingClientRect().top
            + container.scrollTop;

        container.scrollTo({
            // Deux lignes de contexte au-dessus de la ligne visée.
            top: Math.max(0, lineTop - 2 * line.offsetHeight),
            behavior: 'smooth'
        });
    }, [currentHighlight]);

    return (
        // Le bloc se laisse comprimer par la slide (`min-h-0` + shrink par
        // défaut) au lieu d'imposer une hauteur en `vh` qui ignorait le chrome
        // de slide (eyebrow, titre, paddings, barre d'actions) et débordait.
        // Pas de `my-*` : `.slide-body > * + *` gère déjà l'écart entre blocs,
        // et chaque rem gagnée ici est une ligne de code lisible en plus.
        <div ref={rootRef} className={cn("flex w-full min-h-0 flex-col slide-code-container", className)}>
            <CodeCard
                {...props}
                className="!my-0 flex min-h-0 flex-1 flex-col"
                showActions={false}
                highlightLines={currentHighlight}
            />
            <style jsx global>{`
                .slide-code-container pre {
                    font-size: ${fontSize} !important;
                    line-height: ${lineHeight} !important;
                    margin: 0 !important;
                }
            `}</style>
        </div>
    );
};
