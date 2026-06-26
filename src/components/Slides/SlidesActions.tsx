'use client';

import {ChevronLeft, ChevronRight, Maximize, MessageSquare, Minimize, StopCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useState} from "react";
import {useSlides} from "@/components/Slides/context/SlidesContext";
import {LaptopMinimalCheckIcon} from "@/components/icons/laptop-minimal-check";

export const SlidesActions = ({className}: { className?: string }) => {
    const {
        currentSlide,
        currentStep,
        slidesCount,
        slideSteps,
        isFullscreen,
        toggleFullscreen,
        prevSlide,
        nextSlide,
        showNotes,
        setShowNotes,
        currentNotes,
        isMobile,
        live,
        startPresenting,
        stopPresenting,
    } = useSlides();

    const [hovered, setHovered] = useState(false);
    const hasNotes = !!currentNotes;

    if (isMobile) return null;

    const isLive = live?.isLive ?? false;
    const isDrifted = live && !live.isPresenter && (live.paused || live.drift.direction !== "synced");

    return (
        <div
            className={cn(
                "absolute bottom-4 left-0 w-full flex justify-center z-50",
                className
            )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border backdrop-blur-md transition-opacity",
                    hovered ? "opacity-100 bg-background/70" : "opacity-40 bg-background/40"
                )}
            >
                {/* Contrôles live */}
                {isLive ? (
                    <>
                        <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-red-500">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"/>
                            {live!.isPresenter
                                ? "En direct"
                                : (live!.presenterName ?? "En direct")}
                        </div>

                        {isDrifted && (
                            <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={live!.resync}>
                                Rejoindre
                            </Button>
                        )}

                        {live!.isPresenter && (
                            <Button size="icon" variant="ghost" onClick={stopPresenting} title="Arrêter la présentation">
                                <StopCircle className="text-red-500"/>
                            </Button>
                        )}

                        <div className="w-px h-6 bg-border/50"/>
                    </>
                ) : startPresenting ? (
                    <>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={startPresenting}
                            title="Démarrer la présentation en direct"
                        >
                            <LaptopMinimalCheckIcon size={18}/>
                        </Button>
                        <div className="w-px h-6 bg-border/50"/>
                    </>
                ) : null}

                <Button
                    size="icon"
                    variant="ghost"
                    disabled={!hasNotes}
                    onClick={() => setShowNotes(!showNotes)}
                >
                    <MessageSquare/>
                </Button>

                <div className="w-px h-6 bg-border/50"/>

                <Button size="icon" variant="ghost" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize/> : <Maximize/>}
                </Button>

                <div className="w-px h-6 bg-border/50"/>

                <Button
                    size="icon"
                    variant="ghost"
                    onClick={prevSlide}
                    disabled={currentSlide === 0 && currentStep === 0}
                >
                    <ChevronLeft/>
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    onClick={nextSlide}
                    disabled={
                        currentSlide === slidesCount - 1 &&
                        currentStep === (slideSteps[currentSlide] || 0)
                    }
                >
                    <ChevronRight/>
                </Button>
            </div>
        </div>
    );
};
