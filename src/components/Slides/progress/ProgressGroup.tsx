import React from "react";
import {cn} from "@/lib/utils";
import {ProgressPoint} from "./ProgressPoint";
import {useMounted} from "@/hook/useMounted";

interface ProgressGroupProps {
    isCurrentSlide: boolean;
    steps: number;
    sIdx: number;
    currentSlide: number;
    currentStep: number;
    activeRef?: React.RefObject<HTMLDivElement | null>;
}

export const ProgressGroup: React.FC<ProgressGroupProps> = ({
                                                                isCurrentSlide,
                                                                steps,
                                                                sIdx,
                                                                currentSlide,
                                                                currentStep,
                                                                activeRef
                                                            }) => {

    const mounted = useMounted();
    if (!mounted) return null;
    return (
        <div
            className={cn(
                "flex flex-col items-center gap-1 p-0.5 rounded-full border",
                isCurrentSlide
                    ? "border-(--module-color)/35 dark:border-(--module-color-dark)/35"
                    : "border-transparent"
            )}
        >
            {Array.from({length: steps}).map((_, stepIdx) => {
                const isActive = currentSlide === sIdx && currentStep === stepIdx;
                const isPast = sIdx < currentSlide || (sIdx === currentSlide && stepIdx < currentStep);

                return (
                    <ProgressPoint
                        key={`${sIdx}-${stepIdx}`}
                        ref={isActive ? activeRef : null}
                        isActive={isActive}
                        isPast={isPast}
                    />
                );
            })}
        </div>
    );
};
