import {describe, expect, it} from "bun:test";
import {buildEml, displayName, draftMessage, monthLabel} from "@/lib/vacation/eml";

const bytes = new Uint8Array(Array.from({length: 500}, (_, i) => (i * 7) % 256));
const eml = buildEml({
    to: "sylvie.papore@univ-lehavre.fr",
    subject: "Déclaration d'heures de septembre 2026",
    text: "Bonjour,\n\nCi-joint ma déclaration.\n\nBien cordialement,\nSalim Khraimeche",
    attachment: {filename: "heure_vacation_2026_09_Khraimeche_Salim.xlsx", bytes, mimeType: "application/xlsx"},
});

function part(index: number): string {
    const boundary = /boundary="([^"]+)"/.exec(eml)![1];
    return eml.split(`--${boundary}`)[index];
}
const bodyOf = (p: string) => p.split("\r\n\r\n")[1].replace(/\r\n/g, "");

describe("buildEml", () => {
    it("pose les en-têtes d'un brouillon et utilise CRLF", () => {
        expect(eml.startsWith("X-Unsent: 1\r\nTo: sylvie.papore@univ-lehavre.fr\r\n")).toBe(true);
        expect(eml).toContain("MIME-Version: 1.0");
        expect(eml).not.toMatch(/[^\r]\n/);
    });

    it("encode l'objet accentué en RFC 2047", () => {
        const match = /Subject: =\?UTF-8\?B\?([^?]+)\?=/.exec(eml);
        expect(match).not.toBeNull();
        expect(Buffer.from(match![1], "base64").toString("utf8")).toBe("Déclaration d'heures de septembre 2026");
    });

    it("restitue le message en UTF-8", () => {
        const text = Buffer.from(bodyOf(part(1)), "base64").toString("utf8");
        expect(text).toContain("Bonjour,\r\n\r\nCi-joint ma déclaration.");
    });

    it("joint la fiche à l'identique, en lignes de 76 caractères maximum", () => {
        const attachment = part(2);
        expect(attachment).toContain('filename="heure_vacation_2026_09_Khraimeche_Salim.xlsx"');
        expect(Buffer.from(bodyOf(attachment), "base64").equals(Buffer.from(bytes))).toBe(true);
        for (const line of attachment.split("\r\n")) expect(line.length).toBeLessThanOrEqual(120);
        expect(attachment.split("\r\n\r\n")[1].split("\r\n").every((l) => l.length <= 76 || l.startsWith("--"))).toBe(true);
    });

    it("neutralise les sauts de ligne dans le destinataire et l'objet", () => {
        const hostile = buildEml({
            to: "a@b.fr\r\nBcc: x@y.fr",
            subject: "ok\r\nBcc: z@y.fr",
            text: "x",
            attachment: {filename: "f.xlsx", bytes: new Uint8Array([1]), mimeType: "application/xlsx"},
        });
        expect(hostile).not.toMatch(/^Bcc:/m);
    });
});

describe("message type", () => {
    it("formate le mois et le nom", () => {
        expect(monthLabel("2026-09")).toBe("septembre 2026");
        expect(monthLabel("2026-12")).toBe("décembre 2026");
        expect(displayName("Khraimeche Salim")).toBe("Salim Khraimeche");
    });

    it("compose l'objet et le corps", () => {
        const {subject, text} = draftMessage("2026-09", "Khraimeche Salim");
        expect(subject).toBe("Déclaration d'heures de septembre 2026");
        expect(text).toContain("du mois de septembre 2026");
        expect(text.endsWith("Salim Khraimeche")).toBe(true);
    });
});
