import ExcelJS from "exceljs";

export interface ScodocEntry {
    email: string | null;
    /** Identifiant IUT, partie locale de la colonne H de ScoDoc. */
    username: string | null;
    firstName: string;
    lastName: string;
    score: number;
    scoreMax: number;
}

export interface ScodocReport {
    filled: number;
    absent: number;
    unmatched: {firstName: string; lastName: string}[];
}

/** La feuille fournie n'est pas une feuille de saisie ScoDoc exploitable. */
export class ScodocSheetError extends Error {
    constructor(message = "Ce n'est pas une feuille de saisie ScoDoc") {
        super(message);
        this.name = "ScodocSheetError";
    }
}

const HEADER_ROW = 8;
const FIRST_STUDENT_ROW = 9;
const COL_ID = 1;
const COL_NOTE = 5;
const COL_EMAIL = 8;

/** Note sur 20, arrondie au demi-point ; 0 si le barème est nul. */
export function scodocNote(score: number, scoreMax: number): number {
    if (scoreMax === 0) return 0;
    return Math.round((score / scoreMax) * 20 * 2) / 2;
}

function normalizeEmail(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

/** Fusionne les entrées de plusieurs sessions : une par identité (username, sinon e-mail), avec la meilleure note ; les entrées sans identité restent telles quelles. */
export function mergeScodocEntries(entries: ScodocEntry[]): ScodocEntry[] {
    const best = new Map<string, ScodocEntry>();
    const merged: ScodocEntry[] = [];
    for (const entry of entries) {
        const key = normalizeEmail(entry.username) || normalizeEmail(entry.email);
        if (key === "") {
            merged.push(entry);
            continue;
        }
        const current = best.get(key);
        if (!current) {
            best.set(key, entry);
            merged.push(entry);
        } else if (scodocNote(entry.score, entry.scoreMax) > scodocNote(current.score, current.scoreMax)) {
            best.set(key, entry);
            merged[merged.indexOf(current)] = entry;
        }
    }
    return merged;
}

/** Remplit la colonne E (Note sur 20) d'une feuille de saisie ScoDoc avec les notes du quiz. */
export async function fillScodocSheet(
    input: ArrayBuffer,
    entries: ScodocEntry[],
): Promise<{buffer: Buffer; report: ScodocReport}> {
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.load(input);
    } catch {
        throw new ScodocSheetError();
    }

    const sheet = workbook.worksheets[0];
    if (
        !sheet
        || !sheet.getCell(HEADER_ROW, COL_ID).text.startsWith("!")
        || sheet.getCell(HEADER_ROW, COL_EMAIL).text !== "Email"
    ) {
        throw new ScodocSheetError();
    }

    // Participants indexés par identifiant IUT puis par e-mail (repli) ; sans l'un ni l'autre, ils ne sont jamais appariés.
    const byUsername = new Map<string, ScodocEntry>();
    const byEmail = new Map<string, ScodocEntry>();
    for (const entry of entries) {
        const username = normalizeEmail(entry.username);
        if (username !== "") byUsername.set(username, entry);
        const email = normalizeEmail(entry.email);
        if (email !== "") byEmail.set(email, entry);
    }

    let filled = 0;
    let absent = 0;
    const used = new Set<ScodocEntry>();
    for (let r = FIRST_STUDENT_ROW; r <= sheet.rowCount; r++) {
        if (!sheet.getCell(r, COL_ID).text.startsWith("!")) continue;
        const key = normalizeEmail(sheet.getCell(r, COL_EMAIL).text);
        const local = key.split("@")[0];
        const entry = (local !== "" ? byUsername.get(local) : undefined) ?? byEmail.get(key);
        if (entry) {
            sheet.getCell(r, COL_NOTE).value = scodocNote(entry.score, entry.scoreMax);
            used.add(entry);
            filled++;
        } else {
            sheet.getCell(r, COL_NOTE).value = "ABS";
            absent++;
        }
    }

    const unmatched: ScodocReport["unmatched"] = entries
        .filter((entry) => !used.has(entry))
        .map(({firstName, lastName}) => ({firstName, lastName}));

    const out = await workbook.xlsx.writeBuffer();
    return {buffer: Buffer.from(out as ArrayBuffer), report: {filled, absent, unmatched}};
}
