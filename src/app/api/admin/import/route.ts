import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";

type SectionData = {
    path: string;
    order?: number;
    [key: string]: unknown;
};

type ModuleData = {
    path: string;
    sections?: SectionData[];
    [key: string]: unknown;
};

export const POST = withAdmin(async (req: Request): Promise<Response> => {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
    }

    if (!Array.isArray(body)) {
        return NextResponse.json({ error: "Le body doit être un tableau" }, { status: 400 });
    }

    const modules = body as ModuleData[];
    if (modules.some(m => m === null || typeof m !== "object" || typeof m.path !== "string" || !m.path)) {
        return NextResponse.json({ error: "Chaque module doit avoir un champ path" }, { status: 400 });
    }

    const paths = modules.map(m => m.path);
    if (new Set(paths).size !== paths.length) {
        return NextResponse.json({ error: "Paths dupliqués dans le payload" }, { status: 400 });
    }

    try {
        const db = await connectToDB();
        const col = db.collection("modules");

        let inserted = 0;
        let updated = 0;

        for (const moduleData of modules) {
            const { _id, sections = [], ...moduleFields } = moduleData;
            void _id;

            const existing = await col.findOne({ path: moduleFields.path });

            if (!existing) {
                await col.insertOne({ ...moduleFields, sections });
                inserted++;
            } else {
                // Conserver les sections prod non présentes dans l'import
                const existingSections: SectionData[] = existing.sections ?? [];
                const importedPaths = new Set(sections.map((s) => s.path));
                const keptSections = existingSections
                    .filter((s) => !importedPaths.has(s.path))
                    .map(({ _id: _sid, ...sec }) => sec as SectionData);
                const mergedSections = [...keptSections, ...sections]
                    .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));

                await col.updateOne(
                    { path: moduleFields.path },
                    { $set: { ...moduleFields, sections: mergedSections } },
                );
                updated++;
            }
        }

        return NextResponse.json({ inserted, updated });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Import échoué" }, { status: 500 });
    }
});
