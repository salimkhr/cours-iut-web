import {test, expect} from "bun:test";
import {isRunnable} from "@/lib/previewDocument";

test("reconnaît les langages exécutables par le navigateur", () => {
    expect(isRunnable("html")).toBe(true);
    expect(isRunnable("css")).toBe(true);
    expect(isRunnable("javascript")).toBe(true);
});

test("accepte les alias de langage", () => {
    expect(isRunnable("js")).toBe(true);
    expect(isRunnable("HTML")).toBe(true);
    expect(isRunnable("xml")).toBe(true);
});

test("rejette les langages sans interpréteur navigateur", () => {
    for (const lang of ["php", "rust", "sql", "bash", "json"]) {
        expect(isRunnable(lang)).toBe(false);
    }
});

test("rejette les langages qui exigeraient une transpilation", () => {
    for (const lang of ["typescript", "jsx", "tsx"]) {
        expect(isRunnable(lang)).toBe(false);
    }
});

test("tolère l'absence de langage", () => {
    expect(isRunnable(null)).toBe(false);
    expect(isRunnable(undefined)).toBe(false);
    expect(isRunnable("")).toBe(false);
});

import {buildPreviewDocument} from "@/lib/previewDocument";

test("CSS : le code devient la feuille de style et preview le corps", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".intro { color: red }",
        preview: "<p class=\"intro\">Bonjour</p>",
    });

    expect(html).toContain("<style>.intro { color: red }</style>");
    expect(html).toContain("<p class=\"intro\">Bonjour</p>");
});

test("CSS sans preview : injecte la page de démonstration par défaut", () => {
    const {html} = buildPreviewDocument({language: "css", code: "body { margin: 0 }"});

    expect(html).toContain("Catalogue des formations");
    expect(html).toContain("body { margin: 0 }");
});

test("HTML : preview fait office de document quand il est fourni", () => {
    const {html} = buildPreviewDocument({
        language: "html",
        code: "<p>ignoré</p>",
        preview: "<p>retenu</p>",
    });

    expect(html).toContain("<p>retenu</p>");
    expect(html).not.toContain("ignoré");
});

test("HTML : un document complet dans preview est renvoyé tel quel", () => {
    const doc = "<html lang=\"fr\"><body><p>Salut</p></body></html>";
    const {html} = buildPreviewDocument({language: "html", code: "", preview: doc});

    expect(html).toBe(doc);
});

test("HTML sans preview : le code sert de corps de document", () => {
    const {html} = buildPreviewDocument({language: "html", code: "<p>Bonjour</p>"});

    expect(html).toContain("<p>Bonjour</p>");
    expect(html).toContain("<!doctype html>");
});

const GABARIT = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>/* @edit:css */</style></head>
<body><!-- @edit:html --><script>/* @edit:js */</script></body></html>`;

test("injecte chaque code au marqueur de son langage", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".intro { color: red }",
        secondaryLanguage: "html",
        secondaryCode: "<p class=\"intro\">Bonjour</p>",
        preview: GABARIT,
    });

    expect(html).toContain("<style>.intro { color: red }</style>");
    expect(html).toContain("<p class=\"intro\">Bonjour</p>");
    expect(html).not.toContain("@edit");
});

test("injecte le JavaScript au marqueur js", () => {
    const {html} = buildPreviewDocument({
        language: "javascript",
        code: "document.body.dataset.ok = '1';",
        secondaryLanguage: "html",
        secondaryCode: "<p>Bonjour</p>",
        preview: GABARIT,
    });

    expect(html).toContain("document.body.dataset.ok = '1';");
    expect(html).toContain("<p>Bonjour</p>");
});

test("un marqueur sans code correspondant est retiré", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".a { color: red }",
        preview: GABARIT,
    });

    expect(html).not.toContain("@edit");
    expect(html).toContain("<script></script>");
});

test("deux codes de même langage sont concaténés dans l'ordre des panneaux", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".a { color: red }",
        secondaryLanguage: "css",
        secondaryCode: ".b { color: blue }",
        preview: "<style>/* @edit:css */</style>",
    });

    expect(html).toContain(".a { color: red }\n.b { color: blue }");
});

test("les alias de langage sont appariés aux marqueurs", () => {
    const {html} = buildPreviewDocument({
        language: "js",
        code: "console.log(1);",
        preview: "<script>/* @edit:js */</script>",
    });

    expect(html).toContain("console.log(1);");
});

test("non-régression : un gabarit sans marqueur garde l'assemblage historique", () => {
    const sansMarqueur = {
        language: "css",
        code: ".intro { color: red }",
        preview: "<p class=\"intro\">Bonjour</p>",
    };

    expect(buildPreviewDocument(sansMarqueur).html)
        .toContain("<style>.intro { color: red }</style>");
    expect(buildPreviewDocument(sansMarqueur).html)
        .toContain("<p class=\"intro\">Bonjour</p>");
});
