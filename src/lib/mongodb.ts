import {Db, MongoClient} from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;

    if (!uri || process.env.NEXT_PHASE === 'phase-production-build') {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            // Mock pendant le build pour éviter les erreurs de connexion
            return Promise.resolve({
                db: () => ({
                    collection: () => ({
                        find: () => ({toArray: () => Promise.resolve([])}),
                        findOne: () => Promise.resolve(null),
                        insertOne: () => Promise.resolve({}),
                        createIndex: () => Promise.resolve({}),
                    }),
                    databaseName: "mock-db"
                }),
                connect: () => Promise.resolve(),
                on: () => {
                },
                once: () => {
                },
            } as unknown as MongoClient);
        }
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

function resetClientPromise() {
    if (process.env.NODE_ENV === "development") {
        global._mongoClientPromise = undefined;
    } else {
        clientPromise = null;
    }
    client = null;
}

export async function connectToDB(): Promise<Db> {
    try {
        const c = await getClientPromise();
        return c.db("cours-iut-web");
    } catch (err: unknown) {
        const name = (err as { name?: string })?.name ?? "";
        if (name === "MongoTopologyClosedError" || name === "MongoNetworkError") {
            resetClientPromise();
            const c = await getClientPromise();
            return c.db("cours-iut-web");
        }
        throw err;
    }
}