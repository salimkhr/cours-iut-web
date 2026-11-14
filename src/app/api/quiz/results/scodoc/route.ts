import {NextResponse} from "next/server";
import {z} from "zod";
import {connectToDB} from "@/lib/mongodb";
import {authenticate} from "@/lib/quiz/liveQuizServer";
import {QuizResultsRepository} from "@/lib/quiz/QuizResultsRepository";
import {academicYearStart} from "@/lib/quiz/academicYear";
import {fillScodocSheet, mergeScodocEntries, ScodocSheetError} from "@/lib/quiz/scodocSheet";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const formSchema = z.object({
    sessionId: z.string().min(1).optional(),
    moduleId: z.string().min(1).optional(),
    file: z.instanceof(File),
}).refine((value) => value.sessionId || value.moduleId);

/** Valeur de champ texte, ou undefined si absente ou vide. */
const field = (form: FormData, name: string) => form.get(name) || undefined;

/** Remplit la feuille de saisie ScoDoc déposée avec les notes d'une session, ou de toutes celles du module cette année : enseignant ou administrateur uniquement, jamais via le MCP. */
export async function POST(req: Request) {
    const auth = await authenticate({manager: true});
    if (!auth.ok) return auth.response;

    try {
        let form: FormData;
        try {
            form = await req.formData();
        } catch {
            return NextResponse.json({error: "Formulaire invalide"}, {status: 400});
        }
        const parsed = formSchema.safeParse({
            sessionId: field(form, "sessionId"),
            moduleId: field(form, "moduleId"),
            file: form.get("file"),
        });
        if (!parsed.success) {
            return NextResponse.json({error: "sessionId ou moduleId, et fichier requis"}, {status: 400});
        }
        const {sessionId, moduleId, file} = parsed.data;
        if (file.size > MAX_BYTES) {
            return NextResponse.json({error: "Fichier trop volumineux (2 Mo maximum)"}, {status: 413});
        }

        const repo = new QuizResultsRepository(await connectToDB());
        let entries;
        if (sessionId) {
            entries = await repo.scodocEntries(sessionId);
            if (!entries) return NextResponse.json({error: "Session introuvable"}, {status: 404});
        } else {
            // Toutes les sessions du module cette année universitaire : une même feuille couvre tous les groupes de TD.
            entries = await repo.scodocEntriesForModule(moduleId as string, academicYearStart(new Date()).getTime());
            if (entries.length === 0) {
                return NextResponse.json({error: "Aucune session cette année pour ce module"}, {status: 404});
            }
        }

        const {buffer, report} = await fillScodocSheet(await file.arrayBuffer(), mergeScodocEntries(entries));
        const asciiName = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_") || "feuille.xlsx";
        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": XLSX_TYPE,
                "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
                "X-Scodoc-Report": encodeURIComponent(JSON.stringify(report)),
            },
        });
    } catch (error) {
        if (error instanceof ScodocSheetError) {
            return NextResponse.json({error: error.message}, {status: 422});
        }
        console.error("Export ScoDoc impossible", error);
        return NextResponse.json({error: "Erreur serveur"}, {status: 500});
    }
}
