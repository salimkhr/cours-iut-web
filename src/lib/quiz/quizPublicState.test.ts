import {describe, expect, test} from "bun:test";
import {buildState, type StateData} from "@/lib/quiz/quizPublicState";
import type {QuizAnswer, QuizParticipant, QuizSession} from "@/lib/quiz/quizTypes";

const session = (over: Partial<QuizSession> = {}): QuizSession => ({
    id: "s1", moduleId: "m", moduleSlug: "js", moduleTitle: "JavaScript", teacherId: "t",
    joinCode: "jc", shortCode: "ABC234",
    quiz: {
        negativeMarking: false,
        questions: [{
            id: "q1", position: 0, blocks: [], weight: 2, durationSeconds: 30,
            options: [{id: "a", text: "A", correct: true}, {id: "b", text: "B", correct: false}],
        }],
    },
    phase: "question_open", questionIndex: 0, questionStartedAt: 0, deadline: 30_000,
    createdAt: 0, endedAt: null, expiresAt: new Date(0),
    ...over,
});

const participant = (userId: string, first: string, score: number): QuizParticipant =>
    ({sessionId: "s1", userId, firstName: first, lastName: "Durand", group: "G1", joinedAt: 0, score, timeMs: 0});

const answer = (userId: string): QuizAnswer =>
    ({sessionId: "s1", questionId: "q1", userId, selectedIds: ["a"], submittedAt: 1, timeMs: 1000, scoreObtained: 2, scoreMax: 2});

const data = (over: Partial<StateData> = {}): StateData => ({
    session: session(),
    participants: [participant("u1", "Ana", 0), participant("u2", "Bob", 0)],
    currentAnswers: [answer("u1")],
    now: 5000,
    ...over,
});

describe("état public", () => {
    test("aucune bonne réponse avant reveal (étudiant et projection)", () => {
        const student = JSON.stringify(buildState(data(), {userId: "u1"}));
        const projection = JSON.stringify(buildState(data(), "projection"));
        for (const json of [student, projection]) {
            expect(json).not.toMatch(/"correct":|"correctIds":\[/);
        }
    });

    test("la projection n'expose que des compteurs et pas d'identité de réponse", () => {
        const state = buildState(data(), "projection");
        expect(state.audience).toBe("projection");
        if (state.audience !== "projection") return;
        expect(state.answeredCount).toBe(1);
        expect(state.participantCount).toBe(2);
        expect(state.podium).toEqual([]);
        expect(JSON.stringify(state)).not.toContain("u1");
    });

    test("l'étudiant retrouve sa réponse verrouillée", () => {
        const state = buildState(data(), {userId: "u1"});
        if (state.audience !== "student") throw new Error("audience");
        expect(state.answer).toEqual({selectedIds: ["a"]});
        const other = buildState(data(), {userId: "u2"});
        if (other.audience !== "student") throw new Error("audience");
        expect(other.answer).toBeNull();
    });

    test("question : options sans justesse et nombre de bonnes réponses attendues", () => {
        const state = buildState(data(), "projection");
        expect(state.question?.expectedCount).toBe(1);
        expect(state.question?.options).toEqual([{id: "a", text: "A"}, {id: "b", text: "B"}]);
    });

    test("reveal : correction, points, podium limité à 3 avec Prénom N.", () => {
        const participants = ["a", "b", "c", "d"].map((n, i) => participant(`u${i}`, n.toUpperCase(), 4 - i));
        const d = data({
            session: session({phase: "reveal", deadline: null}),
            participants,
            currentAnswers: [answer("u0")],
        });
        const projection = buildState(d, "projection");
        if (projection.audience !== "projection") throw new Error("audience");
        expect(projection.correctIds).toEqual(["a"]);
        expect(projection.podium).toHaveLength(3);
        expect(projection.podium[0].name).toBe("A D.");

        const student = buildState(d, {userId: "u0"});
        if (student.audience !== "student") throw new Error("audience");
        expect(student.reveal).toEqual({correctIds: ["a"], selectedIds: ["a"], scoreObtained: 2, scoreMax: 2});
        expect(student.rank).toBe(1);
        expect(student.scoreMax).toBe(2);
    });

    test("lobby : pas de question", () => {
        const state = buildState(data({session: session({phase: "lobby", questionIndex: -1, deadline: null})}), "projection");
        expect(state.question).toBeNull();
    });
});
