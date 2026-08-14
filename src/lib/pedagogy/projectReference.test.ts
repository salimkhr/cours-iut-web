import {describe, expect, test} from "bun:test";
import {referenceProjectSlug, assertReferenceFiles} from "@/lib/pedagogy/projectReference";

describe("referenceProjectSlug", () => {
    test("préfixe le slug du module", () => {
        expect(referenceProjectSlug("rust")).toBe("projet-reference-rust");
    });
});

describe("assertReferenceFiles", () => {
    test("refuse une liste vide", () => {
        expect(() => assertReferenceFiles([])).toThrow(/au moins un fichier/);
    });
    test("refuse un chemin absolu", () => {
        expect(() => assertReferenceFiles([{path: "/etc/passwd", content: "x"}])).toThrow(/relatif/);
    });
    test("refuse une remontée de dossier", () => {
        expect(() => assertReferenceFiles([{path: "../hors", content: "x"}])).toThrow(/relatif/);
    });
    test("accepte des chemins relatifs normaux", () => {
        expect(() => assertReferenceFiles([
            {path: "src/main.rs", content: "fn main() {}"},
            {path: "Cargo.toml", content: "[package]"},
        ])).not.toThrow();
    });
});
