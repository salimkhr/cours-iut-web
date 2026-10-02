import {NextResponse} from "next/server";
import {withAdmin} from "@/lib/withAdmin";
import {getQuizService, quizErrorResponse, readJson} from "@/lib/quiz/quizApi";
import type {QuizQuestionInput} from "@/lib/schemas/quiz.schema";

type Ctx = {params: Promise<{moduleId: string}>};

// La validation Zod complète est appliquée par QuizService (erreurs 422 localisées).
export const POST = withAdmin<Ctx>(async (req, {params}) => {
    const {moduleId} = await params;
    const body = await readJson(req);
    if (typeof body !== "object" || body === null) {
        return NextResponse.json({error: "Corps JSON attendu"}, {status: 400});
    }
    try {
        const quiz = await (await getQuizService()).addQuestion(moduleId, body as QuizQuestionInput);
        return NextResponse.json({quiz}, {status: 201});
    } catch (error) {
        return quizErrorResponse(error);
    }
});
