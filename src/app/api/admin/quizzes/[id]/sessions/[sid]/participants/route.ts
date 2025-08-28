import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {ObjectId} from "bson";

export async function POST(request: Request, {params}: { params: Promise<{ id: string; sid: string }> }) {
    try {
        const {id, sid} = await params;
        const body = await request.json().catch(() => ({}));
        const {userId} = body as { userId?: string };

        if (!userId) {
            return NextResponse.json({error: "userId requis"}, {status: 400});
        }

        // Try casting ids to ObjectId when possible
        const quizId = (() => {
            try {
                return new ObjectId(id);
            } catch {
                return id;
            }
        })();

        const sessionId = (() => {
            try {
                return new ObjectId(sid);
            } catch {
                return sid;
            }
        })();

        const participantId = (() => {
            try {
                return new ObjectId(userId);
            } catch {
                return userId;
            }
        })();

        const db = await connectToDB();
        const collection = db.collection("quizSessions");

        const updateRes = await collection.updateOne(
            {
                _id: new ObjectId(sessionId),
                quizId: new ObjectId(quizId)
            },
            {$addToSet: {participants: participantId}}
        );

        if (updateRes.matchedCount === 0) {
            return NextResponse.json({error: "Session introuvable"}, {status: 404});
        }

        const updated = await collection.findOne({_id: new ObjectId(sessionId)});
        return NextResponse.json({session: updated}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}
