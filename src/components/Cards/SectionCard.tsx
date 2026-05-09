'use client';

import Link from "next/link";
import {
    BookOpen,
    Clock,
    CodeXml,
    FolderCode,
    Gitlab,
    GraduationCap,
    Lock,
    Presentation
} from "lucide-react";

import Section from "@/types/Section";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";

interface SectionCardProps {
    section: Section;
    currentModule: Module;
    isAdmin: boolean;
}

const CONTENT_ORDER = ['cours', 'TP', 'slide', 'projet', 'examen'] as const;
type ContentKey = typeof CONTENT_ORDER[number];

const CONTENT_ICON: Record<ContentKey, React.ComponentType<{className?: string}>> = {
    cours: BookOpen,
    TP: CodeXml,
    slide: Presentation,
    projet: FolderCode,
    examen: GraduationCap,
};

export default function SectionCard({section, currentModule, isAdmin}: SectionCardProps) {
    const {path: modulePath} = currentModule;
    const isLocked = !isAdmin && !section.isAvailable;
    const sectionHref = section.isAvailable || isAdmin
        ? `/${modulePath}/${section.path}`
        : '#';

    const sortedContents = [...section.contents].sort(
        (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
    );

    return (
        <article
            className={cn(
                "group relative h-full flex flex-col gap-7 p-7 lg:p-9 rounded-2xl",
                "bg-bridge-300 border border-bridge-500/45",
                "dark:bg-bridge-800 dark:border-bridge-500/35",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",
                !isLocked && "hover:-translate-y-1.5 hover:bg-bridge-200 hover:border-bridge-500/65 dark:hover:bg-bridge-700 dark:hover:border-bridge-400/55 hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                isLocked && "opacity-85",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            )}
        >
            {/* Whole-card click target — section landing page */}
            {!isLocked && (
                <Link
                    href={sectionHref}
                    aria-label={`Ouvrir la section ${section.order}. ${section.title}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl"
                />
            )}

            {/* Top edge highlight */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30"
            />

            {/* Header: order chip + title + duration + lock state (one line) */}
            <header className="flex items-center gap-3">
                <div className={cn(
                    "inline-flex items-center justify-center min-w-9 h-9 px-2.5 rounded-lg text-white font-mono font-bold text-sm shadow-sm shrink-0",
                    `bg-${modulePath}`
                )}>
                    {section.order.toString().padStart(2, '0')}
                </div>
                <h3 className={cn(
                    "text-xl lg:text-2xl font-bold tracking-tight leading-tight flex-1 min-w-0",
                    `text-${modulePath}`
                )}>
                    {section.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark dark:text-bridge-200/70 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5"/>
                        {section.totalDuration}
                        <span className="hidden sm:inline">&nbsp;séance{section.totalDuration > 1 ? 's' : ''}</span>
                    </span>
                    {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100">
                            <Lock className="w-3 h-3"/>
                            <span className="hidden sm:inline">Verrouillé</span>
                        </span>
                    )}
                </div>
            </header>

            {/* Description */}
            {section.description && (
                <p className="text-sm leading-relaxed font-medium text-brand-dark dark:text-bridge-100/90 flex-grow">
                    {section.description}
                </p>
            )}

            {/* Tags */}
            {section.tags && section.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {section.tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center font-mono text-[11px] tracking-tight px-2.5 py-1 rounded-md border border-bridge-700/40 text-brand-dark dark:border-bridge-400/40 dark:text-bridge-100"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="relative z-10 flex flex-wrap gap-2.5 pt-3 mt-auto border-t border-bridge-700/20 dark:border-bridge-500/20">
                {sortedContents.map((item) => {
                    const Icon = CONTENT_ICON[item as ContentKey] ?? BookOpen;
                    const disabled = isLocked;
                    const className = cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg flex-1 min-w-[88px]",
                        "px-3 py-2 text-xs font-semibold tracking-wide uppercase",
                        "border border-bridge-700/55 text-brand-dark",
                        "dark:border-bridge-400/40 dark:text-bridge-100",
                        "transition-[color,border-color,background-color] duration-300",
                        !disabled && "hover:bg-bridge-200 hover:border-bridge-700 hover:text-bridge-900 dark:hover:bg-bridge-700 dark:hover:border-bridge-300 dark:hover:text-bridge-50",
                        disabled && "opacity-50 pointer-events-none cursor-not-allowed"
                    );
                    const label = item.charAt(0).toUpperCase() + item.slice(1);

                    if (disabled) {
                        return (
                            <span key={item} aria-disabled="true" className={className}>
                                <Icon className="w-4 h-4 shrink-0"/>
                                <span className="hidden md:inline">{label}</span>
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={item}
                            href={`/${modulePath}/${section.path}/${item}`}
                            className={className}
                        >
                            <Icon className="w-4 h-4 shrink-0"/>
                            <span className="hidden md:inline">{label}</span>
                        </Link>
                    );
                })}

                {section.hasCorrection && (() => {
                    const correctionDisabled = !isAdmin && !section.correctionIsAvailable;
                    const correctionClass = cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg flex-1 min-w-[88px]",
                        "px-3 py-2 text-xs font-semibold tracking-wide uppercase",
                        "border border-dashed border-bridge-700/55 text-brand-dark",
                        "dark:border-bridge-400/40 dark:text-bridge-100/90",
                        "transition-[color,border-color,background-color] duration-300",
                        !correctionDisabled && "hover:border-solid hover:bg-bridge-200 hover:text-brand-dark dark:hover:bg-bridge-700 dark:hover:text-bridge-50",
                        correctionDisabled && "opacity-50 pointer-events-none cursor-not-allowed"
                    );

                    if (correctionDisabled) {
                        return (
                            <span aria-disabled="true" className={correctionClass}>
                                <Gitlab className="w-4 h-4 shrink-0"/>
                                <span className="hidden md:inline">Correction</span>
                            </span>
                        );
                    }

                    return (
                        <Link
                            href={`${process.env.NEXT_PUBLIC_GIT_URL}/${modulePath}/${section.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={correctionClass}
                        >
                            <Gitlab className="w-4 h-4 shrink-0"/>
                            <span className="hidden md:inline">Correction</span>
                        </Link>
                    );
                })()}
            </div>
        </article>
    );
}
