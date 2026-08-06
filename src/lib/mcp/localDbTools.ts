import type { Db } from "mongodb";

import { pruneEmptyLeafChildren } from "@/lib/blockTreeUtils";
import { normalizeContentKey, type ContentKey } from "@/lib/contentTypes";
import { connectToDB } from "@/lib/mongodb";
import { validateBlockTree } from "@/lib/validateBlockTree";
import type { Block, CourseContent } from "@/types/CourseContent";
import type Module from "@/types/Module";
import type Section from "@/types/Section";

type WritableContentType = CourseContent["contentType"];

interface LocalContentKey {
    moduleSlug: string;
    sectionSlug: string;
    contentType: WritableContentType;
}

interface LocalMongoTarget {
    protocol: "mongodb:";
    hosts: string[];
    databaseName: "cours-iut-web";
}

type LocalContentRefInput =
    | { type: string; source?: "file" }
    | { type: string; source: "db"; contentId: string };

export interface LocalSectionInput {
    path: string;
    title: string;
    description?: string;
    order?: number;
    contents?: LocalContentRefInput[];
    objectives?: string[];
    tags?: string[];
    totalDuration?: number;
    courseIntroMinutes?: number;
    brief?: Section["brief"];
    curriculum?: Section["curriculum"];
    hasCorrection?: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    examenIsLock?: boolean;
}

type LocalSectionDoc = Partial<Omit<Section, "_id" | "contents">> & {
    path: string;
    contents?: Array<{ type: string; source?: string; contentId?: unknown }>;
};

type LocalModuleDoc = Partial<Omit<Module, "_id" | "sections" | "updatedAt">> & {
    path: string;
    title?: string;
    updatedAt?: string | Date;
    sections?: LocalSectionDoc[];
};

const LOCAL_MONGO_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const WRITABLE_CONTENT_TYPES = new Set<ContentKey>(["cours", "TP", "examen", "slide"]);

function textValue(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") return value;
    return String(value);
}

function dateValue(value: string | Date | undefined): string | undefined {
    if (value === undefined) return undefined;
    return value instanceof Date ? value.toISOString() : value;
}

function hostFromAuthorityEntry(entry: string): string {
    const withoutCredentials = entry.split("@").at(-1)?.trim() ?? "";
    if (withoutCredentials.startsWith("[")) {
        return withoutCredentials.slice(1, withoutCredentials.indexOf("]")).toLowerCase();
    }
    return withoutCredentials.split(":")[0].toLowerCase();
}

function parseMongoHosts(uri: string): { protocol: string; hosts: string[] } {
    const match = uri.match(/^([a-z0-9+.-]+):\/\/([^/?#]+)/i);
    if (!match) {
        throw new Error("MONGODB_URI invalide pour le MCP local.");
    }

    const protocol = `${match[1].toLowerCase()}:`;
    const authority = match[2];
    const hosts = authority
        .split(",")
        .map(hostFromAuthorityEntry)
        .filter(Boolean);

    return { protocol, hosts };
}

export function assertLocalMongoUri(uri: string | undefined): LocalMongoTarget {
    if (!uri) {
        throw new Error("MONGODB_URI est absent : le MCP local ne peut pas demarrer.");
    }

    const parsed = parseMongoHosts(uri);
    const isLocal = parsed.protocol === "mongodb:"
        && parsed.hosts.length > 0
        && parsed.hosts.every((host) => LOCAL_MONGO_HOSTS.has(host));

    if (!isLocal) {
        throw new Error(
            "MCP local refuse cette URI MongoDB : seules les adresses localhost, 127.0.0.1 et ::1 sont autorisees."
        );
    }

    return {
        protocol: "mongodb:",
        hosts: parsed.hosts,
        databaseName: "cours-iut-web",
    };
}

export async function connectToLocalDB(): Promise<Db> {
    assertLocalMongoUri(process.env.MONGODB_URI);
    return connectToDB();
}

function serializeContentRefs(contents: LocalSectionDoc["contents"] = []) {
    return contents.map((content) => {
        const contentId = textValue(content.contentId);
        return {
            type: content.type,
            source: content.source ?? "file",
            ...(contentId !== undefined && { contentId }),
        };
    });
}

function serializeSectionMetadata(moduleSlug: string, section: LocalSectionDoc) {
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

function serializeModuleMetadata(module: LocalModuleDoc) {
    const updatedAt = dateValue(module.updatedAt);
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
        ...(module.projectIcon !== undefined && { projectIcon: module.projectIcon }),
        ...(module.colorLight !== undefined && { colorLight: module.colorLight }),
        ...(module.colorDark !== undefined && { colorDark: module.colorDark }),
        ...(module.isVisible !== undefined && { isVisible: module.isVisible }),
        ...(updatedAt !== undefined && { updatedAt }),
        sectionCount: module.sections?.length ?? 0,
        sectionSlugs: (module.sections ?? []).map((section) => section.path),
    };
}

async function getModuleDoc(db: Db, moduleSlug: string): Promise<LocalModuleDoc> {
    const moduleDoc = await db.collection<LocalModuleDoc>("modules").findOne(
        { path: moduleSlug },
        { projection: { _id: 0 } }
    );
    if (!moduleDoc) {
        throw new Error(`Module "${moduleSlug}" introuvable en local.`);
    }
    return moduleDoc;
}

function getSectionDoc(moduleDoc: LocalModuleDoc, sectionSlug: string): LocalSectionDoc {
    const section = (moduleDoc.sections ?? []).find((item) => item.path === sectionSlug);
    if (!section) {
        throw new Error(`Section "${sectionSlug}" introuvable dans "${moduleDoc.path}" en local.`);
    }
    return section;
}

export async function getLocalModule(db: Db, moduleSlug: string) {
    return serializeModuleMetadata(await getModuleDoc(db, moduleSlug));
}

export async function listLocalSections(db: Db, moduleSlug: string) {
    const moduleDoc = await getModuleDoc(db, moduleSlug);
    return (moduleDoc.sections ?? [])
        .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((section) => serializeSectionMetadata(moduleDoc.path, section));
}

export async function getLocalSection(db: Db, moduleSlug: string, sectionSlug: string) {
    const moduleDoc = await getModuleDoc(db, moduleSlug);
    return serializeSectionMetadata(moduleDoc.path, getSectionDoc(moduleDoc, sectionSlug));
}

export async function getLocalContent(db: Db, key: LocalContentKey) {
    const doc = await db.collection<CourseContent>("course_content").findOne(
        key,
        { projection: { _id: 1, blocks: 1, version: 1, updatedAt: 1 } }
    );

    return {
        module: key.moduleSlug,
        section: key.sectionSlug,
        type: key.contentType,
        source: doc ? "db" : "missing",
        ...(doc?._id !== undefined && { contentId: String(doc._id) }),
        ...(doc?.version !== undefined && { version: doc.version }),
        ...(doc?.updatedAt !== undefined && { updatedAt: dateValue(doc.updatedAt) }),
        blocks: doc?.blocks ?? [],
    };
}

function normalizeWritableContentType(raw: string): WritableContentType {
    const contentType = normalizeContentKey(raw);
    if (!contentType || !WRITABLE_CONTENT_TYPES.has(contentType)) {
        throw new Error(`Type de contenu non supporte par la DB locale : "${raw}".`);
    }
    return contentType as WritableContentType;
}

function normalizeContentRefsForWrite(refs: LocalContentRefInput[] = []) {
    return refs.map((ref) => {
        const type = normalizeContentKey(ref.type);
        if (!type) throw new Error(`Type de contenu inconnu dans une section : "${ref.type}".`);
        if (ref.source === "db") {
            if (!ref.contentId) throw new Error(`contentId manquant pour la ref DB "${ref.type}".`);
            return { type, source: "db" as const, contentId: ref.contentId };
        }
        return { type, source: "file" as const };
    });
}

function normalizeSectionForWrite(section: LocalSectionInput, index: number): Omit<Section, "_id"> {
    const path = section.path.trim();
    const title = section.title.trim();
    if (!path) throw new Error("Une section locale doit avoir un path.");
    if (!title) throw new Error(`La section "${path}" doit avoir un title.`);

    return {
        path,
        title,
        ...(section.description !== undefined && { description: section.description }),
        order: section.order ?? index + 1,
        contents: normalizeContentRefsForWrite(section.contents),
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

async function assertSectionExists(db: Db, key: LocalContentKey): Promise<void> {
    const count = await db.collection("modules").countDocuments(
        { path: key.moduleSlug, "sections.path": key.sectionSlug },
        { limit: 1 }
    );
    if (count === 0) {
        throw new Error(`Section "${key.moduleSlug}/${key.sectionSlug}" introuvable en local.`);
    }
}

async function updateContentRef(db: Db, key: LocalContentKey, contentId: string): Promise<void> {
    const direct = await db.collection("modules").updateOne(
        { path: key.moduleSlug, "sections.path": key.sectionSlug },
        {
            $set: {
                "sections.$.contents.$[ref].source": "db",
                "sections.$.contents.$[ref].contentId": contentId,
            },
        },
        { arrayFilters: [{ "ref.type": key.contentType }] }
    );
    if (direct.modifiedCount > 0) return;

    const added = await db.collection("modules").updateOne(
        {
            path: key.moduleSlug,
            sections: {
                $elemMatch: {
                    path: key.sectionSlug,
                    "contents.type": { $ne: key.contentType },
                },
            },
        },
        {
            $push: {
                "sections.$.contents": {
                    type: key.contentType,
                    source: "db",
                    contentId,
                },
            } as never,
        }
    );
    if (added.modifiedCount > 0) return;

    await assertSectionExists(db, key);
}

function validateBlocks(blocks: unknown): Block[] {
    const validation = validateBlockTree(blocks);
    if (!validation.valid) {
        throw new Error(`Blocs invalides : ${JSON.stringify(validation.errors)}`);
    }
    return pruneEmptyLeafChildren(blocks as Block[]);
}

export async function saveLocalContent(
    db: Db,
    key: LocalContentKey,
    inputBlocks: unknown,
    options: { dryRun?: boolean } = {}
) {
    const normalizedKey = {
        ...key,
        contentType: normalizeWritableContentType(key.contentType),
    };
    await assertSectionExists(db, normalizedKey);
    const blocks = validateBlocks(inputBlocks);
    const existing = await db.collection<CourseContent>("course_content").findOne(normalizedKey);

    if (options.dryRun) {
        return {
            dryRun: true,
            wouldWrite: true,
            module: normalizedKey.moduleSlug,
            section: normalizedKey.sectionSlug,
            type: normalizedKey.contentType,
            rootBlockCount: blocks.length,
            ...(existing?._id !== undefined && { existingContentId: String(existing._id) }),
            ...(existing?.version !== undefined && { existingVersion: existing.version }),
        };
    }

    const now = new Date();
    let contentId: string;
    let version: number;

    if (existing) {
        await db.collection<CourseContent>("course_content").updateOne(
            { _id: existing._id },
            { $set: { blocks, updatedAt: now }, $inc: { version: 1 } }
        );
        contentId = String(existing._id);
        version = (existing.version ?? 1) + 1;
    } else {
        const inserted = await db.collection<CourseContent>("course_content").insertOne({
            ...normalizedKey,
            blocks,
            version: 1,
            createdAt: now,
            updatedAt: now,
        });
        contentId = String(inserted.insertedId);
        version = 1;
    }

    await updateContentRef(db, normalizedKey, contentId);

    return {
        dryRun: false,
        module: normalizedKey.moduleSlug,
        section: normalizedKey.sectionSlug,
        type: normalizedKey.contentType,
        contentId,
        version,
        rootBlockCount: blocks.length,
    };
}

export async function replaceLocalModuleSections(
    db: Db,
    moduleSlug: string,
    sections: LocalSectionInput[],
    options: { dryRun?: boolean; force?: boolean } = {}
) {
    const moduleDoc = await getModuleDoc(db, moduleSlug);
    const currentCount = moduleDoc.sections?.length ?? 0;
    const nextSections = sections.map(normalizeSectionForWrite);

    if (currentCount > 0 && !options.dryRun && !options.force) {
        throw new Error(
            `Remplacement refuse : "${moduleSlug}" contient deja ${currentCount} section(s). Relancez avec force=true.`
        );
    }

    if (options.dryRun) {
        return {
            dryRun: true,
            wouldWrite: true,
            module: moduleSlug,
            currentSectionCount: currentCount,
            nextSectionCount: nextSections.length,
            sectionSlugs: nextSections.map((section) => section.path),
            forceRequired: currentCount > 0,
        };
    }

    await db.collection("modules").updateOne(
        { path: moduleSlug },
        {
            $set: {
                sections: nextSections,
                updatedAt: new Date().toISOString(),
            },
        }
    );

    return {
        dryRun: false,
        module: moduleSlug,
        previousSectionCount: currentCount,
        sectionCount: nextSections.length,
        sectionSlugs: nextSections.map((section) => section.path),
    };
}
