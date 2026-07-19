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
