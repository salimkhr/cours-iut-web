'use client';

import {useCallback, useEffect} from 'react';
import {useForm, type Resolver} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Settings} from 'lucide-react';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import {moduleColor} from '@/lib/moduleColor';
import {
    moduleFormSchema,
    type ModuleFormValues,
    FIXED_COMPETENCES,
} from '@/lib/schemas/module.schema';
import ModuleFormFields from '@/components/admin/ModuleFormFields';

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
        projectIcon: module.projectIcon ?? '',
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

    useEffect(() => {
        if (open) reset(getDefaultValues());
    }, [open, reset, getDefaultValues]);

    const handleFormSubmit = async (data: ModuleFormValues) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[520px]',
                    'bg-card',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                )}
            >
                <AdminSheetHeader
                    icon={Settings}
                    eyebrow="Module"
                    title="Modifier le module"
                    style={{ backgroundColor: moduleColor(module) }}
                />

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <ModuleFormFields
                        register={register}
                        control={control}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        pathReadOnly
                    />

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
