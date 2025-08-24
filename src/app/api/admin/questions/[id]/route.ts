import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import Question from '@/types/Question';
import {ObjectId} from 'bson';

export async function PUT(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const updates = (await request.json()) as Partial<Question>;

        // server-side protection/normalization
        if (updates.type === 'multiple-choice') {
            if (!Array.isArray(updates.choices) || updates.choices.length < 2) {
                return NextResponse.json({error: 'Au moins deux choix requis'}, {status: 400});
            }
            if (updates.correctAnswer && !updates.choices.includes(updates.correctAnswer)) {
                return NextResponse.json({error: 'La réponse correcte doit faire partie des choix'}, {status: 400});
            }
        }
        if (updates.type === 'true-false' && updates.correctAnswer !== undefined) {
            if (!(updates.correctAnswer === 'true' || updates.correctAnswer === 'false')) {
                return NextResponse.json({error: 'Réponse correcte doit être true ou false'}, {status: 400});
            }
        }

        updates.updatedAt = new Date().toISOString();

        const db = await connectToDB();
        const collection = db.collection<Question>('questions');

        const result = await collection.updateOne({_id: new ObjectId(id)}, {$set: updates});
        if (result.matchedCount === 0) {
            return NextResponse.json({error: 'Question introuvable'}, {status: 404});
        }
        const saved = await collection.findOne({_id: new ObjectId(id)});
        return NextResponse.json({question: saved});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}

export async function DELETE(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const db = await connectToDB();
        const collection = db.collection<Question>('questions');
        const result = await collection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) {
            return NextResponse.json({error: 'Question introuvable'}, {status: 404});
        }
        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}