# MCP HTTP Endpoint — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exposer les 8 tools MCP via HTTP/SSE dans le App Router Next.js, avec OAuth 2.0 géré par `@better-auth/oauth-provider`, pour permettre la connexion depuis Claude.ai web.

**Architecture:** Endpoint HTTP `/api/mcp` utilisant `WebStandardStreamableHTTPServerTransport` (mode stateless — une instance McpServer par requête). L'OAuth 2.0 est géré par le plugin `@better-auth/oauth-provider` dans better-auth (endpoints `/api/auth/oauth2/authorize`, `/api/auth/oauth2/token`, etc.). La validation des Bearer tokens passe par une requête directe en MongoDB sur la collection `oauthAccessToken`.

**Tech Stack:** `@better-auth/oauth-provider`, `@modelcontextprotocol/sdk` (`WebStandardStreamableHTTPServerTransport`), Next.js 16 App Router, MongoDB (`connectToDB`), `zod`.

**Spec:** `docs/superpowers/specs/2026-06-08-mcp-http-endpoint-design.md`

---

### Task 1 : Installer `@better-auth/oauth-provider` et vérifier l'API

**Files:**
- Modify: `package.json` (via bun add)

- [ ] **Installer le package**

```bash
bun add @better-auth/oauth-provider
```

- [ ] **Vérifier les fichiers disponibles**

```bash
node -e "const fs = require('fs'); console.log(fs.readdirSync('./node_modules/@better-auth/oauth-provider'));"
```

- [ ] **Lire les types principaux pour connaître l'export et la config client**

```bash
node -e "const fs = require('fs'); const dir = './node_modules/@better-auth/oauth-provider/'; const files = fs.readdirSync(dir, {recursive: true}).filter(f => String(f).endsWith('.d.ts') || String(f).endsWith('.d.mts')); console.log(files.slice(0, 10));"
```

Puis lire le fichier `index.d.mts` (ou équivalent) pour connaître :
- Le nom de l'export : `oAuthProvider`, `oauthProvider`, ou autre
- Les champs du client : `clientId`/`client_id`, `clientSecret`/`client_secret`, `redirectURLs`/`redirect_uris`

> **Note :** La configuration dans Task 3 est écrite pour l'API la plus probable. Adapter les noms de champs si nécessaire selon la lecture des types.

- [ ] **Vérifier que `bun run lint` passe encore**

```bash
bun run lint
```

Attendu : 0 erreur.

- [ ] **Commit**

```bash
git add package.json bun.lockb
git commit -m "feat(mcp-http): install @better-auth/oauth-provider"
```

---

### Task 2 : Générer les secrets et configurer `.env.local`

**Files:**
- Modify: `.env.local` (non commité)

- [ ] **Générer MCP_CLIENT_ID et MCP_CLIENT_SECRET**

```bash
node -e "const {randomUUID} = require('crypto'); console.log('MCP_CLIENT_ID=' + randomUUID()); console.log('MCP_CLIENT_SECRET=' + randomUUID());"
```

- [ ] **Ajouter les deux variables dans `.env.local`**

```
MCP_CLIENT_ID=<uuid généré>
MCP_CLIENT_SECRET=<uuid généré>
```

> `.env.local` est git-ignoré — ne jamais commiter ces valeurs.

---

### Task 3 : Ajouter `oAuthProvider` dans `src/lib/auth.ts`

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Ajouter l'import en haut du fichier, après les imports existants**

```ts
import { oAuthProvider } from "@better-auth/oauth-provider";
```

> Si après la lecture des types (Task 1) l'export s'appelle différemment, adapter ici.

- [ ] **Ajouter le plugin dans le tableau `plugins`, après les plugins existants**

Trouver le bloc `plugins: [` dans `src/lib/auth.ts` et ajouter `oAuthProvider(...)` à la fin :

```ts
    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["admin"],
        }),

        username({
            minUsernameLength: 3,
            maxUsernameLength: 32,
        }),

        ...(turnstileSecret
            ? [
                captcha({
                    provider: "cloudflare-turnstile",
                    secretKey: turnstileSecret,
                }),
            ]
            : []),

        oAuthProvider({
            clients: [
                {
                    clientId:     process.env.MCP_CLIENT_ID!,
                    clientSecret: process.env.MCP_CLIENT_SECRET!,
                    redirectURLs: ["https://claude.ai/oauth/callback"],
                    scopes:       ["openid", "profile", "email"],
                    name:         "Claude.ai",
                },
            ],
        }),
    ],
```

> Si les noms de champs sont différents (snake_case vs camelCase), adapter selon Task 1.

- [ ] **Vérifier la compilation TypeScript**

```bash
bun run lint
```

Attendu : 0 erreur.

- [ ] **Lancer `bun dev` et vérifier que l'endpoint de découverte répond**

```bash
curl http://localhost:3000/.well-known/openid-configuration
```

Attendu : JSON avec `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`.

- [ ] **Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat(mcp-http): add oAuthProvider plugin with Claude.ai client"
```

---

### Task 4 : Créer `src/app/api/mcp/route.ts`

**Files:**
- Create: `src/app/api/mcp/route.ts`

- [ ] **Créer le dossier**

```bash
mkdir -p src/app/api/mcp
```

- [ ] **Créer `src/app/api/mcp/route.ts`** avec le contenu complet suivant :

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb";
import { getAllBlockDefinitions, getBlockDefinition } from "@/lib/blockRegistry";
import type { Block, CourseContent } from "@/types/CourseContent";

export const runtime = "nodejs";

type RawBlock = { id: string; type: string; props: Record<string, unknown>; colSpan?: string };

// ── Validation du Bearer token ────────────────────────────────────────────────

async function validateToken(req: Request): Promise<{ id: string; role: string } | null> {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);

    const db = await connectToDB();
    const now = new Date();

    const tokenDoc = await db.collection("oauthAccessToken").findOne({
        accessToken: token,
        accessTokenExpiresAt: { $gt: now },
    });
    if (!tokenDoc) return null;

    const user = await db.collection("user").findOne({ id: tokenDoc.userId });
    if (!user) return null;

    return { id: String(user.id), role: String(user.role ?? "user") };
}

// ── Factory McpServer ─────────────────────────────────────────────────────────

function buildMcpServer(user: { id: string; role: string }): McpServer {
    const server = new McpServer({ name: "cours-iut", version: "1.0.0" });
    const isAdmin = user.role === "admin";

    // ── get_migration_status ──────────────────────────────────────────────────
    server.tool(
        "get_migration_status",
        "Retourne l'état de migration (file/db) de tous les cours, TPs et examens.",
        {},
        async () => {
            const db = await connectToDB();
            const modules = await db.collection("modules").find({}, {
                projection: { path: 1, sections: 1 },
            }).toArray();

            type StatusMap = Record<string, Record<string, Record<string, string>>>;
            const status: StatusMap = {};
            for (const mod of modules) {
                status[mod.path] = {};
                for (const section of (mod.sections ?? [])) {
                    status[mod.path][section.path] = {};
                    for (const content of (section.contents ?? [])) {
                        status[mod.path][section.path][content.type] = content.source ?? "file";
                    }
                }
            }
            return { content: [{ type: "text" as const, text: JSON.stringify(status, null, 2) }] };
        }
    );

    // ── list_block_types ──────────────────────────────────────────────────────
    server.tool(
        "list_block_types",
        "Retourne la liste des types de blocs disponibles dans le registre.",
        {},
        async () => {
            const defs = getAllBlockDefinitions().map(({ type, label, defaultProps, fields }) => ({
                type, label, defaultProps, fields,
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify({ types: defs }, null, 2) }] };
        }
    );

    // ── get_content ───────────────────────────────────────────────────────────
    server.tool(
        "get_content",
        "Retourne le tableau de blocs d'un contenu (cours, TP ou examen).",
        {
            module:  z.string().describe("Slug du module, ex: javascript"),
            section: z.string().describe("Slug de la section, ex: 1-le-dom"),
            type:    z.string().describe("Type de contenu : cours | TP | examen"),
        },
        async ({ module, section, type }) => {
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug:  module,
                sectionSlug: section,
                contentType: type as CourseContent["contentType"],
            });
            const result = doc
                ? { contentId: doc._id?.toString(), blocks: doc.blocks, version: doc.version, source: "db" }
                : { blocks: [], source: "file" };
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── save_content ──────────────────────────────────────────────────────────
    server.tool(
        "save_content",
        "Remplace entièrement les blocs d'un contenu (upsert). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.string(),
            blocks:  z.array(z.object({
                id:      z.string(),
                type:    z.string(),
                props:   z.record(z.string(), z.unknown()),
                colSpan: z.enum(["full", "half"]).optional(),
            })),
        },
        async ({ module, section, type, blocks }) => {
            if (!isAdmin) throw new Error("Forbidden");

            for (const block of blocks) {
                const def = getBlockDefinition(block.type);
                if (!def) throw new Error(`Type de bloc inconnu : ${block.type}`);
                const result = def.schema.safeParse(block.props);
                if (!result.success) {
                    throw new Error(`Bloc ${block.id} invalide : ${JSON.stringify(result.error.flatten())}`);
                }
            }

            const db = await connectToDB();
            const now = new Date();
            const typedType = type as CourseContent["contentType"];

            const existing = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: typedType,
            });

            let contentId: string;
            if (existing) {
                await db.collection<CourseContent>("course_content").updateOne(
                    { _id: existing._id },
                    { $set: { blocks: blocks as Block[], updatedAt: now }, $inc: { version: 1 } }
                );
                contentId = existing._id!.toString();
            } else {
                const r = await db.collection<CourseContent>("course_content").insertOne({
                    moduleSlug: module, sectionSlug: section, contentType: typedType,
                    blocks: blocks as Block[], version: 1, createdAt: now, updatedAt: now,
                });
                contentId = r.insertedId.toString();
            }

            await db.collection("modules").updateOne(
                { path: module },
                {
                    $set: {
                        "sections.$[s].contents.$[c].source":    "db",
                        "sections.$[s].contents.$[c].contentId": contentId,
                    },
                },
                { arrayFilters: [{ "s.path": section }, { "c.type": type }] }
            );

            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });

            const updated = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: typedType,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `Sauvegardé. contentId=${contentId}, version=${updated?.version ?? 1}`,
                }],
            };
        }
    );

    // ── delete_content ────────────────────────────────────────────────────────
    server.tool(
        "delete_content",
        "Supprime un contenu de la DB et repasse son ref à source: 'file'. Réservé aux admins.",
        { module: z.string(), section: z.string(), type: z.string() },
        async ({ module, section, type }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const typedType = type as CourseContent["contentType"];
            await db.collection<CourseContent>("course_content").deleteOne({
                moduleSlug: module, sectionSlug: section, contentType: typedType,
            });
            await db.collection("modules").updateOne(
                { path: module },
                {
                    $set:   { "sections.$[s].contents.$[c].source": "file" },
                    $unset: { "sections.$[s].contents.$[c].contentId": "" },
                },
                { arrayFilters: [{ "s.path": section }, { "c.type": type }] }
            );
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return { content: [{ type: "text" as const, text: "Supprimé." }] };
        }
    );

    // ── insert_block ──────────────────────────────────────────────────────────
    server.tool(
        "insert_block",
        "Insère un bloc. Si ni position ni afterBlockId → append. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.string(),
            block: z.object({
                id:      z.string().describe("UUID v4 unique"),
                type:    z.string(),
                props:   z.record(z.string(), z.unknown()),
                colSpan: z.enum(["full", "half"]).optional(),
            }),
            position:     z.number().int().min(0).optional().describe("Index 0-based où insérer"),
            afterBlockId: z.string().optional().describe("Insérer après ce blockId"),
        },
        async ({ module, section, type, block, position, afterBlockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const typedType = type as CourseContent["contentType"];
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: typedType,
            });
            const blocks: RawBlock[] = (doc?.blocks ?? []) as RawBlock[];

            let insertAt: number;
            if (typeof position === "number") {
                insertAt = Math.min(position, blocks.length);
            } else if (afterBlockId) {
                const idx = blocks.findIndex(b => b.id === afterBlockId);
                insertAt = idx === -1 ? blocks.length : idx + 1;
            } else {
                insertAt = blocks.length;
            }
            blocks.splice(insertAt, 0, block as RawBlock);

            await db.collection<CourseContent>("course_content").updateOne(
                { moduleSlug: module, sectionSlug: section, contentType: typedType },
                { $set: { blocks: blocks as Block[], updatedAt: new Date() }, $inc: { version: 1 } },
                { upsert: true }
            );
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return {
                content: [{
                    type: "text" as const,
                    text: `Bloc ${block.id} inséré à l'index ${insertAt}.`,
                }],
            };
        }
    );

    // ── edit_block ────────────────────────────────────────────────────────────
    server.tool(
        "edit_block",
        "Remplace entièrement les props d'un bloc (replace, pas merge). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.string(),
            blockId: z.string().describe("ID du bloc à modifier"),
            props:   z.record(z.string(), z.unknown()).describe("Nouvelles props complètes"),
            colSpan: z.enum(["full", "half"]).optional(),
        },
        async ({ module, section, type, blockId, props, colSpan }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const typedType = type as CourseContent["contentType"];
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: typedType,
            });
            const blocks: RawBlock[] = (doc?.blocks ?? []) as RawBlock[];
            const idx = blocks.findIndex(b => b.id === blockId);
            if (idx === -1) throw new Error(`Bloc ${blockId} introuvable`);

            blocks[idx] = { ...blocks[idx], props, ...(colSpan ? { colSpan } : {}) };

            await db.collection<CourseContent>("course_content").updateOne(
                { moduleSlug: module, sectionSlug: section, contentType: typedType },
                { $set: { blocks: blocks as Block[], updatedAt: new Date() }, $inc: { version: 1 } }
            );
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} mis à jour.` }] };
        }
    );

    // ── delete_block ──────────────────────────────────────────────────────────
    server.tool(
        "delete_block",
        "Supprime un bloc par son ID. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.string(),
            blockId: z.string().describe("ID du bloc à supprimer"),
        },
        async ({ module, section, type, blockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const typedType = type as CourseContent["contentType"];
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: typedType,
            });
            const blocks = ((doc?.blocks ?? []) as RawBlock[]).filter(b => b.id !== blockId);

            await db.collection<CourseContent>("course_content").updateOne(
                { moduleSlug: module, sectionSlug: section, contentType: typedType },
                { $set: { blocks: blocks as Block[], updatedAt: new Date() }, $inc: { version: 1 } }
            );
            revalidateTag(`content:${module}:${section}:${type}`, { expire: 0 });
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} supprimé.` }] };
        }
    );

    return server;
}

// ── Handler partagé ───────────────────────────────────────────────────────────

async function handleMcp(req: Request): Promise<Response> {
    const user = await validateToken(req);
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });
    const server = buildMcpServer(user);
    await server.connect(transport);
    return transport.handleRequest(req);
}

export const GET    = (req: Request) => handleMcp(req);
export const POST   = (req: Request) => handleMcp(req);
export const DELETE = (req: Request) => handleMcp(req);
```

- [ ] **Vérifier la compilation**

```bash
bun run lint
```

Attendu : 0 erreur TypeScript/ESLint.

- [ ] **Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp-http): add HTTP MCP endpoint with 8 tools and OAuth token validation"
```

---

### Task 5 : Vérifier le nom des collections MongoDB

**Contexte :** `@better-auth/oauth-provider` crée une collection `oauthAccessToken` (nom exact à confirmer).

- [ ] **Lancer `bun dev` et se connecter en admin sur `http://localhost:3000/login`**

- [ ] **Inspecter les collections MongoDB créées par le plugin**

Dans MongoDB Compass ou via mongosh :
```js
use cours-iut-web
show collections
```

Chercher une collection dont le nom contient "oauth" ou "token".

- [ ] **Si le nom est différent de `oauthAccessToken`, corriger dans `validateToken`**

Dans `src/app/api/mcp/route.ts`, ligne ~22 :
```ts
// Remplacer "oauthAccessToken" par le nom réel
const tokenDoc = await db.collection("<nom-réel>").findOne({ ... });
```

- [ ] **Vérifier aussi la collection `user` : que le champ `id` est bien un string**

```js
db.user.findOne({}, { id: 1, role: 1, _id: 0 })
```

Attendu : `{ id: "uuid-string", role: "admin" }`.

Si `id` est absent et l'identifiant est dans `_id` (ObjectId), adapter la requête dans `validateToken` :
```ts
import { ObjectId } from "mongodb";
const user = await db.collection("user").findOne({ _id: new ObjectId(tokenDoc.userId) });
```

- [ ] **Si correction faite, relancer `bun run lint` et commiter**

```bash
git add src/app/api/mcp/route.ts
git commit -m "fix(mcp-http): correct MongoDB collection name for token validation"
```

---

### Task 6 : Tester le endpoint avec curl

**Prérequis :** `bun dev` tourne sur `localhost:3000`.

- [ ] **Test sans token → 401**

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

Attendu : `401`

- [ ] **Obtenir un access_token via le flow OAuth**

Option rapide pour tester : utiliser le formulaire Claude.ai OU simuler le flow manuellement.

Pour une vérification locale rapide, insérer temporairement un token de test directement en DB :

```js
// Dans mongosh
db.oauthAccessToken.insertOne({
  accessToken: "test-token-123",
  refreshToken: "test-refresh-123",
  accessTokenExpiresAt: new Date(Date.now() + 3600000),
  refreshTokenExpiresAt: new Date(Date.now() + 86400000),
  clientId: "<valeur de MCP_CLIENT_ID>",
  userId: "<id d'un user admin dans la collection user>",
  scopes: "openid profile email",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

- [ ] **Test `tools/list` avec token valide**

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-123" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

Attendu : JSON avec `result.tools` contenant les 8 tools (`get_migration_status`, `list_block_types`, `get_content`, `save_content`, `delete_content`, `insert_block`, `edit_block`, `delete_block`).

- [ ] **Test `get_migration_status`**

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-123" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_migration_status","arguments":{}},"id":2}'
```

Attendu : JSON avec `result.content[0].text` contenant le statut des modules.

- [ ] **Test accès refusé sur tool admin avec token non-admin**

Insérer un token lié à un user avec `role: "user"` (non-admin), puis :

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-non-admin>" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"save_content","arguments":{"module":"javascript","section":"1-le-dom","type":"cours","blocks":[]}},"id":3}'
```

Attendu : `result.isError: true` avec message "Forbidden".

- [ ] **Supprimer le token de test de la DB**

```js
db.oauthAccessToken.deleteOne({ accessToken: "test-token-123" })
```

---

### Task 7 : Configurer le connecteur dans Claude.ai

**Prérequis :** L'app est déployée en production avec les variables `MCP_CLIENT_ID` et `MCP_CLIENT_SECRET` injectées.

- [ ] **Récupérer l'URL de callback OAuth réelle de Claude.ai**

Ouvrir le formulaire Claude.ai → "Ajouter un connecteur personnalisé" → saisir l'URL du serveur MCP et observer la requête d'autorisation OAuth envoyée (dans les logs du serveur ou les DevTools). Récupérer le `redirect_uri` exact.

- [ ] **Si le `redirect_uri` est différent de `https://claude.ai/oauth/callback`, mettre à jour `src/lib/auth.ts`**

Dans le tableau `plugins`, modifier `redirectURLs` du client Claude.ai :

```ts
redirectURLs: ["<redirect_uri_réel_de_claude_ai>"],
```

Puis redéployer.

- [ ] **Configurer le connecteur dans Claude.ai**

Formulaire "Ajouter un connecteur personnalisé" :
- **URL** : `https://<domaine-prod>/api/mcp`
- **Client ID** : valeur de `MCP_CLIENT_ID` (en production)
- **Client secret** : valeur de `MCP_CLIENT_SECRET` (en production)

- [ ] **Passer le flow OAuth**

Claude.ai redirige vers `/api/auth/oauth2/authorize` → se connecter → consentir → Claude.ai reçoit l'access token.

- [ ] **Tester depuis Claude.ai**

Dans une conversation Claude.ai avec le connecteur activé, demander :

> "Appelle get_migration_status."

Attendu : Claude appelle le tool et affiche le JSON de statut.

> "Appelle list_block_types."

Attendu : liste des 7 types de blocs.

> "Appelle get_content avec module=javascript, section=1-le-dom, type=cours."

Attendu : `{ blocks: [], source: "file" }` (ou contenu DB si déjà migré).
