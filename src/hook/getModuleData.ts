import {notFound} from 'next/navigation';
import getModules from "@/lib/getModules";
import {getServerSession} from "@/lib/auth";

interface UseModuleDataProps {
    moduleSlug: string;
    sectionSlug?: string;
    contentSlug?: string;
}

export async function getModuleData({moduleSlug, sectionSlug, contentSlug}: UseModuleDataProps) {
    const [modules, session] = await Promise.all([getModules(), getServerSession()]);
    const isAdmin = session?.user.role === 'admin';

    const currentModule = modules.find(m => m.path === moduleSlug);

    if (!currentModule) notFound();
    if (currentModule.isVisible === false && !isAdmin) notFound();

    let currentSection = null;
    let currentContent = null;

    if (sectionSlug) {
        currentSection = currentModule.sections.find(s => s.path === sectionSlug);
        if (!currentSection) notFound();

        if (contentSlug) {
            const ref = currentSection.contents.find(c => c.type === contentSlug);
            currentContent = ref ? ref.type : null;
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