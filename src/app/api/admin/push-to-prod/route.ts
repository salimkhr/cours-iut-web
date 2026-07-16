import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { buildExportPayload } from "@/lib/admin/buildExportPayload";

export const POST = withAdmin(async (req: Request): Promise<Response> => {
    const prodUrl = process.env.PROD_SYNC_URL;
    const secret = process.env.SYNC_SECRET;
    if (!prodUrl || !secret) {
        return NextResponse.json(
            { error: "PROD_SYNC_URL et SYNC_SECRET doivent être configurés sur cet environnement" },
            { status: 503 },
        );
    }

    let modulePath: string | undefined;
    try {
        const body = await req.json() as { modulePath?: string };
        modulePath = typeof body.modulePath === "string" && body.modulePath ? body.modulePath : undefined;
    } catch {
        // Body vide ou invalide : push complet.
    }

    try {
        const payload = await buildExportPayload(modulePath);
        if (modulePath && payload.modules.length === 0) {
            return NextResponse.json({ error: `Module "${modulePath}" introuvable` }, { status: 404 });
        }

        const res = await fetch(`${prodUrl.replace(/\/+$/, "")}/api/admin/import`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-sync-secret": secret,
            },
            body: JSON.stringify(payload),
        });

        const result = await res.json().catch(() => null) as
            { inserted?: number; updated?: number; contentsUpserted?: number; error?: string } | null;

        if (!res.ok) {
            return NextResponse.json(
                { error: result?.error ?? `La prod a répondu ${res.status}` },
                { status: 502 },
            );
        }

        return NextResponse.json({
            inserted: result?.inserted ?? 0,
            updated: result?.updated ?? 0,
            contentsUpserted: result?.contentsUpserted ?? 0,
            modules: payload.modules.length,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Push vers la prod échoué (prod injoignable ?)" }, { status: 502 });
    }
});
