import {NextResponse} from "next/server";
import {ObjectId} from "bson";
import {z} from "zod";
import {connectToDB} from "@/lib/mongodb";
import {authenticate, getLiveQuiz, liveErrorResponse} from "@/lib/quiz/liveQuizServer";
import {readJson} from "@/lib/quiz/quizApi";

export const dynamic = "force-dynamic";

const bodySchema = z.object({moduleId: z.string().min(1)});

/** Crée une session (lobby) depuis le quiz d'un module. Enseignant uniquement. */
export async function POST(req: Request) {
    const auth = await authenticate({manager: true});
    if (!auth.ok) return auth.response;

    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success || !ObjectId.isValid(parsed.data.moduleId)) {
        return NextResponse.json({error: "moduleId invalide"}, {status: 400});
    }

    try {
        const db = await connectToDB();
        const mod = await db.collection("modules").findOne(
            {_id: new ObjectId(parsed.data.moduleId)},
            {projection: {path: 1, title: 1}},
        );
        if (!mod) return NextResponse.json({error: "Module introuvable"}, {status: 404});

        const session = await (await getLiveQuiz()).createSession({
            moduleId: parsed.data.moduleId,
            moduleSlug: String(mod.path),
            moduleTitle: String(mod.title),
            teacherId: auth.user.id,
        });
        return NextResponse.json(
            {sessionId: session.id, joinCode: session.joinCode, shortCode: session.shortCode},
            {status: 201},
        );
    } catch (error) {
        return liveErrorResponse(error);
    }
}
