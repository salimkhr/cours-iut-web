'use client';

import React from 'react';
import CodeWithPreviewCard from "@/components/Cards/CodeWithPreviewCard";
import {cn} from "@/lib/utils";
import {slideCodeTextMetrics} from "@/components/Slides/ui/SlideCode";

interface SlideCodeWithPreviewProps {
    language: string;
    code: string;
    secondaryLanguage?: string;
    secondaryCode?: string;
    preview?: string;
    size?: keyof typeof slideCodeTextMetrics;
    className?: string;
}

/**
 * Code et rendu live dans une slide. Réutilise `CodeWithPreviewCard` du cours :
 * l'iframe d'aperçu et l'injection dans le gabarit sont exactement les mêmes, seule
 * la typographie change. Une slide se lit à distance, d'où le passage à l'échelle
 * `slideCodeTextMetrics` plutôt qu'aux tailles d'une page lue à 50 cm.
 *
 * Comme `SlideCode`, le bloc se laisse comprimer (`min-h-0`) au lieu d'imposer une
 * hauteur : c'est la slide qui décide de la place disponible.
 */
export const SlideCodeWithPreview: React.FC<SlideCodeWithPreviewProps> = ({
                                                                             language,
                                                                             code,
                                                                             secondaryLanguage,
                                                                             secondaryCode,
                                                                             preview,
                                                                             size = "default",
                                                                             className,
                                                                         }) => {
    const {fontSize, lineHeight} = slideCodeTextMetrics[size];

    const panels = [
        {language, code},
        {language: secondaryLanguage ?? "", code: secondaryCode ?? ""},
    ].filter((panel) => panel.code.length > 0);

    const previewValue = preview?.trim() ?? "";

    return (
        <div className={cn("flex w-full min-h-0 flex-col slide-code-container", className)}>
            <CodeWithPreviewCard
                panels={panels}
                sources={previewValue ? {
                    language,
                    code,
                    secondaryLanguage: secondaryLanguage ?? "",
                    secondaryCode: secondaryCode ?? "",
                    preview: previewValue,
                } : undefined}
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
