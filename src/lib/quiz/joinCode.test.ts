import {describe, expect, test} from "bun:test";
import {normalizeJoinCode} from "./joinCode";

describe("normalizeJoinCode", () => {
    test("code court tapé à la main : majuscules, sans espace ni tiret", () => {
        expect(normalizeJoinCode("abc234")).toBe("ABC234");
        expect(normalizeJoinCode("  ab c-234 ")).toBe("ABC234");
    });

    test("lien complet collé : dernier segment repris tel quel (code long sensible à la casse)", () => {
        expect(normalizeJoinCode("https://cours.example/quiz/aB_c-dEf123456789xyzQW")).toBe("aB_c-dEf123456789xyzQW");
        expect(normalizeJoinCode("cours.example/quiz/ABC234/")).toBe("ABC234");
        expect(normalizeJoinCode("https://cours.example/quiz/ABC234?x=1")).toBe("ABC234");
    });

    test("rien d'exploitable", () => {
        expect(normalizeJoinCode("")).toBeNull();
        expect(normalizeJoinCode("ab")).toBeNull();
        expect(normalizeJoinCode("abc/234")).toBeNull();
        expect(normalizeJoinCode("<script>")).toBeNull();
    });
});
