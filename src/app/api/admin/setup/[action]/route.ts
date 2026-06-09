import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import { createHash } from "crypto";
import type { ContentRef } from "@/types/CourseContent";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ action: string }> };

export async function POST(_req: Request, { params }: Ctx) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action } = await params;

    try {
        if (action === "migrate-contents-refs") {
            const db = await connectToDB();
            const modules = await db.collection("modules").find().toArray();
            let updated = 0;

            for (const mod of modules) {
                const newSections = (mod.sections ?? []).map((section: Record<string, unknown>) => {
                    if (!Array.isArray(section.contents)) return section;
                    const alreadyMigrated = section.contents.every(
                        (c: unknown) => typeof c === "object" && c !== null
                    );
                    if (alreadyMigrated) return section;
                    return {
                        ...section,
                        contents: (section.contents as string[]).map(
                            (type): ContentRef => ({ type: type as ContentRef["type"], source: "file" })
                        ),
                    };
                });
                await db.collection("modules").updateOne(
                    { _id: mod._id },
                    { $set: { sections: newSections } }
                );
                updated++;
            }
            return NextResponse.json({ ok: true, updated });
        }

        if (action === "create-content-index") {
            const db = await connectToDB();
            await db.collection("course_content").createIndex(
                { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
                { unique: true, name: "unique_content_ref" }
            );
            return NextResponse.json({ ok: true });
        }

        if (action === "seed-oauth-client") {
            const clientId     = process.env.MCP_CLIENT_ID;
            const clientSecret = process.env.MCP_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                return NextResponse.json(
                    { error: "MCP_CLIENT_ID et MCP_CLIENT_SECRET requis dans .env" },
                    { status: 500 }
                );
            }

            const hashedSecret = createHash("sha256")
                .update(clientSecret)
                .digest("base64url");

            const db = await connectToDB();
            const existing = await db.collection("oauthClient").findOne({ clientId });
            if (existing) {
                return NextResponse.json({ ok: true, skipped: true, reason: "client déjà enregistré" });
            }

            await db.collection("oauthClient").insertOne({
                clientId,
                clientSecret: hashedSecret,
                name: "Claude.ai",
                redirectUris: ["https://claude.ai/oauth/callback"],
                skipConsent: true,
                disabled: false,
                type: "web",
                grantTypes: ["authorization_code", "refresh_token"],
                responseTypes: ["code"],
                tokenEndpointAuthMethod: "client_secret_basic",
                requirePKCE: true,
                scopes: ["openid", "profile", "email", "offline_access"],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return NextResponse.json({ ok: true, skipped: false });
        }

        return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
    } catch (error) {
        console.error(`[setup/${action}]`, error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
