import { z } from "zod";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { removeFromTree, findBlock } from "../utils/tree.js";
export function registerDeleteBlock(server) {
    server.tool("delete_block", "Supprime un bloc et tous ses enfants de l'arbre.", {
        moduleSlug: z.string(),
        sectionSlug: z.string(),
        contentType: z.enum(["cours", "TP", "examen"]),
        blockId: z.string().describe("ID du bloc à supprimer"),
    }, async ({ moduleSlug, sectionSlug, contentType, blockId }) => {
        const key = { moduleSlug, sectionSlug, contentType };
        const blocks = await loadBlocks(key);
        if (!findBlock(blocks, blockId)) {
            return {
                content: [{ type: "text", text: `Bloc "${blockId}" introuvable.` }],
            };
        }
        const updatedBlocks = removeFromTree(blocks, blockId);
        await saveBlocks(key, updatedBlocks);
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: true }, null, 2) }],
        };
    });
}
