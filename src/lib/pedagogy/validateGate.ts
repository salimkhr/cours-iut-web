import {z} from "zod";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

export const validateGateSchema = z.object({
    gate: z.enum(["projectSpec", "referenceRepo"]),
});

/** Construit le `$set` d'une validation de porte, ou lève si l'ordre n'est pas respecté.
 *  Seul l'humain passe par ici : les agents MCP écrivent toujours en brouillon. */
export function buildGateUpdate(
    gate: "projectSpec" | "referenceRepo",
    spec: ProjectSpec | undefined
): Record<string, unknown> {
    if (!spec) throw new Error("Ce module n'a aucune spec projet à valider.");

    if (gate === "projectSpec") {
        if (!spec.finalDeliverable.trim()) {
            throw new Error("Renseignez le livrable final avant de valider la spec projet.");
        }
        return {"projectSpec.status": "validated"};
    }

    if (spec.status !== "validated") {
        throw new Error("Validez d'abord la spec projet, puis le dépôt de référence.");
    }
    if (!spec.referenceRepo) {
        throw new Error("Ce module n'a aucun dépôt de référence : faites-le pousser avant de valider.");
    }
    return {"projectSpec.referenceRepo.status": "validated"};
}

/** Garde appliquée par le PUT d'édition du module — jamais par /validate, qui a ses propres
 *  règles. Empêche ce PUT de PROMOUVOIR un statut à "validated" (seul /validate le peut) tout
 *  en autorisant la régression explicite vers "draft" (bouton "Repasser en brouillon", Task 11).
 *  Le referenceRepo déjà en base n'est jamais remplacé ni rétrogradé par ce chemin — même
 *  principe que forceDraft (Task 4) côté MCP ; un referenceRepo fraîchement soumis sans existant
 *  est clampé à "draft", jamais auto-validé. */
export function guardProjectSpecOnPut(
    input: ProjectSpec | undefined,
    existing: ProjectSpec | undefined
): ProjectSpec | undefined {
    if (!input) return input;
    const status = input.status === "validated" && existing?.status !== "validated"
        ? "draft"
        : input.status;
    const referenceRepo = existing?.referenceRepo
        ?? (input.referenceRepo ? {...input.referenceRepo, status: "draft" as const} : undefined);
    return {...input, status, referenceRepo};
}

/** Replie le résultat de `guardProjectSpecOnPut` dans le `$set` d'un PUT complet, sans jamais
 *  écrire `projectSpec: undefined` comme propriété propre. Le driver Mongo de ce projet n'a PAS
 *  `ignoreUndefined: true` : une clé explicitement `undefined` est sérialisée en BSON `null`, que
 *  `moduleFormSchema` (`.optional()`, pas `.nullable()`) rejette au PUT suivant — un module qui
 *  perd sa spec une fois ne peut alors plus jamais être sauvegardé depuis Cadrage/Notions/Projet
 *  (400 systématique) tant que la valeur en base reste `null`. */
export function foldProjectSpecGuard(
    data: Record<string, unknown> & {projectSpec?: ProjectSpec},
    existing: ProjectSpec | undefined
): Record<string, unknown> {
    const {projectSpec, ...rest} = data;
    const guarded = guardProjectSpecOnPut(projectSpec, existing);
    return guarded !== undefined ? {...rest, projectSpec: guarded} : rest;
}
