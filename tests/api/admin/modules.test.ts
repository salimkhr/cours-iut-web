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

// DELETE invalide le cache des contenus supprimés : hors requête Next, revalidateTag lève
// « static generation store missing ».
const revalidatedTags: string[] = [];
mock.module("next/cache", () => ({
    revalidateTag: (tag: string) => { revalidatedTags.push(tag); },
}));

// next/headers n'est pas utilisé dans ces routes, pas besoin de mock.

const { POST: postModule } = await import("@/app/api/admin/modules/route");
const { PUT: putModule, DELETE: deleteModule } = await import("@/app/api/admin/modules/[moduleId]/route");

// ── DB lifecycle ──────────────────────────────────────────────────────────────
let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);

beforeEach(() => { session = null; revalidatedTags.length = 0; });
const CASCADE_COLLECTIONS = ["modules", "course_content", "module_quizzes", "quiz_sessions", "quiz_participants", "quiz_answers"];
afterEach(async () => {
    for (const name of CASCADE_COLLECTIONS) await db.collection(name).deleteMany({});
});

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

    test("POST assigne une couleur si absente", async () => {
        session = ADMIN_SESSION;
        const res = await postModule(makePostReq({ ...VALID_MODULE, sections: [] }), {});
        expect(res.status).toBe(201);
        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.colorLight).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(doc?.colorDark).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    test("POST conserve une couleur fournie", async () => {
        session = ADMIN_SESSION;
        const res = await postModule(makePostReq({ ...VALID_MODULE, sections: [], colorLight: "#0F6E6E", colorDark: "#4FD1C5" }), {});
        expect(res.status).toBe(201);
        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.colorLight).toBe("#0F6E6E");
    });
});

describe("POST /api/admin/modules — ordre d'affichage", () => {
    test("sans aucun ordre existant, n'en pose pas (ordre de création conservé)", async () => {
        session = ADMIN_SESSION;
        await db.collection("modules").insertOne({ ...VALID_MODULE, path: "php", sections: [] });
        const res = await postModule(makePostReq(VALID_MODULE), {});
        expect(res.status).toBe(201);
        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.order ?? undefined).toBeUndefined();
    });

    test("par défaut, order = max(order existants) + 1", async () => {
        session = ADMIN_SESSION;
        await db.collection("modules").insertMany([
            { ...VALID_MODULE, path: "php", sections: [], order: 2 },
            { ...VALID_MODULE, path: "rust", sections: [], order: 5 },
            { ...VALID_MODULE, path: "brainfuck", sections: [] },
        ]);
        const res = await postModule(makePostReq(VALID_MODULE), {});
        expect(res.status).toBe(201);
        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.order).toBe(6);
    });

    test("conserve un order fourni", async () => {
        session = ADMIN_SESSION;
        await db.collection("modules").insertOne({ ...VALID_MODULE, path: "php", sections: [], order: 5 });
        const res = await postModule(makePostReq({ ...VALID_MODULE, order: 2 }), {});
        expect(res.status).toBe(201);
        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.order).toBe(2);
    });

    test("400 si order invalide", async () => {
        session = ADMIN_SESSION;
        const res = await postModule(makePostReq({ ...VALID_MODULE, order: 0 }), {});
        expect(res.status).toBe(400);
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

    test("met à jour order", async () => {
        session = ADMIN_SESSION;
        const inserted = await db.collection("modules").insertOne({ ...VALID_MODULE, sections: [], order: 1 });
        const moduleId = inserted.insertedId.toHexString();
        const res = await putModule(makePutReq(moduleId, { ...VALID_MODULE, order: 3 }), makeParams(moduleId));
        expect(res.status).toBe(200);
        const doc = await db.collection("modules").findOne({ _id: inserted.insertedId });
        expect(doc?.order).toBe(3);
    });
});

// ── DELETE /api/admin/modules/[moduleId] ──────────────────────────────────────
describe("DELETE /api/admin/modules/[moduleId]", () => {
    /** Module complet : contenus, quiz, une session live, un participant et une réponse. */
    async function seedModuleWithData(path: string) {
        const inserted = await db.collection("modules").insertOne({
            ...VALID_MODULE, path, sections: [{ path: "1-intro", title: "Intro", contents: [] }],
        });
        const moduleId = inserted.insertedId.toHexString();
        const sessionId = `session-${path}`;
        await db.collection("course_content").insertMany([
            { moduleSlug: path, sectionSlug: "1-intro", contentType: "cours", blocks: [] },
            { moduleSlug: path, sectionSlug: "1-intro", contentType: "TP", blocks: [] },
        ]);
        await db.collection<{ _id: string }>("module_quizzes").insertOne({ _id: `quiz-${path}`, moduleId, questions: [] });
        await db.collection<{ _id: string }>("quiz_sessions").insertOne({ _id: sessionId, moduleId, moduleSlug: path });
        await db.collection("quiz_participants").insertOne({ sessionId, userId: "student-1" });
        await db.collection("quiz_answers").insertOne({ sessionId, questionId: "q1", userId: "student-1" });
        return { moduleId, objectId: inserted.insertedId, sessionId };
    }

    function makeDeleteReq(moduleId: string) {
        return new Request(`http://localhost/api/admin/modules/${moduleId}`, { method: "DELETE" });
    }

    test("403 si pas admin, rien n'est supprimé", async () => {
        session = null;
        const { moduleId } = await seedModuleWithData("javascript");
        const res = await deleteModule(makeDeleteReq(moduleId), makeParams(moduleId));
        expect(res.status).toBe(403);
        expect(await db.collection("modules").countDocuments()).toBe(1);
        expect(await db.collection("course_content").countDocuments()).toBe(2);
    });

    test("404 si module inexistant", async () => {
        session = ADMIN_SESSION;
        const fakeId = new ObjectId().toHexString();
        const res = await deleteModule(makeDeleteReq(fakeId), makeParams(fakeId));
        expect(res.status).toBe(404);
    });

    test("404 si moduleId mal formé", async () => {
        session = ADMIN_SESSION;
        const res = await deleteModule(makeDeleteReq("pas-un-id"), makeParams("pas-un-id"));
        expect(res.status).toBe(404);
    });

    test("supprime le module, ses contenus et ses données de quiz, sans toucher aux autres modules", async () => {
        session = ADMIN_SESSION;
        const target = await seedModuleWithData("javascript");
        const sibling = await seedModuleWithData("php");

        const res = await deleteModule(makeDeleteReq(target.moduleId), makeParams(target.moduleId));
        expect(res.status).toBe(200);

        expect(await db.collection("modules").findOne({ _id: target.objectId })).toBeNull();
        expect(await db.collection("course_content").countDocuments({ moduleSlug: "javascript" })).toBe(0);
        expect(await db.collection("module_quizzes").countDocuments({ moduleId: target.moduleId })).toBe(0);
        expect(await db.collection("quiz_sessions").countDocuments({ moduleId: target.moduleId })).toBe(0);
        expect(await db.collection("quiz_participants").countDocuments({ sessionId: target.sessionId })).toBe(0);
        expect(await db.collection("quiz_answers").countDocuments({ sessionId: target.sessionId })).toBe(0);
        expect(revalidatedTags).toContain("content:javascript:1-intro:cours");
        expect(revalidatedTags).toContain("content:javascript:1-intro:TP");
        expect(revalidatedTags.some((t) => t.startsWith("content:php:"))).toBe(false);

        // Le module voisin et toute sa chaîne restent intacts.
        expect(await db.collection("modules").findOne({ _id: sibling.objectId })).not.toBeNull();
        expect(await db.collection("course_content").countDocuments({ moduleSlug: "php" })).toBe(2);
        expect(await db.collection("module_quizzes").countDocuments({ moduleId: sibling.moduleId })).toBe(1);
        expect(await db.collection("quiz_sessions").countDocuments({ moduleId: sibling.moduleId })).toBe(1);
        expect(await db.collection("quiz_participants").countDocuments({ sessionId: sibling.sessionId })).toBe(1);
        expect(await db.collection("quiz_answers").countDocuments({ sessionId: sibling.sessionId })).toBe(1);
    });

    test("permet de recréer les contenus d'un module de même slug après suppression", async () => {
        session = ADMIN_SESSION;
        await db.collection("course_content").createIndex(
            { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
            { unique: true, name: "unique_content_ref" },
        );
        const target = await seedModuleWithData("javascript");
        const res = await deleteModule(makeDeleteReq(target.moduleId), makeParams(target.moduleId));
        expect(res.status).toBe(200);

        // Sans le nettoyage, cette insertion lève une erreur de clé dupliquée (E11000).
        await db.collection("course_content").insertOne(
            { moduleSlug: "javascript", sectionSlug: "1-intro", contentType: "cours", blocks: [] },
        );
        expect(await db.collection("course_content").countDocuments({ moduleSlug: "javascript" })).toBe(1);
    });
});
