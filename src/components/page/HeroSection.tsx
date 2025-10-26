"use client";

import Image from "next/image";
import {GlitchText} from "@/components/GlitchText";
import {ReactNode} from "react";
import TagsBadges from "@/components/page/TagsBadges";
import {useTheme} from "next-themes";

interface HeroSectionProps {
    title: string;
    description?: string;
    imagePath: string;
    imageAlt: string;
    children?: ReactNode;
    tags?: string[];
    icon?: ReactNode;
}

export default function HeroSection({
                                        title,
                                        description,
                                        imagePath,
                                        imageAlt,
                                        children,
                                        icon,
                                        tags = [],
                                    }: HeroSectionProps) {
    const { theme } = useTheme();
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
                <Image
                    src={imagePath}
                    alt={imageAlt}
                    width={1200}
                    height={1200}
                    className="w-full h-auto max-w-xs lg:max-w-sm hover:scale-105 transition-transform duration-300"
                    style={{
                        marginBottom: imagePath.includes("header.svg") ? "-20px" : "0",
                        zIndex: 100,
                    }}
                    priority
                />
            </div>
        </section>
    );
}
