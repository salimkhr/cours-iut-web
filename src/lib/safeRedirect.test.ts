import {describe, expect, test} from "bun:test";
import {safeRedirectPath} from "@/lib/safeRedirect";

describe("safeRedirectPath", () => {
    test("accepte un chemin interne avec requête", () => {
        expect(safeRedirectPath("/quiz/abc_123?x=1")).toBe("/quiz/abc_123?x=1");
    });

    test("refuse URL absolue, protocole-relatif, antislash et vide", () => {
        for (const bad of ["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", "", null, undefined]) {
            expect(safeRedirectPath(bad)).toBe("/");
        }
    });

    test("prend le premier élément d'un tableau et respecte le repli", () => {
        expect(safeRedirectPath(["/account", "/x"])).toBe("/account");
        expect(safeRedirectPath("nope", "/home")).toBe("/home");
    });
});
