import { getPublicOrigin } from "@/lib/publicOrigin";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const origin = getPublicOrigin(req);
    const authServer = process.env.SCALEKIT_ENVIRONMENT_URL;
    return Response.json(
        {
            resource: `${origin}/api/mcp`,
            // Voir route.ts (base) : l'Authorization Server est Scalekit.
            authorization_servers: authServer ? [authServer] : [],
        },
        {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store",
            },
        }
    );
}
