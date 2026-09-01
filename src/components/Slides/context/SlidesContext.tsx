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

    /* Identité (pour l'eyebrow du bandeau) */
    moduleTitle?: string;
    sectionTitle?: string;
    /** Titre de la slide courante, tel que saisi dans le builder. Sert au mode
     *  télécommande mobile, qui n'affiche pas le contenu du deck. */
    currentSlideTitle?: string | null;

    /** Index des slides de transition dans le deck, garde de section comprise.
     *  Le rail de progression les marque d'un trait au lieu d'un point : ce ne
     *  sont pas des slides de contenu mais des séparations de parties. */
    transitionSlides?: number[];

    // Live (optionnel : absent hors mode présentation)
    live?: {
        isLive: boolean;
        isPresenter: boolean;
        /** Vrai uniquement sur l'appareil qui a démarré la session (contrôleur actif) */
        isController: boolean;
        presenterName: string | null;
        connection: import("@/lib/live/liveTypes").LiveConnection;
        drift: import("@/lib/live/drift").Drift;
        paused: boolean;
        resync: () => void;
    };
    startPresenting?: () => Promise<void>;
    stopPresenting?: () => Promise<void>;
    /** Admin : reprendre le contrôle sans redémarrer la session (après rechargement) */
    takeControl?: () => void;
}

export const SlidesContext = createContext<SlidesContextType | null>(null);

export function useSlides() {
    const ctx = useContext(SlidesContext);
    if (!ctx) {
        throw new Error("useSlides must be used within SlidesContext.Provider");
    }
    return ctx;
}
