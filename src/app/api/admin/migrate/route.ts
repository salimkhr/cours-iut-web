import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import {
    parseFile,
    deriveSlug,
    getAllTSXFiles,
    upsertContent,
    updateContentRef,
} from "@/scripts/migrate-to-db";
import { withAdmin } from "@/lib/withAdmin";

export const POST = withAdmin(async (req: Request) => {
    const body = await req.json().catch(() => ({})) as { module?: string };
    const moduleFilter: string | undefined = body.module;

    let files = getAllTSXFiles("src/cours");
    if (moduleFilter) {
        files = files.filter(f => f.replace(/\\/g, "/").includes(`/cours/${moduleFilter}/`));
    }

    if (files.length === 0) {
        return NextResponse.json({ ok: 0, warn: 0, error: 0, total: 0, results: [] });
    }

    const db = await connectToDB();
    const results: { file: string; blocks: number; warnings: string[]; error?: string }[] = [];
    let ok = 0, warn = 0, error = 0;

    for (const filePath of files) {
        const rel = filePath.replace(/\\/g, "/").replace("src/cours/", "");

        let slugs: ReturnType<typeof deriveSlug>;
        try {
            slugs = deriveSlug(filePath);
        } catch {
            results.push({ file: rel, blocks: 0, warnings: [], error: "chemin non reconnu" });
            error++;
            continue;
        }

        let blocks: ReturnType<typeof parseFile>["blocks"];
        let warnings: string[];
        try {
            ({ blocks, warnings } = parseFile(filePath));
        } catch (err) {
            results.push({ file: rel, blocks: 0, warnings: [], error: (err as Error).message });
            error++;
            continue;
        }

        try {
            const contentId = await upsertContent(db, slugs, blocks);
            await updateContentRef(db, slugs, contentId);
            results.push({ file: rel, blocks: blocks.length, warnings });
            if (warnings.length) warn++;
            else ok++;
        } catch (err) {
            results.push({ file: rel, blocks: 0, warnings: [], error: (err as Error).message });
            error++;
        }
    }

    return NextResponse.json({ ok, warn, error, total: files.length, results });
});
