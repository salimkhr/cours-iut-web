'use client';

import React, {useRef} from "react";
import Link from "next/link";
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowRight, Lock} from "lucide-react";
import Module from "@/types/Module";
import Section from "@/types/Section";
import {cn} from "@/lib/utils";
import {moduleColor} from "@/lib/moduleColor";
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
}

export default function ContentCard({content, section, currentModule}: ContentCardProps) {
    const config = CONTENT_CONFIG[content] ?? {
        label: content,
        description: '',
        IconComp: BookTextIcon,
    };
    const {label, description, IconComp} = config;
    const iconRef = useRef<SectionIconHandle>(null);

    const isLocked = !section.isAvailable;
    const href = isLocked ? '#' : `/${currentModule.path}/${section.path}/${content}`;
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.article
            style={{
                '--module-color': moduleColor(currentModule),
                '--module-color-dark': moduleColor(currentModule, 'dark'),
            } as React.CSSProperties}
            className={cn(
                "group relative h-full flex flex-col p-6 lg:p-7 rounded-2xl overflow-hidden",
                "bg-[#f7ebd9] dark:bg-[#13110d]",
                "border border-bridge-500/45 dark:border-bridge-500/35",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                "transition-[box-shadow,border-color] duration-300 ease-out",
                !isLocked && "hover:border-bridge-500/65 dark:hover:border-bridge-400/55 hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                isLocked && "opacity-85",
            )}
            whileHover={!isLocked && !prefersReducedMotion ? {y: -6} : {}}
            transition={{duration: 0.3, ease: "easeOut"}}
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
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-[-3deg] bg-(--module-color) dark:bg-(--module-color-dark)">
                        <IconComp ref={iconRef} size={24} className="text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight leading-tight flex-1 min-w-0 text-(--module-color) dark:text-(--module-color-dark)">
                        {label}
                    </h3>
                    {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100 shrink-0">
                            <Lock className="w-3 h-3"/>
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
                            className="inline-flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold tracking-wide border border-bridge-700/55 text-brand-dark dark:border-bridge-400/40 dark:text-bridge-100 opacity-50 pointer-events-none cursor-not-allowed"
                        >
                            Indisponible
                            <Lock className="w-4 h-4"/>
                        </span>
                    ) : (
                        <Link
                            href={href}
                            className="group/cta inline-flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold tracking-wide border border-bridge-700/55 text-brand-dark dark:border-bridge-400/40 dark:text-bridge-100 transition-[color,border-color,background-color] duration-300 hover:bg-bridge-200 hover:border-bridge-700 hover:text-bridge-900 dark:hover:bg-bridge-700 dark:hover:border-bridge-300 dark:hover:text-bridge-50"
                        >
                            Ouvrir {label}
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1"/>
                        </Link>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
