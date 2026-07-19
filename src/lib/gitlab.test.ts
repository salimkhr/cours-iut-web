import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getGitlabConfig, ensureGroup, ensureProject, commitFiles, type GitlabConfig } from "./gitlab";

const savedEnv = { gitUrl: process.env.NEXT_PUBLIC_GIT_URL, token: process.env.GITLAB_CORRECTION_TOKEN };

const cfg: GitlabConfig = { baseUrl: "https://git.example.dev", rootGroupPath: "correction", token: "glpat-test" };

interface Route {
    match: (url: string, method: string) => boolean;
    respond: (url: string, body: unknown) => Response;
}

const realFetch = globalThis.fetch;
let routes: Route[];
let calls: Array<{ url: string; method: string; body?: unknown }>;

function json(status: number, body: unknown, headers?: Record<string, string>): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });
}

function installFetchMock(): void {
    routes = [];
    calls = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
        const url = input.toString();
        const method = init?.method ?? "GET";
        const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
        calls.push({ url, method, body });
        const route = routes.find((r) => r.match(url, method));
        return route ? route.respond(url, body) : json(404, { message: "404 Not Found" });
    }) as typeof fetch;
}

beforeEach(() => {
    process.env.NEXT_PUBLIC_GIT_URL = "https://git.example.dev/correction";
    process.env.GITLAB_CORRECTION_TOKEN = "glpat-test";
    installFetchMock();
});

afterEach(() => {
    process.env.NEXT_PUBLIC_GIT_URL = savedEnv.gitUrl;
    process.env.GITLAB_CORRECTION_TOKEN = savedEnv.token;
    globalThis.fetch = realFetch;
});

describe("getGitlabConfig", () => {
    test("dérive base et groupe racine de NEXT_PUBLIC_GIT_URL", () => {
        const cfg = getGitlabConfig();
        expect(cfg.baseUrl).toBe("https://git.example.dev");
        expect(cfg.rootGroupPath).toBe("correction");
        expect(cfg.token).toBe("glpat-test");
    });

    test("échoue explicitement si le token manque", () => {
        delete process.env.GITLAB_CORRECTION_TOKEN;
        expect(() => getGitlabConfig()).toThrow(/GITLAB_CORRECTION_TOKEN/);
    });

    test("échoue si l'URL ne contient pas de chemin de groupe", () => {
        process.env.NEXT_PUBLIC_GIT_URL = "https://git.example.dev";
        expect(() => getGitlabConfig()).toThrow(/groupe racine/);
    });
});

describe("ensureGroup", () => {
    test("groupe existant : renvoie son id sans POST", async () => {
        routes.push({
            match: (u, m) => m === "GET" && u.includes("/groups/correction%2Fphp"),
            respond: () => json(200, { id: 12 }),
        });
        expect(await ensureGroup(cfg, "correction", "php")).toBe(12);
        expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
    });

    test("groupe absent : créé public sous le parent", async () => {
        routes.push({
            match: (u, m) => m === "GET" && u.endsWith("/groups/correction"),
            respond: () => json(200, { id: 1 }),
        });
        routes.push({
            match: (u, m) => m === "POST" && u.endsWith("/groups"),
            respond: () => json(201, { id: 13 }),
        });
        expect(await ensureGroup(cfg, "correction", "php")).toBe(13);
        const post = calls.find((c) => c.method === "POST")!;
        expect(post.body).toEqual({ name: "php", path: "php", parent_id: 1, visibility: "public" });
    });

    test("groupe racine absent : erreur explicite, pas de création sauvage", async () => {
        await expect(ensureGroup(cfg, "correction", "php")).rejects.toThrow(/groupe racine "correction" introuvable/);
    });
});

describe("ensureProject", () => {
    test("projet existant : renvoie id et webUrl", async () => {
        routes.push({
            match: (u, m) => m === "GET" && u.includes("/projects/correction%2Fphp%2F1-decouverte"),
            respond: () => json(200, { id: 7, web_url: "https://git.example.dev/correction/php/1-decouverte" }),
        });
        const p = await ensureProject(cfg, 13, "correction/php", "1-decouverte");
        expect(p).toEqual({ id: 7, webUrl: "https://git.example.dev/correction/php/1-decouverte" });
    });

    test("projet absent : créé public dans le namespace", async () => {
        routes.push({
            match: (u, m) => m === "POST" && u.endsWith("/projects"),
            respond: () => json(201, { id: 8, web_url: "https://git.example.dev/correction/php/1-decouverte" }),
        });
        const p = await ensureProject(cfg, 13, "correction/php", "1-decouverte");
        expect(p.id).toBe(8);
        const post = calls.find((c) => c.method === "POST")!;
        expect(post.body).toEqual({
            name: "1-decouverte", path: "1-decouverte", namespace_id: 13,
            visibility: "public", default_branch: "main",
        });
    });
});

describe("commitFiles", () => {
    const treeUrl = (u: string) => u.includes("/projects/7/repository/tree");
    const commitUrl = (u: string) => u.includes("/projects/7/repository/commits");

    test("repo vide (tree 404) : tout en create, renvoie le SHA", async () => {
        routes.push({
            match: (u, m) => m === "POST" && commitUrl(u),
            respond: () => json(201, { id: "abc1234def5678" }),
        });
        const sha = await commitFiles(cfg, 7, [
            { path: "README.md", content: "# Correction" },
            { path: "exercice-1/index.html", content: "<!doctype html>" },
        ], "correction: php/1-decouverte");
        expect(sha).toBe("abc1234def5678");
        const post = calls.find((c) => c.method === "POST")!;
        expect(post.body).toEqual({
            branch: "main",
            commit_message: "correction: php/1-decouverte",
            actions: [
                { action: "create", file_path: "README.md", content: "# Correction" },
                { action: "create", file_path: "exercice-1/index.html", content: "<!doctype html>" },
            ],
        });
    });

    test("repo existant : update des présents, delete des orphelins", async () => {
        routes.push({
            match: (u, m) => m === "GET" && treeUrl(u),
            respond: () => json(200, [
                { type: "blob", path: "README.md" },
                { type: "blob", path: "obsolete/vieux.js" },
                { type: "tree", path: "obsolete" },
            ]),
        });
        routes.push({
            match: (u, m) => m === "POST" && commitUrl(u),
            respond: () => json(201, { id: "def5678" }),
        });
        await commitFiles(cfg, 7, [{ path: "README.md", content: "v2" }], "maj");
        const post = calls.find((c) => c.method === "POST")!;
        expect(post.body).toEqual({
            branch: "main",
            commit_message: "maj",
            actions: [
                { action: "update", file_path: "README.md", content: "v2" },
                { action: "delete", file_path: "obsolete/vieux.js" },
            ],
        });
    });

    test("pagination de l'arborescence via x-next-page", async () => {
        routes.push({
            match: (u, m) => m === "GET" && treeUrl(u) && u.includes("page=1"),
            respond: () => json(200, [{ type: "blob", path: "a.txt" }], { "x-next-page": "2" }),
        });
        routes.push({
            match: (u, m) => m === "GET" && treeUrl(u) && u.includes("page=2"),
            respond: () => json(200, [{ type: "blob", path: "b.txt" }], { "x-next-page": "" }),
        });
        routes.push({
            match: (u, m) => m === "POST" && commitUrl(u),
            respond: () => json(201, { id: "sha3" }),
        });
        await commitFiles(cfg, 7, [{ path: "a.txt", content: "x" }], "maj");
        const post = calls.find((c) => c.method === "POST")!;
        const actions = (post.body as { actions: Array<{ action: string; file_path: string }> }).actions;
        expect(actions).toContainEqual({ action: "delete", file_path: "b.txt" });
    });

    test("erreur API commit : propagée avec statut", async () => {
        routes.push({
            match: (u, m) => m === "POST" && commitUrl(u),
            respond: () => json(400, { message: "A file with this name doesn't exist" }),
        });
        await expect(commitFiles(cfg, 7, [{ path: "x", content: "y" }], "m")).rejects.toThrow(/HTTP 400/);
    });
});
