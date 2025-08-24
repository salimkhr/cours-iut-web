import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import Question, {Difficulty, QuestionType} from '@/types/Question';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const q = url.searchParams.get('q');
        const type = url.searchParams.get('type') as QuestionType | null;
        const difficulty = url.searchParams.get('difficulty') as Difficulty | null;

        const db = await connectToDB();
        const collection = db.collection<Question>('questions');

        const query: Record<string, unknown> = {};
        if (type && ["multiple-choice", "true-false", "short-answer"].includes(type)) query.type = type;
        if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) query.difficulty = difficulty;

        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), 'i');
            query.$or = [
                {text: {$regex: regex}},
                {explanation: {$regex: regex}},
            ];
        }

        const questions = await collection
            .find(query)
            .sort({updatedAt: -1})
            .toArray();

        return NextResponse.json({questions});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Omit<Question, 'createdAt' | 'updatedAt' | '_id'>;

        if (!body.text || !body.type || typeof body.points !== 'number') {
            return NextResponse.json({error: 'Champs obligatoires manquants'}, {status: 400});
        }

        if (!['multiple-choice', 'true-false', 'short-answer'].includes(body.type)) {
            return NextResponse.json({error: 'Type invalide'}, {status: 400});
        }

        // validations spécifiques
        if (body.type === 'multiple-choice') {
            if (!Array.isArray(body.choices) || body.choices.length < 2) {
                return NextResponse.json({error: 'Au moins deux choix requis'}, {status: 400});
            }
            if (!body.correctAnswer || !body.choices.some((choice) => choice.value === body.correctAnswer)) {
                return NextResponse.json({error: 'La réponse correcte doit faire partie des choix'}, {status: 400});
            }
        }
        if (body.type === 'true-false') {
            if (!(body.correctAnswer === 'true' || body.correctAnswer === 'false')) {
                return NextResponse.json({error: 'Réponse correcte doit être true ou false'}, {status: 400});
            }
        }

        const now = new Date().toISOString();
        const doc: Question = {
            ...body,
            // normalize optional fields
            choices: body.type === 'multiple-choice' ? (body.choices || []) : undefined,
            timeLimit: body.timeLimit ? Number(body.timeLimit) : undefined,
            explanation: body.explanation?.trim() ? body.explanation : undefined,
            difficulty: body.difficulty || undefined,
            createdAt: now,
            updatedAt: now,
        } as Question;

        const db = await connectToDB();
        const collection = db.collection<Question>('questions');

        const result = await collection.insertOne(doc);
        const saved = await collection.findOne({_id: result.insertedId});

        return NextResponse.json({question: saved}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}