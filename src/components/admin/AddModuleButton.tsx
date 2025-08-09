'use client';

import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Section} from "@/types/Section";

interface AddModuleButtonProps {
    onAdd: (module: {
        title: string;
        path: string;
        iconName: string;
        description?: string;
        sections: Section[];
    }) => void;
}

type FormData = {
    title: string;
    path: string;
    iconName: string;
    description?: string;
};

export default function AddModuleButton({onAdd}: AddModuleButtonProps) {
    const [open, setOpen] = useState(false);

    const {register, handleSubmit, watch, setValue, reset, formState: {errors}} = useForm<FormData>();

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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau module</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        <div>
                            <Label htmlFor="title">Titre *</Label>
                            <Input
                                id="title"
                                {...register("title", {required: "Le titre est obligatoire"})}
                                aria-invalid={errors.title ? "true" : "false"}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="path">Path *</Label>
                            <Input
                                id="path"
                                {...register("path", {required: "Le path est obligatoire"})}
                                aria-invalid={errors.path ? "true" : "false"}
                            />
                            {errors.path && <p className="text-red-500 text-sm">{errors.path.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="iconName">Icon Name *</Label>
                            <Input
                                id="iconName"
                                {...register("iconName", {required: "L'icône est obligatoire"})}
                                aria-invalid={errors.iconName ? "true" : "false"}
                            />
                            {errors.iconName && <p className="text-red-500 text-sm">{errors.iconName.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                {...register("description")}
                            />
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
