'use client';

import Link from "next/link";
import {useState} from "react";
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowRight, BookOpen, ChevronRight, Eye, EyeOff, Lock} from "lucide-react";
import {toast} from "sonner";
import Module from "@/types/Module";
import iconMap from "@/lib/iconMap";
import getModuleProgress from "@/lib/getModuleProgress";
import {cn} from "@/lib/utils";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import CardBridgeBackground from "@/components/Cards/CardBridgeBackground";
import {moduleColor} from "@/lib/moduleColor";
import useAdminApi from "@/hook/admin/useAdminApi";

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

    const [visible, setVisible] = useState(currentModule.isVisible !== false);
    const [pending, setPending] = useState(false);
    const { toggleModuleVisibility } = useAdminApi();

    const handleToggleVisibility = async () => {
        if (pending) return;
        const next = !visible;
        setPending(true);
        setVisible(next);
        try {
            await toggleModuleVisibility(currentModule._id as string, next);
            toast.success(next ? 'Module visible.' : 'Module masqué.');
        } catch {
            setVisible(!next);
        } finally {
            setPending(false);
        }
    };

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
                "group relative h-full flex flex-col gap-6 p-7 lg:p-8 overflow-hidden border border-bridge-500/20",
                "bg-[#f7ebd9] dark:bg-[#13110d]",
                "shadow-[0_2px_10px_-8px_rgba(0,0,0,0.25)]",
                "dark:shadow-[0_2px_14px_-10px_rgba(0,0,0,0.6)]",
                "transition-[box-shadow] duration-300 ease-out",
                "hover:shadow-xl",
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

                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-0">
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-lg shrink-0 dark:text-black"
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
                            <span className="w-7 h-7 flex items-center justify-center rounded-md bg-bridge-500/15">
                                <Lock className="w-3.5 h-3.5" />
                            </span>
                        )}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={handleToggleVisibility}
                                disabled={pending}
                                aria-busy={pending}
                                aria-label={visible ? "Masquer le module" : "Rendre le module visible"}
                                className={cn(
                                    "pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-1.5",
                                    "text-[10px] uppercase tracking-[0.18em] font-semibold",
                                    "transition-colors duration-200 cursor-pointer",
                                    visible
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                        : "bg-bridge-700/30 text-brand-dark dark:bg-bridge-500/30 dark:text-bridge-100 hover:bg-bridge-700/50"
                                )}
                            >
                                {visible ? (
                                    <>
                                        <Eye className="w-3 h-3"/>
                                        <span className="hidden sm:inline">Visible</span>
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-3 h-3"/>
                                        <span className="hidden sm:inline">Masqué</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
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
        </motion.div>
    );
}
