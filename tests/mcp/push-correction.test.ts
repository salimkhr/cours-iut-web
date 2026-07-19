// tests/mcp/push-correction.test.ts
import { beforeAll, afterAll, beforeEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

// L'email du token de test doit être admin pour push_correction.
process.env.MCP_ADMIN_EMAILS = "user@test.com";

// ── Mock du client GitLab : on teste le contrat de l'outil, pas l'API ─────────
let gitlabCalls: Array<{ fn: string; args: unknown[] }> = [];
mock.module("@/lib/gitlab", () => ({
    getGitlabConfig: () => ({ baseUrl: "https://git.example.dev", rootGroupPath: "correction", token: "t" }),
    ensureGroup: async (...args: unknown[]) => { gitlabCalls.push({ fn: "ensureGroup", args }); return 42; },
    ensureProject: async (...args: unknown[]) => {
        gitlabCalls.push({ fn: "ensureProject", args });
        return { id: 7, webUrl: "https://git.example.dev/correction/php/1-decouverte" };
    },
    commitFiles: async (...args: unknown[]) => { gitlabCalls.push({ fn: "commitFiles", args }); return "abc1234def"; },
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

    await db.collection("modules").insertOne({
        path: "php",
        title: "PHP",
        sections: [
            {
                path: "1-decouverte", title: "Découverte", order: 1,
                contents: [{ type: "cours", source: "db" }, { type: "TP", source: "db" }],
                objectives: [], tags: [], totalDuration: 2,
                hasCorrection: false, isAvailable: true,
                correctionIsAvailable: false, examenIsLock: false,
            },
            {
                path: "2-sans-tp", title: "Théorie", order: 2,
                contents: [{ type: "cours", source: "db" }],
                objectives: [], tags: [], totalDuration: 1,
                hasCorrection: false, isAvailable: true,
                correctionIsAvailable: false, examenIsLock: false,
            },
        ],
    });
}, 60_000);

afterAll(async () => { await stopDb?.(); }, 10_000);

beforeEach(() => { gitlabCalls = []; });

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
    const dataLines = text.startsWith("data:") || text.includes("\ndata:")
        ? text.split("\n").filter((l) => l.startsWith("data: ")).map((l) => l.slice("data: ".length))
        : [text];

    let lastError: Error | null = null;
    for (const raw of dataLines) {
        let parsed: Record<string, unknown>;
        try { parsed = JSON.parse(raw) as Record<string, unknown>; } catch { continue; }
        if (parsed?.error) {
            lastError = new Error((parsed.error as { message?: string }).message ?? "JSON-RPC error");
            continue;
        }
        const result = parsed?.result as { isError?: boolean; content?: Array<{ text?: string; isError?: boolean }> } | undefined;
        if (result?.isError || result?.content?.[0]?.isError) {
            lastError = new Error(result?.content?.[0]?.text ?? "MCP tool error");
            continue;
        }
        if (result?.content?.[0]?.text !== undefined) return result.content[0].text;
    }
    throw lastError ?? new Error(`Réponse MCP illisible: ${text.slice(0, 200)}`);
}

const files = [
    { path: "README.md", content: "# Correction — Découverte" },
    { path: "exercice-1/index.php", content: "<?php echo 'ok';" },
];

describe("push_correction", () => {
    test("section avec TP : pousse et passe hasCorrection à true", async () => {
        const out = await callTool("push_correction", { module: "php", section: "1-decouverte", files });
        expect(out).toContain("https://git.example.dev/correction/php/1-decouverte");

        expect(gitlabCalls.map((c) => c.fn)).toEqual(["ensureGroup", "ensureProject", "commitFiles"]);
        const commit = gitlabCalls[2].args;
        expect(commit[2]).toEqual(files);
        expect(commit[3]).toBe("correction: php/1-decouverte");

        const mod = await db.collection("modules").findOne({ path: "php" });
        const section = (mod!.sections as Array<{ path: string; hasCorrection: boolean; correctionIsAvailable: boolean }>)
            .find((s) => s.path === "1-decouverte")!;
        expect(section.hasCorrection).toBe(true);
        expect(section.correctionIsAvailable).toBe(false);
    });

    test("commitMessage explicite : transmis tel quel", async () => {
        await callTool("push_correction", {
            module: "php", section: "1-decouverte", files, commitMessage: "correction: v2",
        });
        expect(gitlabCalls[2].args[3]).toBe("correction: v2");
    });

    test("section sans TP ni examen : erreur, aucun appel GitLab", async () => {
        await expect(callTool("push_correction", { module: "php", section: "2-sans-tp", files }))
            .rejects.toThrow(/ni TP ni examen/);
        expect(gitlabCalls).toHaveLength(0);
    });

    test("section inconnue : erreur explicite", async () => {
        await expect(callTool("push_correction", { module: "php", section: "9-inconnue", files }))
            .rejects.toThrow(/introuvable/);
    });

    test("module inconnu : erreur explicite", async () => {
        await expect(callTool("push_correction", { module: "cobol", section: "1-decouverte", files }))
            .rejects.toThrow(/introuvable/);
    });
});
