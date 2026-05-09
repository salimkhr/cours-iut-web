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
import getModuleProgress from "@/lib/getModuleProgress";
import ModuleInfo from "@/components/page/ModuleInfo";
import {Metadata} from "next";
import {currentUser} from "@clerk/nextjs/server";


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

    const {totalSections, totalAvailableSections, progress, hasAvailableContent} =
        getModuleProgress(currentModule);

    // 🔐 Clerk auth
    const user = await currentUser();
    const isAdmin = user?.publicMetadata?.role === 'admin';

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
                {currentModule.sections.sort((s1, s2) => s1.order - s2.order).map((section, index) => (
                    <div
                        key={section.path}
                        className="opacity-0 animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                    >
                        <SectionCard currentModule={currentModule} section={section} isAdmin={isAdmin}/>
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