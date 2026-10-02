import {describe, expect, test} from "bun:test";
import {closeQuestion, InvalidTransitionError, isOpenAt, nextQuestion, startQuiz} from "@/lib/quiz/quizMachine";

type State = Parameters<typeof startQuiz>[0];

const lobby = (): State => ({
    phase: "lobby",
    questionIndex: -1,
    questionStartedAt: null,
    deadline: null,
    endedAt: null,
    quiz: {questions: [{durationSeconds: 30}, {durationSeconds: 10}]},
});

describe("quizMachine", () => {
    test("lobby → question_open avec échéance serveur", () => {
        const s = startQuiz(lobby(), 1000);
        expect(s.phase).toBe("question_open");
        expect(s.questionIndex).toBe(0);
        expect(s.deadline).toBe(31_000);
    });

    test("question_open → reveal → question suivante", () => {
        const reveal = closeQuestion(startQuiz(lobby(), 0));
        expect(reveal.phase).toBe("reveal");
        expect(reveal.deadline).toBeNull();
        const next = nextQuestion(reveal, 50_000);
        expect(next.questionIndex).toBe(1);
        expect(next.deadline).toBe(60_000);
    });

    test("dernière question → finished", () => {
        let s = nextQuestion(closeQuestion(startQuiz(lobby(), 0)), 1);
        s = nextQuestion(closeQuestion(s), 99);
        expect(s.phase).toBe("finished");
        expect(s.endedAt).toBe(99);
    });

    test("transitions invalides", () => {
        expect(() => closeQuestion(lobby())).toThrow(InvalidTransitionError);
        expect(() => nextQuestion(lobby(), 0)).toThrow(InvalidTransitionError);
        expect(() => startQuiz(startQuiz(lobby(), 0), 0)).toThrow(InvalidTransitionError);
        const finished: State = {...lobby(), phase: "finished"};
        expect(() => startQuiz(finished, 0)).toThrow(InvalidTransitionError);
    });

    test("quiz vide refusé au démarrage", () => {
        expect(() => startQuiz({...lobby(), quiz: {questions: []}}, 0)).toThrow();
    });

    test("isOpenAt : échéance exclue", () => {
        const s = startQuiz(lobby(), 0);
        expect(isOpenAt(s, 29_999)).toBe(true);
        expect(isOpenAt(s, 30_000)).toBe(false);
        expect(isOpenAt(lobby(), 0)).toBe(false);
    });
});
