import {describe, expect, test} from "bun:test";
import {identityFromUser, liveErrorResponse} from "@/lib/quiz/liveQuizServer";
import {InvalidTransitionError} from "@/lib/quiz/quizMachine";
import {QuizSessionError} from "@/lib/quiz/LiveQuizService";

describe("identityFromUser", () => {
    test("sépare prénom et nom au premier espace", () => {
        expect(identityFromUser({id: "1", name: "Salim Khraimeche", group: "G1"}))
            .toEqual({userId: "1", firstName: "Salim", lastName: "Khraimeche", group: "G1"});
        expect(identityFromUser({id: "2", name: "Jean  De La Fontaine"}))
            .toEqual({userId: "2", firstName: "Jean", lastName: "De La Fontaine", group: null});
    });

    test("nom absent ou mono-mot", () => {
        expect(identityFromUser({id: "3", name: "Madonna"}).lastName).toBe("");
        expect(identityFromUser({id: "4"}).firstName).toBe("");
    });
});

describe("liveErrorResponse", () => {
    test("réponse tardive = 409 « Temps écoulé »", async () => {
        const res = liveErrorResponse(new QuizSessionError("question_closed", "Temps écoulé"));
        expect(res.status).toBe(409);
        expect((await res.json()).error).toBe("Temps écoulé");
    });

    test("codes métier et transition invalide", () => {
        expect(liveErrorResponse(new QuizSessionError("session_not_found", "x")).status).toBe(404);
        expect(liveErrorResponse(new QuizSessionError("invalid_choice", "x")).status).toBe(422);
        expect(liveErrorResponse(new QuizSessionError("not_participant", "x")).status).toBe(403);
        expect(liveErrorResponse(new InvalidTransitionError("lobby", "fermer")).status).toBe(409);
    });
});
