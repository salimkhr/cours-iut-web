import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import type { Block, ContentRef, CourseContent } from "@/types/CourseContent";
import type Module from "@/types/Module";
import { validateBlockTree } from "@/lib/validateBlockTree";
import { pruneEmptyLeafChildren } from "@/lib/blockTreeUtils";
import { normalizeContentKey } from "@/lib/contentTypes";

type Ctx = { params: Promise<{ module: string; section: string; type: string }> };

/** Réponse 400 commune quand le segment `type` n'est pas un type de contenu connu. */
function invalidTypeResponse(raw: string) {
    return NextResponse.json(
        { error: `Type de contenu inconnu : « ${raw} ».` },
        { status: 400 }
    );
}

/**
 * Déclare le type de contenu dans `section.contents` s'il en est absent, puis
 * pointe la référence sur le document en base. Sans cette entrée, la page
 * publique renvoie un 404 : le contenu existe mais la section ne l'expose pas.
 * Retourne `true` si l'entrée a dû être créée.
 */
async function linkContentRef(
    db: Awaited<ReturnType<typeof connectToDB>>,
    moduleSlug: string,
    sectionSlug: string,
    contentType: string,
    contentId: string,
): Promise<{ ok: boolean; created: boolean }> {
    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    const section = mod?.sections?.find((s) => s.path === sectionSlug);
    if (!section) return { ok: false, created: false };

    const declared = section.contents?.some((c: ContentRef) => c.type === contentType) ?? false;

    if (declared) {
        await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $set: {
                    "sections.$[s].contents.$[c].source": "db",
                    "sections.$[s].contents.$[c].contentId": contentId,
                },
            },
            { arrayFilters: [{ "s.path": sectionSlug }, { "c.type": contentType }] }
        );
    } else {
        await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $push: {
                    "sections.$[s].contents": {
                        type: contentType,
                        source: "db",
                        contentId,
                    },
                } as never,
            },
            { arrayFilters: [{ "s.path": sectionSlug }] }
        );
    }

    return { ok: true, created: !declared };
}

// ── GET ──────────────────────────────────────────────────────────────────────

export const GET = withAdmin<Ctx>(async (
    _req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: rawType } = await params;
        const typedType = normalizeContentKey(rawType) as CourseContent["contentType"] | null;
        if (!typedType) return invalidTypeResponse(rawType);
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
        const { module: moduleSlug, section: sectionSlug, type: rawType } = await params;
        const typedType = normalizeContentKey(rawType) as CourseContent["contentType"] | null;
        if (!typedType) return invalidTypeResponse(rawType);
        const contentType: string = typedType;
        const body = await req.json() as { blocks: unknown };

        // Nettoyage avant validation : les `children: []` hérités de la
        // migration sont retirés à chaque écriture, ce qui assainit la base au
        // fil des sauvegardes au lieu de bloquer l'auteur.
        const cleaned = Array.isArray(body?.blocks)
            ? pruneEmptyLeafChildren(body.blocks as Block[])
            : body?.blocks;

        const validation = validateBlockTree(cleaned);
        if (!validation.valid) {
            return NextResponse.json(
                { error: "Blocs invalides", details: validation.errors },
                { status: 422 }
            );
        }
        const blocks = cleaned as Block[];

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

        const link = await linkContentRef(db, moduleSlug, sectionSlug, contentType, contentId);
        if (!link.ok) {
            return NextResponse.json(
                { error: "Section introuvable — contenu enregistré mais non rattaché." },
                { status: 404 }
            );
        }

        revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 });

        const updated = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType: typedType });

        return NextResponse.json({
            contentId,
            version: updated?.version ?? 1,
            updatedAt: updated?.updatedAt ?? now,
            source: "db",
            contentTypeDeclared: link.created,
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
        const { module: moduleSlug, section: sectionSlug, type: rawType } = await params;
        const typedType = normalizeContentKey(rawType) as CourseContent["contentType"] | null;
        if (!typedType) return invalidTypeResponse(rawType);
        const contentType: string = typedType;
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

        // `updateOne` avec arrayFilters compte le *module* dans matchedCount :
        // sans cette vérification, une section qui ne déclare pas le type
        // renvoyait un succès alors qu'aucune référence n'avait bougé.
        const link = await linkContentRef(db, moduleSlug, sectionSlug, contentType, doc._id!.toString());
        if (!link.ok) {
            return NextResponse.json({ error: "Module/section introuvable." }, { status: 404 });
        }

        revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 });

        return NextResponse.json({ success: true, source: "db", contentTypeDeclared: link.created });
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
        const { module: moduleSlug, section: sectionSlug, type: rawType } = await params;
        const typedType = normalizeContentKey(rawType) as CourseContent["contentType"] | null;
        if (!typedType) return invalidTypeResponse(rawType);
        const contentType: string = typedType;
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
