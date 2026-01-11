'use client'
import React from 'react';
import {ChevronLeft, ChevronRight, Maximize, Minimize, MessageSquare} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useSlides} from "./SlidesContext";

interface SlidesActionsProps {
  className?: string;
}

export const SlidesActions: React.FC<SlidesActionsProps> = ({ className }) => {
  const {
    currentSlide,
    currentStep,
    slidesCount,
    isFullscreen,
    slideSteps,
    showNotes,
    currentNotes,
    prevSlide,
    nextSlide,
    toggleFullscreen,
    setShowNotes,
    isMobile
  } = useSlides();

  const hasNotes = !!currentNotes;

  return (
    <div className={cn(
      "absolute bottom-4 left-0 right-12 flex items-center justify-end px-8 z-10 gap-4",
      isMobile && "relative bottom-auto left-auto right-auto px-0 justify-center",
      className
    )}>
      <div className={cn(
        "flex items-center gap-2 bg-background/50 backdrop-blur-sm p-1 rounded-lg border border-border/20 shadow-lg",
        isMobile && "bg-transparent backdrop-blur-none border-none shadow-none gap-4"
      )}>
        {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotes(!showNotes)}
              disabled={!hasNotes}
              title={showNotes ? "Masquer les notes" : "Afficher les notes"}
              className={cn(
                "h-9 w-9",
                showNotes && "text-primary bg-primary/10 hover:bg-primary/20"
              )}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border/50 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title="Plein écran (F11)"
              className="h-9 w-9"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            <div className="w-px h-6 bg-border/50 mx-1" />
          </>
        )}

        <Button
          variant={isMobile ? "outline" : "ghost"}
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0 && currentStep === 0}
          className={cn("h-9 w-9", isMobile && "rounded-full bg-background")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={isMobile ? "outline" : "ghost"}
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === slidesCount - 1 && currentStep === (slideSteps[currentSlide] || 0)}
          className={cn("h-9 w-9", isMobile && "rounded-full bg-background")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
