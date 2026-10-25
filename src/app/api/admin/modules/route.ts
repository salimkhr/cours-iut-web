import {NextResponse} from 'next/server';
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {moduleFormSchema} from "@/lib/schemas/module.schema";
import {assignModuleColor} from "@/lib/assignModuleColor";
import {nextModuleOrder} from "@/lib/moduleOrder";

export const POST = withAdmin(async (request: Request) => {
    try {
        const parsed = moduleFormSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
        }

        const db = await connectToDB();
        const collection = db.collection('modules');

        const existing = await collection
            .find<{colorLight?: string; order?: number | null}>({}, {projection: {colorLight: 1, order: 1}})
            .toArray();

        const hasColor = !!(parsed.data.colorLight && parsed.data.colorDark);
        const colors = hasColor ? {} : assignModuleColor(existing);

        // Sans ordre fourni, le module se range après les modules ordonnés (max + 1) ;
        // tant qu'aucun module n'a d'ordre, on n'en pose pas (ordre de création conservé).
        const order = parsed.data.order ?? nextModuleOrder(existing);

        const result = await collection.insertOne({
            ...parsed.data,
            ...colors,
            ...(order !== undefined && {order}),
            isVisible: false,
        });

        return NextResponse.json({insertedId: result.insertedId}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Failed to add module'}, {status: 500});
    }
});
