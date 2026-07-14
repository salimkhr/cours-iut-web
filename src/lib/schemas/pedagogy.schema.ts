import {z} from "zod";

/** Formats de contenu + conception de module. Aligné sur CONTENT_TYPE MCP (cours | TP | examen | slide). */
export const VERDICT_FORMATS = ["cours", "TP", "examen", "slide", "module-design"] as const;
export const EXEMPLAR_FORMATS = ["cours", "TP", "examen", "slide"] as const;
export const EXEMPLAR_LEVELS = ["debutant", "intermediaire", "avance"] as const;

export const addVerdictSchema = z.object({
    format: z.enum(VERDICT_FORMATS),
    verdict: z.string().trim().min(1, "Le verdict ne peut pas être vide"),
    moduleSlug: z.string().optional(),
});
export type AddVerdictValues = z.infer<typeof addVerdictSchema>;

export const promoteExemplarSchema = z.object({
    module: z.string().min(1),
    section: z.string().min(1),
    type: z.enum(EXEMPLAR_FORMATS),
    level: z.enum(EXEMPLAR_LEVELS),
    annotations: z.array(z.string().trim().min(1)).min(1, "Au moins une annotation « pourquoi c'est bon »"),
});
export type PromoteExemplarValues = z.infer<typeof promoteExemplarSchema>;
