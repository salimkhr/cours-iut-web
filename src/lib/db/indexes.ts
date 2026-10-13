import type { Db } from "mongodb";

/**
 * Index applicatifs, création idempotente (createIndex ne fait rien si l'index
 * existe déjà à l'identique). Appelé par `bun run create-indexes`.
 */
export async function ensureIndexes(db: Db): Promise<string[]> {
    const created: string[] = [];

    created.push(
        await db.collection("modules").createIndex(
            { path: 1 },
            { unique: true, name: "unique_module_path" },
        ),
    );

    created.push(
        await db.collection("course_content").createIndex(
            { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
            { unique: true, name: "unique_content_ref" },
        ),
    );

    created.push(
        await db.collection("vacation_signatures").createIndex(
            { userId: 1 },
            { unique: true, name: "unique_vacation_signature_user" },
        ),
    );

    return created;
}
