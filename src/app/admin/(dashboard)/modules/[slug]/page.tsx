import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import ModuleAdminTabs from "@/components/admin/module-workflow/ModuleAdminTabs";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({defaultTitle: "Module", noIndex: true});

export default async function AdminModulePage({params, searchParams}: {
    params: Promise<{slug: string}>;
    searchParams: Promise<{onglet?: string}>;
}) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const {slug} = await params;
    // `?onglet=quiz` : lien direct depuis le menu « Quiz » de la page du module.
    const initialTab = (await searchParams).onglet === "quiz" ? "quiz" : "workflow";
    const modules = await getModules();
    const mod = modules.find((candidate) => candidate.path === slug);
    if (!mod) notFound();

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title={mod.title}
                description="Concevez le projet, poussez le code de référence, puis pilotez la rédaction."
            />
            <ModuleAdminTabs module={mod} initialTab={initialTab}/>
        </>
    );
}
