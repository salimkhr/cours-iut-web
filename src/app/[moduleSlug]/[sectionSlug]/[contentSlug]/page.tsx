import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowLeft, ArrowRight, BookOpen, CodeXml, FolderCode, GraduationCap, Presentation} from "lucide-react";

import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import HeroSection from "@/components/page/HeroSection";
import PageFooter from "@/components/page/PageFooter";
import ExamenWrapper from "@/components/ExamenWrapper";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getContentComponent} from "@/lib/getContentComponent";
import {cn} from "@/lib/utils";
import {Metadata} from "next";
import {currentUser} from "@clerk/nextjs/server";

interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentSlug: string;
    }>;
}

const CONTENT_ORDER = ['cours', 'TP', 'slide', 'projet', 'examen'] as const;
type ContentKey = typeof CONTENT_ORDER[number];

const CONTENT_LABELS: Record<ContentKey, string> = {
    cours: 'Cours',
    TP: 'TP',
    slide: 'Slides',
    projet: 'Projet',
    examen: 'Examen',
};

const CONTENT_DESC: Record<ContentKey, string> = {
    cours: 'Notions et concepts fondamentaux.',
    TP: 'Mise en pratique guidée, exercice par exercice.',
    slide: 'Présentation visuelle, navigation au clavier.',
    projet: 'Projet d\'application des acquis.',
    examen: 'Évaluation des compétences acquises.',
};

const CONTENT_ICON: Record<ContentKey, React.ComponentType<{className?: string}>> = {
    cours: BookOpen,
    TP: CodeXml,
    slide: Presentation,
    projet: FolderCode,
    examen: GraduationCap,
};

export async function generateMetadata({params}: ContentPageProps): Promise<Metadata> {
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({
        moduleSlug,
        sectionSlug,
    });

    return currentSection ? generatePageMetadata({currentModule, currentSection}) : {};
}

export default async function Content({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug, contentSlug} = await params;

    const user = await currentUser();
    const isAdmin = user?.publicMetadata?.role === 'admin';

    const {currentModule, currentSection, currentContent} =
        await getModuleData({
            moduleSlug,
            sectionSlug,
            contentSlug,
        });

    if (!currentContent || !currentSection) notFound();
    if (!isAdmin && currentSection.isAvailable === false) {
        notFound();
    }

    const ComponentToRender = await getContentComponent({
        currentModule,
        currentSection,
        currentContent,
    });

    const contentKey = currentContent as ContentKey;
    const ContentIcon = CONTENT_ICON[contentKey] ?? BookOpen;
    const contentLabel = CONTENT_LABELS[contentKey] ?? currentContent;
    const contentDesc = CONTENT_DESC[contentKey] ?? currentSection.description ?? '';

    // Prev / Next within the section's available contents (canonical order)
    const sortedContents = [...currentSection.contents].sort(
        (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
    );
    const currentIdx = sortedContents.indexOf(currentContent);
    const prevContent = currentIdx > 0 ? sortedContents[currentIdx - 1] : null;
    const nextContent = currentIdx >= 0 && currentIdx < sortedContents.length - 1
        ? sortedContents[currentIdx + 1]
        : null;

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <BreadcrumbGenerator
                currentModule={currentModule}
                currentSection={currentSection}
                currentContent={currentContent}
            />

            <HeroSection
                title={`${currentSection.order}. ${currentSection.title}`}
                description={contentDesc}
                imagePath={`images/header/header_${currentModule.path}.svg`}
                imageAlt={currentModule.title}
                path={currentModule.path}
                icon={<ContentIcon/>}
                compact
            />

            {/* Lesson body */}
            <main
                className={cn(
                    "w-full max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-14",
                    `header-${currentModule.path}`
                )}
            >
                {currentContent === "examen" && currentSection.examenIsLock ? (
                    <ExamenWrapper currentModule={currentModule}>
                        <ComponentToRender/>
                    </ExamenWrapper>
                ) : (
                    <ComponentToRender/>
                )}
            </main>

            {/* Prev / Next nav */}
            {(prevContent || nextContent) && (
                <nav
                    aria-label="Navigation entre contenus"
                    className="w-full max-w-5xl mx-auto px-6 lg:px-8 mb-16 lg:mb-20"
                >
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                        {prevContent ? (
                            <NavLink
                                href={`/${moduleSlug}/${sectionSlug}/${prevContent}`}
                                direction="prev"
                                label={CONTENT_LABELS[prevContent as ContentKey] ?? prevContent}
                                Icon={CONTENT_ICON[prevContent as ContentKey] ?? BookOpen}
                            />
                        ) : <span/>}
                        {nextContent ? (
                            <NavLink
                                href={`/${moduleSlug}/${sectionSlug}/${nextContent}`}
                                direction="next"
                                label={CONTENT_LABELS[nextContent as ContentKey] ?? nextContent}
                                Icon={CONTENT_ICON[nextContent as ContentKey] ?? BookOpen}
                            />
                        ) : <span/>}
                    </div>

                    {/* Back to section */}
                    <div className="mt-4 flex justify-center">
                        <Link
                            href={`/${moduleSlug}/${sectionSlug}`}
                            className="text-sm font-semibold text-brand-dark/70 dark:text-bridge-100/70 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors underline-offset-4 hover:underline"
                        >
                            Retour à la section
                        </Link>
                    </div>
                </nav>
            )}

            <PageFooter path={currentModule.path}/>
        </div>
    );
}

interface NavLinkProps {
    href: string;
    direction: 'prev' | 'next';
    label: string;
    Icon: React.ComponentType<{className?: string}>;
}

function NavLink({href, direction, label, Icon}: NavLinkProps) {
    const isPrev = direction === 'prev';
    return (
        <Link
            href={href}
            className={cn(
                "group/nav relative overflow-hidden flex items-center gap-3 lg:gap-4 rounded-2xl",
                "bg-bridge-300 border border-bridge-500/45",
                "dark:bg-bridge-800 dark:border-bridge-500/35",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                "p-4 lg:p-5",
                "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",
                "hover:-translate-y-1 hover:bg-bridge-200 hover:border-bridge-500/65",
                "dark:hover:bg-bridge-700 dark:hover:border-bridge-400/55",
                "hover:shadow-[0_18px_36px_-14px_rgba(147,97,58,0.5)]",
                "dark:hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,0.7)]",
                isPrev ? "justify-start text-left" : "justify-end text-right"
            )}
        >
            {/* Top edge highlight */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-bridge-100/70 to-transparent dark:via-bridge-500/30"
            />

            {isPrev && (
                <ArrowLeft
                    className="w-5 h-5 shrink-0 text-brand-dark dark:text-bridge-100 transition-transform duration-300 group-hover/nav:-translate-x-1"
                />
            )}

            <div className={cn("flex flex-col min-w-0", isPrev ? "items-start" : "items-end")}>
                <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                    {isPrev ? 'Précédent' : 'Suivant'}
                </span>
                <span className="inline-flex items-center gap-2 text-base lg:text-lg font-bold text-brand-dark dark:text-bridge-50 mt-0.5">
                    {!isPrev && <Icon className="w-4 h-4 shrink-0"/>}
                    <span className="truncate">{label}</span>
                    {isPrev && <Icon className="w-4 h-4 shrink-0"/>}
                </span>
            </div>

            {!isPrev && (
                <ArrowRight
                    className="w-5 h-5 shrink-0 text-brand-dark dark:text-bridge-100 transition-transform duration-300 group-hover/nav:translate-x-1"
                />
            )}
        </Link>
    );
}
