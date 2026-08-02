import { readFileSync } from "node:fs";
import { describe, expect, test } from "bun:test";
import { isKnownLanguage, normalizeLanguage, REGISTERED_LANGUAGES } from "@/lib/syntaxHighlighter";

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

    test("renvoie 'text' pour un langage inconnu, vide ou absent", () => {
        expect(normalizeLanguage("cobol")).toBe("text");
        expect(normalizeLanguage("txt")).toBe("text");
        expect(normalizeLanguage("")).toBe("text");
        expect(normalizeLanguage(undefined)).toBe("text");
        expect(normalizeLanguage(null)).toBe("text");
    });
});

/**
 * Langages volontairement rendus sans coloration (pas d'entrée Prism dédiée,
 * ni pertinente : sortie de programme, texte brut...).
 */
const NON_COLORES = ["txt", "text"];

/**
 * Limite connue : ce scan ne couvre que les cours encore au format `.tsx`.
 * Les contenus déjà migrés en base MongoDB (cf. `src/lib/blockDefs.ts`) ne sont
 * pas visibles ici et ne sont donc pas couverts par ce filet de sécurité.
 */
function collectLanguagesUsedInCours(): Set<string> {
    const files = Array.from(new Bun.Glob("**/*.tsx").scanSync("src/cours"));
    if (files.length === 0) {
        throw new Error(
            "Aucun fichier .tsx trouvé sous src/cours : le scan ne peut pas valider la couverture des langages. " +
            "Le dossier a-t-il été déplacé ou entièrement migré vers MongoDB ?",
        );
    }

    const languages = new Set<string>();
    const pattern = /language="([a-zA-Z]+)"/g;
    for (const file of files) {
        const content = readFileSync(`src/cours/${file}`, "utf-8");
        for (const match of content.matchAll(pattern)) {
            languages.add(match[1].toLowerCase());
        }
    }
    return languages;
}

describe("REGISTERED_LANGUAGES", () => {
    test("couvre tous les langages utilisés dans les cours, sauf liste blanche explicite", () => {
        const utilises = collectLanguagesUsedInCours();
        for (const lang of utilises) {
            const reconnu = isKnownLanguage(lang);
            const volontairementNonColore = NON_COLORES.includes(lang);
            expect(
                reconnu || volontairementNonColore,
                `"${lang}" n'est ni un langage enregistré (${REGISTERED_LANGUAGES.join(", ")}) ` +
                `ni dans la liste blanche NON_COLORES (${NON_COLORES.join(", ")}). ` +
                "Ajoute-le à REGISTERED_LANGUAGES/ALIASES ou à NON_COLORES si le choix est volontaire.",
            ).toBe(true);
        }
    });
});
