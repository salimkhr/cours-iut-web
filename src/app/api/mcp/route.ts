import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb";
import { validateScalekitToken } from "@/lib/scalekit";
import { getPublicOrigin } from "@/lib/publicOrigin";
import { blockDefs, getBlockDef, createBlockInstance } from "@/lib/blockDefs";
import { validateBlockTree } from "@/lib/validateBlockTree";
import {
    findBlock,
    insertBlock,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
} from "@/lib/blockTreeUtils";
import { moduleFormSchema, universeSchema } from "@/lib/schemas/module.schema";
import { addVerdictSchema, promoteExemplarSchema, VERDICT_FORMATS, EXEMPLAR_FORMATS, EXEMPLAR_LEVELS } from "@/lib/schemas/pedagogy.schema";
import type { PedagogyVerdict, PedagogyExemplar } from "@/types/Pedagogy";
import { ObjectId } from "bson";
import { assignModuleColor } from "@/lib/assignModuleColor";
import { isValidIcon } from "@/lib/iconMap";
import { sectionApiSchema, briefSchema, curriculumSchema } from "@/lib/schemas/section.schema";
import type { SectionBrief, SectionCurriculum } from "@/lib/schemas/section.schema";
import type { Block, CourseContent, ContentRef } from "@/types/CourseContent";
import {
    normalizeForSearch,
    searchBlocks,
    blocksToMarkdown,
    type SearchMatch,
} from "@/lib/blockTextUtils";
import Module, { type ModuleUniverse } from "@/types/Module";
import Section from "@/types/Section";
import { SKILL_MANIFEST, SKILL_DOCUMENTS } from "@/lib/skills/pedagogy";
export const runtime = "nodejs";

const SERVER_INSTRUCTIONS = `Ce serveur gère le référentiel pédagogique multi-supports du BUT Informatique.

Deux skills pédagogiques sont disponibles :
- "module-design" : concevoir un module (sections, univers fil rouge, découpage en séances).
- "content-writer" : rédiger les supports d'une section (cours, slides, TP, examen).

Chargement : get_pedagogical_skill_manifest() puis get_pedagogical_skill_document(id)
avec id = "module-design" ou "content-writer" selon la tâche.

Avant toute production, le workflow du skill impose de lire list_verdicts (critiques
utilisateur passées) et list_exemplars (étalons annotés). Les outils d'écriture ne
visent QUE le serveur staging ; la copie vers la production exige une confirmation
explicite de l'utilisateur.`;

type ContentType = CourseContent["contentType"];
const CONTENT_TYPE = z.enum(["cours", "TP", "examen", "slide"]);

interface ContentKey {
    moduleSlug: string;
    sectionSlug: string;
    contentType: ContentType;
}

interface ModuleDoc {
    path: string;
    title?: string;
    isExtra?: boolean;
    sessionDurationMinutes?: number;
    universe?: ModuleUniverse;
    sections?: Array<{
        path: string;
        title?: string;
        totalDuration?: number;
        courseIntroMinutes?: number;
        brief?: SectionBrief;
        curriculum?: SectionCurriculum;
        contents?: Array<{ type: string; source?: string }>;
    }>;
}

// ── Validation du Bearer token (Scalekit) ─────────────────────────────────────

/** Emails admin autorisés à écrire (phase 1). Allowlist en env, séparée par virgules. */
function adminEmails(): string[] {
    return (process.env.MCP_ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

async function validateToken(req: Request): Promise<{ id: string; role: string } | null> {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const identity = await validateScalekitToken(authHeader.slice("Bearer ".length));
    if (!identity?.email) return null;

    // Pas d'accès aux collections d'auth (fragiles au schéma better-auth) :
    // le rôle est dérivé de l'allowlist MCP_ADMIN_EMAILS. La résolution « réelle »
    // (claim OIDC ou auth.api) sera traitée en phase 2 avec l'accès étudiant.
    const role = adminEmails().includes(identity.email.toLowerCase()) ? "admin" : "user";
    return { id: identity.sub, role };
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

/** Convertit un titre en slug kebab-case (a-z, 0-9, tirets). */
function slugify(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")   // retire les accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ── Factory McpServer ─────────────────────────────────────────────────────────

function buildMcpServer(user: { id: string; role: string }): McpServer {
    const server = new McpServer(
        { name: "cours-iut", version: "1.0.0" },
        { instructions: SERVER_INSTRUCTIONS }
    );
    const isAdmin = user.role === "admin";

    const iconNameSchema = z.string()
        .refine((v) => isValidIcon(v), {
            message: "Icône inconnue. Consultez https://lucide.dev/icons/ pour la liste complète.",
        })
        .describe("Nom d'une icône Lucide (PascalCase, ex: BookOpen, Code, Server) — voir https://lucide.dev/icons/");

    // ── get_migration_status ──────────────────────────────────────────────────
    server.tool(
        "get_migration_status",
        "Retourne l'état de migration (file/db) de tous les cours, TPs, examens et slides.",
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
            const defs = blockDefs.map(({ type, label, description, defaultProps, fields, container }) => ({
                type, label, description, defaultProps, fields,
                isContainer: !!container,
                allowedChildren: container?.allowedChildren,
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify({ types: defs }, null, 2) }] };
        }
    );

    // ── create_module ──────────────────────────────────────────────────────────
    server.tool(
        "create_module",
        "Crée un nouveau module (structure pédagogique seule, isExtra:true). Réservé aux admins.",
        {
            title:                   z.string().describe("Titre affiché du module, ex: Rust"),
            iconName:                iconNameSchema.optional(),
            path:                    z.string().optional().describe("Slug du module (défaut: dérivé du titre)"),
            description:             z.string().optional(),
            sessionDurationMinutes:  z.number().int().min(1).optional()
                .describe("Durée d'une séance en minutes (ex: 150 pour 2h30). Absent pour les modules bonus."),
            universe: universeSchema.optional()
                .describe("Univers thématique du module (fil rouge cumulatif) : name (ex: Netflex), description (domaine + données types)"),
        },
        async ({ title, iconName, path, description, sessionDurationMinutes, universe }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const slug = path ? slugify(path) : slugify(title);
            if (!slug) throw new Error("Le titre ne peut pas produire un slug valide.");

            if (await db.collection<Module>("modules").findOne({ path: slug })) {
                throw new Error(`Un module avec le path "${slug}" existe déjà.`);
            }

            const parsed = moduleFormSchema.safeParse({
                title,
                path: slug,
                iconName: iconName ?? "Code",
                description: description ?? "",
                associatedSae: [],
                coefficients: [],
                instructors: [],
                isExtra: true,
                sessionDurationMinutes,
                universe,
            });
            if (!parsed.success) {
                throw new Error(`Module invalide : ${JSON.stringify(parsed.error.flatten())}`);
            }

            const colors = assignModuleColor(
                await db.collection<Module>("modules")
                    .find({}, {projection: {colorLight: 1}}).toArray(),
            );

            const r = await db.collection<Omit<Module, "_id">>("modules").insertOne({
                ...parsed.data,
                ...colors,
                sections: [],
                isVisible: false,
                updatedAt: new Date().toISOString(),
            });

            return {
                content: [{
                    type: "text" as const,
                    text: `Module créé. moduleId=${r.insertedId.toString()}, path=${slug}`,
                }],
            };
        }
    );

    // ── edit_module ────────────────────────────────────────────────────────────
    server.tool(
        "edit_module",
        "Édite les métadonnées d'un module : titre, description, icône, couleurs thème (colorLight/colorDark en hex), sessionDurationMinutes, universe, projectIcon. Réservé aux admins.",
        {
            module:                  z.string().describe("Slug du module à éditer"),
            title:                   z.string().optional().describe("Nouveau titre affiché"),
            iconName:                iconNameSchema.optional(),
            description:             z.string().optional().describe("Description ou objectifs globaux du module"),
            colorLight:              z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
                .describe("Couleur claire du thème en hex (#rrggbb)"),
            colorDark:               z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
                .describe("Couleur sombre du thème en hex (#rrggbb)"),
            sessionDurationMinutes:  z.number().int().min(1).optional()
                .describe("Durée d'une séance en minutes (ex: 150 pour 2h30)"),
            universe: universeSchema.optional()
                .describe("Univers thématique du module (fil rouge cumulatif) : name (ex: Netflex), description (domaine + données types)"),
            projectIcon: iconNameSchema.optional()
                .describe("Icône Lucide du projet commun inter-sections (ex: 'Clapperboard' pour Netflex, 'BookOpen' pour la médiathèque). Affiché dans le badge des sections marquées projectRef."),
            isVisible: z.boolean().optional()
                .describe("Visibilité du module pour les étudiants. false = masqué (brouillon), true = visible."),
        },
        async ({ module, title, iconName, description, colorLight, colorDark, sessionDurationMinutes, universe, projectIcon, isVisible }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();

            const mod = await db.collection<Module>("modules").findOne({ path: module });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);

            const set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
            if (title !== undefined) set.title = title;
            if (iconName !== undefined) set.iconName = iconName;
            if (description !== undefined) set.description = description;
            if (colorLight !== undefined) set.colorLight = colorLight;
            if (colorDark !== undefined) set.colorDark = colorDark;
            if (sessionDurationMinutes !== undefined) set.sessionDurationMinutes = sessionDurationMinutes;
            if (universe !== undefined) set.universe = universe;
            if (projectIcon !== undefined) set.projectIcon = projectIcon;
            if (isVisible !== undefined) set.isVisible = isVisible;

            const updatedFields = Object.keys(set).filter((k) => k !== "updatedAt");
            if (updatedFields.length === 0) {
                return { content: [{ type: "text" as const, text: "Rien à modifier." }] };
            }

            await db.collection<Module>("modules").updateOne({ path: module }, { $set: set });
            revalidateTag(`modules`, { expire: 0 });

            return {
                content: [{
                    type: "text" as const,
                    text: `Module "${module}" mis à jour : ${updatedFields.join(", ")}.`,
                }],
            };
        }
    );

    // ── create_section ─────────────────────────────────────────────────────────
    server.tool(
        "create_section",
        "Ajoute une section à un module + crée le squelette vide (course_content) de chaque type de contenu. Réservé aux admins.",
        {
            module:        z.string().describe("Slug du module"),
            title:         z.string().describe("Titre de la section"),
            description:   z.string().optional().describe("Description courte de la section (affichée aux étudiants)"),
            contentTypes:  z.array(CONTENT_TYPE).min(1).describe("Types de contenu : cours | TP | examen | slide"),
            order:         z.number().int().min(1).optional().describe("Position (défaut: max+1)"),
            path:          z.string().optional().describe("Slug de section (défaut: dérivé du titre)"),
            objectives:    z.array(z.string()).optional(),
            totalDuration: z.number().int().min(1).optional().describe("Nombre de séances (défaut: 1)"),
            tags:          z.array(z.string()).optional(),
            courseIntroMinutes: z.number().int().min(0).optional()
                .describe("Minutes de cours/slides en ouverture de la 1re séance (ex: 30). Le budget TP = totalDuration × sessionDurationMinutes − courseIntroMinutes."),
            brief: briefSchema.optional()
                .describe("Cahier des charges de la section : objectives (ce que l'étudiant saura faire), notions (à couvrir), filRougeStep (ce que le TP ajoute au projet fil rouge), notes libres."),
        },
        async ({ module, title, description, contentTypes, order, path, objectives, totalDuration, tags, courseIntroMinutes, brief }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();

            const mod = await db.collection<Module>("modules")
                .findOne({ path: module });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);

            const sectionPath = path ? slugify(path) : slugify(title);
            if (!sectionPath) throw new Error("Le titre ne peut pas produire un slug de section valide.");
            const sections = mod.sections ?? [];
            if (sections.some((s) => s.path === sectionPath)) {
                throw new Error(`Une section "${sectionPath}" existe déjà dans ce module.`);
            }
            const nextOrder = order ?? (sections.reduce((m, s) => Math.max(m, s.order ?? 0), 0) + 1);

            // Valide la "forme brute" (contents = types) via le schéma admin existant.
            const rawCheck = sectionApiSchema.safeParse({
                title,
                ...(description !== undefined && { description }),
                path: sectionPath,
                order: nextOrder,
                totalDuration: totalDuration ?? 1,
                hasCorrection: false,
                isAvailable: false,
                correctionIsAvailable: false,
                examenIsLock: false,
                contents: contentTypes,
                objectives: objectives ?? [],
                tags: tags ?? [],
                ...(courseIntroMinutes !== undefined && { courseIntroMinutes }),
                ...(brief !== undefined && { brief }),
            });
            if (!rawCheck.success) {
                throw new Error(`Section invalide : ${JSON.stringify(rawCheck.error.flatten())}`);
            }

            // Crée un course_content vide par type, construit les ContentRef.
            const now = new Date();
            const contents: ContentRef[] = [];
            for (const type of contentTypes) {
                const r = await db.collection<CourseContent>("course_content").insertOne({
                    moduleSlug: module,
                    sectionSlug: sectionPath,
                    contentType: type,
                    blocks: [],
                    version: 1,
                    createdAt: now,
                    updatedAt: now,
                });
                contents.push({ type, source: "db", contentId: r.insertedId.toString() });
            }

            const section: Section = {
                title,
                ...(description !== undefined && { description }),
                path: sectionPath,
                order: nextOrder,
                contents,
                objectives: objectives ?? [],
                tags: tags ?? [],
                totalDuration: totalDuration ?? 1,
                hasCorrection: false,
                isAvailable: false,
                correctionIsAvailable: false,
                examenIsLock: false,
                ...(courseIntroMinutes !== undefined && { courseIntroMinutes }),
                ...(brief !== undefined && { brief }),
            };

            await db.collection<Module>("modules").updateOne(
                { path: module },
                { $push: { sections: section } }
            );
            for (const type of contentTypes) {
                revalidateTag(`content:${module}:${sectionPath}:${type}`, { expire: 0 });
            }

            return {
                content: [{
                    type: "text" as const,
                    text: `Section "${sectionPath}" créée (order ${nextOrder}) avec ${contentTypes.join(", ")}.`,
                }],
            };
        }
    );

    // ── edit_section ───────────────────────────────────────────────────────────
    server.tool(
        "edit_section",
        "Édite les métadonnées d'une section (rename, nb séances, courseIntroMinutes, brief, curriculum, ordre, objectifs, flags). addContentTypes est ADDITIF (crée le squelette des types manquants) ; le retrait passe par delete_content. Réservé aux admins.",
        {
            module:                z.string(),
            sectionPath:           z.string().describe("Slug de la section à éditer"),
            title:                 z.string().optional(),
            description:           z.string().optional().describe("Description courte de la section (affichée aux étudiants)"),
            newPath:               z.string().optional().describe("Nouveau slug (cascade sur course_content)"),
            order:                 z.number().int().min(1).optional(),
            objectives:            z.array(z.string()).optional(),
            totalDuration:         z.number().int().min(1).optional(),
            tags:                  z.array(z.string()).optional(),
            isAvailable:           z.boolean().optional(),
            hasCorrection:         z.boolean().optional(),
            correctionIsAvailable: z.boolean().optional(),
            examenIsLock:          z.boolean().optional(),
            addContentTypes:       z.array(CONTENT_TYPE).optional().describe("Types à AJOUTER (additif)"),
            courseIntroMinutes:    z.number().int().min(0).optional(),
            brief:                 briefSchema.optional(),
            curriculum:            curriculumSchema.optional()
                .describe("Notions effectivement enseignées + APIs vues. Mis à jour par le skill content-writer après rédaction."),
        },
        async (args) => {
            if (!isAdmin) throw new Error("Forbidden");
            const { module, sectionPath, newPath, addContentTypes } = args;
            const db = await connectToDB();

            const mod = await db.collection<Module>("modules")
                .findOne({ path: module });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);
            const sections = mod.sections ?? [];
            const idx = sections.findIndex((s) => s.path === sectionPath);
            if (idx === -1) throw new Error(`Section "${sectionPath}" introuvable.`);
            const current = sections[idx];

            const set: Record<string, unknown> = {};
            const meta: Array<[string, unknown]> = [
                ["title", args.title], ["description", args.description], ["order", args.order], ["objectives", args.objectives],
                ["totalDuration", args.totalDuration], ["tags", args.tags],
                ["isAvailable", args.isAvailable], ["hasCorrection", args.hasCorrection],
                ["correctionIsAvailable", args.correctionIsAvailable], ["examenIsLock", args.examenIsLock],
                ["courseIntroMinutes", args.courseIntroMinutes], ["brief", args.brief], ["curriculum", args.curriculum],
            ];
            for (const [field, value] of meta) {
                if (value !== undefined) set[`sections.${idx}.${field}`] = value;
            }

            // Slug effectif des nouveaux course_content (tient compte d'un rename simultané).
            const effectivePath = newPath ? slugify(newPath) : sectionPath;
            if (newPath && !effectivePath) throw new Error("Le nouveau path ne peut pas produire un slug valide.");

            // addContentTypes : additif seul.
            const existingTypes = new Set((current.contents ?? []).map((c) => c.type));
            if (addContentTypes?.length) {
                const now = new Date();
                const refs: ContentRef[] = [...(current.contents ?? [])];
                for (const type of addContentTypes) {
                    if (existingTypes.has(type)) continue;
                    const r = await db.collection<CourseContent>("course_content").insertOne({
                        moduleSlug: module, sectionSlug: effectivePath, contentType: type,
                        blocks: [], version: 1, createdAt: now, updatedAt: now,
                    });
                    refs.push({ type, source: "db", contentId: r.insertedId.toString() });
                }
                set[`sections.${idx}.contents`] = refs;
            }

            // Rename de path : cascade sur les course_content existants.
            if (newPath && effectivePath !== sectionPath) {
                if (sections.some((s) => s.path === effectivePath)) {
                    throw new Error(`Le path "${effectivePath}" est déjà pris dans ce module.`);
                }
                set[`sections.${idx}.path`] = effectivePath;
                await db.collection("course_content").updateMany(
                    { moduleSlug: module, sectionSlug: sectionPath },
                    { $set: { sectionSlug: effectivePath } }
                );
            }

            if (Object.keys(set).length === 0) {
                return { content: [{ type: "text" as const, text: "Rien à modifier." }] };
            }
            await db.collection<Module>("modules").updateOne({ path: module }, { $set: set });

            // Invalide l'ancien et le nouveau slug pour tous les types concernés.
            const types = new Set<string>([...existingTypes, ...(addContentTypes ?? [])]);
            for (const t of types) {
                revalidateTag(`content:${module}:${sectionPath}:${t}`, { expire: 0 });
                if (effectivePath !== sectionPath) {
                    revalidateTag(`content:${module}:${effectivePath}:${t}`, { expire: 0 });
                }
            }

            return {
                content: [{
                    type: "text" as const,
                    text: `Section "${sectionPath}" mise à jour${effectivePath !== sectionPath ? ` (renommée en "${effectivePath}")` : ""}.`,
                }],
            };
        }
    );

    // ── list_modules ──────────────────────────────────────────────────────────
    server.tool(
        "list_modules",
        "Retourne la liste de tous les modules disponibles.",
        {},
        async () => {
            const db = await connectToDB();
            const modules = await db.collection<{ path: string; title?: string; isExtra?: boolean; sessionDurationMinutes?: number; universe?: ModuleUniverse }>("modules")
                .find({}, { projection: { path: 1, title: 1, isExtra: 1, sessionDurationMinutes: 1, universe: 1, _id: 0 } })
                .toArray();
            const result = modules.map((m) => ({
                slug: m.path,
                title: m.title ?? m.path,
                isExtra: m.isExtra ?? false,
                ...(m.sessionDurationMinutes !== undefined && { sessionDurationMinutes: m.sessionDurationMinutes }),
                ...(m.universe !== undefined && { universe: m.universe }),
            }));
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
                // totalDuration: fallback à 1 pour la compatibilité avec les anciennes sections
                // sans durée renseignée. La plupart des sections ont des valeurs explicites en DB.
                totalDuration: s.totalDuration ?? 1,
                ...(s.courseIntroMinutes !== undefined && { courseIntroMinutes: s.courseIntroMinutes }),
                ...(s.brief !== undefined && { brief: s.brief }),
                ...(s.curriculum !== undefined && { curriculum: s.curriculum }),
                contents: Object.fromEntries((s.contents ?? []).map((c) => [c.type, c.source ?? "file"])),
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify(sections, null, 2) }] };
        }
    );

    // ── get_content ───────────────────────────────────────────────────────────
    server.tool(
        "get_content",
        "Retourne l'arbre complet de blocs d'un contenu (cours, TP, examen ou slide).",
        {
            module:  z.string().describe("Slug du module, ex: javascript"),
            section: z.string().describe("Slug de la section, ex: 1-le-dom"),
            type:    CONTENT_TYPE.describe("Type de contenu : cours | TP | examen | slide"),
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
        "Supprime un contenu de la DB. Par défaut repasse son ref à source: 'file' ; avec removeRef: true, retire complètement le type de contenu de la section. Réservé aux admins.",
        {
            module:    z.string(),
            section:   z.string(),
            type:      CONTENT_TYPE,
            removeRef: z.boolean().optional()
                .describe("true = retire le type de contenu de la section (au lieu de repasser à source: 'file')"),
        },
        async ({ module, section, type, removeRef }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            await db.collection<CourseContent>("course_content").deleteOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            if (removeRef) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (db.collection("modules") as any).updateOne(
                    { path: module },
                    { $pull: { "sections.$[s].contents": { type } } },
                    { arrayFilters: [{ "s.path": section }] }
                );
            } else {
                await db.collection("modules").updateOne(
                    { path: module },
                    {
                        $set:   { "sections.$[s].contents.$[c].source": "file" },
                        $unset: { "sections.$[s].contents.$[c].contentId": "" },
                    },
                    { arrayFilters: [{ "s.path": section }, { "c.type": type }] }
                );
            }
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return { content: [{ type: "text" as const, text: removeRef ? "Contenu supprimé et type retiré de la section." : "Supprimé." }] };
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
            const def = getBlockDef(blockType);
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

    // ── search_content ────────────────────────────────────────────────────────
    server.tool(
        "search_content",
        [
            "Recherche plein texte dans tous les contenus pédagogiques en base de données.",
            "Retourne les blocs correspondants avec leur localisation (module/section/type),",
            "l'ID du bloc, un extrait de contexte, et le titre de la section parente.",
            "Utilise search_content pour TROUVER où une notion est abordée,",
            "puis export_content_compact pour LIRE en détail les sections identifiées.",
            "Note : le contenu dont la source est encore 'file' (non migré en DB) n'est pas indexé.",
        ].join(" "),
        {
            query: z.string().min(1).describe(
                "Terme ou expression à rechercher (insensible à la casse et aux accents)"
            ),
            module: z.string().optional().describe(
                "Filtrer sur un module spécifique (slug, ex: javascript)"
            ),
            type: CONTENT_TYPE.optional().describe(
                "Filtrer par type de contenu : cours | TP | examen | slide"
            ),
            limit: z.number().int().min(1).max(100).optional().describe(
                "Nombre maximum de résultats (défaut: 20)"
            ),
        },
        async ({ query, module: moduleFilter, type: typeFilter, limit = 20 }) => {
            const db = await connectToDB();

            const filter: Record<string, unknown> = {};
            if (moduleFilter) filter.moduleSlug = moduleFilter;
            if (typeFilter) filter.contentType = typeFilter;

            const docs = await db
                .collection<CourseContent>("course_content")
                .find(filter, {
                    projection: { moduleSlug: 1, sectionSlug: 1, contentType: 1, blocks: 1 },
                })
                .toArray();

            const normalizedQuery = normalizeForSearch(query);
            const matchList: SearchMatch[] = [];

            for (const doc of docs) {
                if (matchList.length >= limit) break;
                searchBlocks(
                    doc.blocks,
                    doc.moduleSlug,
                    doc.sectionSlug,
                    doc.contentType,
                    normalizedQuery,
                    limit,
                    matchList
                );
            }

            const note =
                docs.length === 0
                    ? "Aucun contenu en base trouvé. Le contenu source 'file' n'est pas indexé."
                    : `${matchList.length} résultat(s) trouvé(s) dans ${docs.length} contenu(s) en DB (source 'file' exclu).`;

            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(
                            { query, total: matchList.length, note, results: matchList },
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );

    // ── export_content_compact ────────────────────────────────────────────────
    server.tool(
        "export_content_compact",
        [
            "Exporte un contenu pédagogique (section, module entier, ou tous types d'une section)",
            "en Markdown compact.",
            "Chaque bloc est annoté de son ID en commentaire HTML (<!--blockId-->)",
            "pour rester adressable par les outils d'édition (insert_block, edit_block, reorder_blocks).",
            "Beaucoup plus économe en tokens que get_content.",
            "Utilise search_content pour identifier d'abord les sections pertinentes,",
            "puis export_content_compact pour en lire le contenu complet.",
            "Note : seul le contenu source 'db' est disponible ; le contenu 'file' non migré est exclu.",
        ].join(" "),
        {
            module: z.string().describe("Slug du module, ex: javascript"),
            section: z.string().optional().describe(
                "Slug de la section. Omis = toutes les sections du module"
            ),
            type: CONTENT_TYPE.optional().describe(
                "Type de contenu. Omis = tous les types disponibles de la section"
            ),
        },
        async ({ module: moduleSlug, section: sectionSlug, type: contentType }) => {
            const db = await connectToDB();

            const mod = await db
                .collection<ModuleDoc>("modules")
                .findOne({ path: moduleSlug }, { projection: { title: 1, sections: 1 } });
            if (!mod) throw new Error(`Module "${moduleSlug}" introuvable.`);

            const filter: Record<string, unknown> = { moduleSlug };
            if (sectionSlug) filter.sectionSlug = sectionSlug;
            if (contentType) filter.contentType = contentType;

            const docs = await db
                .collection<CourseContent>("course_content")
                .find(filter, {
                    projection: {
                        moduleSlug: 1,
                        sectionSlug: 1,
                        contentType: 1,
                        blocks: 1,
                        version: 1,
                        updatedAt: 1,
                    },
                })
                .sort({ sectionSlug: 1, contentType: 1 })
                .toArray();

            if (docs.length === 0) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: [
                                `Aucun contenu en base trouvé pour module="${moduleSlug}"`,
                                sectionSlug ? `, section="${sectionSlug}"` : "",
                                contentType ? `, type="${contentType}"` : "",
                                ".",
                                "\n\nNote : le contenu source 'file' (non migré) n'est pas disponible via cet outil.",
                            ].join(""),
                        },
                    ],
                };
            }

            const getSectionTitle = (slug: string): string => {
                const sec = (mod.sections ?? []).find((s) => s.path === slug);
                return sec?.title ?? slug;
            };

            const moduleTitle = mod.title ?? moduleSlug;
            const parts: string[] = [];

            for (const doc of docs) {
                const sectionTitle = getSectionTitle(doc.sectionSlug);
                const updatedAt = doc.updatedAt
                    ? new Date(doc.updatedAt).toISOString().slice(0, 10)
                    : "?";
                const header = [
                    `<!-- export: ${moduleTitle} / ${sectionTitle} / ${doc.contentType} | v${doc.version} | ${updatedAt} -->`,
                    `# ${moduleTitle} / ${sectionTitle} / ${doc.contentType}`,
                ].join("\n");

                const markdown = blocksToMarkdown(doc.blocks, true);
                parts.push(`${header}\n\n${markdown}`);
            }

            return {
                content: [
                    {
                        type: "text" as const,
                        text: parts.join("\n\n---\n\n"),
                    },
                ],
            };
        }
    );

    // ── add_verdict ───────────────────────────────────────────────────────────
    server.tool(
        "add_verdict",
        "Enregistre un verdict de calibrage (critique utilisateur verbatim sur un contenu généré). À appeler quand l'utilisateur exprime une déception sur une génération. Réservé aux admins.",
        {
            format: z.enum(VERDICT_FORMATS).describe("Format concerné : cours | TP | examen | slide | module-design"),
            verdict: z.string().min(1).describe("La critique, verbatim (citer l'utilisateur, ne pas reformuler)"),
            moduleSlug: z.string().optional().describe("Module d'où vient le verdict (contexte)"),
        },
        async (args) => {
            if (!isAdmin) throw new Error("Forbidden");
            const parsed = addVerdictSchema.safeParse(args);
            if (!parsed.success) throw new Error(`Verdict invalide : ${JSON.stringify(parsed.error.flatten())}`);

            const db = await connectToDB();
            const r = await db.collection<Omit<PedagogyVerdict, "_id">>("pedagogy_verdicts").insertOne({
                date: new Date(),
                format: parsed.data.format,
                ...(parsed.data.moduleSlug && { moduleSlug: parsed.data.moduleSlug }),
                verdict: parsed.data.verdict,
                status: "active",
            });
            return { content: [{ type: "text" as const, text: `Verdict enregistré. verdictId=${r.insertedId.toString()}` }] };
        }
    );

    // ── list_verdicts ─────────────────────────────────────────────────────────
    server.tool(
        "list_verdicts",
        "Retourne les verdicts de calibrage ACTIFS (critiques utilisateur passées). À lire OBLIGATOIREMENT avant toute rédaction de contenu ou conception de module.",
        {
            format: z.enum(VERDICT_FORMATS).optional().describe("Filtrer par format. Omis = tous"),
        },
        async ({ format }) => {
            const db = await connectToDB();
            const filter: Record<string, unknown> = { status: "active" };
            if (format) filter.format = format;
            const verdicts = await db.collection<PedagogyVerdict>("pedagogy_verdicts")
                .find(filter).sort({ date: 1 }).toArray();
            const result = verdicts.map((v) => ({
                id: v._id!.toString(),
                date: v.date instanceof Date ? v.date.toISOString().slice(0, 10) : v.date,
                format: v.format,
                ...(v.moduleSlug && { moduleSlug: v.moduleSlug }),
                verdict: v.verdict,
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── distill_verdicts ──────────────────────────────────────────────────────
    server.tool(
        "distill_verdicts",
        "Marque des verdicts comme distillés (promus en annotation d'exemplaire ou invariant du skill). Ils disparaissent de list_verdicts. À appeler après validation utilisateur de la distillation. Réservé aux admins.",
        {
            verdictIds: z.array(z.string().min(1)).min(1).describe("IDs des verdicts à distiller"),
        },
        async ({ verdictIds }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const ids = verdictIds.map((id) => {
                if (!ObjectId.isValid(id)) throw new Error(`ID invalide : ${id}`);
                return new ObjectId(id);
            });
            const r = await db.collection<PedagogyVerdict>("pedagogy_verdicts").updateMany(
                { _id: { $in: ids }, status: "active" },
                { $set: { status: "distilled" } }
            );
            return { content: [{ type: "text" as const, text: `${r.modifiedCount} verdict(s) distillé(s).` }] };
        }
    );

    // ── promote_exemplar ──────────────────────────────────────────────────────
    server.tool(
        "promote_exemplar",
        "Promeut un contenu validé en exemplaire de référence : copie FIGÉE des blocs + annotations « pourquoi c'est bon ». À appeler uniquement après un « c'est exactement ça » de l'utilisateur, annotations validées par lui. Réservé aux admins.",
        {
            module:      z.string().describe("Slug du module"),
            section:     z.string().describe("Slug de la section"),
            type:        z.enum(EXEMPLAR_FORMATS).describe("Type de contenu : cours | TP | examen | slide"),
            level:       z.enum(EXEMPLAR_LEVELS).describe("Niveau des étudiants visés : debutant | intermediaire | avance"),
            annotations: z.array(z.string()).min(1).describe("Notes « pourquoi c'est bon », validées par l'utilisateur"),
        },
        async (args) => {
            if (!isAdmin) throw new Error("Forbidden");
            const parsed = promoteExemplarSchema.safeParse(args);
            if (!parsed.success) throw new Error(`Promotion invalide : ${JSON.stringify(parsed.error.flatten())}`);
            const { module, section, type, level, annotations } = parsed.data;

            const key: ContentKey = { moduleSlug: module, sectionSlug: section, contentType: type };
            const blocks = await loadBlocks(key);

            if (blocks.length === 0) {
                throw new Error(`Aucun bloc en DB pour ${module}/${section}/${type} — rien à promouvoir.`);
            }

            const db = await connectToDB();
            const r = await db.collection<Omit<PedagogyExemplar, "_id">>("pedagogy_exemplars").insertOne({
                date: new Date(),
                format: type,
                moduleSlug: module,
                sectionSlug: section,
                level,
                snapshot: blocks,
                annotations,
            });
            return { content: [{ type: "text" as const, text: `Exemplaire promu (snapshot figé de ${blocks.length} blocs racine). exemplarId=${r.insertedId.toString()}` }] };
        }
    );

    // ── list_exemplars ────────────────────────────────────────────────────────
    server.tool(
        "list_exemplars",
        "Retourne les exemplaires de référence (étalons annotés). withSnapshot=false (défaut) liste les métadonnées + annotations ; withSnapshot=true inclut les blocs figés de l'exemplaire le plus pertinent. À lire avant toute rédaction : imiter l'exemplaire le plus proche (même format, niveau voisin).",
        {
            format:       z.enum(EXEMPLAR_FORMATS).optional().describe("Filtrer par type de contenu"),
            level:        z.enum(EXEMPLAR_LEVELS).optional().describe("Filtrer par niveau"),
            withSnapshot: z.boolean().optional().describe("Inclure les blocs figés (coûteux en tokens — ne l'activer que sur l'exemplaire choisi)"),
        },
        async ({ format, level, withSnapshot }) => {
            const db = await connectToDB();
            const filter: Record<string, unknown> = {};
            if (format) filter.format = format;
            if (level) filter.level = level;
            const exemplars = await db.collection<PedagogyExemplar>("pedagogy_exemplars")
                .find(filter, withSnapshot ? {} : { projection: { snapshot: 0 } })
                .sort({ date: -1 }).toArray();
            const result = exemplars.map((e) => ({
                id: e._id!.toString(),
                date: e.date instanceof Date ? e.date.toISOString().slice(0, 10) : e.date,
                format: e.format,
                moduleSlug: e.moduleSlug,
                sectionSlug: e.sectionSlug,
                level: e.level,
                annotations: e.annotations,
                ...(withSnapshot && { snapshot: e.snapshot }),
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── get_pedagogical_skill_manifest ────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_manifest",
        "Retourne le manifeste des skills pédagogiques (module-design, content-writer) : version, hash, liste des documents.",
        {},
        async () => ({
            content: [{ type: "text" as const, text: JSON.stringify(SKILL_MANIFEST, null, 2) }],
        })
    );

    // ── get_pedagogical_skill_document ────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_document",
        "Retourne un document de skill pédagogique. id = module-design (conception de module) | content-writer (rédaction cours/TP/slides/examen).",
        {
            id: z.string().describe("ID du document : module-design | content-writer"),
        },
        async ({ id }) => {
            const doc = SKILL_DOCUMENTS[id];
            if (!doc) {
                const available = Object.keys(SKILL_DOCUMENTS).join(", ");
                throw new Error(`Document "${id}" inconnu. Disponibles : ${available}`);
            }
            return { content: [{ type: "text" as const, text: doc.content }] };
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
