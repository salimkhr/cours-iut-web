"use client";

import {useForm, type Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import type Module from "@/types/Module";
import {
    FIXED_COMPETENCES,
    moduleFormSchema,
    type ModuleFormValues,
} from "@/lib/schemas/module.schema";
import ModuleFormFields from "@/components/admin/ModuleFormFields";

interface ReglagesStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

/** Reconstruit un ModuleFormValues complet à partir du module courant : le PUT de
 *  /api/admin/modules/[moduleId] remplace le document entier (moduleFormSchema n'a pas de
 *  variante partielle). Même fonction que CadrageStep/NotionsStep/ProjetStep — ces étapes-là ne
 *  patchent qu'un sous-ensemble avant de resoumettre ; celle-ci soumet directement ces valeurs
 *  via ModuleFormFields, y compris les champs qu'il ne rend plus (universe,
 *  sessionDurationMinutes, projectSpec, exampleDomain, plannedNotions) pour ne pas les écraser. */
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

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
    const json = await res.json().catch(() => ({})) as {error?: unknown};
    return typeof json.error === "string" ? json.error : fallback;
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
