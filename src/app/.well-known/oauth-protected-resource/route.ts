import { getPublicOrigin } from "@/lib/publicOrigin";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const origin = getPublicOrigin(req);
    const authServer = process.env.SCALEKIT_ENVIRONMENT_URL;
    return Response.json(
        {
            resource: `${origin}/api/mcp`,
            // L'Authorization Server est désormais Scalekit (broker devant better-auth).
            // claude.ai découvre Scalekit ici, puis y fait sa DCR.
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
