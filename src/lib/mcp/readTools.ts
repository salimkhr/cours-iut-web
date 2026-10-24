import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Db} from "mongodb";
import {ObjectId} from "bson";
import {z} from "zod";
import {EXEMPLAR_FORMATS, EXEMPLAR_LEVELS, VERDICT_FORMATS} from "@/lib/schemas/pedagogy.schema";
import type {PedagogyExemplar, PedagogyVerdict} from "@/types/Pedagogy";
import {blocksToMarkdown, normalizeForSearch, searchBlocks, type SearchMatch} from "@/lib/blockTextUtils";
import type {CourseContent} from "@/types/CourseContent";
import type Module from "@/types/Module";
import type {ModuleUniverse} from "@/types/Module";
import type Section from "@/types/Section";
import {SKILL_DOCUMENTS, SKILL_MANIFEST} from "@/lib/skills/pedagogy";
import {RESOURCES_COLLECTION} from "@/lib/resources";

// Outils MCP de lecture. Un admin voit tout ; un non-admin suit les règles des
// pages : module `isVisible !== false`, section `isAvailable !== false`, jamais
// d'examen, ni les données de conception (brief, curriculum, projectSpec…), ni
// les verdicts, exemplaires et skills. Un contenu masqué répond exactement comme
// un slug inexistant, pour ne pas révéler son existence.

export const CONTENT_TYPE = z.enum(["cours", "TP", "examen", "slide"]);

// Les clients MCP dont le schéma d'outils est mis en cache (connecteurs claude.ai)
// transmettent les paramètres ajoutés depuis en chaîne : on tolère string → typé.
export const boolOrString = z.union([z.boolean(), z.enum(["true", "false"])]);

export function asBool(v: boolean | "true" | "false" | undefined): boolean | undefined {
    return v === undefined ? undefined : v === true || v === "true";
}

export type ModuleSectionDoc = Partial<Omit<Section, "_id" | "contents">> & {
    path: string;
    contents?: Array<{ type: string; source?: string; contentId?: unknown }>;
};

export type ModuleDoc = Partial<Omit<Module, "_id" | "sections" | "updatedAt">> & {
    path: string;
    title?: string;
    updatedAt?: string | Date;
    sections?: ModuleSectionDoc[];
};

export const READ_TOOL_NAMES = [
    "get_migration_status",
    "list_modules",
    "list_sections",
    "get_module",
    "get_section",
    "get_content",
    "search_content",
    "export_content_compact",
    "list_verdicts",
    "list_exemplars",
    "list_resources",
    "get_pedagogical_skill_manifest",
    "get_pedagogical_skill_document",
] as const;

// ── Règles d'accès ────────────────────────────────────────────────────────────

export function isModuleReadable(mod: { isVisible?: boolean }, isAdmin: boolean): boolean {
    return isAdmin || mod.isVisible !== false;
}

export function isSectionReadable(section: { isAvailable?: boolean }, isAdmin: boolean): boolean {
    return isAdmin || section.isAvailable !== false;
}

export function isContentTypeReadable(type: string, isAdmin: boolean): boolean {
    return isAdmin || type !== "examen";
}

/** Retire d'une section ce qu'un non-admin ne voit pas sur les pages. */
function redactSection(section: ModuleSectionDoc, isAdmin: boolean): ModuleSectionDoc {
    if (isAdmin) return section;
    const {brief: _brief, curriculum: _curriculum, ...rest} = section;
    return {...rest, contents: (section.contents ?? []).filter((c) => isContentTypeReadable(c.type, false))};
}

/** Sections lisibles d'un module, expurgées pour un non-admin. */
function readableSections(mod: ModuleDoc, isAdmin: boolean): ModuleSectionDoc[] {
    return (mod.sections ?? [])
        .filter((s) => isSectionReadable(s, isAdmin))
        .map((s) => redactSection(s, isAdmin));
}

/** Retire d'un module les données de conception et les sections non publiées. */
function redactModule(mod: ModuleDoc, isAdmin: boolean): ModuleDoc {
    if (isAdmin) return mod;
    const {projectSpec: _projectSpec, plannedNotions: _plannedNotions, exampleDomain: _exampleDomain, ...rest} = mod;
    return {...rest, sections: readableSections(mod, false)};
}

/** Couples module → sections lisibles par un non-admin (allowlist de recherche). */
async function readableSectionMap(db: Db): Promise<Map<string, Set<string>>> {
    const modules = await db.collection<ModuleDoc>("modules")
        .find({isVisible: {$ne: false}}, {projection: {_id: 0, path: 1, "sections.path": 1, "sections.isAvailable": 1}})
        .toArray();
    return new Map(modules.map((m) => [
        m.path,
        new Set((m.sections ?? []).filter((s) => isSectionReadable(s, false)).map((s) => s.path)),
    ]));
}

// ── Sérialisation ─────────────────────────────────────────────────────────────

function asSerializableId(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") return value;
    if (value instanceof ObjectId) return value.toString();
    return String(value);
}

function asSerializableDate(value: string | Date | undefined): string | undefined {
    if (value === undefined) return undefined;
    return value instanceof Date ? value.toISOString() : value;
}

function serializeContentRefs(contents: ModuleSectionDoc["contents"] = []) {
    return contents.map((content) => {
        const contentId = asSerializableId(content.contentId);
        return {
            type: content.type,
            source: content.source ?? "file",
            ...(contentId !== undefined && { contentId }),
        };
    });
}

export function serializeSectionMetadata(moduleSlug: string, section: ModuleSectionDoc) {
    return {
        module: moduleSlug,
        slug: section.path,
        title: section.title ?? section.path,
        ...(section.description !== undefined && { description: section.description }),
        order: section.order ?? 0,
        contents: serializeContentRefs(section.contents),
        objectives: section.objectives ?? [],
        tags: section.tags ?? [],
        totalDuration: section.totalDuration ?? 1,
        ...(section.courseIntroMinutes !== undefined && { courseIntroMinutes: section.courseIntroMinutes }),
        ...(section.brief !== undefined && { brief: section.brief }),
        ...(section.curriculum !== undefined && { curriculum: section.curriculum }),
        hasCorrection: section.hasCorrection ?? false,
        isAvailable: section.isAvailable ?? false,
        correctionIsAvailable: section.correctionIsAvailable ?? false,
        examenIsLock: section.examenIsLock ?? false,
    };
}

export function serializeModuleMetadata(module: ModuleDoc) {
    const updatedAt = asSerializableDate(module.updatedAt);
    return {
        slug: module.path,
        title: module.title ?? module.path,
        ...(module.iconName !== undefined && { iconName: module.iconName }),
        ...(module.description !== undefined && { description: module.description }),
        associatedSae: module.associatedSae ?? [],
        coefficients: module.coefficients ?? [],
        ...(module.manager !== undefined && { manager: module.manager }),
        instructors: module.instructors ?? [],
        isExtra: module.isExtra ?? false,
        ...(module.sessionDurationMinutes !== undefined && { sessionDurationMinutes: module.sessionDurationMinutes }),
        ...(module.universe !== undefined && { universe: module.universe }),
        ...(module.projectSpec !== undefined && { projectSpec: module.projectSpec }),
        ...(module.exampleDomain !== undefined && { exampleDomain: module.exampleDomain }),
        ...(module.plannedNotions !== undefined && { plannedNotions: module.plannedNotions }),
        ...(module.projectIcon !== undefined && { projectIcon: module.projectIcon }),
        ...(module.colorLight !== undefined && { colorLight: module.colorLight }),
        ...(module.colorDark !== undefined && { colorDark: module.colorDark }),
        ...(module.isVisible !== undefined && { isVisible: module.isVisible }),
        ...(updatedAt !== undefined && { updatedAt }),
        sectionCount: module.sections?.length ?? 0,
        sectionSlugs: (module.sections ?? []).map((section) => section.path),
    };
}

// ── Enregistrement des outils ─────────────────────────────────────────────────

export function registerReadTools(
    server: McpServer,
    deps: {isAdmin: boolean; getDb: () => Promise<Db>},
): void {
    const {isAdmin, getDb} = deps;

    /** Module lisible par l'appelant, ou null (masqué ou inexistant, indiscernables). */
    async function findReadableModule(slug: string, projection: Record<string, 0 | 1>): Promise<ModuleDoc | null> {
        const db = await getDb();
        const mod = await db.collection<ModuleDoc>("modules").findOne(
            {path: slug},
            {projection: {...projection, _id: 0, isVisible: 1}},
        );
        return mod && isModuleReadable(mod, isAdmin) ? mod : null;
    }

    // ── get_migration_status ──────────────────────────────────────────────────
    server.tool(
        "get_migration_status",
        "Retourne l'état de migration (file/db) de tous les cours, TPs, examens et slides.",
        {},
        async () => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await getDb();
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

    // ── list_modules ──────────────────────────────────────────────────────────
    server.tool(
        "list_modules",
        "Retourne la liste de tous les modules disponibles.",
        {},
        async () => {
            const db = await getDb();
            const modules = await db.collection<{ path: string; title?: string; isExtra?: boolean; sessionDurationMinutes?: number; universe?: ModuleUniverse }>("modules")
                .find(isAdmin ? {} : {isVisible: {$ne: false}}, { projection: { path: 1, title: 1, isExtra: 1, sessionDurationMinutes: 1, universe: 1, _id: 0 } })
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
            const mod = await findReadableModule(module, { sections: 1 });
            if (!mod) {
                return { content: [{ type: "text" as const, text: `Module "${module}" introuvable.` }] };
            }
            const sections = readableSections(mod, isAdmin).map((s) => ({
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

    // ── get_module ────────────────────────────────────────────────────────────
    server.tool(
        "get_module",
        "Retourne les métadonnées complètes d'un module, sans blocs de contenu ni sections imbriquées.",
        { module: z.string().describe("Slug du module, ex: javascript") },
        async ({ module }) => {
            const mod = await findReadableModule(module, {
                path: 1,
                title: 1,
                iconName: 1,
                description: 1,
                associatedSae: 1,
                coefficients: 1,
                manager: 1,
                instructors: 1,
                isExtra: 1,
                sessionDurationMinutes: 1,
                universe: 1,
                projectSpec: 1,
                exampleDomain: 1,
                plannedNotions: 1,
                projectIcon: 1,
                colorLight: 1,
                colorDark: 1,
                isVisible: 1,
                updatedAt: 1,
                sections: 1,
            });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);

            const result = serializeModuleMetadata(redactModule(mod, isAdmin));
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── get_section ───────────────────────────────────────────────────────────
    server.tool(
        "get_section",
        "Retourne les métadonnées complètes d'une section, sans blocs de contenu.",
        {
            module:  z.string().describe("Slug du module, ex: javascript"),
            section: z.string().describe("Slug de la section, ex: 1-le-dom"),
        },
        async ({ module, section }) => {
            const mod = await findReadableModule(module, { sections: 1 });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);

            const found = readableSections(mod, isAdmin).find((candidate) => candidate.path === section);
            if (!found) throw new Error(`Section "${section}" introuvable dans le module "${module}".`);

            const result = serializeSectionMetadata(module, found);
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
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
            if (!isContentTypeReadable(type, isAdmin)) throw new Error("Forbidden");
            const empty = { content: [{ type: "text" as const, text: JSON.stringify({ blocks: [], source: "file" }, null, 2) }] };

            if (!isAdmin) {
                // Le contenu ne porte pas la visibilité : on la lit sur le module et la section.
                const mod = await findReadableModule(module, { "sections.path": 1, "sections.isAvailable": 1 });
                if (!mod || !readableSections(mod, false).some((s) => s.path === section)) return empty;
            }

            const db = await getDb();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug:  module,
                sectionSlug: section,
                contentType: type,
            });
            if (!doc) return empty;
            const result = { contentId: doc._id?.toString(), blocks: doc.blocks, version: doc.version, source: "db" };
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
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
            if (typeFilter && !isContentTypeReadable(typeFilter, isAdmin)) throw new Error("Forbidden");
            const db = await getDb();

            const filter: Record<string, unknown> = {};
            if (moduleFilter) filter.moduleSlug = moduleFilter;
            if (typeFilter) filter.contentType = typeFilter;

            const allowed = isAdmin ? null : await readableSectionMap(db);
            if (allowed) {
                if (!moduleFilter) filter.moduleSlug = { $in: [...allowed.keys()] };
                if (!typeFilter) filter.contentType = { $ne: "examen" };
            }

            const docs = (await db
                .collection<CourseContent>("course_content")
                .find(filter, {
                    projection: { moduleSlug: 1, sectionSlug: 1, contentType: 1, blocks: 1 },
                })
                .toArray())
                // Filtré avant la recherche : un contenu caché ne consomme pas la limite
                // et n'apparaît pas dans le décompte de la note.
                .filter((doc) => !allowed || (allowed.get(doc.moduleSlug)?.has(doc.sectionSlug) ?? false));

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
            if (contentType && !isContentTypeReadable(contentType, isAdmin)) throw new Error("Forbidden");

            const mod = await findReadableModule(moduleSlug, { title: 1, sections: 1 });
            if (!mod) throw new Error(`Module "${moduleSlug}" introuvable.`);

            const filter: Record<string, unknown> = { moduleSlug };
            if (sectionSlug) filter.sectionSlug = sectionSlug;
            if (contentType) filter.contentType = contentType;
            else if (!isAdmin) filter.contentType = { $ne: "examen" };

            const readable = new Set(readableSections(mod, isAdmin).map((s) => s.path));
            const db = await getDb();
            const docs = (await db
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
                .toArray())
                .filter((doc) => isAdmin || readable.has(doc.sectionSlug));

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

    // ── list_verdicts ─────────────────────────────────────────────────────────
    server.tool(
        "list_verdicts",
        "Retourne les verdicts de calibrage ACTIFS (critiques utilisateur passées). À lire OBLIGATOIREMENT avant toute rédaction de contenu ou conception de module.",
        {
            format: z.enum(VERDICT_FORMATS).optional().describe("Filtrer par format. Omis = tous"),
        },
        async ({ format }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await getDb();
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
            if (!isAdmin) throw new Error("Forbidden");
            const db = await getDb();
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

    // ── list_resources ────────────────────────────────────────────────────────
    server.tool(
        "list_resources",
        "Retourne les ressources de veille (« À lire, à voir »), les plus récentes d'abord. À appeler avant add_resource pour éviter les doublons.",
        {
            onlyVisible: boolOrString.optional().describe("true = seulement les ressources visibles des étudiants. Omis = toutes"),
        },
        async ({ onlyVisible }) => {
            const db = await getDb();
            // Un non-admin ne voit que ce que l'accueil lui montre.
            const filter = !isAdmin || asBool(onlyVisible) ? { isVisible: true } : {};
            const docs = await db.collection(RESOURCES_COLLECTION).find(filter).sort({ createdAt: -1 }).toArray();
            const result = docs.map((d) => ({
                id: d._id.toString(),
                title: d.title as string,
                url: d.url as string,
                kind: d.kind as string,
                description: d.description as string,
                isVisible: d.isVisible !== false,
                ...(d.durationMin ? { durationMin: d.durationMin as number } : {}),
                ...(d.note ? { note: d.note as string } : {}),
                createdAt: new Date(d.createdAt as Date).toISOString(),
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── get_pedagogical_skill_manifest ────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_manifest",
        "Retourne le manifeste des skills pédagogiques (module-design, content-writer) : version, hash, liste des documents.",
        {},
        async () => {
            if (!isAdmin) throw new Error("Forbidden");
            return {
                content: [{ type: "text" as const, text: JSON.stringify(SKILL_MANIFEST, null, 2) }],
            };
        }
    );

    // ── get_pedagogical_skill_document ────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_document",
        "Retourne un document de skill pédagogique. id = module-design (conception de module) | content-writer (rédaction cours/TP/slides/examen).",
        {
            id: z.string().describe("ID du document : module-design | content-writer"),
        },
        async ({ id }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const doc = SKILL_DOCUMENTS[id];
            if (!doc) {
                const available = Object.keys(SKILL_DOCUMENTS).join(", ");
                throw new Error(`Document "${id}" inconnu. Disponibles : ${available}`);
            }
            return { content: [{ type: "text" as const, text: doc.content }] };
        }
    );
}
