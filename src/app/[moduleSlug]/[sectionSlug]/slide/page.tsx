import {contentImports} from "@/lib/contentImports";
import {notFound} from "next/navigation";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getContentRef} from "@/types/CourseContent";
import {getContentBlocks} from "@/lib/getContentBlocks";
import {SlideBlocksRenderer} from "@/components/Slides/SlideBlocksRenderer";
import EditContentFab from "@/components/admin/EditContentFab";
import {getServerSession} from "@/lib/auth";

interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateMetadata({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({moduleSlug, sectionSlug});
    return currentSection !== null ? generatePageMetadata({currentModule, currentSection}) : {};
}

export default async function Content({params}: ContentPageProps) {
    const {moduleSlug, sectionSlug} = await params;

    const [session, {currentModule, currentSection}] = await Promise.all([
        getServerSession(),
        getModuleData({moduleSlug, sectionSlug}),
    ]);

    const isAdmin = session?.user.role === "admin";

    if (!currentSection) notFound();
    if (currentSection.isAvailable === false) notFound();

    const ref = getContentRef(currentSection.contents, "slide");

    // Branche DB
    if (ref?.source === "db") {
        const doc = await getContentBlocks(moduleSlug, sectionSlug, "slide");
        if (!doc) notFound();

        return (
            <div className={`header-${currentModule.path}`}>
                <SlideBlocksRenderer
                    blocks={doc.blocks}
                    module={currentModule}
                    section={currentSection}
                />
                {isAdmin && (
                    <EditContentFab
                        moduleSlug={moduleSlug}
                        sectionSlug={sectionSlug}
                        contentType="slide"
                        modulePath={currentModule.path}
                    />
                )}
            </div>
        );
    }

    // Branche FILE (comportement existant)
    const importFunc = contentImports?.[moduleSlug]?.[sectionSlug]?.["Slide"];
    if (!importFunc) notFound();

    const ComponentToRender = (await importFunc()).default;
    if (!ComponentToRender) notFound();

    return (
        <div className={`header-${currentModule.path}`}>
            <ComponentToRender />
            {isAdmin && (
                <EditContentFab
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                    contentType="slide"
                    modulePath={currentModule.path}
                />
            )}
        </div>
    );
}
