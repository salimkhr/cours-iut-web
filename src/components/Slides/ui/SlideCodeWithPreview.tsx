'use client';

import React, {useEffect, useMemo} from 'react';
import CodeWithPreviewCard from "@/components/Cards/CodeWithPreviewCard";
import {cn} from "@/lib/utils";
import {slideCodeTextMetrics} from "@/components/Slides/ui/SlideCode";
import {useSlides} from "@/components/Slides/context/SlidesContext";

interface SlideCodeWithPreviewProps {
    language: string;
    code: string;
    secondaryLanguage?: string;
    secondaryCode?: string;
    preview?: string;
    /** Étapes d'animation du premier panneau, séparées par `|`, ex. "1 | 2-4 | 5-7".
     *  Chaque groupe s'affiche à l'appui sur →, comme dans `SlideCode`. */
    highlight?: string;
    /** Étapes du second panneau, sur le MÊME rythme que `highlight` : à l'étape N,
     *  les deux panneaux s'allument ensemble. C'est ce qui permet de montrer quelles
     *  lignes de code produisent quelles lignes de résultat. */
    secondaryHighlight?: string;
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
 *
 * `size` doit rester aligné sur celui de `SlideCode` : la règle de police est injectée
 * en GLOBAL sur `.slide-code-container pre`, que les deux composants partagent. Deux
 * tailles différentes sur une même slide ne cohabitent pas — la dernière montée gagne,
 * pour les deux blocs.
 */
export const SlideCodeWithPreview: React.FC<SlideCodeWithPreviewProps> = ({
                                                                             language,
                                                                             code,
                                                                             secondaryLanguage,
                                                                             secondaryCode,
                                                                             preview,
                                                                             highlight,
                                                                             secondaryHighlight,
                                                                             size = "xl",
                                                                             className,
                                                                         }) => {
    const {fontSize, lineHeight} = slideCodeTextMetrics[size];
    const {currentStep, registerSteps} = useSlides();

    const groups = useMemo(
        () => (value?: string) => (value ? value.split('|').map((group) => group.trim()) : []),
        [],
    );

    const highlightGroups = useMemo(() => groups(highlight), [groups, highlight]);
    const secondaryGroups = useMemo(() => groups(secondaryHighlight), [groups, secondaryHighlight]);

    // Le nombre d'étapes est celui du panneau qui en déclare le plus : un panneau
    // à court de groupes reste simplement sans surlignage sur les étapes suivantes.
    const stepCount = Math.max(highlightGroups.length, secondaryGroups.length);

    useEffect(() => {
        if (stepCount > 0) {
            registerSteps(stepCount - 1);
        }
    }, [stepCount, registerSteps]);

    const panels = [
        {language, code, highlightLines: highlightGroups[currentStep] || undefined},
        {
            language: secondaryLanguage ?? "",
            code: secondaryCode ?? "",
            highlightLines: secondaryGroups[currentStep] || undefined,
        },
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
