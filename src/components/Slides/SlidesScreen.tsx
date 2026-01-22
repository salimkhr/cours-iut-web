'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {cn} from "@/lib/utils";

import {SlideMode, SlidesContext} from "./context/SlidesContext";
import {NotesRenderer} from "./ui/NotesRenderer";
import {useMediaQuery} from "@/hook/useMediaQuery";
import {useFullscreen} from "./hooks/useFullscreen";
import {useKeyboardNav} from "./hooks/useKeyboardNav";
import {useSlideNotes} from "./hooks/useSlideNotes";
import {useSlideSync} from "./hooks/useSlideSync";
import {SlideTitle} from "./ui/SlideTitle";
import Module from "@/types/module";
import Section from "@/types/Section";
import {useSlidesNavigation} from "@/components/Slides/hooks/useSlidesNavigation";
import {SlidesMobileView} from "@/components/Slides/SlidesMobileView";
import {SlidesProgress} from "@/components/Slides/SlidesProgress";
import {SlidesActions} from "@/components/Slides/SlidesActions";
import {useSearchParams} from "next/dist/client/components/navigation";

interface SlidesScreenProps {
    children: React.ReactNode;
    module?: Module;
    section?: Section;
}

export const SlidesScreen: React.FC<SlidesScreenProps> = ({
                                                              children,
                                                              module,
                                                              section,
                                                          }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') as SlideMode || 'standalone';

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

    /* ---------- WebSocket Sync ---------- */
    const goToSlideRef = useRef(navigation.goToSlide);

    useEffect(() => {
        goToSlideRef.current = navigation.goToSlide;
    }, [navigation.goToSlide]);

    const handleRemoteSlideChange = useCallback(
        (slide: number, step: number) => {
            if (mode === 'viewer') {
                goToSlideRef.current(slide);
            }
        },
        [mode]
    );

    const {isConnected, viewersCount, broadcastSlideChange} = useSlideSync({
        mode,
        onSlideChange: handleRemoteSlideChange,
    });

    // Broadcast seulement en mode presenter
    const prevSlideRef = useRef(navigation.currentSlide);
    const prevStepRef = useRef(navigation.currentStep);

    useEffect(() => {
        if (mode === 'presenter') {
            if (prevSlideRef.current !== navigation.currentSlide ||
                prevStepRef.current !== navigation.currentStep) {
                broadcastSlideChange(navigation.currentSlide, navigation.currentStep);
                prevSlideRef.current = navigation.currentSlide;
                prevStepRef.current = navigation.currentStep;
            }
        }
    }, [mode, navigation.currentSlide, navigation.currentStep, broadcastSlideChange]);

    /* ---------- Keyboard ---------- */
    useKeyboardNav({
        next: mode === 'viewer' ? () => {
        } : navigation.nextSlide,
        prev: mode === 'viewer' ? () => {
        } : navigation.prevSlide,
        toggleFullscreen,
    });

    if (slides.length === 0) {
        return <div className="p-8 text-center">Aucune slide disponible.</div>;
    }

    return (
        <SlidesContext.Provider
            value={{
                ...navigation,
                registerSteps: (steps) =>
                    navigation.registerSteps(navigation.currentSlide, steps),
                currentNotes,
                showNotes,
                setShowNotes,
                isFullscreen,
                toggleFullscreen,
                isMobile,
                mode,
                isConnected: mode !== 'standalone' ? isConnected : true,
                viewersCount: mode === 'presenter' ? viewersCount : 0,
            }}
        >
            <div
                ref={containerRef}
                className={cn(
                    "relative flex flex-col min-h-[600px] w-full transition-all",
                    isFullscreen
                        ? "fixed inset-0 z-50 bg-white"
                        : "bg-muted/30 rounded-2xl border"
                )}
            >
                {/* Badge de statut */}
                {mode !== 'standalone' && (
                    <div className="absolute top-4 right-4 z-50">
                        <div
                            className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
                            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                                {isConnected ? '🟢' : '🔴'}
                            </span>
                            <span>{mode === 'presenter' ? 'Présentateur' : 'Spectateur'}</span>
                            {mode === 'presenter' && (
                                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
                                    {viewersCount} 👥
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {isMobile ? (
                    <SlidesMobileView/>
                ) : (
                    <>
                        {/* Progression latérale */}
                        <SlidesProgress/>

                        {/* Notes (desktop) */}
                        {showNotes && currentNotes && (
                            <div
                                className="absolute top-4 left-4 z-40 w-80 max-h-[70vh] overflow-y-auto bg-background/95 backdrop-blur-md p-6 rounded-2xl border shadow-2xl">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                                    Notes de présentation
                                </h3>
                                <NotesRenderer notes={currentNotes}/>
                            </div>
                        )}

                        {/* Slide courante */}
                        <div className="flex-1 flex items-center justify-center p-6">
                            {slides[navigation.currentSlide]}
                        </div>

                        {/* Actions */}
                        <SlidesActions/>

                        {/* Progress bar bas */}
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/20">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{
                                    width: `${
                                        ((navigation.currentSlide + 1) / slides.length) * 100
                                    }%`,
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </SlidesContext.Provider>
    );
};