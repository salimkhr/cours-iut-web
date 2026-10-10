import type {Quiz} from "@/lib/quiz/quizTypes";

export interface ApiIssue {
    path: string;
    message: string;
}

export interface ApiResult<T> {
    ok: boolean;
    status: number;
    data: T | null;
    error: string | null;
    issues: ApiIssue[];
}

/** fetch JSON avec erreurs normalisées (message + erreurs localisées 422). */
export async function api<T = unknown>(url: string, init?: {method?: string; body?: unknown}): Promise<ApiResult<T>> {
    try {
        const res = await fetch(url, {
            method: init?.method ?? "GET",
            headers: init?.body === undefined ? undefined : {"Content-Type": "application/json"},
            body: init?.body === undefined ? undefined : JSON.stringify(init.body),
            cache: "no-store",
        });
        const json = await res.json().catch(() => null) as (Record<string, unknown> & {issues?: ApiIssue[]}) | null;
        return {
            ok: res.ok,
            status: res.status,
            data: res.ok ? (json as T) : null,
            error: res.ok ? null : typeof json?.error === "string" ? json.error : "Une erreur est survenue",
            issues: json?.issues ?? [],
        };
    } catch {
        return {ok: false, status: 0, data: null, error: "Connexion impossible. Réessayez.", issues: []};
    }
}

export const quizUrl = (moduleId: string) => `/api/admin/modules/${moduleId}/quiz`;

export type QuizEnvelope = {quiz: Quiz | null};
