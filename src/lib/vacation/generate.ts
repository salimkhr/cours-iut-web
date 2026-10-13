import {academicYear} from "@/lib/vacation/fiche";
import {buildFicheXlsx, readFicheNom} from "@/lib/vacation/xlsx";
import {getSignature} from "@/lib/vacation/signature";
import type {FicheRequest} from "@/lib/schemas/vacation.schema";

export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Fiche remplie et signée (si une signature est enregistrée) pour l'utilisateur, avec son nom de fichier. */
export async function generateFiche(
    {month, signedAt, rows}: FicheRequest,
    userId: string,
): Promise<{bytes: Uint8Array; filename: string}> {
    const [y, m, d] = signedAt.split("-").map(Number);
    const bytes = buildFicheXlsx(rows, {
        academicYear: academicYear(month),
        signedAt: new Date(y, m - 1, d),
        signaturePng: await getSignature(userId),
    });

    const nom = readFicheNom().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_");
    return {bytes, filename: `heure_vacation_${month.replace("-", "_")}${nom ? `_${nom}` : ""}.xlsx`};
}
