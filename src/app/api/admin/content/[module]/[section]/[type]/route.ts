import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import { getBlockDefinition } from "@/lib/blockRegistry";
import type { Block, CourseContent } from "@/types/CourseContent";

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
        const body = await req.json() as { blocks: Block[] };

        if (!Array.isArray(body?.blocks)) {
            return NextResponse.json({ error: "blocks[] requis" }, { status: 400 });
        }

        for (const block of body.blocks) {
            const def = getBlockDefinition(block.type);
            if (!def) {
                return NextResponse.json(
                    { error: `Type de bloc inconnu : ${block.type}` },
                    { status: 400 }
                );
            }
            const result = def.schema.safeParse(block.props);
            if (!result.success) {
                return NextResponse.json(
                    { error: `Bloc ${block.id} invalide`, details: result.error.flatten() },
                    { status: 400 }
                );
            }
        }

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
                    $set: { blocks: body.blocks, updatedAt: now },
                    $inc: { version: 1 },
                }
            );
            contentId = existing._id!.toString();
        } else {
            const insertResult = await db.collection<CourseContent>("course_content").insertOne({
                moduleSlug,
                sectionSlug,
                contentType: typedType,
                blocks: body.blocks,
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
