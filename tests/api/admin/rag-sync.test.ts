import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
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

const { POST } = await import("@/app/api/admin/rag/sync/route");

let stopDb: () => Promise<void>;
// Bun charge .env.local : on retire la clé pour qu'aucun test n'appelle Mistral.
const savedKey = process.env.MISTRAL_API_KEY;
beforeAll(async () => {
    delete process.env.MISTRAL_API_KEY;
    const { startMemoryDb } = await import("../../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(async () => {
    if (savedKey !== undefined) process.env.MISTRAL_API_KEY = savedKey;
    await stopDb?.();
}, 10000);

beforeEach(() => { session = null; });

const req = () => new Request("http://localhost/api/admin/rag/sync", { method: "POST" });

describe("POST /api/admin/rag/sync", () => {
    test("refuse un non-admin", async () => {
        session = { user: { id: "u1", role: "student" } };

        const res = await POST(req(), undefined);

        expect(res.status).toBe(403);
    });

    test("renvoie l'erreur de la synchro avec un statut 500", async () => {
        session = { user: { id: "u1", role: "admin" } };

        const res = await POST(req(), undefined);

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: "MISTRAL_API_KEY manquante" });
    });
});
