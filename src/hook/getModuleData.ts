import {notFound} from 'next/navigation';
import getModules from "@/lib/getModules";

interface UseModuleDataProps {
    moduleSlug: string;
    sectionSlug?: string;
    contentSlug?: string;
}

export async function getModuleData({moduleSlug, sectionSlug, contentSlug}: UseModuleDataProps) {
    const modules = await getModules();
    const currentModule = modules.find(m => m.path === moduleSlug);

    if (!currentModule) notFound();

    let currentSection = null;
    let currentContent = null;

    if (sectionSlug) {
        currentSection = currentModule.sections.find(s => s.path === sectionSlug);
        if (!currentSection) notFound();

        if (contentSlug) {
            currentContent = currentSection.contents.find(c => c === contentSlug);
            if (!currentContent) notFound();
        }
    }

    return {
        modules,
        currentModule,
        currentSection,
        currentContent
    };
}