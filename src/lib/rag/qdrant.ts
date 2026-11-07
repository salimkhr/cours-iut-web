// src/lib/rag/qdrant.ts
// RAG, étape 3 : range les vecteurs dans Qdrant et y cherche les plus proches (API REST, sans SDK).
// Côté serveur uniquement.

import { createHash } from "node:crypto";

export interface QdrantConfig {
    url: string;
    fetchImpl?: typeof fetch;
}

export interface QdrantPoint {
    id: string;
    vector: number[];
    payload: Record<string, unknown>;
}

export interface QdrantHit {
    id: string;
    score: number;
    payload: Record<string, unknown>;
}

/** Qdrant n'accepte qu'un entier ou un UUID : on dérive un UUID stable d'une clé lisible. */
export function pointId(key: string): string {
    const hex = createHash("sha1").update(key).digest("hex");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

async function call<T>({ url, fetchImpl = fetch }: QdrantConfig, method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetchImpl(`${url}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Qdrant ${res.status} : ${await res.text()}`);
    return ((await res.json()) as { result: T }).result;
}

/** Repart d'une collection vide : chaque indexation remplace la précédente. */
export async function recreateCollection(config: QdrantConfig, name: string, size: number): Promise<void> {
    await call(config, "DELETE", `/collections/${name}`);
    await call(config, "PUT", `/collections/${name}`, { vectors: { size, distance: "Cosine" } });
}

/** Crée la collection si elle n'existe pas encore, sans toucher à son contenu sinon. */
export async function ensureCollection(config: QdrantConfig, name: string, size: number): Promise<void> {
    const { exists } = await call<{ exists: boolean }>(config, "GET", `/collections/${name}/exists`);
    if (!exists) await call(config, "PUT", `/collections/${name}`, { vectors: { size, distance: "Cosine" } });
}

/** Tous les points de la collection (sans leurs vecteurs), avec les champs de payload demandés. */
export async function scrollPoints(
    config: QdrantConfig,
    name: string,
    fields: string[]
): Promise<{ id: string; payload: Record<string, unknown> }[]> {
    const points: { id: string; payload: Record<string, unknown> }[] = [];
    let offset: string | null | undefined;
    do {
        const page = await call<{ points: { id: string; payload: Record<string, unknown> }[]; next_page_offset: string | null }>(
            config, "POST", `/collections/${name}/points/scroll`,
            { limit: 256, with_payload: fields, with_vector: false, ...(offset ? { offset } : {}) }
        );
        points.push(...page.points);
        offset = page.next_page_offset;
    } while (offset);
    return points;
}

export async function deletePoints(config: QdrantConfig, name: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await call(config, "POST", `/collections/${name}/points/delete?wait=true`, { points: ids });
}

export async function upsertPoints(config: QdrantConfig, name: string, points: QdrantPoint[]): Promise<void> {
    await call(config, "PUT", `/collections/${name}/points?wait=true`, { points });
}

export async function searchPoints(config: QdrantConfig, name: string, vector: number[], limit: number): Promise<QdrantHit[]> {
    const result = await call<{ points: QdrantHit[] }>(config, "POST", `/collections/${name}/points/query`, {
        query: vector,
        limit,
        with_payload: true,
    });
    return result.points;
}
