'use client';

import React, {useMemo} from 'react';
import {GlitchText} from "@/components/GlitchText";
import {FooterSvg} from "@/components/FooterSvg";
import Module from "@/types/Module";
import Section from "@/types/Section";
import TagsBadges from "@/components/page/TagsBadges";
import {SlideHeading} from "@/components/Slides/ui/SlideHeading";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";
import {useIsDark} from "@/hook/useIsDark";
import {useMounted} from "@/hook/useMounted";

interface SlideTitleProps {
    module: Module;
    section: Section;
}

export const SlideTitle: React.FC<SlideTitleProps> = ({module, section}) => {
    const mounted = useMounted();
    const isDark = useIsDark();

    const color = useMemo(() => {
        if (!mounted) return "currentColor";
        const root = getComputedStyle(document.documentElement);
        const value = root.getPropertyValue(`--color-${module.path}`).trim();
        if (!value) return "currentColor";
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return value;
        }
        return `hsl(${value})`;
    }, [mounted, module.path]);

    if (!mounted) return null;

    return (
        <div
            className="relative flex flex-col w-full h-screen bg-linear-to-br from-background via-background to-background overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-16 py-12 relative z-10 mb-10">

                <div className="flex items-center gap-3 group">
                    <div className="flex flex-col">
                        <h3 className={slideTextSizes.title.module}>
                            {module.title}
                        </h3>
                    </div>
                </div>

                <div className="space-y-6 text-center max-w-5xl">
                    <GlitchText>
                        <SlideHeading level={2}>
                            {section.order ?? 1}/ {section.title}
                        </SlideHeading>
                    </GlitchText>

                    {section.description && (
                        <p className={`${slideTextSizes.title.description} max-w-3xl mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {section.description}
                        </p>
                    )}
                </div>

                {section.tags && section.tags.length > 0 && (
                    <div className="mt-10 mb-10">
                        <TagsBadges tags={section.tags} moduleTheme={module.title}/>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center pointer-events-none z-0">
                <FooterSvg size={700} color={color}/>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};