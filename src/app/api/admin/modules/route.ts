import {NextResponse} from 'next/server';
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {moduleFormSchema} from "@/lib/schemas/module.schema";

export const POST = withAdmin(async (request: Request) => {
    try {
        const parsed = moduleFormSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
        }

        const db = await connectToDB();
        const collection = db.collection('modules');

        const result = await collection.insertOne(parsed.data);

        return NextResponse.json({insertedId: result.insertedId}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Failed to add module'}, {status: 500});
    }
});
