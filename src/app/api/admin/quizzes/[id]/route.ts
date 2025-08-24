import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import Quiz from "@/types/Quiz";
import {ObjectId} from "bson";

export async function PUT(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const updates = (await request.json()) as Partial<Quiz>;

        // normalize
        if (updates.name !== undefined) updates.name = String(updates.name || "").trim();
        if (updates.questions && !Array.isArray(updates.questions)) {
            return NextResponse.json({error: "questions doit être un tableau"}, {status: 400});
        }
        if (updates.moduleId !== undefined) {
            // Allow empty to be rejected at UI; here just set as provided
            updates.moduleId = updates.moduleId as unknown as string;
        }

        updates.updatedAt = new Date().toISOString();

        const db = await connectToDB();
        const collection = db.collection<Quiz>("quizzes");

        const result = await collection.updateOne({_id: new ObjectId(id)}, {$set: updates});
        if (result.matchedCount === 0) {
            return NextResponse.json({error: "Quiz introuvable"}, {status: 404});
        }
        const saved = await collection.findOne({_id: new ObjectId(id)});
        return NextResponse.json({quiz: saved});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}

export async function DELETE(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const db = await connectToDB();
        const collection = db.collection<Quiz>("quizzes");
        const result = await collection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) {
            return NextResponse.json({error: "Quiz introuvable"}, {status: 404});
        }
        return NextResponse.json({success: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Erreur interne"}, {status: 500});
    }
}
