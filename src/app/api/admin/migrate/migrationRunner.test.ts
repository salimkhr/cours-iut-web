/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import type { Db } from "mongodb";
import { runCourseContentMigration, type MigrationRunnerDeps } from "./migrationRunner";

function createDeps(overrides: Partial<MigrationRunnerDeps> = {}): MigrationRunnerDeps {
    const db = {
        collection: () => ({
            find: () => ({
                toArray: async () => [],
            }),
        }),
    } as unknown as Db;

    return {
        connectToDB: async () => db,
        getAllTSXFiles: () => ["src/cours/javascript/1-le-dom/Cours.tsx"],
        deriveSlug: () => ({
            moduleSlug: "javascript",
            sectionSlug: "1-le-dom",
            contentType: "cours",
        }),
        parseFile: () => ({
            blocks: [{ id: "block-1", type: "text", props: { content: "Intro" }, children: [] }],
            warnings: [],
        }),
        upsertContent: async () => "content-id",
        updateContentRef: async () => true,
        ...overrides,
    };
}

describe("runCourseContentMigration", () => {
    test("dry-run parses files without opening a database connection", async () => {
        const result = await runCourseContentMigration({
            mode: "dry-run",
            deps: createDeps({
                connectToDB: async () => {
                    throw new Error("DB should not be opened in dry-run");
                },
            }),
        });

        expect(result).toMatchObject({
            mode: "dry-run",
            ok: 1,
            warn: 0,
            ignored: 0,
            error: 0,
            total: 1,
        });
        expect(result.results[0]).toMatchObject({
            file: "javascript/1-le-dom/Cours.tsx",
            blocks: 1,
            status: "dry-run",
        });
    });

    test("default mode leaves content edited after its first migration untouched", async () => {
        let upsertCalls = 0;
        const createdAt = new Date("2026-01-01T10:00:00.000Z");
        const updatedAt = new Date("2026-01-01T10:03:00.000Z");

        const result = await runCourseContentMigration({
            mode: "default",
            deps: createDeps({
                connectToDB: async () => ({
                    collection: () => ({
                        find: () => ({
                            toArray: async () => [{
                                moduleSlug: "javascript",
                                sectionSlug: "1-le-dom",
                                contentType: "cours",
                                createdAt,
                                updatedAt,
                            }],
                        }),
                    }),
                }) as unknown as Db,
                upsertContent: async () => {
                    upsertCalls++;
                    return "content-id";
                },
            }),
        });

        expect(upsertCalls).toBe(0);
        expect(result.ignored).toBe(1);
        expect(result.results[0]).toMatchObject({
            status: "ignored",
            skippedReason: "edited-after-migration",
        });
    });

    test("force mode overwrites content even when it was edited after migration", async () => {
        let upsertCalls = 0;
        let refCalls = 0;
        const createdAt = new Date("2026-01-01T10:00:00.000Z");
        const updatedAt = new Date("2026-01-01T10:03:00.000Z");

        const result = await runCourseContentMigration({
            mode: "force",
            deps: createDeps({
                connectToDB: async () => ({
                    collection: () => ({
                        find: () => ({
                            toArray: async () => [{
                                moduleSlug: "javascript",
                                sectionSlug: "1-le-dom",
                                contentType: "cours",
                                createdAt,
                                updatedAt,
                            }],
                        }),
                    }),
                }) as unknown as Db,
                upsertContent: async () => {
                    upsertCalls++;
                    return "content-id";
                },
                updateContentRef: async () => {
                    refCalls++;
                    return true;
                },
            }),
        });

        expect(upsertCalls).toBe(1);
        expect(refCalls).toBe(1);
        expect(result).toMatchObject({
            mode: "force",
            ok: 1,
            ignored: 0,
            error: 0,
            total: 1,
        });
        expect(result.results[0]).toMatchObject({
            status: "written",
        });
    });
});
