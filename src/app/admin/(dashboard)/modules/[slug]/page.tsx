import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import ModuleWorkflow from "@/components/admin/module-workflow/ModuleWorkflow";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({defaultTitle: "Module", noIndex: true});

export default async function AdminModulePage({params}: {params: Promise<{slug: string}>}) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const {slug} = await params;
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
            <ModuleWorkflow module={mod}/>
        </>
    );
}
