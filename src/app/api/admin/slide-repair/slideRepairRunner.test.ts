/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import type { Db } from "mongodb";
import { runSlideRepair, type SlideRepairRunnerDeps } from "./slideRepairRunner";

const cleanDoc = {
    _id: "clean-1",
    moduleSlug: "php",
    sectionSlug: "1-bases-du-php",
    contentType: "slide",
    version: 5,
    blocks: [{ id: "1", type: "slide", props: { title: "OK" }, children: [] }],
};

const brokenDoc = {
    _id: "broken-1",
    moduleSlug: "php",
    sectionSlug: "3-structurer-son-code",
    contentType: "slide",
    version: 3,
    blocks: [
        { id: "1", type: "section", props: { title: "Fonctions" }, children: [
            { id: "2", type: "text", props: { content: "Une fonction..." } },
        ] },
    ],
};

function createDeps(docs: unknown[], overrides: Partial<{ updateOne: (...args: unknown[]) => unknown; insertOne: (...args: unknown[]) => unknown }> = {}): SlideRepairRunnerDeps {
    const updateOneCalls: unknown[] = [];
    const insertOneCalls: unknown[] = [];
    const db = {
        collection: (name: string) => {
            if (name === "course_content") {
                return {
                    find: () => ({ toArray: async () => docs }),
                    updateOne: overrides.updateOne ?? (async (...args: unknown[]) => {
                        updateOneCalls.push(args);
                        return { matchedCount: 1 };
                    }),
                };
            }
            if (name === "course_content_backups") {
                return {
                    insertOne: overrides.insertOne ?? (async (...args: unknown[]) => {
                        insertOneCalls.push(args);
                        return { insertedId: "backup-1" };
                    }),
                };
            }
            throw new Error(`Unexpected collection: ${name}`);
        },
    } as unknown as Db;

    return { connectToDB: async () => db };
}

describe("runSlideRepair", () => {
    test("dry-run counts already-slide docs as clean and reports broken ones without writing", async () => {
        let updateCalled = false;
        const deps = createDeps([cleanDoc, brokenDoc], {
            updateOne: async () => { updateCalled = true; return { matchedCount: 1 }; },
        });

        const result = await runSlideRepair({ mode: "dry-run", deps });

        expect(updateCalled).toBe(false);
        expect(result).toMatchObject({ mode: "dry-run", total: 2, clean: 1, convertible: 1, warning: 0, error: 0 });
        expect(result.results).toHaveLength(1);
        expect(result.results[0]).toMatchObject({
            section: "php/3-structurer-son-code",
            rootTypesBefore: ["section"],
            blocksConverted: 2,
            status: "convertible",
        });
    });

    test("apply writes a backup then converts the broken doc's blocks", async () => {
        const updateOneCalls: unknown[] = [];
        const insertOneCalls: unknown[] = [];
        const deps = createDeps([brokenDoc], {
            updateOne: async (...args: unknown[]) => { updateOneCalls.push(args); return { matchedCount: 1 }; },
            insertOne: async (...args: unknown[]) => { insertOneCalls.push(args); return { insertedId: "backup-1" }; },
        });

        const result = await runSlideRepair({ mode: "apply", deps });

        expect(insertOneCalls).toHaveLength(1);
        expect(updateOneCalls).toHaveLength(1);
        expect(result).toMatchObject({ mode: "apply", total: 1, clean: 0, convertible: 1, warning: 0, error: 0 });
        expect(result.results[0]).toMatchObject({
            section: "php/3-structurer-son-code",
            version: 4,
            status: "converted",
        });

        const [filter, update] = updateOneCalls[0] as [unknown, { $set: { blocks: { type: string; children?: { type: string }[] }[] } }];
        expect(filter).toEqual({ _id: "broken-1" });
        expect(update.$set.blocks[0].type).toBe("slide");
        expect(update.$set.blocks[0].children?.[0]?.type).toBe("slide-text");
    });

    test("apply reports an error status without throwing when the write fails", async () => {
        const deps = createDeps([brokenDoc], {
            updateOne: async () => { throw new Error("boom"); },
        });

        const result = await runSlideRepair({ mode: "apply", deps });

        expect(result.error).toBe(1);
        expect(result.results[0]).toMatchObject({ status: "error", error: "boom" });
    });
});
