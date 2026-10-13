import {afterAll, beforeAll, beforeEach, describe, expect, it} from "bun:test";
import {MongoClient, type Db} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {deleteSignature, getSignature, saveSignature, SIGNATURE_COLLECTION} from "@/lib/vacation/signature";

const png = (...tail: number[]) => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...tail]);

let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;

beforeAll(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
    db = client.db("test-vacations");
}, 120_000);

afterAll(async () => {
    await client?.close();
    await server?.stop();
});

beforeEach(async () => {
    await db.collection(SIGNATURE_COLLECTION).deleteMany({});
});

describe("signature des vacations", () => {
    it("renvoie undefined tant qu'aucune signature n'est enregistrée", async () => {
        expect(await getSignature("u1", db)).toBeUndefined();
    });

    it("sauvegarde puis relit les octets à l'identique", async () => {
        await saveSignature("u1", png(1, 2, 3), db);
        expect(await getSignature("u1", db)).toEqual(png(1, 2, 3));
    });

    it("remplace la signature existante sans créer de doublon", async () => {
        await saveSignature("u1", png(1), db);
        await saveSignature("u1", png(9, 9), db);
        expect(await getSignature("u1", db)).toEqual(png(9, 9));
        expect(await db.collection(SIGNATURE_COLLECTION).countDocuments({userId: "u1"})).toBe(1);
    });

    it("supprime la signature et signale si elle existait", async () => {
        await saveSignature("u1", png(1), db);
        expect(await deleteSignature("u1", db)).toBe(true);
        expect(await getSignature("u1", db)).toBeUndefined();
        expect(await deleteSignature("u1", db)).toBe(false);
    });

    it("isole les signatures par utilisateur", async () => {
        await saveSignature("u1", png(1), db);
        await saveSignature("u2", png(2), db);
        await deleteSignature("u1", db);
        expect(await getSignature("u1", db)).toBeUndefined();
        expect(await getSignature("u2", db)).toEqual(png(2));
    });

    it("l'index unique empêche deux documents pour un même utilisateur", async () => {
        const col = db.collection(SIGNATURE_COLLECTION);
        await col.createIndex({userId: 1}, {unique: true, name: "unique_vacation_signature_user"});
        await col.insertOne({userId: "u1", png: null, updatedAt: new Date()});
        let code: number | undefined;
        try {
            await col.insertOne({userId: "u1", png: null, updatedAt: new Date()});
        } catch (e) {
            code = (e as {code?: number}).code;
        }
        expect(code).toBe(11000); // E11000 duplicate key
    });
});
