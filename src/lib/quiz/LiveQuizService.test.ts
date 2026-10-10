import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {ensureIndexes} from "@/lib/db/indexes";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import {LiveQuizService, QuizSessionError, type Identity} from "@/lib/quiz/LiveQuizService";
import {QuizResultsRepository} from "@/lib/quiz/QuizResultsRepository";
import {QuizService} from "@/lib/quiz/QuizService";
import type {QuizPublicState} from "@/lib/quiz/quizPublicState";

let server: MongoMemoryServer;
let client: MongoClient;
let now = 1_000_000;
let live: LiveQuizService;
let registry: LiveQuizRegistry;
let quizzes: QuizService;
let optionIds: Record<string, {good: string[]; bad: string[]}>;

const ana: Identity = {userId: "u1", firstName: "Ana", lastName: "Martin", group: "G1"};
const bob: Identity = {userId: "u2", firstName: "Bob", lastName: "Durand", group: "G2"};

const blocks = () => [{id: crypto.randomUUID(), type: "text", props: {content: "Q ?"}}];

async function seedQuiz(negative = false) {
    await quizzes.create("m1", {negativeMarking: negative});
    await quizzes.addQuestion("m1", {
        blocks: blocks(), weight: 2, durationSeconds: 10,
        options: [{text: "a", correct: true}, {text: "b", correct: true}, {text: "x", correct: false}],
    });
    const quiz = await quizzes.addQuestion("m1", {
        blocks: blocks(), durationSeconds: 5,
        options: [{text: "oui", correct: true}, {text: "non", correct: false}],
    });
    optionIds = {};
    for (const q of quiz.questions) {
        optionIds[q.id] = {good: q.options.filter((o) => o.correct).map((o) => o.id), bad: q.options.filter((o) => !o.correct).map((o) => o.id)};
    }
    return quiz;
}

const create = () => live.createSession({moduleId: "m1", moduleSlug: "js", moduleTitle: "JS", teacherId: "t1"});

beforeAll(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
}, 120_000);

afterAll(async () => {
    await client?.close();
    await server?.stop();
});

beforeEach(async () => {
    const db = client.db("test-live-quiz");
    await db.dropDatabase();
    await ensureIndexes(db);
    now = 1_000_000;
    registry = new LiveQuizRegistry();
    live = new LiveQuizService(db, registry, () => now);
    quizzes = new QuizService(db);
});

afterEach(() => live.dispose());

describe("création de session", () => {
    test("refuse un module sans quiz ou sans question", async () => {
        await expect(create()).rejects.toMatchObject({code: "no_quiz"});
        await quizzes.create("m1");
        await expect(create()).rejects.toMatchObject({code: "empty_quiz"});
    });

    test("génère des codes distincts et copie un instantané immuable", async () => {
        const quiz = await seedQuiz();
        const a = await create();
        const b = await create();
        expect(a.joinCode).not.toBe(b.joinCode);
        expect(a.joinCode.length).toBeGreaterThanOrEqual(20);
        expect(a.shortCode).toMatch(/^[A-Z2-9]{6}$/);

        await quizzes.deleteQuestion("m1", quiz.questions[0].id);
        const reloaded = await live.getSession(a.id);
        expect(reloaded?.quiz.questions).toHaveLength(2);
        expect((await live.findByCode(a.shortCode.toLowerCase()))?.id).toBe(a.id);
    });
});

describe("participation", () => {
    test("join est idempotent et refermé après le lobby pour les nouveaux", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        await live.join(s.id, ana);
        expect((await live.getState(s.id, "projection")).participantCount).toBe(1);

        await live.start(s.id);
        await expect(live.join(s.id, bob)).rejects.toMatchObject({code: "session_ended"});
        expect((await live.join(s.id, ana)).userId).toBe("u1");
    });
});

describe("confidentialité", () => {
    test("un compte non participant ne lit pas l'état étudiant", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        await expect(live.getState(s.id, {userId: "intrus"})).rejects.toMatchObject({code: "not_participant"});
    });
});

describe("réponses", () => {
    test("note calculée côté serveur, double envoi idempotent", async () => {
        const quiz = await seedQuiz();
        const q1 = quiz.questions[0].id;
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);

        now += 2000;
        const first = await live.submitAnswer(s.id, "u1", [optionIds[q1].good[0]]);
        expect(first.scoreObtained).toBe(1);
        expect(first.timeMs).toBe(2000);

        now += 1000;
        const again = await live.submitAnswer(s.id, "u1", optionIds[q1].good);
        expect(again.scoreObtained).toBe(1);
        const state = await live.getState(s.id, {userId: "u1"});
        if (state.audience !== "student") throw new Error("audience");
        expect(state.score).toBe(1);
        expect(state.answer?.selectedIds).toEqual([optionIds[q1].good[0]]);
    });

    test("refuse l'inconnu, le vide et l'étranger à la session", async () => {
        const quiz = await seedQuiz();
        const q1 = quiz.questions[0].id;
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);
        await expect(live.submitAnswer(s.id, "u1", ["zzz"])).rejects.toMatchObject({code: "invalid_choice"});
        await expect(live.submitAnswer(s.id, "u1", [])).rejects.toMatchObject({code: "empty_choice"});
        await expect(live.submitAnswer(s.id, "inconnu", optionIds[q1].good)).rejects.toMatchObject({code: "not_participant"});
    });

    test("refuse une réponse tardive d'après l'horloge serveur", async () => {
        const quiz = await seedQuiz();
        const q1 = quiz.questions[0].id;
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);
        now += 10_000; // échéance exacte : exclue
        await expect(live.submitAnswer(s.id, "u1", optionIds[q1].good)).rejects.toBeInstanceOf(QuizSessionError);
    });

    test("points négatifs appliqués d'après l'instantané", async () => {
        const quiz = await seedQuiz(true);
        const q1 = quiz.questions[0].id;
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);
        const answer = await live.submitAnswer(s.id, "u1", [optionIds[q1].good[0], optionIds[q1].bad[0]]);
        expect(answer.scoreObtained).toBe(0);
    });
});

describe("déroulé complet", () => {
    test("fermeture, absences, question suivante et fin", async () => {
        const quiz = await seedQuiz();
        const [q1, q2] = quiz.questions.map((q) => q.id);
        const s = await create();
        await live.join(s.id, ana);
        await live.join(s.id, bob);
        await live.start(s.id);

        now += 1000;
        await live.submitAnswer(s.id, "u1", optionIds[q1].good);
        await live.closeCurrentQuestion(s.id);
        await live.closeCurrentQuestion(s.id); // idempotent

        let state = await live.getState(s.id, {userId: "u2"});
        if (state.audience !== "student") throw new Error("audience");
        expect(state.phase).toBe("reveal");
        expect(state.reveal?.scoreObtained).toBe(0);
        expect(state.reveal?.correctIds).toEqual(optionIds[q1].good);

        await live.next(s.id);
        expect((await live.getSession(s.id))?.phase).toBe("leaderboard");
        await live.next(s.id);
        now += 500;
        await live.submitAnswer(s.id, "u1", optionIds[q2].good);
        await live.closeCurrentQuestion(s.id);
        await live.next(s.id);

        const projection = await live.getState(s.id, "projection");
        if (projection.audience !== "projection") throw new Error("audience");
        expect(projection.phase).toBe("finished");
        expect(projection.podium.map((p) => p.name)).toEqual(["Ana M.", "Bob D."]);

        state = await live.getState(s.id, {userId: "u1"});
        if (state.audience !== "student") throw new Error("audience");
        expect(state.score).toBe(3);
        expect(state.scoreMax).toBe(3);

        const results = new QuizResultsRepository(client.db("test-live-quiz"));
        const all = await results.list({moduleId: "m1"});
        expect(all.map((r) => [r.firstName, r.score, r.percent])).toEqual([["Bob", 0, 0], ["Ana", 3, 100]]); // tri : date puis nom (Durand, Martin)
        expect(all.find((r) => r.firstName === "Bob")?.answers).toHaveLength(2);
        expect(await results.list({moduleId: "m1", group: "G2"})).toHaveLength(1);
        expect(await results.list({moduleId: "m1", search: "mart"})).toHaveLength(1);
        expect(await results.list({moduleId: "m1", search: "zzz"})).toHaveLength(0);
        expect((await results.listSessions("m1"))[0].participantCount).toBe(2);
        expect(await results.listGroups("m1")).toEqual(["G1", "G2"]);
    });

    test("diffuse un état par audience à chaque transition", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        const seen: QuizPublicState[] = [];
        registry.subscribe(s.id, "projection", (st) => seen.push(st));
        registry.subscribe(s.id, {userId: "u1"}, (st) => seen.push(st));
        await live.start(s.id);
        expect(seen.map((st) => st.audience).sort()).toEqual(["projection", "student"]);
        expect(seen.every((st) => st.phase === "question_open")).toBe(true);
    });

    test("le chronomètre ferme la question à l'échéance et restore le reprogramme", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);
        live.dispose(); // simule un redémarrage : plus de chronomètre en mémoire

        now += 11_000;
        await live.restore(s.id);
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect((await live.getSession(s.id))?.phase).toBe("reveal");
    });
});

describe("join concurrent", () => {
    test("deux join simultanés ne créent qu'un participant, même sans index", async () => {
        await seedQuiz();
        const s = await create();
        await client.db("test-live-quiz").collection("quiz_participants").dropIndexes();
        await Promise.all([live.join(s.id, ana), live.join(s.id, ana), live.join(s.id, ana)]);
        const state = await live.getState(s.id, "projection");
        expect(state.participantCount).toBe(1);
    });
});
