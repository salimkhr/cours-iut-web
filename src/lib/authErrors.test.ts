import {describe, expect, test} from "bun:test";
import {authErrorMessage} from "@/lib/authErrors";

describe("authErrorMessage", () => {
    test("traduit un code connu", () => {
        expect(authErrorMessage({code: "INVALID_USERNAME_OR_PASSWORD"}, "x")).toBe("Identifiant ou mot de passe incorrect.");
    });
    test("429 prime sur le code", () => {
        expect(authErrorMessage({code: "INVALID_PASSWORD", status: 429}, "x")).toMatch(/Trop de tentatives/);
    });
    test("code inconnu ou absent : message de repli, jamais l'anglais de better-auth", () => {
        expect(authErrorMessage({code: "SOMETHING_NEW"}, "Repli.")).toBe("Repli.");
        expect(authErrorMessage(null, "Repli.")).toBe("Repli.");
    });
});
