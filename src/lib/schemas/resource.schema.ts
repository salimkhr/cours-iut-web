import {z} from "zod";

export const RESOURCE_KINDS = ["article", "video", "recherche", "outil"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const RESOURCE_KIND_LABELS: Record<ResourceKind, string> = {
    article: "Article",
    video: "Vidéo",
    recherche: "Recherche",
    outil: "Outil",
};

/** `z.url()` accepte `javascript:` et `data:` : seules les URL http(s) sont affichées en lien. */
const httpUrl = z
    .string()
    .trim()
    .max(2048, "URL trop longue")
    .pipe(z.url("URL invalide"))
    .refine((value) => {
        // zod enchaîne les contrôles même après l'échec de `z.url()` : ne pas lever sur une valeur non parsable.
        if (!URL.canParse(value)) return true;
        const protocol = new URL(value).protocol;
        return protocol === "http:" || protocol === "https:";
    }, "L'URL doit commencer par http:// ou https://");

export const resourceFormSchema = z.object({
    title: z.string().trim().min(1, "Titre requis").max(160, "160 caractères maximum"),
    url: httpUrl,
    description: z.string().trim().min(1, "Description requise").max(600, "600 caractères maximum"),
    kind: z.enum(RESOURCE_KINDS),
    /** Temps de lecture / de visionnage, en minutes (facultatif). */
    durationMin: z.number().int("Nombre entier de minutes").min(1, "1 minute minimum").max(600, "600 minutes maximum").optional(),
    /** « Mot du prof » : pourquoi cette ressource, affiché sur la dernière ajoutée (facultatif). */
    note: z
        .string()
        .trim()
        .max(300, "300 caractères maximum")
        .optional()
        .transform((value) => value || undefined),
});
export type ResourceFormData = z.infer<typeof resourceFormSchema>;

export const resourceVisibilitySchema = z.object({isVisible: z.boolean()});
