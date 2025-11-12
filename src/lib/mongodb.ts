import {Db, MongoClient} from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("Please define the MONGODB_URI environment variable");
    }

    if (process.env.NODE_ENV === "development") {
        // En dev, utiliser global pour le singleton
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri);
            global._mongoClientPromise = client.connect();
        }
        return global._mongoClientPromise;
    } else {
        // En prod, créer le client une seule fois
        if (!clientPromise) {
            client = new MongoClient(uri);
            clientPromise = client.connect();
        }
        return clientPromise;
    }
}

export async function connectToDB(): Promise<Db> {
    const client = await getClientPromise();
    return client.db("cours-iut-web");
}