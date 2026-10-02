import {NextResponse} from "next/server";
import {z} from "zod";
import {withAdmin} from "@/lib/withAdmin";
import {assertModuleExists, getQuizService, quizErrorResponse, readJson} from "@/lib/quiz/quizApi";
import {quizConfigSchema} from "@/lib/schemas/quiz.schema";

type Ctx = {params: Promise<{moduleId: string}>};

export const GET = withAdmin<Ctx>(async (_req, {params}) => {
    const {moduleId} = await params;
    const missing = await assertModuleExists(moduleId);
    if (missing) return missing;
    try {
        const quiz = await (await getQuizService()).get(moduleId);
        return NextResponse.json({quiz});
    } catch (error) {
        return quizErrorResponse(error);
    }
});

export const POST = withAdmin<Ctx>(async (req, {params}) => {
    const {moduleId} = await params;
    const missing = await assertModuleExists(moduleId);
    if (missing) return missing;
    const parsed = quizConfigSchema.partial().safeParse((await readJson(req)) ?? {});
    if (!parsed.success) return NextResponse.json({error: z.flattenError(parsed.error)}, {status: 400});
    try {
        const quiz = await (await getQuizService()).create(moduleId, parsed.data);
        return NextResponse.json({quiz}, {status: 201});
    } catch (error) {
        return quizErrorResponse(error);
    }
});

export const PATCH = withAdmin<Ctx>(async (req, {params}) => {
    const {moduleId} = await params;
    const parsed = quizConfigSchema.safeParse(await readJson(req));
    if (!parsed.success) return NextResponse.json({error: z.flattenError(parsed.error)}, {status: 400});
    try {
        const quiz = await (await getQuizService()).updateConfig(moduleId, parsed.data);
        return NextResponse.json({quiz});
    } catch (error) {
        return quizErrorResponse(error);
    }
});
