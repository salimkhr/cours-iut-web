import {Db, MongoClient} from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Please define the MONGODB_URI environment variable");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    // Pour éviter les warnings sur global dans TS (en dev)
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
    // En dev, utiliser global pour le singleton
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // En prod, crée un nouveau client pour chaque build
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function connectToDB(): Promise<Db> {
    const client = await clientPromise;
    return client.db("cours-iut-web");
}
