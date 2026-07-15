"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import Module from "@/types/Module";
import AdminSection from "@/components/admin/AdminSection";
import {BookOpen, Eye, EyeOff, Plus, Settings, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import Heading from "@/components/ui/Heading";
import iconMap from "@/lib/iconMap";
import SectionForm, {Section} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";
import {moduleColor} from "@/lib/moduleColor";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import EditModuleSheet from "@/components/admin/EditModuleSheet";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";
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
    onDelete?: (moduleId: string) => void;
}

export default function AdminModule({module, onDelete}: AdminModuleProps) {
    const [modData, setModData] = useState(module);
    const [visible, setVisible] = useState(module.isVisible !== false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const {addSection: addSectionApi, toggleModuleVisibility, deleteModule} = useAdminApi();

    const Icon = iconMap[modData.iconName] || BookOpen;

    const handleToggleVisibility = async (checked: boolean) => {
        setVisible(checked);
        try {
            await toggleModuleVisibility(modData._id as string, checked);
            toast.success(checked ? "Module visible." : "Module masque.");
        } catch {
            setVisible(!checked);
            toast.error("Erreur lors de la mise a jour de la visibilite.");
        }
    };

    const handleEditModule = async (data: ModuleFormValues) => {
        const res = await fetch(`/api/admin/modules/${modData._id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            toast.error("Erreur lors de la mise a jour du module.");
            throw new Error("API error");
        }

        setModData((prev) => ({...prev, ...data}));
        toast.success("Module mis a jour.");
        router.refresh();
    };

    const handleDeleteModule = async () => {
        setDeleting(true);
        try {
            await deleteModule(modData._id as unknown as string);
            toast.success(`Module "${modData.title}" supprime.`);
            setDeleteConfirmOpen(false);
            onDelete?.(String(modData._id));
            router.refresh();
        } catch {
            toast.error("Erreur lors de la suppression du module.");
            setDeleting(false);
        }
    };

    const addSection = async (section: Section) => {
        const savedSection = await addSectionApi(modData._id as unknown as string, section);
        setModData((prev) => ({
            ...prev,
            sections: [...prev.sections, savedSection],
        }));
        toast.success("Section ajoutee.");
        router.refresh();
    };

    const handleDeleteSection = (sectionPath: string) => {
        setModData((prev) => ({
            ...prev,
            sections: prev.sections.filter((section) => section.path !== sectionPath),
        }));
    };

    return (
        <>
            <AccordionItem value={modData.path}>
                <AccordionTrigger className="rounded-lg border border-bridge-500/35 bg-bridge-50 px-4 py-3 text-left shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] hover:no-underline dark:bg-bridge-800">
                    <div className="flex w-full min-w-0 items-center gap-3 pr-3">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white dark:text-brand-dark"
                            style={{color: "white", backgroundColor: moduleColor(modData)}}
                        >
                            <Icon className="size-5"/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <Heading level={3}>{modData.title}</Heading>
                            <p className="mt-1 text-sm text-bridge-600 dark:text-bridge-300">
                                {modData.sections.length} section{modData.sections.length > 1 ? "s" : ""} - {visible ? "Visible" : "Masque"}
                            </p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent
                    className={cn("p-0", "header-module")}
                    style={{"--module-color": moduleColor(modData)} as React.CSSProperties}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-x border-b border-bridge-500/25 bg-bridge-50/70 px-4 py-3 dark:bg-bridge-900/35">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" variant="outline" className="min-h-11 gap-2 border-bridge-500/45" onClick={() => setEditModuleOpen(true)}>
                                <Settings className="size-4" aria-hidden="true"/>
                                Modifier
                            </Button>
                            <Button type="button" className="min-h-11 gap-2 text-white dark:text-brand-dark hover:opacity-90" style={{backgroundColor: moduleColor(modData)}} onClick={() => setAddSectionOpen(true)}>
                                <Plus className="size-4" aria-hidden="true"/>
                                Ajouter une section
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" variant="outline" className="min-h-11 gap-2 border-bridge-500/45" onClick={() => handleToggleVisibility(!visible)}>
                                {visible ? <Eye className="size-4" aria-hidden="true"/> : <EyeOff className="size-4" aria-hidden="true"/>}
                                {visible ? "Visible" : "Masque"}
                            </Button>
                            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button type="button" variant="outline" className="min-h-11 gap-2 border-bridge-500/45 text-destructive hover:text-destructive">
                                        <Trash2 className="size-4" aria-hidden="true"/>
                                        Supprimer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="p-0 gap-0 overflow-hidden bg-card border-bridge-500/45">
                                    <div className="flex items-center gap-3 px-6 py-4" style={{backgroundColor: moduleColor(modData)}}>
                                        <Trash2 className="w-5 h-5 text-white shrink-0"/>
                                        <AlertDialogTitle className="text-white font-bold text-lg">Supprimer le module ?</AlertDialogTitle>
                                    </div>
                                    <div className="px-6 py-5">
                                        <AlertDialogDescription className="text-brand-dark dark:text-bridge-200">
                                            Le module <strong>{modData.title}</strong> et toutes ses sections seront definitivement supprimes.
                                            Cette action est irreversible.
                                        </AlertDialogDescription>
                                    </div>
                                    <AlertDialogFooter className="px-6 pb-5">
                                        <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteModule} disabled={deleting} variant="destructive">
                                            {deleting ? "Suppression..." : "Supprimer definitivement"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    {modData.sections.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-3">
                            {[...modData.sections].sort((first, second) => first.order - second.order).map((section) => (
                                <AdminSection modData={modData} key={section.path} section={section} onDelete={handleDeleteSection}/>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground">
                            Aucun cours disponible pour ce module.
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

            <EditModuleSheet module={modData} open={editModuleOpen} onOpenChange={setEditModuleOpen} onSubmit={handleEditModule}/>
            <SectionForm modData={modData} mode="add" open={addSectionOpen} onOpenChange={setAddSectionOpen} onSubmit={addSection}/>
        </>
    );
}
