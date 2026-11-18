import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import ExcelJS from "exceljs";
import {MongoClient, type Db} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {ensureIndexes} from "@/lib/db/indexes";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import {LiveQuizService, type Identity} from "@/lib/quiz/LiveQuizService";
import {QuizResultsRepository} from "@/lib/quiz/QuizResultsRepository";
import {QuizService} from "@/lib/quiz/QuizService";
import type {ProjectionState, QuizPublicState, StudentState} from "@/lib/quiz/quizPublicState";
import {fillScodocSheet, mergeScodocEntries, scodocNote} from "@/lib/quiz/scodocSheet";
import {participantSeed, questionsFor} from "@/lib/quiz/quizOptionOrder";
import type {Quiz} from "@/lib/quiz/quizTypes";

/**
 * Répétition générale d'une séance réelle : deux sessions de 20 étudiants, menées en même temps,
 * sur un quiz de 21 questions dont la première (échauffement) a un poids de 0.
 * Chacun avance à son rythme, dans son propre ordre (un sur cinq en tiers-temps) : réponses concurrentes, absents,
 * réponses tardives, doubles clics, correction collective, puis résultats et feuille ScoDoc.
 */

const STUDENTS = 20;
const QUESTIONS = 21;
const DURATION = 20;

let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let live: LiveQuizService;
const services: LiveQuizService[] = [];
let registry: LiveQuizRegistry;
let quiz: Quiz;

const student = (session: number, index: number): Identity => {
    const username = `e${session}${String(index).padStart(5, "0")}`;
    return {
        userId: `u-${session}-${index}`,
        firstName: `Prenom${index}`,
        lastName: `NOM${session}-${index}`,
        group: `G${session + 1}`,
        email: `${username}@etu.univ.test`,
        username,
        extraTime: index % 5 === 0,
    };
};

type Behaviour = "absent" | "allGood" | "oneBad" | "oneGood" | "goodAndBad";

/** Comportement déterministe et varié d'un étudiant sur une question. */
function behaviour(session: number, index: number, q: number): Behaviour {
    if ((index * 7 + q * 3 + session) % 11 === 0) return "absent";
    return (["allGood", "oneBad", "oneGood", "goodAndBad"] as const)[(index + q + session) % 4];
}

/** Barème attendu, calculé à la main (spec §5), indépendamment de `scoreQuestion`. */
function expectedScore(q: number, b: Behaviour, negative: boolean): number {
    if (q === 0 || b === "absent") return 0;
    const multi = q % 2 === 0;
    if (!multi) {
        // Une seule bonne réponse : « oneGood » = la bonne, « goodAndBad » est refusé (trop de choix) donc on envoie la mauvaise.
        return b === "allGood" || b === "oneGood" ? 1 : 0;
    }
    switch (b) {
        case "allGood": return 1;
        case "oneBad": return 0;
        case "oneGood": return 0.5;
        case "goodAndBad": return negative ? 0 : 0.5;
    }
}

function selection(quizQuestion: Quiz["questions"][number], b: Behaviour): string[] {
    const good = quizQuestion.options.filter((o) => o.correct).map((o) => o.id);
    const bad = quizQuestion.options.filter((o) => !o.correct).map((o) => o.id);
    const multi = good.length > 1;
    switch (b) {
        case "allGood": return good;
        case "oneBad": return [bad[0]];
        case "oneGood": return [good[0]];
        case "goodAndBad": return multi ? [good[0], bad[0]] : [bad[1]];
        case "absent": return [];
    }
}

async function seedQuiz(negative: boolean): Promise<Quiz> {
    const quizzes = new QuizService(db);
    await quizzes.create("m1", {negativeMarking: negative});
    let current!: Quiz;
    for (let q = 0; q < QUESTIONS; q++) {
        const multi = q > 0 && q % 2 === 0;
        current = await quizzes.addQuestion("m1", {
            blocks: [{id: crypto.randomUUID(), type: "text", props: {content: `Question ${q}`}}],
            weight: q === 0 ? 0 : 1,
            durationSeconds: DURATION,
            options: [
                {text: `A${q}`, correct: true},
                {text: `B${q}`, correct: multi},
                {text: `C${q}`, correct: false},
                {text: `D${q}`, correct: false},
            ],
        });
    }
    return current;
}

beforeAll(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
}, 120_000);

afterAll(async () => {
    await client?.close();
    await server?.stop();
});

beforeEach(async () => {
    db = client.db("test-friday");
    await db.dropDatabase();
    await ensureIndexes(db);
    registry = new LiveQuizRegistry();
    live = new LiveQuizService(db, registry);
});

afterEach(() => {
    live.dispose();
    for (const s of services.splice(0)) s.dispose();
});

interface Run {
    sessionId: string;
    projection: ProjectionState[];
    firstStudent: StudentState[];
    lateRejected: number;
}

async function runSession(k: number): Promise<Run> {
    // Horloge propre à la session : les deux salles avancent chacune à son rythme.
    let now = Date.UTC(2026, 10, 20, 8, 0) + k * 60_000;
    const live = new LiveQuizService(db, registry, () => now);
    services.push(live);
    const session = await live.createSession({moduleId: "m1", moduleSlug: "php", moduleTitle: "PHP", teacherId: "t1"});
    const projection: ProjectionState[] = [];
    const firstStudent: StudentState[] = [];
    registry.subscribe(session.id, "projection", (s: QuizPublicState) => projection.push(s as ProjectionState));

    // 20 arrivées simultanées, plus un double appel de l'effet React pour chacun.
    const people = Array.from({length: STUDENTS}, (_, i) => student(k, i));
    await Promise.all(people.flatMap((p) => [live.join(session.id, p), live.join(session.id, p)]));
    registry.subscribe(session.id, {userId: people[0].userId}, (s) => firstStudent.push(s as StudentState));
    expect(await db.collection("quiz_participants").countDocuments({sessionId: session.id})).toBe(STUDENTS);

    // Double clic sur « Démarrer ».
    await Promise.all([live.start(session.id), live.start(session.id)]);
    let lateRejected = 0;
    const participants = db.collection("quiz_participants");

    // Horloge événementielle : chaque étudiant répond 3 s après l'ouverture de sa question,
    // ou laisse filer jusqu'à son échéance s'il est absent sur cette question.
    for (;;) {
        if ((await live.getSession(session.id))?.phase !== "running") break;
        const pending = (await participants.find({sessionId: session.id, deadline: {$ne: null}}).toArray())
            .map((doc) => {
                const i = people.findIndex((p) => p.userId === doc.userId);
                // Position dans l'ordre de l'étudiant → indice de la question dans le quiz.
                const order = questionsFor(quiz.questions, participantSeed(session.id, doc.userId as string));
                const q = quiz.questions.findIndex((x) => x.id === order[doc.currentIndex as number].id);
                const absent = behaviour(k, i, q) === "absent";
                return {i, q, absent, at: absent ? doc.deadline as number : (doc.questionStartedAt as number) + 3_000};
            })
            .sort((x, y) => x.at - y.at);
        const event = pending[0];
        expect(event).toBeDefined();
        now = Math.max(now, event.at);
        const p = people[event.i];
        const question = quiz.questions[event.q];
        if (event.absent) {
            // L'absent tente de répondre pile à l'échéance : refusé.
            await expect(live.submitAnswer(session.id, p.userId, question.id, selection(question, "allGood")))
                .rejects.toMatchObject({code: "question_closed"});
            lateRejected++;
            await live.restore(session.id);
        } else {
            // Double envoi (réseau lent) : une seule réponse comptée.
            const b = behaviour(k, event.i, event.q);
            const [a1, a2] = await Promise.all([
                live.submitAnswer(session.id, p.userId, question.id, selection(question, b)),
                live.submitAnswer(session.id, p.userId, question.id, selection(question, b)),
            ]);
            expect(a1.scoreObtained).toBe(a2.scoreObtained);
        }
    }

    // Tout le monde a fini : la correction s'est ouverte seule. L'enseignant reparcourt les questions.
    for (let q = 0; q < QUESTIONS; q++) {
        const current = await live.getSession(session.id);
        expect(current?.phase).toBe("review");
        expect(current?.questionIndex).toBe(q);
        const question = quiz.questions[q];
        expect(await db.collection("quiz_answers").countDocuments({sessionId: session.id, questionId: question.id})).toBe(STUDENTS);

        // Double clic sur « Suivant » : on n'avance qu'une fois.
        await Promise.all([live.next(session.id), live.next(session.id)]);
        const review = projection.at(-1);
        if (q < QUESTIONS - 1) {
            expect(review?.phase).toBe("review");
            expect(review?.question?.index).toBe(q + 1);
            expect(review?.answeredCount).toBe(people.filter((_, i) => behaviour(k, i, q + 1) !== "absent").length);
        }
    }
    return {sessionId: session.id, projection, firstStudent, lateRejected};
}

describe.each([false, true])("séance de vendredi (points négatifs : %p)", (negative) => {
    test("deux sessions de 20 sur 21 questions, première question à poids 0", async () => {
        quiz = await seedQuiz(negative);
        const runs = await Promise.all([runSession(0), runSession(1)]);

        for (const [k, run] of runs.entries()) {
            const session = await live.getSession(run.sessionId);
            expect(session?.phase).toBe("finished");
            expect(session?.expiresAt).toBeUndefined();
            expect(run.lateRejected).toBeGreaterThan(0);

            // Échauffement : affiché comme question 1/21, poids 0 côté étudiant.
            const warmup = run.firstStudent.find((s) => s.phase === "review" && s.question?.index === 0);
            expect(warmup?.question?.total).toBe(QUESTIONS);
            expect(warmup?.reveal?.scoreMax).toBe(0);
            expect(warmup?.reveal?.scoreObtained).toBe(0);
            expect(warmup?.scoreMax).toBe(QUESTIONS - 1);

            const final = run.projection.at(-1);
            expect(final?.phase).toBe("finished");

            // Score de chaque étudiant = somme attendue, sans la question 0.
            const participants = await db.collection("quiz_participants").find({sessionId: run.sessionId}).toArray();
            for (let i = 0; i < STUDENTS; i++) {
                const p = participants.find((x) => x.userId === student(k, i).userId);
                const expected = Array.from({length: QUESTIONS}, (_, q) => expectedScore(q, behaviour(k, i, q), negative))
                    .reduce((a, b) => a + b, 0);
                expect(p?.score).toBeCloseTo(expected, 6);
                // Temps relevé : chaque question consomme du temps (3 s répondu, ramené à 2,25 s en
                // tiers-temps ; 20 s absent), sans que le tiers-temps ne pèse plus lourd.
                expect(p?.timeMs).toBeGreaterThanOrEqual(QUESTIONS * 2_250);
                expect(p?.timeMs).toBeLessThanOrEqual(QUESTIONS * DURATION * 1000);
            }
        }

        // Tableau enseignant : 40 lignes, barème sur 20, échauffement absent du relevé.
        const results = new QuizResultsRepository(db);
        const rows = await results.list({moduleId: "m1"});
        expect(rows.length).toBe(2 * STUDENTS);
        for (const row of rows) {
            expect(row.scoreMax).toBe(QUESTIONS - 1);
            expect(row.answers.length).toBe(QUESTIONS - 1);
            expect(row.answers.map((a) => a.questionNumber)).toEqual(Array.from({length: QUESTIONS - 1}, (_, i) => i + 1));
            expect(row.answers.some((a) => a.questionId === quiz.questions[0].id)).toBe(false);
        }
        const sessions = await results.listSessions("m1");
        expect(sessions.map((s) => s.participantCount)).toEqual([STUDENTS, STUDENTS]);

        // Feuille ScoDoc : les 40 étudiants des deux sessions, plus un inscrit jamais venu.
        const entries = mergeScodocEntries(await results.scodocEntriesForModule("m1", 0));
        expect(entries.length).toBe(2 * STUDENTS);
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Feuille");
        ws.getRow(8).values = ["!50721", "Nom", "Prénom", "Groupe", "Note sur 20", "Remarque", "NIP", "Email"];
        const roster = [...[0, 1].flatMap((k) => Array.from({length: STUDENTS}, (_, i) => student(k, i))),
            {...student(9, 0), email: "jamais.venu@etu.univ.test"}];
        roster.forEach((p, r) => {
            const row = ws.getRow(9 + r);
            row.getCell(1).value = `!${r}`;
            row.getCell(2).value = p.lastName;
            row.getCell(3).value = p.firstName;
            row.getCell(8).value = p.email;
        });
        const {buffer, report} = await fillScodocSheet(await wb.xlsx.writeBuffer() as ArrayBuffer, entries);
        expect(report).toEqual({filled: 2 * STUDENTS, absent: 1, unmatched: []});

        const filled = new ExcelJS.Workbook();
        await filled.xlsx.load(buffer as unknown as ArrayBuffer);
        const sheet = filled.worksheets[0];
        const participants = await db.collection("quiz_participants").find({}).toArray();
        for (let r = 0; r < 2 * STUDENTS; r++) {
            const p = participants.find((x) => x.username === roster[r].username);
            const note = sheet.getCell(9 + r, 5).value;
            expect(note).toBe(scodocNote(p?.score ?? -1, QUESTIONS - 1));
            expect(typeof note === "number" && note >= 0 && note <= 20).toBe(true);
        }
        expect(sheet.getCell(9 + 2 * STUDENTS, 5).value).toBe("ABS");
    }, 60_000);
});
