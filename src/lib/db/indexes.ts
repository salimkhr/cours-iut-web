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
        await db.collection("module_quizzes").createIndex(
            {moduleId: 1},
            {unique: true, name: "unique_quiz_module"},
        ),
        await db.collection("quiz_sessions").createIndex(
            {joinCode: 1},
            {unique: true, name: "unique_quiz_join_code"},
        ),
        await db.collection("quiz_sessions").createIndex(
            {shortCode: 1},
            {unique: true, name: "unique_quiz_short_code"},
        ),
        await db.collection("quiz_sessions").createIndex(
            {expiresAt: 1},
            {expireAfterSeconds: 0, name: "ttl_quiz_session"},
        ),
        await db.collection("quiz_participants").createIndex(
            {sessionId: 1, userId: 1},
            {unique: true, name: "unique_quiz_participant"},
        ),
        await db.collection("quiz_answers").createIndex(
            {sessionId: 1, questionId: 1, userId: 1},
            {unique: true, name: "unique_quiz_answer"},
        ),
        await db.collection("quiz_answers").createIndex(
            {sessionId: 1},
            {name: "quiz_answer_session"},
        ),
    );

    return created;
}
