import {authenticate, liveErrorResponse, sseResponse} from "@/lib/quiz/liveQuizServer";
import type {QuizAudience} from "@/lib/quiz/quizPublicState";

// SSE : flux long-vivant, jamais mis en cache.
export const dynamic = "force-dynamic";

export async function GET(req: Request, {params}: {params: Promise<{id: string}>}) {
    const wantsProjection = new URL(req.url).searchParams.get("audience") === "projection";
    const auth = await authenticate({manager: wantsProjection});
    if (!auth.ok) return auth.response;
    const {id} = await params;
    const audience: QuizAudience = wantsProjection ? "projection" : {userId: auth.user.id};
    try {
        return await sseResponse(req, id, audience);
    } catch (error) {
        return liveErrorResponse(error);
    }
}
