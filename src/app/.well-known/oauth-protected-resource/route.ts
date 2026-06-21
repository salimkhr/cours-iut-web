import { getPublicOrigin } from "@/lib/publicOrigin";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const origin = getPublicOrigin(req);
    const env = process.env.SCALEKIT_ENVIRONMENT_URL;
    const resourceId = process.env.SCALEKIT_RESOURCE_ID;
    // Scalekit sert la métadonnée d'Authorization Server (avec registration_endpoint
    // pour la DCR) à un chemin SCOPÉ RESSOURCE : <env>/resources/<resourceId>.
    // Pointer vers l'URL nue renvoie 404 → claude.ai croit la DCR non supportée.
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
