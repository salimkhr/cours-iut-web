// src/lib/rag/config.ts
// Où se trouve l'index RAG, selon l'environnement. Staging et prod partagent le même Qdrant
// (réseau Dokploy) : chacun doit avoir sa collection (RAG_COLLECTION), sinon la synchro de
// l'un effacerait les points de l'autre. Côté serveur uniquement.

import type { QdrantConfig } from "@/lib/rag/qdrant";

export function qdrantFromEnv(): QdrantConfig {
    return {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        apiKey: process.env.QDRANT_API_KEY || undefined,
    };
}

export function ragCollection(): string {
    return process.env.RAG_COLLECTION || "cours_mistral";
}
