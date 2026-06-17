import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// RFC 8414 — quand l'issuer vaut https://domain/api/auth, les clients OAuth
// construisent l'URL de découverte sous la forme :
//   /.well-known/oauth-authorization-server/api/auth   (Construct 1)
// Next.js dispatche alors vers ce catch-all [...all].
// On réécrit vers la même cible que la route parente pour que better-auth
// reconnaisse le chemin et serve les métadonnées correctes.
const { GET: betterAuthHandler } = toNextJsHandler(auth);

function rewriteToDiscoveryPath(req: Request): Request {
    const url = new URL(req.url);
    url.pathname = "/.well-known/oauth-authorization-server/api/auth";
    return new Request(url, { method: req.method, headers: req.headers });
}

export async function GET(req: Request): Promise<Response> {
    return betterAuthHandler(rewriteToDiscoveryPath(req));
}

export async function HEAD(req: Request): Promise<Response> {
    return betterAuthHandler(rewriteToDiscoveryPath(req));
}
