'use client';

import React, {type CSSProperties, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {cn} from "@/lib/utils";

import {SlidesContext} from "./context/SlidesContext";
import {useFullscreen} from "./hooks/useFullscreen";
import {useKeyboardNav} from "./hooks/useKeyboardNav";
import {useSlideNotes} from "./hooks/useSlideNotes";

import {SlideTitle} from "./ui/SlideTitle";
import Module from "@/types/Module";
import Section from "@/types/Section";
import {useSlidesNavigation} from "@/components/Slides/hooks/useSlidesNavigation";
import {SlidesProgress} from "@/components/Slides/SlidesProgress";
import {SlidesActions} from "@/components/Slides/SlidesActions";
import {useLiveSession} from "@/components/Slides/hooks/useLiveSession";
import {useFollowerSync} from "@/components/Slides/hooks/useFollowerSync";
import {authClient} from "@/lib/auth-client";

interface SlidesScreenProps {
    children: React.ReactNode;
    module?: Module;
    section?: Section;
}

export const slideViewportClassName = (isFullscreen: boolean) => cn(
    "flex-1 min-h-0 flex items-center justify-center",
    isFullscreen ? "p-0" : "p-6"
);

// Une slide est une scène de dimensions fixes : le cadre ne doit jamais suivre
// la hauteur du contenu, sinon la bordure et la barre d'actions sautent d'une
// slide à l'autre et les slides denses (code, diagramme) débordent la page.
export const slidesContainerClassName = (isFullscreen: boolean) => cn(
    "relative flex flex-col w-full overflow-hidden transition-all slide-surface",
    isFullscreen
        ? "fixed inset-0 z-50 h-full !border-0 !rounded-none !shadow-none"
        : cn(
            "h-[calc(100dvh-var(--navbar-h)-1.5rem)] min-h-[420px]",
            "rounded-2xl border border-bridge-500/45 dark:border-bridge-500/35",
            "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
            "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
        )
);

export const slidesContainerStyle = (isFullscreen: boolean): CSSProperties | undefined => (
    isFullscreen
        ? {
            border: 0,
            borderRadius: 0,
            boxShadow: "none",
        }
        : undefined
);

export const SlidesScreen: React.FC<SlidesScreenProps> = ({
                                                              children,
                                                              module,
                                                              section,
                                                          }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    /* ---------- Slides ---------- */
    const slides = useMemo(() => {
        const baseSlides = React.Children.toArray(children);
        if (module && section) {
            return [
                <SlideTitle key="title" module={module} section={section}/>,
                ...baseSlides,
            ];
        }
        return baseSlides;
    }, [children, module, section]);

    /* ---------- Navigation ---------- */
    const navigation = useSlidesNavigation(slides.length);

    /* ---------- Notes ---------- */
    const currentNotes = useSlideNotes(slides, navigation.currentSlide);
    const [showNotes, setShowNotes] = useState(false);

    /* ---------- Fullscreen ---------- */
    const {isFullscreen, toggleFullscreen} = useFullscreen(containerRef);

    /* ---------- Auth ---------- */
    const {data: sessionData} = authClient.useSession();
    const isPresenter = sessionData?.user.role === "admin";

    /* ---------- Live ---------- */
    const hasSlugCtx = !!(module && section);
    const live = useLiveSession(module?.path ?? "", section?.path ?? "");
    const {isLive: sessionIsLive, presenter, sendCommand, connection, presenterName, start, stop, startedHere, takeControl} = live;

    // Contrôleur actif = admin ET a démarré la session depuis cet appareil
    const isController = isPresenter && startedHere;

    const {paused, drift, resync, notifyLocalNav} = useFollowerSync({
        isLive: sessionIsLive && hasSlugCtx,
        isController,
        presenter,
        localSlide: navigation.currentSlide,
        syncTo: navigation.syncTo,
    });

    // Quand le contrôleur actif change de slide, diffuse la position
    useEffect(() => {
        if (!isController || !sessionIsLive || !hasSlugCtx) return;
        sendCommand({slide: navigation.currentSlide, step: navigation.currentStep});
    }, [navigation.currentSlide, navigation.currentStep, isController, sessionIsLive, hasSlugCtx, sendCommand]);

    // Navigation wrappée pour que les déplacements manuels suspendent le suivi follower
    const wrappedNext = useCallback(() => {
        navigation.nextSlide();
        notifyLocalNav();
    }, [navigation, notifyLocalNav]);

    const wrappedPrev = useCallback(() => {
        navigation.prevSlide();
        notifyLocalNav();
    }, [navigation, notifyLocalNav]);

    const wrappedGoTo = useCallback((index: number) => {
        navigation.goToSlide(index);
        notifyLocalNav();
    }, [navigation, notifyLocalNav]);

    /* ---------- Keyboard ---------- */
    useKeyboardNav({
        next: wrappedNext,
        prev: wrappedPrev,
        toggleFullscreen,
    });

    if (slides.length === 0) {
        return <div className="p-8 text-center">Aucune slide disponible.</div>;
    }

    return (
        <SlidesContext.Provider
            value={{
                /* Navigation */
                ...navigation,
                nextSlide: wrappedNext,
                prevSlide: wrappedPrev,
                goToSlide: wrappedGoTo,
                registerSteps: (steps) =>
                    navigation.registerSteps(navigation.currentSlide, steps),

                /* Notes */
                currentNotes,
                showNotes,
                setShowNotes,

                /* UI */
                isFullscreen,
                toggleFullscreen,

                /* Identité */
                moduleTitle: module?.title,
                sectionTitle: section?.title,

                /* Live */
                live: hasSlugCtx ? {
                    isLive: sessionIsLive,
                    isPresenter,
                    isController,
                    presenterName,
                    connection,
                    drift,
                    paused,
                    resync,
                } : undefined,
                startPresenting: hasSlugCtx ? start : undefined,
                stopPresenting: hasSlugCtx ? stop : undefined,
                takeControl: hasSlugCtx && isPresenter && !isController ? takeControl : undefined,
            }}
        >
            <div
                ref={containerRef}
                className={slidesContainerClassName(isFullscreen)}
                style={slidesContainerStyle(isFullscreen)}
            >
                {/* Progression latérale */}
                <SlidesProgress/>

                {/* Slide courante */}
                <div className={slideViewportClassName(isFullscreen)}>
                    {slides[navigation.currentSlide]}
                </div>

                {/* Actions */}
                <SlidesActions/>
            </div>
        </SlidesContext.Provider>
    );
};
