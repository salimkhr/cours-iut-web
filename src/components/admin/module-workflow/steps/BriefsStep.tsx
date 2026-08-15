"use client";

import {useForm, type Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import useAdminApi, {type SectionApiPayload} from "@/hook/admin/useAdminApi";
import {briefSchema} from "@/lib/schemas/section.schema";

interface BriefsStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

// Sous-ensemble de briefSchema (Task 1) édité par cette étape — objectives/notions/notes
// restent la propriété du skill module-design côté MCP, cette étape ne touche que le fil rouge.
const briefRowSchema = briefSchema.pick({filRougeStep: true, filRougeOutcome: true, providedBase: true});

type BriefRowValues = z.infer<typeof briefRowSchema>;

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

interface BriefRowProps {
    module: Module;
    section: Section;
    onSaved: (updated: Section) => void;
}

function BriefRow({module, section, onSaved}: BriefRowProps) {
    const {editSection} = useAdminApi();
    // Namespace des id : plusieurs lignes (une par section) sont montées en même temps dans
    // BriefsStep, contrairement à InlineSectionRow où une seule ligne est dépliée à la fois —
    // des id figés en dur entreraient en collision et casseraient <label htmlFor>.
    const fieldId = (name: string) => `brief-${section.path}-${name}`;

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<BriefRowValues>({
        resolver: zodResolver(briefRowSchema) as Resolver<BriefRowValues>,
        defaultValues: {
            filRougeStep: section.brief?.filRougeStep ?? "",
            filRougeOutcome: section.brief?.filRougeOutcome ?? "",
            providedBase: section.brief?.providedBase ?? "",
        },
    });

    const onSubmit = async (data: BriefRowValues) => {
        // editSection remplace le document de section entier (pas de PATCH partiel côté route) :
        // on repart de la section courante et on ne patche que les trois champs de ce brief,
        // en préservant objectives/notions/notes (écrits par le skill module-design) ainsi que
        // tous les autres champs de la section (contents, disponibilité, curriculum…).
        // Mongo renvoie `null` (pas `undefined`) pour les champs optionnels jamais renseignés —
        // les schémas Zod optional() n'acceptent que `string | undefined`, jamais `null` : chaque
        // champ optionnel doit donc être explicitement converti avant l'envoi.
        const payload: SectionApiPayload = {
            title: section.title,
            path: section.path,
            description: section.description ?? undefined,
            objectives: section.objectives ?? [],
            tags: section.tags ?? [],
            totalDuration: section.totalDuration,
            hasCorrection: section.hasCorrection,
            isAvailable: section.isAvailable ?? true,
            correctionIsAvailable: section.correctionIsAvailable ?? true,
            order: section.order,
            contents: section.contents.map((c) => c.type),
            examenIsLock: section.examenIsLock ?? false,
            courseIntroMinutes: section.courseIntroMinutes ?? undefined,
            brief: {
                objectives: section.brief?.objectives ?? [],
                notions: section.brief?.notions ?? [],
                filRougeStep: data.filRougeStep ?? "",
                filRougeOutcome: data.filRougeOutcome ?? "",
                ...(data.providedBase?.trim() && {providedBase: data.providedBase.trim()}),
                ...(section.brief?.notes && {notes: section.brief.notes}),
            },
            curriculum: section.curriculum ?? undefined,
        };

        try {
            const saved: Section = await editSection(String(module._id), String(section._id), payload);
            toast.success(`Brief de « ${section.title} » enregistré.`);
            onSaved(saved);
        } catch {
            toast.error(`Erreur lors de l'enregistrement du brief de « ${section.title} ».`);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 rounded-lg border border-bridge-500/45 bg-card p-4"
        >
            <p className="text-sm font-bold text-brand-dark dark:text-bridge-100">{section.title}</p>

            <div>
                <Label htmlFor={fieldId("filrouge-step")} className={labelCn}>Étape fil rouge</Label>
                <Textarea
                    id={fieldId("filrouge-step")}
                    rows={2}
                    className={inputCn}
                    {...register("filRougeStep")}
                    aria-invalid={errors.filRougeStep ? "true" : "false"}
                />
                {errors.filRougeStep && (
                    <p className="text-red-500 text-xs mt-1">{errors.filRougeStep.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor={fieldId("filrouge-outcome")} className={labelCn}>Résultat attendu</Label>
                <Textarea
                    id={fieldId("filrouge-outcome")}
                    rows={2}
                    className={inputCn}
                    {...register("filRougeOutcome")}
                    aria-invalid={errors.filRougeOutcome ? "true" : "false"}
                />
                {errors.filRougeOutcome && (
                    <p className="text-red-500 text-xs mt-1">{errors.filRougeOutcome.message}</p>
                )}
                <p className="mt-1 text-xs text-bridge-600 dark:text-bridge-400">
                    Ce qui tourne à la fin de la section, pas ce qui a été appris.
                </p>
            </div>

            <div>
                <Label htmlFor={fieldId("provided-base")} className={labelCn}>Base fournie</Label>
                <Textarea
                    id={fieldId("provided-base")}
                    rows={2}
                    className={inputCn}
                    {...register("providedBase")}
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="min-h-11 self-start">
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
        </form>
    );
}

export default function BriefsStep({module, onSaved}: BriefsStepProps) {
    const sortedSections = [...module.sections].sort((first, second) => first.order - second.order);

    if (sortedSections.length === 0) {
        return (
            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                Aucune section dans ce module — ajoutez-en d&apos;abord dans l&apos;étape « Sections ».
            </p>
        );
    }

    const handleRowSaved = (updated: Section) => {
        onSaved({
            sections: module.sections.map((s) => (s.path === updated.path ? updated : s)),
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {sortedSections.map((section) => (
                <BriefRow key={section.path} module={module} section={section} onSaved={handleRowSaved}/>
            ))}
        </div>
    );
}
