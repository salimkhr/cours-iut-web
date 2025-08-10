'use client';

import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Section from "@/types/Section";
import Coefficient from "@/types/Coefficient";
import Instructor from "@/types/Instructor";

interface AddModuleButtonProps {
    onAdd: (module: {
        title: string;
        path: string;
        iconName: string;
        description?: string;
        sections: Section[];
        associatedSae: string[];
        coefficients: Coefficient[];
        manager?: Instructor;
        instructors?: Instructor[];
    }) => void;
}

type FormData = {
    title: string;
    path: string;
    iconName: string;
    description?: string;
    coefficients: Coefficient[];
    manager: Instructor;
    instructors: Instructor[];
};

const FIXED_COMPETENCES = [
    "1-Réaliser un développement",
    "2-Optimiser des applications",
    "3-Administrer des systèmes informatiques communicants complexes",
    "4-Gérer des données de l'information",
    "5-Conduire un projet",
    "6-Travailler en équipe"
];

export default function AddModuleButton({onAdd}: AddModuleButtonProps) {
    const [open, setOpen] = useState(false);

    const {register, handleSubmit, watch, setValue, reset, formState: {errors}} = useForm<FormData>({
        defaultValues: {
            coefficients: FIXED_COMPETENCES.map(c => ({competenceName: c, value: 0})),
            instructors: [{firstName: "", lastName: "", email: ""}],
            manager: {firstName: "", lastName: "", email: ""}
        }
    });

    // Met à jour automatiquement "path" à partir de "title"
    const title = watch("title");
    useEffect(() => {
        if (title) {
            setValue("path", title.toLowerCase().replace(/\s+/g, '-'));
        }
    }, [title, setValue]);

    const onSubmit = (data: FormData) => {
        onAdd({
            ...data,
            sections: [],
            associatedSae: [],
        });

        reset();
        setOpen(false);
    };

    return (
        <>
            <div className="flex justify-end">
                <Button onClick={() => setOpen(true)} variant="outline">Ajouter un module</Button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau module</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

                        {/* Titre */}
                        <div>
                            <Label htmlFor="title">Titre *</Label>
                            <Input
                                id="title"
                                {...register("title", {required: "Le titre est obligatoire"})}
                                aria-invalid={errors.title ? "true" : "false"}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>

                        {/* Path */}
                        <div>
                            <Label htmlFor="path">Path *</Label>
                            <Input
                                id="path"
                                {...register("path", {required: "Le path est obligatoire"})}
                                aria-invalid={errors.path ? "true" : "false"}
                            />
                            {errors.path && <p className="text-red-500 text-sm">{errors.path.message}</p>}
                        </div>

                        {/* Icon */}
                        <div>
                            <Label htmlFor="iconName">Icon Name *</Label>
                            <Input
                                id="iconName"
                                {...register("iconName", {required: "L'icône est obligatoire"})}
                                aria-invalid={errors.iconName ? "true" : "false"}
                            />
                            {errors.iconName && <p className="text-red-500 text-sm">{errors.iconName.message}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                {...register("description")}
                            />
                        </div>

                        {/* Coefficients */}
                        <div>
                            <Label>Coefficients</Label>
                            <div className="space-y-2">
                                {FIXED_COMPETENCES.map((competence, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <span className="flex-1">{competence}</span>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            className="w-24"
                                            {...register(`coefficients.${index}.value` as const, {valueAsNumber: true})}
                                        />
                                        {/* Champ caché pour competenceName */}
                                        <input
                                            type="hidden" {...register(`coefficients.${index}.competenceName` as const)}
                                            value={competence}/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Manager */}
                        <div>
                            <Label>Responsable du module</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Input placeholder="Prénom" {...register("manager.firstName")} />
                                <Input placeholder="Nom" {...register("manager.lastName")} />
                                <Input placeholder="Email" type="email" {...register("manager.email")} />
                            </div>
                        </div>

                        {/* Instructors */}
                        <div>
                            <Label>Enseignants</Label>
                            {watch("instructors").map((_, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                                    <Input
                                        placeholder="Prénom" {...register(`instructors.${index}.firstName` as const)} />
                                    <Input placeholder="Nom" {...register(`instructors.${index}.lastName` as const)} />
                                    <Input placeholder="Email"
                                           type="email" {...register(`instructors.${index}.email` as const)} />
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="submit" variant="outline">Ajouter</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
