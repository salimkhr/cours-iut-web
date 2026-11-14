import {afterAll, beforeAll, describe, expect, mock, test} from "bun:test";
import ExcelJS from "exceljs";
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

const {POST} = await import("@/app/api/quiz/results/scodoc/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const {startMemoryDb} = await import("../helpers/db");
    ({db, stop: stopDb} = await startMemoryDb());
    await db.collection("quiz_sessions").insertOne({
        _id: "s1" as never,
        moduleId: "m1",
        shortCode: "ABC123",
        createdAt: 1,
        quiz: {negativeMarking: false, questions: [{id: "q1", weight: 10, options: []}]},
    });
    await db.collection("quiz_participants").insertOne({
        sessionId: "s1",
        userId: "u1",
        firstName: "Abdellah",
        lastName: "ACHAFIK",
        email: "abdellah.achafik@etu.test",
        username: "aa251867",
        group: null,
        score: 7,
    });
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);

const admin = () => { session = {user: {id: "a", role: "admin", email: "a@x.test"}}; };

async function buildSheet(): Promise<ArrayBuffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Feuille");
    ws.getRow(8).values = ["!50721", "Nom", "Prénom", "Groupe", "Note sur 20", "Remarque", "NIP", "Email"];
    ws.getRow(9).values = ["!1", "ACHAFIK", "Abdellah", "G1", undefined, undefined, "1", "AA251867@etu.test"];
    ws.getRow(10).values = ["!2", "BERTIN", "Zoe", "G1", undefined, undefined, "2", "bb@etu.test"];
    return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

function post(fields: {sessionId?: string; moduleId?: string; file?: File}) {
    const form = new FormData();
    if (fields.moduleId !== undefined) form.set("moduleId", fields.moduleId);
    if (fields.sessionId !== undefined) form.set("sessionId", fields.sessionId);
    if (fields.file) form.set("file", fields.file);
    return POST(new Request("http://localhost/api/quiz/results/scodoc", {method: "POST", body: form}));
}

const xlsxFile = async (name = "feuille.xlsx") => new File([await buildSheet()], name);

describe("POST /api/quiz/results/scodoc", () => {
    test("refuse un non-admin", async () => {
        session = {user: {id: "e", role: "user", email: "e@x.test"}};
        expect((await post({sessionId: "s1", file: await xlsxFile()})).status).toBe(403);
    });

    test("refuse sans session de connexion", async () => {
        session = null;
        expect((await post({sessionId: "s1", file: await xlsxFile()})).status).toBe(401);
    });

    test("400 sans sessionId ni moduleId, ou sans fichier", async () => {
        admin();
        expect((await post({file: await xlsxFile()})).status).toBe(400);
        expect((await post({sessionId: "s1"})).status).toBe(400);
    });

    test("413 au-delà de 2 Mo", async () => {
        admin();
        const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "x.xlsx");
        expect((await post({sessionId: "s1", file: big})).status).toBe(413);
    });

    test("422 si le fichier n'est pas une feuille ScoDoc", async () => {
        admin();
        const res = await post({sessionId: "s1", file: new File(["hello"], "x.xlsx")});
        expect(res.status).toBe(422);
        expect((await res.json()).error).toBe("Ce n'est pas une feuille de saisie ScoDoc");
    });

    test("404 si la session est inconnue", async () => {
        admin();
        expect((await post({sessionId: "nope", file: await xlsxFile()})).status).toBe(404);
    });

    test("200 : feuille remplie, rapport en en-tête, nom accentué encodé", async () => {
        admin();
        const res = await post({sessionId: "s1", file: await xlsxFile("Contrôle é.xlsx")});
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        const disposition = res.headers.get("Content-Disposition") ?? "";
        expect(disposition).toContain(`filename*=UTF-8''${encodeURIComponent("Contrôle é.xlsx")}`);
        expect(JSON.parse(decodeURIComponent(res.headers.get("X-Scodoc-Report") ?? ""))).toEqual({filled: 1, absent: 1, unmatched: []});

        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(await res.arrayBuffer());
        expect(wb.worksheets[0].getCell("E9").value).toBe(14);
        expect(wb.worksheets[0].getCell("E10").value).toBe("ABS");
    });

    describe("toutes les sessions de l'année", () => {
        const now = Date.now();
        const oldDate = now - 400 * 24 * 3600 * 1000;
        beforeAll(async () => {
            await db.collection("quiz_sessions").insertMany([
                {_id: "y1" as never, moduleId: "m2", shortCode: "Y1", createdAt: now,
                    quiz: {negativeMarking: false, questions: [{id: "q1", weight: 10, options: []}]}},
                {_id: "y2" as never, moduleId: "m2", shortCode: "Y2", createdAt: now,
                    quiz: {negativeMarking: false, questions: [{id: "q1", weight: 20, options: []}]}},
                {_id: "y0" as never, moduleId: "m2", shortCode: "Y0", createdAt: oldDate,
                    quiz: {negativeMarking: false, questions: [{id: "q1", weight: 10, options: []}]}},
            ]);
            await db.collection("quiz_participants").insertMany([
                {sessionId: "y1", userId: "u1", firstName: "Abdellah", lastName: "ACHAFIK", email: "abdellah.achafik@etu.test", username: "aa251867", group: null, score: 5},
                {sessionId: "y2", userId: "u1", firstName: "Abdellah", lastName: "ACHAFIK", email: "Abdellah.Achafik@etu.test", username: "AA251867", group: null, score: 18},
                {sessionId: "y0", userId: "u2", firstName: "Zoe", lastName: "BERTIN", email: "zoe.bertin@etu.test", username: "bb123456", group: null, score: 10},
            ]);
        });

        test("meilleure note entre deux sessions, session d'une année passée ignorée", async () => {
            admin();
            const res = await post({moduleId: "m2", file: await xlsxFile()});
            expect(res.status).toBe(200);
            expect(JSON.parse(decodeURIComponent(res.headers.get("X-Scodoc-Report") ?? ""))).toEqual({filled: 1, absent: 1, unmatched: []});
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(await res.arrayBuffer());
            expect(wb.worksheets[0].getCell("E9").value).toBe(18);
            expect(wb.worksheets[0].getCell("E10").value).toBe("ABS");
        });

        test("404 sans session cette année pour le module", async () => {
            admin();
            const res = await post({moduleId: "m1", file: await xlsxFile()});
            expect(res.status).toBe(404);
            expect((await res.json()).error).toBe("Aucune session cette année pour ce module");
        });
    });
});
