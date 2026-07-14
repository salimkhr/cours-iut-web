import { NextResponse } from "next/server";
import { ObjectId } from "bson";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import type { PedagogyVerdict } from "@/types/Pedagogy";

export const GET = withAdmin(async () => {
    const db = await connectToDB();
    const verdicts = await db.collection<PedagogyVerdict>("pedagogy_verdicts")
        .find({}).sort({ date: -1 }).toArray();
    return NextResponse.json(verdicts.map((v) => ({
        id: v._id!.toString(),
        date: v.date instanceof Date ? v.date.toISOString() : v.date,
        format: v.format,
        moduleSlug: v.moduleSlug ?? null,
        verdict: v.verdict,
        status: v.status,
    })));
});

export const DELETE = withAdmin(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ error: "id manquant ou invalide" }, { status: 400 });
    }
    const db = await connectToDB();
    const r = await db.collection<PedagogyVerdict>("pedagogy_verdicts")
        .deleteOne({ _id: new ObjectId(id) });
    if (r.deletedCount === 0) {
        return NextResponse.json({ error: "verdict introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
});
