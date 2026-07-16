"use client";

import {useCallback, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {BookOpen, Search} from "lucide-react";
import type {ColumnDef} from "@tanstack/react-table";
import AdminModuleActions, {AdminModuleVisibility} from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import AdminDataTable from "@/components/admin/ui/AdminDataTable";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/Module";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";
import iconMap from "@/lib/iconMap";
import {moduleColor} from "@/lib/moduleColor";

interface ModulesListProps {
    initialModules: Module[];
}

function normalize(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function ModuleIdentityCell({mod}: {mod: Module}) {
    const Icon = iconMap[mod.iconName] || BookOpen;
    const color = moduleColor(mod);

    return (
        <div className="flex items-center gap-3">
            <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
                style={{backgroundColor: color}}
            >
                <Icon className="size-5" aria-hidden="true"/>
            </span>
            <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-brand-dark dark:text-bridge-100">
                        {mod.title}
                    </p>
                    {mod.isExtra && (
                        <Badge
                            variant="outline"
                            className="border-bridge-500/30 bg-bridge-100/60 text-bridge-700 dark:bg-bridge-900/35 dark:text-bridge-200"
                        >
                            Bonus
                        </Badge>
                    )}
                </div>
                <p className="truncate font-mono text-xs text-bridge-500 dark:text-bridge-400">
                    /{mod.path}
                </p>
            </div>
        </div>
    );
}

function ModuleSectionsCell({mod}: {mod: Module}) {
    const sections = mod.sections ?? [];
    const publishedCount = sections.filter((section) => section.isAvailable).length;
    const publishedCountLabel = `${publishedCount}/${sections.length} publiée${publishedCount > 1 ? "s" : ""}`;

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <Badge
                variant="outline"
                className="border-bridge-500/30 bg-bridge-100/60 text-bridge-700 dark:bg-bridge-900/35 dark:text-bridge-200"
            >
                {publishedCountLabel}
            </Badge>
        </div>
    );
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

    const handleDeleteModule = useCallback((moduleId: string) => {
        setDeletedModuleIds((prev) => new Set(prev).add(moduleId));
    }, []);

    const columns = useMemo<ColumnDef<Module>[]>(() => [
        {
            accessorKey: "title",
            header: "Module",
            cell: ({row}) => <ModuleIdentityCell mod={row.original}/>,
        },
        {
            id: "sections",
            header: "Sections",
            cell: ({row}) => <ModuleSectionsCell mod={row.original}/>,
        },
        {
            id: "publication",
            header: "Publication",
            cell: ({row}) => <AdminModuleVisibility module={row.original}/>,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({row}) => (
                <AdminModuleActions
                    module={row.original}
                    filterQuery={normalizedQuery}
                    onDelete={handleDeleteModule}
                />
            ),
        },
    ], [handleDeleteModule, normalizedQuery]);

    return (
        <section className="flex flex-col gap-4">
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

            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                {visibleModules.length} module{visibleModules.length > 1 ? "s" : ""}
                {normalizedQuery && ` sur ${modules.length}`}
            </p>

            <AdminDataTable
                columns={columns}
                data={visibleModules}
                emptyMessage={
                    normalizedQuery
                        ? `Aucun résultat pour « ${query.trim()} ».`
                        : "Aucun module. Ajoutez-en un pour commencer."
                }
                tableClassName="min-w-[760px]"
            />
        </section>
    );
}
