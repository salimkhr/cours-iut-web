import { beforeAll, afterAll, afterEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

// Le compte better-auth du token de test est admin (create_module / edit_module).
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
}, 60_000);
afterAll(async () => { await stopDb?.(); }, 10_000);
afterEach(async () => { await db.collection("modules").deleteMany({}); });

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
    type RpcReply = { error?: { message?: string }; result?: { isError?: boolean; content?: { text?: string }[] } };
    const dataLines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of dataLines) {
        let parsed: RpcReply;
        try { parsed = JSON.parse(line.slice("data: ".length)) as RpcReply; } catch { continue; }
        if (parsed?.error) throw new Error(parsed.error.message ?? "JSON-RPC error");
        if (parsed?.result) {
            if (parsed.result.isError) throw new Error(parsed.result.content?.[0]?.text ?? "tool error");
            return parsed.result.content?.[0]?.text ?? "";
        }
    }
    const p = JSON.parse(text) as RpcReply;
    if (p?.error) throw new Error(p.error.message ?? "JSON-RPC error");
    if (p.result?.isError) throw new Error(p.result.content?.[0]?.text ?? "tool error");
    return p.result?.content?.[0]?.text ?? "";
}

describe("MCP — ordre d'affichage des modules", () => {
    test("list_modules trie par order puis par création, expose order sans _id", async () => {
        await db.collection("modules").insertMany([
            { path: "html-css", title: "HTML", sections: [] },
            { path: "javascript", title: "JS", sections: [], order: 2 },
            { path: "php", title: "PHP", sections: [], order: null },
            { path: "rust", title: "Rust", sections: [], order: 1 },
        ]);

        const out = JSON.parse(await callTool("list_modules", {})) as Array<Record<string, unknown>>;

        expect(out.map((m) => m.slug)).toEqual(["rust", "javascript", "html-css", "php"]);
        expect(out[0].order).toBe(1);
        expect(out.find((m) => m.slug === "html-css")).not.toHaveProperty("order");
        expect(out.find((m) => m.slug === "php")).not.toHaveProperty("order");
        for (const m of out) expect(m).not.toHaveProperty("_id");
    });

    test("create_module sans aucun ordre existant n'en pose pas", async () => {
        await db.collection("modules").insertOne({ path: "php", title: "PHP", sections: [] });
        await callTool("create_module", { title: "Rust" });
        const mod = await db.collection("modules").findOne({ path: "rust" });
        expect(mod?.order ?? undefined).toBeUndefined();
    });

    test("create_module donne par défaut order = max + 1", async () => {
        await db.collection("modules").insertMany([
            { path: "php", title: "PHP", sections: [], order: 3 },
            { path: "html-css", title: "HTML", sections: [] },
        ]);
        await callTool("create_module", { title: "Rust" });
        const mod = await db.collection("modules").findOne({ path: "rust" });
        expect(mod?.order).toBe(4);
    });

    test("create_module accepte un order explicite", async () => {
        await db.collection("modules").insertOne({ path: "php", title: "PHP", sections: [], order: 3 });
        await callTool("create_module", { title: "Rust", order: 1 });
        const mod = await db.collection("modules").findOne({ path: "rust" });
        expect(mod?.order).toBe(1);
    });

    test("edit_module met à jour order", async () => {
        await db.collection("modules").insertOne({ path: "php", title: "PHP", sections: [] });
        const msg = await callTool("edit_module", { module: "php", order: 2 });
        expect(msg).toContain("order");
        const mod = await db.collection("modules").findOne({ path: "php" });
        expect(mod?.order).toBe(2);
    });

    test("edit_module refuse un order < 1 ou non entier", async () => {
        await db.collection("modules").insertOne({ path: "php", title: "PHP", sections: [], order: 2 });
        await expect(callTool("edit_module", { module: "php", order: 0 })).rejects.toThrow();
        await expect(callTool("edit_module", { module: "php", order: 1.5 })).rejects.toThrow();
        const mod = await db.collection("modules").findOne({ path: "php" });
        expect(mod?.order).toBe(2);
    });
});
