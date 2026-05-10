'use client';

import Link from "next/link";
import {ArrowRight, BookOpen, ChevronRight, Lock} from "lucide-react";
import Module from "@/types/Module";
import iconMap from "@/lib/iconMap";
import getModuleProgress from "@/lib/getModuleProgress";
import {cn} from "@/lib/utils";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

interface ModuleCardProps {
    currentModule: Module;
    isAuthed?: boolean;
}

export default function ModuleCard({ currentModule, isAuthed = true }: ModuleCardProps) {
    const { title, description, path, iconName, sections } = currentModule;
    const Icon = iconMap[iconName] || BookOpen;
    const sectionsCount = sections?.length ?? 0;
    const { progress: pct, lastAvailableSectionPath } = getModuleProgress(currentModule);

    const continueHref = lastAvailableSectionPath
        ? `/${path}/${lastAvailableSectionPath}`
        : `/${path}`;

    const canContinue = !!lastAvailableSectionPath;

    return (
        <Card
            className={cn(
                "group relative h-full flex flex-col gap-6 p-7 lg:p-8",
                "bg-bridge-300/40 border border-bridge-500/20",
                "dark:bg-bridge-800/40 dark:border-bridge-500/20",

                "backdrop-blur-[1px]",

                "shadow-[0_2px_10px_-8px_rgba(0,0,0,0.25)]",
                "dark:shadow-[0_2px_14px_-10px_rgba(0,0,0,0.6)]",

                "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",

                "hover:-translate-y-1",
                "hover:bg-bridge-300/60 hover:border-bridge-500/30",
                "dark:hover:bg-bridge-700/50 dark:hover:border-bridge-400/30",

                "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            )}
        >
            {/* Click overlay */}
            <Link
                href={`/${path}`}
                aria-label={`Voir les chapitres de ${title}`}
                className="absolute inset-0 rounded-2xl z-0"
                aria-hidden="true"
                tabIndex={-1}
            />

            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div
                    className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl text-bridge-100 shadow-sm shrink-0",
                        `bg-${path}`
                    )}
                >
                    <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                    <CardTitle className={cn("text-xl lg:text-2xl font-bold", `text-${path}`)}>
                        {title}
                    </CardTitle>

                    {sectionsCount > 0 && (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark dark:text-bridge-200/70">
                            {sectionsCount} chapitre{sectionsCount > 1 ? "s" : ""}
                        </p>
                    )}
                </div>

                {!isAuthed && (
                    <span className="w-7 h-7 flex items-center justify-center rounded-md bg-bridge-500/15">
            <Lock className="w-3.5 h-3.5" />
          </span>
                )}
            </CardHeader>

            {description && (
                <CardContent className="flex-1">
                    <CardDescription className="text-sm leading-relaxed font-medium text-brand-dark dark:text-bridge-100/90">
                        {description}
                    </CardDescription>
                </CardContent>
            )}

            {isAuthed && (
                <CardFooter className="flex flex-col gap-4 z-10">
                    {/* Progress */}
                    <div className="w-full">
                        <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] font-semibold">
                            <span>Progression</span>
                            <span className="tabular-nums">{pct}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className={cn("h-2 rounded-full transition-all", `bg-${path}`)}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Link
                            href={continueHref}
                            aria-disabled={!canContinue || undefined}
                            tabIndex={canContinue ? undefined : -1}
                            className={cn(
                                "flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold",
                                "bg-bridge-700 text-bridge-50 dark:bg-bridge-200 dark:text-bridge-900",
                                !canContinue && "opacity-60 pointer-events-none"
                            )}
                        >
                            Continuer le cours
                            <ArrowRight className="size-4" />
                        </Link>

                        <Link
                            href={`/${path}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold border"
                        >
                            Voir les chapitres
                            <ChevronRight className="size-4" />
                        </Link>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}