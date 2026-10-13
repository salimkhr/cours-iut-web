import type { Db } from "mongodb";
import { connectToDB } from "@/lib/mongodb";
import { toSlideBlocks, countConvertible, findUnrenderableTypes } from "@/lib/slideBlockMigration";
import type { Block, CourseContent } from "@/types/CourseContent";

export type SlideRepairMode = "dry-run" | "apply";
export type SlideRepairStatus = "convertible" | "converted" | "warning" | "error";

export type SlideRepairDocResult = {
    section: string; // `${moduleSlug}/${sectionSlug}`
    contentId: string;
    version: number;
    rootTypesBefore: string[];
    blocksConverted: number;
    remainingUnrenderable: string[];
    status: SlideRepairStatus;
    error?: string;
};

export type SlideRepairResult = {
    mode: SlideRepairMode;
    total: number;
    clean: number;
    convertible: number;
    warning: number;
    error: number;
    results: SlideRepairDocResult[];
};

type SlideDoc = CourseContent & { _id: unknown };

export type SlideRepairRunnerDeps = {
    connectToDB: () => Promise<Db>;
};

const defaultDeps: SlideRepairRunnerDeps = { connectToDB };

/**
 * Ne garde que les docs `contentType: "slide"` dont au moins un bloc serait
 * renommé par `toSlideBlocks` — ceux déjà dans l'univers slide sont exclus du
 * détail (seulement comptés dans `clean`), comme le fait `MigrateSheet` pour
 * les fichiers sans avertissement.
 */
export async function runSlideRepair({
    mode = "dry-run",
    deps = defaultDeps,
}: {
    mode?: SlideRepairMode;
    deps?: SlideRepairRunnerDeps;
} = {}): Promise<SlideRepairResult> {
    const db = await deps.connectToDB();
    const docs = await db
        .collection<SlideDoc>("course_content")
        .find({ contentType: "slide" })
        .toArray();

    const stats: SlideRepairResult = {
        mode,
        total: docs.length,
        clean: 0,
        convertible: 0,
        warning: 0,
        error: 0,
        results: [],
    };

    for (const doc of docs) {
        const before = doc.blocks ?? [];
        const convertibleCount = countConvertible(before);

        if (convertibleCount === 0) {
            stats.clean++;
            continue;
        }

        const after = toSlideBlocks(before);
        const remainingUnrenderable = findUnrenderableTypes(after);
        const section = `${doc.moduleSlug}/${doc.sectionSlug}`;
        const contentId = String(doc._id);

        if (mode === "dry-run") {
            stats.convertible++;
            if (remainingUnrenderable.length) stats.warning++;
            stats.results.push({
                section,
                contentId,
                version: doc.version,
                rootTypesBefore: [...new Set(before.map((b) => b.type))],
                blocksConverted: convertibleCount,
                remainingUnrenderable,
                status: remainingUnrenderable.length ? "warning" : "convertible",
            });
            continue;
        }

        try {
            await backupBeforeWrite(db, doc, before);
            await db.collection<SlideDoc>("course_content").updateOne(
                { _id: doc._id as never },
                { $set: { blocks: after as Block[], updatedAt: new Date() }, $inc: { version: 1 } },
            );
            stats.convertible++;
            if (remainingUnrenderable.length) stats.warning++;
            stats.results.push({
                section,
                contentId,
                version: doc.version + 1,
                rootTypesBefore: [...new Set(before.map((b) => b.type))],
                blocksConverted: convertibleCount,
                remainingUnrenderable,
                status: remainingUnrenderable.length ? "warning" : "converted",
            });
        } catch (err) {
            stats.error++;
            stats.results.push({
                section,
                contentId,
                version: doc.version,
                rootTypesBefore: [...new Set(before.map((b) => b.type))],
                blocksConverted: convertibleCount,
                remainingUnrenderable,
                status: "error",
                error: (err as Error).message,
            });
        }
    }

    return stats;
}

/**
 * Sauvegarde les blocs d'avant conversion dans une collection dédiée avant
 * toute écriture — équivalent du fichier JSON écrit par
 * `src/scripts/migrate-slide-blocks.ts`, mais accessible sans shell sur le
 * serveur de prod (build standalone, filesystem non consultable depuis l'UI).
 */
async function backupBeforeWrite(db: Db, doc: SlideDoc, blocksBefore: Block[]): Promise<void> {
    await db.collection("course_content_backups").insertOne({
        originalId: doc._id,
        moduleSlug: doc.moduleSlug,
        sectionSlug: doc.sectionSlug,
        contentType: doc.contentType,
        versionBefore: doc.version,
        blocksBefore,
        reason: "slide-repair:section-to-slide",
        createdAt: new Date(),
    });
}
