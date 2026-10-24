import {afterAll, beforeAll, describe, expect, test} from "bun:test";
import {EXAM_CODE_LENGTH, examAccessToken, examCode, hasExamAccess, isExamCodeValid, schoolYear} from "@/lib/examAccess";

const previous = process.env.BETTER_AUTH_SECRET;
beforeAll(() => { process.env.BETTER_AUTH_SECRET = "secret-de-test"; });
afterAll(() => { process.env.BETTER_AUTH_SECRET = previous; });

describe("code d'examen", () => {
    test("6 caractères sans ambiguïté, stable et propre à chaque section", () => {
        const code = examCode("javascript", "6-examen");
        expect(code).toHaveLength(EXAM_CODE_LENGTH);
        expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
        expect(examCode("javascript", "6-examen")).toBe(code);
        expect(examCode("php", "10-examen")).not.toBe(code);
    });

    test("dépend du secret serveur, pas des seules données publiques", () => {
        const code = examCode("javascript", "6-examen");
        process.env.BETTER_AUTH_SECRET = "autre-secret";
        expect(examCode("javascript", "6-examen")).not.toBe(code);
        process.env.BETTER_AUTH_SECRET = "secret-de-test";
    });

    test("change à chaque année universitaire, bascule au 1er septembre", () => {
        const autumn = new Date("2026-10-24T09:00:00Z");
        const january = new Date("2027-01-15T09:00:00Z");
        const august = new Date("2027-08-31T09:00:00Z");
        const nextYear = new Date("2027-09-01T09:00:00Z");
        expect(schoolYear(autumn)).toBe("2026-2027");
        expect(schoolYear(august)).toBe("2026-2027");
        expect(schoolYear(nextYear)).toBe("2027-2028");
        // Même année universitaire : le code survit au 1er janvier, en plein semestre.
        expect(examCode("javascript", "6-examen", january)).toBe(examCode("javascript", "6-examen", autumn));
        expect(examCode("javascript", "6-examen", nextYear)).not.toBe(examCode("javascript", "6-examen", autumn));
        expect(isExamCodeValid(examCode("javascript", "6-examen", autumn), "javascript", "6-examen", nextYear)).toBe(false);
    });

    test("validation insensible à la casse et aux espaces", () => {
        const code = examCode("javascript", "6-examen");
        expect(isExamCodeValid(` ${code.toLowerCase()} `, "javascript", "6-examen")).toBe(true);
        expect(isExamCodeValid("AAAAAA", "javascript", "6-examen")).toBe(code === "AAAAAA");
        expect(isExamCodeValid(code, "php", "10-examen")).toBe(false);
    });
});

describe("jeton d'accès", () => {
    const day = new Date("2026-10-24T09:00:00Z");

    test("valable pour le même compte, la même section et le même jour", () => {
        const token = examAccessToken("u1", "javascript", "6-examen", day);
        expect(hasExamAccess(token, "u1", "javascript", "6-examen", new Date("2026-10-24T17:00:00Z"))).toBe(true);
    });

    test("refusé pour un autre compte, une autre section, un autre jour ou sans cookie", () => {
        const token = examAccessToken("u1", "javascript", "6-examen", day);
        expect(hasExamAccess(token, "u2", "javascript", "6-examen", day)).toBe(false);
        expect(hasExamAccess(token, "u1", "php", "10-examen", day)).toBe(false);
        expect(hasExamAccess(token, "u1", "javascript", "6-examen", new Date("2026-10-25T09:00:00Z"))).toBe(false);
        expect(hasExamAccess(undefined, "u1", "javascript", "6-examen", day)).toBe(false);
    });
});
