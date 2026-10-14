import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {ensureIndexes} from "@/lib/db/indexes";

/**
 * Crée / vérifie les index MongoDB déclarés dans `src/lib/db/indexes.ts` sur la base de l'environnement
 * courant (même effet que `bun run create-indexes`). Idempotent : seuls les index manquants sont créés.
 */
export const POST = withAdmin(async () => {
    try {
        const db = await connectToDB();
        const indexes = await ensureIndexes(db);
        return NextResponse.json({indexes});
    } catch (error) {
        // Typiquement : un index unique ne peut pas être créé car des doublons existent déjà.
        console.error("ensureIndexes", error);
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({error: message}, {status: 500});
    }
});
