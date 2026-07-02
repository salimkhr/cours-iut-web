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
    "code-with-preview": z.object({
        language: z.string(),
        code: z.string(),
    }),
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
    "table": z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string())),
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
};

export interface ContainerRule {
    /** Types d'enfants acceptés. "any" = tout type dont allowedParents le permet. */
    allowedChildren: string[] | "any";
    /** Parents autorisés. `null` dans la liste = racine. Absent = partout. */
    allowedParents?: (string | null)[];
}

export const containerRules: Record<string, ContainerRule> = {
    "columns": { allowedChildren: ["column"], allowedParents: [null, "slide"] },
    "column": { allowedChildren: "any", allowedParents: ["columns"] },
    "list": { allowedChildren: ["list-item"] },
    "list-item": { allowedChildren: "any", allowedParents: ["list"] },
    "callout": { allowedChildren: "any" },
    "collapsible": { allowedChildren: "any" },
    "section": { allowedChildren: "any" },
    "slide": {
        allowedChildren: ["slide-text", "slide-code", "slide-list", "slide-note", "columns"],
        allowedParents: [null],
    },
    "slide-text": { allowedChildren: [], allowedParents: ["slide", "column"] },
    "slide-code": { allowedChildren: [], allowedParents: ["slide", "column"] },
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
