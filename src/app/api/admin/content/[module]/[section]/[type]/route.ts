import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import type { Block, CourseContent } from "@/types/CourseContent";
import { validateBlockTree } from "@/lib/validateBlockTree";

type Ctx = { params: Promise<{ module: string; section: string; type: string }> };

// ── GET ──────────────────────────────────────────────────────────────────────

export const GET = withAdmin<Ctx>(async (
    _req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: contentType } = await params;
        const typedType = contentType as CourseContent["contentType"];
        const db = await connectToDB();
        const doc = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType: typedType });

        if (!doc) {
            return NextResponse.json({ blocks: [], source: "file" }, { status: 200 });
        }

        return NextResponse.json({
            contentId: doc._id?.toString(),
            blocks: doc.blocks,
            version: doc.version,
            updatedAt: doc.updatedAt,
            source: "db",
        });
    } catch (error) {
        console.error("[content GET]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});

// ── PUT ──────────────────────────────────────────────────────────────────────

export const PUT = withAdmin<Ctx>(async (
    req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: contentType } = await params;
        const typedType = contentType as CourseContent["contentType"];
        const body = await req.json() as { blocks: unknown };

        const validation = validateBlockTree(body?.blocks);
        if (!validation.valid) {
            return NextResponse.json(
                { error: "Blocs invalides", details: validation.errors },
                { status: 422 }
            );
        }
        const blocks = body.blocks as Block[];

        const db = await connectToDB();
        const now = new Date();

        const existing = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType: typedType });

        let contentId: string;

        if (existing) {
            await db.collection<CourseContent>("course_content").updateOne(
                { _id: existing._id },
                {
                    $set: { blocks, updatedAt: now },
                    $inc: { version: 1 },
                }
            );
            contentId = existing._id!.toString();
        } else {
            const insertResult = await db.collection<CourseContent>("course_content").insertOne({
                moduleSlug,
                sectionSlug,
                contentType: typedType,
                blocks,
                version: 1,
                createdAt: now,
                updatedAt: now,
            });
            contentId = insertResult.insertedId.toString();
        }

        await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $set: {
                    "sections.$[s].contents.$[c].source": "db",
                    "sections.$[s].contents.$[c].contentId": contentId,
                },
            },
            {
                arrayFilters: [
                    { "s.path": sectionSlug },
                    { "c.type": contentType },
                ],
            }
        );

        revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 });

        const updated = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType: typedType });

        return NextResponse.json({
            contentId,
            version: updated?.version ?? 1,
            updatedAt: updated?.updatedAt ?? now,
        });
    } catch (error) {
        console.error("[content PUT]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});

// ── PATCH ─────────────────────────────────────────────────────────────────────
// Force la ref de la section en source:"db" (+ contentId) et revalide le cache,
// sans re-sauvegarder les blocs. Utile quand une ref est restée "file" alors que
// le contenu existe en base (créé via le MCP / le builder).

export const PATCH = withAdmin<Ctx>(async (
    _req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: contentType } = await params;
        const typedType = contentType as CourseContent["contentType"];
        const db = await connectToDB();

        const doc = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType: typedType });

        if (!doc) {
            return NextResponse.json(
                { error: "Aucun contenu en base pour ce type — rien à basculer." },
                { status: 400 }
            );
        }

        const result = await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $set: {
                    "sections.$[s].contents.$[c].source": "db",
                    "sections.$[s].contents.$[c].contentId": doc._id!.toString(),
                },
            },
            { arrayFilters: [{ "s.path": sectionSlug }, { "c.type": contentType }] }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Module/section introuvable." }, { status: 404 });
        }

        revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 });

        return NextResponse.json({ success: true, source: "db" });
    } catch (error) {
        console.error("[content PATCH]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});

// ── DELETE ────────────────────────────────────────────────────────────────────

export const DELETE = withAdmin<Ctx>(async (
    _req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: contentType } = await params;
        const typedType = contentType as CourseContent["contentType"];
        const db = await connectToDB();

        await db.collection<CourseContent>("course_content").deleteOne(
            { moduleSlug, sectionSlug, contentType: typedType }
        );

        await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $set: { "sections.$[s].contents.$[c].source": "file" },
                $unset: { "sections.$[s].contents.$[c].contentId": "" },
            },
            {
                arrayFilters: [
                    { "s.path": sectionSlug },
                    { "c.type": contentType },
                ],
            }
        );

        revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[content DELETE]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
