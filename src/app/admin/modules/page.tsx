import getModules from '@/lib/getModules';
import ModulesList from "@/components/admin/ModulesList";

export default async function AdminPage() {
    const modules = await getModules();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center">Gestion des Modules</h1>
            <ModulesList initialModules={modules}/>
        </div>
    );
}
