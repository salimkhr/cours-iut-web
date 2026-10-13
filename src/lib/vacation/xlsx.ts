import {computeTotals, FICHE_MAX_ROWS, type FicheRow} from "@/lib/vacation/fiche";
import {readZip, writeZip} from "@/lib/vacation/zip";
import {FICHE_TEMPLATE_BASE64} from "@/lib/vacation/template";

/**
 * Remplit le modèle « heure_vacation » (onglet `fiche`) en patchant directement le XML
 * de la feuille : styles, cellules fusionnées, logo, protection et formules du modèle sont
 * conservés à l'identique. Code serveur uniquement.
 */

const SHEET_FICHE = "xl/worksheets/sheet1.xml";
const SHEET_CODES = "xl/worksheets/sheet2.xml";
const SHARED_STRINGS = "xl/sharedStrings.xml";
const WORKBOOK = "xl/workbook.xml";
/** Image ancrée sous « Le Bénéficiaire » (vide dans le modèle embarqué). */
const SIGNATURE_IMAGE = "xl/media/image1.png";
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const FIRST_ROW = 23;

type CellValue =
    | {kind: "empty"}
    | {kind: "number"; value: number}
    | {kind: "string"; value: string}
    | {kind: "formula"; formula: string; cached: string | number | null};

export interface FicheOptions {
    /** Année universitaire affichée en B3 (ex : `2026-2027`). */
    academicYear: string;
    /** Date de signature (C44). */
    signedAt: Date;
    /** PNG de la signature, posé à la place de l'image vide du modèle. */
    signaturePng?: Uint8Array;
}

export function isPng(bytes: Uint8Array): boolean {
    return PNG_MAGIC.every((b, i) => bytes[i] === b);
}

function escapeXml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function decodeXml(value: string): string {
    return value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
}

function readSharedStrings(xml: string): string[] {
    return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(([, si]) =>
        decodeXml([...si.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(([, t]) => t).join("")),
    );
}

function readCellText(sheetXml: string, ref: string, shared: string[]): string | null {
    const m = new RegExp(`<c r="${ref}"((?:[^>/]|/(?!>))*)>([\\s\\S]*?)</c>`).exec(sheetXml);
    if (!m) return null;
    const v = /<v>([\s\S]*?)<\/v>/.exec(m[2]);
    if (!v) return null;
    return /t="s"/.test(m[1]) ? shared[Number(v[1])] ?? null : decodeXml(v[1]);
}

/** Table `code → libellé` de l'onglet `code_matiere` du modèle. */
export function readMatieres(template: Uint8Array = templateBytes()): Record<string, string> {
    const entries = readZip(template);
    const decoder = new TextDecoder();
    const shared = readSharedStrings(decoder.decode(entries.get(SHARED_STRINGS)));
    const sheet = decoder.decode(entries.get(SHEET_CODES));
    const result: Record<string, string> = {};
    for (const [, row] of sheet.matchAll(/<row r="(\d+)"/g)) {
        const code = readCellText(sheet, `A${row}`, shared);
        const label = readCellText(sheet, `B${row}`, shared);
        if (code && label && code !== "0") result[code.trim()] = label.trim();
    }
    return result;
}

/** Nom de l'enseignant inscrit dans le modèle (E8), pour nommer le fichier. */
export function readFicheNom(template: Uint8Array = templateBytes()): string {
    const entries = readZip(template);
    const decoder = new TextDecoder();
    const shared = readSharedStrings(decoder.decode(entries.get(SHARED_STRINGS)));
    return readCellText(decoder.decode(entries.get(SHEET_FICHE)), "E8", shared)?.trim() ?? "";
}

function setCell(sheetXml: string, ref: string, cell: CellValue): string {
    const pattern = new RegExp(`<c r="${ref}"([^>]*?)(?:/>|>[\\s\\S]*?</c>)`);
    const m = pattern.exec(sheetXml);
    if (!m) throw new Error(`Cellule ${ref} absente du modèle`);
    const style = /\ss="(\d+)"/.exec(m[1]);
    const s = style ? ` s="${style[1]}"` : "";

    let xml: string;
    switch (cell.kind) {
        case "empty":
            xml = `<c r="${ref}"${s}/>`;
            break;
        case "number":
            xml = `<c r="${ref}"${s}><v>${cell.value}</v></c>`;
            break;
        case "string":
            xml = `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell.value)}</t></is></c>`;
            break;
        case "formula": {
            const f = `<f>${escapeXml(cell.formula)}</f>`;
            if (cell.cached === null) xml = `<c r="${ref}"${s} t="e">${f}<v>#N/A</v></c>`;
            else if (typeof cell.cached === "number") xml = `<c r="${ref}"${s}>${f}<v>${cell.cached}</v></c>`;
            else xml = `<c r="${ref}"${s} t="str">${f}<v xml:space="preserve">${escapeXml(cell.cached)}</v></c>`;
            break;
        }
    }
    return sheetXml.slice(0, m.index) + xml + sheetXml.slice(m.index + m[0].length);
}

const num = (value: number): CellValue => (value > 0 ? {kind: "number", value} : {kind: "empty"});

/** Numéro de série Excel (calendrier 1900) d'une date, à minuit. */
function excelSerial(date: Date): number {
    return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) + 25569;
}

function templateBytes(): Uint8Array {
    return new Uint8Array(Buffer.from(FICHE_TEMPLATE_BASE64, "base64"));
}

export function buildFicheXlsx(rows: FicheRow[], options: FicheOptions, template: Uint8Array = templateBytes()): Uint8Array {
    if (rows.length > FICHE_MAX_ROWS) {
        throw new Error(`Le modèle ne contient que ${FICHE_MAX_ROWS} lignes (${rows.length} demandées).`);
    }

    const matieres = readMatieres(template);
    const entries = readZip(template);
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let sheet = decoder.decode(entries.get(SHEET_FICHE));

    for (let i = 0; i < FICHE_MAX_ROWS; i++) {
        const r = FIRST_ROW + i;
        const row = rows[i];
        const code = row?.code.trim() ?? "";
        const [y, m, d] = row ? row.date.split("-").map(Number) : [0, 0, 0];

        sheet = setCell(sheet, `B${r}`, code ? {kind: "string", value: code} : {kind: "empty"});
        sheet = setCell(sheet, `D${r}`, {
            kind: "formula",
            formula: `VLOOKUP(B${r},code_matiere!A$1:B$101,2,FALSE)`,
            cached: code ? matieres[code] ?? null : " ",
        });
        sheet = setCell(sheet, `F${r}`, row?.annee ? {kind: "number", value: row.annee} : {kind: "empty"});
        sheet = setCell(sheet, `G${r}`, row ? {kind: "number", value: d} : {kind: "empty"});
        sheet = setCell(sheet, `H${r}`, row ? {kind: "number", value: m} : {kind: "empty"});
        sheet = setCell(sheet, `I${r}`, row ? {kind: "number", value: y} : {kind: "empty"});
        sheet = setCell(sheet, `J${r}`, num(row?.cours ?? 0));
        sheet = setCell(sheet, `K${r}`, num(row?.td ?? 0));
        sheet = setCell(sheet, `L${r}`, num(row?.tp ?? 0));
    }

    const totals = computeTotals(rows);
    sheet = setCell(sheet, "J39", {kind: "formula", formula: "SUM(J23:J38)", cached: totals.cours});
    sheet = setCell(sheet, "K39", {kind: "formula", formula: "SUM(K23:K38)", cached: totals.td});
    sheet = setCell(sheet, "L39", {kind: "formula", formula: "SUM(L23:L38)", cached: totals.tp});
    sheet = setCell(sheet, "L40", {kind: "formula", formula: "J39*1.5+K39+L39*2/3", cached: totals.etd});
    sheet = setCell(sheet, "B3", {kind: "string", value: `Année ${options.academicYear}`});
    sheet = setCell(sheet, "C44", {kind: "number", value: excelSerial(options.signedAt)});
    entries.set(SHEET_FICHE, encoder.encode(sheet));

    if (options.signaturePng) {
        if (!isPng(options.signaturePng)) throw new Error("La signature fournie n'est pas un PNG.");
        entries.set(SIGNATURE_IMAGE, options.signaturePng);
    }

    // Force Excel / LibreOffice à recalculer les formules à l'ouverture.
    const workbook = decoder.decode(entries.get(WORKBOOK)).replace(
        /<calcPr([^>]*?)\/>/,
        (_, attrs: string) => `<calcPr${attrs.replace(/\sfullCalcOnLoad="[^"]*"/, "")} fullCalcOnLoad="1"/>`,
    );
    entries.set(WORKBOOK, encoder.encode(workbook));

    return writeZip(entries);
}
