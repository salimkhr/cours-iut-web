'use client';

import {useEffect, useState} from 'react';
import {Controller, useFieldArray, useForm, useWatch} from 'react-hook-form';
import {Package} from 'lucide-react';
import {Sheet, SheetContent} from "@/components/ui/sheet";
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import Section from "@/types/Section";
import Coefficient from "@/types/Coefficient";
import Instructor from "@/types/Instructor";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {FIXED_COMPETENCES, FIXED_SAES} from "@/lib/schemas/module.schema";
import Eyebrow from '@/components/admin/ui/Eyebrow';

interface AddModuleButtonProps {
    onAdd: (module: {
        title: string;
        path: string;
        iconName: string;
        description?: string;
        associatedSae: string[];
        coefficients: Coefficient[];
        manager?: Instructor;
        instructors?: Instructor[];
        sections: Section[];
        isExtra?: boolean;
    }) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultPath?: string;
}

type FormData = {
    title: string;
    path: string;
    iconName: string;
    description?: string;
    associatedSae: string[];
    coefficients: Coefficient[];
    manager: Instructor;
    instructors: Instructor[];
    isExtra: boolean;
};

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

export default function AddModuleButton({onAdd, open: controlledOpen, onOpenChange, defaultPath}: AddModuleButtonProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

    const {register, handleSubmit, control, setValue, reset, formState: {errors}} = useForm<FormData>({
        defaultValues: {
            path: defaultPath ?? '',
            coefficients: FIXED_COMPETENCES.map(c => ({competenceName: c, value: 0})),
            instructors: [{firstName: "", lastName: "", email: ""}],
            manager: {firstName: "", lastName: "", email: ""},
            isExtra: false,
        }
    });

    const title = useWatch({control, name: "title"});
    const {fields: instructorFields, append: appendInstructor, remove: removeInstructor} =
        useFieldArray({control, name: 'instructors'});

    useEffect(() => {
        if (!defaultPath && title) {
            setValue("path", title.toLowerCase().replace(/\s+/g, '-'));
        }
    }, [title, setValue, defaultPath]);

    const onSubmit = (data: FormData) => {
        onAdd({
            ...data,
            sections: [],
        });
        reset();
        setOpen(false);
    };

    return (
        <>
            {!isControlled && (
                <div className="flex justify-end">
                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-brand-primary text-white dark:text-brand-dark hover:bg-brand-accent-dark dark:hover:bg-brand-primary/80"
                    >
                        Ajouter un module
                    </Button>
                </div>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
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
                        icon={Package}
                        eyebrow="Module"
                        title="Ajouter un nouveau module"
                        srDescription="Formulaire de création d'un nouveau module"
                        className="bg-brand-primary"
                    />

                    {/* Body + Footer */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                            {/* Identification */}
                            <section className="flex flex-col gap-3">
                                <Eyebrow>Identification</Eyebrow>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Label htmlFor="am-title" className={labelCn}>Titre *</Label>
                                        <Input
                                            id="am-title"
                                            className={inputCn}
                                            {...register("title", {required: "Le titre est obligatoire"})}
                                            aria-invalid={errors.title ? "true" : "false"}
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                                    </div>
                                    <div className="w-36">
                                        <Label htmlFor="am-path" className={labelCn}>Path *</Label>
                                        <Input
                                            id="am-path"
                                            className={inputCn}
                                            {...register("path", {required: "Le path est obligatoire"})}
                                            aria-invalid={errors.path ? "true" : "false"}
                                        />
                                        {errors.path && <p className="text-red-500 text-xs mt-1">{errors.path.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="am-icon" className={labelCn}>Icône *</Label>
                                    <Input
                                        id="am-icon"
                                        className={inputCn}
                                        {...register("iconName", {required: "L'icône est obligatoire"})}
                                        aria-invalid={errors.iconName ? "true" : "false"}
                                    />
                                    {errors.iconName && <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="am-description" className={labelCn}>Description</Label>
                                    <Textarea id="am-description" className={inputCn} {...register("description")}/>
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
                                            {...register(`coefficients.${index}.competenceName` as const)}
                                            value={competence}
                                        />
                                        <Input
                                            type="number"
                                            step="1"
                                            className={cn(inputCn, "w-20 text-center")}
                                            {...register(`coefficients.${index}.value` as const, {valueAsNumber: true})}
                                        />
                                    </div>
                                ))}
                            </section>

                            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                            {/* Responsable */}
                            <section className="flex flex-col gap-3">
                                <Eyebrow>Responsable</Eyebrow>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input placeholder="Prénom" className={inputCn} {...register("manager.firstName")}/>
                                    <Input placeholder="Nom" className={inputCn} {...register("manager.lastName")}/>
                                    <Input placeholder="Email" type="email" className={inputCn} {...register("manager.email")}/>
                                </div>
                            </section>

                            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                            {/* Intervenants */}
                            <section className="flex flex-col gap-3">
                                <Eyebrow>Intervenants</Eyebrow>
                                {instructorFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                        <Input placeholder="Prénom" className={inputCn} {...register(`instructors.${index}.firstName` as const)}/>
                                        <Input placeholder="Nom" className={inputCn} {...register(`instructors.${index}.lastName` as const)}/>
                                        <Input placeholder="Email" type="email" className={inputCn} {...register(`instructors.${index}.email` as const)}/>
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
                                    {...register("associatedSae")}
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
                                onClick={() => setOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-primary text-white dark:text-brand-dark hover:bg-brand-accent-dark dark:hover:bg-brand-primary/80"
                            >
                                Ajouter
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
