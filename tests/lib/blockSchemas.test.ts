// tests/lib/blockSchemas.test.ts
import { describe, it, expect } from "bun:test";
import {
    blockPropsSchemas,
    isContainer,
    canDrop,
    COLUMN_PRESETS,
    COL_SPAN_CLASS,
    MAX_DEPTH,
} from "@/lib/blockSchemas";

describe("blockPropsSchemas", () => {
    it("connaît tous les types de blocs", () => {
        const expected = [
            "text", "heading", "list", "list-item", "columns", "column",
            "callout", "collapsible", "code", "code-with-preview", "diagram",
            "download-file", "quote", "divider", "image-card", "table", "section-card",
        ];
        for (const type of expected) {
            expect(blockPropsSchemas[type]).toBeDefined();
        }
    });

    it("accepte un text vide (bloc fraîchement inséré)", () => {
        expect(blockPropsSchemas["text"].safeParse({ content: "" }).success).toBe(true);
    });

    it("coerce heading.level depuis une string (Select du PropsPanel)", () => {
        expect(blockPropsSchemas["heading"].safeParse({ level: "2", text: "Titre" }).success).toBe(true);
        expect(blockPropsSchemas["heading"].safeParse({ level: 4, text: "Titre" }).success).toBe(false);
    });

    it("refuse un span de colonne hors liste autorisée", () => {
        expect(blockPropsSchemas["column"].safeParse({ span: 6 }).success).toBe(true);
        expect(blockPropsSchemas["column"].safeParse({ span: 5 }).success).toBe(false);
    });
});

describe("isContainer", () => {
    it("identifie les conteneurs", () => {
        expect(isContainer("list")).toBe(true);
        expect(isContainer("columns")).toBe(true);
        expect(isContainer("callout")).toBe(true);
        expect(isContainer("text")).toBe(false);
        expect(isContainer("code")).toBe(false);
    });
});

describe("canDrop", () => {
    it("autorise les feuilles partout (racine, column, list-item, callout)", () => {
        expect(canDrop("text", null)).toBe(true);
        expect(canDrop("code", "column")).toBe(true);
        expect(canDrop("code", "list-item")).toBe(true);
        expect(canDrop("diagram", "callout")).toBe(true);
    });

    it("restreint columns à la racine", () => {
        expect(canDrop("columns", null)).toBe(true);
        expect(canDrop("columns", "column")).toBe(false);
        expect(canDrop("columns", "list-item")).toBe(false);
        expect(canDrop("columns", "callout")).toBe(false);
    });

    it("restreint column à columns et list-item à list", () => {
        expect(canDrop("column", "columns")).toBe(true);
        expect(canDrop("column", null)).toBe(false);
        expect(canDrop("list-item", "list")).toBe(true);
        expect(canDrop("list-item", null)).toBe(false);
        expect(canDrop("list-item", "callout")).toBe(false);
    });

    it("restreint les enfants de columns et list", () => {
        expect(canDrop("text", "columns")).toBe(false);
        expect(canDrop("text", "list")).toBe(false);
    });

    it("refuse de déposer dans une feuille", () => {
        expect(canDrop("text", "code")).toBe(false);
        expect(canDrop("text", "text")).toBe(false);
    });

    it("autorise les listes imbriquées (liste de listes)", () => {
        expect(canDrop("list", "list-item")).toBe(true);
    });
});

describe("COLUMN_PRESETS / COL_SPAN_CLASS", () => {
    it("chaque preset somme à 12 et chaque span a une classe", () => {
        for (const preset of COLUMN_PRESETS) {
            expect(preset.spans.reduce((a, b) => a + b, 0)).toBe(12);
            for (const span of preset.spans) {
                expect(COL_SPAN_CLASS[span]).toBeDefined();
            }
        }
    });
});

describe("MAX_DEPTH", () => {
    it("vaut 8", () => {
        expect(MAX_DEPTH).toBe(8);
    });
});
