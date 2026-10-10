"use client";

import type {ReactNode} from "react";
import {SlideHeading} from "@/components/Slides/ui/SlideHeading";
import {cn} from "@/lib/utils";

/**
 * Bandeau d'une slide de contenu : eyebrow, puis « badge + filet » (mêmes classes que
 * `SlideScreen`, donc mêmes styles `course-section-head` de globals.css). `aside` se pose à droite
 * du bandeau : c'est là que vit le chronomètre.
 */
export function QuizHeadband({eyebrow, badge, title, aside}: {eyebrow: string; badge: string; title: string; aside?: ReactNode}) {
    return (
        <header className="shrink-0">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-dark/65 dark:text-bridge-100/70 md:text-base">
                {eyebrow}
            </div>
            <div className="flex items-end gap-10">
                <div className="course-section-head course-section-head--top min-w-0 flex-1">
                    <span className="course-section-badge" aria-hidden="true">{badge}</span>
                    <div className="course-section-headline">
                        <SlideHeading level={1}>{title}</SlideHeading>
                    </div>
                </div>
                {aside}
            </div>
        </header>
    );
}

/** Barre d'actions flottante, calée en bas comme celle des slides. */
export function QuizActionBar({children, className}: {children: ReactNode; className?: string}) {
    return (
        <div className={cn("absolute bottom-4 left-0 z-50 flex w-full justify-center", className)}>
            <div className={cn(
                "flex items-center gap-2 rounded-xl border border-bridge-500/40 p-2 backdrop-blur-md",
                "bg-bridge-50/85 shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:bg-bridge-800/85 dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
            )}>
                {children}
            </div>
        </div>
    );
}

export const quizBarDivider = <div className="h-6 w-px bg-border/50" aria-hidden="true"/>;

/** Rail de progression à droite : un point par question, comme `SlidesProgress`. */
export function QuizProgress({total, current}: {total: number; current: number}) {
    return (
        <div className="absolute bottom-0 right-2 top-0 z-50 flex items-center">
            <ol
                aria-label={`Question ${current + 1} sur ${total}`}
                className="flex max-h-[90%] flex-col gap-2.5 overflow-hidden rounded-full border border-bridge-500/40 bg-bridge-50/85 p-1.5 backdrop-blur-sm dark:bg-bridge-800/85"
            >
                {Array.from({length: total}).map((_, i) => (
                    <li
                        key={i}
                        aria-current={i === current ? "step" : undefined}
                        className={cn(
                            "mx-auto rounded-full transition-[background-color,transform] motion-reduce:transition-none",
                            i === current
                                ? "size-3 scale-125 bg-(--module-color) dark:bg-(--module-color-dark)"
                                : i < current
                                    ? "size-2.5 bg-(--module-color)/45 dark:bg-(--module-color-dark)/45"
                                    : "size-2.5 bg-bridge-500/25",
                        )}
                    />
                ))}
            </ol>
        </div>
    );
}
