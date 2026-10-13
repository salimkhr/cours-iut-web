import {describe, expect, it} from "bun:test";
import {draftRequestSchema, ficheRequestSchema, vacationMonthSchema} from "./vacation.schema";

const row = {date: "2026-09-04", code: "R3.01", label: "Dev web", annee: 2, cours: 0, td: 3, tp: 0};

describe("vacationMonthSchema", () => {
    it("accepte AAAA-MM et refuse un mois invalide", () => {
        expect(vacationMonthSchema.safeParse("2026-09").success).toBe(true);
        expect(vacationMonthSchema.safeParse("2026-13").success).toBe(false);
        expect(vacationMonthSchema.safeParse("09/2026").success).toBe(false);
    });
});

describe("ficheRequestSchema", () => {
    it("accepte une requête complète", () => {
        expect(ficheRequestSchema.safeParse({month: "2026-09", signedAt: "2026-10-01", rows: [row]}).success).toBe(true);
    });

    it("refuse des heures négatives et plus de 16 lignes", () => {
        expect(ficheRequestSchema.safeParse({month: "2026-09", signedAt: "2026-10-01", rows: [{...row, td: -1}]}).success).toBe(false);
        expect(ficheRequestSchema.safeParse({month: "2026-09", signedAt: "2026-10-01", rows: Array(17).fill(row)}).success).toBe(false);
    });
});

describe("draftRequestSchema", () => {
    const base = {month: "2026-09", signedAt: "2026-10-01", rows: [row]};

    it("exige une adresse e-mail valide", () => {
        expect(draftRequestSchema.safeParse({...base, to: "sylvie.papore@univ-lehavre.fr"}).success).toBe(true);
        expect(draftRequestSchema.safeParse({...base, to: "pas-un-mail"}).success).toBe(false);
        expect(draftRequestSchema.safeParse(base).success).toBe(false);
    });
});
