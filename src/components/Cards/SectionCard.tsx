'use client';

import React, {useRef, useState} from 'react';
import Link from "next/link";
import {motion, useReducedMotion} from 'framer-motion';
import {Lock, Unlock} from "lucide-react";
import {ClockIcon} from "@/components/icons/clock";

import Section from "@/types/Section";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";
import {moduleColor} from "@/lib/moduleColor";
import {CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";
import {getContentTypes} from "@/types/CourseContent";
import {Button} from "@/components/ui/button";
import CardBridgeBackground from "@/components/Cards/CardBridgeBackground";
import updateSectionState from "@/hook/admin/updateSectionState";

import {BookTextIcon} from "@/components/icons/book-text";
import {TerminalIcon} from "@/components/icons/terminal";
import {GalleryThumbnailsIcon} from "@/components/icons/gallery-thumbnails";
import {RocketIcon} from "@/components/icons/rocket";
import {GraduationCapIcon} from "@/components/icons/graduation-cap";
import {LaptopMinimalCheckIcon} from "@/components/icons/laptop-minimal-check";
import type {SectionIconHandle} from "@/components/icons/section-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimatedIcon = React.ComponentType<any>;

const ANIMATED_CONTENT_ICON: Record<ContentKey, AnimatedIcon> = {
    cours: BookTextIcon,
    TP: TerminalIcon,
    slide: GalleryThumbnailsIcon,
    projet: RocketIcon,
    examen: GraduationCapIcon,
};

interface AnimatedActionButtonProps {
    IconComp: AnimatedIcon;
    label: string;
    disabled: boolean;
    href: string;
    btnClassName: string;
    iconClassName: string;
    prefersReducedMotion: boolean | null;
    external?: boolean;
    dashed?: boolean;
}

function AnimatedActionButton({
    IconComp,
    label,
    disabled,
    href,
    btnClassName,
    iconClassName,
    prefersReducedMotion,
    external,
}: AnimatedActionButtonProps) {
    const iconRef = useRef<SectionIconHandle>(null);

    const inner = (
        <>
            <IconComp ref={iconRef} size={16} className={iconClassName}/>
            <span className="hidden md:inline">{label}</span>
        </>
    );

    return (
        <Button
            asChild
            variant="outline"
            size="sm"
            className={btnClassName}
            onMouseEnter={() => {
                if (!prefersReducedMotion && !disabled) iconRef.current?.startAnimation();
            }}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
            {disabled ? (
                <span aria-disabled="true">{inner}</span>
            ) : external ? (
                <Link href={href} target="_blank" rel="noopener noreferrer">{inner}</Link>
            ) : (
                <Link href={href}>{inner}</Link>
            )}
        </Button>
    );
}

interface SectionCardProps {
    section: Section;
    currentModule: Module;
    isAdmin: boolean;
}

export default function SectionCard({section, currentModule, isAdmin}: SectionCardProps) {
    const {path: modulePath} = currentModule;
    const [available, setAvailable] = useState(section.isAvailable);
    const [pending, setPending] = useState(false);
    const isLocked = !isAdmin && !available;
    const sectionHref = available || isAdmin
        ? `/${modulePath}/${section.path}`
        : '#';

    const prefersReducedMotion = useReducedMotion();

    const sortedContents = getContentTypes(section.contents).sort(
        (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
    );

    const btnBase = cn(
        "group/btn flex-1 min-w-[88px] min-h-[44px] rounded-lg",
        "text-xs font-semibold tracking-wide uppercase",
        "border-2 border-(--module-color) text-brand-dark dark:text-bridge-50",
        "bg-transparent shadow-none",
        "hover:bg-(--module-color) hover:text-white hover:shadow-md",
        "transition-[color,border-color,background-color,box-shadow] duration-300",
    );
    const iconBase = "w-4 h-4 shrink-0 text-(--module-color) group-hover/btn:text-white transition-colors duration-300";

    async function handleToggleLock() {
        if (pending) return;
        const next = !available;
        setPending(true);
        setAvailable(next);
        try {
            await updateSectionState(currentModule._id as string, section.order, 'isAvailable', next);
        } catch {
            setAvailable(!next);
        } finally {
            setPending(false);
        }
    }

    return (
        <motion.article
            style={{
            '--module-color': moduleColor(currentModule),
            '--module-color-dark': moduleColor(currentModule, 'dark'),
        } as React.CSSProperties}
            className={cn(
                "group relative h-full flex flex-col p-7 lg:p-9 rounded-2xl overflow-hidden",
                "bg-bridge-50 dark:bg-bridge-900",
                "border border-bridge-500/45 dark:border-bridge-500/35",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                "transition-[box-shadow,border-color] duration-300 ease-out",
                !isLocked && "hover:border-bridge-500/65 dark:hover:border-bridge-400/55 hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                isLocked && "opacity-85",
            )}
            whileHover={!isLocked && !prefersReducedMotion ? {y: -6} : {}}
            transition={{duration: 0.3, ease: "easeOut"}}
        >
            <CardBridgeBackground/>

            {/* Whole-card click target — section landing page (z-10) */}
            {!isLocked && (
                <Link
                    href={sectionHref}
                    aria-label={`Ouvrir la section ${section.order}. ${section.title}`}
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

            <div className="relative z-20 flex flex-col gap-7 h-full pointer-events-none">

                {/* Header: order chip + title + duration + lock state */}
                <header className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center min-w-9 h-9 px-2.5 rounded-lg text-white dark:text-black font-mono font-bold shadow-sm shrink-0 bg-(--module-color) dark:bg-(--module-color-dark)">
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
                            <ClockIcon size={14} className="shrink-0"/>
                            {section.totalDuration}
                            <span className="hidden sm:inline">&nbsp;séance{section.totalDuration > 1 ? 's' : ''}</span>
                        </span>
                        {isAdmin ? (
                            <button
                                type="button"
                                onClick={handleToggleLock}
                                disabled={pending}
                                aria-busy={pending}
                                className={cn(
                                    "pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-1.5",
                                    "text-[10px] uppercase tracking-[0.18em] font-semibold",
                                    "transition-colors duration-200 cursor-pointer",
                                    available
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                        : "bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100 hover:bg-bridge-700/50"
                                )}
                                aria-label={available ? "Verrouiller la section" : "Déverrouiller la section"}
                            >
                                {available ? (
                                    <>
                                        <Unlock className="w-3 h-3"/>
                                        <span className="hidden sm:inline">Disponible</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3 h-3"/>
                                        <span className="hidden sm:inline">Verrouillé</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            isLocked && (
                                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100">
                                    <Lock className="w-3 h-3"/>
                                    <span className="hidden sm:inline">Verrouillé</span>
                                </span>
                            )
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
                <div className="flex flex-wrap gap-2.5 pt-3 mt-auto border-t border-bridge-700/20 dark:border-bridge-500/20 pointer-events-auto">
                    {sortedContents.map((item) => {
                        const key = item as ContentKey;
                        // Type de contenu venant de la DB : un type inconnu (casse/typo/legacy)
                        // ne doit pas rendre un composant undefined (crash React). Fallback
                        // cohérent avec ContentSwitcher / ContentSidebarNav.
                        const IconComp = ANIMATED_CONTENT_ICON[key] ?? BookTextIcon;
                        return (
                            <AnimatedActionButton
                                key={item}
                                IconComp={IconComp}
                                label={CONTENT_LABELS[key] ?? item}
                                disabled={isLocked}
                                href={`/${modulePath}/${section.path}/${item}`}
                                btnClassName={cn(btnBase, isLocked && "opacity-50 pointer-events-none cursor-not-allowed")}
                                iconClassName={iconBase}
                                prefersReducedMotion={prefersReducedMotion}
                            />
                        );
                    })}

                    {section.hasCorrection && (() => {
                        const correctionDisabled = !isAdmin && !section.correctionIsAvailable;
                        return (
                            <AnimatedActionButton
                                IconComp={LaptopMinimalCheckIcon}
                                label="Correction"
                                disabled={correctionDisabled}
                                href={`${process.env.NEXT_PUBLIC_GIT_URL}/${modulePath}/${section.path}`}
                                btnClassName={cn(
                                    btnBase,
                                    "border-dashed hover:border-solid",
                                    correctionDisabled && "opacity-50 pointer-events-none cursor-not-allowed"
                                )}
                                iconClassName={iconBase}
                                prefersReducedMotion={prefersReducedMotion}
                                external
                            />
                        );
                    })()}
                </div>
            </div>
        </motion.article>
    );
}
