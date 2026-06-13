# Plan B — MCP Server : édition de contenu via Claude Desktop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un package Node.js autonome `mcp-server/` exposant 7 outils MCP (stdio) permettant à Claude Desktop de lire et modifier les blocs de cours stockés dans MongoDB.

**Architecture:** Package TypeScript standalone à la racine du repo. Connexion directe à MongoDB via `MONGODB_URI`. Transport stdio — aucun serveur HTTP. 7 outils : `list_modules`, `list_sections`, `get_content`, `insert_block`, `update_block`, `delete_block`, `reorder_blocks`.

**Tech Stack:** `@modelcontextprotocol/sdk`, `mongodb@^7`, TypeScript, `uuid`.

---

## Cartographie des fichiers

```
mcp-server/
  package.json          # dépendances, scripts build/start
  tsconfig.json         # ESM strict, outDir: dist/
  src/
    index.ts            # enregistrement des 7 outils + connexion transport
    db.ts               # connexion MongoDB (singleton)
    utils/
      tree.ts           # findBlock, insertInTree, removeFromTree, reorderInParent
    tools/
      list-modules.ts
      list-sections.ts
      get-content.ts
      insert-block.ts
      update-block.ts
      delete-block.ts
      reorder-blocks.ts
```

---

### Task 1 : Bootstrap du package `mcp-server/`

**Files:**
- Create: `mcp-server/package.json`
- Create: `mcp-server/tsconfig.json`

- [ ] **Étape 1 : Créer le répertoire**

```powershell
New-Item -ItemType Directory -Force mcp-server/src/utils
New-Item -ItemType Directory -Force mcp-server/src/tools
```

- [ ] **Étape 2 : Créer `mcp-server/package.json`**

```json
{
  "name": "cours-iut-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc --build",
    "start": "node dist/index.js",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "mongodb": "^7.1.0",
    "uuid": "^11.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/uuid": "^10.0.0"
  }
}
```

- [ ] **Étape 3 : Créer `mcp-server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Étape 4 : Installer les dépendances**

```powershell
cd mcp-server
bun install
cd ..
```

- [ ] **Étape 5 : Commit**

```powershell
git add mcp-server/package.json mcp-server/tsconfig.json
git commit -m "feat(mcp): bootstrap package mcp-server"
```

---

### Task 2 : Connexion MongoDB (`db.ts`)

**Files:**
- Create: `mcp-server/src/db.ts`

- [ ] **Étape 1 : Créer `mcp-server/src/db.ts`**

```typescript
import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;

export async function connectToDB(): Promise<Db> {
    if (!client) {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI environment variable is not set");
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db("cours-iut-web");
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```powershell
cd mcp-server && bun run build && cd ..
```

Expected : répertoire `dist/` créé avec `db.js`.

- [ ] **Étape 3 : Commit**

```powershell
git add mcp-server/src/db.ts
git commit -m "feat(mcp): connexion MongoDB singleton"
```

---

### Task 3 : Utilitaires d'arbre (`utils/tree.ts`)

**Files:**
- Create: `mcp-server/src/utils/tree.ts`

Ces fonctions sont des copies autonomes (sans dépendances Next.js) de la logique dans `src/lib/blockTreeUtils.ts`.

- [ ] **Étape 1 : Créer `mcp-server/src/utils/tree.ts`**

```typescript
import { v4 as uuidv4 } from "uuid";

export interface Block {
    id: string;
    type: string;
    props: Record<string, unknown>;
    children?: Block[];
}

/** Cherche un bloc par ID dans tout l'arbre (DFS). */
export function findBlock(blocks: Block[], id: string): Block | undefined {
    for (const block of blocks) {
        if (block.id === id) return block;
        if (block.children) {
            const found = findBlock(block.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

/** Cherche le parent direct d'un bloc. Retourne undefined si le bloc est à la racine. */
export function findParent(
    blocks: Block[],
    id: string,
    parent: Block | null = null
): Block | null | undefined {
    for (const block of blocks) {
        if (block.id === id) return parent;
        if (block.children) {
            const found = findParent(block.children, id, block);
            if (found !== undefined) return found;
        }
    }
    return undefined;
}

/** Insère `newBlock` dans le tableau de blocs, sous `parentId` à l'index donné.
 *  `parentId: null` = racine. */
export function insertInTree(
    blocks: Block[],
    newBlock: Block,
    parentId: string | null,
    index: number
): Block[] {
    if (parentId === null) {
        const copy = [...blocks];
        copy.splice(Math.min(index, copy.length), 0, newBlock);
        return copy;
    }
    return blocks.map((block) => {
        if (block.id === parentId) {
            const children = [...(block.children ?? [])];
            children.splice(Math.min(index, children.length), 0, newBlock);
            return { ...block, children };
        }
        if (block.children) {
            return { ...block, children: insertInTree(block.children, newBlock, parentId, index) };
        }
        return block;
    });
}

/** Supprime un bloc (et tous ses enfants) de l'arbre. */
export function removeFromTree(blocks: Block[], id: string): Block[] {
    return blocks
        .filter((b) => b.id !== id)
        .map((b) =>
            b.children ? { ...b, children: removeFromTree(b.children, id) } : b
        );
}

/** Met à jour les props d'un bloc (merge partiel). */
export function updateProps(
    blocks: Block[],
    id: string,
    props: Record<string, unknown>
): Block[] {
    return blocks.map((block) => {
        if (block.id === id) return { ...block, props: { ...block.props, ...props } };
        if (block.children) {
            return { ...block, children: updateProps(block.children, id, props) };
        }
        return block;
    });
}

/** Réordonne les enfants directs de `parentId` (ou de la racine si null)
 *  selon le tableau `orderedIds`. Les IDs absents de `orderedIds` sont ignorés.
 *  Les enfants dont l'ID n'est pas dans la liste sont conservés en fin. */
export function reorderInParent(
    blocks: Block[],
    parentId: string | null,
    orderedIds: string[]
): Block[] {
    if (parentId === null) {
        return sortChildren(blocks, orderedIds);
    }
    return blocks.map((block) => {
        if (block.id === parentId) {
            return { ...block, children: sortChildren(block.children ?? [], orderedIds) };
        }
        if (block.children) {
            return { ...block, children: reorderInParent(block.children, parentId, orderedIds) };
        }
        return block;
    });
}

function sortChildren(children: Block[], orderedIds: string[]): Block[] {
    const byId = new Map(children.map((c) => [c.id, c]));
    const reordered = orderedIds.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
    const remaining = children.filter((c) => !orderedIds.includes(c.id));
    return [...reordered, ...remaining];
}

/** Crée un nouveau bloc avec un ID unique. */
export function createBlock(
    type: string,
    props: Record<string, unknown>,
    children?: Block[]
): Block {
    return { id: uuidv4(), type, props, ...(children !== undefined ? { children } : {}) };
}
```

- [ ] **Étape 2 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

Expected : aucune erreur.

- [ ] **Étape 3 : Commit**

```powershell
git add mcp-server/src/utils/tree.ts
git commit -m "feat(mcp): utilitaires d'arbre autonomes (findBlock, insert, remove, reorder)"
```

---

### Task 4 : Point d'entrée `index.ts`

**Files:**
- Create: `mcp-server/src/index.ts`

- [ ] **Étape 1 : Créer `mcp-server/src/index.ts`**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListModules } from "./tools/list-modules.js";
import { registerListSections } from "./tools/list-sections.js";
import { registerGetContent } from "./tools/get-content.js";
import { registerInsertBlock } from "./tools/insert-block.js";
import { registerUpdateBlock } from "./tools/update-block.js";
import { registerDeleteBlock } from "./tools/delete-block.js";
import { registerReorderBlocks } from "./tools/reorder-blocks.js";

const server = new McpServer({
    name: "cours-iut-mcp",
    version: "1.0.0",
});

registerListModules(server);
registerListSections(server);
registerGetContent(server);
registerInsertBlock(server);
registerUpdateBlock(server);
registerDeleteBlock(server);
registerReorderBlocks(server);

const transport = new StdioServerTransport();
await server.connect(transport);
```

Note : `McpServer` et `StdioServerTransport` sont les exports publics du SDK MCP. Si la version installée expose des chemins d'import différents, ajuster en conséquence (vérifier `node_modules/@modelcontextprotocol/sdk/` après `bun install`).

- [ ] **Étape 2 : Créer des stubs vides pour les outils (pour que la compilation passe)**

Créer chaque fichier outil avec un export stub :

`mcp-server/src/tools/list-modules.ts` :
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
export function registerListModules(_server: McpServer): void {}
```

Répéter pour : `list-sections.ts`, `get-content.ts`, `insert-block.ts`, `update-block.ts`, `delete-block.ts`, `reorder-blocks.ts` (même structure, nom de fonction différent).

- [ ] **Étape 3 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

Expected : aucune erreur.

- [ ] **Étape 4 : Commit**

```powershell
git add mcp-server/src/
git commit -m "feat(mcp): point d'entrée index.ts + stubs outils"
```

---

### Task 5 : Outils `list_modules` et `list_sections`

**Files:**
- Modify: `mcp-server/src/tools/list-modules.ts`
- Modify: `mcp-server/src/tools/list-sections.ts`

- [ ] **Étape 1 : Implémenter `list-modules.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { connectToDB } from "../db.js";

export function registerListModules(server: McpServer): void {
    server.tool(
        "list_modules",
        "Retourne la liste de tous les modules disponibles dans la base.",
        {},
        async () => {
            const db = await connectToDB();
            const modules = await db
                .collection<{ path: string; title: string }>("modules")
                .find({}, { projection: { path: 1, title: 1, _id: 0 } })
                .toArray();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            modules.map((m) => ({ slug: m.path, title: m.title ?? m.path })),
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );
}
```

- [ ] **Étape 2 : Implémenter `list-sections.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { connectToDB } from "../db.js";

interface ModuleDoc {
    path: string;
    title?: string;
    sections?: Array<{
        path: string;
        title?: string;
        contents?: Array<{ type: string; source?: string }>;
    }>;
}

export function registerListSections(server: McpServer): void {
    server.tool(
        "list_sections",
        "Retourne les sections d'un module avec les types de contenu présents en base.",
        { moduleSlug: z.string().describe("Slug du module (ex: javascript)") },
        async ({ moduleSlug }) => {
            const db = await connectToDB();
            const mod = await db
                .collection<ModuleDoc>("modules")
                .findOne({ path: moduleSlug }, { projection: { sections: 1, _id: 0 } });

            if (!mod) {
                return {
                    content: [{ type: "text", text: `Module "${moduleSlug}" introuvable.` }],
                };
            }

            // Croiser avec course_content pour savoir ce qui est en DB
            const contentDocs = await db
                .collection<{ sectionSlug: string; contentType: string }>("course_content")
                .find({ moduleSlug }, { projection: { sectionSlug: 1, contentType: 1, _id: 0 } })
                .toArray();

            const inDb: Record<string, string[]> = {};
            for (const doc of contentDocs) {
                if (!inDb[doc.sectionSlug]) inDb[doc.sectionSlug] = [];
                inDb[doc.sectionSlug].push(doc.contentType);
            }

            const sections = (mod.sections ?? []).map((s) => ({
                slug: s.path,
                title: s.title ?? s.path,
                contentTypesInDb: inDb[s.path] ?? [],
                availableTypes: (s.contents ?? []).map((c) => c.type),
            }));

            return {
                content: [{ type: "text", text: JSON.stringify(sections, null, 2) }],
            };
        }
    );
}
```

- [ ] **Étape 3 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

Expected : aucune erreur.

- [ ] **Étape 4 : Commit**

```powershell
git add mcp-server/src/tools/list-modules.ts mcp-server/src/tools/list-sections.ts
git commit -m "feat(mcp): outils list_modules et list_sections"
```

---

### Task 6 : Outil `get_content`

**Files:**
- Modify: `mcp-server/src/tools/get-content.ts`

- [ ] **Étape 1 : Implémenter `get-content.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { connectToDB } from "../db.js";
import type { Block } from "../utils/tree.js";

interface CourseContentDoc {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks: Block[];
    version?: number;
    updatedAt?: Date;
}

export function registerGetContent(server: McpServer): void {
    server.tool(
        "get_content",
        "Retourne l'arbre complet de blocs pour un contenu (cours, TP, examen). Si aucun document n'existe en base, retourne blocks: [].",
        {
            moduleSlug: z.string().describe("Slug du module (ex: javascript)"),
            sectionSlug: z.string().describe("Slug de la section (ex: 1-le-dom)"),
            contentType: z.enum(["cours", "TP", "examen"]).describe("Type de contenu"),
        },
        async ({ moduleSlug, sectionSlug, contentType }) => {
            const db = await connectToDB();
            const doc = await db
                .collection<CourseContentDoc>("course_content")
                .findOne(
                    { moduleSlug, sectionSlug, contentType },
                    { projection: { blocks: 1, version: 1, updatedAt: 1, _id: 0 } }
                );

            const result = {
                blocks: doc?.blocks ?? [],
                version: doc?.version ?? null,
                updatedAt: doc?.updatedAt ?? null,
                source: doc ? "db" : "file",
            };

            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );
}
```

- [ ] **Étape 2 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

- [ ] **Étape 3 : Commit**

```powershell
git add mcp-server/src/tools/get-content.ts
git commit -m "feat(mcp): outil get_content"
```

---

### Task 7 : Outil `insert_block`

**Files:**
- Modify: `mcp-server/src/tools/insert-block.ts`

- [ ] **Étape 1 : Créer le helper partagé `loadAndSave`**

Ce helper sera utilisé par insert, update, delete et reorder. Le créer dans `mcp-server/src/utils/content.ts` :

```typescript
import { connectToDB } from "../db.js";
import type { Block } from "./tree.js";

interface ContentKey {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export async function loadBlocks(key: ContentKey): Promise<Block[]> {
    const db = await connectToDB();
    const doc = await db
        .collection<{ blocks: Block[] }>("course_content")
        .findOne(key, { projection: { blocks: 1, _id: 0 } });
    return doc?.blocks ?? [];
}

export async function saveBlocks(key: ContentKey, blocks: Block[]): Promise<void> {
    const db = await connectToDB();
    const now = new Date();
    await db.collection("course_content").updateOne(
        key,
        {
            $set: { blocks, updatedAt: now },
            $inc: { version: 1 } as Record<string, number>,
            $setOnInsert: { ...key, createdAt: now },
        },
        { upsert: true }
    );
    // Marquer la source comme "db" dans la collection modules
    await db.collection("modules").updateOne(
        { path: key.moduleSlug },
        {
            $set: {
                "sections.$[s].contents.$[c].source": "db",
            },
        },
        {
            arrayFilters: [
                { "s.path": key.sectionSlug },
                { "c.type": key.contentType },
            ],
        }
    );
}
```

- [ ] **Étape 2 : Implémenter `insert-block.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { insertInTree, createBlock } from "../utils/tree.js";

export function registerInsertBlock(server: McpServer): void {
    server.tool(
        "insert_block",
        "Insère un nouveau bloc dans l'arbre de contenu. parentBlockId: null = racine. afterBlockId: null = fin de la liste du parent.",
        {
            moduleSlug: z.string(),
            sectionSlug: z.string(),
            contentType: z.enum(["cours", "TP", "examen"]),
            blockType: z.string().describe("Type du bloc à créer (ex: text, code, section, list...)"),
            props: z.record(z.unknown()).describe("Props initiales du bloc"),
            parentBlockId: z
                .string()
                .nullable()
                .optional()
                .describe("ID du bloc parent. null = insérer à la racine"),
            afterBlockId: z
                .string()
                .nullable()
                .optional()
                .describe("Insérer après ce bloc (même parent). null = à la fin"),
        },
        async ({ moduleSlug, sectionSlug, contentType, blockType, props, parentBlockId, afterBlockId }) => {
            const key = { moduleSlug, sectionSlug, contentType };
            const blocks = await loadBlocks(key);

            const newBlock = createBlock(blockType, props ?? {}, ["section", "list", "columns", "column", "callout", "collapsible"].includes(blockType) ? [] : undefined);

            let index = Number.MAX_SAFE_INTEGER;
            if (afterBlockId) {
                const parentChildren = parentBlockId
                    ? (() => {
                          const { findBlock } = require("../utils/tree.js") as typeof import("../utils/tree.js");
                          return findBlock(blocks, parentBlockId)?.children ?? blocks;
                      })()
                    : blocks;
                const pos = parentChildren.findIndex((b) => b.id === afterBlockId);
                if (pos !== -1) index = pos + 1;
            }

            const updatedBlocks = insertInTree(blocks, newBlock, parentBlockId ?? null, index);
            await saveBlocks(key, updatedBlocks);

            return {
                content: [
                    { type: "text", text: JSON.stringify({ ok: true, blockId: newBlock.id }, null, 2) },
                ],
            };
        }
    );
}
```

Note : l'import dynamique `require` est utilisé pour éviter une dépendance circulaire — si le compilateur TypeScript se plaint, importer directement `findBlock` depuis `"../utils/tree.js"` en haut du fichier.

Version corrigée sans `require` dynamique :

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { insertInTree, createBlock, findBlock } from "../utils/tree.js";

const CONTAINER_TYPES = new Set(["section", "list", "columns", "column", "callout", "collapsible"]);

export function registerInsertBlock(server: McpServer): void {
    server.tool(
        "insert_block",
        "Insère un nouveau bloc dans l'arbre de contenu. parentBlockId null = racine. afterBlockId null = fin.",
        {
            moduleSlug: z.string(),
            sectionSlug: z.string(),
            contentType: z.enum(["cours", "TP", "examen"]),
            blockType: z.string().describe("Type du bloc (ex: text, code, section, list, image-card...)"),
            props: z.record(z.unknown()).describe("Props initiales du bloc"),
            parentBlockId: z.string().nullable().optional().describe("ID du parent. null = racine"),
            afterBlockId: z.string().nullable().optional().describe("Insérer après ce bloc. null = fin"),
        },
        async ({ moduleSlug, sectionSlug, contentType, blockType, props, parentBlockId, afterBlockId }) => {
            const key = { moduleSlug, sectionSlug, contentType };
            const blocks = await loadBlocks(key);

            const newBlock = createBlock(
                blockType,
                props ?? {},
                CONTAINER_TYPES.has(blockType) ? [] : undefined
            );

            let index = Number.MAX_SAFE_INTEGER;
            if (afterBlockId) {
                const siblings = parentBlockId
                    ? (findBlock(blocks, parentBlockId)?.children ?? blocks)
                    : blocks;
                const pos = siblings.findIndex((b) => b.id === afterBlockId);
                if (pos !== -1) index = pos + 1;
            }

            const updatedBlocks = insertInTree(blocks, newBlock, parentBlockId ?? null, index);
            await saveBlocks(key, updatedBlocks);

            return {
                content: [
                    { type: "text", text: JSON.stringify({ ok: true, blockId: newBlock.id }, null, 2) },
                ],
            };
        }
    );
}
```

- [ ] **Étape 3 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

- [ ] **Étape 4 : Commit**

```powershell
git add mcp-server/src/utils/content.ts mcp-server/src/tools/insert-block.ts
git commit -m "feat(mcp): helper loadBlocks/saveBlocks + outil insert_block"
```

---

### Task 8 : Outil `update_block`

**Files:**
- Modify: `mcp-server/src/tools/update-block.ts`

- [ ] **Étape 1 : Implémenter `update-block.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { updateProps, findBlock } from "../utils/tree.js";

export function registerUpdateBlock(server: McpServer): void {
    server.tool(
        "update_block",
        "Met à jour les props d'un bloc existant (merge partiel — seules les clés fournies sont modifiées).",
        {
            moduleSlug: z.string(),
            sectionSlug: z.string(),
            contentType: z.enum(["cours", "TP", "examen"]),
            blockId: z.string().describe("ID du bloc à mettre à jour"),
            props: z.record(z.unknown()).describe("Props à mettre à jour (merge partiel)"),
        },
        async ({ moduleSlug, sectionSlug, contentType, blockId, props }) => {
            const key = { moduleSlug, sectionSlug, contentType };
            const blocks = await loadBlocks(key);

            if (!findBlock(blocks, blockId)) {
                return {
                    content: [{ type: "text", text: `Bloc "${blockId}" introuvable.` }],
                };
            }

            const updatedBlocks = updateProps(blocks, blockId, props);
            await saveBlocks(key, updatedBlocks);

            return {
                content: [{ type: "text", text: JSON.stringify({ ok: true }, null, 2) }],
            };
        }
    );
}
```

- [ ] **Étape 2 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

- [ ] **Étape 3 : Commit**

```powershell
git add mcp-server/src/tools/update-block.ts
git commit -m "feat(mcp): outil update_block (merge partiel de props)"
```

---

### Task 9 : Outil `delete_block`

**Files:**
- Modify: `mcp-server/src/tools/delete-block.ts`

- [ ] **Étape 1 : Implémenter `delete-block.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { removeFromTree, findBlock } from "../utils/tree.js";

export function registerDeleteBlock(server: McpServer): void {
    server.tool(
        "delete_block",
        "Supprime un bloc et tous ses enfants de l'arbre.",
        {
            moduleSlug: z.string(),
            sectionSlug: z.string(),
            contentType: z.enum(["cours", "TP", "examen"]),
            blockId: z.string().describe("ID du bloc à supprimer"),
        },
        async ({ moduleSlug, sectionSlug, contentType, blockId }) => {
            const key = { moduleSlug, sectionSlug, contentType };
            const blocks = await loadBlocks(key);

            if (!findBlock(blocks, blockId)) {
                return {
                    content: [{ type: "text", text: `Bloc "${blockId}" introuvable.` }],
                };
            }

            const updatedBlocks = removeFromTree(blocks, blockId);
            await saveBlocks(key, updatedBlocks);

            return {
                content: [{ type: "text", text: JSON.stringify({ ok: true }, null, 2) }],
            };
        }
    );
}
```

- [ ] **Étape 2 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

- [ ] **Étape 3 : Commit**

```powershell
git add mcp-server/src/tools/delete-block.ts
git commit -m "feat(mcp): outil delete_block"
```

---

### Task 10 : Outil `reorder_blocks`

**Files:**
- Modify: `mcp-server/src/tools/reorder-blocks.ts`

- [ ] **Étape 1 : Implémenter `reorder-blocks.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadBlocks, saveBlocks } from "../utils/content.js";
import { reorderInParent } from "../utils/tree.js";

export function registerReorderBlocks(server: McpServer): void {
    server.tool(
        "reorder_blocks",
        "Réordonne les enfants directs d'un parent (ou de la racine si parentBlockId est null). blockIds doit contenir les IDs dans le nouvel ordre.",
        {
            moduleSlug: z.string(),
            sectionSlug: z.string(),
            contentType: z.enum(["cours", "TP", "examen"]),
            parentBlockId: z
                .string()
                .nullable()
                .describe("ID du bloc parent à réordonner. null = racine"),
            blockIds: z
                .array(z.string())
                .describe("IDs des blocs enfants dans le nouvel ordre"),
        },
        async ({ moduleSlug, sectionSlug, contentType, parentBlockId, blockIds }) => {
            const key = { moduleSlug, sectionSlug, contentType };
            const blocks = await loadBlocks(key);

            const updatedBlocks = reorderInParent(blocks, parentBlockId ?? null, blockIds);
            await saveBlocks(key, updatedBlocks);

            return {
                content: [{ type: "text", text: JSON.stringify({ ok: true }, null, 2) }],
            };
        }
    );
}
```

- [ ] **Étape 2 : Compiler**

```powershell
cd mcp-server && bun run build && cd ..
```

- [ ] **Étape 3 : Commit**

```powershell
git add mcp-server/src/tools/reorder-blocks.ts
git commit -m "feat(mcp): outil reorder_blocks"
```

---

### Task 11 : Build final + configuration Claude Desktop

**Files:**
- Create: `mcp-server/README.md` (instructions de configuration)

- [ ] **Étape 1 : Build complet**

```powershell
cd mcp-server && bun run build && cd ..
```

Expected : `mcp-server/dist/index.js` et tous les fichiers outils compilés sans erreur.

- [ ] **Étape 2 : Test manuel — démarrer le serveur**

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017"
cd mcp-server && node dist/index.js
```

Expected : le processus reste ouvert (attend sur stdin). `Ctrl+C` pour quitter.

- [ ] **Étape 3 : Créer `mcp-server/README.md`**

```markdown
# MCP Server — cours-iut-web

Serveur MCP stdio pour éditer les blocs de cours depuis Claude Desktop.

## Prérequis

- Node.js ≥ 20
- MongoDB accessible (ex: `mongodb://localhost:27017`)

## Build

```bash
cd mcp-server
bun install
bun run build
```

## Configuration Claude Desktop

Ajouter dans `claude_desktop_config.json` (macOS : `~/Library/Application Support/Claude/`) :

```json
{
  "mcpServers": {
    "cours-iut": {
      "command": "node",
      "args": ["/chemin/absolu/vers/mcp-server/dist/index.js"],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017"
      }
    }
  }
}
```

## Outils disponibles

| Outil | Description |
|-------|-------------|
| `list_modules` | Liste tous les modules |
| `list_sections(moduleSlug)` | Sections d'un module + types en DB |
| `get_content(module, section, type)` | Arbre de blocs complet |
| `insert_block(...)` | Insérer un nouveau bloc |
| `update_block(...)` | Mettre à jour les props d'un bloc |
| `delete_block(...)` | Supprimer un bloc et ses enfants |
| `reorder_blocks(...)` | Réordonner les enfants d'un parent |
```

- [ ] **Étape 4 : Commit final**

```powershell
git add mcp-server/
git commit -m "feat(mcp): build final + README configuration Claude Desktop"
```

---

## Self-Review

### Couverture spec
- [x] 7 outils MCP complets — Tasks 5-10
- [x] Transport stdio — `index.ts`
- [x] Connexion MongoDB directe avec `MONGODB_URI` — `db.ts`
- [x] `loadBlocks` + `saveBlocks` avec upsert + update `modules.source` — `utils/content.ts`
- [x] Utilitaires d'arbre autonomes (sans Next.js/React) — `utils/tree.ts`
- [x] `insert_block` gère `parentBlockId` + `afterBlockId` — Task 7
- [x] `update_block` merge partiel — Task 8
- [x] `delete_block` récursif — Task 9
- [x] `reorder_blocks` avec préservation des blocs non listés — Task 10
- [x] README configuration Claude Desktop — Task 11

### Cohérence des types
- `Block` est redéfini localement dans `utils/tree.ts` (pas de dépendance sur `src/types/`)
- Tous les outils importent `Block` depuis `"../utils/tree.js"`
- `loadBlocks` retourne `Block[]` — compatible avec toutes les fonctions d'arbre
