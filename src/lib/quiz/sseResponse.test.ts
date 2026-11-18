import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test} from "bun:test";
import type {Db} from "mongodb";
import {startMemoryDb} from "../../../tests/helpers/db";
import {ensureIndexes} from "@/lib/db/indexes";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import {LiveQuizService, type Identity} from "@/lib/quiz/LiveQuizService";
import {QuizService} from "@/lib/quiz/QuizService";
import type {QuizPublicState} from "@/lib/quiz/quizPublicState";

let db: Db;
let stop: () => Promise<void>;
let session: {user: {id: string; role: string; name: string}} | null = null;

mock.module("@/lib/mongodb", () => ({connectToDB: async () => db}));
mock.module("@/lib/auth", () => ({getServerSession: async () => session, auth: {}}));

const {sseResponse} = await import("@/lib/quiz/liveQuizServer");
const {GET} = await import("@/app/api/quiz/sessions/[id]/stream/route");

let registry: LiveQuizRegistry;
let live: LiveQuizService;
let sessionId: string;

const student = (i: number): Identity => ({
    userId: `u${i}`, firstName: `Prenom${i}`, lastName: `NOM${i}`, group: "G1",
    email: `e${i}@etu.test`, username: `e${i}`, extraTime: false,
});

/** Lit le flux SSE et rend chaque `event: state` décodé, au fil de l'eau. */
function reader(res: Response) {
    const r = (res.body as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const raw: string[] = [];
    return {
        raw,
        async next(): Promise<QuizPublicState> {
            for (;;) {
                const end = buffer.indexOf("\n\n");
                if (end >= 0) {
                    const frame = buffer.slice(0, end);
                    buffer = buffer.slice(end + 2);
                    raw.push(frame);
                    if (!frame.startsWith("event: state\n")) continue;
                    return JSON.parse(frame.slice(frame.indexOf("data: ") + 6)) as QuizPublicState;
                }
                const {value, done} = await r.read();
                if (done) throw new Error("flux fermé");
                buffer += decoder.decode(value, {stream: true});
            }
        },
    };
}

beforeAll(async () => {
    ({db, stop} = await startMemoryDb());
}, 120_000);

afterAll(async () => {
    await stop();
});

beforeEach(async () => {
    await db.dropDatabase();
    await ensureIndexes(db);
    registry = new LiveQuizRegistry();
    live = new LiveQuizService(db, registry);
    // Le serveur récupère ce singleton : même registre pour le flux et le pilotage.
    globalThis._liveQuiz = {registry, service: live};

    const quizzes = new QuizService(db);
    await quizzes.create("m1");
    for (const weight of [0, 1]) {
        await quizzes.addQuestion("m1", {
            blocks: [{id: crypto.randomUUID(), type: "text", props: {content: "Q ?"}}],
            weight, durationSeconds: 30,
            options: [{text: "oui", correct: true}, {text: "non", correct: false}],
        });
    }
    sessionId = (await live.createSession({moduleId: "m1", moduleSlug: "php", moduleTitle: "PHP", teacherId: "t1"})).id;
});

afterEach(() => {
    live.dispose();
    globalThis._liveQuiz = undefined;
    session = null;
});

const request = (signal: AbortSignal, query = "") =>
    new Request(`http://localhost/api/quiz/sessions/${sessionId}/stream${query}`, {signal});

describe("flux SSE du quiz", () => {
    test("envoie l'état initial, puis chaque transition, sans jamais révéler la bonne réponse pendant la phase autonome", async () => {
        await live.join(sessionId, student(1));
        const abort = new AbortController();
        const res = await sseResponse(request(abort.signal), sessionId, {userId: "u1"});
        expect(res.headers.get("Content-Type")).toBe("text/event-stream; charset=utf-8");
        expect(res.headers.get("Cache-Control")).toContain("no-transform");

        const stream = reader(res);
        expect((await stream.next()).phase).toBe("lobby");

        await live.start(sessionId);
        const open = await stream.next();
        expect(open.phase).toBe("running");
        expect(open.question?.index).toBe(0);
        expect(stream.raw.at(-1)).not.toContain("\"correct\"");

        await live.endRunning(sessionId);
        const reveal = await stream.next();
        expect(reveal.phase).toBe("review");
        expect(reveal.audience === "student" && reveal.reveal?.scoreMax).toBe(0);

        abort.abort();
        expect(registry.subscriberCount(sessionId)).toBe(0);
    });

    test("40 flux ouverts reçoivent tous chaque état, et se désabonnent à la fermeture", async () => {
        const aborts: AbortController[] = [];
        const streams = [];
        // Tous rejoignent d'abord : chaque arrivée est diffusée aux flux déjà ouverts.
        for (let i = 0; i < 40; i++) await live.join(sessionId, student(i));
        for (let i = 0; i < 40; i++) {
            const abort = new AbortController();
            aborts.push(abort);
            streams.push(reader(await sseResponse(request(abort.signal), sessionId, {userId: `u${i}`})));
        }
        await Promise.all(streams.map((s) => s.next()));
        expect(registry.subscriberCount(sessionId)).toBe(40);

        await live.start(sessionId);
        const states = await Promise.all(streams.map((s) => s.next()));
        expect(states.every((s) => s.phase === "running" && s.question?.index === 0)).toBe(true);

        // Chaque réponse est diffusée à tous : 40 réponses → 40 états de plus par flux.
        const optionId = states[0].question?.options.find((o) => o.text === "oui")?.id as string;
        const questionId = states[0].question?.id as string;
        await Promise.all(states.map((_, i) => live.submitAnswer(sessionId, `u${i}`, questionId, [optionId])));
        for (const s of streams) {
            let last: QuizPublicState | undefined;
            for (let n = 0; n < 40; n++) last = await s.next();
            // Chacun est passé à la question 2.
            expect(last?.question?.index).toBe(1);
        }

        aborts.forEach((a) => a.abort());
        expect(registry.subscriberCount(sessionId)).toBe(0);
    }, 30_000);

    test("un compte qui n'a pas rejoint ne peut pas ouvrir le flux étudiant", async () => {
        session = {user: {id: "intrus", role: "user", name: "In Trus"}};
        const res = await GET(request(new AbortController().signal), {params: Promise.resolve({id: sessionId})});
        expect(res.status).toBe(403);
    });

    test("seul un admin ouvre le flux de projection", async () => {
        session = {user: {id: "u1", role: "user", name: "Ana Martin"}};
        const denied = await GET(request(new AbortController().signal, "?audience=projection"), {params: Promise.resolve({id: sessionId})});
        expect(denied.status).toBe(403);

        session = {user: {id: "t1", role: "admin", name: "Prof Admin"}};
        const abort = new AbortController();
        const ok = await GET(request(abort.signal, "?audience=projection"), {params: Promise.resolve({id: sessionId})});
        expect(ok.status).toBe(200);
        const first = await reader(ok).next();
        expect(first.audience).toBe("projection");
        abort.abort();
    });

    test("sans session, le flux répond 401 ; session inconnue, 404", async () => {
        const anonymous = await GET(request(new AbortController().signal), {params: Promise.resolve({id: sessionId})});
        expect(anonymous.status).toBe(401);

        session = {user: {id: "t1", role: "admin", name: "Prof Admin"}};
        const missing = await GET(request(new AbortController().signal, "?audience=projection"), {params: Promise.resolve({id: "nope"})});
        expect(missing.status).toBe(404);
    });
});
