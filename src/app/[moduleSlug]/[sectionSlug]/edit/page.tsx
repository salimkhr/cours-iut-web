import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import {getModuleData} from "@/hook/getModuleData";
import ContextualSectionEditPage from "@/components/admin/ContextualSectionEditPage";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

interface SectionEditPageProps {
    params: Promise<{moduleSlug: string; sectionSlug: string}>;
}

export const metadata = generatePageMetadata({
    defaultTitle: "Modifier la section",
    noIndex: true,
});

export default async function SectionEditPage({params}: SectionEditPageProps) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({moduleSlug, sectionSlug});
    if (!currentSection) notFound();

    return <ContextualSectionEditPage module={currentModule} section={currentSection}/>;
}
