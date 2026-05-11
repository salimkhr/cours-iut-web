import {BookOpen, CheckCircle2, Clock} from "lucide-react";
import Module from "@/types/Module";
import Section from "@/types/Section";
import Stat from "@/components/page/Stat";
import {cn} from "@/lib/utils";

interface ProgressSectionProps {
    currentModule: Module;
    totalSections: number;
    totalAvailableSections: number;
}

export default function ProgressSection({
                                            currentModule,
                                            totalSections,
                                            totalAvailableSections,
                                        }: ProgressSectionProps) {
    const totalSeances = (currentModule.sections ?? [])
        .filter((s: Section) => !s.contents.includes("examen"))
        .reduce((sum, s) => sum + (s.totalDuration || 1), 0);

    return (
        <section
            className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-6 lg:-mt-9 mb-6 lg:mb-8">
            <div className="relative max-w-2xl mx-auto opacity-0 animate-fade-in">
                <div
                    className={cn(
                        "grid grid-cols-3 gap-2 sm:gap-4 rounded-2xl",
                        // Même fond que les cards (sans le pont)
                        "bg-[#f7ebd9] dark:bg-[#13110d]",
                        "border border-bridge-500/45 dark:border-bridge-500/35",
                        "shadow-[0_8px_28px_-12px_rgba(147,97,58,0.45)]",
                        "dark:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)]",
                        "p-5 sm:p-6 lg:p-7",
                        "relative overflow-hidden"
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30"
                    />

                    <Stat
                        Icon={BookOpen}
                        label="Cours"
                        value={totalSections}
                        modulePath={currentModule.path}
                    />
                    <Stat
                        Icon={CheckCircle2}
                        label="Disponibles"
                        value={totalAvailableSections}
                        modulePath={currentModule.path}
                        withDivider
                    />
                    <Stat
                        Icon={Clock}
                        label="Séances"
                        value={totalSeances}
                        modulePath={currentModule.path}
                        withDivider
                    />
                </div>
            </div>
        </section>
    );
}
