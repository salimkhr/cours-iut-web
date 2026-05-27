"use client";

import {ReactNode} from "react";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
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

export default function QuizPageLayout({moduleSlug, sectionSlug, modulePath, sectionTitle, children}: QuizPageLayoutProps) {
    const mounted = useMounted();
    const isDark = useIsDark();
    const heroImage = mounted && isDark
        ? "/images/header/escalier-dark.png"
        : "/images/header/escalier-light.png";

    const moduleColor = `var(--color-${modulePath})`;
    const tpHref = `/${moduleSlug}/${sectionSlug}/TP`;

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

            <div className="relative z-10 mx-auto w-full max-w-7xl min-h-screen flex items-start lg:items-center justify-center lg:justify-start px-6 lg:pl-12 lg:pr-6 py-12 lg:py-20 opacity-0 animate-fade-in">
                <div className="w-full">
                    <Link
                        href={tpHref}
                        aria-label={`Retour au TP — ${sectionTitle}`}
                        className="inline-flex items-center gap-1.5 text-sm text-brand-gray-700 dark:text-brand-gray-300 hover:text-brand-dark dark:hover:text-brand-light mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        Retour au TP
                    </Link>

                    <h1 className="font-extrabold tracking-tight leading-[0.95] text-brand-dark dark:text-brand-light text-4xl sm:text-5xl lg:text-6xl text-center lg:text-left">
                        Quiz<span style={{color: moduleColor}}>.</span>
                    </h1>
                    <span
                        aria-hidden="true"
                        className="block h-1 w-16 mt-4 rounded-full mx-auto lg:mx-0"
                        style={{backgroundColor: moduleColor}}
                    />
                    <p className="leading-relaxed text-brand-gray-700 dark:text-brand-gray-300 mt-4 text-sm sm:text-base max-w-prose mx-auto lg:mx-0 text-center lg:text-left">
                        {sectionTitle}
                    </p>

                    <div className={cn(
                        "mt-7 rounded-2xl overflow-hidden",
                        "bg-bridge-50/85 border border-bridge-400/40",
                        "dark:bg-bridge-800/80 dark:border-bridge-500/45",
                        "shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)]",
                        "dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]",
                        "backdrop-blur-md",
                        "lg:max-w-[480px]",
                    )}>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
