import Link from "next/link";
import {ArrowLeft, ArrowRight, Clock, Hash, Layers, NotebookPen} from "lucide-react";

import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import ContentCard from "@/components/Cards/ContentCard";
import PageFooter from "@/components/page/PageFooter";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {cn} from "@/lib/utils";
import Section from "@/types/Section";
import {Metadata} from "next";

interface SectionPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateMetadata({
                                           params,
                                       }: SectionPageProps): Promise<Metadata> {
    const { moduleSlug, sectionSlug } = await params;
    const { currentModule, currentSection } = await getModuleData({
        moduleSlug,
        sectionSlug,
    });

    return currentSection !== null
        ? generatePageMetadata({ currentModule, currentSection })
        : {};
}

export default async function SectionPage({ params }: SectionPageProps) {
    const { moduleSlug, sectionSlug } = await params;

    const { currentModule, currentSection } = await getModuleData({
        moduleSlug,
        sectionSlug,
    });

    const orderedSections = [...(currentModule.sections ?? [])].sort(
        (a, b) => a.order - b.order
    );

    const currentIndex = currentSection
        ? orderedSections.findIndex((s) => s.path === currentSection.path)
        : -1;

    const prevSection: Section | null =
        currentIndex > 0 ? orderedSections[currentIndex - 1] : null;

    const nextSection: Section | null =
        currentIndex >= 0 && currentIndex < orderedSections.length - 1
            ? orderedSections[currentIndex + 1]
            : null;

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <BreadcrumbGenerator currentModule={currentModule} />

            <HeroSection
                title={`${currentSection?.order}. ${currentSection?.title}`}
                description={currentSection?.description}
                imagePath={`images/header/header_${currentModule.path}.svg`}
                imageAlt={currentModule.title}
                path={currentModule.path}
                tags={currentSection?.tags ?? []}
                compact
            />

            {/* Stats */}
            {currentSection && (
                <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-6 lg:-mt-9 mb-10 lg:mb-14">

                    <div className="grid grid-cols-[auto_1fr_auto] items-stretch gap-6">

                        {/* LEFT NAV */}
                        <div className="flex items-center">
                            {prevSection ? (
                                <SectionNavCard
                                    href={`/${moduleSlug}/${prevSection.path}`}
                                    direction="prev"
                                    section={prevSection}
                                />
                            ) : <div />}
                        </div>

                        {/* STATS */}
                        <div className="relative">
                            <div
                                className={cn(
                                    "grid grid-cols-3 gap-2 sm:gap-4 rounded-2xl",
                                    "bg-bridge-300 border border-bridge-500/45",
                                    "dark:bg-bridge-800 dark:border-bridge-500/35",
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
                                    Icon={Clock}
                                    label="Séances"
                                    value={currentSection.totalDuration}
                                    unit={currentSection.totalDuration > 1 ? "séances" : "séance"}
                                />

                                <Stat
                                    Icon={Layers}
                                    label="Contenus"
                                    value={currentSection.contents.length}
                                    unit={currentSection.contents.length > 1 ? "modules" : "module"}
                                    withDivider
                                />

                                <Stat
                                    Icon={Hash}
                                    label="Position"
                                    value={`${currentIndex >= 0 ? currentIndex + 1 : "?"} / ${orderedSections.length}`}
                                    unit="dans le module"
                                    withDivider
                                />
                            </div>
                        </div>

                        {/* RIGHT NAV */}
                        <div className="flex items-center justify-end">
                            {nextSection ? (
                                <SectionNavCard
                                    href={`/${moduleSlug}/${nextSection.path}`}
                                    direction="next"
                                    section={nextSection}
                                />
                            ) : <div />}
                        </div>

                    </div>
                </section>
            )}

            {/* COURSES + NAV HEADER */}
            <CoursesSection title="Les cours">
                {currentSection?.contents.map((content, index) => (
                    <div
                        key={content}
                        className="opacity-0 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <ContentCard
                            section={currentSection}
                            currentModule={currentModule}
                            content={content}
                        />
                    </div>
                ))}
            </CoursesSection>

            <PageFooter path={currentModule.path} />
        </div>
    );
}

/* ---------------- STAT ---------------- */

interface StatProps {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number | string;
    unit?: string;
    withDivider?: boolean;
}

function Stat({
                  Icon,
                  label,
                  value,
                  unit,
                  withDivider,
              }: StatProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left px-2 sm:px-4",
                withDivider &&
                "sm:border-l sm:border-bridge-700/25 dark:sm:border-bridge-500/30"
            )}
        >
            <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-bridge-700/15 text-brand-dark dark:bg-bridge-500/25 dark:text-bridge-100">
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex flex-col min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                    <Icon className="w-3.5 h-3.5 sm:hidden" />
                    {label}
                </span>

                <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-brand-dark dark:text-bridge-50 tabular-nums leading-none mt-1">
                    {value}
                </span>

                {unit && (
                    <span className="text-[11px] sm:text-xs text-brand-dark/60 dark:text-bridge-100/60 mt-1 truncate">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ---------------- NAV CARD ---------------- */

interface SectionNavCardProps {
    href: string;
    direction: "prev" | "next";
    section: Section;
}

function SectionNavCard({
                            href,
                            direction,
                            section,
                        }: SectionNavCardProps) {
    const isPrev = direction === "prev";

    return (
        <Link
            href={href}
            className={cn(
                "group/nav flex items-center gap-3 rounded-xl",
                "bg-bridge-300 border border-bridge-500/45",
                "dark:bg-bridge-800 dark:border-bridge-500/35",
                "px-3 py-2",
                "hover:bg-bridge-200 dark:hover:bg-bridge-700",
                "transition-all duration-300"
            )}
        >
            {isPrev && (
                <ArrowLeft className="w-4 h-4 text-brand-dark dark:text-bridge-100" />
            )}

            <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-brand-dark/60 dark:text-bridge-200/60 flex items-center gap-1">
                    <NotebookPen className="w-3 h-3" />
                    {isPrev ? "Précédente" : "Suivante"}
                </span>

                <span className="text-sm font-semibold text-brand-dark dark:text-bridge-50 truncate max-w-[180px]">
                    {section.order}. {section.title}
                </span>
            </div>

            {!isPrev && (
                <ArrowRight className="w-4 h-4 text-brand-dark dark:text-bridge-100" />
            )}
        </Link>
    );
}