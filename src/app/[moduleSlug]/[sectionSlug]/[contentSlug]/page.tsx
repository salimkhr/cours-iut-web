import {notFound, redirect} from "next/navigation";
import {BookOpen, CodeXml, Columns2, Target} from "lucide-react";

import HeroSection from "@/components/page/HeroSection";
import ScrollRestore from "@/components/page/ScrollRestore";
import PageFooter from "@/components/page/PageFooter";
import ReadingProgress from "@/components/page/ReadingProgress";
import ContentSidebarNav from "@/components/page/ContentSidebarNav";
import CopyContextGuard from "@/components/page/CopyContextGuard";
import PromptModeButton from "@/components/page/PromptModeButton";
import ExamenWrapper from "@/components/ExamenWrapper";
import TableOfContents from "@/components/TableOfContents";
import {getModuleData} from "@/hook/getModuleData";
import {moduleColor} from "@/lib/moduleColor";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getContentComponent} from "@/lib/getContentComponent";
import {cn} from "@/lib/utils";
import {CONTENT_DESC, CONTENT_ICON, ContentKey} from "@/lib/contentMeta";
import {getContentTypes, hasContentType} from "@/types/CourseContent";
import {Metadata} from "next";
import {getServerSession} from "@/lib/auth";

const SPLIT_SLUG = 'split';

interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentSlug: string;
    }>;
}

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
    const isSplit = contentSlug === SPLIT_SLUG;

    const session = await getServerSession();
    const isAdmin = session?.user.role === 'admin';

    const {currentModule, currentSection, currentContent} = await getModuleData({
        moduleSlug,
        sectionSlug,
        contentSlug: isSplit ? undefined : contentSlug,
    });

    if (!currentSection) notFound();
    if (!isAdmin && currentSection.isAvailable === false) notFound();

    if (isSplit) {
        if (!hasContentType(currentSection.contents, 'cours') || !hasContentType(currentSection.contents, 'TP')) {
            notFound();
        }
    } else if (!currentContent) {
        notFound();
    }

    type AnyComponent = React.ComponentType;
    let CoursComponent: AnyComponent | null = null;
    let TPComponent: AnyComponent | null = null;
    let ComponentToRender: AnyComponent | null = null;

    if (isSplit) {
        [CoursComponent, TPComponent] = await Promise.all([
            getContentComponent({currentModule, currentSection, currentContent: 'cours'}),
            getContentComponent({currentModule, currentSection, currentContent: 'TP'}),
        ]);
    } else {
        ComponentToRender = await getContentComponent({
            currentModule,
            currentSection,
            currentContent: currentContent!,
        });
        if (!ComponentToRender) {
            if (isAdmin) {
                redirect(`/admin/content/${moduleSlug}/${sectionSlug}/${currentContent}`);
            }
            notFound();
        }
    }

    const accent = moduleColor(currentModule);
    const accentDark = moduleColor(currentModule, 'dark');

    const contentKey = currentContent as ContentKey;
    const ContentIcon = isSplit ? Columns2 : (CONTENT_ICON[contentKey] ?? BookOpen);
    const contentDesc = isSplit
        ? 'Cours et TP en parallèle.'
        : (CONTENT_DESC[contentKey] ?? currentSection.description ?? '');

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            {!isSplit && (
                <ScrollRestore storageKey={`${moduleSlug}/${sectionSlug}/${currentContent}`}/>
            )}
            <HeroSection
                title={`${currentSection.order}. ${currentSection.title}`}
                description={contentDesc}
                imagePath={`images/header/header_${currentModule.path}.svg`}
                imageAlt={currentModule.title}
                path={currentModule.path}
                accentColor={accent}
                icon={<ContentIcon/>}
                backHref={`/${moduleSlug}`}
                backLabel={currentModule.title}
                compact
            >
                {currentSection.objectives && currentSection.objectives.length > 0 && (
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <Target
                                className="size-4"
                                style={{color: accent}}
                            />
                            <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                                Objectifs du cours
                            </h2>
                        </div>
                        <ul className="space-y-1.5 sm:columns-2 sm:gap-x-6 text-sm text-brand-dark/85 dark:text-bridge-100/85">
                            {currentSection.objectives.map((objective, i) => (
                                <li key={i} className="flex items-start gap-2 break-inside-avoid">
                                    <span
                                        className="mt-2 h-1 w-1 rounded-full shrink-0"
                                        style={{backgroundColor: accent}}
                                    />
                                    <span>{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </HeroSection>

            {!isSplit && (
                <ReadingProgress modulePath={currentModule.path} accentColor={accent}/>
            )}
            <div className="flex sticky top-(--navbar-h) z-[25] w-full justify-end">
                <div className={cn("flex items-center px-1 border-l border-b border-border rounded-bl-xl bg-transparent backdrop-blur-xs", isSplit ? "py-1" : "pt-2.5 pb-1")}>
                    <ContentSidebarNav
                        contents={getContentTypes(currentSection.contents)}
                        currentContent={isSplit ? SPLIT_SLUG : currentContent!}
                        moduleSlug={moduleSlug}
                        sectionSlug={sectionSlug}
                        accentColor={accent}
                    />
                    {(currentContent === 'cours' || currentContent === 'TP') && !isSplit && (
                        <>
                            <div className="h-4 w-px bg-border mx-0.5 shrink-0" />
                            <PromptModeButton
                                accentColor={accent}
                                sectionTitle={currentSection.title}
                                contentType={currentContent as ContentKey}
                            />
                        </>
                    )}
                </div>
            </div>

            {isSplit && CoursComponent && TPComponent ? (
                <div className="flex flex-col lg:flex-row w-full max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-0 py-1 gap-2 lg:gap-0 lg:h-[calc(100dvh-var(--navbar-h)-3.5rem)]">
                    <SplitPane
                        label="Cours"
                        Icon={BookOpen}
                        accentColor={accent}
                        accentColorDark={accentDark}
                        side="left"
                    >
                        <CoursComponent/>
                    </SplitPane>
                    <SplitPane
                        label="TP"
                        Icon={CodeXml}
                        accentColor={accent}
                        accentColorDark={accentDark}
                        side="right"
                    >
                        <TPComponent/>
                    </SplitPane>
                </div>
            ) : ComponentToRender && (
                <>
                    <main
                        className={cn(
                            "w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14",
                            "header-module"
                        )}
                        style={{
                            '--module-color': accent,
                            '--module-color-dark': accentDark,
                        } as React.CSSProperties}
                    >
                        <CopyContextGuard contentType={currentContent ?? ''}>
                            <div className={cn("course-content", currentContent === "TP" && "course-content-practice")}>
                                {currentContent === "examen" && currentSection.examenIsLock ? (
                                    <ExamenWrapper currentModule={currentModule}>
                                        <ComponentToRender/>
                                    </ExamenWrapper>
                                ) : (
                                    <ComponentToRender/>
                                )}
                            </div>
                        </CopyContextGuard>
                    </main>
                    {(currentContent === 'cours' || currentContent === 'TP' || currentContent === 'examen') && (
                        <TableOfContents
                            modulePath={currentModule.path}
                            currentContent={currentContent as ContentKey}
                            moduleSlug={moduleSlug}
                            sectionSlug={sectionSlug}
                            sectionContents={getContentTypes(currentSection.contents)}
                            accentColor={accent}
                        />
                    )}
                </>
            )}

            {!isSplit && <PageFooter path={currentModule.path}/>}

        </div>
    );
}

interface SplitPaneProps {
    label: string;
    Icon: React.ComponentType<{className?: string; style?: React.CSSProperties}>;
    accentColor: string;
    accentColorDark: string;
    side: 'left' | 'right';
    children: React.ReactNode;
}

function SplitPane({label, Icon, accentColor, accentColorDark, side, children}: SplitPaneProps) {
    return (
        <section
            aria-label={label}
            className={cn(
                "max-h-[70dvh] overflow-y-auto px-3 py-2 sm:px-4 lg:max-h-none lg:w-1/2 lg:px-6 lg:py-3 header-module",
                side === 'left'
                    ? "lg:pr-6"
                    : "lg:pl-6 lg:border-l lg:border-bridge-500/30 lg:dark:border-bridge-500/25",
            )}
            style={{
                '--module-color': accentColor,
                '--module-color-dark': accentColorDark,
            } as React.CSSProperties}
        >
            <div className="mb-4 flex items-center gap-2 lg:sticky lg:top-0 bg-background/85 backdrop-blur-md py-2 z-10">
                <Icon
                    className="size-4"
                    style={{color: accentColor}}
                />
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                    {label}
                </h2>
            </div>
            <div className="course-content course-content-split">
                {children}
            </div>
        </section>
    );
}
