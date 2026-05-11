import getModules from "@/lib/getModules";
import ModulesList from "@/components/admin/ModulesList";
import {getServerSession} from "@/lib/auth";
import {notFound} from "next/navigation";

export default async function AdminPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const modules = await getModules();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center">
                Gestion des Modules
            </h1>
            <ModulesList initialModules={modules} />
        </div>
    );
}
