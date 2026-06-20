# Design — MCP unique avec OAuth délégué à Scalekit

- **Date** : 2026-06-20
- **Statut** : validé en brainstorming, en attente de relecture avant plan d'implémentation
- **Auteur** : Salim + Claude

## 1. Contexte et problème

Le repo contient **trois** implémentations MCP redondantes pour éditer le contenu
pédagogique (arbre de blocs en base) :

| Variante | Fichier | Transport | Auth | Cache Next |
|---|---|---|---|---|
| HTTP (claude.ai) | `src/app/api/mcp/route.ts` | HTTP streamable | OAuth/Bearer via better-auth | ✅ `revalidateTag` |
| stdio → REST admin | `src/mcp/server.ts` | stdio | Cookie `MCP_ADMIN_TOKEN` | ✅ (via REST) |
| stdio → Mongo direct | `mcp-server/` (package) | stdio | Aucune | ❌ écrit sans invalider |

Le flux OAuth de la route HTTP ne fonctionne pas : better-auth (`@better-auth/oauth-provider`)
joue le rôle d'Authorization Server complet pour claude.ai (DCR, PKCE, discovery RFC 8414/9728),
et la chaîne de découverte casse derrière le proxy Dokploy/Cloudflare (mismatch d'issuer,
dépendance fragile à `BETTER_AUTH_URL`). Voir les 6 derniers commits `debug(mcp-auth)`.

### Objectifs

1. **Un seul MCP** maintenu (supprimer les deux variantes stdio).
2. **Déléguer l'OAuth à un tiers** (Scalekit) pour sortir de la maintenance de l'AS maison.
3. **Préserver la base d'utilisateurs better-auth/Mongo** comme source de vérité d'identité et de
   rôle (le tiers est un *broker* devant better-auth, pas un IdP de remplacement).

### Non-objectifs (YAGNI)

- Pas de migration de la base utilisateurs vers le tiers.
- Pas de gestion de rôles côté tiers : le rôle reste dans Mongo (`user.role`).
- L'accès lecture étudiant est cadré mais **pas implémenté ici** (la route le permet déjà).

## 2. Décisions actées (brainstorming)

| Décision | Choix retenu |
|---|---|
| MCP à garder | `src/app/api/mcp/route.ts` (HTTP, cache-aware) |
| MCP à supprimer | `mcp-server/` + `src/mcp/server.ts` |
| Client cible | claude.ai (web) → impose OAuth 2.1 + DCR |
| Modèle d'auth | OAuth délégué à un tiers |
| Position du tiers | **Broker devant better-auth** (fédération OIDC) |
| Fournisseur | **Scalekit** (MCP-first, drop-in OAuth 2.1, scopes par outil) |
| Login phase 1 | **Fédérer better-auth dès maintenant** (connexion OIDC dans Scalekit) |
| Plugin `oauthProvider` | **Gardé**, désormais actif comme IdP amont de Scalekit |

## 3. Architecture cible

```
claude.ai
   │  OAuth 2.1 + DCR + PKCE + discovery (RFC 8414/9728)
   ▼
Scalekit (Authorization Server)                ← absorbe toute la complexité claude.ai
   │  OIDC standard, client STATIQUE (pas de DCR ici)
   ▼
better-auth /api/auth (OIDC IdP)               ← login existant : /login, Turnstile, sessions
   │  l'utilisateur s'authentifie avec son compte Mongo
   ▼
Scalekit émet un JWT RS256
   │  aud = https://<domaine>/api/mcp   iss = environnement Scalekit
   ▼
/api/mcp (Resource Server)
   │  1. scalekit.validateToken(token, { audience: [resourceId] })  → JWKS, iss, aud, exp
   │  2. email/sub du JWT → lookup user dans Mongo → role
   ▼
Outils MCP : lecture (tout user authentifié) / écriture (role === 'admin')
```

**Point clé** : better-auth n'est plus exposé à claude.ai. Il devient un IdP OIDC consommé par un
**client statique** (Scalekit), enregistré une seule fois. On configure les endpoints better-auth
explicitement dans Scalekit → la découverte fragile derrière le proxy n'est plus sur le chemin
critique de claude.ai.

L'autorisation repose sur **l'email vérifié → rôle Mongo**, indépendamment du moyen de login.
C'est ce qui rend l'accès étudiant (phase 2) purement additif.

## 4. Changements par fichier

### À supprimer
- `mcp-server/` (dossier + `package.json` + `node_modules` + `dist`).
- `src/mcp/server.ts` et la variable `MCP_ADMIN_TOKEN`.
- Toute référence dans `package.json` (scripts) et dans une éventuelle config Claude Desktop.

### `src/app/api/mcp/route.ts`
- Remplacer `validateToken()` : au lieu d'appeler `auth.handler(.../oauth2/userinfo)`, valider le
  JWT Scalekit via `@scalekit-sdk/node` :
  ```ts
  const { sub, email } = await scalekit.validateToken(token, { audience: [RESOURCE_ID] });
  ```
- Conserver le lookup Mongo `user` pour récupérer `role` (clé = email vérifié, fallback `sub`).
- Conserver le reste : factory `buildMcpServer`, `isAdmin`, `validateBlockTree`, `revalidateTag`,
  transport `WebStandardStreamableHTTPServerTransport`.
- `WWW-Authenticate` du 401 : `resource_metadata` continue de pointer vers
  `/.well-known/oauth-protected-resource`.
- Retirer les `console.log` de debug une fois le flux validé.

### `src/app/.well-known/oauth-protected-resource/route.ts` (+ `[...all]`)
- `authorization_servers` pointe vers **l'environnement Scalekit** au lieu de `${origin}/api/auth`.
- `resource` reste `${origin}/api/mcp`.

### `src/lib/auth.ts`
- Garder `oauthProvider` + `jwt`. Retirer la config `validAudiences` liée à `/api/mcp`
  (devient sans objet — Scalekit ne demande plus `resource=` à better-auth).
- Enregistrer **Scalekit comme client OAuth statique** dans better-auth : `client_id`/`client_secret`
  dédiés, `redirect_uri` = URL de callback Scalekit. (Création en base `oauth_application` ou via
  l'endpoint d'enregistrement, une seule fois.)

### Config Scalekit (dashboard, hors repo)
- Créer un serveur MCP : Server URL = `https://<domaine>/api/mcp`, activer **DCR** et **CIMD**.
- Ajouter une **connexion OIDC** pointant vers better-auth (`issuer`, `authorize`, `token`,
  `userinfo`, `jwks` explicites) + le `client_id`/`client_secret` statiques ci-dessus.

### Variables d'environnement (serveur uniquement, jamais `NEXT_PUBLIC_`)
- `SCALEKIT_ENVIRONMENT_URL`
- `SCALEKIT_CLIENT_ID`
- `SCALEKIT_CLIENT_SECRET`
- `SCALEKIT_RESOURCE_ID` (audience attendue dans le JWT)
- `BETTER_AUTH_URL` doit rester le domaine public (déjà requis pour que l'issuer OIDC vu par
  Scalekit soit correct).

### Dépendances
- Ajouter `@scalekit-sdk/node` au `package.json` racine. (Rappel CLAUDE.md §9 : valider
  `bun run build` après modif de `package.json`.)

## 5. Modèle d'autorisation

| Outil | Accès |
|---|---|
| `list_modules`, `list_sections`, `get_content`, `get_migration_status`, `list_block_types` | tout utilisateur authentifié (prépare la lecture étudiante) |
| `save_content`, `delete_content`, `insert_block`, `edit_block`, `delete_block`, `reorder_blocks` | `role === 'admin'` uniquement (logique existante `isAdmin`) |

La résolution du rôle : JWT Scalekit → email → `db.collection('user').findOne({ email })` →
`role`. Si aucun user Mongo ne matche, accès refusé (401/403).

## 6. Phasage

- **Phase 1 (cette spec)** : fédération better-auth opérationnelle, prof (admin) édite via claude.ai.
- **Phase 2 (hors scope)** : lecture seule pour les étudiants — déjà permise par la route ; ne
  nécessitera que d'autoriser leurs comptes à passer par la connexion OIDC Scalekit.

## 7. Risques et points à vérifier

1. **Fédération OIDC custom dans Scalekit** : la doc quickstart MCP de Scalekit détaille la
   validation de token mais peu la connexion à un IdP OIDC *custom* (better-auth). À confirmer
   lors du setup que Scalekit accepte better-auth comme connexion OIDC générique (sinon repli
   possible : Google social en phase 1, fédération en phase 2).
2. **Discovery better-auth → Scalekit** : `/api/auth/.well-known/openid-configuration` doit
   renvoyer des URLs publiques correctes (dépend de `BETTER_AUTH_URL`). À tester côté serveur.
3. **Forme de `validateToken`** du SDK (claims `email` vs `sub`) à confirmer sur la version
   installée de `@scalekit-sdk/node`.
4. **Pricing / free tier Scalekit** pour l'usage MCP — à valider à la création du compte (projet IUT).

## 8. Vérification

- **Unitaire** : `validateToken` accepte un JWT Scalekit valide (aud/iss/exp OK) ; rejette token
  absent → 401 + `WWW-Authenticate` ; rejette token d'audience incorrecte.
- **Authz** : un user non-admin obtient les outils de lecture mais un `insert_block` renvoie
  `Forbidden`.
- **Bout-en-bout** : connexion de claude.ai au MCP via Scalekit (login better-auth), puis
  `list_modules` (lecture) et un `insert_block` (écriture admin) ; vérifier l'invalidation du cache
  (le site reflète la modif).
- `bun run build` passe après ajout de la dépendance et des modifs.

## 9. Sources

- Scalekit — Add OAuth 2.1 authorization to MCP servers : https://docs.scalekit.com/authenticate/mcp/quickstart/
- Scalekit — OAuth authorization server for MCP servers : https://docs.scalekit.com/mcp/quickstart/
- WorkOS — Best providers for MCP server authentication 2026 : https://workos.com/blog/best-mcp-server-authentication-providers
- Stytch — OAuth for MCP explained : https://stytch.com/blog/oauth-for-mcp-explained-with-a-real-world-example/
- Descope — Inbound Apps (use cases) : https://docs.descope.com/identity-federation/inbound-apps/inbound-apps-use-cases
- MCP — Authorization spec : https://modelcontextprotocol.io/specification/draft/basic/authorization
