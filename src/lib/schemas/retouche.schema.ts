import {z} from "zod";

/**
 * Journal des retouches (`pedagogy_retouches`) : une entrée par retouche faite
 * depuis l'app Claude (skill « retouche ») sur un élément dont d'autres supports
 * dépendent. Lu par le workflow de propagation (spec § 8).
 *
 * Les clients MCP au schéma d'outils en cache envoient parfois les objets, les
 * tableaux et les entiers en chaîne : chaque champ concerné tolère string → typé.
 */

export const RETOUCHE_TARGETS = ["block", "quiz-question"] as const;
export const RETOUCHE_OPERATIONS = ["edit", "insert"] as const;
export const RETOUCHE_STATUSES = ["pending", "processed"] as const;
export const RETOUCHE_CONTENT_TYPES = ["cours", "TP", "examen", "slide"] as const;

/** Taille maximale de l'« avant » sérialisé, en octets. */
export const RETOUCHE_BEFORE_MAX_BYTES = 50_000;

const jsonText = (label: string) => z.string().transform((raw, ctx): unknown => {
    try {
        return JSON.parse(raw);
    } catch {
        ctx.addIssue({code: "custom", message: `${label} : JSON invalide`});
        return z.NEVER;
    }
});

/** Props d'origine (bloc) ou question d'origine (quiz), ou null pour un insert. */
const beforeSchema = z.union([z.record(z.string(), z.unknown()), z.null(), jsonText("before")])
    .pipe(z.record(z.string(), z.unknown()).nullable())
    .refine(
        (v) => v === null || Buffer.byteLength(JSON.stringify(v), "utf8") <= RETOUCHE_BEFORE_MAX_BYTES,
        {message: `before dépasse ${RETOUCHE_BEFORE_MAX_BYTES} octets une fois sérialisé`},
    );

const trimmed = (max?: number) => {
    const base = z.string().trim().min(1, "Champ vide");
    return max ? base.max(max, `${max} caractères maximum`) : base;
};

export const logRetoucheSchema = z.object({
    target: z.enum(RETOUCHE_TARGETS),
    module: trimmed(),
    section: trimmed().optional(),
    type: z.enum(RETOUCHE_CONTENT_TYPES).optional(),
    blockId: trimmed().optional(),
    questionId: trimmed().optional(),
    operation: z.enum(RETOUCHE_OPERATIONS),
    before: beforeSchema,
    summary: trimmed(300),
    dependencyNote: trimmed(1000),
}).superRefine((v, ctx) => {
    if (v.target === "block") {
        for (const key of ["section", "type", "blockId"] as const) {
            if (!v[key]) ctx.addIssue({code: "custom", path: [key], message: `${key} requis pour target=block`});
        }
    } else if (!v.questionId) {
        ctx.addIssue({code: "custom", path: ["questionId"], message: "questionId requis pour target=quiz-question"});
    }
    if (v.operation === "edit" && v.before === null) {
        ctx.addIssue({code: "custom", path: ["before"], message: "before requis pour une modification (null réservé à insert)"});
    }
    if (v.operation === "insert" && v.before !== null) {
        ctx.addIssue({code: "custom", path: ["before"], message: "before doit être null pour un insert"});
    }
});
export type LogRetoucheValues = z.infer<typeof logRetoucheSchema>;

const limitSchema = z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
    .pipe(z.number().int().min(1).max(100));

export const listRetouchesSchema = z.object({
    status: z.enum([...RETOUCHE_STATUSES, "all"]).default("pending"),
    module: trimmed().optional(),
    section: trimmed().optional(),
    limit: limitSchema.default(20),
});
export type ListRetouchesValues = z.infer<typeof listRetouchesSchema>;

const idsSchema = z.union([z.array(z.string()), jsonText("ids")])
    .pipe(z.array(z.string().min(1)).min(1, "Au moins un id").max(200));

export const markRetouchesProcessedSchema = z.object({
    ids: idsSchema,
    note: trimmed(1000).optional(),
});
export type MarkRetouchesProcessedValues = z.infer<typeof markRetouchesProcessedSchema>;
