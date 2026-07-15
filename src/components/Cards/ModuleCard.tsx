'use client';

import Link from "next/link";
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowRight, BookOpen, ChevronRight, Lock} from "lucide-react";
import Module from "@/types/Module";
import iconMap from "@/lib/iconMap";
import getModuleProgress from "@/lib/getModuleProgress";
import {cn} from "@/lib/utils";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import CardBridgeBackground from "@/components/Cards/CardBridgeBackground";
import {moduleColor} from "@/lib/moduleColor";

interface ModuleCardProps {
    currentModule: Module;
    isAuthed?: boolean;
    isAdmin?: boolean;
}

export default function ModuleCard({currentModule, isAuthed = true, isAdmin = false}: ModuleCardProps) {
    const {title, description, path, iconName, sections} = currentModule;
    const Icon = iconMap[iconName] || BookOpen;
    const sectionsCount = sections?.length ?? 0;
    const { progress: pct, lastAvailableSectionPath } = getModuleProgress(currentModule);

    const isVisible = currentModule.isVisible !== false;

    const continueHref = lastAvailableSectionPath
        ? `/${path}/${lastAvailableSectionPath}`
        : `/${path}`;

    const canContinue = !!lastAvailableSectionPath;
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            className="h-full"
            whileHover={!prefersReducedMotion ? {y: -4} : {}}
            transition={{duration: 0.3, ease: "easeOut"}}
        >
        <Card
            className={cn(
                "group relative h-full flex flex-col gap-6 p-7 lg:p-8 overflow-hidden border border-bridge-500/30 dark:border-bridge-500/35",
                "bg-bridge-50 dark:bg-bridge-800",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:shadow-[0_2px_14px_-10px_rgba(0,0,0,0.6)]",
                "transition-[box-shadow,border-color] duration-300 ease-out",
                "hover:border-bridge-500/55 hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:hover:border-bridge-400/50 dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
            )}
        >
            <CardBridgeBackground/>

            <Link
                href={`/${path}`}
                aria-label={`Voir les chapitres de ${title}`}
                className="absolute inset-0 rounded-2xl z-10"
                aria-hidden="true"
                tabIndex={-1}
            />

            <div className="relative z-20 flex flex-col h-full gap-6 pointer-events-none">

                <CardHeader className="flex flex-row items-start gap-4 p-0">
                    <div
                        className="flex size-12 items-center justify-center rounded-xl text-white shadow-lg shrink-0 dark:text-brand-dark"
                        style={{ backgroundColor: moduleColor(currentModule) }}
                    >
                        <Icon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl lg:text-2xl font-bold" style={{ color: moduleColor(currentModule) }}>
                            {title}
                        </CardTitle>

                        {sectionsCount > 0 && (
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] font-bold text-brand-dark dark:text-bridge-200">
                                {sectionsCount} chapitre{sectionsCount > 1 ? "s" : ""}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {!isAuthed && (
                            <span className="flex size-7 items-center justify-center rounded-md bg-bridge-500/15">
                                <Lock className="size-3.5" />
                            </span>
                        )}
                        {isAdmin && !isVisible && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-bridge-700/30 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100">
                                <Lock className="size-3" aria-hidden="true"/>
                                <span className="hidden sm:inline">Masqué</span>
                            </span>
                        )}
                    </div>
                </CardHeader>

                {description && (
                    <CardContent className="flex-1 p-0">
                        <CardDescription className="text-sm leading-relaxed font-medium text-brand-dark/85 dark:text-bridge-100/90">
                            {description}
                        </CardDescription>
                    </CardContent>
                )}

                {isAuthed && (
                    <CardFooter className="flex flex-col gap-4 p-0">
                        {/* Progression */}
                        <div className="w-full">
                            <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] font-black">
                                <span>Progression</span>
                                <span className="tabular-nums">{pct}%</span>
                            </div>

                            <div className="w-full bg-bridge-500/18 dark:bg-bridge-100/12 rounded-full h-2 mt-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${pct}%`, backgroundColor: moduleColor(currentModule) }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full pointer-events-auto">
                            <Link
                                href={continueHref}
                                aria-disabled={!canContinue || undefined}
                                tabIndex={canContinue ? undefined : -1}
                                className={cn(
                                    "flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all active:translate-y-px",
                                    "bg-bridge-800 text-bridge-50 hover:bg-bridge-900 dark:bg-bridge-100 dark:text-bridge-900 dark:hover:bg-bridge-50",
                                    !canContinue && "opacity-60 pointer-events-none"
                                )}
                            >
                                Continuer le cours
                                <ArrowRight className="size-4" />
                            </Link>

                            <Link
                                href={`/${path}`}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold border border-bridge-500/35 bg-bridge-50/55 transition-all duration-200 hover:bg-bridge-100 active:translate-y-px dark:bg-bridge-900/55 dark:hover:bg-bridge-800 backdrop-blur-md"
                            >
                                Voir les chapitres
                                <ChevronRight className="size-4" />
                            </Link>
                        </div>
                    </CardFooter>
                )}
            </div>
        </Card>
        </motion.div>
    );
}
