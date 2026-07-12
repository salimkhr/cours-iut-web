import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {ObjectId} from "bson";
import {getServerSession} from "@/lib/auth";
import {moduleFormSchema} from "@/lib/schemas/module.schema";
import {z} from "zod";

const visibilitySchema = z.object({isVisible: z.boolean()});

export async function PUT(
    req: Request,
    {params}: {params: Promise<{moduleId: string}>}
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Non autorisé"}, {status: 403});
    }

    const {moduleId} = await params;

    const parsed = moduleFormSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
    }
    const updateData = parsed.data;

    try {
        const db = await connectToDB();
        const result = await db.collection("modules").updateOne(
            {_id: new ObjectId(moduleId)},
            {$set: updateData}
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({error: "Module introuvable"}, {status: 404});
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}

export async function PATCH(
    req: Request,
    {params}: {params: Promise<{moduleId: string}>}
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Non autorisé"}, {status: 403});
    }

    const {moduleId} = await params;
    const parsed = visibilitySchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
    }

    try {
        const db = await connectToDB();
        const result = await db.collection("modules").updateOne(
            {_id: new ObjectId(moduleId)},
            {$set: {isVisible: parsed.data.isVisible}}
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({error: "Module introuvable"}, {status: 404});
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}

export async function DELETE(
    _req: Request,
    {params}: {params: Promise<{moduleId: string}>}
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Non autorisé"}, {status: 403});
    }

    const {moduleId} = await params;

    try {
        const db = await connectToDB();
        const result = await db.collection("modules").deleteOne({_id: new ObjectId(moduleId)});

        if (result.deletedCount === 0) {
            return NextResponse.json({error: "Module introuvable"}, {status: 404});
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}
