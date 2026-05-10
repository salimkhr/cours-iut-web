'use client';

import {ReactNode, useMemo} from "react";
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
    compact?: boolean;
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
                                        compact = false
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
            role="img"
            aria-label={imageAlt}
            className={cn(
                "relative w-full bg-no-repeat bg-right-bottom bg-contain lg:bg-cover lg:bg-right-bottom overflow-hidden border-b border-brand-dark/15 dark:border-brand-light/15 -mt-(--navbar-h)",
                compact
                    ? "min-h-[26vh] lg:min-h-[34vh]"
                    : "min-h-[60vh] lg:min-h-[80vh]"
            )}
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

            {/* Gradient overlay — solid left → transparent right (more aggressive on desktop) */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-b from-brand-light via-brand-light/90 to-brand-light/60 lg:bg-linear-to-r lg:from-brand-light lg:via-brand-light/85 lg:to-transparent dark:from-brand-dark dark:via-brand-dark/90 dark:to-brand-dark/60 lg:dark:via-brand-dark/85 lg:dark:to-transparent z-0"
            />

            {/* Ambient decoration — desktop only, subtle */}
            <div aria-hidden="true" className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[520px] h-[520px] rounded-full bg-brand-primary/10 blur-3xl"/>
                <div className="absolute bottom-[-25%] left-[15%] w-[420px] h-[420px] rounded-full bg-brand-primary/5 blur-3xl"/>
                <div className="absolute top-[40%] left-[35%] w-0.5 h-[140px] bg-brand-primary/20 rotate-12"/>
                <div className="absolute top-[20%] left-[42%] w-1.5 h-1.5 rounded-full bg-brand-primary/40"/>
                <div className="absolute top-[55%] left-[38%] w-1 h-1 rounded-full bg-brand-primary/30"/>
                <div className="absolute top-[70%] left-[44%] w-2 h-2 rounded-full bg-brand-primary/25"/>
            </div>

            <div
                className={cn(
                    "relative z-10 mx-auto w-full max-w-7xl flex flex-col items-center lg:items-start justify-center px-6 lg:pl-12 lg:pr-6 opacity-0 animate-fade-in",
                    compact
                        ? "py-7 lg:py-10 min-h-[26vh] lg:min-h-[34vh]"
                        : "py-16 lg:py-24 min-h-[60vh] lg:min-h-[80vh]"
                )}>
                <div className="w-full max-w-[640px]">
                    {compact ? (
                        <div className="flex items-center gap-3 lg:gap-4 justify-center lg:justify-start leading-none text-brand-dark dark:text-brand-light text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">
                            {icon && (
                                <div className="shrink-0 inline-flex items-center [&_svg]:w-[0.85em] [&_svg]:h-[0.85em] [&_svg]:block">
                                    {icon}
                                </div>
                            )}
                            <h1 className="font-extrabold tracking-tight">
                                {title}
                                <span style={{color: `var(--color-${path || 'brand-primary'})`}}>.</span>
                            </h1>
                        </div>
                    ) : (
                        <>
                            {icon && <div className="mb-4 flex justify-center lg:justify-start">{icon}</div>}
                            <h1 className="font-extrabold tracking-tight leading-[0.95] text-center lg:text-left text-brand-dark dark:text-brand-light text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
                                {title}
                                <span style={{color: `var(--color-${path || 'brand-primary'})`}}>.</span>
                            </h1>
                        </>
                    )}

                    <span
                        aria-hidden="true"
                        className={cn(
                            "block h-1 rounded-full mx-auto lg:mx-0",
                            compact ? "w-12 mt-3" : "w-16 mt-6"
                        )}
                        style={{backgroundColor: `var(--color-${path || 'brand-primary'})`}}
                    />

                    {description && (
                        <p className={cn(
                            "leading-relaxed text-brand-gray-700 dark:text-brand-gray-300 text-center lg:text-left max-w-prose mx-auto lg:mx-0",
                            compact
                                ? "mt-3 text-sm sm:text-base lg:text-base"
                                : "mt-5 text-base sm:text-lg lg:text-lg xl:text-xl"
                        )}>
                            {description}
                        </p>
                    )}

                    {children && <div className={cn(
                        "w-full flex justify-center lg:justify-start",
                        compact ? "mt-4" : "mt-7"
                    )}>{children}</div>}

                    {tags.length > 0 && (
                        <div className="mt-6 w-full flex justify-center lg:justify-start">
                            <TagsBadges tags={tags} moduleTheme={path}/>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
