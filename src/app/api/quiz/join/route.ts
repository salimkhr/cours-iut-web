import {NextResponse} from "next/server";
import {z} from "zod";
import {authenticate, getLiveQuiz, identityFromUser, liveErrorResponse} from "@/lib/quiz/liveQuizServer";
import {isGenericAccount} from "@/lib/genericAccount";
import {readJson} from "@/lib/quiz/quizApi";

export const dynamic = "force-dynamic";

const bodySchema = z.object({code: z.string().trim().min(4).max(64)});

/** Rejoint une session par code (QR ou code court). Compte personnel obligatoire. */
export async function POST(req: Request) {
    const auth = await authenticate();
    if (!auth.ok) return auth.response;
    // Le compte générique est partagé : ses résultats ne seraient rattachables à personne.
    if (isGenericAccount(auth.user) && !auth.manager) {
        return NextResponse.json(
            {error: "Connectez-vous avec votre compte personnel pour participer", code: "generic_account"},
            {status: 403},
        );
    }
    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return NextResponse.json({error: "Code invalide"}, {status: 400});

    try {
        const live = await getLiveQuiz();
        const session = await live.findByCode(parsed.data.code);
        if (!session) {
            return NextResponse.json({error: "Code invalide ou expiré", code: "session_not_found"}, {status: 404});
        }
        await live.join(session.id, identityFromUser(auth.user));
        return NextResponse.json({sessionId: session.id, moduleTitle: session.moduleTitle});
    } catch (error) {
        return liveErrorResponse(error);
    }
}
