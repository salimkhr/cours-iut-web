import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { getServerSession } from "@/lib/auth";
import { quizCompleteSchema } from "@/lib/schemas/quiz.schema";
import Module from "@/types/Module";
import { QuizAttempt } from "@/types/Quiz";

export async function POST(
    req: Request,
    context: { params: Promise<{ moduleSlug: string; sectionSlug: string }> }
) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = quizCompleteSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { answers } = parsed.data;
    const { moduleSlug, sectionSlug } = await context.params;

    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne({
        path: moduleSlug,
    });
    if (!mod) {
        return NextResponse.json(
            { error: "Module introuvable" },
            { status: 404 }
        );
    }

    const section = mod.sections.find((s) => s.path === sectionSlug);
    if (!section?.quiz) {
        return NextResponse.json(
            { error: "Quiz introuvable" },
            { status: 404 }
        );
    }

    const questionsMap = new Map(
        section.quiz.questions.map((q) => [q.id, q])
    );

    const validatedAnswers = answers.map(({ questionId, answer }) => {
        const question = questionsMap.get(questionId);
        if (!question)
            return { questionId, answer, isCorrect: false };

        const correct = question.correct;
        let isCorrect: boolean;

        if (
            Array.isArray(correct) &&
            Array.isArray(answer)
        ) {
            isCorrect =
                [...correct].sort().join(",") ===
                [...(answer as number[])].sort().join(",");
        } else {
            isCorrect = answer === correct;
        }

        return { questionId, answer, isCorrect };
    });

    const score = validatedAnswers.filter((a) => a.isCorrect).length;
    const total = section.quiz.questions.length;

    const attempt: QuizAttempt = {
        userId: session.user.id,
        moduleSlug,
        sectionSlug,
        score,
        total,
        completedAt: new Date(),
        answers: validatedAnswers,
    };

    await db.collection<QuizAttempt>("quiz_attempts").insertOne(attempt);

    return NextResponse.json({ score, total });
}
