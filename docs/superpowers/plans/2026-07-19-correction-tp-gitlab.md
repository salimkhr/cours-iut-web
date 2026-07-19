# Correction de TP poussée sur GitLab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publier la correction d'un TP sur la forge GitLab (`correction/{module}/{section}`) via un outil MCP `push_correction`, intégré comme étape du skill content-writer.

**Architecture:** Un wrapper API GitLab (`src/lib/gitlab.ts`, fetch pur, aucun binaire git) + un outil MCP enregistré dans `src/app/api/mcp/route.ts` qui vérifie la section en Mongo, garantit sous-groupe/projet GitLab, pousse un commit unique synchronisant l'arborescence, puis passe `hasCorrection: true`. Le skill `skills/content-writer/main.md` gagne une étape 7 « Correction ».

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, MongoDB driver, `@modelcontextprotocol/sdk`, zod, bun test (mongodb-memory-server + `mock.module`).

**Spec:** `docs/superpowers/specs/2026-07-19-correction-tp-gitlab-design.md`

**Conventions à respecter (rappel CLAUDE.md):** indentation 4 espaces, imports alias `@/*`, pas d'`any`, jamais de secret `NEXT_PUBLIC_`. Les content types Mongo sont `"cours" | "TP" | "examen" | "slide"` (`TP` en majuscules).

---

### Task 1: `src/lib/gitlab.ts` — config et helpers d'appel

**Files:**
- Create: `src/lib/gitlab.ts`
- Test: `src/lib/gitlab.test.ts` (colocalisé, comme `src/lib/schemas/section.schema.test.ts`)

- [ ] **Step 1: Écrire les tests (config) — ils doivent échouer**

```typescript
// src/lib/gitlab.test.ts
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getGitlabConfig } from "./gitlab";

const savedEnv = { gitUrl: process.env.NEXT_PUBLIC_GIT_URL, token: process.env.GITLAB_CORRECTION_TOKEN };

beforeEach(() => {
    process.env.NEXT_PUBLIC_GIT_URL = "https://git.example.dev/correction";
    process.env.GITLAB_CORRECTION_TOKEN = "glpat-test";
});

afterEach(() => {
    process.env.NEXT_PUBLIC_GIT_URL = savedEnv.gitUrl;
    process.env.GITLAB_CORRECTION_TOKEN = savedEnv.token;
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `bun test src/lib/gitlab.test.ts`
Expected: FAIL — `Cannot find module './gitlab'` (ou équivalent).

- [ ] **Step 3: Implémenter config + plomberie fetch**

```typescript
// src/lib/gitlab.ts
// Client minimal de l'API REST GitLab pour publier les corrections de TP.
// Serveur uniquement (token secret) — jamais importé depuis un Client Component.

export interface GitlabConfig {
    baseUrl: string;        // ex: https://git.salimkhraimeche.dev
    rootGroupPath: string;  // ex: correction
    token: string;
}

export interface CorrectionFile {
    path: string;
    content: string;
}

export function getGitlabConfig(): GitlabConfig {
    const gitUrl = process.env.NEXT_PUBLIC_GIT_URL;
    if (!gitUrl) throw new Error("NEXT_PUBLIC_GIT_URL non configuré.");
    const token = process.env.GITLAB_CORRECTION_TOKEN;
    if (!token) {
        throw new Error("GITLAB_CORRECTION_TOKEN non configuré : impossible de publier une correction.");
    }
    const url = new URL(gitUrl);
    const rootGroupPath = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!rootGroupPath) {
        throw new Error(`NEXT_PUBLIC_GIT_URL (${gitUrl}) doit inclure le chemin du groupe racine (ex: /correction).`);
    }
    return { baseUrl: url.origin, rootGroupPath, token };
}

async function gitlabFetch(cfg: GitlabConfig, path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${cfg.baseUrl}/api/v4${path}`, {
        ...init,
        headers: {
            "PRIVATE-TOKEN": cfg.token,
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });
}

async function gitlabError(res: Response, action: string): Promise<Error> {
    const body = await res.text().catch(() => "");
    return new Error(`GitLab — ${action} : HTTP ${res.status}${body ? ` — ${body.slice(0, 300)}` : ""}`);
}
```

(`gitlabFetch` et `gitlabError` restent non exportés ; ils servent aux tasks 2 et 3.)

- [ ] **Step 4: Vérifier le succès**

Run: `bun test src/lib/gitlab.test.ts`
Expected: PASS (3 tests). Un warning TS « unused » sur `gitlabFetch`/`gitlabError` est acceptable jusqu'à la task 2.

- [ ] **Step 5: Commit**

```bash
git add src/lib/gitlab.ts src/lib/gitlab.test.ts
git commit -m "feat(gitlab): config du client API corrections"
```

---

### Task 2: `ensureGroup` / `ensureProject` (idempotents)

**Files:**
- Modify: `src/lib/gitlab.ts`
- Test: `src/lib/gitlab.test.ts`

- [ ] **Step 1: Ajouter le harness de mock fetch + tests — échec attendu**

Ajouter en tête de `src/lib/gitlab.test.ts` (après les imports existants) :

```typescript
import { ensureGroup, ensureProject, commitFiles, type GitlabConfig } from "./gitlab";

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
```

Dans le `beforeEach` existant, appeler `installFetchMock();` en dernière ligne.
Dans le `afterEach` existant, ajouter `globalThis.fetch = realFetch;`.

Puis les tests :

```typescript
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `bun test src/lib/gitlab.test.ts`
Expected: FAIL — `ensureGroup is not exported` (ou équivalent).

- [ ] **Step 3: Implémenter**

Ajouter à `src/lib/gitlab.ts` :

```typescript
async function findGroupId(cfg: GitlabConfig, fullPath: string): Promise<number | null> {
    const res = await gitlabFetch(cfg, `/groups/${encodeURIComponent(fullPath)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw await gitlabError(res, `lecture du groupe ${fullPath}`);
    const group = await res.json() as { id: number };
    return group.id;
}

/** Garantit l'existence du sous-groupe `parentPath/name` (création publique sinon). */
export async function ensureGroup(cfg: GitlabConfig, parentPath: string, name: string): Promise<number> {
    const existing = await findGroupId(cfg, `${parentPath}/${name}`);
    if (existing !== null) return existing;

    const parentId = await findGroupId(cfg, parentPath);
    if (parentId === null) {
        throw new Error(`GitLab — groupe racine "${parentPath}" introuvable : créez-le à la main sur la forge.`);
    }
    const res = await gitlabFetch(cfg, "/groups", {
        method: "POST",
        body: JSON.stringify({ name, path: name, parent_id: parentId, visibility: "public" }),
    });
    if (!res.ok) throw await gitlabError(res, `création du sous-groupe ${parentPath}/${name}`);
    const group = await res.json() as { id: number };
    return group.id;
}

/** Garantit l'existence du projet `namespacePath/slug` (création publique sinon). */
export async function ensureProject(
    cfg: GitlabConfig, namespaceId: number, namespacePath: string, slug: string
): Promise<{ id: number; webUrl: string }> {
    const res = await gitlabFetch(cfg, `/projects/${encodeURIComponent(`${namespacePath}/${slug}`)}`);
    if (res.ok) {
        const p = await res.json() as { id: number; web_url: string };
        return { id: p.id, webUrl: p.web_url };
    }
    if (res.status !== 404) throw await gitlabError(res, `lecture du projet ${namespacePath}/${slug}`);

    const created = await gitlabFetch(cfg, "/projects", {
        method: "POST",
        body: JSON.stringify({
            name: slug, path: slug, namespace_id: namespaceId,
            visibility: "public", default_branch: "main",
        }),
    });
    if (!created.ok) throw await gitlabError(created, `création du projet ${namespacePath}/${slug}`);
    const p = await created.json() as { id: number; web_url: string };
    return { id: p.id, webUrl: p.web_url };
}
```

Note : `commitFiles` est importé par le test mais implémenté en task 3 — si TS bloque la compilation du test, exporter un stub `export async function commitFiles(): Promise<string> { throw new Error("not implemented"); }` est interdit ; à la place, retirer `commitFiles` de l'import du test jusqu'à la task 3.

- [ ] **Step 4: Vérifier le succès**

Run: `bun test src/lib/gitlab.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gitlab.ts src/lib/gitlab.test.ts
git commit -m "feat(gitlab): ensureGroup/ensureProject idempotents"
```

---

### Task 3: `commitFiles` — un commit qui synchronise l'arborescence

**Files:**
- Modify: `src/lib/gitlab.ts`
- Test: `src/lib/gitlab.test.ts`

- [ ] **Step 1: Tests — échec attendu**

Ajouter `commitFiles` à l'import du test, puis :

```typescript
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `bun test src/lib/gitlab.test.ts`
Expected: FAIL — `commitFiles` non exporté.

- [ ] **Step 3: Implémenter**

Ajouter à `src/lib/gitlab.ts` :

```typescript
/** Chemins des blobs du repo (branche par défaut), toutes pages. Repo vide → []. */
async function listRepoFiles(cfg: GitlabConfig, projectId: number): Promise<string[]> {
    const paths: string[] = [];
    let page = "1";
    while (page) {
        const res = await gitlabFetch(cfg,
            `/projects/${projectId}/repository/tree?recursive=true&per_page=100&page=${page}`);
        if (res.status === 404) return []; // repo sans aucun commit
        if (!res.ok) throw await gitlabError(res, "lecture de l'arborescence");
        const items = await res.json() as Array<{ type: string; path: string }>;
        paths.push(...items.filter((i) => i.type === "blob").map((i) => i.path));
        page = res.headers.get("x-next-page") ?? "";
    }
    return paths;
}

/** Un commit sur main après lequel le repo reflète exactement `files`
 *  (create/update/delete). Renvoie le SHA du commit. */
export async function commitFiles(
    cfg: GitlabConfig, projectId: number, files: CorrectionFile[], message: string
): Promise<string> {
    const existing = new Set(await listRepoFiles(cfg, projectId));
    const payload = new Set(files.map((f) => f.path));

    const actions = [
        ...files.map((f) => ({
            action: existing.has(f.path) ? "update" as const : "create" as const,
            file_path: f.path,
            content: f.content,
        })),
        ...[...existing].filter((p) => !payload.has(p))
            .map((p) => ({ action: "delete" as const, file_path: p })),
    ];

    const res = await gitlabFetch(cfg, `/projects/${projectId}/repository/commits`, {
        method: "POST",
        body: JSON.stringify({ branch: "main", commit_message: message, actions }),
    });
    if (!res.ok) throw await gitlabError(res, "création du commit");
    const commit = await res.json() as { id: string };
    return commit.id;
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `bun test src/lib/gitlab.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gitlab.ts src/lib/gitlab.test.ts
git commit -m "feat(gitlab): commitFiles synchronise l'arborescence en un commit"
```

---

### Task 4: Outil MCP `push_correction`

**Files:**
- Modify: `src/app/api/mcp/route.ts` (imports en tête + nouvel outil après le bloc `edit_section`, ~ligne 573)
- Test: `tests/mcp/push-correction.test.ts`

- [ ] **Step 1: Test du contrat — échec attendu**

```typescript
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
```

- [ ] **Step 2: Vérifier l'échec**

Run: `bun test tests/mcp/push-correction.test.ts`
Expected: FAIL — outil `push_correction` inconnu (erreur MCP "Unknown tool" ou équivalent).

- [ ] **Step 3: Enregistrer l'outil**

Dans `src/app/api/mcp/route.ts`, ajouter l'import en tête (près des imports `@/lib`) :

```typescript
import { getGitlabConfig, ensureGroup, ensureProject, commitFiles } from "@/lib/gitlab";
```

Puis, juste après le bloc `edit_section` (avant `// ── list_modules`), enregistrer :

```typescript
    // ── push_correction ───────────────────────────────────────────────────────
    server.tool(
        "push_correction",
        "Publie la correction d'un TP sur la forge GitLab (projet public correction/{module}/{section}), en un seul commit qui synchronise l'arborescence (create/update/delete). Passe hasCorrection à true ; correctionIsAvailable reste inchangé. Fichiers texte uniquement. Réservé aux admins.",
        {
            module:  z.string().describe("Slug du module"),
            section: z.string().describe("Slug de la section"),
            files:   z.array(z.object({
                path:    z.string().min(1).describe("Chemin relatif dans le repo, ex: exercice-1/index.html"),
                content: z.string().describe("Contenu texte UTF-8 du fichier"),
            })).min(1).describe("Arborescence complète de la correction (l'existant non listé est supprimé)"),
            commitMessage: z.string().optional().describe("Défaut : correction: {module}/{section}"),
        },
        async ({ module, section, files, commitMessage }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();

            const mod = await db.collection<Module>("modules").findOne({ path: module });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);
            const sections = mod.sections ?? [];
            const idx = sections.findIndex((s) => s.path === section);
            if (idx === -1) throw new Error(`Section "${section}" introuvable.`);

            const types = (sections[idx].contents ?? []).map((c) => c.type);
            if (!types.includes("TP") && !types.includes("examen")) {
                throw new Error(`La section "${section}" n'a ni TP ni examen : rien à corriger.`);
            }

            const cfg = getGitlabConfig();
            const groupId = await ensureGroup(cfg, cfg.rootGroupPath, module);
            const project = await ensureProject(cfg, groupId, `${cfg.rootGroupPath}/${module}`, section);
            const sha = await commitFiles(cfg, project.id, files, commitMessage ?? `correction: ${module}/${section}`);

            await db.collection<Module>("modules").updateOne(
                { path: module },
                { $set: { [`sections.${idx}.hasCorrection`]: true } }
            );

            return {
                content: [{
                    type: "text" as const,
                    text: `Correction publiée : ${project.webUrl} (commit ${sha.slice(0, 8)}, ${files.length} fichier(s)). hasCorrection=true ; correctionIsAvailable reste à activer dans l'admin.`,
                }],
            };
        }
    );
```

- [ ] **Step 4: Vérifier le succès + non-régression**

Run: `bun test tests/mcp/push-correction.test.ts`
Expected: PASS (5 tests).
Run: `bun test`
Expected: PASS — toute la suite (aucune régression sur les autres tests MCP).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/mcp/route.ts tests/mcp/push-correction.test.ts
git commit -m "feat(mcp): outil push_correction (publication GitLab + hasCorrection)"
```

---

### Task 5: Étape « Correction » du skill content-writer

**Files:**
- Modify: `skills/content-writer/main.md`
- Regenerate: `src/lib/skills/pedagogy.ts` (via `bun run generate-skill` — jamais à la main)
- Test: `tests/mcp/skill-exposure.test.ts` (existant, doit rester vert)

- [ ] **Step 1: Éditer le skill**

Dans `skills/content-writer/main.md` :

1. Remplacer le titre `## Workflow (7 étapes)` par `## Workflow (8 étapes)`.
2. Renommer `### 7. Clôture` en `### 8. Clôture`.
3. Insérer entre l'étape 6 (Relecture navigateur) et la Clôture :

```markdown
### 7. Correction (TP uniquement)
Après le OK de relecture d'un TP, rédigez la correction et publiez-la via
`push_correction` (projet GitLab public `correction/{module}/{section}`) :

- un dossier par exercice (slug du titre de l'exercice), un dossier `fil-rouge/`
  avec l'état final du projet, un `README.md` sobre à la racine (titre de la
  section, rappel du sujet) ;
- les noms de fichiers reprennent EXACTEMENT ceux du contrat de consigne ;
- le code produit le résultat observable annoncé dans chaque exercice — une
  correction qui ne tourne pas est un bug bloquant ;
- fichiers texte uniquement ; un asset binaire nécessaire → signalez-le au lieu
  de bricoler.

L'outil passe `hasCorrection` à true ; rappelez en chat que
`correctionIsAvailable` reste à activer dans l'admin. EXAMEN : jamais de
correction en workflow standard (repo public = fuite avant l'épreuve) ;
uniquement sur demande explicite de l'utilisateur.
```

4. Dans « Cas particulier — l'examen », ajouter en fin de paragraphe :
   `La correction d'un examen n'est jamais publiée en workflow standard (voir étape 7).`

- [ ] **Step 2: Régénérer le module compilé**

Run: `bun run generate-skill`
Expected: `Généré : src\lib\skills\pedagogy.ts (hash <nouveau>)`

- [ ] **Step 3: Vérifier les tests d'exposition**

Run: `bun test tests/mcp/skill-exposure.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 4: Commit**

```bash
git add skills/content-writer/main.md src/lib/skills/pedagogy.ts
git commit -m "feat(skill): etape 7 Correction (publication GitLab) dans content-writer"
```

---

### Task 6: Documentation env + vérification finale

**Files:**
- Modify: `CLAUDE.md` (tableau des variables d'environnement, section 7)

- [ ] **Step 1: Documenter la variable**

Dans le tableau de la section 7 de `CLAUDE.md`, ajouter la ligne (avant `BETTER_AUTH_SECRET`) :

```markdown
| `GITLAB_CORRECTION_TOKEN`      | PAT GitLab (scope `api`) — publication des corrections    | `src/lib/gitlab.ts`             |
```

- [ ] **Step 2: Suite complète + lint**

Run: `bun test`
Expected: PASS — suite entière.
Run: `bun run lint`
Expected: 0 erreur.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: variable GITLAB_CORRECTION_TOKEN"
```

- [ ] **Step 4: Action utilisateur (hors code)**

Demander à l'utilisateur d'ajouter `GITLAB_CORRECTION_TOKEN=<PAT scope api>` dans
`.env.local` du serveur staging (et de vérifier que le groupe racine `correction`
existe sur la forge). Sans ce token, l'outil échoue avec un message explicite —
comportement voulu.
