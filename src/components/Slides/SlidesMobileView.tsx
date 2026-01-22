'use client';

import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Maximize, Minimize} from "lucide-react";
import {useSlides} from "@/components/Slides/context/SlidesContext";
import {NotesRenderer} from "@/components/Slides/ui/NotesRenderer";


export const SlidesMobileView = () => {
    const {
        currentSlide,
        currentStep,
        slideSteps,
        slidesCount,
        currentNotes,
        prevSlide,
        nextSlide,
        toggleFullscreen,
        isFullscreen,
    } = useSlides();

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b text-sm font-bold uppercase">
                Slide {currentSlide + 1} / {slidesCount}
            </div>

            {/* Notes */}
            <div className="flex-1 overflow-y-auto p-6 pb-40">
                {currentNotes ? (
                    <NotesRenderer notes={currentNotes} variant="mobile"/>
                ) : (
                    <div className="italic text-muted-foreground text-center">
                        Aucune note
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t flex gap-4">
                <Button onClick={prevSlide} disabled={currentSlide === 0 && currentStep === 0}>
                    <ChevronLeft/>
                </Button>

                <Button onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize/> : <Maximize/>}
                </Button>

                <Button
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
