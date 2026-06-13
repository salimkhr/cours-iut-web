import { z } from "zod";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { updateProps, findBlock } from "../utils/tree.js";
export function registerUpdateBlock(server) {
    server.tool("update_block", "Met à jour les props d'un bloc existant (merge partiel — seules les clés fournies sont modifiées).", {
        moduleSlug: z.string(),
        sectionSlug: z.string(),
        contentType: z.enum(["cours", "TP", "examen"]),
        blockId: z.string().describe("ID du bloc à mettre à jour"),
        props: z.record(z.unknown()).describe("Props à mettre à jour (merge partiel)"),
    }, async ({ moduleSlug, sectionSlug, contentType, blockId, props }) => {
        const key = { moduleSlug, sectionSlug, contentType };
        const blocks = await loadBlocks(key);
        if (!findBlock(blocks, blockId)) {
            return {
                content: [{ type: "text", text: `Bloc "${blockId}" introuvable.` }],
            };
        }
        const updatedBlocks = updateProps(blocks, blockId, props);
        await saveBlocks(key, updatedBlocks);
        return {
            content: [{ type: "text", text: JSON.stringify({ ok: true }, null, 2) }],
        };
    });
}
