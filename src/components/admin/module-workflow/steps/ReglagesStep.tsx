"use client";

import {useForm, type Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import type Module from "@/types/Module";
import {
    moduleFormSchema,
    type ModuleFormValues,
} from "@/lib/schemas/module.schema";
import {moduleToFormValues} from "@/lib/pedagogy/moduleFormValues";
import {readErrorMessage} from "@/lib/pedagogy/apiErrors";
import ModuleFormFields from "@/components/admin/ModuleFormFields";

interface ReglagesStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

export default function ReglagesStep({module, onSaved}: ReglagesStepProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: {errors, isSubmitting},
    } = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema) as Resolver<ModuleFormValues>,
        defaultValues: moduleToFormValues(module),
    });

    const onSubmit = async (data: ModuleFormValues) => {
        const res = await fetch(`/api/admin/modules/${module._id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            toast.error(await readErrorMessage(res, "Erreur lors de l'enregistrement des réglages."));
            return;
        }

        toast.success("Réglages enregistrés.");
        onSaved(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <ModuleFormFields
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                pathReadOnly
            />
            <Button type="submit" disabled={isSubmitting} className="min-h-11 self-start px-6">
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
        </form>
    );
}
