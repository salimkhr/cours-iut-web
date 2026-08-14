"use client";

import {useState} from "react";
import {useForm, type Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {X} from "lucide-react";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import type Module from "@/types/Module";
import {FIXED_COMPETENCES, type ModuleFormValues} from "@/lib/schemas/module.schema";

interface NotionsStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

const notionsSchema = z.object({
    plannedNotions: z.array(z.string().trim().min(1)).default([]),
});

type NotionsValues = z.infer<typeof notionsSchema>;

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

export default function NotionsStep({module, onSaved}: NotionsStepProps) {
    const [newNotion, setNewNotion] = useState("");

    const {
        handleSubmit,
        watch,
        setValue,
        formState: {isSubmitting},
    } = useForm<NotionsValues>({
        resolver: zodResolver(notionsSchema) as Resolver<NotionsValues>,
        defaultValues: {plannedNotions: module.plannedNotions ?? []},
    });

    const notions = watch("plannedNotions");

    const addNotion = () => {
        const trimmed = newNotion.trim();
        if (!trimmed || notions.includes(trimmed)) return;
        setValue("plannedNotions", [...notions, trimmed]);
        setNewNotion("");
    };

    const removeNotion = (notion: string) => {
        setValue("plannedNotions", notions.filter((n) => n !== notion));
    };

    const onSubmit = async (data: NotionsValues) => {
        const payload: ModuleFormValues = {
            ...moduleToFormValues(module),
            plannedNotions: data.plannedNotions,
        };

        const res = await fetch(`/api/admin/modules/${module._id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => ({})) as {error?: unknown};
            toast.error(typeof json.error === "string" ? json.error : "Erreur lors de l'enregistrement des notions.");
            return;
        }

        toast.success("Notions enregistrées.");
        onSaved({plannedNotions: data.plannedNotions});
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="notions-new" className={labelCn}>Ajouter une notion</Label>
                <div className="flex gap-2">
                    <Input
                        id="notions-new"
                        className={inputCn}
                        value={newNotion}
                        onChange={(e) => setNewNotion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addNotion();
                            }
                        }}
                    />
                    <Button type="button" onClick={addNotion} className="min-h-11 shrink-0">
                        Ajouter
                    </Button>
                </div>
            </div>

            {notions.length > 0 && (
                <ul className="flex flex-wrap items-center gap-2">
                    {notions.map((notion) => (
                        <li key={notion} className="inline-flex items-center gap-1">
                            <Badge variant="secondary" className="py-1">{notion}</Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-11 text-bridge-600 hover:text-red-500 dark:text-bridge-300"
                                aria-label={`Retirer ${notion}`}
                                onClick={() => removeNotion(notion)}
                            >
                                <X className="size-4" aria-hidden="true"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <Button type="submit" disabled={isSubmitting} className="min-h-11 self-start">
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
        </form>
    );
}
