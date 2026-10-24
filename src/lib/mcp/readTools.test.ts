import {afterAll, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {READ_TOOL_NAMES, registerReadTools} from "@/lib/mcp/readTools";

type Handler = (args: Record<string, unknown>) => Promise<{content: {text: string}[]}>;

const DB_NAME = "test-mcp-read";
// Marqueurs posés dans tout ce qu'un non-admin ne doit jamais lire.
const SECRETS = ["SECRET_EXAM", "SECRET_S2", "SECRET_HIDDEN", "SECRET_BRIEF", "SECRET_SPEC", "SECRET_RESOURCE"];

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

function textBlock(id: string, content: string) {
    return [{id, type: "text", props: {content}}];
}

beforeEach(async () => {
    const db = client.db(DB_NAME);
    await db.dropDatabase();
    await db.collection("modules").insertMany([
        {
            path: "js",
            title: "JavaScript",
            projectSpec: {name: "SECRET_SPEC"},
            sections: [
                {
                    path: "s1",
                    title: "Publiée",
                    isAvailable: true,
                    brief: {objectives: ["SECRET_BRIEF"]},
                    contents: [{type: "cours", source: "db"}, {type: "examen", source: "db"}],
                },
                {path: "s2", title: "SECRET_S2", isAvailable: false, contents: [{type: "cours", source: "db"}]},
            ],
        },
        {
            path: "hidden",
            title: "SECRET_HIDDEN",
            isVisible: false,
            sections: [{path: "h1", title: "h1", isAvailable: true, contents: [{type: "cours", source: "db"}]}],
        },
    ]);
    await db.collection("course_content").insertMany([
        {moduleSlug: "js", sectionSlug: "s1", contentType: "cours", version: 1, blocks: textBlock("b1", "public commun")},
        {moduleSlug: "js", sectionSlug: "s1", contentType: "examen", version: 1, blocks: textBlock("b2", "SECRET_EXAM commun")},
        {moduleSlug: "js", sectionSlug: "s2", contentType: "cours", version: 1, blocks: textBlock("b3", "SECRET_S2 commun")},
        {moduleSlug: "hidden", sectionSlug: "h1", contentType: "cours", version: 1, blocks: textBlock("b4", "SECRET_HIDDEN commun")},
    ]);
    await db.collection("resources").insertMany([
        {title: "visible", url: "https://a.test", kind: "article", description: "d", isVisible: true, createdAt: new Date()},
        {title: "SECRET_RESOURCE", url: "https://b.test", kind: "article", description: "d", isVisible: false, createdAt: new Date()},
    ]);
    await db.collection("pedagogy_verdicts").insertOne({date: new Date(), format: "cours", verdict: "v", status: "active"});
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
    registerReadTools(mcp, {isAdmin, getDb: async () => client.db(DB_NAME)});
    return handlers;
}

async function text(h: Map<string, Handler>, tool: string, args: Record<string, unknown> = {}): Promise<string> {
    return (await h.get(tool)!(args)).content.map((c) => c.text).join("\n");
}

// Appels qui tentent d'atteindre chaque contenu caché, outil par outil.
const PROBES: Array<[string, Record<string, unknown>]> = [
    ["list_modules", {}],
    ["list_sections", {module: "js"}],
    ["list_sections", {module: "hidden"}],
    ["get_module", {module: "js"}],
    ["get_section", {module: "js", section: "s1"}],
    ["get_content", {module: "js", section: "s1", type: "cours"}],
    ["get_content", {module: "js", section: "s2", type: "cours"}],
    ["get_content", {module: "hidden", section: "h1", type: "cours"}],
    ["search_content", {query: "commun"}],
    ["search_content", {query: "commun", module: "hidden"}],
    ["export_content_compact", {module: "js"}],
    ["export_content_compact", {module: "js", section: "s2"}],
    ["list_resources", {}],
    ["list_resources", {onlyVisible: false}],
];

describe("outils MCP de lecture", () => {
    test("enregistre exactement les outils déclarés", () => {
        expect([...setup(false).keys()].sort()).toEqual([...READ_TOOL_NAMES].sort());
    });

    test("un non-admin ne voit aucun contenu caché, quel que soit l'outil", async () => {
        const h = setup(false);
        for (const [tool, args] of PROBES) {
            const out = await text(h, tool, args);
            for (const secret of SECRETS) {
                expect({tool, args, leak: out.includes(secret)}).toEqual({tool, args, leak: false});
            }
        }
    });

    test("un non-admin lit toujours le contenu publié", async () => {
        const h = setup(false);
        expect(await text(h, "get_content", {module: "js", section: "s1", type: "cours"})).toContain("public commun");
        expect(await text(h, "export_content_compact", {module: "js"})).toContain("public commun");
        const search = JSON.parse(await text(h, "search_content", {query: "commun"}));
        expect(search.total).toBe(1);
        expect(search.note).toContain("dans 1 contenu(s)");
        const mod = JSON.parse(await text(h, "get_module", {module: "js"}));
        expect(mod.sectionSlugs).toEqual(["s1"]);
        expect(mod.sectionCount).toBe(1);
        const section = JSON.parse(await text(h, "get_section", {module: "js", section: "s1"}));
        expect(section.contents.map((c: {type: string}) => c.type)).toEqual(["cours"]);
    });

    test("un non-admin est refusé sur l'examen et les outils de conception", async () => {
        const h = setup(false);
        await expect(h.get("get_content")!({module: "js", section: "s1", type: "examen"})).rejects.toThrow("Forbidden");
        await expect(h.get("search_content")!({query: "commun", type: "examen"})).rejects.toThrow("Forbidden");
        await expect(h.get("export_content_compact")!({module: "js", type: "examen"})).rejects.toThrow("Forbidden");
        for (const tool of ["get_migration_status", "list_verdicts", "list_exemplars", "get_pedagogical_skill_manifest"]) {
            await expect(h.get(tool)!({})).rejects.toThrow("Forbidden");
        }
        await expect(h.get("get_pedagogical_skill_document")!({id: "content-writer"})).rejects.toThrow("Forbidden");
    });

    test("un module masqué ou une section non publiée répond comme un slug inexistant", async () => {
        const h = setup(false);
        await expect(h.get("get_module")!({module: "hidden"})).rejects.toThrow('Module "hidden" introuvable.');
        await expect(h.get("get_section")!({module: "js", section: "s2"})).rejects.toThrow('Section "s2" introuvable');
        await expect(h.get("export_content_compact")!({module: "hidden"})).rejects.toThrow("introuvable");
        expect(await text(h, "list_sections", {module: "hidden"})).toBe('Module "hidden" introuvable.');
        expect(await text(h, "get_content", {module: "js", section: "s2", type: "cours"}))
            .toBe(await text(h, "get_content", {module: "js", section: "nope", type: "cours"}));
    });

    test("un admin voit tout, comme avant", async () => {
        const h = setup(true);
        const seen = (await Promise.all(PROBES.map(([tool, args]) => text(h, tool, args).catch(() => "")))).join("\n")
            + await text(h, "get_content", {module: "js", section: "s1", type: "examen"});
        for (const secret of SECRETS) expect(seen).toContain(secret);
        expect(JSON.parse(await text(h, "search_content", {query: "commun"})).total).toBe(4);
        expect(JSON.parse(await text(h, "list_verdicts")).length).toBe(1);
        expect(await text(h, "get_pedagogical_skill_document", {id: "content-writer"})).not.toBe("");
    });
});
