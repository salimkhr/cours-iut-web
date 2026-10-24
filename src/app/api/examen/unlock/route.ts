import {NextResponse} from "next/server";
import {z} from "zod";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import {hasContentType} from "@/types/CourseContent";
import {AttemptLimiter} from "@/lib/attemptLimiter";
import {
    EXAM_CODE_LENGTH,
    examAccessCookieName,
    examAccessToken,
    isExamCodeValid,
} from "@/lib/examAccess";

const bodySchema = z.object({
    moduleSlug: z.string().min(1).max(100),
    sectionSlug: z.string().min(1).max(100),
    code: z.string().trim().length(EXAM_CODE_LENGTH),
});

/** 5 codes faux par compte sur 15 minutes glissantes, puis 429. */
const limiter = new AttemptLimiter(5, 15 * 60 * 1000);

/** Vérifie le code d'un examen verrouillé et pose le cookie d'accès du jour. */
export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({error: "Non authentifié"}, {status: 401});

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({error: "Requête invalide"}, {status: 400});
    const {moduleSlug, sectionSlug, code} = parsed.data;

    const currentModule = (await getModules()).find((m) => m.path === moduleSlug);
    const section = currentModule?.sections.find((s) => s.path === sectionSlug);
    if (
        !currentModule || currentModule.isVisible === false ||
        !section || section.isAvailable === false ||
        !hasContentType(section.contents, "examen") || !section.examenIsLock
    ) {
        return NextResponse.json({error: "Examen introuvable"}, {status: 404});
    }

    // Par compte, toutes sections confondues : changer d'examen ne remet pas le compteur à zéro.
    const key = session.user.id;
    if (limiter.isBlocked(key)) {
        const retryAfter = limiter.retryAfterSeconds(key);
        return NextResponse.json(
            {error: "Trop de tentatives", retryAfter},
            {status: 429, headers: {"Retry-After": String(retryAfter)}},
        );
    }

    if (!isExamCodeValid(code, moduleSlug, sectionSlug)) {
        limiter.recordFailure(key);
        return NextResponse.json({error: "Code incorrect"}, {status: 403});
    }
    limiter.reset(key);

    const res = NextResponse.json({ok: true});
    res.cookies.set(examAccessCookieName(moduleSlug, sectionSlug), examAccessToken(session.user.id, moduleSlug, sectionSlug), {
        path: `/${moduleSlug}/${sectionSlug}`,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60,
    });
    return res;
}
