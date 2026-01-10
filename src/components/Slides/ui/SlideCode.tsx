'use client';
import React, {useEffect, useMemo} from 'react';
import CodeCard, {CodeCardProps} from "@/components/Cards/CodeCard";
import {cn} from "@/lib/utils";
import {useSlides} from "../SlidesContext";

interface SlideCodeProps extends CodeCardProps {
  size?: "default" | "large";
  highlight?: string;
}

export const SlideCode: React.FC<SlideCodeProps> = ({ 
  className, 
  size = "default", 
  highlight,
  ...props 
}) => {
  const { currentStep, registerSteps } = useSlides();
  const fontSize = size === "large" ? "1.5rem" : "1.25rem";
  const lineHeight = size === "large" ? "2rem" : "1.75rem";

  const highlightGroups = useMemo(() => {
    if (!highlight) return [];
    return highlight.split('|').map(group => group.trim());
  }, [highlight]);

  useEffect(() => {
    if (highlightGroups.length > 0) {
      registerSteps(highlightGroups.length - 1);
    }
  }, [highlightGroups.length, registerSteps]);

  const currentHighlight = highlightGroups[currentStep] || "";

  return (
    <div className={cn("my-6 w-full slide-code-container overflow-hidden", className)}>
      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <CodeCard 
          {...props}
          highlightLines={currentHighlight}
        />
      </div>
      <style jsx global>{`
        .slide-code-container pre {
          font-size: ${fontSize} !important;
          line-height: ${lineHeight} !important;
          margin: 0 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 155, 155, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 155, 155, 0.7);
        }
      `}</style>
    </div>
  );
};
