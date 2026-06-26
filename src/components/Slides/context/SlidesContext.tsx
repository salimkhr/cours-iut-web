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

    // Live (optionnel : absent hors mode présentation)
    live?: {
        isLive: boolean;
        isPresenter: boolean;
        presenterName: string | null;
        connection: import("@/lib/live/liveTypes").LiveConnection;
        drift: import("@/lib/live/drift").Drift;
        paused: boolean;
        resync: () => void;
    };
    startPresenting?: () => void;
    stopPresenting?: () => void;
}

export const SlidesContext = createContext<SlidesContextType | null>(null);

export function useSlides() {
    const ctx = useContext(SlidesContext);
    if (!ctx) {
        throw new Error("useSlides must be used within SlidesContext.Provider");
    }
    return ctx;
}
