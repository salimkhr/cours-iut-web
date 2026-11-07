import {NextResponse} from "next/server";
import {z} from "zod";
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {runSync} from "@/lib/rag/runSync";

const bodySchema = z.object({
    /** Vide l'index et revectorise tout (installation, changement de découpage). */
    full: z.boolean().optional(),
});

/**
 * Met l'index RAG à jour (même effet que `bun run rag:sync`) : seuls les contenus modifiés depuis
 * la dernière synchro sont relus, et seuls les morceaux changés repartent chez Mistral.
 * Avec `{ full: true }`, reconstruit tout l'index (même effet que `bun run rag:index`).
 */
export const POST = withAdmin(async (req: Request) => {
    let body: unknown = {};
    const raw = await req.text();
    try {
        if (raw) body = JSON.parse(raw);
    } catch {
        body = null;
    }
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({error: "Corps invalide : { full?: boolean }"}, {status: 400});
    }

    try {
        const report = await runSync(await connectToDB(), {full: parsed.data.full});
        return NextResponse.json(report);
    } catch (error) {
        console.error("rag sync", error);
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({error: message}, {status: 500});
    }
});
