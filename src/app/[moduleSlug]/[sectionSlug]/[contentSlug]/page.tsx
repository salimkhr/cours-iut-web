import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import Heading from "@/components/ui/Heading";
import {notFound} from "next/navigation";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getContentComponent} from "@/lib/getContentComponent";
import ExamenWrapper from "@/components/ExamenWrapper";

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
        sectionSlug,
    });

    return currentSection
        ? generatePageMetadata({currentModule, currentSection})
        : {};
}

export default async function Content({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug, contentSlug} = await params;

    const {currentModule, currentSection, currentContent} =
        await getModuleData({
            moduleSlug,
            sectionSlug,
            contentSlug,
        });

    if (!currentContent || !currentSection) notFound();
    if (currentSection.isAvailable === false) notFound();

    const ComponentToRender = await getContentComponent({
        currentModule,
        currentSection,
        currentContent,
    });

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
                {currentContent === "examen" && currentSection.examenIsLock ? (
                    <ExamenWrapper currentModule={currentModule}>
                        <ComponentToRender/>
                    </ExamenWrapper>
                ) : (
                    <ComponentToRender/>
                )}
                {/*</AntiCopyProtector>*/}

                {/*<ChatWidget currentModule={currentModule}/>*/}
            </div>
        </div>
    );
}