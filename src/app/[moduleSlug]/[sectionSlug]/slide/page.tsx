import {contentImports} from '@/lib/contentImports';
import {notFound} from "next/navigation";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
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
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({
        moduleSlug,
        sectionSlug,
    });

    if (currentSection === null) notFound();

    const importFunc = contentImports?.[moduleSlug]?.[sectionSlug]?.['Slide'] ?? [];
    if (!importFunc) notFound();

    const ComponentToRender = (await importFunc()).default;
    if (!ComponentToRender) notFound();

    if(currentSection.isAvailable === false) notFound();

    return (
        <div className={`header-${currentModule.path}`}>
            <ComponentToRender/>
        </div>
    );
}