import {describe, expect, test} from "bun:test";
import {buildState, type StateData} from "@/lib/quiz/quizPublicState";
import type {QuizAnswer, QuizParticipant, QuizSession} from "@/lib/quiz/quizTypes";
import {participantSeed, questionsFor} from "@/lib/quiz/quizOptionOrder";

const option = (id: string, correct: boolean) => ({id, text: id.toUpperCase(), correct});

const session = (over: Partial<QuizSession> = {}): QuizSession => ({
    id: "s1", moduleId: "m", moduleSlug: "js", moduleTitle: "JavaScript", teacherId: "t",
    joinCode: "jc", shortCode: "ABC234",
    quiz: {
        negativeMarking: false,
        questions: [
            {id: "q1", position: 0, blocks: [], weight: 2, durationSeconds: 30, options: [option("a", true), option("b", false)]},
            {id: "q2", position: 1, blocks: [], weight: 1, durationSeconds: 15, options: [option("c", true), option("d", false)]},
        ],
    },
    phase: "running", questionIndex: -1, startedAt: 0,
    createdAt: 0, endedAt: null, expiresAt: new Date(0),
    ...over,
});

const participant = (userId: string, first: string, score: number, over: Partial<QuizParticipant> = {}): QuizParticipant => ({
    sessionId: "s1", userId, firstName: first, lastName: "Durand", group: "G1", joinedAt: 0, score, timeMs: 0,
    extraTime: false, currentIndex: 0, questionStartedAt: 0, deadline: 30_000,
    ...over,
});

const answer = (userId: string, over: Partial<QuizAnswer> = {}): QuizAnswer => ({
    sessionId: "s1", questionId: "q1", userId, selectedIds: ["a"], submittedAt: 1, timeMs: 1000, scoreObtained: 2, scoreMax: 2,
    ...over,
});

const data = (over: Partial<StateData> = {}): StateData => ({
    session: session(),
    participants: [participant("u1", "Ana", 2, {currentIndex: 1, questionStartedAt: 1000, deadline: 16_000}), participant("u2", "Bob", 0)],
    currentAnswers: [],
    now: 5000,
    ...over,
});

const student = (d: StateData, userId: string) => {
    const state = buildState(d, {userId});
    if (state.audience !== "student") throw new Error("audience");
    return state;
};

const projection = (d: StateData) => {
    const state = buildState(d, "projection");
    if (state.audience !== "projection") throw new Error("audience");
    return state;
};

/** Question à la position donnée dans l'ordre propre au participant. */
const at = (userId: string, position: number) => questionsFor(session().quiz.questions, participantSeed("s1", userId))[position];

describe("état public — phase autonome", () => {
    test("chaque étudiant reçoit sa propre question, dans son ordre, et son échéance", () => {
        const ana = student(data(), "u1");
        expect(ana.question?.id).toBe(at("u1", 1).id);
        expect(ana.question?.index).toBe(1);
        expect(ana.question?.durationSeconds).toBe(at("u1", 1).durationSeconds);
        expect(ana.deadline).toBe(16_000);
        const bob = student(data(), "u2");
        expect(bob.question?.id).toBe(at("u2", 0).id);
        expect(bob.deadline).toBe(30_000);
    });

    test("le tiers-temps se voit seulement dans la durée accordée", () => {
        const d = data({participants: [participant("u1", "Ana", 0, {extraTime: true, deadline: 40_000})]});
        const state = student(d, "u1");
        expect(state.question?.durationSeconds).toBeCloseTo(at("u1", 0).durationSeconds * 4 / 3, 6);
        expect(JSON.stringify(state)).not.toContain("extraTime");
        expect(JSON.stringify(projection(d))).not.toContain("extraTime");
    });

    test("ni correction, ni score, ni rang avant la correction", () => {
        const d = data();
        for (const json of [JSON.stringify(student(d, "u1")), JSON.stringify(projection(d))]) {
            expect(json).not.toMatch(/"correct":|"correctIds":\[/);
        }
        const ana = student(d, "u1");
        expect(ana.score).toBe(0);
        expect(ana).not.toHaveProperty("rank");
        expect(ana.reveal).toBeNull();
    });

    test("la projection ne montre que l'avancement, sans question ni identité", () => {
        const d = data({participants: [participant("u1", "Ana", 0, {currentIndex: 2, deadline: null}), participant("u2", "Bob", 0)]});
        const state = projection(d);
        expect(state.question).toBeNull();
        expect(state.deadline).toBeNull();
        expect(state.finishedCount).toBe(1);
        expect(state.participantCount).toBe(2);
        expect(JSON.stringify(state)).not.toContain("u1");
    });

    test("un étudiant qui a tout traité n'a plus de question", () => {
        const d = data({participants: [participant("u1", "Ana", 0, {currentIndex: 2, questionStartedAt: null, deadline: null})]});
        const state = student(d, "u1");
        expect(state.done).toBe(true);
        expect(state.question).toBeNull();
    });
});

describe("état public — correction", () => {
    const reviewData = (over: Partial<StateData> = {}) => data({
        session: session({phase: "review", questionIndex: 0}),
        participants: ["a", "b", "c", "d"].map((n, i) => participant(`u${i}`, n.toUpperCase(), 4 - i, {currentIndex: 2, deadline: null})),
        currentAnswers: [answer("u0"), answer("u1", {selectedIds: [], scoreObtained: 0})],
        ...over,
    });

    test("correction, points et rang ; les absents ne comptent pas comme réponses", () => {
        const proj = projection(reviewData());
        expect(proj.question?.id).toBe("q1");
        expect(proj.correctIds).toEqual(["a"]);
        expect(proj.answeredCount).toBe(1);

        const first = student(reviewData(), "u0");
        expect(first.reveal).toEqual({correctIds: ["a"], selectedIds: ["a"], scoreObtained: 2, scoreMax: 2});
        expect(first.score).toBe(4);
        expect(first.scoreMax).toBe(3);
    });

    test("répartition des choix par proposition, absents exclus", () => {
        const d = reviewData({
            currentAnswers: [
                answer("u0"), answer("u1"), answer("u2", {selectedIds: ["b"]}),
                answer("u3", {selectedIds: [], scoreObtained: 0}),
            ],
        });
        expect(projection(d).optionCounts).toEqual({a: 2, b: 1});
        // Pendant la phase autonome, la répartition dirait déjà quelle réponse domine.
        expect(projection(data()).optionCounts).toBeNull();
    });

    test("question corrigée : options sans justesse, même ordre partout", () => {
        const d = reviewData();
        const proj = projection(d);
        expect(proj.question?.expectedCount).toBe(1);
        expect(proj.question?.options).toContainEqual({id: "a", text: "A"});
        expect(JSON.stringify(proj.question)).not.toContain("\"correct\"");
        const ids = (state: ReturnType<typeof buildState>) => state.question?.options.map((o) => o.id).join("");
        expect(ids(proj)).toBe(ids(student(d, "u0")));
    });

    test("finished : aucun nom projeté, aucun rang envoyé", () => {
        const d = reviewData({session: session({phase: "finished", questionIndex: 1, endedAt: 9}), currentAnswers: []});
        const proj = projection(d);
        expect(JSON.stringify(proj)).not.toContain("Durand");
        expect(proj.correctIds).toBeNull();
        expect(student(d, "u3")).not.toHaveProperty("rank");
    });
});

describe("état public — divers", () => {
    test("le slug du module est exposé aux deux audiences pour la couleur identitaire", () => {
        expect(buildState(data(), "projection").moduleSlug).toBe("js");
        expect(buildState(data(), {userId: "u1"}).moduleSlug).toBe("js");
    });

    test("lobby : pas de question", () => {
        const d = data({
            session: session({phase: "lobby", startedAt: null}),
            participants: [participant("u1", "Ana", 0, {currentIndex: -1, questionStartedAt: null, deadline: null})],
        });
        expect(buildState(d, "projection").question).toBeNull();
        expect(buildState(d, {userId: "u1"}).question).toBeNull();
    });
});
