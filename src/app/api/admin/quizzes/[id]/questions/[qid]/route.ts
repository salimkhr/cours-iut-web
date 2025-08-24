import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import Quiz from "@/types/Quiz";
import Question from "@/types/Question";
import {ObjectId} from "bson";

export async function PUT(request: Request, {params}: { params: Promise<{ id: string; qid: string }> }) {
    try {
        const {id, qid} = await params;
        const updates = (await request.json()) as Partial<Question>;

        // Validate and normalize updates similar to standalone questions
        if (updates.type === "multiple-choice") {
            if (!Array.isArray(updates.choices) || updates.choices.length < 2) {
                return NextResponse.json({error: "Au moins deux choix requis"}, {status: 400});
            }
            if (updates.correctAnswer && !updates.choices.includes(updates.correctAnswer)) {
                return NextResponse.json({error: "La réponse correcte doit faire partie des choix"}, {status: 400});
            }
        }
        if (updates.type === "true-false" && updates.correctAnswer !== undefined) {
            if (!(updates.correctAnswer === "true" || updates.correctAnswer === "false")) {
                return NextResponse.json({error: "Réponse correcte doit être true ou false"}, {status: 400});
            }
        }

        const now = new Date().toISOString();

        // Prepare $set object only with provided fields, applied to the matching array element
        const setOps: Record<string, unknown> = {"questions.$.updatedAt": now};
        const allowedKeys: (keyof Question)[] = [
            "text",
            "type",
            "choices",
            "correctAnswer",
            "points",
            "timeLimit",
            "explanation",
            "difficulty",
        ];
        for (const key of allowedKeys) {
            if (updates[key] !== undefined) {
                // small normalization like in create
                if (key === "timeLimit") setOps["questions.$.timeLimit"] = updates.timeLimit ? Number(updates.timeLimit) : undefined;
                else if (key === "explanation") setOps["questions.$.explanation"] = updates.explanation?.toString().trim() ? String(updates.explanation) : undefined;
                else setOps[`questions.$.${key}`] = updates[key] as unknown;
            }
        }

        const db = await connectToDB();
        const collection = db.collection<Quiz>("quizzes");

        const result = await collection.updateOne(
            {_id: new ObjectId(id), "questions._id": new ObjectId(qid)},
            {$set: {...setOps, updatedAt: now}}
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({error: "Quiz ou question introuvable"}, {status: 404});
        }

        const saved = await collection.findOne({_id: new ObjectId(id)});
        return NextResponse.json({quiz: saved});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}
