import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
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

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Outils techniques"
                description="Migration des contenus et transfert entre environnements."
            />
            <AdminToolsPanel/>
        </>
    );
}
