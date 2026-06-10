import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { revalidateTag } from "next/cache";
import { createHash } from "crypto";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb";
import { getAllBlockDefinitions, getBlockDefinition } from "@/lib/blockRegistry";
import type { Block, CourseContent } from "@/types/CourseContent";

export const runtime = "nodejs";

type RawBlock = { id: string; type: string; props: Record<string, unknown>; colSpan?: "full" | "half" };

// ── Validation du Bearer token ────────────────────────────────────────────────

/**
 * Hash an opaque access token the same way @better-auth/oauth-provider does:
 * SHA-256 → base64url (no padding).
 */
function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("base64url");
}

async function validateToken(req: Request): Promise<{ id: string; role: string } | null> {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    const hashedToken = hashToken(token);

    const db = await connectToDB();
    const now = new Date();

    // Field names from @better-auth/oauth-provider schema:
    //   token  (hashed, SHA-256 base64url)  — NOT "accessToken"
    //   expiresAt                            — NOT "accessTokenExpiresAt"
    const tokenDoc = await db.collection("oauthAccessToken").findOne({
        token: hashedToken,
        expiresAt: { $gt: now },
    });
    if (!tokenDoc) return null;

    // tokenDoc.userId is an ObjectId (the mongo-adapter serialises reference fields
    // to ObjectId on write).  Query user by _id directly — no separate "id" field.
    const user = await db.collection("user").findOne({ _id: tokenDoc.userId });
    if (!user) return null;

    return { id: String(user._id), role: String(user.role ?? "user") };
}

// ── Factory McpServer ─────────────────────────────────────────────────────────

function buildMcpServer(user: { id: string; role: string }): McpServer {
    const server = new McpServer({ name: "cours-iut", version: "1.0.0" });
    const isAdmin = user.role === "admin";

    // ── get_migration_status ──────────────────────────────────────────────────
    server.tool(
        "get_migration_status",
        "Retourne l'état de migration (file/db) de tous les cours, TPs et examens.",
        {},
        async () => {
            const db = await connectToDB();
            const modules = await db.collection("modules").find({}, {
                projection: { path: 1, sections: 1 },
            }).toArray();

            type StatusMap = Record<string, Record<string, Record<string, string>>>;
            const status: StatusMap = {};
            for (const mod of modules) {
                status[mod.path] = {};
                for (const section of (mod.sections ?? [])) {
                    status[mod.path][section.path] = {};
                    for (const content of (section.contents ?? [])) {
                        status[mod.path][section.path][content.type] = content.source ?? "file";
                    }
                }
            }
            return { content: [{ type: "text" as const, text: JSON.stringify(status, null, 2) }] };
        }
    );

    // ── list_block_types ──────────────────────────────────────────────────────
    server.tool(
        "list_block_types",
        "Retourne la liste des types de blocs disponibles dans le registre.",
        {},
        async () => {
            const defs = getAllBlockDefinitions().map(({ type, label, defaultProps, fields }) => ({
                type, label, defaultProps, fields,
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify({ types: defs }, null, 2) }] };
        }
    );

    // ── get_content ───────────────────────────────────────────────────────────
    server.tool(
        "get_content",
        "Retourne le tableau de blocs d'un contenu (cours, TP ou examen).",
        {
            module:  z.string().describe("Slug du module, ex: javascript"),
            section: z.string().describe("Slug de la section, ex: 1-le-dom"),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
        },
        async ({ module, section, type }) => {
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug:  module,
                sectionSlug: section,
                contentType: type,
            });
            const result = doc
                ? { contentId: doc._id?.toString(), blocks: doc.blocks, version: doc.version, source: "db" }
                : { blocks: [], source: "file" };
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── save_content ──────────────────────────────────────────────────────────
    server.tool(
        "save_content",
        "Remplace entièrement les blocs d'un contenu (upsert). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            blocks:  z.array(z.object({
                id:      z.string(),
                type:    z.string(),
                props:   z.record(z.string(), z.unknown()),
                colSpan: z.enum(["full", "half"]).optional(),
            })),
        },
        async ({ module, section, type, blocks }) => {
            if (!isAdmin) throw new Error("Forbidden");

            for (const block of blocks) {
                const def = getBlockDefinition(block.type);
                if (!def) throw new Error(`Type de bloc inconnu : ${block.type}`);
                const result = def.schema.safeParse(block.props);
                if (!result.success) {
                    throw new Error(`Bloc ${block.id} invalide : ${JSON.stringify(result.error.flatten())}`);
                }
            }

            const db = await connectToDB();
            const now = new Date();

            const existing = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });

            let contentId: string;
            if (existing) {
                await db.collection<CourseContent>("course_content").updateOne(
                    { _id: existing._id },
                    { $set: { blocks: blocks as Block[], updatedAt: now }, $inc: { version: 1 } }
                );
                contentId = existing._id!.toString();
            } else {
                const r = await db.collection<CourseContent>("course_content").insertOne({
                    moduleSlug: module, sectionSlug: section, contentType: type,
                    blocks: blocks as Block[], version: 1, createdAt: now, updatedAt: now,
                });
                contentId = r.insertedId.toString();
            }

            await db.collection("modules").updateOne(
                { path: module },
                {
                    $set: {
                        "sections.$[s].contents.$[c].source":    "db",
                        "sections.$[s].contents.$[c].contentId": contentId,
                    },
                },
                { arrayFilters: [{ "s.path": section }, { "c.type": type }] }
            );

            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });

            const updated = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `Sauvegardé. contentId=${contentId}, version=${updated?.version ?? 1}`,
                }],
            };
        }
    );

    // ── delete_content ────────────────────────────────────────────────────────
    server.tool(
        "delete_content",
        "Supprime un contenu de la DB et repasse son ref à source: 'file'. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
        },
        async ({ module, section, type }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            await db.collection<CourseContent>("course_content").deleteOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            await db.collection("modules").updateOne(
                { path: module },
                {
                    $set:   { "sections.$[s].contents.$[c].source": "file" },
                    $unset: { "sections.$[s].contents.$[c].contentId": "" },
                },
                { arrayFilters: [{ "s.path": section }, { "c.type": type }] }
            );
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return { content: [{ type: "text" as const, text: "Supprimé." }] };
        }
    );

    // ── insert_block ──────────────────────────────────────────────────────────
    server.tool(
        "insert_block",
        "Insère un bloc. Si ni position ni afterBlockId → append. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            block: z.object({
                id:      z.string().describe("UUID v4 unique"),
                type:    z.string(),
                props:   z.record(z.string(), z.unknown()),
                colSpan: z.enum(["full", "half"]).optional(),
            }),
            position:     z.number().int().min(0).optional().describe("Index 0-based où insérer"),
            afterBlockId: z.string().optional().describe("Insérer après ce blockId"),
        },
        async ({ module, section, type, block, position, afterBlockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            const blocks: RawBlock[] = (doc?.blocks ?? []) as RawBlock[];

            let insertAt: number;
            if (typeof position === "number") {
                insertAt = Math.min(position, blocks.length);
            } else if (afterBlockId) {
                const idx = blocks.findIndex(b => b.id === afterBlockId);
                insertAt = idx === -1 ? blocks.length : idx + 1;
            } else {
                insertAt = blocks.length;
            }
            blocks.splice(insertAt, 0, block as RawBlock);

            const upsertResult = await db.collection<CourseContent>("course_content").updateOne(
                { moduleSlug: module, sectionSlug: section, contentType: type },
                { $set: { blocks: blocks as Block[], updatedAt: new Date() }, $inc: { version: 1 } },
                { upsert: true }
            );

            if (upsertResult.upsertedId) {
                const contentId = upsertResult.upsertedId.toString();
                await db.collection("modules").updateOne(
                    { path: module },
                    {
                        $set: {
                            "sections.$[s].contents.$[c].source":    "db",
                            "sections.$[s].contents.$[c].contentId": contentId,
                        },
                    },
                    { arrayFilters: [{ "s.path": section }, { "c.type": type }] }
                );
            }

            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return {
                content: [{
                    type: "text" as const,
                    text: `Bloc ${block.id} inséré à l'index ${insertAt}.`,
                }],
            };
        }
    );

    // ── edit_block ────────────────────────────────────────────────────────────
    server.tool(
        "edit_block",
        "Remplace entièrement les props d'un bloc (replace, pas merge). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            blockId: z.string().describe("ID du bloc à modifier"),
            props:   z.record(z.string(), z.unknown()).describe("Nouvelles props complètes"),
            colSpan: z.enum(["full", "half"]).optional(),
        },
        async ({ module, section, type, blockId, props, colSpan }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            const blocks: RawBlock[] = (doc?.blocks ?? []) as RawBlock[];
            const idx = blocks.findIndex(b => b.id === blockId);
            if (idx === -1) throw new Error(`Bloc ${blockId} introuvable`);

            blocks[idx] = { ...blocks[idx], props, ...(colSpan ? { colSpan } : {}) };

            await db.collection<CourseContent>("course_content").updateOne(
                { moduleSlug: module, sectionSlug: section, contentType: type },
                { $set: { blocks: blocks as Block[], updatedAt: new Date() }, $inc: { version: 1 } }
            );
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} mis à jour.` }] };
        }
    );

    // ── delete_block ──────────────────────────────────────────────────────────
    server.tool(
        "delete_block",
        "Supprime un bloc par son ID. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            blockId: z.string().describe("ID du bloc à supprimer"),
        },
        async ({ module, section, type, blockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            const blocks = ((doc?.blocks ?? []) as RawBlock[]).filter(b => b.id !== blockId);

            await db.collection<CourseContent>("course_content").updateOne(
                { moduleSlug: module, sectionSlug: section, contentType: type },
                { $set: { blocks: blocks as Block[], updatedAt: new Date() }, $inc: { version: 1 } }
            );
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} supprimé.` }] };
        }
    );

    return server;
}

// ── Handler partagé ───────────────────────────────────────────────────────────

async function handleMcp(req: Request): Promise<Response> {
    const user = await validateToken(req);
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });
    const server = buildMcpServer(user);
    await server.connect(transport);
    return transport.handleRequest(req);
}

export const GET    = (req: Request) => handleMcp(req);
export const POST   = (req: Request) => handleMcp(req);
export const DELETE = (req: Request) => handleMcp(req);
