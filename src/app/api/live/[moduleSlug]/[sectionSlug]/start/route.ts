import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export async function POST(_req: Request, { params }: Ctx) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { moduleSlug, sectionSlug } = await params;
    const state = liveRegistry.start(`${moduleSlug}/${sectionSlug}`, session.user.name ?? "Présentateur");
    return NextResponse.json({ live: true, state });
}
