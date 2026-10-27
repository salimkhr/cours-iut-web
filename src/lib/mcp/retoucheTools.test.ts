import {afterAll, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {ensureIndexes} from "@/lib/db/indexes";
import {QuizService} from "@/lib/quiz/QuizService";
import {RETOUCHE_TOOL_NAMES, RETOUCHES_COLLECTION, registerRetoucheTools} from "@/lib/mcp/retoucheTools";

type Handler = (args: Record<string, unknown>) => Promise<{content: {text: string}[]}>;

const DB_NAME = "test-mcp-retouche";

let server: MongoMemoryServer;
let client: MongoClient;
let questionId: string;

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
    await ensureIndexes(db);
    const mod = await db.collection("modules").insertOne({path: "js", title: "JavaScript", sections: []});
    await db.collection("course_content").insertOne({
        moduleSlug: "js",
        sectionSlug: "s1",
        contentType: "cours",
        version: 2,
        blocks: [{
            id: "sec", type: "section", props: {title: "Le DOM"},
            children: [{id: "t1", type: "text", props: {content: "Texte corrigé"}}],
        }],
    });
    const service = new QuizService(db);
    await service.create(mod.insertedId.toString());
    const quiz = await service.addQuestion(mod.insertedId.toString(), {
        blocks: [{id: "qb", type: "text", props: {content: "Que renvoie querySelector ?"}}],
        options: [{text: "Un élément", correct: true}, {text: "Un tableau", correct: false}],
    });
    questionId = quiz.questions[0].id;
});

function setup(isAdmin: boolean) {
    const mcp = new McpServer({name: "t", version: "1"});
    const handlers = new Map<string, Handler>();
    const original = mcp.tool.bind(mcp) as (...args: unknown[]) => unknown;
    // reason: on intercepte l'enregistrement pour appeler les handlers sans transport MCP
    (mcp as unknown as {tool: (...a: unknown[]) => unknown}).tool = (...args: unknown[]) => {
        handlers.set(args[0] as string, args[args.length - 1] as Handler);
        return original(...args);
    };
    registerRetoucheTools(mcp, {isAdmin, getDb: async () => client.db(DB_NAME)});
    return handlers;
}

async function call(h: Map<string, Handler>, tool: string, args: Record<string, unknown> = {}): Promise<string> {
    return (await h.get(tool)!(args)).content.map((c) => c.text).join("\n");
}

const BLOCK_LOG = {
    target: "block",
    module: "js",
    section: "s1",
    type: "cours",
    blockId: "t1",
    operation: "edit",
    before: {content: "Texte fautif"},
    summary: "Corrige la définition du DOM",
    dependencyNote: "Définition reprise par la slide 2 et l'exercice 1 du TP",
};

function idFrom(textOut: string): string {
    const match = /retoucheId=([0-9a-f]{24})/.exec(textOut);
    if (!match) throw new Error(`Pas d'id dans : ${textOut}`);
    return match[1];
}

describe("outils MCP du journal des retouches", () => {
    test("enregistre exactement les outils déclarés", () => {
        expect([...setup(true).keys()].sort()).toEqual([...RETOUCHE_TOOL_NAMES].sort());
    });

    test("refuse les non-admins sur chaque outil", async () => {
        const h = setup(false);
        await expect(h.get("log_retouche")!(BLOCK_LOG)).rejects.toThrow("Forbidden");
        await expect(h.get("list_retouches")!({})).rejects.toThrow("Forbidden");
        await expect(h.get("mark_retouches_processed")!({ids: ["0123456789abcdef01234567"]})).rejects.toThrow("Forbidden");
        expect(await client.db(DB_NAME).collection(RETOUCHES_COLLECTION).countDocuments()).toBe(0);
    });

    test("log_retouche lit l'« après » en base, pas dans les arguments", async () => {
        const h = setup(true);
        const id = idFrom(await call(h, "log_retouche", {...BLOCK_LOG, after: {content: "inventé"}}));
        const [entry] = JSON.parse(await call(h, "list_retouches"));
        expect(entry.id).toBe(id);
        expect(entry.before).toEqual({content: "Texte fautif"});
        expect(entry.after).toEqual({content: "Texte corrigé"});
        expect(entry.blockType).toBe("text");
        expect(entry.moduleSlug).toBe("js");
        expect(entry.sectionSlug).toBe("s1");
        expect(entry.contentType).toBe("cours");
        expect(entry.status).toBe("pending");
        expect(typeof entry.date).toBe("string");
    });

    test("log_retouche accepte un insert (before null) et des paramètres envoyés en chaîne", async () => {
        const h = setup(true);
        await call(h, "log_retouche", {...BLOCK_LOG, operation: "insert", before: "null", blockId: "sec"});
        await call(h, "log_retouche", {...BLOCK_LOG, before: JSON.stringify({content: "v0"})});
        const entries = JSON.parse(await call(h, "list_retouches", {limit: "10"}));
        expect(entries).toHaveLength(2);
        const insert = entries.find((e: {operation: string}) => e.operation === "insert");
        expect(insert.before).toBeNull();
        expect(insert.after).toEqual({title: "Le DOM"});
        expect(entries.find((e: {operation: string}) => e.operation === "edit").before).toEqual({content: "v0"});
    });

    test("log_retouche journalise une question de quiz lue via QuizService", async () => {
        const h = setup(true);
        await call(h, "log_retouche", {
            target: "quiz-question",
            module: "js",
            questionId,
            operation: "edit",
            before: {blocks: [], options: []},
            summary: "Distracteur reformulé",
            dependencyNote: "Question tirée de l'exercice 2 du TP de la section s1",
        });
        const [entry] = JSON.parse(await call(h, "list_retouches"));
        expect(entry.target).toBe("quiz-question");
        expect(entry.questionId).toBe(questionId);
        expect(entry.after.id).toBe(questionId);
        expect(entry.after.options).toHaveLength(2);
    });

    test("log_retouche rejette un bloc, une question ou un module inexistant", async () => {
        const h = setup(true);
        await expect(h.get("log_retouche")!({...BLOCK_LOG, blockId: "nope"})).rejects.toThrow("introuvable");
        await expect(h.get("log_retouche")!({...BLOCK_LOG, section: "s9"})).rejects.toThrow("introuvable");
        await expect(h.get("log_retouche")!({
            ...BLOCK_LOG, target: "quiz-question", questionId: "nope", section: undefined, type: undefined, blockId: undefined,
        })).rejects.toThrow("introuvable");
        await expect(h.get("log_retouche")!({
            ...BLOCK_LOG, module: "nope", target: "quiz-question", questionId,
        })).rejects.toThrow("introuvable");
        expect(await client.db(DB_NAME).collection(RETOUCHES_COLLECTION).countDocuments()).toBe(0);
    });

    test("log_retouche valide les entrées avec Zod", async () => {
        const h = setup(true);
        const invalid: Record<string, unknown>[] = [
            {...BLOCK_LOG, blockId: undefined},                       // bloc sans blockId
            {...BLOCK_LOG, section: undefined},                       // bloc sans section
            {...BLOCK_LOG, type: undefined},                          // bloc sans type
            {...BLOCK_LOG, target: "quiz-question"},                  // question sans questionId
            {...BLOCK_LOG, summary: ""},
            {...BLOCK_LOG, summary: "x".repeat(301)},
            {...BLOCK_LOG, dependencyNote: "  "},
            {...BLOCK_LOG, before: {content: "x".repeat(50_001)}},   // avant trop gros
            {...BLOCK_LOG, before: "{pas du json"},
            {...BLOCK_LOG, before: null},                             // edit sans avant
            {...BLOCK_LOG, operation: "insert", before: {content: "x"}}, // insert avec avant
            {...BLOCK_LOG, operation: "delete"},
        ];
        for (const args of invalid) {
            await expect(h.get("log_retouche")!(args)).rejects.toThrow("Retouche invalide");
        }
    });

    test("list_retouches filtre (pending par défaut, module, section) et trie par date décroissante", async () => {
        const db = client.db(DB_NAME);
        const base = {target: "block", contentType: "cours", operation: "edit", before: {}, after: {}, summary: "s", dependencyNote: "d"};
        await db.collection(RETOUCHES_COLLECTION).insertMany([
            {...base, moduleSlug: "js", sectionSlug: "s1", blockId: "a", date: new Date("2026-10-01"), status: "pending"},
            {...base, moduleSlug: "js", sectionSlug: "s2", blockId: "b", date: new Date("2026-10-03"), status: "pending"},
            {...base, moduleSlug: "php", sectionSlug: "s1", blockId: "c", date: new Date("2026-10-02"), status: "pending"},
            {...base, moduleSlug: "js", sectionSlug: "s1", blockId: "d", date: new Date("2026-10-04"), status: "processed"},
        ]);
        const h = setup(true);
        const ids = async (args: Record<string, unknown>) =>
            JSON.parse(await call(h, "list_retouches", args)).map((e: {blockId: string}) => e.blockId);
        expect(await ids({})).toEqual(["b", "c", "a"]);
        expect(await ids({module: "js"})).toEqual(["b", "a"]);
        expect(await ids({module: "js", section: "s1"})).toEqual(["a"]);
        expect(await ids({status: "processed"})).toEqual(["d"]);
        expect(await ids({status: "all", module: "js"})).toEqual(["d", "b", "a"]);
        expect(await ids({limit: 1})).toEqual(["b"]);
        await expect(h.get("list_retouches")!({status: "done"})).rejects.toThrow("Filtre invalide");
    });

    test("mark_retouches_processed passe les entrées en processed avec date et note", async () => {
        const h = setup(true);
        const a = idFrom(await call(h, "log_retouche", BLOCK_LOG));
        const b = idFrom(await call(h, "log_retouche", BLOCK_LOG));
        const out = await call(h, "mark_retouches_processed", {ids: JSON.stringify([a]), note: "Slides et TP mis à jour"});
        expect(out).toContain("1 retouche(s)");
        const pending = JSON.parse(await call(h, "list_retouches"));
        expect(pending.map((e: {id: string}) => e.id)).toEqual([b]);
        const [processed] = JSON.parse(await call(h, "list_retouches", {status: "processed"}));
        expect(processed.id).toBe(a);
        expect(processed.processedNote).toBe("Slides et TP mis à jour");
        expect(typeof processed.processedAt).toBe("string");
        // Déjà traitée : rien ne change.
        expect(await call(h, "mark_retouches_processed", {ids: [a]})).toContain("0 retouche(s)");
        await expect(h.get("mark_retouches_processed")!({ids: ["pas-un-id"]})).rejects.toThrow("ID invalide");
        await expect(h.get("mark_retouches_processed")!({ids: []})).rejects.toThrow("invalide");
    });
});
