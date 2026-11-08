// Cherche dans Qdrant les morceaux de cours les plus proches d'une question.
// bun run rag:search "comment parcourir un tableau associatif ?" [--limit=5] [--collection=cours_mistral]

import { connectToDB } from "@/lib/mongodb";
import { createMistralClient, embedTexts, EMBED_MODEL } from "@/lib/rag/embed";
import { qdrantFromEnv, ragCollection } from "@/lib/rag/config";
import { searchPoints } from "@/lib/rag/qdrant";
import { logUsage } from "@/lib/rag/usage";

function option(name: string, fallback: string): string {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.slice(name.length + 3) : fallback;
}

async function main() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY manquante (.env.local)");
    const question = process.argv.slice(2).find(a => !a.startsWith("--"));
    if (!question) throw new Error('Usage : bun run rag:search "ma question"');
    const limit = Number(option("limit", "5"));
    const collection = option("collection", ragCollection());

    const started = Date.now();
    const { vectors, tokens } = await embedTexts([question], { client: createMistralClient(apiKey) });
    await logUsage(await connectToDB(), {
        step: "search", model: EMBED_MODEL, inputs: 1, tokens, durationMs: Date.now() - started, collection, query: question,
    });
    const hits = await searchPoints(qdrantFromEnv(), collection, vectors[0], limit);

    console.log(`Question : ${question}\n`);
    for (const hit of hits) {
        const p = hit.payload;
        console.log(`${hit.score.toFixed(3)}  ${p.moduleTitle} › ${p.sectionTitle} › ${p.contentType} › ${p.title}  (${p.words} mots)`);
    }
    process.exit(0);
}

main().catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exit(1);
});
