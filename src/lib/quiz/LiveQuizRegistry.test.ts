import {describe, expect, test} from "bun:test";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import type {QuizPublicState} from "@/lib/quiz/quizPublicState";

const fake = (audience: "projection" | "student", extra = {}): QuizPublicState =>
    ({audience, ...extra} as unknown as QuizPublicState);

describe("LiveQuizRegistry", () => {
    test("chaque audience reçoit son propre état", () => {
        const registry = new LiveQuizRegistry();
        const seen: string[] = [];
        registry.subscribe("s", "projection", (st) => seen.push(`p:${st.audience}`));
        registry.subscribe("s", {userId: "u1"}, (st) => seen.push(`s:${st.audience}`));
        registry.publish("s", (aud) => aud === "projection" ? fake("projection") : fake("student"));
        expect(seen.sort()).toEqual(["p:projection", "s:student"]);
    });

    test("désabonnement propre", () => {
        const registry = new LiveQuizRegistry();
        const unsub = registry.subscribe("s", "projection", () => {});
        expect(registry.subscriberCount("s")).toBe(1);
        unsub();
        expect(registry.subscriberCount("s")).toBe(0);
    });

    test("un abonné défaillant n'empêche pas les autres", () => {
        const registry = new LiveQuizRegistry();
        let received = 0;
        registry.subscribe("s", "projection", () => {
            throw new Error("flux fermé");
        });
        registry.subscribe("s", "projection", () => {
            received++;
        });
        registry.publish("s", () => fake("projection"));
        expect(received).toBe(1);
        expect(registry.subscriberCount("s")).toBe(1);
    });

    test("publier sans abonné ne fait rien", () => {
        new LiveQuizRegistry().publish("x", () => {
            throw new Error("ne doit pas être appelé");
        });
    });
});
