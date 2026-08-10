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

test("needsScripts est vrai dès qu'un panneau porte du JavaScript", () => {
    expect(buildPreviewDocument({
        language: "javascript", code: "alert(1)", preview: "<p>x</p>",
    }).needsScripts).toBe(true);

    expect(buildPreviewDocument({
        language: "css", code: ".a{}", preview: "<p>x</p>",
    }).needsScripts).toBe(false);
});

test("needsScripts ignore un panneau JavaScript vide", () => {
    expect(buildPreviewDocument({
        language: "javascript", code: "", preview: "<p>x</p>",
    }).needsScripts).toBe(false);
});

test("editable exige que TOUS les langages soient exécutables", () => {
    // Marqueurs présents : isole la règle conjonctive du garde-fou « le code
    // doit réellement atteindre le rendu » (couvert séparément plus bas).
    expect(buildPreviewDocument({
        language: "css", code: ".a{}",
        secondaryLanguage: "html", secondaryCode: "<p>x</p>",
        preview: "<style>/* @edit:css */</style><!-- @edit:html -->",
    }).editable).toBe(true);

    expect(buildPreviewDocument({
        language: "php", code: "<?php echo 1;",
        secondaryLanguage: "html", secondaryCode: "<form></form>",
        preview: "<form></form>",
    }).editable).toBe(false);
});

test("editable est faux sans aperçu", () => {
    expect(buildPreviewDocument({
        language: "css", code: ".a{}",
    }).editable).toBe(false);
});

test("editable est faux quand le gabarit sans marqueur remplace le code", () => {
    // HTML sans marqueur : `buildLegacyDocument` construit le document à partir
    // de `preview` seul et ne lit jamais `code`. Un bouton « Modifier » ici
    // ouvrirait un éditeur dont les frappes n'atteindraient jamais l'aperçu.
    expect(buildPreviewDocument({
        language: "html",
        code: "<p>ignoré</p>",
        preview: "<p>retenu</p>",
    }).editable).toBe(false);
});

test("editable redevient vrai dès que le même gabarit porte un marqueur", () => {
    expect(buildPreviewDocument({
        language: "html",
        code: "<p>ignoré</p>",
        preview: "<!-- @edit:html --><p>retenu</p>",
    }).editable).toBe(true);
});

test("editable reste vrai pour le CSS sans marqueur : le code atteint le <style>", () => {
    expect(buildPreviewDocument({
        language: "css",
        code: ".intro { color: red }",
        preview: "<p class=\"intro\">Bonjour</p>",
    }).editable).toBe(true);
});

test("editable est faux pour un CSS + panneau secondaire sans marqueur : secondaryCode n'atteint jamais le rendu", () => {
    // Même piège que le bloc HTML sans marqueur, mais limité au panneau
    // secondaire : buildLegacyDocument (branche CSS) n'injecte que `code`
    // dans <style>, jamais `secondaryCode`. Éditable ici ouvrirait un
    // « Modifier » sur le panneau HTML dont la frappe serait ignorée.
    expect(buildPreviewDocument({
        language: "css",
        code: ".a { color: red }",
        secondaryLanguage: "html",
        secondaryCode: "<p>ignoré</p>",
        preview: "<p>retenu</p>",
    }).editable).toBe(false);
});

test("editable redevient vrai pour le CSS + panneau secondaire dès qu'un marqueur cible le secondaire", () => {
    expect(buildPreviewDocument({
        language: "css",
        code: ".a { color: red }",
        secondaryLanguage: "html",
        secondaryCode: "<p>retenu</p>",
        preview: "<style>/* @edit:css */</style><!-- @edit:html -->",
    }).editable).toBe(true);
});
