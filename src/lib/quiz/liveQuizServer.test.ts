import {describe, expect, test} from "bun:test";
import {identityFromUser, liveErrorResponse} from "@/lib/quiz/liveQuizServer";
import {InvalidTransitionError} from "@/lib/quiz/quizMachine";
import {QuizSessionError} from "@/lib/quiz/LiveQuizService";

describe("identityFromUser", () => {
    test("recopie l'e-mail du compte, null s'il manque", () => {
        expect(identityFromUser({id: "u", name: "Ana Lopez", email: "ana@etu.test"}).email).toBe("ana@etu.test");
        expect(identityFromUser({id: "u", name: "Ana Lopez"}).email).toBeNull();
    });

    test("recopie l'identifiant IUT (username), null s'il manque", () => {
        expect(identityFromUser({id: "u", name: "Ana Lopez", username: "ab123456"}).username).toBe("ab123456");
        expect(identityFromUser({id: "u", name: "Ana Lopez"}).username).toBeNull();
    });

    test("sépare prénom et nom au premier espace", () => {
        expect(identityFromUser({id: "1", name: "Salim Khraimeche", group: "G1"}))
            .toEqual({userId: "1", firstName: "Salim", lastName: "Khraimeche", group: "G1", email: null, username: null, extraTime: false});
        expect(identityFromUser({id: "2", name: "Jean  De La Fontaine"}))
            .toEqual({userId: "2", firstName: "Jean", lastName: "De La Fontaine", group: null, email: null, username: null, extraTime: false});
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

describe("liveErrorResponse et rechargement à chaud", () => {
    test("reconnaît une erreur d'une ancienne copie de la classe", () => {
        const stale = Object.assign(new Error("Temps écoulé"), {name: "QuizSessionError", code: "question_closed"});
        expect(liveErrorResponse(stale).status).toBe(409);
    });

    test("une erreur inconnue reste un 500", () => {
        expect(liveErrorResponse(new Error("boom")).status).toBe(500);
    });
});
