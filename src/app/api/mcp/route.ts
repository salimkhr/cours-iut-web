import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb";
import { validateScalekitToken } from "@/lib/scalekit";
import { getPublicOrigin } from "@/lib/publicOrigin";
import { blockDefs, getBlockDef, createBlockInstance } from "@/lib/blockDefs";
import { assertSectionAcceptsContent } from "@/lib/mcp/assertSectionAcceptsContent";
import { registerQuizTools } from "@/lib/mcp/quizTools";
import { registerReadTools, CONTENT_TYPE, boolOrString, asBool, type ModuleDoc } from "@/lib/mcp/readTools";
import { validateBlockTree } from "@/lib/validateBlockTree";
import {
    findBlock,
    insertBlock,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
    pruneEmptyLeafChildren,
} from "@/lib/blockTreeUtils";
import { moduleFormSchema, universeSchema, projectSpecSchema, exampleDomainSchema } from "@/lib/schemas/module.schema";
import { forceDraft } from "@/lib/pedagogy/mcpProjectSpec";
import { assertCanPushReference, assertCanWriteContent } from "@/lib/pedagogy/gates";
import { referenceProjectSlug, assertReferenceFiles } from "@/lib/pedagogy/projectReference";
import { addVerdictSchema, promoteExemplarSchema, VERDICT_FORMATS, EXEMPLAR_FORMATS, EXEMPLAR_LEVELS } from "@/lib/schemas/pedagogy.schema";
import type { PedagogyVerdict, PedagogyExemplar } from "@/types/Pedagogy";
import { ObjectId } from "bson";
import { assignModuleColor } from "@/lib/assignModuleColor";
import { getGitlabConfig, getPrivateProjectConfig, ensureGroup, ensureProject, ensurePrivateProject, commitFiles, listRepoFiles, readRepoFile } from "@/lib/gitlab";
import { isValidIcon } from "@/lib/iconMap";
import { sectionApiSchema, briefSchema, curriculumSchema } from "@/lib/schemas/section.schema";
import type { SectionBrief, SectionCurriculum } from "@/lib/schemas/section.schema";
import { MODULE_STEP_PROMPTS, buildModuleStepPromptMessage } from "@/lib/pedagogy/stepPrompts";
import type { Block, CourseContent, ContentRef } from "@/types/CourseContent";
import Module from "@/types/Module";
import Section from "@/types/Section";
import { RESOURCE_KINDS } from "@/lib/schemas/resource.schema";
import { RESOURCES_COLLECTION, addResource } from "@/lib/resources";
export const runtime = "nodejs";

const SERVER_INSTRUCTIONS = `Ce serveur gère le référentiel pédagogique multi-supports du BUT Informatique.

Deux skills pédagogiques sont disponibles :
- "module-design" : concevoir un module (sections, univers fil rouge, découpage en séances).
- "content-writer" : rédiger les supports d'une section (cours, slides, TP, examen).

Chargement : get_pedagogical_skill_manifest() puis get_pedagogical_skill_document(id)
avec id = "module-design" ou "content-writer" selon la tâche.

Veille : add_resource / list_resources gèrent les ressources de la section « À lire, à voir »
de l'accueil (article, vidéo, recherche, outil). Appeler list_resources avant d'ajouter.

Avant toute production, le workflow du skill impose de lire list_verdicts (critiques
utilisateur passées) et list_exemplars (étalons annotés). Les outils d'écriture ne
visent QUE le serveur staging ; la copie vers la production exige une confirmation
explicite de l'utilisateur.`;

type ContentType = CourseContent["contentType"];

// Les clients MCP dont le schéma d'outils est mis en cache (connecteurs claude.ai)
// transmettent les paramètres ajoutés depuis en chaîne : on tolère string → typé.
const intOrString = z.union([z.number().int().min(0), z.string().regex(/^\d+$/)]);

function asInt(v: number | string | undefined): number | undefined {
    return v === undefined ? undefined : typeof v === "string" ? parseInt(v, 10) : v;
}
function asBrief(v: SectionBrief | string | undefined): SectionBrief | undefined {
    return v === undefined ? undefined : typeof v === "string" ? briefSchema.parse(JSON.parse(v)) : v;
}
function asCurriculum(v: SectionCurriculum | string | undefined): SectionCurriculum | undefined {
    return v === undefined ? undefined : typeof v === "string" ? curriculumSchema.parse(JSON.parse(v)) : v;
}

interface ContentKey {
    moduleSlug: string;
    sectionSlug: string;
    contentType: ContentType;
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

async function saveBlocks(key: ContentKey, input: Block[]): Promise<{ contentId: string; version: number }> {
    // Même assainissement que la route admin : toute écriture retire les
    // `children: []` laissés par la migration sur des blocs non conteneurs.
    const blocks = pruneEmptyLeafChildren(input);
    const db = await connectToDB();
    const now = new Date();

    // Garde anti-orphelin : sans section déclarée dans `modules.sections[]`, le
    // document écrit ici serait invisible du front comme de `list_sections`, et
    // ferait ensuite échouer `create_section` sur l'index unique
    // {moduleSlug, sectionSlug, contentType}. Cf. assertSectionAcceptsContent.
    const owner = await db.collection<ModuleDoc>("modules").findOne(
        { path: key.moduleSlug },
        { projection: { _id: 0, path: 1, "sections.path": 1, "sections.contents.type": 1 } }
    );
    assertSectionAcceptsContent(owner, {
        moduleSlug:  key.moduleSlug,
        sectionSlug: key.sectionSlug,
        contentType: key.contentType,
    });

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

/** Porte 2 : refuse toute écriture de contenu tant que le dépôt de référence
 *  du module n'est pas validé. Les modules sans dépôt déclaré passent. */
async function assertModuleWritable(moduleSlug: string): Promise<void> {
    const db = await connectToDB();
    const mod = await db.collection<ModuleDoc>("modules").findOne(
        { path: moduleSlug },
        { projection: { projectSpec: 1 } }
    );
    if (!mod) throw new Error(`Module "${moduleSlug}" introuvable.`);
    assertCanWriteContent(mod.projectSpec, moduleSlug);
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

    registerQuizTools(server, { isAdmin, getDb: connectToDB });
    registerReadTools(server, { isAdmin, getDb: connectToDB });

    const iconNameSchema = z.string()
        .refine((v) => isValidIcon(v), {
            message: "Icône inconnue. Consultez https://lucide.dev/icons/ pour la liste complète.",
        })
        .describe("Nom d'une icône Lucide (PascalCase, ex: BookOpen, Code, Server) — voir https://lucide.dev/icons/");

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
            projectSpec: projectSpecSchema.optional()
                .describe("Spec du projet fil rouge : name, pitch, finalDeliverable, entities[]. "
                    + "Toujours enregistrée en brouillon — la validation se fait dans l'admin."),
            exampleDomain: exampleDomainSchema.optional()
                .describe("Domaine d'illustration RÉSERVÉ au cours, distinct du projet. "
                    + "Le cours ne doit jamais illustrer avec le domaine du projet."),
            plannedNotions: z.array(z.string()).optional()
                .describe("Notions à couvrir sur l'ensemble du module, posées avant le choix du projet."),
        },
        async ({ title, iconName, path, description, sessionDurationMinutes, universe, projectSpec, exampleDomain, plannedNotions }) => {
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
                projectSpec: projectSpec !== undefined ? forceDraft(projectSpec) : undefined,
                exampleDomain,
                plannedNotions,
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
        "Édite les métadonnées d'un module : titre, description, icône, couleurs thème (colorLight/colorDark en hex), sessionDurationMinutes, universe, projectIcon, projectSpec, exampleDomain, plannedNotions. Réservé aux admins.",
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
            projectSpec: projectSpecSchema.optional()
                .describe("Spec du projet fil rouge : name, pitch, finalDeliverable, entities[]. "
                    + "Toujours enregistrée en brouillon — la validation se fait dans l'admin."),
            exampleDomain: exampleDomainSchema.optional()
                .describe("Domaine d'illustration RÉSERVÉ au cours, distinct du projet. "
                    + "Le cours ne doit jamais illustrer avec le domaine du projet."),
            plannedNotions: z.array(z.string()).optional()
                .describe("Notions à couvrir sur l'ensemble du module, posées avant le choix du projet."),
        },
        async ({ module, title, iconName, description, colorLight, colorDark, sessionDurationMinutes, universe, projectIcon, isVisible, projectSpec, exampleDomain, plannedNotions }) => {
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
            if (projectSpec !== undefined) set.projectSpec = forceDraft(projectSpec, mod.projectSpec);
            if (exampleDomain !== undefined) set.exampleDomain = exampleDomainSchema.parse(exampleDomain);
            if (plannedNotions !== undefined) set.plannedNotions = plannedNotions;

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
            courseIntroMinutes: intOrString.optional()
                .describe("Minutes de cours/slides en ouverture de la 1re séance (ex: 30). Le budget TP = totalDuration × sessionDurationMinutes − courseIntroMinutes."),
            brief: z.union([briefSchema, z.string()]).optional()
                .describe("Cahier des charges de la section : objectives (ce que l'étudiant saura faire), notions (à couvrir), filRougeStep (ce que le TP ajoute au projet fil rouge), notes libres. Objet ou JSON stringifié."),
        },
        async ({ module, title, description, contentTypes, order, path, objectives, totalDuration, tags, courseIntroMinutes: rawIntro, brief: rawBrief }) => {
            const courseIntroMinutes = asInt(rawIntro);
            const brief = asBrief(rawBrief);
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
            courseIntroMinutes:    intOrString.optional(),
            brief:                 z.union([briefSchema, z.string()]).optional(),
            curriculum:            z.union([curriculumSchema, z.string()]).optional()
                .describe("Notions effectivement enseignées + APIs vues. Mis à jour par le skill content-writer après rédaction. Objet ou JSON stringifié."),
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
                ["courseIntroMinutes", asInt(args.courseIntroMinutes)], ["brief", asBrief(args.brief)], ["curriculum", asCurriculum(args.curriculum)],
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

    // ── push_correction ───────────────────────────────────────────────────────
    server.tool(
        "push_correction",
        "Publie la correction d'un TP sur la forge GitLab (projet public correction/{module}/{section}), en un seul commit qui synchronise l'arborescence (create/update/delete). Passe hasCorrection à true ; correctionIsAvailable reste inchangé. Fichiers texte uniquement. Réservé aux admins.",
        {
            module:  z.string().describe("Slug du module"),
            section: z.string().describe("Slug de la section"),
            files:   z.array(z.object({
                path:    z.string().min(1).describe("Chemin relatif dans le repo, ex: exercice-1/index.html"),
                content: z.string().describe("Contenu texte UTF-8 du fichier"),
            })).min(1).describe("Arborescence complète de la correction (l'existant non listé est supprimé)"),
            commitMessage: z.string().optional().describe("Défaut : correction: {module}/{section}"),
        },
        async ({ module, section, files, commitMessage }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();

            const mod = await db.collection<Module>("modules").findOne({ path: module });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);
            const sections = mod.sections ?? [];
            const idx = sections.findIndex((s) => s.path === section);
            if (idx === -1) throw new Error(`Section "${section}" introuvable.`);

            const types = (sections[idx].contents ?? []).map((c) => c.type);
            if (!types.includes("TP") && !types.includes("examen")) {
                throw new Error(`La section "${section}" n'a ni TP ni examen : rien à corriger.`);
            }

            const cfg = getGitlabConfig();
            const groupId = await ensureGroup(cfg, cfg.rootGroupPath, module);
            const project = await ensureProject(cfg, groupId, `${cfg.rootGroupPath}/${module}`, section);
            const sha = await commitFiles(cfg, project.id, files, commitMessage ?? `correction: ${module}/${section}`);

            await db.collection<Module>("modules").updateOne(
                { path: module },
                { $set: { [`sections.${idx}.hasCorrection`]: true } }
            );

            return {
                content: [{
                    type: "text" as const,
                    text: `Correction publiée : ${project.webUrl} (commit ${sha.slice(0, 8)}, ${files.length} fichier(s)). hasCorrection=true ; correctionIsAvailable reste à activer dans l'admin.`,
                }],
            };
        }
    );

    // ── push_project_reference ────────────────────────────────────────────────
    server.tool(
        "push_project_reference",
        "Pousse la VERSION FINALE du projet fil rouge dans le dépôt GitLab privé du module. "
        + "Exige que la spec projet soit validée dans l'admin. Le dépôt reflète exactement les "
        + "fichiers envoyés (les absents sont supprimés). Réservé aux admins.",
        {
            module: z.string().describe("Slug du module, ex: rust"),
            files: z.array(z.object({
                path:    z.string().describe("Chemin relatif sous la racine, ex: src/main.rs"),
                content: z.string(),
            })).describe("Le projet terminé, dans son état de fin de module"),
            message: z.string().optional().describe("Message de commit"),
        },
        async ({module, files, message}) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const mod = await db.collection<Module>("modules").findOne({path: module});
            if (!mod) throw new Error(`Module "${module}" introuvable.`);

            assertCanPushReference(mod.projectSpec, module);
            assertReferenceFiles(files);

            const cfg = getPrivateProjectConfig();
            const slug = referenceProjectSlug(module);
            const project = await ensurePrivateProject(cfg, slug);
            const sha = await commitFiles(cfg, project.id, files, message ?? `Projet de référence — ${module}`);

            await db.collection("modules").updateOne(
                {path: module},
                {$set: {
                    "projectSpec.referenceRepo": {url: project.webUrl, status: "draft"},
                    updatedAt: new Date().toISOString(),
                }}
            );

            return {
                content: [{
                    type: "text" as const,
                    text: `Projet de référence poussé : ${project.webUrl} (commit ${sha.slice(0, 8)}). `
                        + `Statut « brouillon » — relisez-le et validez-le dans l'admin avant de rédiger les supports.`,
                }],
            };
        }
    );

    // ── get_project_reference ─────────────────────────────────────────────────
    server.tool(
        "get_project_reference",
        "Lit le projet de référence d'un module. Sans `path`, retourne l'arbre des fichiers ; "
        + "avec `path`, le contenu du fichier. À lire AVANT de rédiger un TP : le résultat "
        + "observable de chaque exercice doit sortir de ce code, pas d'une invention.",
        {
            module: z.string().describe("Slug du module, ex: rust"),
            path:   z.string().optional().describe("Chemin d'un fichier ; omis = arbre complet"),
        },
        async ({module, path: filePath}) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const mod = await db.collection<Module>("modules").findOne({path: module});
            if (!mod) throw new Error(`Module "${module}" introuvable.`);
            if (!mod.projectSpec?.referenceRepo) {
                throw new Error(`Le module "${module}" n'a pas encore de projet de référence.`);
            }

            const cfg = getPrivateProjectConfig();
            const project = await ensurePrivateProject(cfg, referenceProjectSlug(module));

            if (filePath) {
                const content = await readRepoFile(cfg, project.id, filePath);
                return {content: [{type: "text" as const, text: content}]};
            }

            const files = await listRepoFiles(cfg, project.id);
            return {
                content: [{
                    type: "text" as const,
                    text: `${files.length} fichier(s) :\n${files.join("\n")}`,
                }],
            };
        }
    );

    // ── publish_private_document ──────────────────────────────────────────────
    server.tool(
        "publish_private_document",
        "Crée (si besoin) un projet GitLab PRIVÉ dans l'espace personnel du token dédié (GITLAB_PROJET_URL/TOKEN, distinct de push_correction), et y publie des fichiers en un seul commit qui synchronise l'arborescence (create/update/delete). Réservé aux admins.",
        {
            project: z.string().min(1).describe("Slug du projet GitLab (créé s'il n'existe pas encore, visibility: private)"),
            files:   z.array(z.object({
                path:    z.string().min(1).describe("Chemin relatif dans le repo, ex: docs/mcp-module-workflow.md"),
                content: z.string().describe("Contenu texte UTF-8 du fichier"),
            })).min(1).describe("Arborescence complète à publier (l'existant non listé est supprimé)"),
            commitMessage: z.string().optional().describe("Défaut : docs: publish {project}"),
        },
        async ({ project, files, commitMessage }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const cfg = getPrivateProjectConfig();
            const p = await ensurePrivateProject(cfg, project);
            const sha = await commitFiles(cfg, p.id, files, commitMessage ?? `docs: publish ${project}`);
            return {
                content: [{
                    type: "text" as const,
                    text: `Projet privé publié : ${p.webUrl} (commit ${sha.slice(0, 8)}, ${files.length} fichier(s)).`,
                }],
            };
        }
    );

    // ── save_content ──────────────────────────────────────────────────────────
    server.tool(
        "save_content",
        "Remplace entièrement l'arbre de blocs d'un contenu (upsert). La section doit déjà exister "
        + "dans le module et déclarer ce type de contenu (create_section / edit_section). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    CONTENT_TYPE,
            blocks:  z.array(z.unknown()).describe("Arbre complet de blocs (avec children pour les conteneurs)"),
        },
        async ({ module, section, type, blocks }) => {
            if (!isAdmin) throw new Error("Forbidden");
            await assertModuleWritable(module);

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
            removeRef: boolOrString.optional()
                .describe("true = retire le type de contenu de la section (au lieu de repasser à source: 'file')"),
        },
        async ({ module, section, type, removeRef: rawRemoveRef }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const removeRef = asBool(rawRemoveRef);
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
        "Insère un nouveau bloc dans l'arbre. parentBlockId null = racine. afterBlockId null/absent = fin de la liste du parent. "
        + "La section doit déjà exister dans le module et déclarer ce type de contenu (create_section / edit_section). Réservé aux admins.",
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
            await assertModuleWritable(module);
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
            await assertModuleWritable(module);
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
            await assertModuleWritable(module);
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
            await assertModuleWritable(module);
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

    // ── add_resource ──────────────────────────────────────────────────────────
    server.tool(
        "add_resource",
        "Ajoute une ressource de veille (article, vidéo, recherche, outil) à la section « À lire, à voir » de l'accueil, visible des étudiants connectés. Idempotent sur l'URL : une URL déjà présente n'est pas dupliquée. Réservé aux admins.",
        {
            title: z.string().describe("Titre affiché (160 caractères max)"),
            url: z.string().describe("Lien http(s) de la ressource, sans paramètres de suivi (?is=…, ?si=…)"),
            description: z.string().describe("Description courte : de quoi ça parle, pourquoi c'est utile (600 caractères max)"),
            kind: z.enum(RESOURCE_KINDS).describe("Type : article | video | recherche | outil"),
            durationMin: intOrString.optional().describe("Temps de lecture ou de visionnage, en minutes (facultatif)"),
            note: z.string().optional().describe("« Mot du prof » : pourquoi la conseiller, 300 caractères max (facultatif)"),
        },
        async (args) => {
            if (!isAdmin) throw new Error("Forbidden");

            const db = await connectToDB();
            const result = await addResource(db.collection(RESOURCES_COLLECTION), {
                title: args.title,
                url: args.url,
                description: args.description,
                kind: args.kind,
                durationMin: asInt(args.durationMin),
                note: args.note,
            });

            const text = result.status === "created"
                ? `Ressource ajoutée : « ${result.title} ». resourceId=${result.id}`
                : `Déjà présente, rien ajouté : « ${result.title} ». resourceId=${result.id}`;
            return { content: [{ type: "text" as const, text }] };
        }
    );

    // ── Prompts d'étape (module-design) ─────────────────────────────────────────
    for (const def of MODULE_STEP_PROMPTS) {
        server.registerPrompt(
            def.id,
            {
                title: def.title,
                description: def.description,
                argsSchema: { module: z.string().describe("Slug du module, ex: rust") },
            },
            ({ module }) => {
                if (!isAdmin) throw new Error("Forbidden");
                const text = buildModuleStepPromptMessage(def.stepLabel, module);
                return {
                    messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
                };
            }
        );
    }

    // ── Prompt content-writer ────────────────────────────────────────────────
    server.registerPrompt(
        "content_writer",
        {
            title: "Rédiger cours, TP, slides ou examen",
            description: "Rédige les supports d'une section existante, en suivant le workflow content-writer.",
            argsSchema: {
                module: z.string().describe("Slug du module, ex: rust"),
                section: z.string().describe("Slug de la section, ex: ownership"),
            },
        },
        ({module, section}) => {
            if (!isAdmin) throw new Error("Forbidden");
            const text = `Le module concerné est "${module}", la section "${section}". `
                + `Chargez le document skill://pedagogy/content-writer `
                + `(get_pedagogical_skill_document avec id="content-writer") et suivez son workflow `
                + `en entier, en commençant par son étape 1 (choix des supports à rédiger).`;
            return {
                messages: [{role: "user" as const, content: {type: "text" as const, text}}],
            };
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
