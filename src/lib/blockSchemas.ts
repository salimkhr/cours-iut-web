// src/lib/blockSchemas.ts
// Schémas Zod et règles d'imbrication des blocs.
// AUCUN import React/JSX ici : ce module est consommé à la fois par le
// registry client (blockRegistry.tsx) et par la validation serveur
// (validateBlockTree.ts, routes API).
import { z } from "zod";

/** Spans autorisés pour une colonne (grille de 12). */
const ALLOWED_SPANS = [3, 4, 6, 8, 9] as const;

export const COL_SPAN_CLASS: Record<number, string> = {
    3: "md:col-span-3",
    4: "md:col-span-4",
    6: "md:col-span-6",
    8: "md:col-span-8",
    9: "md:col-span-9",
};

export const COLUMN_PRESETS: { label: string; spans: number[] }[] = [
    { label: "50 / 50", spans: [6, 6] },
    { label: "33 / 67", spans: [4, 8] },
    { label: "67 / 33", spans: [8, 4] },
    { label: "3 × 33", spans: [4, 4, 4] },
    { label: "25 / 50 / 25", spans: [3, 6, 3] },
    { label: "4 × 25", spans: [3, 3, 3, 3] },
];

export const MAX_DEPTH = 8;

/** Schémas de props par type. Permissifs sur les strings vides : un bloc
 *  fraîchement inséré (defaultProps) doit pouvoir être sauvegardé. */
export const blockPropsSchemas: Record<string, z.ZodTypeAny> = {
    "text": z.object({ content: z.string() }),
    "heading": z.object({
        level: z.coerce.number().int().min(1).max(3),
        text: z.string(),
    }),
    "section": z.object({ title: z.string() }),
    "list": z.object({ ordered: z.boolean() }),
    "list-item": z.object({ text: z.string() }),
    "columns": z.object({}),
    "column": z.object({
        span: z.number().int().refine((v) => (ALLOWED_SPANS as readonly number[]).includes(v), {
            message: `span doit être l'un de : ${ALLOWED_SPANS.join(", ")}`,
        }),
    }),
    "callout": z.object({
        variant: z.enum(["info", "warning", "tip", "reminder"]),
        title: z.string().optional(),
    }),
    "collapsible": z.object({ title: z.string() }),
    "code": z.object({
        language: z.string(),
        code: z.string(),
        filename: z.string().optional(),
        showLineNumbers: z.boolean().optional(),
        collapsible: z.boolean().optional(),
        highlightLines: z.string().optional(),
    }),
    // Duplicata volontaire du schéma porté par `blockDefs.ts` (champ `schema:`).
    // Les deux doivent rester identiques — un test de synchronisation les
    // compare échantillon par échantillon dans `blockDefs.test.ts`.
    "code-with-preview": z.object({
        language: z.string(),
        code: z.string(),
        preview: z.string().optional(),
        secondaryLanguage: z.string().optional(),
        secondaryCode: z.string().optional(),
    }).refine(
        (props) => !props.secondaryCode?.trim() || Boolean(props.secondaryLanguage?.trim()),
        {
            path: ["secondaryLanguage"],
            message: "Le langage du second panneau est requis si un second code est fourni.",
        },
    ),
    "diagram": z.object({
        header: z.string().optional(),
        chart: z.string(),
    }),
    "download-file": z.object({
        language: z.string(),
        filename: z.string(),
        code: z.string(),
    }),
    "quote": z.object({
        text: z.string(),
        source: z.string().optional(),
    }),
    "divider": z.object({}),
    "image-card": z.object({
        src: z.string(),
        title: z.string().optional(),
    }),
    // Tolérant aux props absentes : plusieurs tableaux issus de la migration
    // .tsx → DB n'ont ni `headers` ni `rows`, ce qui rendait leur cours entier
    // insauvegardable. Le renderer traite déjà l'absence comme un tableau vide.
    "table": z.object({
        headers: z.array(z.string()).optional(),
        rows: z.array(z.array(z.string())).optional(),
    }),
    "input-card": z.object({
        title: z.string(),
        description: z.string(),
        language: z.string(),
        code: z.string(),
        filename: z.string().optional(),
    }),
    "section-card": z.object({
        title: z.string(),
        href: z.string(),
        description: z.string().optional(),
    }),
    "slide": z.object({ title: z.string() }),
    "slide-text": z.object({ content: z.string() }),
    "slide-code": z.object({
        language: z.string(),
        code: z.string(),
        highlight: z.string().optional(),
    }),
    "slide-list": z.object({ ordered: z.boolean() }),
    "slide-list-item": z.object({ text: z.string() }),
    "slide-note": z.object({ content: z.string() }),
    // Mêmes props que leurs homologues de cours (`table`, `image-card`) : c'est le rendu
    // qui diffère, pas la donnée. `headers`/`rows` restent optionnels pour la même raison
    // que sur `table` — un tableau en cours de saisie doit rester sauvegardable.
    "slide-table": z.object({
        headers: z.array(z.string()).optional(),
        rows: z.array(z.array(z.string())).optional(),
    }),
    "slide-image": z.object({
        src: z.string(),
        title: z.string().optional(),
        alt: z.string().optional(),
    }),
    "slide-code-with-preview": z.object({
        language: z.string(),
        code: z.string(),
        preview: z.string().optional(),
        secondaryLanguage: z.string().optional(),
        secondaryCode: z.string().optional(),
    }).refine(
        (props) => !props.secondaryCode?.trim() || Boolean(props.secondaryLanguage?.trim()),
        {
            path: ["secondaryLanguage"],
            message: "Le langage du second panneau est requis si un second code est fourni.",
        },
    ),
};

export interface ContainerRule {
    /** Types d'enfants acceptés. "any" = tout type dont allowedParents le permet. */
    allowedChildren: string[] | "any";
    /** Parents autorisés. `null` dans la liste = racine. Absent = partout. */
    allowedParents?: (string | null)[];
}

/** Blocs qui ont leur place à l'intérieur d'un élément de liste : de quoi
 *  détailler une consigne, pas de quoi ouvrir un chapitre. */
const LIST_ITEM_CHILDREN = [
    "text", "list", "code", "code-with-preview", "image-card",
    "diagram", "callout", "quote", "table", "download-file", "section-card",
    "input-card",
];

export const containerRules: Record<string, ContainerRule> = {
    // `section` était absent de allowedParents : une grande partie de cours
    // pouvait être glissée dans une puce, un encadré ou un bloc dépliable.
    // La seule imbrication qui a un sens est la sous-partie (A — puis 1., 2.).
    "columns": { allowedChildren: ["column"], allowedParents: [null, "slide", "section"] },
    "column": { allowedChildren: "any", allowedParents: ["columns"] },
    "list": { allowedChildren: ["list-item"] },
    "list-item": { allowedChildren: LIST_ITEM_CHILDREN, allowedParents: ["list"] },
    "callout": { allowedChildren: "any" },
    "collapsible": { allowedChildren: "any" },
    "section": { allowedChildren: "any", allowedParents: [null, "section"] },
    "slide": {
        allowedChildren: [
            "slide-text", "slide-code", "slide-list", "slide-note", "columns", "diagram",
            "slide-table", "slide-image", "slide-code-with-preview",
        ],
        allowedParents: [null],
    },
    "slide-text": { allowedChildren: [], allowedParents: ["slide", "column"] },
    "slide-code": { allowedChildren: [], allowedParents: ["slide", "column"] },
    "slide-table": { allowedChildren: [], allowedParents: ["slide", "column"] },
    "slide-image": { allowedChildren: [], allowedParents: ["slide", "column"] },
    "slide-code-with-preview": { allowedChildren: [], allowedParents: ["slide", "column"] },
    "slide-list": {
        allowedChildren: ["slide-list-item"],
        allowedParents: ["slide", "column"],
    },
    "slide-note": { allowedChildren: [], allowedParents: ["slide"] },
    "slide-list-item": {
        allowedChildren: "any",
        allowedParents: ["slide-list"],
    },
};

export function isContainer(type: string): boolean {
    return type in containerRules;
}

/** Types utilisables dans une présentation. Une colonne accepte « any » et ne
 *  sait pas si elle vit dans une slide ou dans un cours : sans ce garde-fou, la
 *  palette proposait des blocs de cours dans une colonne de slide (le renderer
 *  de slides ne sait pas les afficher, ils disparaissaient) et inversement. */
const SLIDE_UNIVERSE_TYPES = new Set([
    "slide", "slide-text", "slide-code", "slide-list", "slide-list-item",
    "slide-note", "slide-table", "slide-image", "slide-code-with-preview",
    "columns", "column", "diagram",
]);

/** Ce type de bloc a-t-il sa place dans ce type de contenu (cours/TP vs slide) ? */
export function isTypeAllowedInContent(type: string, contentType: string | null): boolean {
    if (contentType === "slide") return SLIDE_UNIVERSE_TYPES.has(type);
    return !type.startsWith("slide");
}

/** Un bloc de ce type peut-il être déposé dans ce parent ?
 *  `parentType: null` = racine du document. */
export function canDrop(childType: string, parentType: string | null): boolean {
    if (!(childType in blockPropsSchemas)) return false;

    // Contrainte côté enfant : allowedParents
    const childRule = containerRules[childType];
    if (childRule?.allowedParents !== undefined) {
        if (!childRule.allowedParents.includes(parentType)) return false;
    }

    // Contrainte côté parent : allowedChildren
    if (parentType === null) return true; // la racine accepte le reste
    const parentRule = containerRules[parentType];
    if (!parentRule) return false; // pas un conteneur
    if (parentRule.allowedChildren === "any") return true;
    return parentRule.allowedChildren.includes(childType);
}
