import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { getServerSession } from "@/lib/auth";
import Module from "@/types/Module";
import { QuizQuestionClient } from "@/types/Quiz";

export async function GET(
    _req: Request,
    context: { params: Promise<{ moduleSlug: string; sectionSlug: string }> }
) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleSlug, sectionSlug } = await context.params;

    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    if (!mod) {
        return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
    }

    const section = mod.sections.find((s) => s.path === sectionSlug);
    if (!section || !section.quiz) {
        return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
    }

    const questions: QuizQuestionClient[] = section.quiz.questions.map(
        ({ id, type, text, choices }) => ({
            id,
            type,
            text,
            ...(choices ? { choices } : {}),
        })
    );

    return NextResponse.json(questions);
}
