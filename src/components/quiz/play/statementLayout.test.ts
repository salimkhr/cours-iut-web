import {describe, expect, test} from "bun:test";
import {splitStatement} from "@/components/quiz/play/statementLayout";
import type {Block} from "@/types/CourseContent";

const text = (id: string) => ({id, type: "text", props: {content: id}}) as Block;
const code = (id: string) => ({id, type: "code", props: {language: "php", code: "echo 1;"}}) as Block;
const ids = (blocks: Block[]) => blocks.map((b) => b.id);

describe("splitStatement", () => {
    test("contexte et code à gauche, question finale à droite", () => {
        const {context, prompt} = splitStatement([text("contexte"), code("code"), text("question")]);
        expect(ids(context)).toEqual(["contexte", "code"]);
        expect(ids(prompt)).toEqual(["question"]);
    });

    test("plusieurs textes après le dernier code passent tous à droite", () => {
        const {context, prompt} = splitStatement([code("a"), text("t1"), code("b"), text("t2"), text("t3")]);
        expect(ids(context)).toEqual(["a", "t1", "b"]);
        expect(ids(prompt)).toEqual(["t2", "t3"]);
    });

    test("sans code : pas de colonne de gauche", () => {
        const {context, prompt} = splitStatement([text("q")]);
        expect(context).toEqual([]);
        expect(ids(prompt)).toEqual(["q"]);
    });

    test("code en dernier : tout reste à gauche, rien n'est perdu", () => {
        const {context, prompt} = splitStatement([text("q"), code("c")]);
        expect(ids(context)).toEqual(["q", "c"]);
        expect(prompt).toEqual([]);
    });
});
