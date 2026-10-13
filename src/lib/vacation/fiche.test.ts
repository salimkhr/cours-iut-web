import {describe, expect, it} from "bun:test";
import {parseIcal} from "@/lib/vacation/ical";
import {academicYear, buildFicheRows, computeTotals, parseSession} from "@/lib/vacation/fiche";

// Extrait réel de l'export HyperPlanning (CRLF, échappements \; et entités HTML).
const ICS = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:Cours-1371852-4-Khraimeche_Salim-Index-Education",
    "DTSTART:20260911T114500Z",
    "DTEND:20260911T131500Z",
    "SUMMARY;LANGUAGE=fr:3.01 Dev web - <IUT 2EME ANNEE INFORMATIQUE> G - TD",
    "DESCRIPTION;LANGUAGE=fr:Matière : 3.01 Dev web\\nEnseignant : Khraimeche Salim\\nTD : &lt\\;IUT 2EME ANNE",
    " E INFORMATIQUE&gt\\; G\\nSalle : IUTC-718 tp\\nType : TD\\n",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:Cours-1371852-5",
    "DTSTART:20260911T133000Z",
    "DTEND:20260911T150000Z",
    "SUMMARY;LANGUAGE=fr:3.01 Dev web - <IUT 2EME ANNEE INFORMATIQUE> G - TD",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:Cours-2",
    "DTSTART:20260904T114500Z",
    "DTEND:20260904T131500Z",
    "SUMMARY;LANGUAGE=fr:2.02 IHM - <IUT 1ERE ANNEE INFORMATIQUE> A - TP",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:Cours-3",
    "DTSTART:20261002T114500Z",
    "DTEND:20261002T131500Z",
    "SUMMARY;LANGUAGE=fr:3.01 Dev web - <IUT 2EME ANNEE INFORMATIQUE> G - TD",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:20260817",
    "DTEND;VALUE=DATE:20260901",
    "SUMMARY;LANGUAGE=fr:Vacances",
    "END:VEVENT",
    "END:VCALENDAR",
].join("\r\n");

describe("parseIcal", () => {
    it("déplie les lignes, déséchappe et convertit l'heure UTC en jour parisien", () => {
        const [first] = parseIcal(ICS);
        expect(first.date).toBe("2026-09-11");
        expect(first.durationMinutes).toBe(90);
        expect(first.description).toContain("TD : <IUT 2EME ANNEE INFORMATIQUE> G");
        expect(first.description).toContain("Type : TD");
    });

    it("marque les vacances en journée entière", () => {
        const vacances = parseIcal(ICS).find((e) => e.summary === "Vacances");
        expect(vacances?.allDay).toBe(true);
        expect(vacances?.durationMinutes).toBe(0);
    });

    it("rattache un créneau tardif UTC au bon jour à Paris", () => {
        const ics = "BEGIN:VEVENT\nDTSTART:20261231T230000Z\nDTEND:20270101T003000Z\nSUMMARY:1.01 Init - TD\nEND:VEVENT";
        expect(parseIcal(ics)[0].date).toBe("2027-01-01");
    });
});

describe("parseSession", () => {
    it("extrait code, libellé, année et type", () => {
        expect(parseSession("3.01 Dev web - <IUT 2EME ANNEE INFORMATIQUE> G - TD", "")).toEqual({
            code: "R3.01",
            label: "Dev web",
            annee: 2,
            kind: "td",
        });
    });

    it("privilégie les champs de la description", () => {
        const s = parseSession("x - y", "Matière : R4.10 Complément Web\nType : CM");
        expect(s.code).toBe("R4.10");
        expect(s.kind).toBe("cours");
        expect(s.annee).toBe(2); // déduit du semestre 4
    });

    it("renvoie null quand rien n'est reconnaissable", () => {
        const s = parseSession("Réunion pédagogique", "");
        expect(s.code).toBeNull();
        expect(s.kind).toBeNull();
    });
});

describe("buildFicheRows", () => {
    it("filtre le mois et regroupe par jour + matière", () => {
        const {rows, warnings} = buildFicheRows(parseIcal(ICS), "2026-09");
        expect(warnings).toEqual([]);
        expect(rows).toEqual([
            {date: "2026-09-04", code: "R2.02", label: "IHM", annee: 1, cours: 0, td: 0, tp: 1.5},
            {date: "2026-09-11", code: "R3.01", label: "Dev web", annee: 2, cours: 0, td: 3, tp: 0},
        ]);
    });

    it("signale un type inconnu et le compte en TD", () => {
        const ics = "BEGIN:VEVENT\nDTSTART:20260910T080000Z\nDTEND:20260910T100000Z\nSUMMARY:3.01 Dev web - Soutenance\nEND:VEVENT";
        const {rows, warnings} = buildFicheRows(parseIcal(ics), "2026-09");
        expect(rows[0].td).toBe(2);
        expect(warnings).toHaveLength(1);
    });
});

describe("computeTotals / academicYear", () => {
    it("applique la conversion ETD du modèle", () => {
        const totals = computeTotals([
            {date: "2026-09-01", code: "R3.01", label: "", annee: 2, cours: 2, td: 3, tp: 3},
        ]);
        expect(totals.etd).toBe(2 * 1.5 + 3 + 2);
    });

    it("bascule l'année universitaire en septembre", () => {
        expect(academicYear("2026-09")).toBe("2026-2027");
        expect(academicYear("2027-03")).toBe("2026-2027");
    });
});
