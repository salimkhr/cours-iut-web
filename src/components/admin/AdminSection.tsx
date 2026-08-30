"use client";

import Link from "next/link";
import Section from "@/types/Section";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useState} from "react";
import {toast} from "sonner";
import updateSectionState from "@/hook/admin/updateSectionState";
import Module from "@/types/Module";
import {getContentTypes, hasContentType} from "@/types/CourseContent";
import useAdminApi, {type SectionApiPayload} from "@/hook/admin/useAdminApi";
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

export type ToggleKey = keyof Pick<Section, "correctionIsAvailable" | "isAvailable" | "examenIsLock">;

/**
 * État + actions d'une section, factorisés hors du `<li>` pour être réutilisables ailleurs
 * qu'à l'intérieur de la liste historique (ex: une ligne de `AdminDataTable`, cf.
 * `SectionsStep`). `currentSection` est capturé une seule fois à partir de `initialSection`,
 * comme dans le comportement historique du `<li>` — ce hook ne se resynchronise PAS tout seul
 * sur un changement de prop. Un appelant qui a besoin de refléter une donnée modifiée ailleurs
 * (ex: après une édition en ligne via `InlineSectionRow`) doit remonter l'instance avec une
 * `key` dérivée de la section (cf. `SectionsStep`) plutôt que de resynchroniser via un effet —
 * un `setState` synchrone dans un effet déclenche des rendus en cascade (règle
 * `react-hooks/set-state-in-effect`).
 */
export function useSectionRowState(
    initialSection: Section,
    modData: Module,
    onDelete?: (sectionPath: string) => void,
) {
    const [currentSection, setCurrentSection] = useState<Section>(initialSection);
    const [deleting, setDeleting] = useState(false);
    const [pendingKey, setPendingKey] = useState<ToggleKey | null>(null);
    const moduleId = modData._id;
    const {editSection: editSectionApi, deleteSection: deleteSectionApi} = useAdminApi();

    const editSection = async (updatedSection: SectionApiPayload) => {
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

    const handleToggle = async (key: ToggleKey, value: boolean) => {
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

    return {currentSection, setCurrentSection, deleting, pendingKey, editSection, handleDelete, handleToggle};
}

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
                className="text-center text-[11px] uppercase tracking-[0.12em] font-semibold text-brand-dark/55 dark:text-bridge-200/55"
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

interface SectionStateSwitchesProps {
    section: Section;
    pendingKey: ToggleKey | null;
    onToggle: (key: ToggleKey, value: boolean) => void;
}

/** Les 3 switches d'état (Publiée / Correction / Verrou examen) — extrait du `<li>` pour être
 *  réutilisé tel quel dans une cellule de `AdminDataTable` (cf. `SectionsStep`). */
export function SectionStateSwitches({section, pendingKey, onToggle}: SectionStateSwitchesProps) {
    const hasExamen = hasContentType(section.contents, "examen");

    return (
        <div className="flex items-start gap-1.5 xl:gap-2" role="group" aria-label={`États de la section ${section.title}`}>
            <ToggleCol
                id={`${section.path}-available`}
                label="Publiée"
                checked={!!section.isAvailable}
                disabled={pendingKey !== null}
                pending={pendingKey === "isAvailable"}
                onChange={(checked) => onToggle("isAvailable", checked)}
            />
            <ToggleCol
                id={`${section.path}-correction`}
                label="Correction"
                checked={!!section.correctionIsAvailable}
                disabled={!section.hasCorrection || pendingKey !== null}
                pending={pendingKey === "correctionIsAvailable"}
                onChange={(checked) => onToggle("correctionIsAvailable", checked)}
            />
            {hasExamen ? (
                <ToggleCol
                    id={`${section.path}-examen-lock`}
                    label="Verrou examen"
                    checked={!!section.examenIsLock}
                    disabled={pendingKey !== null}
                    pending={pendingKey === "examenIsLock"}
                    onChange={(checked) => onToggle("examenIsLock", checked)}
                />
            ) : (
                <div className="hidden w-24 xl:block" aria-hidden="true"/>
            )}
        </div>
    );
}

interface SectionContentLinksProps {
    section: Section;
    modData: Module;
}

/** Liens rapides vers les contenus (cours/TP/slide/examen), le rendu public, et le badge de
 *  code d'accès examen. Rendus en `ghost` et sans marge propre : ils vivent dans la colonne
 *  « Actions », aux côtés des boutons modifier/supprimer, et doivent former un groupe homogène
 *  avec eux plutôt que se distinguer visuellement. */
export function SectionContentLinks({section, modData}: SectionContentLinksProps) {
    const hasExamen = hasContentType(section.contents, "examen");
    const sortedContents = getContentTypes(section.contents).sort(
        (first, second) => CONTENT_ORDER.indexOf(first as ContentKey) - CONTENT_ORDER.indexOf(second as ContentKey)
    );

    return (
        <div className="flex flex-wrap items-center gap-1">
            {sortedContents.map((content) => {
                const key = content as ContentKey;
                return (
                    <Button
                        key={content}
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2.5 text-xs text-bridge-600 dark:text-bridge-300"
                    >
                        <Link href={`/admin/content/${modData.path}/${section.path}/${content}`}>
                            <Pencil className="size-3" aria-hidden="true"/>
                            {CONTENT_LABELS[key] ?? content}
                        </Link>
                    </Button>
                );
            })}
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs text-bridge-600 dark:text-bridge-300"
            >
                <Link href={`/${modData.path}/${section.path}`}>
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
    );
}

/** Brief de la section, destiné à une ligne pleine largeur sous la ligne principale du tableau
 *  (cf. `renderSubRow` de `AdminDataTable`) — et non à une cellule de colonne : les cellules
 *  portent `whitespace-nowrap`, un texte long y étirerait le tableau au lieu de revenir à la
 *  ligne. Évite d'ouvrir la modale d'édition juste pour lire ce que la section doit produire. */
export function hasSectionBrief(section: Section): boolean {
    const brief = section.brief;
    return Boolean(brief?.filRougeStep?.trim() || brief?.filRougeOutcome?.trim() || brief?.providedBase?.trim());
}

export function SectionBriefPreview({section}: {section: Section}) {
    const brief = section.brief;
    if (!hasSectionBrief(section)) return null;

    const lines = [
        {label: "Étape", value: brief?.filRougeStep?.trim()},
        {label: "Résultat", value: brief?.filRougeOutcome?.trim()},
        {label: "Base fournie", value: brief?.providedBase?.trim()},
    ].filter((line) => Boolean(line.value));

    return (
        <dl className="flex max-w-4xl flex-col gap-1 text-xs leading-relaxed text-bridge-600 dark:text-bridge-400">
            {lines.map((line) => (
                <div key={line.label} className="flex flex-wrap gap-x-1.5">
                    <dt className="font-semibold text-brand-dark/70 dark:text-bridge-300">
                        {line.label}
                    </dt>
                    <dd className="min-w-0 flex-1">{line.value}</dd>
                </div>
            ))}
        </dl>
    );
}

interface SectionDeleteDialogProps {
    section: Section;
    modData: Module;
    deleting: boolean;
    onConfirm: () => void;
}

/** `AlertDialog` de suppression — extrait du `<li>` pour être réutilisé dans une cellule de
 *  tableau. Jamais de modale de formulaire ici : uniquement une confirmation destructive. */
export function SectionDeleteDialog({section, modData, deleting, onConfirm}: SectionDeleteDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-bridge-600 hover:bg-destructive/10 hover:text-destructive dark:text-bridge-300"
                    disabled={deleting}
                    aria-label={`Supprimer la section ${section.title}`}
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
                        La section <strong>{section.title}</strong> sera définitivement supprimée.
                        Cette action est irréversible.
                    </AlertDialogDescription>
                </div>
                <AlertDialogFooter className="px-6 pb-5">
                    <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={deleting} variant="destructive">
                        {deleting ? "Suppression…" : "Supprimer définitivement"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

