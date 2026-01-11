'use client';

import React from 'react';

interface SlideNoteProps {
  children: React.ReactNode;
  className?: string;
}

export const SlideNote: React.FC<SlideNoteProps> = ({ children, className }) => {
  return null; // Ne rien afficher directement, les notes sont gérées par le contexte
};

SlideNote.displayName = 'SlideNote';
