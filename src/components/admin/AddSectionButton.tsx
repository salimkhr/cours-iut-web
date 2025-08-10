'use client';

import {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Module from "@/types/module";
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from "@/components/ui/textarea";

interface AddSectionButtonProps {
    modData: Module;
    onAdd: (section: {
        title: string;
        path: string;
        iconName: string;
        description?: string;
        tags: string[];
        totalDuration: number;
        hasCorrection: boolean;
        isAvailable: boolean;
        correctionIsAvailable: boolean;
        order: number;
        contents: string[];
    }) => void;
}

type FormData = {
    title: string;
    path: string;
    iconName: string;
    description?: string;
    tags: string;
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable: boolean;
    correctionIsAvailable: boolean;
    contents: string[];
    order: number;
};

export default function AddSectionButton({
                                             onAdd,
                                             modData,
                                         }: AddSectionButtonProps) {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: {errors},
    } = useForm<FormData>({
        defaultValues: {
            hasCorrection: true,
            isAvailable: true,
            correctionIsAvailable: true,
            contents: [],
        },
    });

    // Met à jour automatiquement "path" à partir de "title"
    const title = watch('title');
    useEffect(() => {
        if (title) {
            setValue('path', `${modData.sections.length + 1}-${title.toLowerCase().replace(/\s+/g, '-')}`);
        }
    }, [title, setValue, modData.sections.length]);

    const onSubmit = (data: FormData) => {
        onAdd({
            ...data,
            tags: data.tags.split(',').map(tag => tag.trim()),
        });

        reset();
        setOpen(false);
    };

    const availableContents = ['cours', 'TP', 'projet', 'examen'];

    const contents = watch('contents') || [];

    // Fonction pour toggle les contenus dans le tableau
    const toggleContent = (item: string) => {
        if (contents.includes(item)) {
            setValue(
                'contents',
                contents.filter((c) => c !== item),
                {shouldDirty: true, shouldValidate: true}
            );
        } else {
            setValue(
                'contents',
                [...contents, item],
                {shouldDirty: true, shouldValidate: true}
            );
        }
    };

    console.log(modData.sections.length);

    return (
        <>
            <div className="flex justify-end mb-2">
                <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    className={`border-${modData.path} text-${modData.path}`}
                >
                    Ajouter un nouveau cours
                </Button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouveau cours</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <Label htmlFor="title">Titre *</Label>
                                <Input
                                    id="title"
                                    {...register('title', {required: 'Le titre est obligatoire'})}
                                    aria-invalid={errors.title ? 'true' : 'false'}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="path">Path *</Label>
                                <Input
                                    id="path"
                                    {...register('path', {required: 'Le path est obligatoire'})}
                                    aria-invalid={errors.path ? 'true' : 'false'}
                                />
                                {errors.path && (
                                    <p className="text-red-500 text-sm">{errors.path.message}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label>Contenu</Label>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {availableContents.map((content) => (
                                    <label
                                        key={content}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={contents.includes(content)}
                                            onCheckedChange={() => toggleContent(content)}
                                            aria-label={content}
                                        />
                                        {/* première lettre en majuscule */}
                                        <span>
                      {content.charAt(0).toUpperCase() + content.slice(1)}
                    </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} />
                        </div>
                        <div>
                            <Label htmlFor="tags">Tags</Label>
                            <Textarea id="tags" {...register('tags')} />
                            <span
                                className="text-sm text-gray-500">Ajouter les tags en les séparant par une &apos;,&apos;</span>
                        </div>
                        <div>
                            <Label htmlFor="totalDuration">Nombre de séance *</Label>
                            <Input
                                id="totalDuration"
                                type="number"
                                min={1}
                                defaultValue={1}
                                {...register('totalDuration', {
                                    required: 'Le nombre de séance est obligatoire',
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.totalDuration && (
                                <p className="text-red-500 text-sm">
                                    {errors.totalDuration.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="order">Position</Label>
                            <Input
                                id="order"
                                type="number"
                                defaultValue={(modData.sections.length ?? 0) + 1}
                                min={1}
                                {...register('order', {
                                    required: 'La Position est obligatoire',
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.order && (
                                <p className="text-red-500 text-sm">{errors.order.message}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <Controller
                                        name="isAvailable"
                                        control={control}
                                        defaultValue={true}
                                        render={({field}) => (
                                            <Checkbox
                                                id="isAvailable"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <span>Disponible</span>
                                </label>
                            </div>
                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <Controller
                                        name="hasCorrection"
                                        control={control}
                                        defaultValue={true}
                                        render={({field}) => (
                                            <Checkbox
                                                id="hasCorrection"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <span>Correction</span>
                                </label>
                            </div>
                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <Controller
                                        name="correctionIsAvailable"
                                        control={control}
                                        defaultValue={true}
                                        render={({field}) => (
                                            <Checkbox
                                                id="correctionIsAvailable"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <span>Correction Disponible</span>
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" variant="outline">
                                Ajouter
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
