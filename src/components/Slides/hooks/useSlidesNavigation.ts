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
    registerSteps: (slideIndex: number, steps: number) => void;
}

export function useSlidesNavigation(slidesCount: number): SlidesNavigation {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [slideSteps, setSlideSteps] = useState<Record<number, number>>({});

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

    return {
        currentSlide,
        currentStep,
        slidesCount,
        slideSteps,
        nextSlide,
        prevSlide,
        goToSlide,
        registerSteps,
    };
}
