import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import User, {UserRole} from '@/types/User';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const role = url.searchParams.get('role') as UserRole | null;
        const groupe = url.searchParams.get('groupe') as string | null;
        const extraTimeParam = url.searchParams.get('extraTime');
        const extraTime = extraTimeParam === null ? undefined : extraTimeParam === 'true';

        const q = url.searchParams.get('q');

        const db = await connectToDB();
        const collection = db.collection<User>('users');

        const query: Record<string, unknown> = {};
        if (role) query.role = role;
        if (groupe) query.groupe = groupe;
        if (extraTime !== undefined) query.extraTime = extraTime;
        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), 'i');
            query.$or = [
                {lastName: {$regex: regex}},
                {firstName: {$regex: regex}},
                {email: {$regex: regex}},
                {scodocId: {$regex: regex}},
                {login: {$regex: regex}},
                {groupe: {$regex: regex}},
            ];
        }

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

        // Validate login (2 letters then 6 digits)
        if (!body.login || !/^[A-Za-z]{2}\d{6}$/.test(body.login)) {
            return NextResponse.json({error: 'Login invalide (attendu: 2 lettres puis 6 chiffres)'}, {status: 400});
        }

        // Validate/normalize group: must be 'F' or 'G'; default to 'F' if missing
        if (!body.groupe || !body.groupe.trim()) {
            body.groupe = 'F';
        } else {
            const normalizedGroup = body.groupe.trim().toUpperCase();
            if (normalizedGroup !== 'F' && normalizedGroup !== 'G') {
                return NextResponse.json({error: "Groupe invalide (attendu: 'F' ou 'G')"}, {status: 400});
            }
            body.groupe = normalizedGroup;
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
