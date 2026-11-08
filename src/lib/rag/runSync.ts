// src/lib/rag/runSync.ts
// Branche la synchro du RAG sur MongoDB, Mistral et Qdrant. Utilisé par `rag:index`,
// `rag:sync` et la route admin. Côté serveur uniquement : lit la clé Mistral.

import type { Db } from "mongodb";
import { DEFAULT_MAX_WORDS } from "@/lib/rag/chunk";
import { createMistralClient, embedTexts, EMBED_DIMENSIONS, EMBED_MODEL } from "@/lib/rag/embed";
import { qdrantFromEnv, ragCollection } from "@/lib/rag/config";
import { deletePoints, ensureCollection, recreateCollection, scrollPoints, upsertPoints } from "@/lib/rag/qdrant";
import { SYNC_PAYLOAD_FIELDS, syncContents, type IndexableContent, type SyncReport } from "@/lib/rag/sync";
import { logUsage } from "@/lib/rag/usage";

const CONTENT_TYPES = ["cours", "TP"];
const SYNC_STATE_COLLECTION = "rag_sync";

/** Cours et TP de tous les modules, masqués compris : les agents de rédaction travaillent aussi sur ceux-là. */
export async function loadIndexableContents(db: Db): Promise<IndexableContent[]> {
    const modules = await db.collection("modules").find().toArray();
    const docs = await db.collection("course_content")
        .find({ moduleSlug: { $in: modules.map(m => m.path) }, contentType: { $in: CONTENT_TYPES } })
        .toArray();
    const byKey = new Map(docs.map(d => [`${d.moduleSlug}/${d.sectionSlug}/${d.contentType}`, d]));

    const contents: IndexableContent[] = [];
    for (const mod of modules) {
        for (const section of mod.sections ?? []) {
            for (const ref of section.contents ?? []) {
                if (!CONTENT_TYPES.includes(ref.type) || ref.source !== "db") continue;
                const doc = byKey.get(`${mod.path}/${section.path}/${ref.type}`);
                if (!doc) continue;
                // Un titre de module ou de section modifié change le texte des morceaux.
                const dates = [doc.updatedAt, mod.updatedAt].filter((d): d is Date => d instanceof Date);
                contents.push({
                    moduleSlug: mod.path,
                    moduleTitle: mod.title,
                    moduleVisible: mod.isVisible !== false,
                    sectionSlug: section.path,
                    sectionTitle: section.title,
                    contentType: ref.type,
                    blocks: doc.blocks,
                    updatedAt: new Date(Math.max(0, ...dates.map(d => d.getTime()))),
                });
            }
        }
    }
    return contents;
}

export async function getLastSync(db: Db, collection: string): Promise<Date | null> {
    const state = await db.collection<{ _id: string; lastSyncAt: Date }>(SYNC_STATE_COLLECTION).findOne({ _id: collection });
    return state?.lastSyncAt ?? null;
}

export async function saveLastSync(db: Db, collection: string, date: Date): Promise<void> {
    await db.collection<{ _id: string; lastSyncAt: Date }>(SYNC_STATE_COLLECTION)
        .updateOne({ _id: collection }, { $set: { lastSyncAt: date } }, { upsert: true });
}

export interface RunSyncOptions {
    /** Repart d'une collection vide et revectorise tout. */
    full?: boolean;
    /** Par défaut, la collection de l'environnement (RAG_COLLECTION). */
    collection?: string;
    maxWords?: number;
}

export async function runSync(db: Db, { full = false, collection = ragCollection(), maxWords = DEFAULT_MAX_WORDS }: RunSyncOptions = {}): Promise<SyncReport & { durationMs: number }> {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY manquante");
    const qdrant = qdrantFromEnv();
    const client = createMistralClient(apiKey);

    // Pris avant la lecture : une modification faite pendant la synchro sera vue la fois suivante.
    const startedAt = new Date();
    if (full) await recreateCollection(qdrant, collection, EMBED_DIMENSIONS);
    else await ensureCollection(qdrant, collection, EMBED_DIMENSIONS);

    const report = await syncContents({
        contents: await loadIndexableContents(db),
        since: full ? null : await getLastSync(db, collection),
        maxWords,
        embed: texts => embedTexts(texts, { client }),
        store: {
            list: () => scrollPoints(qdrant, collection, SYNC_PAYLOAD_FIELDS),
            upsert: async points => {
                for (let i = 0; i < points.length; i += 100) await upsertPoints(qdrant, collection, points.slice(i, i + 100));
            },
            remove: ids => deletePoints(qdrant, collection, ids),
        },
    });
    const durationMs = Date.now() - startedAt.getTime();

    await saveLastSync(db, collection, startedAt);
    await logUsage(db, {
        step: full ? "index" : "sync", model: EMBED_MODEL, inputs: report.chunksEmbedded,
        tokens: report.tokens, durationMs, collection,
    });
    return { ...report, durationMs };
}
