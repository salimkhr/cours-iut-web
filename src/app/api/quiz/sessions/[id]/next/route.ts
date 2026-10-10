import {NextResponse} from "next/server";
import {authenticate, getLiveQuiz, liveErrorResponse} from "@/lib/quiz/liveQuizServer";

export const dynamic = "force-dynamic";

/** Question suivante ; après la dernière correction, la session passe à « finished ». */
export async function POST(_req: Request, {params}: {params: Promise<{id: string}>}) {
    const auth = await authenticate({manager: true});
    if (!auth.ok) return auth.response;
    const {id} = await params;
    try {
        await (await getLiveQuiz()).next(id);
        return NextResponse.json({ok: true});
    } catch (error) {
        return liveErrorResponse(error);
    }
}
