/**
 * register-scalekit-oidc-client.ts
 *
 * Enregistre Scalekit comme client OAuth/OIDC de better-auth, via son endpoint
 * DCR (`/api/auth/oauth2/register`, déjà activé par allowUnauthenticatedClientRegistration).
 *
 * Principe : AUCUN accès MongoDB direct aux collections d'auth. better-auth fait
 * évoluer son schéma interne entre versions ; on passe donc par son API, jamais
 * par un insert dans la collection `oauthClient`.
 *
 * À lancer une seule fois. Affiche le client_id/client_secret à coller dans la
 * connexion OIDC du dashboard Scalekit.
 *
 * Usage (depuis la racine) :
 *   BASE_URL=https://<domaine> SCALEKIT_OIDC_REDIRECT_URI=<callback Scalekit> \
 *     bun run scripts/register-scalekit-oidc-client.ts
 */

const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const redirectUri = process.env.SCALEKIT_OIDC_REDIRECT_URI;

if (!redirectUri) {
    console.error("Erreur : SCALEKIT_OIDC_REDIRECT_URI manquant (callback OIDC fourni par Scalekit).");
    process.exit(1);
}

const res = await fetch(`${base}/api/auth/oauth2/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        client_name: "scalekit-broker",
        redirect_uris: [redirectUri],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_basic",
        scope: "openid profile email",
    }),
});

if (!res.ok) {
    console.error("Échec de l'enregistrement :", res.status, await res.text());
    process.exit(1);
}

const data = (await res.json()) as { client_id?: string; client_secret?: string };

if (!data.client_id || !data.client_secret) {
    console.error("Réponse inattendue de better-auth :", JSON.stringify(data));
    process.exit(1);
}

console.log("Client enregistré via l'API better-auth. À coller dans la connexion OIDC Scalekit :");
console.log("  client_id     :", data.client_id);
console.log("  client_secret :", data.client_secret);

// Rend le fichier un module ES (requis pour le top-level await en TS).
export {};
