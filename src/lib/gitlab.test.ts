import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import type { GitlabConfig } from "./gitlab";

const savedEnv = {
    gitUrl: process.env.NEXT_PUBLIC_GIT_URL,
    correctionUrl: process.env.GITLAB_CORRECTION_URL,
    token: process.env.GITLAB_CORRECTION_TOKEN,
    projetUrl: process.env.GITLAB_PROJET_URL,
    projetToken: process.env.GITLAB_PROJET_TOKEN,
};

const cfg: GitlabConfig = { baseUrl: "https://git.example.dev", rootGroupPath: "correction", token: "glpat-test" };

interface Route {
    match: (url: string, method: string) => boolean;
    respond: (url: string, body: unknown) => Response;
}

let routes: Route[] = [];
let calls: Array<{ url: string; method: string; body?: unknown }> = [];

function json(status: number, body: unknown, headers?: Record<string, string>): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });
}

// gitlab.ts appelle `node:https` `request(url, options, callback)` — on mocke ce module
// AVANT le premier import de "./gitlab" (Bun ne rejoue pas mock.module rétroactivement),
// d'où l'import dynamique de "./gitlab" plus bas.
function fakeRequest(url: URL, options: { method?: string }, callback: (res: unknown) => void) {
    const method = options.method ?? "GET";
    const chunks: Buffer[] = [];
    return {
        on() { return this; },
        write(chunk: string) { chunks.push(Buffer.from(chunk)); },
        end() {
            const bodyStr = Buffer.concat(chunks).toString("utf-8");
            const body = bodyStr ? JSON.parse(bodyStr) : undefined;
            calls.push({ url: url.toString(), method, body });
            const route = routes.find((r) => r.match(url.toString(), method));
            const response = route ? route.respond(url.toString(), body) : json(404, { message: "404 Not Found" });
            void response.text().then((text) => {
                const handlers: Record<string, (...a: unknown[]) => void> = {};
                const res = {
                    statusCode: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    on(event: string, handler: (...a: unknown[]) => void) {
                        handlers[event] = handler;
                        return res;
                    },
                };
                callback(res);
                handlers.data?.(Buffer.from(text));
                handlers.end?.();
            });
        },
    };
}

// Étend (plutôt que remplace) les modules réels : `mock.module` s'applique à tout le
// process de test, pas seulement ce fichier — écraser tout node:http/https casserait
// les autres fichiers qui l'importent (ex: `import http from "node:http"`).
const realHttp = await import("node:http");
const realHttps = await import("node:https");
mock.module("node:https", () => ({ ...realHttps, request: fakeRequest }));
mock.module("node:http", () => ({ ...realHttp, request: fakeRequest }));

const {
    getGitlabConfig, getCorrectionBaseUrl, ensureGroup, ensureProject, commitFiles,
    getPrivateProjectConfig, ensurePrivateProject,
} = await import("./gitlab");

beforeEach(() => {
    delete process.env.GITLAB_CORRECTION_URL;
    process.env.NEXT_PUBLIC_GIT_URL = "https://git.example.dev/correction";
    process.env.GITLAB_CORRECTION_TOKEN = "glpat-test";
    routes = [];
    calls = [];
});

afterEach(() => {
    process.env.NEXT_PUBLIC_GIT_URL = savedEnv.gitUrl;
    if (savedEnv.correctionUrl === undefined) delete process.env.GITLAB_CORRECTION_URL;
    else process.env.GITLAB_CORRECTION_URL = savedEnv.correctionUrl;
    process.env.GITLAB_CORRECTION_TOKEN = savedEnv.token;
    if (savedEnv.projetUrl === undefined) delete process.env.GITLAB_PROJET_URL;
    else process.env.GITLAB_PROJET_URL = savedEnv.projetUrl;
    if (savedEnv.projetToken === undefined) delete process.env.GITLAB_PROJET_TOKEN;
    else process.env.GITLAB_PROJET_TOKEN = savedEnv.projetToken;
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

    test("GITLAB_CORRECTION_URL (runtime) prend le pas sur NEXT_PUBLIC_GIT_URL", () => {
        process.env.GITLAB_CORRECTION_URL = "https://git.example.dev/correction";
        process.env.NEXT_PUBLIC_GIT_URL = "https://git.example.dev/iut3334332";
        const cfg = getGitlabConfig();
        expect(cfg.baseUrl).toBe("https://git.example.dev");
        expect(cfg.rootGroupPath).toBe("correction");
    });

    test("fonctionne avec GITLAB_CORRECTION_URL seul, sans NEXT_PUBLIC_GIT_URL", () => {
        delete process.env.NEXT_PUBLIC_GIT_URL;
        process.env.GITLAB_CORRECTION_URL = "https://git.example.dev/correction";
        expect(getGitlabConfig().rootGroupPath).toBe("correction");
    });

    test("échoue si aucune URL de correction n'est configurée", () => {
        delete process.env.NEXT_PUBLIC_GIT_URL;
        delete process.env.GITLAB_CORRECTION_URL;
        expect(() => getGitlabConfig()).toThrow(/GITLAB_CORRECTION_URL/);
    });
});

describe("getPrivateProjectConfig", () => {
    beforeEach(() => {
        process.env.GITLAB_PROJET_URL = "https://git.example.dev/projet";
        process.env.GITLAB_PROJET_TOKEN = "glpat-projet-test";
    });

    test("dérive base et groupe racine de GITLAB_PROJET_URL", () => {
        const cfg = getPrivateProjectConfig();
        expect(cfg.baseUrl).toBe("https://git.example.dev");
        expect(cfg.rootGroupPath).toBe("projet");
        expect(cfg.token).toBe("glpat-projet-test");
    });

    test("échoue explicitement si GITLAB_PROJET_URL manque", () => {
        delete process.env.GITLAB_PROJET_URL;
        expect(() => getPrivateProjectConfig()).toThrow(/GITLAB_PROJET_URL/);
    });

    test("échoue explicitement si GITLAB_PROJET_TOKEN manque", () => {
        delete process.env.GITLAB_PROJET_TOKEN;
        expect(() => getPrivateProjectConfig()).toThrow(/GITLAB_PROJET_TOKEN/);
    });

    test("échoue si l'URL ne contient pas de chemin de groupe", () => {
        process.env.GITLAB_PROJET_URL = "https://git.example.dev";
        expect(() => getPrivateProjectConfig()).toThrow(/groupe racine/);
    });
});

describe("ensurePrivateProject", () => {
    const privateCfg = { baseUrl: "https://git.example.dev", rootGroupPath: "projet", token: "glpat-test" };

    test("projet existant : renvoie id et webUrl sans POST ni lookup de groupe", async () => {
        routes.push({
            match: (u, m) => m === "GET" && u.includes("/projects/projet%2Fdoc-interne"),
            respond: () => json(200, { id: 21, web_url: "https://git.example.dev/projet/doc-interne" }),
        });
        const p = await ensurePrivateProject(privateCfg, "doc-interne");
        expect(p).toEqual({ id: 21, webUrl: "https://git.example.dev/projet/doc-interne" });
        expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
    });

    test("projet absent : créé privé sous le groupe racine", async () => {
        routes.push({
            match: (u, m) => m === "GET" && u.endsWith("/groups/projet"),
            respond: () => json(200, { id: 9 }),
        });
        routes.push({
            match: (u, m) => m === "POST" && u.endsWith("/projects"),
            respond: () => json(201, { id: 22, web_url: "https://git.example.dev/projet/doc-interne" }),
        });
        const p = await ensurePrivateProject(privateCfg, "doc-interne");
        expect(p.id).toBe(22);
        const post = calls.find((c) => c.method === "POST")!;
        expect(post.body).toEqual({
            name: "doc-interne", path: "doc-interne", namespace_id: 9,
            visibility: "private", default_branch: "main",
        });
    });

    test("groupe racine absent : erreur explicite, pas de création sauvage", async () => {
        await expect(ensurePrivateProject(privateCfg, "doc-interne")).rejects.toThrow(/groupe racine "projet" introuvable/);
    });
});

describe("getCorrectionBaseUrl", () => {
    test("renvoie GITLAB_CORRECTION_URL en priorité (runtime)", () => {
        process.env.GITLAB_CORRECTION_URL = "https://git.example.dev/correction";
        process.env.NEXT_PUBLIC_GIT_URL = "https://gitlab.com/iut3334332";
        expect(getCorrectionBaseUrl()).toBe("https://git.example.dev/correction");
    });

    test("repli sur NEXT_PUBLIC_GIT_URL", () => {
        delete process.env.GITLAB_CORRECTION_URL;
        process.env.NEXT_PUBLIC_GIT_URL = "https://gitlab.com/iut3334332";
        expect(getCorrectionBaseUrl()).toBe("https://gitlab.com/iut3334332");
    });

    test("retire le(s) slash final(aux) pour éviter le double slash", () => {
        process.env.GITLAB_CORRECTION_URL = "https://git.example.dev/correction//";
        expect(getCorrectionBaseUrl()).toBe("https://git.example.dev/correction");
    });

    test("renvoie null si aucune URL n'est configurée", () => {
        delete process.env.NEXT_PUBLIC_GIT_URL;
        delete process.env.GITLAB_CORRECTION_URL;
        expect(getCorrectionBaseUrl()).toBeNull();
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
            match: (u, m) => m === "GET" && treeUrl(u) && u.includes("&page=1"),
            respond: () => json(200, [{ type: "blob", path: "a.txt" }], { "x-next-page": "2" }),
        });
        routes.push({
            match: (u, m) => m === "GET" && treeUrl(u) && u.includes("&page=2"),
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
