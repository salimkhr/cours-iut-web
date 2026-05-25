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
        expect(res.headers.get("Content-Disposition")).toContain("attachment");
    });
});
