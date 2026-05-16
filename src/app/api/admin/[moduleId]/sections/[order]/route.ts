import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import {ObjectId} from 'bson';
import Module from '@/types/Module';
import {withAdmin} from '@/lib/withAdmin';
import {z} from 'zod';

const toggleSchema = z.object({
    key: z.enum(['isAvailable', 'correctionIsAvailable', 'examenIsLock']),
    value: z.boolean(),
});

export const PUT = withAdmin(async (
    req: Request,
    {params}: { params: Promise<{ moduleId: string; order: string }> }
) => {
    try {
        const {moduleId, order} = await params;

        const parsed = toggleSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
        }
        const {key, value} = parsed.data;

        const db = await connectToDB();

        const fieldName = `sections.$.${key}`;

        const result = await db.collection<Module>('modules').updateOne(
            {_id: new ObjectId(moduleId), 'sections.order': Number(order)},
            {$set: {[fieldName]: value}}
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                {error: 'Module ou section introuvable'},
                {status: 404}
            );
        }

        return NextResponse.json({success: true, key, value});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
});