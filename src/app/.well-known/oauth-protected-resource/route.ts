export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const { origin } = new URL(req.url);
    console.log("[DISCOVERY] oauth-protected-resource (base) appelé depuis", req.headers.get("user-agent"));
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
