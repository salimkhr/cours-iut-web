'use client';

import {useEffect, useRef} from "react";
import {ProgressGroup} from "./progress/ProgressGroup";
import {useSlides} from "@/components/Slides/context/SlidesContext";

export const SlidesProgress = () => {
    const {slidesCount, currentSlide, currentStep, slideSteps} = useSlides();
    const activeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        activeRef.current?.scrollIntoView({block: "center", behavior: "smooth"});
    }, [currentSlide, currentStep]);

    return (
        <div className="absolute right-2 top-0 bottom-0 flex items-center z-50">
            <div className="flex flex-col gap-2 max-h-[90vh] overflow-y-auto p-1 rounded-full border border-bridge-500/40 bg-bridge-50/85 dark:bg-bridge-800/85 backdrop-blur-sm">
                {Array.from({length: slidesCount}).map((_, sIdx) => (
                    <ProgressGroup
                        key={sIdx}
                        sIdx={sIdx}
                        steps={(slideSteps[sIdx] || 0) + 1}
                        currentSlide={currentSlide}
                        currentStep={currentStep}
                        activeRef={currentSlide === sIdx ? activeRef : undefined}
                        isCurrentSlide={sIdx === currentSlide} // ✅ add this
                    />
                ))}
            </div>
        </div>
    );
};
