import {notFound} from "next/navigation";
import {BookOpen, CodeXml, Columns2, Target} from "lucide-react";

import HeroSection from "@/components/page/HeroSection";
import ContentSwitcher from "@/components/page/ContentSwitcher";
import ScrollRestore from "@/components/page/ScrollRestore";
import PageFooter from "@/components/page/PageFooter";
import ReadingProgress from "@/components/page/ReadingProgress";
import ContentSidebarNav from "@/components/page/ContentSidebarNav";
import ExamenWrapper from "@/components/ExamenWrapper";
import TableOfContents from "@/components/TableOfContents";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getContentComponent} from "@/lib/getContentComponent";
import {cn} from "@/lib/utils";
import {CONTENT_DESC, CONTENT_ICON, ContentKey} from "@/lib/contentMeta";
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
        if (!currentSection.contents.includes('cours') || !currentSection.contents.includes('TP')) {
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
    }

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
                icon={<ContentIcon/>}
                backHref={`/${moduleSlug}`}
                backLabel={currentModule.title}
                compact
            >
                {currentSection.objectives && currentSection.objectives.length > 0 && (
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <Target
                                className="w-4 h-4"
                                style={{color: `var(--color-${currentModule.path})`}}
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
                                        style={{backgroundColor: `var(--color-${currentModule.path})`}}
                                    />
                                    <span>{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </HeroSection>

            <div className="2xl:hidden">
                <ContentSwitcher
                    contents={currentSection.contents}
                    currentContent={isSplit ? SPLIT_SLUG : currentContent!}
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                    sectionTitle={`${currentSection.order}. ${currentSection.title}`}
                />
            </div>

            <div className="sticky top-(--navbar-h) z-30 w-full">
                <ReadingProgress modulePath={currentModule.path}/>
            </div>
            <div className="hidden 2xl:flex sticky top-(--navbar-h) z-[25] w-full justify-end">
                <div className="flex pt-2.5 pb-1 px-1 border-l border-b border-border rounded-bl-xl bg-brand-light/85 dark:bg-brand-dark/85 backdrop-blur-md">
                    <ContentSidebarNav
                        contents={currentSection.contents}
                        currentContent={isSplit ? SPLIT_SLUG : currentContent!}
                        moduleSlug={moduleSlug}
                        sectionSlug={sectionSlug}
                    />
                </div>
            </div>

            {isSplit && CoursComponent && TPComponent ? (
                <div className="flex flex-col lg:flex-row w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 gap-4 lg:gap-0 lg:h-[calc(100dvh-var(--navbar-h)-3.5rem)]">
                    <SplitPane
                        label="Cours"
                        Icon={BookOpen}
                        modulePath={currentModule.path}
                        side="left"
                    >
                        <CoursComponent/>
                    </SplitPane>
                    <SplitPane
                        label="TP"
                        Icon={CodeXml}
                        modulePath={currentModule.path}
                        side="right"
                    >
                        <TPComponent/>
                    </SplitPane>
                </div>
            ) : ComponentToRender && (
                <>
                    <main
                        className={cn(
                            "w-full max-w-7xl mx-auto px-3 lg:px-4 py-10 lg:py-14",
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
                    {(currentContent === 'cours' || currentContent === 'TP' || currentContent === 'examen') && (
                        <TableOfContents
                            modulePath={currentModule.path}
                            currentContent={currentContent as ContentKey}
                            moduleSlug={moduleSlug}
                            sectionSlug={sectionSlug}
                            sectionContents={currentSection.contents}
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
    modulePath: string;
    side: 'left' | 'right';
    children: React.ReactNode;
}

function SplitPane({label, Icon, modulePath, side, children}: SplitPaneProps) {
    return (
        <section
            aria-label={label}
            className={cn(
                "lg:w-1/2 lg:overflow-y-auto",
                side === 'left'
                    ? "lg:pr-4 xl:pr-6"
                    : "lg:pl-4 xl:pl-6 lg:border-l lg:border-bridge-500/30 lg:dark:border-bridge-500/25",
                `header-${modulePath}`
            )}
        >
            <div className="mb-4 flex items-center gap-2 lg:sticky lg:top-0 bg-brand-light/85 dark:bg-brand-dark/85 backdrop-blur-md py-2 z-10">
                <Icon
                    className="w-4 h-4"
                    style={{color: `var(--color-${modulePath})`}}
                />
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                    {label}
                </h2>
            </div>
            {children}
        </section>
    );
}