import {afterAll, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {registerRagTools, type SemanticSearch} from "@/lib/mcp/ragTools";
import type {QdrantHit} from "@/lib/rag/qdrant";

type Handler = (args: Record<string, unknown>) => Promise<{content: {text: string}[]; isError?: boolean}>;

const DB_NAME = "test-mcp-rag";
let server: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
}, 120_000);

afterAll(async () => {
    await client?.close();
    await server?.stop();
});

beforeEach(async () => {
    const db = client.db(DB_NAME);
    await db.dropDatabase();
    await db.collection("modules").insertMany([
        {path: "php", isVisible: true, sections: [{path: "s1"}, {path: "s2", isAvailable: false}]},
        {path: "rust", isVisible: false, sections: [{path: "r1"}]},
    ]);
});

const hit = (sectionSlug: string, score: number, moduleSlug = "php"): QdrantHit => ({
    id: `${moduleSlug}-${sectionSlug}`,
    score,
    payload: {
        moduleSlug, sectionSlug, contentType: "cours", title: `Titre ${sectionSlug}`,
        moduleTitle: "PHP", sectionTitle: sectionSlug, blockIds: ["b1"], text: `texte ${sectionSlug}`,
        words: 3, index: 0, moduleVisible: moduleSlug === "php", hash: "h",
    },
});

/** Recherche simulée : renvoie les hits donnés et retient les appels. */
function fakeSearch(hits: QdrantHit[], calls: Parameters<SemanticSearch>[] = []): SemanticSearch {
    return async (...args) => {
        calls.push(args);
        return {hits: hits.slice(0, args[1]), tokens: 7};
    };
}

function setup(isAdmin: boolean, search: SemanticSearch) {
    const mcp = new McpServer({name: "t", version: "1"});
    const handlers = new Map<string, Handler>();
    const original = mcp.tool.bind(mcp) as (...args: unknown[]) => unknown;
    // reason: on intercepte l'enregistrement pour appeler les handlers sans transport MCP
    (mcp as unknown as {tool: (...a: unknown[]) => unknown}).tool = (...args: unknown[]) => {
        handlers.set(args[0] as string, args[args.length - 1] as Handler);
        return original(...args);
    };
    registerRagTools(mcp, {isAdmin, getDb: async () => client.db(DB_NAME), search});
    return handlers;
}

async function call(h: Map<string, Handler>, args: Record<string, unknown>) {
    const res = await h.get("search_semantic")!(args);
    return {isError: res.isError, body: res.content.map(c => c.text).join("\n")};
}

describe("search_semantic", () => {
    test("renvoie les passages avec leur localisation, leur score et leur texte", async () => {
        const h = setup(true, fakeSearch([hit("s1", 0.9)]));
        const {body} = await call(h, {query: "tableaux"});
        const result = JSON.parse(body);

        expect(result.results).toEqual([{
            score: 0.9, moduleSlug: "php", sectionSlug: "s1", contentType: "cours",
            title: "Titre s1", blockIds: ["b1"], text: "texte s1",
        }]);
    });

    test("un admin cherche partout, avec les filtres demandés", async () => {
        const calls: Parameters<SemanticSearch>[] = [];
        const h = setup(true, fakeSearch([], calls));
        await call(h, {query: "emprunt", module: "rust", type: "TP", limit: 3});

        expect(calls[0]).toEqual(["emprunt", 3, {moduleSlug: "rust", contentType: "TP"}]);
    });

    test("un non-admin ne cherche que dans les modules visibles", async () => {
        const calls: Parameters<SemanticSearch>[] = [];
        const h = setup(false, fakeSearch([], calls));
        await call(h, {query: "tableaux"});

        expect(calls[0][2]).toEqual({moduleVisible: true});
    });

    test("un non-admin ne voit pas les sections non publiées, et la limite reste tenue", async () => {
        const h = setup(false, fakeSearch([hit("s2", 0.95), hit("s1", 0.9), hit("r1", 0.8, "rust")]));
        const result = JSON.parse((await call(h, {query: "tableaux", limit: 1})).body);

        expect(result.results.map((r: {sectionSlug: string}) => r.sectionSlug)).toEqual(["s1"]);
    });

    test("journalise la recherche et son coût", async () => {
        const h = setup(true, fakeSearch([]));
        await call(h, {query: "tableaux"});

        const [entry] = await client.db(DB_NAME).collection("rag_usage").find().toArray();
        expect(entry).toMatchObject({step: "search", query: "tableaux", tokens: 7});
    });

    test("un index indisponible donne une erreur explicite", async () => {
        const h = setup(true, async () => {
            throw new Error("Qdrant 404 : collection absente");
        });
        const {isError, body} = await call(h, {query: "tableaux"});

        expect(isError).toBe(true);
        expect(body).toContain("Index sémantique indisponible : Qdrant 404 : collection absente");
    });
});
