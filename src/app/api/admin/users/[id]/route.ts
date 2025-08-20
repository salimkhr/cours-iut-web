import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import User from '@/types/User';
import {ObjectId} from 'bson';

export async function PUT(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const updates = await request.json() as Partial<User>;

        const db = await connectToDB();
        const collection = db.collection<User>('users');

        const result = await collection.updateOne({_id: new ObjectId(id)}, {$set: updates});
        if (result.matchedCount === 0) {
            return NextResponse.json({error: 'Utilisateur introuvable'}, {status: 404});
        }
        const saved = await collection.findOne({_id: new ObjectId(id)});
        return NextResponse.json({user: saved});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}

export async function DELETE(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const db = await connectToDB();
        const collection = db.collection<User>('users');
        const result = await collection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) {
            return NextResponse.json({error: 'Utilisateur introuvable'}, {status: 404});
        }
        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}
