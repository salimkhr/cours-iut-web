import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import { getServerSession } from "@/lib/auth";

interface StoredMessage {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    toolActions?: { name: string; count: number }[];
    timestamp: Date;
}

// Index créé une seule fois par processus Node (createIndex est idempotent)
let indexEnsured = false;
async function ensureIndex() {
    if (indexEnsured) return;
    const db = await connectToDB();
    await db.collection("ai_chat_conversations").createIndex(
        { userId: 1, moduleSlug: 1, sectionSlug: 1, contentType: 1 },
        { unique: true },
    );
    indexEnsured = true;
}

export const GET = withAdmin(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("module");
    const sectionSlug = searchParams.get("section");
    const contentType = searchParams.get("type");

    if (!moduleSlug || !sectionSlug || !contentType) {
        return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    await ensureIndex();
    const session = await getServerSession();
    const userId = session!.user.id;
    const db = await connectToDB();

    const doc = await db.collection("ai_chat_conversations").findOne(
        { userId, moduleSlug, sectionSlug, contentType },
        { projection: { messages: 1, _id: 0 } },
    );

    return Response.json({ messages: doc?.messages ?? [] });
});

export const POST = withAdmin(async (req: Request) => {
    const body = await req.json() as {
        moduleSlug: string;
        sectionSlug: string;
        contentType: string;
        messages: StoredMessage[];
    };

    const { moduleSlug, sectionSlug, contentType, messages } = body;
    if (!moduleSlug || !sectionSlug || !contentType || !Array.isArray(messages) || messages.length === 0) {
        return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    await ensureIndex();
    const session = await getServerSession();
    const userId = session!.user.id;
    const db = await connectToDB();

    await db.collection("ai_chat_conversations").updateOne(
        { userId, moduleSlug, sectionSlug, contentType },
        {
            $push: { messages: { $each: messages } as unknown },
            $set: { updatedAt: new Date() },
            $setOnInsert: { userId, moduleSlug, sectionSlug, contentType, createdAt: new Date() },
        } as Record<string, unknown>,
        { upsert: true },
    );

    return Response.json({ ok: true });
});

export const DELETE = withAdmin(async (req: Request) => {
    const body = await req.json() as {
        moduleSlug: string;
        sectionSlug: string;
        contentType: string;
    };

    const { moduleSlug, sectionSlug, contentType } = body;
    if (!moduleSlug || !sectionSlug || !contentType) {
        return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const session = await getServerSession();
    const userId = session!.user.id;
    const db = await connectToDB();

    await db.collection("ai_chat_conversations").deleteOne(
        { userId, moduleSlug, sectionSlug, contentType },
    );

    return Response.json({ ok: true });
});
