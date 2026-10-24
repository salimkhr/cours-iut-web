/**
 * En-têtes de sécurité et contrôle d'origine, appliqués par `src/proxy.ts`.
 *
 * Pas de CSP `script-src` / `connect-src` : les aperçus de code (`srcDoc` dans
 * CodeWithPreviewCard, InputCard) héritent de la CSP de la page, et une politique
 * stricte casserait les exemples des cours qui chargent un script, une image ou font
 * un `fetch` vers un tiers — sans compter Turnstile et Monaco (CDN). Une CSP à nonce
 * imposerait en outre le rendu dynamique de toutes les pages. La CSP se limite donc à
 * interdire l'intégration du site dans un cadre tiers (clickjacking).
 */

type HeaderTarget = {headers: Headers};

export function applySecurityHeaders<T extends HeaderTarget>(res: T): T {
    // Clickjacking : seul le site lui-même peut s'afficher dans un cadre.
    res.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    if (process.env.NODE_ENV === "production") {
        // Ignoré par les navigateurs sur une réponse HTTP : sans effet hors HTTPS.
        res.headers.set("Strict-Transport-Security", "max-age=31536000");
    }
    return res;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Hôte public de la requête : derrière Dokploy, l'en-tête transmis par le proxy inverse. */
function requestHost(headers: Headers): string | null {
    return headers.get("x-forwarded-host")?.split(",")[0].trim() || headers.get("host");
}

/**
 * Requête d'écriture émise depuis un autre site (CSRF).
 *
 * Les navigateurs envoient `Sec-Fetch-Site` et `Origin` ; un appel serveur à serveur
 * (sync staging → prod, Scalekit) n'envoie ni l'un ni l'autre et n'est donc pas visé.
 * `same-site` est refusé aussi : staging et prod sont deux sous-domaines du même site.
 */
export function isCrossSiteWrite(method: string, headers: Headers): boolean {
    if (SAFE_METHODS.has(method.toUpperCase())) return false;

    const fetchSite = headers.get("sec-fetch-site");
    if (fetchSite) return fetchSite !== "same-origin" && fetchSite !== "none";

    const origin = headers.get("origin");
    if (!origin) return false;
    try {
        return new URL(origin).host !== requestHost(headers);
    } catch {
        return true;
    }
}
