import type { Db } from "mongodb";
import { connectToDB } from "@/lib/mongodb";
import {
    parseFile,
    deriveSlug,
    getAllTSXFiles,
    upsertContent,
    updateContentRef,
} from "@/scripts/migrate-to-db";

export type MigrationMode = "default" | "dry-run" | "force";
export type MigrationFileStatus = "dry-run" | "written" | "warning" | "ignored" | "error";

type ParsedFile = ReturnType<typeof parseFile>;
type ContentSlugs = ReturnType<typeof deriveSlug>;

type ExistingContent = {
    moduleSlug?: string;
    sectionSlug?: string;
    contentType?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

export type MigrationFileResult = {
    file: string;
    blocks: number;
    warnings: string[];
    status: MigrationFileStatus;
    error?: string;
    skippedReason?: "edited-after-migration";
};

export type MigrationResult = {
    mode: MigrationMode;
    ok: number;
    warn: number;
    ignored: number;
    error: number;
    total: number;
    results: MigrationFileResult[];
};

export type MigrationRunnerDeps = {
    connectToDB: () => Promise<Db>;
    getAllTSXFiles: (dir: string) => string[];
    deriveSlug: (filePath: string) => ContentSlugs;
    parseFile: (filePath: string) => ParsedFile;
    upsertContent: (db: Db, slugs: ContentSlugs, blocks: ParsedFile["blocks"]) => Promise<string>;
    updateContentRef: (db: Db, slugs: ContentSlugs, contentId: string) => Promise<boolean>;
};

const defaultDeps: MigrationRunnerDeps = {
    connectToDB,
    getAllTSXFiles,
    deriveSlug,
    parseFile,
    upsertContent,
    updateContentRef,
};

function contentKey(slugs: ContentSlugs): string {
    return `${slugs.moduleSlug}/${slugs.sectionSlug}/${slugs.contentType}`;
}

function hasBeenEditedAfterMigration(content: ExistingContent): boolean {
    const createdAt = content.createdAt ? new Date(content.createdAt).getTime() : 0;
    const updatedAt = content.updatedAt ? new Date(content.updatedAt).getTime() : 0;
    return updatedAt - createdAt > 60_000;
}

async function getEditedContentKeys(db: Db): Promise<Set<string>> {
    const existing = await db.collection("course_content").find().toArray() as ExistingContent[];
    return new Set(
        existing
            .filter(hasBeenEditedAfterMigration)
            .map((content) => `${content.moduleSlug}/${content.sectionSlug}/${content.contentType}`),
    );
}

export function parseMigrationMode(value: unknown): MigrationMode | null {
    if (value === undefined || value === null || value === "default") return "default";
    if (value === "dry-run" || value === "force") return value;
    return null;
}

export async function runCourseContentMigration({
    mode = "default",
    module,
    deps = defaultDeps,
}: {
    mode?: MigrationMode;
    module?: string;
    deps?: MigrationRunnerDeps;
} = {}): Promise<MigrationResult> {
    let files = deps.getAllTSXFiles("src/cours");
    if (module) {
        files = files.filter((file) => file.replace(/\\/g, "/").includes(`/cours/${module}/`));
    }

    const stats: MigrationResult = {
        mode,
        ok: 0,
        warn: 0,
        ignored: 0,
        error: 0,
        total: files.length,
        results: [],
    };

    if (files.length === 0) return stats;

    const db = mode === "dry-run" ? null : await deps.connectToDB();
    const editedKeys = db && mode !== "force" ? await getEditedContentKeys(db) : new Set<string>();

    for (const filePath of files) {
        const rel = filePath.replace(/\\/g, "/").replace("src/cours/", "");

        let slugs: ContentSlugs;
        try {
            slugs = deps.deriveSlug(filePath);
        } catch {
            stats.results.push({ file: rel, blocks: 0, warnings: [], status: "error", error: "chemin non reconnu" });
            stats.error++;
            continue;
        }

        let parsed: ParsedFile;
        try {
            parsed = deps.parseFile(filePath);
        } catch (err) {
            stats.results.push({
                file: rel,
                blocks: 0,
                warnings: [],
                status: "error",
                error: (err as Error).message,
            });
            stats.error++;
            continue;
        }

        if (mode === "dry-run") {
            stats.results.push({
                file: rel,
                blocks: parsed.blocks.length,
                warnings: parsed.warnings,
                status: "dry-run",
            });
            if (parsed.warnings.length) stats.warn++;
            else stats.ok++;
            continue;
        }

        if (editedKeys.has(contentKey(slugs))) {
            stats.results.push({
                file: rel,
                blocks: parsed.blocks.length,
                warnings: parsed.warnings,
                status: "ignored",
                skippedReason: "edited-after-migration",
            });
            stats.ignored++;
            continue;
        }

        try {
            const contentId = await deps.upsertContent(db!, slugs, parsed.blocks);
            const declared = await deps.updateContentRef(db!, slugs, contentId);
            const warnings = [...parsed.warnings];
            if (!declared) warnings.push("section absente de `modules` : contenu orphelin");

            stats.results.push({
                file: rel,
                blocks: parsed.blocks.length,
                warnings,
                status: warnings.length ? "warning" : "written",
            });
            if (warnings.length) stats.warn++;
            else stats.ok++;
        } catch (err) {
            stats.results.push({
                file: rel,
                blocks: 0,
                warnings: [],
                status: "error",
                error: (err as Error).message,
            });
            stats.error++;
        }
    }

    return stats;
}
