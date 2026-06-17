import { MongoClient, type Db } from "mongodb";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

let client: MongoClient | null = null;

export async function connectToDB(): Promise<Db> {
    if (!client) {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI environment variable is not set");
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db("cours-iut-web");
}
