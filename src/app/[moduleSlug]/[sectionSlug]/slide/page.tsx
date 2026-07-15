import {contentImports} from "@/lib/contentImports";
import {notFound, redirect} from "next/navigation";
import {moduleColor} from "@/lib/moduleColor";
import {getModuleData} from "@/hook/getModuleData";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getContentRef} from "@/types/CourseContent";
import {getContentBlocks} from "@/lib/getContentBlocks";
import {SlideBlocksRenderer} from "@/components/Slides/SlideBlocksRenderer";
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
        if (!doc) {
            if (isAdmin) redirect(`/admin/content/${moduleSlug}/${sectionSlug}/slide`);
            notFound();
        }

        return (
            <div className="header-module" style={{
            '--module-color': moduleColor(currentModule),
            '--module-color-dark': moduleColor(currentModule, 'dark'),
        } as React.CSSProperties}>
                <SlideBlocksRenderer
                    blocks={doc.blocks}
                    module={currentModule}
                    section={currentSection}
                />
            </div>
        );
    }

    // Branche FILE (comportement existant)
    const importFunc = contentImports?.[moduleSlug]?.[sectionSlug]?.["Slide"];
    if (!importFunc) {
        if (isAdmin) redirect(`/admin/content/${moduleSlug}/${sectionSlug}/slide`);
        notFound();
    }

    const ComponentToRender = (await importFunc()).default;
    if (!ComponentToRender) {
        if (isAdmin) redirect(`/admin/content/${moduleSlug}/${sectionSlug}/slide`);
        notFound();
    }

    return (
        <div className="header-module" style={{
            '--module-color': moduleColor(currentModule),
            '--module-color-dark': moduleColor(currentModule, 'dark'),
        } as React.CSSProperties}>
            <ComponentToRender />
        </div>
    );
}
