'use client';

import {GlitchText} from "@/components/GlitchText";
import {ReactNode, useEffect, useState} from "react";
import TagsBadges from "@/components/page/TagsBadges";
import {useTheme} from "next-themes";
import {HeaderSvg} from "@/components/HeaderSvg";

interface HeroSectionProps {
    title: string;
    description?: string;
    imagePath: string;
    imageAlt: string;
    children?: ReactNode;
    tags?: string[];
    icon?: ReactNode;
    path?: string;
}

export default function HeroSection({
                                        title,
                                        description,
                                        children,
                                        icon,
                                        tags = [],
                                        path=''
                                    }: HeroSectionProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const variableName = `--color-${path}`;

    const [color, setColor] = useState<string>("");

    console.log(variableName,color);

    useEffect(() => {
        const root = getComputedStyle(document.documentElement);
        const value = root.getPropertyValue(variableName).trim();
        setColor(value);
    }, [variableName]);

    if (!mounted) return null; // SSR safe


    const isDark = theme === "dark";

    const titleElement = (
        <h1
            className={`text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold mt-10 lg:mb-4 text-center bg-clip-text ${
                isDark
                    ? "text-gray-200 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400"
                    : "text-gray-800 bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400"
            }`}
        >
            {title}
        </h1>
    );

    return (
        <section className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between p-4 lg:px-6 gap-4 lg:gap-6 lg:min-h-[45vh]">
            <div className="flex flex-col items-center justify-center w-full lg:w-2/3 opacity-0 animate-fade-in">
                <GlitchText>
                    <div className="flex flex-col items-center justify-center w-full mt-10">
                        {icon ?? <></>}
                        {titleElement}
                    </div>
                </GlitchText>

                {description && (
                    <p
                        className={`text-base sm:text-lg text-center max-w-2xl leading-relaxed ${
                            isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                        {description}
                    </p>
                )}

                <div className="my-4">{children}</div>

                <TagsBadges tags={tags} moduleTheme={title} />
            </div>

            <div className="hidden lg:flex items-center justify-center w-full lg:w-1/3 opacity-0 animate-fade-in-right">
                <HeaderSvg size={500} color={color}/>
            </div>
        </section>
    );
}
