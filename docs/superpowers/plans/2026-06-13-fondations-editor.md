# Plan A — Fondations : bloc `section`, suppression DnD & IA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Préparer la base du nouvel éditeur — ajouter le bloc `section` auto-niveau, supprimer `heading`, ajouter undo/redo dans le store, et purger tout le code DnD + IA Ollama.

**Architecture:** Nettoyage chirurgical des 3 couches (schémas → registry → renderer) + remplacement du store Zustand par une version avec historique manuel. `BuilderPage` réduit à un stub vide en attendant Plan C.

**Tech Stack:** TypeScript strict, Zustand, Next.js App Router. Pas de nouvelle dépendance.

---

## Cartographie des fichiers

| Fichier | Action |
|---------|--------|
| `src/lib/blockSchemas.ts` | Modifier — ajouter `section`, supprimer `heading` |
| `src/lib/blockRegistry.tsx` | Modifier — idem + définition render du bloc `section` |
| `src/components/builder/BlockRenderer.tsx` | Modifier — ajouter tracking de profondeur |
| `src/lib/store/builderStore.ts` | Modifier — ajouter `_history`, `_future`, `undo`, `redo`, supprimer `moveBlock` |
| `src/components/builder/DynamicPropsEditor.tsx` | Modifier — retirer `InlineTextEditor`, remplacer par `Textarea` |
| `src/components/builder/BuilderPage.tsx` | Réécrire en stub minimal |
| `src/components/builder/BuilderPageDynamic.tsx` | Modifier — simplifier le skeleton |
| `src/components/builder/AiAssistantPanel.tsx` | **Supprimer** |
| `src/components/builder/StandaloneChatPanel.tsx` | **Supprimer** |
| `src/lib/hooks/useChatSession.ts` | **Supprimer** |
| `src/app/api/admin/content/ai-assist-local/route.ts` | **Supprimer** |
| `src/app/api/admin/content/ai-assist/route.ts` | **Supprimer** |
| `src/app/api/admin/content/ai-status/route.ts` | **Supprimer** |
| `src/app/api/admin/content/ai-chat-history/route.ts` | **Supprimer** |
| `src/app/admin/chat/` | **Supprimer** (tout le répertoire) |
| `src/components/builder/BuilderCanvas.tsx` | **Supprimer** |
| `src/components/builder/BlockPalette.tsx` | **Supprimer** |
| `src/components/builder/BlockPaletteGrid.tsx` | **Supprimer** |
| `src/components/builder/BlockTree.tsx` | **Supprimer** |
| `src/components/builder/ColumnsEditor.tsx` | **Supprimer** |
| `src/components/builder/PropsPanel.tsx` | **Supprimer** |
| `src/components/builder/InlineTextEditor.tsx` | **Supprimer** |

---

### Task 1 : Schémas — ajouter `section`, supprimer `heading`

**Files:**
- Modify: `src/lib/blockSchemas.ts`

- [ ] **Étape 1 : Modifier `blockPropsSchemas`**

Dans `src/lib/blockSchemas.ts`, ligne 34 à 42, remplacer le bloc `"heading"` par `"section"` :

```typescript
// AVANT (supprimer) :
"heading": z.object({
    level: z.coerce.number().refine((v) => v === 2 || v === 3, {
        message: "level doit être 2 ou 3",
    }),
    text: z.string(),
}),

// APRÈS (ajouter à la place, même position dans l'objet) :
"section": z.object({ title: z.string() }),
```

- [ ] **Étape 2 : Ajouter la règle conteneur `section`**

Dans `containerRules` (ligne 102), ajouter `"section"` avant la fermeture `}` :

```typescript
"section": { allowedChildren: "any" },
```

Le bloc final de `containerRules` doit être :

```typescript
export const containerRules: Record<string, ContainerRule> = {
    "columns": { allowedChildren: ["column"], allowedParents: [null] },
    "column": { allowedChildren: "any", allowedParents: ["columns"] },
    "list": { allowedChildren: ["list-item"] },
    "list-item": { allowedChildren: "any", allowedParents: ["list"] },
    "callout": { allowedChildren: "any" },
    "collapsible": { allowedChildren: "any" },
    "section": { allowedChildren: "any" },
};
```

- [ ] **Étape 3 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Étape 4 : Commit**

```powershell
git add src/lib/blockSchemas.ts
git commit -m "feat(blocks): ajouter bloc section, supprimer heading des schémas"
```

---

### Task 2 : Registry — ajouter `section`, supprimer `heading`

**Files:**
- Modify: `src/lib/blockRegistry.tsx`

- [ ] **Étape 1 : Supprimer la définition `heading`**

Dans `blockDefinitions` (ligne 66), supprimer l'entrée complète (lignes 89–110) :

```typescript
// Supprimer tout ce bloc :
{
    type: "heading",
    label: "Titre",
    defaultProps: { level: 2, text: "" },
    schema: z.object({
        level: z.union([z.literal(2), z.literal(3)]),
        text: z.string().min(1),
    }),
    fields: [
        { key: "level", label: "Niveau", type: "select", options: ["2", "3"] },
        {
            key: "text",
            label: "Texte",
            type: "text",
            inlineMarkdown: true,
            placeholder: "Transformer un tableau avec `map`",
        },
    ],
    render: ({ level, text }: BlockRenderProps) => (
        <Heading level={Number(level) as 2 | 3}>{renderInline(String(text ?? ""))}</Heading>
    ),
    inlineEditField: "text",
},
```

- [ ] **Étape 2 : Ajouter la définition `section` juste avant `"list"` (en tête de `blockDefinitions`)**

Ajouter après la définition `"text"` (qui se termine à la ligne 87) :

```typescript
{
    type: "section",
    label: "Partie",
    defaultProps: { title: "" },
    schema: z.object({ title: z.string() }),
    fields: [
        { key: "title", label: "Titre", type: "text", placeholder: "A — Introduction" },
    ],
    container: containerRules["section"],
    initialChildren: () => [
        { id: uuidv4(), type: "text", props: { content: "" }, children: [] },
    ],
    render: ({ title, children, depth }: BlockRenderProps) => {
        const level = Math.min(2 + (Number(depth) || 0), 4) as 2 | 3 | 4;
        return (
            <section className="flex flex-col gap-6">
                <Heading level={level}>{String(title ?? "")}</Heading>
                {children}
            </section>
        );
    },
    inlineEditField: "title",
},
```

Note : `depth` est injecté par `BlockItem` dans `BlockRenderer.tsx` (Task 3). Il passe via les props anonymes `[key: string]: unknown` de `BlockRenderProps` — aucune modification d'interface requise.

- [ ] **Étape 3 : Vérifier TypeScript + ESLint**

```powershell
bunx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Étape 4 : Commit**

```powershell
git add src/lib/blockRegistry.tsx
git commit -m "feat(blocks): définition du bloc section dans le registry"
```

---

### Task 3 : BlockRenderer — rendu depth-aware

**Files:**
- Modify: `src/components/builder/BlockRenderer.tsx`

La version actuelle du fichier (`src/components/builder/BlockRenderer.tsx`) est :

```tsx
"use client";

import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

function BlockItem({ block }: { block: Block }) {
    const def = getBlockDefinition(block.type);
    if (!def) return <div>Bloc inconnu : {block.type}</div>;
    const Render = def.render;
    const children = block.children?.map((child) => <BlockItem key={child.id} block={child} />);
    return <Render {...block.props}>{children}</Render>;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    return <article className="flex flex-col gap-6">{blocks.map(...)}</article>;
}
```

- [ ] **Étape 1 : Réécrire `BlockRenderer.tsx` avec tracking de profondeur**

Remplacer le contenu complet de `src/components/builder/BlockRenderer.tsx` par :

```tsx
"use client";

import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

function BlockItem({ block, depth = 0 }: { block: Block; depth?: number }) {
    const def = getBlockDefinition(block.type);
    if (!def) {
        return (
            <div className="border border-dashed rounded p-3 text-sm text-muted-foreground">
                Bloc inconnu : {block.type}
            </div>
        );
    }

    const Render = def.render;
    const childDepth = block.type === "section" ? depth + 1 : depth;
    const children = block.children?.map((child) => (
        <BlockItem key={child.id} block={child} depth={childDepth} />
    ));

    return <Render {...block.props} depth={depth}>{children}</Render>;
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

- [ ] **Étape 2 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Étape 3 : Commit**

```powershell
git add src/components/builder/BlockRenderer.tsx
git commit -m "feat(renderer): rendu depth-aware pour le bloc section"
```

---

### Task 4 : Store — ajouter undo/redo, supprimer moveBlock

**Files:**
- Modify: `src/lib/store/builderStore.ts`

- [ ] **Étape 1 : Réécrire `builderStore.ts`**

Remplacer le contenu complet de `src/lib/store/builderStore.ts` par :

```typescript
import { create } from "zustand";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    insertBlock as insertInTree,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
} from "@/lib/blockTreeUtils";

const MAX_HISTORY = 50;

interface BuilderStore {
    blocks: Block[];
    selectedId: string | null;
    isDirty: boolean;
    /** Snapshots passés — index 0 = le plus ancien. */
    _history: Block[][];
    /** Snapshots futurs (après undo) — index 0 = le plus proche. */
    _future: Block[][];

    setBlocks: (blocks: Block[]) => void;
    selectBlock: (id: string | null) => void;
    updateBlock: (id: string, props: Record<string, unknown>) => void;
    updateChildren: (id: string, children: Block[]) => void;
    insertBlock: (block: Block, parentId: string | null, index?: number) => void;
    deleteBlock: (id: string) => void;
    undo: () => void;
    redo: () => void;
    markSaved: () => void;
}

function pushHistory(
    current: Block[],
    history: Block[][],
): Block[][] {
    return [...history, current].slice(-MAX_HISTORY);
}

export const useBuilderStore = create<BuilderStore>()((set) => ({
    blocks: [],
    selectedId: null,
    isDirty: false,
    _history: [],
    _future: [],

    setBlocks: (blocks) =>
        set({ blocks, isDirty: false, _history: [], _future: [] }),

    selectBlock: (id) => set({ selectedId: id }),

    updateBlock: (id, props) =>
        set((state) => ({
            blocks: updateBlockProps(state.blocks, id, props),
            _history: pushHistory(state.blocks, state._history),
            _future: [],
            isDirty: true,
        })),

    updateChildren: (id, children) =>
        set((state) => ({
            blocks: updateBlockChildren(state.blocks, id, children),
            _history: pushHistory(state.blocks, state._history),
            _future: [],
            isDirty: true,
        })),

    insertBlock: (block, parentId, index) =>
        set((state) => ({
            blocks: insertInTree(state.blocks, block, parentId, index ?? Number.MAX_SAFE_INTEGER),
            _history: pushHistory(state.blocks, state._history),
            _future: [],
            isDirty: true,
        })),

    deleteBlock: (id) =>
        set((state) => {
            const blocks = removeBlock(state.blocks, id);
            const selectedId =
                state.selectedId && findBlock(blocks, state.selectedId)
                    ? state.selectedId
                    : null;
            return {
                blocks,
                selectedId,
                _history: pushHistory(state.blocks, state._history),
                _future: [],
                isDirty: true,
            };
        }),

    undo: () =>
        set((state) => {
            if (state._history.length === 0) return state;
            const _history = [...state._history];
            const blocks = _history.pop()!;
            return {
                blocks,
                _history,
                _future: [...state._future, state.blocks],
                isDirty: true,
            };
        }),

    redo: () =>
        set((state) => {
            if (state._future.length === 0) return state;
            const _future = [...state._future];
            const blocks = _future.pop()!;
            return {
                blocks,
                _future,
                _history: [...state._history, state.blocks],
                isDirty: true,
            };
        }),

    markSaved: () => set({ isDirty: false }),
}));
```

Note : `moveBlock` est retiré — le DnD est supprimé.

- [ ] **Étape 2 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

Des erreurs vont apparaître pour les composants qui importent `moveBlock` — elles seront résolues à la Task 7 (stub BuilderPage).

- [ ] **Étape 3 : Commit**

```powershell
git add src/lib/store/builderStore.ts
git commit -m "feat(store): undo/redo avec historique manuel, suppression moveBlock"
```

---

### Task 5 : Supprimer les fichiers IA / Ollama

**Files:**
- Delete : 7 fichiers / 1 répertoire

- [ ] **Étape 1 : Supprimer les fichiers IA**

```powershell
Remove-Item -Force "src/components/builder/AiAssistantPanel.tsx"
Remove-Item -Force "src/components/builder/StandaloneChatPanel.tsx"
Remove-Item -Force "src/lib/hooks/useChatSession.ts"
Remove-Item -Force "src/app/api/admin/content/ai-assist-local/route.ts"
Remove-Item -Force "src/app/api/admin/content/ai-assist/route.ts"
Remove-Item -Force "src/app/api/admin/content/ai-status/route.ts"
Remove-Item -Force "src/app/api/admin/content/ai-chat-history/route.ts"
Remove-Item -Recurse -Force "src/app/admin/chat"
```

- [ ] **Étape 2 : Vérifier que les répertoires vides des routes API peuvent être supprimés**

```powershell
# Nettoyer les répertoires devenus vides
Get-ChildItem "src/app/api/admin/content" -Directory | Where-Object { (Get-ChildItem $_.FullName -Recurse).Count -eq 0 } | Remove-Item -Recurse -Force
```

- [ ] **Étape 3 : Commit**

```powershell
git add -A
git commit -m "chore: supprimer assistant IA Ollama et routes associées"
```

---

### Task 6 : Supprimer les composants DnD, mettre à jour DynamicPropsEditor

**Files:**
- Delete : 7 composants
- Modify: `src/components/builder/DynamicPropsEditor.tsx`

- [ ] **Étape 1 : Supprimer les composants DnD**

```powershell
Remove-Item -Force "src/components/builder/BuilderCanvas.tsx"
Remove-Item -Force "src/components/builder/BlockPalette.tsx"
Remove-Item -Force "src/components/builder/BlockPaletteGrid.tsx"
Remove-Item -Force "src/components/builder/BlockTree.tsx"
Remove-Item -Force "src/components/builder/ColumnsEditor.tsx"
Remove-Item -Force "src/components/builder/PropsPanel.tsx"
Remove-Item -Force "src/components/builder/InlineTextEditor.tsx"
```

- [ ] **Étape 2 : Mettre à jour `DynamicPropsEditor.tsx`**

Lire `src/components/builder/DynamicPropsEditor.tsx`, puis :

1. Supprimer l'import `InlineTextEditor` (ressemble à `import { InlineTextEditor } from "./InlineTextEditor";`)
2. Dans le bloc qui gère `field.inlineMarkdown === true`, remplacer `<InlineTextEditor ...>` par `<Textarea ...>` en utilisant l'import shadcn déjà présent.

Le fragment à remplacer ressemble à :
```tsx
// AVANT (supprimer ou remplacer) :
if (field.inlineMarkdown) {
    return <InlineTextEditor value={...} onChange={...} />;
}
```

Remplacer par :
```tsx
// APRÈS :
// (tomber dans le cas textarea standard — supprimer la condition inlineMarkdown)
```

Concrètement : supprimer la branche `inlineMarkdown` dans `DynamicPropsEditor`. Les champs `type: "textarea"` avec `inlineMarkdown: true` seront simplement rendus comme `<Textarea>` standard.

- [ ] **Étape 3 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

Des erreurs peuvent subsister sur `BuilderPage.tsx` — résolues à la Task 7.

- [ ] **Étape 4 : Commit**

```powershell
git add -A
git commit -m "chore: supprimer composants DnD, simplifier DynamicPropsEditor"
```

---

### Task 7 : Stub BuilderPage + simplifier BuilderPageDynamic

**Files:**
- Rewrite: `src/components/builder/BuilderPage.tsx`
- Modify: `src/components/builder/BuilderPageDynamic.tsx`

- [ ] **Étape 1 : Réécrire `BuilderPage.tsx` en stub**

Remplacer le contenu complet de `src/components/builder/BuilderPage.tsx` par :

```tsx
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/CourseContent";

interface BuilderPageProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    moduleTitle: string;
    sectionTitle: string;
    initialBlocks: Block[];
    source: "file" | "db";
}

export function BuilderPage({ moduleTitle, sectionTitle, contentType, source }: BuilderPageProps) {
    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden">
            <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm">
                <Link
                    href="/admin"
                    className="flex items-center gap-1 text-xs font-medium text-bridge-500 dark:text-bridge-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors shrink-0"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Admin
                </Link>
                <div className="w-px h-8 bg-bridge-400/25 dark:bg-bridge-500/30 shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-xs leading-none">
                        <span className="font-semibold text-bridge-700 dark:text-bridge-200 truncate max-w-[180px]">
                            {moduleTitle}
                        </span>
                        <ChevronRight className="w-3 h-3 shrink-0 text-bridge-400/50" />
                        <span className="text-bridge-500 dark:text-bridge-400 truncate max-w-[220px]">
                            {sectionTitle}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 leading-none">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-primary">
                            {contentType}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] font-mono h-4 px-1.5 rounded",
                                source === "db"
                                    ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                                    : "border-bridge-400/50 text-bridge-500 dark:text-bridge-400"
                            )}
                        >
                            {source === "db" ? "DB" : "fichier"}
                        </Badge>
                    </div>
                </div>
            </header>
            <div className="flex-1 flex items-center justify-center text-bridge-500 dark:text-bridge-400 text-sm">
                Éditeur en cours de migration — utilisez le MCP server ou attendez le fallback web.
            </div>
        </div>
    );
}
```

- [ ] **Étape 2 : Lire `BuilderPageDynamic.tsx` et simplifier le skeleton**

Lire `src/components/builder/BuilderPageDynamic.tsx`. Adapter `BuilderSkeleton` pour correspondre au nouveau layout minimal (header + zone centrale). Voici le fichier complet attendu :

```tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { BuilderPage as BuilderPageType } from "@/components/builder/BuilderPage";

function BuilderSkeleton() {
    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden animate-pulse">
            <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90">
                <div className="h-3.5 w-10 rounded bg-bridge-300/60 dark:bg-bridge-700/50" />
                <div className="w-px h-8 bg-bridge-400/25 shrink-0" />
                <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-36 rounded bg-bridge-300/60 dark:bg-bridge-700/50" />
                    <div className="h-2.5 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/40" />
                </div>
            </header>
            <div className="flex-1 bg-bridge-50/30 dark:bg-bridge-900/20" />
        </div>
    );
}

const BuilderPage = dynamic(
    () => import("@/components/builder/BuilderPage").then((m) => m.BuilderPage),
    { ssr: false, loading: () => <BuilderSkeleton /> }
);

export function BuilderPageDynamic(props: ComponentProps<typeof BuilderPageType>) {
    return <BuilderPage {...props} />;
}
```

- [ ] **Étape 3 : Vérifier TypeScript + build**

```powershell
bunx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Étape 4 : Commit**

```powershell
git add src/components/builder/BuilderPage.tsx src/components/builder/BuilderPageDynamic.tsx
git commit -m "feat(builder): stub BuilderPage en attendant le fallback web (Plan C)"
```

---

### Task 8 : Supprimer @dnd-kit et vérifier le build complet

**Files:**
- `package.json` (indirect — via `bun remove`)
- `bun.lock` (indirect)

- [ ] **Étape 1 : Lister les paquets @dnd-kit installés**

```powershell
bun pm ls | Select-String "dnd-kit"
```

Note les paquets présents (typiquement `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`).

- [ ] **Étape 2 : Supprimer les paquets @dnd-kit**

```powershell
bun remove @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Si certains ne sont pas installés, `bun remove` le signale sans erreur bloquante.

- [ ] **Étape 3 : Vérifier TypeScript global**

```powershell
bunx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Étape 4 : Lancer le build Next.js**

```powershell
bun run build
```

Expected : build réussi, aucune erreur de compilation. Des warnings Next.js sur les images ou les metadata sont acceptables.

- [ ] **Étape 5 : Commit**

```powershell
git add package.json bun.lock
git commit -m "chore: supprimer @dnd-kit/* — DnD retiré du projet"
```

---

## Self-Review

### Couverture spec
- [x] Bloc `section` avec heading auto-niveau (depth 0→2, 1→3, 2→4) — Tasks 1-3
- [x] Suppression `heading` — Tasks 1-2
- [x] Undo/redo (Ctrl+Z/Y) dans le store — Task 4
- [x] Suppression IA Ollama — Task 5
- [x] Suppression DnD — Tasks 6-8
- [x] `DynamicPropsEditor` découplé de `InlineTextEditor` — Task 6
- [x] `BuilderPage` stub (migration en cours) — Task 7
- [x] Build vérifié — Task 8

### Cohérence des types
- `section.render` reçoit `depth` via `BlockRenderProps[key: string]: unknown` — pas de changement d'interface nécessaire.
- `useBuilderStore` n'exporte plus `moveBlock` — `BuilderPage.tsx` (stub) n'en a plus besoin.
- `_history` et `_future` sont préfixés `_` pour signaler qu'ils ne sont pas destinés aux composants.
