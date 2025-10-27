import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import Heading from "@/components/ui/Heading";
import {contentImports} from '@/lib/contentImports';
import {notFound} from "next/navigation";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentSlug: string;
    }>;
}

export async function generateMetadata({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({
        moduleSlug,
        sectionSlug
    });
    return currentSection !== null ? generatePageMetadata({currentModule, currentSection}) : {};
}

export default async function Content({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug, contentSlug} = await params;
    const {currentModule, currentSection, currentContent} = await getModuleData({
        moduleSlug,
        sectionSlug,
        contentSlug
    });

    if (currentContent === null) notFound();
    if (currentSection === null) notFound();
    
    const importFunc = contentImports?.[moduleSlug]?.[sectionSlug]?.[contentSlug.charAt(0).toUpperCase() + contentSlug.slice(1)] ?? [];
    if (!importFunc) notFound();

    const ComponentToRender = (await importFunc()).default;
    if (!ComponentToRender) notFound();

    if(currentSection.isAvailable === false) notFound();

    return (
        <div>
            <BreadcrumbGenerator
                currentModule={currentModule}
                currentSection={currentSection}
                currentContent={currentContent}
            />

            <div className={`lg:mx-10 header-${currentModule.path} py-20 mb-12 lg:mb-6`}>
                <Heading level={1}>
                    {currentSection.order}. {currentSection.title}
                </Heading>

                {/*<AntiCopyProtector>*/}
                <ComponentToRender/>
                {/*</AntiCopyProtector>*/}

                {/*<ChatWidget currentModule={currentModule}/>*/}
            </div>
        </div>
    );
}