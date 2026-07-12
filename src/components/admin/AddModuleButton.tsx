'use client';

import {useEffect, useState} from 'react';
import {useForm, useWatch, type Resolver} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Package} from 'lucide-react';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {
    moduleFormSchema,
    type ModuleFormValues,
    FIXED_COMPETENCES,
} from '@/lib/schemas/module.schema';
import ModuleFormFields from '@/components/admin/ModuleFormFields';

interface AddModuleButtonProps {
    onAdd: (data: ModuleFormValues) => Promise<void> | void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultPath?: string;
}

export default function AddModuleButton({onAdd, open: controlledOpen, onOpenChange, defaultPath}: AddModuleButtonProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

    const {register, handleSubmit, control, setValue, reset, watch, formState: {errors, isSubmitting}} =
        useForm<ModuleFormValues>({
            resolver: zodResolver(moduleFormSchema) as Resolver<ModuleFormValues>,
            defaultValues: {
                title: '',
                path: defaultPath ?? '',
                iconName: '',
                description: '',
                coefficients: FIXED_COMPETENCES.map(c => ({competenceName: c, value: 0})),
                instructors: [{firstName: '', lastName: '', email: ''}],
                manager: {firstName: '', lastName: '', email: ''},
                isExtra: false,
                colorLight: '#C2410C',
                colorDark: '#FB923C',
            },
        });

    const title = useWatch({control, name: 'title'});

    useEffect(() => {
        if (!defaultPath && title) {
            setValue('path', title.toLowerCase().replace(/\s+/g, '-'));
        }
    }, [title, setValue, defaultPath]);

    const onSubmit = async (data: ModuleFormValues) => {
        await onAdd(data);
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
                    <AdminSheetHeader
                        icon={Package}
                        eyebrow="Module"
                        title="Ajouter un nouveau module"
                        srDescription="Formulaire de création d'un nouveau module"
                        className="bg-brand-primary"
                    />

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <ModuleFormFields
                            register={register}
                            control={control}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                        />

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
                                disabled={isSubmitting}
                                className="bg-brand-primary text-white dark:text-brand-dark hover:bg-brand-accent-dark dark:hover:bg-brand-primary/80"
                            >
                                {isSubmitting ? 'Création…' : 'Ajouter'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
