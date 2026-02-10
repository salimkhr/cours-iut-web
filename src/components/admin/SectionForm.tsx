'use client';

import {useCallback, useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Module from "@/types/Module";
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from "@/components/ui/textarea";
import {isString} from "next/dist/build/webpack/plugins/jsconfig-paths-plugin";

// Type pour une section
export type Section = {
    title: string;
    path: string;
    description?: string;
    tags: string[] | string;
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    contents: string[];
};

interface SectionFormProps {
    modData: Module;
    section?: Section; // Section à éditer (optionnel)
    mode: 'add' | 'edit';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (section: Section) => void;
    trigger?: React.ReactNode; // Trigger personnalisé (optionnel)
}

export default function SectionForm({
                                        modData,
                                        section,
                                        mode,
                                        open,
                                        onOpenChange,
                                        onSubmit,
                                        trigger
                                    }: SectionFormProps) {
    const isEditMode = mode === 'edit' && section !== undefined;

    // Préparer les valeurs par défaut basées sur le mode
    const getDefaultValues = useCallback((): Partial<Section> => {
        if (isEditMode) {
            return {
                title: section.title,
                path: section.path,
                description: section.description || '',
                tags: isString(section.tags) ? section?.tags : section?.tags.join(','),
                totalDuration: section.totalDuration,
                hasCorrection: section.hasCorrection,
                isAvailable: section.isAvailable,
                correctionIsAvailable: section.correctionIsAvailable,
                contents: section.contents,
                order: section.order,
            };
        }

        return {
            hasCorrection: true,
            isAvailable: true,
            correctionIsAvailable: true,
            contents: ['cours', 'TP'],
            order: (modData.sections?.length ?? 0) + 1,
            totalDuration: 1,
        };
    }, [isEditMode, modData.sections?.length, section?.contents, section?.correctionIsAvailable, section?.description, section?.hasCorrection, section?.isAvailable, section?.order, section?.path, section?.tags, section?.title, section?.totalDuration]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: {errors},
    } = useForm<Section>({
        defaultValues: getDefaultValues(),
    });

    // Reset form when section changes or dialog opens/closes
    useEffect(() => {
        if (open) {
            reset(getDefaultValues());
        }
    }, [open, section, reset, getDefaultValues]);

    // Met à jour automatiquement "path" à partir de "title" (seulement en mode ajout)
    const title = watch('title');
    useEffect(() => {
        if (!isEditMode && title) {
            setValue('path', `${modData.sections.length + 1}-${title.toLowerCase().replace(/\s+/g, '-')}`);
        }
    }, [title, setValue, modData.sections.length, isEditMode]);

    const availableContents = ['cours', 'TP', 'slide', 'projet', 'examen'];

    const handleFormSubmit = (data: Section) => {
        // Filtrer pour ne garder que les contenus valides
        const cleanedContents = (data.contents || []).filter(content =>
            availableContents.includes(content)
        );

        onSubmit({
            ...data,
            contents: cleanedContents,
            tags: isString(data.tags) ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : data.tags,
        });

        if (!isEditMode) {
            reset();
        }
        onOpenChange(false);
    };

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

    const dialogTitle = isEditMode ? 'Modifier le cours' : 'Ajouter un nouveau cours';
    const submitButtonText = isEditMode ? 'Modifier' : 'Ajouter';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && trigger}

            <DialogContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="w-full">
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
                        <div className="w-full">
                            <Label htmlFor="path">Path *</Label>
                            <Input
                                id="path"
                                {...register('path', {required: 'Le path est obligatoire'})}
                                aria-invalid={errors.path ? 'true' : 'false'}
                                readOnly={isEditMode} // Path non modifiable en édition
                                className={isEditMode ? 'bg-gray-100' : ''}
                            />
                            {errors.path && (
                                <p className="text-red-500 text-sm">{errors.path.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Contenu</Label>
                        <div className="grid grid-cols-5 gap-2 mt-2">
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
                        <span className="text-sm text-gray-500">
                            Ajouter les tags en les séparant par une virgule
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="totalDuration">Nombre de séances *</Label>
                        <Input
                            id="totalDuration"
                            type="number"
                            min={1}
                            {...register('totalDuration', {
                                required: 'Le nombre de séances est obligatoire',
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
                            min={1}
                            {...register('order', {
                                required: 'La position est obligatoire',
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
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" variant="outline">
                            {submitButtonText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}