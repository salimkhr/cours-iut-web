import {describe, expect, test} from "bun:test";
import {academicYearStart} from "./academicYear";

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("academicYearStart", () => {
    test("en novembre : 1er septembre de l'année en cours", () => {
        expect(iso(academicYearStart(new Date("2026-11-14T12:00:00Z")))).toBe("2026-09-01");
    });
    test("en mars : 1er septembre de l'année précédente", () => {
        expect(iso(academicYearStart(new Date("2027-03-10T12:00:00Z")))).toBe("2026-09-01");
    });
    test("le 1er septembre à 00h30 heure de Paris : nouvelle année", () => {
        expect(iso(academicYearStart(new Date("2026-08-31T22:30:00Z")))).toBe("2026-09-01");
    });
    test("le 31 août : année précédente", () => {
        expect(iso(academicYearStart(new Date("2026-08-31T12:00:00Z")))).toBe("2025-09-01");
    });
});
