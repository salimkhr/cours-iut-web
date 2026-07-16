"use client";

import Link from "next/link";
import Section from "@/types/Section";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useState} from "react";
import {toast} from "sonner";
import updateSectionState from "@/hook/admin/updateSectionState";
import EditSectionButton from "@/components/admin/EditSectionButton";
import Module from "@/types/Module";
import {getContentTypes, hasContentType} from "@/types/CourseContent";
import {Section as SectionFrom} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";
import {ExternalLink, KeyRound, Pencil, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {moduleColor} from "@/lib/moduleColor";
import {CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";
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

interface AdminSectionProps {
    section: Section;
    modData: Module;
    onDelete?: (sectionPath: string) => void;
}

type ToggleKey = keyof Pick<Section, "correctionIsAvailable" | "isAvailable" | "examenIsLock">;

interface ToggleColProps {
    id: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
    pending?: boolean;
    onChange: (checked: boolean) => void;
}

/** Colonne label + switch, largeur fixe pour aligner les colonnes entre les lignes. */
function ToggleCol({id, label, checked, disabled, pending, onChange}: ToggleColProps) {
    return (
        <div className="flex w-20 flex-col items-center gap-1.5 xl:w-24">
            <Label
                htmlFor={id}
                className="text-center text-[10px] uppercase tracking-[0.12em] font-semibold text-brand-dark/55 dark:text-bridge-200/55"
            >
                {label}
            </Label>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
                aria-busy={pending}
            />
        </div>
    );
}

export default function AdminSection({
    section,
    modData,
    onDelete,
}: AdminSectionProps) {
    const [currentSection, setCurrentSection] = useState<Section>(section);
    const [deleting, setDeleting] = useState(false);
    const [pendingKey, setPendingKey] = useState<ToggleKey | null>(null);

    const isAvailable = !!currentSection.isAvailable;
    const correctionIsAvailable = !!currentSection.correctionIsAvailable;
    const moduleId = modData._id;
    const {editSection: editSectionApi, deleteSection: deleteSectionApi} = useAdminApi();

    const hasExamen = hasContentType(currentSection.contents, "examen");

    const editSection = async (updatedSection: SectionFrom) => {
        try {
            const saved = await editSectionApi(modData._id as unknown as string, String(currentSection._id), updatedSection);
            if (!saved) {
                throw new Error("Section mise à jour introuvable");
            }
            setCurrentSection(saved);
            toast.success("Section mise à jour.");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour de la section.");
            throw error;
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteSectionApi(modData._id as unknown as string, currentSection.path);
            toast.success("Section supprimée.");
            onDelete?.(currentSection.path);
        } catch {
            toast.error("Erreur lors de la suppression de la section.");
            setDeleting(false);
        }
    };

    const handleToggle = async (
        key: ToggleKey,
        value: boolean
    ) => {
        if (pendingKey !== null) return;

        const previous = currentSection[key];
        setPendingKey(key);
        setCurrentSection((prev) => ({...prev, [key]: value}));
        try {
            await updateSectionState(moduleId, currentSection.order, key, value);
            toast.success("Section mise à jour.");
        } catch {
            setCurrentSection((prev) => ({...prev, [key]: previous}));
            toast.error("Erreur lors de la mise à jour de la section.");
        } finally {
            setPendingKey(null);
        }
    };

    const sortedContents = getContentTypes(currentSection.contents).sort(
        (first, second) => CONTENT_ORDER.indexOf(first as ContentKey) - CONTENT_ORDER.indexOf(second as ContentKey)
    );

    return (
        <li className="border-b border-bridge-500/15 px-4 py-3 transition-colors last:border-b-0 hover:bg-bridge-100/40 dark:hover:bg-bridge-900/30">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
                {/* Identité : numéro + titre + contenus */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                        className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold text-white"
                        style={{backgroundColor: moduleColor(modData)}}
                    >
                        {currentSection.order.toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold leading-tight text-brand-dark dark:text-bridge-100">
                            {currentSection.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {sortedContents.map((content) => {
                                const key = content as ContentKey;
                                return (
                                    <Button
                                        key={content}
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 border-bridge-500/45 px-2.5 text-xs"
                                    >
                                        <Link href={`/admin/content/${modData.path}/${currentSection.path}/${content}`}>
                                            <Pencil className="size-3" aria-hidden="true"/>
                                            {CONTENT_LABELS[key] ?? content}
                                        </Link>
                                    </Button>
                                );
                            })}
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-bridge-500/45 px-2.5 text-xs"
                            >
                                <Link href={`/${modData.path}/${currentSection.path}`}>
                                    <ExternalLink className="size-3" aria-hidden="true"/>
                                    Voir
                                </Link>
                            </Button>
                            {hasExamen && (
                                <span
                                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-bridge-100 px-2.5 font-mono text-xs font-bold text-brand-primary dark:bg-bridge-900"
                                    title="Code d'accès à l'examen"
                                >
                                    <KeyRound className="size-3" aria-hidden="true"/>
                                    {modData._id?.toString().slice(-6).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* États + actions : une seule ligne sur mobile (switches à gauche, actions à droite) */}
                <div className="flex items-center justify-between gap-2 xl:gap-4">
                    <div className="flex items-start gap-1.5 xl:gap-2" role="group" aria-label={`États de la section ${currentSection.title}`}>
                        <ToggleCol
                            id={`${currentSection.path}-available`}
                            label="Publiée"
                            checked={isAvailable}
                            disabled={pendingKey !== null}
                            pending={pendingKey === "isAvailable"}
                            onChange={(checked) => handleToggle("isAvailable", checked)}
                        />
                        <ToggleCol
                            id={`${currentSection.path}-correction`}
                            label="Correction"
                            checked={correctionIsAvailable}
                            disabled={!currentSection.hasCorrection || pendingKey !== null}
                            pending={pendingKey === "correctionIsAvailable"}
                            onChange={(checked) => handleToggle("correctionIsAvailable", checked)}
                        />
                        {hasExamen ? (
                            <ToggleCol
                                id={`${currentSection.path}-examen-lock`}
                                label="Verrou examen"
                                checked={!!currentSection.examenIsLock}
                                disabled={pendingKey !== null}
                                pending={pendingKey === "examenIsLock"}
                                onChange={(checked) => handleToggle("examenIsLock", checked)}
                            />
                        ) : (
                            <div className="hidden w-24 xl:block" aria-hidden="true"/>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <EditSectionButton section={currentSection} modData={modData} onAdd={editSection}/>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 text-bridge-600 hover:bg-destructive/10 hover:text-destructive dark:text-bridge-300"
                                    disabled={deleting}
                                    aria-label={`Supprimer la section ${currentSection.title}`}
                                    title="Supprimer la section"
                                >
                                    <Trash2 className="size-4" aria-hidden="true"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="p-0 gap-0 overflow-hidden bg-card border-bridge-500/45">
                                <div className="flex items-center gap-3 px-6 py-4" style={{backgroundColor: moduleColor(modData)}}>
                                    <Trash2 className="w-5 h-5 text-white shrink-0"/>
                                    <AlertDialogTitle className="text-white font-bold text-lg">
                                        Supprimer la section ?
                                    </AlertDialogTitle>
                                </div>
                                <div className="px-6 py-5">
                                    <AlertDialogDescription className="text-brand-dark dark:text-bridge-200">
                                        La section <strong>{currentSection.title}</strong> sera définitivement supprimée.
                                        Cette action est irréversible.
                                    </AlertDialogDescription>
                                </div>
                                <AlertDialogFooter className="px-6 pb-5">
                                    <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={deleting} variant="destructive">
                                        {deleting ? "Suppression…" : "Supprimer définitivement"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </li>
    );
}
