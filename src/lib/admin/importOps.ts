import type { AnyBulkWriteOperation, Document } from "mongodb";

export type SectionData = {
    path: string;
    order?: number;
    [key: string]: unknown;
};

export type ModuleData = {
    path: string;
    sections?: SectionData[];
    [key: string]: unknown;
};

export type ContentData = {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks: unknown[];
    version?: number;
};

/** Sur un module existant en prod, l'import ne doit jamais changer l'état de publication. */
export function mergeSections(existingSections: SectionData[], importedSections: SectionData[]): SectionData[] {
    const existingByPath = new Map(existingSections.map((s) => [s.path, s]));
    const importedPaths = new Set(importedSections.map((s) => s.path));

    const merged = importedSections.map(({ _id, ...sec }) => {
        void _id;
        const existing = existingByPath.get(sec.path);
        if (existing) {
            return {
                ...sec,
                isAvailable: existing.isAvailable ?? false,
                correctionIsAvailable: existing.correctionIsAvailable ?? false,
                examenIsLock: existing.examenIsLock ?? false,
            };
        }
        // Nouvelle section : arrive dépubliée quel que soit son état sur staging.
        return { ...sec, isAvailable: false, correctionIsAvailable: false };
    });

    const kept = existingSections
        .filter((s) => !importedPaths.has(s.path))
        .map(({ _id, ...sec }) => {
            void _id;
            return sec as SectionData;
        });

    return [...kept, ...merged]
        .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));
}

export interface ModuleOpsResult {
    operations: AnyBulkWriteOperation<Document>[];
    inserted: number;
    updated: number;
}

/**
 * Construit les opérations bulkWrite pour les modules à partir des documents déjà
 * en base (préchargés en une seule requête) et du payload importé.
 */
export function buildModuleOps(
    existingByPath: Map<string, ModuleData>,
    modules: ModuleData[],
): ModuleOpsResult {
    const operations: AnyBulkWriteOperation<Document>[] = [];
    let inserted = 0;
    let updated = 0;

    for (const moduleData of modules) {
        const { _id, sections = [], ...moduleFields } = moduleData;
        void _id;

        const existing = existingByPath.get(moduleFields.path as string);

        if (!existing) {
            // Nouveau module : arrive masqué, sections dépubliées.
            operations.push({
                insertOne: {
                    document: {
                        ...moduleFields,
                        isVisible: false,
                        sections: sections.map(({ _id: _sid, ...sec }) => ({
                            ...sec,
                            isAvailable: false,
                            correctionIsAvailable: false,
                        })),
                    },
                },
            });
            inserted++;
        } else {
            operations.push({
                updateOne: {
                    filter: { path: moduleFields.path },
                    update: {
                        $set: {
                            ...moduleFields,
                            isVisible: existing.isVisible ?? false,
                            sections: mergeSections(existing.sections ?? [], sections),
                        },
                    },
                },
            });
            updated++;
        }
    }

    return { operations, inserted, updated };
}

/** Un upsert par contenu, clé sur le triplet unique indexé de course_content. */
export function buildContentOps(contents: ContentData[]): AnyBulkWriteOperation<Document>[] {
    return contents.map((content) => {
        const key = {
            moduleSlug: content.moduleSlug,
            sectionSlug: content.sectionSlug,
            contentType: content.contentType,
        };
        return {
            updateOne: {
                filter: key,
                update: {
                    $set: {
                        blocks: content.blocks,
                        version: content.version ?? 1,
                        updatedAt: new Date(),
                    },
                    $setOnInsert: { ...key, createdAt: new Date() },
                },
                upsert: true,
            },
        };
    });
}
