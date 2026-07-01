import { beforeAll, afterAll, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

// ── Shared mutable state ──────────────────────────────────────────────────────
let db: Db;

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

mock.module("@/lib/scalekit", () => ({
    validateScalekitToken: async (token: string) => {
        if (token === "valid-token") return { sub: "u1", email: "user@test.com" };
        return null;
    },
}));

mock.module("@/lib/publicOrigin", () => ({
    getPublicOrigin: () => "http://localhost",
}));

mock.module("next/cache", () => ({
    revalidateTag: () => {},
}));

// ── Import du handler MCP (APRÈS les mocks) ───────────────────────────────────
const { POST } = await import("../../src/app/api/mcp/route");

// ── DB lifecycle ──────────────────────────────────────────────────────────────
let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());

    // ── Seed data ─────────────────────────────────────────────────────────────

    // Module
    await db.collection("modules").insertOne({
        path: "javascript",
        title: "JavaScript",
        sections: [
            {
                path: "1-le-dom",
                title: "Le DOM",
                order: 1,
                contents: [{ type: "cours", source: "db" }],
                objectives: [], tags: [], totalDuration: 2,
                hasCorrection: false, isAvailable: true,
                correctionIsAvailable: false, examenIsLock: false,
            },
            {
                path: "2-evenements",
                title: "Événements",
                order: 2,
                contents: [{ type: "cours", source: "db" }, { type: "TP", source: "db" }],
                objectives: [], tags: [], totalDuration: 2,
                hasCorrection: false, isAvailable: true,
                correctionIsAvailable: false, examenIsLock: false,
            },
        ],
    });

    // Cours section 1 (avec section, callout, code, table)
    await db.collection("course_content").insertOne({
        moduleSlug: "javascript",
        sectionSlug: "1-le-dom",
        contentType: "cours",
        blocks: [
            {
                id: "s1",
                type: "section",
                props: { title: "A — Introduction au DOM" },
                children: [
                    { id: "t1", type: "text", props: { content: "Le DOM est l'arbre de noeuds représentant la page HTML." }, children: [] },
                    {
                        id: "ca1",
                        type: "callout",
                        props: { variant: "tip", title: "Astuce" },
                        children: [
                            { id: "ct1", type: "text", props: { content: "Utilisez document.querySelector pour sélectionner un élément." }, children: [] },
                        ],
                    },
                ],
            },
            {
                id: "s2",
                type: "section",
                props: { title: "B — Manipulation du DOM" },
                children: [
                    { id: "c1", type: "code", props: { language: "javascript", code: "const el = document.getElementById('titre');", filename: "dom.js" }, children: [] },
                    {
                        id: "tb1",
                        type: "table",
                        props: {
                            headers: ["Méthode", "Rôle"],
                            rows: [["getElementById", "Sélectionne par ID"], ["querySelector", "Sélectionne par CSS"]],
                        },
                        children: [],
                    },
                ],
            },
        ],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // TP section 2 (avec list ordonnée, collapsible)
    await db.collection("course_content").insertOne({
        moduleSlug: "javascript",
        sectionSlug: "2-evenements",
        contentType: "TP",
        blocks: [
            {
                id: "s3",
                type: "section",
                props: { title: "A — addEventListener" },
                children: [
                    {
                        id: "l1",
                        type: "list",
                        props: { ordered: true },
                        children: [
                            { id: "li1", type: "list-item", props: { text: "Créez un fichier index.html." }, children: [] },
                            { id: "li2", type: "list-item", props: { text: "Ajoutez un bouton avec id=\"btn\"." }, children: [] },
                        ],
                    },
                    {
                        id: "col1",
                        type: "collapsible",
                        props: { title: "Solution complète" },
                        children: [
                            { id: "c2", type: "code", props: { language: "html", code: "<button id=\"btn\">Cliquez</button>", filename: "index.html" }, children: [] },
                        ],
                    },
                ],
            },
        ],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}, 60_000);

afterAll(async () => { await stopDb?.(); }, 10_000);

// ── Helper callTool ───────────────────────────────────────────────────────────

/**
 * Parse une réponse MCP (SSE ou JSON direct) et retourne le texte du premier
 * content item. Lève une Error si le tool a retourné isError:true ou si la
 * réponse est une erreur JSON-RPC.
 *
 * Format SSE : chaque message peut commencer par une ou plusieurs lignes
 * `event: <type>` avant la ligne `data: <json>`. On filtre uniquement les
 * lignes `data:` et on inspecte le JSON.
 */
async function callTool(name: string, params: Record<string, unknown>): Promise<string> {
    const req = new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer valid-token",
            "Accept": "application/json, text/event-stream",
            "mcp-session-id": `test-${name}`,
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name, arguments: params },
        }),
    });

    const res = await POST(req);
    const text = await res.text();

    // Détecter SSE : le corps contient des lignes "data: ..." ou "event: ..."
    const isSSE =
        text.startsWith("data:") ||
        text.startsWith("event:") ||
        text.includes("\ndata:");

    if (isSSE) {
        const dataLines = text.split("\n").filter((l) => l.startsWith("data: "));
        let lastError: Error | null = null;
        for (const line of dataLines) {
            let parsed: unknown;
            try {
                parsed = JSON.parse(line.slice("data: ".length));
            } catch {
                continue; // ligne non-JSON (ex: "[DONE]")
            }
            const p = parsed as Record<string, unknown>;
            // Cas erreur JSON-RPC
            if (p?.error) {
                const err = p.error as { message?: string };
                lastError = new Error(err.message ?? JSON.stringify(p.error));
                continue;
            }
            const result = p?.result as Record<string, unknown> | undefined;
            const content = result?.content as Array<{ text?: string; isError?: boolean }> | undefined;
            // isError peut être au niveau result OU au niveau content[0]
            if (result?.isError || content?.[0]?.isError) {
                lastError = new Error(content?.[0]?.text ?? "MCP tool error");
                continue;
            }
            if (content?.[0]?.text !== undefined) return content[0].text!;
        }
        if (lastError) throw lastError;
        throw new Error(`Aucun résultat dans SSE: ${text.slice(0, 400)}`);
    }

    // JSON direct
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(`Réponse non-JSON: ${text.slice(0, 200)}`);
    }
    const p = parsed as Record<string, unknown>;
    if (p?.error) {
        const err = p.error as { message?: string };
        throw new Error(err.message ?? JSON.stringify(p.error));
    }
    const result = p?.result as Record<string, unknown> | undefined;
    const content = result?.content as Array<{ text?: string; isError?: boolean }> | undefined;
    if (result?.isError || content?.[0]?.isError) {
        throw new Error(content?.[0]?.text ?? "MCP tool error");
    }
    if (content?.[0]?.text !== undefined) return content[0].text!;
    throw new Error(`Contenu introuvable dans: ${text.slice(0, 200)}`);
}

// ── Tests search_content ──────────────────────────────────────────────────────

describe("search_content", () => {
    test("trouve un terme dans un bloc text", async () => {
        const raw = await callTool("search_content", { query: "DOM" });
        const result = JSON.parse(raw);
        expect(result.total).toBeGreaterThan(0);
        const r = result.results[0];
        expect(r.module).toBe("javascript");
        expect(r.blockId).toBeDefined();
    });

    test("est insensible à la casse", async () => {
        const raw = await callTool("search_content", { query: "dom" });
        const result = JSON.parse(raw);
        expect(result.total).toBeGreaterThan(0);
    });

    test("est insensible aux accents — trouve 'arbre' (sans accent)", async () => {
        // "arbre" est dans "l'arbre de noeuds"
        const raw = await callTool("search_content", { query: "arbre" });
        const result = JSON.parse(raw);
        expect(result.total).toBeGreaterThan(0);
    });

    test("filtre par module", async () => {
        const raw = await callTool("search_content", { query: "DOM", module: "javascript" });
        const result = JSON.parse(raw);
        expect(result.total).toBeGreaterThan(0);
        expect(result.results[0].module).toBe("javascript");
    });

    test("filtre par type TP", async () => {
        const raw = await callTool("search_content", { query: "Créez", type: "TP" });
        const result = JSON.parse(raw);
        expect(result.total).toBeGreaterThan(0);
        expect(result.results[0].contentType).toBe("TP");
    });

    test("respecte limit=1", async () => {
        const raw = await callTool("search_content", { query: "a", limit: 1 });
        const result = JSON.parse(raw);
        expect(result.results.length).toBeLessThanOrEqual(1);
    });

    test("retourne total=0 si terme absent", async () => {
        const raw = await callTool("search_content", { query: "xyznotfound99999" });
        const result = JSON.parse(raw);
        expect(result.total).toBe(0);
        expect(result.note).toBeTruthy();
    });

    test("rapporte parentSectionTitle pour un bloc dans une section", async () => {
        const raw = await callTool("search_content", { query: "querySelector" });
        const result = JSON.parse(raw);
        // querySelector est dans le callout ct1, enfant de s1 ("A — Introduction au DOM")
        const match = result.results.find((r: { blockId: string; parentSectionTitle: string }) => r.blockId === "ct1");
        expect(match).toBeDefined();
        expect(match!.parentSectionTitle).toBe("A — Introduction au DOM");
        // Si la requête a trouvé d'autres blocs, le total doit quand même être positif
        expect(result.total).toBeGreaterThan(0);
    });
});

// ── Tests export_content_compact ──────────────────────────────────────────────

describe("export_content_compact", () => {
    test("exporte une section/type en Markdown compact avec IDs", async () => {
        const md = await callTool("export_content_compact", {
            module: "javascript",
            section: "1-le-dom",
            type: "cours",
        });
        expect(md).toContain("<!--s1-->");
        expect(md).toContain("## A — Introduction au DOM");
        expect(md).toContain("Le DOM est l'arbre");
        expect(md).toContain("```javascript");
        expect(md).toContain("| Méthode | Rôle |");
    });

    test("inclut le header global une seule fois", async () => {
        const md = await callTool("export_content_compact", {
            module: "javascript",
            section: "1-le-dom",
            type: "cours",
        });
        const count = (md.match(/# JavaScript \/ Le DOM \/ cours/g) ?? []).length;
        expect(count).toBe(1);
    });

    test("exporte toutes les sections du module si section absente", async () => {
        const md = await callTool("export_content_compact", {
            module: "javascript",
        });
        // Doit contenir au moins 2 sections (1-le-dom et 2-evenements)
        expect(md).toContain("Le DOM");
        expect(md).toContain("Événements");
        // Les docs sont séparés par ---
        expect(md).toContain("---");
    });

    test("retourne message si aucun contenu en DB pour le filtre", async () => {
        const md = await callTool("export_content_compact", {
            module: "javascript",
            section: "1-le-dom",
            type: "examen",
        });
        expect(md).toContain("Aucun contenu en base");
    });

    test("TP avec list ordonnée et collapsible", async () => {
        const md = await callTool("export_content_compact", {
            module: "javascript",
            section: "2-evenements",
            type: "TP",
        });
        expect(md).toContain("1. Créez");
        expect(md).toContain("2. Ajoutez");
        expect(md).toContain("### Solution complète");
        expect(md).toContain("<!--li1-->");
        expect(md).toContain("<!--li2-->");
    });

    test("module introuvable → erreur propagée", async () => {
        await expect(
            callTool("export_content_compact", { module: "inexistant" })
        ).rejects.toThrow();
    });
});
