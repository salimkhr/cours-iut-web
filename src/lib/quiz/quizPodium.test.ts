import {describe, expect, test} from "bun:test";
import {formatPublicName, rankParticipants, topOfPodium} from "@/lib/quiz/quizPodium";

const p = (userId: string, firstName: string, lastName: string, score: number, timeMs: number) =>
    ({userId, firstName, lastName, score, timeMs});

describe("rankParticipants", () => {
    test("la note prime sur la vitesse", () => {
        const r = rankParticipants([p("1", "A", "A", 2, 1000), p("2", "B", "B", 3, 90_000)]);
        expect(r.map((x) => x.userId)).toEqual(["2", "1"]);
    });

    test("égalité de note : le plus rapide devant", () => {
        const r = rankParticipants([p("1", "A", "A", 3, 5000), p("2", "B", "B", 3, 2000)]);
        expect(r.map((x) => x.userId)).toEqual(["2", "1"]);
        expect(r.map((x) => x.rank)).toEqual([1, 2]);
    });

    test("égalité totale : ordre alphabétique, même rang", () => {
        const r = rankParticipants([p("1", "Zoé", "Martin", 3, 5000), p("2", "Ana", "Bernard", 3, 5000)]);
        expect(r.map((x) => x.userId)).toEqual(["2", "1"]);
        expect(r.map((x) => x.rank)).toEqual([1, 1]);
    });
});

describe("formatPublicName", () => {
    test("Prénom N.", () => {
        expect(formatPublicName(" Salim ", "khraimeche")).toBe("Salim K.");
        expect(formatPublicName("Élodie", "Évrard")).toBe("Élodie É.");
    });

    test("nom vide", () => {
        expect(formatPublicName("Salim", " ")).toBe("Salim");
    });
});

describe("topOfPodium", () => {
    test("jamais plus de n entrées", () => {
        const r = rankParticipants([1, 2, 3, 4, 5].map((i) => p(String(i), "A", "B", i, i)));
        expect(topOfPodium(r)).toHaveLength(3);
        expect(topOfPodium(r, 2)).toHaveLength(2);
    });
});
