import { describe, it, expect } from "bun:test";
import { briefSchema, curriculumSchema, sectionApiSchema } from "./section.schema";

describe("briefSchema", () => {
    it("accepte un brief complet", () => {
        const r = briefSchema.safeParse({
            objectives: ["Manipuler le DOM"],
            notions: ["querySelector", "addEventListener"],
            filRougeStep: "Le catalogue affiche les films depuis un tableau JS",
            notes: "Insister sur la différence NodeList/Array",
        });
        expect(r.success).toBe(true);
    });

    it("applique les défauts sur un brief vide", () => {
        const r = briefSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.objectives).toEqual([]);
            expect(r.data.notions).toEqual([]);
            expect(r.data.filRougeStep).toBe("");
        }
    });
});

describe("curriculumSchema", () => {
    it("accepte notions + apis", () => {
        const r = curriculumSchema.safeParse({
            notions: ["sélection d'éléments", "événements click"],
            apis: ["document.querySelector", "element.addEventListener"],
        });
        expect(r.success).toBe(true);
    });
});

describe("sectionApiSchema — nouveaux champs", () => {
    const base = {
        title: "Le DOM", path: "1-le-dom", totalDuration: 2,
        hasCorrection: false, isAvailable: false, correctionIsAvailable: false,
        examenIsLock: false, order: 1, contents: ["cours", "TP"],
        objectives: [], tags: [],
    };

    it("accepte courseIntroMinutes, brief et curriculum", () => {
        const r = sectionApiSchema.safeParse({
            ...base,
            courseIntroMinutes: 30,
            brief: { objectives: ["a"], notions: ["b"], filRougeStep: "c" },
            curriculum: { notions: ["b"], apis: ["x"] },
        });
        expect(r.success).toBe(true);
    });

    it("les nouveaux champs sont optionnels (rétrocompatibilité)", () => {
        expect(sectionApiSchema.safeParse(base).success).toBe(true);
    });

    it("rejette courseIntroMinutes négatif", () => {
        expect(sectionApiSchema.safeParse({ ...base, courseIntroMinutes: -10 }).success).toBe(false);
    });
});
