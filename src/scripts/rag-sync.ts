// Met l'index à jour : ne relit que les contenus modifiés depuis la dernière synchro,
// ne revectorise que les morceaux qui ont changé et supprime ceux qui ont disparu.
// bun run rag:sync [--collection=cours_mistral]

import { connectToDB } from "@/lib/mongodb";
import { ragCollection } from "@/lib/rag/config";
import { runSync } from "@/lib/rag/runSync";
import { costUsd } from "@/lib/rag/usage";

async function main() {
    const arg = process.argv.find(a => a.startsWith("--collection="));
    const collection = arg ? arg.slice("--collection=".length) : ragCollection();
    const report = await runSync(await connectToDB(), { collection });

    console.log(`Synchro de « ${collection} » :`);
    console.log(`  ${report.contentsChecked} contenus relus`);
    console.log(`  ${report.chunksEmbedded} morceaux revectorisés, ${report.chunksUnchanged} inchangés, ${report.pointsDeleted} supprimés`);
    console.log(`  ${report.tokens} tokens (≈ ${costUsd(report.tokens).toFixed(4)} $), ${(report.durationMs / 1000).toFixed(1)} s`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exit(1);
});
