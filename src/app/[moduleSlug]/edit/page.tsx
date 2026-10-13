import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import {getModuleData} from "@/hook/getModuleData";
import ContextualModuleEditPage from "@/components/admin/ContextualModuleEditPage";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

interface ModuleEditPageProps {
    params: Promise<{moduleSlug: string}>;
}

export const metadata = generatePageMetadata({
    defaultTitle: "Modifier le module",
    noIndex: true,
});

export default async function ModuleEditPage({params}: ModuleEditPageProps) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const {moduleSlug} = await params;
    const {currentModule} = await getModuleData({moduleSlug});

    return <ContextualModuleEditPage module={currentModule}/>;
}
