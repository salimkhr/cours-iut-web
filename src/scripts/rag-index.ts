// Réindexe tout : vide la collection Qdrant, puis découpe et revectorise tous les cours et TP.
// bun run rag:index [--max-words=600] [--collection=cours_mistral]
// Pour ne traiter que les changements : bun run rag:sync.
// N'écrit que dans Qdrant et dans les collections rag_* ; les contenus sont seulement lus.

import { connectToDB } from "@/lib/mongodb";
import { DEFAULT_MAX_WORDS } from "@/lib/rag/chunk";
import { ragCollection } from "@/lib/rag/config";
import { runSync } from "@/lib/rag/runSync";
import { costUsd } from "@/lib/rag/usage";

function option(name: string, fallback: string): string {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.slice(name.length + 3) : fallback;
}

async function main() {
    const collection = option("collection", ragCollection());
    const maxWords = Number(option("max-words", String(DEFAULT_MAX_WORDS)));
    const report = await runSync(await connectToDB(), { full: true, collection, maxWords });

    console.log(`Réindexation complète de « ${collection} » (seuil ${maxWords} mots) :`);
    console.log(`  ${report.contentsChecked} contenus, ${report.chunksEmbedded} morceaux vectorisés`);
    console.log(`  ${report.tokens} tokens (≈ ${costUsd(report.tokens).toFixed(4)} $), ${(report.durationMs / 1000).toFixed(1)} s`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exit(1);
});
