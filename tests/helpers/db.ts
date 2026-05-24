import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import type { Db } from "mongodb";

export async function startMemoryDb(): Promise<{ db: Db; stop: () => Promise<void> }> {
    const server = await MongoMemoryServer.create();
    const client = new MongoClient(server.getUri());
    await client.connect();
    const db = client.db("test");
    return {
        db,
        stop: async () => {
            await client.close();
            await server.stop();
        },
    };
}
