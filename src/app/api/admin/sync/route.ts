import {NextResponse} from "next/server";
import fs from "fs/promises";
import path from "path";
import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";
import {WithId} from "mongodb";
import {AVAILABLE_CONTENTS, SectionFormValues} from "@/lib/schemas/section.schema";

// Mappe le nom du fichier .tsx vers la valeur du schema
const FILE_TO_CONTENT: Record<string, typeof AVAILABLE_CONTENTS[number]> = {
    "Cours": "cours",
    "TP": "TP",
    "Slide": "slide",
    "Examen": "examen",
};

// "1-le-dom" → "Le Dom"
function slugToTitle(slug: string): string {
    return slug
        .replace(/^\d+-/, "")
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export type MissingSectionItem = {
    module: Module & {_id: string};
    sectionSlug: string;
    prefill: Pick<SectionFormValues, "title" | "path" | "order" | "contents"> & {
        isAvailable: false;
        hasCorrection: false;
        totalDuration: 1;
    };
};

export type SyncResponse = {
    missingModules: {slug: string}[];
    missingSections: MissingSectionItem[];
};

export async function GET(): Promise<NextResponse<SyncResponse>> {
    const coursDir = path.join(process.cwd(), "src", "cours");
    const db = await connectToDB();
    const modules = await db.collection<Module>("modules").find().toArray() as WithId<Module>[];

    const modulesByPath = new Map(modules.map(m => [m.path, m]));

    const missingModules: {slug: string}[] = [];
    const missingSections: MissingSectionItem[] = [];

    const moduleSlugs = await fs.readdir(coursDir);

    for (const moduleSlug of moduleSlugs) {
        const moduleStat = await fs.stat(path.join(coursDir, moduleSlug));
        if (!moduleStat.isDirectory()) continue;

        const existingModule = modulesByPath.get(moduleSlug);

        if (!existingModule) {
            missingModules.push({slug: moduleSlug});
            continue;
        }

        const existingSectionPaths = new Set(
            (existingModule.sections ?? []).map(s => s.path)
        );

        const sectionSlugs = await fs.readdir(path.join(coursDir, moduleSlug));

        for (const sectionSlug of sectionSlugs) {
            const sectionStat = await fs.stat(path.join(coursDir, moduleSlug, sectionSlug));
            if (!sectionStat.isDirectory()) continue;

            if (existingSectionPaths.has(sectionSlug)) continue;

            const files = await fs.readdir(path.join(coursDir, moduleSlug, sectionSlug));
            const contents = files
                .filter(f => f.endsWith(".tsx"))
                .map(f => FILE_TO_CONTENT[f.replace(".tsx", "")])
                .filter((c): c is typeof AVAILABLE_CONTENTS[number] => c !== undefined);

            const orderMatch = sectionSlug.match(/^(\d+)-/);
            const order = orderMatch ? parseInt(orderMatch[1], 10) : (existingModule.sections?.length ?? 0) + 1;

            missingSections.push({
                module: {...existingModule, _id: existingModule._id.toString()},
                sectionSlug,
                prefill: {
                    title: slugToTitle(sectionSlug),
                    path: sectionSlug,
                    order,
                    contents: contents.length > 0 ? contents : ["cours", "TP"],
                    isAvailable: false,
                    hasCorrection: false,
                    totalDuration: 1,
                },
            });
        }
    }

    return NextResponse.json({missingModules, missingSections});
}
