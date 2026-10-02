import {afterAll, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {ensureIndexes} from "@/lib/db/indexes";
import {QUIZ_TOOL_NAMES, registerQuizTools} from "@/lib/mcp/quizTools";

type Handler = (args: Record<string, unknown>) => Promise<{content: {text: string}[]}>;

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
    const db = client.db("test-mcp-quiz");
    await db.dropDatabase();
    await ensureIndexes(db);
    await db.collection("modules").insertOne({path: "js", title: "JavaScript"});
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
    registerQuizTools(mcp, {isAdmin, getDb: async () => client.db("test-mcp-quiz")});
    return handlers;
}

describe("outils MCP du quiz", () => {
    test("expose uniquement les outils de lecture/création/édition", () => {
        const handlers = setup(true);
        expect([...handlers.keys()].sort()).toEqual([...QUIZ_TOOL_NAMES].sort());
        for (const name of handlers.keys()) {
            expect(name).not.toMatch(/session|result|note|score|answer/);
        }
    });

    test("refuse les non-admins", async () => {
        const handlers = setup(false);
        await expect(handlers.get("get_quiz")!({module: "js"})).rejects.toThrow("Forbidden");
    });

    test("crée, ajoute une question et lit le quiz", async () => {
        const h = setup(true);
        await h.get("create_quiz")!({module: "js", negativeMarking: true});
        await h.get("add_quiz_question")!({
            module: "js",
            blocks: [{id: "b1", type: "text", props: {content: "Q ?"}}],
            options: [{text: "oui", correct: true}, {text: "non", correct: false}],
        });
        const quiz = JSON.parse((await h.get("get_quiz")!({module: "js"})).content[0].text);
        expect(quiz.negativeMarking).toBe(true);
        expect(quiz.questions).toHaveLength(1);
    });

    test("erreur de validation lisible et module inconnu", async () => {
        const h = setup(true);
        await h.get("create_quiz")!({module: "js"});
        await expect(h.get("add_quiz_question")!({
            module: "js", blocks: [], options: [{text: "seule", correct: true}],
        })).rejects.toThrow("Quiz invalide");
        await expect(h.get("get_quiz")!({module: "nope"})).rejects.toThrow("introuvable");
    });
});
