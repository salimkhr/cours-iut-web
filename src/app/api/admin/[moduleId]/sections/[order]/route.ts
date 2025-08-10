import {NextResponse} from 'next/server';
import {connectToDB} from '@/lib/mongodb';
import {ObjectId} from 'bson';
import Module from '@/types/module';

export async function PUT(
    req: Request,
    context: { params: { moduleId: string; order: string } }
) {
    try {
        const {moduleId, order} = await context.params;
        const {key, value} = await req.json();

        // Vérification de la clé
        if (!['isAvailable', 'correctionIsAvailable'].includes(key)) {
            return NextResponse.json({error: 'Clé invalide'}, {status: 400});
        }

        const db = await connectToDB();

        // Nom de champ dynamique : ex. "sections.$.isAvailable"
        const fieldName = `sections.$.${key}`;

        // Mise à jour de la section qui a le bon order
        const result = await db.collection<Module>('modules').updateOne(
            {_id: new ObjectId(moduleId), 'sections.order': Number(order)},
            {$set: {[fieldName]: value}}
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({error: 'Module ou section introuvable'}, {status: 404});
        }

        return NextResponse.json({success: true, key, value});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}
