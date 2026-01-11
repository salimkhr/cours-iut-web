'use client'
import React from 'react';
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Maximize, Minimize} from "lucide-react";
import {useSlides} from "./SlidesContext";

interface SlidesMobileViewProps {
  slides: React.ReactNode[];
}

export const SlidesMobileView: React.FC<SlidesMobileViewProps> = ({ slides }) => {
  const {
    currentSlide,
    currentStep,
    slideSteps,
    currentNotes,
    isFullscreen,
    prevSlide,
    nextSlide,
    toggleFullscreen,
    slidesCount
  } = useSlides();

  return (
    <div className="flex flex-col w-full bg-background overflow-hidden font-sans">
      {/* 1. Barre d'infos en haut (Progression) */}
      <div className="bg-muted/30 border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tighter text-muted-foreground uppercase">
            Slide {currentSlide + 1} / {slidesCount}
          </span>
        </div>

        {slideSteps[currentSlide] > 0 && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
              Étape interne
            </span>
            <div className="flex gap-1">
              {Array.from({ length: slideSteps[currentSlide] + 1 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    i <= currentStep ? "bg-primary" : "bg-primary/20"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Notes de présentation (Zone centrale défilante) */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-40">
        <div className="max-w-prose mx-auto">
          {currentNotes ? (
            <div className="text-xl md:text-2xl lg:text-3xl text-foreground/90 leading-relaxed space-y-4">
              {currentNotes.split('\n').map((line, idx) => {
                const trimmedLine = line.trim();

                // Ligne vide
                if (!trimmedLine) {
                  return <div key={idx} className="h-2" />;
                }

                // Liste avec tiret
                if (trimmedLine.startsWith('-')) {
                  return (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-primary font-bold mt-1 shrink-0">•</span>
                      <span className="flex-1">{trimmedLine.substring(1).trim()}</span>
                    </div>
                  );
                }

                // Texte normal
                return (
                  <p key={idx} className="italic font-serif">
                    {line}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40 italic border-2 border-dashed border-muted rounded-3xl">
              <p className="text-lg text-center px-6">Aucune note pour cette slide.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Télécommande : Boutons d'action en bas (Fixés en bas) */}
      <div className="fixed bottom-20 left-0 right-0 bg-background/95 backdrop-blur-xl border-t p-6 pb-10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex gap-4 h-32 max-w-lg mx-auto">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0 && currentStep === 0}
            className="flex-1 h-full rounded-3xl border-2 flex flex-col gap-2 active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-10 w-10" />
            <span className="font-bold uppercase tracking-widest text-xs">Précédent</span>
          </Button>

          <Button
            variant="outline"
            onClick={toggleFullscreen}
            className="w-24 h-full rounded-3xl border-2 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {isFullscreen ? <Minimize className="h-8 w-8" /> : <Maximize className="h-8 w-8" />}
            <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Plein Écran</span>
          </Button>

          <Button
            variant="default"
            onClick={nextSlide}
            disabled={currentSlide === slidesCount - 1 && currentStep === (slideSteps[currentSlide] || 0)}
            className="flex-1 h-full rounded-3xl border-2 flex flex-col gap-2 active:scale-95 transition-transform shadow-xl shadow-primary/20"
          >
            <ChevronRight className="h-10 w-10" />
            <span className="font-bold uppercase tracking-widest text-xs">Suivant</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
