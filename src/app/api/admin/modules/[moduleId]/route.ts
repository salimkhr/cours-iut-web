import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import {ObjectId} from 'bson';
import {getServerSession} from '@/lib/auth';

export async function PUT(
    req: Request,
    {params}: {params: Promise<{moduleId: string}>}
) {
    const session = await getServerSession();
    if (session?.user.role !== 'admin') {
        return NextResponse.json({error: 'Non autorisé'}, {status: 403});
    }

    const {moduleId} = await params;
    const body = await req.json();

    // Ne jamais écraser _id ni sections via ce endpoint
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {_id, sections, ...updateData} = body;

    const db = await connectToDB();
    const result = await db.collection('modules').updateOne(
        {_id: new ObjectId(moduleId)},
        {$set: updateData}
    );

    if (result.matchedCount === 0) {
        return NextResponse.json({error: 'Module introuvable'}, {status: 404});
    }

    return NextResponse.json({success: true});
}
