import { connectToDB } from "../db.js";
import type { Block } from "./tree.js";

interface ContentKey {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export async function loadBlocks(key: ContentKey): Promise<Block[]> {
    const db = await connectToDB();
    const doc = await db
        .collection<{ blocks: Block[] }>("course_content")
        .findOne(key, { projection: { blocks: 1, _id: 0 } });
    return doc?.blocks ?? [];
}

export async function saveBlocks(key: ContentKey, blocks: Block[]): Promise<void> {
    const db = await connectToDB();
    const now = new Date();
    await db.collection("course_content").updateOne(
        key,
        {
            $set: { blocks, updatedAt: now },
            $inc: { version: 1 } as Record<string, number>,
            $setOnInsert: { ...key, createdAt: now },
        },
        { upsert: true }
    );
    await db.collection("modules").updateOne(
        { path: key.moduleSlug },
        {
            $set: {
                "sections.$[s].contents.$[c].source": "db",
            },
        },
        {
            arrayFilters: [
                { "s.path": key.sectionSlug },
                { "c.type": key.contentType },
            ],
        }
    );
}
