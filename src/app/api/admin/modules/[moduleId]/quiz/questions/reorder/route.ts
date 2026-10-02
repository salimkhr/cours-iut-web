import {NextResponse} from "next/server";
import {z} from "zod";
import {withAdmin} from "@/lib/withAdmin";
import {getQuizService, quizErrorResponse, readJson} from "@/lib/quiz/quizApi";

type Ctx = {params: Promise<{moduleId: string}>};

const reorderSchema = z.object({orderedIds: z.array(z.string().min(1))});

export const PUT = withAdmin<Ctx>(async (req, {params}) => {
    const {moduleId} = await params;
    const parsed = reorderSchema.safeParse(await readJson(req));
    if (!parsed.success) return NextResponse.json({error: z.flattenError(parsed.error)}, {status: 400});
    try {
        const quiz = await (await getQuizService()).reorderQuestions(moduleId, parsed.data.orderedIds);
        return NextResponse.json({quiz});
    } catch (error) {
        return quizErrorResponse(error);
    }
});
