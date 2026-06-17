export const runtime = "nodejs";

// RFC 9728 — OAuth 2.0 Protected Resource Metadata.
// Construct 1 : /.well-known/oauth-protected-resource/{resource-path}
// Quand claude.ai découvre le serveur MCP à /api/mcp, il construit l'URL
//   https://host/.well-known/oauth-protected-resource/api/mcp
// et inclut resource=https://host/api/mcp dans la demande de token,
// ce qui déclenche l'émission d'un JWT par better-auth (audience = /api/mcp).

type Params = Promise<{ all: string[] }>;

export async function GET(req: Request, { params }: { params: Params }): Promise<Response> {
    const { all } = await params;
    const { origin } = new URL(req.url);
    const resourcePath = `/${all.join("/")}`;

    return Response.json({
        resource: `${origin}${resourcePath}`,
        authorization_servers: [`${origin}/api/auth`],
        bearer_methods_supported: ["header"],
    }, {
        headers: { "Cache-Control": "no-store" },
    });
}

export async function HEAD(req: Request, { params }: { params: Params }): Promise<Response> {
    const res = await GET(req, { params });
    return new Response(null, { status: res.status, headers: res.headers });
}
