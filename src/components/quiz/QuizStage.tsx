"use client";

import type {CSSProperties, ReactNode, Ref} from "react";
import {useIsDark} from "@/hook/useIsDark";
import {cn} from "@/lib/utils";

/** Surface « carte » du système (cf. AuthLayout) : bridge, bordure chaude, ombre chaude, flou. */
export const quizCard = cn(
    "rounded-2xl border border-bridge-400/40 bg-bridge-50/85 text-brand-dark",
    "dark:border-bridge-500/45 dark:bg-bridge-800/80 dark:text-brand-light",
    "shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]",
    "backdrop-blur-md",
);

/** Eyebrow structurel du système (DESIGN.md §3). */
export const quizEyebrow = "text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-dark/70 dark:text-bridge-100/70";

type Line = {axis: "x" | "y"; pos: string; size: string; delay: number; alpha: number};

/** Mêmes traits que le fond du login (AuthLayout) : `prefers-reduced-motion` est géré dans globals.css. */
const LINES: Line[] = [
    {axis: "x", pos: "top-14", size: "w-24", delay: 0, alpha: 50},
    {axis: "x", pos: "top-28", size: "w-32", delay: 1, alpha: 58},
    {axis: "x", pos: "top-[168px]", size: "w-28", delay: 2, alpha: 44},
    {axis: "x", pos: "top-[224px]", size: "w-40", delay: 3, alpha: 52},
    {axis: "x", pos: "bottom-14", size: "w-36", delay: 1, alpha: 54},
    {axis: "x", pos: "bottom-28", size: "w-44", delay: 3, alpha: 48},
    {axis: "x", pos: "bottom-[168px]", size: "w-32", delay: 4, alpha: 42},
    {axis: "y", pos: "left-[12%]", size: "h-24", delay: 0, alpha: 46},
    {axis: "y", pos: "left-[30%]", size: "h-32", delay: 1, alpha: 52},
    {axis: "y", pos: "left-[48%]", size: "h-28", delay: 2, alpha: 42},
    {axis: "y", pos: "left-[68%]", size: "h-36", delay: 3, alpha: 56},
    {axis: "y", pos: "left-[88%]", size: "h-24", delay: 4, alpha: 44},
];

const lineVars = {
    "--hero-accent": "var(--color-brand-primary)",
    "--hero-grid-x-peak": "0.7",
    "--hero-grid-x-mid": "0.3",
    "--hero-grid-y-peak": "0.6",
    "--hero-grid-y-mid": "0.26",
    "--hero-grid-x-travel": "68vw",
    "--hero-grid-y-travel": "100vh",
    maskImage: "linear-gradient(to right, black 0%, black 82%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, black 0%, black 82%, transparent 100%)",
} as CSSProperties & Record<`--${string}`, string>;

function GridLines() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block">
            <div className="absolute inset-y-0 left-0 w-[68vw] overflow-hidden" style={lineVars}>
                {LINES.map((line, i) => (
                    <div
                        key={i}
                        className={cn(
                            line.axis === "x" ? "hero-grid-line-x left-0 h-px" : "hero-grid-line-y top-0 w-px",
                            line.delay > 0 && `hero-grid-line-delay-${line.delay}`,
                            "absolute", line.pos, line.size,
                        )}
                        style={{background: `linear-gradient(to ${line.axis === "x" ? "right" : "bottom"}, transparent, color-mix(in srgb, var(--hero-accent) ${line.alpha}%, transparent), transparent)`}}
                    />
                ))}
            </div>
        </div>
    );
}

interface Props {
    children: ReactNode;
    /**
     * `hero` : le pont reste visible à droite (lobby, écran final, téléphone).
     * `focus` : voile quasi opaque, pour que l'énoncé et les propositions priment sur le décor.
     */
    mode?: "hero" | "focus";
    className?: string;
    /** Conteneur à passer en plein écran (la projection), comme le cadre des slides. */
    ref?: Ref<HTMLElement>;
}

/** Fond commun du quiz : même DA que les pages de connexion (pont en bois clair + dégradé). */
export default function QuizStage({children, mode = "hero", className, ref}: Props) {
    const isDark = useIsDark();
    const image = isDark ? "/images/header/pont-dark.png" : "/images/header/pont-light.png";

    return (
        <main
            ref={ref}
            className={cn("relative isolate flex min-h-dvh flex-col overflow-hidden bg-background bg-cover bg-right-bottom bg-no-repeat text-brand-dark dark:text-brand-light", className)}
            style={{backgroundImage: `url(${image})`}}
        >
            <div
                aria-hidden="true"
                className={cn(
                    "absolute inset-0 -z-10",
                    mode === "hero"
                        ? "bg-linear-to-b from-background via-background/90 to-background/60 lg:bg-linear-to-r lg:from-background lg:via-background/85 lg:to-transparent"
                        : "bg-background/95",
                )}
            />
            {mode === "hero" && <GridLines/>}
            {children}
        </main>
    );
}

/** Titre de page : display + point d'accent + soulignement, comme AuthLayout. */
export function QuizTitle({children, className}: {children: ReactNode; className?: string}) {
    return (
        <div>
            <h1 className={cn("font-extrabold leading-[0.95] tracking-tight text-brand-dark dark:text-brand-light", className ?? "text-4xl sm:text-5xl")}>
                {children}
                <span className="text-brand-accent-dark dark:text-brand-accent">.</span>
            </h1>
            <span aria-hidden="true" className="mt-4 block h-1 w-16 rounded-full bg-brand-accent-dark dark:bg-brand-accent"/>
        </div>
    );
}
