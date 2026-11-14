import {NextResponse} from "next/server";
import {z} from "zod";
import {connectToDB} from "@/lib/mongodb";
import {authenticate} from "@/lib/quiz/liveQuizServer";
import {QuizResultsRepository} from "@/lib/quiz/QuizResultsRepository";
import {fillScodocSheet, ScodocSheetError} from "@/lib/quiz/scodocSheet";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const formSchema = z.object({
    sessionId: z.string().min(1),
    file: z.instanceof(File),
});

/** Remplit la feuille de saisie ScoDoc déposée avec les notes d'une session : enseignant ou administrateur uniquement, jamais via le MCP. */
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
        const parsed = formSchema.safeParse({sessionId: form.get("sessionId"), file: form.get("file")});
        if (!parsed.success) {
            return NextResponse.json({error: "sessionId et fichier requis"}, {status: 400});
        }
        const {sessionId, file} = parsed.data;
        if (file.size > MAX_BYTES) {
            return NextResponse.json({error: "Fichier trop volumineux (2 Mo maximum)"}, {status: 413});
        }

        const repo = new QuizResultsRepository(await connectToDB());
        const entries = await repo.scodocEntries(sessionId);
        if (!entries) return NextResponse.json({error: "Session introuvable"}, {status: 404});

        const {buffer, report} = await fillScodocSheet(await file.arrayBuffer(), entries);
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
