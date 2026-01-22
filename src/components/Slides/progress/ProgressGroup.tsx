import React, {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {ProgressPoint} from "./ProgressPoint";
import {useTheme} from "next-themes";

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

    const {theme} = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const isDark = theme === 'dark';
    return (
        <div
            className={cn(
                "flex flex-col items-center gap-1 p-0.5 rounded-full border",
                isCurrentSlide
                    ? "border-primary/30 bg-primary/5"
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
                        isDark={isDark}
                    />
                );
            })}
        </div>
    );
};