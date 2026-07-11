'use client';

import {useCallback, useEffect} from 'react';
import {Controller, useFieldArray, useForm, type Resolver} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Settings} from 'lucide-react';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import {moduleColor} from '@/lib/moduleColor';
import {
    moduleFormSchema,
    type ModuleFormValues,
    FIXED_COMPETENCES,
    FIXED_SAES,
} from '@/lib/schemas/module.schema';
import Eyebrow from '@/components/admin/ui/Eyebrow';
import { LucideIconPicker } from '@/components/ui/LucideIconPicker';

interface EditModuleSheetProps {
    module: Module;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ModuleFormValues) => Promise<void>;
}

export default function EditModuleSheet({
    module,
    open,
    onOpenChange,
    onSubmit,
}: EditModuleSheetProps) {
    const getDefaultValues = useCallback((): ModuleFormValues => ({
        title: module.title,
        path: module.path,
        iconName: module.iconName,
        description: module.description ?? '',
        associatedSae: module.associatedSae ?? [],
        coefficients: FIXED_COMPETENCES.map((c) => ({
            competenceName: c,
            value: module.coefficients?.find((k) => k.competenceName === c)?.value ?? 0,
        })),
        manager: module.manager ?? {firstName: '', lastName: '', email: ''},
        instructors: module.instructors?.length
            ? module.instructors
            : [{firstName: '', lastName: '', email: ''}],
        isExtra: module.isExtra ?? false,
        sessionDurationMinutes: module.sessionDurationMinutes,
        colorLight: module.colorLight ?? '#C2410C',
        colorDark: module.colorDark ?? '#FB923C',
        universe: module.universe,
    }), [module]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: {errors, isSubmitting},
    } = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema) as Resolver<ModuleFormValues>,
        defaultValues: getDefaultValues(),
    });

    const {fields: instructorFields, append: appendInstructor, remove: removeInstructor} =
        useFieldArray({control, name: 'instructors'});

    useEffect(() => {
        if (open) reset(getDefaultValues());
    }, [open, reset, getDefaultValues]);

    const handleFormSubmit = async (data: ModuleFormValues) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
    const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[520px]',
                    'bg-[#f7ebd9] dark:bg-[#13110d]',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                )}
            >
                {/* Header */}
                <AdminSheetHeader
                    icon={Settings}
                    eyebrow="Module"
                    title="Modifier le module"
                    style={{ backgroundColor: moduleColor(module) }}
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
                                    <Label htmlFor="em-title" className={labelCn}>Titre *</Label>
                                    <Input
                                        id="em-title"
                                        className={inputCn}
                                        {...register('title')}
                                        aria-invalid={errors.title ? 'true' : 'false'}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                    )}
                                </div>
                                <div className="w-36">
                                    <Label htmlFor="em-path" className={labelCn}>Path</Label>
                                    <Input
                                        id="em-path"
                                        className={cn(inputCn, 'opacity-60 cursor-not-allowed')}
                                        {...register('path')}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className={labelCn}>Icône *</Label>
                                <Controller
                                    control={control}
                                    name="iconName"
                                    render={({ field }) => (
                                        <LucideIconPicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.iconName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="em-desc" className={labelCn}>Description</Label>
                                <Textarea id="em-desc" rows={3} className={inputCn} {...register('description')}/>
                            </div>
                            <Controller
                                control={control}
                                name="isExtra"
                                render={({field}) => (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <span className="text-sm text-brand-dark dark:text-bridge-100">Hors programme</span>
                                    </label>
                                )}
                            />
                            <div className="w-48">
                                <Label htmlFor="em-duration" className={labelCn}>Durée de séance (min)</Label>
                                <Input
                                    id="em-duration"
                                    type="number"
                                    min={1}
                                    step={1}
                                    className={inputCn}
                                    {...register('sessionDurationMinutes', {valueAsNumber: true})}
                                    aria-invalid={errors.sessionDurationMinutes ? 'true' : 'false'}
                                />
                                {errors.sessionDurationMinutes && (
                                    <p className="text-red-500 text-xs mt-1">{errors.sessionDurationMinutes.message}</p>
                                )}
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Univers thématique */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Univers thématique</Eyebrow>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={watch('universe') !== undefined}
                                    onCheckedChange={(checked) => setValue('universe', checked
                                        ? {name: '', description: '', scope: 'tp'}
                                        : undefined)}
                                />
                                <span className="text-sm text-brand-dark dark:text-bridge-100">Définir un univers</span>
                            </label>
                            {watch('universe') !== undefined && (
                                <>
                                    <div>
                                        <Label htmlFor="em-universe-name" className={labelCn}>Nom *</Label>
                                        <Input id="em-universe-name" className={inputCn} placeholder="Netflex"
                                            {...register('universe.name')}/>
                                        {errors.universe?.name && (
                                            <p className="text-red-500 text-xs mt-1">{errors.universe.name.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="em-universe-desc" className={labelCn}>Description (domaine + données types) *</Label>
                                        <Textarea id="em-universe-desc" rows={3} className={inputCn}
                                            placeholder="Catalogue de films : title, year, genre, rating…"
                                            {...register('universe.description')}/>
                                        {errors.universe?.description && (
                                            <p className="text-red-500 text-xs mt-1">{errors.universe.description.message}</p>
                                        )}
                                    </div>
                                    <Controller
                                        control={control}
                                        name="universe.scope"
                                        render={({field}) => (
                                            <div className="flex gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox checked={field.value === 'module'}
                                                        onCheckedChange={() => field.onChange('module')}/>
                                                    <span className="text-sm text-brand-dark dark:text-bridge-100">Fil rouge annuel</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox checked={field.value === 'tp'}
                                                        onCheckedChange={() => field.onChange('tp')}/>
                                                    <span className="text-sm text-brand-dark dark:text-bridge-100">Livrable par TP</span>
                                                </label>
                                            </div>
                                        )}
                                    />
                                </>
                            )}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Couleurs */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Couleurs du module</Eyebrow>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="em-color-light"
                                        type="color"
                                        className="h-9 w-12 rounded-md border border-bridge-500/45 bg-transparent cursor-pointer"
                                        {...register('colorLight')}
                                    />
                                    <Label htmlFor="em-color-light" className={labelCn}>Clair</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="em-color-dark"
                                        type="color"
                                        className="h-9 w-12 rounded-md border border-bridge-500/45 bg-transparent cursor-pointer"
                                        {...register('colorDark')}
                                    />
                                    <Label htmlFor="em-color-dark" className={labelCn}>Sombre</Label>
                                </div>
                            </div>
                            {(errors.colorLight || errors.colorDark) && (
                                <p className="text-red-500 text-xs">Couleur invalide (format #rrggbb).</p>
                            )}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Coefficients */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Coefficients des compétences</Eyebrow>
                            {FIXED_COMPETENCES.map((competence, index) => (
                                <div key={competence} className="flex items-center gap-3">
                                    <span className="flex-1 text-sm text-brand-dark dark:text-bridge-100 min-w-0">
                                        {competence}
                                    </span>
                                    <input
                                        type="hidden"
                                        {...register(`coefficients.${index}.competenceName`)}
                                        value={competence}
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={1}
                                        className={cn(inputCn, 'w-20 text-center')}
                                        {...register(`coefficients.${index}.value`, {valueAsNumber: true})}
                                    />
                                </div>
                            ))}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Responsable */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Responsable</Eyebrow>
                            <div className="grid grid-cols-3 gap-2">
                                <Input
                                    placeholder="Prénom"
                                    className={inputCn}
                                    {...register('manager.firstName')}
                                />
                                <Input
                                    placeholder="Nom"
                                    className={inputCn}
                                    {...register('manager.lastName')}
                                />
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    className={inputCn}
                                    {...register('manager.email')}
                                />
                            </div>
                            {errors.manager?.email && (
                                <p className="text-red-500 text-xs">{errors.manager.email.message}</p>
                            )}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Intervenants */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Intervenants</Eyebrow>
                            {instructorFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                    <Input
                                        placeholder="Prénom"
                                        className={inputCn}
                                        {...register(`instructors.${index}.firstName`)}
                                    />
                                    <Input
                                        placeholder="Nom"
                                        className={inputCn}
                                        {...register(`instructors.${index}.lastName`)}
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        className={inputCn}
                                        {...register(`instructors.${index}.email`)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-bridge-500 hover:text-red-500"
                                        onClick={() => removeInstructor(index)}
                                        aria-label="Supprimer l'intervenant"
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="self-start text-bridge-600 dark:text-bridge-300 hover:text-bridge-800"
                                onClick={() => appendInstructor({firstName: '', lastName: '', email: ''})}
                            >
                                + Ajouter un intervenant
                            </Button>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* SAÉ */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>SAÉ associées</Eyebrow>
                            <select
                                multiple
                                className="border border-bridge-500/45 rounded-md p-2 w-full bg-bridge-100/60 dark:bg-bridge-800/60"
                                {...register('associatedSae')}
                            >
                                {FIXED_SAES.map((sae, index) => (
                                    <option key={index} value={sae}>{sae}</option>
                                ))}
                            </select>
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
                            disabled={isSubmitting}
                            className="text-white dark:text-brand-dark font-semibold hover:opacity-90"
                            style={{ backgroundColor: moduleColor(module) }}
                        >
                            {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
