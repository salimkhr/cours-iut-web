/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { deriveSlug, serializeInline } from "./migrate-to-db";
import * as cheerio from "cheerio";
import type { Element as DOMElement } from "domhandler";

test("cours tsx", () => {
    expect(deriveSlug("src/cours/javascript/1-le-dom/Cours.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "1-le-dom",
        contentType: "cours",
    });
});

test("TP tsx", () => {
    expect(deriveSlug("src/cours/php/3-le-mvc/TP.tsx")).toEqual({
        moduleSlug: "php",
        sectionSlug: "3-le-mvc",
        contentType: "TP",
    });
});

test("Slide tsx", () => {
    expect(deriveSlug("src/cours/javascript/2-les-evenements/Slide.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "2-les-evenements",
        contentType: "slide",
    });
});

test("Examen tsx", () => {
    expect(deriveSlug("src/cours/javascript/6-examen/Examen.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "6-examen",
        contentType: "examen",
    });
});

function loadEl(html: string) {
    const $ = cheerio.load(html, { xmlMode: true });
    const cheerioEl = $.root().children().first();
    const el = cheerioEl[0] as DOMElement; // Cheerio wrapper contains raw DOMElement at index 0
    return { $, el };
}

test("serializeInline - texte brut", () => {
    const { $, el } = loadEl("<Text>Bonjour monde</Text>");
    expect(serializeInline($, el)).toBe("Bonjour monde");
});

test("serializeInline - strong + em", () => {
    const { $, el } = loadEl("<Text><strong>gras</strong> et <em>italique</em></Text>");
    expect(serializeInline($, el)).toBe("**gras** et _italique_");
});

test("serializeInline - Code inline", () => {
    const { $, el } = loadEl("<Text>voir <Code>document.getElementById</Code></Text>");
    expect(serializeInline($, el)).toBe("voir `document.getElementById`");
});

test("serializeInline - lien", () => {
    const { $, el } = loadEl(`<Text><a href="https://mdn.io">MDN</a></Text>`);
    expect(serializeInline($, el)).toBe("[MDN](https://mdn.io)");
});

test("serializeInline - entités HTML", () => {
    const { $, el } = loadEl("<Text>l&apos;élève &amp; le &quot;prof&quot;</Text>");
    expect(serializeInline($, el)).toBe("l'élève & le \"prof\"");
});
