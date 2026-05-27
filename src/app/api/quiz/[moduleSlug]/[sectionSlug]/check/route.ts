import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { getServerSession } from "@/lib/auth";
import { quizCheckSchema } from "@/lib/schemas/quiz.schema";
import Module from "@/types/Module";

export async function POST(
    req: Request,
    context: { params: Promise<{ moduleSlug: string; sectionSlug: string }> }
) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = quizCheckSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { questionId, answer } = parsed.data;
    const { moduleSlug, sectionSlug } = await context.params;

    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    if (!mod) {
        return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
    }

    const section = mod.sections.find((s) => s.path === sectionSlug);
    const question = section?.quiz?.questions.find((q) => q.id === questionId);
    if (!question) {
        return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    const correct = question.correct;
    let isCorrect: boolean;

    if (Array.isArray(correct) && Array.isArray(answer)) {
        isCorrect =
            [...correct].sort().join(",") === [...(answer as number[])].sort().join(",");
    } else {
        isCorrect = answer === correct;
    }

    return NextResponse.json({ isCorrect, explanation: question.explanation, correctAnswer: correct });
}
