'use client';

import {useEffect, useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';
import {Sheet, SheetContent, SheetTitle, SheetDescription} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Section from "@/types/Section";
import Coefficient from "@/types/Coefficient";
import Instructor from "@/types/Instructor";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {FIXED_COMPETENCES, FIXED_SAES} from "@/lib/schemas/module.schema";

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
            manager: {firstName: "", lastName: "", email: ""}
        }
    });

    const title = useWatch({control, name: "title"});
    const instructors = useWatch({control, name: "instructors"});

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
                        className="bg-brand-primary text-white hover:bg-brand-accent-dark"
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
                        '[&>button]:text-white/80 [&>button:hover]:text-white',
                    )}
                >
                    {/* Header */}
                    <div className="relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0 bg-brand-primary">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">
                                Module
                            </p>
                            <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                                Ajouter un nouveau module
                            </SheetTitle>
                        </div>
                        <SheetDescription className="sr-only">
                            Formulaire de création d&apos;un nouveau module
                        </SheetDescription>
                    </div>

                    {/* Body + Footer */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                            {/* Titre + Path */}
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
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

                            {/* Icon */}
                            <div>
                                <Label htmlFor="am-icon" className={labelCn}>Icon Name *</Label>
                                <Input
                                    id="am-icon"
                                    className={inputCn}
                                    {...register("iconName", {required: "L'icône est obligatoire"})}
                                    aria-invalid={errors.iconName ? "true" : "false"}
                                />
                                {errors.iconName && <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="am-description" className={labelCn}>Description</Label>
                                <Textarea id="am-description" className={inputCn} {...register("description")}/>
                            </div>

                            {/* Coefficients */}
                            <div>
                                <Label className={labelCn}>Coefficients</Label>
                                <div className="space-y-2 mt-1">
                                    {FIXED_COMPETENCES.map((competence, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <span className="flex-1 text-sm text-brand-dark dark:text-bridge-100">{competence}</span>
                                            <Input
                                                type="number"
                                                step="1"
                                                className={cn(inputCn, "w-20 text-center")}
                                                {...register(`coefficients.${index}.value` as const, {valueAsNumber: true})}
                                            />
                                            <input
                                                type="hidden"
                                                {...register(`coefficients.${index}.competenceName` as const)}
                                                value={competence}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Responsable */}
                            <div>
                                <Label className={labelCn}>Responsable du module</Label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    <Input placeholder="Prénom" className={inputCn} {...register("manager.firstName")}/>
                                    <Input placeholder="Nom" className={inputCn} {...register("manager.lastName")}/>
                                    <Input placeholder="Email" type="email" className={inputCn} {...register("manager.email")}/>
                                </div>
                            </div>

                            {/* Enseignants */}
                            <div>
                                <Label className={labelCn}>Enseignants</Label>
                                <div className="space-y-2 mt-1">
                                    {instructors.map((_, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-2">
                                            <Input placeholder="Prénom" className={inputCn} {...register(`instructors.${index}.firstName` as const)}/>
                                            <Input placeholder="Nom" className={inputCn} {...register(`instructors.${index}.lastName` as const)}/>
                                            <Input placeholder="Email" type="email" className={inputCn} {...register(`instructors.${index}.email` as const)}/>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SAÉ */}
                            <div>
                                <Label className={labelCn}>SAÉ associées</Label>
                                <select
                                    multiple
                                    className="mt-1 border border-bridge-500/45 rounded-md p-2 w-full bg-bridge-100/60 dark:bg-bridge-800/60"
                                    {...register("associatedSae")}
                                >
                                    {FIXED_SAES.map((sae, index) => (
                                        <option key={index} value={sae}>{sae}</option>
                                    ))}
                                </select>
                            </div>
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
                                className="bg-brand-primary text-white hover:bg-brand-accent-dark"
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
