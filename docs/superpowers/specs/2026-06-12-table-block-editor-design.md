# Table Block Editor — Design Spec
Date : 2026-06-12

## Contexte

Le bloc `table` du builder de cours IUT est actuellement non fonctionnel pour l'édition des lignes : le champ `rows` n'a aucune entrée dans `fields`, rendant les cellules impossibles à modifier via l'UI. Cette spec décrit la refonte complète de l'éditeur tableau.

## Objectif

Remplacer l'éditeur via PropsPanel (Sheet latéral) par un éditeur inline directement dans le canvas, avec :
- Édition de cellules en place (markdown inline)
- Navigation clavier complète (Tab, flèches, Enter, Escape)
- Ajout/suppression de lignes et colonnes via toolbar + boutons contextuels
- Aucune régression sur les autres types de blocs

---

## Architecture

### Fichiers modifiés (4) + créé (1)

| Fichier | Nature |
|---|---|
| `src/lib/blockRegistry.tsx` | Flag `noPropsPanel`, mise à jour définition `table` |
| `src/components/builder/PropsPanel.tsx` | Skip Sheet si `noPropsPanel: true` |
| `src/components/builder/BlockTree.tsx` | SortableBlock rend `def.editor` quand sélectionné + `noPropsPanel` |
| `src/components/builder/TableBlockEditor.tsx` | **Nouveau** — composant éditeur autonome |

### Flag `noPropsPanel`

```ts
// BlockDefinition (blockRegistry.tsx)
noPropsPanel?: boolean;  // si true : supprime le PropsPanel Sheet pour ce type
```

Quand `selectedId` correspond à un bloc `noPropsPanel: true` :
- `PropsPanel` : Sheet reste fermé (`open={!!selectedId && !def?.noPropsPanel}`)
- `SortableBlock` : rend `<def.editor props={block.props} onChange={…} />` à la place de `<def.render>`

### Définition table mise à jour

```ts
{
  type: "table",
  label: "Tableau",
  noPropsPanel: true,
  defaultProps: { headers: ["En-tête 1", "En-tête 2"], rows: [["", ""]] },
  schema: z.object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) }),
  fields: [],
  editor: TableBlockEditor,
  render: /* inchangé */,
}
```

---

## Composant `TableBlockEditor`

### Props

```ts
interface BlockEditorProps {
  props: Record<string, unknown>;   // { headers: string[], rows: string[][] }
  onChange: (props: Record<string, unknown>) => void;
}
```

### État local

```ts
type CellRef = { row: number; col: number };
// row = -1 → cellule header

selectedCell: CellRef | null   // cellule sélectionnée (ring)
editingCell: CellRef | null    // cellule en cours d'édition (InlineTextEditor monté)
```

### Layout

```
┌─ toolbar ──────────────────────────────────────────────────────┐
│  [+ Ligne]  [+ Colonne]  [✕ Ligne sél.]  [✕ Colonne sél.]    │
│  (✕ désactivés si aucune cellule sélectionnée)                 │
└────────────────────────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┐
│ En-tête 1│ En-tête 2│ En-tête 3│  [+]  ← addCol
├──────────┼──────────┼──────────┤
│ cellule  │ cellule  │ cellule  │
├──────────┼──────────┼──────────┤
│ cellule  │ cellule  │ cellule  │
└──────────┴──────────┴──────────┘
         [+]  ← addRow (centré sous le tableau)
```

### États de cellule

| État | Visuel | Condition |
|---|---|---|
| Repos | `renderInline(value)` rendu | aucune sélection |
| Sélectionnée | ring brand-primary, valeur brute | 1 clic |
| En édition | `InlineTextEditor` monté | double-clic ou Enter |

Les cellules header ont un fond teinté (`bg-bridge-100/60 dark:bg-bridge-800/60`, `font-semibold`).

### Mutations de données

Toutes via `onChange({ ...props, headers, rows })` :

| Action | Mutation |
|---|---|
| `setHeader(col, val)` | `headers[col] = val` |
| `setCell(row, col, val)` | `rows[row][col] = val` |
| `addRow()` | `rows.push(Array(colCount).fill(""))` |
| `addCol()` | `headers.push("En-tête N")` + `rows[i].push("")` pour chaque ligne |
| `deleteRow(i)` | `rows.filter((_, j) => j !== i)` |
| `deleteCol(i)` | `headers.filter` + `rows[j].filter` |

### Navigation clavier

Gérée dans `handleCellKeyDown(e, row, col)` :

| Touche | Contexte | Action |
|---|---|---|
| `Enter` | hors édition | bascule en édition |
| `Escape` | en édition | quitte l'édition, reste sélectionné |
| `Tab` | toujours | cellule suivante (col+1, puis row+1 col 0) |
| `Shift+Tab` | toujours | cellule précédente |
| `Tab` sur dernière cellule | — | crée une nouvelle ligne, sélectionne [newRow, 0] |
| `↑↓←→` | hors édition | déplace la sélection |
| `Delete` / `Backspace` | hors édition | vide la cellule (`setCell(row, col, "")`) |

### Composants réutilisés

- `InlineTextEditor` (déjà présent dans le builder) pour l'édition de cellule avec support markdown
- `renderInline()` pour l'affichage au repos
- `Button` shadcn pour la toolbar

### Pas de gestion dans ce scope

- Réordonnancement de lignes/colonnes par drag (hors scope)
- Cellules fusionnées (hors scope)
- Import CSV (hors scope)

---

## Changements dans `SortableBlock` (BlockTree.tsx)

```tsx
const useInlineEditor = isSelected && !!def.editor && !!def.noPropsPanel;

// Dans le rendu :
{useInlineEditor ? (
  <def.editor
    props={block.props}
    onChange={(newProps) => updateBlock(block.id, newProps)}
  />
) : editingInline && editFieldKey ? (
  <InlineTextEditor … />
) : (
  <Render {...block.props}>{renderedChildren}</Render>
)}
```

Le curseur devient `cursor-pointer` (pas `cursor-text`) pour les blocs `noPropsPanel`.

---

## Changements dans `PropsPanel.tsx`

```tsx
const def = block ? getBlockDefinition(block.type) : undefined;
<Sheet open={!!selectedId && !def?.noPropsPanel} …>
```

---

## Tests manuels à valider

- [ ] Clic sur tableau → PropsPanel NE s'ouvre PAS
- [ ] Tableau sélectionné → toolbar et éditeur inline apparaissent
- [ ] Clic en dehors → retour au rendu normal
- [ ] Tab depuis dernière cellule → nouvelle ligne créée
- [ ] Markdown affiché au repos (`**gras**`, `` `code` ``)
- [ ] addCol conserve le nombre de cellules par ligne
- [ ] deleteRow sur la seule ligne → table avec 0 lignes (pas de crash)
- [ ] Autres types de blocs non affectés (PropsPanel fonctionne normalement)
