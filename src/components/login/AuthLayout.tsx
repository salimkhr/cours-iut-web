"use client";

import {ReactNode} from "react";
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

    return (
        <section
            role="img"
            aria-label="Pont en bois clair traversé par la lumière"
            className={cn(
                "relative w-full min-h-screen overflow-hidden -mt-(--navbar-h)",
                "bg-brand-light dark:bg-brand-dark",
                "bg-no-repeat bg-right-bottom bg-cover",
            )}
            style={{backgroundImage: `url(${heroImage})`}}
        >
            {/* Gradient overlay — solide à gauche → transparent à droite (desktop).
                Reprend exactement la DA du HeroSection de la home : le pont reste
                visible sur la moitié droite, le contenu sur la gauche. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-b from-brand-light via-brand-light/90 to-brand-light/60 lg:bg-linear-to-r lg:from-brand-light lg:via-brand-light/85 lg:to-transparent dark:from-brand-dark dark:via-brand-dark/90 dark:to-brand-dark/60 lg:dark:via-brand-dark/85 lg:dark:to-transparent z-0"
            />

            {/* Ambient decoration */}
            <div aria-hidden="true" className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[520px] h-[520px] rounded-full bg-brand-primary/10 blur-3xl"/>
                <div className="absolute bottom-[-25%] left-[15%] w-[420px] h-[420px] rounded-full bg-brand-primary/5 blur-3xl"/>
                <div className="absolute top-[40%] left-[35%] w-0.5 h-[140px] bg-brand-primary/20 rotate-12"/>
                <div className="absolute top-[20%] left-[42%] w-1.5 h-1.5 rounded-full bg-brand-primary/40"/>
                <div className="absolute top-[55%] left-[38%] w-1 h-1 rounded-full bg-brand-primary/30"/>
                <div className="absolute top-[70%] left-[44%] w-2 h-2 rounded-full bg-brand-primary/25"/>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl min-h-screen flex items-start lg:items-center justify-center lg:justify-start px-6 lg:pl-12 lg:pr-6 py-12 lg:py-20 opacity-0 animate-fade-in">
                {/* Bloc unique en haut-gauche, comme la home : titre + descriptif
                    + formulaire empilés. Le pont reste libre sur la moitié droite. */}
                <div className={cn("w-full", wide ? "max-w-[90vw] lg:max-w-[42vw]" : "max-w-md lg:max-w-[480px]")}>
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
                    )}>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
