'use client';

import Link from "next/link";
import {ArrowRight, BookOpen, ChevronRight, Lock} from "lucide-react";
import Module from "@/types/Module";
import iconMap from "@/lib/iconMap";
import getModuleProgress from "@/lib/getModuleProgress";
import {cn} from "@/lib/utils";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import CardBridgeBackground from "@/components/Cards/CardBridgeBackground";

interface ModuleCardProps {
    currentModule: Module;
    isAuthed?: boolean;
}

export default function ModuleCard({currentModule, isAuthed = true}: ModuleCardProps) {
    const {title, description, path, iconName, sections} = currentModule;
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
                "group relative h-full flex flex-col gap-6 p-7 lg:p-8 overflow-hidden border border-bridge-500/20",
                // Couleurs pleines pour éviter l'effet de transparence qui casse le fond du pont
                "bg-[#f7ebd9] dark:bg-[#13110d]",
                "shadow-[0_2px_10px_-8px_rgba(0,0,0,0.25)]",
                "dark:shadow-[0_2px_14px_-10px_rgba(0,0,0,0.6)]",
                "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-xl",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            )}
        >
            <CardBridgeBackground/>

            {/* --- LIEN GLOBAL (overlay clic) ---
                z-10 = au-dessus de l'image, en-dessous du contenu. Le contenu
                est plus haut (z-20) mais en pointer-events-none pour laisser
                les clics passer ici par défaut. */}
            <Link
                href={`/${path}`}
                aria-label={`Voir les chapitres de ${title}`}
                className="absolute inset-0 rounded-2xl z-10"
                aria-hidden="true"
                tabIndex={-1}
            />

            {/* --- CONTENU ---
                z-20 > overlay (z-10). pointer-events-none pour que les zones
                non-interactives laissent passer le clic vers l'overlay ;
                les boutons réactivent pointer-events-auto. */}
            <div className="relative z-20 flex flex-col h-full gap-6 pointer-events-none">

                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-0">
                    <div
                        className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-lg shrink-0",
                            `bg-${path}` // Utilise tes couleurs de badge
                        )}
                    >
                        <Icon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <CardTitle className={cn("text-xl lg:text-2xl font-bold", `text-${path}`)}>
                            {title}
                        </CardTitle>

                        {sectionsCount > 0 && (
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] font-bold text-brand-dark dark:text-bridge-200">
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
                    <CardContent className="flex-1 p-0">
                        <CardDescription className="text-sm leading-relaxed font-bold text-brand-dark dark:text-white">
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

                            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000", `bg-${path}`)}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>

                        {/* Actions — réactivent les clics dans le wrapper non-cliquable */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full pointer-events-auto">
                            <Link
                                href={continueHref}
                                aria-disabled={!canContinue || undefined}
                                tabIndex={canContinue ? undefined : -1}
                                className={cn(
                                    "flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all",
                                    "bg-bridge-800 text-white hover:bg-black dark:bg-bridge-100 dark:text-bridge-900 dark:hover:bg-white",
                                    !canContinue && "opacity-60 pointer-events-none"
                                )}
                            >
                                Continuer le cours
                                <ArrowRight className="size-4" />
                            </Link>

                            <Link
                                href={`/${path}`}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold border border-bridge-500/30 bg-white/30 dark:bg-black/30 hover:bg-white dark:hover:bg-bridge-900 backdrop-blur-md"
                            >
                                Voir les chapitres
                                <ChevronRight className="size-4" />
                            </Link>
                        </div>
                    </CardFooter>
                )}
            </div>
        </Card>
    );
}