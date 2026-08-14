"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import type Module from "@/types/Module";
import {FIXED_COMPETENCES, type ModuleFormValues} from "@/lib/schemas/module.schema";

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

/** Reconstruit un ModuleFormValues complet à partir du module courant : le PUT de
 *  /api/admin/modules/[moduleId] remplace le document entier (moduleFormSchema n'a pas de
 *  variante partielle), donc chaque étape doit renvoyer tous les champs existants et ne
 *  patcher que ceux qu'elle édite — sous peine d'écraser coefficients/instructors/couleurs. */
function moduleToFormValues(module: Module): ModuleFormValues {
    return {
        title: module.title,
        path: module.path,
        iconName: module.iconName,
        description: module.description ?? "",
        associatedSae: module.associatedSae ?? [],
        coefficients: FIXED_COMPETENCES.map((c) => ({
            competenceName: c,
            value: module.coefficients?.find((k) => k.competenceName === c)?.value ?? 0,
        })),
        manager: module.manager ?? {firstName: "", lastName: "", email: ""},
        instructors: module.instructors?.length
            ? module.instructors
            : [{firstName: "", lastName: "", email: ""}],
        isExtra: module.isExtra ?? false,
        sessionDurationMinutes: module.sessionDurationMinutes,
        colorLight: module.colorLight ?? "#C2410C",
        colorDark: module.colorDark ?? "#FB923C",
        universe: module.universe,
        projectIcon: module.projectIcon ?? "",
        plannedNotions: module.plannedNotions ?? [],
        projectSpec: module.projectSpec,
        exampleDomain: module.exampleDomain,
    };
}

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
            const json = await res.json().catch(() => ({})) as {error?: unknown};
            toast.error(typeof json.error === "string" ? json.error : "Erreur lors de l'enregistrement du cadrage.");
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
