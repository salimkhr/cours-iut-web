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

    test("les absents enregistrés à la clôture ne comptent pas comme réponses reçues", () => {
        const absent: QuizAnswer = {...answer("u2"), selectedIds: [], timeMs: 30_000, scoreObtained: 0};
        const state = buildState(data({session: session({phase: "reveal"}), currentAnswers: [answer("u1"), absent]}), "projection");
        if (state.audience !== "projection") throw new Error("audience");
        expect(state.answeredCount).toBe(1);
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
        // Ordre mélangé : on vérifie le contenu (sans indicateur de justesse), pas la position.
        expect(state.question?.options).toHaveLength(2);
        expect(state.question?.options).toContainEqual({id: "a", text: "A"});
        expect(state.question?.options).toContainEqual({id: "b", text: "B"});
    });

    test("reveal : correction et points, sans podium (il a son propre écran)", () => {
        const participants = ["a", "b", "c", "d"].map((n, i) => participant(`u${i}`, n.toUpperCase(), 4 - i));
        const d = data({
            session: session({phase: "reveal", deadline: null}),
            participants,
            currentAnswers: [answer("u0")],
        });
        const projection = buildState(d, "projection");
        if (projection.audience !== "projection") throw new Error("audience");
        expect(projection.correctIds).toEqual(["a"]);
        expect(projection.podium).toEqual([]);

        const student = buildState(d, {userId: "u0"});
        if (student.audience !== "student") throw new Error("audience");
        expect(student.reveal).toEqual({correctIds: ["a"], selectedIds: ["a"], scoreObtained: 2, scoreMax: 2});
        expect(student.rank).toBe(1);
        expect(student.scoreMax).toBe(2);
    });

    test("leaderboard : podium limité à 3 avec Prénom N., rang de l'étudiant, plus de correction", () => {
        const participants = ["a", "b", "c", "d"].map((n, i) => participant(`u${i}`, n.toUpperCase(), 4 - i));
        const d = data({session: session({phase: "leaderboard", deadline: null}), participants, currentAnswers: [answer("u0")]});
        const projection = buildState(d, "projection");
        if (projection.audience !== "projection") throw new Error("audience");
        expect(projection.podium).toHaveLength(3);
        expect(projection.podium[0].name).toBe("A D.");
        expect(projection.correctIds).toBeNull();

        const student = buildState(d, {userId: "u3"});
        if (student.audience !== "student") throw new Error("audience");
        expect(student.rank).toBe(4);
        expect(student.reveal).toBeNull();
    });

    test("le slug du module est exposé aux deux audiences pour la couleur identitaire", () => {
        expect(buildState(data(), "projection").moduleSlug).toBe("js");
        expect(buildState(data(), {userId: "u1"}).moduleSlug).toBe("js");
    });

    test("projection et étudiant voient les propositions dans le même ordre", () => {
        const options = ["a", "b", "c", "d", "e"].map((id) => ({id, text: id.toUpperCase(), correct: id === "a"}));
        const d = data({session: session({quiz: {negativeMarking: false, questions: [{id: "q1", position: 0, blocks: [], weight: 1, durationSeconds: 30, options}]}})});
        const ids = (state: ReturnType<typeof buildState>) => state.question?.options.map((o) => o.id).join("");
        expect(ids(buildState(d, "projection"))).toBe(ids(buildState(d, {userId: "u1"})));
        expect(ids(buildState(d, "projection"))).toBe(ids(buildState(d, "projection")));
    });

    test("lobby : pas de question", () => {
        const state = buildState(data({session: session({phase: "lobby", questionIndex: -1, deadline: null})}), "projection");
        expect(state.question).toBeNull();
    });
});
