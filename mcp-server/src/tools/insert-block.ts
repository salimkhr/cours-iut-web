import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { insertInTree, createBlock, findBlock } from "../utils/tree.js";

const CONTAINER_TYPES = new Set(["section", "list", "columns", "column", "callout", "collapsible"]);

export function registerInsertBlock(server: McpServer): void {
    server.tool(
        "insert_block",
        "Insère un nouveau bloc dans l'arbre de contenu. parentBlockId null = racine. afterBlockId null = fin.",
        {
            moduleSlug: z.string(),
            sectionSlug: z.string(),
            contentType: z.enum(["cours", "TP", "examen"]),
            blockType: z.string().describe("Type du bloc (ex: text, code, section, list, image-card...)"),
            props: z.record(z.unknown()).describe("Props initiales du bloc"),
            parentBlockId: z.string().nullable().optional().describe("ID du parent. null = racine"),
            afterBlockId: z.string().nullable().optional().describe("Insérer après ce bloc. null = fin"),
        },
        async ({ moduleSlug, sectionSlug, contentType, blockType, props, parentBlockId, afterBlockId }) => {
            const key = { moduleSlug, sectionSlug, contentType };
            const blocks = await loadBlocks(key);

            const newBlock = createBlock(
                blockType,
                props ?? {},
                CONTAINER_TYPES.has(blockType) ? [] : undefined
            );

            let index = Number.MAX_SAFE_INTEGER;
            if (afterBlockId) {
                const siblings = parentBlockId
                    ? (findBlock(blocks, parentBlockId)?.children ?? blocks)
                    : blocks;
                const pos = siblings.findIndex((b) => b.id === afterBlockId);
                if (pos !== -1) index = pos + 1;
            }

            const updatedBlocks = insertInTree(blocks, newBlock, parentBlockId ?? null, index);
            await saveBlocks(key, updatedBlocks);

            return {
                content: [
                    { type: "text", text: JSON.stringify({ ok: true, blockId: newBlock.id }, null, 2) },
                ],
            };
        }
    );
}
