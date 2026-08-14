import {projectSpecSchema, type ProjectSpec} from "@/lib/schemas/module.schema";

/** Normalise une spec projet envoyée par un agent MCP.
 *  Un agent ne valide jamais : le statut retombe systématiquement à "draft",
 *  et de même pour un `referenceRepo` fraîchement soumis — seul
 *  push_project_reference (toujours en "draft") et la validation admin
 *  peuvent faire passer un dépôt à "validated". Un `referenceRepo` DÉJÀ
 *  validé en base est préservé tel quel, jamais rétrogradé ni remplacé :
 *  seule sa propre valeur en base compte, pas ce que l'agent soumet. */
export function forceDraft(input: unknown, existing?: ProjectSpec): ProjectSpec {
    const parsed = projectSpecSchema.parse(input);
    const referenceRepo = existing?.referenceRepo
        ?? (parsed.referenceRepo ? {...parsed.referenceRepo, status: "draft" as const} : undefined);
    return {
        ...parsed,
        status: "draft",
        referenceRepo,
    };
}
