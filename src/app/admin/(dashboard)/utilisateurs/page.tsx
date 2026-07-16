import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import getAdminUsers from "@/lib/admin/getAdminUsers";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import UsersTable from "@/components/admin/users/UsersTable";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({
    defaultTitle: "Utilisateurs",
    noIndex: true,
});

export default async function AdminUsersPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const users = await getAdminUsers();

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Utilisateurs"
                description="Comptes, groupes, rôles et bannissements."
            />
            <UsersTable users={users}/>
        </>
    );
}
