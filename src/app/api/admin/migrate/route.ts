import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { parseMigrationMode, runCourseContentMigration } from "./migrationRunner";

type MigrateRequestBody = {
    module?: unknown;
    mode?: unknown;
};

export const POST = withAdmin(async (req: Request) => {
    const body = await req.json().catch(() => ({})) as MigrateRequestBody;
    const mode = parseMigrationMode(body.mode);
    if (!mode) {
        return NextResponse.json({ error: "Mode de migration invalide" }, { status: 400 });
    }

    const moduleFilter = typeof body.module === "string" && body.module.trim()
        ? body.module.trim()
        : undefined;

    const result = await runCourseContentMigration({ mode, module: moduleFilter });
    return NextResponse.json(result);
});
