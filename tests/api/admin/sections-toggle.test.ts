import { beforeAll, afterAll, beforeEach, afterEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";
import { ObjectId } from "bson";

// ── Shared mutable state ──────────────────────────────────────────────────────
let db: Db;
let session: { user: { id: string; role: string } } | null = null;

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

const { PUT } = await import("@/app/api/admin/[moduleId]/sections/[order]/route");

// ── DB lifecycle ──────────────────────────────────────────────────────────────
let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);

beforeEach(() => { session = null; });
afterEach(async () => { await db.collection("modules").deleteMany({}); });

// ── Helpers ───────────────────────────────────────────────────────────────────
const ADMIN_SESSION = { user: { id: "u1", role: "admin" } };

function makeReq(moduleId: string, order: string, body: unknown) {
    return new Request(`http://localhost/api/admin/${moduleId}/sections/${order}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

function makeContext(moduleId: string, order: string) {
    return { params: Promise.resolve({ moduleId, order }) };
}

async function insertModuleWithSection(isAvailable = false) {
    const _id = new ObjectId();
    await db.collection("modules").insertOne({
        _id,
        title: "Test",
        path: "test",
        sections: [
            {
                _id: new ObjectId().toHexString(),
                title: "Section 1",
                path: "s1",
                order: 1,
                isAvailable,
                correctionIsAvailable: false,
                examenIsLock: false,
            },
        ],
    });
    return _id;
}

// ── PUT /api/admin/[moduleId]/sections/[order] ────────────────────────────────
describe("PUT /api/admin/[moduleId]/sections/[order]", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await PUT(makeReq("fakeId", "1", { key: "isAvailable", value: true }), makeContext("fakeId", "1"));
        expect(res.status).toBe(403);
    });

    test("400 si key invalide", async () => {
        session = ADMIN_SESSION;
        const moduleId = new ObjectId().toHexString();
        const res = await PUT(makeReq(moduleId, "1", { key: "hackField", value: true }), makeContext(moduleId, "1"));
        expect(res.status).toBe(400);
    });

    test("400 si value n'est pas un booléen", async () => {
        session = ADMIN_SESSION;
        const moduleId = new ObjectId().toHexString();
        const res = await PUT(makeReq(moduleId, "1", { key: "isAvailable", value: "oui" }), makeContext(moduleId, "1"));
        expect(res.status).toBe(400);
    });

    test("404 si module ou section introuvable", async () => {
        session = ADMIN_SESSION;
        const moduleId = new ObjectId().toHexString();
        const res = await PUT(makeReq(moduleId, "99", { key: "isAvailable", value: true }), makeContext(moduleId, "99"));
        expect(res.status).toBe(404);
    });

    test("200 — isAvailable mis à true", async () => {
        session = ADMIN_SESSION;
        const _id = await insertModuleWithSection(false);
        const moduleId = _id.toHexString();

        const res = await PUT(makeReq(moduleId, "1", { key: "isAvailable", value: true }), makeContext(moduleId, "1"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.key).toBe("isAvailable");
        expect(body.value).toBe(true);

        const doc = await db.collection("modules").findOne({ _id });
        expect(doc?.sections[0].isAvailable).toBe(true);
    });

    test("200 — examenIsLock mis à true", async () => {
        session = ADMIN_SESSION;
        const _id = await insertModuleWithSection();
        const moduleId = _id.toHexString();

        const res = await PUT(makeReq(moduleId, "1", { key: "examenIsLock", value: true }), makeContext(moduleId, "1"));
        expect(res.status).toBe(200);
        const doc = await db.collection("modules").findOne({ _id });
        expect(doc?.sections[0].examenIsLock).toBe(true);
    });
});
