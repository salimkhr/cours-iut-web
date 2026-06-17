export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const { origin } = new URL(req.url);
    console.log("[DISCOVERY] oauth-protected-resource (base) appelé depuis", req.headers.get("user-agent"));
    return Response.json(
        {
            resource: `${origin}/api/mcp`,
            // L'issuer better-auth est <origin>/api/auth (et non <origin>) : le
            // document RFC 8414 renvoie issuer=<origin>/api/auth. authorization_servers
            // DOIT donc pointer vers /api/auth, sinon claude.ai construit le well-known
            // à la racine, obtient un issuer qui ne matche pas, et rejette (RFC 8414 §3.3).
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
