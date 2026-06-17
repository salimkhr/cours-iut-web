export const runtime = "nodejs";

// RFC 9728 — OAuth 2.0 Protected Resource Metadata, racine.
// Répond à /.well-known/oauth-protected-resource sans chemin de ressource,
// utile pour les clients qui cherchent les métadonnées à la racine du domaine.

export async function GET(req: Request): Promise<Response> {
    const { origin } = new URL(req.url);

    return Response.json({
        resource: `${origin}/api/mcp`,
        authorization_servers: [`${origin}/api/auth`],
        bearer_methods_supported: ["header"],
    }, {
        headers: { "Cache-Control": "no-store" },
    });
}

export async function HEAD(req: Request): Promise<Response> {
    const res = await GET(req);
    return new Response(null, { status: res.status, headers: res.headers });
}
