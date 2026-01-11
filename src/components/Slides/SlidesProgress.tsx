import {useEffect, useRef, useState} from "react";
import {useTheme} from "next-themes";
import {ProgressGroup} from "./progress/ProgressGroup";
import {useSlides} from "./SlidesContext";

export const SlidesProgress: React.FC = () => {
  const {
    slidesCount,
    currentSlide,
    currentStep,
    slideSteps
  } = useSlides();

  const activeRef = useRef<HTMLDivElement>(null);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentSlide, currentStep]);

  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";

  const isDark = currentTheme === "dark";

  return (
    <div className="absolute right-2 top-0 bottom-0 flex items-center z-[60] pointer-events-none">
      <div className="flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-hide items-center p-1 pointer-events-auto bg-background/80 backdrop-blur-md rounded-full border border-border/50 shadow-2xl">
        {Array.from({ length: slidesCount }).map((_, sIdx) => {
          const steps = (slideSteps[sIdx] || 0) + 1;
          const isCurrentSlide = currentSlide === sIdx;

          return (
            <ProgressGroup
              key={sIdx}
              sIdx={sIdx}
              steps={steps}
              isCurrentSlide={isCurrentSlide}
              currentSlide={currentSlide}
              currentStep={currentStep}
              isDark={isDark}
              activeRef={activeRef}
            />
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
