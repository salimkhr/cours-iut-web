import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {runSync} from "@/lib/rag/runSync";

/**
 * Met l'index RAG à jour (même effet que `bun run rag:sync`) : seuls les contenus modifiés depuis
 * la dernière synchro sont relus, et seuls les morceaux changés repartent chez Mistral.
 */
export const POST = withAdmin(async () => {
    try {
        const report = await runSync(await connectToDB());
        return NextResponse.json(report);
    } catch (error) {
        console.error("rag sync", error);
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({error: message}, {status: 500});
    }
});
