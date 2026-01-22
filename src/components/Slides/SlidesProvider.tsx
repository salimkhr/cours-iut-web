'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SlideMode, SlidesContext} from "@/components/Slides/context/SlidesContext";
import {useSlidesNavigation} from "@/components/Slides/hooks/useSlidesNavigation";
import {useSlideNotes} from "@/components/Slides/hooks/useSlideNotes";
import {useFullscreen} from "@/components/Slides/hooks/useFullscreen";
import {useSlideSync} from "@/components/Slides/hooks/useSlideSync";
import {useKeyboardNav} from "@/components/Slides/hooks/useKeyboardNav";


interface SlidesProviderProps {
    children: React.ReactNode;
    slides: React.ReactNode[];
    mode?: SlideMode;
    roomId?: string;
}

export function SlidesProvider({
                                   children,
                                   slides,
                                   mode = 'standalone',
                                   roomId,
                               }: SlidesProviderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showNotes, setShowNotes] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const navigation = useSlidesNavigation(slides.length);
    const notes = useSlideNotes(slides, navigation.currentSlide);
    const {isFullscreen, toggleFullscreen} = useFullscreen(containerRef);

    // WebSocket sync - seulement si mode != standalone et roomId fourni
    const shouldSync = mode !== 'standalone' && !!roomId;

    const handleRemoteSlideChange = useCallback(
        (slide: number, step: number) => {
            navigation.goToSlide(slide);
            // Note: gérer le step nécessite une modification de useSlidesNavigation
        },
        [navigation]
    );

    const {isConnected, viewersCount, broadcastSlideChange} = useSlideSync({
        mode: shouldSync ? mode : 'presenter', // fallback si pas de sync
        onSlideChange: handleRemoteSlideChange,
    });

    // Broadcast les changements si mode presenter
    useEffect(() => {
        if (shouldSync && mode === 'presenter') {
            broadcastSlideChange(navigation.currentSlide, navigation.currentStep);
        }
    }, [
        shouldSync,
        mode,
        navigation.currentSlide,
        navigation.currentStep,
        broadcastSlideChange,
    ]);

    // Navigation clavier - désactivée pour les viewers
    useKeyboardNav({
        next: mode === 'viewer' ? () => {
        } : navigation.nextSlide,
        prev: mode === 'viewer' ? () => {
        } : navigation.prevSlide,
        toggleFullscreen,
    });

    // Détection mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const registerSteps = useCallback(
        (steps: number) => {
            navigation.registerSteps(navigation.currentSlide, steps);
        },
        [navigation]
    );

    return (
        <SlidesContext.Provider
            value={{
                ...navigation,
                registerSteps,
                currentNotes: notes,
                showNotes,
                setShowNotes,
                isFullscreen,
                toggleFullscreen,
                isMobile,
                mode,
                isConnected: shouldSync ? isConnected : true,
                viewersCount: shouldSync ? viewersCount : 0,
            }}
        >
            <div ref={containerRef}>{children}</div>
        </SlidesContext.Provider>
    );
}