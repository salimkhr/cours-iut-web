# Builder — IA locale Ollama : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réactiver l'assistant IA du builder sur Ollama local (tools granulaires fiables, écriture DB), ajouter une review pédagogique in-app, et réaligner le MCP sur le schéma arborescent.

**Architecture:** Un client Ollama minimal (`src/lib/ai/ollama.ts`) + un module pur d'application des tool calls (`src/lib/ai/treeOps.ts`, wrappant `blockTreeUtils` + `validateBlockTree`) alimentent une boucle tool-loop serveur dans la route `ai-assist`. La persistance (upsert `course_content` + ref module + `revalidateTag`), aujourd'hui dupliquée dans 3 fichiers, est extraite dans `src/lib/contentPersistence.ts`. La route `review` utilise la sortie structurée d'Ollama (paramètre `format`). Le MCP passe du format plat `RawBlock`/`colSpan` au schéma récursif validé.

**Tech Stack:** Next.js 16 Route Handlers, Ollama `/api/chat` (modèle `gemma4:e4b`, tools + structured output), MongoDB driver natif, Zustand, `bun:test`.

**Spec:** `docs/superpowers/specs/2026-06-11-builder-ai-ollama-design.md`

**Conventions repo :** indentation 4 espaces, imports `@/*`, TypeScript strict (pas d'`any`), apostrophes `&apos;` dans le JSX texte, tests en `bun:test` (PAS Vitest). Commits sans `--no-verify` (hook eslint).

---

## Fichiers

| Fichier | Action | Responsabilité |
|---|---|---|
| `src/lib/ai/treeOps.ts` | Créer | Application pure des tool calls IA (uuid serveur, validation, rollback) + définitions des tools |
| `tests/lib/treeOps.test.ts` | Créer | Tests bun:test de treeOps |
| `src/lib/ai/ollama.ts` | Créer | Client Ollama : `chatWithTools()`, `chatStructured()`, erreur typée |
| `tests/lib/ollama.test.ts` | Créer | Tests du client (fetch mocké) |
| `src/lib/contentPersistence.ts` | Créer | `persistContent()` partagé (upsert + ref module + revalidateTag) |
| `src/app/api/admin/content/[module]/[section]/[type]/route.ts` | Modifier | PUT utilise `persistContent()` |
| `src/app/api/admin/content/ai-assist/route.ts` | Réécrire | Tool-loop Ollama, plus d'Anthropic |
| `src/components/builder/AiAssistantPanel.tsx` | Réécrire | FAB réactivé, historique, bilan explicite |
| `src/app/api/admin/content/review/route.ts` | Créer | Lint pédagogique structuré |
| `src/components/builder/ReviewPanel.tsx` | Créer | Bouton toolbar + panneau d'issues |
| `src/components/builder/BuilderPage.tsx` | Modifier | Intègre ReviewPanel dans la toolbar |
| `src/components/builder/BlockTree.tsx` | Modifier | `data-block-id` sur les wrappers (scroll ciblé) |
| `src/app/api/mcp/route.ts` | Modifier | Schéma récursif + `validateBlockTree` + `persistContent` |
| `CLAUDE.md` | Modifier | §7 : `OLLAMA_URL`, `OLLAMA_MODEL` |

---

### Task 1: `treeOps.ts` — application des tool calls (TDD)

Les opérations d'arbre existent déjà dans `src/lib/blockTreeUtils.ts` (`findBlock`, `insertBlock`, `removeBlock`, `updateBlockProps`, `moveBlock` — pures, immuables). `treeOps.ts` les wrappe : génération d'`id` côté serveur, validation `validateBlockTree` après chaque opération, rollback si invalide. **Ne pas réimplémenter les opérations d'arbre.**

**Files:**
- Create: `src/lib/ai/treeOps.ts`
- Test: `tests/lib/treeOps.test.ts`

- [ ] **Step 1: Écrire les tests qui échouent**

```typescript
// tests/lib/treeOps.test.ts
import { describe, it, expect } from "bun:test";
import type { Block } from "@/types/CourseContent";
import { applyAiToolCall } from "@/lib/ai/treeOps";

/** Arbre valide au sens de validateBlockTree (spans = 12, list → list-item). */
function makeTree(): Block[] {
    return [
        { id: "t1", type: "text", props: { content: "hello" } },
        {
            id: "cols", type: "columns", props: {}, children: [
                { id: "colA", type: "column", props: { span: 6 }, children: [
                    { id: "img", type: "image-card", props: { src: "/x.png" } },
                ] },
                { id: "colB", type: "column", props: { span: 6 }, children: [] },
            ],
        },
        {
            id: "lst", type: "list", props: { ordered: false }, children: [
                { id: "li1", type: "list-item", props: { text: "a" }, children: [] },
            ],
        },
    ];
}

describe("applyAiToolCall — add_blocks", () => {
    it("ajoute un bloc à la racine avec un id généré serveur", () => {
        const tree = makeTree();
        const result = applyAiToolCall(tree, "add_blocks", {
            blocks: [{ type: "text", props: { content: "lorem ipsum" } }],
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.blocks).toHaveLength(4);
        const added = result.blocks[3];
        expect(added.type).toBe("text");
        expect(added.props.content).toBe("lorem ipsum");
        expect(added.id.length).toBeGreaterThan(0);
        expect(["t1", "cols", "lst"]).not.toContain(added.id);
        expect(result.summary).toContain(added.id);
    });

    it("ignore tout id fourni par le modèle et en génère un nouveau", () => {
        const result = applyAiToolCall(makeTree(), "add_blocks", {
            blocks: [{ id: "t1", type: "text", props: { content: "x" } }],
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.blocks[3].id).not.toBe("t1");
    });

    it("insère à une position donnée dans un parent", () => {
        const result = applyAiToolCall(makeTree(), "add_blocks", {
            blocks: [{ type: "list-item", props: { text: "z" } }],
            parentId: "lst",
            position: 0,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const lst = result.blocks[2];
        expect(lst.children).toHaveLength(2);
        expect(lst.children![0].props.text).toBe("z");
    });

    it("rollback si le type d'enfant est interdit dans le parent", () => {
        const tree = makeTree();
        const result = applyAiToolCall(tree, "add_blocks", {
            blocks: [{ type: "text", props: { content: "x" } }],
            parentId: "lst", // list n'accepte que list-item
        });
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.blocks).toBe(tree); // référence inchangée = rollback
        expect(result.error).toContain("list");
    });

    it("rollback si les props violent le schéma Zod", () => {
        const result = applyAiToolCall(makeTree(), "add_blocks", {
            blocks: [{ type: "heading", props: { level: 5, text: "t" } }],
        });
        expect(result.ok).toBe(false);
    });

    it("erreur si parentId introuvable", () => {
        const result = applyAiToolCall(makeTree(), "add_blocks", {
            blocks: [{ type: "text", props: { content: "x" } }],
            parentId: "nope",
        });
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toContain("nope");
    });

    it("génère des ids pour les children imbriqués", () => {
        const result = applyAiToolCall(makeTree(), "add_blocks", {
            blocks: [{
                type: "list", props: { ordered: true },
                children: [{ type: "list-item", props: { text: "a" } }],
            }],
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const added = result.blocks[3];
        expect(added.children![0].id.length).toBeGreaterThan(0);
    });
});

describe("applyAiToolCall — update_block", () => {
    it("merge les props (patch partiel)", () => {
        const result = applyAiToolCall(makeTree(), "update_block", {
            id: "img",
            props: { title: "Légende" },
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const img = result.blocks[1].children![0].children![0];
        expect(img.props.src).toBe("/x.png");   // conservé
        expect(img.props.title).toBe("Légende"); // ajouté
    });

    it("erreur si id introuvable", () => {
        const result = applyAiToolCall(makeTree(), "update_block", { id: "ghost", props: {} });
        expect(result.ok).toBe(false);
    });

    it("rollback si le patch rend les props invalides", () => {
        const result = applyAiToolCall(makeTree(), "update_block", {
            id: "colA",
            props: { span: 5 }, // span interdit
        });
        expect(result.ok).toBe(false);
    });
});

describe("applyAiToolCall — remove_block", () => {
    it("supprime un bloc imbriqué", () => {
        const result = applyAiToolCall(makeTree(), "remove_block", { id: "img" });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.blocks[1].children![0].children).toHaveLength(0);
    });

    it("erreur si id introuvable", () => {
        const result = applyAiToolCall(makeTree(), "remove_block", { id: "ghost" });
        expect(result.ok).toBe(false);
    });
});

describe("applyAiToolCall — move_block", () => {
    it("déplace un bloc racine en fin", () => {
        const result = applyAiToolCall(makeTree(), "move_block", {
            id: "t1", parentId: null, position: 2,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.blocks[2].id).toBe("t1");
    });

    it("refuse un déplacement dans son propre descendant", () => {
        const result = applyAiToolCall(makeTree(), "move_block", {
            id: "cols", parentId: "colA", position: 0,
        });
        expect(result.ok).toBe(false);
    });
});

describe("applyAiToolCall — tool inconnu", () => {
    it("erreur explicite", () => {
        const result = applyAiToolCall(makeTree(), "explode", {});
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toContain("explode");
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `bun test tests/lib/treeOps.test.ts`
Expected: FAIL — `Cannot find module '@/lib/ai/treeOps'`

- [ ] **Step 3: Implémenter `treeOps.ts`**

```typescript
// src/lib/ai/treeOps.ts
// Application des tool calls de l'assistant IA sur l'arbre de blocs.
// Module pur (zéro DB, zéro fetch) : wrappe blockTreeUtils + validateBlockTree.
// Les ids des nouveaux blocs sont TOUJOURS générés ici, jamais par le modèle.
import { v4 as uuidv4 } from "uuid";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    insertBlock,
    removeBlock,
    updateBlockProps,
    moveBlock,
} from "@/lib/blockTreeUtils";
import { validateBlockTree } from "@/lib/validateBlockTree";

export type AiToolResult =
    | { ok: true; blocks: Block[]; summary: string }
    | { ok: false; blocks: Block[]; error: string };

/** Bloc tel que fourni par le modèle : sans id (ignoré s'il est présent). */
interface AiBlockInput {
    type: string;
    props?: Record<string, unknown>;
    children?: AiBlockInput[];
}

function instantiate(input: AiBlockInput): Block {
    return {
        id: uuidv4(),
        type: String(input.type),
        props: (input.props ?? {}) as Record<string, unknown>,
        ...(Array.isArray(input.children)
            ? { children: input.children.map(instantiate) }
            : {}),
    };
}

function validationError(blocks: Block[], next: Block[]): AiToolResult | null {
    const validation = validateBlockTree(next);
    if (validation.valid) return null;
    return {
        ok: false,
        blocks, // rollback : arbre d'origine, référence intacte
        error: `Opération refusée, arbre invalide : ${validation.errors
            .map((e) => `${e.path}: ${e.message}`)
            .join(" ; ")}`,
    };
}

export function applyAiToolCall(
    blocks: Block[],
    name: string,
    args: Record<string, unknown>
): AiToolResult {
    switch (name) {
        case "add_blocks": {
            const raw = args.blocks;
            if (!Array.isArray(raw) || raw.length === 0) {
                return { ok: false, blocks, error: "add_blocks : blocks doit être un tableau non vide" };
            }
            const parentId = typeof args.parentId === "string" ? args.parentId : null;
            if (parentId !== null && !findBlock(blocks, parentId)) {
                return { ok: false, blocks, error: `add_blocks : parentId introuvable : ${parentId}` };
            }
            const siblings = parentId === null
                ? blocks
                : findBlock(blocks, parentId)!.children ?? [];
            const position = typeof args.position === "number"
                ? Math.max(0, Math.min(args.position, siblings.length))
                : siblings.length;

            const created = (raw as AiBlockInput[]).map(instantiate);
            let next = blocks;
            created.forEach((b, i) => {
                next = insertBlock(next, b, parentId, position + i);
            });

            const invalid = validationError(blocks, next);
            if (invalid) return invalid;
            return {
                ok: true,
                blocks: next,
                summary: `${created.length} bloc(s) ajouté(s) (ids : ${created.map((b) => b.id).join(", ")})`,
            };
        }

        case "update_block": {
            const id = String(args.id ?? "");
            const target = findBlock(blocks, id);
            if (!target) {
                return { ok: false, blocks, error: `update_block : bloc introuvable : ${id}` };
            }
            if (typeof args.props !== "object" || args.props === null) {
                return { ok: false, blocks, error: "update_block : props doit être un objet" };
            }
            // Patch partiel : merge sur les props existantes.
            const merged = { ...target.props, ...(args.props as Record<string, unknown>) };
            const next = updateBlockProps(blocks, id, merged);

            const invalid = validationError(blocks, next);
            if (invalid) return invalid;
            return { ok: true, blocks: next, summary: `bloc ${id} mis à jour` };
        }

        case "remove_block": {
            const id = String(args.id ?? "");
            if (!findBlock(blocks, id)) {
                return { ok: false, blocks, error: `remove_block : bloc introuvable : ${id}` };
            }
            const next = removeBlock(blocks, id);

            const invalid = validationError(blocks, next);
            if (invalid) return invalid;
            return { ok: true, blocks: next, summary: `bloc ${id} supprimé` };
        }

        case "move_block": {
            const id = String(args.id ?? "");
            const parentId = typeof args.parentId === "string" ? args.parentId : null;
            const position = typeof args.position === "number" ? args.position : 0;
            const next = moveBlock(blocks, id, parentId, position);
            if (next === blocks) {
                return { ok: false, blocks, error: `move_block : déplacement impossible (id ${id} ou cible invalide)` };
            }

            const invalid = validationError(blocks, next);
            if (invalid) return invalid;
            return { ok: true, blocks: next, summary: `bloc ${id} déplacé` };
        }

        default:
            return { ok: false, blocks, error: `Tool inconnu : ${name}` };
    }
}

/** Définitions des tools au format Ollama /api/chat. */
export const AI_TOOLS = [
    {
        type: "function" as const,
        function: {
            name: "add_blocks",
            description:
                "Ajoute un ou plusieurs blocs. Ne JAMAIS fournir d'id : ils sont générés par le serveur. "
                + "Les conteneurs portent leurs enfants dans children (eux aussi sans id).",
            parameters: {
                type: "object",
                properties: {
                    blocks: {
                        type: "array",
                        description: "Blocs à créer : { type, props, children? } — SANS id",
                        items: { type: "object" },
                    },
                    parentId: {
                        type: "string",
                        description: "Id du bloc conteneur cible. Absent = racine du document.",
                    },
                    position: {
                        type: "number",
                        description: "Index d'insertion (0 = début). Absent = fin.",
                    },
                },
                required: ["blocks"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "update_block",
            description: "Modifie les props d'un bloc existant (patch partiel : seules les clés fournies changent).",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Id du bloc à modifier" },
                    props: { type: "object", description: "Props à modifier (merge)" },
                },
                required: ["id", "props"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "remove_block",
            description: "Supprime un bloc (et tout son sous-arbre) par son id.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Id du bloc à supprimer" },
                },
                required: ["id"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "move_block",
            description: "Déplace un bloc vers un parent et une position donnés.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Id du bloc à déplacer" },
                    parentId: { type: "string", description: "Id du conteneur cible. Absent = racine." },
                    position: { type: "number", description: "Position finale dans le parent (0 = début)" },
                },
                required: ["id", "position"],
            },
        },
    },
];
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `bun test tests/lib/treeOps.test.ts`
Expected: PASS (17 tests)

- [ ] **Step 5: Lancer toute la suite + commit**

Run: `bun test`
Expected: PASS (aucune régression)

```bash
git add src/lib/ai/treeOps.ts tests/lib/treeOps.test.ts
git commit -m "feat(builder): treeOps — application validée des tool calls IA (uuid serveur, rollback)"
```

---

### Task 2: `ollama.ts` — client Ollama (TDD)

**Files:**
- Create: `src/lib/ai/ollama.ts`
- Test: `tests/lib/ollama.test.ts`

- [ ] **Step 1: Écrire les tests qui échouent**

Les fonctions prennent l'URL depuis `process.env` à l'appel (pas au chargement du module) pour rester testables et cohérentes avec le mock de build de `mongodb.ts`.

```typescript
// tests/lib/ollama.test.ts
import { describe, it, expect, afterEach } from "bun:test";
import { chatWithTools, chatStructured, OllamaUnreachableError } from "@/lib/ai/ollama";

const realFetch = globalThis.fetch;
afterEach(() => {
    globalThis.fetch = realFetch;
});

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) =>
        handler(String(url), init)) as typeof fetch;
}

describe("chatWithTools", () => {
    it("envoie model, messages, tools, stream:false et température 0", async () => {
        let captured: Record<string, unknown> = {};
        mockFetch((_url, init) => {
            captured = JSON.parse(String(init?.body)) as Record<string, unknown>;
            return new Response(JSON.stringify({
                message: { role: "assistant", content: "ok" },
            }));
        });
        const reply = await chatWithTools(
            [{ role: "user", content: "salut" }],
            [{ type: "function", function: { name: "noop", description: "", parameters: { type: "object", properties: {} } } }]
        );
        expect(reply.content).toBe("ok");
        expect(captured.stream).toBe(false);
        expect(captured.model).toBeDefined();
        expect((captured.options as { temperature: number }).temperature).toBe(0);
        expect(Array.isArray(captured.tools)).toBe(true);
    });

    it("renvoie les tool_calls du modèle", async () => {
        mockFetch(() => new Response(JSON.stringify({
            message: {
                role: "assistant",
                content: "",
                tool_calls: [{ function: { name: "add_blocks", arguments: { blocks: [] } } }],
            },
        })));
        const reply = await chatWithTools([{ role: "user", content: "x" }], []);
        expect(reply.tool_calls).toHaveLength(1);
        expect(reply.tool_calls![0].function.name).toBe("add_blocks");
    });

    it("lève OllamaUnreachableError si le serveur ne répond pas", async () => {
        mockFetch(() => { throw new Error("ECONNREFUSED"); });
        await expect(chatWithTools([{ role: "user", content: "x" }], []))
            .rejects.toBeInstanceOf(OllamaUnreachableError);
    });

    it("lève une erreur sur réponse HTTP non-ok", async () => {
        mockFetch(() => new Response("model not found", { status: 404 }));
        await expect(chatWithTools([{ role: "user", content: "x" }], []))
            .rejects.toThrow("404");
    });
});

describe("chatStructured", () => {
    it("envoie le schéma dans format et parse la réponse JSON", async () => {
        let captured: Record<string, unknown> = {};
        mockFetch((_url, init) => {
            captured = JSON.parse(String(init?.body)) as Record<string, unknown>;
            return new Response(JSON.stringify({
                message: { role: "assistant", content: "{\"issues\":[]}" },
            }));
        });
        const out = await chatStructured<{ issues: unknown[] }>(
            [{ role: "user", content: "lint" }],
            { type: "object", properties: { issues: { type: "array" } }, required: ["issues"] }
        );
        expect(out.issues).toEqual([]);
        expect(captured.format).toBeDefined();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `bun test tests/lib/ollama.test.ts`
Expected: FAIL — `Cannot find module '@/lib/ai/ollama'`

- [ ] **Step 3: Implémenter `ollama.ts`**

```typescript
// src/lib/ai/ollama.ts
// Client minimal pour l'API Ollama locale. Fetch natif, aucune dépendance.
// OLLAMA_URL (défaut http://localhost:11434), OLLAMA_MODEL (défaut gemma4:e4b).

export class OllamaUnreachableError extends Error {
    constructor(url: string) {
        super(`Ollama injoignable sur ${url}`);
        this.name = "OllamaUnreachableError";
    }
}

export interface OllamaToolCall {
    function: { name: string; arguments: Record<string, unknown> };
}

export interface OllamaMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    tool_calls?: OllamaToolCall[];
    /** Nom du tool dont ce message rapporte le résultat (role: "tool"). */
    tool_name?: string;
}

export interface OllamaTool {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

async function callOllama(payload: Record<string, unknown>): Promise<OllamaMessage> {
    const baseUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL ?? "gemma4:e4b";

    let res: Response;
    try {
        res = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                stream: false,
                options: { temperature: 0 },
                ...payload,
            }),
        });
    } catch {
        throw new OllamaUnreachableError(baseUrl);
    }

    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Ollama HTTP ${res.status} : ${detail}`);
    }

    const data = await res.json() as { message: OllamaMessage };
    return data.message;
}

/** Tour de chat avec tools. Renvoie le message assistant (texte et/ou tool_calls). */
export function chatWithTools(
    messages: OllamaMessage[],
    tools: OllamaTool[]
): Promise<OllamaMessage> {
    return callOllama({ messages, tools });
}

/** Sortie structurée : Ollama contraint la réponse au JSON schema fourni. */
export async function chatStructured<T>(
    messages: OllamaMessage[],
    schema: Record<string, unknown>
): Promise<T> {
    const message = await callOllama({ messages, format: schema });
    return JSON.parse(message.content) as T;
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `bun test tests/lib/ollama.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/ollama.ts tests/lib/ollama.test.ts
git commit -m "feat(builder): client Ollama minimal — chatWithTools + chatStructured"
```

---

### Task 3: `contentPersistence.ts` — persistance partagée

L'upsert `course_content` + bascule `modules.sections.contents` + `revalidateTag` est dupliqué dans la route PUT, l'ancienne route ai-assist et le MCP. On l'extrait, et on refactore la route PUT pour l'utiliser (les routes ai-assist et MCP l'adopteront en Tasks 4 et 8).

**Files:**
- Create: `src/lib/contentPersistence.ts`
- Modify: `src/app/api/admin/content/[module]/[section]/[type]/route.ts:60-118`

- [ ] **Step 1: Créer `contentPersistence.ts`**

Comportement copié à l'identique du PUT actuel (`route.ts:61-108`), y compris `revalidateTag(..., { expire: 0 })`.

```typescript
// src/lib/contentPersistence.ts
// Persistance partagée d'un contenu de cours : upsert course_content,
// bascule du ref module en source "db", invalidation du cache.
// Consommé par la route PUT, ai-assist et le MCP — toute évolution ici
// s'applique aux trois chemins d'écriture.
import { revalidateTag } from "next/cache";
import { connectToDB } from "@/lib/mongodb";
import type { Block, CourseContent } from "@/types/CourseContent";

export interface PersistResult {
    contentId: string;
    version: number;
    updatedAt: Date;
}

export async function persistContent(
    moduleSlug: string,
    sectionSlug: string,
    contentType: CourseContent["contentType"],
    blocks: Block[]
): Promise<PersistResult> {
    const db = await connectToDB();
    const now = new Date();

    const existing = await db
        .collection<CourseContent>("course_content")
        .findOne({ moduleSlug, sectionSlug, contentType });

    let contentId: string;
    let version: number;

    if (existing) {
        await db.collection<CourseContent>("course_content").updateOne(
            { _id: existing._id },
            { $set: { blocks, updatedAt: now }, $inc: { version: 1 } }
        );
        contentId = existing._id!.toString();
        version = existing.version + 1;
    } else {
        const insertResult = await db.collection<CourseContent>("course_content").insertOne({
            moduleSlug,
            sectionSlug,
            contentType,
            blocks,
            version: 1,
            createdAt: now,
            updatedAt: now,
        });
        contentId = insertResult.insertedId.toString();
        version = 1;
    }

    await db.collection("modules").updateOne(
        { path: moduleSlug },
        {
            $set: {
                "sections.$[s].contents.$[c].source": "db",
                "sections.$[s].contents.$[c].contentId": contentId,
            },
        },
        {
            arrayFilters: [
                { "s.path": sectionSlug },
                { "c.type": contentType },
            ],
        }
    );

    revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 });

    return { contentId, version, updatedAt: now };
}
```

- [ ] **Step 2: Refactorer le PUT pour l'utiliser**

Dans `src/app/api/admin/content/[module]/[section]/[type]/route.ts`, remplacer le corps du PUT entre `const blocks = body.blocks as Block[];` et le `return NextResponse.json` final (lignes 61-118) par :

```typescript
        const result = await persistContent(moduleSlug, sectionSlug, typedType, blocks);

        return NextResponse.json({
            contentId: result.contentId,
            version: result.version,
            updatedAt: result.updatedAt,
        });
```

Ajouter l'import en tête de fichier :

```typescript
import { persistContent } from "@/lib/contentPersistence";
```

Supprimer les imports devenus inutiles dans ce fichier si le GET/DELETE ne les utilisent plus (`revalidateTag` reste utilisé par le DELETE — le garder).

- [ ] **Step 3: Vérifier la suite de tests et le typage**

Run: `bun test`
Expected: PASS — en particulier les tests `tests/api/` existants, qui valident que le contrat du PUT n'a pas changé.

Run: `bunx tsc --noEmit`
Expected: aucune erreur

- [ ] **Step 4: Commit**

```bash
git add src/lib/contentPersistence.ts "src/app/api/admin/content/[module]/[section]/[type]/route.ts"
git commit -m "refactor(builder): extrait persistContent — persistance partagée des contenus"
```

---

### Task 4: réécriture de la route `ai-assist` (tool-loop Ollama)

**Files:**
- Rewrite: `src/app/api/admin/content/ai-assist/route.ts`

- [ ] **Step 1: Réécrire la route**

Remplacer **intégralement** le contenu du fichier par :

```typescript
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import type { Block, CourseContent } from "@/types/CourseContent";
import { containerRules, blockPropsSchemas } from "@/lib/blockSchemas";
import {
    chatWithTools,
    OllamaUnreachableError,
    type OllamaMessage,
} from "@/lib/ai/ollama";
import { AI_TOOLS, applyAiToolCall } from "@/lib/ai/treeOps";
import { persistContent } from "@/lib/contentPersistence";

const MAX_ITERATIONS = 5;

interface AiAssistBody {
    message: string;
    history?: { role: "user" | "assistant"; content: string }[];
    currentBlocks: Block[];
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

function buildSystemPrompt(blocks: Block[]): string {
    const nestingDoc = Object.entries(containerRules)
        .map(([type, rule]) => {
            const children = rule.allowedChildren === "any"
                ? "tout type (sauf columns)"
                : rule.allowedChildren.join(", ");
            const parents = rule.allowedParents
                ? rule.allowedParents.map((p) => p ?? "racine").join(", ")
                : "partout";
            return `- ${type} : enfants = ${children} ; parents = ${parents}`;
        })
        .join("\n");

    return `Tu es un assistant qui construit du contenu pédagogique sous forme d'arbre de blocs.
RÈGLE ABSOLUE : si la demande implique d'ajouter, modifier, supprimer ou déplacer des blocs,
tu DOIS appeler un tool (add_blocks, update_block, remove_block, move_block).
Ne réponds JAMAIS uniquement en texte pour une demande de modification.
Ne fournis JAMAIS d'id pour les nouveaux blocs : ils sont générés par le serveur.
Types de blocs disponibles : ${Object.keys(blockPropsSchemas).join(", ")}.
Les conteneurs portent leurs enfants dans "children" :
${nestingDoc}
Contraintes : columns a 2 à 4 enfants column dont la somme des props.span fait 12 (valeurs : 3, 4, 6, 8, 9) ; list ne contient que des list-item.
Arbre actuel (avec ids) :
${JSON.stringify(blocks, null, 2)}`;
}

export const POST = withAdmin(async (req: Request) => {
    try {
        const body = await req.json() as AiAssistBody;
        let blocks = body.currentBlocks;
        let changesCount = 0;
        let assistantText = "";
        let nudged = false;
        let completed = false;

        const messages: OllamaMessage[] = [
            { role: "system", content: buildSystemPrompt(blocks) },
            ...(body.history ?? []).map((m): OllamaMessage => ({
                role: m.role,
                content: m.content,
            })),
            { role: "user", content: body.message },
        ];

        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const reply = await chatWithTools(messages, AI_TOOLS);
            messages.push(reply);

            const toolCalls = reply.tool_calls ?? [];

            if (toolCalls.length === 0) {
                assistantText = reply.content;
                // Relance unique : le modèle a répondu en texte sans rien modifier.
                if (!nudged && changesCount === 0) {
                    nudged = true;
                    messages.push({
                        role: "user",
                        content: "Tu n'as appelé aucun tool. Si ma demande nécessite une modification des blocs, appelle le tool approprié maintenant. Sinon, réponds normalement.",
                    });
                    continue;
                }
                completed = true;
                break;
            }

            for (const call of toolCalls) {
                const result = applyAiToolCall(blocks, call.function.name, call.function.arguments);
                if (result.ok) {
                    blocks = result.blocks;
                    changesCount++;
                    messages.push({
                        role: "tool",
                        tool_name: call.function.name,
                        content: `OK : ${result.summary}`,
                    });
                } else {
                    messages.push({
                        role: "tool",
                        tool_name: call.function.name,
                        content: `ERREUR : ${result.error}`,
                    });
                }
            }
        }

        if (changesCount > 0) {
            await persistContent(
                body.moduleSlug,
                body.sectionSlug,
                body.contentType as CourseContent["contentType"],
                blocks
            );
        }

        return NextResponse.json({
            text: assistantText
                || (changesCount > 0 ? "Modifications appliquées." : "Aucune modification effectuée."),
            blocks: changesCount > 0 ? blocks : null,
            changesCount,
            warning: !completed
                ? "Limite d'itérations atteinte — le résultat peut être partiel."
                : undefined,
        });
    } catch (error) {
        if (error instanceof OllamaUnreachableError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }
        console.error("[ai-assist]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
```

Points de comportement garantis par cette boucle :
- chaque tool call est validé via `applyAiToolCall` (Task 1) — un échec renvoie l'erreur **au modèle**, qui retente dans l'itération suivante ;
- l'arbre n'est persisté **que** si au moins une opération a réussi, et il est valide par construction (validé à chaque étape) ;
- si la limite d'itérations est atteinte avec des changements valides, on persiste quand même + `warning` (décision spec §4).

- [ ] **Step 2: Vérifier typage et lint**

Run: `bunx tsc --noEmit`
Expected: aucune erreur

Run: `bun run lint`
Expected: aucune erreur (le warning préexistant sur `blockSchemas.test.ts` est toléré)

- [ ] **Step 3: Test manuel de la boucle (Ollama doit tourner)**

Run: `bun dev`, ouvrir un contenu dans le builder, puis dans un autre terminal :

```powershell
# Vérifier qu'Ollama répond
Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 | Out-Null; "ollama OK"
```

Le test complet via l'UI arrive en Task 5 — à ce stade vérifier seulement que `bun dev` démarre sans erreur de module.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/content/ai-assist/route.ts
git commit -m "feat(builder): ai-assist sur Ollama — tool-loop granulaire avec auto-correction"
```

---

### Task 5: réécriture de `AiAssistantPanel` (réactivation + historique + bilan)

**Files:**
- Rewrite: `src/components/builder/AiAssistantPanel.tsx`

- [ ] **Step 1: Réécrire le composant**

Remplacer **intégralement** le contenu du fichier par :

```tsx
"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore } from "@/lib/store/builderStore";
import type { Block } from "@/types/CourseContent";

interface AiAssistantPanelProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    /** Bilan d'exécution (messages assistant uniquement). */
    changesCount?: number;
    warning?: string;
    isError?: boolean;
}

export function AiAssistantPanel({ moduleSlug, sectionSlug, contentType }: AiAssistantPanelProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const { blocks, setBlocks } = useBuilderStore();

    function scrollToBottom() {
        requestAnimationFrame(() => {
            listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
        });
    }

    async function handleSend() {
        const userMessage = message.trim();
        if (!userMessage || loading) return;
        setLoading(true);
        setMessage("");
        setHistory((h) => [...h, { role: "user", content: userMessage }]);
        scrollToBottom();

        try {
            const res = await fetch("/api/admin/content/ai-assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: history.map(({ role, content }) => ({ role, content })),
                    currentBlocks: blocks,
                    moduleSlug,
                    sectionSlug,
                    contentType,
                }),
            });
            const data = await res.json() as {
                text?: string;
                blocks?: Block[] | null;
                changesCount?: number;
                warning?: string;
                error?: string;
            };

            if (!res.ok) {
                setHistory((h) => [...h, {
                    role: "assistant",
                    content: data.error ?? `Erreur HTTP ${res.status}`,
                    isError: true,
                }]);
                return;
            }

            if (data.blocks) {
                // L'arbre est déjà persisté en DB côté serveur : setBlocks
                // resynchronise le canvas et remet isDirty à false.
                setBlocks(data.blocks);
            }
            setHistory((h) => [...h, {
                role: "assistant",
                content: data.text ?? "",
                changesCount: data.changesCount ?? 0,
                warning: data.warning,
            }]);
        } catch {
            setHistory((h) => [...h, {
                role: "assistant",
                content: "Erreur de communication avec l'assistant.",
                isError: true,
            }]);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    }

    return (
        <>
            {/* FAB */}
            <button
                aria-label={open ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA"}
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-50 bg-brand-primary hover:bg-brand-accent-dark text-brand-light rounded-full w-11 h-11 flex items-center justify-center shadow-md transition-colors cursor-pointer"
            >
                {open
                    ? <X className="w-5 h-5" />
                    : <Sparkles className="w-5 h-5" />
                }
            </button>

            {/* Panel */}
            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-96 max-h-[70vh] bg-bridge-50 dark:bg-bridge-900 border border-bridge-500/20 dark:border-bridge-500/35 rounded-xl shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">

                    <div className="flex items-center justify-between px-4 py-3 border-b border-bridge-500/20 dark:border-bridge-500/35 shrink-0">
                        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary dark:text-brand-primary flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Assistant IA — local
                        </span>
                        <button
                            aria-label="Fermer"
                            className="text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200 transition-colors cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Historique */}
                    <div ref={listRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-[80px]">
                        {history.length === 0 && (
                            <p className="text-xs text-bridge-500 dark:text-bridge-400 italic">
                                Ex : « Ajoute un bloc de texte avec un lorem ipsum »
                            </p>
                        )}
                        {history.map((msg, i) => (
                            <div
                                key={i}
                                className={msg.role === "user"
                                    ? "self-end max-w-[85%] text-sm bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg px-3 py-2 text-bridge-800 dark:text-bridge-100"
                                    : "self-start max-w-[85%] text-sm bg-bridge-100 dark:bg-bridge-800 border border-bridge-400/30 dark:border-bridge-500/30 rounded-lg px-3 py-2 text-bridge-700 dark:text-bridge-300"}
                            >
                                {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                {msg.role === "assistant" && !msg.isError && msg.changesCount !== undefined && (
                                    <p className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                                        msg.changesCount > 0
                                            ? "text-emerald-700 dark:text-emerald-400"
                                            : "text-amber-700 dark:text-amber-400"
                                    }`}>
                                        {msg.changesCount > 0
                                            ? <><CheckCircle2 className="w-3 h-3" /> {msg.changesCount} modification(s) appliquée(s) et sauvegardée(s)</>
                                            : <><TriangleAlert className="w-3 h-3" /> Aucune modification effectuée</>
                                        }
                                    </p>
                                )}
                                {msg.warning && (
                                    <p className="flex items-center gap-1 mt-1 text-xs text-amber-700 dark:text-amber-400">
                                        <TriangleAlert className="w-3 h-3" /> {msg.warning}
                                    </p>
                                )}
                                {msg.isError && (
                                    <p className="flex items-center gap-1 mt-1 text-xs text-red-700 dark:text-red-400">
                                        <TriangleAlert className="w-3 h-3" /> Échec de la requête
                                    </p>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="self-start flex items-center gap-2 text-xs text-bridge-500 dark:text-bridge-400 px-3 py-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> En cours…
                            </div>
                        )}
                    </div>

                    {/* Saisie */}
                    <div className="p-3 flex flex-col gap-2 border-t border-bridge-500/20 dark:border-bridge-500/35 shrink-0">
                        <Textarea
                            placeholder="Ex : Ajoute 3 blocs texte expliquant le DOM…"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={2}
                            className="text-sm border-bridge-400/40 dark:border-bridge-500/40 bg-bridge-100/50 dark:bg-bridge-800/50 resize-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSend();
                            }}
                        />
                        <Button
                            size="sm"
                            onClick={() => void handleSend()}
                            disabled={loading || !message.trim()}
                            className="bg-brand-primary hover:bg-brand-accent-dark text-brand-light gap-1.5 h-8 text-xs disabled:opacity-40"
                        >
                            {loading
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> En cours…</>
                                : <><Sparkles className="w-3.5 h-3.5" /> Envoyer (Ctrl+↵)</>
                            }
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
```

- [ ] **Step 2: Vérifier typage et lint**

Run: `bunx tsc --noEmit; bun run lint`
Expected: aucune erreur

- [ ] **Step 3: Test manuel end-to-end (critère d'acceptation de la spec)**

1. `bun dev`, ouvrir `/admin`, entrer dans un contenu du builder.
2. Ouvrir le FAB ✨ (il doit être actif, plus grisé).
3. Taper : « Ajoute un bloc de texte avec un lorem ipsum » puis Envoyer.
4. **Attendu :** le bloc apparaît dans le canvas, le panel affiche « ✓ 1 modification(s) appliquée(s) et sauvegardée(s) », et après refresh de la page le bloc est toujours là (persistance DB).
5. Couper Ollama (`Stop-Process -Name ollama` ou arrêter le service), renvoyer un message.
6. **Attendu :** message d'erreur « Ollama injoignable sur http://localhost:11434 » dans le panel. Relancer Ollama ensuite.

- [ ] **Step 4: Commit**

```bash
git add src/components/builder/AiAssistantPanel.tsx
git commit -m "feat(builder): AiAssistantPanel réactivé — historique, bilan explicite, erreurs Ollama"
```

---

### Task 6: route `review` — lint pédagogique structuré

**Files:**
- Create: `src/app/api/admin/content/review/route.ts`

- [ ] **Step 1: Créer la route**

```typescript
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import type { Block } from "@/types/CourseContent";
import { chatStructured, OllamaUnreachableError } from "@/lib/ai/ollama";

export interface ReviewIssue {
    blockId: string;
    rule: string;
    severity: "error" | "warning" | "info";
    message: string;
    suggestion?: string;
}

const REVIEW_SCHEMA = {
    type: "object",
    properties: {
        issues: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    blockId: { type: "string" },
                    rule: { type: "string" },
                    severity: { type: "string", enum: ["error", "warning", "info"] },
                    message: { type: "string" },
                    suggestion: { type: "string" },
                },
                required: ["blockId", "rule", "severity", "message"],
            },
        },
    },
    required: ["issues"],
};

const COMMON_RULES = `- "heading-prefix" : les heading level 2 doivent être préfixés "A- ", "B- ", "C- "… ;
  les heading level 3 doivent être préfixés "1. ", "2. ", "3. "…
- "structure" : le contenu doit être organisé en grands thèmes cohérents.`;

const TP_RULES = `- "imperatif-vouvoye" : dans les blocs list (ordered: true) d'un TP, chaque list-item
  doit commencer par un impératif vouvoyé : « Créez », « Ouvrez », « Modifiez », « Utilisez »,
  « Ajoutez », « Vérifiez », « Affichez »… JAMAIS d'infinitif (« Créer le fichier ») ni de
  futur (« Vous créerez »).
- "exercice-complet" : chaque exercice doit indiquer le fichier cible, la méthode/API imposée,
  le résultat attendu et le critère de validation.`;

interface ReviewBody {
    blocks: Block[];
    contentType: string;
}

export const POST = withAdmin(async (req: Request) => {
    try {
        const body = await req.json() as ReviewBody;
        if (!Array.isArray(body.blocks)) {
            return NextResponse.json({ error: "blocks doit être un tableau" }, { status: 400 });
        }

        const rules = body.contentType === "TP"
            ? `${COMMON_RULES}\n${TP_RULES}`
            : COMMON_RULES;

        const result = await chatStructured<{ issues: ReviewIssue[] }>(
            [
                {
                    role: "system",
                    content: `Tu es un relecteur de contenu pédagogique pour un site de cours IUT.
Analyse l'arbre de blocs fourni et signale chaque violation des règles suivantes :
${rules}
Pour chaque problème, renvoie le blockId EXACT du bloc concerné (champ id dans l'arbre),
le nom de la règle (rule), une sévérité (error pour une violation claire, warning pour un
doute, info pour une suggestion), un message court en français et si possible une suggestion
de correction. Si tout est conforme, renvoie issues: [].`,
                },
                {
                    role: "user",
                    content: `Type de contenu : ${body.contentType}\nArbre de blocs :\n${JSON.stringify(body.blocks, null, 2)}`,
                },
            ],
            REVIEW_SCHEMA
        );

        // Filtre défensif : ne garder que les issues pointant vers un bloc réel.
        const knownIds = new Set<string>();
        (function collect(blocks: Block[]) {
            for (const b of blocks) {
                knownIds.add(b.id);
                if (b.children) collect(b.children);
            }
        })(body.blocks);

        const issues = result.issues.filter((i) => knownIds.has(i.blockId));

        return NextResponse.json({ issues });
    } catch (error) {
        if (error instanceof OllamaUnreachableError) {
            return NextResponse.json({ error: error.message }, { status: 503 });
        }
        console.error("[content review]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
```

- [ ] **Step 2: Vérifier typage et lint**

Run: `bunx tsc --noEmit; bun run lint`
Expected: aucune erreur

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/content/review/route.ts
git commit -m "feat(builder): route review — lint pédagogique structuré via Ollama"
```

---

### Task 7: `ReviewPanel` + intégration toolbar + ciblage des blocs

**Files:**
- Create: `src/components/builder/ReviewPanel.tsx`
- Modify: `src/components/builder/BlockTree.tsx:176,203,212` (ajout `data-block-id`)
- Modify: `src/components/builder/BuilderPage.tsx` (bouton dans la toolbar)

- [ ] **Step 1: Ajouter `data-block-id` aux wrappers de blocs**

Dans `src/components/builder/BlockTree.tsx`, les trois wrappers `ref={setNodeRef}` du composant SortableBlock reçoivent l'attribut. Ligne 176 (bloc inconnu) :

```tsx
            <div ref={setNodeRef} style={style} className={wrapperCls} data-block-id={block.id}>
```

Ligne 203 (column) :

```tsx
            <div ref={setNodeRef} style={style} data-block-id={block.id} className={[wrapperCls, isDropTargetBlocked ? "cursor-not-allowed" : ""].filter(Boolean).join(" ")}>
```

Ligne 212 (cas général) :

```tsx
        <div ref={setNodeRef} style={style} data-block-id={block.id} className={isDropTargetBlocked ? "cursor-not-allowed" : undefined}>
```

- [ ] **Step 2: Créer `ReviewPanel.tsx`**

Le composant rend le bouton toolbar **et** le panneau latéral (un seul point d'intégration dans BuilderPage).

```tsx
"use client";

import { useState } from "react";
import { ClipboardCheck, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/store/builderStore";

interface ReviewIssue {
    blockId: string;
    rule: string;
    severity: "error" | "warning" | "info";
    message: string;
    suggestion?: string;
}

const SEVERITY_STYLE: Record<ReviewIssue["severity"], string> = {
    error: "border-red-500/40 text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20",
    warning: "border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20",
    info: "border-sky-500/40 text-sky-700 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-900/20",
};

export function ReviewPanel({ contentType }: { contentType: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [issues, setIssues] = useState<ReviewIssue[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { blocks, selectBlock } = useBuilderStore();

    async function runReview() {
        setLoading(true);
        setError(null);
        setOpen(true);
        try {
            const res = await fetch("/api/admin/content/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blocks, contentType }),
            });
            const data = await res.json() as { issues?: ReviewIssue[]; error?: string };
            if (!res.ok) {
                setError(data.error ?? `Erreur HTTP ${res.status}`);
                setIssues(null);
                return;
            }
            setIssues(data.issues ?? []);
        } catch {
            setError("Erreur de communication avec le serveur.");
            setIssues(null);
        } finally {
            setLoading(false);
        }
    }

    function focusBlock(id: string) {
        selectBlock(id);
        document.querySelector(`[data-block-id="${id}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                onClick={() => void runReview()}
                disabled={loading || blocks.length === 0}
                className="gap-1.5 h-8 text-xs border-bridge-500/45"
            >
                {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Review…</>
                    : <><ClipboardCheck className="w-3.5 h-3.5" /> Review</>
                }
            </Button>

            {open && (
                <div className="fixed top-[calc(var(--navbar-h)+70px)] right-6 z-40 w-96 max-h-[60vh] bg-bridge-50 dark:bg-bridge-900 border border-bridge-500/20 dark:border-bridge-500/35 rounded-xl shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-bridge-500/20 dark:border-bridge-500/35 shrink-0">
                        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary flex items-center gap-1.5">
                            <ClipboardCheck className="w-3 h-3" />
                            Review pédagogique
                        </span>
                        <button
                            aria-label="Fermer"
                            className="text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200 transition-colors cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                        {loading && (
                            <p className="flex items-center gap-2 text-xs text-bridge-500 dark:text-bridge-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyse en cours…
                            </p>
                        )}
                        {error && (
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        )}
                        {issues !== null && issues.length === 0 && !loading && (
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                Aucun problème détecté.
                            </p>
                        )}
                        {issues?.map((issue, i) => (
                            <button
                                key={i}
                                onClick={() => focusBlock(issue.blockId)}
                                className="text-left rounded-lg border border-bridge-400/30 dark:border-bridge-500/30 bg-bridge-100 dark:bg-bridge-800 p-3 hover:ring-1 hover:ring-brand-primary/50 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                        variant="outline"
                                        className={cn("text-[10px] h-4 px-1.5 rounded", SEVERITY_STYLE[issue.severity])}
                                    >
                                        {issue.severity}
                                    </Badge>
                                    <span className="text-[10px] font-mono text-bridge-500 dark:text-bridge-400">
                                        {issue.rule}
                                    </span>
                                </div>
                                <p className="text-sm text-bridge-700 dark:text-bridge-300 leading-snug">
                                    {issue.message}
                                </p>
                                {issue.suggestion && (
                                    <p className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 italic">
                                        Suggestion : {issue.suggestion}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
```

- [ ] **Step 3: Intégrer dans la toolbar de `BuilderPage.tsx`**

Ajouter l'import :

```tsx
import { ReviewPanel } from "@/components/builder/ReviewPanel";
```

Dans la zone droite de la toolbar (`<div className="flex items-center gap-2 shrink-0">`, ligne ~306), insérer **avant** le bouton Sauvegarder :

```tsx
                        <ReviewPanel contentType={contentType} />
```

- [ ] **Step 4: Vérifier typage, lint, et test manuel**

Run: `bunx tsc --noEmit; bun run lint`
Expected: aucune erreur

Test manuel : ouvrir un TP dans le builder, cliquer « Review ». Attendu : panneau avec issues (ou « Aucun problème détecté »), clic sur une issue → le canvas scrolle et sélectionne le bloc (ring brand-primary visible).

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/ReviewPanel.tsx src/components/builder/BlockTree.tsx src/components/builder/BuilderPage.tsx
git commit -m "feat(builder): ReviewPanel — lint pédagogique in-app avec ciblage des blocs"
```

---

### Task 8: réalignement du MCP sur le schéma arborescent

Le MCP (`src/app/api/mcp/route.ts`) utilise encore le format plat `RawBlock`/`colSpan` (pré-2026-06-11). On le réaligne : schéma Zod récursif, `validateBlockTree` avant toute écriture, `persistContent` partagé, opérations imbriquées via `blockTreeUtils`.

**Files:**
- Modify: `src/app/api/mcp/route.ts`

- [ ] **Step 1: Remplacer le type plat et les imports**

Supprimer la ligne 12 (`type RawBlock = ...`) et l'import `getBlockDefinition` (devenu inutile, `getAllBlockDefinitions` reste utilisé par `list_block_types`). Ajouter :

```typescript
import { validateBlockTree } from "@/lib/validateBlockTree";
import { persistContent } from "@/lib/contentPersistence";
import { findParent, findBlock, insertBlock, removeBlock, updateBlockProps } from "@/lib/blockTreeUtils";
```

Définir le schéma Zod récursif (après les imports) :

```typescript
interface BlockInput {
    id: string;
    type: string;
    props: Record<string, unknown>;
    children?: BlockInput[];
}

const zBlock: z.ZodType<BlockInput> = z.lazy(() =>
    z.object({
        id: z.string().describe("UUID v4 unique dans tout l'arbre"),
        type: z.string(),
        props: z.record(z.string(), z.unknown()),
        children: z.array(zBlock).optional()
            .describe("Blocs enfants (conteneurs : columns, column, list, list-item, callout, collapsible)"),
    })
);
```

- [ ] **Step 2: Réécrire `save_content`**

Remplacer le tool `save_content` (lignes 119-190 actuelles) par :

```typescript
    server.tool(
        "save_content",
        "Remplace entièrement l'arbre de blocs d'un contenu (upsert). L'arbre est validé (types, imbrication, props Zod). Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            blocks:  z.array(zBlock),
        },
        async ({ module, section, type, blocks }) => {
            if (!isAdmin) throw new Error("Forbidden");

            const validation = validateBlockTree(blocks);
            if (!validation.valid) {
                throw new Error(`Arbre invalide : ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(" ; ")}`);
            }

            const result = await persistContent(module, section, type, blocks as Block[]);
            return {
                content: [{
                    type: "text" as const,
                    text: `Sauvegardé. contentId=${result.contentId}, version=${result.version}`,
                }],
            };
        }
    );
```

- [ ] **Step 3: Réécrire `insert_block`**

Remplacer le tool `insert_block` (lignes 220-284 actuelles) par :

```typescript
    server.tool(
        "insert_block",
        "Insère un bloc dans l'arbre. parentId absent = racine. afterBlockId = insérer comme frère juste après ce bloc (prioritaire sur parentId/position). Sans position ni afterBlockId → append. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            block:   zBlock,
            parentId:     z.string().optional().describe("Id du conteneur cible (absent = racine)"),
            position:     z.number().int().min(0).optional().describe("Index 0-based où insérer"),
            afterBlockId: z.string().optional().describe("Insérer comme frère après ce blockId"),
        },
        async ({ module, section, type, block, parentId, position, afterBlockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            const blocks: Block[] = doc?.blocks ?? [];

            let targetParentId: string | null = parentId ?? null;
            let insertAt: number;

            if (afterBlockId) {
                const loc = findParent(blocks, afterBlockId);
                if (!loc) throw new Error(`Bloc ${afterBlockId} introuvable`);
                targetParentId = loc.parent?.id ?? null;
                insertAt = loc.index + 1;
            } else {
                const siblings = targetParentId === null
                    ? blocks
                    : findBlock(blocks, targetParentId)?.children ?? [];
                if (targetParentId !== null && !findBlock(blocks, targetParentId)) {
                    throw new Error(`Conteneur ${targetParentId} introuvable`);
                }
                insertAt = typeof position === "number"
                    ? Math.min(position, siblings.length)
                    : siblings.length;
            }

            const next = insertBlock(blocks, block as Block, targetParentId, insertAt);
            const validation = validateBlockTree(next);
            if (!validation.valid) {
                throw new Error(`Insertion refusée : ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(" ; ")}`);
            }

            await persistContent(module, section, type, next);
            return {
                content: [{
                    type: "text" as const,
                    text: `Bloc ${block.id} inséré (parent: ${targetParentId ?? "racine"}, index: ${insertAt}).`,
                }],
            };
        }
    );
```

- [ ] **Step 4: Réécrire `edit_block` et `delete_block`**

Remplacer `edit_block` (lignes 286-317 actuelles) par :

```typescript
    server.tool(
        "edit_block",
        "Remplace entièrement les props d'un bloc (replace, pas merge). Fonctionne à toute profondeur de l'arbre. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            blockId: z.string().describe("ID du bloc à modifier"),
            props:   z.record(z.string(), z.unknown()).describe("Nouvelles props complètes"),
        },
        async ({ module, section, type, blockId, props }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            const blocks: Block[] = doc?.blocks ?? [];
            if (!findBlock(blocks, blockId)) throw new Error(`Bloc ${blockId} introuvable`);

            const next = updateBlockProps(blocks, blockId, props);
            const validation = validateBlockTree(next);
            if (!validation.valid) {
                throw new Error(`Modification refusée : ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(" ; ")}`);
            }

            await persistContent(module, section, type, next);
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} mis à jour.` }] };
        }
    );
```

Remplacer `delete_block` (lignes 319-344 actuelles) par :

```typescript
    server.tool(
        "delete_block",
        "Supprime un bloc (et son sous-arbre) par son ID, à toute profondeur. Réservé aux admins.",
        {
            module:  z.string(),
            section: z.string(),
            type:    z.enum(["cours", "TP", "examen"]).describe("Type de contenu : cours | TP | examen"),
            blockId: z.string().describe("ID du bloc à supprimer"),
        },
        async ({ module, section, type, blockId }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const doc = await db.collection<CourseContent>("course_content").findOne({
                moduleSlug: module, sectionSlug: section, contentType: type,
            });
            const blocks: Block[] = doc?.blocks ?? [];
            if (!findBlock(blocks, blockId)) throw new Error(`Bloc ${blockId} introuvable`);

            const next = removeBlock(blocks, blockId);
            const validation = validateBlockTree(next);
            if (!validation.valid) {
                throw new Error(`Suppression refusée : ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(" ; ")}`);
            }

            await persistContent(module, section, type, next);
            return { content: [{ type: "text" as const, text: `Bloc ${blockId} supprimé.` }] };
        }
    );
```

Les tools `get_migration_status`, `list_block_types`, `get_content`, `delete_content` sont inchangés. Vérifier que `revalidateTag` et `createHash` restent importés là où ils sont encore utilisés (`delete_content` utilise `revalidateTag` directement — le garder).

- [ ] **Step 5: Vérifier typage, lint, tests**

Run: `bunx tsc --noEmit; bun run lint; bun test`
Expected: aucune erreur, suite verte

- [ ] **Step 6: Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "fix(mcp): aligne les tools sur le schéma arborescent — zBlock récursif + validateBlockTree + persistContent"
```

---

### Task 9: documentation + vérification finale

**Files:**
- Modify: `CLAUDE.md` (§7, tableau des variables d'environnement)

- [ ] **Step 1: Documenter les variables d'environnement**

Dans le tableau du §7 de `CLAUDE.md`, ajouter ces deux lignes après `NEXT_PUBLIC_GIT_URL` :

```markdown
| `OLLAMA_URL`                   | URL du serveur Ollama local (défaut `http://localhost:11434`) | `src/lib/ai/ollama.ts`         |
| `OLLAMA_MODEL`                 | Modèle Ollama (défaut `gemma4:e4b`)                           | `src/lib/ai/ollama.ts`         |
```

- [ ] **Step 2: Vérification finale complète**

Run: `bun test`
Expected: PASS — toutes les suites

Run: `bunx tsc --noEmit`
Expected: aucune erreur

Run: `bun run lint`
Expected: aucune erreur nouvelle

Run: `bun run build`
Expected: build OK (la CLAUDE.md §9 impose de valider le build — on a touché des routes)

- [ ] **Step 3: Test manuel de recette (critères de la spec)**

1. « Ajoute un bloc de texte avec un lorem ipsum » → bloc visible + persisté après refresh. ✓ spec §2
2. « Ajoute une liste de 3 étapes pour installer Node » → bloc `list` + 3 `list-item` valides. ✓ tools granulaires
3. Demande sans modification (« c'est quoi ce contenu ? ») → réponse texte + « Aucune modification effectuée ». ✓ bilan explicite
4. Bouton Review sur un TP → issues cliquables qui sélectionnent les blocs. ✓ spec §3
5. Ollama coupé → 503 + message clair. ✓ spec §4

- [ ] **Step 4: Commit final**

```bash
git add CLAUDE.md
git commit -m "docs: variables OLLAMA_URL / OLLAMA_MODEL dans CLAUDE.md §7"
```
