import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import type { ContentRef } from "@/types/CourseContent";

type StatusMap = Record<string, Record<string, Record<string, string>>>;

export const GET = withAdmin(async () => {
    try {
        const db = await connectToDB();
        const modules = await db.collection("modules").find({}, {
            projection: { path: 1, sections: 1 }
        }).toArray();

        const status: StatusMap = {};

        for (const mod of modules) {
            status[mod.path] = {};
            for (const section of (mod.sections ?? [])) {
                status[mod.path][section.path] = {};
                for (const content of (section.contents ?? []) as ContentRef[]) {
                    status[mod.path][section.path][content.type] =
                        (content as { source?: string }).source ?? "file";
                }
            }
        }

        return NextResponse.json(status);
    } catch (error) {
        console.error("[content status]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
