"use client";

import {useCallback, useEffect} from "react";
import {Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Pencil, Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Textarea} from "@/components/ui/textarea";
import Eyebrow from "@/components/admin/ui/Eyebrow";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import type {Section as SectionApiPayload} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";
import {moduleColor} from "@/lib/moduleColor";
import {cn} from "@/lib/utils";
import {
    sectionFormSchema,
    type SectionFormValues,
    AVAILABLE_CONTENTS,
} from "@/lib/schemas/section.schema";

interface InlineSectionRowProps {
    module: Module;
    /** `null` = création d'une nouvelle section. */
    section: Section | null;
    /**
     * Appelé une fois l'édition terminée. `saved` porte la section enregistrée en cas de
     * succès ; absent lorsque l'utilisateur annule (rien à répercuter dans le tableau parent).
     * Écart volontaire par rapport à la signature `() => void` du brief : sans cette valeur de
     * retour, `SectionsStep` n'a aucun moyen de mettre à jour sa liste de sections sans refaire
     * un aller-retour réseau — l'appel API se fait ici, pas dans le parent.
     */
    onDone: (saved?: Section) => void;
}

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

export default function InlineSectionRow({module, section, onDone}: InlineSectionRowProps) {
    const isEditMode = section !== null;
    const {addSection, editSection} = useAdminApi();
    // Espace de noms des id des champs : la ligne "Ajouter une section" et une ligne "Éditer"
    // peuvent être dépliées en même temps dans le tableau (états indépendants dans
    // SectionsStep) — des id figés en dur (`isr-title`, etc.) entreraient alors en collision
    // et casseraient l'association <label htmlFor>.
    const fieldId = (name: string) => `isr-${section ? section.path : "new"}-${name}`;

    const getDefaultValues = useCallback((): SectionFormValues => {
        if (section) {
            return {
                title: section.title,
                path: section.path,
                description: section.description ?? "",
                objectives: (section.objectives ?? []).join("\n"),
                tags: (section.tags ?? []).join(","),
                totalDuration: section.totalDuration,
                hasCorrection: section.hasCorrection,
                isAvailable: section.isAvailable ?? true,
                correctionIsAvailable: section.correctionIsAvailable ?? true,
                order: section.order,
                contents: section.contents
                    .map((c) => c.type)
                    .filter((c): c is typeof AVAILABLE_CONTENTS[number] => (AVAILABLE_CONTENTS as readonly string[]).includes(c)) as SectionFormValues["contents"],
                examenIsLock: section.examenIsLock ?? false,
                courseIntroMinutes: section.courseIntroMinutes,
                briefObjectives: (section.brief?.objectives ?? []).join("\n"),
                briefNotions: (section.brief?.notions ?? []).join("\n"),
                briefFilRougeStep: section.brief?.filRougeStep ?? "",
                briefNotes: section.brief?.notes ?? "",
                curriculumNotions: (section.curriculum?.notions ?? []).join("\n"),
                curriculumApis: (section.curriculum?.apis ?? []).join("\n"),
            };
        }
        return {
            title: "",
            path: "",
            description: "",
            objectives: "",
            tags: "",
            totalDuration: 1,
            hasCorrection: true,
            isAvailable: true,
            correctionIsAvailable: true,
            examenIsLock: false,
            order: (module.sections?.length ?? 0) + 1,
            contents: ["cours", "TP"],
            courseIntroMinutes: undefined,
            briefObjectives: "",
            briefNotions: "",
            briefFilRougeStep: "",
            briefNotes: "",
            curriculumNotions: "",
            curriculumApis: "",
        };
    }, [section, module.sections?.length]);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors, isSubmitting},
    } = useForm<SectionFormValues>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: getDefaultValues(),
    });

    const title = useWatch({control, name: "title"});
    const contents = useWatch({control, name: "contents"}) ?? [];

    useEffect(() => {
        if (!isEditMode && title) {
            setValue(
                "path",
                `${(module.sections?.length ?? 0) + 1}-${title.toLowerCase().replace(/\s+/g, "-")}`,
            );
        }
    }, [title, setValue, module.sections?.length, isEditMode]);

    const toggleContent = (item: typeof AVAILABLE_CONTENTS[number]) => {
        setValue(
            "contents",
            contents.includes(item)
                ? contents.filter((c) => c !== item)
                : ([...contents, item] as SectionFormValues["contents"]),
            {shouldDirty: true, shouldValidate: true},
        );
    };

    const onSubmit = async (data: SectionFormValues) => {
        // Même logique de nettoyage que SectionForm.handleFormSubmit : objectifs/tags/brief/
        // curriculum arrivent en texte multi-lignes ou séparé par des virgules depuis le
        // formulaire, et doivent être transformés en tableaux avant l'appel API.
        const cleanedObjectives = (data.objectives ?? "")
            .split("\n")
            .map((o) => o.trim())
            .filter((o) => o.length > 0);

        const cleanedTags = (data.tags ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        const splitLines = (s?: string) =>
            (s ?? "").split("\n").map((x) => x.trim()).filter((x) => x.length > 0);

        const brief = {
            objectives: splitLines(data.briefObjectives),
            notions: splitLines(data.briefNotions),
            filRougeStep: (data.briefFilRougeStep ?? "").trim(),
            ...(data.briefNotes?.trim() && {notes: data.briefNotes.trim()}),
        };
        const curriculum = {
            notions: splitLines(data.curriculumNotions),
            apis: splitLines(data.curriculumApis),
        };
        const hasBrief = brief.objectives.length > 0 || brief.notions.length > 0 || brief.filRougeStep.length > 0;
        const hasCurriculum = curriculum.notions.length > 0 || curriculum.apis.length > 0;

        const payload: SectionApiPayload = {
            ...data,
            objectives: cleanedObjectives,
            tags: cleanedTags,
            ...(hasBrief && {brief}),
            ...(hasCurriculum && {curriculum}),
        };

        try {
            const saved: Section = isEditMode
                ? await editSection(String(module._id), String(section!._id), payload)
                : await addSection(String(module._id), payload);
            toast.success(isEditMode ? "Section mise à jour." : "Section ajoutée.");
            onDone(saved);
        } catch {
            toast.error(isEditMode ? "Erreur lors de la mise à jour de la section." : "Erreur lors de l'ajout de la section.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 rounded-lg border border-bridge-500/45 bg-card p-4"
        >
            <div className="flex items-center gap-2">
                {isEditMode ? (
                    <Pencil className="size-4 shrink-0" style={{color: moduleColor(module)}} aria-hidden="true"/>
                ) : (
                    <Plus className="size-4 shrink-0" style={{color: moduleColor(module)}} aria-hidden="true"/>
                )}
                <p className="text-sm font-bold text-brand-dark dark:text-bridge-100">
                    {isEditMode ? `Modifier « ${section!.title} »` : "Nouvelle section"}
                </p>
            </div>

            {/* Identification */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Identification</Eyebrow>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <Label htmlFor={fieldId("title")} className={labelCn}>Titre *</Label>
                        <Input
                            id={fieldId("title")}
                            className={inputCn}
                            {...register("title")}
                            aria-invalid={errors.title ? "true" : "false"}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="sm:w-48">
                        <Label htmlFor={fieldId("path")} className={labelCn}>Path *</Label>
                        <Input
                            id={fieldId("path")}
                            className={cn(inputCn, isEditMode && "opacity-60 cursor-not-allowed")}
                            {...register("path")}
                            readOnly={isEditMode}
                            aria-invalid={errors.path ? "true" : "false"}
                        />
                        {errors.path && <p className="text-red-500 text-xs mt-1">{errors.path.message}</p>}
                    </div>
                </div>
                <div>
                    <Label htmlFor={fieldId("description")} className={labelCn}>Description</Label>
                    <Textarea id={fieldId("description")} className={inputCn} {...register("description")}/>
                </div>
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Contenu */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Types de contenu</Eyebrow>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {AVAILABLE_CONTENTS.map((content) => (
                        <label key={content} className="flex min-h-11 items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={contents.includes(content)}
                                onCheckedChange={() => toggleContent(content)}
                                aria-label={content}
                            />
                            <span className="text-sm text-brand-dark dark:text-bridge-100 capitalize">
                                {content}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.contents && <p className="text-red-500 text-xs">{errors.contents.message}</p>}
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Pédagogie */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Pédagogie</Eyebrow>
                <div>
                    <Label htmlFor={fieldId("objectives")} className={labelCn}>Objectifs</Label>
                    <Textarea id={fieldId("objectives")} rows={3} className={inputCn} {...register("objectives")}/>
                    <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Un objectif par ligne</span>
                </div>
                <div>
                    <Label htmlFor={fieldId("tags")} className={labelCn}>Tags</Label>
                    <Textarea id={fieldId("tags")} rows={2} className={inputCn} {...register("tags")}/>
                    <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Séparés par une virgule</span>
                </div>
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Paramètres */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Paramètres</Eyebrow>
                <div className="flex flex-wrap gap-4">
                    <div className="w-28">
                        <Label htmlFor={fieldId("duration")} className={labelCn}>Séances *</Label>
                        <Input
                            id={fieldId("duration")}
                            type="number"
                            min={1}
                            className={inputCn}
                            {...register("totalDuration", {valueAsNumber: true})}
                        />
                        {errors.totalDuration && <p className="text-red-500 text-xs mt-1">{errors.totalDuration.message}</p>}
                    </div>
                    <div className="w-28">
                        <Label htmlFor={fieldId("order")} className={labelCn}>Position *</Label>
                        <Input
                            id={fieldId("order")}
                            type="number"
                            min={1}
                            className={inputCn}
                            {...register("order", {valueAsNumber: true})}
                        />
                        {errors.order && <p className="text-red-500 text-xs mt-1">{errors.order.message}</p>}
                    </div>
                    <div className="w-40">
                        <Label htmlFor={fieldId("intro")} className={labelCn}>Cours 1re séance (min)</Label>
                        <Input
                            id={fieldId("intro")}
                            type="number"
                            min={0}
                            className={inputCn}
                            {...register("courseIntroMinutes", {
                                setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
                            })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(
                        [
                            {name: "isAvailable", label: "Disponible"},
                            {name: "hasCorrection", label: "Correction"},
                            {name: "correctionIsAvailable", label: "Correction disponible"},
                            {name: "examenIsLock", label: "Examen verrouillé"},
                        ] as const
                    ).map(({name, label}) => (
                        <label key={name} className="flex min-h-11 items-center gap-2 cursor-pointer">
                            <Controller
                                name={name}
                                control={control}
                                render={({field}) => (
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                )}
                            />
                            <span className="text-sm text-brand-dark dark:text-bridge-100">{label}</span>
                        </label>
                    ))}
                </div>
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Brief — le prévu */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Brief (le prévu)</Eyebrow>
                <div>
                    <Label htmlFor={fieldId("brief-objectives")} className={labelCn}>Objectifs du brief</Label>
                    <Textarea id={fieldId("brief-objectives")} rows={3} className={inputCn} {...register("briefObjectives")}/>
                    <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Un par ligne</span>
                </div>
                <div>
                    <Label htmlFor={fieldId("brief-notions")} className={labelCn}>Notions à couvrir</Label>
                    <Textarea id={fieldId("brief-notions")} rows={3} className={inputCn} {...register("briefNotions")}/>
                    <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                </div>
                <div>
                    <Label htmlFor={fieldId("brief-filrouge")} className={labelCn}>Étape fil rouge</Label>
                    <Input id={fieldId("brief-filrouge")} className={inputCn} {...register("briefFilRougeStep")}/>
                </div>
                <div>
                    <Label htmlFor={fieldId("brief-notes")} className={labelCn}>Notes</Label>
                    <Textarea id={fieldId("brief-notes")} rows={2} className={inputCn} {...register("briefNotes")}/>
                </div>
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Curriculum — le réalisé */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Curriculum (le réalisé)</Eyebrow>
                <div>
                    <Label htmlFor={fieldId("curriculum-notions")} className={labelCn}>Notions enseignées</Label>
                    <Textarea id={fieldId("curriculum-notions")} rows={3} className={inputCn} {...register("curriculumNotions")}/>
                    <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                </div>
                <div>
                    <Label htmlFor={fieldId("curriculum-apis")} className={labelCn}>APIs / fonctions vues</Label>
                    <Textarea id={fieldId("curriculum-apis")} rows={3} className={inputCn} {...register("curriculumApis")}/>
                    <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                </div>
            </section>

            <div className="flex items-center justify-end gap-3 border-t border-bridge-700/20 pt-4 dark:border-bridge-500/20">
                <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 gap-2 text-brand-dark dark:text-bridge-200"
                    onClick={() => onDone()}
                    disabled={isSubmitting}
                >
                    <X className="size-4" aria-hidden="true"/>
                    Annuler
                </Button>
                <Button
                    type="submit"
                    className="min-h-11 text-white dark:text-brand-dark font-semibold hover:opacity-90"
                    style={{backgroundColor: moduleColor(module)}}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                >
                    {isSubmitting ? "Enregistrement…" : isEditMode ? "Enregistrer" : "Ajouter"}
                </Button>
            </div>
        </form>
    );
}
