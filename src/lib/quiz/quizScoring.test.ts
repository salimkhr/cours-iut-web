import {describe, expect, test} from "bun:test";
import {scoreQuestion} from "@/lib/quiz/quizScoring";

const q = {weight: 1, correctIds: ["a", "b", "c"], incorrectIds: ["x", "y"]};

describe("scoreQuestion", () => {
    test("toutes les bonnes réponses = poids", () => {
        expect(scoreQuestion({...q, selectedIds: ["a", "b", "c"], negativeMarking: false})).toBe(1);
    });

    test("crédit partiel : 2 bonnes sur 3", () => {
        expect(scoreQuestion({...q, selectedIds: ["a", "b"], negativeMarking: false})).toBe(0.6667);
    });

    test("aucune sélection = 0", () => {
        expect(scoreQuestion({...q, selectedIds: [], negativeMarking: true})).toBe(0);
    });

    test("sans négatif, les mauvaises ne pénalisent pas", () => {
        expect(scoreQuestion({...q, selectedIds: ["a", "x", "y"], negativeMarking: false})).toBe(0.3333);
    });

    test("avec négatif : pénalité proportionnelle et plancher à 0", () => {
        const two = {weight: 1, correctIds: ["a", "b"], incorrectIds: ["x", "y"]};
        expect(scoreQuestion({...two, selectedIds: ["a", "x"], negativeMarking: true})).toBe(0);
        expect(scoreQuestion({...two, selectedIds: ["a", "b", "x"], negativeMarking: true})).toBe(0.5);
        expect(scoreQuestion({...two, selectedIds: ["a", "x", "y"], negativeMarking: true})).toBe(0);
    });

    test("tout sélectionner : W sans négatif, 0 avec", () => {
        const all = ["a", "b", "c", "x", "y"];
        expect(scoreQuestion({...q, selectedIds: all, negativeMarking: false})).toBe(1);
        expect(scoreQuestion({...q, selectedIds: all, negativeMarking: true})).toBe(0);
    });

    test("poids décimal", () => {
        expect(scoreQuestion({...q, weight: 2.5, selectedIds: ["a", "b", "c"], negativeMarking: false})).toBe(2.5);
    });

    test("ignore les ids inconnus", () => {
        expect(scoreQuestion({...q, selectedIds: ["a", "zzz"], negativeMarking: true})).toBe(0.3333);
    });
});
