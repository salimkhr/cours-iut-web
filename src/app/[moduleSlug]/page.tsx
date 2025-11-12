import SectionCard from "@/components/Cards/SectionCard";
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import Section from "@/types/Section";
import iconMap from "@/lib/iconMap";
import {BookOpen} from "lucide-react";
import PageFooter from "@/components/page/PageFooter";
import ProgressSection from "@/components/page/ProgressSection";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getModuleData} from "@/hook/getModuleData";
import ModuleInfo from "@/components/page/ModuleInfo";


interface ModulePageProps {
    params: Promise<{ moduleSlug: string; }>;
}

export async function generateMetadata({params}: ModulePageProps) {
    const {moduleSlug} = await params;
    const {currentModule} = await getModuleData({moduleSlug});
    return generatePageMetadata({currentModule});
}

export default async function Module({params}: ModulePageProps) {
    const {moduleSlug} = await params;
    const {currentModule} = await getModuleData({moduleSlug});

    // Module statistics
    const totalSections = currentModule.sections.filter(
        (section: Section) => !section.contents.includes('examen')
    ).length;

    const totalAvailableSections = currentModule.sections.filter(
        (section: Section) => section.isAvailable && !section.contents.includes('examen')
    ).length;

    const totalSectionsProgress =  currentModule.sections.filter(
        (section: Section) => !section.contents.includes('examen')
    ).reduce(
        (sum, section: Section) => sum + (section.totalDuration || 1),
        0
    );

    const totalAvailableSectionsProgress = currentModule.sections
        .filter((section: Section) => section.isAvailable && !section.contents.includes('examen'))
        .reduce((sum, section: Section) => sum + (section.totalDuration || 1), 0);

    const progress = totalSections > 0
        ? Math.round((totalAvailableSectionsProgress / totalSectionsProgress) * 100)
        : 0;
    const hasAvailableContent = totalAvailableSections > 0;
    const allTags = [...new Set(
        currentModule.sections.flatMap((section: Section) => section.tags || [])
    )].sort((a, b) => a.localeCompare(b));
    const Icon = iconMap[currentModule.iconName] || BookOpen;

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <BreadcrumbGenerator currentModule={currentModule}/>

            <HeroSection
                title={currentModule.title}
                description={currentModule.description}
                imagePath={`images/header/header_${currentModule.path}.svg`}
                imageAlt={currentModule.title}
                tags={allTags}
                icon={<Icon size={70} className="mb-4"/>}
                path={currentModule.path}
            >

                <ModuleInfo currentModule={currentModule}/>
            </HeroSection>


            <CoursesSection title="Les cours">
                {currentModule.sections.sort((s1,s2) => s1.order - s2.order).map((section, index) => (
                    <div
                        key={section.path}
                        className="opacity-0 animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                    >
                        <SectionCard currentModule={currentModule} section={section}/>
                    </div>
                ))}
            </CoursesSection>

            <ProgressSection
                currentModule={currentModule}
                totalSections={totalSections}
                totalAvailableSections={totalAvailableSections}
                progress={progress}
                hasAvailableContent={hasAvailableContent}
            />

            <PageFooter path={currentModule.path}/>
        </div>
    );
}