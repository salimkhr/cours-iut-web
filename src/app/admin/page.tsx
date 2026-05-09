import getModules from "@/lib/getModules";
import ModulesList from "@/components/admin/ModulesList";
import {currentUser} from "@clerk/nextjs/server";
import {notFound} from "next/navigation";

export default async function AdminPage() {
    const modules = await getModules();

    const user = await currentUser();

    const isAdmin = user?.publicMetadata?.role === "admin";

    if (!isAdmin) {
        notFound();
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center">
                Gestion des Modules
            </h1>
            <ModulesList initialModules={modules} />
        </div>
    );
}