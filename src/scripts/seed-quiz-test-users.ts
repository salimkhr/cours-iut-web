// src/scripts/seed-quiz-test-users.ts
//
// Crée les étudiants de test du quiz live (tests/fixtures/quiz-test-users.ts) dans la base locale,
// avec un email déjà vérifié : aucun mail n'est envoyé.
//
//   bun run seed-quiz-test-users
//
// Refuse de tourner si MONGODB_URI ne pointe pas sur une base locale.
// Idempotent : un compte déjà présent est laissé tel quel.

import {MongoClient} from "mongodb";
import {hashPassword} from "better-auth/crypto";
import {QUIZ_TEST_USERS} from "../../tests/fixtures/quiz-test-users";

const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const DB_NAME = "cours-iut-web";

function assertLocal(uri: string) {
    const host = new URL(uri.replace(/^mongodb(\+srv)?:/, "http:")).hostname;
    if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
        throw new Error(`Base non locale (${host}) : seed des comptes de test refusé.`);
    }
}

async function main() {
    assertLocal(URI);
    const client = new MongoClient(URI, {serverSelectionTimeoutMS: 5000});
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const users = db.collection("user");
        const accounts = db.collection("account");

        for (const u of QUIZ_TEST_USERS) {
            const existing = await users.findOne({$or: [{email: u.email}, {username: u.username}]});
            if (existing) {
                console.log(`${u.username} : déjà présent, conservé.`);
                continue;
            }
            const now = new Date();
            const {insertedId} = await users.insertOne({
                name: u.name, email: u.email, emailVerified: true,
                username: u.username, displayUsername: u.username,
                group: u.group, role: "user", banned: false,
                createdAt: now, updatedAt: now,
            });
            try {
                await accounts.insertOne({
                    userId: insertedId, accountId: insertedId.toHexString(),
                    providerId: "credential", password: await hashPassword(u.password),
                    createdAt: now, updatedAt: now,
                });
            } catch (error) {
                await users.deleteOne({_id: insertedId});
                throw error;
            }
            console.log(`${u.username} : créé (${u.name}, ${u.group}).`);
        }
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed des comptes de test impossible");
    process.exitCode = 1;
});
