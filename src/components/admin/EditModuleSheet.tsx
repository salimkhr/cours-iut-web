'use client';

import {useEffect} from 'react';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Settings} from 'lucide-react';
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import {
    moduleFormSchema,
    type ModuleFormValues,
    FIXED_COMPETENCES,
    FIXED_SAES,
} from '@/lib/schemas/module.schema';

interface EditModuleSheetProps {
    module: Module;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ModuleFormValues) => Promise<void>;
}

function Eyebrow({children}: {children: React.ReactNode}) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
            {children}
        </p>
    );
}

export default function EditModuleSheet({
    module,
    open,
    onOpenChange,
    onSubmit,
}: EditModuleSheetProps) {
    const defaultValues: ModuleFormValues = {
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
    };

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema),
        defaultValues,
    });

    const {fields: instructorFields, append: appendInstructor, remove: removeInstructor} =
        useFieldArray({control, name: 'instructors'});

    useEffect(() => {
        if (open) reset(defaultValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
                    '[&>button]:text-white/80 [&>button:hover]:text-white',
                )}
            >
                {/* Header */}
                <div
                    className={cn(
                        'relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0',
                        `bg-${module.path}`,
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                        <Settings className="w-5 h-5 text-white" aria-hidden="true"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">
                            Module
                        </p>
                        <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                            Modifier le module
                        </SheetTitle>
                    </div>
                </div>

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
                                    <Input id="em-title" className={inputCn} {...register('title')}/>
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                    )}
                                </div>
                                <div className="w-36">
                                    <Label htmlFor="em-icon" className={labelCn}>Icône *</Label>
                                    <Input id="em-icon" className={inputCn} {...register('iconName')}/>
                                    {errors.iconName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="em-desc" className={labelCn}>Description</Label>
                                <Textarea id="em-desc" rows={3} className={inputCn} {...register('description')}/>
                            </div>
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
                                        {...register(`coefficients.${index}.value`)}
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
                                        aria-label="Supprimer l&apos;intervenant"
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
                            <div className="flex flex-col gap-2">
                                {FIXED_SAES.map((sae) => (
                                    <label key={sae} className="flex items-center gap-2 cursor-pointer">
                                        <Controller
                                            control={control}
                                            name="associatedSae"
                                            render={({field}) => (
                                                <Checkbox
                                                    checked={field.value?.includes(sae)}
                                                    onCheckedChange={(checked) => {
                                                        const next = checked
                                                            ? [...(field.value ?? []), sae]
                                                            : (field.value ?? []).filter((s) => s !== sae);
                                                        field.onChange(next);
                                                    }}
                                                />
                                            )}
                                        />
                                        <span className="text-sm text-brand-dark dark:text-bridge-100">{sae}</span>
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
                            disabled={isSubmitting}
                            className={cn('text-white font-semibold', `bg-${module.path} hover:opacity-90`)}
                        >
                            {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
