import { getPublicOrigin } from "@/lib/publicOrigin";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const origin = getPublicOrigin(req);
    const { pathname } = new URL(req.url);
    console.log("[DISCOVERY] oauth-protected-resource catch-all path:", pathname, "origin:", origin);
    return Response.json(
        {
            resource: `${origin}/api/mcp`,
            // Voir route.ts (base) : authorization_servers doit pointer vers /api/auth
            // pour que l'issuer du document RFC 8414 matche (RFC 8414 §3.3).
            authorization_servers: [`${origin}/api/auth`],
        },
        {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store",
            },
        }
    );
}
