"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Module from "@/types/Module";
import AdminSection from "@/components/admin/AdminSection";
import {BookOpen, FolderOpen, Plus, Settings, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import iconMap from "@/lib/iconMap";
import SectionForm, {Section} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";
import {moduleColor} from "@/lib/moduleColor";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import EditModuleSheet from "@/components/admin/EditModuleSheet";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminModuleActionsProps {
    module: Module;
    /** Filtre normalisé (minuscules, sans accents) venant de la recherche. */
    filterQuery?: string;
    onDelete?: (moduleId: string) => void;
}

interface AdminModuleVisibilityProps {
    module: Module;
}

function normalize(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function AdminModuleVisibility({module}: AdminModuleVisibilityProps) {
    const [visible, setVisible] = useState(module.isVisible !== false);
    const [visibilityPending, setVisibilityPending] = useState(false);
    const router = useRouter();
    const {toggleModuleVisibility} = useAdminApi();
    const visibilityLabel = visible ? "Visible" : "Masqué";

    const handleToggleVisibility = async (checked: boolean) => {
        if (visibilityPending) return;

        const previous = visible;
        setVisibilityPending(true);
        setVisible(checked);
        try {
            await toggleModuleVisibility(module._id as string, checked);
            toast.success(checked ? "Module visible." : "Module masqué.");
            router.refresh();
        } catch {
            setVisible(previous);
            toast.error("Erreur lors de la mise à jour de la visibilité.");
        } finally {
            setVisibilityPending(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <Label htmlFor={`${module.path}-module-visible`} className="sr-only">
                Publication du module {module.title}
            </Label>
            <Switch
                id={`${module.path}-module-visible`}
                checked={visible}
                onCheckedChange={handleToggleVisibility}
                disabled={visibilityPending}
                aria-busy={visibilityPending}
            />
            <span
                className={cn(
                    "text-xs font-semibold",
                    visible
                        ? "text-bridge-700 dark:text-bridge-200"
                        : "text-brand-accent-dark dark:text-brand-primary"
                )}
            >
                {visibilityLabel}
            </span>
        </div>
    );
}

export default function AdminModuleActions({module, filterQuery = "", onDelete}: AdminModuleActionsProps) {
    const [modData, setModData] = useState(module);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const {addSection: addSectionApi, deleteModule} = useAdminApi();

    const Icon = iconMap[modData.iconName] || BookOpen;
    const color = moduleColor(modData);
    const sortedSections = [...modData.sections].sort((first, second) => first.order - second.order);
    const moduleMatches = !filterQuery || normalize(modData.title).includes(filterQuery);
    const displayedSections = moduleMatches
        ? sortedSections
        : sortedSections.filter((section) => normalize(section.title).includes(filterQuery));
    const publishedCount = modData.sections.filter((section) => section.isAvailable).length;
    const sectionCountLabel = `${modData.sections.length} section${modData.sections.length !== 1 ? "s" : ""}`;
    const publishedCountLabel = `${publishedCount} publiée${publishedCount !== 1 ? "s" : ""}`;
    const visible = modData.isVisible !== false;

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
            setDetailsOpen(false);
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
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 text-bridge-600 hover:bg-brand-primary/10 hover:text-brand-primary dark:text-bridge-300"
                    aria-label={`Gérer les sections du module ${modData.title}`}
                    title="Gérer les sections"
                    onClick={() => setDetailsOpen(true)}
                >
                    <FolderOpen aria-hidden="true"/>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 text-bridge-600 hover:bg-brand-primary/10 hover:text-brand-primary dark:text-bridge-300"
                    aria-label={`Modifier le module ${modData.title}`}
                    title="Modifier le module"
                    onClick={() => setEditModuleOpen(true)}
                >
                    <Settings aria-hidden="true"/>
                </Button>
                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-11 text-bridge-600 hover:bg-destructive/10 hover:text-destructive dark:text-bridge-300"
                            aria-label={`Supprimer le module ${modData.title}`}
                            title="Supprimer le module"
                        >
                            <Trash2 aria-hidden="true"/>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                        className={cn(
                            "bg-card",
                            "border border-bridge-500/45",
                            "shadow-[0_22px_44px_-14px_rgba(147,97,58,0.45)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.7)]",
                        )}
                    >
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-brand-dark dark:text-bridge-100">
                                Supprimer le module ?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-bridge-600 dark:text-bridge-400">
                                Le module <strong className="text-brand-dark dark:text-bridge-200">{modData.title}</strong> et toutes ses sections seront définitivement supprimés.
                                Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting} className="border-bridge-500/45">
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteModule} disabled={deleting} variant="destructive">
                                {deleting ? "Suppression…" : "Supprimer"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent
                    className={cn(
                        "max-w-[min(72rem,calc(100%-2rem))] gap-0 overflow-hidden p-0",
                        "bg-card",
                        "border border-bridge-500/45 dark:border-bridge-500/35",
                        "shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                        "[&>button]:text-white [&>button]:ring-offset-transparent [&>button:focus-visible]:ring-white/50",
                    )}
                >
                    <div className="relative flex items-center gap-4 overflow-hidden px-6 py-5 pr-14" style={{backgroundColor: color}}>
                        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"/>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <Icon className="size-5 text-white" aria-hidden="true"/>
                        </span>
                        <DialogHeader className="gap-1 p-0 text-left">
                            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/65">Module</p>
                            <DialogTitle className="text-xl font-bold leading-tight text-white">
                                {modData.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-white/75">
                                {sectionCountLabel} · {publishedCountLabel} · {visible ? "visible" : "masqué"}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="flex flex-col gap-4 px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Badge
                                    variant="outline"
                                    className="border-bridge-500/30 bg-bridge-100/60 text-bridge-700 dark:bg-bridge-900/35 dark:text-bridge-200"
                                >
                                    /{modData.path}
                                </Badge>
                                {modData.isExtra && (
                                    <Badge
                                        variant="outline"
                                        className="border-bridge-500/30 bg-bridge-100/60 text-bridge-700 dark:bg-bridge-900/35 dark:text-bridge-200"
                                    >
                                        Module bonus
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    className="min-h-11 gap-2 text-white hover:opacity-90"
                                    style={{backgroundColor: color}}
                                    onClick={() => setAddSectionOpen(true)}
                                >
                                    <Plus data-icon="inline-start" aria-hidden="true"/>
                                    Ajouter une section
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="min-h-11 gap-2 border-bridge-500/45"
                                    onClick={() => setEditModuleOpen(true)}
                                >
                                    <Settings data-icon="inline-start" aria-hidden="true"/>
                                    Modifier le module
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[min(62dvh,42rem)] overflow-y-auto border-t border-bridge-500/20">
                        {displayedSections.length > 0 ? (
                            <ul>
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
                            <p className="px-4 py-10 text-center text-sm text-bridge-500 dark:text-bridge-400">
                                {filterQuery && modData.sections.length > 0
                                    ? "Aucune section ne correspond à la recherche."
                                    : "Aucune section dans ce module."}
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <EditModuleSheet module={modData} open={editModuleOpen} onOpenChange={setEditModuleOpen} onSubmit={handleEditModule}/>
            <SectionForm modData={modData} mode="add" open={addSectionOpen} onOpenChange={setAddSectionOpen} onSubmit={addSection}/>
        </>
    );
}
