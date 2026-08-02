import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import type { Db } from "mongodb";

import { ensureIndexes } from "@/lib/db/indexes";

let db: Db;
let stopDb: () => Promise<void>;

beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);
beforeEach(async () => {
    await db.collection("modules").deleteMany({});
    await db.collection("course_content").deleteMany({});
    await db.collection("modules").dropIndexes().catch(() => {});
    await db.collection("course_content").dropIndexes().catch(() => {});
});

describe("ensureIndexes", () => {
    test("crée l'index unique sur modules.path", async () => {
        await ensureIndexes(db);

        const indexes = await db.collection("modules").indexes();
        const pathIndex = indexes.find((i) => i.name === "unique_module_path");

        expect(pathIndex).toBeDefined();
        expect(pathIndex?.unique).toBe(true);
        expect(pathIndex?.key).toEqual({ path: 1 });
    });

    test("crée l'index unique sur course_content", async () => {
        await ensureIndexes(db);

        const indexes = await db.collection("course_content").indexes();
        const contentIndex = indexes.find((i) => i.name === "unique_content_ref");

        expect(contentIndex).toBeDefined();
        expect(contentIndex?.unique).toBe(true);
        expect(contentIndex?.key).toEqual({ moduleSlug: 1, sectionSlug: 1, contentType: 1 });
    });

    test("est idempotent : un second appel ne lève pas et ne duplique pas les index", async () => {
        await ensureIndexes(db);
        const countAfterFirst = (await db.collection("modules").indexes()).length;

        const second = await ensureIndexes(db);
        expect(second).toBeDefined();

        const countAfterSecond = (await db.collection("modules").indexes()).length;
        expect(countAfterSecond).toBe(countAfterFirst);
    });

    test("l'unicité sur modules.path est réellement appliquée : un doublon est rejeté", async () => {
        await ensureIndexes(db);

        await db.collection("modules").insertOne({ path: "javascript", title: "JavaScript" });

        let duplicateRejected = false;
        try {
            await db.collection("modules").insertOne({ path: "javascript", title: "JavaScript bis" });
        } catch {
            duplicateRejected = true;
        }
        expect(duplicateRejected).toBe(true);

        const count = await db.collection("modules").countDocuments({ path: "javascript" });
        expect(count).toBe(1);
    });
});
