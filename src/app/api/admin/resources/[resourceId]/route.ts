import {NextResponse} from "next/server";
import {ObjectId} from "bson";
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {resourceFormSchema, resourceVisibilitySchema} from "@/lib/schemas/resource.schema";
import {RESOURCES_COLLECTION} from "@/lib/getResources";

type Context = {params: Promise<{resourceId: string}>};

async function readId(context: Context): Promise<ObjectId | null> {
    const {resourceId} = await context.params;
    return ObjectId.isValid(resourceId) ? new ObjectId(resourceId) : null;
}

export const PUT = withAdmin<Context>(async (request, context) => {
    const id = await readId(context);
    if (!id) return NextResponse.json({error: "Identifiant invalide"}, {status: 400});

    const parsed = resourceFormSchema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
    }

    try {
        // Un champ facultatif vidé dans le formulaire est retiré ($unset), pas écrit à null.
        const {durationMin, note, ...required} = parsed.data;
        const $set = {
            ...required,
            ...(durationMin !== undefined ? {durationMin} : {}),
            ...(note !== undefined ? {note} : {}),
        };
        const $unset = {
            ...(durationMin === undefined ? {durationMin: ""} : {}),
            ...(note === undefined ? {note: ""} : {}),
        };

        const db = await connectToDB();
        const result = await db
            .collection(RESOURCES_COLLECTION)
            .updateOne({_id: id}, Object.keys($unset).length ? {$set, $unset} : {$set});
        if (result.matchedCount === 0) {
            return NextResponse.json({error: "Ressource introuvable"}, {status: 404});
        }
        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
});

export const PATCH = withAdmin<Context>(async (request, context) => {
    const id = await readId(context);
    if (!id) return NextResponse.json({error: "Identifiant invalide"}, {status: 400});

    const parsed = resourceVisibilitySchema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
    }

    try {
        const db = await connectToDB();
        const result = await db
            .collection(RESOURCES_COLLECTION)
            .updateOne({_id: id}, {$set: {isVisible: parsed.data.isVisible}});
        if (result.matchedCount === 0) {
            return NextResponse.json({error: "Ressource introuvable"}, {status: 404});
        }
        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
});

export const DELETE = withAdmin<Context>(async (_request, context) => {
    const id = await readId(context);
    if (!id) return NextResponse.json({error: "Identifiant invalide"}, {status: 400});

    try {
        const db = await connectToDB();
        const result = await db.collection(RESOURCES_COLLECTION).deleteOne({_id: id});
        if (result.deletedCount === 0) {
            return NextResponse.json({error: "Ressource introuvable"}, {status: 404});
        }
        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
});
