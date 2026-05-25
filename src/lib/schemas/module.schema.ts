import {z} from "zod";

export const FIXED_COMPETENCES = [
    "1/ Réaliser un développement",
    "2/ Optimiser des applications",
    "3/ Administrer des systèmes informatiques communicants complexes",
    "4/ Gérer des données de l'information",
    "5/ Conduire un projet",
    "6/ Travailler en équipe",
] as const;

export const FIXED_SAES = [
    "S2.01 : Développement d'application",
    "S2.02 : Exploration algorithmique d'un problème",
    "S2.05 : Gestion d'un projet",
    "S3.01 : Développement d'une Application",
    "S4.01 : Développement d'une application",
] as const;

export const instructorSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.union([z.string().email("Email invalide"), z.literal("")]),
});

export const moduleFormSchema = z.object({
    title: z.string().min(1, "Le titre est obligatoire"),
    path: z.string().min(1, "Le path est obligatoire"),
    iconName: z.string().min(1, "L'icône est obligatoire"),
    description: z.string().optional(),
    associatedSae: z.array(z.string()).default([]),
    coefficients: z.array(z.object({
        competenceName: z.string(),
        value: z.number().int().min(0).max(100),
    })),
    manager: instructorSchema.optional(),
    instructors: z.array(instructorSchema).default([]),
    isExtra: z.boolean().default(false),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;
