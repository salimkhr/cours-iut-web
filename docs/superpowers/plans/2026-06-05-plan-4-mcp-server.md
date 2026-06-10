# Cours Builder — Plan 4 : MCP Server

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer le serveur MCP Node.js avec 8 tools qui appellent les API Routes Next.js. Ce serveur permet à Claude Desktop / Claude Code de lire et modifier le contenu pédagogique via des tool calls.

**Architecture:** Serveur MCP Node.js séparé (`src/mcp/server.ts`), lancé via `npx tsx`. N'accède jamais à MongoDB directement — toutes les opérations passent par les API Routes avec un Bearer token admin. Les tools `insert_block` et `edit_block` font GET → modification locale → PUT (pas de route dédiée par bloc côté Next.js).

**Tech Stack:** `@modelcontextprotocol/sdk`, `zod`, `tsx`.

**Prérequis :** Plans 1, 2 et 3 complétés. L'app Next.js doit tourner sur `localhost:3000` avec un compte admin actif.

---

### Task 1 : Installer `@modelcontextprotocol/sdk`

**Files:**
- Modify: `package.json` (via bun add)

- [ ] **Installer le SDK MCP**

```bash
bun add @modelcontextprotocol/sdk
```

- [ ] **Vérifier l'installation**

```bash
bun run -e "import('@modelcontextprotocol/sdk/server/mcp.js').then(() => console.log('OK'))"
```
Attendu : `OK`

- [ ] **Commit**

```bash
git add package.json bun.lockb
git commit -m "feat(mcp): add @modelcontextprotocol/sdk dependency"
```

---

### Task 2 : Squelette du serveur + tools de lecture

**Files:**
- Create: `src/mcp/server.ts`

- [ ] **Créer le dossier**

```bash
mkdir -p src/mcp
```

- [ ] **Créer `src/mcp/server.ts`** avec les 3 tools de lecture

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE  = process.env.NEXT_URL  ?? "http://localhost:3000";
const TOKEN = process.env.MCP_ADMIN_TOKEN ?? "";

if (!TOKEN) {
    process.stderr.write("ERREUR : MCP_ADMIN_TOKEN non défini\n");
    process.exit(1);
}

const api = (path: string, opts?: RequestInit) =>
    fetch(`${BASE}/api/admin/content/${path}`, {
        ...opts,
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
            ...opts?.headers,
        },
    });

const server = new McpServer({
    name: "cours-iut",
    version: "1.0.0",
});

// ── get_migration_status ──────────────────────────────────────────────────────

server.tool(
    "get_migration_status",
    "Retourne l'état de migration (file/db) de tous les cours, TPs et examens.",
    {},
    async () => {
        const res = await api("status");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
);

// ── list_block_types ──────────────────────────────────────────────────────────

server.tool(
    "list_block_types",
    "Retourne la liste des types de blocs disponibles dans le registre.",
    {},
    async () => {
        const res = await api("block-types");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
);

// ── get_content ───────────────────────────────────────────────────────────────

server.tool(
    "get_content",
    "Retourne le tableau de blocs d'un contenu (cours, TP ou examen).",
    {
        module:  z.string().describe("Slug du module, ex: javascript"),
        section: z.string().describe("Slug de la section, ex: 1-le-dom"),
        type:    z.string().describe("Type de contenu : cours | TP | examen"),
    },
    async ({ module, section, type }) => {
        const res = await api(`${module}/${section}/${type}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
);

// ── Démarrer le serveur ───────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
```

- [ ] **Tester le squelette**

Dans un terminal, lancer `bun dev` (port 3000). Dans un autre terminal :

```bash
MCP_ADMIN_TOKEN=<token> NEXT_URL=http://localhost:3000 \
  bun run tsx src/mcp/server.ts
```
Attendu : le serveur démarre sans erreur (attend des messages MCP sur stdin).

- [ ] **Commit**

```bash
git add src/mcp/server.ts
git commit -m "feat(mcp): add MCP server skeleton with 3 read tools"
```

---

### Task 3 : Ajouter `save_content` et `delete_content`

**Files:**
- Modify: `src/mcp/server.ts`

- [ ] **Ajouter `save_content` avant la ligne de démarrage du serveur**

```typescript
// ── save_content ──────────────────────────────────────────────────────────────

server.tool(
    "save_content",
    "Remplace entièrement les blocs d'un contenu (upsert). Utilisé pour la migration et la création.",
    {
        module:  z.string().describe("Slug du module"),
        section: z.string().describe("Slug de la section"),
        type:    z.string().describe("Type de contenu : cours | TP | examen"),
        blocks:  z.array(z.object({
            id:       z.string(),
            type:     z.string(),
            props:    z.record(z.unknown()),
            colSpan:  z.enum(["full", "half"]).optional(),
        })).describe("Tableau complet de blocs"),
    },
    async ({ module, section, type, blocks }) => {
        const res = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`HTTP ${res.status}: ${err}`);
        }
        const data = await res.json();
        return {
            content: [{
                type: "text" as const,
                text: `Sauvegardé. contentId=${data.contentId}, version=${data.version}`,
            }],
        };
    }
);

// ── delete_content ────────────────────────────────────────────────────────────

server.tool(
    "delete_content",
    "Supprime un contenu de la DB et repasse son ref à source: 'file'.",
    {
        module:  z.string(),
        section: z.string(),
        type:    z.string(),
    },
    async ({ module, section, type }) => {
        const res = await api(`${module}/${section}/${type}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { content: [{ type: "text" as const, text: "Supprimé." }] };
    }
);
```

- [ ] **Vérifier**

```bash
bun run lint src/mcp/server.ts
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/mcp/server.ts
git commit -m "feat(mcp): add save_content and delete_content tools"
```

---

### Task 4 : Ajouter `insert_block`, `edit_block`, `delete_block`

**Files:**
- Modify: `src/mcp/server.ts`

Ces trois tools font GET → modification locale du tableau de blocs → PUT (pas de route dédiée par bloc).

- [ ] **Ajouter les 3 tools avant la ligne de démarrage du serveur**

```typescript
// ── insert_block ──────────────────────────────────────────────────────────────

server.tool(
    "insert_block",
    "Insère un bloc. Si ni position ni afterBlockId → append. Si afterBlockId → après ce bloc. Si position → à cet index.",
    {
        module:       z.string(),
        section:      z.string(),
        type:         z.string(),
        block: z.object({
            id:      z.string().describe("UUID v4 unique"),
            type:    z.string(),
            props:   z.record(z.unknown()),
            colSpan: z.enum(["full", "half"]).optional(),
        }),
        position:     z.number().int().min(0).optional().describe("Index 0-based où insérer"),
        afterBlockId: z.string().optional().describe("Insérer après ce blockId"),
    },
    async ({ module, section, type, block, position, afterBlockId }) => {
        // 1. Lire l'état actuel
        const getRes = await api(`${module}/${section}/${type}`);
        if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
        const current = await getRes.json() as { blocks: Array<{ id: string; type: string; props: Record<string, unknown>; colSpan?: string }> };
        const blocks = current.blocks ?? [];

        // 2. Calculer l'index d'insertion
        let insertAt: number;
        if (typeof position === "number") {
            insertAt = Math.min(position, blocks.length);
        } else if (afterBlockId) {
            const idx = blocks.findIndex((b) => b.id === afterBlockId);
            insertAt = idx === -1 ? blocks.length : idx + 1;
        } else {
            insertAt = blocks.length;
        }

        // 3. Insérer
        blocks.splice(insertAt, 0, block);

        // 4. Sauvegarder
        const putRes = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!putRes.ok) {
            const err = await putRes.text();
            throw new Error(`HTTP ${putRes.status}: ${err}`);
        }
        return {
            content: [{
                type: "text" as const,
                text: `Bloc ${block.id} inséré à l'index ${insertAt}.`,
            }],
        };
    }
);

// ── edit_block ────────────────────────────────────────────────────────────────

server.tool(
    "edit_block",
    "Remplace entièrement les props d'un bloc (replace, pas merge).",
    {
        module:   z.string(),
        section:  z.string(),
        type:     z.string(),
        blockId:  z.string().describe("ID du bloc à modifier"),
        props:    z.record(z.unknown()).describe("Nouvelles props complètes"),
        colSpan:  z.enum(["full", "half"]).optional(),
    },
    async ({ module, section, type, blockId, props, colSpan }) => {
        const getRes = await api(`${module}/${section}/${type}`);
        if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
        const current = await getRes.json() as { blocks: Array<{ id: string; type: string; props: Record<string, unknown>; colSpan?: string }> };
        const blocks = current.blocks ?? [];

        const idx = blocks.findIndex((b) => b.id === blockId);
        if (idx === -1) throw new Error(`Bloc ${blockId} introuvable`);

        blocks[idx] = { ...blocks[idx], props, ...(colSpan ? { colSpan } : {}) };

        const putRes = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!putRes.ok) {
            const err = await putRes.text();
            throw new Error(`HTTP ${putRes.status}: ${err}`);
        }
        return {
            content: [{ type: "text" as const, text: `Bloc ${blockId} mis à jour.` }],
        };
    }
);

// ── delete_block ──────────────────────────────────────────────────────────────

server.tool(
    "delete_block",
    "Supprime un bloc par son ID.",
    {
        module:  z.string(),
        section: z.string(),
        type:    z.string(),
        blockId: z.string().describe("ID du bloc à supprimer"),
    },
    async ({ module, section, type, blockId }) => {
        const getRes = await api(`${module}/${section}/${type}`);
        if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
        const current = await getRes.json() as { blocks: Array<{ id: string }> };
        const blocks = (current.blocks ?? []).filter((b) => b.id !== blockId);

        const putRes = await api(`${module}/${section}/${type}`, {
            method: "PUT",
            body: JSON.stringify({ blocks }),
        });
        if (!putRes.ok) {
            const err = await putRes.text();
            throw new Error(`HTTP ${putRes.status}: ${err}`);
        }
        return {
            content: [{ type: "text" as const, text: `Bloc ${blockId} supprimé.` }],
        };
    }
);
```

- [ ] **Vérifier**

```bash
bun run lint src/mcp/server.ts
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/mcp/server.ts
git commit -m "feat(mcp): add insert_block, edit_block, delete_block tools"
```

---

### Task 5 : Configurer Claude Desktop + test des tools

**Files:**
- Aucun fichier committé (la config Claude Desktop est locale)

- [ ] **Récupérer un token de session admin**

Avec l'app Next.js lancée, se connecter en admin sur `http://localhost:3000/login`. Récupérer le cookie de session dans les DevTools (`Application > Cookies > better-auth.session_token`). Ce token est utilisé comme `MCP_ADMIN_TOKEN`.

> **Note :** Le serveur MCP utilise ce token dans le header `Authorization: Bearer`. L'API route `withAdmin` vérifie la session. Ce token expire — il faudra le renouveler quand le serveur MCP renvoie `403`.

- [ ] **Ajouter la config dans `claude_desktop_config.json`**

Fichier situé dans `%APPDATA%\Claude\claude_desktop_config.json` (Windows) :

```json
{
  "mcpServers": {
    "cours-iut": {
      "command": "npx",
      "args": ["tsx", "C:/Users/Utilisateur/PhpstormProjects/cours-iut-web/src/mcp/server.ts"],
      "env": {
        "NEXT_URL": "http://localhost:3000",
        "MCP_ADMIN_TOKEN": "<token récupéré ci-dessus>"
      }
    }
  }
}
```

> **Adapter le chemin absolu** selon la machine.

- [ ] **Ajouter les variables d'env dans `.env.local`**

```bash
# .env.local
MCP_ADMIN_TOKEN=<token>
NEXT_URL=http://localhost:3000
```

- [ ] **Redémarrer Claude Desktop** et vérifier que le serveur MCP "cours-iut" apparaît dans les outils disponibles.

- [ ] **Test des tools via Claude Desktop**

Dans Claude Desktop, demander :

> "Appelle get_migration_status pour voir l'état de migration des cours."

Attendu : Claude appelle le tool et retourne un JSON avec la structure `{ javascript: { "1-le-dom": { cours: "file", ... } } }`.

> "Appelle list_block_types."

Attendu : liste des 7 types de blocs.

> "Appelle get_content avec module=javascript, section=1-le-dom, type=cours."

Attendu : `{ blocks: [], source: "file" }` (contenu pas encore migré).

- [ ] **Test migration d'un cours** (smoke test)

Dans Claude Desktop, demander :

> "Lis le fichier `src/cours/javascript/1-le-dom/Cours.tsx`. Convertis son contenu en blocs JSON compatibles avec le registre (types : text, heading, list, named-component). Puis appelle save_content pour le sauvegarder."

Attendu : Claude lit le fichier, génère un tableau de blocs, appelle `save_content`. Naviguer vers `/javascript/1-le-dom/cours` dans le navigateur — le contenu doit s'afficher via `BlockRenderer`.

- [ ] **Commit doc**

```bash
git add src/mcp/server.ts
git commit -m "feat(mcp): complete MCP server with 8 tools"
```
