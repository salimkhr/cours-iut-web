import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import Module from "@/types/Module";
import { WithId } from "mongodb";

export const GET = withAdmin(async (): Promise<Response> => {
    try {
        const db = await connectToDB();
        const docs = await db.collection<Module>("modules").find().toArray() as WithId<Module>[];

        const payload = docs.map(({ _id, sections, ...rest }) => ({
            ...rest,
            sections: (sections ?? []).map(({ _id: _sid, ...sec }) => sec),
        }));

        return new Response(JSON.stringify(payload, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": 'attachment; filename="modules-export.json"',
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to export modules" }, { status: 500 });
    }
});
