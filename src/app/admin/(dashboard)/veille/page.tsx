import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import ResourcesPanel from "@/components/admin/ResourcesPanel";
import {getResources} from "@/lib/getResources";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({
    defaultTitle: "Veille",
    noIndex: true,
});

export default async function AdminVeillePage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const resources = await getResources(false);

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Veille"
                description="Articles, vidéos et recherches partagés avec les étudiants. Affichés sur l'accueil, les plus récents d'abord."
            />
            <ResourcesPanel resources={resources}/>
        </>
    );
}
