import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export async function POST(req: Request, { params }: Ctx) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { moduleSlug, sectionSlug } = await params;
    const body = await req.json().catch(() => null) as { slide?: number; step?: number } | null;
    if (!body || typeof body.slide !== "number" || typeof body.step !== "number") {
        return NextResponse.json({ error: "Position invalide" }, { status: 422 });
    }
    liveRegistry.setPosition(`${moduleSlug}/${sectionSlug}`, { slide: body.slide, step: body.step });
    return NextResponse.json({ ok: true });
}
