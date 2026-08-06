'use client';

import React, {useRef} from "react";
import Link from "next/link";
import {useReducedMotion} from 'motion/react';
import {Lock} from "lucide-react";
import Module from "@/types/Module";
import Section from "@/types/Section";
import {cn} from "@/lib/utils";
import {moduleColor} from "@/lib/moduleColor";
import {Button} from "@/components/ui/button";
import CardBridgeBackground from "@/components/Cards/CardBridgeBackground";
import {BookTextIcon} from "@/components/icons/book-text";
import {TerminalIcon} from "@/components/icons/terminal";
import {GalleryThumbnailsIcon} from "@/components/icons/gallery-thumbnails";
import {RocketIcon} from "@/components/icons/rocket";
import {GraduationCapIcon} from "@/components/icons/graduation-cap";
import type {SectionIconHandle} from "@/components/icons/section-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimatedIcon = React.ComponentType<any>;

const CONTENT_CONFIG: Record<string, {label: string; description: string; IconComp: AnimatedIcon}> = {
    cours: {
        label: 'Cours',
        description: 'Notions et concepts fondamentaux.',
        IconComp: BookTextIcon,
    },
    TP: {
        label: 'TP',
        description: 'Mise en pratique guidée, pas à pas.',
        IconComp: TerminalIcon,
    },
    slide: {
        label: 'Slides',
        description: 'Présentation visuelle, navigation au clavier.',
        IconComp: GalleryThumbnailsIcon,
    },
    projet: {
        label: 'Projet',
        description: 'Projet d\'application des acquis.',
        IconComp: RocketIcon,
    },
    examen: {
        label: 'Examen',
        description: 'Évaluation des compétences acquises.',
        IconComp: GraduationCapIcon,
    },
};

interface ContentCardProps {
    content: string;
    section: Section;
    currentModule: Module;
    isAdmin?: boolean;
}

export default function ContentCard({content, section, currentModule, isAdmin = false}: ContentCardProps) {
    const config = CONTENT_CONFIG[content] ?? {
        label: content,
        description: '',
        IconComp: BookTextIcon,
    };
    const {label, description, IconComp} = config;
    const iconRef = useRef<SectionIconHandle>(null);

    const isLocked = !isAdmin && !section.isAvailable;
    const href = isLocked ? '#' : `/${currentModule.path}/${section.path}/${content}`;
    const prefersReducedMotion = useReducedMotion();
    const btnBase = cn(
        "group/btn w-full min-h-[44px] rounded-lg",
        "text-xs font-semibold tracking-wide uppercase",
        "border-2 border-(--module-color) text-brand-dark dark:border-(--module-color-dark) dark:text-bridge-100",
        "bg-transparent dark:bg-bridge-900/18 shadow-none",
        "hover:bg-(--module-color) hover:text-white hover:shadow-md dark:hover:bg-(--module-color-dark) dark:hover:text-brand-dark",
        "active:translate-y-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "transition-[color,border-color,background-color,box-shadow,transform] duration-300",
    );

    return (
        <article
            style={{
                '--module-color': moduleColor(currentModule),
                '--module-color-dark': moduleColor(currentModule, 'dark'),
            } as React.CSSProperties}
            className={cn(
                "group relative h-full flex flex-col p-6 lg:p-7 rounded-2xl overflow-hidden",
                "bg-bridge-50 dark:bg-bridge-800",
                "border border-bridge-500/45 dark:border-bridge-500/35",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                "transition-[background-color,box-shadow,border-color,transform] duration-300 ease-out will-change-transform",
                !isLocked && [
                    "cursor-pointer hover:-translate-y-1.5 active:translate-y-px motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0",
                    "hover:bg-bridge-100 dark:hover:bg-bridge-700",
                    "hover:border-bridge-500/65 dark:hover:border-bridge-400/55",
                    "hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                    "focus-within:border-bridge-500/70 dark:focus-within:border-bridge-300/60",
                    "focus-within:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:focus-within:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                ],
                isLocked && "opacity-85",
            )}
            onMouseEnter={() => {
                if (!isLocked && !prefersReducedMotion) iconRef.current?.startAnimation();
            }}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
            <CardBridgeBackground/>

            {/* Whole-card click target (z-10) */}
            {!isLocked && (
                <Link
                    href={href}
                    aria-label={`Ouvrir ${label}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl z-10"
                />
            )}

            {/* Top edge highlight */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30 z-10"
            />

            <div className="relative z-20 flex flex-col gap-5 h-full pointer-events-none">

                {/* Header: icon + title + lock badge */}
                <header className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl shrink-0 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-[-3deg] bg-(--module-color) dark:bg-(--module-color-dark) dark:text-brand-dark">
                        <IconComp ref={iconRef} size={24} className="text-current"/>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight leading-tight flex-1 min-w-0 text-(--module-color) dark:text-(--module-color-dark)">
                        {label}
                    </h3>
                    {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] font-semibold bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100 shrink-0">
                            <Lock className="size-3"/>
                            <span className="hidden sm:inline">Verrouillé</span>
                        </span>
                    )}
                </header>

                {/* Description */}
                {description && (
                    <p className="text-sm leading-relaxed font-medium text-brand-dark dark:text-bridge-100/90 flex-grow">
                        {description}
                    </p>
                )}

                {/* CTA */}
                <div className="pt-3 mt-auto border-t border-bridge-700/20 dark:border-bridge-500/20 pointer-events-auto">
                    {isLocked ? (
                        <span
                            aria-disabled="true"
                            className={cn(btnBase, "inline-flex items-center justify-center gap-2 px-3 opacity-50 pointer-events-none cursor-not-allowed")}
                        >
                            Indisponible
                        </span>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className={btnBase}
                        >
                            <Link href={href} aria-label={`Ouvrir ${label}`}>
                                <span>Ouvrir {label}</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}
