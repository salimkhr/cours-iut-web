import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {resourceFormSchema} from "@/lib/schemas/resource.schema";
import {RESOURCES_COLLECTION} from "@/lib/getResources";

export const POST = withAdmin(async (request: Request) => {
    try {
        const parsed = resourceFormSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
        }

        const db = await connectToDB();
        // Champs facultatifs omis plutôt qu'écrits à null.
        const {durationMin, note, ...required} = parsed.data;
        const result = await db.collection(RESOURCES_COLLECTION).insertOne({
            ...required,
            ...(durationMin !== undefined ? {durationMin} : {}),
            ...(note !== undefined ? {note} : {}),
            isVisible: true,
            createdAt: new Date(),
        });

        return NextResponse.json({insertedId: result.insertedId.toString()}, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
});
