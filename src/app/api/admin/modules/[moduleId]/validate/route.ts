import {NextResponse} from "next/server";
import {ObjectId} from "bson";
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {validateGateSchema, buildGateUpdate} from "@/lib/pedagogy/validateGate";
import type Module from "@/types/Module";

export const POST = withAdmin(async (
    req: Request,
    {params}: {params: Promise<{moduleId: string}>}
) => {
    const {moduleId} = await params;
    const parsed = validateGateSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({error: "Porte inconnue."}, {status: 400});
    }

    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne({_id: new ObjectId(moduleId)});
    if (!mod) return NextResponse.json({error: "Module introuvable."}, {status: 404});

    try {
        const update = buildGateUpdate(parsed.data.gate, mod.projectSpec);
        await db.collection("modules").updateOne(
            {_id: new ObjectId(moduleId)},
            {$set: {...update, updatedAt: new Date().toISOString()}}
        );
        return NextResponse.json({ok: true});
    } catch (error) {
        return NextResponse.json({error: (error as Error).message}, {status: 409});
    }
});
