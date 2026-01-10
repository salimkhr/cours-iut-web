import {createContext, useContext} from 'react';

export interface SlidesContextType {
  currentStep: number;
  registerSteps: (steps: number) => void;
}

export const SlidesContext = createContext<SlidesContextType | undefined>(undefined);

export const useSlides = () => {
  const context = useContext(SlidesContext);
  if (!context) {
    throw new Error('useSlides must be used within a SlidesScreen');
  }
  return context;
};
