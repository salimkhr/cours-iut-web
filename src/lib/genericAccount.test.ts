import {describe, expect, test} from "bun:test";
import {isGenericAccount} from "@/lib/genericAccount";

describe("isGenericAccount", () => {
    test("reconnaît le compte générique de l'intranet", () => {
        expect(isGenericAccount({email: "cours@salimkhraimeche.dev"})).toBe(true);
    });

    test("ignore la casse", () => {
        expect(isGenericAccount({email: "Cours@SalimKhraimeche.DEV"})).toBe(true);
    });

    test("refuse un compte étudiant", () => {
        expect(isGenericAccount({email: "aa251867@etu.univ-lehavre.fr"})).toBe(false);
    });

    test("refuse un e-mail absent", () => {
        expect(isGenericAccount({email: null})).toBe(false);
        expect(isGenericAccount({})).toBe(false);
    });
});
