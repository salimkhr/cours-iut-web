import { getPublicOrigin } from "@/lib/publicOrigin";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const origin = getPublicOrigin(req);
    const env = process.env.SCALEKIT_ENVIRONMENT_URL;
    const resourceId = process.env.SCALEKIT_RESOURCE_ID;
    // Voir route.ts (base) : l'AS Scalekit est scopé ressource (<env>/resources/<resourceId>).
    const authServer = env && resourceId ? `${env}/resources/${resourceId}` : env;
    return Response.json(
        {
            resource: `${origin}/api/mcp`,
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
