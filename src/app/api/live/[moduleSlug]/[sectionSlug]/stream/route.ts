import { liveRegistry } from "@/lib/live/LiveSessionRegistry";
import type { LiveSessionState } from "@/lib/live/liveTypes";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

// SSE : flux long-vivant, jamais mis en cache, rendu dynamique.
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: Ctx) {
    const { moduleSlug, sectionSlug } = await params;
    const sessionId = `${moduleSlug}/${sectionSlug}`;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const send = (event: string, data: unknown) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            // État initial (ou "no session")
            const initial = liveRegistry.get(sessionId);
            send("state", { live: initial !== null, state: initial });

            const onState = (st: LiveSessionState) => send("state", { live: true, state: st });
            const onEnd = () => send("ended", { live: false, state: null });
            const unsub = liveRegistry.subscribe(sessionId, onState, onEnd);

            // Heartbeat anti-timeout proxy
            const ping = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 20_000);

            const close = () => {
                clearInterval(ping);
                unsub();
                try { controller.close(); } catch { /* déjà fermé */ }
            };
            req.signal.addEventListener("abort", close);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
