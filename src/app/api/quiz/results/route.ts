import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {authenticate} from "@/lib/quiz/liveQuizServer";
import {QuizResultsRepository} from "@/lib/quiz/QuizResultsRepository";

export const dynamic = "force-dynamic";

/** Relevé des notes : enseignant ou administrateur uniquement, jamais via le MCP. */
export async function GET(req: Request) {
    const auth = await authenticate({manager: true});
    if (!auth.ok) return auth.response;

    const params = new URL(req.url).searchParams;
    const moduleId = params.get("moduleId");
    if (!moduleId) return NextResponse.json({error: "moduleId requis"}, {status: 400});

    const repo = new QuizResultsRepository(await connectToDB());
    const [rows, sessions, groups] = await Promise.all([
        repo.list({
            moduleId,
            sessionId: params.get("sessionId") || undefined,
            group: params.get("group") || undefined,
            search: params.get("search") || undefined,
        }),
        repo.listSessions(moduleId),
        repo.listGroups(moduleId),
    ]);
    return NextResponse.json({rows, sessions, groups});
}
