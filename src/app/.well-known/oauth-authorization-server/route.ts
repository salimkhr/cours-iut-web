import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// RFC 8414 — OAuth Authorization Server Metadata, emplacement standard.
// Les clients OAuth génériques (dont Claude.ai) suivent la RFC et requêtent
// /.well-known/oauth-authorization-server à la racine du domaine.
//
// Le handler de @better-auth/oauth-provider ne reconnaît en interne que deux
// formes de chemin absolu pour cet endpoint (cf. authServerMetadataPaths dans
// le plugin), toutes deux dérivées de issuerPath = /api/auth :
//   - /.well-known/oauth-authorization-server/api/auth
//   - /api/auth/.well-known/oauth-authorization-server
// Le chemin RFC nu (/.well-known/oauth-authorization-server) n'y figure pas :
// le plugin le 404 lui-même, même si Next.js dispatche bien la requête ici.
//
// On réécrit donc le pathname vers /.well-known/oauth-authorization-server/api/auth
// avant de déléguer : c'est la forme servie par la route voisine
// ./api/auth/route.ts, dont on a vérifié en live qu'elle renvoie 200 avec les
// métadonnées correctes. On délègue au même auth.handler par ce chemin éprouvé.
const { GET: betterAuthHandler } = toNextJsHandler(auth);

function rewriteToDiscoveryPath(req: Request): Request {
    const url = new URL(req.url);
    url.pathname = "/.well-known/oauth-authorization-server/api/auth";
    return new Request(url, { method: req.method, headers: req.headers });
}

export async function GET(req: Request): Promise<Response> {
    console.log("[DISCOVERY] oauth-authorization-server appelé depuis", req.headers.get("user-agent"));
    const res = await betterAuthHandler(rewriteToDiscoveryPath(req));
    console.log("[DISCOVERY] oauth-authorization-server status:", res.status);
    return res;
}

export async function HEAD(req: Request): Promise<Response> {
    return betterAuthHandler(rewriteToDiscoveryPath(req));
}
