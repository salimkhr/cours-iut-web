/**
 * Origin public de l'application, vu depuis l'extérieur.
 *
 * Derrière le proxy Dokploy/Cloudflare, `new URL(req.url).origin` renvoie
 * l'adresse interne du container (https://0.0.0.0:3000), pas le domaine public.
 * Les documents de découverte OAuth (RFC 8414 / RFC 9728) doivent exposer des
 * URLs joignables par le client (claude.ai), donc on dérive l'origin dans cet
 * ordre de priorité :
 *   1. BETTER_AUTH_URL          — source de vérité, déjà utilisée par better-auth
 *   2. x-forwarded-proto/host   — en-têtes injectés par le proxy
 *   3. host header              — dernier recours
 *   4. origin de req.url        — fallback (dev local sans proxy)
 */
export function getPublicOrigin(req: Request): string {
    const envUrl = process.env.BETTER_AUTH_URL;
    if (envUrl) return envUrl.replace(/\/+$/, "");

    const proto = req.headers.get("x-forwarded-proto");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host) return `${proto ?? "https"}://${host}`;

    return new URL(req.url).origin;
}
