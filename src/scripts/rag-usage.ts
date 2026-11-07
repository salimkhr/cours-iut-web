// Affiche le journal des appels d'embedding du RAG : derniers appels, puis totaux par étape.
// bun run rag:usage [--limit=50]

import { connectToDB } from "@/lib/mongodb";
import { listUsage, summarizeUsage } from "@/lib/rag/usage";

async function main() {
    const arg = process.argv.find(a => a.startsWith("--limit="));
    const entries = await listUsage(await connectToDB(), arg ? Number(arg.slice(8)) : 50);

    for (const e of entries) {
        const date = e.createdAt.toLocaleString("fr-FR");
        const detail = e.query ? `« ${e.query} »` : `${e.inputs} morceaux → ${e.collection}`;
        console.log(`${date}  ${e.step.padEnd(6)}  ${String(e.tokens).padStart(7)} tokens  ${e.costUsd.toFixed(4)} $  ${(e.durationMs / 1000).toFixed(1)} s  ${detail}`);
    }

    console.log(`\nTotal sur ${entries.length} appels :`);
    for (const [step, total] of Object.entries(summarizeUsage(entries))) {
        console.log(`  ${step.padEnd(6)}  ${total.calls} appels, ${total.tokens} tokens, ${total.costUsd.toFixed(4)} $`);
    }
    process.exit(0);
}

main().catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exit(1);
});
