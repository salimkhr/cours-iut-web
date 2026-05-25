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

const { POST: postSection, PUT: putSection } = await import("@/app/api/admin/[moduleId]/sections/route");

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

const VALID_SECTION = {
    title: "Introduction",
    path: "intro",
    description: "Section d'introduction",
    objectives: ["Comprendre les bases"],
    tags: ["débutant"],
    totalDuration: 2,
    hasCorrection: false,
    isAvailable: true,
    correctionIsAvailable: false,
    examenIsLock: false,
    order: 1,
    contents: ["cours"] as const,
};

function makePostReq(moduleId: string, body: unknown) {
    return new Request(`http://localhost/api/admin/${moduleId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

function makePutReq(moduleId: string, body: unknown) {
    return new Request(`http://localhost/api/admin/${moduleId}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

function makeContext(moduleId: string) {
    return { params: Promise.resolve({ moduleId }) };
}

async function insertModule(moduleId?: ObjectId) {
    const _id = moduleId ?? new ObjectId();
    await db.collection("modules").insertOne({ _id, title: "Test", path: "test", sections: [] });
    return _id;
}

// ── POST /api/admin/[moduleId]/sections ───────────────────────────────────────
describe("POST /api/admin/[moduleId]/sections", () => {
    test("403 si pas admin", async () => {
        session = null;
        const moduleId = new ObjectId().toHexString();
        const res = await postSection(makePostReq(moduleId, VALID_SECTION), makeContext(moduleId));
        expect(res.status).toBe(403);
    });

    test("400 si body invalide (title manquant)", async () => {
        session = ADMIN_SESSION;
        const moduleId = new ObjectId().toHexString();
        const { title: _, ...noTitle } = VALID_SECTION;
        const res = await postSection(makePostReq(moduleId, noTitle), makeContext(moduleId));
        expect(res.status).toBe(400);
    });

    test("404 si module inexistant", async () => {
        session = ADMIN_SESSION;
        const moduleId = new ObjectId().toHexString();
        const res = await postSection(makePostReq(moduleId, VALID_SECTION), makeContext(moduleId));
        expect(res.status).toBe(404);
    });

    test("200 et section ajoutée sur succès", async () => {
        session = ADMIN_SESSION;
        const _id = await insertModule();
        const moduleId = _id.toHexString();

        const res = await postSection(makePostReq(moduleId, VALID_SECTION), makeContext(moduleId));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.section.title).toBe("Introduction");

        const doc = await db.collection("modules").findOne({ _id });
        expect((doc as any)?.sections).toHaveLength(1);
    });
});

// ── PUT /api/admin/[moduleId]/sections ────────────────────────────────────────
describe("PUT /api/admin/[moduleId]/sections", () => {
    test("403 si pas admin", async () => {
        session = null;
        const moduleId = new ObjectId().toHexString();
        const res = await putSection(makePutReq(moduleId, {}), makeContext(moduleId));
        expect(res.status).toBe(403);
    });

    test("400 si body invalide", async () => {
        session = ADMIN_SESSION;
        const moduleId = new ObjectId().toHexString();
        const res = await putSection(makePutReq(moduleId, { title: "" }), makeContext(moduleId));
        expect(res.status).toBe(400);
    });

    test("404 si module inexistant", async () => {
        session = ADMIN_SESSION;
        const moduleId = new ObjectId().toHexString();
        const payload = { ...VALID_SECTION, sectionId: "sid1" };
        const res = await putSection(makePutReq(moduleId, payload), makeContext(moduleId));
        expect(res.status).toBe(404);
    });

    test("404 si section introuvable dans le module", async () => {
        session = ADMIN_SESSION;
        const _id = await insertModule();
        const moduleId = _id.toHexString();
        // path "intro" n'existe pas dans les sections du module vide
        const payload = { ...VALID_SECTION, sectionId: "sid1" };
        const res = await putSection(makePutReq(moduleId, payload), makeContext(moduleId));
        expect(res.status).toBe(404);
    });

    test("200 sur mise à jour réussie", async () => {
        session = ADMIN_SESSION;
        const sectionId = new ObjectId().toHexString();
        const _id = await insertModule();
        await db.collection("modules").updateOne(
            { _id },
            { $set: { sections: [{ ...VALID_SECTION, _id: sectionId }] } },
        );
        const moduleId = _id.toHexString();

        const payload = { ...VALID_SECTION, title: "Introduction modifiée", sectionId };
        const res = await putSection(makePutReq(moduleId, payload), makeContext(moduleId));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
    });
});
