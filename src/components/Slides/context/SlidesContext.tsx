import {createContext, useContext} from "react";

export interface SlidesContextType {
    // Navigation
    currentSlide: number;
    currentStep: number;
    slidesCount: number;
    slideSteps: Record<number, number>;
    nextSlide: () => void;
    prevSlide: () => void;
    goToSlide: (index: number) => void;
    registerSteps: (steps: number) => void;

    // Notes
    currentNotes: string | null;
    showNotes: boolean;
    setShowNotes: (v: boolean) => void;

    // UI
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    isMobile: boolean;
}

export const SlidesContext = createContext<SlidesContextType | null>(null);

export function useSlides() {
    const ctx = useContext(SlidesContext);
    if (!ctx) {
        throw new Error("useSlides must be used within SlidesContext.Provider");
    }
    return ctx;
}
