import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { connectToDB } from "@/lib/mongodb";
import { getServerSession } from "@/lib/auth";

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

type ContentData = {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks: unknown[];
    version?: number;
};

/** Auth par secret partagé (sync inter-environnements), comparaison timing-safe. */
function hasValidSyncSecret(req: Request): boolean {
    const secret = process.env.SYNC_SECRET;
    const header = req.headers.get("x-sync-secret");
    if (!secret || !header) return false;
    const a = Buffer.from(secret);
    const b = Buffer.from(header);
    return a.length === b.length && timingSafeEqual(a, b);
}

/** Sur un module existant en prod, l'import ne doit jamais changer l'état de publication. */
function mergeSections(existingSections: SectionData[], importedSections: SectionData[]): SectionData[] {
    const existingByPath = new Map(existingSections.map((s) => [s.path, s]));
    const importedPaths = new Set(importedSections.map((s) => s.path));

    const merged = importedSections.map(({ _id, ...sec }) => {
        void _id;
        const existing = existingByPath.get(sec.path);
        if (existing) {
            return {
                ...sec,
                isAvailable: existing.isAvailable ?? false,
                correctionIsAvailable: existing.correctionIsAvailable ?? false,
                examenIsLock: existing.examenIsLock ?? false,
            };
        }
        // Nouvelle section : arrive dépubliée quel que soit son état sur staging.
        return { ...sec, isAvailable: false, correctionIsAvailable: false };
    });

    const kept = existingSections
        .filter((s) => !importedPaths.has(s.path))
        .map(({ _id, ...sec }) => {
            void _id;
            return sec as SectionData;
        });

    return [...kept, ...merged]
        .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));
}

export async function POST(req: Request): Promise<Response> {
    const syncAuth = hasValidSyncSecret(req);
    if (!syncAuth) {
        const session = await getServerSession();
        if (session?.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
    }

    // v1 : tableau de modules — v2 : { version: 2, modules, contents }
    let modules: ModuleData[];
    let contents: ContentData[];
    if (Array.isArray(body)) {
        modules = body as ModuleData[];
        contents = [];
    } else if (body && typeof body === "object" && Array.isArray((body as { modules?: unknown }).modules)) {
        modules = (body as { modules: ModuleData[] }).modules;
        contents = Array.isArray((body as { contents?: unknown }).contents)
            ? (body as { contents: ContentData[] }).contents
            : [];
    } else {
        return NextResponse.json({ error: "Format invalide : tableau (v1) ou { modules, contents } (v2)" }, { status: 400 });
    }

    if (modules.some(m => m === null || typeof m !== "object" || typeof m.path !== "string" || !m.path)) {
        return NextResponse.json({ error: "Chaque module doit avoir un champ path" }, { status: 400 });
    }

    const paths = modules.map(m => m.path);
    if (new Set(paths).size !== paths.length) {
        return NextResponse.json({ error: "Paths dupliqués dans le payload" }, { status: 400 });
    }

    if (contents.some(c =>
        c === null || typeof c !== "object" ||
        typeof c.moduleSlug !== "string" || typeof c.sectionSlug !== "string" ||
        typeof c.contentType !== "string" || !Array.isArray(c.blocks)
    )) {
        return NextResponse.json({ error: "Chaque contenu doit avoir moduleSlug, sectionSlug, contentType et blocks" }, { status: 400 });
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
                // Nouveau module : arrive masqué, sections dépubliées.
                await col.insertOne({
                    ...moduleFields,
                    isVisible: false,
                    sections: sections.map(({ _id: _sid, ...sec }) => ({
                        ...sec,
                        isAvailable: false,
                        correctionIsAvailable: false,
                    })),
                });
                inserted++;
            } else {
                await col.updateOne(
                    { path: moduleFields.path },
                    {
                        $set: {
                            ...moduleFields,
                            isVisible: existing.isVisible ?? false,
                            sections: mergeSections(existing.sections ?? [], sections),
                        },
                    },
                );
                updated++;
            }
        }

        let contentsUpserted = 0;
        const contentCol = db.collection("course_content");
        for (const content of contents) {
            const key = {
                moduleSlug: content.moduleSlug,
                sectionSlug: content.sectionSlug,
                contentType: content.contentType,
            };
            await contentCol.updateOne(
                key,
                {
                    $set: {
                        blocks: content.blocks,
                        version: content.version ?? 1,
                        updatedAt: new Date(),
                    },
                    $setOnInsert: { ...key, createdAt: new Date() },
                },
                { upsert: true },
            );
            contentsUpserted++;
        }

        return NextResponse.json({ inserted, updated, contentsUpserted });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Import échoué" }, { status: 500 });
    }
}
