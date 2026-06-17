export const runtime = "nodejs";

// RFC 9728 — OAuth Protected Resource Metadata
// Indique à claude.ai que l'auth server est sur le même origin que le MCP server.
// Sans cet endpoint, le client MCP (spec 2025-11-25) ne sait pas où chercher
// le serveur OAuth et fait ses requêtes MCP sans token Bearer.
export async function GET(req: Request): Promise<Response> {
    const { origin } = new URL(req.url);
    return Response.json(
        {
            resource: `${origin}/api/mcp`,
            authorization_servers: [origin],
        },
        {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store",
            },
        }
    );
}
