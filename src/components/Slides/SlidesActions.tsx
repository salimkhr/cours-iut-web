'use client';

import {ChevronLeft, ChevronRight, Maximize, MessageSquare, Minimize} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useState} from "react";
import {useSlides} from "@/components/Slides/context/SlidesContext";

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
    } = useSlides();

    const [hovered, setHovered] = useState(false);
    const hasNotes = !!currentNotes;

    if (isMobile) return null;

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
                    hovered ? "opacity-100 bg-background/70" : "opacity-0 bg-background/40"
                )}
            >
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
