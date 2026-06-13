import { z } from "zod";
import { connectToDB } from "../db.js";
export function registerGetContent(server) {
    server.tool("get_content", "Retourne l'arbre complet de blocs pour un contenu. Si aucun document n'existe en base, retourne blocks: [].", {
        moduleSlug: z.string().describe("Slug du module (ex: javascript)"),
        sectionSlug: z.string().describe("Slug de la section (ex: 1-le-dom)"),
        contentType: z.enum(["cours", "TP", "examen"]).describe("Type de contenu"),
    }, async ({ moduleSlug, sectionSlug, contentType }) => {
        const db = await connectToDB();
        const doc = await db
            .collection("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType }, { projection: { blocks: 1, version: 1, updatedAt: 1, _id: 0 } });
        const result = {
            blocks: doc?.blocks ?? [],
            version: doc?.version ?? null,
            updatedAt: doc?.updatedAt ?? null,
            source: doc ? "db" : "file",
        };
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    });
}
