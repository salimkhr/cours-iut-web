import { beforeAll, afterAll, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

// ── Repro Finding 3 (revue finale) ──────────────────────────────────────────────
// get_project_reference n'avait pas le garde `if (!isAdmin) throw new Error("Forbidden")`
// que TOUS les autres outils GitLab/données privées de ce fichier ont. Cet outil renvoie le
// code source complet du projet de référence — la solution de chaque exercice du module — donc
// un appelant non-admin (role "user", cf. MCP_ADMIN_EMAILS) ne doit jamais pouvoir le lire.
// Pire : `ensurePrivateProject` CRÉE le dépôt GitLab s'il n'existe pas encore, donc un appel
// non filtré déclenche une écriture (création de repo) même en lecture seule.

process.env.MCP_ADMIN_EMAILS = "admin@test.com";

let db: Db;
let ensurePrivateProjectCalls = 0;

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

mock.module("@/lib/scalekit", () => ({
    validateScalekitToken: async (token: string) => {
        if (token === "admin-token") return { sub: "u-admin", email: "admin@test.com" };
        if (token === "user-token") return { sub: "u-user", email: "someone-else@test.com" };
        return null;
    },
}));

mock.module("@/lib/publicOrigin", () => ({
    getPublicOrigin: () => "http://localhost",
}));

mock.module("next/cache", () => ({
    revalidateTag: () => {},
}));

mock.module("@/lib/gitlab", () => ({
    getGitlabConfig: () => ({ baseUrl: "https://git.example", token: "t", groupPath: "correction" }),
    getPrivateProjectConfig: () => ({ baseUrl: "https://git.example", token: "t" }),
    ensureGroup: async () => ({ id: 1 }),
    ensureProject: async () => ({ id: 1, webUrl: "https://git.example/p" }),
    ensurePrivateProject: async () => {
        ensurePrivateProjectCalls += 1;
        return { id: 1, webUrl: "https://git.example/private/p" };
    },
    commitFiles: async () => "deadbeef",
    listRepoFiles: async () => ["src/main.rs"],
    readRepoFile: async () => "fn main() {}",
}));

const { POST } = await import("../../src/app/api/mcp/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());

    await db.collection("modules").insertOne({
        path: "rust",
        title: "Rust",
        sections: [],
        projectSpec: {
            name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: [],
            status: "validated",
            referenceRepo: { url: "https://git.example/private/rust", status: "validated" },
        },
    });
}, 60_000);

afterAll(async () => {
    await stopDb?.();
}, 10_000);

async function callTool(token: string, name: string, params: Record<string, unknown>) {
    const req = new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json, text/event-stream",
            "mcp-session-id": `test-${name}-${token}`,
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

    let lastPayload: Record<string, unknown> | null = null;
    for (const line of dataLines) {
        try {
            lastPayload = JSON.parse(line.slice("data: ".length));
        } catch {
            // ligne non-JSON, ignorée
        }
    }
    return lastPayload;
}

describe("get_project_reference — garde admin", () => {
    test("refuse un appelant non-admin (Forbidden) et ne crée/lit rien côté GitLab", async () => {
        const before = ensurePrivateProjectCalls;
        const payload = await callTool("user-token", "get_project_reference", { module: "rust" });

        const payloadResult = payload?.result as { isError?: boolean; content?: Array<{ text?: string }> } | undefined;
        const errorMessage = (payload?.error as { message?: string } | undefined)?.message
            ?? payloadResult?.content?.[0]?.text;

        expect(errorMessage).toContain("Forbidden");
        // Le garde doit s'exécuter AVANT tout appel GitLab (création de projet incluse).
        expect(ensurePrivateProjectCalls).toBe(before);
    });

    test("autorise un appelant admin à lire le projet de référence", async () => {
        const payload = await callTool("admin-token", "get_project_reference", { module: "rust" });

        const payloadResult = payload?.result as { isError?: boolean; content?: Array<{ text?: string }> } | undefined;
        expect(payloadResult?.isError).not.toBe(true);
        expect(payloadResult?.content?.[0]?.text).toContain("src/main.rs");
        expect(ensurePrivateProjectCalls).toBeGreaterThan(0);
    });
});
