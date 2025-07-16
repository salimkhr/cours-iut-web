'use client';

import React from 'react';

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ children, className = '' }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 w-full h-full text-red-500 opacity-0 hover:opacity-70 transform translate-x-1 transition-all duration-100"
        aria-hidden="true"
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 w-full h-full text-blue-500 opacity-0 hover:opacity-70 transform -translate-x-1 transition-all duration-100"
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
};