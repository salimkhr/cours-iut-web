import {Binary, type Db} from "mongodb";
import {connectToDB} from "@/lib/mongodb";

/** Un document par admin : sa signature, déjà normalisée en PNG. */
export const SIGNATURE_COLLECTION = "vacation_signatures";

interface SignatureDoc {
    userId: string;
    png: Binary;
    updatedAt: Date;
}

async function collection(db?: Db) {
    return (db ?? (await connectToDB())).collection<SignatureDoc>(SIGNATURE_COLLECTION);
}

/** PNG de la signature de l'utilisateur, ou `undefined` s'il n'en a pas téléversé. */
export async function getSignature(userId: string, db?: Db): Promise<Uint8Array | undefined> {
    const doc = await (await collection(db)).findOne({userId});
    return doc ? new Uint8Array(doc.png.value()) : undefined;
}

/** Crée ou remplace la signature de l'utilisateur. */
export async function saveSignature(userId: string, png: Uint8Array, db?: Db): Promise<void> {
    await (await collection(db)).updateOne(
        {userId},
        {$set: {png: new Binary(png), updatedAt: new Date()}},
        {upsert: true},
    );
}

/** Supprime la signature ; renvoie `true` si elle existait. */
export async function deleteSignature(userId: string, db?: Db): Promise<boolean> {
    const res = await (await collection(db)).deleteOne({userId});
    return res.deletedCount > 0;
}
