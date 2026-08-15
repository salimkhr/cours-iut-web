"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Module from "@/types/Module";
import {FolderOpen, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import useAdminApi from "@/hook/admin/useAdminApi";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
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
    onDelete?: (moduleId: string) => void;
}

interface AdminModuleVisibilityProps {
    module: Module;
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

export default function AdminModuleActions({module, onDelete}: AdminModuleActionsProps) {
    const modData = module;
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const {deleteModule} = useAdminApi();

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

    return (
        <div className="flex items-center gap-1">
            <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-11 text-bridge-600 hover:bg-brand-primary/10 hover:text-brand-primary dark:text-bridge-300"
            >
                <Link
                    href={`/admin/modules/${modData.path}`}
                    aria-label={`Ouvrir le module ${modData.title}`}
                    title="Ouvrir le module"
                >
                    <FolderOpen aria-hidden="true"/>
                </Link>
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
    );
}
