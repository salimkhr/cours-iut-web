import {describe, expect, test} from "bun:test";
import ExcelJS from "exceljs";
import {fillScodocSheet, scodocNote, ScodocSheetError, type ScodocEntry} from "./scodocSheet";

type Row = {id: string; nom: string; prenom: string; email: ExcelJS.CellValue};

/** Reproduit l'export ScoDoc : en-tête en ligne 8, colonnes A et G masquées. */
async function buildSheet(rows: Row[], a8 = "!50721"): Promise<ArrayBuffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Feuille");
    ws.getCell("B1").value = "Titre";
    ws.getRow(8).values = [a8, "Nom", "Prénom", "Groupe", "Note sur 20", "Remarque", "NIP", "Email"];
    rows.forEach((r, i) => {
        const row = ws.getRow(9 + i);
        row.getCell(1).value = r.id;
        row.getCell(2).value = r.nom;
        row.getCell(3).value = r.prenom;
        row.getCell(4).value = "A / G / G1";
        row.getCell(6).value = `rem-${i}`;
        row.getCell(7).value = `2025${i}`;
        row.getCell(8).value = r.email;
    });
    ws.getColumn(1).hidden = true;
    ws.getColumn(7).hidden = true;
    const buf = await wb.xlsx.writeBuffer();
    return buf as ArrayBuffer;
}

const entry = (over: Partial<ScodocEntry> = {}): ScodocEntry => ({
    email: "aa@etu.test",
    firstName: "Abdellah",
    lastName: "ACHAFIK",
    score: 7,
    scoreMax: 10,
    ...over,
});

async function reload(buffer: Buffer): Promise<ExcelJS.Worksheet> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as unknown as ArrayBuffer);
    return wb.worksheets[0];
}

const two: Row[] = [
    {id: "!1", nom: "ACHAFIK", prenom: "Abdellah", email: "aa@etu.test"},
    {id: "!2", nom: "BERTIN", prenom: "Zoe", email: "bb@etu.test"},
];

describe("scodocNote", () => {
    test("arrondit au demi-point sur 20", () => {
        expect(scodocNote(7, 10)).toBe(14);
        expect(scodocNote(8.3, 12)).toBe(14);
        expect(scodocNote(13, 20)).toBe(13);
        expect(scodocNote(1.3, 2)).toBe(13);
        expect(scodocNote(5, 0)).toBe(0);
    });
});

describe("fillScodocSheet", () => {
    test("note le participant et marque l'autre ABS", async () => {
        const {buffer, report} = await fillScodocSheet(await buildSheet(two), [entry()]);
        const ws = await reload(buffer);
        expect(ws.getCell("E9").value).toBe(14);
        expect(ws.getCell("E10").value).toBe("ABS");
        expect(report).toEqual({filled: 1, absent: 1, unmatched: []});
    });

    test("reconnaît un e-mail sous forme de lien, casse et espaces ignorés", async () => {
        const rows: Row[] = [{
            id: "!1", nom: "A", prenom: "B",
            email: {text: "AA@Etu.test ", hyperlink: "mailto:aa@etu.test"},
        }];
        const {buffer, report} = await fillScodocSheet(await buildSheet(rows), [entry()]);
        expect((await reload(buffer)).getCell("E9").value).toBe(14);
        expect(report.filled).toBe(1);
    });

    test("range en unmatched les participants sans e-mail ou absents de la feuille", async () => {
        const {report} = await fillScodocSheet(await buildSheet(two), [
            entry({email: null, firstName: "Sans", lastName: "Mail"}),
            entry({email: "inconnu@etu.test", firstName: "Inc", lastName: "Onnu"}),
            entry({email: undefined as unknown as null, firstName: "Vieux", lastName: "Compte"}),
        ]);
        expect(report.unmatched).toEqual([
            {firstName: "Sans", lastName: "Mail"},
            {firstName: "Inc", lastName: "Onnu"},
            {firstName: "Vieux", lastName: "Compte"},
        ]);
        expect(report.filled).toBe(0);
        expect(report.absent).toBe(2);
    });

    test("conserve colonnes masquées et autres valeurs", async () => {
        const {buffer} = await fillScodocSheet(await buildSheet(two), [entry()]);
        const ws = await reload(buffer);
        expect(ws.getColumn(1).hidden).toBe(true);
        expect(ws.getColumn(7).hidden).toBe(true);
        expect(ws.getCell("F9").value).toBe("rem-0");
        expect(ws.getCell("A9").value).toBe("!1");
    });

    test("rejette une feuille qui n'est pas une saisie ScoDoc", async () => {
        const input = await buildSheet(two, "50721");
        await expect(fillScodocSheet(input, [entry()])).rejects.toBeInstanceOf(ScodocSheetError);
    });

    test("rejette un fichier qui n'est pas un xlsx", async () => {
        const bytes = new TextEncoder().encode("hello");
        const input = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        await expect(fillScodocSheet(input, [entry()])).rejects.toBeInstanceOf(ScodocSheetError);
    });
});
