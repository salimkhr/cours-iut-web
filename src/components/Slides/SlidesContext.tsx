import {createContext, useContext} from 'react';

export interface SlidesContextType {
  // Navigation state
  currentSlide: number;
  currentStep: number;
  slidesCount: number;
  slideSteps: Record<number, number>;

  // Navigation actions
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;

  // Steps management
  registerSteps: (steps: number) => void;

  // Notes management
  currentNotes: string | null;
  setNotes: (notes: string | null) => void;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;

  // UI state
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isMobile: boolean;
}

export const SlidesContext = createContext<SlidesContextType | undefined>(undefined);

export const useSlides = () => {
  const context = useContext(SlidesContext);
  if (!context) {
    throw new Error('useSlides must be used within a SlidesScreen');
  }
  return context;
};
