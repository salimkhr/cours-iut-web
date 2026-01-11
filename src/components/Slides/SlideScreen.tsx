'use client';
import React from 'react';
import {SlideHeading} from "./ui/SlideHeading";
import {SlideNote} from "./ui/SlideNote";

export interface SlideScreenProps {
  title: string;
  children: React.ReactNode;
}

export const SlideScreen: React.FC<SlideScreenProps> = ({ title, children }) => {
  // Filtrer les enfants pour ne pas afficher le composant SlideNote dans le flux principal
  const filteredChildren = React.Children.toArray(children).filter(child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      const isSlideNote = child.type === SlideNote || (child.type as any)?.displayName === 'SlideNote' || (child.type as any)?.name === 'SlideNote';
      return !isSlideNote;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full mx-auto p-12 md:p-16 lg:p-24 bg-card text-card-foreground overflow-y-auto">
      <header className="mb-12 mt-4 p-6">
        <SlideHeading level={1}>
          {title}
        </SlideHeading>
      </header>
      
      <div className="flex-1 space-y-10 p-6" style={{width: '98vw'}}>
        {filteredChildren}
      </div>
    </div>
  );
};
