import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import HeroSection from "@/components/page/HeroSection";
import TagsBadges from "@/components/page/TagsBadges";
import CoursesSection from "@/components/page/CoursesSection";
import ContentCard from "@/components/Cards/ContentCard";
import PageFooter from "@/components/page/PageFooter";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

interface SectionPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateMetadata({params}: SectionPageProps) {
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({
        moduleSlug,
        sectionSlug
    });
    return currentSection !== null ? generatePageMetadata({currentModule, currentSection}) : {};
}

export default async function SectionPage({params}: SectionPageProps) {
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({
        moduleSlug,
        sectionSlug
    });

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <BreadcrumbGenerator currentModule={currentModule}/>

            <HeroSection
                title={`${currentSection?.order}. ${currentSection?.title}`}
                description={currentSection?.description}
                imagePath={`images/header/header_${currentModule.path}.svg`}
                imageAlt={currentModule.title}
                path={currentModule.path}
            />

            <TagsBadges
                tags={currentSection?.tags ?? []}
                moduleTheme={currentModule.title}
            />

            <CoursesSection
                title="Les cours"
                containerClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl mx-auto"
            >
                {currentSection?.contents.map((content, index) => (
                    <div
                        key={content}
                        className="opacity-0 animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                    >
                        <ContentCard
                            section={currentSection}
                            currentModule={currentModule}
                            content={content}
                        />
                    </div>
                ))}
            </CoursesSection>

            <PageFooter path={currentModule.path}/>
        </div>
    );
}