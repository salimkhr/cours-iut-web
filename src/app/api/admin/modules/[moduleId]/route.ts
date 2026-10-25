import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import {connectToDB} from "@/lib/mongodb";
import {ObjectId} from "bson";
import {getServerSession} from "@/lib/auth";
import {moduleFormSchema} from "@/lib/schemas/module.schema";
import {foldProjectSpecGuard} from "@/lib/pedagogy/validateGate";
import type Module from "@/types/Module";
import type {CourseContent} from "@/types/CourseContent";
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

    try {
        const db = await connectToDB();
        const existing = await db.collection<Module>("modules").findOne({_id: new ObjectId(moduleId)});
        if (!existing) {
            return NextResponse.json({error: "Module introuvable"}, {status: 404});
        }

        const updateData = foldProjectSpecGuard(parsed.data, existing.projectSpec);

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
    if (!ObjectId.isValid(moduleId)) {
        return NextResponse.json({error: "Module introuvable"}, {status: 404});
    }

    try {
        const db = await connectToDB();
        const _id = new ObjectId(moduleId);
        const mod = await db.collection<Module>("modules").findOne({_id}, {projection: {path: 1}});
        if (!mod) {
            return NextResponse.json({error: "Module introuvable"}, {status: 404});
        }

        // Cascade sans transaction (pas de replica set). Ordre choisi pour qu'un échec en cours
        // de route laisse un état ré-essayable : les dépendances d'abord, le module en dernier
        // (sinon on perdrait le `path` et le `moduleId` qui permettent de retrouver le reste).
        //
        // 1. Contenus : sans ce nettoyage, l'index unique `unique_content_ref`
        //    (moduleSlug/sectionSlug/contentType) bloque la recréation d'un module de même slug.
        const contents = await db.collection<CourseContent>("course_content")
            .find({moduleSlug: mod.path}, {projection: {sectionSlug: 1, contentType: 1}})
            .toArray();
        if (contents.length > 0) {
            await db.collection<CourseContent>("course_content").deleteMany({moduleSlug: mod.path});
        }

        // 2. Quiz live : `module_quizzes` et `quiz_sessions` sont rattachés par `moduleId`
        //    (ObjectId en chaîne hexadécimale), participants et réponses par `sessionId`.
        const sessionIds = (await db.collection<{_id: string; moduleId: string}>("quiz_sessions")
            .find({moduleId}, {projection: {_id: 1}})
            .toArray()).map((s) => s._id);
        if (sessionIds.length > 0) {
            await db.collection("quiz_answers").deleteMany({sessionId: {$in: sessionIds}});
            await db.collection("quiz_participants").deleteMany({sessionId: {$in: sessionIds}});
            await db.collection("quiz_sessions").deleteMany({moduleId});
        }
        await db.collection("module_quizzes").deleteMany({moduleId});

        // 3. Le module lui-même.
        const result = await db.collection("modules").deleteOne({_id});
        if (result.deletedCount === 0) {
            return NextResponse.json({error: "Module introuvable"}, {status: 404});
        }

        for (const doc of contents) {
            revalidateTag(`content:${mod.path}:${doc.sectionSlug}:${doc.contentType}`, {expire: 0});
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}
