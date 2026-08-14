import {projectSpecSchema, type ProjectSpec} from "@/lib/schemas/module.schema";

/** Normalise une spec projet envoyée par un agent MCP.
 *  Un agent ne valide jamais : le statut retombe systématiquement à "draft".
 *  Le dépôt de référence déjà en base est conservé tel quel — seul
 *  push_project_reference et l'admin y touchent. */
export function forceDraft(input: unknown, existing?: ProjectSpec): ProjectSpec {
    const parsed = projectSpecSchema.parse(input);
    return {
        ...parsed,
        status: "draft",
        referenceRepo: existing?.referenceRepo ?? parsed.referenceRepo,
    };
}
