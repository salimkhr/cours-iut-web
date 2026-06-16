import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// RFC 8414 — OAuth Authorization Server Metadata, emplacement standard.
// Les clients OAuth génériques (dont Claude.ai) suivent la RFC et requêtent
// /.well-known/oauth-authorization-server à la racine du domaine.
//
// Le handler de @better-auth/oauth-provider ne reconnaît en interne que deux
// formes de chemin absolu pour cet endpoint (cf. authServerMetadataPaths dans
// le plugin) :
//   - /.well-known/oauth-authorization-server{basePath}  (satisfait par la
//     route voisine ./api/auth/route.ts, dont le chemin Next.js correspond
//     littéralement à cette forme)
//   - {basePath}/.well-known/oauth-authorization-server
// Sans correspondance exacte, le plugin renvoie lui-même un 404, même si
// Next.js a bien dispatché la requête vers ce fichier. On réécrit donc le
// pathname de la requête vers la seconde forme avant de déléguer au handler.
const { GET: betterAuthHandler } = toNextJsHandler(auth);

function rewriteToBasePath(req: Request): Request {
    const url = new URL(req.url);
    url.pathname = "/api/auth/.well-known/oauth-authorization-server";
    return new Request(url, { method: req.method, headers: req.headers });
}

export async function GET(req: Request): Promise<Response> {
    return betterAuthHandler(rewriteToBasePath(req));
}

export async function HEAD(req: Request): Promise<Response> {
    return betterAuthHandler(rewriteToBasePath(req));
}
