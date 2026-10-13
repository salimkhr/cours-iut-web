import {NextResponse} from "next/server";
import {getServerSession} from "@/lib/auth";
import {withAdmin} from "@/lib/withAdmin";
import {draftRequestSchema} from "@/lib/schemas/vacation.schema";
import {generateFiche, XLSX_MIME} from "@/lib/vacation/generate";
import {buildEml, draftMessage} from "@/lib/vacation/eml";
import {readFicheNom} from "@/lib/vacation/xlsx";

/**
 * POST {month, signedAt, rows, to} — renvoie un brouillon .eml (destinataire, objet et
 * message préremplis, fiche .xlsx en pièce jointe) à ouvrir dans le client mail.
 */
export const POST = withAdmin(async (req: Request): Promise<Response> => {
    const parsed = draftRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({error: parsed.error.issues[0]?.message ?? "Requête invalide"}, {status: 400});
    }

    const session = await getServerSession();
    if (!session) return NextResponse.json({error: "Non authentifié"}, {status: 401});

    const {to, ...fiche} = parsed.data;
    const {bytes, filename} = await generateFiche(fiche, session.user.id);
    const {subject, text} = draftMessage(fiche.month, readFicheNom());

    const eml = buildEml({to, subject, text, attachment: {filename, bytes, mimeType: XLSX_MIME}});

    return new Response(eml, {
        headers: {
            "Content-Type": "message/rfc822",
            "Content-Disposition": `attachment; filename="brouillon_${filename.replace(/\.xlsx$/, "")}.eml"`,
            "Cache-Control": "no-store",
        },
    });
});
