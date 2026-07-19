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
async function listRepoFiles(cfg: GitlabConfig, projectId: number): Promise<string[]> {
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
        // Read next page from x-next-page header (try various approaches)
        let nextPageHeader = "";
        if (res.headers) {
            let val: string | null = null;
            // Try standard .get() with various casings
            if (typeof res.headers.get === "function") {
                val = res.headers.get("x-next-page")
                    ?? res.headers.get("X-Next-Page")
                    ?? res.headers.get("X-NEXT-PAGE");
            }
            // Try direct property access
            if (!val && typeof res.headers.entries === "function") {
                for (const [key, v] of res.headers.entries()) {
                    if (key.toLowerCase() === "x-next-page") {
                        val = v;
                        break;
                    }
                }
            }
            if (val) nextPageHeader = val;
        }
        page = nextPageHeader;
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
