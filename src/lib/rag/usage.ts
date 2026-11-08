// src/lib/rag/usage.ts
// Journal des appels d'embedding : tokens facturés et coût estimé, par étape du RAG.
// Côté serveur uniquement.

import type { Db } from "mongodb";

export const RAG_USAGE_COLLECTION = "rag_usage";

/** Prix public de mistral-embed relevé en novembre 2026 : 0,10 $ le million de tokens. */
const PRICE_PER_MILLION_USD = 0.1;

export type RagStep = "index" | "sync" | "search";

export interface RagUsageEntry {
    createdAt: Date;
    step: RagStep;
    model: string;
    /** Nombre de textes envoyés (morceaux, ou 1 pour une question). */
    inputs: number;
    tokens: number;
    costUsd: number;
    durationMs: number;
    collection: string;
    query?: string;
}

export const costUsd = (tokens: number) => (tokens / 1_000_000) * PRICE_PER_MILLION_USD;

export async function logUsage(db: Db, entry: Omit<RagUsageEntry, "createdAt" | "costUsd">): Promise<void> {
    await db.collection<RagUsageEntry>(RAG_USAGE_COLLECTION).insertOne({
        ...entry,
        createdAt: new Date(),
        costUsd: costUsd(entry.tokens),
    });
}

/** Les appels les plus récents d'abord (index `rag_usage_recent`). */
export async function listUsage(db: Db, limit = 50): Promise<RagUsageEntry[]> {
    return db.collection<RagUsageEntry>(RAG_USAGE_COLLECTION)
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

export function summarizeUsage(entries: RagUsageEntry[]): Partial<Record<RagStep, { calls: number; tokens: number; costUsd: number }>> {
    const summary: Partial<Record<RagStep, { calls: number; tokens: number; costUsd: number }>> = {};
    for (const entry of entries) {
        const total = (summary[entry.step] ??= { calls: 0, tokens: 0, costUsd: 0 });
        total.calls++;
        total.tokens += entry.tokens;
        total.costUsd = costUsd(total.tokens);
    }
    return summary;
}
