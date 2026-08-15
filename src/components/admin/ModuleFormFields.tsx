'use client';

import {Controller, useFieldArray} from 'react-hook-form';
import type {Control, FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue} from 'react-hook-form';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {FIXED_COMPETENCES, FIXED_SAES, type ModuleFormValues} from '@/lib/schemas/module.schema';
import Eyebrow from '@/components/admin/ui/Eyebrow';
import {LucideIconPicker} from '@/components/ui/LucideIconPicker';

interface ModuleFormFieldsProps {
    register: UseFormRegister<ModuleFormValues>;
    control: Control<ModuleFormValues>;
    errors: FieldErrors<ModuleFormValues>;
    watch: UseFormWatch<ModuleFormValues>;
    setValue: UseFormSetValue<ModuleFormValues>;
    pathReadOnly?: boolean;
}

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

export default function ModuleFormFields({
    register,
    control,
    errors,
    pathReadOnly = false,
}: ModuleFormFieldsProps) {
    const {fields: instructorFields, append: appendInstructor, remove: removeInstructor} =
        useFieldArray({control, name: 'instructors'});

    return (
        <div className="flex flex-col gap-5">

            {/* Identification */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Identification</Eyebrow>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Label htmlFor="mf-title" className={labelCn}>Titre *</Label>
                        <Input
                            id="mf-title"
                            className={inputCn}
                            {...register('title')}
                            aria-invalid={errors.title ? 'true' : 'false'}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="w-36">
                        <Label htmlFor="mf-path" className={labelCn}>Path *</Label>
                        <Input
                            id="mf-path"
                            className={cn(inputCn, pathReadOnly && 'opacity-60 cursor-not-allowed')}
                            {...register('path')}
                            readOnly={pathReadOnly}
                            aria-invalid={errors.path ? 'true' : 'false'}
                        />
                        {errors.path && <p className="text-red-500 text-xs mt-1">{errors.path.message}</p>}
                    </div>
                </div>
                <div>
                    <Label className={labelCn}>Icône *</Label>
                    <Controller
                        control={control}
                        name="iconName"
                        render={({field}) => (
                            <LucideIconPicker value={field.value} onChange={field.onChange}/>
                        )}
                    />
                    {errors.iconName && <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>}
                </div>
                <div>
                    <Label htmlFor="mf-desc" className={labelCn}>Description</Label>
                    <Textarea id="mf-desc" rows={3} className={inputCn} {...register('description')}/>
                </div>
                <Controller
                    control={control}
                    name="isExtra"
                    render={({field}) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                            <span className="text-sm text-brand-dark dark:text-bridge-100">Hors programme</span>
                        </label>
                    )}
                />
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Icône du projet commun — le reste de l'univers thématique (nom, description) a
                migré vers projectSpec/exampleDomain, édités dans l'étape « Projet » du workflow
                (cf. ProjetStep.tsx). Seule cette icône n'a pas de foyer ailleurs. */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Icône du projet commun</Eyebrow>
                <div>
                    <Label className={labelCn}>Icône</Label>
                    <Controller
                        control={control}
                        name="projectIcon"
                        render={({field}) => (
                            <LucideIconPicker
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                placeholder="Aucune icône"
                            />
                        )}
                    />
                </div>
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Couleurs */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Couleurs du module</Eyebrow>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <input
                            id="mf-color-light"
                            type="color"
                            className="h-9 w-12 rounded-md border border-bridge-500/45 bg-transparent cursor-pointer"
                            {...register('colorLight')}
                        />
                        <Label htmlFor="mf-color-light" className={labelCn}>Clair</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="mf-color-dark"
                            type="color"
                            className="h-9 w-12 rounded-md border border-bridge-500/45 bg-transparent cursor-pointer"
                            {...register('colorDark')}
                        />
                        <Label htmlFor="mf-color-dark" className={labelCn}>Sombre</Label>
                    </div>
                </div>
                {(errors.colorLight || errors.colorDark) && (
                    <p className="text-red-500 text-xs">Couleur invalide (format #rrggbb).</p>
                )}
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

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

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            {/* Responsable */}
            <section className="flex flex-col gap-3">
                <Eyebrow>Responsable</Eyebrow>
                <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Prénom" className={inputCn} {...register('manager.firstName')}/>
                    <Input placeholder="Nom" className={inputCn} {...register('manager.lastName')}/>
                    <Input placeholder="Email" type="email" className={inputCn} {...register('manager.email')}/>
                </div>
                {errors.manager?.email && (
                    <p className="text-red-500 text-xs">{errors.manager.email.message}</p>
                )}
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

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
                        >×</Button>
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

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

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
    );
}
