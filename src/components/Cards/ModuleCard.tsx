'use client';

import Link from "next/link";
import {ArrowRight, BookOpen, ChevronRight} from 'lucide-react';
import Module from "@/types/Module";
import iconMap from "@/lib/iconMap";
import getModuleProgress from "@/lib/getModuleProgress";
import {cn} from "@/lib/utils";


interface ModuleCardProps {
    currentModule: Module;
}

export default function ModuleCard({currentModule}: ModuleCardProps) {
    const {title, description, path, iconName, sections} = currentModule;
    const Icon = iconMap[iconName] || BookOpen;
    const sectionsCount = sections?.length ?? 0;
    const {progress: pct, lastAvailableSectionPath} = getModuleProgress(currentModule);

    const continueHref = lastAvailableSectionPath
        ? `/${path}/${lastAvailableSectionPath}`
        : `/${path}`;
    const canContinue = !!lastAvailableSectionPath;

    return (
        <article
            className={cn(
                "group relative h-full flex flex-col gap-6 p-7 lg:p-8 rounded-2xl",
                "bg-bridge-300 border border-bridge-500/45",
                "dark:bg-bridge-800 dark:border-bridge-500/35",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",
                "hover:-translate-y-1.5",
                "hover:bg-bridge-200 hover:border-bridge-500/65",
                "dark:hover:bg-bridge-700 dark:hover:border-bridge-400/55",
                "hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)]",
                "dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            )}
        >
            {/* Whole-card click target — same destination as "Voir les chapitres" */}
            <Link
                href={`/${path}`}
                aria-label={`Voir les chapitres de ${title}`}
                tabIndex={-1}
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl"
            />

            {/* Subtle inner highlight for warmth (top edge) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30"
            />

            {/* Header: icon + title + chapter count */}
            <header className="flex items-start gap-4">
                <div
                    className={cn(
                        "relative flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-bridge-100 dark:text-brand-dark shadow-sm",
                        "transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-[-3deg]",
                        `bg-${path}`
                    )}
                >
                    <Icon size={22}/>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className={cn(
                        "text-xl lg:text-2xl font-bold tracking-tight leading-tight",
                        `text-${path}`
                    )}>
                        {title}
                    </h3>
                    {sectionsCount > 0 && (
                        <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark dark:text-bridge-200/70">
                            {sectionsCount} chapitre{sectionsCount > 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            </header>

            {/* Description */}
            {description && (
                <p className="text-sm leading-relaxed font-medium text-brand-dark dark:text-bridge-100/90 flex-grow">
                    {description}
                </p>
            )}

            {/* Progression — same style as ProgressSection on /[moduleSlug] */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark dark:text-bridge-200/70">
                    <span>Progression</span>
                    <span className="tabular-nums text-brand-dark dark:text-bridge-100">{pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={cn("h-2 rounded-full transition-all duration-300", `bg-${path}`)}
                        style={{width: `${pct}%`}}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
                <Link
                    href={continueHref}
                    aria-label={`Continuer le cours ${title}`}
                    aria-disabled={!canContinue || undefined}
                    tabIndex={canContinue ? undefined : -1}
                    className={cn(
                        "group/cta inline-flex items-center justify-center gap-2 rounded-lg flex-1",
                        "px-5 py-2.5 text-sm font-semibold tracking-wide",
                        "bg-bridge-700 text-bridge-50 dark:bg-bridge-200 dark:text-bridge-900",
                        "shadow-[0_4px_14px_-6px_rgba(94,59,34,0.4)]",
                        "transition-[background-color,box-shadow,transform] duration-300",
                        "hover:bg-bridge-800 dark:hover:bg-bridge-100",
                        "hover:shadow-[0_8px_20px_-6px_rgba(94,59,34,0.55)]",
                        "active:translate-y-px",
                        !canContinue && "opacity-60 pointer-events-none cursor-not-allowed"
                    )}
                >
                    Continuer le cours
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1"/>
                </Link>
                <Link
                    href={`/${path}`}
                    aria-label={`Voir les chapitres de ${title}`}
                    className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg",
                        "px-4 py-2.5 text-sm font-semibold tracking-wide",
                        "border border-bridge-700/55 text-brand-dark",
                        "dark:border-bridge-400/40 dark:text-bridge-100",
                        "transition-[color,border-color,background-color] duration-300",
                        "hover:bg-bridge-200 hover:border-bridge-700 hover:text-bridge-900",
                        "dark:hover:bg-bridge-700 dark:hover:border-bridge-300 dark:hover:text-bridge-50"
                    )}
                >
                    Voir les chapitres
                    <ChevronRight className="size-4"/>
                </Link>
            </div>
        </article>
    );
}
