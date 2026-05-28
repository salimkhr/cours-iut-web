"use client";

import {ReactNode} from "react";
import {useIsDark} from "@/hook/useIsDark";
import {useMounted} from "@/hook/useMounted";
import {cn} from "@/lib/utils";

interface QuizPageLayoutProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
    sectionTitle: string;
    children: ReactNode;
}

export default function QuizPageLayout({
    moduleSlug: _moduleSlug,
    sectionSlug: _sectionSlug,
    modulePath,
    sectionTitle: _sectionTitle,
    children,
}: QuizPageLayoutProps) {
    const mounted = useMounted();
    const isDark = useIsDark();
    const heroImage = mounted && isDark
        ? "/images/header/escalier-dark.png"
        : "/images/header/escalier-light.png";

    const moduleColor = `var(--color-${modulePath})`;

    return (
        <section
            role="img"
            aria-label="Escalier lumineux symbolisant la progression"
            className={cn(
                "relative w-full min-h-screen overflow-hidden -mt-(--navbar-h)",
                "bg-brand-light dark:bg-brand-dark",
                "bg-no-repeat bg-right-bottom bg-cover",
            )}
            style={{backgroundImage: `url(${heroImage})`}}
        >
            {/* Gradient overlay — identique à AuthLayout */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-b from-brand-light via-brand-light/90 to-brand-light/60 lg:bg-linear-to-r lg:from-brand-light lg:via-brand-light/85 lg:to-transparent dark:from-brand-dark dark:via-brand-dark/90 dark:to-brand-dark/60 lg:dark:via-brand-dark/85 lg:dark:to-transparent z-0"
            />

            {/* Ambient decoration en couleur module */}
            <div aria-hidden="true" className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[520px] h-[520px] rounded-full blur-3xl opacity-10" style={{backgroundColor: moduleColor}}/>
                <div className="absolute bottom-[-25%] left-[15%] w-[420px] h-[420px] rounded-full blur-3xl opacity-5" style={{backgroundColor: moduleColor}}/>
                <div className="absolute top-[40%] left-[35%] w-0.5 h-[140px] rotate-12 opacity-20" style={{backgroundColor: moduleColor}}/>
                <div className="absolute top-[20%] left-[42%] w-1.5 h-1.5 rounded-full opacity-40" style={{backgroundColor: moduleColor}}/>
                <div className="absolute top-[55%] left-[38%] w-1 h-1 rounded-full opacity-30" style={{backgroundColor: moduleColor}}/>
                <div className="absolute top-[70%] left-[44%] w-2 h-2 rounded-full opacity-25" style={{backgroundColor: moduleColor}}/>
            </div>

            {/* "Quiz." watermark */}
            <div
                aria-hidden="true"
                className="absolute right-6 lg:right-10 z-20 pointer-events-none select-none"
                style={{top: "calc(var(--navbar-h) + 1.5rem)"}}
            >
                <span className="font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl text-brand-dark/[0.06] dark:text-brand-light/[0.06]">
                    Quiz<span style={{color: moduleColor, opacity: 0.18}}>.</span>
                </span>
            </div>

            {/* Contenu plein écran */}
            <div className="relative z-10 min-h-screen">
                {children}
            </div>
        </section>
    );
}
