import {notFound} from 'next/navigation';
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import dynamic from 'next/dynamic'
import AntiCopyProtector from "@/components/AntiCopyProtector";
import Heading from "@/components/ui/Heading";
import ChatWidget from "@/components/ia/ChatWidget";
import getMergedModules from "@/hook/getMergedModules";


interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentSlug: string;
    }>;
}

export async function generateStaticParams() {
    const params: { moduleSlug: string; sectionSlug: string; contentSlug: string }[] = [];
    const modules = getMergedModules();

    modules.forEach((module) => {
        module.sections.filter((section) => section.isAvailable).forEach((section) => {
            section.contents.forEach((content) => {
                params.push({
                    moduleSlug: module.path,
                    sectionSlug: section.path,
                    contentSlug: content.type
                });
            });
        });
    });

    return params;
}

export async function generateMetadata({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug} = await params;
    const modules = getMergedModules();
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

    const modules = getMergedModules();
    const currentModule = modules.find(m => m.path === moduleSlug);
    if (!currentModule) notFound();

    const currentSection = currentModule.sections.find(s => s.path === sectionSlug);
    if (!currentSection) notFound();

    const currentContent = currentSection.contents.find(c => c.type === contentSlug);
    if (!currentContent) notFound();

    const ComponentToRender = dynamic(() =>
        import(`@/cours/${currentContent.componentPath}`)
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
