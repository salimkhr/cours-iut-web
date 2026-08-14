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
