import {describe, expect, test} from "bun:test";
import {shuffleOptions} from "@/lib/quiz/quizOptionOrder";

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
