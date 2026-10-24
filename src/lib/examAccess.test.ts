import {afterAll, beforeAll, describe, expect, test} from "bun:test";
import {EXAM_CODE_LENGTH, examAccessToken, examCode, hasExamAccess, isExamCodeValid, examDay} from "@/lib/examAccess";

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

    test("change chaque jour, à minuit heure de Paris", () => {
        const monday = new Date("2026-10-26T08:00:00Z");
        const mondayEvening = new Date("2026-10-26T22:30:00Z"); // 23 h 30 à Paris
        const thursday = new Date("2026-10-29T08:00:00Z");
        const afterMidnight = new Date("2026-10-26T23:30:00Z"); // 0 h 30 le mardi à Paris
        expect(examDay(mondayEvening)).toBe("2026-10-26");
        expect(examDay(afterMidnight)).toBe("2026-10-27");
        expect(examCode("javascript", "6-examen", mondayEvening)).toBe(examCode("javascript", "6-examen", monday));
        expect(examCode("javascript", "6-examen", afterMidnight)).not.toBe(examCode("javascript", "6-examen", monday));
        // Le code du groupe de lundi n'ouvre pas l'examen du groupe de jeudi.
        expect(isExamCodeValid(examCode("javascript", "6-examen", monday), "javascript", "6-examen", thursday)).toBe(false);
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
