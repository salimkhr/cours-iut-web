"use client";

import {type CSSProperties, type ReactNode} from "react";
import {useIsDark} from "@/hook/useIsDark";
import {useMounted} from "@/hook/useMounted";
import {cn} from "@/lib/utils";

interface AuthLayoutProps {
    title: string;
    description: string;
    children: ReactNode;
    wide?: boolean;
}

export default function AuthLayout({title, description, children, wide = false}: AuthLayoutProps) {
    const mounted = useMounted();
    const isDark = useIsDark();
    const heroImage = mounted && isDark
        ? "/images/header/pont-dark.png"
        : "/images/header/pont-light.png";
    const authLineEffectsStyle = {
        "--hero-accent": "var(--color-brand-primary)",
        "--hero-grid-x-peak": "0.44",
        "--hero-grid-x-mid": "0.18",
        "--hero-grid-y-peak": "0.36",
        "--hero-grid-y-mid": "0.14",
        "--hero-grid-x-travel": "68vw",
        "--hero-grid-y-travel": "100vh",
        maskImage: "linear-gradient(to right, black 0%, black 82%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, black 0%, black 82%, transparent 100%)",
    } as CSSProperties & Record<`--${string}`, string>;

    return (
        <section
            role="img"
            aria-label="Pont en bois clair traversé par la lumière"
            className={cn(
                "relative w-full min-h-screen overflow-hidden -mt-(--navbar-h)",
                "bg-background",
                "bg-no-repeat bg-right-bottom bg-cover",
            )}
            style={{backgroundImage: `url(${heroImage})`}}
        >
            {/* Gradient overlay — solide à gauche → transparent à droite (desktop).
                Reprend exactement la DA du HeroSection de la home : le pont reste
                visible sur la moitié droite, le contenu sur la gauche. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-b from-background via-background/90 to-background/60 lg:bg-linear-to-r lg:from-background lg:via-background/85 lg:to-transparent z-0"
            />

            <div aria-hidden="true" className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 w-[68vw] overflow-hidden"
                    style={authLineEffectsStyle}
                >
                    <div
                        className="hero-grid-line-x absolute left-0 top-14 h-px w-24"
                        style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 50%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-x hero-grid-line-delay-1 absolute left-0 top-28 h-px w-32"
                        style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 58%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-x hero-grid-line-delay-2 absolute left-0 top-[168px] h-px w-28"
                        style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 44%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-x hero-grid-line-delay-3 absolute left-0 top-[224px] h-px w-40"
                        style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 52%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-x hero-grid-line-delay-1 absolute bottom-14 left-0 h-px w-36"
                        style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 54%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-x hero-grid-line-delay-3 absolute bottom-28 left-0 h-px w-44"
                        style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 48%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-x hero-grid-line-delay-4 absolute bottom-[168px] left-0 h-px w-32"
                        style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 42%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-y absolute left-[12%] top-0 h-24 w-px"
                        style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 46%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-y hero-grid-line-delay-1 absolute left-[30%] top-0 h-32 w-px"
                        style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 52%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-y hero-grid-line-delay-2 absolute left-[48%] top-0 h-28 w-px"
                        style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 42%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-y hero-grid-line-delay-3 absolute left-[68%] top-0 h-36 w-px"
                        style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 56%, transparent), transparent)"}}
                    />
                    <div
                        className="hero-grid-line-y hero-grid-line-delay-4 absolute left-[88%] top-0 h-24 w-px"
                        style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 44%, transparent), transparent)"}}
                    />
                </div>
            </div>
            <div className="relative z-10 mx-auto w-full max-w-7xl min-h-screen flex items-start lg:items-center justify-center lg:justify-start px-6 lg:pl-12 lg:pr-6 py-12 lg:py-20 opacity-0 animate-fade-in">
                {/* Bloc unique en haut-gauche, comme la home : titre + descriptif
                    + formulaire empilés. Le pont reste libre sur la moitié droite. */}
                <div className="w-full">
                    <h1 className="font-extrabold tracking-tight leading-[0.95] text-brand-dark dark:text-brand-light text-4xl sm:text-5xl lg:text-6xl text-center lg:text-left">
                        {title}
                        <span className="text-brand-accent-dark">.</span>
                    </h1>
                    <span
                        aria-hidden="true"
                        className="block h-1 w-16 mt-4 rounded-full mx-auto lg:mx-0 bg-brand-accent-dark"
                    />
                    <p className="leading-relaxed text-brand-gray-700 dark:text-brand-gray-300 mt-4 text-sm sm:text-base max-w-prose mx-auto lg:mx-0 text-center lg:text-left">
                        {description}
                    </p>

                    <div className={cn(
                        "mt-7 rounded-2xl p-6 sm:p-7",
                        "bg-bridge-50/85 border border-bridge-400/40",
                        "dark:bg-bridge-800/80 dark:border-bridge-500/45",
                        "shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)]",
                        "dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]",
                        "backdrop-blur-md",
                        wide ? "lg:max-w-[42vw]" : "lg:max-w-[480px]",
                    )}>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
