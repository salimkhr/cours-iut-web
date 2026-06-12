# Builder — Interactions clavier (undo/redo, sauvegarde, navigation) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Doter le builder d'un historique undo/redo dans le store Zustand et de raccourcis clavier globaux : Ctrl+Z (annuler), Ctrl+Y / Ctrl+Shift+Z (rétablir), Ctrl+S (sauvegarder), Ctrl+D (dupliquer), Delete/Backspace (supprimer), Escape (désélectionner), ↑/↓ (naviguer entre blocs).

**Architecture:** L'historique vit dans `builderStore` sous forme de deux piles de snapshots `past: Block[][]` / `future: Block[][]`. Les snapshots sont quasi gratuits : l'arbre est immuable avec structural sharing (`blockTreeUtils`), donc chaque snapshot ne stocke que des références. Les frappes successives dans un même champ sont coalescées via une clé `lastActionKey` (`update:<id>`) pour qu'un undo défasse la saisie entière, pas caractère par caractère. Un hook `useBuilderShortcuts` (nouveau, dans `src/hook/`) écoute `keydown` au niveau `window`, avec une garde « champ de saisie » : dans un input/textarea, le undo natif du champ reste prioritaire. Deux nouveaux helpers purs dans `blockTreeUtils` : `flattenTree` (ordre visuel pour la navigation ↑/↓) et `cloneBlockWithNewIds` (duplication récursive).

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Zustand 5, `bun test`, lucide-react, uuid.

**Pré-requis :** branche `feat/builder` (Tasks 1–11 du plan nested-blocks déjà commitées). Conventions : indentation 4 espaces, imports via `@/*`, apostrophes `&apos;` dans le JSX texte.

**Décisions prises (ne pas re-discuter en cours d'implémentation) :**
- Historique fait main (pas de dépendance `zundo`) : ~40 lignes, testable, aucune dep ajoutée.
- `undo`/`redo` mettent `isDirty: true` systématiquement (on ne suit pas la position « état sauvegardé » dans l'historique — YAGNI).
- Dans un champ de saisie, Ctrl+Z/Ctrl+Y ne sont **pas** interceptés (undo natif du champ). Ctrl+S est intercepté partout (sinon le navigateur ouvre « Enregistrer la page »).
- `duplicateBlock` refuse le type `column` (dupliquer une colonne casserait l'invariant somme des spans = 12).
- Limite d'historique : 100 pas.
- La navigation ↑/↓ saute les blocs `column` (cellules structurelles non sélectionnables dans le canvas).
- Pendant un drag dnd-kit actif, Delete/flèches/undo sont ignorés (état incohérent sinon).

---

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `src/lib/blockTreeUtils.ts` (modify) | + `flattenTree`, `cloneBlockWithNewIds` — helpers purs |
| `src/lib/store/builderStore.ts` (rewrite) | + `past`/`future`/`lastActionKey`, `undo`, `redo`, `duplicateBlock` |
| `src/hook/useBuilderShortcuts.ts` (create) | Écouteur clavier global, garde champ de saisie, dispatch vers le store |
| `src/components/builder/BuilderPage.tsx` (modify) | Branchement du hook, boutons Annuler/Rétablir dans la toolbar, garde `handleSave` |
| `src/components/builder/BlockTree.tsx` (modify) | `data-block-id` sur le wrapper de `SortableBlock` (scrollIntoView de la navigation) |
| `tests/lib/blockTreeUtils.test.ts` (modify) | Tests `flattenTree` + `cloneBlockWithNewIds` |
| `tests/lib/builderStore.test.ts` (create) | Tests historique, coalescence, duplication, limite |

---

## Task 1 : `blockTreeUtils` — `flattenTree` + `cloneBlockWithNewIds`

**Files:**
- Modify: `src/lib/blockTreeUtils.ts`
- Test: `tests/lib/blockTreeUtils.test.ts` (ajout en fin de fichier)

- [ ] **Step 1 : Écrire les tests qui échouent**

Ajouter à la fin de `tests/lib/blockTreeUtils.test.ts` (le fichier contient déjà `makeTree()` et les imports depuis `@/lib/blockTreeUtils` — compléter la liste d'imports avec `flattenTree, cloneBlockWithNewIds`) :

```ts
describe("flattenTree", () => {
    it("aplatit en ordre préfixe (ordre visuel)", () => {
        const tree = makeTree();
        expect(flattenTree(tree).map((b) => b.id)).toEqual([
            "t1", "cols", "colA", "img", "colB", "code1", "lst", "li1", "li2", "sub", "li3",
        ]);
    });

    it("exclut les types donnés sans perdre leurs enfants", () => {
        const tree = makeTree();
        const flat = flattenTree(tree, ["column"]).map((b) => b.id);
        expect(flat).toEqual(["t1", "cols", "img", "code1", "lst", "li1", "li2", "sub", "li3"]);
    });
});

describe("cloneBlockWithNewIds", () => {
    it("clone avec de nouveaux ids à tous les niveaux, original intact", () => {
        const tree = makeTree();
        const original = tree[1]; // cols
        const clone = cloneBlockWithNewIds(original);
        expect(clone.id).not.toBe(original.id);
        expect(clone.type).toBe("columns");
        expect(clone.children).toHaveLength(2);
        expect(clone.children![0].id).not.toBe(original.children![0].id);
        expect(clone.children![0].children![0].id).not.toBe("img");
        expect(clone.children![0].children![0].props).toEqual({ src: "/x.png" });
        expect(original.children![0].children![0].id).toBe("img");
    });

    it("tous les ids du clone sont nouveaux et uniques", () => {
        const tree = makeTree();
        const clone = cloneBlockWithNewIds(tree[2]); // lst
        const originalIds = new Set(flattenTree([tree[2]]).map((b) => b.id));
        const cloneIds = flattenTree([clone]).map((b) => b.id);
        expect(new Set(cloneIds).size).toBe(cloneIds.length);
        for (const id of cloneIds) {
            expect(originalIds.has(id)).toBe(false);
        }
    });
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

Run: `bun test tests/lib/blockTreeUtils.test.ts`
Expected: FAIL — `flattenTree is not a function` (ou erreur d'import équivalente)

- [ ] **Step 3 : Implémenter dans `src/lib/blockTreeUtils.ts`**

Ajouter en tête de fichier l'import uuid (le module reste sans JSX) :

```ts
import { v4 as uuidv4 } from "uuid";
```

Ajouter à la fin du fichier :

```ts
/** Aplatit l'arbre en parcours préfixe (= ordre visuel du canvas).
 *  `exclude` retire certains types du résultat (leurs enfants restent inclus) —
 *  utilisé pour sauter les cellules `column` lors de la navigation clavier. */
export function flattenTree(blocks: Block[], exclude: string[] = []): Block[] {
    const out: Block[] = [];
    for (const block of blocks) {
        if (!exclude.includes(block.type)) out.push(block);
        if (block.children) out.push(...flattenTree(block.children, exclude));
    }
    return out;
}

/** Clone profond d'un bloc avec de nouveaux ids à tous les niveaux. */
export function cloneBlockWithNewIds(block: Block): Block {
    return {
        ...block,
        id: uuidv4(),
        props: { ...block.props },
        ...(block.children ? { children: block.children.map(cloneBlockWithNewIds) } : {}),
    };
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

Run: `bun test tests/lib/blockTreeUtils.test.ts`
Expected: PASS (les 17 tests existants + 4 nouveaux)

- [ ] **Step 5 : Commit**

```bash
git add src/lib/blockTreeUtils.ts tests/lib/blockTreeUtils.test.ts
git commit -m "feat(builder): flattenTree + cloneBlockWithNewIds dans blockTreeUtils"
```

---

## Task 2 : `builderStore` — historique undo/redo + `duplicateBlock`

**Files:**
- Rewrite: `src/lib/store/builderStore.ts`
- Test: `tests/lib/builderStore.test.ts` (create)

**Sémantique de l'historique :**
- Chaque mutation de `blocks` empile l'état **précédent** dans `past` et vide `future`.
- Si la mutation est refusée par le helper (référence inchangée), rien n'est empilé.
- `updateBlock` coalesce : tant que `lastActionKey` vaut `update:<même id>`, on n'empile pas de nouveau pas (la rafale de frappes = un seul undo).
- `selectBlock` remet `lastActionKey` à `null` : changer de sélection rompt la coalescence.
- `setBlocks` (chargement initial) remet tout l'historique à zéro.
- `undo`/`redo` recalculent `selectedId` (désélection si le bloc n'existe plus dans l'état restauré) et mettent `isDirty: true`.

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `tests/lib/builderStore.test.ts` :

```ts
import { describe, it, expect, beforeEach } from "bun:test";
import { useBuilderStore } from "@/lib/store/builderStore";
import type { Block } from "@/types/CourseContent";

function textBlock(id: string, content = ""): Block {
    return { id, type: "text", props: { content } };
}

function getState() {
    return useBuilderStore.getState();
}

beforeEach(() => {
    getState().setBlocks([]);
    getState().selectBlock(null);
});

describe("historique — actions structurelles", () => {
    it("insertBlock empile un pas, undo le défait", () => {
        getState().insertBlock(textBlock("a"), null);
        expect(getState().blocks.map((b) => b.id)).toEqual(["a"]);
        getState().undo();
        expect(getState().blocks).toEqual([]);
    });

    it("redo rétablit l'action défaite", () => {
        getState().insertBlock(textBlock("a"), null);
        getState().undo();
        getState().redo();
        expect(getState().blocks.map((b) => b.id)).toEqual(["a"]);
    });

    it("une nouvelle action après undo vide le futur", () => {
        getState().insertBlock(textBlock("a"), null);
        getState().undo();
        getState().insertBlock(textBlock("b"), null);
        expect(getState().future).toEqual([]);
        getState().redo(); // no-op
        expect(getState().blocks.map((b) => b.id)).toEqual(["b"]);
    });

    it("undo sans historique est un no-op", () => {
        const before = getState().blocks;
        getState().undo();
        expect(getState().blocks).toBe(before);
    });

    it("deleteBlock + undo restaure le sous-arbre entier", () => {
        getState().setBlocks([
            { id: "lst", type: "list", props: { ordered: false }, children: [
                { id: "li1", type: "list-item", props: { text: "a" }, children: [] },
            ] },
        ]);
        getState().deleteBlock("lst");
        expect(getState().blocks).toEqual([]);
        getState().undo();
        expect(getState().blocks[0].children![0].id).toBe("li1");
    });

    it("moveBlock refusé n'empile pas d'historique", () => {
        getState().setBlocks([textBlock("a")]);
        getState().moveBlock("inexistant", null, 0);
        expect(getState().past).toEqual([]);
    });
});

describe("historique — coalescence des frappes", () => {
    it("des updateBlock successifs sur le même bloc = un seul pas", () => {
        getState().setBlocks([textBlock("a")]);
        getState().updateBlock("a", { content: "b" });
        getState().updateBlock("a", { content: "bo" });
        getState().updateBlock("a", { content: "bon" });
        expect(getState().past).toHaveLength(1);
        getState().undo();
        expect(getState().blocks[0].props.content).toBe("");
    });

    it("updateBlock sur deux blocs différents = deux pas", () => {
        getState().setBlocks([textBlock("a"), textBlock("b")]);
        getState().updateBlock("a", { content: "x" });
        getState().updateBlock("b", { content: "y" });
        expect(getState().past).toHaveLength(2);
    });

    it("selectBlock rompt la coalescence", () => {
        getState().setBlocks([textBlock("a")]);
        getState().updateBlock("a", { content: "x" });
        getState().selectBlock(null);
        getState().updateBlock("a", { content: "xy" });
        expect(getState().past).toHaveLength(2);
    });
});

describe("undo/redo — sélection et état", () => {
    it("setBlocks remet l'historique à zéro", () => {
        getState().insertBlock(textBlock("a"), null);
        getState().setBlocks([]);
        expect(getState().past).toEqual([]);
        expect(getState().future).toEqual([]);
    });

    it("undo désélectionne un bloc absent de l'état restauré", () => {
        getState().insertBlock(textBlock("a"), null);
        getState().selectBlock("a");
        getState().undo();
        expect(getState().selectedId).toBeNull();
    });

    it("undo et redo marquent isDirty", () => {
        getState().insertBlock(textBlock("a"), null);
        getState().markSaved();
        getState().undo();
        expect(getState().isDirty).toBe(true);
    });
});

describe("duplicateBlock", () => {
    it("insère un clone juste après l'original, avec de nouveaux ids, et le sélectionne", () => {
        getState().setBlocks([textBlock("a", "hello"), textBlock("b")]);
        getState().duplicateBlock("a");
        const blocks = getState().blocks;
        expect(blocks).toHaveLength(3);
        expect(blocks[0].id).toBe("a");
        expect(blocks[1].id).not.toBe("a");
        expect(blocks[1].props.content).toBe("hello");
        expect(blocks[2].id).toBe("b");
        expect(getState().selectedId).toBe(blocks[1].id);
    });

    it("refuse de dupliquer une column (invariant somme des spans)", () => {
        getState().setBlocks([
            { id: "cols", type: "columns", props: {}, children: [
                { id: "c1", type: "column", props: { span: 6 }, children: [] },
                { id: "c2", type: "column", props: { span: 6 }, children: [] },
            ] },
        ]);
        getState().duplicateBlock("c1");
        expect(getState().blocks[0].children).toHaveLength(2);
    });

    it("undo retire le clone", () => {
        getState().setBlocks([textBlock("a")]);
        getState().duplicateBlock("a");
        getState().undo();
        expect(getState().blocks.map((b) => b.id)).toEqual(["a"]);
    });
});

describe("limite d'historique", () => {
    it("past ne dépasse pas 100 entrées", () => {
        for (let i = 0; i < 120; i++) {
            getState().insertBlock(textBlock(`b${i}`), null);
        }
        expect(getState().past).toHaveLength(100);
    });
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

Run: `bun test tests/lib/builderStore.test.ts`
Expected: FAIL — `undo is not a function` / `past is undefined`

- [ ] **Step 3 : Réécrire `src/lib/store/builderStore.ts`**

Remplacer le fichier entier :

```ts
import { create } from "zustand";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    findParent,
    insertBlock as insertInTree,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
    moveBlock as moveInTree,
    cloneBlockWithNewIds,
} from "@/lib/blockTreeUtils";

const HISTORY_LIMIT = 100;

interface BuilderStore {
    blocks: Block[];
    selectedId: string | null;
    isDirty: boolean;
    /** Historique undo/redo : snapshots de `blocks`. L'arbre étant immuable
     *  avec structural sharing, un snapshot ne coûte que des références. */
    past: Block[][];
    future: Block[][];
    /** Clé de la dernière mutation — coalesce les frappes successives
     *  d'un même champ en un seul pas d'historique. */
    lastActionKey: string | null;
    setBlocks: (blocks: Block[]) => void;
    selectBlock: (id: string | null) => void;
    updateBlock: (id: string, props: Record<string, unknown>) => void;
    updateChildren: (id: string, children: Block[]) => void;
    insertBlock: (block: Block, parentId: string | null, index?: number) => void;
    deleteBlock: (id: string) => void;
    moveBlock: (id: string, targetParentId: string | null, targetIndex: number) => void;
    duplicateBlock: (id: string) => void;
    undo: () => void;
    redo: () => void;
    markSaved: () => void;
}

/** Empile l'état courant dans `past` et vide `future`. Si `actionKey` est
 *  identique à celui de la mutation précédente (rafale de frappes), ne
 *  ré-empile pas : le pas existant couvre déjà la rafale. */
function pushHistory(
    state: Pick<BuilderStore, "blocks" | "past" | "lastActionKey">,
    actionKey: string | null = null
): Pick<BuilderStore, "past" | "future" | "lastActionKey"> {
    if (actionKey !== null && actionKey === state.lastActionKey) {
        return { past: state.past, future: [], lastActionKey: actionKey };
    }
    return {
        past: [...state.past, state.blocks].slice(-HISTORY_LIMIT),
        future: [],
        lastActionKey: actionKey,
    };
}

export const useBuilderStore = create<BuilderStore>()((set) => ({
    blocks: [],
    selectedId: null,
    isDirty: false,
    past: [],
    future: [],
    lastActionKey: null,

    setBlocks: (blocks) =>
        set({ blocks, isDirty: false, past: [], future: [], lastActionKey: null }),

    // Changer de sélection rompt la coalescence : la prochaine frappe
    // démarre un nouveau pas d'historique.
    selectBlock: (id) => set({ selectedId: id, lastActionKey: null }),

    updateBlock: (id, props) =>
        set((state) => {
            const blocks = updateBlockProps(state.blocks, id, props);
            if (blocks === state.blocks) return state;
            return { ...pushHistory(state, `update:${id}`), blocks, isDirty: true };
        }),

    updateChildren: (id, children) =>
        set((state) => {
            const blocks = updateBlockChildren(state.blocks, id, children);
            if (blocks === state.blocks) return state;
            return { ...pushHistory(state), blocks, isDirty: true };
        }),

    insertBlock: (block, parentId, index) =>
        set((state) => {
            const idx = index ?? Number.MAX_SAFE_INTEGER; // clampé par le helper
            const blocks = insertInTree(state.blocks, block, parentId, idx);
            if (blocks === state.blocks) return state;
            return { ...pushHistory(state), blocks, isDirty: true };
        }),

    deleteBlock: (id) =>
        set((state) => {
            const blocks = removeBlock(state.blocks, id);
            if (blocks === state.blocks) return state;
            // Le bloc sélectionné peut être dans le sous-arbre supprimé.
            const selectedId = state.selectedId && findBlock(blocks, state.selectedId)
                ? state.selectedId
                : null;
            return { ...pushHistory(state), blocks, selectedId, isDirty: true };
        }),

    moveBlock: (id, targetParentId, targetIndex) =>
        set((state) => {
            const blocks = moveInTree(state.blocks, id, targetParentId, targetIndex);
            if (blocks === state.blocks) return state; // déplacement refusé
            return { ...pushHistory(state), blocks, isDirty: true };
        }),

    duplicateBlock: (id) =>
        set((state) => {
            const original = findBlock(state.blocks, id);
            const loc = findParent(state.blocks, id);
            // column : cellule structurelle — la dupliquer casserait
            // l'invariant somme des spans = 12.
            if (!original || !loc || original.type === "column") return state;
            const clone = cloneBlockWithNewIds(original);
            const blocks = insertInTree(state.blocks, clone, loc.parent?.id ?? null, loc.index + 1);
            return { ...pushHistory(state), blocks, selectedId: clone.id, isDirty: true };
        }),

    undo: () =>
        set((state) => {
            const prev = state.past[state.past.length - 1];
            if (!prev) return state;
            const selectedId = state.selectedId && findBlock(prev, state.selectedId)
                ? state.selectedId
                : null;
            return {
                blocks: prev,
                past: state.past.slice(0, -1),
                future: [state.blocks, ...state.future],
                selectedId,
                isDirty: true,
                lastActionKey: null,
            };
        }),

    redo: () =>
        set((state) => {
            const next = state.future[0];
            if (!next) return state;
            const selectedId = state.selectedId && findBlock(next, state.selectedId)
                ? state.selectedId
                : null;
            return {
                blocks: next,
                past: [...state.past, state.blocks],
                future: state.future.slice(1),
                selectedId,
                isDirty: true,
                lastActionKey: null,
            };
        }),

    markSaved: () => set({ isDirty: false }),
}));
```

- [ ] **Step 4 : Vérifier que les tests passent**

Run: `bun test tests/lib/builderStore.test.ts && bun test`
Expected: PASS, et aucune régression sur la suite complète (104 tests existants + nouveaux)

- [ ] **Step 5 : Vérifier compile + lint**

Run: `bunx tsc --noEmit && bun run lint`
Expected: 0 erreur (l'interface du store est étendue, pas modifiée : les consommateurs existants — `PropsPanel`, `BuilderCanvas`, `BuilderPage`, `BlockTree`, `ColumnsEditor`, `AiAssistantPanel` — compilent sans changement)

- [ ] **Step 6 : Commit**

```bash
git add src/lib/store/builderStore.ts tests/lib/builderStore.test.ts
git commit -m "feat(builder): historique undo/redo + duplicateBlock dans le store"
```

---

## Task 3 : Hook `useBuilderShortcuts` + `data-block-id` dans `BlockTree`

**Files:**
- Create: `src/hook/useBuilderShortcuts.ts`
- Modify: `src/components/builder/BlockTree.tsx` (2 lignes — attribut `data-block-id`)

**Règles de dispatch clavier :**

| Raccourci | Action | Garde |
|---|---|---|
| Ctrl/Cmd+S | `onSave()` si `isDirty` | `preventDefault` **toujours** (même dans un champ) |
| Ctrl/Cmd+Z | `undo()` | pas dans un champ, pas pendant un drag |
| Ctrl/Cmd+Y ou Ctrl/Cmd+Shift+Z | `redo()` | idem |
| Ctrl/Cmd+D | `duplicateBlock(selectedId)` | idem + un bloc sélectionné |
| Delete / Backspace | `deleteBlock(selectedId)` | idem + un bloc sélectionné |
| Escape | `selectBlock(null)` | pas dans un champ (l'`InlineTextEditor` gère déjà son propre Escape) |
| ↑ / ↓ | sélection précédente/suivante (ordre visuel, `column` exclus) + scrollIntoView | pas dans un champ, pas pendant un drag |

- [ ] **Step 1 : Créer `src/hook/useBuilderShortcuts.ts`**

```ts
"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { flattenTree } from "@/lib/blockTreeUtils";

interface UseBuilderShortcutsOptions {
    /** Déclenche la sauvegarde (équivalent au bouton Sauvegarder). */
    onSave: () => void;
    /** true pendant un drag dnd-kit : désactive undo/delete/flèches. */
    dragActive: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** Raccourcis clavier globaux du builder. Le state est lu via
 *  useBuilderStore.getState() dans le handler : pas de re-abonnement,
 *  l'écouteur reste stable tant que onSave/dragActive ne changent pas. */
export function useBuilderShortcuts({ onSave, dragActive }: UseBuilderShortcutsOptions) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const mod = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();
            const store = useBuilderStore.getState();

            // Ctrl+S : toujours intercepté, même dans un champ — sinon le
            // navigateur ouvre « Enregistrer la page ».
            if (mod && key === "s") {
                e.preventDefault();
                if (store.isDirty) onSave();
                return;
            }

            // Dans un champ de saisie : laisser le undo/redo natif du champ
            // et la frappe normale (Delete, flèches, Escape de l'éditeur inline).
            if (isEditableTarget(e.target)) return;
            if (dragActive) return;

            if (mod && key === "z" && !e.shiftKey) {
                e.preventDefault();
                store.undo();
                return;
            }
            if (mod && (key === "y" || (key === "z" && e.shiftKey))) {
                e.preventDefault();
                store.redo();
                return;
            }
            if (mod && key === "d") {
                if (!store.selectedId) return;
                e.preventDefault();
                store.duplicateBlock(store.selectedId);
                return;
            }
            if ((e.key === "Delete" || e.key === "Backspace") && store.selectedId) {
                e.preventDefault();
                store.deleteBlock(store.selectedId);
                return;
            }
            if (e.key === "Escape" && store.selectedId) {
                store.selectBlock(null);
                return;
            }
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                const list = flattenTree(store.blocks, ["column"]);
                if (list.length === 0) return;
                e.preventDefault();
                const idx = store.selectedId
                    ? list.findIndex((b) => b.id === store.selectedId)
                    : -1;
                const next = e.key === "ArrowDown"
                    ? list[Math.min(idx + 1, list.length - 1)]
                    : list[Math.max(idx - 1, 0)];
                store.selectBlock(next.id);
                document
                    .querySelector(`[data-block-id="${next.id}"]`)
                    ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSave, dragActive]);
}
```

- [ ] **Step 2 : Ajouter `data-block-id` dans `BlockTree.tsx`**

Dans `SortableBlock`, les **deux** branches de retour qui posent `ref={setNodeRef}` reçoivent l'attribut. Branche `column` :

```tsx
<div ref={setNodeRef} style={style} data-block-id={block.id} className={[wrapperCls, isDropTargetBlocked ? "cursor-not-allowed" : ""].filter(Boolean).join(" ")}>
```

Branche normale :

```tsx
<div ref={setNodeRef} style={style} data-block-id={block.id} className={isDropTargetBlocked ? "cursor-not-allowed" : undefined}>
```

(et la branche `!def` « Bloc inconnu » : `<div ref={setNodeRef} style={style} data-block-id={block.id} className={wrapperCls}>`).

- [ ] **Step 3 : Vérifier compile + lint**

Run: `bunx tsc --noEmit && bun run lint`
Expected: 0 erreur (le hook n'est pas encore consommé — c'est la Task 4 ; si ESLint signale un export inutilisé, ignorer, la règle n'est pas activée dans ce repo)

- [ ] **Step 4 : Commit**

```bash
git add src/hook/useBuilderShortcuts.ts src/components/builder/BlockTree.tsx
git commit -m "feat(builder): hook useBuilderShortcuts + ancres data-block-id"
```

---

## Task 4 : Branchement dans `BuilderPage` + boutons Annuler/Rétablir

**Files:**
- Modify: `src/components/builder/BuilderPage.tsx`

- [ ] **Step 1 : Imports et abonnements store**

Ajouter aux imports lucide existants (ligne 6) : `Undo2, Redo2`.
Ajouter : `import { useBuilderShortcuts } from "@/hook/useBuilderShortcuts";`

Étendre le destructuring du store (actuellement `const { blocks, isDirty, setBlocks, markSaved, insertBlock, selectBlock, moveBlock } = useBuilderStore();`) :

```tsx
const { blocks, isDirty, setBlocks, markSaved, insertBlock, selectBlock, moveBlock, undo, redo, past, future } =
    useBuilderStore();
const canUndo = past.length > 0;
const canRedo = future.length > 0;
```

- [ ] **Step 2 : Garde anti-réentrance dans `handleSave`**

En tête de `handleSave` (le bouton est désactivé quand `!isDirty || saving`, mais le raccourci Ctrl+S ne passe pas par le bouton) :

```tsx
async function handleSave() {
    if (saving || !isDirty) return;
    setSaving(true);
    // ...reste inchangé
```

- [ ] **Step 3 : Brancher le hook**

Après les déclarations de state du composant (après `const router = useRouter();`) :

```tsx
useBuilderShortcuts({
    onSave: () => void handleSave(),
    dragActive: activeDragDef !== null || activeBlock !== null,
});
```

- [ ] **Step 4 : Boutons Annuler/Rétablir dans la toolbar**

Dans la zone droite de la toolbar (`<div className="flex items-center gap-2 shrink-0">`), **avant** le span `isDirty` :

```tsx
<div className="flex items-center">
    <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        className="h-8 w-8 p-0 text-bridge-500 dark:text-bridge-400 hover:text-brand-primary disabled:opacity-30"
        title="Annuler (Ctrl+Z)"
        aria-label="Annuler la dernière action"
    >
        <Undo2 className="w-3.5 h-3.5" />
    </Button>
    <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        className="h-8 w-8 p-0 text-bridge-500 dark:text-bridge-400 hover:text-brand-primary disabled:opacity-30"
        title="Rétablir (Ctrl+Y)"
        aria-label="Rétablir l'action annulée"
    >
        <Redo2 className="w-3.5 h-3.5" />
    </Button>
</div>
```

- [ ] **Step 5 : Vérifier compile + lint + tests**

Run: `bunx tsc --noEmit && bun run lint && bun test`
Expected: 0 erreur, tous les tests verts

- [ ] **Step 6 : Commit**

```bash
git add src/components/builder/BuilderPage.tsx
git commit -m "feat(builder): raccourcis clavier branchés + boutons Annuler/Rétablir dans la toolbar"
```

---

## Task 5 : Vérification manuelle complète

**Gate : ne pas considérer le chantier terminé tant que les 10 scénarios ne passent pas.**

- [ ] **Step 1 : `bun dev`, ouvrir le builder, dérouler les scénarios**

1. **Ctrl+S** avec modifications → sauvegarde (toast), pas de boîte de dialogue navigateur. Sans modification → rien ne se passe (et pas de boîte navigateur non plus). Ctrl+S pendant la frappe dans un champ du PropsPanel → sauvegarde aussi.
2. **Ctrl+Z** après : insertion de bloc, suppression, déplacement DnD, changement de preset colonnes → chaque action se défait correctement, en une fois.
3. **Saisie inline** (double-clic sur un texte, taper plusieurs caractères, sortir du champ) puis Ctrl+Z **hors champ** → toute la rafale se défait en un seul pas.
4. **Ctrl+Z dans un champ** (PropsPanel ou éditeur inline) → c'est le undo natif du champ qui agit, pas celui du builder.
5. **Ctrl+Y et Ctrl+Shift+Z** → rétablissent. Une nouvelle action après un undo → Ctrl+Y ne fait plus rien (futur vidé).
6. **Delete / Backspace** sur un bloc sélectionné → supprimé. Pendant la frappe dans un champ → le texte s'efface normalement, le bloc reste.
7. **Escape** → désélectionne (le panneau repasse en mode palette).
8. **↑/↓** → la sélection parcourt l'ordre visuel, descend dans les conteneurs, saute les `column`, scrolle si besoin. ↓ sans sélection → sélectionne le premier bloc.
9. **Ctrl+D** sur un bloc avec enfants (une `list` complète) → clone inséré juste en dessous, sélectionné ; modifier le clone ne modifie pas l'original. Sauvegarder → pas de 422 (ids uniques).
10. **Boutons toolbar** : grisés au chargement, actifs après une action, re-grisés après les undo correspondants. Undo/redo pendant un drag → ignoré.

- [ ] **Step 2 : Vérifications finales**

```bash
bun test          # suite complète verte
bun run lint      # 0 erreur
bunx tsc --noEmit # 0 erreur
```

- [ ] **Step 3 : Commit final (si des ajustements ont eu lieu en Step 1)**

```bash
git add -A
git commit -m "fix(builder): ajustements raccourcis clavier après vérification manuelle"
```

---

## Couverture demande → tasks

| Demande | Task(s) |
|---|---|
| Ctrl+Z / Ctrl+Y (+ Ctrl+Shift+Z) — undo/redo | 2 (historique store), 3 (raccourcis), 4 (boutons toolbar) |
| Ctrl+S — sauvegarder | 3 (raccourci), 4 (garde handleSave) |
| Delete/Backspace — supprimer le bloc sélectionné | 3 |
| Escape — désélectionner | 3 |
| Ctrl+D — dupliquer (pertinent : item #9 de la roadmap) | 1 (clone), 2 (action store), 3 (raccourci) |
| ↑/↓ — navigation entre blocs (pertinent : item #6 de la roadmap) | 1 (flattenTree), 3 (raccourci + scroll) |
| Garde champs de saisie / drag actif | 3 |
