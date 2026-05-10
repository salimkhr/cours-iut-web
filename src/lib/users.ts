import {Collection} from "mongodb";
import {connectToDB} from "@/lib/mongodb";
import type {User, WebhookEventLog} from "@/types/User";

const USERS_COLLECTION = "users";
const WEBHOOK_EVENTS_COLLECTION = "webhook_events";

let indexesPromise: Promise<void> | null = null;

async function getUsersCollection(): Promise<Collection<User>> {
    const db = await connectToDB();
    return db.collection<User>(USERS_COLLECTION);
}

async function getWebhookEventsCollection(): Promise<Collection<WebhookEventLog>> {
    const db = await connectToDB();
    return db.collection<WebhookEventLog>(WEBHOOK_EVENTS_COLLECTION);
}

export async function ensureUserIndexes(): Promise<void> {
    if (!indexesPromise) {
        indexesPromise = (async () => {
            const [users, events] = await Promise.all([
                getUsersCollection(),
                getWebhookEventsCollection(),
            ]);
            await Promise.all([
                users.createIndex({clerkId: 1}, {unique: true, name: "clerkId_unique"}),
                events.createIndex({eventId: 1}, {unique: true, name: "eventId_unique"}),
            ]);
        })().catch((err) => {
            // Reset on failure so the next call retries
            indexesPromise = null;
            throw err;
        });
    }
    return indexesPromise;
}

export interface UpsertUserInput {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}

export async function createOrUpdateUser(input: UpsertUserInput): Promise<void> {
    const users = await getUsersCollection();
    const now = new Date();

    await users.updateOne(
        {clerkId: input.clerkId},
        {
            $set: {
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                imageUrl: input.imageUrl,
                updatedAt: now,
            },
            $setOnInsert: {
                clerkId: input.clerkId,
                createdAt: now,
            },
        },
        {upsert: true},
    );
}

export async function deleteUser(clerkId: string): Promise<void> {
    const users = await getUsersCollection();
    await users.deleteOne({clerkId});
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
    const users = await getUsersCollection();
    return users.findOne({clerkId});
}

/**
 * Inserts the event id atomically. Returns true if this is the first time
 * we see the event (caller should process it), false if it was already logged
 * (caller should skip — duplicate webhook delivery).
 */
export async function logWebhookEvent(eventId: string, type: string): Promise<boolean> {
    const events = await getWebhookEventsCollection();
    try {
        await events.insertOne({
            eventId,
            type,
            createdAt: new Date(),
        });
        return true;
    } catch (err) {
        // Duplicate key on eventId_unique => already processed
        if (err && typeof err === "object" && "code" in err && (err as {code: number}).code === 11000) {
            return false;
        }
        throw err;
    }
}
