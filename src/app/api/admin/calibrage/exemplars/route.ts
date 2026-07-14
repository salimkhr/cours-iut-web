import { NextResponse } from "next/server";
import { ObjectId } from "bson";
import { connectToDB } from "@/lib/mongodb";
import type { PedagogyExemplar } from "@/types/Pedagogy";

export async function GET() {
    const db = await connectToDB();
    const exemplars = await db.collection<PedagogyExemplar>("pedagogy_exemplars")
        .find({}, { projection: { snapshot: 0 } }).sort({ date: -1 }).toArray();
    return NextResponse.json(exemplars.map((e) => ({
        id: e._id!.toString(),
        date: e.date instanceof Date ? e.date.toISOString() : e.date,
        format: e.format,
        moduleSlug: e.moduleSlug,
        sectionSlug: e.sectionSlug,
        level: e.level,
        annotations: e.annotations,
    })));
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ error: "id manquant ou invalide" }, { status: 400 });
    }
    const db = await connectToDB();
    const r = await db.collection<PedagogyExemplar>("pedagogy_exemplars")
        .deleteOne({ _id: new ObjectId(id) });
    if (r.deletedCount === 0) {
        return NextResponse.json({ error: "exemplaire introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
}
