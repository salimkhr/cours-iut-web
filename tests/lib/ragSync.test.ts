import {afterAll, beforeAll, describe, expect, test} from "bun:test";
import type {Db} from "mongodb";
import {startMemoryDb} from "../helpers/db";
import {getLastSync, loadIndexableContents, saveLastSync} from "@/lib/rag/runSync";

let db: Db;
let stop: () => Promise<void>;

const ancien = new Date("2026-11-01");
const recent = new Date("2026-11-05");

beforeAll(async () => {
    ({db, stop} = await startMemoryDb());
    await db.collection("modules").insertMany([
        {
            path: "php", title: "PHP", isVisible: true, updatedAt: ancien,
            sections: [{
                path: "1-tableaux", title: "Tableaux",
                contents: [{type: "cours", source: "db"}, {type: "TP", source: "db"}, {type: "slide", source: "db"}],
            }],
        },
        {
            path: "rust", title: "Rust", isVisible: false, updatedAt: recent,
            sections: [{path: "1-intro", title: "Intro", contents: [{type: "cours", source: "db"}]}],
        },
    ]);
    await db.collection("course_content").insertMany([
        {moduleSlug: "php", sectionSlug: "1-tableaux", contentType: "cours", blocks: [], updatedAt: recent},
        {moduleSlug: "php", sectionSlug: "1-tableaux", contentType: "TP", blocks: [], updatedAt: ancien},
        {moduleSlug: "php", sectionSlug: "1-tableaux", contentType: "slide", blocks: [], updatedAt: recent},
        {moduleSlug: "rust", sectionSlug: "1-intro", contentType: "cours", blocks: [], updatedAt: ancien},
    ]);
});
afterAll(async () => stop());

describe("loadIndexableContents", () => {
    test("charge les cours et TP de tous les modules, masqués compris, sans les slides", async () => {
        const contents = await loadIndexableContents(db);

        expect(contents.map(c => `${c.moduleSlug}/${c.sectionSlug}/${c.contentType}`).sort()).toEqual([
            "php/1-tableaux/TP",
            "php/1-tableaux/cours",
            "rust/1-intro/cours",
        ]);
    });

    test("reprend les titres et la visibilité du module", async () => {
        const rust = (await loadIndexableContents(db)).find(c => c.moduleSlug === "rust")!;

        expect(rust).toMatchObject({moduleTitle: "Rust", sectionTitle: "Intro", moduleVisible: false});
    });

    test("date un contenu par sa modification ou celle de son module, la plus récente", async () => {
        const contents = await loadIndexableContents(db);
        const date = (key: string) => contents.find(c => `${c.moduleSlug}/${c.contentType}` === key)!.updatedAt;

        expect(date("php/cours")).toEqual(recent);
        expect(date("php/TP")).toEqual(ancien);
        expect(date("rust/cours")).toEqual(recent);
    });
});

describe("date de dernière synchro", () => {
    test("est vide avant la première synchro, puis retenue par collection", async () => {
        expect(await getLastSync(db, "cours_mistral")).toBeNull();

        await saveLastSync(db, "cours_mistral", recent);

        expect(await getLastSync(db, "cours_mistral")).toEqual(recent);
        expect(await getLastSync(db, "autre")).toBeNull();
    });
});
