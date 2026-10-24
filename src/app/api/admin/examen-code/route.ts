import {NextResponse} from "next/server";
import {withAdmin} from "@/lib/withAdmin";
import {examCode} from "@/lib/examAccess";

/** Code d'accès à distribuer pour l'examen d'une section (calculé côté serveur, jamais dans la page publique). */
export const GET = withAdmin(async (req) => {
    const params = new URL(req.url).searchParams;
    const moduleSlug = params.get("module");
    const sectionSlug = params.get("section");
    if (!moduleSlug || !sectionSlug) {
        return NextResponse.json({error: "module et section requis"}, {status: 400});
    }
    return NextResponse.json({code: examCode(moduleSlug, sectionSlug)});
});
