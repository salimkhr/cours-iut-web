import {NextResponse} from "next/server";
import {withAdmin} from "@/lib/withAdmin";
import {parseIcal} from "@/lib/vacation/ical";
import {buildFicheRows} from "@/lib/vacation/fiche";
import {readMatieres} from "@/lib/vacation/xlsx";
import {generateFiche, XLSX_MIME} from "@/lib/vacation/generate";
import {getServerSession} from "@/lib/auth";
import {ficheRequestSchema, vacationMonthSchema} from "@/lib/schemas/vacation.schema";

const ICAL_TIMEOUT_MS = 15_000;

/**
 * GET ?month=AAAA-MM — lit l'emploi du temps HyperPlanning (HPLANNING_ICAL_URL) et propose
 * les lignes de la fiche de vacations du mois, à relire avant export.
 */
export const GET = withAdmin(async (req: Request): Promise<Response> => {
    const month = vacationMonthSchema.safeParse(new URL(req.url).searchParams.get("month"));
    if (!month.success) {
        return NextResponse.json({error: month.error.issues[0]?.message ?? "Mois invalide"}, {status: 400});
    }

    const icalUrl = process.env.HPLANNING_ICAL_URL;
    if (!icalUrl) {
        return NextResponse.json(
            {error: "HPLANNING_ICAL_URL n'est pas défini dans l'environnement du serveur."},
            {status: 500},
        );
    }

    let text: string;
    try {
        const res = await fetch(icalUrl, {cache: "no-store", signal: AbortSignal.timeout(ICAL_TIMEOUT_MS)});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
    } catch (error) {
        console.error("[vacations] lecture iCal impossible", error);
        return NextResponse.json({error: "Impossible de lire l'emploi du temps HyperPlanning."}, {status: 502});
    }

    const {rows, warnings} = buildFicheRows(parseIcal(text), month.data);
    return NextResponse.json({
        rows,
        warnings,
        matieres: readMatieres(),
        // Destinataire proposé pour le brouillon e-mail (optionnel, modifiable dans l'UI).
        mailTo: process.env.VACATION_MAIL_TO ?? "",
    });
});

/** POST {month, signedAt, rows} — renvoie la fiche remplie (.xlsx), signée si une signature est enregistrée. */
export const POST = withAdmin(async (req: Request): Promise<Response> => {
    const parsed = ficheRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({error: parsed.error.issues[0]?.message ?? "Requête invalide"}, {status: 400});
    }

    const session = await getServerSession();
    if (!session) return NextResponse.json({error: "Non authentifié"}, {status: 401});

    const {bytes, filename} = await generateFiche(parsed.data, session.user.id);

    return new Response(new Uint8Array(bytes), {
        headers: {
            "Content-Type": XLSX_MIME,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    });
});
