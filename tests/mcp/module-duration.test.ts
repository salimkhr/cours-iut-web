import { beforeAll, afterAll, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

// L'email du token de test doit être admin pour edit_module.
process.env.MCP_ADMIN_EMAILS = "user@test.com";

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

const { POST } = await import("../../src/app/api/mcp/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());

    await db.collection("modules").insertOne({
        path: "php",
        title: "PHP",
        isExtra: false,
        sections: [{
            path: "1-decouverte",
            title: "Découverte",
            order: 1,
            contents: [{ type: "TP", source: "db" }],
            objectives: [], tags: [], totalDuration: 2,
            hasCorrection: false, isAvailable: true,
            correctionIsAvailable: false, examenIsLock: false,
        }],
    });
    await db.collection("modules").insertOne({
        path: "brainfuck",
        title: "Brainfuck",
        isExtra: true,
        sections: [],
    });

    // Seed sessionDurationMinutes pour le module php (requis par le test list_modules)
    await callTool("edit_module", { module: "php", sessionDurationMinutes: 150 });
}, 60_000);

afterAll(async () => { await stopDb?.(); }, 10_000);

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
    const dataLines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of dataLines) {
        let parsed: unknown;
        try { parsed = JSON.parse(line.slice("data: ".length)); } catch { continue; }
        const p = parsed as { error?: { message?: string }; result?: { isError?: boolean; content?: { text?: string }[] } };
        if (p?.error) throw new Error(p.error.message ?? "JSON-RPC error");
        if (p?.result) {
            if (p.result.isError) throw new Error(p.result.content?.[0]?.text ?? "tool error");
            return p.result.content?.[0]?.text ?? "";
        }
    }
    // Réponse JSON directe (non-SSE)
    const p = JSON.parse(text) as { error?: { message?: string }; result?: { isError?: boolean; content?: { text?: string }[] } };
    if (p?.error) throw new Error(p.error.message ?? "JSON-RPC error");
    if (p.result?.isError) throw new Error(p.result.content?.[0]?.text ?? "tool error");
    return p.result?.content?.[0]?.text ?? "";
}

describe("MCP — durées de séance", () => {
    test("edit_module permet de modifier sessionDurationMinutes", async () => {
        // Seed a gardé 150 en beforeAll. On vérifie que edit_module peut changer la valeur.
        await callTool("edit_module", { module: "php", sessionDurationMinutes: 90 });
        const out = JSON.parse(await callTool("list_modules", {}));
        const php = out.find((m: { slug: string }) => m.slug === "php");
        expect(php.sessionDurationMinutes).toBe(90);
        // Restaure 150 pour les tests suivants (indépendance)
        await callTool("edit_module", { module: "php", sessionDurationMinutes: 150 });
    });

    test("list_modules renvoie sessionDurationMinutes et isExtra", async () => {
        const out = JSON.parse(await callTool("list_modules", {}));
        const php = out.find((m: { slug: string }) => m.slug === "php");
        expect(php.sessionDurationMinutes).toBe(150);
        expect(php.isExtra).toBe(false);
        const bf = out.find((m: { slug: string }) => m.slug === "brainfuck");
        expect(bf.isExtra).toBe(true);
        expect(bf.sessionDurationMinutes).toBeUndefined();
    });

    test("list_sections renvoie totalDuration", async () => {
        const out = JSON.parse(await callTool("list_sections", { module: "php" }));
        expect(out[0].totalDuration).toBe(2);
    });

    test("create_module accepte sessionDurationMinutes", async () => {
        await callTool("create_module", { title: "Rust", sessionDurationMinutes: 120 });
        const mod = await db.collection("modules").findOne({ path: "rust" });
        expect(mod?.sessionDurationMinutes).toBe(120);
    });
});
