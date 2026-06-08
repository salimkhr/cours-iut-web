import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE  = process.env.NEXT_URL ?? "http://localhost:3000";
const TOKEN = process.env.MCP_ADMIN_TOKEN ?? "";

if (!TOKEN) {
    process.stderr.write("ERREUR : MCP_ADMIN_TOKEN non défini\n");
    process.exit(1);
}

const api = (path: string, opts?: RequestInit) =>
    fetch(`${BASE}/api/admin/content/${path}`, {
        ...opts,
        headers: {
            "Cookie": `better-auth.session_token=${TOKEN}`,
            "Content-Type": "application/json",
            ...opts?.headers,
        },
    });

const server = new McpServer({
    name: "cours-iut",
    version: "1.0.0",
});

// ── get_migration_status ──────────────────────────────────────────────────────

server.tool(
    "get_migration_status",
    "Retourne l'état de migration (file/db) de tous les cours, TPs et examens.",
    {},
    async () => {
        const res = await api("status");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
);

// ── list_block_types ──────────────────────────────────────────────────────────

server.tool(
    "list_block_types",
    "Retourne la liste des types de blocs disponibles dans le registre.",
    {},
    async () => {
        const res = await api("block-types");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
);

// ── get_content ───────────────────────────────────────────────────────────────

server.tool(
    "get_content",
    "Retourne le tableau de blocs d'un contenu (cours, TP ou examen).",
    {
        module:  z.string().describe("Slug du module, ex: javascript"),
        section: z.string().describe("Slug de la section, ex: 1-le-dom"),
        type:    z.string().describe("Type de contenu : cours | TP | examen"),
    },
    async ({ module, section, type }) => {
        const res = await api(`${module}/${section}/${type}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
);

// ── save_content ──────────────────────────────────────────────────────────────

server.tool(
    "save_content",
    "Remplace entièrement les blocs d'un contenu (upsert). Utilisé pour la migration et la création.",
    {
        module:  z.string().describe("Slug du module"),
        section: z.string().describe("Slug de la section"),
        type:    z.string().describe("Type de contenu : cours | TP | examen"),
        blocks:  z.array(z.object({
            id:      z.string(),
            type:    z.string(),
            props:   z.record(z.string(), z.unknown()),
            colSpan: z.enum(["full", "half"]).optional(),
        })).describe("Tableau complet de blocs"),
    },
    async ({ module, section, type, blocks }) => {
        const res = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`HTTP ${res.status}: ${err}`);
        }
        const data = await res.json() as { contentId: string; version: number };
        return {
            content: [{
                type: "text" as const,
                text: `Sauvegardé. contentId=${data.contentId}, version=${data.version}`,
            }],
        };
    }
);

// ── delete_content ────────────────────────────────────────────────────────────

server.tool(
    "delete_content",
    "Supprime un contenu de la DB et repasse son ref à source: 'file'.",
    {
        module:  z.string(),
        section: z.string(),
        type:    z.string(),
    },
    async ({ module, section, type }) => {
        const res = await api(`${module}/${section}/${type}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { content: [{ type: "text" as const, text: "Supprimé." }] };
    }
);

// ── insert_block ──────────────────────────────────────────────────────────────

type RawBlock = { id: string; type: string; props: Record<string, unknown>; colSpan?: string };

server.tool(
    "insert_block",
    "Insère un bloc. Si ni position ni afterBlockId → append. Si afterBlockId → après ce bloc. Si position → à cet index.",
    {
        module:       z.string(),
        section:      z.string(),
        type:         z.string(),
        block: z.object({
            id:      z.string().describe("UUID v4 unique"),
            type:    z.string(),
            props:   z.record(z.string(), z.unknown()),
            colSpan: z.enum(["full", "half"]).optional(),
        }),
        position:     z.number().int().min(0).optional().describe("Index 0-based où insérer"),
        afterBlockId: z.string().optional().describe("Insérer après ce blockId"),
    },
    async ({ module, section, type, block, position, afterBlockId }) => {
        const getRes = await api(`${module}/${section}/${type}`);
        if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
        const current = await getRes.json() as { blocks: RawBlock[] };
        const blocks = current.blocks ?? [];

        let insertAt: number;
        if (typeof position === "number") {
            insertAt = Math.min(position, blocks.length);
        } else if (afterBlockId) {
            const idx = blocks.findIndex((b) => b.id === afterBlockId);
            insertAt = idx === -1 ? blocks.length : idx + 1;
        } else {
            insertAt = blocks.length;
        }

        blocks.splice(insertAt, 0, block);

        const putRes = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!putRes.ok) {
            const err = await putRes.text();
            throw new Error(`HTTP ${putRes.status}: ${err}`);
        }
        return {
            content: [{
                type: "text" as const,
                text: `Bloc ${block.id} inséré à l'index ${insertAt}.`,
            }],
        };
    }
);

// ── edit_block ────────────────────────────────────────────────────────────────

server.tool(
    "edit_block",
    "Remplace entièrement les props d'un bloc (replace, pas merge).",
    {
        module:  z.string(),
        section: z.string(),
        type:    z.string(),
        blockId: z.string().describe("ID du bloc à modifier"),
        props:   z.record(z.string(), z.unknown()).describe("Nouvelles props complètes"),
        colSpan: z.enum(["full", "half"]).optional(),
    },
    async ({ module, section, type, blockId, props, colSpan }) => {
        const getRes = await api(`${module}/${section}/${type}`);
        if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
        const current = await getRes.json() as { blocks: RawBlock[] };
        const blocks = current.blocks ?? [];

        const idx = blocks.findIndex((b) => b.id === blockId);
        if (idx === -1) throw new Error(`Bloc ${blockId} introuvable`);

        blocks[idx] = { ...blocks[idx], props, ...(colSpan ? { colSpan } : {}) };

        const putRes = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!putRes.ok) {
            const err = await putRes.text();
            throw new Error(`HTTP ${putRes.status}: ${err}`);
        }
        return {
            content: [{ type: "text" as const, text: `Bloc ${blockId} mis à jour.` }],
        };
    }
);

// ── delete_block ──────────────────────────────────────────────────────────────

server.tool(
    "delete_block",
    "Supprime un bloc par son ID.",
    {
        module:  z.string(),
        section: z.string(),
        type:    z.string(),
        blockId: z.string().describe("ID du bloc à supprimer"),
    },
    async ({ module, section, type, blockId }) => {
        const getRes = await api(`${module}/${section}/${type}`);
        if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
        const current = await getRes.json() as { blocks: RawBlock[] };
        const blocks = (current.blocks ?? []).filter((b) => b.id !== blockId);

        const putRes = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!putRes.ok) {
            const err = await putRes.text();
            throw new Error(`HTTP ${putRes.status}: ${err}`);
        }
        return {
            content: [{ type: "text" as const, text: `Bloc ${blockId} supprimé.` }],
        };
    }
);

// ── Démarrer le serveur ───────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
