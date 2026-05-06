'use client';

import {ReactNode, useMemo} from "react";
import TagsBadges from "@/components/page/TagsBadges";
import {Particles} from "@/components/magicui/particles";
import {useMounted} from "@/hook/useMounted";
import {useIsDark} from "@/hook/useIsDark";

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
                                        imagePath,
                                        imageAlt,
                                        children,
                                        icon,
                                        tags = [],
                                        path = ''
                                    }: HeroSectionProps) {
    const mounted = useMounted();
    const isDark = useIsDark();

    const color = useMemo(() => {
        if (!mounted || typeof window === 'undefined') return "";
        const root = getComputedStyle(document.documentElement);
        return root.getPropertyValue(`--color-${path}`).trim();
    }, [mounted, path]);

    const isHome = !path;
    const heroImage = isHome
        ? (isDark ? '/images/header/pont-dark.png' : '/images/header/pont-light.png')
        : imagePath;
    const particleColor = color || '#94a3b8';

    return (
        <section
            role="img"
            aria-label={imageAlt}
            className="relative w-full bg-no-repeat bg-right-bottom bg-contain lg:min-h-[70vh] overflow-hidden border-b border-brand-dark/15 dark:border-brand-light/15 -mt-(--navbar-h)"
            style={{backgroundImage: `url(${heroImage})`}}
        >
            {!isHome && (
                <Particles
                    className="absolute inset-0 -z-10"
                    quantity={70}
                    color={particleColor}
                    ease={60}
                />
            )}

            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-brand-light via-brand-light/85 to-transparent dark:from-brand-dark dark:via-brand-dark/85 dark:to-transparent z-0"
            />

            <div
                className="relative z-10 flex flex-col items-center lg:items-start justify-center px-6 lg:pl-12 lg:pr-6 py-16 lg:py-24 lg:min-h-[70vh] opacity-0 animate-fade-in">
                <div className="w-full">
                    {icon && <div className="mb-4">{icon}</div>}

                    <h1 className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[0.95] text-center lg:text-left text-brand-dark dark:text-brand-light whitespace-nowrap">
                        {title}
                        <span className="text-brand-primary">.</span>
                    </h1>

                    <span aria-hidden="true" className="block w-16 h-1 bg-brand-primary rounded-full mt-6 mx-auto lg:mx-0"/>

                    {description && (
                        <p className="mt-5 text-base lg:text-lg leading-relaxed text-brand-gray-700 dark:text-brand-gray-300 text-center lg:text-left">
                            {description}
                        </p>
                    )}

                    {children && <div className="mt-7 w-full flex justify-center lg:justify-start">{children}</div>}

                    {tags.length > 0 && (
                        <div className="mt-6 w-full flex justify-center lg:justify-start">
                            <TagsBadges tags={tags} moduleTheme={title}/>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
