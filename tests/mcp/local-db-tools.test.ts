import { beforeEach, afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Db } from "mongodb";

import type { Block } from "@/types/CourseContent";
import {
    assertLocalMongoUri,
    getLocalContent,
    getLocalModule,
    getLocalSection,
    replaceLocalModuleSections,
    saveLocalContent,
} from "@/lib/mcp/localDbTools";

let db: Db;
let stopDb: () => Promise<void>;

beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60_000);

afterAll(async () => {
    await stopDb?.();
}, 10_000);

beforeEach(async () => {
    await db.collection("modules").deleteMany({});
    await db.collection("course_content").deleteMany({});

    await db.collection("modules").insertOne({
        path: "html-css",
        title: "HTML & CSS",
        iconName: "BookOpen",
        description: "Bases du Web",
        associatedSae: [],
        coefficients: [],
        instructors: [],
        isExtra: false,
        isVisible: true,
        updatedAt: new Date("2026-01-02T03:04:05.000Z"),
        sections: [{
            path: "1-rappel-de-html",
            title: "Rappel de HTML",
            description: "Revision du balisage",
            order: 1,
            contents: [{ type: "cours", source: "file" }],
            objectives: ["Structurer une page"],
            tags: ["html"],
            totalDuration: 1,
            hasCorrection: false,
            isAvailable: true,
            correctionIsAvailable: false,
            examenIsLock: false,
        }],
    });
});

const sampleBlocks: Block[] = [{
    id: "root",
    type: "section",
    props: { title: "Les bases" },
    children: [{
        id: "txt",
        type: "text",
        props: { content: "Un rappel local." },
        children: [],
    }],
}];

describe("assertLocalMongoUri", () => {
    test("accepte uniquement les hotes Mongo locaux", () => {
        expect(assertLocalMongoUri("mongodb://127.0.0.1:27017")).toEqual({
            protocol: "mongodb:",
            hosts: ["127.0.0.1"],
            databaseName: "cours-iut-web",
        });
        expect(assertLocalMongoUri("mongodb://localhost:27017/cours-iut-web").hosts).toEqual(["localhost"]);

        expect(() => assertLocalMongoUri("mongodb+srv://cluster.example.net/cours-iut-web"))
            .toThrow("MCP local refuse");
        expect(() => assertLocalMongoUri("mongodb://mongo.example.net:27017/cours-iut-web"))
            .toThrow("MCP local refuse");
    });
});

describe("metadata locale", () => {
    test("retourne un module sans _id ni sections imbriquees", async () => {
        const metadata = await getLocalModule(db, "html-css");

        expect(metadata).toMatchObject({
            slug: "html-css",
            title: "HTML & CSS",
            iconName: "BookOpen",
            description: "Bases du Web",
            sectionCount: 1,
            sectionSlugs: ["1-rappel-de-html"],
            updatedAt: "2026-01-02T03:04:05.000Z",
        });
        expect(metadata).not.toHaveProperty("_id");
        expect(metadata).not.toHaveProperty("sections");
    });

    test("retourne une section avec ses refs de contenu serialisees", async () => {
        const section = await getLocalSection(db, "html-css", "1-rappel-de-html");

        expect(section).toEqual({
            module: "html-css",
            slug: "1-rappel-de-html",
            title: "Rappel de HTML",
            description: "Revision du balisage",
            order: 1,
            contents: [{ type: "cours", source: "file" }],
            objectives: ["Structurer une page"],
            tags: ["html"],
            totalDuration: 1,
            hasCorrection: false,
            isAvailable: true,
            correctionIsAvailable: false,
            examenIsLock: false,
        });
    });
});

describe("ecriture locale", () => {
    test("dry-run de saveLocalContent ne modifie ni contenu ni ref de section", async () => {
        const result = await saveLocalContent(db, {
            moduleSlug: "html-css",
            sectionSlug: "1-rappel-de-html",
            contentType: "cours",
        }, sampleBlocks, { dryRun: true });

        expect(result).toMatchObject({
            dryRun: true,
            wouldWrite: true,
            module: "html-css",
            section: "1-rappel-de-html",
            type: "cours",
            rootBlockCount: 1,
        });
        expect(await db.collection("course_content").countDocuments()).toBe(0);
        const section = await getLocalSection(db, "html-css", "1-rappel-de-html");
        expect(section.contents).toEqual([{ type: "cours", source: "file" }]);
    });

    test("saveLocalContent sauvegarde les blocs et met a jour la ref de section", async () => {
        const result = await saveLocalContent(db, {
            moduleSlug: "html-css",
            sectionSlug: "1-rappel-de-html",
            contentType: "cours",
        }, sampleBlocks);

        expect(result.dryRun).toBe(false);
        expect(result.version).toBe(1);
        expect(result.contentId).toBeTruthy();

        const stored = await getLocalContent(db, {
            moduleSlug: "html-css",
            sectionSlug: "1-rappel-de-html",
            contentType: "cours",
        });
        expect(stored.blocks).toEqual([{
            id: "root",
            type: "section",
            props: { title: "Les bases" },
            children: [{
                id: "txt",
                type: "text",
                props: { content: "Un rappel local." },
            }],
        }]);

        const section = await getLocalSection(db, "html-css", "1-rappel-de-html");
        expect(section.contents).toEqual([{
            type: "cours",
            source: "db",
            contentId: result.contentId,
        }]);
    });

    test("replaceLocalModuleSections refuse de remplacer des sections sans force", async () => {
        await expect(replaceLocalModuleSections(db, "html-css", [{
            path: "2-rappel-css",
            title: "Rappel de CSS",
            order: 2,
            contents: [{ type: "cours", source: "file" }],
            objectives: [],
            tags: ["css"],
            totalDuration: 1,
            hasCorrection: false,
            isAvailable: true,
            correctionIsAvailable: false,
            examenIsLock: false,
        }])).rejects.toThrow("force");
    });
});
