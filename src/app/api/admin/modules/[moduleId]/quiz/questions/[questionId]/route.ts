import {NextResponse} from "next/server";
import {withAdmin} from "@/lib/withAdmin";
import {getQuizService, quizErrorResponse, readJson} from "@/lib/quiz/quizApi";
import type {QuizQuestionInput} from "@/lib/schemas/quiz.schema";

type Ctx = {params: Promise<{moduleId: string; questionId: string}>};

export const PUT = withAdmin<Ctx>(async (req, {params}) => {
    const {moduleId, questionId} = await params;
    const body = await readJson(req);
    if (typeof body !== "object" || body === null) {
        return NextResponse.json({error: "Corps JSON attendu"}, {status: 400});
    }
    try {
        const quiz = await (await getQuizService()).updateQuestion(moduleId, questionId, body as QuizQuestionInput);
        return NextResponse.json({quiz});
    } catch (error) {
        return quizErrorResponse(error);
    }
});

export const DELETE = withAdmin<Ctx>(async (_req, {params}) => {
    const {moduleId, questionId} = await params;
    try {
        const quiz = await (await getQuizService()).deleteQuestion(moduleId, questionId);
        return NextResponse.json({quiz});
    } catch (error) {
        return quizErrorResponse(error);
    }
});
