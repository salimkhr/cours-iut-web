# Builder Canvas Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le Builder en éditeur *canvas-first* : le rendu public devient la surface d'édition, en mode Slides (PowerPoint) et Cours/TP/Examen (Word), avec une barre contextuelle unique (icônes Lucide).

**Architecture :** On garde le store Zustand existant (`builderStore`) et le contrat de rendu (`getBlockDefinition().render`, `renderInline`, `SlideScreen`). On ajoute une couche d'édition par-dessus : `EditableBlock` (wrapper 3+1 états) enveloppe chaque bloc rendu, `InlineTextEditor` (option A) capte la saisie sur la source markdown brute, `ZoomedSlide` rend une slide à l'échelle via `transform: scale()`. `BuilderPage` branche le layout sur `contentType`. On retire `EditorTree`, `EditorPreview`, `SlidePreviewList`, `PropsPanel`.

**Tech Stack :** Next 16 (App Router, "use client"), React 19, TypeScript strict, Zustand, Tailwind v4, shadcn/radix (`Dialog`), `lucide-react`, `@monaco-editor/react` (nouvelle dép, Task 9). Tests pures via `bun test` (runner intégré, zéro dépendance ajoutée).

**Référence spec :** `docs/superpowers/specs/2026-06-24-builder-canvas-redesign-design.md`

---

## Conventions de vérification (lire avant de commencer)

Le projet n'a pas de Vitest/Jest. Règles :

- **Unités pures** (calcul, reducers, transforms) → fichier `*.test.ts` exécuté par `bun test <chemin>`. Zéro dépendance ajoutée.
- **Composants React** → pas de test unitaire. Vérification = `bun run lint` (zéro erreur) + `bun run build` (compile) + smoke test manuel décrit dans la tâche.
- **Indentation 4 espaces**, imports via alias `@/*`, apostrophes JSX échappées (`&apos;`), pas d'`any`. (CLAUDE.md §5)
- Commit à la fin de chaque tâche. Ne jamais `--no-verify`.

---

## File Structure

**Nouveaux fichiers**

| Fichier | Responsabilité |
|---------|----------------|
| `src/components/builder/slideScale.ts` | Pure : `computeSlideScale()`, constantes `SLIDE_W/SLIDE_H` |
| `src/components/builder/slideScale.test.ts` | Tests `bun test` du calcul de scale |
| `src/lib/markdownToolbar.ts` | Pure : `applyInlineMarker()` (Bold/Italic/Code/Link sur une sélection) |
| `src/lib/markdownToolbar.test.ts` | Tests `bun test` des transforms markdown |
| `src/components/builder/SlideChildrenRenderer.tsx` | Rendu partagé des enfants d'une slide (+ `PREVIEW_CONTEXT`) |
| `src/components/builder/ZoomedSlide.tsx` | Slide à l'échelle (`SlideScreen` dans un wrapper `scale()`) |
| `src/components/builder/InlineTextEditor.tsx` | Surface d'édition de la source markdown (option A, handle impératif) |
| `src/components/builder/EditableBlock.tsx` | Wrapper repos/hover/focus/édition + handle drag + erreurs |
| `src/components/builder/CodeEditorModal.tsx` | Monaco en `Dialog` plein écran (portal) |
| `src/components/builder/ContextualTopBar.tsx` | Barre haut : zone globale + zone contextuelle par type |
| `src/components/builder/CourseEditCanvas.tsx` | Canvas WYSIWYG cours/TP/examen |
| `src/components/builder/SlideEditCanvas.tsx` | Canvas slide active (ZoomedSlide canvas-edit) |
| `src/components/builder/SlideThumbnailList.tsx` | Colonne gauche de miniatures slides |
| `src/components/builder/useReducedMotion.ts` | Hook `prefers-reduced-motion` |

**Fichiers modifiés**

| Fichier | Changement |
|---------|------------|
| `src/lib/store/builderStore.ts` | + `activeSlideId`, `editingBlockId`, `setActiveSlide`, `setEditingBlock`, `moveBlockToIndex` |
| `src/lib/blockDefs.ts` | + champ `alt` sur la def `image-card` |
| `src/components/builder/BuilderPage.tsx` | Branche le layout sur `contentType`, retire les anciens panneaux |

**Fichiers supprimés** (Task 13)

`EditorTree.tsx`, `EditorPreview.tsx`, `SlidePreviewList.tsx`, et `PropsPanel.tsx` s'il existe.

---

## Task 1 : Extensions du store (état slide + réordonnancement)

**Files:**
- Modify: `src/lib/store/builderStore.ts`
- Test: `src/lib/store/builderStore.moveToIndex.test.ts`

- [ ] **Step 1 : Écrire le test du nouveau reducer**

`src/lib/store/builderStore.moveToIndex.test.ts` :

```ts
import { expect, test } from "bun:test";
import { useBuilderStore } from "@/lib/store/builderStore";
import type { Block } from "@/types/CourseContent";

function b(id: string): Block {
    return { id, type: "text", props: { content: id }, children: [] };
}

test("moveBlockToIndex réordonne au niveau racine", () => {
    const store = useBuilderStore.getState();
    store.setBlocks([b("a"), b("b"), b("c")], "mod", "cours");
    useBuilderStore.getState().moveBlockToIndex("c", null, 0);
    const ids = useBuilderStore.getState().blocks.map((x) => x.id);
    expect(ids).toEqual(["c", "a", "b"]);
});

test("setActiveSlide et setEditingBlock mettent à jour l'état", () => {
    useBuilderStore.getState().setActiveSlide("s1");
    useBuilderStore.getState().setEditingBlock("e1");
    expect(useBuilderStore.getState().activeSlideId).toBe("s1");
    expect(useBuilderStore.getState().editingBlockId).toBe("e1");
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `bun test src/lib/store/builderStore.moveToIndex.test.ts`
Expected: FAIL — `moveBlockToIndex is not a function`.

- [ ] **Step 3 : Ajouter l'état et les actions au store**

Dans l'interface `BuilderStore` (après `collapsedIds`) :

```ts
    activeSlideId: string | null;
    editingBlockId: string | null;
```

Dans l'interface, section actions (après `moveBlockDown`) :

```ts
    moveBlockToIndex: (id: string, parentId: string | null, index: number) => void;
    setActiveSlide: (id: string | null) => void;
    setEditingBlock: (id: string | null) => void;
```

Dans l'état initial (après `collapsedIds: {},`) :

```ts
    activeSlideId: null,
    editingBlockId: null,
```

Dans l'implémentation (après `moveBlockDown`) — réutilise `moveBlock as moveBlockInTree` déjà importé :

```ts
    moveBlockToIndex: (id, parentId, index) =>
        set((s) => ({
            blocks: moveBlockInTree(s.blocks, id, parentId, index),
            _history: pushHistory(s.blocks, s._history),
            _future: [],
            isDirty: true,
        })),

    setActiveSlide: (id) => set({ activeSlideId: id }),

    setEditingBlock: (id) => set({ editingBlockId: id }),
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `bun test src/lib/store/builderStore.moveToIndex.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5 : Lint + commit**

```bash
bun run lint
git add src/lib/store/builderStore.ts src/lib/store/builderStore.moveToIndex.test.ts
git commit -m "feat(builder): store activeSlideId, editingBlockId, moveBlockToIndex"
```

---

## Task 2 : Calcul de scale (pure)

**Files:**
- Create: `src/components/builder/slideScale.ts`
- Test: `src/components/builder/slideScale.test.ts`

- [ ] **Step 1 : Écrire le test**

`src/components/builder/slideScale.test.ts` :

```ts
import { expect, test } from "bun:test";
import { computeSlideScale, SLIDE_W, SLIDE_H } from "@/components/builder/slideScale";

test("dimensions naturelles 16:9", () => {
    expect(SLIDE_W).toBe(960);
    expect(SLIDE_H).toBe(540);
});

test("canvas : scale = min(W/960, H/540), borné par la hauteur", () => {
    // panneau large mais court → la hauteur limite
    expect(computeSlideScale(1920, 540, "canvas-edit")).toBeCloseTo(1, 5);
    expect(computeSlideScale(960, 270, "canvas-edit")).toBeCloseTo(0.5, 5);
});

test("thumbnail : scale fixe ~0.22 indépendant du panneau", () => {
    expect(computeSlideScale(9999, 9999, "thumbnail")).toBeCloseTo(0.22, 5);
});

test("jamais négatif ou NaN sur panneau 0", () => {
    expect(computeSlideScale(0, 0, "canvas-edit")).toBe(0);
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `bun test src/components/builder/slideScale.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : Implémenter**

`src/components/builder/slideScale.ts` :

```ts
export const SLIDE_W = 960;
export const SLIDE_H = 540;
export const THUMBNAIL_SCALE = 0.22;

export type ZoomMode = "thumbnail" | "canvas-edit";

/**
 * Coefficient de mise à l'échelle d'une slide (960×540 naturels).
 * - "thumbnail" : valeur fixe.
 * - "canvas-edit" : Math.min(W/960, H/540), pour tenir sans rogner le 16:9.
 */
export function computeSlideScale(panelW: number, panelH: number, mode: ZoomMode): number {
    if (mode === "thumbnail") return THUMBNAIL_SCALE;
    if (panelW <= 0 || panelH <= 0) return 0;
    return Math.min(panelW / SLIDE_W, panelH / SLIDE_H);
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `bun test src/components/builder/slideScale.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5 : Commit**

```bash
git add src/components/builder/slideScale.ts src/components/builder/slideScale.test.ts
git commit -m "feat(builder): computeSlideScale pure helper"
```

---

## Task 3 : Transforms markdown de la toolbar (pure)

**Files:**
- Create: `src/lib/markdownToolbar.ts`
- Test: `src/lib/markdownToolbar.test.ts`

- [ ] **Step 1 : Écrire le test**

`src/lib/markdownToolbar.test.ts` :

```ts
import { expect, test } from "bun:test";
import { applyInlineMarker } from "@/lib/markdownToolbar";

test("entoure la sélection de **", () => {
    const r = applyInlineMarker("abc", 1, 2, "bold");
    expect(r.text).toBe("a**b**c");
    expect(r.selStart).toBe(3);
    expect(r.selEnd).toBe(4);
});

test("italique avec _", () => {
    expect(applyInlineMarker("xy", 0, 2, "italic").text).toBe("_xy_");
});

test("code inline avec backticks", () => {
    expect(applyInlineMarker("x", 0, 1, "code").text).toBe("`x`");
});

test("lien : la sélection devient le label, url placeholder", () => {
    const r = applyInlineMarker("site", 0, 4, "link");
    expect(r.text).toBe("[site](url)");
});

test("sélection vide : insère les marqueurs et place le curseur entre", () => {
    const r = applyInlineMarker("ab", 1, 1, "bold");
    expect(r.text).toBe("a****b");
    expect(r.selStart).toBe(3);
    expect(r.selEnd).toBe(3);
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `bun test src/lib/markdownToolbar.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : Implémenter**

`src/lib/markdownToolbar.ts` :

```ts
export type InlineMarker = "bold" | "italic" | "code" | "link";

interface MarkerResult {
    text: string;
    selStart: number;
    selEnd: number;
}

const WRAP: Record<Exclude<InlineMarker, "link">, string> = {
    bold: "**",
    italic: "_",
    code: "`",
};

/**
 * Applique un marqueur markdown inline autour d'une sélection.
 * Retourne le nouveau texte + la sélection ajustée.
 */
export function applyInlineMarker(
    text: string,
    selStart: number,
    selEnd: number,
    marker: InlineMarker,
): MarkerResult {
    const before = text.slice(0, selStart);
    const sel = text.slice(selStart, selEnd);
    const after = text.slice(selEnd);

    if (marker === "link") {
        const label = sel || "texte";
        const next = `${before}[${label}](url)`;
        return { text: `${next}${after}`, selStart: next.length, selEnd: next.length };
    }

    const w = WRAP[marker];
    const next = `${before}${w}${sel}${w}${after}`;
    return {
        text: next,
        selStart: selStart + w.length,
        selEnd: selStart + w.length + sel.length,
    };
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `bun test src/lib/markdownToolbar.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5 : Commit**

```bash
git add src/lib/markdownToolbar.ts src/lib/markdownToolbar.test.ts
git commit -m "feat(builder): applyInlineMarker markdown toolbar transform"
```

---

## Task 4 : Hook prefers-reduced-motion

**Files:**
- Create: `src/components/builder/useReducedMotion.ts`

- [ ] **Step 1 : Implémenter le hook**

`src/components/builder/useReducedMotion.ts` :

```ts
"use client";

import { useEffect, useState } from "react";

/** Retourne true si l'utilisateur a demandé moins d'animations. */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    return reduced;
}
```

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/builder/useReducedMotion.ts
git commit -m "feat(builder): useReducedMotion hook"
```

---

## Task 5 : SlideChildrenRenderer (rendu partagé des enfants de slide)

But : factoriser le `switch` de rendu des blocs `slide-*` (aujourd'hui dupliqué dans `SlideBlocksRenderer.tsx` et `SlidePreviewList.tsx`) en un composant unique réutilisable par `ZoomedSlide`. Inclut le `PREVIEW_CONTEXT` statique requis par `SlideCode`/`SlideList` qui appellent `useSlides()`.

**Files:**
- Create: `src/components/builder/SlideChildrenRenderer.tsx`

- [ ] **Step 1 : Créer le composant**

`src/components/builder/SlideChildrenRenderer.tsx` :

```tsx
"use client";

import React from "react";
import { SlidesContext, type SlidesContextType } from "@/components/Slides/context/SlidesContext";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { renderInline } from "@/lib/inlineMarkdown";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import type { Block } from "@/types/CourseContent";

/** Contexte statique : la slide est rendue figée (pas de navigation par étapes). */
export const PREVIEW_CONTEXT: SlidesContextType = {
    currentSlide: 0,
    currentStep: 0,
    slidesCount: 1,
    slideSteps: {},
    nextSlide: () => {},
    prevSlide: () => {},
    goToSlide: () => {},
    registerSteps: () => {},
    currentNotes: null,
    showNotes: false,
    setShowNotes: () => {},
    isFullscreen: false,
    toggleFullscreen: () => {},
    isMobile: false,
};

export function SlideChildItem({ block }: { block: Block }) {
    switch (block.type) {
        case "slide-text":
            return <SlideText>{renderInline(String(block.props.content ?? ""))}</SlideText>;
        case "slide-code":
            return (
                <SlideCode
                    language={String(block.props.language ?? "javascript")}
                    highlight={block.props.highlight ? String(block.props.highlight) : undefined}
                >
                    {String(block.props.code ?? "")}
                </SlideCode>
            );
        case "slide-list":
            return (
                <SlideList ordered={Boolean(block.props.ordered)}>
                    {(block.children ?? []).map((item) => (
                        <SlideListItem key={item.id}>
                            {renderInline(String(item.props.text ?? ""))}
                        </SlideListItem>
                    ))}
                </SlideList>
            );
        case "slide-note":
            return <SlideNote>{String(block.props.content ?? "")}</SlideNote>;
        case "columns":
            return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {(block.children ?? []).map((col) => (
                        <div
                            key={col.id}
                            className={`${COL_SPAN_CLASS[Number(col.props.span)] ?? "md:col-span-6"} flex flex-col gap-4 min-w-0`}
                        >
                            {(col.children ?? []).map((inner) => (
                                <SlideChildItem key={inner.id} block={inner} />
                            ))}
                        </div>
                    ))}
                </div>
            );
        default:
            return null;
    }
}

/** Rend les enfants d'une slide, entourés du contexte slides statique. */
export function SlideChildrenRenderer({ blocks }: { blocks: Block[] }) {
    return (
        <SlidesContext.Provider value={PREVIEW_CONTEXT}>
            {blocks.map((child) => (
                <SlideChildItem key={child.id} block={child} />
            ))}
        </SlidesContext.Provider>
    );
}
```

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/builder/SlideChildrenRenderer.tsx
git commit -m "feat(builder): SlideChildrenRenderer shared slide child render"
```

> Note : `SlideBlocksRenderer.tsx` (page publique) n'est PAS modifié ici (hors périmètre, spec §14). La factorisation de la page publique pourra suivre plus tard.

---

## Task 6 : ZoomedSlide

**Files:**
- Create: `src/components/builder/ZoomedSlide.tsx`

- [ ] **Step 1 : Créer le composant**

`src/components/builder/ZoomedSlide.tsx` :

```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideChildrenRenderer } from "@/components/builder/SlideChildrenRenderer";
import { computeSlideScale, SLIDE_W, SLIDE_H, type ZoomMode } from "@/components/builder/slideScale";
import type { Block } from "@/types/CourseContent";

interface ZoomedSlideProps {
    slide: Block;
    mode: ZoomMode;
    /** Rendu enfant alternatif (mode canvas-edit : blocs enveloppés d'EditableBlock). */
    renderChildren?: (children: Block[]) => React.ReactNode;
    className?: string;
}

/**
 * Rend une slide (SlideScreen) à l'échelle via transform: scale().
 * IMPORTANT : ne rend jamais SlidesScreen (chrome de navigation).
 * Le scale crée un stacking context isolé → toute surface flottante ouverte
 * depuis l'intérieur DOIT être portée hors de ce conteneur (Dialog radix le fait).
 */
export function ZoomedSlide({ slide, mode, renderChildren, className }: ZoomedSlideProps) {
    const outerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number | null>(null);

    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;

        let raf = 0;
        const measure = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const { width, height } = el.getBoundingClientRect();
                setScale(computeSlideScale(width, height, mode));
            });
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [mode]);

    const children = slide.children ?? [];

    return (
        <div ref={outerRef} className={className} style={{ width: "100%", height: "100%" }}>
            {scale === null ? (
                <div className="h-full w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            ) : (
                <div
                    className="origin-top-left overflow-hidden rounded-lg bg-card shadow-lg"
                    style={{
                        width: SLIDE_W,
                        height: SLIDE_H,
                        transform: `scale(${scale})`,
                        pointerEvents: mode === "thumbnail" ? "none" : "auto",
                    }}
                >
                    <SlideScreen title={String(slide.props.title ?? "")}>
                        {renderChildren ? renderChildren(children) : <SlideChildrenRenderer blocks={children} />}
                    </SlideScreen>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2 : Vérifier compilation + lint**

Run: `bun run lint`
Expected: zéro erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/components/builder/ZoomedSlide.tsx
git commit -m "feat(builder): ZoomedSlide scaled slide renderer"
```

---

## Task 7 : InlineTextEditor (option A)

Surface d'édition de la **source markdown brute** d'un champ (`inlineEditField`). Expose un handle impératif pour que la toolbar (Task 11) applique `applyInlineMarker` sur la sélection courante.

**Files:**
- Create: `src/components/builder/InlineTextEditor.tsx`

- [ ] **Step 1 : Créer le composant**

`src/components/builder/InlineTextEditor.tsx` :

```tsx
"use client";

import React, { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { applyInlineMarker, type InlineMarker } from "@/lib/markdownToolbar";

export interface InlineTextEditorHandle {
    applyMarker: (marker: InlineMarker) => void;
    focus: () => void;
}

interface InlineTextEditorProps {
    /** Valeur markdown brute initiale. */
    value: string;
    /** Auto-save : appelé au blur (ou Ctrl+Entrée) avec la nouvelle valeur. */
    onCommit: (next: string) => void;
    /** Escape : annule, restaure la valeur d'origine. */
    onCancel: () => void;
    ariaLabel: string;
    className?: string;
}

/**
 * Éditeur de source markdown inline (option A). Un <textarea> auto-grandissant
 * lié à la chaîne brute ; aucune transformation DOM→markdown.
 */
export const InlineTextEditor = forwardRef<InlineTextEditorHandle, InlineTextEditorProps>(
    function InlineTextEditor({ value, onCommit, onCancel, ariaLabel, className }, ref) {
        const taRef = useRef<HTMLTextAreaElement>(null);
        const [draft, setDraft] = useState(value);

        // Auto-hauteur
        useLayoutEffect(() => {
            const ta = taRef.current;
            if (!ta) return;
            ta.style.height = "auto";
            ta.style.height = `${ta.scrollHeight}px`;
        }, [draft]);

        useImperativeHandle(ref, () => ({
            applyMarker(marker) {
                const ta = taRef.current;
                if (!ta) return;
                const { text, selStart, selEnd } = applyInlineMarker(
                    draft,
                    ta.selectionStart,
                    ta.selectionEnd,
                    marker,
                );
                setDraft(text);
                requestAnimationFrame(() => {
                    ta.focus();
                    ta.setSelectionRange(selStart, selEnd);
                });
            },
            focus() {
                taRef.current?.focus();
            },
        }));

        return (
            <textarea
                ref={taRef}
                aria-label={ariaLabel}
                value={draft}
                autoFocus
                rows={1}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => onCommit(draft)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        e.preventDefault();
                        onCancel();
                    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        onCommit(draft);
                    }
                }}
                className={
                    className ??
                    "w-full resize-none overflow-hidden bg-transparent outline-none focus-visible:ring-0"
                }
            />
        );
    },
);
```

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/builder/InlineTextEditor.tsx
git commit -m "feat(builder): InlineTextEditor raw-markdown edit surface"
```

---

## Task 8 : EditableBlock (wrapper d'édition)

Wrapper universel autour d'un bloc rendu : états repos / hover / focus-clavier / édition, curseur typé, badge `Pencil`, handle drag (`GripVertical`, DnD natif HTML5 entre frères), bouton supprimer (`Trash2`), séparateur `+ Bloc ici`, message d'erreur `role="alert"`.

**Files:**
- Create: `src/components/builder/EditableBlock.tsx`

- [ ] **Step 1 : Créer le composant**

`src/components/builder/EditableBlock.tsx` :

```tsx
"use client";

import React, { useRef } from "react";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { InlineTextEditor, type InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

interface EditableBlockProps {
    block: Block;
    /** id du parent (null = racine) — pour le réordonnancement DnD. */
    parentId: string | null;
    index: number;
    /** Rendu public du bloc (def.render(...)) quand il n'est PAS en édition. */
    children: React.ReactNode;
    /** Ouvre le block picker à l'index donné sous le parent. */
    onInsertAfter: () => void;
    /** Enregistre le handle de l'éditeur actif (pour la toolbar). */
    registerEditor?: (h: InlineTextEditorHandle | null) => void;
}

const ACTION_TYPES = new Set(["code", "code-runnable", "image-card", "table", "chart", "diagram"]);

export function EditableBlock({
    block,
    parentId,
    index,
    children,
    onInsertAfter,
    registerEditor,
}: EditableBlockProps) {
    const def = getBlockDefinition(block.type);
    const selectedId = useBuilderStore((s) => s.selectedId);
    const editingBlockId = useBuilderStore((s) => s.editingBlockId);
    const blockError = useBuilderStore((s) => s.blockErrors[block.id]);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const setEditingBlock = useBuilderStore((s) => s.setEditingBlock);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const moveBlockToIndex = useBuilderStore((s) => s.moveBlockToIndex);

    const editorRef = useRef<InlineTextEditorHandle | null>(null);
    const field = def?.inlineEditField;
    const isSelected = selectedId === block.id;
    const isEditing = editingBlockId === block.id && Boolean(field);
    const isText = Boolean(field);
    const isAction = ACTION_TYPES.has(block.type);
    const cursor = isText ? "cursor-text" : isAction ? "cursor-pointer" : "cursor-default";

    const beginEdit = () => {
        selectBlock(block.id);
        if (field) setEditingBlock(block.id);
    };

    const commit = (next: string) => {
        if (field) updateBlock(block.id, { [field]: next });
        setEditingBlock(null);
        registerEditor?.(null);
    };

    const cancel = () => {
        setEditingBlock(null);
        registerEditor?.(null);
    };

    return (
        <div className="group/eb relative">
            <div
                role="group"
                tabIndex={0}
                aria-label={def?.label ?? block.type}
                onClick={(e) => {
                    e.stopPropagation();
                    beginEdit();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !isEditing) {
                        e.preventDefault();
                        beginEdit();
                    }
                }}
                draggable={!isEditing}
                onDragStart={(e) => e.dataTransfer.setData("text/block-id", block.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData("text/block-id");
                    if (draggedId && draggedId !== block.id) {
                        moveBlockToIndex(draggedId, parentId, index);
                    }
                }}
                className={[
                    "relative rounded-md border transition-colors",
                    cursor,
                    isEditing
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30"
                        : isSelected
                          ? "border-blue-400"
                          : "border-transparent hover:border-blue-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                ].join(" ")}
            >
                {/* Handle drag */}
                <button
                    type="button"
                    aria-label="Déplacer le bloc"
                    className="absolute -left-6 top-1 z-10 hidden cursor-grab rounded p-0.5 text-slate-400 hover:text-slate-600 group-hover/eb:block"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="size-4" />
                </button>

                {/* Badge éditer */}
                {!isEditing && (
                    <span className="pointer-events-none absolute right-1 top-1 z-10 hidden items-center gap-1 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] text-white group-hover/eb:flex">
                        <Pencil className="size-3" />
                        {def?.label ?? block.type}
                    </span>
                )}

                {/* Supprimer */}
                <button
                    type="button"
                    aria-label="Supprimer le bloc"
                    className="absolute -right-6 top-1 z-10 hidden rounded p-0.5 text-slate-400 hover:text-red-600 group-hover/eb:block"
                    onClick={(e) => {
                        e.stopPropagation();
                        useBuilderStore.getState().deleteBlock(block.id);
                    }}
                >
                    <Trash2 className="size-4" />
                </button>

                {/* Contenu : éditeur inline OU rendu public */}
                {isEditing && field ? (
                    <div className="p-1">
                        <InlineTextEditor
                            ref={(h) => {
                                editorRef.current = h;
                                registerEditor?.(h);
                            }}
                            value={String(block.props[field] ?? "")}
                            onCommit={commit}
                            onCancel={cancel}
                            ariaLabel={`Éditer ${def?.label ?? block.type}`}
                        />
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Erreur de validation, annoncée */}
            {blockError && (
                <p role="alert" className="mt-1 px-1 text-xs text-red-600">
                    {blockError}
                </p>
            )}

            {/* + Bloc ici (hover) */}
            <div className="flex h-0 items-center justify-center opacity-0 transition-opacity hover:opacity-100 group-hover/eb:opacity-100">
                <button
                    type="button"
                    onClick={onInsertAfter}
                    className="-my-2 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500 shadow-sm hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800"
                >
                    <Plus className="size-3" /> Bloc ici
                </button>
            </div>
        </div>
    );
}
```

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/builder/EditableBlock.tsx
git commit -m "feat(builder): EditableBlock wrapper (states, drag, inline edit, errors)"
```

---

## Task 9 : CodeEditorModal (Monaco, portal)

**Files:**
- Modify: `package.json` (ajout dépendance)
- Create: `src/components/builder/CodeEditorModal.tsx`

- [ ] **Step 1 : Installer Monaco**

```bash
bun add @monaco-editor/react
```

- [ ] **Step 2 : Vérifier que le build tient toujours**

Run: `bun run build`
Expected: build OK (mode standalone). En cas d'échec lié au SSR de Monaco, le composant l'importe en `dynamic(..., { ssr: false })` (Step 3).

- [ ] **Step 3 : Créer le modal**

`src/components/builder/CodeEditorModal.tsx` :

```tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Monaco n'est pas SSR-safe → import client only.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorModalProps {
    open: boolean;
    initialValue: string;
    language: string;
    onClose: () => void;
    onSave: (value: string) => void;
}

/**
 * Monaco plein écran dans un Dialog radix (porté sur document.body → échappe
 * au stacking context du ZoomedSlide, cf. spec §6).
 */
export function CodeEditorModal({ open, initialValue, language, onClose, onSave }: CodeEditorModalProps) {
    const [value, setValue] = useState(initialValue);

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) {
                    onSave(value);
                    onClose();
                }
            }}
        >
            <DialogContent className="z-50 h-[85vh] w-[90vw] max-w-none gap-2 p-4 sm:max-w-none">
                <DialogHeader>
                    <DialogTitle className="text-sm">Éditer le code — {language}</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-hidden rounded border border-slate-200 dark:border-slate-700">
                    <MonacoEditor
                        height="100%"
                        defaultLanguage={language}
                        defaultValue={initialValue}
                        onChange={(v) => setValue(v ?? "")}
                        options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

> Vérifier que `src/components/ui/dialog.tsx` existe (shadcn). Sinon : `bunx shadcn@latest add dialog`.

- [ ] **Step 4 : Lint + commit**

```bash
bun run lint
git add package.json bun.lock src/components/builder/CodeEditorModal.tsx
git commit -m "feat(builder): CodeEditorModal (Monaco fullscreen, portaled)"
```

---

## Task 10 : Champ `alt` sur image-card

**Files:**
- Modify: `src/lib/blockDefs.ts` (def `image-card`)

- [ ] **Step 1 : Localiser la def image-card**

Run: `bun run lint` n'est pas requis ici ; ouvrir `src/lib/blockDefs.ts`, repérer l'objet `type: "image-card"` et son tableau `fields`.

- [ ] **Step 2 : Ajouter le champ alt**

Dans le tableau `fields` de la def `image-card`, ajouter (après le champ `title`/`caption`) :

```ts
{ key: "alt", label: "Texte alternatif", type: "text", placeholder: "Description pour lecteurs d'écran (vide si décorative)" },
```

> Adapter la forme de l'objet à la structure `FieldDef` réelle du fichier (vérifier les champs voisins : `key`/`name`, `type`, `label`). Le `render` de `image-card` dans `blockRegistry.tsx` doit passer `alt={alt}` à l'`<img>` / `ImageCard`. Si `ImageCard` n'accepte pas `alt`, le câbler au prop existant d'alternative ; ne pas dériver `alt` de la légende.

- [ ] **Step 3 : Lint + build + commit**

```bash
bun run lint
git add src/lib/blockDefs.ts src/lib/blockRegistry.tsx
git commit -m "feat(builder): champ alt distinct sur image-card"
```

---

## Task 11 : ContextualTopBar

Barre haut : zone gauche (globale) + séparateur + zone droite (props du bloc sélectionné, icônes Lucide). Agit sur l'éditeur inline actif via un handle partagé fourni par le parent.

**Files:**
- Create: `src/components/builder/ContextualTopBar.tsx`

- [ ] **Step 1 : Créer le composant**

`src/components/builder/ContextualTopBar.tsx` :

```tsx
"use client";

import React from "react";
import {
    Plus, Undo2, Redo2, Bold, Italic, Code, Link, Code2, Highlighter,
    Maximize2, ImagePlus, Type, Heading2, Heading3, List, ListOrdered,
    Info, AlertTriangle, Lightbulb, BookMarked, Palette,
} from "lucide-react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { getBlockDefinition } from "@/lib/blockRegistry";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { InlineMarker } from "@/lib/markdownToolbar";

interface ContextualTopBarProps {
    mode: "slide" | "course";
    onInsert: () => void;
    onOpenBackground?: () => void;
    onOpenCodeModal?: (blockId: string) => void;
    /** Handle de l'éditeur inline actuellement focalisé (null sinon). */
    activeEditor: InlineTextEditorHandle | null;
    /** Compteur slides (mode slide). */
    slidePosition?: { index: number; total: number };
}

const TEXT_TYPES = new Set(["text", "slide-text", "heading", "list-item", "slide-list-item"]);

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="inline-flex size-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800"
        >
            {children}
        </button>
    );
}

export function ContextualTopBar({
    mode, onInsert, onOpenBackground, onOpenCodeModal, activeEditor, slidePosition,
}: ContextualTopBarProps) {
    const selectedId = useBuilderStore((s) => s.selectedId);
    const blocks = useBuilderStore((s) => s.blocks);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const updateBlock = useBuilderStore((s) => s.updateBlock);

    const selected = selectedId ? findBlock(blocks, selectedId) : null;
    const def = selected ? getBlockDefinition(selected.type) : null;

    const mark = (m: InlineMarker) => activeEditor?.applyMarker(m);

    const renderContextZone = () => {
        if (!selected || !def) return null;
        const t = selected.type;

        if (TEXT_TYPES.has(t)) {
            return (
                <>
                    <IconBtn label="Gras" onClick={() => mark("bold")}><Bold className="size-4" /></IconBtn>
                    <IconBtn label="Italique" onClick={() => mark("italic")}><Italic className="size-4" /></IconBtn>
                    <IconBtn label="Code inline" onClick={() => mark("code")}><Code className="size-4" /></IconBtn>
                    <IconBtn label="Lien" onClick={() => mark("link")}><Link className="size-4" /></IconBtn>
                    {t === "heading" && (
                        <>
                            <IconBtn label="Titre niveau 2" onClick={() => updateBlock(selected.id, { level: 2 })}><Heading2 className="size-4" /></IconBtn>
                            <IconBtn label="Titre niveau 3" onClick={() => updateBlock(selected.id, { level: 3 })}><Heading3 className="size-4" /></IconBtn>
                        </>
                    )}
                </>
            );
        }

        if (t === "code" || t === "slide-code") {
            return (
                <>
                    <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><Code2 className="size-4" /> {String(selected.props.language ?? "javascript")}</span>
                    <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><Highlighter className="size-4" /> {String(selected.props.highlight ?? "—")}</span>
                    <IconBtn label="Éditeur plein écran" onClick={() => onOpenCodeModal?.(selected.id)}><Maximize2 className="size-4" /></IconBtn>
                </>
            );
        }

        if (t === "list" || t === "slide-list") {
            return (
                <>
                    <IconBtn label="Liste à puces" onClick={() => updateBlock(selected.id, { ordered: false })}><List className="size-4" /></IconBtn>
                    <IconBtn label="Liste numérotée" onClick={() => updateBlock(selected.id, { ordered: true })}><ListOrdered className="size-4" /></IconBtn>
                </>
            );
        }

        if (t === "image-card") {
            return <IconBtn label="Remplacer l'image" onClick={() => onOpenCodeModal?.(selected.id)}><ImagePlus className="size-4" /></IconBtn>;
        }

        if (t === "callout") {
            const set = (v: string) => updateBlock(selected.id, { variant: v });
            return (
                <>
                    <IconBtn label="Info" onClick={() => set("info")}><Info className="size-4" /></IconBtn>
                    <IconBtn label="Attention" onClick={() => set("warning")}><AlertTriangle className="size-4" /></IconBtn>
                    <IconBtn label="Astuce" onClick={() => set("tip")}><Lightbulb className="size-4" /></IconBtn>
                    <IconBtn label="Remarque" onClick={() => set("note")}><BookMarked className="size-4" /></IconBtn>
                </>
            );
        }

        return null;
    };

    const contextZone = renderContextZone();

    return (
        <div className="z-20 flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            {/* Zone globale */}
            <button
                type="button"
                onClick={onInsert}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
                <Plus className="size-4" /> Bloc
            </button>

            {mode === "slide" && onOpenBackground && (
                <IconBtn label="Fond de la slide" onClick={onOpenBackground}><Palette className="size-4" /></IconBtn>
            )}

            <IconBtn label="Annuler" onClick={undo}><Undo2 className="size-4" /></IconBtn>
            <IconBtn label="Rétablir" onClick={redo}><Redo2 className="size-4" /></IconBtn>

            {contextZone && <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-600" />}
            {contextZone}

            {mode === "slide" && slidePosition && (
                <span className="ml-auto text-xs font-semibold text-slate-400">
                    {slidePosition.index + 1} / {slidePosition.total}
                </span>
            )}
        </div>
    );
}
```

> Le sélecteur de langage code détaillé (dropdown) et le picker de fond sont des `onOpen*` délégués — v1 expose l'état en lecture + boutons d'ouverture. Le dropdown complet pourra réutiliser le `Select` shadcn dans une itération suivante.

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/builder/ContextualTopBar.tsx
git commit -m "feat(builder): ContextualTopBar (global + per-block Lucide zone)"
```

---

## Task 12 : CourseEditCanvas

Canvas WYSIWYG cours/TP/examen : chaque bloc racine rendu via `getBlockDefinition().render`, enveloppé d'`EditableBlock`. Gère l'`activeEditor` partagé pour la toolbar, et l'ouverture du `CodeEditorModal`.

**Files:**
- Create: `src/components/builder/CourseEditCanvas.tsx`

- [ ] **Step 1 : Créer le composant**

`src/components/builder/CourseEditCanvas.tsx` :

```tsx
"use client";

import React, { useState } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { EditableBlock } from "@/components/builder/EditableBlock";
import { CodeEditorModal } from "@/components/builder/CodeEditorModal";
import { ContextualTopBar } from "@/components/builder/ContextualTopBar";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

interface CourseEditCanvasProps {
    onInsertAfter: (parentId: string | null, index: number) => void;
}

export function CourseEditCanvas({ onInsertAfter }: CourseEditCanvasProps) {
    const blocks = useBuilderStore((s) => s.blocks);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const [activeEditor, setActiveEditor] = useState<InlineTextEditorHandle | null>(null);
    const [codeModal, setCodeModal] = useState<{ id: string; value: string; language: string } | null>(null);

    const openCodeModal = (id: string) => {
        const blk = findBlock(blocks, id);
        if (!blk) return;
        setCodeModal({
            id,
            value: String(blk.props.code ?? blk.props.content ?? ""),
            language: String(blk.props.language ?? "javascript"),
        });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ContextualTopBar
                mode="course"
                onInsert={() => onInsertAfter(null, Number.MAX_SAFE_INTEGER)}
                onOpenCodeModal={openCodeModal}
                activeEditor={activeEditor}
            />

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 px-6 py-8 dark:bg-slate-950">
                <div className="mx-auto flex max-w-3xl flex-col gap-3">
                    {blocks.map((block, i) => (
                        <CourseBlock
                            key={block.id}
                            block={block}
                            index={i}
                            onInsertAfter={() => onInsertAfter(null, i + 1)}
                            registerEditor={setActiveEditor}
                            onOpenCodeModal={openCodeModal}
                        />
                    ))}
                </div>
            </div>

            {codeModal && (
                <CodeEditorModal
                    open
                    initialValue={codeModal.value}
                    language={codeModal.language}
                    onClose={() => setCodeModal(null)}
                    onSave={(v) => updateBlock(codeModal.id, { code: v })}
                />
            )}
        </div>
    );
}

function CourseBlock({
    block, index, onInsertAfter, registerEditor, onOpenCodeModal,
}: {
    block: Block;
    index: number;
    onInsertAfter: () => void;
    registerEditor: (h: InlineTextEditorHandle | null) => void;
    onOpenCodeModal: (id: string) => void;
}) {
    const def = getBlockDefinition(block.type);
    const isCode = block.type === "code" || block.type === "code-runnable";
    const Render = def?.render;

    const rendered = Render ? (
        <div
            onClick={isCode ? (e) => { e.stopPropagation(); onOpenCodeModal(block.id); } : undefined}
        >
            <Render {...block.props}>
                {block.children?.map((c) => (
                    // Les enfants restent rendus en lecture ici ; l'édition profonde
                    // d'un conteneur passe par la sélection de l'enfant (récursivité v2).
                    <RenderChild key={c.id} block={c} />
                ))}
            </Render>
        </div>
    ) : null;

    return (
        <EditableBlock
            block={block}
            parentId={null}
            index={index}
            onInsertAfter={onInsertAfter}
            registerEditor={registerEditor}
        >
            {rendered}
        </EditableBlock>
    );
}

function RenderChild({ block }: { block: Block }) {
    const def = getBlockDefinition(block.type);
    const Render = def?.render;
    if (!Render) return null;
    return (
        <Render {...block.props}>
            {block.children?.map((c) => <RenderChild key={c.id} block={c} />)}
        </Render>
    );
}
```

> Périmètre v1 : édition inline au niveau racine. L'édition d'un bloc texte **imbriqué** dans un conteneur (section, callout) se fait en le sélectionnant ; l'enveloppe `EditableBlock` récursive sur les enfants est une itération v2 (noter dans le suivi, ne pas bloquer).

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/builder/CourseEditCanvas.tsx
git commit -m "feat(builder): CourseEditCanvas WYSIWYG"
```

---

## Task 13 : SlideEditCanvas + SlideThumbnailList

**Files:**
- Create: `src/components/builder/SlideEditCanvas.tsx`
- Create: `src/components/builder/SlideThumbnailList.tsx`

- [ ] **Step 1 : SlideThumbnailList**

`src/components/builder/SlideThumbnailList.tsx` :

```tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { ZoomedSlide } from "@/components/builder/ZoomedSlide";
import { useReducedMotion } from "@/components/builder/useReducedMotion";
import type { Block } from "@/types/CourseContent";

interface SlideThumbnailListProps {
    slides: Block[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
}

export function SlideThumbnailList({ slides, activeId, onSelect, onAdd }: SlideThumbnailListProps) {
    const reduced = useReducedMotion();

    return (
        <div className="flex w-[208px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {slides.map((slide, i) => (
                    <Thumbnail
                        key={slide.id}
                        slide={slide}
                        index={i}
                        active={slide.id === activeId}
                        reduced={reduced}
                        onSelect={() => onSelect(slide.id)}
                    />
                ))}
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="m-3 inline-flex items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600"
            >
                <Plus className="size-4" /> Slide
            </button>
        </div>
    );
}

function Thumbnail({
    slide, index, active, reduced, onSelect,
}: {
    slide: Block;
    index: number;
    active: boolean;
    reduced: boolean;
    onSelect: () => void;
}) {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (active) ref.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }, [active, reduced]);

    return (
        <button
            ref={ref}
            type="button"
            onClick={onSelect}
            title={String(slide.props.title ?? "Sans titre")}
            aria-label={`Slide ${index + 1} : ${String(slide.props.title ?? "Sans titre")}`}
            aria-current={active}
            className={[
                "block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                active ? "ring-2 ring-blue-500" : "ring-1 ring-slate-200 dark:ring-slate-700",
            ].join(" ")}
        >
            <div className="aspect-video w-full">
                <ZoomedSlide slide={slide} mode="thumbnail" />
            </div>
            <div className="truncate bg-white px-2 py-1 text-left text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {index + 1}. {String(slide.props.title ?? "Sans titre")}
            </div>
        </button>
    );
}
```

- [ ] **Step 2 : SlideEditCanvas**

`src/components/builder/SlideEditCanvas.tsx` :

```tsx
"use client";

import React, { useState } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { ZoomedSlide } from "@/components/builder/ZoomedSlide";
import { EditableBlock } from "@/components/builder/EditableBlock";
import { ContextualTopBar } from "@/components/builder/ContextualTopBar";
import { CodeEditorModal } from "@/components/builder/CodeEditorModal";
import { SlideChildItem } from "@/components/builder/SlideChildrenRenderer";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { Block } from "@/types/CourseContent";

interface SlideEditCanvasProps {
    slide: Block;
    position: { index: number; total: number };
    onInsertAfter: (parentId: string | null, index: number) => void;
}

export function SlideEditCanvas({ slide, position, onInsertAfter }: SlideEditCanvasProps) {
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const [activeEditor, setActiveEditor] = useState<InlineTextEditorHandle | null>(null);
    const [codeModal, setCodeModal] = useState<{ id: string; value: string; language: string } | null>(null);

    const renderChildren = (children: Block[]) => (
        <>
            {children.map((child, i) => (
                <EditableBlock
                    key={child.id}
                    block={child}
                    parentId={slide.id}
                    index={i}
                    onInsertAfter={() => onInsertAfter(slide.id, i + 1)}
                    registerEditor={setActiveEditor}
                >
                    <SlideChildItem block={child} />
                </EditableBlock>
            ))}
        </>
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ContextualTopBar
                mode="slide"
                onInsert={() => onInsertAfter(slide.id, Number.MAX_SAFE_INTEGER)}
                onOpenBackground={() => { /* picker de fond — itération suivante */ }}
                onOpenCodeModal={(id) => {
                    const c = (slide.children ?? []).find((x) => x.id === id);
                    if (c) setCodeModal({ id, value: String(c.props.code ?? ""), language: String(c.props.language ?? "javascript") });
                }}
                activeEditor={activeEditor}
                slidePosition={position}
            />

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-800 p-8">
                <div className="aspect-video w-full max-w-5xl">
                    <ZoomedSlide slide={slide} mode="canvas-edit" renderChildren={renderChildren} />
                </div>
            </div>

            {codeModal && (
                <CodeEditorModal
                    open
                    initialValue={codeModal.value}
                    language={codeModal.language}
                    onClose={() => setCodeModal(null)}
                    onSave={(v) => updateBlock(codeModal.id, { code: v })}
                />
            )}
        </div>
    );
}
```

- [ ] **Step 3 : Lint + commit**

```bash
bun run lint
git add src/components/builder/SlideEditCanvas.tsx src/components/builder/SlideThumbnailList.tsx
git commit -m "feat(builder): SlideEditCanvas + SlideThumbnailList"
```

---

## Task 14 : Brancher BuilderPage + retirer les anciens panneaux

**Files:**
- Modify: `src/components/builder/BuilderPage.tsx`
- Delete: `src/components/builder/EditorTree.tsx`, `EditorPreview.tsx`, `SlidePreviewList.tsx` (+ `PropsPanel.tsx` s'il existe)

- [ ] **Step 1 : Remplacer le corps de rendu de BuilderPage**

Dans `src/components/builder/BuilderPage.tsx` :

1. Retirer les imports : `EditorTree`, `EditorPreview`, `SlidePreviewList`, `previewRef`, `findAllIds` si désormais inutilisé (laisser ce que `useEditorShortcuts` utilise encore).
2. Ajouter les imports :

```ts
import { CourseEditCanvas } from "@/components/builder/CourseEditCanvas";
import { SlideEditCanvas } from "@/components/builder/SlideEditCanvas";
import { SlideThumbnailList } from "@/components/builder/SlideThumbnailList";
```

3. Avant le `return`, dériver l'état slide :

```ts
const allBlocks = useBuilderStore((s) => s.blocks);
const activeSlideId = useBuilderStore((s) => s.activeSlideId);
const setActiveSlide = useBuilderStore((s) => s.setActiveSlide);
const insertBlock = useBuilderStore((s) => s.insertBlock);

const isSlideMode = contentType === "slide";
const slides = isSlideMode ? allBlocks.filter((b) => b.type === "slide") : [];
const activeSlide = slides.find((s) => s.id === activeSlideId) ?? slides[0] ?? null;

// Sélectionne la 1re slide au montage si aucune active
useEffect(() => {
    if (isSlideMode && !activeSlideId && slides.length > 0) setActiveSlide(slides[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isSlideMode, slides.length]);

const openInsertAt = useCallback((parentId: string | null, index: number) => {
    setInsertContext({ parentId, index });
    setInsertDialogOpen(true);
}, []);

const addSlide = useCallback(() => {
    const blk = createBlockInstance("slide"); // import depuis blockRegistry
    insertBlock(blk, null, Number.MAX_SAFE_INTEGER);
    setActiveSlide(blk.id);
}, [insertBlock, setActiveSlide]);
```

> `createBlockInstance` est réexporté par `@/lib/blockRegistry` (vérifié). Importer : `import { createBlockInstance } from "@/lib/blockRegistry";`.

4. Remplacer le bloc `<div className="flex flex-1 ...">…</div>` (l'ancien à deux panneaux) par :

```tsx
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {isSlideMode ? (
                    <>
                        <SlideThumbnailList
                            slides={slides}
                            activeId={activeSlide?.id ?? null}
                            onSelect={setActiveSlide}
                            onAdd={addSlide}
                        />
                        {activeSlide ? (
                            <SlideEditCanvas
                                slide={activeSlide}
                                position={{ index: slides.findIndex((s) => s.id === activeSlide.id), total: slides.length }}
                                onInsertAfter={openInsertAt}
                            />
                        ) : (
                            <div className="flex flex-1 items-center justify-center text-slate-400">
                                Aucune slide. Ajoutez-en une.
                            </div>
                        )}
                    </>
                ) : (
                    <CourseEditCanvas onInsertAfter={openInsertAt} />
                )}
            </div>
```

5. Supprimer `previewRef` et l'appel `previewRef.current?.reload()` dans `handleSave` (plus d'iframe). La sauvegarde rafraîchit déjà le store ; le canvas est réactif.

- [ ] **Step 2 : Vérifier le build**

Run: `bun run build`
Expected: build OK. Corriger toute erreur TS d'import résiduel (`EditorToolbar` reste utilisé).

- [ ] **Step 3 : Supprimer les fichiers morts**

```bash
git rm src/components/builder/EditorTree.tsx src/components/builder/EditorPreview.tsx src/components/builder/SlidePreviewList.tsx
# Si présent :
git rm src/components/builder/PropsPanel.tsx 2>/dev/null || true
```

Run: `bun run build` — confirmer qu'aucun import cassé ne subsiste (grep `EditorTree|EditorPreview|SlidePreviewList`).

```bash
grep -rln "EditorTree\|EditorPreview\|SlidePreviewList" src || echo "aucune référence"
```

- [ ] **Step 4 : Commit**

```bash
bun run lint
git add -A
git commit -m "feat(builder): BuilderPage canvas-first + retrait EditorTree/EditorPreview/SlidePreviewList"
```

---

## Task 15 : Vérification end-to-end + polish a11y

- [ ] **Step 1 : Build complet + lint**

```bash
bun run lint
bun run build
bun test
```
Expected : lint zéro erreur, build standalone OK, `bun test` vert (3 fichiers de tests purs).

- [ ] **Step 2 : Smoke test manuel — mode Cours/TP**

`bun dev`, ouvrir un contenu cours/TP en admin via le builder.
- [ ] Le canvas affiche les blocs (rendu public).
- [ ] Hover sur un bloc texte : bordure bleue + badge `Pencil` + handle `GripVertical`.
- [ ] Clic sur un bloc texte : `<textarea>` markdown brut, focus auto.
- [ ] Sélectionner du texte, cliquer `Gras` dans la barre : `**…**` inséré autour.
- [ ] Cliquer ailleurs : auto-save (le rendu se met à jour). `Escape` : annule.
- [ ] Clic sur un bloc code : `CodeEditorModal` Monaco s'ouvre **plein écran** (pas tronqué).
- [ ] `Tab` au clavier parcourt les blocs ; anneau de focus visible ; `Enter` édite.
- [ ] Drag d'un bloc sur un autre : réordonne. `+ Bloc ici` ouvre le picker.

- [ ] **Step 3 : Smoke test manuel — mode Slides**

Ouvrir un contenu `slide`.
- [ ] Colonne gauche : miniatures à l'échelle, ring bleu sur l'active, scroll.
- [ ] `+ Slide` ajoute une slide et l'active.
- [ ] Centre : slide active à l'échelle, fond sombre, 16:9 sans rognage.
- [ ] Redimensionner la fenêtre : la slide se re-scale (pas de débordement).
- [ ] Clic sur un `slide-text` : édition inline à l'échelle. Clic sur `slide-code` : Monaco modal **non scalé** (preuve que le portal échappe au `transform`).
- [ ] Barre haut : compteur `n / total`, zone droite change selon le bloc.

- [ ] **Step 4 : Vérif accessibilité ciblée**

- [ ] Forcer `prefers-reduced-motion` (DevTools → Rendering) : le `scrollIntoView` des miniatures n'anime plus.
- [ ] Provoquer une erreur de validation (sauver un bloc invalide) : message sous le bloc avec `role="alert"`.
- [ ] Boutons de la topbar : zone cliquable ~44px (inspecter, `size-11`).

- [ ] **Step 5 : Commit final (si correctifs)**

```bash
bun run lint
git add -A
git commit -m "fix(builder): polish a11y et corrections smoke test canvas redesign"
```

---

## Self-Review — couverture de la spec

| Section spec | Tâche(s) |
|--------------|----------|
| §2 Layouts (slides / cours) | 14 |
| §3 ZoomedSlide (scale, SlideScreen, pointer-events, skeleton, scrollIntoView) | 2, 6, 13 |
| §4 ContextualTopBar (zones + Lucide) | 11 |
| §5 EditableBlock (4 états, curseurs, blur-save, focus-visible, drag, +Bloc, Trash2) | 7, 8 |
| §6 CodeEditorModal + portal stacking context | 9 |
| §7 SlideThumbnailList | 13 |
| §8 SlideEditCanvas | 13 |
| §9 CourseEditCanvas | 12 |
| §10 BuilderPage branch | 14 |
| §11 builderStore (activeSlideId, editingBlockId) | 1 |
| §12 Composants retirés | 14 |
| §13 Nouveaux composants | 2–13 |
| §15 Icônes Lucide | 11, 8 |
| §16.1 Navigation clavier | 8, 13, 15 |
| §16.2 Focus visible | 8, 11, 13 |
| §16.3 Erreurs role=alert | 8 |
| §16.4 alt distinct | 10 |
| §16.5 Échelle z-index (10/20/30/50) | 8, 9, 11 |
| §16.6 Touch targets 44px | 11 |
| §16.7 prefers-reduced-motion | 4, 13 |
| §16.8 transform GPU + debounce ResizeObserver (rAF) | 6 |

**Écarts assumés (à acter au suivi, hors v1) :**
- Édition inline **récursive** des blocs imbriqués dans un conteneur (section/callout) → v2 (Task 12 note).
- Dropdown complet de langage code et picker de fond de slide → boutons d'ouverture délégués v1 (Task 11/13 notes).
- DnD limité au réordonnancement **entre frères de même parent** (Task 8).
