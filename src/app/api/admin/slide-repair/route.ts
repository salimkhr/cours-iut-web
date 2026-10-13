import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { runSlideRepair, type SlideRepairMode } from "./slideRepairRunner";

type SlideRepairRequestBody = { mode?: unknown };

function parseMode(value: unknown): SlideRepairMode | null {
    if (value === undefined || value === null || value === "dry-run") return "dry-run";
    if (value === "apply") return "apply";
    return null;
}

export const POST = withAdmin(async (req: Request) => {
    const body = await req.json().catch(() => ({})) as SlideRepairRequestBody;
    const mode = parseMode(body.mode);
    if (!mode) {
        return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
    }

    const result = await runSlideRepair({ mode });
    return NextResponse.json(result);
});
