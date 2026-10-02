import {afterAll, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {ensureIndexes} from "@/lib/db/indexes";
import {
    QuestionNotFoundError, QuizAlreadyExistsError, QuizNotFoundError, QuizService, QuizValidationError,
} from "@/lib/quiz/QuizService";

let server: MongoMemoryServer;
let client: MongoClient;
let service: QuizService;

const draft = (text = "2") => ({
    blocks: [{id: crypto.randomUUID(), type: "text", props: {content: "Question ?"}}],
    options: [{text, correct: true}, {text: "autre", correct: false}],
});

beforeAll(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
}, 120_000);

afterAll(async () => {
    await client?.close();
    await server?.stop();
});

beforeEach(async () => {
    const db = client.db("test-quiz");
    await db.dropDatabase();
    await ensureIndexes(db);
    service = new QuizService(db);
});

describe("QuizService", () => {
    test("crée un quiz unique par module", async () => {
        const quiz = await service.create("m1", {negativeMarking: true});
        expect(quiz.negativeMarking).toBe(true);
        expect(quiz.questions).toEqual([]);
        await expect(service.create("m1")).rejects.toBeInstanceOf(QuizAlreadyExistsError);
        await service.create("m2");
    });

    test("modifie la configuration", async () => {
        await service.create("m1");
        expect((await service.updateConfig("m1", {negativeMarking: true})).negativeMarking).toBe(true);
        await expect(service.updateConfig("inconnu", {negativeMarking: true})).rejects.toBeInstanceOf(QuizNotFoundError);
    });

    test("ajoute des questions avec ids stables et positions", async () => {
        await service.create("m1");
        await service.addQuestion("m1", draft("a"));
        const quiz = await service.addQuestion("m1", draft("b"));
        expect(quiz.questions.map((q) => q.position)).toEqual([0, 1]);
        expect(quiz.questions[0].options[0].id).toBeTruthy();
        expect(quiz.questions[0].weight).toBe(1);
        expect(quiz.questions[0].durationSeconds).toBe(30);
    });

    test("refuse une question invalide avec un chemin localisé", async () => {
        await service.create("m1");
        const bad = {...draft(), options: [{text: "seule", correct: true}]};
        const error = await service.addQuestion("m1", bad).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(QuizValidationError);
        expect((error as QuizValidationError).issues[0].path).toContain("options");
    });

    test("modifie une question en conservant son id", async () => {
        await service.create("m1");
        const quiz = await service.addQuestion("m1", draft());
        const id = quiz.questions[0].id;
        const updated = await service.updateQuestion("m1", id, {...draft("nouveau"), weight: 3});
        expect(updated.questions[0].id).toBe(id);
        expect(updated.questions[0].weight).toBe(3);
        await expect(service.updateQuestion("m1", "x", draft())).rejects.toBeInstanceOf(QuestionNotFoundError);
    });

    test("supprime et réordonne en recalculant les positions", async () => {
        await service.create("m1");
        await service.addQuestion("m1", draft("a"));
        await service.addQuestion("m1", draft("b"));
        const quiz = await service.addQuestion("m1", draft("c"));
        const [a, b, c] = quiz.questions.map((q) => q.id);

        const reordered = await service.reorderQuestions("m1", [c, a, b]);
        expect(reordered.questions.map((q) => q.id)).toEqual([c, a, b]);
        expect(reordered.questions.map((q) => q.position)).toEqual([0, 1, 2]);

        await expect(service.reorderQuestions("m1", [a, b])).rejects.toBeInstanceOf(QuizValidationError);

        const after = await service.deleteQuestion("m1", a);
        expect(after.questions.map((q) => q.position)).toEqual([0, 1]);
        await expect(service.deleteQuestion("m1", a)).rejects.toBeInstanceOf(QuestionNotFoundError);
    });

    test("met à jour updatedAt", async () => {
        let now = new Date("2026-01-01T00:00:00Z");
        service = new QuizService(client.db("test-quiz"), () => now);
        const created = await service.create("m1");
        now = new Date("2026-01-02T00:00:00Z");
        const updated = await service.updateConfig("m1", {negativeMarking: true});
        expect(updated.createdAt).toBe(created.createdAt);
        expect(updated.updatedAt).not.toBe(created.updatedAt);
    });
});
