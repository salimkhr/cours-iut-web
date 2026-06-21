import { ScalekitClient } from "@scalekit-sdk/node";

// Singleton lazy : la 1re utilisation crée le client. Les variables d'env sont
// lues à l'appel (pas au module-load) pour ne pas casser `next build`
// (NEXT_PHASE === 'phase-production-build', cf. mongodb.ts).
let client: ScalekitClient | null = null;

function getScalekit(): ScalekitClient {
    if (client) return client;
    const envUrl = process.env.SCALEKIT_ENVIRONMENT_URL;
    const clientId = process.env.SCALEKIT_CLIENT_ID;
    const clientSecret = process.env.SCALEKIT_CLIENT_SECRET;
    if (!envUrl || !clientId || !clientSecret) {
        throw new Error(
            "Scalekit non configuré : SCALEKIT_ENVIRONMENT_URL / SCALEKIT_CLIENT_ID / SCALEKIT_CLIENT_SECRET manquants"
        );
    }
    client = new ScalekitClient(envUrl, clientId, clientSecret);
    return client;
}

export interface McpIdentity {
    sub: string;
    email: string | null;
}

/**
 * Récupère l'email via le userinfo endpoint Scalekit (resource-scoped).
 * L'access token Scalekit ne porte PAS l'email dans ses claims, même quand le
 * scope `email` est accordé : il faut le lire depuis userinfo (OIDC standard).
 */
async function fetchEmailFromUserinfo(token: string): Promise<string | null> {
    const env = process.env.SCALEKIT_ENVIRONMENT_URL;
    const resourceId = process.env.SCALEKIT_RESOURCE_ID;
    if (!env || !resourceId) return null;
    try {
        const res = await fetch(`${env.replace(/\/+$/, "")}/resources/${resourceId}/userinfo`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { email?: string };
        return data.email ?? null;
    } catch {
        return null;
    }
}

/**
 * Valide un access token Scalekit (JWKS, issuer, audience, expiration) puis
 * résout l'email via userinfo (absent des claims du token).
 * Retourne l'identité (sub + email) ou null si invalide.
 * `audience` doit matcher le Resource ID du serveur MCP (= SCALEKIT_RESOURCE_ID).
 */
export async function validateScalekitToken(token: string): Promise<McpIdentity | null> {
    const resourceId = process.env.SCALEKIT_RESOURCE_ID;
    if (!resourceId) throw new Error("SCALEKIT_RESOURCE_ID manquant");
    try {
        const claims = (await getScalekit().validateToken(token, {
            audience: [resourceId],
        })) as { sub?: string; email?: string };
        if (!claims.sub) return null;

        const email = claims.email ?? (await fetchEmailFromUserinfo(token));
        return { sub: claims.sub, email };
    } catch (err) {
        // DIAG TEMPORAIRE : remonter la raison exacte de l'échec de validation.
        console.error("[MCP-DIAG] validateScalekitToken error:", err instanceof Error ? err.message : String(err));
        return null;
    }
}
