'use client';

import {ReactNode, useMemo} from "react";
import Link from "next/link";
import {ChevronLeft} from "lucide-react";
import TagsBadges from "@/components/page/TagsBadges";
import {Particles} from "@/components/magicui/particles";
import {useMounted} from "@/hook/useMounted";
import {useIsDark} from "@/hook/useIsDark";
import {cn} from "@/lib/utils";

interface HeroSectionProps {
    title: string;
    description?: string;
    imagePath: string;
    imageAlt: string;
    children?: ReactNode;
    tags?: string[];
    icon?: ReactNode;
    path?: string;
    accentColor?: string;
    compact?: boolean;
    backHref?: string;
    backLabel?: string;
}

export default function HeroSection({
                                        title,
                                        description,
                                        imagePath,
                                        imageAlt,
                                        children,
                                        icon,
                                        tags = [],
                                        path = '',
                                        accentColor,
                                        compact = false,
                                        backHref,
                                        backLabel
                                    }: HeroSectionProps) {
    const mounted = useMounted();
    const isDark = useIsDark();

    const color = useMemo(() => {
        if (!mounted || typeof window === 'undefined') return "";
        const root = getComputedStyle(document.documentElement);
        return root.getPropertyValue(`--color-${path}`).trim();
    }, [mounted, path]);

    const isHome = !path;
    const useBridge = isHome || compact;
    const heroImage = useBridge
        ? (isDark ? '/images/header/pont-dark.png' : '/images/header/pont-light.png')
        : imagePath;
    const particleColor = color || '#94a3b8';

    return (
        <section
            aria-label={imageAlt}
            className={cn(
                "relative w-full bg-no-repeat bg-right-bottom bg-cover overflow-hidden border-b border-brand-dark/15 dark:border-brand-light/15",
                compact
                    ? "min-h-[20dvh] sm:min-h-[26vh] lg:min-h-[34vh]"
                    : "min-h-[50dvh] sm:min-h-[60vh] lg:min-h-[80vh]"
            )}
            style={{backgroundImage: `url(${heroImage})`}}
        >
            {!isHome && (
                <Particles
                    className="pointer-events-none absolute inset-0 z-0 opacity-65"
                    quantity={70}
                    color={particleColor}
                    ease={60}
                />
            )}

            {/* Gradient overlay — solid left → transparent right (more aggressive on desktop) */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-b from-background via-background/90 to-background/60 dark:via-background/94 dark:to-background/72 lg:bg-linear-to-r lg:from-background lg:via-background/85 lg:to-transparent lg:dark:via-background/90 lg:dark:to-background/24 z-0"
            />

            {/* Ambient decoration — desktop only, subtle */}
            <div aria-hidden="true" className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[58%] opacity-35 bg-[repeating-linear-gradient(90deg,color-mix(in_srgb,var(--color-brand-primary)_12%,transparent)_0_1px,transparent_1px_72px)]"/>
                <div className="absolute left-12 top-[28%] h-px w-56 bg-linear-to-r from-brand-primary/35 to-transparent"/>
                <div className="absolute left-20 top-[64%] h-px w-72 bg-linear-to-r from-brand-primary/25 to-transparent"/>
            </div>

            <div
                className={cn(
                    "relative z-10 mx-auto w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between px-6 sm:px-8 md:px-10 lg:pl-12 lg:pr-6 opacity-0 animate-fade-in",
                    compact
                        ? "py-7 lg:py-10 min-h-[20dvh] sm:min-h-[26vh] lg:min-h-[34vh]"
                        : "py-16 lg:py-24 min-h-[50dvh] sm:min-h-[60vh] lg:min-h-[80vh]"
                )}>
                <div className="w-full max-w-[640px]">
                    {backHref && (
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-1 rounded-md text-sm text-brand-dark/55 transition-colors duration-200 hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-ring dark:text-bridge-300/55 dark:hover:text-bridge-100 mb-3 lg:mb-4"
                        >
                            <ChevronLeft className="size-3.5"/>
                            {backLabel}
                        </Link>
                    )}
                    {compact ? (
                        <div className="flex items-center gap-3 lg:gap-4 justify-center lg:justify-start leading-none text-brand-dark dark:text-brand-light text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">
                            {icon && (
                                <div className="shrink-0 inline-flex items-center [&_svg]:w-[0.85em] [&_svg]:h-[0.85em] [&_svg]:block">
                                    {icon}
                                </div>
                            )}
                            <h1 className="font-extrabold tracking-tight text-balance">
                                {title}
                                <span style={{color: accentColor || `var(--color-${path || 'brand-primary'})`}}>.</span>
                            </h1>
                        </div>
                    ) : (
                        <>
                            {icon && <div className="mb-4 flex justify-center lg:justify-start">{icon}</div>}
                            <h1 className="font-extrabold tracking-tight leading-[0.95] text-center lg:text-left text-balance text-brand-dark dark:text-brand-light text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
                                {title}
                                <span style={{color: accentColor || `var(--color-${path || 'brand-primary'})`}}>.</span>
                            </h1>
                        </>
                    )}

                    <span
                        aria-hidden="true"
                        className={cn(
                            "block h-1 rounded-full mx-auto lg:mx-0",
                            compact ? "w-12 mt-3" : "w-16 mt-6"
                        )}
                        style={{backgroundColor: accentColor || `var(--color-${path || 'brand-primary'})`}}
                    />

                    {description && (
                        <p className={cn(
                            "leading-relaxed text-pretty text-brand-gray-700 dark:text-brand-gray-300 text-center lg:text-left max-w-prose mx-auto lg:mx-0",
                            compact
                                ? "mt-3 text-sm sm:text-base lg:text-base"
                                : "mt-5 text-base sm:text-lg lg:text-lg xl:text-xl"
                        )}>
                            {description}
                        </p>
                    )}

                    {children && (
                        <div className={cn(
                            "w-full flex flex-wrap items-center gap-3 justify-center lg:justify-start",
                            compact ? "mt-4" : "mt-7"
                        )}>
                            {children}
                        </div>
                    )}
                </div>

                {tags.length > 0 && (
                    <div className="hidden lg:flex flex-shrink-0 items-center ml-8 max-w-[600px]">
                        <TagsBadges tags={tags} moduleTheme={path}/>
                    </div>
                )}
            </div>
        </section>
    );
}
