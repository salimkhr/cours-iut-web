import { describe, expect, test } from "bun:test";
import { REGISTERED_LANGUAGES, normalizeLanguage } from "@/lib/syntaxHighlighter";

describe("normalizeLanguage", () => {
    test("mappe les alias du projet vers un langage enregistré", () => {
        expect(normalizeLanguage("html")).toBe("markup");
        expect(normalizeLanguage("xml")).toBe("markup");
        expect(normalizeLanguage("js")).toBe("javascript");
        expect(normalizeLanguage("ts")).toBe("typescript");
        expect(normalizeLanguage("sh")).toBe("bash");
        expect(normalizeLanguage("SH")).toBe("bash");
        expect(normalizeLanguage("shell")).toBe("bash");
        expect(normalizeLanguage("yml")).toBe("yaml");
    });

    test("laisse passer un langage déjà canonique", () => {
        expect(normalizeLanguage("php")).toBe("php");
        expect(normalizeLanguage("twig")).toBe("twig");
        expect(normalizeLanguage("brainfuck")).toBe("brainfuck");
    });

    test("renvoie 'text' pour un langage inconnu ou vide", () => {
        expect(normalizeLanguage("cobol")).toBe("text");
        expect(normalizeLanguage("txt")).toBe("text");
        expect(normalizeLanguage("")).toBe("text");
    });
});

describe("REGISTERED_LANGUAGES", () => {
    test("couvre tous les langages utilisés dans les cours", () => {
        // Relevé par: grep -rhoE 'language="[a-zA-Z]+"' src/cours | sort -u
        const utilises = [
            "php", "javascript", "html", "twig", "bash", "typescript",
            "js", "json", "sql", "css", "jsx", "brainfuck", "sh", "xml",
        ];
        for (const lang of utilises) {
            expect(REGISTERED_LANGUAGES).toContain(normalizeLanguage(lang));
        }
    });
});
