'use client';

import {useCallback, useEffect} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Pencil, Plus} from 'lucide-react';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import {moduleColor} from '@/lib/moduleColor';
import { ContentRef } from '@/types/CourseContent';
import {
    sectionFormSchema,
    type SectionFormValues,
    AVAILABLE_CONTENTS,
} from '@/lib/schemas/section.schema';
import Eyebrow from '@/components/admin/ui/Eyebrow';

// Type exporte pour les formulaires d'ajout et d'edition de section.
export type Section = {
    title: string;
    path: string;
    description?: string;
    objectives?: string[] | string;
    tags: string[] | string;
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    contents: ContentRef[] | string[];
    examenIsLock?: boolean;
    courseIntroMinutes?: number;
    brief?: { objectives: string[]; notions: string[]; filRougeStep: string; notes?: string };
    curriculum?: { notions: string[]; apis: string[] };
};

interface SectionFormProps {
    modData: Module;
    section?: Section;
    mode: 'add' | 'edit';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (section: Section) => void;
    prefill?: {
        title?: string;
        path?: string;
        order?: number;
        contents?: SectionFormValues['contents'];
        isAvailable?: boolean;
        hasCorrection?: boolean;
        totalDuration?: number;
    };
}

export default function SectionForm({
    modData,
    section,
    mode,
    open,
    onOpenChange,
    onSubmit,
    prefill,
}: SectionFormProps) {
    const isEditMode = mode === 'edit' && section !== undefined;

    const getDefaultValues = useCallback((): SectionFormValues => {
        if (isEditMode) {
            return {
                title: section!.title,
                path: section!.path,
                description: section!.description ?? '',
                objectives: Array.isArray(section!.objectives)
                    ? section!.objectives.join('\n')
                    : (section!.objectives ?? ''),
                tags: Array.isArray(section!.tags)
                    ? section!.tags.join(',')
                    : (section!.tags ?? ''),
                totalDuration: section!.totalDuration,
                hasCorrection: section!.hasCorrection,
                isAvailable: section!.isAvailable ?? true,
                correctionIsAvailable: section!.correctionIsAvailable ?? true,
                order: section!.order,
                contents: section!.contents
                    .map(c => typeof c === "string" ? c : c.type)
                    .filter((c): c is typeof AVAILABLE_CONTENTS[number] => (AVAILABLE_CONTENTS as readonly string[]).includes(c)) as SectionFormValues['contents'],
                examenIsLock: section!.examenIsLock ?? false,
                courseIntroMinutes: section!.courseIntroMinutes,
                briefObjectives: (section!.brief?.objectives ?? []).join('\n'),
                briefNotions: (section!.brief?.notions ?? []).join('\n'),
                briefFilRougeStep: section!.brief?.filRougeStep ?? '',
                briefNotes: section!.brief?.notes ?? '',
                curriculumNotions: (section!.curriculum?.notions ?? []).join('\n'),
                curriculumApis: (section!.curriculum?.apis ?? []).join('\n'),
            };
        }
        return {
            title: prefill?.title ?? '',
            path: prefill?.path ?? '',
            description: '',
            objectives: '',
            tags: '',
            totalDuration: prefill?.totalDuration ?? 1,
            hasCorrection: prefill?.hasCorrection ?? true,
            isAvailable: prefill?.isAvailable ?? true,
            correctionIsAvailable: true,
            examenIsLock: false,
            order: prefill?.order ?? (modData.sections?.length ?? 0) + 1,
            contents: prefill?.contents ?? ['cours', 'TP'],
            courseIntroMinutes: undefined,
            briefObjectives: '',
            briefNotions: '',
            briefFilRougeStep: '',
            briefNotes: '',
            curriculumNotions: '',
            curriculumApis: '',
        };
    }, [isEditMode, section, modData.sections?.length, prefill]);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        formState: {errors},
    } = useForm<SectionFormValues>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: getDefaultValues(),
    });

    const title = useWatch({control, name: 'title'});
    const contents = useWatch({control, name: 'contents'}) ?? [];

    useEffect(() => {
        if (open) reset(getDefaultValues());
    }, [open, reset, getDefaultValues]);

    useEffect(() => {
        if (!isEditMode && !prefill?.path && title) {
            setValue(
                'path',
                `${(modData.sections?.length ?? 0) + 1}-${title.toLowerCase().replace(/\s+/g, '-')}`,
            );
        }
    }, [title, setValue, modData.sections?.length, isEditMode, prefill?.path]);

    const toggleContent = (item: typeof AVAILABLE_CONTENTS[number]) => {
        setValue(
            'contents',
            contents.includes(item)
                ? contents.filter((c) => c !== item)
                : ([...contents, item] as SectionFormValues['contents']),
            {shouldDirty: true, shouldValidate: true},
        );
    };

    const handleFormSubmit = (data: SectionFormValues) => {
        const cleanedObjectives = (data.objectives ?? '')
            .split('\n')
            .map((o) => o.trim())
            .filter((o) => o.length > 0);

        const cleanedTags = (data.tags ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        const splitLines = (s?: string) =>
            (s ?? '').split('\n').map((x) => x.trim()).filter((x) => x.length > 0);

        const brief = {
            objectives: splitLines(data.briefObjectives),
            notions: splitLines(data.briefNotions),
            filRougeStep: (data.briefFilRougeStep ?? '').trim(),
            ...(data.briefNotes?.trim() && { notes: data.briefNotes.trim() }),
        };
        const curriculum = {
            notions: splitLines(data.curriculumNotions),
            apis: splitLines(data.curriculumApis),
        };
        const hasBrief = brief.objectives.length > 0 || brief.notions.length > 0 || brief.filRougeStep.length > 0;
        const hasCurriculum = curriculum.notions.length > 0 || curriculum.apis.length > 0;

        onSubmit({
            ...data,
            objectives: cleanedObjectives,
            tags: cleanedTags,
            ...(hasBrief && { brief }),
            ...(hasCurriculum && { curriculum }),
        });

        onOpenChange(false);
    };

    const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
    const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[480px]',
                    'bg-card',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                )}
            >
                {/* Header */}
                <AdminSheetHeader
                    icon={isEditMode ? Pencil : Plus}
                    eyebrow="Section"
                    title={isEditMode ? 'Modifier la section' : 'Ajouter une section'}
                    srDescription={isEditMode ? 'Modifier les paramètres de la section' : 'Ajouter une nouvelle section au module'}
                    style={{ backgroundColor: moduleColor(modData) }}
                />

                {/* Body + Footer */}
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                        {/* Identification */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Identification</Eyebrow>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="sf-title" className={labelCn}>Titre *</Label>
                                    <Input
                                        id="sf-title"
                                        className={inputCn}
                                        {...register('title')}
                                        aria-invalid={errors.title ? 'true' : 'false'}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                    )}
                                </div>
                                <div className="w-40">
                                    <Label htmlFor="sf-path" className={labelCn}>Path *</Label>
                                    <Input
                                        id="sf-path"
                                        className={cn(inputCn, isEditMode && 'opacity-60 cursor-not-allowed')}
                                        {...register('path')}
                                        readOnly={isEditMode}
                                        aria-invalid={errors.path ? 'true' : 'false'}
                                    />
                                    {errors.path && (
                                        <p className="text-red-500 text-xs mt-1">{errors.path.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="sf-description" className={labelCn}>Description</Label>
                                <Textarea id="sf-description" className={inputCn} {...register('description')}/>
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Contenu */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Types de contenu</Eyebrow>
                            <div className="grid grid-cols-3 gap-2">
                                {AVAILABLE_CONTENTS.map((content) => (
                                    <label key={content} className="flex items-center gap-2 cursor-pointer">
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
                            {errors.contents && (
                                <p className="text-red-500 text-xs">{errors.contents.message}</p>
                            )}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Pédagogie */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Pédagogie</Eyebrow>
                            <div>
                                <Label htmlFor="sf-objectives" className={labelCn}>Objectifs</Label>
                                <Textarea
                                    id="sf-objectives"
                                    rows={4}
                                    className={inputCn}
                                    {...register('objectives')}
                                />
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">
                                    Un objectif par ligne
                                </span>
                            </div>
                            <div>
                                <Label htmlFor="sf-tags" className={labelCn}>Tags</Label>
                                <Textarea id="sf-tags" rows={2} className={inputCn} {...register('tags')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">
                                    Séparés par une virgule
                                </span>
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Paramètres */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Paramètres</Eyebrow>
                            <div className="flex gap-4">
                                <div className="w-28">
                                    <Label htmlFor="sf-duration" className={labelCn}>Séances *</Label>
                                    <Input
                                        id="sf-duration"
                                        type="number"
                                        min={1}
                                        className={inputCn}
                                        {...register('totalDuration', {valueAsNumber: true})}
                                    />
                                    {errors.totalDuration && (
                                        <p className="text-red-500 text-xs mt-1">{errors.totalDuration.message}</p>
                                    )}
                                </div>
                                <div className="w-28">
                                    <Label htmlFor="sf-order" className={labelCn}>Position *</Label>
                                    <Input
                                        id="sf-order"
                                        type="number"
                                        min={1}
                                        className={inputCn}
                                        {...register('order', {valueAsNumber: true})}
                                    />
                                    {errors.order && (
                                        <p className="text-red-500 text-xs mt-1">{errors.order.message}</p>
                                    )}
                                </div>
                                <div className="w-36">
                                    <Label htmlFor="sf-intro" className={labelCn}>Cours 1re séance (min)</Label>
                                    <Input
                                        id="sf-intro"
                                        type="number"
                                        min={0}
                                        className={inputCn}
                                        {...register('courseIntroMinutes', {
                                            setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(
                                    [
                                        {name: 'isAvailable', label: 'Disponible'},
                                        {name: 'hasCorrection', label: 'Correction'},
                                        {name: 'correctionIsAvailable', label: 'Correction disponible'},
                                        {name: 'examenIsLock', label: 'Examen verrouillé'},
                                    ] as const
                                ).map(({name, label}) => (
                                    <label key={name} className="flex items-center gap-2 cursor-pointer">
                                        <Controller
                                            name={name}
                                            control={control}
                                            render={({field}) => (
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            )}
                                        />
                                        <span className="text-sm text-brand-dark dark:text-bridge-100">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Brief — le prévu */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Brief (le prévu)</Eyebrow>
                            <div>
                                <Label htmlFor="sf-brief-objectives" className={labelCn}>Objectifs du brief</Label>
                                <Textarea id="sf-brief-objectives" rows={3} className={inputCn} {...register('briefObjectives')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Un par ligne</span>
                            </div>
                            <div>
                                <Label htmlFor="sf-brief-notions" className={labelCn}>Notions à couvrir</Label>
                                <Textarea id="sf-brief-notions" rows={3} className={inputCn} {...register('briefNotions')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                            </div>
                            <div>
                                <Label htmlFor="sf-brief-filrouge" className={labelCn}>Étape fil rouge</Label>
                                <Input id="sf-brief-filrouge" className={inputCn} {...register('briefFilRougeStep')}/>
                            </div>
                            <div>
                                <Label htmlFor="sf-brief-notes" className={labelCn}>Notes</Label>
                                <Textarea id="sf-brief-notes" rows={2} className={inputCn} {...register('briefNotes')}/>
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Curriculum — le réalisé */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Curriculum (le réalisé)</Eyebrow>
                            <div>
                                <Label htmlFor="sf-curriculum-notions" className={labelCn}>Notions enseignées</Label>
                                <Textarea id="sf-curriculum-notions" rows={3} className={inputCn} {...register('curriculumNotions')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                            </div>
                            <div>
                                <Label htmlFor="sf-curriculum-apis" className={labelCn}>APIs / fonctions vues</Label>
                                <Textarea id="sf-curriculum-apis" rows={3} className={inputCn} {...register('curriculumApis')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                            </div>
                        </section>
                    </div>

                    {/* Footer sticky */}
                    <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-brand-dark dark:text-bridge-200"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="text-white dark:text-brand-dark font-semibold hover:opacity-90"
                            style={{ backgroundColor: moduleColor(modData) }}
                        >
                            {isEditMode ? 'Enregistrer' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
