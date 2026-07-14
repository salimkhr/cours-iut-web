import {z} from "zod";

export const AVAILABLE_CONTENTS = ["cours", "TP", "slide", "projet", "examen"] as const;

export const briefSchema = z.object({
    objectives: z.array(z.string()).default([]),
    notions: z.array(z.string()).default([]),
    filRougeStep: z.string().default(""),
    notes: z.string().optional(),
});
export type SectionBrief = z.infer<typeof briefSchema>;

export const curriculumSchema = z.object({
    notions: z.array(z.string()).default([]),
    apis: z.array(z.string()).default([]),
});
export type SectionCurriculum = z.infer<typeof curriculumSchema>;

export const sectionFormSchema = z.object({
    title: z.string().min(1, "Le titre est obligatoire"),
    path: z.string().min(1, "Le path est obligatoire"),
    description: z.string().optional(),
    objectives: z.string().optional(),
    tags: z.string().optional(),
    totalDuration: z.number().int().min(1, "Minimum 1 séance"),
    hasCorrection: z.boolean(),
    isAvailable: z.boolean(),
    correctionIsAvailable: z.boolean(),
    examenIsLock: z.boolean(),
    order: z.number().int().min(1, "Position minimum 1"),
    contents: z.array(z.enum(AVAILABLE_CONTENTS)).min(1, "Sélectionnez au moins un type de contenu"),
    courseIntroMinutes: z.number().int().min(0).optional(),
    briefObjectives: z.string().optional(),
    briefNotions: z.string().optional(),
    briefFilRougeStep: z.string().optional(),
    briefNotes: z.string().optional(),
    curriculumNotions: z.string().optional(),
    curriculumApis: z.string().optional(),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;

// Schéma utilisé côté serveur : le formulaire transforme objectives/tags en tableaux avant envoi
export const sectionApiSchema = sectionFormSchema.extend({
    objectives: z.array(z.string()).optional(),
    tags: z.array(z.string()).default([]),
    brief: briefSchema.optional(),
    curriculum: curriculumSchema.optional(),
});

export type SectionApiValues = z.infer<typeof sectionApiSchema>;
