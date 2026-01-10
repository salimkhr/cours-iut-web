'use client';
import React from 'react';
import {SlideHeading} from "./ui/SlideHeading";

export interface SlideScreenProps {
  title: string;
  children: React.ReactNode;
}

export const SlideScreen: React.FC<SlideScreenProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col h-full w-full mx-auto p-12 md:p-16 lg:p-24 bg-card text-card-foreground overflow-y-auto">
      <header className="mb-12 mt-4 p-6">
        <SlideHeading level={1}>
          {title}
        </SlideHeading>
      </header>
      
      <div className="flex-1 space-y-10 p-6" style={{width: '98vw'}}>
        {children}
      </div>
    </div>
  );
};
