# Builder à la Notion — arbre de blocs, conteneurs et layout

**Date** : 2026-06-11
**Branche** : `feat/builder`
**Statut** : validé en brainstorm, à décliner en plan d'implémentation

## 1. Objectif

Faire évoluer le builder de pages (admin) d'un modèle **plat** (liste de blocs +
paramètre `colSpan: "full" | "half"`) vers un modèle **arborescent à la Notion** :

- des blocs conteneurs pouvant accueillir d'autres blocs (liste de listes,
  callout contenant du code, etc.) ;
- des blocs de layout (`columns` / `column`) remplaçant le paramètre `colSpan` ;
- le drag & drop complet inter-niveaux (déplacer n'importe quel bloc vers
  n'importe quel conteneur compatible) ;
- de nouveaux types de blocs calibrés sur l'usage réel de `src/cours/`
  (`code`, `code-with-preview`, `diagram`, `collapsible`, `download-file`…).

Ceci inverse la décision « blocs plats, pas d'imbrication » de la spec initiale
(`2026-06-05-cours-builder-design.md`).

## 2. Décisions actées

| Sujet | Décision |
|---|---|
| Modèle d'imbrication | **Conteneurs explicites** déclarés dans le registry (pas le « tout bloc est conteneur » de Notion) |
| Contenu d'un `list-item` | Texte (markdown inline) + **blocs enfants libres** (code, image, sous-liste…) |
| Colonnes | **2 à 4 colonnes à largeurs variables** (spans sur grille de 12) |
| Contenus existants en base | **Rien à migrer** : purge des documents de test, nouveau modèle direct, zéro code de compat |
| Drag & drop | **Complet inter-niveaux** (déposer n'importe quel bloc dans n'importe quel conteneur compatible) |
| Architecture | **Arbre natif dans le store + conteneurs droppables récursifs** (pas de store plat à `parentId`, pas de lib tierce) |
| Tests | `bun test` (runner déjà en place dans `tests/`), ciblés sur `blockTreeUtils` |

## 3. Modèle de données

`Block` garde sa forme actuelle ; **`colSpan` est supprimé** partout :

```ts
interface Block {
    id: string;            // uuid v4
    type: string;
    props: Record<string, unknown>;
    children?: Block[];    // présent uniquement sur les types conteneurs
}
```

Le registry (`src/lib/blockRegistry.tsx`) déclare la capacité conteneur :

```ts
interface BlockDefinition {
    // ...champs existants (type, label, defaultProps, schema, fields,
    //    render, editor?, inlineEditField?)...
    container?: {
        allowedChildren: string[] | "any";  // types d'enfants acceptés
        allowedParents?: string[];          // où ce bloc peut vivre (absent = partout)
    };
}
```

Conventions :

- `allowedChildren: "any"` signifie « tout type **sauf** `columns` et `column` »
  (les colonnes ne vivent qu'à la racine, voir §4).
- Un type avec `allowedParents` ne figure dans la palette que dans le contexte
  d'un parent compatible (`column` et `list-item` n'apparaissent jamais dans la
  palette : ils sont créés par leur parent).

## 4. Blocs structurels et règles d'imbrication

| Bloc | Props | Enfants | Contraintes |
|---|---|---|---|
| `columns` | — | `column` uniquement | **racine uniquement** (pas de colonnes imbriquées dans colonnes/listes/callouts) |
| `column` | `span: number` (sur 12) | `any` | existe seulement dans `columns`, absent de la palette |
| `list` | `ordered: boolean` | `list-item` uniquement | partout (`any` des conteneurs) |
| `list-item` | `text: string` (markdown inline, éditable double-clic) | `any` | existe seulement dans `list`, absent de la palette |
| `callout` | `variant: "info" \| "warning" \| "tip" \| "reminder"`, `title?: string` | `any` | partout |
| `collapsible` | `title: string` (défaut « À savoir pour ce cours ») | `any` | partout |

### Largeurs de colonnes

- Chaque `column` porte un `span` entier sur une grille de 12.
- Rendu : `grid grid-cols-12` + **map statique** `span → col-span-*`
  (Tailwind ne génère pas de classes dynamiques).
- L'éditeur du bloc `columns` (PropsPanel) propose des **presets** :
  50/50, 33/67, 67/33, 33/33/33, 25/50/25, 4×25 — plus ajout/suppression de
  colonne (les spans sont recalculés au preset le plus proche).
- Validation Zod : 2 ≤ colonnes ≤ 4 et somme des spans = 12.
- Responsive : empilement en 1 colonne sous le breakpoint `md`
  (`grid-cols-1 md:grid-cols-12`).

### Mapping avec les composants de cours existants

- `callout` variant `info|warning|tip` → `Alert` (+ `AlertTitle`/`AlertDescription`)
  de `src/components/ui/alert` ; variant `reminder` → `CourseReminder`
  (`src/components/CourseReminder.tsx`, carte « Rappel de cours », 6 usages réels).
- `collapsible` → `CoursePrerequisites` (`src/components/CoursePrerequisites.tsx`,
  15 usages réels). Le composant actuel a un titre en dur (« À savoir pour ce
  cours ») : on lui ajoute une prop `title?` optionnelle avec ce défaut —
  changement rétrocompatible, les usages `.tsx` existants ne bougent pas.

## 5. Nouveaux blocs feuilles

Calibrés sur l'inventaire de `src/cours/**/{Cours,TP,Examen}.tsx` :

| Bloc | Props | Rendu via | Usages réels |
|---|---|---|---|
| `code` | `language`, `code`, `filename?`, `showLineNumbers?`, `collapsible?`, `highlightLines?` | `CodeCard` | 323 |
| `code-with-preview` | `language`, `code` | `CodeWithPreviewCard` ; preview = `<iframe srcdoc sandbox="">` (le composant attend un ReactNode : on lui passe l'iframe en `PreviewPanel`) | 36 (+ couvre le cas `InputCard`, 12) |
| `diagram` | `header?`, `chart` (Mermaid) | `DiagramCard` | 11 |
| `download-file` | `language`, `filename`, `code` | `DownloadCodeButton` | 6 |
| `quote` | `text` (markdown inline), `source?` | nouveau rendu léger défini dans le registry (comme `section-card` — on ne touche pas à `src/components/ui/`) | — |
| `divider` | — | `<hr>` stylé bridge | — |

Blocs existants conservés tels quels : `text`, `heading`, `table`, `image-card`,
`section-card`. (`list` est refondu en conteneur, voir §4 : `items: string[]`
disparaît au profit d'enfants `list-item`.)

### Hors périmètre (explicitement)

- Édition des `rows` de `table` et upload d'images → chantiers séparés déjà au
  backlog (audit 2026-06-10, items #2 et #10).
- Démos React interactives (`Calculator`, `Clock`, `ClickableBox`…, `Dialog`
  Milgram) et pages-musée (`html-css/6-rappel-de-html`) : non blockifiables —
  ces pages restent `source: "file"` via le mécanisme `ContentRef` existant.
  Aucun bloc « escape hatch » n'est créé.

## 6. blockTreeUtils + store

Nouveau module **`src/lib/blockTreeUtils.ts`** (celui que le commentaire de
`CourseContent.ts:13` référence déjà) : fonctions **pures et immuables** sur
l'arbre. Signatures indicatives :

```ts
findBlock(blocks: Block[], id: string): Block | undefined
findParent(blocks: Block[], id: string): { parent: Block | null; index: number } | undefined
insertBlock(blocks: Block[], block: Block, parentId: string | null, index: number): Block[]
removeBlock(blocks: Block[], id: string): Block[]
moveBlock(blocks: Block[], id: string, targetParentId: string | null, targetIndex: number): Block[]
updateBlockProps(blocks: Block[], id: string, props: Record<string, unknown>): Block[]
isDescendant(blocks: Block[], ancestorId: string, id: string): boolean
canDrop(childType: string, targetContainerType: string | null): boolean  // null = racine
```

`canDrop` lit les règles du registry (`allowedChildren` / `allowedParents`) +
la règle « `columns` racine uniquement ».

Le **store Zustand** (`src/lib/store/builderStore.ts`) garde son API de surface
mais devient tree-aware en délégant aux helpers :

- `updateBlock(id, props)` — sans le paramètre `colSpan`, supprimé ;
- `insertBlock(block, parentId, index)` ;
- `deleteBlock(id)` — supprime le sous-arbre ; si le bloc sélectionné était
  dedans, désélection ;
- `moveBlock(id, targetParentId, targetIndex)` — remplace `moveBlock(up/down)`
  **et** `reorderBlocks` ;
- `setBlocks`, `selectBlock`, `markSaved`, `isDirty` inchangés.

## 7. Drag & drop inter-niveaux (dnd-kit)

Le `DndContext` reste dans `BuilderPage`. Changements :

- **`BlockTree` récursif** remplace la liste plate + `groupByColSpan` de
  `BuilderCanvas` : chaque conteneur rend un `SortableContext`
  (`verticalListSortingStrategy`) pour ses enfants, plus une zone
  `useDroppable` d'id `` `${blockId}:children` `` pour permettre le drop dans
  un conteneur vide. Les colonnes d'un `columns` se rendent côte à côte
  (`grid-cols-12`), chacune étant un conteneur droppable.
- **Collision** : remplacer `closestCenter` par **`pointerWithin` avec fallback
  `rectIntersection`** (pattern dnd-kit pour conteneurs imbriqués — sinon le
  conteneur parent « gagne » toujours sur ses enfants).
- **`onDragOver`** : calculer la cible `{ parentId, index }` depuis `over`
  (bloc frère → même parent, index voisin ; zone `:children` → ce conteneur,
  index final). Stockée en state pour l'aperçu d'insertion (`InsertPreview`).
- **`onDragEnd`** :
  - drag depuis la **palette** → `insertBlock(newBlock, parentId, index)` ;
    les conteneurs créent leurs enfants initiaux (`columns` → 2 `column`
    span 6 ; `list` → 1 `list-item` vide) ;
  - drag d'un **bloc du canvas** → `moveBlock(id, parentId, index)`.
- **Drops interdits** — refusés à la fois visuellement et à l'application :
  - `canDrop(draggedType, targetContainerType) === false` ;
  - bloc déposé dans sa propre descendance (`isDescendant`).
  Rendu : zone cible grisée + curseur `not-allowed`, drop ignoré dans
  `onDragEnd`.
- **`DragOverlay`** : utilisé aussi pour le drag des blocs du canvas (pas
  seulement la palette) — évite les artefacts de transform dans les grilles.
- Le bouton **`+` de chaque conteneur** ouvre la `BlockPalette` **filtrée par
  `allowedChildren`** et insère dans ce conteneur.

## 8. Rendu (builder et site public)

- **`render` des conteneurs** : la signature devient
  `render({ ...props, children })` où `children: ReactNode` contient les
  enfants déjà rendus. Les feuilles ne changent pas.
- **`BlockRenderer`** (site public) devient récursif : il rend chaque bloc via
  le registry et passe les enfants rendus aux conteneurs. `groupByColSpan` est
  **supprimé des deux fichiers** (`BlockRenderer.tsx` + `BuilderCanvas.tsx`),
  ce qui résout l'item #12 de l'audit (duplication).
- Dans le **builder**, chaque bloc (y compris imbriqué) reste sélectionnable
  (ring), draggable (handle) et éditable inline (double-clic si
  `inlineEditField`). Cliquer un enfant sélectionne l'enfant, pas le parent
  (`stopPropagation`).

## 9. Validation et API

- Nouveau **`validateBlockTree(blocks)`** (serveur, dans `src/lib/`) :
  récursif, applique pour chaque bloc le `schema` Zod du registry + les règles
  d'imbrication (`allowedChildren`/`allowedParents`, `columns` racine
  uniquement, somme des spans = 12, profondeur max raisonnable — 8 niveaux).
- Branché sur le **PUT** `api/admin/content/[moduleSlug]/[sectionSlug]/[contentType]`
  → résout l'item #3 de l'audit (validation absente). Réponse 422 avec le
  chemin du bloc fautif.
- **`ai-assist`** (`src/app/api/admin/content/ai-assist/route.ts`) : le prompt
  système décrit le nouveau schéma (children, conteneurs, règles) et la sortie
  passe par `validateBlockTree` avant d'être renvoyée.
- Note : le registry étant `'use client'`, les schémas/règles utilisés côté
  serveur doivent être importables sans React — extraire les schémas Zod et les
  règles d'imbrication dans un module partagé sans JSX
  (`src/lib/blockSchemas.ts`), consommé par le registry client et par
  `validateBlockTree`.

## 10. Migration

Aucune. Les documents `course_content` existants sont des contenus de test :
purge (`deleteMany`) ou écrasement à la prochaine sauvegarde. `colSpan` et
`list.props.items` disparaissent du code sans lecteur de compat.

## 11. Tests

Runner **`bun test`** (déjà en place, `tests/`). Nouveau
`tests/lib/blockTreeUtils.test.ts` ciblant les fonctions pures, où une
régression détruirait du contenu :

- `moveBlock` : déplacement inter-conteneurs sans perte de sous-arbre,
  indices corrects, no-op si cible invalide ;
- `isDescendant` / `canDrop` : interdiction de déposer un conteneur dans sa
  propre descendance, règles `allowedChildren`/`allowedParents`, `columns`
  hors racine refusé ;
- `removeBlock` / `insertBlock` / `updateBlockProps` : immuabilité (les nœuds
  non touchés gardent leur référence) et intégrité de l'arbre ;
- `validateBlockTree` : somme des spans ≠ 12 refusée, type inconnu refusé,
  arbre valide accepté.

Pas de tests E2E dans ce chantier (backlog).

## 12. Fichiers impactés

| Fichier | Changement |
|---|---|
| `src/types/CourseContent.ts` | suppression de `colSpan` |
| `src/lib/blockTreeUtils.ts` | **nouveau** — helpers d'arbre purs |
| `src/lib/blockSchemas.ts` | **nouveau** — schémas Zod + règles d'imbrication sans JSX |
| `src/lib/validateBlockTree.ts` | **nouveau** — validation serveur récursive |
| `src/lib/blockRegistry.tsx` | `container`, nouveaux blocs, refonte `list`, `render` conteneurs |
| `src/lib/store/builderStore.ts` | actions tree-aware |
| `src/components/builder/BuilderCanvas.tsx` | remplacé par `BlockTree` récursif |
| `src/components/builder/BuilderPage.tsx` | collision `pointerWithin`, `onDragOver`/`onDragEnd` arbre, `DragOverlay` blocs |
| `src/components/builder/BlockPalette.tsx` | filtre `allowedChildren`, contexte d'insertion |
| `src/components/builder/PropsPanel.tsx` / `DynamicPropsEditor.tsx` | éditeurs `columns` (presets), `callout`, `collapsible` |
| `src/components/builder/BlockRenderer.tsx` | récursif, suppression `groupByColSpan` |
| `src/app/api/admin/content/.../route.ts` (PUT) | `validateBlockTree` |
| `src/app/api/admin/content/ai-assist/route.ts` | prompt nouveau schéma + validation |
| `src/components/CoursePrerequisites.tsx` | prop `title?` optionnelle (si option retenue au plan) |
| `tests/lib/blockTreeUtils.test.ts` | **nouveau** |

## 13. Risques et points d'attention

- **Le DnD inter-niveaux est le gros morceau** : la combinaison
  `pointerWithin` + conteneurs imbriqués + colonnes horizontales demandera de
  l'itération manuelle dans le navigateur. Prévoir de stabiliser le modèle
  (utils + store + rendu récursif) **avant** d'attaquer le DnD.
- L'iframe `srcdoc` de `code-with-preview` doit être sandboxée
  (`sandbox=""`, pas de `allow-scripts` par défaut) — le HTML vient de la base
  mais reste du contenu arbitraire ; à durcir si `allow-scripts` devient
  nécessaire pour les démos JS.
- La palette filtrée par contexte ne doit pas casser le drag palette→canvas
  existant (les deux chemins d'insertion partagent `insertBlock`).
- `BLOCK_META` (`BlockPaletteGrid.tsx`) doit couvrir tous les nouveaux types
  (icônes), sinon l'overlay tombe sur le fallback `Puzzle`.
