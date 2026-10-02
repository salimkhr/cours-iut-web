import {describe, expect, test} from "bun:test";
import {quizQuestionSchema, quizSchema} from "@/lib/schemas/quiz.schema";

const text = {id: "b1", type: "text", props: {content: "Que vaut 1+1 ?"}};
const base = () => ({
    id: "q1",
    blocks: [text],
    options: [
        {id: "a", text: "2", correct: true},
        {id: "b", text: "3", correct: false},
    ],
});

describe("quizQuestionSchema", () => {
    test("accepte une question valide et applique les défauts", () => {
        const r = quizQuestionSchema.safeParse(base());
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.weight).toBe(1);
            expect(r.data.durationSeconds).toBe(30);
        }
    });

    test("refuse moins de deux propositions", () => {
        expect(quizQuestionSchema.safeParse({...base(), options: [{id: "a", text: "2", correct: true}]}).success).toBe(false);
    });

    test("refuse l'absence de bonne ou de mauvaise proposition", () => {
        const noCorrect = {...base(), options: base().options.map((o) => ({...o, correct: false}))};
        const noWrong = {...base(), options: base().options.map((o) => ({...o, correct: true}))};
        expect(quizQuestionSchema.safeParse(noCorrect).success).toBe(false);
        expect(quizQuestionSchema.safeParse(noWrong).success).toBe(false);
    });

    test("refuse les doublons de texte", () => {
        const dup = {...base(), options: [{id: "a", text: "2", correct: true}, {id: "b", text: " 2 ", correct: false}]};
        expect(quizQuestionSchema.safeParse(dup).success).toBe(false);
    });

    test("refuse poids nul ou négatif", () => {
        expect(quizQuestionSchema.safeParse({...base(), weight: 0}).success).toBe(false);
        expect(quizQuestionSchema.safeParse({...base(), weight: -1}).success).toBe(false);
    });

    test("durée bornée entre 5 et 300 s", () => {
        expect(quizQuestionSchema.safeParse({...base(), durationSeconds: 4}).success).toBe(false);
        expect(quizQuestionSchema.safeParse({...base(), durationSeconds: 301}).success).toBe(false);
        expect(quizQuestionSchema.safeParse({...base(), durationSeconds: 5}).success).toBe(true);
        expect(quizQuestionSchema.safeParse({...base(), durationSeconds: 300}).success).toBe(true);
    });

    test("refuse un bloc non autorisé, y compris imbriqué", () => {
        const input = {id: "b2", type: "input-card", props: {}};
        expect(quizQuestionSchema.safeParse({...base(), blocks: [input]}).success).toBe(false);
        const nested = {
            id: "b3", type: "callout", props: {variant: "info", title: "t"},
            children: [{id: "b4", type: "collapsible", props: {title: "x"}, children: []}],
        };
        expect(quizQuestionSchema.safeParse({...base(), blocks: [nested]}).success).toBe(false);
    });
});

describe("quizSchema", () => {
    test("accepte un brouillon sans question mais exige negativeMarking", () => {
        expect(quizSchema.safeParse({negativeMarking: false, questions: []}).success).toBe(true);
        expect(quizSchema.safeParse({questions: []}).success).toBe(false);
    });
});
