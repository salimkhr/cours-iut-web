"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import AdminModule from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import {Accordion} from "@/components/ui/accordion";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/Module";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";

interface ModulesListProps {
    initialModules: Module[];
}

export default function ModulesList({initialModules}: ModulesListProps) {
    const [modules, setModules] = useState(initialModules);
    const router = useRouter();
    const {addModule} = useAdminApi();

    const handleAddModule = async (data: ModuleFormValues) => {
        const createdModule = await addModule({...data, sections: []});
        setModules((prev) => [...prev, createdModule]);
        router.refresh();
    };

    const handleDeleteModule = (moduleId: string) => {
        setModules((prev) => prev.filter((mod) => String(mod._id) !== moduleId));
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                        Contenu pedagogique
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-brand-dark dark:text-bridge-100">
                        Modules & sections
                    </h2>
                    <p className="mt-1 text-sm text-bridge-600 dark:text-bridge-300">
                        {modules.length} module{modules.length > 1 ? "s" : ""} gere{modules.length > 1 ? "s" : ""} depuis MongoDB.
                    </p>
                </div>
                <AddModuleButton onAdd={handleAddModule}/>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
                {modules.map((mod) => (
                    <AdminModule
                        key={`${mod._id}_${mod.sections?.length}`}
                        module={mod}
                        onDelete={handleDeleteModule}
                    />
                ))}
            </Accordion>
        </section>
    );
}
