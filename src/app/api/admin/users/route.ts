import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import User, {UserRole} from '@/types/User';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const role = url.searchParams.get('role') as UserRole | null;
        const extraTimeParam = url.searchParams.get('extraTime');
        const extraTime = extraTimeParam === null ? undefined : extraTimeParam === 'true';

        const db = await connectToDB();
        const collection = db.collection<User>('users');

        const query: Record<string, unknown> = {};
        if (role) query.role = role;
        if (extraTime !== undefined) query.extraTime = extraTime;

        const users = await collection.find(query).sort({lastName: 1, firstName: 1}).toArray();
        return NextResponse.json({users});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as User;
        // Basic validation
        if (!body.email || !body.firstName || !body.lastName || !body.role) {
            return NextResponse.json({error: 'Champs obligatoires manquants'}, {status: 400});
        }
        if (!['admin', 'student'].includes(body.role)) {
            return NextResponse.json({error: 'Rôle invalide'}, {status: 400});
        }

        const db = await connectToDB();
        const collection = db.collection<User>('users');

        // ensure default boolean
        body.extraTime = !!body.extraTime;

        const result = await collection.insertOne(body as unknown as User);
        const saved = await collection.findOne({_id: result.insertedId});
        return NextResponse.json({user: saved}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}
