# Table Block Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer l'éditeur tableau via PropsPanel par un éditeur inline dans le canvas avec cellules éditables (markdown), toolbar d'actions et navigation clavier complète.

**Architecture:** Flag `noPropsPanel` sur `BlockDefinition` → `SortableBlock` rend `def.editor` à la place du rendu normal quand le bloc est sélectionné → `PropsPanel` ne s'ouvre pas → `TableBlockEditor` gère tout en autonomie.

**Tech Stack:** React 19, TypeScript strict, Tailwind v4, shadcn/ui (Button), InlineTextEditor (existant), renderInline (existant), Zustand (builderStore via props/onChange).

**Spec:** `docs/superpowers/specs/2026-06-12-table-block-editor-design.md`

---

## File Map

| Fichier | Action | Rôle |
|---|---|---|
| `src/lib/blockRegistry.tsx` | Modifier | Ajouter `noPropsPanel?: boolean` + `editor?` à `BlockDefinition`, importer + enregistrer `TableBlockEditor` dans la définition `table` |
| `src/components/builder/PropsPanel.tsx` | Modifier | Ne pas ouvrir le Sheet si `def?.noPropsPanel` |
| `src/components/builder/BlockTree.tsx` | Modifier | `SortableBlock` rend `def.editor` quand `isSelected && noPropsPanel` |
| `src/components/builder/TableBlockEditor.tsx` | Créer | Éditeur tableau autonome (toolbar, grille éditable, navigation clavier) |

---

## Task 1 — Flag `noPropsPanel` dans `BlockDefinition`

**Files:**
- Modify: `src/lib/blockRegistry.tsx:45-61` (interface `BlockDefinition`)

- [ ] **Ajouter `noPropsPanel` et vérifier que `editor` est déjà dans l'interface**

Ouvrir `src/lib/blockRegistry.tsx`. L'interface `BlockDefinition` commence vers la ligne 45. Elle contient déjà `editor?: React.ComponentType<BlockEditorProps>;`. Ajouter `noPropsPanel` juste après :

```tsx
export interface BlockDefinition {
    type: string;
    label: string;
    defaultProps: Record<string, unknown>;
    schema: z.ZodTypeAny;
    fields: FieldDef[];
    render: React.ComponentType<BlockRenderProps>;
    editor?: React.ComponentType<BlockEditorProps>;
    /** Si true : supprime le PropsPanel Sheet et rend `editor` inline quand sélectionné. */
    noPropsPanel?: boolean;
    inlineEditField?: string;
    container?: ContainerRule;
    initialChildren?: () => Block[];
}
```

- [ ] **Commit**

```bash
git add src/lib/blockRegistry.tsx
git commit -m "feat(builder): add noPropsPanel flag to BlockDefinition"
```

---

## Task 2 — PropsPanel : ignorer les blocs `noPropsPanel`

**Files:**
- Modify: `src/components/builder/PropsPanel.tsx:48`

- [ ] **Changer la condition `open` du Sheet**

Dans `PropsPanel.tsx`, la ligne `<Sheet open={!!selectedId} ...>` (vers ligne 48) devient :

```tsx
<Sheet open={!!selectedId && !def?.noPropsPanel} onOpenChange={(open) => !open && selectBlock(null)}>
```

`def` est déjà calculé juste au-dessus (`const def = block ? getBlockDefinition(block.type) : undefined;`). Aucun autre changement.

- [ ] **Commit**

```bash
git add src/components/builder/PropsPanel.tsx
git commit -m "feat(builder): suppress PropsPanel Sheet for noPropsPanel blocks"
```

---

## Task 3 — SortableBlock : rendre `def.editor` inline

**Files:**
- Modify: `src/components/builder/BlockTree.tsx` (composant `SortableBlock`)

- [ ] **Ajouter la variable `Editor` après la ligne `const def = getBlockDefinition(block.type);`**

Vers la ligne 152, après `const def = getBlockDefinition(block.type);` :

```tsx
const def = getBlockDefinition(block.type);
const Editor = (isSelected && def?.editor && def.noPropsPanel) ? def.editor : null;
```

- [ ] **Ajuster `handleDoubleClick` pour ignorer les blocs `noPropsPanel`**

```tsx
function handleDoubleClick(e: React.MouseEvent) {
    if (!editFieldKey || editingInline || def?.noPropsPanel) return;
    e.stopPropagation();
    setEditingInline(true);
}
```

- [ ] **Ajuster la classe curseur**

Dans le `className` du div principal (vers ligne 225-230), la ligne :

```tsx
editFieldKey && !editingInline ? "cursor-text" : "cursor-pointer",
```

devient :

```tsx
editFieldKey && !editingInline && !def?.noPropsPanel ? "cursor-text" : "cursor-pointer",
```

- [ ] **Remplacer le rendu dans `<div className="p-3">`**

Le bloc actuellement (vers ligne 258-277) :

```tsx
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
```

devient :

```tsx
<div className="p-3">
    {Editor ? (
        <Editor
            props={block.props}
            onChange={(newProps) => updateBlock(block.id, newProps)}
        />
    ) : editingInline && editFieldKey ? (
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
```

- [ ] **Commit**

```bash
git add src/components/builder/BlockTree.tsx
git commit -m "feat(builder): SortableBlock renders def.editor inline for noPropsPanel blocks"
```

---

## Task 4 — Créer `TableBlockEditor.tsx`

**Files:**
- Create: `src/components/builder/TableBlockEditor.tsx`

- [ ] **Créer le fichier avec l'implémentation complète**

```tsx
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineTextEditor } from "@/components/builder/InlineTextEditor";
import { renderInline } from "@/lib/inlineMarkdown";
import { cn } from "@/lib/utils";
import type { BlockEditorProps } from "@/lib/blockRegistry";

type CellRef = { row: number; col: number };
// row === -1 → cellule header

export function TableBlockEditor({ props, onChange }: BlockEditorProps) {
    const headers = (props.headers as string[]) ?? [];
    const rows = (props.rows as string[][]) ?? [];
    const colCount = Math.max(headers.length, 1);

    const [selected, setSelected] = useState<CellRef | null>(null);
    const [editing, setEditing] = useState<CellRef | null>(null);

    function update(nextHeaders: string[], nextRows: string[][]) {
        onChange({ ...props, headers: nextHeaders, rows: nextRows });
    }

    function getCellValue(row: number, col: number): string {
        if (row === -1) return headers[col] ?? "";
        return rows[row]?.[col] ?? "";
    }

    function setCellValue(row: number, col: number, value: string) {
        if (row === -1) {
            const next = [...headers];
            next[col] = value;
            update(next, rows);
        } else {
            const next = rows.map((r) => [...r]);
            if (!next[row]) next[row] = Array(colCount).fill("");
            next[row][col] = value;
            update(headers, next);
        }
    }

    function addRow() {
        update(headers, [...rows, Array(colCount).fill("")]);
    }

    function addCol() {
        update(
            [...headers, `En-tête ${headers.length + 1}`],
            rows.map((r) => [...r, ""]),
        );
    }

    function deleteRow(rowIdx: number) {
        setSelected(null);
        setEditing(null);
        update(headers, rows.filter((_, i) => i !== rowIdx));
    }

    function deleteCol(colIdx: number) {
        setSelected(null);
        setEditing(null);
        update(
            headers.filter((_, i) => i !== colIdx),
            rows.map((r) => r.filter((_, i) => i !== colIdx)),
        );
    }

    function isCellSelected(row: number, col: number) {
        return selected?.row === row && selected?.col === col;
    }

    function isCellEditing(row: number, col: number) {
        return editing?.row === row && editing?.col === col;
    }

    function selectCell(row: number, col: number) {
        setSelected({ row, col });
        setEditing(null);
    }

    function startEditing(row: number, col: number) {
        setSelected({ row, col });
        setEditing({ row, col });
    }

    function stopEditing() {
        setEditing(null);
    }

    function handleCellKeyDown(e: React.KeyboardEvent, row: number, col: number) {
        const inEdit = isCellEditing(row, col);

        if (e.key === "Enter" && !inEdit) {
            e.preventDefault();
            startEditing(row, col);
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            stopEditing();
            return;
        }

        if (e.key === "Tab") {
            e.preventDefault();
            stopEditing();
            if (!e.shiftKey) {
                if (col + 1 < colCount) {
                    setSelected({ row, col: col + 1 });
                } else if (row + 1 < rows.length) {
                    setSelected({ row: row + 1, col: 0 });
                } else if (row === rows.length - 1) {
                    addRow();
                    // La nouvelle ligne sera rows.length après le setState async :
                    // on sélectionne en se basant sur la longueur courante
                    setSelected({ row: rows.length, col: 0 });
                } else {
                    setSelected({ row: 0, col: 0 });
                }
            } else {
                if (col - 1 >= 0) {
                    setSelected({ row, col: col - 1 });
                } else if (row - 1 >= -1) {
                    setSelected({ row: row - 1, col: colCount - 1 });
                }
            }
            return;
        }

        if (!inEdit) {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                setSelected({ row, col: Math.min(col + 1, colCount - 1) });
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setSelected({ row, col: Math.max(col - 1, 0) });
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected({ row: Math.min(row + 1, rows.length - 1), col });
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected({ row: Math.max(row - 1, -1), col });
            } else if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                setCellValue(row, col, "");
            }
        }
    }

    const selectedRow = selected?.row ?? null;
    const canDeleteRow = selectedRow !== null && selectedRow >= 0;
    const canDeleteCol = selected !== null && colCount > 1;

    const cellBaseCls = "relative px-3 py-2 text-sm text-left align-middle min-w-[80px] border border-bridge-300/50 dark:border-bridge-600/30 outline-none cursor-pointer";

    return (
        <div
            className="flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary cursor-pointer"
                    onClick={addRow}
                >
                    <Plus className="w-3 h-3" /> Ligne
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary cursor-pointer"
                    onClick={addCol}
                >
                    <Plus className="w-3 h-3" /> Colonne
                </Button>
                <div className="w-px h-4 bg-bridge-400/30 dark:bg-bridge-500/25 mx-0.5" />
                <Button
                    size="sm"
                    variant="outline"
                    disabled={!canDeleteRow}
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-destructive/50 hover:text-destructive disabled:opacity-30 cursor-pointer"
                    onClick={() => { if (canDeleteRow) deleteRow(selectedRow!); }}
                >
                    <Trash2 className="w-3 h-3" /> Ligne
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={!canDeleteCol}
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-destructive/50 hover:text-destructive disabled:opacity-30 cursor-pointer"
                    onClick={() => { if (canDeleteCol) deleteCol(selected!.col); }}
                >
                    <Trash2 className="w-3 h-3" /> Colonne
                </Button>
            </div>

            {/* Grille */}
            <div className="overflow-x-auto rounded-lg border border-bridge-300/50 dark:border-bridge-600/30">
                <table className="border-collapse w-full table-auto">
                    <thead>
                        <tr>
                            {headers.map((_, col) => (
                                <th
                                    key={col}
                                    className={cn(
                                        cellBaseCls,
                                        "bg-bridge-100/60 dark:bg-bridge-800/60 font-semibold",
                                        isCellSelected(-1, col) && "ring-2 ring-inset ring-brand-primary",
                                    )}
                                    tabIndex={0}
                                    onClick={() => selectCell(-1, col)}
                                    onDoubleClick={() => startEditing(-1, col)}
                                    onKeyDown={(e) => handleCellKeyDown(e, -1, col)}
                                >
                                    {isCellEditing(-1, col) ? (
                                        <InlineTextEditor
                                            value={getCellValue(-1, col)}
                                            onChange={(v) => setCellValue(-1, col, v)}
                                            onBlur={stopEditing}
                                            onKeyDown={(e) => handleCellKeyDown(e, -1, col)}
                                            autoFocus
                                            aria-label={`En-tête colonne ${col + 1}`}
                                            className="w-full bg-transparent border-0 p-0 text-sm font-semibold h-auto shadow-none focus-visible:ring-0"
                                        />
                                    ) : (
                                        <span>
                                            {getCellValue(-1, col)
                                                ? renderInline(getCellValue(-1, col))
                                                : <span className="text-bridge-400 dark:text-bridge-500 font-normal italic text-xs">En-tête</span>
                                            }
                                        </span>
                                    )}
                                </th>
                            ))}
                            <th className="w-8 px-1 py-2 border border-bridge-300/50 dark:border-bridge-600/30 bg-bridge-100/60 dark:bg-bridge-800/60">
                                <button
                                    className="mx-auto w-5 h-5 rounded-full bg-brand-primary/10 hover:bg-brand-primary/25 text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
                                    onClick={addCol}
                                    title="Ajouter une colonne"
                                    aria-label="Ajouter une colonne"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {row.map((_, col) => (
                                    <td
                                        key={col}
                                        className={cn(
                                            cellBaseCls,
                                            "bg-bridge-50 dark:bg-bridge-900/40",
                                            isCellSelected(rowIdx, col) && "ring-2 ring-inset ring-brand-primary",
                                        )}
                                        tabIndex={0}
                                        onClick={() => selectCell(rowIdx, col)}
                                        onDoubleClick={() => startEditing(rowIdx, col)}
                                        onKeyDown={(e) => handleCellKeyDown(e, rowIdx, col)}
                                    >
                                        {isCellEditing(rowIdx, col) ? (
                                            <InlineTextEditor
                                                value={getCellValue(rowIdx, col)}
                                                onChange={(v) => setCellValue(rowIdx, col, v)}
                                                onBlur={stopEditing}
                                                onKeyDown={(e) => handleCellKeyDown(e, rowIdx, col)}
                                                autoFocus
                                                aria-label={`Cellule ligne ${rowIdx + 1} colonne ${col + 1}`}
                                                className="w-full bg-transparent border-0 p-0 text-sm h-auto shadow-none focus-visible:ring-0"
                                            />
                                        ) : (
                                            <span>
                                                {getCellValue(rowIdx, col)
                                                    ? renderInline(getCellValue(rowIdx, col))
                                                    : <span className="text-bridge-400 dark:text-bridge-500 italic text-xs">—</span>
                                                }
                                            </span>
                                        )}
                                    </td>
                                ))}
                                <td className="w-8 px-1 border border-bridge-300/50 dark:border-bridge-600/30 bg-bridge-50 dark:bg-bridge-900/40" />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ajouter une ligne */}
            <div className="flex justify-center">
                <button
                    className="flex items-center gap-1 px-3 py-1 text-xs text-bridge-500 dark:text-bridge-400 hover:text-brand-primary rounded-full hover:bg-brand-primary/5 transition-colors cursor-pointer"
                    onClick={addRow}
                    aria-label="Ajouter une ligne"
                >
                    <Plus className="w-3 h-3" /> Ligne
                </button>
            </div>
        </div>
    );
}
```

- [ ] **Commit**

```bash
git add src/components/builder/TableBlockEditor.tsx
git commit -m "feat(builder): add TableBlockEditor — inline canvas table editor"
```

---

## Task 5 — Mettre à jour la définition `table` dans `blockRegistry.tsx`

**Files:**
- Modify: `src/lib/blockRegistry.tsx` (import + définition table vers ligne 246-277)

- [ ] **Ajouter l'import de `TableBlockEditor` en haut du fichier**

Après les imports existants, ajouter :

```tsx
import { TableBlockEditor } from "@/components/builder/TableBlockEditor";
```

- [ ] **Remplacer la définition du bloc `table`**

Trouver le bloc `{ type: "table", ...}` (vers ligne 246) et le remplacer par :

```tsx
{
    type: "table",
    label: "Tableau",
    noPropsPanel: true,
    defaultProps: { headers: ["En-tête 1", "En-tête 2"], rows: [["", ""]] },
    schema: z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string())),
    }),
    fields: [],
    editor: TableBlockEditor,
    render: ({ headers, rows }: BlockRenderProps) => (
        <Table>
            <TableHeader>
                <TableRow>
                    {(headers as string[] ?? []).map((h, i) => (
                        <TableHead key={i}>{renderInline(h)}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {(rows as string[][] ?? []).map((row, i) => (
                    <TableRow key={i}>
                        {row.map((cell, j) => (
                            <TableCell key={j}>{renderInline(cell)}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ),
},
```

Note : le `render` utilise maintenant `renderInline` pour afficher le markdown dans les cellules (rendu final côté étudiant). `renderInline` est déjà importé dans le fichier.

- [ ] **Commit**

```bash
git add src/lib/blockRegistry.tsx
git commit -m "feat(builder): wire TableBlockEditor into table block definition"
```

---

## Task 6 — Qualité : lint + TypeScript

**Files:** tous les fichiers modifiés

- [ ] **Lancer ESLint**

```bash
bun run lint
```

Expected: 0 errors (1 warning préexistant dans `tests/lib/blockSchemas.test.ts` — ignorer).

- [ ] **Lancer TypeScript**

```bash
bunx tsc --noEmit --project tsconfig.json
```

Expected: aucune sortie (0 erreurs).

- [ ] **Corriger si nécessaire et commiter**

Si erreurs TypeScript : les causes probables sont :
1. `def.editor` utilisé comme JSX component → s'assurer que la variable locale est nommée en `PascalCase` (`const Editor = ...`)
2. `renderInline` appelé sur `string` → vérifier l'import dans `blockRegistry.tsx`

Après correction :

```bash
git add -p
git commit -m "fix(builder): resolve TypeScript/lint issues in table editor"
```

---

## Checklist de validation manuelle

Après l'implémentation, tester dans le builder :

- [ ] Insérer un bloc **Tableau** depuis la palette → tableau 2×1 pré-rempli apparaît
- [ ] Clic sur le tableau → PropsPanel **ne s'ouvre pas**, toolbar apparaît
- [ ] Clic en dehors → retour au rendu normal (sans toolbar)
- [ ] Double-clic sur un header → input s'ouvre dans la cellule
- [ ] Double-clic sur une cellule → input s'ouvre
- [ ] `Tab` depuis la dernière cellule → nouvelle ligne créée automatiquement
- [ ] `Escape` → quitte l'édition, cellule reste sélectionnée
- [ ] `Delete` sur cellule sélectionnée (hors édition) → cellule vidée
- [ ] `+ Ligne` / `+ Colonne` → lignes/colonnes ajoutées
- [ ] `Trash Ligne` désactivé quand aucune ligne sélectionnée
- [ ] `Trash Colonne` désactivé quand une seule colonne ou rien sélectionné
- [ ] Markdown dans cellule (`**gras**`) → affiché correctement au repos
- [ ] Autres blocs (texte, code…) → PropsPanel fonctionne normalement
