import {NextResponse} from 'next/server';
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {moduleFormSchema} from "@/lib/schemas/module.schema";
import {assignModuleColor} from "@/lib/assignModuleColor";

export const POST = withAdmin(async (request: Request) => {
    try {
        const parsed = moduleFormSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
        }

        const db = await connectToDB();
        const collection = db.collection('modules');

        const hasColor = !!(parsed.data.colorLight && parsed.data.colorDark);
        const colors = hasColor
            ? {}
            : assignModuleColor(
                await collection
                    .find<{colorLight?: string}>({}, {projection: {colorLight: 1}})
                    .toArray(),
            );

        const result = await collection.insertOne({...parsed.data, ...colors, isVisible: false});

        return NextResponse.json({insertedId: result.insertedId}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Failed to add module'}, {status: 500});
    }
});
