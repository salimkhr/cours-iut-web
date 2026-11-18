import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test} from "bun:test";
import type {Db} from "mongodb";

let db: Db;
let session: {user: {id: string; role: string}} | null = null;

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

mock.module("@/lib/auth", () => ({
    getServerSession: async () => session,
    auth: {},
}));

const examMode = await import("@/lib/examMode");
const {GET, PUT, DELETE} = await import("@/app/api/admin/exam-mode/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const {startMemoryDb} = await import("../../helpers/db");
    ({db, stop: stopDb} = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);

beforeEach(() => {
    session = null;
    examMode.resetExamModeCache();
});
afterEach(async () => {
    await db.collection("app_settings").deleteMany({});
});

const ADMIN = {user: {id: "admin-1", role: "admin"}};
const STUDENT = {user: {id: "etu-1", role: "user"}};

function put(body: unknown) {
    return new Request("http://localhost/api/admin/exam-mode", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
    });
}
const get = () => new Request("http://localhost/api/admin/exam-mode");
const del = () => new Request("http://localhost/api/admin/exam-mode", {method: "DELETE"});

describe("examMode (lib)", () => {
    test("inactif par défaut", async () => {
        expect(await examMode.isExamModeActive()).toBe(false);
    });

    test("actif jusqu'à la date de fin, puis s'éteint seul", async () => {
        const now = new Date("2026-11-20T08:00:00Z");
        await examMode.enableExamMode(120, "admin-1", now);
        expect(await examMode.isExamModeActive(new Date("2026-11-20T09:59:00Z"))).toBe(true);
        examMode.resetExamModeCache();
        expect(await examMode.isExamModeActive(new Date("2026-11-20T10:01:00Z"))).toBe(false);
    });

    test("désactivation immédiate", async () => {
        await examMode.enableExamMode(60, "admin-1");
        expect(await examMode.isExamModeActive()).toBe(true);
        await examMode.disableExamMode();
        expect(await examMode.isExamModeActive()).toBe(false);
    });

    test("échoue fermé si la base ne répond pas", async () => {
        const saved = db;
        // @ts-expect-error reason: simule une base indisponible
        db = undefined;
        try {
            expect(await examMode.isExamModeActive()).toBe(false);
        } finally {
            db = saved;
        }
    });
});

describe("/api/admin/exam-mode", () => {
    test("403 pour un non-admin", async () => {
        session = STUDENT;
        expect((await GET(get(), {})).status).toBe(403);
        expect((await PUT(put({durationMinutes: 60}), {})).status).toBe(403);
        expect((await DELETE(del(), {})).status).toBe(403);
    });

    test("PUT active, GET renvoie l'état, DELETE désactive", async () => {
        session = ADMIN;
        const res = await PUT(put({durationMinutes: 120}), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.active).toBe(true);
        expect(typeof body.until).toBe("string");

        const state = await (await GET(get(), {})).json();
        expect(state.active).toBe(true);
        expect(state.enabledBy).toBe("admin-1");

        expect((await DELETE(del(), {})).status).toBe(200);
        expect((await (await GET(get(), {})).json()).active).toBe(false);
    });

    test("PUT refuse une durée hors bornes", async () => {
        session = ADMIN;
        expect((await PUT(put({durationMinutes: 5}), {})).status).toBe(400);
        expect((await PUT(put({durationMinutes: 24 * 60}), {})).status).toBe(400);
        expect((await PUT(put({}), {})).status).toBe(400);
    });
});
