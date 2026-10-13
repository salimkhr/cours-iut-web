import {describe, expect, it} from "bun:test";
import {readZip} from "@/lib/vacation/zip";
import {buildFicheXlsx, isPng, readMatieres} from "@/lib/vacation/xlsx";
import type {FicheRow} from "@/lib/vacation/fiche";

const rows: FicheRow[] = [
    {date: "2026-09-04", code: "R3.01", label: "Dev web", annee: 2, cours: 0, td: 3, tp: 0},
    {date: "2026-09-11", code: "R2.02", label: "IHM", annee: 1, cours: 1.5, td: 0, tp: 1.5},
];

function sheetXml(bytes: Uint8Array): string {
    return new TextDecoder().decode(readZip(bytes).get("xl/worksheets/sheet1.xml"));
}

describe("readMatieres", () => {
    it("lit la table code_matiere du modèle", () => {
        const matieres = readMatieres();
        expect(matieres["R3.01"]).toBe("Développement Web");
        expect(Object.keys(matieres).length).toBeGreaterThan(60);
    });
});

describe("buildFicheXlsx", () => {
    const xlsx = buildFicheXlsx(rows, {academicYear: "2026-2027", signedAt: new Date(2026, 9, 1)});
    const sheet = sheetXml(xlsx);

    it("conserve toutes les parties du modèle", () => {
        const names = [...readZip(xlsx).keys()];
        expect(names).toContain("xl/media/image1.png");
        expect(names).toContain("xl/worksheets/sheet2.xml");
    });

    it("écrit les lignes, les libellés en cache et vide le reste", () => {
        expect(sheet).toContain(`<c r="B23" s="24" t="inlineStr"><is><t xml:space="preserve">R3.01</t></is></c>`);
        expect(sheet).toContain(`<v xml:space="preserve">Développement Web</v>`);
        expect(sheet).toContain(`<c r="K23" s="11"><v>3</v></c>`);
        expect(sheet).toContain(`<c r="J24" s="11"><v>1.5</v></c>`);
        expect(sheet).toContain(`<c r="B25" s="24"/>`);
        expect(sheet).toContain(`<c r="G24" s="16"><v>11</v></c>`);
    });

    it("met à jour totaux, année et date de signature", () => {
        expect(sheet).toContain(`<c r="L40" s="9"><f>J39*1.5+K39+L39*2/3</f><v>6.25</v></c>`);
        expect(sheet).toContain("Année 2026-2027");
        expect(sheet).toContain(`<c r="C44" s="53"><v>46296</v></c>`);
        const workbook = new TextDecoder().decode(readZip(xlsx).get("xl/workbook.xml"));
        expect(workbook).toContain(`fullCalcOnLoad="1"`);
    });

    it("n'embarque aucune signature dans le modèle versionné", () => {
        const image = readZip(xlsx).get("xl/media/image1.png");
        expect(image && isPng(image)).toBe(true);
        expect(image!.length).toBeLessThan(100);
    });

    it("pose la signature fournie à la place de l'image vide", () => {
        const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
        const signed = buildFicheXlsx(rows, {academicYear: "2026-2027", signedAt: new Date(), signaturePng: signature});
        expect(readZip(signed).get("xl/media/image1.png")).toEqual(signature);
        expect(() =>
            buildFicheXlsx(rows, {academicYear: "2026-2027", signedAt: new Date(), signaturePng: new Uint8Array([1, 2])}),
        ).toThrow();
    });

    it("refuse plus de lignes que le modèle n'en contient", () => {
        const many = Array.from({length: 17}, () => rows[0]);
        expect(() => buildFicheXlsx(many, {academicYear: "2026-2027", signedAt: new Date()})).toThrow();
    });
});
