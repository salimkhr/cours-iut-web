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
import {ExternalLink, Pencil, Trash2} from "lucide-react";
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

export default function AdminSection({
    section,
    modData,
    onDelete,
}: AdminSectionProps) {
    const [currentSection, setCurrentSection] = useState<Section>(section);
    const [deleting, setDeleting] = useState(false);

    const isAvailable = !!currentSection.isAvailable;
    const correctionIsAvailable = !!currentSection.correctionIsAvailable;
    const moduleId = modData._id;
    const {editSection: editSectionApi, deleteSection: deleteSectionApi} = useAdminApi();

    const editSection = async (updatedSection: SectionFrom) => {
        try {
            const saved = await editSectionApi(modData._id as unknown as string, String(currentSection._id), updatedSection);
            setCurrentSection(saved);
            toast.success("Section mise a jour.");
        } catch {
            toast.error("Erreur lors de la mise a jour de la section.");
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteSectionApi(modData._id as unknown as string, currentSection.path);
            toast.success("Section supprimee.");
            onDelete?.(currentSection.path);
        } catch {
            toast.error("Erreur lors de la suppression de la section.");
            setDeleting(false);
        }
    };

    const handleToggle = async (
        key: keyof Pick<Section, "correctionIsAvailable" | "isAvailable" | "examenIsLock">,
        value: boolean
    ) => {
        const previous = currentSection[key];
        setCurrentSection((prev) => ({...prev, [key]: value}));
        try {
            await updateSectionState(moduleId, currentSection.order, key, value);
            toast.success("Section mise a jour.");
        } catch {
            setCurrentSection((prev) => ({...prev, [key]: previous}));
            toast.error("Erreur lors de la mise a jour de la section.");
        }
    };

    const sortedContents = getContentTypes(currentSection.contents).sort(
        (first, second) => CONTENT_ORDER.indexOf(first as ContentKey) - CONTENT_ORDER.indexOf(second as ContentKey)
    );

    return (
        <div className="rounded-lg border p-3 space-y-3 bg-muted/40">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-white dark:text-black font-mono font-bold text-xs shrink-0"
                        style={{backgroundColor: moduleColor(modData)}}
                    >
                        {currentSection.order.toString().padStart(2, "0")}
                    </span>
                    <span className="text-base font-semibold leading-tight text-brand-dark dark:text-bridge-100 truncate">
                        {currentSection.title}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <EditSectionButton section={currentSection} modData={modData} onAdd={editSection}/>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                disabled={deleting}
                                aria-label="Supprimer la section"
                            >
                                <Trash2 className="w-4 h-4"/>
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
                                    La section <strong>{currentSection.title}</strong> sera definitivement supprimee.
                                    Cette action est irreversible.
                                </AlertDialogDescription>
                            </div>
                            <AlertDialogFooter className="px-6 pb-5">
                                <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={deleting} variant="destructive">
                                    {deleting ? "Suppression..." : "Supprimer definitivement"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${currentSection.path}-available`} className="text-sm">
                        {getContentTypes(currentSection.contents).map((content) => content.charAt(0).toUpperCase() + content.slice(1)).join(", ")}
                    </Label>
                    <Switch
                        id={`${currentSection.path}-available`}
                        checked={isAvailable}
                        onCheckedChange={(checked) => handleToggle("isAvailable", !!checked)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${currentSection._id}-correction`} className="text-sm">
                        Correction
                    </Label>
                    <Switch
                        id={`${section._id}-correction`}
                        checked={correctionIsAvailable}
                        onCheckedChange={(checked) => handleToggle("correctionIsAvailable", !!checked)}
                        disabled={!currentSection.hasCorrection}
                    />
                </div>
                {hasContentType(currentSection.contents, "examen") && (
                    <div className="flex items-center justify-between">
                        <Label htmlFor={`${currentSection._id}-examen-lock`} className="text-sm">
                            Examen verrouille
                        </Label>
                        <Switch
                            id={`${currentSection._id}-examen-lock`}
                            checked={!!currentSection.examenIsLock}
                            onCheckedChange={(checked) => handleToggle("examenIsLock", !!checked)}
                        />
                    </div>
                )}
                <div className="border-t border-bridge-500/20 pt-3">
                    <p className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                        Contenus
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sortedContents.map((content) => {
                            const key = content as ContentKey;
                            return (
                                <Button key={content} asChild variant="outline" size="sm" className="min-h-10 gap-1.5 border-bridge-500/45">
                                    <Link href={`/admin/content/${modData.path}/${currentSection.path}/${content}`}>
                                        <Pencil className="size-3.5" aria-hidden="true"/>
                                        {CONTENT_LABELS[key] ?? content}
                                    </Link>
                                </Button>
                            );
                        })}
                        <Button asChild variant="outline" size="sm" className="min-h-10 gap-1.5 border-bridge-500/45">
                            <Link href={`/${modData.path}/${currentSection.path}`}>
                                <ExternalLink className="size-3.5" aria-hidden="true"/>
                                Voir
                            </Link>
                        </Button>
                    </div>
                </div>
                {hasContentType(currentSection.contents, "examen") && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
                        <span>Code d&apos;acces :</span>
                        <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-primary">
                            {modData._id?.toString().slice(-6).toUpperCase()}
                        </code>
                    </div>
                )}
            </div>
        </div>
    );
}
