// Indexe les cours et TP dans Qdrant : découpage → vecteurs Mistral → points Qdrant.
// bun run rag:index [--max-words=600] [--collection=cours_mistral]
// N'écrit que dans Qdrant ; la base MongoDB est seulement lue.

import { connectToDB } from "@/lib/mongodb";
import { chunkContent, DEFAULT_MAX_WORDS, type RagChunk } from "@/lib/rag/chunk";
import { createMistralClient, embedTexts, EMBED_DIMENSIONS, EMBED_MODEL } from "@/lib/rag/embed";
import { pointId, recreateCollection, upsertPoints } from "@/lib/rag/qdrant";
import { costUsd, logUsage } from "@/lib/rag/usage";

const CONTENT_TYPES = ["cours", "TP"];

function option(name: string, fallback: string): string {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.slice(name.length + 3) : fallback;
}

async function main() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY manquante (.env.local)");
    const maxWords = Number(option("max-words", String(DEFAULT_MAX_WORDS)));
    const collection = option("collection", "cours_mistral");
    const qdrant = { url: process.env.QDRANT_URL ?? "http://localhost:6333" };

    // 1. Découpage
    const db = await connectToDB();
    // Tous les modules, masqués compris : les agents de rédaction travaillent aussi sur ceux-là.
    const modules = await db.collection("modules").find().toArray();
    const visibleModules = new Set(modules.filter(m => m.isVisible !== false).map(m => m.path as string));
    const chunks: RagChunk[] = [];
    for (const mod of modules) {
        for (const section of mod.sections ?? []) {
            for (const ref of section.contents ?? []) {
                if (!CONTENT_TYPES.includes(ref.type) || ref.source !== "db") continue;
                const content = await db.collection("course_content").findOne({
                    moduleSlug: mod.path, sectionSlug: section.path, contentType: ref.type,
                });
                if (!content) continue;
                chunks.push(...chunkContent({
                    moduleSlug: mod.path, moduleTitle: mod.title,
                    sectionSlug: section.path, sectionTitle: section.title, contentType: ref.type,
                }, content.blocks, maxWords));
            }
        }
    }
    console.log(`1. Découpage : ${chunks.length} morceaux (seuil ${maxWords} mots)`);

    // 2. Vecteurs
    const started = Date.now();
    const { vectors, tokens } = await embedTexts(chunks.map(c => c.text), { client: createMistralClient(apiKey) });
    const durationMs = Date.now() - started;
    await logUsage(db, { step: "index", model: EMBED_MODEL, inputs: chunks.length, tokens, durationMs, collection });
    console.log(`2. Vecteurs : ${vectors.length} × ${vectors[0]?.length} nombres, ${tokens} tokens facturés (≈ ${costUsd(tokens).toFixed(4)} $), ${(durationMs / 1000).toFixed(1)} s`);

    // 3. Qdrant
    await recreateCollection(qdrant, collection, EMBED_DIMENSIONS);
    const points = chunks.map((chunk, i) => ({
        id: pointId(`${chunk.moduleSlug}/${chunk.sectionSlug}/${chunk.contentType}/${chunk.index}`),
        vector: vectors[i],
        payload: { ...chunk, moduleVisible: visibleModules.has(chunk.moduleSlug) },
    }));
    for (let i = 0; i < points.length; i += 100) await upsertPoints(qdrant, collection, points.slice(i, i + 100));
    console.log(`3. Qdrant : ${points.length} points dans la collection « ${collection} »`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exit(1);
});
