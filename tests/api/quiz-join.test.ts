import {afterAll, beforeAll, describe, expect, mock, test} from "bun:test";
import type {Db} from "mongodb";

let db: Db;
let session: {user: {id: string; name?: string; role: string; email: string}} | null = null;

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

const {POST} = await import("@/app/api/quiz/join/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const {startMemoryDb} = await import("../helpers/db");
    ({db, stop: stopDb} = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);

const join = () => POST(new Request("http://localhost/api/quiz/join", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({code: "ZZZZZZ"}),
}));

describe("POST /api/quiz/join : compte générique", () => {
    test("refuse le compte générique non admin", async () => {
        session = {user: {id: "g", name: "Cours", role: "user", email: "cours@salimkhraimeche.dev"}};
        const res = await join();
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toBe("Connectez-vous avec votre compte personnel pour participer");
        expect(body.code).toBe("generic_account");
    });

    test("laisse passer le compte générique admin", async () => {
        session = {user: {id: "g", name: "Cours", role: "admin", email: "cours@salimkhraimeche.dev"}};
        expect((await join()).status).toBe(404);
    });

    test("laisse passer un étudiant", async () => {
        session = {user: {id: "e", name: "Ana Lopez", role: "user", email: "ana@etu.test"}};
        expect((await join()).status).toBe(404);
    });
});
