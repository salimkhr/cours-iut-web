import { z } from "zod";
import { connectToDB } from "../db.js";
export function registerListSections(server) {
    server.tool("list_sections", "Retourne les sections d'un module avec les types de contenu présents en base.", { moduleSlug: z.string().describe("Slug du module (ex: javascript)") }, async ({ moduleSlug }) => {
        const db = await connectToDB();
        const mod = await db
            .collection("modules")
            .findOne({ path: moduleSlug }, { projection: { sections: 1, _id: 0 } });
        if (!mod) {
            return {
                content: [{ type: "text", text: `Module "${moduleSlug}" introuvable.` }],
            };
        }
        const contentDocs = await db
            .collection("course_content")
            .find({ moduleSlug }, { projection: { sectionSlug: 1, contentType: 1, _id: 0 } })
            .toArray();
        const inDb = {};
        for (const doc of contentDocs) {
            if (!inDb[doc.sectionSlug])
                inDb[doc.sectionSlug] = [];
            inDb[doc.sectionSlug].push(doc.contentType);
        }
        const sections = (mod.sections ?? []).map((s) => ({
            slug: s.path,
            title: s.title ?? s.path,
            contentTypesInDb: inDb[s.path] ?? [],
            availableTypes: (s.contents ?? []).map((c) => c.type),
        }));
        return {
            content: [{ type: "text", text: JSON.stringify(sections, null, 2) }],
        };
    });
}
