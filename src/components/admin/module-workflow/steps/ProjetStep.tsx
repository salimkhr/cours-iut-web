"use client";

import {useState} from "react";
import {useForm, type Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {X} from "lucide-react";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import type Module from "@/types/Module";
import {
    projectSpecSchema,
    exampleDomainSchema,
    type ModuleFormValues,
} from "@/lib/schemas/module.schema";
import {moduleToFormValues} from "@/lib/pedagogy/moduleFormValues";
import {readErrorMessage} from "@/lib/pedagogy/apiErrors";

interface ProjetStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

const projetSchema = z.object({
    projectSpec: projectSpecSchema.pick({name: true, pitch: true, finalDeliverable: true, entities: true}),
    exampleDomain: exampleDomainSchema,
});

type ProjetValues = z.infer<typeof projetSchema>;

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

export default function ProjetStep({module, onSaved}: ProjetStepProps) {
    const [newEntity, setNewEntity] = useState("");
    const [unvalidating, setUnvalidating] = useState(false);
    const validated = module.projectSpec?.status === "validated";

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: {errors, isSubmitting},
    } = useForm<ProjetValues>({
        resolver: zodResolver(projetSchema) as Resolver<ProjetValues>,
        defaultValues: {
            projectSpec: {
                name: module.projectSpec?.name ?? "",
                pitch: module.projectSpec?.pitch ?? "",
                finalDeliverable: module.projectSpec?.finalDeliverable ?? "",
                entities: module.projectSpec?.entities ?? [],
            },
            exampleDomain: {
                name: module.exampleDomain?.name ?? "",
                description: module.exampleDomain?.description ?? "",
            },
        },
    });

    const entities = watch("projectSpec.entities");

    const addEntity = () => {
        const trimmed = newEntity.trim();
        if (!trimmed || entities.includes(trimmed)) return;
        setValue("projectSpec.entities", [...entities, trimmed]);
        setNewEntity("");
    };

    const removeEntity = (entity: string) => {
        setValue("projectSpec.entities", entities.filter((e) => e !== entity));
    };

    const buildPayload = (data: ProjetValues, status: "draft" | "validated"): ModuleFormValues => ({
        ...moduleToFormValues(module),
        projectSpec: {
            name: data.projectSpec.name,
            pitch: data.projectSpec.pitch,
            finalDeliverable: data.projectSpec.finalDeliverable,
            entities: data.projectSpec.entities,
            status,
            referenceRepo: module.projectSpec?.referenceRepo,
        },
        exampleDomain: data.exampleDomain,
    });

    const onSubmit = async (data: ProjetValues) => {
        // Enregistre d'abord la spec (en préservant son statut courant — jamais promue ici,
        // seul /validate le peut, cf. guardProjectSpecOnPut), puis tente la validation.
        const draftPayload = buildPayload(data, module.projectSpec?.status === "validated" ? "validated" : "draft");

        const putRes = await fetch(`/api/admin/modules/${module._id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(draftPayload),
        });

        if (!putRes.ok) {
            toast.error(await readErrorMessage(putRes, "Erreur lors de l'enregistrement du projet."));
            return;
        }

        const validateRes = await fetch(`/api/admin/modules/${module._id}/validate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({gate: "projectSpec"}),
        });

        if (!validateRes.ok) {
            toast.error(await readErrorMessage(validateRes, "Erreur lors de la validation de la spec projet."));
            onSaved({
                projectSpec: {...draftPayload.projectSpec!, status: "draft"},
                exampleDomain: draftPayload.exampleDomain,
            });
            return;
        }

        toast.success("Spec projet validée.");
        onSaved({
            projectSpec: {...draftPayload.projectSpec!, status: "validated"},
            exampleDomain: draftPayload.exampleDomain,
        });
    };

    const handleUnvalidate = async () => {
        setUnvalidating(true);
        try {
            const payload = buildPayload(getValues(), "draft");
            const res = await fetch(`/api/admin/modules/${module._id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                toast.error(await readErrorMessage(res, "Erreur lors du passage en brouillon."));
                return;
            }

            toast.success("Spec projet repassée en brouillon.");
            onSaved({projectSpec: payload.projectSpec, exampleDomain: payload.exampleDomain});
        } finally {
            setUnvalidating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="projet-name" className={labelCn}>Nom du projet *</Label>
                <Input
                    id="projet-name"
                    className={inputCn}
                    {...register("projectSpec.name")}
                    aria-invalid={errors.projectSpec?.name ? "true" : "false"}
                />
                {errors.projectSpec?.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.projectSpec.name.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="projet-pitch" className={labelCn}>Pitch *</Label>
                <Input
                    id="projet-pitch"
                    className={inputCn}
                    {...register("projectSpec.pitch")}
                    aria-invalid={errors.projectSpec?.pitch ? "true" : "false"}
                />
                {errors.projectSpec?.pitch && (
                    <p className="text-red-500 text-xs mt-1">{errors.projectSpec.pitch.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="projet-deliverable" className={labelCn}>Livrable final *</Label>
                <Textarea
                    id="projet-deliverable"
                    rows={3}
                    className={inputCn}
                    {...register("projectSpec.finalDeliverable")}
                    aria-invalid={errors.projectSpec?.finalDeliverable ? "true" : "false"}
                />
                {errors.projectSpec?.finalDeliverable && (
                    <p className="text-red-500 text-xs mt-1">{errors.projectSpec.finalDeliverable.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="projet-new-entity" className={labelCn}>Ajouter une entité</Label>
                <div className="flex gap-2">
                    <Input
                        id="projet-new-entity"
                        className={inputCn}
                        value={newEntity}
                        onChange={(e) => setNewEntity(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addEntity();
                            }
                        }}
                    />
                    <Button type="button" onClick={addEntity} className="min-h-11 shrink-0">
                        Ajouter
                    </Button>
                </div>
            </div>

            {entities.length > 0 && (
                <ul className="flex flex-wrap items-center gap-2">
                    {entities.map((entity) => (
                        <li key={entity} className="inline-flex items-center gap-1">
                            <Badge variant="secondary" className="py-1">{entity}</Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-11 text-bridge-600 hover:text-red-500 dark:text-bridge-300"
                                aria-label={`Retirer ${entity}`}
                                onClick={() => removeEntity(entity)}
                            >
                                <X className="size-4" aria-hidden="true"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20"/>

            <div>
                <Label htmlFor="projet-domain-name" className={labelCn}>Nom du domaine d&apos;exemples *</Label>
                <Input
                    id="projet-domain-name"
                    className={inputCn}
                    {...register("exampleDomain.name")}
                    aria-invalid={errors.exampleDomain?.name ? "true" : "false"}
                />
                {errors.exampleDomain?.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.exampleDomain.name.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="projet-domain-desc" className={labelCn}>
                    Description du domaine d&apos;exemples *
                </Label>
                <Textarea
                    id="projet-domain-desc"
                    rows={3}
                    className={inputCn}
                    {...register("exampleDomain.description")}
                    aria-invalid={errors.exampleDomain?.description ? "true" : "false"}
                />
                {errors.exampleDomain?.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.exampleDomain.description.message}</p>
                )}
                <p className="mt-1 text-xs text-bridge-600 dark:text-bridge-400">
                    Domaine d&apos;illustration du cours. Il doit être différent du projet : sinon un
                    copier-coller du cours suffit à faire le TP.
                </p>
            </div>

            {validated ? (
                <div className="flex items-center gap-3">
                    <Badge className="bg-bridge-700 text-white dark:bg-bridge-500">Validée</Badge>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={unvalidating}
                        onClick={handleUnvalidate}
                        className="min-h-11 border-bridge-500/45"
                    >
                        {unvalidating ? "Passage en brouillon…" : "Repasser en brouillon"}
                    </Button>
                </div>
            ) : (
                <Button type="submit" disabled={isSubmitting} className="min-h-11 self-start">
                    {isSubmitting ? "Validation…" : "Valider la spec projet"}
                </Button>
            )}
        </form>
    );
}
