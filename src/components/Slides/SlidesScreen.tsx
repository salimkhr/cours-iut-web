'use client'
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {cn} from "@/lib/utils";
import {SlidesProgress} from "./SlidesProgress";
import {SlidesActions} from "./SlidesActions";
import {SlidesContext} from "./SlidesContext";

interface SlidesScreenProps {
  children: React.ReactNode;
}

export const SlidesScreen: React.FC<SlidesScreenProps> = ({ children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [slideSteps, setSlideSteps] = useState<Record<number, number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = React.Children.toArray(children);

  const registerSteps = useCallback((slideIndex: number, steps: number) => {
    setSlideSteps(prev => {
      if (prev[slideIndex] === steps) return prev;
      return { ...prev, [slideIndex]: steps };
    });
  }, []);

  const nextSlide = useCallback(() => {
    const maxSteps = slideSteps[currentSlide] || 0;
    
    if (currentStep < maxSteps) {
      setCurrentStep(prev => prev + 1);
    } else if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setCurrentStep(0);
    }
  }, [currentSlide, currentStep, slideSteps, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (currentSlide > 0) {
      const prevSlideIndex = currentSlide - 1;
      setCurrentSlide(prevSlideIndex);
      // Quand on revient en arrière, on se met à la dernière étape de la slide précédente
      setCurrentStep(slideSteps[prevSlideIndex] || 0);
    }
  }, [currentSlide, currentStep, slideSteps]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [nextSlide, prevSlide]);

  if (!slides || slides.length === 0) {
    return <div className="p-8 text-center">Aucune slide disponible.</div>;
  }

  return (
    <SlidesContext.Provider value={{ currentStep, registerSteps: (steps) => registerSteps(currentSlide, steps) }}>
      <div 
        ref={containerRef}
        className={cn(
          "relative flex flex-col items-center justify-center min-h-[600px] w-full transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 bg-background h-screen w-screen" : "bg-muted/30 rounded-2xl p-4 border",
          "[&:fullscreen]:bg-white"
        )}
      >
        {/* Barre de progression latérale */}
        <SlidesProgress 
          slidesCount={slides.length}
          currentSlide={currentSlide}
          currentStep={currentStep}
          slideSteps={slideSteps}
        />

        {/* Contenu de la slide */}
        <div className={cn(
          "w-full h-full flex items-center justify-center transition-all duration-300 pr-12",
          isFullscreen ? "p-10 md:p-16 lg:p-20 lg:pr-32" : ""
        )}>
          {slides[currentSlide] || <div className="p-8 text-center">Slide non trouvée.</div>}
        </div>

        {/* Barre d'outils et de navigation combinée en bas */}
        <SlidesActions 
          currentSlide={currentSlide}
          currentStep={currentStep}
          slidesCount={slides.length}
          isFullscreen={isFullscreen}
          slideSteps={slideSteps}
          onPrev={prevSlide}
          onNext={nextSlide}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Barre de progression horizontale (bas de page) */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>
    </SlidesContext.Provider>
  );
};
