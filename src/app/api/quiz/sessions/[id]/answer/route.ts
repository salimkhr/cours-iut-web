import {NextResponse} from "next/server";
import {z} from "zod";
import {authenticate, getLiveQuiz, liveErrorResponse} from "@/lib/quiz/liveQuizServer";
import {readJson} from "@/lib/quiz/quizApi";

export const dynamic = "force-dynamic";

const bodySchema = z.object({selectedIds: z.array(z.string().min(1)).max(50)});

/**
 * Envoi d'une réponse. Le serveur recalcule les points et refuse après
 * l'échéance (409 « Temps écoulé »). Un double envoi renvoie la réponse existante.
 * La réponse ne contient jamais la correction.
 */
export async function POST(req: Request, {params}: {params: Promise<{id: string}>}) {
    const auth = await authenticate();
    if (!auth.ok) return auth.response;
    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return NextResponse.json({error: "Réponse invalide"}, {status: 400});
    const {id} = await params;
    try {
        const answer = await (await getLiveQuiz()).submitAnswer(id, auth.user.id, parsed.data.selectedIds);
        return NextResponse.json({selectedIds: answer.selectedIds, locked: true});
    } catch (error) {
        return liveErrorResponse(error);
    }
}
