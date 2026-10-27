import { beforeAll, afterAll, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

mock.module("@/lib/mcp/findMcpUser", () => ({
    findMcpUser: async () => ({ id: "u1", role: "admin" }),
}));

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

mock.module("@/lib/scalekit", () => ({
    validateScalekitToken: async (token: string) =>
        token === "valid-token" ? { sub: "u1", email: "user@test.com" } : null,
}));

mock.module("@/lib/publicOrigin", () => ({
    getPublicOrigin: () => "http://localhost",
}));

mock.module("next/cache", () => ({
    revalidateTag: () => {},
}));

// ── Import du handler MCP (APRÈS les mocks) ───────────────────────────────────
const { POST } = await import("../../src/app/api/mcp/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
    await db.collection("modules").insertOne({
        path: "js",
        title: "JavaScript",
        sections: [{ path: "s1", title: "DOM", order: 1, contents: [{ type: "cours", source: "db" }] }],
    });
    await db.collection("course_content").insertOne({
        moduleSlug: "js", sectionSlug: "s1", contentType: "cours", version: 1,
        blocks: [{ id: "t1", type: "text", props: { content: "Le DOM est un arbre." } }],
    });
}, 60_000);

afterAll(async () => { await stopDb?.(); }, 10_000);

/** Envoie une requête JSON-RPC au handler et renvoie le champ `result` (SSE ou JSON). */
async function rpc(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await POST(new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer valid-token",
            "Accept": "application/json, text/event-stream",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    }));
    const raw = await res.text();
    const line = raw.split("\n").find((l) => l.startsWith("data: "));
    const payload = JSON.parse(line ? line.slice("data: ".length) : raw) as {
        result?: Record<string, unknown>;
        error?: { message?: string };
    };
    if (payload.error) throw new Error(payload.error.message ?? "erreur JSON-RPC");
    return payload.result ?? {};
}

async function callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const result = await rpc("tools/call", { name, arguments: args });
    const content = result.content as Array<{ text: string }>;
    if (result.isError) throw new Error(content[0]?.text ?? "MCP tool error");
    return content[0].text;
}

describe("journal des retouches via la route MCP", () => {
    test("les trois outils du journal sont exposés", async () => {
        const { tools } = await rpc("tools/list", {}) as { tools: Array<{ name: string }> };
        const names = tools.map((t) => t.name);
        for (const name of ["log_retouche", "list_retouches", "mark_retouches_processed"]) {
            expect(names).toContain(name);
        }
    });

    test("log_retouche puis list_retouches, paramètres envoyés en chaîne", async () => {
        const out = await callTool("log_retouche", {
            target: "block", module: "js", section: "s1", type: "cours", blockId: "t1",
            operation: "edit",
            before: JSON.stringify({ content: "Le DOM est une liste." }),
            summary: "Corrige la définition du DOM",
            dependencyNote: "Définition reprise par la slide 2",
        });
        expect(out).toContain("retoucheId=");
        const entries = JSON.parse(await callTool("list_retouches", { module: "js", limit: "5" }));
        expect(entries).toHaveLength(1);
        expect(entries[0].after).toEqual({ content: "Le DOM est un arbre." });
    });

    test("le prompt retouche charge le document de skill retouche", async () => {
        const { prompts } = await rpc("prompts/list", {}) as { prompts: Array<{ name: string }> };
        expect(prompts.map((p) => p.name)).toContain("retouche");
        const got = await rpc("prompts/get", { name: "retouche", arguments: { module: "js", section: "s1" } });
        const text = (got.messages as Array<{ content: { text: string } }>)[0].content.text;
        expect(text).toContain('id="retouche"');
        expect(text).toContain('"js"');
        expect(text).toContain('"s1"');
    });

    test("le prompt retouche fonctionne sans section (question de quiz)", async () => {
        const got = await rpc("prompts/get", { name: "retouche", arguments: { module: "js" } });
        const text = (got.messages as Array<{ content: { text: string } }>)[0].content.text;
        expect(text).toContain('"js"');
    });

    test("les instructions serveur annoncent les trois skills et le journal", async () => {
        const init = await rpc("initialize", {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "test", version: "1" },
        });
        const instructions = init.instructions as string;
        for (const kw of ["module-design", "content-writer", "retouche", "log_retouche"]) {
            expect(instructions).toContain(kw);
        }
        expect(instructions).not.toContain("ne\nvisent QUE le serveur staging");
    });
});
