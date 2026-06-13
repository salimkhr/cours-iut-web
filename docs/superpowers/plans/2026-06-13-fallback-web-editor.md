# Plan C — Fallback Web Editor : éditeur de blocs dans le navigateur

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le stub `BuilderPage` par un éditeur de blocs complet en split panel (arbre à gauche, iframe prévisualisation à droite) avec raccourcis clavier Ctrl+S / Ctrl+Z / Ctrl+Y / Ctrl+I.

**Architecture:** `useBuilderStore` (Plan A) comme source de vérité. Composants récursifs pour l'arbre de blocs. `BlockInsertDialog` pour Ctrl+I. Sauvegarde via la route API existante `PUT /api/admin/content/[...]`. Iframe rechargée après chaque save.

**Dépendances requises :** Plan A terminé (store avec undo/redo, bloc `section`).

**Tech Stack:** React 19, Zustand (`useBuilderStore`), TypeScript strict, shadcn/ui (Dialog, Select, Button, Input, Textarea, Checkbox), Tailwind CSS v4.

---

## Cartographie des fichiers

| Fichier | Action |
|---------|--------|
| `src/components/builder/BlockForm.tsx` | **Créer** — formulaire de props pour un bloc |
| `src/components/builder/BlockNode.tsx` | **Créer** — nœud récursif de l'arbre |
| `src/components/builder/BlockInsertDialog.tsx` | **Créer** — dialog de sélection de type de bloc (Ctrl+I) |
| `src/components/builder/EditorTree.tsx` | **Créer** — conteneur de l'arbre + gestion du scroll |
| `src/components/builder/EditorPreview.tsx` | **Créer** — iframe de prévisualisation |
| `src/components/builder/EditorToolbar.tsx` | **Créer** — toolbar (breadcrumb + badges + boutons) |
| `src/components/builder/hooks/useEditorShortcuts.ts` | **Créer** — Ctrl+S, Ctrl+Z, Ctrl+Y, Ctrl+I |
| `src/components/builder/BuilderPage.tsx` | **Réécrire** — composer les nouveaux composants |
| `src/components/builder/BuilderPageDynamic.tsx` | Inchangé (déjà simplifié Plan A) |

---

### Task 1 : Hook raccourcis clavier (`useEditorShortcuts`)

**Files:**
- Create: `src/components/builder/hooks/useEditorShortcuts.ts`

- [ ] **Étape 1 : Créer le répertoire hooks**

```powershell
New-Item -ItemType Directory -Force "src/components/builder/hooks"
```

- [ ] **Étape 2 : Créer `useEditorShortcuts.ts`**

```typescript
"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onInsert: () => void;
}

export function useEditorShortcuts({ onSave, onUndo, onRedo, onInsert }: ShortcutHandlers): void {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const ctrl = e.ctrlKey || e.metaKey;
            if (!ctrl) return;

            switch (e.key.toLowerCase()) {
                case "s":
                    e.preventDefault();
                    onSave();
                    break;
                case "z":
                    e.preventDefault();
                    onUndo();
                    break;
                case "y":
                    e.preventDefault();
                    onRedo();
                    break;
                case "i":
                    e.preventDefault();
                    onInsert();
                    break;
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSave, onUndo, onRedo, onInsert]);
}
```

- [ ] **Étape 3 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Étape 4 : Commit**

```powershell
git add src/components/builder/hooks/useEditorShortcuts.ts
git commit -m "feat(editor): hook useEditorShortcuts (Ctrl+S/Z/Y/I)"
```

---

### Task 2 : `BlockForm` — formulaire de props par bloc

**Files:**
- Create: `src/components/builder/BlockForm.tsx`

`BlockForm` utilise `fields: FieldDef[]` de la définition du bloc pour rendre les champs appropriés. Il réutilise `DynamicPropsEditor` existant.

- [ ] **Étape 1 : Lire `DynamicPropsEditor.tsx`**

Lire `src/components/builder/DynamicPropsEditor.tsx` pour comprendre son API. Il exporte un composant avec `props: Record<string, unknown>`, `fields: FieldDef[]`, `onChange: (key, value) => void` (ou similaire).

- [ ] **Étape 2 : Créer `BlockForm.tsx`**

`BlockForm` est un wrapper léger autour de `DynamicPropsEditor` avec un label pour le type de bloc :

```tsx
"use client";

import { getBlockDefinition } from "@/lib/blockRegistry";
import { DynamicPropsEditor } from "@/components/builder/DynamicPropsEditor";
import { useBuilderStore } from "@/lib/store/builderStore";

interface BlockFormProps {
    blockId: string;
}

export function BlockForm({ blockId }: BlockFormProps) {
    const block = useBuilderStore((s) => {
        // Chercher le bloc dans l'arbre (on utilise la sélection pour éviter un import de findBlock ici)
        function find(blocks: typeof s.blocks): typeof s.blocks[number] | undefined {
            for (const b of blocks) {
                if (b.id === blockId) return b;
                if (b.children) {
                    const found = find(b.children);
                    if (found) return found;
                }
            }
        }
        return find(s.blocks);
    });
    const updateBlock = useBuilderStore((s) => s.updateBlock);

    if (!block) return null;

    const def = getBlockDefinition(block.type);
    if (!def || def.fields.length === 0) {
        return (
            <p className="text-xs text-bridge-500 dark:text-bridge-400 px-3 py-2">
                Aucune prop à éditer pour ce type.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3 px-3 py-2">
            <DynamicPropsEditor
                fields={def.fields}
                props={block.props}
                moduleSlug=""
                onChange={(key, value) => updateBlock(blockId, { ...block.props, [key]: value })}
            />
        </div>
    );
}
```

Note : l'API exacte de `DynamicPropsEditor` doit être vérifiée en lisant le fichier. Adapter les props en conséquence (en particulier `moduleSlug` si requis pour `image-upload`).

- [ ] **Étape 3 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

- [ ] **Étape 4 : Commit**

```powershell
git add src/components/builder/BlockForm.tsx
git commit -m "feat(editor): BlockForm — formulaire de props par bloc"
```

---

### Task 3 : `BlockInsertDialog` — sélecteur de type de bloc (Ctrl+I)

**Files:**
- Create: `src/components/builder/BlockInsertDialog.tsx`

- [ ] **Étape 1 : Créer `BlockInsertDialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAllBlockDefinitions, createBlockInstance } from "@/lib/blockRegistry";
import { useBuilderStore } from "@/lib/store/builderStore";
import type { Block } from "@/types/CourseContent";

interface BlockInsertDialogProps {
    open: boolean;
    onClose: () => void;
    /** ID du parent dans lequel insérer. null = racine. */
    parentId: string | null;
    /** Index d'insertion dans la liste du parent. */
    index?: number;
}

export function BlockInsertDialog({ open, onClose, parentId, index }: BlockInsertDialogProps) {
    const insertBlock = useBuilderStore((s) => s.insertBlock);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const defs = getAllBlockDefinitions();

    function handleInsert(type: string) {
        const def = defs.find((d) => d.type === type);
        if (!def) return;
        const block = createBlockInstance(def);
        insertBlock(block, parentId, index);
        selectBlock(block.id);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold">Insérer un bloc</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 pt-2 max-h-72 overflow-y-auto">
                    {defs.map((def) => (
                        <Button
                            key={def.type}
                            variant="outline"
                            size="sm"
                            className="justify-start text-xs h-8 font-normal"
                            onClick={() => handleInsert(def.type)}
                        >
                            {def.label}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```powershell
git add src/components/builder/BlockInsertDialog.tsx
git commit -m "feat(editor): BlockInsertDialog — sélecteur de type de bloc"
```

---

### Task 4 : `BlockNode` — nœud récursif de l'arbre

**Files:**
- Create: `src/components/builder/BlockNode.tsx`

`BlockNode` affiche un bloc avec :
- En-tête (type + aperçu du contenu)
- `BlockForm` inline
- Bouton supprimer avec double confirmation 1.5 s
- Bouton "Ajouter un enfant" (si conteneur)
- Bouton "Ajouter après" (sibling)
- Pour `section` : repliable (chevron)
- Récursion sur les enfants

- [ ] **Étape 1 : Créer `BlockNode.tsx`**

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronDown, ChevronRight, Trash2, Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/store/builderStore";
import { isContainer } from "@/lib/blockSchemas";
import { getBlockDefinition, createBlockInstance } from "@/lib/blockRegistry";
import { BlockForm } from "@/components/builder/BlockForm";
import { BlockInsertDialog } from "@/components/builder/BlockInsertDialog";
import type { Block } from "@/types/CourseContent";

interface BlockNodeProps {
    block: Block;
    depth?: number;
    /** Index du bloc dans la liste de son parent (utilisé pour "Ajouter après"). */
    indexInParent: number;
    parentId: string | null;
}

export function BlockNode({ block, depth = 0, indexInParent, parentId }: BlockNodeProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [insertDialogOpen, setInsertDialogOpen] = useState(false);
    const [insertAfterOpen, setInsertAfterOpen] = useState(false);
    const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const deleteBlock = useBuilderStore((s) => s.deleteBlock);
    const selectedId = useBuilderStore((s) => s.selectedId);
    const selectBlock = useBuilderStore((s) => s.selectBlock);

    const isCollapsible = block.type === "section";
    const hasChildren = (block.children?.length ?? 0) > 0;
    const def = getBlockDefinition(block.type);

    const contentPreview = String(
        block.props.title ?? block.props.content ?? block.props.text ?? block.props.code ?? ""
    ).slice(0, 50);

    function handleDeleteClick() {
        if (confirmDelete) {
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
            deleteBlock(block.id);
        } else {
            setConfirmDelete(true);
            confirmTimer.current = setTimeout(() => setConfirmDelete(false), 1500);
        }
    }

    const isSelected = selectedId === block.id;

    return (
        <div
            className={cn(
                "border rounded-lg overflow-hidden transition-colors",
                isSelected
                    ? "border-brand-primary/60 bg-brand-primary/5"
                    : "border-bridge-300/40 dark:border-bridge-600/30 bg-bridge-50/60 dark:bg-bridge-800/40",
                depth > 0 && "ml-4"
            )}
        >
            {/* En-tête du nœud */}
            <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
                onClick={() => selectBlock(isSelected ? null : block.id)}
            >
                {isCollapsible && (
                    <button
                        className="text-bridge-400 hover:text-bridge-600 shrink-0"
                        onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }}
                        aria-label={collapsed ? "Déplier" : "Replier"}
                    >
                        {collapsed
                            ? <ChevronRight className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />
                        }
                    </button>
                )}
                <span className="text-[10px] font-mono text-brand-primary shrink-0 uppercase tracking-wide">
                    {def?.label ?? block.type}
                </span>
                {contentPreview && (
                    <span className="text-xs text-bridge-500 dark:text-bridge-400 truncate flex-1">
                        {contentPreview}
                    </span>
                )}
                <div className="flex items-center gap-1 shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                    {isContainer(block.type) && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-bridge-400 hover:text-brand-primary"
                            title="Ajouter un bloc enfant (Ctrl+I)"
                            onClick={() => setInsertDialogOpen(true)}
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-bridge-400 hover:text-brand-primary"
                        title="Ajouter un bloc après"
                        onClick={() => setInsertAfterOpen(true)}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                            "h-6 w-6 transition-colors",
                            confirmDelete
                                ? "text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20"
                                : "text-bridge-400 hover:text-red-500"
                        )}
                        title={confirmDelete ? "Confirmer la suppression" : "Supprimer ce bloc"}
                        onClick={handleDeleteClick}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Corps : formulaire + enfants */}
            {isSelected && !collapsed && (
                <div className="border-t border-bridge-300/30 dark:border-bridge-600/20">
                    <BlockForm blockId={block.id} />
                </div>
            )}

            {!collapsed && hasChildren && (
                <div className="flex flex-col gap-2 p-2 border-t border-bridge-300/30 dark:border-bridge-600/20">
                    {block.children!.map((child, i) => (
                        <BlockNode
                            key={child.id}
                            block={child}
                            depth={depth + 1}
                            indexInParent={i}
                            parentId={block.id}
                        />
                    ))}
                </div>
            )}

            {/* Dialogs d'insertion */}
            <BlockInsertDialog
                open={insertDialogOpen}
                onClose={() => setInsertDialogOpen(false)}
                parentId={block.id}
                index={Number.MAX_SAFE_INTEGER}
            />
            <BlockInsertDialog
                open={insertAfterOpen}
                onClose={() => setInsertAfterOpen(false)}
                parentId={parentId}
                index={indexInParent + 1}
            />
        </div>
    );
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

- [ ] **Étape 3 : Commit**

```powershell
git add src/components/builder/BlockNode.tsx
git commit -m "feat(editor): BlockNode — nœud récursif avec delete/insert/collapse"
```

---

### Task 5 : `EditorTree`, `EditorToolbar`, `EditorPreview`

**Files:**
- Create: `src/components/builder/EditorTree.tsx`
- Create: `src/components/builder/EditorToolbar.tsx`
- Create: `src/components/builder/EditorPreview.tsx`

- [ ] **Étape 1 : Créer `EditorTree.tsx`**

```tsx
"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockNode } from "@/components/builder/BlockNode";
import { useBuilderStore } from "@/lib/store/builderStore";

interface EditorTreeProps {
    onInsertAtRoot: () => void;
}

export function EditorTree({ onInsertAtRoot }: EditorTreeProps) {
    const blocks = useBuilderStore((s) => s.blocks);

    return (
        <div className="flex flex-col gap-2 p-3 overflow-y-auto h-full">
            {blocks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-bridge-500 dark:text-bridge-400">
                    <p className="text-sm">Aucun bloc. Commencez par en ajouter un.</p>
                    <Button size="sm" variant="outline" onClick={onInsertAtRoot} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Ajouter un bloc
                    </Button>
                </div>
            )}
            {blocks.map((block, i) => (
                <BlockNode
                    key={block.id}
                    block={block}
                    depth={0}
                    indexInParent={i}
                    parentId={null}
                />
            ))}
            {blocks.length > 0 && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 w-full gap-1.5 text-bridge-500 hover:text-brand-primary text-xs h-8"
                    onClick={onInsertAtRoot}
                >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un bloc à la racine
                </Button>
            )}
        </div>
    );
}
```

- [ ] **Étape 2 : Créer `EditorToolbar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Save, Loader2, AlertCircle, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/store/builderStore";

interface EditorToolbarProps {
    moduleTitle: string;
    sectionTitle: string;
    contentType: string;
    source: "file" | "db";
    saving: boolean;
    onSave: () => void;
}

export function EditorToolbar({
    moduleTitle,
    sectionTitle,
    contentType,
    source,
    saving,
    onSave,
}: EditorToolbarProps) {
    const isDirty = useBuilderStore((s) => s.isDirty);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const canUndo = useBuilderStore((s) => s._history.length > 0);
    const canRedo = useBuilderStore((s) => s._future.length > 0);

    return (
        <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm">
            {/* Breadcrumb */}
            <Link
                href="/admin"
                className="flex items-center gap-1 text-xs font-medium text-bridge-500 dark:text-bridge-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors shrink-0"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
                Admin
            </Link>
            <div className="w-px h-8 bg-bridge-400/25 dark:bg-bridge-500/30 shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
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

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                {isDirty && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-bridge-400 dark:text-bridge-500 mr-1">
                        <AlertCircle className="w-3 h-3" />
                        Non sauvegardé
                    </span>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-bridge-400 hover:text-brand-primary disabled:opacity-30"
                    disabled={!canUndo}
                    title="Annuler (Ctrl+Z)"
                    onClick={undo}
                >
                    <Undo2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-bridge-400 hover:text-brand-primary disabled:opacity-30"
                    disabled={!canRedo}
                    title="Refaire (Ctrl+Y)"
                    onClick={redo}
                >
                    <Redo2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={!isDirty || saving}
                    className={cn(
                        "gap-1.5 h-8 text-xs transition-all ml-1",
                        isDirty
                            ? "bg-brand-primary hover:bg-brand-accent-dark text-brand-light shadow-sm"
                            : "opacity-40 cursor-default"
                    )}
                >
                    {saving
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde…</>
                        : <><Save className="w-3.5 h-3.5" /> Sauvegarder</>
                    }
                </Button>
            </div>
        </header>
    );
}
```

- [ ] **Étape 3 : Créer `EditorPreview.tsx`**

```tsx
"use client";

import { useImperativeHandle, forwardRef, useRef } from "react";

interface EditorPreviewRef {
    reload: () => void;
}

interface EditorPreviewProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export const EditorPreview = forwardRef<EditorPreviewRef, EditorPreviewProps>(
    function EditorPreview({ moduleSlug, sectionSlug, contentType }, ref) {
        const iframeRef = useRef<HTMLIFrameElement>(null);

        useImperativeHandle(ref, () => ({
            reload() {
                if (iframeRef.current) {
                    iframeRef.current.src = iframeRef.current.src;
                }
            },
        }));

        const previewUrl = `/${moduleSlug}/${sectionSlug}/${contentType}`;

        return (
            <div className="flex flex-col h-full bg-white dark:bg-bridge-950 border-l border-bridge-300/40 dark:border-bridge-600/30">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-bridge-300/30 dark:border-bridge-600/20 bg-bridge-50/80 dark:bg-bridge-900/80">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-bridge-400 dark:text-bridge-500">
                        Aperçu
                    </span>
                    <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-bridge-400 hover:text-brand-primary transition-colors ml-auto"
                    >
                        Ouvrir ↗
                    </a>
                </div>
                <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    title="Aperçu du contenu"
                    className="flex-1 w-full border-0"
                />
            </div>
        );
    }
);
```

- [ ] **Étape 4 : Vérifier TypeScript**

```powershell
bunx tsc --noEmit
```

- [ ] **Étape 5 : Commit**

```powershell
git add src/components/builder/EditorTree.tsx src/components/builder/EditorToolbar.tsx src/components/builder/EditorPreview.tsx
git commit -m "feat(editor): EditorTree, EditorToolbar, EditorPreview"
```

---

### Task 6 : `BuilderPage` — composition finale

**Files:**
- Rewrite: `src/components/builder/BuilderPage.tsx`

- [ ] **Étape 1 : Réécrire `BuilderPage.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/store/builderStore";
import { EditorToolbar } from "@/components/builder/EditorToolbar";
import { EditorTree } from "@/components/builder/EditorTree";
import { EditorPreview } from "@/components/builder/EditorPreview";
import { BlockInsertDialog } from "@/components/builder/BlockInsertDialog";
import { useEditorShortcuts } from "@/components/builder/hooks/useEditorShortcuts";
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

export function BuilderPage({
    moduleSlug,
    sectionSlug,
    contentType,
    moduleTitle,
    sectionTitle,
    initialBlocks,
    source,
}: BuilderPageProps) {
    const { isDirty, setBlocks, markSaved, undo, redo } = useBuilderStore();
    const [saving, setSaving] = useState(false);
    const [insertDialogOpen, setInsertDialogOpen] = useState(false);
    const previewRef = useRef<{ reload: () => void } | null>(null);

    // Initialiser les blocs au montage
    useEffect(() => {
        setBlocks(initialBlocks);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Avertir avant de quitter si modifications non sauvegardées
    useEffect(() => {
        if (!isDirty) return;
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            e.preventDefault();
            e.returnValue = "";
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const handleSave = useCallback(async () => {
        if (!isDirty || saving) return;
        setSaving(true);
        try {
            const blocks = useBuilderStore.getState().blocks;
            const res = await fetch(
                `/api/admin/content/${moduleSlug}/${sectionSlug}/${contentType}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ blocks }),
                }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => null) as { error?: string } | null;
                throw new Error(body?.error ?? `HTTP ${res.status}`);
            }
            markSaved();
            toast.success("Contenu sauvegardé.");
            previewRef.current?.reload();
        } catch (err) {
            toast.error("Échec de la sauvegarde", {
                description: err instanceof Error ? err.message : "Erreur inconnue",
            });
        } finally {
            setSaving(false);
        }
    }, [isDirty, saving, moduleSlug, sectionSlug, contentType, markSaved]);

    useEditorShortcuts({
        onSave: handleSave,
        onUndo: undo,
        onRedo: redo,
        onInsert: () => setInsertDialogOpen(true),
    });

    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden">
            <EditorToolbar
                moduleTitle={moduleTitle}
                sectionTitle={sectionTitle}
                contentType={contentType}
                source={source}
                saving={saving}
                onSave={() => void handleSave()}
            />

            {/* Split panel */}
            <div className="flex flex-1 min-h-0">
                {/* Panneau gauche — arbre de blocs */}
                <div className="w-[420px] min-w-[280px] max-w-[600px] flex flex-col border-r border-bridge-300/40 dark:border-bridge-600/30 overflow-hidden bg-bridge-50/40 dark:bg-bridge-900/40">
                    <EditorTree
                        onInsertAtRoot={() => setInsertDialogOpen(true)}
                    />
                </div>

                {/* Panneau droit — prévisualisation */}
                <div className="flex-1 min-w-0">
                    <EditorPreview
                        ref={previewRef}
                        moduleSlug={moduleSlug}
                        sectionSlug={sectionSlug}
                        contentType={contentType}
                    />
                </div>
            </div>

            {/* Dialog d'insertion globale (Ctrl+I) */}
            <BlockInsertDialog
                open={insertDialogOpen}
                onClose={() => setInsertDialogOpen(false)}
                parentId={null}
                index={Number.MAX_SAFE_INTEGER}
            />
        </div>
    );
}
```

Note : `useBuilderStore.getState().blocks` permet de lire l'état courant dans `handleSave` sans dépendance sur la variable de state (évite les closure stale).

- [ ] **Étape 2 : Vérifier TypeScript + ESLint**

```powershell
bunx tsc --noEmit
bun run lint
```

Expected : aucune erreur.

- [ ] **Étape 3 : Commit**

```powershell
git add src/components/builder/BuilderPage.tsx
git commit -m "feat(editor): BuilderPage — éditeur split panel complet"
```

---

### Task 7 : Vérification end-to-end

**Files:**
- Aucun nouveau fichier — vérification uniquement.

- [ ] **Étape 1 : Build complet**

```powershell
bun run build
```

Expected : build réussi sans erreur TypeScript.

- [ ] **Étape 2 : Démarrer en dev**

```powershell
bun dev
```

- [ ] **Étape 3 : Tester le chemin principal**

1. Aller sur `/admin`
2. Cliquer sur un contenu (ex: `javascript > 1-le-dom > cours`)
3. Vérifier :
   - Le split panel s'affiche (arbre à gauche, iframe à droite)
   - Les blocs existants apparaissent dans l'arbre
   - Cliquer sur un bloc affiche son formulaire
   - Modifier un champ met `isDirty` à true (badge "Non sauvegardé" visible)
   - `Ctrl+Z` annule la modification
   - `Ctrl+Y` refait
   - `Ctrl+I` ouvre le dialog de sélection de type de bloc
   - Insérer un bloc `text` l'ajoute dans l'arbre
   - `Ctrl+S` sauvegarde et recharge l'iframe

- [ ] **Étape 4 : Tester la suppression**

1. Sélectionner un bloc
2. Cliquer sur Trash2 → le bouton devient rouge
3. Cliquer à nouveau dans les 1.5 s → le bloc est supprimé
4. `Ctrl+Z` → le bloc est restauré

- [ ] **Étape 5 : Commit final**

```powershell
git add -A
git commit -m "chore(editor): vérification end-to-end — fallback web editor opérationnel"
```

---

## Self-Review

### Couverture spec (vs `docs/superpowers/specs/2026-06-13-new-editor-design.md`)

| Exigence spec | Tâche | Statut |
|---------------|-------|--------|
| Split panel (arbre gauche, iframe droite) | Task 5-6 | ✅ |
| Toolbar fil d'Ariane + badge source + Non sauvegardé | Task 5 | ✅ |
| Arbre récursif avec indentation | Task 4 | ✅ |
| `section` repliable avec chevron | Task 4 | ✅ |
| Formulaire inline par bloc | Task 2-4 | ✅ |
| Bouton supprimer avec double confirmation 1.5 s | Task 4 | ✅ |
| Ajouter enfant + ajouter après (sibling) | Task 4 | ✅ |
| Ctrl+S sauvegarde | Task 6 | ✅ |
| Ctrl+Z undo | Task 1 + 6 | ✅ |
| Ctrl+Y redo | Task 1 + 6 | ✅ |
| Ctrl+I ouvre sélecteur de bloc | Task 1 + 3 + 6 | ✅ |
| Sauvegarde → PUT route existante | Task 6 | ✅ |
| Sauvegarde → reload iframe | Task 5 + 6 | ✅ |
| Indicateurs undo/redo disponibles | Task 5 (boutons Undo2/Redo2 disabled) | ✅ |
| Drag & drop NON inclus (spec §7) | — | ✅ (pas implémenté) |

### Cohérence des types
- `BuilderPageProps` identique à la version stub (Plan A) — `BuilderPageDynamic` n'a pas besoin d'être modifié.
- `EditorPreview` utilise `forwardRef<EditorPreviewRef, Props>` — le ref est typé correctement.
- `useBuilderStore.getState().blocks` contourne le problème de closure stale dans `handleSave`.
- `_history` et `_future` sont accédés en lecture seule dans `EditorToolbar` pour les boutons disabled.
