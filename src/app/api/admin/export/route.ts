import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { buildExportPayload } from "@/lib/admin/buildExportPayload";

export const GET = withAdmin(async (req: Request): Promise<Response> => {
    try {
        const modulePath = new URL(req.url).searchParams.get("module") ?? undefined;
        const payload = await buildExportPayload(modulePath);

        if (modulePath && payload.modules.length === 0) {
            return NextResponse.json({ error: `Module "${modulePath}" introuvable` }, { status: 404 });
        }

        const filename = modulePath ? `module-${modulePath}-export.json` : "modules-export.json";

        return new Response(JSON.stringify(payload, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to export modules" }, { status: 500 });
    }
});
