import {Sparkles} from "lucide-react";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";

interface ProgressSectionProps {
    currentModule: Module;
    totalSections: number;
    totalAvailableSections: number;
    progress: number;
    hasAvailableContent: boolean;
}

export default function ProgressSection({
                                            currentModule,
                                            totalSections,
                                            totalAvailableSections,
                                            progress,
                                            hasAvailableContent,
                                        }: ProgressSectionProps) {
    return (
        <section className="w-full px-6 lg:px-12 mb-16 lg:mb-20">
            <div className="max-w-4xl mx-auto opacity-0 animate-fade-in">
                <article
                    className={cn(
                        "relative overflow-hidden rounded-2xl",
                        "bg-bridge-300 border border-bridge-500/45",
                        "dark:bg-bridge-800 dark:border-bridge-500/35",
                        "shadow-[0_8px_28px_-12px_rgba(147,97,58,0.45)]",
                        "dark:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)]",
                        "p-7 lg:p-10"
                    )}
                >
                    {/* Top edge highlight */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30"
                    />

                    {/* Ambient glow (decorative) */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl"
                    />

                    <div className="relative flex flex-col gap-6 lg:gap-7 items-start lg:items-center text-left lg:text-center">

                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-brand-dark dark:text-bridge-200/80">
                            <Sparkles className="w-3.5 h-3.5"/>
                            Parcours du module
                        </div>

                        {/* Heading */}
                        <h4 className={cn(
                            "text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.05] text-brand-dark dark:text-brand-light",
                        )}>
                            Prêt à commencer
                            <span className={cn(`text-${currentModule.path}`)}>&nbsp;?</span>
                        </h4>

                        {hasAvailableContent ? (
                            <>
                                <p className="text-base lg:text-lg leading-relaxed font-medium text-brand-dark dark:text-bridge-100/90 max-w-2xl">
                                    Parcourez les <span className="font-bold tabular-nums">{totalAvailableSections}</span>{" "}
                                    cours sur <span className="font-bold tabular-nums">{totalSections}</span> de ce module à votre rythme.
                                </p>

                                {/* Progress bar — same style as cards */}
                                <div className="w-full max-w-2xl flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark dark:text-bridge-200/70">
                                        <span>Progression</span>
                                        <span className="tabular-nums text-brand-dark dark:text-bridge-100">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={cn("h-2 rounded-full transition-all duration-300", `bg-${currentModule.path}`)}
                                            style={{width: `${progress}%`}}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-base lg:text-lg leading-relaxed font-medium text-brand-dark dark:text-bridge-100/90 max-w-2xl">
                                Aucun cours n&apos;est encore disponible pour ce module.
                                <br/>
                                <span className="text-sm font-normal text-brand-dark/70 dark:text-bridge-100/60">
                                    Reviens bientôt — le contenu arrive très vite.
                                </span>
                            </p>
                        )}
                    </div>
                </article>
            </div>
        </section>
    );
}
