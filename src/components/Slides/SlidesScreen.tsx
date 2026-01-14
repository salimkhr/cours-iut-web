'use client'
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {cn} from "@/lib/utils";
import {SlidesProgress} from "./SlidesProgress";
import {SlidesActions} from "./SlidesActions";
import {SlidesContext} from "./SlidesContext";
import {SlideTitle} from "./ui/SlideTitle";

import Module from "@/types/module";
import Section from "@/types/Section";
import {useMediaQuery} from "@/hook/useMediaQuery";
import {SlidesMobileView} from "@/components/Slides/SlidesMobileView";

import {SlideNote} from "./ui/SlideNote";

interface SlidesScreenProps {
  children: React.ReactNode;
  module?: Module;
  section?: Section;
}

export const SlidesScreen: React.FC<SlidesScreenProps> = ({ children, module, section }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [slideSteps, setSlideSteps] = useState<Record<number, number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slides = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    if (module && section) {
      return [<SlideTitle key="title-slide" module={module} section={section} />, ...childrenArray];
    }
    return childrenArray;
  }, [children, module, section]);

  // Extraction automatique des notes de la slide courante
  useEffect(() => {
    const activeSlide = slides[currentSlide];
    let foundNotes: string | null = null;

    if (React.isValidElement(activeSlide)) {
      // @ts-ignore - On cherche SlideNote parmi les enfants de la slide
      const slideChildren = activeSlide.props.children;
      
      const checkIsNote = (child: any) => {
        if (!React.isValidElement(child)) return false;
        const type = child.type as any;
        return type === SlideNote || 
               type?.displayName === 'SlideNote' || 
               type?.name === 'SlideNote' ||
               (typeof type === 'string' && type === 'SlideNote');
      };

      const getNoteContent = (child: any): string | null => {
        if (!child || !child.props || child.props.children === undefined) return null;
        
        const extractText = (content: any): string => {
          if (content === null || content === undefined) return '';
          if (typeof content === 'string') return content;
          if (typeof content === 'number') return String(content);
          if (Array.isArray(content)) return content.map(extractText).join('');
          if (React.isValidElement(content)) {
            // @ts-ignore
            return extractText(content.props?.children);
          }
          return '';
        };

        // Si l'enfant direct est une chaîne ou un template literal (déjà géré par extractText)
        return extractText(child.props.children);
      };

      const processChildren = (childrenToProcess: any) => {
        if (!childrenToProcess) return;
        
        React.Children.forEach(childrenToProcess, (child) => {
          if (checkIsNote(child)) {
            foundNotes = getNoteContent(child);
          } else if (React.isValidElement(child)) {
            if (child.type === React.Fragment) {
              processChildren((child.props as any).children);
            } else if ((child.props as any)?.children) {
              // On ne descend pas dans les autres composants pour éviter de trouver des SlideNote 
              // qui ne sont pas des enfants directs de SlideScreen
            }
          }
        });
      };

      processChildren(slideChildren);
    }

    // Nettoyage des notes (dedent)
    if (foundNotes !== null) {
      const content = foundNotes as string;
      const lines = content.split('\n');
      
      // Si on utilise {` ... `}, la première et la dernière ligne sont souvent vides
      // On les supprime pour éviter des décalages inutiles
      let filteredLines = [...lines];
      if (filteredLines.length > 1 && filteredLines[0].trim() === '') filteredLines.shift();
      if (filteredLines.length > 0 && filteredLines[filteredLines.length - 1].trim() === '') filteredLines.pop();

      // On cherche l'indentation minimale sur les lignes non vides
      const meaningfulLines = filteredLines.filter(line => line.trim().length > 0);
      
      let cleanedNotes = '';
      if (meaningfulLines.length > 0) {
        const minIndent = meaningfulLines.reduce((min, line) => {
          const match = line.match(/^(\s*)/);
          const indent = match ? match[1].length : 0;
          return Math.min(min, indent);
        }, Infinity);
        
        cleanedNotes = filteredLines
          .map(line => {
            if (line.trim().length === 0) return '';
            return line.slice(minIndent === Infinity ? 0 : minIndent);
          })
          .join('\n');
      } else {
        cleanedNotes = content.trim();
      }

      setCurrentNotes(cleanedNotes || null);
    } else {
      setCurrentNotes(null);
    }
  }, [currentSlide, slides]);

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

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      setCurrentStep(0);
    }
  }, [slides.length]);

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

  if (!mounted) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[600px] w-full bg-muted/30 rounded-2xl p-4 border animate-pulse">
        <div className="text-muted-foreground italic">Chargement de la présentation...</div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return <div className="p-8 text-center">Aucune slide disponible.</div>;
  }

  return (
    <SlidesContext.Provider value={{
      // Navigation state
      currentSlide,
      currentStep,
      slidesCount: slides.length,
      slideSteps,

      // Navigation actions
      nextSlide,
      prevSlide,
      goToSlide,

      // Steps management
      registerSteps: (steps) => registerSteps(currentSlide, steps),

      // Notes management
      currentNotes,
      setNotes: setCurrentNotes,
      showNotes,
      setShowNotes,

      // UI state
      isFullscreen,
      toggleFullscreen,
      isMobile
    }}>
      <div 
        ref={containerRef}
        className={cn(
          "relative flex flex-col min-h-[600px] w-full transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 bg-background h-screen w-screen" : "bg-muted/30 rounded-2xl border",
          "[&:fullscreen]:bg-white"
        )}
      >
        {isMobile ? (
          <SlidesMobileView slides={slides} />
        ) : (
          <>
            {/* Barre de progression latérale */}
            <SlidesProgress />

            {/* Panneau de notes (Desktop uniquement) */}
            {showNotes && currentNotes && (
              <div className="absolute top-4 left-4 z-40 w-80 max-h-[70vh] overflow-y-auto bg-background/95 backdrop-blur-md p-6 rounded-2xl border border-border shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-sm font-semibold mb-4 text-primary uppercase tracking-wider">Notes de présentation</h3>
                <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
                  {currentNotes.split('\n').map((line, idx) => {
                    const trimmedLine = line.trim();

                    // Ligne vide
                    if (!trimmedLine) {
                      return <div key={idx} className="h-1" />;
                    }

                    // Liste avec tiret
                    if (trimmedLine.startsWith('-')) {
                      return (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="text-primary font-bold shrink-0">•</span>
                          <span className="flex-1">{trimmedLine.substring(1).trim()}</span>
                        </div>
                      );
                    }

                    // Texte normal
                    return (
                      <p key={idx} className="italic">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contenu de la slide */}
            <div className={cn(
              "w-full h-full flex items-center justify-center transition-all duration-300",
              isFullscreen ? "p-5" : ""
            )}>
              {slides[currentSlide] || <div className="p-8 text-center">Slide non trouvée.</div>}
            </div>

            {/* Barre d'outils et de navigation combinée en bas */}
            <SlidesActions />

            {/* Barre de progression horizontale (bas de page) */}
            <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </SlidesContext.Provider>
  );
};
