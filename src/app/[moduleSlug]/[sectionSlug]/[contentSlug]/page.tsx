import {notFound} from 'next/navigation';
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import dynamic from 'next/dynamic'
import AntiCopyProtector from "@/components/AntiCopyProtector";
import Heading from "@/components/ui/Heading";
import ChatWidget from "@/components/ia/ChatWidget";
import getModules from "@/lib/getModules";


interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentSlug: string;
    }>;
}

export async function generateMetadata({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug} = await params;
    const modules = await getModules();
    const currentModule = modules.find(m => m.path === moduleSlug);
    const currentSection = currentModule?.sections.find(s => s.path === sectionSlug);

    if (!currentModule || !currentSection) {
        return {title: 'Module non trouvé'};
    }

    return {
        title: `${currentModule.title} | ${currentSection.title}`,
        description: currentModule.description || `Apprenez ${currentModule.title}`,
    };
}

export default async function Content({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug, contentSlug} = await params;

    const modules = await getModules();
    const currentModule = modules.find(m => m.path === moduleSlug);
    if (!currentModule) notFound();

    const currentSection = currentModule.sections.find(s => s.path === sectionSlug);
    if (!currentSection) notFound();

    const currentContent = currentSection.contents.find(c => c === contentSlug);
    if (!currentContent) notFound();

    console.log(`@/cours/${currentModule.path}/${currentSection.path}/${currentContent}.tsx`);

    const ComponentToRender = dynamic(() =>
        import(`@/cours/${currentModule.path}/${currentSection.path}/${currentContent}.tsx`)
            .catch(() => notFound())
    );

    if (!ComponentToRender) notFound();

    return (
        <div>
            <BreadcrumbGenerator
                currentModule={currentModule}
                currentSection={currentSection}
                currentContent={currentContent}
            />
            <div className={`mx-10 header-${currentModule.path} py-20`}>
                <Heading level={1}>{currentSection.order}. {currentSection.title}</Heading>
                <AntiCopyProtector>
                    <ComponentToRender/>
                </AntiCopyProtector>
                <ChatWidget currentModule={currentModule}/>
            </div>
        </div>
    );
}
