import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { revalidateTag } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/publicOrigin";
import { getAllBlockDefinitions, getBlockDefinition, createBlockInstance } from "@/lib/blockRegistry";
import { validateBlockTree } from "@/lib/validateBlockTree";
import {
    findBlock,
    insertBlock,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
} from "@/lib/blockTreeUtils";
import type { Block, CourseContent } from "@/types/CourseContent";

export const runtime = "nodejs";

type ContentType = CourseContent["contentType"];
const CONTENT_TYPE = z.enum(["cours", "TP", "examen"]);

interface ContentKey {
    moduleSlug: string;
    sectionSlug: string;
    contentType: ContentType;
}

interface ModuleDoc {
    path: string;
    title?: string;
    sections?: Array<{
        path: string;
        title?: string;
        contents?: Array<{ type: string; source?: string }>;
    }>;
}

// ── Validation du Bearer token ────────────────────────────────────────────────

async function validateToken(req: Request): Promise<{ id: string; role: string } | null> {
    // Log tous les headers pour diagnostiquer ce qui arrive
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((v, k) => { allHeaders[k] = v.startsWith("Bearer ") ? v.slice(0, 20) + "…" : v; });
    console.log("[MCP] method:", req.method, "headers:", JSON.stringify(allHeaders));

    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        console.error("[MCP] pas d'Authorization header Bearer");
        return null;
    }

    const origin = getPublicOrigin(req);
    const userinfoUrl = `${origin}/api/auth/oauth2/userinfo`;
    console.log("[MCP] validateToken → appel userinfo", userinfoUrl);

    try {
        const res = await auth.handler(
            new Request(userinfoUrl, {
                headers: new Headers({ Authorization: authHeader }),
            })
        );
        const bodyText = await res.text();
        console.log("[MCP] userinfo status:", res.status, "body:", bodyText.slice(0, 200));

        if (!res.ok) return null;

        const body = JSON.parse(bodyText) as { sub?: string };
        if (!body.sub) {
            console.error("[MCP] userinfo sans sub:", bodyText.slice(0, 200));
            return null;
        }

        const db = await connectToDB();
        const user = await db.collection("user").findOne({ _id: new ObjectId(body.sub) });
        console.log("[MCP] user trouvé:", !!user, "role:", user?.role ?? "(absent)");
        if (!user) return null;

        return { id: body.sub, role: String(user.role ?? "user") };
    } catch (err) {
        console.error("[MCP] validateToken exception:", err);
        return null;
    }
}

// ── Helpers Mongo partagés (lecture/écriture de l'arbre de blocs) ──────────────

async function loadBlocks(key: ContentKey): Promise<Block[]> {
    const db = await connectToDB();
    const doc = await db.collection<CourseContent>("course_content").findOne(
        key as Partial<CourseContent>,
        { projection: { blocks: 1 } }
    );
    return doc?.blocks ?? [];
}

async function saveBlocks(key: ContentKey, blocks: Block[]): Promise<{ contentId: string; version: number }> {
    const db = await connectToDB();
    const now = new Date();

    const existing = await db.collection<CourseContent>("course_content").findOne(key as Partial<CourseContent>);

    let contentId: string;
    let version: number;
    if (existing) {
        await db.collection<CourseContent>("course_content").updateOne(
            { _id: existing._id },
            { $set: { blocks, updatedAt: now }, $inc: { version: 1 } }
        );
        contentId = existing._id!.toString();
        version = (existing.version ?? 1) + 1;
    } else {
        const r = await db.collection<CourseContent>("course_content").insertOne({
            ...key, blocks, version: 1, createdAt: now, updatedAt: now,
        });
        contentId = r.insertedId.toString();
        version = 1;
    }

    await db.collection("modules").updateOne(
        { path: key.moduleSlug },
        {
            $set: {
                "sections.$[s].contents.$[c].source":    "db",
                "sections.$[s].contents.$[c].contentId": contentId,
            },
        },
        { arrayFilters: [{ "s.path": key.sectionSlug }, { "c.type": key.contentType }] }
    );

    revalidateTag(`content:${key.moduleSlug}:${key.sectionSlug}:${key.contentType}`, { expire: 0 });
    return { contentId, version };
}

/** Réordonne un tableau d'enfants selon `orderedIds`. Les IDs absents de
 *  `orderedIds` sont conservés en fin, dans leur ordre d'origine. */
function sortChildren(children: Block[], orderedIds: string[]): Block[] {
    const byId = new Map(children.map((c) => [c.id, c]));
    const reordered = orderedIds.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
    const remaining = children.filter((c) => !orderedIds.includes(c.id));
    return [...reordered, ...remaining];
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

    // ── list_modules ──────────────────────────────────────────────────────────
    server.tool(
        "list_modules",
        "Retourne la liste de tous les modules disponibles.",
        {},
        async () => {
            const db = await connectToDB();
            const modules = await db.collection<{ path: string; title?: string }>("modules")
                .find({}, { projection: { path: 1, title: 1, _id: 0 } })
                .toArray();
            const result = modules.map((m) => ({ slug: m.path, title: m.title ?? m.path }));
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── list_sections ─────────────────────────────────────────────────────────
    server.tool(
        "list_sections",
        "Retourne les sections d'un module, avec pour chaque type de contenu le statut file/db.",
        { module: z.string().describe("Slug du module, ex: javascript") },
        async ({ module }) => {
            const db = await connectToDB();
            const mod = await db.collection<ModuleDoc>("modules")
                .findOne({ path: module }, { projection: { sections: 1, _id: 0 } });
            if (!mod) {
                return { content: [{ type: "text" as const, text: `Module "${module}" introuvable.` }] };
            }
            const sections = (mod.sections ?? []).map((s) => ({
                slug: s.path,
                title: s.title ?? s.path,
                contents: Object.fromEntries((s.contents ?? []).map((c) => [c.type, c.source ?? "file"])),
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify(sections, null, 2) }] };
        }
    );

    // ── get_content ───────────────────────────────────────────────────────────
    server.tool(
        "get_content",
        "Retourne l'arbre complet de blocs d'un contenu (cours, TP ou examen).",
        {
            module:  z.string().describe("Slug du module, ex: javascript"),
            section: z.string().describe("Slug de la section, ex: 1-le-dom"),
            type:    CONTENT_TYPE.describe("Type de contenu : cours | TP | examen"),
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
        "Remplace entièrement l'arbre de blocs d'un contenu (upsert). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    CONTENT_TYPE,
            blocks:  z.array(z.unknown()).describe("Arbre complet de blocs (avec children pour les conteneurs)"),
        },
        async ({ module, section, type, blocks }) => {
            if (!isAdmin) throw new Error("Forbidden");

            const validation = validateBlockTree(blocks);
            if (!validation.valid) {
                throw new Error(`Blocs invalides : ${JSON.stringify(validation.errors)}`);
            }

            const key: ContentKey = { moduleSlug: module, sectionSlug: section, contentType: type };
            const { contentId, version } = await saveBlocks(key, blocks as Block[]);

            return {
                content: [{ type: "text" as const, text: `Sauvegardé. contentId=${contentId}, version=${version}` }],
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
            type:    CONTENT_TYPE,
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
        "Insère un nouveau bloc dans l'arbre. parentBlockId null = racine. afterBlockId null/absent = fin de la liste du parent. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    CONTENT_TYPE,
            blockType: z.string().describe("Type du bloc (ex: text, code, section, list, columns...)"),
            props: z.record(z.string(), z.unknown()).optional()
                .describe("Props (fusionnées avec les valeurs par défaut du type)"),
            parentBlockId: z.string().nullable().optional().describe("ID du bloc parent. null = racine"),
            afterBlockId:  z.string().nullable().optional().describe("Insérer après ce bloc. null/absent = à la fin"),
        },
        async ({ module, section, type, blockType, props, parentBlockId, afterBlockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const def = getBlockDefinition(blockType);
            if (!def) throw new Error(`Type de bloc inconnu : ${blockType}`);

            const key: ContentKey = { moduleSlug: module, sectionSlug: section, contentType: type };
            const blocks = await loadBlocks(key);

            const newBlock = createBlockInstance(def);
            if (props) newBlock.props = { ...newBlock.props, ...props };

            const parent = parentBlockId ? findBlock(blocks, parentBlockId) : undefined;
            if (parentBlockId && !parent) throw new Error(`Bloc parent ${parentBlockId} introuvable`);
            const siblings = parent ? (parent.children ?? []) : blocks;

            let index = siblings.length;
            if (afterBlockId) {
                const pos = siblings.findIndex((b) => b.id === afterBlockId);
                if (pos !== -1) index = pos + 1;
            }

            const updated = insertBlock(blocks, newBlock, parentBlockId ?? null, index);
            const validation = validateBlockTree(updated);
            if (!validation.valid) {
                throw new Error(`Insertion invalide : ${JSON.stringify(validation.errors)}`);
            }

            await saveBlocks(key, updated);
            return {
                content: [{
                    type: "text" as const,
                    text: `Bloc ${newBlock.id} (${blockType}) inséré à l'index ${index}.`,
                }],
            };
        }
    );

    // ── edit_block ────────────────────────────────────────────────────────────
    server.tool(
        "edit_block",
        "Remplace entièrement les props d'un bloc existant (replace, pas merge). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    CONTENT_TYPE,
            blockId: z.string().describe("ID du bloc à modifier"),
            props:   z.record(z.string(), z.unknown()).describe("Nouvelles props complètes"),
        },
        async ({ module, section, type, blockId, props }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const key: ContentKey = { moduleSlug: module, sectionSlug: section, contentType: type };
            const blocks = await loadBlocks(key);
            if (!findBlock(blocks, blockId)) throw new Error(`Bloc ${blockId} introuvable`);

            const updated = updateBlockProps(blocks, blockId, props);
            const validation = validateBlockTree(updated);
            if (!validation.valid) {
                throw new Error(`Modification invalide : ${JSON.stringify(validation.errors)}`);
            }

            await saveBlocks(key, updated);
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} mis à jour.` }] };
        }
    );

    // ── delete_block ──────────────────────────────────────────────────────────
    server.tool(
        "delete_block",
        "Supprime un bloc (et ses enfants) par son ID. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    CONTENT_TYPE,
            blockId: z.string().describe("ID du bloc à supprimer"),
        },
        async ({ module, section, type, blockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const key: ContentKey = { moduleSlug: module, sectionSlug: section, contentType: type };
            const blocks = await loadBlocks(key);
            if (!findBlock(blocks, blockId)) throw new Error(`Bloc ${blockId} introuvable`);

            const updated = removeBlock(blocks, blockId);
            await saveBlocks(key, updated);
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} supprimé.` }] };
        }
    );

    // ── reorder_blocks ────────────────────────────────────────────────────────
    server.tool(
        "reorder_blocks",
        "Réordonne les enfants directs d'un parent (ou de la racine si parentBlockId est null). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    CONTENT_TYPE,
            parentBlockId: z.string().nullable().describe("ID du bloc parent à réordonner. null = racine"),
            blockIds: z.array(z.string()).describe("IDs des blocs enfants dans le nouvel ordre"),
        },
        async ({ module, section, type, parentBlockId, blockIds }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const key: ContentKey = { moduleSlug: module, sectionSlug: section, contentType: type };
            const blocks = await loadBlocks(key);

            let updated: Block[];
            if (parentBlockId === null) {
                updated = sortChildren(blocks, blockIds);
            } else {
                const parent = findBlock(blocks, parentBlockId);
                if (!parent) throw new Error(`Bloc parent ${parentBlockId} introuvable`);
                updated = updateBlockChildren(blocks, parentBlockId, sortChildren(parent.children ?? [], blockIds));
            }

            await saveBlocks(key, updated);
            return { content: [{ type: "text" as const, text: "Blocs réordonnés." }] };
        }
    );

    return server;
}

// ── Handler partagé ───────────────────────────────────────────────────────────

async function handleMcp(req: Request): Promise<Response> {
    const user = await validateToken(req);
    if (!user) {
        const origin = getPublicOrigin(req);
        // RFC 9728 §5 : resource_metadata aide claude.ai à trouver l'auth server
        // sans avoir à construire l'URL depuis le path de la resource.
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
                "Content-Type": "application/json",
                "WWW-Authenticate": `Bearer realm="cours-iut", resource_metadata="${origin}/.well-known/oauth-protected-resource"`,
            },
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
