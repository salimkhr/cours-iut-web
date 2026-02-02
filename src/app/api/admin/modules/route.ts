import {NextResponse} from 'next/server';
import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";

export async function POST(request: Request) {
    try {
        const body = await request.json() as Omit<Module, '_id'>;

        const db = await connectToDB();
        const collection = db.collection('modules');

        // Insère le module dans MongoDB
        const result = await collection.insertOne(body);

        return NextResponse.json({insertedId: result.insertedId}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Failed to add module'}, {status: 500});
    }
}
