import { beforeAll, afterAll, afterEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;
let dbError: Error | null = null;

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (dbError) throw dbError;
        return db;
    },
}));

const { GET } = await import("@/app/api/health/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(() => stopDb(), 10000);
afterEach(() => { dbError = null; });

describe("GET /api/health", () => {
    test("returns status ok when DB is up", async () => {
        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.status).toBe("ok");
        expect(body.db.status).toBe("up");
        expect(typeof body.db.latencyMs).toBe("number");
    });

    test("returns status degraded when DB is down", async () => {
        dbError = new Error("connection refused");
        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.status).toBe("degraded");
        expect(body.db.status).toBe("down");
    });
});
