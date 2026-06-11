# Builder à la Notion — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire passer le builder d'un modèle plat (`colSpan`) à un arbre de blocs à la Notion : conteneurs explicites (`columns`/`column`, `list`/`list-item`, `callout`, `collapsible`), nouveaux blocs feuilles (`code`, `code-with-preview`, `diagram`, `quote`, `divider`, `download-file`), DnD inter-niveaux, validation Zod au PUT.

**Architecture:** L'arbre `Block[]` (avec `children?`) vit tel quel dans le store Zustand et en MongoDB — zéro conversion. Des helpers purs (`blockTreeUtils`) manipulent l'arbre de façon immuable. Les schémas Zod et règles d'imbrication vivent dans un module sans JSX (`blockSchemas.ts`) partagé entre le registry client et la validation serveur. Le rendu (builder et public) est récursif via la signature `render({ ...props, children })`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Zustand, dnd-kit (`@dnd-kit/core@6`, `@dnd-kit/sortable@10`), Zod 4, MongoDB driver, `bun test`.

**Spec:** `docs/superpowers/specs/2026-06-11-builder-nested-blocks-design.md`

**Ordre impératif :** Tasks 1→3 (fondations pures, TDD), puis 4 (blocs feuilles, valeur immédiate), 5 (bascule modèle), 6 (registry conteneurs + rendu public), 7 (canvas récursif), 8 (DnD inter-niveaux), 9 (éditeurs PropsPanel), 10 (API), 11 (purge + vérifs). L'app compile et `bun test` passe à la fin de **chaque** task ; le DnD imbriqué (Task 8) n'arrive qu'une fois le modèle stabilisé.

**Pièges connus (à respecter) :**
- Les schémas Zod de `blockSchemas.ts` sont **permissifs sur le vide** (`z.string()` sans `min(1)`) : un bloc fraîchement inséré a des props vides et doit pouvoir être sauvegardé.
- Le `Select` de `DynamicPropsEditor` produit des **strings** (`"2"`) : le schéma `heading.level` doit coercer (`z.coerce.number()`).
- `src/lib/blockRegistry.tsx` est `'use client'` : **aucun code serveur ne doit l'importer**. La Task 10 retire l'import existant dans `ai-assist/route.ts`.
- Indentation 4 espaces, imports via `@/*`, apostrophes `&apos;` dans le JSX texte.

---

## Task 1 : `blockSchemas.ts` — schémas Zod + règles d'imbrication (sans JSX)

**Files:**
- Create: `src/lib/blockSchemas.ts`
- Test: `tests/lib/blockSchemas.test.ts`

- [ ] **Step 1 : Écrire les tests qui échouent**

```ts
// tests/lib/blockSchemas.test.ts
import { describe, it, expect } from "bun:test";
import {
    blockPropsSchemas,
    containerRules,
    isContainer,
    canDrop,
    COLUMN_PRESETS,
    COL_SPAN_CLASS,
    MAX_DEPTH,
} from "@/lib/blockSchemas";

describe("blockPropsSchemas", () => {
    it("connaît tous les types de blocs", () => {
        const expected = [
            "text", "heading", "list", "list-item", "columns", "column",
            "callout", "collapsible", "code", "code-with-preview", "diagram",
            "download-file", "quote", "divider", "image-card", "table", "section-card",
        ];
        for (const type of expected) {
            expect(blockPropsSchemas[type]).toBeDefined();
        }
    });

    it("accepte un text vide (bloc fraîchement inséré)", () => {
        expect(blockPropsSchemas["text"].safeParse({ content: "" }).success).toBe(true);
    });

    it("coerce heading.level depuis une string (Select du PropsPanel)", () => {
        expect(blockPropsSchemas["heading"].safeParse({ level: "2", text: "Titre" }).success).toBe(true);
        expect(blockPropsSchemas["heading"].safeParse({ level: 4, text: "Titre" }).success).toBe(false);
    });

    it("refuse un span de colonne hors liste autorisée", () => {
        expect(blockPropsSchemas["column"].safeParse({ span: 6 }).success).toBe(true);
        expect(blockPropsSchemas["column"].safeParse({ span: 5 }).success).toBe(false);
    });
});

describe("isContainer", () => {
    it("identifie les conteneurs", () => {
        expect(isContainer("list")).toBe(true);
        expect(isContainer("columns")).toBe(true);
        expect(isContainer("callout")).toBe(true);
        expect(isContainer("text")).toBe(false);
        expect(isContainer("code")).toBe(false);
    });
});

describe("canDrop", () => {
    it("autorise les feuilles partout (racine, column, list-item, callout)", () => {
        expect(canDrop("text", null)).toBe(true);
        expect(canDrop("code", "column")).toBe(true);
        expect(canDrop("code", "list-item")).toBe(true);
        expect(canDrop("diagram", "callout")).toBe(true);
    });

    it("restreint columns à la racine", () => {
        expect(canDrop("columns", null)).toBe(true);
        expect(canDrop("columns", "column")).toBe(false);
        expect(canDrop("columns", "list-item")).toBe(false);
        expect(canDrop("columns", "callout")).toBe(false);
    });

    it("restreint column à columns et list-item à list", () => {
        expect(canDrop("column", "columns")).toBe(true);
        expect(canDrop("column", null)).toBe(false);
        expect(canDrop("list-item", "list")).toBe(true);
        expect(canDrop("list-item", null)).toBe(false);
        expect(canDrop("list-item", "callout")).toBe(false);
    });

    it("restreint les enfants de columns et list", () => {
        expect(canDrop("text", "columns")).toBe(false);
        expect(canDrop("text", "list")).toBe(false);
    });

    it("refuse de déposer dans une feuille", () => {
        expect(canDrop("text", "code")).toBe(false);
        expect(canDrop("text", "text")).toBe(false);
    });

    it("autorise les listes imbriquées (liste de listes)", () => {
        expect(canDrop("list", "list-item")).toBe(true);
    });
});

describe("COLUMN_PRESETS / COL_SPAN_CLASS", () => {
    it("chaque preset somme à 12 et chaque span a une classe", () => {
        for (const preset of COLUMN_PRESETS) {
            expect(preset.spans.reduce((a, b) => a + b, 0)).toBe(12);
            for (const span of preset.spans) {
                expect(COL_SPAN_CLASS[span]).toBeDefined();
            }
        }
    });
});

describe("MAX_DEPTH", () => {
    it("vaut 8", () => {
        expect(MAX_DEPTH).toBe(8);
    });
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

Run: `bun test tests/lib/blockSchemas.test.ts`
Expected: FAIL — `Cannot find module '@/lib/blockSchemas'`

- [ ] **Step 3 : Implémenter `src/lib/blockSchemas.ts`**

```ts
// src/lib/blockSchemas.ts
// Schémas Zod et règles d'imbrication des blocs.
// AUCUN import React/JSX ici : ce module est consommé à la fois par le
// registry client (blockRegistry.tsx) et par la validation serveur
// (validateBlockTree.ts, routes API).
import { z } from "zod";

/** Spans autorisés pour une colonne (grille de 12). */
const ALLOWED_SPANS = [3, 4, 6, 8, 9] as const;

export const COL_SPAN_CLASS: Record<number, string> = {
    3: "md:col-span-3",
    4: "md:col-span-4",
    6: "md:col-span-6",
    8: "md:col-span-8",
    9: "md:col-span-9",
};

export const COLUMN_PRESETS: { label: string; spans: number[] }[] = [
    { label: "50 / 50", spans: [6, 6] },
    { label: "33 / 67", spans: [4, 8] },
    { label: "67 / 33", spans: [8, 4] },
    { label: "3 × 33", spans: [4, 4, 4] },
    { label: "25 / 50 / 25", spans: [3, 6, 3] },
    { label: "4 × 25", spans: [3, 3, 3, 3] },
];

export const MAX_DEPTH = 8;

/** Schémas de props par type. Permissifs sur les strings vides : un bloc
 *  fraîchement inséré (defaultProps) doit pouvoir être sauvegardé. */
export const blockPropsSchemas: Record<string, z.ZodTypeAny> = {
    "text": z.object({ content: z.string() }),
    "heading": z.object({
        // Le Select du PropsPanel renvoie une string ("2"/"3") : on coerce.
        level: z.coerce.number().refine((v) => v === 2 || v === 3, {
            message: "level doit être 2 ou 3",
        }),
        text: z.string(),
    }),
    "list": z.object({ ordered: z.boolean() }),
    "list-item": z.object({ text: z.string() }),
    "columns": z.object({}),
    "column": z.object({
        span: z.number().int().refine((v) => (ALLOWED_SPANS as readonly number[]).includes(v), {
            message: `span doit être l'un de : ${ALLOWED_SPANS.join(", ")}`,
        }),
    }),
    "callout": z.object({
        variant: z.enum(["info", "warning", "tip", "reminder"]),
        title: z.string().optional(),
    }),
    "collapsible": z.object({ title: z.string() }),
    "code": z.object({
        language: z.string(),
        code: z.string(),
        filename: z.string().optional(),
        showLineNumbers: z.boolean().optional(),
        collapsible: z.boolean().optional(),
        highlightLines: z.string().optional(),
    }),
    "code-with-preview": z.object({
        language: z.string(),
        code: z.string(),
    }),
    "diagram": z.object({
        header: z.string().optional(),
        chart: z.string(),
    }),
    "download-file": z.object({
        language: z.string(),
        filename: z.string(),
        code: z.string(),
    }),
    "quote": z.object({
        text: z.string(),
        source: z.string().optional(),
    }),
    "divider": z.object({}),
    "image-card": z.object({
        src: z.string(),
        title: z.string().optional(),
    }),
    "table": z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string())),
    }),
    "section-card": z.object({
        title: z.string(),
        href: z.string(),
        description: z.string().optional(),
    }),
};

export interface ContainerRule {
    /** Types d'enfants acceptés. "any" = tout type dont allowedParents le permet. */
    allowedChildren: string[] | "any";
    /** Parents autorisés. `null` dans la liste = racine. Absent = partout. */
    allowedParents?: (string | null)[];
}

export const containerRules: Record<string, ContainerRule> = {
    "columns": { allowedChildren: ["column"], allowedParents: [null] },
    "column": { allowedChildren: "any", allowedParents: ["columns"] },
    "list": { allowedChildren: ["list-item"] },
    "list-item": { allowedChildren: "any", allowedParents: ["list"] },
    "callout": { allowedChildren: "any" },
    "collapsible": { allowedChildren: "any" },
};

export function isContainer(type: string): boolean {
    return type in containerRules;
}

/** Un bloc de ce type peut-il être déposé dans ce parent ?
 *  `parentType: null` = racine du document. */
export function canDrop(childType: string, parentType: string | null): boolean {
    if (!(childType in blockPropsSchemas)) return false;

    // Contrainte côté enfant : allowedParents
    const childRule = containerRules[childType];
    if (childRule?.allowedParents !== undefined) {
        if (!childRule.allowedParents.includes(parentType)) return false;
    }

    // Contrainte côté parent : allowedChildren
    if (parentType === null) return true; // la racine accepte le reste
    const parentRule = containerRules[parentType];
    if (!parentRule) return false; // pas un conteneur
    if (parentRule.allowedChildren === "any") return true;
    return parentRule.allowedChildren.includes(childType);
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

Run: `bun test tests/lib/blockSchemas.test.ts`
Expected: PASS (tous les tests verts)

Note : si `@/*` ne résout pas sous `bun test`, vérifier que `tsconfig.json` est bien lu par Bun (les tests existants `tests/api/*.test.ts` utilisent déjà cet alias — reprendre leur convention d'import).

- [ ] **Step 5 : Commit**

```bash
git add src/lib/blockSchemas.ts tests/lib/blockSchemas.test.ts
git commit -m "feat(builder): blockSchemas — schémas Zod et règles d'imbrication partagés client/serveur"
```

---

## Task 2 : `blockTreeUtils.ts` — manipulation immuable de l'arbre

**Files:**
- Create: `src/lib/blockTreeUtils.ts`
- Test: `tests/lib/blockTreeUtils.test.ts`

- [ ] **Step 1 : Écrire les tests qui échouent**

```ts
// tests/lib/blockTreeUtils.test.ts
import { describe, it, expect } from "bun:test";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    findParent,
    insertBlock,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
    moveBlock,
    isDescendant,
} from "@/lib/blockTreeUtils";

/** Arbre de référence :
 *  root
 *  ├─ t1 (text)
 *  ├─ cols (columns)
 *  │   ├─ colA (column) ── img (image-card)
 *  │   └─ colB (column) ── code1 (code)
 *  └─ lst (list)
 *      ├─ li1 (list-item)
 *      └─ li2 (list-item) ── sub (list) ── li3 (list-item)
 */
function makeTree(): Block[] {
    return [
        { id: "t1", type: "text", props: { content: "hello" } },
        {
            id: "cols", type: "columns", props: {}, children: [
                { id: "colA", type: "column", props: { span: 6 }, children: [
                    { id: "img", type: "image-card", props: { src: "/x.png" } },
                ] },
                { id: "colB", type: "column", props: { span: 6 }, children: [
                    { id: "code1", type: "code", props: { language: "js", code: "1" } },
                ] },
            ],
        },
        {
            id: "lst", type: "list", props: { ordered: false }, children: [
                { id: "li1", type: "list-item", props: { text: "a" }, children: [] },
                { id: "li2", type: "list-item", props: { text: "b" }, children: [
                    { id: "sub", type: "list", props: { ordered: false }, children: [
                        { id: "li3", type: "list-item", props: { text: "c" }, children: [] },
                    ] },
                ] },
            ],
        },
    ];
}

describe("findBlock", () => {
    it("trouve un bloc à toute profondeur", () => {
        const tree = makeTree();
        expect(findBlock(tree, "t1")?.type).toBe("text");
        expect(findBlock(tree, "img")?.type).toBe("image-card");
        expect(findBlock(tree, "li3")?.props.text).toBe("c");
        expect(findBlock(tree, "nope")).toBeUndefined();
    });
});

describe("findParent", () => {
    it("renvoie le parent et l'index", () => {
        const tree = makeTree();
        expect(findParent(tree, "t1")).toEqual({ parent: null, index: 0 });
        const imgLoc = findParent(tree, "img");
        expect(imgLoc?.parent?.id).toBe("colA");
        expect(imgLoc?.index).toBe(0);
        const li2Loc = findParent(tree, "li2");
        expect(li2Loc?.parent?.id).toBe("lst");
        expect(li2Loc?.index).toBe(1);
        expect(findParent(tree, "nope")).toBeNull();
    });
});

describe("insertBlock", () => {
    it("insère à la racine à l'index donné", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "divider", props: {} };
        const next = insertBlock(tree, nb, null, 1);
        expect(next.map((b) => b.id)).toEqual(["t1", "new", "cols", "lst"]);
        expect(tree.length).toBe(3); // immuable : l'original n'a pas bougé
    });

    it("insère dans un conteneur profond", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "text", props: { content: "" } };
        const next = insertBlock(tree, nb, "li2", 0);
        const li2 = findBlock(next, "li2");
        expect(li2?.children?.[0].id).toBe("new");
        expect(li2?.children?.[1].id).toBe("sub");
    });

    it("clamp l'index hors bornes", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "text", props: { content: "" } };
        const next = insertBlock(tree, nb, "colA", 99);
        expect(findBlock(next, "colA")?.children?.map((b) => b.id)).toEqual(["img", "new"]);
    });

    it("renvoie l'arbre inchangé si le parent est introuvable", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "text", props: { content: "" } };
        expect(insertBlock(tree, nb, "nope", 0)).toBe(tree);
    });
});

describe("removeBlock", () => {
    it("supprime un bloc et tout son sous-arbre", () => {
        const tree = makeTree();
        const next = removeBlock(tree, "li2");
        expect(findBlock(next, "li2")).toBeUndefined();
        expect(findBlock(next, "sub")).toBeUndefined();
        expect(findBlock(next, "li3")).toBeUndefined();
        expect(findBlock(next, "li1")).toBeDefined();
    });

    it("préserve les références des sous-arbres non touchés", () => {
        const tree = makeTree();
        const next = removeBlock(tree, "li1");
        // cols n'est pas sur le chemin de la suppression : même référence
        expect(next[1]).toBe(tree[1]);
    });
});

describe("updateBlockProps", () => {
    it("met à jour les props d'un bloc profond", () => {
        const tree = makeTree();
        const next = updateBlockProps(tree, "li3", { text: "modifié" });
        expect(findBlock(next, "li3")?.props.text).toBe("modifié");
        expect(findBlock(tree, "li3")?.props.text).toBe("c");
    });
});

describe("updateBlockChildren", () => {
    it("remplace les children d'un conteneur", () => {
        const tree = makeTree();
        const next = updateBlockChildren(tree, "colA", []);
        expect(findBlock(next, "colA")?.children).toEqual([]);
        expect(findBlock(next, "img")).toBeUndefined();
    });
});

describe("isDescendant", () => {
    it("détecte la descendance directe et profonde", () => {
        const tree = makeTree();
        expect(isDescendant(tree, "lst", "li3")).toBe(true);
        expect(isDescendant(tree, "li2", "sub")).toBe(true);
        expect(isDescendant(tree, "cols", "li1")).toBe(false);
        expect(isDescendant(tree, "t1", "t1")).toBe(false);
    });
});

describe("moveBlock", () => {
    it("déplace entre conteneurs sans perdre le sous-arbre", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "code1", "colA", 1);
        expect(findBlock(next, "colA")?.children?.map((b) => b.id)).toEqual(["img", "code1"]);
        expect(findBlock(next, "colB")?.children).toEqual([]);
    });

    it("déplace vers la racine", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "sub", null, 0);
        expect(next[0].id).toBe("sub");
        expect(findBlock(next, "li3")).toBeDefined(); // sous-arbre intact
        expect(findBlock(next, "li2")?.children).toEqual([]);
    });

    it("réordonne dans le même parent (vers le bas, sémantique arrayMove)", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "t1", null, 2);
        expect(next.map((b) => b.id)).toEqual(["cols", "lst", "t1"]);
    });

    it("réordonne dans le même parent (vers le haut)", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "lst", null, 0);
        expect(next.map((b) => b.id)).toEqual(["lst", "t1", "cols"]);
    });

    it("no-op si la cible est dans la descendance du bloc déplacé", () => {
        const tree = makeTree();
        expect(moveBlock(tree, "lst", "li2", 0)).toBe(tree);
        expect(moveBlock(tree, "lst", "lst", 0)).toBe(tree);
    });

    it("no-op si le bloc ou la cible est introuvable", () => {
        const tree = makeTree();
        expect(moveBlock(tree, "nope", null, 0)).toBe(tree);
        expect(moveBlock(tree, "t1", "nope", 0)).toBe(tree);
    });
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

Run: `bun test tests/lib/blockTreeUtils.test.ts`
Expected: FAIL — `Cannot find module '@/lib/blockTreeUtils'`

- [ ] **Step 3 : Implémenter `src/lib/blockTreeUtils.ts`**

```ts
// src/lib/blockTreeUtils.ts
// Helpers purs et immuables sur l'arbre de blocs. Les nœuds non touchés
// par une opération conservent leur référence (perf re-render React).
import type { Block } from "@/types/CourseContent";

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

/** Parent (null = racine) et index du bloc dans son parent. null si introuvable. */
export function findParent(
    blocks: Block[],
    id: string
): { parent: Block | null; index: number } | null {
    const index = blocks.findIndex((b) => b.id === id);
    if (index !== -1) return { parent: null, index };
    for (const block of blocks) {
        if (!block.children) continue;
        const childIndex = block.children.findIndex((c) => c.id === id);
        if (childIndex !== -1) return { parent: block, index: childIndex };
        const deep = findParent(block.children, id);
        if (deep) return deep;
    }
    return null;
}

export function isDescendant(blocks: Block[], ancestorId: string, id: string): boolean {
    const ancestor = findBlock(blocks, ancestorId);
    if (!ancestor?.children) return false;
    return findBlock(ancestor.children, id) !== undefined;
}

/** Applique `fn` au tableau d'enfants du parent visé, en ne reconstruisant
 *  que le chemin racine→parent. Renvoie le tableau d'origine si parent introuvable. */
function mapChildrenOf(
    blocks: Block[],
    parentId: string,
    fn: (children: Block[]) => Block[]
): Block[] {
    let changed = false;
    const next = blocks.map((block) => {
        if (block.id === parentId) {
            changed = true;
            return { ...block, children: fn(block.children ?? []) };
        }
        if (block.children) {
            const newChildren = mapChildrenOf(block.children, parentId, fn);
            if (newChildren !== block.children) {
                changed = true;
                return { ...block, children: newChildren };
            }
        }
        return block;
    });
    return changed ? next : blocks;
}

export function insertBlock(
    blocks: Block[],
    block: Block,
    parentId: string | null,
    index: number
): Block[] {
    const doInsert = (arr: Block[]): Block[] => {
        const next = [...arr];
        next.splice(Math.max(0, Math.min(index, next.length)), 0, block);
        return next;
    };
    if (parentId === null) return doInsert(blocks);
    return mapChildrenOf(blocks, parentId, doInsert);
}

export function removeBlock(blocks: Block[], id: string): Block[] {
    const loc = findParent(blocks, id);
    if (!loc) return blocks;
    if (loc.parent === null) return blocks.filter((b) => b.id !== id);
    return mapChildrenOf(blocks, loc.parent.id, (children) =>
        children.filter((c) => c.id !== id)
    );
}

export function updateBlockProps(
    blocks: Block[],
    id: string,
    props: Record<string, unknown>
): Block[] {
    let changed = false;
    const next = blocks.map((block) => {
        if (block.id === id) {
            changed = true;
            return { ...block, props };
        }
        if (block.children) {
            const newChildren = updateBlockProps(block.children, id, props);
            if (newChildren !== block.children) {
                changed = true;
                return { ...block, children: newChildren };
            }
        }
        return block;
    });
    return changed ? next : blocks;
}

export function updateBlockChildren(
    blocks: Block[],
    id: string,
    children: Block[]
): Block[] {
    return mapChildrenOf(blocks, id, () => children);
}

export function moveBlock(
    blocks: Block[],
    id: string,
    targetParentId: string | null,
    targetIndex: number
): Block[] {
    const block = findBlock(blocks, id);
    if (!block) return blocks;
    if (targetParentId !== null) {
        if (targetParentId === id) return blocks;
        if (isDescendant(blocks, id, targetParentId)) return blocks;
        if (!findBlock(blocks, targetParentId)) return blocks;
    }

    if (!findParent(blocks, id)) return blocks;

    // Sémantique arrayMove (dnd-kit) : targetIndex = position FINALE du bloc.
    // Le retrait préalable décale déjà les éléments suivants, donc aucune
    // correction d'index n'est nécessaire, même dans le même parent.
    const without = removeBlock(blocks, id);
    return insertBlock(without, block, targetParentId, targetIndex);
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

Run: `bun test tests/lib/blockTreeUtils.test.ts`
Expected: PASS

- [ ] **Step 5 : Commit**

```bash
git add src/lib/blockTreeUtils.ts tests/lib/blockTreeUtils.test.ts
git commit -m "feat(builder): blockTreeUtils — manipulation immuable de l'arbre de blocs"
```

---

## Task 3 : `validateBlockTree.ts` — validation serveur récursive

**Files:**
- Create: `src/lib/validateBlockTree.ts`
- Test: `tests/lib/validateBlockTree.test.ts`

- [ ] **Step 1 : Écrire les tests qui échouent**

```ts
// tests/lib/validateBlockTree.test.ts
import { describe, it, expect } from "bun:test";
import { validateBlockTree } from "@/lib/validateBlockTree";

describe("validateBlockTree", () => {
    it("accepte un arbre valide", () => {
        const result = validateBlockTree([
            { id: "a", type: "heading", props: { level: 2, text: "Titre" } },
            {
                id: "b", type: "columns", props: {}, children: [
                    { id: "c", type: "column", props: { span: 8 }, children: [
                        { id: "d", type: "text", props: { content: "gauche" } },
                    ] },
                    { id: "e", type: "column", props: { span: 4 }, children: [] },
                ],
            },
            {
                id: "f", type: "list", props: { ordered: true }, children: [
                    { id: "g", type: "list-item", props: { text: "étape" }, children: [
                        { id: "h", type: "code", props: { language: "js", code: "x" } },
                    ] },
                ],
            },
        ]);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it("refuse une entrée qui n'est pas un tableau", () => {
        expect(validateBlockTree("nope").valid).toBe(false);
        expect(validateBlockTree(null).valid).toBe(false);
    });

    it("refuse un bloc sans id / type / props", () => {
        const result = validateBlockTree([{ type: "text", props: {} }]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].path).toBe("blocks[0]");
    });

    it("refuse un type inconnu", () => {
        const result = validateBlockTree([{ id: "a", type: "wat", props: {} }]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain("inconnu");
    });

    it("refuse des props invalides avec le chemin du bloc", () => {
        const result = validateBlockTree([
            { id: "a", type: "heading", props: { level: 7, text: "x" } },
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].path).toBe("blocks[0]");
    });

    it("refuse des ids dupliqués", () => {
        const result = validateBlockTree([
            { id: "a", type: "text", props: { content: "" } },
            { id: "a", type: "text", props: { content: "" } },
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain("dupliqué");
    });

    it("refuse des children sur une feuille", () => {
        const result = validateBlockTree([
            { id: "a", type: "text", props: { content: "" }, children: [
                { id: "b", type: "text", props: { content: "" } },
            ] },
        ]);
        expect(result.valid).toBe(false);
    });

    it("refuse columns hors racine", () => {
        const result = validateBlockTree([
            { id: "a", type: "callout", props: { variant: "info" }, children: [
                { id: "b", type: "columns", props: {}, children: [
                    { id: "c", type: "column", props: { span: 6 }, children: [] },
                    { id: "d", type: "column", props: { span: 6 }, children: [] },
                ] },
            ] },
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].path).toBe("blocks[0].children[0]");
    });

    it("refuse un enfant non autorisé (text direct dans list)", () => {
        const result = validateBlockTree([
            { id: "a", type: "list", props: { ordered: false }, children: [
                { id: "b", type: "text", props: { content: "x" } },
            ] },
        ]);
        expect(result.valid).toBe(false);
    });

    it("refuse columns avec somme des spans ≠ 12 ou moins de 2 colonnes", () => {
        const bad = validateBlockTree([
            { id: "a", type: "columns", props: {}, children: [
                { id: "b", type: "column", props: { span: 6 }, children: [] },
                { id: "c", type: "column", props: { span: 4 }, children: [] },
            ] },
        ]);
        expect(bad.valid).toBe(false);

        const single = validateBlockTree([
            { id: "a", type: "columns", props: {}, children: [
                { id: "b", type: "column", props: { span: 12 }, children: [] },
            ] },
        ]);
        expect(single.valid).toBe(false);
    });

    it("refuse au-delà de la profondeur max", () => {
        // 9 listes imbriquées (depth 18 en comptant les list-item) > MAX_DEPTH
        let tree: Record<string, unknown> = { id: "leaf", type: "list-item", props: { text: "x" }, children: [] };
        for (let i = 0; i < 9; i++) {
            tree = { id: `l${i}`, type: "list", props: { ordered: false }, children: [
                { id: `i${i}`, type: "list-item", props: { text: "" }, children: [tree] },
            ] };
        }
        expect(validateBlockTree([tree]).valid).toBe(false);
    });
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

Run: `bun test tests/lib/validateBlockTree.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validateBlockTree'`

- [ ] **Step 3 : Implémenter `src/lib/validateBlockTree.ts`**

```ts
// src/lib/validateBlockTree.ts
// Validation serveur de l'arbre de blocs avant écriture en base.
// Importable depuis les Route Handlers (aucun JSX, cf. blockSchemas).
import {
    blockPropsSchemas,
    containerRules,
    canDrop,
    isContainer,
    MAX_DEPTH,
} from "@/lib/blockSchemas";

export interface ValidationError {
    path: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export function validateBlockTree(input: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(input)) {
        return { valid: false, errors: [{ path: "blocks", message: "blocks doit être un tableau" }] };
    }

    const seenIds = new Set<string>();

    function visit(node: unknown, path: string, parentType: string | null, depth: number): void {
        if (depth > MAX_DEPTH) {
            errors.push({ path, message: `Profondeur maximale dépassée (${MAX_DEPTH})` });
            return;
        }
        if (typeof node !== "object" || node === null) {
            errors.push({ path, message: "Bloc invalide (objet attendu)" });
            return;
        }
        const block = node as Record<string, unknown>;

        if (typeof block.id !== "string" || block.id.length === 0
            || typeof block.type !== "string"
            || typeof block.props !== "object" || block.props === null) {
            errors.push({ path, message: "Chaque bloc doit avoir id, type et props" });
            return;
        }

        if (seenIds.has(block.id)) {
            errors.push({ path, message: `id dupliqué : ${block.id}` });
            return;
        }
        seenIds.add(block.id);

        const schema = blockPropsSchemas[block.type];
        if (!schema) {
            errors.push({ path, message: `Type de bloc inconnu : ${block.type}` });
            return;
        }

        if (!canDrop(block.type, parentType)) {
            errors.push({
                path,
                message: `Le type ${block.type} n'est pas autorisé dans ${parentType ?? "la racine"}`,
            });
            return;
        }

        const parsed = schema.safeParse(block.props);
        if (!parsed.success) {
            errors.push({
                path,
                message: `props invalides : ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join(" ; ")}`,
            });
        }

        const children = block.children as unknown;
        if (children !== undefined) {
            if (!isContainer(block.type)) {
                errors.push({ path, message: `Le type ${block.type} n'accepte pas d'enfants` });
                return;
            }
            if (!Array.isArray(children)) {
                errors.push({ path, message: "children doit être un tableau" });
                return;
            }
            if (block.type === "columns") {
                if (children.length < 2 || children.length > 4) {
                    errors.push({ path, message: "columns doit avoir entre 2 et 4 colonnes" });
                }
                const sum = children.reduce((acc: number, c) => {
                    const span = (c as { props?: { span?: unknown } })?.props?.span;
                    return acc + (typeof span === "number" ? span : 0);
                }, 0);
                if (sum !== 12) {
                    errors.push({ path, message: `La somme des spans doit faire 12 (actuel : ${sum})` });
                }
            }
            children.forEach((child, i) => {
                visit(child, `${path}.children[${i}]`, block.type as string, depth + 1);
            });
        } else if (containerRules[block.type]?.allowedChildren !== undefined
            && (block.type === "columns" || block.type === "list")) {
            // columns et list sans children : structurellement invalides
            errors.push({ path, message: `${block.type} doit avoir des children` });
        }
    }

    input.forEach((node, i) => visit(node, `blocks[${i}]`, null, 1));

    return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

Run: `bun test tests/lib/validateBlockTree.test.ts`
Expected: PASS — puis `bun test` complet pour vérifier l'absence de régression.

- [ ] **Step 5 : Commit**

```bash
git add src/lib/validateBlockTree.ts tests/lib/validateBlockTree.test.ts
git commit -m "feat(builder): validateBlockTree — validation récursive de l'arbre (schémas + imbrication)"
```

---

## Task 4 : Nouveaux blocs feuilles dans le registry

Valeur immédiate, aucune dépendance au modèle arbre : `code`, `code-with-preview`, `diagram`, `download-file`, `quote`, `divider`.

**Files:**
- Modify: `src/lib/blockRegistry.tsx` (ajout de 6 définitions dans `blockDefinitions`)
- Modify: `src/components/builder/BlockPaletteGrid.tsx:18-28` (`BLOCK_META`)

- [ ] **Step 1 : Ajouter les imports en tête de `blockRegistry.tsx`**

```tsx
import CodeCard from "@/components/Cards/CodeCard";
import CodeWithPreviewCard, { CodePanel, PreviewPanel } from "@/components/Cards/CodeWithPreviewCard";
import DiagramCard from "@/components/Cards/DiagramCard";
import DownloadCodeButton from "@/components/DownloadCodeButton";
```

- [ ] **Step 2 : Ajouter les 6 définitions à la fin du tableau `blockDefinitions`**

```tsx
    {
        type: "code",
        label: "Code",
        defaultProps: { language: "javascript", code: "", filename: "", showLineNumbers: true, collapsible: false },
        schema: z.object({
            language: z.string(),
            code: z.string(),
            filename: z.string().optional(),
            showLineNumbers: z.boolean().optional(),
            collapsible: z.boolean().optional(),
            highlightLines: z.string().optional(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["javascript", "typescript", "html", "css", "php", "sql", "json", "bash", "jsx", "tsx"] },
            { key: "code", label: "Code", type: "textarea", placeholder: "const x = 42;" },
            { key: "filename", label: "Nom de fichier", type: "text", placeholder: "app.js" },
            { key: "showLineNumbers", label: "Numéros de ligne", type: "boolean" },
            { key: "collapsible", label: "Repliable", type: "boolean" },
            { key: "highlightLines", label: "Lignes en surbrillance", type: "text", placeholder: "2,5-7" },
        ],
        render: ({ language, code, filename, showLineNumbers, collapsible, highlightLines }: BlockRenderProps) => (
            <CodeCard
                language={String(language ?? "javascript")}
                filename={filename ? String(filename) : undefined}
                showLineNumbers={showLineNumbers !== false}
                collapsible={Boolean(collapsible)}
                highlightLines={highlightLines ? String(highlightLines) : undefined}
            >
                {String(code ?? "")}
            </CodeCard>
        ),
    },
    {
        type: "code-with-preview",
        label: "Code + aperçu",
        defaultProps: { language: "html", code: "" },
        schema: z.object({
            language: z.string(),
            code: z.string(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["html", "css"] },
            { key: "code", label: "Code", type: "textarea", placeholder: "<button>Cliquez</button>" },
        ],
        render: ({ language, code }: BlockRenderProps) => (
            <CodeWithPreviewCard language={String(language ?? "html")}>
                <CodePanel>{String(code ?? "")}</CodePanel>
                <PreviewPanel>
                    {/* sandbox="" : aucun script, aucune navigation — le HTML vient de la base */}
                    <iframe
                        srcDoc={String(code ?? "")}
                        sandbox=""
                        title="Aperçu du code"
                        className="w-full min-h-40 border-0 bg-white"
                    />
                </PreviewPanel>
            </CodeWithPreviewCard>
        ),
    },
    {
        type: "diagram",
        label: "Diagramme",
        defaultProps: { header: "", chart: "" },
        schema: z.object({
            header: z.string().optional(),
            chart: z.string(),
        }),
        fields: [
            { key: "header", label: "Titre", type: "text" },
            { key: "chart", label: "Diagramme (syntaxe Mermaid)", type: "textarea", placeholder: "graph LR\n    A --> B" },
        ],
        render: ({ header, chart }: BlockRenderProps) => (
            <DiagramCard header={header ? String(header) : undefined} chart={String(chart ?? "")} />
        ),
    },
    {
        type: "download-file",
        label: "Fichier à télécharger",
        defaultProps: { language: "html", filename: "", code: "" },
        schema: z.object({
            language: z.string(),
            filename: z.string(),
            code: z.string(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["html", "css", "javascript", "php", "sql", "json"] },
            { key: "filename", label: "Nom de fichier", type: "text", placeholder: "game.html" },
            { key: "code", label: "Contenu du fichier", type: "textarea" },
        ],
        render: ({ language, filename, code }: BlockRenderProps) => (
            <DownloadCodeButton
                language={String(language ?? "html")}
                filename={String(filename ?? "fichier.txt")}
            >
                {String(code ?? "")}
            </DownloadCodeButton>
        ),
    },
    {
        type: "quote",
        label: "Citation",
        defaultProps: { text: "", source: "" },
        schema: z.object({
            text: z.string(),
            source: z.string().optional(),
        }),
        fields: [
            {
                key: "text",
                label: "Citation",
                type: "textarea",
                inlineMarkdown: true,
                placeholder: "La simplicité est la sophistication suprême.",
            },
            { key: "source", label: "Source", type: "text", placeholder: "Léonard de Vinci" },
        ],
        render: ({ text, source }: BlockRenderProps) => (
            <blockquote className="border-l-4 border-brand-primary/40 pl-4 py-1 italic text-bridge-700 dark:text-bridge-300">
                {renderInline(String(text ?? ""))}
                {Boolean(source) && (
                    <footer className="mt-1.5 text-sm not-italic text-bridge-500 dark:text-bridge-400">
                        — {String(source)}
                    </footer>
                )}
            </blockquote>
        ),
        inlineEditField: "text",
    },
    {
        type: "divider",
        label: "Séparateur",
        defaultProps: {},
        schema: z.object({}),
        fields: [],
        render: () => (
            <hr className="border-t border-bridge-400/30 dark:border-bridge-500/25 my-2" />
        ),
    },
```

- [ ] **Step 3 : Compléter `BLOCK_META` dans `BlockPaletteGrid.tsx`**

Ajouter aux imports lucide : `Code2, Eye, GitBranch, Download, Quote, Minus`. Puis dans `BLOCK_META` :

```tsx
    "code":              { icon: Code2,     description: "Bloc de code avec coloration syntaxique" },
    "code-with-preview": { icon: Eye,       description: "Code HTML/CSS avec aperçu rendu" },
    "diagram":           { icon: GitBranch, description: "Diagramme Mermaid (flowchart, séquence…)" },
    "download-file":     { icon: Download,  description: "Fichier de démarrage à télécharger" },
    "quote":             { icon: Quote,     description: "Citation avec source optionnelle" },
    "divider":           { icon: Minus,     description: "Séparateur horizontal" },
```

- [ ] **Step 4 : Vérifier compile + lint + test manuel**

Run: `bunx tsc --noEmit && bun run lint`
Expected: 0 erreur.

Puis `bun dev`, ouvrir le builder (`/admin` → une section → builder), ajouter chaque nouveau bloc depuis la palette, vérifier le rendu (le bloc `diagram` exige une syntaxe Mermaid valide pour rendre ; tester avec `graph LR\n A --> B`).

- [ ] **Step 5 : Commit**

```bash
git add src/lib/blockRegistry.tsx src/components/builder/BlockPaletteGrid.tsx
git commit -m "feat(builder): blocs code, code-with-preview, diagram, download-file, quote, divider"
```

---

## Task 5 : Bascule du modèle — suppression de `colSpan`, store tree-aware

L'app reste fonctionnelle en plat (tout vit à la racine) ; l'imbrication arrive Tasks 6-8.

**Files:**
- Modify: `src/types/CourseContent.ts:7-16` (suppression `colSpan`)
- Modify: `src/lib/store/builderStore.ts` (réécriture des actions)
- Modify: `src/components/builder/PropsPanel.tsx` (sélecteur Largeur + Monter/Descendre supprimés, `findBlock`)
- Modify: `src/components/builder/BuilderCanvas.tsx` (signatures `insertBlock`, suppression `colSpan`)
- Modify: `src/components/builder/BuilderPage.tsx` (signatures, suppression `colSpan`)

- [ ] **Step 1 : `CourseContent.ts` — retirer `colSpan`**

```ts
export interface Block {
    id: string;
    type: string;
    props: Record<string, unknown>;
    /** Blocs enfants pour les types conteneurs (columns, column, list,
     *  list-item, callout, collapsible). Helpers : src/lib/blockTreeUtils.ts.
     *  Règles d'imbrication : src/lib/blockSchemas.ts. */
    children?: Block[];
}
```

- [ ] **Step 2 : Réécrire `src/lib/store/builderStore.ts`**

```ts
import { create } from "zustand";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    insertBlock as insertInTree,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
    moveBlock as moveInTree,
} from "@/lib/blockTreeUtils";

interface BuilderStore {
    blocks: Block[];
    selectedId: string | null;
    isDirty: boolean;
    setBlocks: (blocks: Block[]) => void;
    selectBlock: (id: string | null) => void;
    updateBlock: (id: string, props: Record<string, unknown>) => void;
    updateChildren: (id: string, children: Block[]) => void;
    insertBlock: (block: Block, parentId: string | null, index?: number) => void;
    deleteBlock: (id: string) => void;
    moveBlock: (id: string, targetParentId: string | null, targetIndex: number) => void;
    markSaved: () => void;
}

export const useBuilderStore = create<BuilderStore>()((set) => ({
    blocks: [],
    selectedId: null,
    isDirty: false,

    setBlocks: (blocks) => set({ blocks, isDirty: false }),

    selectBlock: (id) => set({ selectedId: id }),

    updateBlock: (id, props) =>
        set((state) => ({
            blocks: updateBlockProps(state.blocks, id, props),
            isDirty: true,
        })),

    updateChildren: (id, children) =>
        set((state) => ({
            blocks: updateBlockChildren(state.blocks, id, children),
            isDirty: true,
        })),

    insertBlock: (block, parentId, index) =>
        set((state) => {
            const idx = index ?? Number.MAX_SAFE_INTEGER; // clampé par le helper
            return {
                blocks: insertInTree(state.blocks, block, parentId, idx),
                isDirty: true,
            };
        }),

    deleteBlock: (id) =>
        set((state) => {
            const blocks = removeBlock(state.blocks, id);
            // Le bloc sélectionné peut être dans le sous-arbre supprimé.
            const selectedId = state.selectedId && findBlock(blocks, state.selectedId)
                ? state.selectedId
                : null;
            return { blocks, selectedId, isDirty: true };
        }),

    moveBlock: (id, targetParentId, targetIndex) =>
        set((state) => {
            const blocks = moveInTree(state.blocks, id, targetParentId, targetIndex);
            if (blocks === state.blocks) return state; // déplacement refusé
            return { blocks, isDirty: true };
        }),

    markSaved: () => set({ isDirty: false }),
}));
```

- [ ] **Step 3 : Adapter `PropsPanel.tsx`**

- Imports : ajouter `import { findBlock } from "@/lib/blockTreeUtils";`, retirer `ArrowUp, ArrowDown` de lucide et `Select…` (plus utilisés), retirer `moveBlock` du destructuring du store.
- Ligne 35 : `const block = blocks.find(...)` → `const block = selectedId ? findBlock(blocks, selectedId) : undefined;`
- `onChange` du `DynamicPropsEditor` (l.74-76) : `updateBlock(block.id, newProps)` (plus de 3e argument).
- **Supprimer** tout le bloc « Largeur » (Separator + Label + Select, l.79-99).
- **Supprimer** les boutons Monter/Descendre (l.144-161) — le DnD inter-niveaux les remplace ; garder uniquement « Supprimer le bloc ».
- Dans la palette du panneau (l.126-134) : créer le bloc **sans** `colSpan` et avec `insertBlock(newBlock, null)` :

```tsx
onSelect={(def: BlockDefinition) => {
    const newBlock: Block = {
        id: uuidv4(),
        type: def.type,
        props: { ...def.defaultProps },
    };
    insertBlock(newBlock, null);
    selectBlock(newBlock.id);
}}
```

- [ ] **Step 4 : Adapter `BuilderCanvas.tsx`**

- Supprimer la fonction `groupByColSpan` (l.20-34) et son usage : remplacer la boucle `groupByColSpan(blocks).map(...)` par un simple `blocks.map((block) => <SortableBlock key={block.id} ... />)` suivi du `{insertPreviewAfter === block.id && <InsertPreview />}` par bloc (comportement aperçu conservé au niveau racine).
- `handlePaletteSelect` : créer le bloc sans `colSpan`, et `insertBlock(newBlock, null, insertAfterIndex)`.

- [ ] **Step 5 : Adapter `BuilderPage.tsx`**

Dans `handleDragEnd` (l.122-159) :

```tsx
function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragDef(null);
    setPaletteOverId(null);

    if (!over) return;

    const data = active.data.current as { origin?: string; def?: BlockDefinition } | undefined;

    if (data?.origin === "palette" && data.def) {
        const def = data.def;
        const newBlock: Block = {
            id: uuidv4(),
            type: def.type,
            props: { ...def.defaultProps },
        };

        if (over.id === "canvas") {
            insertBlock(newBlock, null);
        } else {
            const idx = blocks.findIndex((b) => b.id === String(over.id));
            insertBlock(newBlock, null, idx !== -1 ? idx + 1 : undefined);
        }
        selectBlock(newBlock.id);
    } else {
        // Réordonnancement racine (l'inter-niveaux arrive en Task 8)
        if (active.id === over.id) return;
        const newIndex = blocks.findIndex((b) => b.id === String(over.id));
        if (newIndex === -1) return;
        moveBlock(String(active.id), null, newIndex);
    }
}
```

avec `moveBlock` ajouté au destructuring du store (et `reorderBlocks` retiré — l'action n'existe plus).

- [ ] **Step 6 : Compile, lint, tests, vérification manuelle**

Run: `bunx tsc --noEmit && bun run lint && bun test`
Expected: 0 erreur, tests verts. Chercher les usages résiduels : `grep -rn "colSpan\|reorderBlocks" src/` → aucun résultat.

`bun dev` : insertion, sélection, édition, suppression, drag racine et sauvegarde fonctionnent comme avant (sans le sélecteur Largeur).

- [ ] **Step 7 : Commit**

```bash
git add src/types/CourseContent.ts src/lib/store/builderStore.ts src/components/builder/
git commit -m "feat(builder)!: suppression de colSpan, store tree-aware (arbre encore plat dans l'UI)"
```

---

## Task 6 : Registry conteneurs + rendu public récursif

**Files:**
- Modify: `src/lib/blockRegistry.tsx` (champ `container`, refonte `list`, blocs `list-item`/`columns`/`column`/`callout`/`collapsible`, `createBlockInstance`)
- Modify: `src/components/CoursePrerequisites.tsx` (prop `title?`)
- Modify: `src/components/builder/BlockRenderer.tsx` (récursif)
- Modify: `src/components/builder/BlockPaletteGrid.tsx` (`BLOCK_META` + masquer `column`/`list-item`)

- [ ] **Step 1 : `CoursePrerequisites` — prop `title?` rétrocompatible**

```tsx
interface CoursePrerequisitesProps {
    title?: string
    children: React.ReactNode
}

export default function CoursePrerequisites({ title = "À savoir pour ce cours", children }: CoursePrerequisitesProps) {
```

et dans le JSX du trigger, remplacer le texte en dur par `{title}`.

- [ ] **Step 2 : `blockRegistry.tsx` — interface + imports**

Ajouter aux imports :

```tsx
import { v4 as uuidv4 } from "uuid";
import { Info, TriangleAlert, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CourseReminder from "@/components/CourseReminder";
import CoursePrerequisites from "@/components/CoursePrerequisites";
import { COL_SPAN_CLASS, containerRules } from "@/lib/blockSchemas";
import type { ContainerRule } from "@/lib/blockSchemas";
import type { Block } from "@/types/CourseContent";
```

Étendre les interfaces :

```tsx
export interface BlockRenderProps {
    children?: React.ReactNode;
    [key: string]: unknown;
}

export interface BlockDefinition {
    // ...champs existants inchangés...
    /** Règle conteneur (depuis blockSchemas). Absent = feuille. */
    container?: ContainerRule;
    /** Enfants créés à l'instanciation depuis la palette. */
    initialChildren?: () => Block[];
}
```

- [ ] **Step 3 : Refondre `list` et ajouter les 5 types conteneurs**

Remplacer la définition `list` existante (`items: string[]`) par :

```tsx
    {
        type: "list",
        label: "Liste",
        defaultProps: { ordered: false },
        schema: z.object({ ordered: z.boolean() }),
        fields: [
            { key: "ordered", label: "Ordonnée", type: "boolean" },
        ],
        container: containerRules["list"],
        initialChildren: () => [
            { id: uuidv4(), type: "list-item", props: { text: "" }, children: [] },
        ],
        render: ({ ordered, children }: BlockRenderProps) => (
            <List ordered={Boolean(ordered)}>{children}</List>
        ),
    },
    {
        type: "list-item",
        label: "Élément de liste",
        defaultProps: { text: "" },
        schema: z.object({ text: z.string() }),
        fields: [
            { key: "text", label: "Texte", type: "text", inlineMarkdown: true },
        ],
        container: containerRules["list-item"],
        render: ({ text, children }: BlockRenderProps) => (
            <ListItem>
                {renderInline(String(text ?? ""))}
                {children}
            </ListItem>
        ),
        inlineEditField: "text",
    },
    {
        type: "columns",
        label: "Colonnes",
        defaultProps: {},
        schema: z.object({}),
        fields: [],
        container: containerRules["columns"],
        initialChildren: () => [
            { id: uuidv4(), type: "column", props: { span: 6 }, children: [] },
            { id: uuidv4(), type: "column", props: { span: 6 }, children: [] },
        ],
        render: ({ children }: BlockRenderProps) => (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">{children}</div>
        ),
    },
    {
        type: "column",
        label: "Colonne",
        defaultProps: { span: 6 },
        schema: z.object({ span: z.number() }),
        fields: [],
        container: containerRules["column"],
        render: ({ span, children }: BlockRenderProps) => (
            <div className={`${COL_SPAN_CLASS[Number(span)] ?? "md:col-span-6"} flex flex-col gap-6 min-w-0`}>
                {children}
            </div>
        ),
    },
    {
        type: "callout",
        label: "Encadré",
        defaultProps: { variant: "info", title: "" },
        schema: z.object({
            variant: z.enum(["info", "warning", "tip", "reminder"]),
            title: z.string().optional(),
        }),
        fields: [
            { key: "variant", label: "Type", type: "select", options: ["info", "warning", "tip", "reminder"] },
            { key: "title", label: "Titre", type: "text" },
        ],
        container: containerRules["callout"],
        render: ({ variant, title, children }: BlockRenderProps) => {
            const v = String(variant ?? "info");
            if (v === "reminder") {
                return (
                    <CourseReminder title={title ? String(title) : undefined}>
                        {children}
                    </CourseReminder>
                );
            }
            const styles: Record<string, { cls: string; icon: React.ReactNode }> = {
                info: {
                    cls: "border-sky-500/40 bg-sky-50/60 dark:bg-sky-900/20 [&>svg]:text-sky-600",
                    icon: <Info className="h-4 w-4" />,
                },
                warning: {
                    cls: "border-amber-500/40 bg-amber-50/60 dark:bg-amber-900/20 [&>svg]:text-amber-600",
                    icon: <TriangleAlert className="h-4 w-4" />,
                },
                tip: {
                    cls: "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-900/20 [&>svg]:text-emerald-600",
                    icon: <Lightbulb className="h-4 w-4" />,
                },
            };
            const style = styles[v] ?? styles.info;
            return (
                <Alert className={style.cls}>
                    {style.icon}
                    {Boolean(title) && <AlertTitle>{String(title)}</AlertTitle>}
                    <AlertDescription>{children}</AlertDescription>
                </Alert>
            );
        },
    },
    {
        type: "collapsible",
        label: "Bloc dépliable",
        defaultProps: { title: "À savoir pour ce cours" },
        schema: z.object({ title: z.string() }),
        fields: [
            { key: "title", label: "Titre", type: "text" },
        ],
        container: containerRules["collapsible"],
        render: ({ title, children }: BlockRenderProps) => (
            <CoursePrerequisites title={String(title ?? "")}>
                {children}
            </CoursePrerequisites>
        ),
    },
```

- [ ] **Step 4 : Ajouter `createBlockInstance` à la fin de `blockRegistry.tsx`**

```tsx
/** Instancie un nouveau bloc depuis sa définition (id, defaultProps,
 *  enfants initiaux pour les conteneurs). */
export function createBlockInstance(def: BlockDefinition): Block {
    return {
        id: uuidv4(),
        type: def.type,
        props: { ...def.defaultProps },
        ...(def.container ? { children: def.initialChildren?.() ?? [] } : {}),
    };
}
```

Puis remplacer **tous** les sites de création manuelle (`{ id: uuidv4(), type: def.type, props: { ...def.defaultProps } }`) par `createBlockInstance(def)` : `BuilderPage.tsx` (handleDragEnd), `BuilderCanvas.tsx` (handlePaletteSelect), `PropsPanel.tsx` (palette du panneau). Retirer les imports `uuid` devenus inutiles dans ces trois fichiers.

- [ ] **Step 5 : `BlockRenderer.tsx` — récursif**

Remplacer le fichier entier :

```tsx
"use client";

import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

function BlockItem({ block }: { block: Block }) {
    const def = getBlockDefinition(block.type);
    if (!def) {
        return (
            <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">
                Bloc inconnu : {block.type}
            </div>
        );
    }

    const Render = def.render;
    const children = block.children?.map((child) => (
        <BlockItem key={child.id} block={child} />
    ));

    return <Render {...block.props}>{children}</Render>;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    return (
        <article className="flex flex-col gap-6">
            {blocks.map((block) => (
                <BlockItem key={block.id} block={block} />
            ))}
        </article>
    );
}
```

- [ ] **Step 6 : `BlockPaletteGrid.tsx` — méta + masquage des types internes**

Ajouter aux imports lucide : `Columns2, Megaphone, ChevronsDownUp`. Compléter `BLOCK_META` :

```tsx
    "columns":     { icon: Columns2,        description: "Mise en page en 2 à 4 colonnes" },
    "callout":     { icon: Megaphone,       description: "Encadré info, attention, astuce ou rappel" },
    "collapsible": { icon: ChevronsDownUp,  description: "Bloc dépliable (prérequis, aparté)" },
```

Puis masquer les types qui ne s'insèrent que via leur parent — dans `BlockPaletteGrid`, juste après `const definitions = getAllBlockDefinitions();` :

```tsx
import { containerRules } from "@/lib/blockSchemas";
// types réservés : créés par leur conteneur parent, jamais via la palette
const HIDDEN_TYPES = Object.entries(containerRules)
    .filter(([, rule]) => rule.allowedParents !== undefined && !rule.allowedParents.includes(null))
    .map(([type]) => type); // → ["column", "list-item"]

const filtered = definitions.filter(
    (d) =>
        !HIDDEN_TYPES.includes(d.type) &&
        (d.label.toLowerCase().includes(search.toLowerCase()) ||
            d.type.toLowerCase().includes(search.toLowerCase()) ||
            (BLOCK_META[d.type]?.description ?? "").toLowerCase().includes(search.toLowerCase()))
);
```

(`HIDDEN_TYPES` se calcule au niveau module, hors composant.)

- [ ] **Step 7 : Compile, lint, tests**

Run: `bunx tsc --noEmit && bun run lint && bun test`
Expected: 0 erreur. État transitoire connu : dans le **builder**, les enfants des conteneurs ne sont pas encore affichés ni éditables (le canvas est encore plat — Task 7) ; le rendu **public** est lui déjà complet et récursif.

- [ ] **Step 8 : Commit**

```bash
git add src/lib/blockRegistry.tsx src/components/CoursePrerequisites.tsx src/components/builder/
git commit -m "feat(builder): conteneurs columns/column/list/list-item/callout/collapsible + rendu public récursif"
```

---

## Task 7 : `BlockTree` — canvas récursif (sélection, édition, insertion par conteneur)

DnD toujours limité au réordonnancement racine ; l'inter-niveaux arrive en Task 8.

**Files:**
- Create: `src/components/builder/BlockTree.tsx`
- Modify: `src/components/builder/BuilderCanvas.tsx` (délègue à BlockTree)
- Modify: `src/components/builder/BlockPalette.tsx` (prop `allowedTypes`)
- Modify: `src/components/builder/BlockPaletteGrid.tsx` (prop `allowedTypes`)

- [ ] **Step 1 : Filtrage contextuel de la palette**

`BlockPaletteGrid.tsx` — ajouter la prop et l'appliquer au filtre :

```tsx
interface BlockPaletteGridProps {
    onSelect: (def: BlockDefinition) => void;
    compact?: boolean;
    autoFocusSearch?: boolean;
    draggable?: boolean;
    /** Types insérables dans le contexte courant (canDrop). Absent = racine. */
    allowedTypes?: string[];
}
```

et dans le filtre : `(!allowedTypes || allowedTypes.includes(d.type)) && !HIDDEN_TYPES.includes(d.type) && (...)`.

`BlockPalette.tsx` — ajouter `allowedTypes?: string[]` aux props et le transmettre à `BlockPaletteGrid`.

- [ ] **Step 2 : Créer `src/components/builder/BlockTree.tsx`**

```tsx
"use client";

import React, { memo, useState } from "react";
import { GripVertical } from "lucide-react";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import { InlineTextEditor } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

/** Cible d'insertion calculée pendant un drag (Task 8) ou un clic "+". */
export interface InsertContext {
    parentId: string | null;
    parentType: string | null;
    index: number;
}

interface BlockTreeProps {
    blocks: Block[];
    parentId: string | null;
    parentType: string | null;
    depth: number;
    onInsertRequest: (ctx: InsertContext) => void;
}

function InsertLine({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex items-center gap-2 my-1 opacity-0 hover:opacity-100 transition-opacity duration-150">
            <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
            <button
                className="bg-brand-primary text-brand-light rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-brand-accent-dark transition-colors cursor-pointer"
                onClick={onClick}
                title="Insérer un bloc ici"
                aria-label="Insérer un bloc ici"
            >
                +
            </button>
            <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
        </div>
    );
}

/** Zone droppable de fin de conteneur (sert aussi d'état vide). */
function ContainerTail({
    parentId,
    parentType,
    count,
    onInsertRequest,
}: {
    parentId: string;
    parentType: string;
    count: number;
    onInsertRequest: (ctx: InsertContext) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${parentId}:tail`,
        data: { dropZone: true, parentId, parentType, index: count },
    });

    return (
        <div
            ref={setNodeRef}
            className={[
                "rounded-md border border-dashed transition-colors my-1",
                count === 0 ? "p-3 text-center" : "p-0.5",
                isOver
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-bridge-400/30 dark:border-bridge-500/25",
            ].join(" ")}
        >
            <button
                className="w-full text-xs text-bridge-400 dark:text-bridge-500 hover:text-brand-primary transition-colors cursor-pointer"
                onClick={() => onInsertRequest({ parentId, parentType, index: count })}
            >
                + Ajouter un bloc
            </button>
        </div>
    );
}

const SortableBlock = memo(function SortableBlock({
    block,
    parentId,
    parentType,
    index,
    depth,
    onInsertRequest,
}: {
    block: Block;
    parentId: string | null;
    parentType: string | null;
    index: number;
    depth: number;
    onInsertRequest: (ctx: InsertContext) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const [editingInline, setEditingInline] = useState(false);
    const selectedId = useBuilderStore((s) => s.selectedId);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const isSelected = selectedId === block.id;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: block.id,
            data: { origin: "canvas", blockType: block.type, parentId, parentType, index },
        });

    const def = getBlockDefinition(block.type);
    const editFieldKey = def?.inlineEditField;
    const editFieldDef = editFieldKey ? def?.fields.find((f) => f.key === editFieldKey) : undefined;
    const editValue = editFieldKey ? String(block.props[editFieldKey] ?? "") : "";

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    };

    // Les colonnes sont des cellules de grille : la classe col-span doit vivre
    // sur le wrapper racine du sortable, pas sur le rendu interne.
    const isColumn = block.type === "column";
    const wrapperCls = isColumn
        ? `${COL_SPAN_CLASS[Number(block.props.span)] ?? "md:col-span-6"} min-w-0`
        : undefined;

    function handleInlineChange(next: string) {
        if (!editFieldKey) return;
        updateBlock(block.id, { ...block.props, [editFieldKey]: next });
    }

    function handleDoubleClick(e: React.MouseEvent) {
        if (!editFieldKey || editingInline) return;
        e.stopPropagation();
        setEditingInline(true);
    }

    if (!def) {
        return (
            <div ref={setNodeRef} style={style} className={wrapperCls}>
                <div className="text-bridge-500 dark:text-bridge-400 text-sm p-3">
                    Bloc inconnu : {block.type}
                </div>
            </div>
        );
    }

    const Render = def.render;
    const renderedChildren = def.container ? (
        <BlockTree
            blocks={block.children ?? []}
            parentId={block.id}
            parentType={block.type}
            depth={depth + 1}
            onInsertRequest={onInsertRequest}
        />
    ) : undefined;

    // column : cellule structurelle — pas de chrome de sélection ni de drag,
    // juste la zone + les enfants (le span s'édite via le bloc columns parent).
    if (isColumn) {
        return (
            <div ref={setNodeRef} style={style} className={wrapperCls}>
                <div className="rounded-lg border border-dashed border-bridge-400/25 dark:border-bridge-500/20 p-2 h-full">
                    {renderedChildren}
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style}>
            <InsertLine onClick={() => onInsertRequest({ parentId, parentType, index })} />

            <div
                className={[
                    "relative group rounded-lg transition-all duration-150 cursor-pointer",
                    isSelected
                        ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-bridge-100 dark:ring-offset-bridge-900"
                        : "ring-1 ring-transparent hover:ring-bridge-400/40 dark:hover:ring-bridge-500/35",
                ].join(" ")}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
                onDoubleClick={handleDoubleClick}
            >
                {(hovered || isSelected) && (
                    <div
                        className="absolute -top-2.5 left-2 z-10 max-w-[calc(100%-3rem)] bg-brand-primary text-brand-light text-[10px] px-1.5 py-0.5 rounded font-mono tracking-wide select-none truncate"
                        title={block.type}
                    >
                        {block.type}
                    </div>
                )}

                {(hovered || isSelected) && (
                    <button
                        className="absolute right-1.5 top-1.5 z-10 text-bridge-500 dark:text-bridge-400 hover:text-brand-primary cursor-grab active:cursor-grabbing transition-colors p-0.5 rounded"
                        {...attributes}
                        {...listeners}
                        title="Déplacer"
                        aria-label="Déplacer le bloc"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                )}

                <div className="p-3">
                    {editingInline && editFieldKey ? (
                        <InlineTextEditor
                            value={editValue}
                            onChange={handleInlineChange}
                            multiline={editFieldDef?.type === "textarea"}
                            placeholder={editFieldDef?.placeholder}
                            autoFocus
                            onBlur={() => setEditingInline(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    setEditingInline(false);
                                }
                            }}
                            aria-label={`Édition inline : ${editFieldDef?.label ?? editFieldKey}`}
                        />
                    ) : (
                        <Render {...block.props}>{renderedChildren}</Render>
                    )}
                </div>
            </div>
        </div>
    );
});

export function BlockTree({ blocks, parentId, parentType, depth, onInsertRequest }: BlockTreeProps) {
    const items = blocks.map((b) => b.id);
    const isColumnsContainer = parentType === "columns";

    const content = (
        <>
            {blocks.map((block, index) => (
                <SortableBlock
                    key={block.id}
                    block={block}
                    parentId={parentId}
                    parentType={parentType}
                    index={index}
                    depth={depth}
                    onInsertRequest={onInsertRequest}
                />
            ))}
            {parentId !== null && !isColumnsContainer && (
                <ContainerTail
                    parentId={parentId}
                    parentType={parentType ?? ""}
                    count={blocks.length}
                    onInsertRequest={onInsertRequest}
                />
            )}
        </>
    );

    return (
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {isColumnsContainer
                ? <div className="grid grid-cols-1 md:grid-cols-12 gap-3">{content}</div>
                : content}
        </SortableContext>
    );
}
```

Notes d'implémentation :
- Les enfants d'un `columns` se rendent dans une grille gérée par `BlockTree` (pas par `def.render` de columns, dont le wrapper grid servirait le rendu public) — en mode builder le conteneur `columns` reçoit comme `children` le `BlockTree`, donc son `render` grid envelopperait une 2e grille. Pour éviter ça, `SortableBlock` rend les conteneurs via `Render` **sauf** que pour `columns` la grille du render public et celle du BlockTree se superposent sans conflit visuel majeur (grille dans grille à 1 enfant) ; si le rendu double-grille pose problème à l'exécution, court-circuiter : pour `block.type === "columns"`, rendre directement `renderedChildren` sans passer par `Render`.
- Connu et accepté : dans le builder, la numérotation des listes ordonnées s'affiche mal (chaque `<li>` est enveloppé du chrome d'édition) — le rendu public, lui, est correct.

- [ ] **Step 3 : Refondre `BuilderCanvas.tsx`**

Remplacer le corps par la délégation à `BlockTree` :

```tsx
"use client";

import React, { useCallback, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "@/lib/store/builderStore";
import { createBlockInstance, getBlockDefinition, getAllBlockDefinitions } from "@/lib/blockRegistry";
import { canDrop } from "@/lib/blockSchemas";
import { BlockPalette } from "@/components/builder/BlockPalette";
import { BlockTree, type InsertContext } from "@/components/builder/BlockTree";
import type { BlockDefinition } from "@/lib/blockRegistry";

interface BuilderCanvasProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export function BuilderCanvas({ moduleSlug, sectionSlug, contentType }: BuilderCanvasProps) {
    void sectionSlug; void contentType;
    const { blocks, selectBlock, insertBlock } = useBuilderStore();
    const [paletteCtx, setPaletteCtx] = useState<InsertContext | null>(null);

    const { setNodeRef: setCanvasRef } = useDroppable({
        id: "canvas",
        data: { dropZone: true, parentId: null, parentType: null, index: blocks.length },
    });

    const handleInsertRequest = useCallback((ctx: InsertContext) => {
        setPaletteCtx(ctx);
    }, []);

    const handlePaletteSelect = useCallback(
        (def: BlockDefinition) => {
            if (!paletteCtx) return;
            const newBlock = createBlockInstance(def);
            insertBlock(newBlock, paletteCtx.parentId, paletteCtx.index);
            selectBlock(newBlock.id);
        },
        [insertBlock, selectBlock, paletteCtx]
    );

    const allowedTypes = paletteCtx
        ? getAllBlockDefinitions()
            .map((d) => d.type)
            .filter((t) => canDrop(t, paletteCtx.parentType))
        : undefined;

    return (
        <div
            ref={setCanvasRef}
            className="flex-1 overflow-y-auto p-4 min-h-0 bg-bridge-100/20 dark:bg-bridge-900/40"
            onClick={() => selectBlock(null)}
        >
            {blocks.length === 0 && (
                <div
                    className="border-2 border-dashed border-bridge-400/40 dark:border-bridge-500/30 rounded-xl p-12 text-center text-bridge-500 dark:text-bridge-400 cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary hover:text-brand-primary transition-colors duration-200"
                    onClick={() => setPaletteCtx({ parentId: null, parentType: null, index: 0 })}
                >
                    <div className="text-sm font-medium">Aucun bloc pour l&apos;instant</div>
                    <div className="text-xs mt-1 opacity-70">Cliquez pour ajouter le premier bloc</div>
                </div>
            )}

            <BlockTree
                blocks={blocks}
                parentId={null}
                parentType={null}
                depth={1}
                onInsertRequest={handleInsertRequest}
            />

            {blocks.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
                    <button
                        className="bg-brand-primary text-brand-light rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-brand-accent-dark transition-colors cursor-pointer"
                        onClick={() => setPaletteCtx({ parentId: null, parentType: null, index: blocks.length })}
                        title="Ajouter un bloc à la fin"
                        aria-label="Ajouter un bloc à la fin"
                    >
                        +
                    </button>
                    <div className="flex-1 h-px bg-bridge-400/30 dark:bg-bridge-500/25" />
                </div>
            )}

            <BlockPalette
                open={paletteCtx !== null}
                onClose={() => setPaletteCtx(null)}
                onSelect={handlePaletteSelect}
                moduleSlug={moduleSlug}
                allowedTypes={allowedTypes}
            />
        </div>
    );
}
```

Note : la prop `insertPreviewAfter` disparaît de `BuilderCanvas` — retirer sa transmission dans `BuilderPage.tsx` (l'aperçu d'insertion DnD revient en Task 8 via le state `dropTarget`). `getBlockDefinition` reste importé si utilisé, sinon retirer.

- [ ] **Step 4 : Compile, lint, tests, vérification manuelle**

Run: `bunx tsc --noEmit && bun run lint && bun test`
Expected: 0 erreur.

`bun dev` — vérifier : insérer une `list` (1 item créé), double-clic sur l'item pour éditer le texte, `+` du conteneur ouvre la palette **filtrée** (un `list` ne propose rien d'autre que l'ajout via list-item ? non : le `+` d'un `list` ne doit proposer que « Élément de liste »… qui est masqué par `HIDDEN_TYPES`). **Correction attendue dans ce step** : `HIDDEN_TYPES` ne doit s'appliquer que quand `allowedTypes` est absent (insertion racine). Dans `BlockPaletteGrid`, remplacer la condition par :

```tsx
const visible = allowedTypes
    ? definitions.filter((d) => allowedTypes.includes(d.type))
    : definitions.filter((d) => !HIDDEN_TYPES.includes(d.type));
const filtered = visible.filter((d) => /* …filtre recherche existant… */);
```

Ainsi le `+` d'une `list` propose uniquement « Élément de liste », celui d'une `column` propose tout sauf columns/column/list-item, et la palette racine masque les types internes. Vérifier aussi : columns (2 colonnes côte à côte, `+` dans chaque colonne), callout/collapsible avec enfants, imbrication liste dans list-item.

- [ ] **Step 5 : Commit**

```bash
git add src/components/builder/
git commit -m "feat(builder): canvas récursif BlockTree — édition et insertion dans les conteneurs"
```

---

## Task 8 : DnD inter-niveaux

**Files:**
- Modify: `src/components/builder/BuilderPage.tsx` (collision, handlers, overlay)
- Modify: `src/components/builder/BlockTree.tsx` (aperçu d'insertion)

- [ ] **Step 1 : Collision detection et résolution de cible dans `BuilderPage.tsx`**

Imports à ajouter : `pointerWithin, rectIntersection, type CollisionDetection, type Over` depuis `@dnd-kit/core` ; `canDrop` depuis `@/lib/blockSchemas` ; `isDescendant, findParent` depuis `@/lib/blockTreeUtils` ; `createBlockInstance` depuis `@/lib/blockRegistry`.

```tsx
// Conteneurs imbriqués : pointerWithin d'abord (sinon le parent gagne
// toujours sur ses enfants), rectIntersection en secours (drag clavier).
const collisionDetection: CollisionDetection = (args) => {
    const pointer = pointerWithin(args);
    return pointer.length > 0 ? pointer : rectIntersection(args);
};

interface DropTarget {
    parentId: string | null;
    parentType: string | null;
    index: number;
}

/** Résout la cible d'insertion depuis l'élément survolé. */
function resolveDropTarget(over: Over | null): DropTarget | null {
    if (!over) return null;
    const d = over.data.current as {
        dropZone?: boolean;
        parentId?: string | null;
        parentType?: string | null;
        index?: number;
        sortable?: { index: number };
    } | undefined;

    if (d?.dropZone) {
        return { parentId: d.parentId ?? null, parentType: d.parentType ?? null, index: d.index ?? 0 };
    }
    // Survol d'un bloc sortable : on s'insère à sa place (dnd-kit décale le reste)
    if (d?.sortable) {
        return {
            parentId: d.parentId ?? null,
            parentType: d.parentType ?? null,
            index: d.sortable.index,
        };
    }
    return null;
}
```

(les deux déclarations vivent au niveau module, au-dessus du composant `BuilderPage`).

- [ ] **Step 2 : Réécrire les handlers DnD de `BuilderPage`**

State : remplacer `paletteOverId` par `const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);` et `const [dropAllowed, setDropAllowed] = useState(true);`. Ajouter `const [activeBlock, setActiveBlock] = useState<Block | null>(null);` pour l'overlay des blocs canvas. Récupérer `findBlock` (import depuis blockTreeUtils) pour le lookup.

```tsx
function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
        | { origin?: string; def?: BlockDefinition; blockType?: string }
        | undefined;
    if (data?.origin === "palette" && data.def) {
        setActiveDragDef(data.def);
    } else if (data?.origin === "canvas") {
        setActiveBlock(findBlock(blocks, String(event.active.id)) ?? null);
    }
}

function handleDragOver(event: DragOverEvent) {
    const target = resolveDropTarget(event.over);
    const data = event.active.data.current as
        | { origin?: string; def?: BlockDefinition; blockType?: string }
        | undefined;
    const draggedType = data?.origin === "palette" ? data.def?.type : data?.blockType;

    if (!target || !draggedType) {
        setDropTarget(null);
        return;
    }

    let allowed = canDrop(draggedType, target.parentType);
    if (allowed && data?.origin === "canvas") {
        const id = String(event.active.id);
        if (target.parentId === id || (target.parentId && isDescendant(blocks, id, target.parentId))) {
            allowed = false;
        }
    }
    setDropTarget(target);
    setDropAllowed(allowed);
}

function handleDragCancel() {
    setActiveDragDef(null);
    setActiveBlock(null);
    setDropTarget(null);
}

function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const target = resolveDropTarget(over);
    const wasAllowed = dropAllowed;
    const data = active.data.current as
        | { origin?: string; def?: BlockDefinition; blockType?: string }
        | undefined;

    setActiveDragDef(null);
    setActiveBlock(null);
    setDropTarget(null);

    if (!target || !wasAllowed) return;

    if (data?.origin === "palette" && data.def) {
        const newBlock = createBlockInstance(data.def);
        insertBlock(newBlock, target.parentId, target.index);
        selectBlock(newBlock.id);
    } else if (data?.origin === "canvas") {
        moveBlock(String(active.id), target.parentId, target.index);
    }
}
```

Brancher `collisionDetection={collisionDetection}` sur le `DndContext` (remplace `closestCenter`). Transmettre l'état au canvas : `<BuilderCanvas ... dropTarget={dropTarget} dropAllowed={dropAllowed} />` (le `moveBlock` du store fait déjà les gardes finales `isDescendant` — la double vérification UI sert au feedback visuel).

- [ ] **Step 3 : DragOverlay pour les blocs canvas**

Dans le `DragOverlay` existant, ajouter le cas bloc canvas après le cas palette :

```tsx
{!activeDragDef && activeBlock && (
    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 border border-brand-primary/50 bg-bridge-50 dark:bg-bridge-900 shadow-xl select-none cursor-grabbing max-w-xs">
        <span className="text-xs font-mono text-brand-primary shrink-0">{activeBlock.type}</span>
        <span className="text-xs text-bridge-600 dark:text-bridge-300 truncate">
            {String(activeBlock.props.content ?? activeBlock.props.text ?? activeBlock.props.title ?? "")}
        </span>
    </div>
)}
```

- [ ] **Step 4 : Aperçu d'insertion dans `BlockTree`**

Propager `dropTarget: { parentId, index } | null` et `dropAllowed: boolean` depuis `BuilderCanvas` (nouvelles props, transmises récursivement par `BlockTree`). Dans `BlockTree`, avant l'enfant d'index `i`, afficher la ligne d'aperçu :

```tsx
{dropTarget && dropTarget.parentId === parentId && dropTarget.index === index && (
    <div className={[
        "flex items-center gap-1 my-1.5 pointer-events-none",
        dropAllowed ? "" : "opacity-50",
    ].join(" ")}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${dropAllowed ? "bg-brand-primary" : "bg-destructive"}`} />
        <div className={`flex-1 h-0.5 rounded-full ${dropAllowed ? "bg-brand-primary" : "bg-destructive"}`} />
        <div className={`w-2 h-2 rounded-full shrink-0 ${dropAllowed ? "bg-brand-primary" : "bg-destructive"}`} />
    </div>
)}
```

(même rendu après le dernier enfant quand `dropTarget.index === blocks.length`). Quand `!dropAllowed`, ajouter `cursor-not-allowed` sur le wrapper du conteneur ciblé.

- [ ] **Step 5 : Vérification manuelle approfondie (le cœur du chantier)**

Run: `bunx tsc --noEmit && bun run lint && bun test` puis `bun dev`.

Scénarios à valider un par un dans le navigateur :
1. Drag racine → racine (réordonnancement simple, comportement préservé).
2. Drag d'un bloc racine vers une `column` (et retour vers la racine).
3. Drag d'un bloc d'une colonne A vers la colonne B du même `columns`.
4. Drag d'un `code` sous un `list-item` ; drag d'un `list-item` entre deux `list`.
5. Palette → `column`, palette → `list-item`, palette → `callout` (avec filtre de types respecté : un `columns` ne se droppe pas dans une colonne — aperçu rouge, drop ignoré).
6. Drag d'une `list` dans son propre `list-item` → aperçu rouge, drop ignoré, arbre intact.
7. Conteneur vide (`column` fraîche) : la zone pointillée accepte le drop.
8. Sauvegarder, recharger la page : l'arbre persiste et se re-rend.

Itérer sur les seuils de collision si le ciblage est imprécis (c'est attendu : ajuster `ContainerTail` padding / ordre pointerWithin) — **ne pas passer à la Task 9 tant que les 8 scénarios ne passent pas**.

- [ ] **Step 6 : Commit**

```bash
git add src/components/builder/
git commit -m "feat(builder): drag & drop inter-niveaux — pointerWithin, cibles récursives, drops interdits"
```

---

## Task 9 : Éditeur de colonnes dans le PropsPanel

`callout`, `collapsible`, `list`, `list-item` s'éditent déjà via `DynamicPropsEditor` (leurs `fields` sont déclarés). Seul `columns` a besoin d'un éditeur dédié : ses largeurs vivent dans les `props.span` de ses **enfants**.

**Files:**
- Create: `src/components/builder/ColumnsEditor.tsx`
- Modify: `src/components/builder/PropsPanel.tsx`

- [ ] **Step 1 : Créer `src/components/builder/ColumnsEditor.tsx`**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBuilderStore } from "@/lib/store/builderStore";
import { COLUMN_PRESETS } from "@/lib/blockSchemas";
import { v4 as uuidv4 } from "uuid";
import type { Block } from "@/types/CourseContent";

interface ColumnsEditorProps {
    block: Block; // le bloc columns sélectionné
}

export function ColumnsEditor({ block }: ColumnsEditorProps) {
    const updateChildren = useBuilderStore((s) => s.updateChildren);
    const columns = block.children ?? [];

    function applyPreset(spans: number[]) {
        const next: Block[] = spans.map((span, i) => {
            const existing = columns[i];
            if (existing) {
                return { ...existing, props: { ...existing.props, span } };
            }
            return { id: uuidv4(), type: "column", props: { span }, children: [] };
        });
        // Colonnes en trop : fusionner leur contenu dans la dernière colonne
        // conservée plutôt que de le supprimer silencieusement.
        const dropped = columns.slice(spans.length);
        if (dropped.length > 0) {
            const last = next[next.length - 1];
            next[next.length - 1] = {
                ...last,
                children: [
                    ...(last.children ?? []),
                    ...dropped.flatMap((c) => c.children ?? []),
                ],
            };
        }
        updateChildren(block.id, next);
    }

    const current = columns.map((c) => Number(c.props.span)).join("/");

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] uppercase tracking-[0.15em] font-semibold text-bridge-600 dark:text-bridge-400">
                Disposition
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
                {COLUMN_PRESETS.map((preset) => {
                    const isActive = preset.spans.join("/") === current;
                    return (
                        <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset(preset.spans)}
                            className={[
                                "h-8 text-xs",
                                isActive
                                    ? "border-brand-primary/60 bg-brand-primary/10 text-brand-primary"
                                    : "border-bridge-300/60 dark:border-bridge-600/40 text-bridge-600 dark:text-bridge-400",
                            ].join(" ")}
                        >
                            {preset.label}
                        </Button>
                    );
                })}
            </div>
            <p className="text-[10px] text-bridge-400 dark:text-bridge-500 mt-1">
                Réduire le nombre de colonnes fusionne leur contenu dans la dernière colonne.
            </p>
        </div>
    );
}
```

- [ ] **Step 2 : Brancher dans `PropsPanel.tsx`**

Sous le `DynamicPropsEditor` (dans le bloc `{block && def ? (...)}`), ajouter :

```tsx
{block.type === "columns" && (
    <>
        <Separator className="my-4 bg-bridge-400/20 dark:bg-bridge-500/25" />
        <ColumnsEditor block={block} />
    </>
)}
```

avec `import { ColumnsEditor } from "@/components/builder/ColumnsEditor";` et le `Separator` déjà importé (sinon le réimporter).

- [ ] **Step 3 : Vérification manuelle + commit**

Run: `bunx tsc --noEmit && bun run lint`, puis `bun dev` : sélectionner un `columns`, appliquer chaque preset, vérifier que passer de 3 à 2 colonnes fusionne le contenu de la 3e dans la 2e. Sauvegarder, vérifier le rendu public (largeurs respectées, empilement mobile).

```bash
git add src/components/builder/ColumnsEditor.tsx src/components/builder/PropsPanel.tsx
git commit -m "feat(builder): éditeur de colonnes — presets de largeurs avec fusion du contenu"
```

---

## Task 10 : Validation au PUT + refonte ai-assist

**Files:**
- Modify: `src/app/api/admin/content/[module]/[section]/[type]/route.ts:49-62`
- Modify: `src/app/api/admin/content/ai-assist/route.ts`

- [ ] **Step 1 : PUT — brancher `validateBlockTree`**

Remplacer la validation manuelle (l.51-62) par :

```ts
import { validateBlockTree } from "@/lib/validateBlockTree";
// ...
const body = await req.json() as { blocks: unknown };

const validation = validateBlockTree(body?.blocks);
if (!validation.valid) {
    return NextResponse.json(
        { error: "Blocs invalides", details: validation.errors },
        { status: 422 }
    );
}
const blocks = body.blocks as Block[];
```

(et utiliser `blocks` à la place de `body.blocks` dans la suite du handler).

- [ ] **Step 2 : ai-assist — schéma récursif, prompt, validation**

Dans `src/app/api/admin/content/ai-assist/route.ts` :

1. **Supprimer** `import { getBlockDefinition } from "@/lib/blockRegistry";` (module client — ne doit pas être importé côté serveur) et la boucle `safeParse` (l.101-106).
2. Remplacer `TOOLS` par un schéma récursif sans `colSpan` :

```ts
const TOOLS = [
    {
        name: "update_blocks",
        description: "Remplace entièrement l'arbre de blocs du contenu ouvert dans le builder.",
        input_schema: {
            type: "object",
            $defs: {
                block: {
                    type: "object",
                    properties: {
                        id:       { type: "string" },
                        type:     { type: "string" },
                        props:    { type: "object" },
                        children: { type: "array", items: { $ref: "#/$defs/block" } },
                    },
                    required: ["id", "type", "props"],
                },
            },
            properties: {
                blocks: {
                    type: "array",
                    description: "Nouvel arbre complet de blocs",
                    items: { $ref: "#/$defs/block" },
                },
            },
            required: ["blocks"],
        },
    },
];
```

3. Générer le prompt système depuis `blockSchemas` :

```ts
import { containerRules, blockPropsSchemas } from "@/lib/blockSchemas";

const NESTING_DOC = Object.entries(containerRules)
    .map(([type, rule]) => {
        const children = rule.allowedChildren === "any" ? "tout type (sauf columns)" : rule.allowedChildren.join(", ");
        const parents = rule.allowedParents
            ? rule.allowedParents.map((p) => p ?? "racine").join(", ")
            : "partout";
        return `- ${type} : enfants = ${children} ; parents = ${parents}`;
    })
    .join("\n");

const systemPrompt = `Tu es un assistant qui aide à construire du contenu pédagogique.
Tu as accès au tool update_blocks pour modifier l'arbre de blocs du cours ouvert.
Types de blocs disponibles : ${Object.keys(blockPropsSchemas).join(", ")}.
Les conteneurs portent leurs enfants dans "children" :
${NESTING_DOC}
Contraintes : columns a 2 à 4 enfants column dont la somme des props.span fait 12 (valeurs : 3, 4, 6, 8, 9) ; list ne contient que des list-item ; chaque bloc a un id unique (uuid).
Blocs actuels :
${JSON.stringify(body.currentBlocks, null, 2)}`;
```

4. Avant l'écriture en base (l.98), valider et refuser :

```ts
import { validateBlockTree } from "@/lib/validateBlockTree";
// ...dans la branche tool_use :
const validation = validateBlockTree(part.input.blocks);
if (!validation.valid) {
    return NextResponse.json({
        text: assistantText,
        blocks: null,
        error: `Blocs générés invalides : ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(" ; ")}`,
    }, { status: 422 });
}
newBlocks = part.input.blocks;
```

- [ ] **Step 3 : Vérifier**

Run: `bunx tsc --noEmit && bun run lint && bun test`
Expected: 0 erreur. Test manuel : sauvegarder un contenu valide depuis le builder (200) ; via la console réseau ou `curl`, envoyer un PUT avec `{"blocks":[{"id":"a","type":"wat","props":{}}]}` → 422 avec `details`.

- [ ] **Step 4 : Commit**

```bash
git add src/app/api/admin/content/
git commit -m "feat(builder): validation de l'arbre au PUT + ai-assist sur le nouveau schéma récursif"
```

---

## Task 11 : Purge des contenus de test + vérifications finales

**Files:**
- Create: `script/purgeCourseContent.mjs`

- [ ] **Step 1 : Script de purge**

```js
// script/purgeCourseContent.mjs
// Purge ponctuelle des contenus de test (ancien format colSpan/items).
// Usage : bun --env-file=.env.local script/purgeCourseContent.mjs
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI manquant (lancer avec --env-file=.env.local)");
    process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db("cours-iut-web");

const res = await db.collection("course_content").deleteMany({});
console.log(`course_content : ${res.deletedCount} documents supprimés`);

// Repointer les sections vers les fichiers .tsx
const mod = await db.collection("modules").updateMany(
    { "sections.contents.source": "db" },
    {
        $set: { "sections.$[].contents.$[c].source": "file" },
        $unset: { "sections.$[].contents.$[c].contentId": "" },
    },
    { arrayFilters: [{ "c.source": "db" }] }
);
console.log(`modules : ${mod.modifiedCount} documents repointés vers source=file`);

await client.close();
```

- [ ] **Step 2 : Exécuter la purge**

Run: `bun --env-file=.env.local script/purgeCourseContent.mjs`
Expected: compte de documents supprimés/repointés affiché, exit 0.

- [ ] **Step 3 : Vérifications finales complètes**

```bash
bun test               # tous les tests (lib + api existants)
bun run lint           # 0 erreur
bun run build          # le build standalone passe
```

Puis `bun dev` et un parcours complet : créer un contenu riche (heading, columns 33/67 avec image+code, liste ordonnée avec sous-liste et code sous un item, callout reminder avec texte, collapsible, divider, quote, download-file, diagram), sauvegarder, vérifier le rendu public de la page, recharger le builder et vérifier la fidélité de l'arbre.

- [ ] **Step 4 : Commit final**

```bash
git add script/purgeCourseContent.mjs
git commit -m "chore(builder): script de purge des contenus de test (ancien format colSpan)"
```

---

## Couverture spec → tasks

| Section spec | Task(s) |
|---|---|
| §3 Modèle de données (`children`, suppression `colSpan`, `container` registry) | 5, 6 |
| §4 Blocs structurels + règles + largeurs + mapping composants | 1, 6, 9 |
| §5 Nouveaux blocs feuilles + hors périmètre | 4 |
| §6 blockTreeUtils + store | 2, 5 |
| §7 DnD inter-niveaux | 7 (zones droppables), 8 (handlers) |
| §8 Rendu récursif builder + public | 6 (public), 7 (builder) |
| §9 Validation + API + extraction blockSchemas | 1, 3, 10 |
| §10 Migration (purge) | 11 |
| §11 Tests | 1, 2, 3 |
| §12-13 Fichiers + risques | répartis ; risque DnD isolé en Task 8 avec gate manuelle |
