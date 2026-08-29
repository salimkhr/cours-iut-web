// Client minimal de l'API REST GitLab pour publier les corrections de TP.
// Serveur uniquement (token secret) — jamais importé depuis un Client Component.

import {request as httpRequest} from "node:http";
import {request as httpsRequest} from "node:https";

export interface GitlabConfig {
    baseUrl: string;         // ex: https://git.salimkhraimeche.dev
    rootGroupPath?: string;  // ex: correction ou projet — requis pour ensureGroup/ensureProject/ensurePrivateProject
    token: string;
}

export interface CorrectionFile {
    path: string;
    content: string;
}

/** Base du groupe de corrections (ex: https://git…/correction), sans slash final, ou null si absente.
 *  GITLAB_CORRECTION_URL est lue au runtime (serveur, modifiable sans rebuild). NEXT_PUBLIC_GIT_URL
 *  sert de repli mais est figée au build (inlinée par Next) — à éviter côté serveur. */
export function getCorrectionBaseUrl(): string | null {
    const raw = process.env.GITLAB_CORRECTION_URL ?? process.env.NEXT_PUBLIC_GIT_URL;
    if (!raw) return null;
    return raw.replace(/\/+$/, "");
}

export function getGitlabConfig(): GitlabConfig & { rootGroupPath: string } {
    const gitUrl = getCorrectionBaseUrl();
    if (!gitUrl) {
        throw new Error("GITLAB_CORRECTION_URL non configuré : impossible de publier une correction.");
    }
    const token = process.env.GITLAB_CORRECTION_TOKEN;
    if (!token) {
        throw new Error("GITLAB_CORRECTION_TOKEN non configuré : impossible de publier une correction.");
    }
    const url = new URL(gitUrl);
    const rootGroupPath = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!rootGroupPath) {
        throw new Error(`L'URL de correction (${gitUrl}) doit inclure le chemin du groupe racine (ex: /correction).`);
    }
    return { baseUrl: url.origin, rootGroupPath, token };
}

/** Config dédiée aux projets privés créés via `publish_private_document` — couple
 *  d'env séparé de GITLAB_CORRECTION_URL/TOKEN (credentials découplés de ceux des
 *  corrections publiques, même serveur GitLab possible). GITLAB_PROJET_URL porte un
 *  groupe racine (ex: https://git…/projet) comme GITLAB_CORRECTION_URL — les projets
 *  créés par `ensurePrivateProject` vivent sous ce groupe, jamais dans l'espace
 *  personnel du token, mais restent `visibility: "private"` (jamais publics comme
 *  les corrections). Le groupe doit déjà exister sur la forge (même contrainte que
 *  ensureGroup/ensureProject : pas de création sauvage d'un groupe racine). */
export function getPrivateProjectConfig(): GitlabConfig & { rootGroupPath: string } {
    const raw = process.env.GITLAB_PROJET_URL;
    if (!raw) {
        throw new Error("GITLAB_PROJET_URL non configuré : impossible de publier un projet privé.");
    }
    const token = process.env.GITLAB_PROJET_TOKEN;
    if (!token) {
        throw new Error("GITLAB_PROJET_TOKEN non configuré : impossible de publier un projet privé.");
    }
    const url = new URL(raw);
    const rootGroupPath = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!rootGroupPath) {
        throw new Error(`GITLAB_PROJET_URL (${raw}) doit inclure le chemin du groupe racine (ex: /projet).`);
    }
    return { baseUrl: url.origin, rootGroupPath, token };
}

interface GitlabResponse {
    ok: boolean;
    status: number;
    headers: { get(name: string): string | null };
    text(): Promise<string>;
    json(): Promise<unknown>;
}

/** Requête via `node:http(s)` plutôt que `fetch` : `family: 4` force nativement l'IPv4,
 *  sans dépendance externe (undici en npm direct casse le traçage de fichiers de la
 *  sortie `standalone` de Next — "Cannot find module 'undici'" en prod). Certains
 *  réseaux Docker (Dokploy) résolvent le domaine GitLab en IPv6 sans route sortante
 *  fonctionnelle ("Network unreachable"), que `fetch` ne contourne pas comme curl
 *  (Happy Eyeballs). */
function gitlabFetch(
    cfg: GitlabConfig, path: string, init?: { method?: string; body?: string }
): Promise<GitlabResponse> {
    const url = new URL(`${cfg.baseUrl}/api/v4${path}`);
    const requestFn = url.protocol === "https:" ? httpsRequest : httpRequest;
    const body = init?.body;

    return new Promise((resolve, reject) => {
        const req = requestFn(url, {
            method: init?.method ?? "GET",
            family: 4,
            headers: {
                "PRIVATE-TOKEN": cfg.token,
                "Content-Type": "application/json",
                ...(body ? {"Content-Length": Buffer.byteLength(body)} : {}),
            },
        }, (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk: Buffer) => chunks.push(chunk));
            res.on("end", () => {
                const text = Buffer.concat(chunks).toString("utf-8");
                resolve({
                    ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
                    status: res.statusCode ?? 0,
                    headers: {
                        get: (name: string) => {
                            const value = res.headers[name.toLowerCase()];
                            return Array.isArray(value) ? value[0] ?? null : value ?? null;
                        },
                    },
                    text: async () => text,
                    json: async () => JSON.parse(text),
                });
            });
        });
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });
}

async function gitlabError(res: GitlabResponse, action: string): Promise<Error> {
    const body = await res.text().catch(() => "");
    return new Error(`GitLab — ${action} : HTTP ${res.status}${body ? ` — ${body.slice(0, 300)}` : ""}`);
}

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

/** Chemins des blobs du repo (branche par défaut), toutes pages. Repo vide → []. */
export async function listRepoFiles(cfg: GitlabConfig, projectId: number): Promise<string[]> {
    const paths: string[] = [];
    let page = "1";
    const pagesSeen = new Set<string>();
    while (page && !pagesSeen.has(page)) {
        pagesSeen.add(page);
        const res = await gitlabFetch(cfg,
            `/projects/${projectId}/repository/tree?recursive=true&per_page=100&page=${page}`);
        if (res.status === 404) return []; // repo sans aucun commit
        if (!res.ok) throw await gitlabError(res, "lecture de l'arborescence");
        const items = await res.json() as Array<{ type: string; path: string }>;
        paths.push(...items.filter((i) => i.type === "blob").map((i) => i.path));
        // Fetch next page number from x-next-page header
        page = (res.headers.get("x-next-page") ?? "") as string;
    }
    return paths;
}

/** Contenu d'un fichier sur `main`, décodé depuis la base64 renvoyée par l'API. */
export async function readRepoFile(
    cfg: GitlabConfig, projectId: number, filePath: string
): Promise<string> {
    const res = await gitlabFetch(
        cfg,
        `/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}?ref=main`
    );
    if (!res.ok) throw await gitlabError(res, `lecture du fichier ${filePath}`);
    const file = await res.json() as { content: string };
    return Buffer.from(file.content, "base64").toString("utf-8");
}

/** Garantit l'existence du projet PRIVÉ `rootGroupPath/slug`, sous le groupe racine
 *  de `cfg` (jamais dans l'espace personnel du token). Groupe absent → erreur
 *  explicite, pas de création sauvage (même contrainte que `ensureGroup`). Projet
 *  créé en `visibility: "private"` — un dépôt de référence ou un document publié via
 *  `publish_private_document` ne doit jamais devenir visible publiquement. */
export async function ensurePrivateProject(
    cfg: GitlabConfig & { rootGroupPath: string }, slug: string
): Promise<{ id: number; webUrl: string }> {
    const namespacePath = `${cfg.rootGroupPath}/${slug}`;

    const res = await gitlabFetch(cfg, `/projects/${encodeURIComponent(namespacePath)}`);
    if (res.ok) {
        const p = await res.json() as { id: number; web_url: string };
        return { id: p.id, webUrl: p.web_url };
    }
    if (res.status !== 404) throw await gitlabError(res, `lecture du projet privé ${namespacePath}`);

    const namespaceId = await findGroupId(cfg, cfg.rootGroupPath);
    if (namespaceId === null) {
        throw new Error(`GitLab — groupe racine "${cfg.rootGroupPath}" introuvable : créez-le à la main sur la forge.`);
    }

    const created = await gitlabFetch(cfg, "/projects", {
        method: "POST",
        body: JSON.stringify({
            name: slug, path: slug, namespace_id: namespaceId,
            visibility: "private", default_branch: "main",
        }),
    });
    if (!created.ok) throw await gitlabError(created, `création du projet privé ${namespacePath}`);
    const p = await created.json() as { id: number; web_url: string };
    return { id: p.id, webUrl: p.web_url };
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
