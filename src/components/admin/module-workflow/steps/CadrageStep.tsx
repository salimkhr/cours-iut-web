"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import type Module from "@/types/Module";
import {type ModuleFormValues} from "@/lib/schemas/module.schema";
import {moduleToFormValues} from "@/lib/pedagogy/moduleFormValues";
import {readErrorMessage} from "@/lib/pedagogy/apiErrors";

interface CadrageStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

const cadrageSchema = z.object({
    sessionDurationMinutes: z.number().int().min(1, "Renseignez une durée de séance (minimum 1 minute)."),
});

type CadrageValues = z.infer<typeof cadrageSchema>;

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

export default function CadrageStep({module, onSaved}: CadrageStepProps) {
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<CadrageValues>({
        resolver: zodResolver(cadrageSchema),
        defaultValues: {sessionDurationMinutes: module.sessionDurationMinutes ?? undefined},
    });

    const onSubmit = async (data: CadrageValues) => {
        const payload: ModuleFormValues = {
            ...moduleToFormValues(module),
            sessionDurationMinutes: data.sessionDurationMinutes,
        };

        const res = await fetch(`/api/admin/modules/${module._id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            toast.error(await readErrorMessage(res, "Erreur lors de l'enregistrement du cadrage."));
            return;
        }

        toast.success("Cadrage enregistré.");
        onSaved({sessionDurationMinutes: data.sessionDurationMinutes});
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            <Button type="submit" disabled={isSubmitting} className="min-h-11 self-start">
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
        </form>
    );
}
