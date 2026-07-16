import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminToolsPanel from "@/components/admin/AdminToolsPanel";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({
    defaultTitle: "Outils techniques",
    noIndex: true,
});

export default async function AdminToolsPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const modules = await getModules();
    const moduleOptions = modules.map((mod) => ({path: mod.path, title: mod.title}));

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Outils techniques"
                description="Migration des contenus et transfert entre environnements."
            />
            <AdminToolsPanel modules={moduleOptions}/>
        </>
    );
}
