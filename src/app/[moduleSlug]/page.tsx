import {moduleColor} from "@/lib/moduleColor";
import SectionCard from "@/components/Cards/SectionCard";
import Section from "@/types/Section";
import iconMap, {isValidIcon} from "@/lib/iconMap";
import PageFooter from "@/components/page/PageFooter";
import ProgressSection from "@/components/page/ProgressSection";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getModuleData} from "@/hook/getModuleData";
import getModuleProgress from "@/lib/getModuleProgress";
import ModuleInfo from "@/components/page/ModuleInfo";
import ResumeCourseButton from "@/components/page/ResumeCourseButton";
import {Metadata} from "next";
import {getServerSession} from "@/lib/auth";
import {getCorrectionBaseUrl} from "@/lib/gitlab";


interface ModulePageProps {
    params: Promise<{ moduleSlug: string; }>;
}

export async function generateMetadata({params,}: ModulePageProps): Promise<Metadata> {
    const {moduleSlug} = await params;
    const {currentModule} = await getModuleData({moduleSlug});

    return generatePageMetadata({currentModule});
}

export default async function Module({params}: ModulePageProps) {
    const {moduleSlug} = await params;
    const {currentModule} = await getModuleData({moduleSlug});

    const {totalSections, totalAvailableSections, hasAvailableContent, availableSections} =
        getModuleProgress(currentModule);

    const session = await getServerSession();
    const isAdmin = session?.user.role === 'admin';

    // Lu au runtime (serveur) : le bouton « Correction » n'est plus figé au build.
    const correctionBaseUrl = getCorrectionBaseUrl();

    const allTags = [...new Set(
        currentModule.sections.flatMap((section: Section) => section.tags || [])
    )].sort((a, b) => a.localeCompare(b));
    if (!isValidIcon(currentModule.iconName)) {
        throw new Error(`Module "${currentModule.path}" : icône "${currentModule.iconName}" introuvable dans Lucide`);
    }
    const Icon = iconMap[currentModule.iconName];

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <HeroSection
                title={currentModule.title}
                description={currentModule.description}
                imagePath={`images/header/header_${currentModule.path}.svg`}
                imageAlt={currentModule.title}
                tags={allTags}
                icon={<Icon size={56} className="mb-4"/>}
                path={currentModule.path}
                accentColor={moduleColor(currentModule)}
                compact
                backHref="/"
                backLabel="Tous les cours"
            >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {hasAvailableContent && (
                        <ResumeCourseButton
                            modulePath={currentModule.path}
                            accentColor={moduleColor(currentModule)}
                            accentColorDark={moduleColor(currentModule, 'dark')}
                            sections={availableSections}
                        />
                    )}
                    <ModuleInfo currentModule={currentModule}/>
                </div>
            </HeroSection>

            <ProgressSection
                currentModule={currentModule}
                totalSections={totalSections}
                totalAvailableSections={totalAvailableSections}
            />

            <CoursesSection title="Les cours">
                {currentModule.sections.sort((s1, s2) => s1.order - s2.order).map((section, index) => (
                    <div
                        key={section.path}
                        className="opacity-0 animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                    >
                        <SectionCard currentModule={currentModule} section={section} isAdmin={isAdmin} correctionBaseUrl={correctionBaseUrl}/>
                    </div>
                ))}
            </CoursesSection>

            <PageFooter path={currentModule.path}/>
        </div>
    );
}
