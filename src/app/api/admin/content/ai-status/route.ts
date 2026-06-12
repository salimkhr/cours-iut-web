import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

type OllamaTagsResponse = { models?: { name: string; size?: number }[] };
type OllamaVersionResponse = { version?: string };

export const GET = withAdmin(async () => {
    try {
        const [versionRes, tagsRes] = await Promise.all([
            fetch(`${OLLAMA_BASE_URL}/api/version`, { signal: AbortSignal.timeout(3000) }),
            fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) }),
        ]);

        if (!versionRes.ok || !tagsRes.ok) {
            return NextResponse.json({ connected: false, models: [], version: null });
        }

        const version = await versionRes.json() as OllamaVersionResponse;
        const tags = await tagsRes.json() as OllamaTagsResponse;
        const models = tags.models?.map((m) => m.name) ?? [];

        return NextResponse.json({ connected: true, version: version.version ?? null, models });
    } catch {
        return NextResponse.json({ connected: false, models: [], version: null });
    }
});
