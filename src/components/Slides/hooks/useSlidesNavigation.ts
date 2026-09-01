'use client';

import {useCallback, useState} from "react";

export interface SlidesNavigation {
    currentSlide: number;
    currentStep: number;
    slidesCount: number;
    slideSteps: Record<number, number>;

    nextSlide: () => void;
    prevSlide: () => void;
    goToSlide: (index: number) => void;
    syncTo: (slide: number, step: number) => void;
    registerSteps: (slideIndex: number, steps: number) => void;
}

export function useSlidesNavigation(
    slidesCount: number,
    initialSteps?: Record<number, number>
): SlidesNavigation {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    // Préempli depuis les props (highlight/secondaryHighlight) plutôt que
    // vide : sans ça, seule la slide courante est montée à un instant donné,
    // et le nombre d'étapes d'une slide n'était connu qu'au moment où
    // `registerSteps` s'exécutait à son premier montage — le rail semblait
    // alors se charger au fur et à mesure qu'on avançait dans le diaporama.
    const [slideSteps, setSlideSteps] = useState<Record<number, number>>(initialSteps ?? {});

    const registerSteps = useCallback((slideIndex: number, steps: number) => {
        setSlideSteps(prev => {
            if (prev[slideIndex] === steps) return prev;
            return {...prev, [slideIndex]: steps};
        });
    }, []);

    const nextSlide = useCallback(() => {
        const maxSteps = slideSteps[currentSlide] || 0;

        if (currentStep < maxSteps) {
            setCurrentStep(prev => prev + 1);
        } else if (currentSlide < slidesCount - 1) {
            setCurrentSlide(prev => prev + 1);
            setCurrentStep(0);
        }
    }, [currentSlide, currentStep, slideSteps, slidesCount]);

    const prevSlide = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else if (currentSlide > 0) {
            const prevSlideIndex = currentSlide - 1;
            setCurrentSlide(prevSlideIndex);
            setCurrentStep(slideSteps[prevSlideIndex] || 0);
        }
    }, [currentSlide, currentStep, slideSteps]);

    const goToSlide = useCallback(
        (index: number) => {
            if (index >= 0 && index < slidesCount) {
                setCurrentSlide(index);
                setCurrentStep(0);
            }
        },
        [slidesCount]
    );

    const syncTo = useCallback((slide: number, step: number) => {
        setCurrentSlide(Math.max(0, Math.min(slide, slidesCount - 1)));
        setCurrentStep(Math.max(0, step));
    }, [slidesCount]);

    return {
        currentSlide,
        currentStep,
        slidesCount,
        slideSteps,
        nextSlide,
        prevSlide,
        goToSlide,
        syncTo,
        registerSteps,
    };
}
