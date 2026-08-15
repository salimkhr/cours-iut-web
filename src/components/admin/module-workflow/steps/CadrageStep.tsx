"use client";

import {useForm, type Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import type Module from "@/types/Module";
import {moduleFormSchema, type ModuleFormValues} from "@/lib/schemas/module.schema";
import {moduleToFormValues} from "@/lib/pedagogy/moduleFormValues";
import {readErrorMessage} from "@/lib/pedagogy/apiErrors";
import ModuleFormFields from "@/components/admin/ModuleFormFields";
import Eyebrow from "@/components/admin/ui/Eyebrow";

interface CadrageStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

export default function CadrageStep({module, onSaved}: CadrageStepProps) {
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
            toast.error(await readErrorMessage(res, "Erreur lors de l'enregistrement du cadrage."));
            return;
        }

        toast.success("Cadrage enregistré.");
        onSaved(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <section className="flex flex-col gap-3">
                <Eyebrow>Séances</Eyebrow>
                <div className="w-56">
                    <Label htmlFor="cadrage-duration" className={labelCn}>Durée de séance (min) *</Label>
                    <Input
                        id="cadrage-duration"
                        type="number"
                        min={1}
                        step={1}
                        className={inputCn}
                        {...register("sessionDurationMinutes", {valueAsNumber: true})}
                        aria-invalid={errors.sessionDurationMinutes ? "true" : "false"}
                    />
                    {errors.sessionDurationMinutes && (
                        <p className="text-red-500 text-xs mt-1">{errors.sessionDurationMinutes.message}</p>
                    )}
                </div>
            </section>

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

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
