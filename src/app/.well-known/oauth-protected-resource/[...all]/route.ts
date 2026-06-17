export const runtime = "nodejs";

// RFC 9728 — catch-all pour /.well-known/oauth-protected-resource/{path}
// Ex : /.well-known/oauth-protected-resource/api/mcp (RFC 9728 §3)
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
