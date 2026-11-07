// src/lib/rag/sync.ts
// RAG : met l'index à jour sans tout refaire. Ne relit que les contenus modifiés depuis la
// dernière synchro (ou absents de l'index), et ne revectorise que les morceaux dont le texte a changé.
// Côté serveur uniquement.

import { createHash } from "node:crypto";
import type { Block } from "@/types/CourseContent";
import { chunkContent, DEFAULT_MAX_WORDS } from "@/lib/rag/chunk";
import { pointId, type QdrantPoint } from "@/lib/rag/qdrant";

export interface IndexableContent {
    moduleSlug: string;
    moduleTitle: string;
    moduleVisible: boolean;
    sectionSlug: string;
    sectionTitle: string;
    contentType: string;
    blocks: Block[];
    /** Plus récente modification du contenu ou de son module. */
    updatedAt: Date;
}

/** Ce que la synchro attend de la base vectorielle : remplaçable par un faux en test. */
export interface VectorStore {
    list(): Promise<{ id: string; payload: Record<string, unknown> }[]>;
    upsert(points: QdrantPoint[]): Promise<void>;
    remove(ids: string[]): Promise<void>;
}

export type EmbedFn = (texts: string[]) => Promise<{ vectors: number[][]; tokens: number }>;

export interface SyncReport {
    /** Contenus relus (modifiés ou absents de l'index). */
    contentsChecked: number;
    chunksEmbedded: number;
    chunksUnchanged: number;
    pointsDeleted: number;
    tokens: number;
}

/** Les champs de payload que la synchro relit dans l'index. */
export const SYNC_PAYLOAD_FIELDS = ["moduleSlug", "sectionSlug", "contentType", "hash"];

const contentKey = (c: { moduleSlug?: unknown; sectionSlug?: unknown; contentType?: unknown }) =>
    `${c.moduleSlug}/${c.sectionSlug}/${c.contentType}`;

/** Empreinte de ce que porte le point : un changement de texte ou de visibilité le rend obsolète. */
const fingerprint = (text: string, moduleVisible: boolean) =>
    createHash("sha1").update(JSON.stringify({ text, moduleVisible })).digest("hex");

export async function syncContents({ contents, since, store, embed, maxWords = DEFAULT_MAX_WORDS }: {
    contents: IndexableContent[];
    /** Date de la dernière synchro réussie ; `null` relit tout. */
    since: Date | null;
    store: VectorStore;
    embed: EmbedFn;
    maxWords?: number;
}): Promise<SyncReport> {
    const indexed = await store.list();
    const indexedHash = new Map(indexed.map(p => [p.id, p.payload.hash]));
    const indexedKeys = new Set(indexed.map(p => contentKey(p.payload)));
    const currentKeys = new Set(contents.map(contentKey));

    // Points dont le contenu n'existe plus (supprimé, section renommée…).
    const toDelete = indexed.filter(p => !currentKeys.has(contentKey(p.payload))).map(p => p.id);

    const toCheck = contents.filter(c => since === null || c.updatedAt > since || !indexedKeys.has(contentKey(c)));
    const pending: Omit<QdrantPoint, "vector">[] = [];
    let unchanged = 0;
    let checked = 0;

    for (const c of toCheck) {
        const key = contentKey(c);
        const { moduleSlug, moduleTitle, sectionSlug, sectionTitle, contentType } = c;
        const chunks = chunkContent({ moduleSlug, moduleTitle, sectionSlug, sectionTitle, contentType }, c.blocks, maxWords);
        // Un contenu vide n'a jamais de point : sans ce test, il serait « relu » à chaque synchro.
        if (chunks.length === 0 && !indexedKeys.has(key)) continue;
        checked++;
        const ids = new Set<string>();
        for (const chunk of chunks) {
            const id = pointId(`${key}/${chunk.index}`);
            const hash = fingerprint(chunk.text, c.moduleVisible);
            ids.add(id);
            if (indexedHash.get(id) === hash) {
                unchanged++;
                continue;
            }
            pending.push({ id, payload: { ...chunk, moduleVisible: c.moduleVisible, hash } });
        }
        // Morceaux en trop après un raccourcissement du contenu.
        toDelete.push(...indexed.filter(p => contentKey(p.payload) === key && !ids.has(p.id)).map(p => p.id));
    }

    let tokens = 0;
    if (pending.length > 0) {
        const result = await embed(pending.map(p => String(p.payload.text)));
        tokens = result.tokens;
        await store.upsert(pending.map((p, i) => ({ ...p, vector: result.vectors[i] })));
    }
    await store.remove(toDelete);

    return {
        contentsChecked: checked,
        chunksEmbedded: pending.length,
        chunksUnchanged: unchanged,
        pointsDeleted: toDelete.length,
        tokens,
    };
}
