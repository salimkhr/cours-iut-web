'use client'
import React from 'react';
import {ChevronLeft, ChevronRight, Maximize, Minimize} from 'lucide-react';
import {Button} from "@/components/ui/button";

interface SlidesActionsProps {
  currentSlide: number;
  currentStep: number;
  slidesCount: number;
  isFullscreen: boolean;
  slideSteps: Record<number, number>;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
}

export const SlidesActions: React.FC<SlidesActionsProps> = ({
  currentSlide,
  currentStep,
  slidesCount,
  isFullscreen,
  slideSteps,
  onPrev,
  onNext,
  onToggleFullscreen
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-12 flex items-center justify-end px-8 z-10 gap-4">
      <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-1 rounded-lg border border-border/20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleFullscreen}
          title="Plein écran (F11)"
          className="h-9 w-9"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        
        <div className="w-px h-6 bg-border/50 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          disabled={currentSlide === 0 && currentStep === 0}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={currentSlide === slidesCount - 1 && currentStep === (slideSteps[currentSlide] || 0)}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
