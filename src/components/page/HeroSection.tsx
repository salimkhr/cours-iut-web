'use client';

import {ReactNode, useMemo} from "react";
import TagsBadges from "@/components/page/TagsBadges";
import {HeaderSvg} from "@/components/HeaderSvg";
import {useMounted} from "@/hook/useMounted";

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
                                        path = ''
                                    }: HeroSectionProps) {
    const mounted = useMounted();

    const color = useMemo(() => {
        if (!mounted || typeof window === 'undefined') return "";
        const root = getComputedStyle(document.documentElement);
        return root.getPropertyValue(`--color-${path}`).trim();
    }, [mounted, path]);

    return (
        <section
            className="relative w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between lg:px-6 gap-4 lg:gap-6 lg:min-h-[45vh]">
            <div className="flex flex-col items-center justify-center w-full lg:w-2/3 opacity-0 animate-fade-in">
                <div className="flex flex-col items-center justify-center w-full mt-10">
                    {icon ?? <></>}
                    <h1 className="text-[clamp(2.25rem,6vw,6rem)] font-extrabold tracking-[-0.02em] leading-[1.05] mt-10 lg:mb-4 text-center">
                        {title}
                    </h1>
                </div>

                {description && (
                    <p className="text-base sm:text-lg text-center max-w-2xl leading-relaxed text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                )}

                <div className="my-4">{children}</div>

                <TagsBadges tags={tags} moduleTheme={title}/>
            </div>

            <div className="hidden lg:flex items-center justify-center w-full lg:w-1/3 opacity-0 animate-fade-in-right">
                <HeaderSvg size={500} color={color}/>
            </div>
        </section>
    );
}
