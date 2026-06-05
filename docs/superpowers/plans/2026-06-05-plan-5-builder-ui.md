# Cours Builder — Plan 5 : Builder UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer l'interface builder admin WYSIWYG : store Zustand, formulaire dynamique, panneau props, palette de blocs, canvas éditabl avec drag & drop, panneau assistant IA, et la page admin `/admin/content/[moduleSlug]/[sectionSlug]/[contentType]`.

**Architecture:** La page est un Server Component qui charge les données initiales et les passe à `BuilderCanvas` (Client Component). L'état local est dans Zustand (`builderStore`). Le panneau props utilise `shadcn/ui Sheet`. La palette de blocs utilise `shadcn/ui Dialog`. Le drag & drop utilise `@dnd-kit/core` + `@dnd-kit/sortable`. Le toast de confirmation utilise `sonner` (déjà installé via `shadcn/ui`).

**Tech Stack:** React, Zustand, `@dnd-kit/core`, `@dnd-kit/sortable`, `shadcn/ui Sheet`, `shadcn/ui Dialog`, `sonner`.

**Prérequis :** Plans 1, 2, 3 et 4 complétés.

---

### Task 1 : Installer `@dnd-kit`

**Files:**
- Modify: `package.json` (via bun add)

- [ ] **Installer les packages de drag & drop**

```bash
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Vérifier**

```bash
bun run build
```
Attendu : build réussi.

- [ ] **Commit**

```bash
git add package.json bun.lockb
git commit -m "feat(builder): add @dnd-kit dependencies"
```

---

### Task 2 : Store Zustand `builderStore`

**Files:**
- Create: `src/lib/store/builderStore.ts`

- [ ] **Créer `src/lib/store/builderStore.ts`**

```typescript
import { create } from "zustand";
import type { Block } from "@/types/CourseContent";

interface BuilderStore {
    blocks: Block[];
    selectedId: string | null;
    isDirty: boolean;
    setBlocks: (blocks: Block[]) => void;
    selectBlock: (id: string | null) => void;
    updateBlock: (id: string, props: Record<string, unknown>, colSpan?: "full" | "half") => void;
    insertBlock: (block: Block, position?: number) => void;
    deleteBlock: (id: string) => void;
    moveBlock: (id: string, direction: "up" | "down") => void;
    reorderBlocks: (orderedIds: string[]) => void;
    markSaved: () => void;
}

export const useBuilderStore = create<BuilderStore>()((set) => ({
    blocks: [],
    selectedId: null,
    isDirty: false,

    setBlocks: (blocks) => set({ blocks, isDirty: false }),

    selectBlock: (id) => set({ selectedId: id }),

    updateBlock: (id, props, colSpan) =>
        set((state) => ({
            blocks: state.blocks.map((b) =>
                b.id === id
                    ? { ...b, props, ...(colSpan !== undefined ? { colSpan } : {}) }
                    : b
            ),
            isDirty: true,
        })),

    insertBlock: (block, position) =>
        set((state) => {
            const next = [...state.blocks];
            const idx = position !== undefined
                ? Math.min(position, next.length)
                : next.length;
            next.splice(idx, 0, block);
            return { blocks: next, isDirty: true };
        }),

    deleteBlock: (id) =>
        set((state) => ({
            blocks: state.blocks.filter((b) => b.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
            isDirty: true,
        })),

    moveBlock: (id, direction) =>
        set((state) => {
            const idx = state.blocks.findIndex((b) => b.id === id);
            if (idx === -1) return state;
            const next = [...state.blocks];
            const targetIdx = direction === "up" ? idx - 1 : idx + 1;
            if (targetIdx < 0 || targetIdx >= next.length) return state;
            [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
            return { blocks: next, isDirty: true };
        }),

    reorderBlocks: (orderedIds) =>
        set((state) => {
            const map = new Map(state.blocks.map((b) => [b.id, b]));
            const next = orderedIds.map((id) => map.get(id)).filter(Boolean) as Block[];
            return { blocks: next, isDirty: true };
        }),

    markSaved: () => set({ isDirty: false }),
}));
```

- [ ] **Vérifier**

```bash
bun run lint src/lib/store/builderStore.ts
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/lib/store/builderStore.ts
git commit -m "feat(builder): add Zustand builderStore"
```

---

### Task 3 : `DynamicPropsEditor` — formulaire générique

**Files:**
- Create: `src/components/builder/DynamicPropsEditor.tsx`

Ce composant reçoit `fields: FieldDef[]` et `props: Record<string, unknown>` et génère automatiquement le formulaire.

- [ ] **Créer `src/components/builder/DynamicPropsEditor.tsx`**

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { FieldDef } from "@/lib/blockRegistry";

interface DynamicPropsEditorProps {
    fields: FieldDef[];
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}

export function DynamicPropsEditor({ fields, props, onChange }: DynamicPropsEditorProps) {
    function set(key: string, value: unknown) {
        onChange({ ...props, [key]: value });
    }

    return (
        <div className="flex flex-col gap-4">
            {fields.map((field) => {
                const value = props[field.key];

                if (field.type === "textarea") {
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Textarea
                                id={field.key}
                                value={String(value ?? "")}
                                placeholder={field.placeholder}
                                onChange={(e) => set(field.key, e.target.value)}
                                rows={4}
                            />
                        </div>
                    );
                }

                if (field.type === "number") {
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Input
                                id={field.key}
                                type="number"
                                value={String(value ?? "")}
                                placeholder={field.placeholder}
                                onChange={(e) => set(field.key, Number(e.target.value))}
                            />
                        </div>
                    );
                }

                if (field.type === "select" && field.options) {
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Select
                                value={String(value ?? field.options[0])}
                                onValueChange={(v) => set(field.key, v)}
                            >
                                <SelectTrigger id={field.key}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    );
                }

                if (field.type === "boolean") {
                    return (
                        <div key={field.key} className="flex items-center gap-2">
                            <Switch
                                id={field.key}
                                checked={Boolean(value)}
                                onCheckedChange={(checked) => set(field.key, checked)}
                            />
                            <Label htmlFor={field.key}>{field.label}</Label>
                        </div>
                    );
                }

                if (field.type === "array-of-strings") {
                    const items = (value as string[] | undefined) ?? [];
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label>{field.label}</Label>
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => {
                                            const next = [...items];
                                            next[i] = e.target.value;
                                            set(field.key, next);
                                        }}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => set(field.key, items.filter((_, j) => j !== i))}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => set(field.key, [...items, ""])}
                            >
                                + Ajouter
                            </Button>
                        </div>
                    );
                }

                // Défaut : text
                return (
                    <div key={field.key} className="flex flex-col gap-1">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                            id={field.key}
                            type="text"
                            value={String(value ?? "")}
                            placeholder={field.placeholder}
                            onChange={(e) => set(field.key, e.target.value)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
```

- [ ] **Vérifier**

```bash
bun run lint src/components/builder/DynamicPropsEditor.tsx
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/builder/DynamicPropsEditor.tsx
git commit -m "feat(builder): add DynamicPropsEditor driven by FieldDef[]"
```

---

### Task 4 : `PropsPanel` — panneau propriétés

**Files:**
- Create: `src/components/builder/PropsPanel.tsx`

Le panneau s'affiche quand un bloc est sélectionné. Utilise `shadcn/ui Sheet` (déjà disponible dans `src/components/ui/sheet.tsx`).

- [ ] **Créer `src/components/builder/PropsPanel.tsx`**

```typescript
"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DynamicPropsEditor } from "@/components/builder/DynamicPropsEditor";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import type { Block } from "@/types/CourseContent";
import { useState } from "react";

interface PropsPanelProps {
    isFixed: boolean;
}

export function PropsPanel({ isFixed }: PropsPanelProps) {
    const { blocks, selectedId, selectBlock, updateBlock, deleteBlock, moveBlock } =
        useBuilderStore();

    const block = blocks.find((b) => b.id === selectedId) as Block | undefined;
    const def = block ? getBlockDefinition(block.type) : undefined;

    // État local pour édition avant "Appliquer"
    const [draftProps, setDraftProps] = useState<Record<string, unknown>>(
        block?.props ?? {}
    );
    const [draftColSpan, setDraftColSpan] = useState<"full" | "half">(
        block?.colSpan ?? "full"
    );

    // Synchroniser le draft quand le bloc sélectionné change
    const prevId = useState(selectedId)[0];
    if (prevId !== selectedId && block) {
        setDraftProps(block.props);
        setDraftColSpan(block.colSpan ?? "full");
    }

    function handleApply() {
        if (!block) return;
        updateBlock(block.id, draftProps, draftColSpan);
    }

    function handleDelete() {
        if (!block) return;
        deleteBlock(block.id);
        selectBlock(null);
    }

    const content = (
        <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <SheetTitle className="text-sm font-semibold uppercase tracking-wider text-primary">
                        {def?.label ?? block?.type ?? "—"}
                    </SheetTitle>
                    {block && (
                        <Badge variant="outline" className="text-xs">
                            {block.type}
                        </Badge>
                    )}
                </div>
            </SheetHeader>

            <Separator />

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {block && def ? (
                    <>
                        <DynamicPropsEditor
                            fields={def.fields}
                            props={draftProps}
                            onChange={setDraftProps}
                        />

                        <Separator className="my-4" />

                        <div className="flex flex-col gap-1">
                            <Label>Largeur</Label>
                            <Select
                                value={draftColSpan}
                                onValueChange={(v) => setDraftColSpan(v as "full" | "half")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full">■ Pleine largeur</SelectItem>
                                    <SelectItem value="half">◧ Moitié</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveBlock(block.id, "up")}
                                title="Monter"
                            >
                                ↑
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveBlock(block.id, "down")}
                                title="Descendre"
                            >
                                ↓
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Cliquez sur un bloc pour l&apos;éditer.
                    </p>
                )}
            </div>

            {block && (
                <div className="px-4 pb-4 pt-2 border-t flex gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={handleDelete}
                    >
                        🗑 Suppr.
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleApply}>
                        ✓ Appliquer
                    </Button>
                </div>
            )}
        </div>
    );

    if (isFixed) {
        return (
            <div className="w-64 border-l bg-card flex-shrink-0 h-full overflow-hidden">
                {content}
            </div>
        );
    }

    return (
        <Sheet open={!!selectedId} onOpenChange={(open) => !open && selectBlock(null)}>
            <SheetContent side="right" className="w-72 p-0">
                {content}
            </SheetContent>
        </Sheet>
    );
}
```

> **Note technique :** Le `useState(prevId)` pour synchroniser le draft est une astuce React valide car l'état est mis à jour pendant le rendu (same-render update). C'est le pattern idiomatique quand on dérive de l'état d'un store externe. Si le lint signale un problème, utiliser `useEffect` à la place :
>
> ```typescript
> useEffect(() => {
>     if (block) {
>         setDraftProps(block.props);
>         setDraftColSpan(block.colSpan ?? "full");
>     }
> }, [selectedId, block]);
> ```

- [ ] **Vérifier**

```bash
bun run lint src/components/builder/PropsPanel.tsx
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/builder/PropsPanel.tsx
git commit -m "feat(builder): add PropsPanel with Sheet/fixed layout"
```

---

### Task 5 : `BlockPalette` — dialogue d'ajout de bloc

**Files:**
- Create: `src/components/builder/BlockPalette.tsx`

- [ ] **Créer `src/components/builder/BlockPalette.tsx`**

```typescript
"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllBlockDefinitions } from "@/lib/blockRegistry";
import type { BlockDefinition } from "@/lib/blockRegistry";

interface BlockPaletteProps {
    open: boolean;
    onClose: () => void;
    onSelect: (def: BlockDefinition) => void;
}

export function BlockPalette({ open, onClose, onSelect }: BlockPaletteProps) {
    const [search, setSearch] = useState("");
    const definitions = getAllBlockDefinitions();

    const filtered = definitions.filter(
        (d) =>
            d.label.toLowerCase().includes(search.toLowerCase()) ||
            d.type.toLowerCase().includes(search.toLowerCase())
    );

    function handleSelect(def: BlockDefinition) {
        onSelect(def);
        onClose();
        setSearch("");
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter un bloc</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="🔍 Rechercher un type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {filtered.map((def) => (
                        <Button
                            key={def.type}
                            variant="outline"
                            className="justify-start h-auto py-3 px-3 text-sm"
                            onClick={() => handleSelect(def)}
                        >
                            <span className="font-medium">{def.label}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                                ({def.type})
                            </span>
                        </Button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                            Aucun type correspondant.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Vérifier**

```bash
bun run lint src/components/builder/BlockPalette.tsx
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/builder/BlockPalette.tsx
git commit -m "feat(builder): add BlockPalette dialog"
```

---

### Task 6 : `BuilderCanvas` — zone de rendu éditable avec drag & drop

**Files:**
- Create: `src/components/builder/BuilderCanvas.tsx`

C'est le composant central du builder. Il affiche les blocs rendus avec leurs handles de sélection/déplacement. Utilise `@dnd-kit/sortable` pour le drag & drop.

- [ ] **Créer `src/components/builder/BuilderCanvas.tsx`**

```typescript
"use client";

import { useCallback, useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "@/lib/store/builderStore";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { getNamedComponent } from "@/lib/namedComponents";
import { BlockPalette } from "@/components/builder/BlockPalette";
import type { Block } from "@/types/CourseContent";
import type { BlockDefinition } from "@/lib/blockRegistry";
import { v4 as uuidv4 } from "uuid";

// ── Bloc rendu avec handle ────────────────────────────────────────────────────

function SortableBlock({
    block,
    isSelected,
    onSelect,
    onInsertAfter,
}: {
    block: Block;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onInsertAfter: (afterId: string) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    // Rendu du contenu du bloc
    let BlockContent: React.ReactNode;
    if (block.type === "named-component") {
        const name = String(block.props?.name ?? "");
        const Component = getNamedComponent(name);
        BlockContent = Component
            ? <Component />
            : <div className="text-muted-foreground text-sm border border-dashed rounded p-3">⚡ {name}</div>;
    } else {
        const def = getBlockDefinition(block.type);
        if (def) {
            const Render = def.render;
            BlockContent = <Render {...block.props} />;
        } else {
            BlockContent = <div className="text-muted-foreground text-sm">Bloc inconnu : {block.type}</div>;
        }
    }

    return (
        <div ref={setNodeRef} style={style}>
            {/* Bouton + avant le bloc (visible au survol) */}
            <div
                className="flex items-center gap-2 my-1 opacity-0 hover:opacity-100 transition-opacity group"
                onMouseEnter={() => setHovered(false)}
            >
                <div className="flex-1 h-px bg-border" />
                <button
                    className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center hover:scale-110 transition-transform"
                    onClick={() => onInsertAfter(block.id)}
                    title="Insérer un bloc ici"
                >
                    +
                </button>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* Bloc avec outline de sélection */}
            <div
                className={[
                    "relative group rounded-lg transition-all cursor-pointer",
                    isSelected
                        ? "ring-2 ring-primary ring-offset-1"
                        : "ring-1 ring-transparent hover:ring-border",
                ].join(" ")}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => onSelect(block.id)}
            >
                {/* Badge type (visible au survol/sélection) */}
                {(hovered || isSelected) && (
                    <div className="absolute -top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {block.type}
                    </div>
                )}

                {/* Handle drag (visible au survol) */}
                {(hovered || isSelected) && (
                    <button
                        className="absolute right-2 top-2 z-10 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing text-sm"
                        {...attributes}
                        {...listeners}
                        title="Déplacer"
                    >
                        ⠿
                    </button>
                )}

                <div className="p-2">{BlockContent}</div>
            </div>
        </div>
    );
}

// ── BuilderCanvas ─────────────────────────────────────────────────────────────

interface BuilderCanvasProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export function BuilderCanvas({ moduleSlug, sectionSlug, contentType }: BuilderCanvasProps) {
    const { blocks, selectedId, selectBlock, insertBlock, reorderBlocks } = useBuilderStore();
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [insertAfterIndex, setInsertAfterIndex] = useState<number | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIds = blocks.map((b) => b.id);
        const oldIndex = oldIds.indexOf(String(active.id));
        const newIndex = oldIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;
        const newIds = [...oldIds];
        newIds.splice(oldIndex, 1);
        newIds.splice(newIndex, 0, String(active.id));
        reorderBlocks(newIds);
    }

    function openPaletteAfter(blockId: string) {
        const idx = blocks.findIndex((b) => b.id === blockId);
        setInsertAfterIndex(idx + 1);
        setPaletteOpen(true);
    }

    function openPaletteAtEnd() {
        setInsertAfterIndex(undefined);
        setPaletteOpen(true);
    }

    const handlePaletteSelect = useCallback(
        (def: BlockDefinition) => {
            const newBlock: Block = {
                id: uuidv4(),
                type: def.type,
                props: { ...def.defaultProps },
                colSpan: "full",
            };
            insertBlock(newBlock, insertAfterIndex);
            selectBlock(newBlock.id);
        },
        [insertBlock, selectBlock, insertAfterIndex]
    );

    // Regrouper les blocs half en grilles pour le canvas
    const colSpanGroups: (Block | [Block, Block])[] = [];
    let i = 0;
    while (i < blocks.length) {
        if (
            blocks[i].colSpan === "half" &&
            blocks[i + 1]?.colSpan === "half"
        ) {
            colSpanGroups.push([blocks[i], blocks[i + 1]]);
            i += 2;
        } else {
            colSpanGroups.push(blocks[i]);
            i += 1;
        }
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {blocks.length === 0 && (
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground cursor-pointer hover:border-primary transition-colors"
                            onClick={openPaletteAtEnd}
                        >
                            Cliquez pour ajouter le premier bloc
                        </div>
                    )}

                    {colSpanGroups.map((item, groupIndex) => {
                        if (Array.isArray(item)) {
                            // Paire de blocs half
                            return (
                                <div key={`group-${groupIndex}`} className="grid grid-cols-2 gap-4">
                                    {item.map((block) => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            isSelected={selectedId === block.id}
                                            onSelect={selectBlock}
                                            onInsertAfter={openPaletteAfter}
                                        />
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <SortableBlock
                                key={item.id}
                                block={item}
                                isSelected={selectedId === item.id}
                                onSelect={selectBlock}
                                onInsertAfter={openPaletteAfter}
                            />
                        );
                    })}
                </SortableContext>
            </DndContext>

            {/* Bouton + en bas de liste */}
            {blocks.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-px bg-border" />
                    <button
                        className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center hover:scale-110 transition-transform"
                        onClick={openPaletteAtEnd}
                        title="Ajouter un bloc à la fin"
                    >
                        +
                    </button>
                    <div className="flex-1 h-px bg-border" />
                </div>
            )}

            <BlockPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                onSelect={handlePaletteSelect}
            />
        </div>
    );
}
```

> **Note :** `uuid` est utilisé pour générer les IDs de blocs. Vérifier s'il est déjà installé avec `grep uuid package.json`. Si non, installer avec `bun add uuid @types/uuid`.

- [ ] **Vérifier que `uuid` est disponible**

```bash
grep '"uuid"' package.json
```
Si absent :
```bash
bun add uuid @types/uuid
git add package.json bun.lockb
git commit -m "feat(builder): add uuid dependency"
```

- [ ] **Vérifier le composant**

```bash
bun run lint src/components/builder/BuilderCanvas.tsx
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/builder/BuilderCanvas.tsx
git commit -m "feat(builder): add BuilderCanvas with drag-and-drop"
```

---

### Task 7 : `AiAssistantPanel` — assistant IA flottant

**Files:**
- Create: `src/components/builder/AiAssistantPanel.tsx`
- Create: `src/app/api/admin/content/ai-assist/route.ts`

L'assistant reçoit un message de l'admin, appelle l'API Anthropic avec tool use (tools = actions sur les blocs), exécute les tool calls contre les API Routes, et retourne la réponse finale. Le store Zustand est mis à jour côté client avec les nouveaux blocs.

- [ ] **Créer `src/app/api/admin/content/ai-assist/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import type { Block, CourseContent } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

// Appel Anthropic via fetch direct (pas de SDK pour garder la dépendance minimale)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

const TOOLS = [
    {
        name: "update_blocks",
        description: "Remplace entièrement la liste de blocs du contenu ouvert dans le builder.",
        input_schema: {
            type: "object",
            properties: {
                blocks: {
                    type: "array",
                    description: "Nouveau tableau complet de blocs",
                    items: {
                        type: "object",
                        properties: {
                            id:      { type: "string" },
                            type:    { type: "string" },
                            props:   { type: "object" },
                            colSpan: { type: "string", enum: ["full", "half"] },
                        },
                        required: ["id", "type", "props"],
                    },
                },
            },
            required: ["blocks"],
        },
    },
];

export const POST = withAdmin(async (req: Request) => {
    if (!ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: "ANTHROPIC_API_KEY non défini" }, { status: 500 });
    }

    try {
        const body = await req.json() as {
            message: string;
            currentBlocks: Block[];
            moduleSlug: string;
            sectionSlug: string;
            contentType: string;
        };

        const systemPrompt = `Tu es un assistant qui aide à construire du contenu pédagogique.
Tu as accès au tool update_blocks pour modifier les blocs du cours ouvert.
Types de blocs disponibles : text, heading, list, image-card, table, section-card, named-component.
Blocs actuels :
${JSON.stringify(body.currentBlocks, null, 2)}`;

        // Appel Anthropic
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 4096,
                system: systemPrompt,
                tools: TOOLS,
                messages: [{ role: "user", content: body.message }],
            }),
        });

        if (!anthropicRes.ok) {
            const err = await anthropicRes.text();
            return NextResponse.json({ error: `Anthropic error: ${err}` }, { status: 500 });
        }

        const anthropicData = await anthropicRes.json() as {
            content: Array<{
                type: string;
                text?: string;
                name?: string;
                input?: { blocks: Block[] };
            }>;
        };

        let newBlocks: Block[] | null = null;
        let assistantText = "";

        for (const part of anthropicData.content) {
            if (part.type === "text" && part.text) {
                assistantText = part.text;
            }
            if (part.type === "tool_use" && part.name === "update_blocks" && part.input) {
                newBlocks = part.input.blocks;

                // Valider et sauvegarder en DB
                const db = await connectToDB();
                const now = new Date();

                for (const block of newBlocks) {
                    const def = getBlockDefinition(block.type);
                    if (def) {
                        const parsed = def.schema.safeParse(block.props);
                        if (!parsed.success) continue;
                    }
                }

                const existing = await db
                    .collection<CourseContent>("course_content")
                    .findOne({ moduleSlug: body.moduleSlug, sectionSlug: body.sectionSlug, contentType: body.contentType });

                if (existing) {
                    await db.collection<CourseContent>("course_content").updateOne(
                        { _id: existing._id },
                        { $set: { blocks: newBlocks, updatedAt: now }, $inc: { version: 1 } }
                    );
                } else {
                    await db.collection<CourseContent>("course_content").insertOne({
                        moduleSlug: body.moduleSlug,
                        sectionSlug: body.sectionSlug,
                        contentType: body.contentType as "cours" | "TP" | "examen",
                        blocks: newBlocks,
                        version: 1,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
        }

        return NextResponse.json({ text: assistantText, blocks: newBlocks });
    } catch (error) {
        console.error("[ai-assist]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
```

- [ ] **Créer `src/components/builder/AiAssistantPanel.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore } from "@/lib/store/builderStore";

interface AiAssistantPanelProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export function AiAssistantPanel({ moduleSlug, sectionSlug, contentType }: AiAssistantPanelProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const { blocks, setBlocks } = useBuilderStore();

    async function handleSend() {
        if (!message.trim()) return;
        setLoading(true);
        setResponse("");

        try {
            const res = await fetch("/api/admin/content/ai-assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    currentBlocks: blocks,
                    moduleSlug,
                    sectionSlug,
                    contentType,
                }),
            });
            const data = await res.json() as { text: string; blocks?: typeof blocks };
            setResponse(data.text || "Fait.");
            if (data.blocks) {
                setBlocks(data.blocks);
            }
        } catch {
            setResponse("Erreur de communication avec l'assistant.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Bouton flottant ✦ */}
            <button
                className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-lg"
                onClick={() => setOpen((v) => !v)}
                title="Assistant IA"
            >
                ✦
            </button>

            {/* Panneau flottant */}
            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-80 bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="font-semibold text-sm">Assistant IA</span>
                        <button
                            className="text-muted-foreground hover:text-foreground text-lg"
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="p-3 flex flex-col gap-3">
                        <Textarea
                            placeholder="Ex : Ajoute 3 blocs texte expliquant le DOM..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.metaKey) handleSend();
                            }}
                        />

                        {response && (
                            <div className="text-sm text-muted-foreground bg-muted rounded p-2">
                                {response}
                            </div>
                        )}

                        <Button
                            size="sm"
                            onClick={handleSend}
                            disabled={loading || !message.trim()}
                        >
                            {loading ? "En cours..." : "Envoyer ⌘↵"}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
```

> **Note :** Ajouter `ANTHROPIC_API_KEY=sk-ant-...` dans `.env.local`.

- [ ] **Vérifier**

```bash
bun run lint src/components/builder/AiAssistantPanel.tsx src/app/api/admin/content/ai-assist/route.ts
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/builder/AiAssistantPanel.tsx "src/app/api/admin/content/ai-assist/route.ts"
git commit -m "feat(builder): add AI assistant panel + api route"
```

---

### Task 8 : Page builder admin

**Files:**
- Create: `src/app/admin/content/[moduleSlug]/[sectionSlug]/[contentType]/page.tsx`
- Create: `src/components/builder/BuilderPage.tsx` (Client Component wrapper)

La page est un Server Component qui :
1. Vérifie la session admin
2. Charge les blocs initiaux depuis l'API
3. Charge les métadonnées (module, section) depuis MongoDB
4. Passe tout à `BuilderPage` (Client Component)

- [ ] **Créer `src/components/builder/BuilderPage.tsx`** (Client Component principal)

```typescript
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/store/builderStore";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { PropsPanel } from "@/components/builder/PropsPanel";
import { AiAssistantPanel } from "@/components/builder/AiAssistantPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function useBuilderLayout() {
    const [isFixed, setIsFixed] = useState(true);
    useEffect(() => {
        function check() { setIsFixed(window.innerWidth >= 1024); }
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return isFixed;
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
    const isFixed = useBuilderLayout();
    const { blocks, isDirty, setBlocks, markSaved } = useBuilderStore();

    // Initialiser le store une seule fois
    useEffect(() => {
        setBlocks(initialBlocks);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleSave() {
        try {
            const res = await fetch(
                `/api/admin/content/${moduleSlug}/${sectionSlug}/${contentType}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ blocks }),
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            markSaved();
            toast.success("Contenu sauvegardé.");
        } catch (err) {
            toast.error("Erreur lors de la sauvegarde.");
            console.error(err);
        }
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Top bar */}
            <header className="flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
                <a href="/admin" className="text-muted-foreground hover:text-foreground text-sm">
                    ← Admin
                </a>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{moduleTitle}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{sectionTitle}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium capitalize">{contentType}</span>

                <Badge variant={source === "db" ? "default" : "secondary"} className="ml-2">
                    {source === "db" ? "DB ✓" : "Fichier"}
                </Badge>

                <div className="flex-1" />

                {isDirty && (
                    <span className="text-xs text-muted-foreground">Modifications non sauvegardées</span>
                )}
                <Button size="sm" onClick={handleSave} disabled={!isDirty}>
                    Sauvegarder
                </Button>
            </header>

            {/* Layout principal */}
            <div className="flex flex-1 min-h-0">
                <BuilderCanvas
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                    contentType={contentType}
                />
                <PropsPanel isFixed={isFixed} />
            </div>

            <AiAssistantPanel
                moduleSlug={moduleSlug}
                sectionSlug={sectionSlug}
                contentType={contentType}
            />
        </div>
    );
}
```

- [ ] **Créer le dossier de la page**

```bash
mkdir -p "src/app/admin/content/[moduleSlug]/[sectionSlug]/[contentType]"
```

- [ ] **Créer `src/app/admin/content/[moduleSlug]/[sectionSlug]/[contentType]/page.tsx`**

```typescript
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import { BuilderPage } from "@/components/builder/BuilderPage";
import type { Block } from "@/types/CourseContent";
import type Module from "@/types/Module";

interface PageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentType: string;
    }>;
}

export default async function ContentBuilderPage({ params }: PageProps) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const { moduleSlug, sectionSlug, contentType } = await params;

    const db = await connectToDB();

    // Charger les métadonnées du module/section
    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    if (!mod) notFound();

    const section = mod.sections?.find((s: { path: string }) => s.path === sectionSlug);
    if (!section) notFound();

    // Charger le contenu depuis course_content
    type ContentDoc = {
        blocks?: Block[];
    };
    const doc = await db
        .collection<ContentDoc>("course_content")
        .findOne({ moduleSlug, sectionSlug, contentType });

    // Déterminer la source depuis modules
    type ContentRef = { type: string; source?: string };
    const ref = (section.contents as ContentRef[])?.find((c) => c.type === contentType);
    const source = (ref?.source === "db" ? "db" : "file") as "file" | "db";

    return (
        <BuilderPage
            moduleSlug={moduleSlug}
            sectionSlug={sectionSlug}
            contentType={contentType}
            moduleTitle={mod.title ?? moduleSlug}
            sectionTitle={section.title ?? sectionSlug}
            initialBlocks={doc?.blocks ?? []}
            source={source}
        />
    );
}
```

- [ ] **Vérifier**

```bash
bun run lint src/components/builder/BuilderPage.tsx "src/app/admin/content/[moduleSlug]/[sectionSlug]/[contentType]/page.tsx"
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/builder/BuilderPage.tsx "src/app/admin/content/[moduleSlug]/[sectionSlug]/[contentType]/page.tsx"
git commit -m "feat(builder): add builder admin page"
```

---

### Task 9 : Liens depuis la page admin + vérification finale

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Ajouter les liens vers le builder dans `src/app/admin/page.tsx`**

En bas de la fonction `AdminPage`, avant le `return`, ajouter un appel à MongoDB pour récupérer les modules :

```typescript
// Ajouter cet import en haut du fichier
import { connectToDB } from "@/lib/mongodb";
import Link from "next/link";
import type Module from "@/types/Module";
import { getContentTypes } from "@/types/CourseContent";

// Dans AdminPage(), après la récupération des users :
let modules: Module[] = [];
try {
    const db = await connectToDB();
    modules = await db.collection<Module>("modules").find({}).sort({ order: 1 }).toArray();
} catch (error) {
    console.error("[admin] modules error:", error);
}
```

Puis dans le JSX, ajouter après `<UsersTable ... />` :

```tsx
<div className="mt-10">
    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 mb-2">
        Builder de contenu
    </p>
    <h2 className="text-xl font-bold text-brand-dark dark:text-bridge-100 mb-4">
        Modules
    </h2>
    <div className="flex flex-col gap-4">
        {modules.map((mod) => (
            <div key={mod.path} className="border rounded-lg p-4">
                <div className="font-semibold mb-2">{mod.title}</div>
                <div className="flex flex-col gap-1">
                    {mod.sections?.map((section) =>
                        getContentTypes(section.contents ?? []).map((ct) => (
                            <Link
                                key={`${section.path}-${ct}`}
                                href={`/admin/content/${mod.path}/${section.path}/${ct}`}
                                className="text-sm text-primary hover:underline"
                            >
                                {section.title} — {ct}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        ))}
    </div>
</div>
```

- [ ] **Vérifier**

```bash
bun run lint src/app/admin/page.tsx
```
Attendu : 0 erreur TypeScript.

- [ ] **Build complet**

```bash
bun run build
```
Attendu : build réussi, 0 erreur TypeScript.

- [ ] **Test manuel end-to-end**

1. Démarrer `bun dev`.
2. Aller sur `/admin` — vérifier que les liens vers le builder apparaissent.
3. Cliquer sur un lien (ex : "Le DOM — cours") → la page `/admin/content/javascript/1-le-dom/cours` s'ouvre.
4. Le builder s'affiche avec le badge "Fichier" (source: file, pas encore migré).
5. Cliquer sur le `+` → la palette s'ouvre avec les 7 types de blocs.
6. Sélectionner "Texte" → un bloc vide apparaît dans le canvas.
7. Cliquer sur le bloc → le panneau props s'ouvre à droite.
8. Modifier le contenu → cliquer "Appliquer" → le rendu se met à jour.
9. Cliquer "Sauvegarder" → toast "Contenu sauvegardé." → badge passe à "DB ✓".
10. Recharger la page → le contenu est rechargé depuis MongoDB.

- [ ] **Commit final**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(builder): add content builder links in admin page"
```
