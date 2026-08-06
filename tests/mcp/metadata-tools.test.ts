import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { ObjectId, type Db } from "mongodb";

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

const { POST } = await import("../../src/app/api/mcp/route");

let stopDb: () => Promise<void>;
const contentId = new ObjectId("64b7f2c8209f7a27ec93f001");

beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());

    await db.collection("modules").insertOne({
        path: "html-css",
        title: "HTML/CSS",
        iconName: "book-text",
        description: "Bases du Web",
        associatedSae: ["S2.01 : Développement d'application"],
        coefficients: [{ competenceName: "1/ Réaliser un développement", value: 60 }],
        manager: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.test" },
        instructors: [{ firstName: "Grace", lastName: "Hopper", email: "grace@example.test" }],
        isExtra: false,
        sessionDurationMinutes: 120,
        universe: {
            name: "Portfolio",
            description: "Un portfolio étudiant enrichi séance après séance.",
        },
        projectIcon: "gallery-thumbnails",
        colorLight: "#f97316",
        colorDark: "#fdba74",
        isVisible: true,
        updatedAt: new Date("2026-01-02T03:04:05.000Z"),
        sections: [{
            path: "1-rappel-de-html",
            title: "Rappel de HTML",
            description: "Révision structurée du balisage.",
            order: 1,
            contents: [{ type: "cours", source: "db", contentId }],
            objectives: ["Structurer une page"],
            tags: ["html"],
            totalDuration: 1,
            courseIntroMinutes: 30,
            brief: {
                objectives: ["Reprendre les bases HTML"],
                notions: ["balises sémantiques"],
                filRougeStep: "Créer la structure du portfolio.",
            },
            curriculum: {
                notions: ["structure HTML"],
                apis: ["doctype"],
            },
            hasCorrection: false,
            isAvailable: true,
            correctionIsAvailable: false,
            examenIsLock: true,
        }],
    });
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

describe("get_module", () => {
    test("retourne les métadonnées complètes du module sans les sections imbriquées", async () => {
        const out = JSON.parse(await callTool("get_module", { module: "html-css" }));

        expect(out).toMatchObject({
            slug: "html-css",
            title: "HTML/CSS",
            iconName: "book-text",
            description: "Bases du Web",
            associatedSae: ["S2.01 : Développement d'application"],
            coefficients: [{ competenceName: "1/ Réaliser un développement", value: 60 }],
            manager: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.test" },
            instructors: [{ firstName: "Grace", lastName: "Hopper", email: "grace@example.test" }],
            isExtra: false,
            sessionDurationMinutes: 120,
            universe: {
                name: "Portfolio",
                description: "Un portfolio étudiant enrichi séance après séance.",
            },
            projectIcon: "gallery-thumbnails",
            colorLight: "#f97316",
            colorDark: "#fdba74",
            isVisible: true,
            updatedAt: "2026-01-02T03:04:05.000Z",
            sectionCount: 1,
            sectionSlugs: ["1-rappel-de-html"],
        });
        expect(out._id).toBeUndefined();
        expect(out.sections).toBeUndefined();
    });
});

describe("get_section", () => {
    test("retourne les métadonnées complètes d'une section sans blocs de contenu", async () => {
        const out = JSON.parse(await callTool("get_section", {
            module: "html-css",
            section: "1-rappel-de-html",
        }));

        expect(out).toEqual({
            module: "html-css",
            slug: "1-rappel-de-html",
            title: "Rappel de HTML",
            description: "Révision structurée du balisage.",
            order: 1,
            contents: [{ type: "cours", source: "db", contentId: contentId.toString() }],
            objectives: ["Structurer une page"],
            tags: ["html"],
            totalDuration: 1,
            courseIntroMinutes: 30,
            brief: {
                objectives: ["Reprendre les bases HTML"],
                notions: ["balises sémantiques"],
                filRougeStep: "Créer la structure du portfolio.",
            },
            curriculum: {
                notions: ["structure HTML"],
                apis: ["doctype"],
            },
            hasCorrection: false,
            isAvailable: true,
            correctionIsAvailable: false,
            examenIsLock: true,
        });
    });
});
