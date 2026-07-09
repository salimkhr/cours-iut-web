'use client';

import React, {useRef} from "react";
import Module from "@/types/Module";
import Section from "@/types/Section";
import {hasContentType} from "@/types/CourseContent";
import {cn} from "@/lib/utils";

import {BookTextIcon} from "@/components/icons/book-text";
import {CheckIcon} from "@/components/icons/check";
import {ClockIcon} from "@/components/icons/clock";
import type {SectionIconHandle} from "@/components/icons/section-icons";
import {moduleColor} from "@/lib/moduleColor";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimatedIconComp = React.ComponentType<any>;

interface AnimatedStatProps {
    IconComp: AnimatedIconComp;
    label: string;
    value: number | string;
    withDivider?: boolean;
    modulePath?: string;
}

function AnimatedStat({IconComp, label, value, withDivider, modulePath}: AnimatedStatProps) {
    const iconRef = useRef<SectionIconHandle>(null);

    return (
        <div
            className={cn(
                "flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left px-2 sm:px-4",
                withDivider && "sm:border-l sm:border-bridge-700/25 dark:sm:border-bridge-500/30"
            )}
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
            {/* Icône desktop — contrôlée via ref */}
            <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-bridge-700/15 text-brand-dark dark:bg-bridge-500/25 dark:text-bridge-100 shrink-0">
                <IconComp ref={iconRef} size={20}/>
            </div>

            <div className="flex flex-col min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                    {/* Icône mobile — auto-hover (pas de ref) */}
                    <IconComp size={14} className="sm:hidden"/>
                    {label}
                </span>
                <span className={cn(
                    "text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums leading-none mt-1",
                    modulePath ? "text-(--module-color) dark:text-(--module-color-dark)" : "text-brand-dark dark:text-bridge-50"
                )}>
                    {value}
                </span>
            </div>
        </div>
    );
}

interface ProgressSectionProps {
    currentModule: Module;
    totalSections: number;
    totalAvailableSections: number;
}

export default function ProgressSection({
    currentModule,
    totalSections,
    totalAvailableSections,
}: ProgressSectionProps) {
    const totalSeances = (currentModule.sections ?? [])
        .filter((s: Section) => !hasContentType(s.contents, "examen"))
        .reduce((sum, s) => sum + (s.totalDuration || 1), 0);

    return (
        <section
            className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-6 lg:-mt-9 mb-6 lg:mb-8"
            style={{
                '--module-color': moduleColor(currentModule),
                '--module-color-dark': moduleColor(currentModule, 'dark'),
            } as React.CSSProperties}
        >
            <div className="relative max-w-2xl mx-auto opacity-0 animate-fade-in">
                <div className={cn(
                    "grid grid-cols-3 gap-2 sm:gap-4 rounded-2xl",
                    "bg-[#f7ebd9] dark:bg-[#13110d]",
                    "border border-bridge-500/45 dark:border-bridge-500/35",
                    "shadow-[0_8px_28px_-12px_rgba(147,97,58,0.45)]",
                    "dark:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)]",
                    "p-5 sm:p-6 lg:p-7",
                    "relative overflow-hidden"
                )}>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30"
                    />

                    <AnimatedStat
                        IconComp={BookTextIcon}
                        label="Cours"
                        value={totalSections}
                        modulePath={currentModule.path}
                    />
                    <AnimatedStat
                        IconComp={CheckIcon}
                        label="Disponibles"
                        value={totalAvailableSections}
                        modulePath={currentModule.path}
                        withDivider
                    />
                    <AnimatedStat
                        IconComp={ClockIcon}
                        label="Séances"
                        value={totalSeances}
                        modulePath={currentModule.path}
                        withDivider
                    />
                </div>
            </div>
        </section>
    );
}
