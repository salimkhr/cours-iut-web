import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {ensureIndexes} from "@/lib/db/indexes";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import {LiveQuizService, QuizSessionError, type Identity} from "@/lib/quiz/LiveQuizService";
import {QuizResultsRepository} from "@/lib/quiz/QuizResultsRepository";
import {QuizService} from "@/lib/quiz/QuizService";
import type {QuizPublicState} from "@/lib/quiz/quizPublicState";
import {participantSeed, questionsFor} from "@/lib/quiz/quizOptionOrder";
import type {Quiz} from "@/lib/quiz/quizTypes";

let server: MongoMemoryServer;
let client: MongoClient;
let now = 1_000_000;
let live: LiveQuizService;
let registry: LiveQuizRegistry;
let quizzes: QuizService;
let optionIds: Record<string, {good: string[]; bad: string[]}>;
let seeded: Quiz;

const ana: Identity = {userId: "u1", firstName: "Ana", lastName: "Martin", group: "G1", email: "ana@etu.test", username: "an123456", extraTime: false};
const bob: Identity = {userId: "u2", firstName: "Bob", lastName: "Durand", group: "G2", email: null, username: null, extraTime: false};
const cleo: Identity = {userId: "u3", firstName: "Cléo", lastName: "Petit", group: "G1", email: null, username: null, extraTime: true};

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
    seeded = quiz;
    for (const q of quiz.questions) {
        optionIds[q.id] = {good: q.options.filter((o) => o.correct).map((o) => o.id), bad: q.options.filter((o) => !o.correct).map((o) => o.id)};
    }
    return quiz;
}

/** Ordre des questions propre à un participant : identifiants et durées en ms, par position. */
const orderOf = (sessionId: string, userId: string) => questionsFor(seeded.questions, participantSeed(sessionId, userId));
const ids = (sessionId: string, userId: string) => orderOf(sessionId, userId).map((q) => q.id);
const ms = (sessionId: string, userId: string, position: number) => orderOf(sessionId, userId)[position].durationSeconds * 1000;
const extra = (value: number) => Math.round(value * 4 / 3);

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
    test("join enregistre l'e-mail du participant", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, {...ana, email: "a@etu.test"});
        const doc = await client.db("test-live-quiz").collection("quiz_participants").findOne({sessionId: s.id, userId: "u1"});
        expect(doc?.email).toBe("a@etu.test");
    });

    test("join enregistre l'identifiant IUT du participant", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        const doc = await client.db("test-live-quiz").collection("quiz_participants").findOne({sessionId: s.id, userId: "u1"});
        expect(doc?.username).toBe("an123456");
    });

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

async function student(sessionId: string, userId: string) {
    const state = await live.getState(sessionId, {userId});
    if (state.audience !== "student") throw new Error("audience");
    return state;
}

async function projection(sessionId: string) {
    const state = await live.getState(sessionId, "projection");
    if (state.audience !== "projection") throw new Error("audience");
    return state;
}

const START = 1_000_000;

describe("réponses", () => {
    test("note calculée côté serveur, passage à la question suivante, double envoi idempotent", async () => {
        await seedQuiz();
        const s = await create();
        const [q1, q2] = ids(s.id, "u1");
        await live.join(s.id, ana);
        await live.start(s.id);

        now += 2000;
        const first = await live.submitAnswer(s.id, "u1", q1, [optionIds[q1].good[0]]);
        expect(first.scoreObtained).toBe(1);
        expect(first.timeMs).toBe(2000);

        const state = await student(s.id, "u1");
        expect(state.question?.id).toBe(q2);
        expect(state.question?.index).toBe(1);
        expect(state.deadline).toBe(now + ms(s.id, "u1", 1));

        now += 1000;
        const again = await live.submitAnswer(s.id, "u1", q1, optionIds[q1].good);
        expect(again.scoreObtained).toBe(1);
    });

    test("refuse l'inconnu, le vide, le trop-plein, l'étranger et une autre question que la sienne", async () => {
        await seedQuiz();
        const s = await create();
        const [q1, q2] = ids(s.id, "u1");
        await live.join(s.id, ana);
        await live.start(s.id);
        await expect(live.submitAnswer(s.id, "u1", q1, ["zzz"])).rejects.toMatchObject({code: "invalid_choice"});
        await expect(live.submitAnswer(s.id, "u1", q1, [])).rejects.toMatchObject({code: "empty_choice"});
        await expect(live.submitAnswer(s.id, "inconnu", q1, optionIds[q1].good)).rejects.toMatchObject({code: "not_participant"});
        // Tout cocher : plus de propositions que de bonnes réponses attendues.
        await expect(live.submitAnswer(s.id, "u1", q1, [...optionIds[q1].good, ...optionIds[q1].bad]))
            .rejects.toMatchObject({code: "too_many_choices"});
        // Répondre d'avance à la question suivante.
        await expect(live.submitAnswer(s.id, "u1", q2, optionIds[q2].good)).rejects.toMatchObject({code: "question_closed"});
    });

    test("une réponse tardive est refusée et la question suivante s'ouvre à l'échéance", async () => {
        await seedQuiz();
        const s = await create();
        const [q1, q2] = ids(s.id, "u1");
        await live.join(s.id, ana);
        await live.start(s.id);
        now += ms(s.id, "u1", 0); // échéance exacte : exclue
        await expect(live.submitAnswer(s.id, "u1", q1, optionIds[q1].good)).rejects.toBeInstanceOf(QuizSessionError);

        now += 1000;
        const state = await student(s.id, "u1");
        expect(state.question?.id).toBe(q2);
        // Calendrier chaîné : la question 2 démarre à l'échéance de la 1, pas à l'heure du constat.
        expect(state.deadline).toBe(START + ms(s.id, "u1", 0) + ms(s.id, "u1", 1));
    });

    test("points négatifs appliqués d'après l'instantané", async () => {
        await seedQuiz(true);
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);
        // La question à deux bonnes réponses, à sa place dans l'ordre d'Ana.
        const order = ids(s.id, "u1");
        const multi = seeded.questions[0].id;
        if (order[0] !== multi) await live.submitAnswer(s.id, "u1", order[0], optionIds[order[0]].good);
        const answer = await live.submitAnswer(s.id, "u1", multi, [optionIds[multi].good[0], optionIds[multi].bad[0]]);
        expect(answer.scoreObtained).toBe(0);
    });

    test("une réponse et l'échéance au même instant ne comptent qu'une fois", async () => {
        await seedQuiz();
        const s = await create();
        const q1 = ids(s.id, "u1")[0];
        await live.join(s.id, ana);
        await live.start(s.id);
        now += ms(s.id, "u1", 0) - 1;
        await Promise.all([live.submitAnswer(s.id, "u1", q1, optionIds[q1].good), live.restore(s.id)]);
        const answers = await client.db("test-live-quiz").collection("quiz_answers").find({sessionId: s.id, questionId: q1}).toArray();
        expect(answers).toHaveLength(1);
        const p = await client.db("test-live-quiz").collection("quiz_participants").findOne({sessionId: s.id, userId: "u1"});
        expect(p?.currentIndex).toBe(1);
    });
});

describe("ordre des questions", () => {
    test("chaque étudiant suit son propre ordre, l'échauffement reste en tête", async () => {
        await quizzes.create("m1", {negativeMarking: false});
        let quiz!: Quiz;
        for (let q = 0; q < 8; q++) {
            quiz = await quizzes.addQuestion("m1", {
                blocks: blocks(), weight: q === 0 ? 0 : 1, durationSeconds: 30,
                options: [{text: `oui${q}`, correct: true}, {text: `non${q}`, correct: false}],
            });
        }
        seeded = quiz;
        const s = await create();
        const people = Array.from({length: 6}, (_, i): Identity => ({...ana, userId: `p${i}`}));
        for (const p of people) await live.join(s.id, p);
        await live.start(s.id);

        // Échauffement d'abord, pour tout le monde.
        for (const p of people) {
            const state = await student(s.id, p.userId);
            expect(state.question?.id).toBe(quiz.questions[0].id);
            const good = quiz.questions[0].options.filter((o) => o.correct).map((o) => o.id);
            await live.submitAnswer(s.id, p.userId, quiz.questions[0].id, good);
        }
        // Puis chacun sa question 2, stable d'un appel à l'autre.
        const seconds = await Promise.all(people.map(async (p) => (await student(s.id, p.userId)).question?.id));
        expect(new Set(seconds).size).toBeGreaterThan(1);
        for (const [i, p] of people.entries()) {
            expect((await student(s.id, p.userId)).question?.id).toBe(seconds[i]);
            expect(seconds[i]).toBe(ids(s.id, p.userId)[1]);
        }
    });
});

describe("tiers-temps", () => {
    test("chaque question dure 4/3 et le temps relevé est ramené à la durée normale", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        await live.join(s.id, cleo);
        await live.start(s.id);
        const [c1] = ids(s.id, "u3");
        const c0 = ms(s.id, "u3", 0);

        const before = await student(s.id, "u3");
        expect(before.deadline).toBe(START + extra(c0));
        expect(before.question?.durationSeconds).toBeCloseTo(extra(c0) / 1000, 3);
        expect((await student(s.id, "u1")).deadline).toBe(START + ms(s.id, "u1", 0));

        // Après la durée normale de sa question, Cléo répond encore.
        now += c0 + 1000;
        const answer = await live.submitAnswer(s.id, "u3", c1, optionIds[c1].good);
        expect(answer.scoreObtained).toBeGreaterThan(0);
        expect(answer.timeMs).toBe(Math.round((c0 + 1000) * 3 / 4));
        expect((await student(s.id, "u3")).deadline).toBe(now + extra(ms(s.id, "u3", 1)));
    });

    test("le droit est figé à l'arrivée dans la session", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, cleo);
        await live.join(s.id, {...cleo, extraTime: false});
        await live.start(s.id);
        expect((await student(s.id, "u3")).deadline).toBe(START + extra(ms(s.id, "u3", 0)));
    });

    test("le tiers-temps n'apparaît dans aucun état diffusé", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        await live.join(s.id, cleo);
        const seen: QuizPublicState[] = [];
        registry.subscribe(s.id, "projection", (st) => seen.push(st));
        registry.subscribe(s.id, {userId: "u1"}, (st) => seen.push(st));
        registry.subscribe(s.id, {userId: "u3"}, (st) => seen.push(st));
        await live.start(s.id);
        seen.push(await projection(s.id), await student(s.id, "u3"));
        expect(seen.length).toBeGreaterThan(3);
        for (const state of seen) expect(JSON.stringify(state)).not.toContain("extraTime");
    });
});

describe("confidentialité pendant la phase autonome", () => {
    test("ni correction, ni score, ni question suivante avant la correction", async () => {
        await seedQuiz();
        const s = await create();
        const [q1, q2] = ids(s.id, "u1");
        await live.join(s.id, ana);
        await live.join(s.id, bob);
        await live.start(s.id);

        let json = JSON.stringify(await student(s.id, "u1"));
        expect(json).not.toContain(q2);
        expect(json).not.toContain("\"correct\"");

        await live.submitAnswer(s.id, "u1", q1, optionIds[q1].good);
        const state = await student(s.id, "u1");
        expect(state.score).toBe(0);
        expect(state).not.toHaveProperty("rank");
        expect(state.reveal).toBeNull();
        json = JSON.stringify(state);
        expect(json).not.toContain("\"correct\"");

        const proj = await projection(s.id);
        expect(proj.question).toBeNull();
        expect(proj.correctIds).toBeNull();
    });
});

describe("déroulé complet", () => {
    test("phase autonome, correction déclenchée par l'enseignant, puis fin", async () => {
        await seedQuiz();
        const s = await create();
        const [q1, q2] = ids(s.id, "u1");
        await live.join(s.id, ana);
        await live.join(s.id, bob);
        await live.start(s.id);

        now += 1000;
        await live.submitAnswer(s.id, "u1", q1, optionIds[q1].good);
        now += 500;
        await live.submitAnswer(s.id, "u1", q2, optionIds[q2].good);
        expect((await student(s.id, "u1")).done).toBe(true);
        let proj = await projection(s.id);
        expect(proj.phase).toBe("running");
        expect(proj.finishedCount).toBe(1);

        await live.endRunning(s.id);
        await live.endRunning(s.id); // idempotent

        const first = seeded.questions[0].id;
        const bobState = await student(s.id, "u2");
        expect(bobState.phase).toBe("review");
        expect(bobState.question?.id).toBe(first);
        expect(bobState.reveal?.scoreObtained).toBe(0);
        expect(bobState.reveal?.correctIds).toEqual(optionIds[first].good);
        proj = await projection(s.id);
        expect(proj.answeredCount).toBe(1);
        expect(proj.correctIds).toEqual(optionIds[first].good);

        await live.next(s.id);
        expect((await live.getSession(s.id))?.questionIndex).toBe(1);
        await live.next(s.id);

        proj = await projection(s.id);
        expect(proj.phase).toBe("finished");
        // Plus de podium : aucun nom n'est projeté, même à la fin.
        expect(JSON.stringify(proj)).not.toContain("Ana");
        const anaState = await student(s.id, "u1");
        expect(anaState.score).toBe(3);
        expect(anaState.scoreMax).toBe(3);

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

    test("la correction démarre seule quand tout le monde a fini", async () => {
        await seedQuiz();
        const s = await create();
        const [q1, q2] = ids(s.id, "u1");
        await live.join(s.id, ana);
        await live.start(s.id);
        await live.submitAnswer(s.id, "u1", q1, optionIds[q1].good);
        await live.submitAnswer(s.id, "u1", q2, optionIds[q2].bad);
        const session = await live.getSession(s.id);
        expect(session?.phase).toBe("review");
        expect(session?.questionIndex).toBe(0);
    });

    test("une question de poids 0 est jouée mais absente du relevé", async () => {
        await quizzes.create("m1", {negativeMarking: false});
        await quizzes.addQuestion("m1", {
            blocks: blocks(), weight: 0, durationSeconds: 5,
            options: [{text: "drôle", correct: true}, {text: "triste", correct: false}],
        });
        const quiz = await quizzes.addQuestion("m1", {
            blocks: blocks(), durationSeconds: 5,
            options: [{text: "oui", correct: true}, {text: "non", correct: false}],
        });
        const [warmup, real] = quiz.questions;
        const good = (q: typeof warmup) => q.options.filter((o) => o.correct).map((o) => o.id);
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);

        expect((await live.submitAnswer(s.id, "u1", warmup.id, good(warmup))).scoreObtained).toBe(0);
        await live.submitAnswer(s.id, "u1", real.id, good(real));

        const [row] = await new QuizResultsRepository(client.db("test-live-quiz")).list({moduleId: "m1"});
        expect([row.score, row.scoreMax, row.percent]).toEqual([1, 1, 100]);
        expect(row.answers.map((a) => [a.questionId, a.questionNumber])).toEqual([[real.id, 1]]);
    });

    test("diffuse un état par audience au démarrage", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        const seen: QuizPublicState[] = [];
        registry.subscribe(s.id, "projection", (st) => seen.push(st));
        registry.subscribe(s.id, {userId: "u1"}, (st) => seen.push(st));
        await live.start(s.id);
        expect(seen.map((st) => st.audience).sort()).toEqual(["projection", "student"]);
        expect(seen.every((st) => st.phase === "running")).toBe(true);
    });

    test("après un redémarrage, restore rattrape les échéances passées", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        await live.start(s.id);
        live.dispose(); // simule un redémarrage : plus de chronomètre en mémoire

        now += 16_000; // les deux questions (10 s + 5 s) sont échues
        await live.restore(s.id);
        expect((await live.getSession(s.id))?.phase).toBe("review");
        const answers = await client.db("test-live-quiz").collection("quiz_answers").find({sessionId: s.id}).toArray();
        expect(answers.map((a) => a.selectedIds)).toEqual([[], []]);
    });

    test("le chronomètre fait avancer un participant à son échéance", async () => {
        await seedQuiz();
        // Horloge réelle : le chrono repose sur un vrai setTimeout.
        live = new LiveQuizService(client.db("test-live-quiz"), registry);
        const s = await create();
        // Le schéma impose 5 s minimum : on raccourcit l'instantané pour ne pas attendre.
        const firstIndex = seeded.questions.findIndex((q) => q.id === ids(s.id, "u1")[0]);
        await client.db("test-live-quiz").collection("quiz_sessions")
            .updateOne({_id: s.id as never}, {$set: {[`quiz.questions.${firstIndex}.durationSeconds`]: 0.05}});
        await live.join(s.id, ana);
        await live.start(s.id);
        await new Promise((resolve) => setTimeout(resolve, 200));
        const p = await client.db("test-live-quiz").collection("quiz_participants").findOne({sessionId: s.id, userId: "u1"});
        expect(p?.currentIndex).toBe(1);
    });
});

describe("durée de vie des sessions", () => {
    test("une session terminée perd expiresAt, une session en lobby le garde", async () => {
        await seedQuiz();
        const finished = await create();
        const lobby = await create();
        const [q1, q2] = ids(finished.id, "u1");
        await live.join(finished.id, ana);
        await live.start(finished.id);
        await live.submitAnswer(finished.id, "u1", q1, optionIds[q1].good);
        await live.submitAnswer(finished.id, "u1", q2, optionIds[q2].good);
        await live.next(finished.id);
        await live.next(finished.id);

        const raw = client.db("test-live-quiz").collection("quiz_sessions");
        const done = await raw.findOne({_id: finished.id as never});
        expect(done?.phase).toBe("finished");
        expect(done).not.toHaveProperty("expiresAt");
        const waiting = await raw.findOne({_id: lobby.id as never});
        expect(waiting?.expiresAt).toBeInstanceOf(Date);
    });
});

describe("join concurrent", () => {
    test("un participant arrivé pendant le démarrage reçoit quand même sa première question", async () => {
        await seedQuiz();
        const s = await create();
        await live.join(s.id, ana);
        // Arrivée « en retard » : le join a lu le lobby, mais son écriture passe après le démarrage.
        await live.start(s.id);
        await client.db("test-live-quiz").collection("quiz_participants").insertOne({
            _id: `${s.id}:u2` as never, sessionId: s.id, userId: "u2", firstName: "Bob", lastName: "Durand", group: "G2",
            joinedAt: now, score: 0, timeMs: 0, extraTime: false, currentIndex: -1, questionStartedAt: null, deadline: null,
        });
        const bobState = await student(s.id, "u2");
        expect(bobState.question?.index).toBe(0);
        expect(bobState.deadline).toBe(now + ms(s.id, "u2", 0));
    });

    test("deux join simultanés ne créent qu'un participant, même sans index", async () => {
        await seedQuiz();
        const s = await create();
        await client.db("test-live-quiz").collection("quiz_participants").dropIndexes();
        await Promise.all([live.join(s.id, ana), live.join(s.id, ana), live.join(s.id, ana)]);
        const state = await live.getState(s.id, "projection");
        expect(state.participantCount).toBe(1);
    });
});
