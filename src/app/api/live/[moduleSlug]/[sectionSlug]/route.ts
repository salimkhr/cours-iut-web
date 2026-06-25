import { NextResponse } from "next/server";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    const { moduleSlug, sectionSlug } = await params;
    const sessionId = `${moduleSlug}/${sectionSlug}`;
    const state = liveRegistry.get(sessionId);
    return NextResponse.json({ live: state !== null, state });
}
