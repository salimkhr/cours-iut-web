import { beforeAll, afterAll, beforeEach, afterEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";
import { ObjectId } from "bson";

// ── Shared mutable state ──────────────────────────────────────────────────────
let db: Db;
let session: { user: { id: string; role: string } } | null = null;

// ── Mocks (must be before any dynamic import of the routes) ───────────────────
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

// next/headers n'est pas utilisé dans ces routes, pas besoin de mock.

const { POST: postModule } = await import("@/app/api/admin/modules/route");
const { PUT: putModule } = await import("@/app/api/admin/modules/[moduleId]/route");

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

const VALID_MODULE = {
    title: "JavaScript",
    path: "javascript",
    iconName: "js",
    description: "Cours JS",
    associatedSae: [],
    coefficients: [{ competenceName: "1/ Réaliser un développement", value: 10 }],
    instructors: [],
    isExtra: false,
};

function makePostReq(body: unknown) {
    return new Request("http://localhost/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

function makePutReq(moduleId: string, body: unknown) {
    return new Request(`http://localhost/api/admin/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

function makeParams(moduleId: string) {
    return { params: Promise.resolve({ moduleId }) };
}

// ── POST /api/admin/modules ───────────────────────────────────────────────────
describe("POST /api/admin/modules", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await postModule(makePostReq(VALID_MODULE), {});
        expect(res.status).toBe(403);
    });

    test("400 si body invalide (title manquant)", async () => {
        session = ADMIN_SESSION;
        const { title: _, ...noTitle } = VALID_MODULE;
        const res = await postModule(makePostReq(noTitle), {});
        expect(res.status).toBe(400);
    });

    test("201 et insertedId sur succès", async () => {
        session = ADMIN_SESSION;
        const res = await postModule(makePostReq(VALID_MODULE), {});
        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.insertedId).toBeDefined();

        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.title).toBe("JavaScript");
    });
});

// ── PUT /api/admin/modules/[moduleId] ─────────────────────────────────────────
describe("PUT /api/admin/modules/[moduleId]", () => {
    test("403 si pas admin", async () => {
        session = null;
        const fakeId = new ObjectId().toHexString();
        const res = await putModule(makePutReq(fakeId, VALID_MODULE), makeParams(fakeId));
        expect(res.status).toBe(403);
    });

    test("400 si body invalide", async () => {
        session = ADMIN_SESSION;
        const fakeId = new ObjectId().toHexString();
        const res = await putModule(makePutReq(fakeId, { title: "" }), makeParams(fakeId));
        expect(res.status).toBe(400);
    });

    test("404 si module inexistant", async () => {
        session = ADMIN_SESSION;
        const fakeId = new ObjectId().toHexString();
        const res = await putModule(makePutReq(fakeId, VALID_MODULE), makeParams(fakeId));
        expect(res.status).toBe(404);
    });

    test("200 sur mise à jour réussie", async () => {
        session = ADMIN_SESSION;
        const inserted = await db.collection("modules").insertOne({ ...VALID_MODULE, sections: [] });
        const moduleId = inserted.insertedId.toHexString();

        const updated = { ...VALID_MODULE, title: "JavaScript Avancé" };
        const res = await putModule(makePutReq(moduleId, updated), makeParams(moduleId));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);

        const doc = await db.collection("modules").findOne({ _id: inserted.insertedId });
        expect(doc?.title).toBe("JavaScript Avancé");
    });
});
