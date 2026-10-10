"use client";

import type {CSSProperties, ReactNode, Ref} from "react";
import {cn} from "@/lib/utils";

/** Surface « carte » du système : bridge, bordure chaude, ombre chaude. */
export const quizCard = cn(
    "rounded-2xl border border-bridge-400/40 bg-bridge-50/90 text-brand-dark",
    "dark:border-bridge-500/45 dark:bg-bridge-800/85 dark:text-brand-light",
    "shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]",
);

/** Eyebrow structurel du système (DESIGN.md §3). */
export const quizEyebrow = "text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-dark/70 dark:text-bridge-100/70";

/** Couleur du module : accent du point, du filet, du badge et des traits animés. */
/**
 * Code en ligne à la taille du texte qui l'entoure : le composant Code impose `text-sm`, illisible dans
 * une proposition en `text-4xl` (projection) ou `text-lg` (téléphone). Même règle que pour l'énoncé.
 */
export const inlineCodeFit = "[&_code]:!text-[1em] [&_code]:!leading-[inherit] [&_code]:!py-0";
export const moduleAccent = "text-(--module-color) dark:text-(--module-color-dark)";
export const moduleFill = "bg-(--module-color) dark:bg-(--module-color-dark)";

type Line = {axis: "x" | "y"; pos: string; size: string; delay: number; alpha: number};

/** Mêmes traits que la garde de section des slides (`SlideTitle`). */
const LINES: Line[] = [
    {axis: "x", pos: "top-14", size: "w-32", delay: 0, alpha: 50},
    {axis: "x", pos: "top-28", size: "w-44", delay: 1, alpha: 58},
    {axis: "x", pos: "top-[168px]", size: "w-36", delay: 2, alpha: 44},
    {axis: "x", pos: "bottom-20", size: "w-52", delay: 3, alpha: 52},
    {axis: "y", pos: "left-14", size: "h-32", delay: 0, alpha: 46},
    {axis: "y", pos: "left-28", size: "h-36", delay: 1, alpha: 52},
    {axis: "y", pos: "left-[168px]", size: "h-40", delay: 2, alpha: 42},
    {axis: "y", pos: "left-[224px]", size: "h-36", delay: 3, alpha: 56},
];

const lineVars = {
    "--hero-accent": "var(--module-color)",
    "--hero-grid-x-peak": "0.8",
    "--hero-grid-x-mid": "0.38",
    "--hero-grid-y-peak": "0.7",
    "--hero-grid-y-mid": "0.34",
    "--hero-grid-x-travel": "58vw",
    "--hero-grid-y-travel": "92vh",
    maskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
} as CSSProperties & Record<`--${string}`, string>;

/** `prefers-reduced-motion` est géré dans globals.css (les traits disparaissent). */
function GridLines() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden sm:block">
            <div className="absolute inset-y-0 left-0 w-[78%] overflow-hidden sm:w-[68%] lg:w-[56%]" style={lineVars}>
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
     * `title` : la garde de section des slides (photo du pont, traits animés) — lobby, écran final,
     * attente sur téléphone. `content` : une slide de contenu (surface bridge, trait de pont discret) —
     * question et correction.
     */
    mode?: "title" | "content";
    /** Slug du module : la couleur identitaire se propage au badge, au filet et aux traits. */
    moduleSlug?: string;
    className?: string;
    /** Conteneur à passer en plein écran (la projection), comme le cadre des slides. */
    ref?: Ref<HTMLElement>;
}

/** Fond commun du quiz : même direction artistique que les slides. */
export default function QuizStage({children, mode = "content", moduleSlug, className, ref}: Props) {
    const accent = moduleSlug ? `var(--color-${moduleSlug})` : "var(--color-brand-primary)";
    const vars = {"--module-color": accent, "--module-color-dark": accent} as CSSProperties & Record<`--${string}`, string>;

    return (
        <main
            ref={ref}
            style={vars}
            className={cn(
                "relative isolate flex min-h-dvh flex-col overflow-hidden text-brand-dark dark:text-brand-light",
                mode === "title"
                    ? "bg-bridge-50 bg-cover bg-right-bottom bg-no-repeat bg-[url('/images/header/pont-light.png')] dark:bg-bridge-900 dark:bg-[url('/images/header/pont-dark.png')]"
                    : "slide-surface",
                className,
            )}
        >
            {mode === "title" ? (
                <>
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 z-0 bg-linear-to-b from-bridge-50 via-bridge-50/95 to-bridge-50/76 dark:from-bridge-900 dark:via-bridge-900/96 dark:to-bridge-900/82 lg:bg-linear-to-r lg:from-bridge-50 lg:via-bridge-50/88 lg:to-transparent lg:dark:from-bridge-900 lg:dark:via-bridge-900/90 lg:dark:to-bridge-900/28"
                    />
                    <GridLines/>
                </>
            ) : (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-bridge-50 via-bridge-50/86 to-bridge-50/30 dark:from-bridge-900 dark:via-bridge-900/88 dark:to-bridge-900/44"/>
                    <div className="absolute bottom-[-1px] right-0 z-10 h-[34%] w-[30%] bg-[url('/images/card/pont-light.png')] bg-contain bg-right-bottom bg-no-repeat opacity-50 dark:bg-[url('/images/card/pont-dark.png')]"/>
                </div>
            )}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
        </main>
    );
}

/** Titre géant de la garde de section : point et filet dans la couleur du module. */
export function QuizTitle({children, className}: {children: ReactNode; className?: string}) {
    return (
        <div>
            <h1 className={cn("text-balance font-extrabold leading-[0.9] tracking-normal !text-brand-dark dark:!text-brand-light", className ?? "text-4xl sm:text-5xl")}>
                {children}
                <span className={moduleAccent}>.</span>
            </h1>
            <span aria-hidden="true" className={cn("mt-5 block h-1 w-16 rounded-full", moduleFill)}/>
        </div>
    );
}
