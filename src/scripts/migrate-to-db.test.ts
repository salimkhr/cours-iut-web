/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { deriveSlug } from "./migrate-to-db";

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
