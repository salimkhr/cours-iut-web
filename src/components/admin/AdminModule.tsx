"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import Module from "@/types/Module";
import AdminSection from "@/components/admin/AdminSection";
import {BookOpen, Plus, Settings, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import iconMap from "@/lib/iconMap";
import SectionForm, {Section} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";
import {moduleColor} from "@/lib/moduleColor";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import EditModuleSheet from "@/components/admin/EditModuleSheet";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminModuleProps {
    module: Module;
    /** Filtre normalisé (minuscules, sans accents) venant de la recherche. */
    filterQuery?: string;
    onDelete?: (moduleId: string) => void;
}

function normalize(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function AdminModule({module, filterQuery = "", onDelete}: AdminModuleProps) {
    const [modData, setModData] = useState(module);
    const [visible, setVisible] = useState(module.isVisible !== false);
    const [visibilityPending, setVisibilityPending] = useState(false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const {addSection: addSectionApi, toggleModuleVisibility, deleteModule} = useAdminApi();

    const Icon = iconMap[modData.iconName] || BookOpen;
    const color = moduleColor(modData);

    const sortedSections = [...modData.sections].sort((first, second) => first.order - second.order);
    // Si le titre du module matche, on montre toutes ses sections ; sinon seulement celles qui matchent.
    const moduleMatches = !filterQuery || normalize(modData.title).includes(filterQuery);
    const displayedSections = moduleMatches
        ? sortedSections
        : sortedSections.filter((section) => normalize(section.title).includes(filterQuery));
    const publishedCount = modData.sections.filter((section) => section.isAvailable).length;

    const handleToggleVisibility = async (checked: boolean) => {
        if (visibilityPending) return;

        const previous = visible;
        setVisibilityPending(true);
        setVisible(checked);
        try {
            await toggleModuleVisibility(modData._id as string, checked);
            toast.success(checked ? "Module visible." : "Module masqué.");
        } catch {
            setVisible(previous);
            toast.error("Erreur lors de la mise à jour de la visibilité.");
        } finally {
            setVisibilityPending(false);
        }
    };

    const handleEditModule = async (data: ModuleFormValues) => {
        const res = await fetch(`/api/admin/modules/${modData._id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            toast.error("Erreur lors de la mise à jour du module.");
            throw new Error("API error");
        }

        setModData((prev) => ({...prev, ...data}));
        toast.success("Module mis à jour.");
        router.refresh();
    };

    const handleDeleteModule = async () => {
        setDeleting(true);
        try {
            await deleteModule(modData._id as unknown as string);
            toast.success(`Module "${modData.title}" supprimé.`);
            setDeleteConfirmOpen(false);
            onDelete?.(String(modData._id));
            router.refresh();
        } catch {
            toast.error("Erreur lors de la suppression du module.");
            setDeleting(false);
        }
    };

    const addSection = async (section: Section) => {
        try {
            const savedSection = await addSectionApi(modData._id as unknown as string, section);
            setModData((prev) => ({
                ...prev,
                sections: [...prev.sections, savedSection],
            }));
            toast.success("Section ajoutée.");
            router.refresh();
        } catch (error) {
            toast.error("Erreur lors de l'ajout de la section.");
            throw error;
        }
    };

    const handleDeleteSection = (sectionPath: string) => {
        setModData((prev) => ({
            ...prev,
            sections: prev.sections.filter((section) => section.path !== sectionPath),
        }));
    };

    return (
        <>
            <AccordionItem value={modData.path} className={cn(ADMIN_CARD, "overflow-hidden border-b")}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                    <AccordionTrigger className="min-w-0 flex-1 basis-60 items-center gap-3 rounded-lg p-0 py-1 text-left hover:no-underline">
                        <span
                            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{backgroundColor: color}}
                        >
                            <Icon className="size-5" aria-hidden="true"/>
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-base font-bold text-brand-dark dark:text-bridge-100">
                                {modData.title}
                            </span>
                            <span className="mt-0.5 block text-xs font-normal text-bridge-600 dark:text-bridge-300">
                                {modData.sections.length} section{modData.sections.length > 1 ? "s" : ""} · {publishedCount} publiée{publishedCount > 1 ? "s" : ""}{!visible && " · masqué"}
                            </span>
                        </span>
                    </AccordionTrigger>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="mr-1 flex items-center gap-2">
                            <Label
                                htmlFor={`${modData.path}-module-visible`}
                                className="text-xs font-medium text-bridge-600 dark:text-bridge-300"
                            >
                                Visible
                            </Label>
                            <Switch
                                id={`${modData.path}-module-visible`}
                                checked={visible}
                                onCheckedChange={handleToggleVisibility}
                                disabled={visibilityPending}
                                aria-busy={visibilityPending}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 border-bridge-500/45"
                            aria-label={`Modifier le module ${modData.title}`}
                            title="Modifier le module"
                            onClick={() => setEditModuleOpen(true)}
                        >
                            <Settings className="size-4" aria-hidden="true"/>
                        </Button>
                        <Button
                            type="button"
                            className="min-h-11 gap-2 text-white hover:opacity-90"
                            style={{backgroundColor: color}}
                            onClick={() => setAddSectionOpen(true)}
                        >
                            <Plus className="size-4" aria-hidden="true"/>
                            <span className="hidden md:inline">Ajouter une section</span>
                            <span className="md:hidden">Section</span>
                        </Button>
                        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 text-bridge-600 hover:bg-destructive/10 hover:text-destructive dark:text-bridge-300"
                                    aria-label={`Supprimer le module ${modData.title}`}
                                    title="Supprimer le module"
                                >
                                    <Trash2 className="size-4" aria-hidden="true"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="p-0 gap-0 overflow-hidden bg-card border-bridge-500/45">
                                <div className="flex items-center gap-3 px-6 py-4" style={{backgroundColor: color}}>
                                    <Trash2 className="w-5 h-5 text-white shrink-0"/>
                                    <AlertDialogTitle className="text-white font-bold text-lg">Supprimer le module ?</AlertDialogTitle>
                                </div>
                                <div className="px-6 py-5">
                                    <AlertDialogDescription className="text-brand-dark dark:text-bridge-200">
                                        Le module <strong>{modData.title}</strong> et toutes ses sections seront définitivement supprimés.
                                        Cette action est irréversible.
                                    </AlertDialogDescription>
                                </div>
                                <AlertDialogFooter className="px-6 pb-5">
                                    <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteModule} disabled={deleting} variant="destructive">
                                        {deleting ? "Suppression…" : "Supprimer définitivement"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <AccordionContent className="p-0 pb-0">
                    {displayedSections.length > 0 ? (
                        <ul className="border-t border-bridge-500/20">
                            {displayedSections.map((section) => (
                                <AdminSection
                                    modData={modData}
                                    key={section.path}
                                    section={section}
                                    onDelete={handleDeleteSection}
                                />
                            ))}
                        </ul>
                    ) : (
                        <p className="border-t border-bridge-500/20 px-4 py-6 text-center text-sm text-bridge-500 dark:text-bridge-400">
                            {filterQuery && modData.sections.length > 0
                                ? "Aucune section ne correspond à la recherche."
                                : "Aucune section dans ce module."}
                        </p>
                    )}
                </AccordionContent>
            </AccordionItem>

            <EditModuleSheet module={modData} open={editModuleOpen} onOpenChange={setEditModuleOpen} onSubmit={handleEditModule}/>
            <SectionForm modData={modData} mode="add" open={addSectionOpen} onOpenChange={setAddSectionOpen} onSubmit={addSection}/>
        </>
    );
}
