# MCP OAuth délégué à Scalekit — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolider en un seul serveur MCP (la route HTTP Next.js) dont l'OAuth est délégué à Scalekit agissant comme broker devant better-auth, l'autorisation restant fondée sur le rôle Mongo.

**Architecture:** claude.ai parle OAuth 2.1 + DCR à Scalekit (Authorization Server). Scalekit délègue le login à better-auth via une connexion OIDC (client statique). La route `/api/mcp` valide le JWT émis par Scalekit (JWKS/audience/issuer), puis résout le rôle de l'utilisateur par email dans Mongo. Les deux serveurs MCP stdio redondants sont supprimés.

**Tech Stack:** Next.js 16 (App Router, route handlers), better-auth `@better-auth/oauth-provider` + `jwt`, `@scalekit-sdk/node`, MongoDB driver, Scalekit dashboard (config externe), bun.

**Note sur les tests :** la codebase n'a pas de harnais de test (CLAUDE.md §8) et ce travail est majoritairement de l'intégration OAuth + config externe. Pas d'ajout de Vitest. Vérification par `bun run build`, `curl`, inspection des logs, et un test bout-en-bout via claude.ai.

---

## Structure des fichiers

| Fichier | Responsabilité | Action |
|---|---|---|
| `mcp-server/` (dossier) | Ancien MCP stdio → Mongo direct | **Supprimer** |
| `src/mcp/server.ts` | Ancien MCP stdio → REST admin | **Supprimer** |
| `src/lib/scalekit.ts` | Singleton client Scalekit + validation token | **Créer** |
| `src/app/api/mcp/route.ts` | Resource Server : valider JWT Scalekit + rôle Mongo | **Modifier** |
| `src/app/.well-known/oauth-protected-resource/route.ts` | Pointer l'AS vers Scalekit | **Modifier** |
| `src/app/.well-known/oauth-protected-resource/[...all]/route.ts` | idem (catch-all) | **Modifier** |
| `src/lib/auth.ts` | Retirer `validAudiences` MCP | **Modifier** |
| `src/scripts/register-scalekit-oidc-client.ts` | Enregistrer Scalekit comme client OIDC statique dans better-auth | **Créer** |
| `package.json` | Ajouter `@scalekit-sdk/node`, retirer scripts MCP morts | **Modifier** |

---

## Task 1: Supprimer les deux MCP stdio redondants

**Files:**
- Delete: `mcp-server/` (dossier complet)
- Delete: `src/mcp/server.ts`
- Modify: `package.json` (scripts éventuels référençant ces fichiers)

- [ ] **Step 1: Repérer toutes les références aux MCP supprimés**

Run: `cd "C:\Users\Utilisateur\PhpstormProjects\cours-iut-web"; rg -n "mcp-server|src/mcp/server|MCP_ADMIN_TOKEN|NEXT_URL" --glob '!**/node_modules/**'`
Expected: lister les occurrences dans `package.json`, `.env*`, docs. Noter chaque ligne à nettoyer.

- [ ] **Step 2: Supprimer les fichiers**

```bash
git rm -r mcp-server
git rm src/mcp/server.ts
```

- [ ] **Step 3: Nettoyer `package.json`**

Retirer tout script qui lance `src/mcp/server.ts` ou le build de `mcp-server` (ex. une entrée `"mcp": "..."`). Ne PAS toucher aux scripts existants non liés (`dev`, `build`, `postbuild_*`, etc.). Si aucun script ne les référence, ne rien changer ici.

- [ ] **Step 4: Vérifier qu'il ne reste aucune référence**

Run: `rg -n "mcp-server|src/mcp/server|MCP_ADMIN_TOKEN" --glob '!**/node_modules/**'`
Expected: aucune occurrence de code (les mentions dans la spec/plan docs sont acceptables).

- [ ] **Step 5: Vérifier le build**

Run: `bun run build`
Expected: build OK (mode standalone), pas d'erreur d'import manquant.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(mcp): supprimer les 2 serveurs MCP stdio redondants

Garde uniquement la route HTTP src/app/api/mcp/route.ts (cache-aware).
mcp-server/ écrivait en direct dans Mongo sans revalidateTag.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Ajouter le SDK Scalekit et le helper client

**Files:**
- Modify: `package.json` (dépendance)
- Create: `src/lib/scalekit.ts`

- [ ] **Step 1: Installer le SDK**

Run: `bun add @scalekit-sdk/node`
Expected: ajout dans `dependencies` de `package.json` + `bun.lock` mis à jour.

- [ ] **Step 2: Créer le helper `src/lib/scalekit.ts`**

```ts
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
        throw new Error("Scalekit non configuré : SCALEKIT_ENVIRONMENT_URL / SCALEKIT_CLIENT_ID / SCALEKIT_CLIENT_SECRET manquants");
    }
    client = new ScalekitClient(envUrl, clientId, clientSecret);
    return client;
}

export interface McpIdentity {
    sub: string;
    email: string | null;
}

/**
 * Valide un access token Scalekit (JWKS, issuer, audience, expiration).
 * Retourne l'identité (sub + email) ou null si invalide.
 * `audience` doit matcher le Server URL enregistré (= SCALEKIT_RESOURCE_ID).
 */
export async function validateScalekitToken(token: string): Promise<McpIdentity | null> {
    const resourceId = process.env.SCALEKIT_RESOURCE_ID;
    if (!resourceId) throw new Error("SCALEKIT_RESOURCE_ID manquant");
    try {
        const claims = await getScalekit().validateToken(token, { audience: [resourceId] });
        const c = claims as { sub?: string; email?: string };
        if (!c.sub) return null;
        return { sub: c.sub, email: c.email ?? null };
    } catch {
        return null;
    }
}
```

> Note d'implémentation : confirmer contre la version installée de `@scalekit-sdk/node`
> la signature exacte de `validateToken` et la présence du claim `email` (risque §7.3 de la spec).
> Si `validateToken` renvoie une forme différente, adapter le mapping `c.sub`/`c.email` ici
> uniquement — le reste du plan ne dépend que de `McpIdentity`.

- [ ] **Step 3: Vérifier le build**

Run: `bun run build`
Expected: build OK (le helper n'est pas encore importé ailleurs, mais doit compiler en strict).

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock src/lib/scalekit.ts
git commit -m "feat(mcp): helper de validation des tokens Scalekit

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Configurer Scalekit + enregistrer better-auth comme IdP (setup externe)

Cette tâche est majoritairement de la configuration hors-repo (dashboard Scalekit + variables
d'env) plus un script d'enregistrement du client OIDC côté better-auth. Pas de test unitaire :
vérification par `curl` et par le test de connexion du dashboard Scalekit.

**Files:**
- Create: `src/scripts/register-scalekit-oidc-client.ts`

- [ ] **Step 1: Créer le compte/projet Scalekit et un serveur MCP**

Dans le dashboard Scalekit → **MCP servers** → New :
- Server name : `cours-iut`
- Server URL : `https://<domaine-public>/api/mcp`  (le domaine de staging/prod)
- Activer **Dynamic Client Registration (DCR)** et **Client ID Metadata Document (CIMD)**.
- Noter le **Resource ID** généré (= audience des JWT) et l'**Environment URL**.

- [ ] **Step 2: Renseigner les variables d'env (serveur uniquement)**

Dans `.env.local` (dev) et la config Dokploy (staging/prod), ajouter :
```
SCALEKIT_ENVIRONMENT_URL=https://<env>.scalekit.dev
SCALEKIT_CLIENT_ID=skc_...
SCALEKIT_CLIENT_SECRET=...
SCALEKIT_RESOURCE_ID=<resource id du serveur MCP>
```
Vérifier que `BETTER_AUTH_URL=https://<domaine-public>` est bien défini (requis pour que l'issuer
OIDC vu par Scalekit soit correct).

- [ ] **Step 3: Vérifier que better-auth expose une discovery OIDC correcte**

Démarrer l'app (`bun dev`) ou viser le domaine public, puis :
Run: `curl -s https://<domaine-public>/api/auth/.well-known/openid-configuration`
Expected: un JSON dont `issuer`, `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`,
`jwks_uri` pointent tous vers `https://<domaine-public>/api/auth/...` (pas `0.0.0.0:3000`).
Si ce n'est pas le cas → corriger `BETTER_AUTH_URL` avant d'aller plus loin.

- [ ] **Step 4: Créer le script d'enregistrement du client OIDC dans better-auth**

`src/scripts/register-scalekit-oidc-client.ts` :
```ts
/**
 * Enregistre Scalekit comme client OAuth statique de better-auth.
 * Utilise l'endpoint DCR (déjà activé : allowUnauthenticatedClientRegistration).
 * À lancer une seule fois. Affiche le client_id/client_secret à coller dans
 * la connexion OIDC du dashboard Scalekit.
 *
 * Usage:
 *   BASE_URL=https://<domaine> SCALEKIT_REDIRECT_URI=https://<env>.scalekit.dev/oidc/callback \
 *   bun run src/scripts/register-scalekit-oidc-client.ts
 */
const base = process.env.BASE_URL ?? "http://localhost:3000";
const redirectUri = process.env.SCALEKIT_REDIRECT_URI;
if (!redirectUri) {
    console.error("SCALEKIT_REDIRECT_URI manquant (URL de callback OIDC fournie par Scalekit)");
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
    console.error("Échec enregistrement:", res.status, await res.text());
    process.exit(1);
}
const data = await res.json();
console.log("Client enregistré. À coller dans la connexion OIDC Scalekit :");
console.log("  client_id     :", data.client_id);
console.log("  client_secret :", data.client_secret);
```

- [ ] **Step 5: Lancer le script et récupérer les identifiants**

Run (en remplaçant le redirect URI par celui de ta connexion OIDC Scalekit) :
`BASE_URL=https://<domaine> SCALEKIT_REDIRECT_URI=https://<env>.scalekit.dev/oidc/callback bun run src/scripts/register-scalekit-oidc-client.ts`
Expected: affichage d'un `client_id` et `client_secret`.

- [ ] **Step 6: Créer la connexion OIDC dans Scalekit**

Dashboard Scalekit → connexion **OIDC** (custom / generic) du serveur MCP :
- Issuer : `https://<domaine-public>/api/auth`
- Authorization / Token / Userinfo / JWKS : valeurs lues à l'étape 3.
- client_id / client_secret : valeurs de l'étape 5.
- Scopes : `openid profile email`.
- Lancer le **test de connexion** du dashboard.
Expected: le test de connexion Scalekit réussit (login better-auth via /login, retour OK).

> Risque §7.1 : si Scalekit n'accepte pas une connexion OIDC custom dans ton plan/offre,
> repli documenté dans la spec (Google social phase 1). Confirmer ici avant de continuer.

- [ ] **Step 7: Commit du script**

```bash
git add src/scripts/register-scalekit-oidc-client.ts
git commit -m "feat(mcp): script d'enregistrement du client OIDC Scalekit dans better-auth

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Repointer la metadata Resource vers Scalekit

**Files:**
- Modify: `src/app/.well-known/oauth-protected-resource/route.ts`
- Modify: `src/app/.well-known/oauth-protected-resource/[...all]/route.ts`

- [ ] **Step 1: Modifier la route de base**

Dans `src/app/.well-known/oauth-protected-resource/route.ts`, remplacer le corps du `GET` :
```ts
import { getPublicOrigin } from "@/lib/publicOrigin";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
    const origin = getPublicOrigin(req);
    const authServer = process.env.SCALEKIT_ENVIRONMENT_URL;
    return Response.json(
        {
            resource: `${origin}/api/mcp`,
            // L'Authorization Server est désormais Scalekit (broker devant better-auth).
            authorization_servers: authServer ? [authServer] : [],
        },
        {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-store",
            },
        }
    );
}
```

- [ ] **Step 2: Modifier la route catch-all à l'identique**

Appliquer le même corps dans `src/app/.well-known/oauth-protected-resource/[...all]/route.ts`
(garder son import et sa signature ; seul `authorization_servers` change pour pointer vers
`process.env.SCALEKIT_ENVIRONMENT_URL`).

- [ ] **Step 3: Vérifier via curl (app démarrée)**

Run: `curl -s http://localhost:3000/.well-known/oauth-protected-resource`
Expected: JSON avec `resource` = `.../api/mcp` et `authorization_servers` = `[<env scalekit>]`.

- [ ] **Step 4: Vérifier le build**

Run: `bun run build`
Expected: build OK.

- [ ] **Step 5: Commit**

```bash
git add src/app/.well-known/oauth-protected-resource
git commit -m "feat(mcp): pointer la metadata RFC 9728 vers l'AS Scalekit

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Réécrire la validation du token dans la route MCP

**Files:**
- Modify: `src/app/api/mcp/route.ts` (fonction `validateToken`, lignes ~43-86)

- [ ] **Step 1: Remplacer `validateToken` par la version Scalekit + rôle Mongo**

Dans `src/app/api/mcp/route.ts`, remplacer entièrement la fonction `validateToken` (et retirer
l'import `auth` et `getPublicOrigin` s'ils ne servent plus ailleurs — `getPublicOrigin` reste
utilisé dans `handleMcp` pour le 401, donc le garder) :

```ts
import { validateScalekitToken } from "@/lib/scalekit";
// ... (conserver les autres imports ; retirer `import { auth } from "@/lib/auth";`
//      uniquement s'il n'est plus référencé)

async function validateToken(req: Request): Promise<{ id: string; role: string } | null> {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const identity = await validateScalekitToken(authHeader.slice("Bearer ".length));
    if (!identity?.email) return null;

    const db = await connectToDB();
    const user = await db.collection("user").findOne({ email: identity.email });
    if (!user) return null;

    return { id: identity.sub, role: String(user.role ?? "user") };
}
```

> Le lookup se fait par **email vérifié** (clé stable entre Scalekit et better-auth).
> `_id` n'est plus exposé ; on garde `identity.sub` comme id opaque.

- [ ] **Step 2: Vérifier le 401 sans token**

Démarrer l'app (`bun dev`), puis :
Run: `curl -s -i -X POST http://localhost:3000/api/mcp`
Expected: `HTTP/1.1 401`, header `WWW-Authenticate: Bearer realm="cours-iut", resource_metadata="http://localhost:3000/.well-known/oauth-protected-resource"`, corps `{"error":"Unauthorized"}`.

- [ ] **Step 3: Vérifier le 401 avec token bidon**

Run: `curl -s -i -X POST -H "Authorization: Bearer faux.jeton.invalide" http://localhost:3000/api/mcp`
Expected: `HTTP/1.1 401` (token rejeté par `validateScalekitToken`).

- [ ] **Step 4: Vérifier le build**

Run: `bun run build`
Expected: build OK, aucun import inutilisé (TypeScript strict).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): valider le JWT Scalekit et résoudre le rôle via Mongo

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Nettoyer better-auth et les logs de debug

**Files:**
- Modify: `src/lib/auth.ts` (bloc `validAudiences` dans `oauthProvider`)
- Modify: `src/app/api/mcp/route.ts` (logs `[MCP]`)
- Modify: `src/app/.well-known/oauth-protected-resource/route.ts` et `[...all]/route.ts` (logs `[DISCOVERY]` si encore présents)

- [ ] **Step 1: Retirer `validAudiences` MCP de `auth.ts`**

Dans `src/lib/auth.ts`, dans l'appel `oauthProvider({ ... })`, supprimer le bloc :
```ts
validAudiences: process.env.BETTER_AUTH_URL
    ? [`${process.env.BETTER_AUTH_URL}/api/mcp`]
    : undefined,
```
ainsi que le commentaire RFC 9728/8707 associé. Conserver `allowDynamicClientRegistration`,
`allowUnauthenticatedClientRegistration`, `loginPage`, `consentPage`, `silenceWarnings`
(toujours utiles : Scalekit est un client OIDC standard de better-auth).

- [ ] **Step 2: Retirer les `console.log`/`console.error` de debug**

Supprimer dans `src/app/api/mcp/route.ts` les logs `[MCP] ...` (diagnostic) ajoutés pendant le
debug OAuth. Garder un `console.error` minimal en cas d'exception réelle si pertinent.
Supprimer les logs `[DISCOVERY] ...` restants dans les routes `.well-known`.

- [ ] **Step 3: Vérifier le build**

Run: `bun run build`
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/app/api/mcp/route.ts src/app/.well-known
git commit -m "chore(mcp): retirer validAudiences MCP et logs de debug OAuth

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Vérification bout-en-bout (claude.ai)

Pas de code : validation manuelle du flux complet sur l'environnement déployé (staging/prod), où
Scalekit et `BETTER_AUTH_URL` sont configurés.

- [ ] **Step 1: Ajouter le MCP distant dans claude.ai**

Dans claude.ai → connecteurs → ajouter le MCP `https://<domaine-public>/api/mcp`.
Expected: claude.ai déclenche le flux OAuth (découverte → Scalekit → DCR), redirige vers le login
better-auth (`/login`), puis revient connecté.

- [ ] **Step 2: Tester un outil de lecture**

Demander à Claude d'appeler `list_modules`.
Expected: liste des modules renvoyée (token validé, rôle résolu).

- [ ] **Step 3: Tester un outil d'écriture (admin)**

Avec ton compte admin, demander un `insert_block` sur un contenu de test (ex. un bloc `text`).
Expected: succès `Bloc <id> ... inséré`.

- [ ] **Step 4: Vérifier l'invalidation du cache**

Recharger la page du contenu modifié sur le site.
Expected: la modification est visible (preuve que `revalidateTag` de la route a bien agi).

- [ ] **Step 5: (optionnel) Vérifier le refus non-admin**

Avec un compte non-admin, tenter `insert_block`.
Expected: erreur `Forbidden` ; les outils de lecture restent accessibles.

---

## Auto-revue (effectuée à l'écriture)

- **Couverture spec** : §1 nettoyage → Task 1 ; §3 architecture/§4 changements → Tasks 2,4,5,6 ;
  fédération better-auth → Task 3 ; authz email→rôle → Task 5 ; vérification §8 → Tasks 4,5,7. OK.
- **Placeholders** : `<domaine-public>` / `<env>` sont des gabarits de config externe (valeurs
  réelles propres à l'environnement), pas des trous de plan. Aucun « TODO »/« TBD » de logique.
- **Cohérence des types** : `McpIdentity { sub, email }` défini en Task 2, consommé en Task 5 ;
  `validateScalekitToken` signature identique des deux côtés. `validateToken` garde son contrat
  `{ id, role } | null` attendu par `handleMcp`. OK.
- **Risques** : la forme exacte de `scalekit.validateToken` (claims) et l'acceptation d'une
  connexion OIDC custom par Scalekit sont les deux inconnues — isolées en Task 2 (helper) et
  Task 3 (setup) avec repli documenté.
