import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

const { fetchModulesTheme } = await import("@/lib/getModules");

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
