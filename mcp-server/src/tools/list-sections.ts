import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { connectToDB } from "../db.js";

interface ModuleDoc {
    path: string;
    title?: string;
    sections?: Array<{
        path: string;
        title?: string;
        contents?: Array<{ type: string; source?: string }>;
    }>;
}

export function registerListSections(server: McpServer): void {
    server.tool(
        "list_sections",
        "Retourne les sections d'un module avec les types de contenu présents en base.",
        { moduleSlug: z.string().describe("Slug du module (ex: javascript)") },
        async ({ moduleSlug }) => {
            const db = await connectToDB();
            const mod = await db
                .collection<ModuleDoc>("modules")
                .findOne({ path: moduleSlug }, { projection: { sections: 1, _id: 0 } });

            if (!mod) {
                return {
                    content: [{ type: "text", text: `Module "${moduleSlug}" introuvable.` }],
                };
            }

            const contentDocs = await db
                .collection<{ sectionSlug: string; contentType: string }>("course_content")
                .find({ moduleSlug }, { projection: { sectionSlug: 1, contentType: 1, _id: 0 } })
                .toArray();

            const inDb: Record<string, string[]> = {};
            for (const doc of contentDocs) {
                if (!inDb[doc.sectionSlug]) inDb[doc.sectionSlug] = [];
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
        }
    );
}
