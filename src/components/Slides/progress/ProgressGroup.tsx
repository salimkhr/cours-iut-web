import React from "react";
import {cn} from "@/lib/utils";
import {ProgressPoint} from "./ProgressPoint";

interface ProgressGroupProps {
    isCurrentSlide: boolean;
    steps: number;
    sIdx: number;
    currentSlide: number;
    currentStep: number;
    isDark: boolean;
    activeRef: React.RefObject<HTMLDivElement | null>;
}

export const ProgressGroup: React.FC<ProgressGroupProps> = ({
                                                         isCurrentSlide,
                                                         steps,
                                                         sIdx,
                                                         currentSlide,
                                                         currentStep,
                                                         isDark,
                                                         activeRef
                                                     }) => (
    <div
        className={cn(
            "flex flex-col items-center gap-1.5 p-1.5 rounded-full border transition-colors duration-300",
            isCurrentSlide
                ? "border-primary/40 bg-primary/5"
                : "border-transparent"
        )}
    >
        {Array.from({ length: steps }).map((_, stepIdx) => {
            const isActive = currentSlide === sIdx && currentStep === stepIdx;
            const isPast = sIdx < currentSlide || (sIdx === currentSlide && stepIdx < currentStep);

            return (
                <ProgressPoint
                    key={`${sIdx}-${stepIdx}`}
                    ref={isActive ? activeRef : null}
                    isActive={isActive}
                    isPast={isPast}
                    isDark={isDark}
                />
            );
        })}
    </div>
);
