"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Search} from "lucide-react";
import AdminModule from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import {Accordion} from "@/components/ui/accordion";
import {Input} from "@/components/ui/input";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/Module";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";

interface ModulesListProps {
    initialModules: Module[];
}

function normalize(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function ModulesList({initialModules}: ModulesListProps) {
    const [deletedModuleIds, setDeletedModuleIds] = useState<Set<string>>(() => new Set());
    const [query, setQuery] = useState("");
    const modules = initialModules.filter((mod) => !deletedModuleIds.has(String(mod._id)));
    const router = useRouter();
    const {addModule} = useAdminApi();

    const normalizedQuery = normalize(query.trim());

    const visibleModules = useMemo(() => {
        if (!normalizedQuery) return modules;
        return modules.filter((mod) =>
            normalize(mod.title).includes(normalizedQuery) ||
            (mod.sections ?? []).some((section) => normalize(section.title).includes(normalizedQuery))
        );
    }, [modules, normalizedQuery]);

    const handleAddModule = async (data: ModuleFormValues) => {
        await addModule({...data, sections: []});
        router.refresh();
    };

    const handleDeleteModule = (moduleId: string) => {
        setDeletedModuleIds((prev) => new Set(prev).add(moduleId));
    };

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bridge-500"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un module ou une section…"
                        aria-label="Rechercher un module ou une section"
                        className="min-h-11 border-bridge-500/35 bg-bridge-50 pl-9 dark:bg-bridge-800"
                    />
                </div>
                <AddModuleButton onAdd={handleAddModule}/>
            </div>

            <Accordion
                type="multiple"
                defaultValue={initialModules.map((mod) => mod.path)}
                className="space-y-4"
            >
                {visibleModules.map((mod) => (
                    <AdminModule
                        key={`${mod._id}_${mod.sections?.length}`}
                        module={mod}
                        filterQuery={normalizedQuery}
                        onDelete={handleDeleteModule}
                    />
                ))}
            </Accordion>

            {visibleModules.length === 0 && (
                <p className="py-10 text-center text-sm text-bridge-500 dark:text-bridge-400">
                    {normalizedQuery
                        ? <>Aucun résultat pour «&nbsp;{query.trim()}&nbsp;».</>
                        : "Aucun module. Ajoutez-en un pour commencer."}
                </p>
            )}
        </section>
    );
}
