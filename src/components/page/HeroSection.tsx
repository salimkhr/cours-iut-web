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
                <div className="max-w-[600px]">
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

            {/* DECORATIVE LAYERS - BALANCED COMPOSITION (right column, diagonal triangle) */}
            <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">

                {/* LARGE BACK GLOW — top-right corner ambient */}
                <div className="
        absolute
        w-[520px] h-[520px]
        rounded-full
        bg-[#F59E0B]
        opacity-10
        blur-3xl
        top-[-18%] right-[-12%]
    "/>

                {/* PRIMARY ORANGE — upper focal point (rule-of-thirds intersection) */}
                <div className="
        absolute
        w-[300px] h-[300px]
        rounded-full
        bg-brand-primary
        opacity-70
        top-[12%] right-[-6%]
    "/>

                {/* SECONDARY DEPTH — bottom anchor, mirrors primary across diagonal */}
                <div className="
        absolute
        w-[420px] h-[420px]
        rounded-full
        bg-[#F59E0B]
        opacity-15
        bottom-[-22%] right-[-8%]
    "/>

                {/* SMALL CONTRAST — completes the visual triangle (mid-left of right column) */}
                <div className="
        absolute
        w-[120px] h-[120px]
        rounded-full
        bg-brand-dark-soft
        opacity-70
        bottom-[22%] right-[28%]
    "/>

                {/* DIRECTION LINES — connect the triangle vertices */}
                <div className="
        absolute
        top-[28%] right-[18%]
        w-0.5 h-40
        bg-brand-primary
        opacity-30
        rotate-20
    "/>

                <div className="
        absolute
        bottom-[30%] right-[12%]
        w-px h-[120px]
        bg-brand-primary
        opacity-20
        -rotate-30
    "/>

                {/* MID-COLUMN BRIDGE — subtle fillers between text (left) and image (right) */}
                {/* soft blurred glow to fill the void without distracting */}
                <div className="
        hidden lg:block
        absolute
        left-1/2 top-1/2
        -translate-x-1/2 -translate-y-1/2
        w-[380px] h-[380px]
        rounded-full
        bg-brand-primary
        opacity-[0.04]
        blur-3xl
    "/>

                {/* tiny dot cluster — adds texture, feels intentional */}
                <div className="hidden lg:block absolute top-[28%] left-[48%] w-1.5 h-1.5 rounded-full bg-brand-primary opacity-40"/>
                <div className="hidden lg:block absolute top-[40%] left-[52%] w-1 h-1 rounded-full bg-brand-dark-soft opacity-30"/>
                <div className="hidden lg:block absolute top-[58%] left-[46%] w-2 h-2 rounded-full bg-brand-primary opacity-25"/>
                <div className="hidden lg:block absolute top-[70%] left-[54%] w-1 h-1 rounded-full bg-brand-dark-soft opacity-30"/>

                {/* MID-SIZED CIRCLES — between text and the dark contrast circle (subtle blur, visible shape) */}
                <div className="
        hidden lg:block
        absolute
        bottom-[35%] right-[42%]
        w-20 h-20
        rounded-full
        bg-brand-primary
        opacity-30
        blur-sm
    "/>

                <div className="
        hidden lg:block
        absolute
        bottom-[18%] right-[48%]
        w-[60px] h-[60px]
        rounded-full
        bg-brand-dark-soft
        opacity-35
        blur-xs
    "/>

                <div className="
        hidden lg:block
        absolute
        bottom-[42%] right-[55%]
        w-10 h-10
        rounded-full
        bg-brand-primary
        opacity-40
        blur-xs
    "/>

                {/* faint diagonal hairline — visually links text zone to image zone */}
                <div className="
        hidden lg:block
        absolute
        top-1/2 left-[44%]
        w-[180px] h-px
        bg-linear-to-r from-transparent via-brand-primary/25 to-transparent
        rotate-15
    "/>

            </div>
        </section>
    );
}
