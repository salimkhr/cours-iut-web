import {NextResponse} from "next/server";
import {authenticate, getLiveQuiz, liveErrorResponse} from "@/lib/quiz/liveQuizServer";
import type {QuizAudience} from "@/lib/quiz/quizPublicState";

export const dynamic = "force-dynamic";

/** État persistant, lu avant de (re)prendre le flux SSE. L'audience est déduite du compte. */
export async function GET(req: Request, {params}: {params: Promise<{id: string}>}) {
    const wantsProjection = new URL(req.url).searchParams.get("audience") === "projection";
    const auth = await authenticate({manager: wantsProjection});
    if (!auth.ok) return auth.response;
    const {id} = await params;
    const audience: QuizAudience = wantsProjection ? "projection" : {userId: auth.user.id};
    try {
        return NextResponse.json(await (await getLiveQuiz()).getState(id, audience));
    } catch (error) {
        return liveErrorResponse(error);
    }
}
