"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteBlockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Libellé humain du bloc (« Partie », « Élément de liste »…). */
    label: string;
    /** Nombre d'enfants emportés par la suppression. */
    childCount: number;
    onConfirm: () => void;
}

/**
 * Garde-fou avant suppression d'un bloc qui contient du travail : la corbeille
 * du canvas supprimait sans prévenir, y compris une partie entière et tous ses
 * enfants.
 */
export function ConfirmDeleteBlockDialog({
    open, onOpenChange, label, childCount, onConfirm,
}: ConfirmDeleteBlockDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce bloc ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {childCount > 0
                            ? `« ${label} » sera supprimé avec ${childCount} bloc${childCount > 1 ? "s" : ""} imbriqué${childCount > 1 ? "s" : ""}.`
                            : `« ${label} » et son contenu seront supprimés.`}
                        {" "}Ctrl+Z permet de revenir en arrière.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
