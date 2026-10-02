import {describe, expect, test} from "bun:test";
import {quizErrorResponse} from "@/lib/quiz/quizApi";
import {
    QuestionNotFoundError, QuizAlreadyExistsError, QuizNotFoundError, QuizValidationError,
} from "@/lib/quiz/QuizService";

describe("quizErrorResponse", () => {
    test("422 avec erreurs localisées", async () => {
        const res = quizErrorResponse(new QuizValidationError([{path: "question.options", message: "Au moins deux propositions"}]));
        expect(res.status).toBe(422);
        expect((await res.json()).issues[0].path).toBe("question.options");
    });

    test("409 quiz existant", () => {
        expect(quizErrorResponse(new QuizAlreadyExistsError()).status).toBe(409);
    });

    test("404 quiz ou question absente", () => {
        expect(quizErrorResponse(new QuizNotFoundError()).status).toBe(404);
        expect(quizErrorResponse(new QuestionNotFoundError()).status).toBe(404);
    });
});
