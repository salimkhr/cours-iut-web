import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

const { fetchModules, fetchModulesTheme } = await import("@/lib/getModules");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);
afterEach(async () => { await db.collection("modules").deleteMany({}); });

describe("fetchModulesTheme", () => {
    test("ne renvoie que path et colorLight", async () => {
        await db.collection("modules").insertMany([
            {
                path: "php",
                title: "PHP",
                colorLight: "#777bb4",
                sections: [{ path: "1-intro", title: "Intro", contents: [{ type: "cours" }] }],
            },
            {
                path: "javascript",
                title: "JavaScript",
                colorLight: "#f7df1e",
                sections: [{ path: "1-le-dom", title: "Le DOM", contents: [{ type: "cours" }] }],
            },
        ]);

        const modules = await fetchModulesTheme();

        expect(modules).toHaveLength(2);
        const php = modules.find((m) => m.path === "php");
        expect(php?.colorLight).toBe("#777bb4");
        // La projection doit exclure les sections : c'est tout l'intérêt de la fonction.
        expect(php).not.toHaveProperty("sections");
        expect(php).not.toHaveProperty("title");
        expect(php).not.toHaveProperty("_id");
    });

    test("renvoie un tableau vide si la collection est vide", async () => {
        expect(await fetchModulesTheme()).toEqual([]);
    });
});

describe("fetchModules", () => {
    test("sans ordre posé, renvoie les modules dans l'ordre de création", async () => {
        await db.collection("modules").insertMany([
            { path: "html-css", title: "HTML", sections: [] },
            { path: "javascript", title: "JS", sections: [] },
            { path: "php", title: "PHP", sections: [] },
        ]);

        const modules = await fetchModules();

        expect(modules.map((m) => m.path)).toEqual(["html-css", "javascript", "php"]);
    });

    test("trie par order, les modules sans order (ou order null) passent après", async () => {
        await db.collection("modules").insertMany([
            { path: "html-css", title: "HTML", sections: [] },
            { path: "javascript", title: "JS", sections: [], order: 2 },
            { path: "php", title: "PHP", sections: [], order: null },
            { path: "rust", title: "Rust", sections: [], order: 1 },
        ]);

        const modules = await fetchModules();

        expect(modules.map((m) => m.path)).toEqual(["rust", "javascript", "html-css", "php"]);
        expect(typeof modules[0]._id).toBe("string");
    });
});
