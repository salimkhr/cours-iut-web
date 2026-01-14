'use client';
import React, {useEffect, useMemo} from 'react';
import CodeCard, {CodeCardProps} from "@/components/Cards/CodeCard";
import {cn} from "@/lib/utils";
import {useSlides} from "../SlidesContext";

interface SlideCodeProps extends CodeCardProps {
    size?: "default" | "large" | "xl";
    highlight?: string;
}

export const SlideCode: React.FC<SlideCodeProps> = ({
                                                      className,
                                                      size = "xl",
                                                      highlight,
                                                      ...props
                                                    }) => {
  const { currentStep, registerSteps } = useSlides();
  const fontSize = size === "xl" ? "2rem" : size === "large" ? "1.75rem" : "1.5rem";
  const lineHeight = size === "large" ? "2rem" : "1.75rem";
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!currentHighlight || !scrollContainerRef.current) return;

    const firstHighlightedLine = currentHighlight.split(',')[0].split('-')[0].trim();
    const lineNumber = parseInt(firstHighlightedLine);

    if (isNaN(lineNumber)) return;

    const container = scrollContainerRef.current;
    const lineHeightPx = parseFloat(lineHeight) * 16; // Convert rem to px
    const targetScroll = (lineNumber - 3) * lineHeightPx; // Scroll 3 lines before for context

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }, [currentHighlight, lineHeight]);

  return (
      <div className={cn("my-6 w-full slide-code-container overflow-hidden", className)}>
        <div ref={scrollContainerRef} className="max-h-[75vh] overflow-y-auto custom-scrollbar">
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