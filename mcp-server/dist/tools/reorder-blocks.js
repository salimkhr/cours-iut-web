import { z } from "zod";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { reorderInParent } from "../utils/tree.js";
export function registerReorderBlocks(server) {
    server.tool("reorder_blocks", "Réordonne les enfants directs d'un parent (ou de la racine si parentBlockId est null). blockIds doit contenir les IDs dans le nouvel ordre.", {
        moduleSlug: z.string(),
        sectionSlug: z.string(),
        contentType: z.enum(["cours", "TP", "examen"]),
        parentBlockId: z
            .string()
            .nullable()
            .describe("ID du bloc parent à réordonner. null = racine"),
        blockIds: z
            .array(z.string())
            .describe("IDs des blocs enfants dans le nouvel ordre"),
    }, async ({ moduleSlug, sectionSlug, contentType, parentBlockId, blockIds }) => {
        const key = { moduleSlug, sectionSlug, contentType };
        const blocks = await loadBlocks(key);
        const updatedBlocks = reorderInParent(blocks, parentBlockId ?? null, blockIds);
        await saveBlocks(key, updatedBlocks);
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: true }, null, 2) }],
        };
    });
}
