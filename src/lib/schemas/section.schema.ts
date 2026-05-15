import {z} from "zod";

export const AVAILABLE_CONTENTS = ["cours", "TP", "slide", "projet", "examen"] as const;

export const sectionFormSchema = z.object({
    title: z.string().min(1, "Le titre est obligatoire"),
    path: z.string().min(1, "Le path est obligatoire"),
    description: z.string().optional(),
    objectives: z.string().optional(),
    tags: z.string().optional(),
    totalDuration: z.coerce.number().int().min(1, "Minimum 1 séance"),
    hasCorrection: z.boolean(),
    isAvailable: z.boolean(),
    correctionIsAvailable: z.boolean(),
    examenIsLock: z.boolean(),
    order: z.coerce.number().int().min(1, "Position minimum 1"),
    contents: z.array(z.enum(AVAILABLE_CONTENTS)).min(1, "Sélectionnez au moins un type de contenu"),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;
