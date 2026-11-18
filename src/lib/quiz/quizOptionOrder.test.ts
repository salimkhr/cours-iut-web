import {describe, expect, test} from "bun:test";
import {questionsFor, shuffleOptions} from "@/lib/quiz/quizOptionOrder";

const options = ["a", "b", "c", "d", "e", "f"].map((id) => ({id, text: id.toUpperCase()}));

describe("shuffleOptions", () => {
    test("même graine, même ordre (reconnexion, redémarrage, autre audience)", () => {
        expect(shuffleOptions(options, "s1:q1")).toEqual(shuffleOptions(options, "s1:q1"));
    });
    test("ne perd ni ne duplique aucune proposition et ne modifie pas l'entrée", () => {
        const copy = [...options];
        const shuffled = shuffleOptions(options, "s1:q1");
        expect(shuffled.map((o) => o.id).sort()).toEqual(["a", "b", "c", "d", "e", "f"]);
        expect(options).toEqual(copy);
    });
    test("l'ordre dépend de la graine : plusieurs graines donnent plusieurs ordres", () => {
        const orders = new Set(["s1:q1", "s1:q2", "s2:q1", "s2:q2", "s3:q9"].map((seed) => shuffleOptions(options, seed).map((o) => o.id).join("")));
        expect(orders.size).toBeGreaterThan(1);
    });
    test("l'ordre saisi n'est pas conservé systématiquement", () => {
        const kept = ["x1", "x2", "x3", "x4", "x5", "x6"].filter((seed) => shuffleOptions(options, seed).map((o) => o.id).join("") === "abcdef");
        expect(kept.length).toBeLessThan(6);
    });
});

describe("questionsFor", () => {
    const questions = [
        {id: "w", weight: 0},
        ...Array.from({length: 10}, (_, i) => ({id: `q${i}`, weight: 1})),
    ];

    test("l'échauffement (poids 0) reste en tête, le reste est une permutation", () => {
        const order = questionsFor(questions, "s1:u1");
        expect(order[0].id).toBe("w");
        expect(order.map((q) => q.id).sort()).toEqual(questions.map((q) => q.id).sort());
    });

    test("stable pour un même étudiant, différent d'un étudiant à l'autre", () => {
        expect(questionsFor(questions, "s1:u1")).toEqual(questionsFor(questions, "s1:u1"));
        const orders = new Set(Array.from({length: 10}, (_, i) => questionsFor(questions, `s1:u${i}`).map((q) => q.id).join()));
        expect(orders.size).toBeGreaterThan(5);
    });

    test("plusieurs questions d'échauffement gardent leur ordre d'origine", () => {
        const withTwo = [{id: "w1", weight: 0}, {id: "a", weight: 1}, {id: "w2", weight: 0}, {id: "b", weight: 1}];
        expect(questionsFor(withTwo, "s:u").slice(0, 2).map((q) => q.id)).toEqual(["w1", "w2"]);
    });
});
