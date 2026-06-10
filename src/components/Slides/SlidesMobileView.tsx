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

    const maxStep = slideSteps[currentSlide] || 0;

    return (
        <div className="flex flex-col h-full relative bg-bridge-50 dark:bg-bridge-900">
            {/* Header */}
            <div
                className="px-6 py-3 border-b text-sm font-bold uppercase bg-bridge-50/80 dark:bg-bridge-900/80 backdrop-blur-sm sticky top-0 z-10">
                Slide {currentSlide + 1} / {slidesCount}
            </div>

            {/* Notes */}
            <div className="flex-1 overflow-y-auto p-6 pb-[calc(8rem+env(safe-area-inset-bottom,0px))]">
                {currentNotes ? (
                    <NotesRenderer notes={currentNotes} variant="mobile"/>
                ) : (
                    <div className="italic text-muted-foreground text-center">
                        Aucune note
                    </div>
                )}
            </div>

            {/* Controls */}
            <div
                className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm border-t z-20 flex flex-col gap-3">
                {/* Ligne du haut : Précédent + Fullscreen */}
                <div className="flex gap-3">
                    <Button
                        onClick={prevSlide}
                        disabled={currentSlide === 0 && currentStep === 0}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="outline"
                    >
                        <ChevronLeft/> Précédent
                    </Button>

                    <Button
                        onClick={toggleFullscreen}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="outline"
                    >
                        {isFullscreen ? <Minimize/> : <Maximize/>}
                        {isFullscreen ? "Réduire" : "Fullscreen"}
                    </Button>
                </div>

                {/* Gros bouton en dessous : Suivant */}
                <Button
                    onClick={nextSlide}
                    disabled={currentSlide === slidesCount - 1 && currentStep === maxStep}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-lg font-bold py-6"
                >
                    Suivant<ChevronRight/>
                </Button>
            </div>
        </div>
    );
};
