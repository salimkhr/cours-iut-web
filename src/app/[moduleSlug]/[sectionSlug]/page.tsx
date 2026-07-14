import {TelescopeIcon} from "@/components/icons/telescope";
import {getServerSession} from "@/lib/auth";
import {moduleColor} from "@/lib/moduleColor";

import HeroSection from "@/components/page/HeroSection";
import SectionStats from "@/components/page/SectionStats";
import ContentCard from "@/components/Cards/ContentCard";
import SectionNavCard from "@/components/Cards/SectionNavCard";
import PageFooter from "@/components/page/PageFooter";
import EditSectionFab from "@/components/admin/EditSectionFab";
import {List, ListItem} from "@/components/ui/List";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {cn} from "@/lib/utils";
import Section from "@/types/Section";
import { getContentTypes } from "@/types/CourseContent";
import {Metadata} from "next";

interface SectionPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateMetadata({params}: SectionPageProps): Promise<Metadata> {
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({moduleSlug, sectionSlug});

    return currentSection !== null
        ? generatePageMetadata({currentModule, currentSection})
        : {};
}

export default async function SectionPage({params}: SectionPageProps) {
    const {moduleSlug, sectionSlug} = await params;

    const {currentModule, currentSection} = await getModuleData({moduleSlug, sectionSlug});

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

    const hasObjectives =
        !!currentSection?.objectives && currentSection.objectives.length > 0;

    const session = await getServerSession();
    const isAdmin = session?.user.role === "admin";

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <HeroSection
                title={`${currentSection?.order}. ${currentSection?.title}`}
                description={currentSection?.description}
                imagePath={`images/header/header_${currentModule.path}.svg`}
                imageAlt={currentModule.title}
                path={currentModule.path}
                accentColor={moduleColor(currentModule)}
                tags={currentSection?.tags ?? []}
                compact
                backHref={`/${moduleSlug}`}
                backLabel={currentModule.title}
            />

            {/* Stats + Nav latérale */}
            {currentSection && (
                <section className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-6 lg:-mt-9 mb-6 lg:mb-8">

                    {/* STATS — centré, taille fixe */}
                    <div className="relative max-w-2xl mx-auto">
                        <SectionStats
                            totalDuration={currentSection.totalDuration}
                            contentsCount={currentSection.contents.length}
                            position={`${currentIndex >= 0 ? currentIndex + 1 : "?"} / ${orderedSections.length}`}
                            currentModule={currentModule}
                        />
                    </div>

                    {/* NAV — sous les stats sur mobile, latérale absolue sur desktop */}
                    <div className={cn(
                        "mt-3 flex flex-col gap-2",
                        "lg:mt-0 lg:flex-row lg:absolute lg:inset-0 lg:items-center lg:justify-between lg:pointer-events-none lg:translate-y-6"
                    )}>
                        <div className="w-full min-w-0 lg:flex-none lg:w-[210px] lg:pointer-events-auto">
                            {prevSection ? (
                                <SectionNavCard
                                    href={`/${moduleSlug}/${prevSection.path}`}
                                    direction="prev"
                                    section={prevSection}
                                />
                            ) : (
                                <div className="lg:hidden"/>
                            )}
                        </div>

                        <div className="w-full min-w-0 lg:flex-none lg:w-[210px] lg:pointer-events-auto">
                            {nextSection ? (
                                <SectionNavCard
                                    href={`/${moduleSlug}/${nextSection.path}`}
                                    direction="next"
                                    section={nextSection}
                                />
                            ) : (
                                <div className="lg:hidden"/>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* OBJECTIFS — bandeau compact pleine largeur */}
            {hasObjectives && (
                <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-6 lg:mb-8">
                    <div
                        className={cn(
                            "rounded-2xl px-5 py-4 sm:px-6",
                            "bg-bridge-50 dark:bg-bridge-800",
                            "border border-bridge-500/45 dark:border-bridge-500/35"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TelescopeIcon size={16} className="text-brand-dark dark:text-bridge-100"/>
                            <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                                Objectifs du cours
                            </h2>
                        </div>
                        <List
                            spacing="compact"
                            className="sm:columns-2 lg:columns-3 sm:gap-x-8 text-sm"
                        >
                            {currentSection!.objectives!.map((objective, i) => (
                                <ListItem key={i} className="break-inside-avoid">
                                    {objective}
                                </ListItem>
                            ))}
                        </List>
                    </div>
                </section>
            )}

            {/* COURSES — sans gros titre, padding réduit */}
            <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-12 lg:pb-16">
                <h2 className="sr-only">Les cours</h2>
                <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
                    {currentSection && getContentTypes(currentSection.contents).map((content, index) => (
                        <div
                            key={content}
                            className={cn(
                                "basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-1rem)] max-w-md",
                                "opacity-0 animate-fade-in-up"
                            )}
                            style={{animationDelay: `${index * 0.08}s`}}
                        >
                            <ContentCard
                                section={currentSection}
                                currentModule={currentModule}
                                content={content}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <PageFooter path={currentModule.path}/>

            {isAdmin && currentSection && (
                <EditSectionFab modData={currentModule} section={currentSection}/>
            )}
        </div>
    );
}
