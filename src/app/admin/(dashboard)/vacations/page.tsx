import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import VacationsPanel from "@/components/admin/VacationsPanel";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({
    defaultTitle: "Fiche de vacations",
    noIndex: true,
});

export default async function AdminVacationsPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Fiche de vacations"
                description="Génère l'état mensuel des services (modèle IUT) à partir de l'emploi du temps HyperPlanning. Relisez les lignes avant de télécharger."
            />
            <VacationsPanel/>
        </>
    );
}
