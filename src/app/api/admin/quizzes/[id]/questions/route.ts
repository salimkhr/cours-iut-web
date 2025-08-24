import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import Quiz from "@/types/Quiz";
import Question from "@/types/Question";
import {ObjectId} from "bson";

export async function POST(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const body = (await request.json()) as Partial<Question>;

        // Basic validations (similar to standalone questions API)
        if (!body.text || !body.type || typeof body.points !== "number") {
            return NextResponse.json({error: "Champs obligatoires manquants"}, {status: 400});
        }

        if (!["multiple-choice", "true-false", "short-answer"].includes(String(body.type))) {
            return NextResponse.json({error: "Type invalide"}, {status: 400});
        }

        if (body.type === "multiple-choice") {
            if (!Array.isArray(body.choices) || body.choices.length < 2) {
                return NextResponse.json({error: "Au moins deux choix requis"}, {status: 400});
            }
            if (!body.correctAnswer || !body.choices.some((choice) => choice.value === String(body.correctAnswer))) {
                return NextResponse.json({error: "La réponse correcte doit faire partie des choix"}, {status: 400});
            }
        }
        if (body.type === "true-false") {
            if (!(body.correctAnswer === "true" || body.correctAnswer === "false")) {
                return NextResponse.json({error: "Réponse correcte doit être true ou false"}, {status: 400});
            }
        }

        const now = new Date().toISOString();
        const questionDoc: Question = {
            _id: new ObjectId(),
            text: String(body.text),
            type: body.type,
            choices: body.type === "multiple-choice" ? (body.choices || []) : undefined,
            correctAnswer: String(body.correctAnswer),
            points: Number(body.points),
            timeLimit: body.timeLimit ? Number(body.timeLimit) : undefined,
            explanation: body.explanation?.toString().trim() ? String(body.explanation) : undefined,
            difficulty: body.difficulty || undefined,
            createdAt: now,
            updatedAt: now,
        } as Question;

        const db = await connectToDB();
        const collection = db.collection<Quiz>("quizzes");

        const res = await collection.updateOne(
            {_id: new ObjectId(id)},
            {$push: {questions: questionDoc}, $set: {updatedAt: now}}
        );

        if (res.matchedCount === 0) {
            return NextResponse.json({error: "Quiz introuvable"}, {status: 404});
        }

        const saved = await collection.findOne({_id: new ObjectId(id)});
        return NextResponse.json({quiz: saved, addedQuestion: questionDoc}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}