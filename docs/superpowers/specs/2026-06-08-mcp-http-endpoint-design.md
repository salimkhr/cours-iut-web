# MCP HTTP Endpoint — Design Spec

**Date:** 2026-06-08
**Statut:** Approuvé

## Contexte

Le serveur MCP existant (`src/mcp/server.ts`) utilise `StdioServerTransport` et ne fonctionne qu'avec Claude Desktop. L'objectif est d'ajouter un endpoint HTTP MCP dans l'application Next.js afin de le connecter à Claude.ai web via le formulaire "Connecteur personnalisé".

## Architecture

### Vue d'ensemble

```
Claude.ai web
  │
  ├─ GET  /.well-known/openid-configuration   → better-auth (découverte OAuth)
  ├─ GET  /api/auth/oauth2/authorize           → better-auth (login + consentement)
  ├─ POST /api/auth/oauth2/token               → better-auth (access_token JWT)
  │
  └─ POST /api/mcp  (Authorization: Bearer)
        │
        ├─ Validation token → auth.api.introspectToken()
        ├─ McpServer éphémère (stateless)
        ├─ Tools filtrés selon rôle (user | admin)
        └─ connectToDB() → MongoDB
```

### Composants

| Composant | Fichier | Rôle |
|---|---|---|
| Plugin OAuth | `src/lib/auth.ts` | `oAuthProvider` de `@better-auth/oauth-provider` |
| Endpoint MCP | `src/app/api/mcp/route.ts` | Reçoit les requêtes MCP HTTP |
| Tools MCP | inline dans `route.ts` | 8 tools avec contrôle d'accès |

## OAuth 2.0

### Package

```bash
bun add @better-auth/oauth-provider
```

Le plugin `oidcProvider` intégré à better-auth est déprécié — on utilise `@better-auth/oauth-provider`.

### Configuration dans `src/lib/auth.ts`

```ts
import { oAuthProvider } from "@better-auth/oauth-provider";

oAuthProvider({
    clients: [{
        clientId:     process.env.MCP_CLIENT_ID!,
        clientSecret: process.env.MCP_CLIENT_SECRET!,
        redirectURLs: ["https://claude.ai/oauth/callback"],
        scopes:       ["openid", "profile", "email"],
        name:         "Claude.ai",
    }],
})
```

### Endpoints exposés automatiquement

| Endpoint | Rôle |
|---|---|
| `GET /.well-known/openid-configuration` | Découverte OAuth (Claude.ai s'auto-configure) |
| `GET /api/auth/oauth2/authorize` | Login + page de consentement |
| `POST /api/auth/oauth2/token` | Échange `authorization_code` → `access_token` |
| `GET /api/auth/oauth2/userinfo` | Infos utilisateur (OpenID) |

### Variables d'environnement

```
MCP_CLIENT_ID=<uuid généré une fois>
MCP_CLIENT_SECRET=<secret généré une fois>
```

### Saisie dans le formulaire Claude.ai

- **URL** : `https://<domaine-prod>/api/mcp`
- **Client ID** : valeur de `MCP_CLIENT_ID`
- **Client secret** : valeur de `MCP_CLIENT_SECRET`

## Endpoint MCP

### Transport

`WebStandardStreamableHTTPServerTransport` de `@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js`.

- Compatible Web Standard APIs (`Request`/`Response`) → fonctionne nativement dans le App Router Next.js
- Mode **stateless** (`sessionIdGenerator: undefined`) : chaque requête POST crée un `McpServer` éphémère, exécute le tool, retourne la réponse. Pas d'état en mémoire, compatible multi-instance.

### Verbes HTTP

| Verbe | Rôle |
|---|---|
| `GET /api/mcp` | SSE keep-alive |
| `POST /api/mcp` | Appel de tool (JSON-RPC 2.0) |
| `DELETE /api/mcp` | Fin de session |

### Authentification

1. La route lit `Authorization: Bearer <token>` dans les headers
2. Requête directe en DB :
   - collection `oauthAccessToken` : `{ accessToken: token, accessTokenExpiresAt: { $gt: now } }`
   - collection `user` : lookup sur `userId` pour récupérer `role`
3. Token absent, introuvable ou expiré → réponse `401` avant tout traitement MCP

> `auth.api.introspectToken()` n'existe pas dans better-auth — la validation passe par le mongodbAdapter directement.

### Contrôle d'accès par tool

| Tool | Accès |
|---|---|
| `get_migration_status` | Tous les utilisateurs authentifiés |
| `list_block_types` | Tous les utilisateurs authentifiés |
| `get_content` | Tous les utilisateurs authentifiés |
| `save_content` | Admin uniquement |
| `delete_content` | Admin uniquement |
| `insert_block` | Admin uniquement |
| `edit_block` | Admin uniquement |
| `delete_block` | Admin uniquement |

Les tools d'écriture vérifient `user.role === "admin"` en début de handler. Si non-admin : erreur MCP `{ code: -32603, message: "Forbidden" }`.

### Accès MongoDB

Les tools appellent directement `connectToDB()` — ils n'appellent pas les routes `/api/admin/content/` comme le serveur stdio. Cela évite une requête HTTP interne inutile et simplifie le code.

## Fichiers modifiés / créés

| Action | Fichier |
|---|---|
| Modifier | `src/lib/auth.ts` — ajouter `oAuthProvider` |
| Créer | `src/app/api/mcp/route.ts` — endpoint MCP HTTP |
| Modifier | `.env.local` — ajouter `MCP_CLIENT_ID`, `MCP_CLIENT_SECRET` |
| Modifier | `package.json` — via `bun add @better-auth/oauth-provider` |

## Ce qui ne change pas

- `src/mcp/server.ts` (stdio) reste intact — toujours utilisable via Claude Desktop
- Les routes `/api/admin/content/` restent inchangées
- `withAdmin` reste utilisé par ces routes

## Gestion d'erreurs

| Cas | Comportement |
|---|---|
| Token absent | HTTP 401 |
| Token expiré / invalide | HTTP 401 |
| User non-admin sur tool admin | Erreur MCP -32603 Forbidden |
| Erreur MongoDB | Erreur MCP -32603 Internal error |
| Type de bloc inconnu (PUT) | Erreur MCP -32602 Invalid params |
