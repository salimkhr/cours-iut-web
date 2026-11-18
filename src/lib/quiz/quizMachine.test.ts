import {describe, expect, test} from "bun:test";
import {
    InvalidTransitionError,
    isOpenAt,
    nextReview,
    normalizedTime,
    progressAt,
    startQuiz,
    startReview,
    windowMs,
} from "@/lib/quiz/quizMachine";

type State = Parameters<typeof startQuiz>[0];

const lobby = (): State => ({
    phase: "lobby",
    questionIndex: -1,
    startedAt: null,
    endedAt: null,
    quiz: {questions: [{durationSeconds: 30}, {durationSeconds: 10}]},
});

describe("quizMachine — phases", () => {
    test("lobby → running → review 0 → review 1 → finished", () => {
        const running = startQuiz(lobby(), 1000);
        expect(running.phase).toBe("running");
        expect(running.startedAt).toBe(1000);

        const review = startReview(running);
        expect(review.phase).toBe("review");
        expect(review.questionIndex).toBe(0);

        const second = nextReview(review, 2000);
        expect(second.questionIndex).toBe(1);
        expect(second.phase).toBe("review");

        const end = nextReview(second, 3000);
        expect(end.phase).toBe("finished");
        expect(end.endedAt).toBe(3000);
    });

    test("refuse les transitions hors de leur phase", () => {
        expect(() => startReview(lobby())).toThrow(InvalidTransitionError);
        expect(() => nextReview(startQuiz(lobby(), 0), 0)).toThrow(InvalidTransitionError);
        expect(() => startQuiz(startQuiz(lobby(), 0), 0)).toThrow(InvalidTransitionError);
    });

    test("refuse de démarrer un quiz vide", () => {
        expect(() => startQuiz({...lobby(), quiz: {questions: []}}, 0)).toThrow();
    });
});

describe("quizMachine — progression d'un participant", () => {
    const questions = [{durationSeconds: 30}, {durationSeconds: 9}];

    test("le tiers-temps allonge chaque question de 4/3", () => {
        expect(windowMs(30, false)).toBe(30_000);
        expect(windowMs(30, true)).toBe(40_000);
        expect(windowMs(9, true)).toBe(12_000);
    });

    test("ouvre la question avec l'échéance du participant", () => {
        expect(progressAt(questions, 0, 1000, false)).toEqual({currentIndex: 0, questionStartedAt: 1000, deadline: 31_000});
        expect(progressAt(questions, 0, 1000, true)).toEqual({currentIndex: 0, questionStartedAt: 1000, deadline: 41_000});
    });

    test("après la dernière question, le participant a terminé", () => {
        expect(progressAt(questions, 2, 1000, false)).toEqual({currentIndex: 2, questionStartedAt: null, deadline: null});
    });

    test("réponse acceptée strictement avant l'échéance", () => {
        expect(isOpenAt({deadline: 1000}, 999)).toBe(true);
        expect(isOpenAt({deadline: 1000}, 1000)).toBe(false);
        expect(isOpenAt({deadline: null}, 0)).toBe(false);
    });

    test("le temps du tiers-temps est ramené à la durée normale", () => {
        expect(normalizedTime(40_000, true)).toBe(30_000);
        expect(normalizedTime(12_000, false)).toBe(12_000);
        expect(normalizedTime(-5, false)).toBe(0);
    });
});
