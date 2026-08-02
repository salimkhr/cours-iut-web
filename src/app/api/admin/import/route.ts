import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { connectToDB } from "@/lib/mongodb";
import { getServerSession } from "@/lib/auth";
import { buildModuleOps, buildContentOps } from "@/lib/admin/importOps";
import type { ModuleData, ContentData } from "@/lib/admin/importOps";

/** Auth par secret partagé (sync inter-environnements), comparaison timing-safe. */
function hasValidSyncSecret(req: Request): boolean {
    const secret = process.env.SYNC_SECRET;
    const header = req.headers.get("x-sync-secret");
    if (!secret || !header) return false;
    const a = Buffer.from(secret);
    const b = Buffer.from(header);
    return a.length === b.length && timingSafeEqual(a, b);
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

        const existingModules = await col.find({ path: { $in: paths } }).toArray();
        const existingByPath = new Map(existingModules.map((m) => [m.path as string, m as unknown as ModuleData]));

        const { operations: moduleOps, inserted, updated } = buildModuleOps(existingByPath, modules);
        if (moduleOps.length > 0) {
            await col.bulkWrite(moduleOps, { ordered: false });
        }

        const contentCol = db.collection("course_content");
        const contentOps = buildContentOps(contents);
        if (contentOps.length > 0) {
            await contentCol.bulkWrite(contentOps, { ordered: false });
        }
        const contentsUpserted = contentOps.length;

        return NextResponse.json({ inserted, updated, contentsUpserted });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Import échoué" }, { status: 500 });
    }
}
