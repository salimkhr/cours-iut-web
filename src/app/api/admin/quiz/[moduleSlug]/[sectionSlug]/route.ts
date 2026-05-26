import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import { quizQuestionsSchema } from "@/lib/schemas/quiz.schema";
import Module from "@/types/Module";

type Context = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export const GET = withAdmin(async (_req: Request, context: Context) => {
    const { moduleSlug, sectionSlug } = await context.params;

    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    if (!mod) {
        return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
    }

    const section = mod.sections.find(s => s.path === sectionSlug);
    if (!section) {
        return NextResponse.json({ error: "Section introuvable" }, { status: 404 });
    }

    return NextResponse.json(section.quiz?.questions ?? []);
});

export const PUT = withAdmin(async (req: Request, context: Context) => {
    const { moduleSlug, sectionSlug } = await context.params;

    const parsed = quizQuestionsSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    if (!mod) {
        return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
    }

    const sectionIndex = mod.sections.findIndex(s => s.path === sectionSlug);
    if (sectionIndex === -1) {
        return NextResponse.json({ error: "Section introuvable" }, { status: 404 });
    }

    await db.collection<Module>("modules").updateOne(
        { path: moduleSlug },
        { $set: { [`sections.${sectionIndex}.quiz`]: { questions: parsed.data } } }
    );

    return NextResponse.json({ ok: true });
});
