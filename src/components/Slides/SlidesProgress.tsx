'use client';

import {useEffect, useRef} from "react";
import {ProgressGroup} from "./progress/ProgressGroup";
import {useSlides} from "@/components/Slides/context/SlidesContext";

export const SlidesProgress = () => {
    const {slidesCount, currentSlide, currentStep, slideSteps} = useSlides();
    const railRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLDivElement>(null);

    // `scrollIntoView` remonte la chaîne des ancêtres scrollables et fait aussi
    // défiler le document : le titre de slide passait sous la navbar à chaque
    // changement. On ne scrolle donc que le rail lui-même.
    useEffect(() => {
        const rail = railRef.current;
        const active = activeRef.current;
        if (!rail || !active) return;

        rail.scrollTo({
            top: active.offsetTop - rail.clientHeight / 2 + active.clientHeight / 2,
            behavior: "smooth",
        });
    }, [currentSlide, currentStep]);

    return (
        <div className="absolute right-2 top-0 bottom-0 flex items-center z-50">
            <div
                ref={railRef}
                className="relative flex flex-col gap-2.5 max-h-[90%] overflow-y-auto p-1.5 rounded-full border border-bridge-500/40 bg-bridge-50/85 dark:bg-bridge-800/85 backdrop-blur-sm"
            >
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
