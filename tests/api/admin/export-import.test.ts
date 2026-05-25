import { beforeAll, afterAll, beforeEach, afterEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

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

const { GET: exportModules } = await import("@/app/api/admin/export/route");
const { POST: importModules } = await import("@/app/api/admin/import/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);

beforeEach(() => { session = null; });
afterEach(async () => { await db.collection("modules").deleteMany({}); });

const ADMIN_SESSION = { user: { id: "u1", role: "admin" } };

function makeGetReq() {
    return new Request("http://localhost/api/admin/export", { method: "GET" });
}

describe("GET /api/admin/export", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await exportModules(makeGetReq(), {});
        expect(res.status).toBe(403);
    });

    test("200 avec tableau vide si aucun module", async () => {
        session = ADMIN_SESSION;
        const res = await exportModules(makeGetReq(), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body).toHaveLength(0);
    });

    test("200 avec modules sans _id", async () => {
        session = ADMIN_SESSION;
        await db.collection("modules").insertOne({
            title: "JS", path: "javascript", iconName: "code",
            sections: [], isExtra: false, associatedSae: [],
            coefficients: [], instructors: [],
        });
        const res = await exportModules(makeGetReq(), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(1);
        expect(body[0]._id).toBeUndefined();
        expect(body[0].path).toBe("javascript");
    });

    test("header Content-Disposition présent", async () => {
        session = ADMIN_SESSION;
        const res = await exportModules(makeGetReq(), {});
        expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="modules-export.json"');
    });
});

function makePostReq(body: unknown) {
    return new Request("http://localhost/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const VALID_MODULE = {
    title: "JavaScript",
    path: "javascript",
    iconName: "code",
    description: "",
    isExtra: false,
    associatedSae: [],
    coefficients: [],
    manager: { firstName: "", lastName: "", email: "" },
    instructors: [],
    sections: [
        {
            title: "Intro",
            path: "1-intro",
            order: 1,
            contents: ["cours"],
            totalDuration: 1,
            isAvailable: true,
            hasCorrection: false,
            correctionIsAvailable: false,
            examenIsLock: false,
            description: "",
            objectives: [],
            tags: [],
        },
    ],
};

describe("POST /api/admin/import", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await importModules(makePostReq([VALID_MODULE]), {});
        expect(res.status).toBe(403);
    });

    test("400 si body n'est pas un tableau", async () => {
        session = ADMIN_SESSION;
        const res = await importModules(makePostReq({ notAnArray: true }), {});
        expect(res.status).toBe(400);
    });

    test("400 si un module n'a pas de path", async () => {
        session = ADMIN_SESSION;
        const res = await importModules(makePostReq([{ title: "Sans path" }]), {});
        expect(res.status).toBe(400);
    });

    test("200 — insère un nouveau module", async () => {
        session = ADMIN_SESSION;
        const res = await importModules(makePostReq([VALID_MODULE]), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.inserted).toBe(1);
        expect(body.updated).toBe(0);

        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.title).toBe("JavaScript");
        expect(doc?.sections).toHaveLength(1);
    });

    test("200 — met à jour un module existant", async () => {
        session = ADMIN_SESSION;
        await db.collection("modules").insertOne({ ...VALID_MODULE, sections: [] });

        const updated = { ...VALID_MODULE, title: "JavaScript Avancé" };
        const res = await importModules(makePostReq([updated]), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.inserted).toBe(0);
        expect(body.updated).toBe(1);

        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.title).toBe("JavaScript Avancé");
    });

    test("sections existantes en prod non présentes dans l'import sont conservées", async () => {
        session = ADMIN_SESSION;
        const existingSection = {
            title: "Section prod",
            path: "99-prod-only",
            order: 99,
            contents: ["cours"],
            totalDuration: 1,
            isAvailable: true,
            hasCorrection: false,
            correctionIsAvailable: false,
            examenIsLock: false,
            description: "",
            objectives: [],
            tags: [],
        };
        await db.collection("modules").insertOne({
            ...VALID_MODULE,
            sections: [existingSection],
        });

        // Import avec une section différente (path différent)
        const res = await importModules(makePostReq([VALID_MODULE]), {});
        expect(res.status).toBe(200);

        const doc = await db.collection("modules").findOne({ path: "javascript" });
        const paths = doc?.sections.map((s: { path: string }) => s.path);
        expect(paths).toContain("99-prod-only");   // conservée
        expect(paths).toContain("1-intro");        // importée
    });
});
