import {NextResponse} from "next/server";
import {getServerSession} from "@/lib/auth";
import {withAdmin} from "@/lib/withAdmin";
import {disableExamMode, enableExamMode, getExamMode, type ExamModeState} from "@/lib/examMode";
import {enableExamModeSchema} from "@/lib/schemas/examMode.schema";

function toJson(state: ExamModeState) {
    return {
        active: state.active,
        until: state.until?.toISOString() ?? null,
        enabledBy: state.enabledBy,
    };
}

/** GET — état du mode examen (captcha retiré de la connexion). */
export const GET = withAdmin(async () => NextResponse.json(toJson(await getExamMode())));

/** PUT `{durationMinutes}` — active le mode examen pour la durée donnée. */
export const PUT = withAdmin(async (req: Request) => {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({error: "Corps JSON invalide"}, {status: 400});
    }
    const parsed = enableExamModeSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({error: "Durée invalide", issues: parsed.error.issues}, {status: 400});
    }
    const session = await getServerSession();
    const state = await enableExamMode(parsed.data.durationMinutes, session?.user.id ?? "inconnu");
    return NextResponse.json(toJson(state));
});

/** DELETE — désactive le mode examen tout de suite. */
export const DELETE = withAdmin(async () => {
    await disableExamMode();
    return NextResponse.json(toJson(await getExamMode()));
});
