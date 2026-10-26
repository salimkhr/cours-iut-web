import { beforeAll, beforeEach, afterAll, describe, test, expect, mock } from "bun:test";
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

const { POST } = await import("../../src/app/api/mcp/route");

const KEY = { moduleSlug: "php", sectionSlug: "8-examen", contentType: "examen" };

// A (section) contient a1 ; B (section) contient b1 (callout > bt1) ; C (section) vide.
const SEED = [
    {
        id: "A", type: "section", props: { title: "En-tête" },
        children: [{ id: "a1", type: "section", props: { title: "Sous-titre" }, children: [] }],
    },
    {
        id: "B", type: "section", props: { title: "" },
        children: [{
            id: "b1", type: "callout", props: { variant: "warning", title: "Rendu" },
            children: [{ id: "bt1", type: "text", props: { content: "Déposez l'archive." } }],
        }],
    },
    { id: "C", type: "section", props: { title: "Barème" }, children: [] },
    { id: "t", type: "text", props: { content: "Bonne chance" } },
];

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
    await db.collection("modules").insertOne({
        path: "php",
        title: "PHP",
        sections: [{
            path: "8-examen", title: "Examen", order: 8,
            contents: [{ type: "examen", source: "db" }],
            objectives: [], tags: [], totalDuration: 2,
            hasCorrection: false, isAvailable: true,
            correctionIsAvailable: false, examenIsLock: false,
        }],
    });
}, 60_000);

beforeEach(async () => {
    await db.collection("course_content").deleteMany({});
    await db.collection("course_content").insertOne({
        ...KEY, blocks: SEED, version: 1, createdAt: new Date(), updatedAt: new Date(),
    });
});

afterAll(async () => { await stopDb?.(); }, 10_000);

type Node = { id: string; children?: Node[] };

async function tree(): Promise<Node[]> {
    const doc = await db.collection("course_content").findOne(KEY);
    return doc!.blocks as Node[];
}

const ids = (nodes: Node[] | undefined) => (nodes ?? []).map((n) => n.id);

/** Appelle un outil MCP ; lève une Error si l'outil renvoie isError. */
async function callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const res = await POST(new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer valid-token",
            "Accept": "application/json, text/event-stream",
            "mcp-session-id": `test-${name}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    }));
    const text = await res.text();
    const line = text.split("\n").find((l) => l.startsWith("data: "));
    const p = JSON.parse(line ? line.slice("data: ".length) : text);
    if (p.error) throw new Error(p.error.message);
    const item = p.result?.content?.[0];
    if (p.result?.isError) throw new Error(item?.text ?? "MCP tool error");
    return item.text;
}

const base = { module: "php", section: "8-examen", type: "examen" };

describe("move_block", () => {
    test("déplace une section racine dans une autre section, après un bloc donné", async () => {
        await callTool("move_block", { ...base, blockId: "C", parentBlockId: "A", afterBlockId: "a1" });
        const blocks = await tree();
        expect(ids(blocks)).toEqual(["A", "B", "t"]);
        expect(ids(blocks[0].children)).toEqual(["a1", "C"]);
    });

    test("conserve l'ID et les enfants du bloc déplacé", async () => {
        await callTool("move_block", { ...base, blockId: "b1", parentBlockId: "A", afterBlockId: "a1" });
        const blocks = await tree();
        const moved = blocks[0].children![1];
        expect(moved.id).toBe("b1");
        expect(ids(moved.children)).toEqual(["bt1"]);
        expect(ids(blocks[1].children)).toEqual([]);
    });

    test("sans afterBlockId, place le bloc en fin de parent", async () => {
        await callTool("move_block", { ...base, blockId: "t", parentBlockId: "A" });
        expect(ids((await tree())[0].children)).toEqual(["a1", "t"]);
    });

    test("parentBlockId null remonte le bloc à la racine", async () => {
        await callTool("move_block", { ...base, blockId: "a1", parentBlockId: null, afterBlockId: "A" });
        expect(ids(await tree())).toEqual(["A", "a1", "B", "C", "t"]);
    });

    test("afterBlockId absent du parent cible → erreur, rien n'est écrit", async () => {
        await expect(
            callTool("move_block", { ...base, blockId: "C", parentBlockId: "A", afterBlockId: "B" })
        ).rejects.toThrow(/afterBlockId/);
        expect(ids(await tree())).toEqual(["A", "B", "C", "t"]);
    });

    test("refuse de déplacer un bloc dans son propre descendant", async () => {
        await expect(
            callTool("move_block", { ...base, blockId: "B", parentBlockId: "b1" })
        ).rejects.toThrow();
        expect(ids(await tree())).toEqual(["A", "B", "C", "t"]);
    });

    test("refuse un parent qui n'accepte pas d'enfants", async () => {
        await expect(
            callTool("move_block", { ...base, blockId: "C", parentBlockId: "t" })
        ).rejects.toThrow();
        expect(ids(await tree())).toEqual(["A", "B", "C", "t"]);
    });

    test("bloc introuvable → erreur", async () => {
        await expect(
            callTool("move_block", { ...base, blockId: "zz", parentBlockId: "A" })
        ).rejects.toThrow(/introuvable/);
    });
});
