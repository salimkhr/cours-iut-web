'use client';

import React, {useEffect, useState} from 'react';
import {GlitchText} from "@/components/GlitchText";
import {FooterSvg} from "@/components/FooterSvg";
import {useTheme} from "next-themes";
import iconMap from "@/lib/iconMap";
import {BookOpen} from "lucide-react";
import Module from "@/types/module";
import Section from "@/types/Section";
import TagsBadges from "@/components/page/TagsBadges";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideHeading} from "@/components/Slides/ui/SlideHeading";

interface SlideTitleProps {
    module: Module;
    section: Section;
}

export const SlideTitle: React.FC<SlideTitleProps> = ({ module, section }) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [color, setColor] = useState<string>("currentColor");

    useEffect(() => {
        setMounted(true);
        // Only run window-dependent code if mounted
        if (typeof window !== 'undefined') {
            const root = getComputedStyle(document.documentElement);
            const variableName = `--color-${module.path}`;
            const value = root.getPropertyValue(variableName).trim();

            if (value) {
                if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
                    setColor(value);
                } else {
                    setColor(`hsl(${value})`);
                }
            }
        }
    }, [module.path]);

    if (!mounted) return null;

    const isDark = theme === "dark";
    const IconComponent = iconMap[module.iconName] || BookOpen;

    return (
        <div className="relative flex flex-col w-full h-screen bg-gradient-to-br from-background via-background to-background overflow-hidden">

            {/* Main content container - centered vertically */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-16 py-12 relative z-10 mb-10">

                {/* Module badge - compact and elegant */}
                <div className="flex items-center gap-3 group">
                    {/* <div className="p-3 rounded-xl bg-card border border-primary/20 shadow-lg group-hover:shadow-xl transition-all duration-300"
                         style={{ borderColor: `${color}33` }}>
                        <IconComponent size={28} style={{ color }} />
                    </div>*/}
                    <div className="flex flex-col">
                        <SlideHeading level={1} className="text-lg font-bold tracking-wide">
                            {module.title}
                        </SlideHeading>
                    </div>
                </div>

                {/* Section title - hero */}
                <div className="space-y-6 text-center max-w-5xl">
                    <GlitchText>
                        <SlideHeading level={2}>
                            {section.order}/ {section.title}
                        </SlideHeading>
                    </GlitchText>

                    {section.description && (
                        <SlideText className={`text-xl md:text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed font-light ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {section.description}
                        </SlideText>
                    )}
                </div>

                {/* Tags */}
                {section.tags && section.tags.length > 0 && (
                    <div className="mt-10 mb-10">
                        <TagsBadges tags={section.tags} moduleTheme={module.title} />
                    </div>
                )}
            </div>

            {/* Footer SVG - fixed at bottom, full width */}
            <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center pointer-events-none z-0">
                <FooterSvg size={700} color={color}/>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};