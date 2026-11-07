// src/lib/rag/embed.ts
// RAG, étape 2 : transforme des textes en vecteurs avec l'API Mistral (mistral-embed, 1024 dimensions).
// Côté serveur uniquement : la clé ne doit jamais atteindre le client.

import { Mistral } from "@mistralai/mistralai";

export const EMBED_MODEL = "mistral-embed";
export const EMBED_DIMENSIONS = 1024;

/** Budget par requête : la documentation ne publie pas de limite, on reste prudent. */
const DEFAULT_MAX_TOKENS_PER_BATCH = 8000;

/** Estimation grossière (français + code) : 1 token pour 3 caractères. */
const estimateTokens = (text: string) => Math.ceil(text.length / 3);

/** Regroupe les indices des textes en lots qui tiennent dans le budget de tokens. */
export function batchTexts(texts: string[], maxTokens: number): number[][] {
    const batches: number[][] = [];
    let current: number[] = [];
    let used = 0;
    texts.forEach((text, i) => {
        const cost = estimateTokens(text);
        if (current.length > 0 && used + cost > maxTokens) {
            batches.push(current);
            current = [];
            used = 0;
        }
        current.push(i);
        used += cost;
    });
    if (current.length > 0) batches.push(current);
    return batches;
}

/** Ce qu'on utilise du SDK : remplaçable par un faux client dans les tests. */
export interface EmbeddingsClient {
    embeddings: {
        create(request: { model: string; inputs: string[] }): Promise<{
            data: { index?: number; embedding?: number[] }[];
            usage: { totalTokens?: number };
        }>;
    };
}

/**
 * Client Mistral qui réessaie seul les erreurs passagères (429, 5xx, coupure réseau),
 * en espaçant les tentatives de 1 s à 30 s, pendant 2 min au plus.
 */
export function createMistralClient(apiKey: string): EmbeddingsClient {
    return new Mistral({
        apiKey,
        retryConfig: {
            strategy: "backoff",
            backoff: { initialInterval: 1000, maxInterval: 30000, exponent: 2, maxElapsedTime: 120000 },
            retryConnectionErrors: true,
        },
    });
}

interface EmbedOptions {
    client: EmbeddingsClient;
    maxTokensPerBatch?: number;
}

/** Vectorise les textes, lot par lot. `tokens` est le total facturé par Mistral. */
export async function embedTexts(
    texts: string[],
    { client, maxTokensPerBatch = DEFAULT_MAX_TOKENS_PER_BATCH }: EmbedOptions
): Promise<{ vectors: number[][]; tokens: number }> {
    const vectors: number[][] = new Array(texts.length);
    let tokens = 0;

    for (const batch of batchTexts(texts, maxTokensPerBatch)) {
        let response;
        try {
            response = await client.embeddings.create({ model: EMBED_MODEL, inputs: batch.map(i => texts[i]) });
        } catch (error) {
            // Les tentatives sont épuisées : on garde le statut et le message de l'API.
            const { statusCode, body } = error as { statusCode?: number; body?: string };
            if (statusCode) throw new Error(`Mistral embeddings ${statusCode} : ${body}`);
            throw error;
        }
        for (const item of response.data) {
            if (item.index === undefined || !item.embedding) throw new Error("Réponse Mistral incomplète");
            vectors[batch[item.index]] = item.embedding;
        }
        tokens += response.usage.totalTokens ?? 0;
    }
    return { vectors, tokens };
}
