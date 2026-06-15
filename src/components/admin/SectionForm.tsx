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
import { ContentRef } from '@/types/CourseContent';
import {
    sectionFormSchema,
    type SectionFormValues,
    AVAILABLE_CONTENTS,
} from '@/lib/schemas/section.schema';
import Eyebrow from '@/components/admin/ui/Eyebrow';
import { SECTION_ICON_MAP, SECTION_ICON_LABELS } from '@/components/icons/section-icons';

// Type exporté pour rétrocompatibilité avec EditSectionFab et AddSectionButton
export type Section = {
    title: string;
    path: string;
    description?: string;
    objectives?: string[] | string;
    tags: string[] | string;
    icon?: string;
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    contents: ContentRef[] | string[];
    examenIsLock?: boolean;
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
                icon: section!.icon ?? '',
                totalDuration: section!.totalDuration,
                hasCorrection: section!.hasCorrection,
                isAvailable: section!.isAvailable ?? true,
                correctionIsAvailable: section!.correctionIsAvailable ?? true,
                order: section!.order,
                contents: section!.contents
                    .map(c => typeof c === "string" ? c : c.type)
                    .filter((c): c is typeof AVAILABLE_CONTENTS[number] => (AVAILABLE_CONTENTS as readonly string[]).includes(c)) as SectionFormValues['contents'],
                examenIsLock: section!.examenIsLock ?? false,
            };
        }
        return {
            title: prefill?.title ?? '',
            path: prefill?.path ?? '',
            description: '',
            objectives: '',
            tags: '',
            icon: '',
            totalDuration: prefill?.totalDuration ?? 1,
            hasCorrection: prefill?.hasCorrection ?? true,
            isAvailable: prefill?.isAvailable ?? true,
            correctionIsAvailable: true,
            examenIsLock: false,
            order: prefill?.order ?? (modData.sections?.length ?? 0) + 1,
            contents: prefill?.contents ?? ['cours', 'TP'],
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

        onSubmit({
            ...data,
            objectives: cleanedObjectives,
            tags: cleanedTags,
            icon: data.icon || undefined,
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
                    'bg-[#f7ebd9] dark:bg-[#13110d]',
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
                    className={`bg-${modData.path}`}
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
                            <div>
                                <Label className={labelCn}>Icône</Label>
                                <Controller
                                    name="icon"
                                    control={control}
                                    render={({field}) => (
                                        <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                                            <button
                                                type="button"
                                                onClick={() => field.onChange('')}
                                                className={cn(
                                                    "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-[10px] font-medium transition-colors",
                                                    !field.value
                                                        ? `border-(--module-color) bg-(--module-color)/10 text-brand-dark dark:text-bridge-100`
                                                        : "border-bridge-500/30 text-bridge-500 hover:border-bridge-500/60"
                                                )}
                                            >
                                                <span className="text-base leading-none">—</span>
                                                <span>Aucune</span>
                                            </button>
                                            {Object.entries(SECTION_ICON_MAP).map(([key, IconComp]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => field.onChange(key)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-[10px] font-medium transition-colors",
                                                        field.value === key
                                                            ? `border-(--module-color) bg-(--module-color)/10 text-brand-dark dark:text-bridge-100`
                                                            : "border-bridge-500/30 text-bridge-500 hover:border-bridge-500/60"
                                                    )}
                                                >
                                                    <IconComp size={18} className={field.value === key ? "text-(--module-color)" : "text-bridge-400"} />
                                                    <span className="text-center leading-tight">{SECTION_ICON_LABELS[key]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
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
                            className={cn('text-white dark:text-brand-dark font-semibold', `bg-${modData.path} hover:opacity-90`)}
                        >
                            {isEditMode ? 'Enregistrer' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
