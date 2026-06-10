# Cours Builder — Documentation technique

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Composants](#3-composants)
4. [Store Zustand](#4-store-zustand)
5. [Block Registry](#5-block-registry)
6. [Composants nommés](#6-composants-nommés)
7. [Routes API](#7-routes-api)
8. [Collections MongoDB](#8-collections-mongodb)
9. [Cycle de vie du contenu](#9-cycle-de-vie-du-contenu)
10. [Système de cache](#10-système-de-cache)
11. [Assistant IA](#11-assistant-ia)

---

## 1. Vue d'ensemble

Le **Cours Builder** est un éditeur WYSIWYG côté admin permettant de créer et modifier le contenu
des cours directement en base de données, sans toucher aux fichiers `.tsx` statiques.

Un contenu peut exister sous deux formes (`source`) :

| `source` | Stockage | Éditable dans le builder |
|----------|----------|--------------------------|
| `"file"` | Fichier `.tsx` dans `src/cours/` | Non (lecture seule) |
| `"db"` | Collection `course_content` (MongoDB) | Oui |

Au premier enregistrement via le builder, le contenu bascule automatiquement de `"file"` à `"db"`.
Le badge **DB** / **fichier** dans la toolbar reflète cet état en temps réel.

---

## 2. Architecture

```
URL : /admin/content/[moduleSlug]/[sectionSlug]/[contentType]

┌─ page.tsx (Server Component) ─────────────────────────────────┐
│  • Auth admin (role === 'admin')                               │
│  • Requête MongoDB → modules + course_content                  │
│  • Passe initialBlocks + source à BuilderPageDynamic           │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ BuilderPageDynamic (Client, ssr:false) ───────────────────────┐
│  Wrapper dynamic() pour éviter les erreurs d'hydratation       │
│  Zustand ne supporte pas le SSR sans configuration spécifique  │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ BuilderPage ─────────────────────────────────────────────────┐
│  • DndContext unique (DnD Kit)                                 │
│  • Toolbar : breadcrumb + badge source + bouton Sauvegarder    │
│  • Zone principale : BuilderCanvas  |  PropsPanel             │
│  • DragOverlay : ghost visuel pendant le drag palette          │
│  • AiAssistantPanel : FAB assistant IA (désactivé)            │
└───────────────────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
┌─ BuilderCanvas ────────┐    ┌─ PropsPanel ────────────────────┐
│  SortableContext        │    │  Bloc sélectionné :            │
│  Blocs réordonnables   │    │   • DynamicPropsEditor         │
│  InsertLine (+)         │    │   • Sélecteur largeur          │
│  BlockPalette (modal)  │    │   • Footer : Monter/Desc/Suppr │
│  InsertPreview          │    │  Aucun bloc sélectionné :      │
│  useDroppable("canvas") │    │   • Hint sélection             │
└────────────────────────┘    │   • BlockPaletteGrid (compact) │
                              └────────────────────────────────┘
```

---

## 3. Composants

### `BuilderPageDynamic`
**Chemin :** `src/components/builder/BuilderPageDynamic.tsx`

Wrapper `next/dynamic` avec `ssr: false`. Nécessaire car Zustand (`useBuilderStore`) initialise son
état côté client. Sans ce wrapper, Next hydrate le composant avec un état vide côté serveur, ce qui
provoque une désynchronisation React.

```ts
const BuilderPage = dynamic(
    () => import("@/components/builder/BuilderPage").then(m => m.BuilderPage),
    { ssr: false }
);
```

---

### `BuilderPage`
**Chemin :** `src/components/builder/BuilderPage.tsx`

Composant racine de l'éditeur. Responsabilités :

- **Initialisation** : `setBlocks(initialBlocks)` au montage (une seule fois).
- **DndContext unique** : enveloppe l'intégralité de la zone builder pour que `BuilderCanvas`
  (SortableContext) et `PropsPanel` (palette draggable via React portal) partagent le même contexte.
- **Gestion du drag** :
  - `onDragStart` → capture la `BlockDefinition` pour le `DragOverlay`.
  - `onDragOver` → met à jour `paletteOverId` (position de la preview d'insertion).
  - `onDragEnd` → distingue deux cas :
    - `origin === "palette"` : crée un nouveau bloc et l'insère après le bloc survolé.
    - Aucune origine (canvas) : réordonne les blocs via `reorderBlocks`.
  - `onDragCancel` → réinitialise les états de drag.
- **Sauvegarde** : `PUT /api/admin/content/[module]/[section]/[type]` avec `blocks` du store.
- **DragOverlay** : affiche un ghost (icône + label) pendant le drag depuis la palette.

**Props reçues depuis `page.tsx` :**

| Prop | Type | Description |
|------|------|-------------|
| `moduleSlug` | `string` | Identifiant du module |
| `sectionSlug` | `string` | Identifiant de la section |
| `contentType` | `string` | `"cours"` \| `"TP"` \| `"examen"` |
| `moduleTitle` | `string` | Titre affiché dans la breadcrumb |
| `sectionTitle` | `string` | Titre affiché dans la breadcrumb |
| `initialBlocks` | `Block[]` | Blocs lus depuis MongoDB (ou `[]` si source fichier) |
| `source` | `"file"` \| `"db"` | Source actuelle du contenu |

---

### `BuilderCanvas`
**Chemin :** `src/components/builder/BuilderCanvas.tsx`

Zone principale d'édition. Affiche les blocs sous forme de liste triable.

**Éléments internes :**

- **`SortableContext`** (DnD Kit) : liste d'IDs de blocs dans l'ordre courant. Le `DndContext`
  parent (dans `BuilderPage`) fournit les capteurs et la détection de collision.
- **`useDroppable({ id: "canvas" })`** : rend le conteneur droppable pour recevoir les blocs
  glissés depuis la palette quand aucun bloc n'est survolé (canvas vide ou zone basse).
- **`SortableBlock`** : composant interne qui enveloppe chaque bloc. Utilise `useSortable`
  pour le handle de déplacement (icône `GripVertical`). Affiche le label de type au survol.
- **`BlockContent`** : sous-composant qui résout le `render` depuis le registry ou appelle
  `getNamedComponent` pour les blocs `named-component`.
- **`InsertLine`** : bouton `+` discret visible au survol entre les blocs, ouvre la `BlockPalette`.
- **`InsertPreview`** : ligne colorée (`brand-primary`) affichée pendant un drag palette pour
  indiquer la position d'insertion. Reçue via la prop `insertPreviewAfter`.
- **`groupByColSpan`** : fonction pure qui regroupe les blocs `colSpan: "half"` consécutifs en
  paires pour le rendu en `grid-cols-2`.

**Prop spéciale :**

| Prop | Type | Description |
|------|------|-------------|
| `insertPreviewAfter` | `string \| null` | ID du bloc après lequel afficher la ligne de preview |

---

### `PropsPanel`
**Chemin :** `src/components/builder/PropsPanel.tsx`

Panneau latéral droit. Deux modes de rendu selon la largeur de la fenêtre :

| Largeur | Mode | Composant shadcn |
|---------|------|------------------|
| `>= 1024px` | `isFixed: true` | `<div>` fixe à droite (256px) |
| `< 1024px` | `isFixed: false` | `<Sheet>` (tiroir latéral) |

**États :**

1. **Bloc sélectionné** (`selectedId !== null`) :
   - Header `bg-module` avec icône `SlidersHorizontal`.
   - `DynamicPropsEditor` pour modifier les props du bloc.
   - `<Select>` pour le `colSpan` (`"full"` / `"half"`).
   - Footer : boutons **Monter** / **Descendre** (`moveBlock`) et **Supprimer** (`deleteBlock`).

2. **Aucun bloc sélectionné** :
   - Hint « Sélectionnez un bloc pour l'éditer. »
   - Séparateur « ou ».
   - `BlockPaletteGrid` en mode `compact + draggable` pour ajouter directement.

**Important** : la `className` `header-${moduleSlug}` est appliquée sur le `SheetContent` pour
que la directive CSS `.header-javascript .bg-module { background: var(--color-javascript) }`
fonctionne même dans le portal Radix (les portals React maintiennent le contexte CSS via les
sélecteurs de classe sur l'élément portal lui-même).

---

### `BlockPaletteGrid`
**Chemin :** `src/components/builder/BlockPaletteGrid.tsx`

Grille de sélection des types de blocs, partagée entre la modal et le panneau.

**Props :**

| Prop | Défaut | Description |
|------|--------|-------------|
| `onSelect` | — | Callback appelé au clic ou au drop |
| `compact` | `false` | `false` → grille 2 colonnes / `true` → liste 1 colonne |
| `autoFocusSearch` | `false` | Focus automatique sur le champ de recherche |
| `draggable` | `false` | Active `useDraggable` sur chaque item (palette → canvas) |

Quand `compact && draggable`, les items sont rendus par le sous-composant `DraggableCompactItem`
qui attache `useDraggable` avec `data: { origin: "palette", def: BlockDefinition }`. Ce `data` est
lu dans `BuilderPage.handleDragEnd` pour distinguer un drop palette d'un réordonnancement canvas.

**`BLOCK_META`** : objet exporté qui associe chaque `type` à une icône Lucide et une description
courte. Utilisé par `BlockPaletteGrid` pour le rendu et par `BuilderPage` pour le `DragOverlay`.

---

### `BlockPalette`
**Chemin :** `src/components/builder/BlockPalette.tsx`

Dialog modal (shadcn `Dialog`) qui s'ouvre via les boutons `+` du canvas. Utilise `BlockPaletteGrid`
en mode non-compact sans `draggable` (ajout par clic uniquement).

La `className` `header-${moduleSlug}` est ajoutée sur le `DialogContent` pour la colorisation
du header modal.

---

### `DynamicPropsEditor`
**Chemin :** `src/components/builder/DynamicPropsEditor.tsx`

Éditeur de props générique, piloté par le tableau `fields: FieldDef[]` de la `BlockDefinition`.

| Type de champ (`FieldDef.type`) | Composant rendu |
|---------------------------------|-----------------|
| `"text"` | `<Input type="text">` |
| `"textarea"` | `<Textarea>` |
| `"number"` | `<Input type="number">` |
| `"select"` | `<Select>` avec les `options[]` |
| `"boolean"` | `<Switch>` |
| `"array-of-strings"` | Liste d'`<Input>` avec ajout / suppression |

À chaque modification, `onChange({ ...props, [key]: value })` est appelé, ce qui déclenche
`updateBlock` dans le store.

---

### `BlockRenderer`
**Chemin :** `src/components/builder/BlockRenderer.tsx`

Composant de rendu en lecture seule, utilisé côté **consultation** (pages publiques, pas dans le
builder). Reçoit un tableau `blocks: Block[]` et les affiche en appliquant `groupByColSpan` pour
le layout 2 colonnes.

Ce composant est distinct de `BlockContent` (builder) pour séparer les préoccupations :
`BlockRenderer` est optimisé pour le rendu public, `BlockContent` est optimisé pour l'édition.

---

### `AiAssistantPanel`
**Chemin :** `src/components/builder/AiAssistantPanel.tsx`

FAB (Floating Action Button) + panel d'assistant IA. **Actuellement désactivé** (bouton en état
`disabled`) car la route de l'API nécessite une clé `ANTHROPIC_API_KEY` valide.

Quand actif, il envoie le message utilisateur + `currentBlocks` à `/api/admin/content/ai-assist`.
Si la réponse contient des `blocks`, il appelle `setBlocks(data.blocks)` pour remplacer le contenu.

---

## 4. Store Zustand

**Chemin :** `src/lib/store/builderStore.ts`

Store singleton (non persisté). Réinitialisé à chaque montage de `BuilderPage` via `setBlocks`.

```ts
interface BuilderStore {
    blocks: Block[];       // Liste ordonnée des blocs
    selectedId: string | null;  // ID du bloc sélectionné dans l'éditeur
    isDirty: boolean;      // true si modifié depuis le dernier save

    setBlocks(blocks: Block[]): void;          // Initialisation + reset isDirty
    selectBlock(id: string | null): void;
    updateBlock(id, props, colSpan?): void;    // Met isDirty = true
    insertBlock(block, position?): void;       // Insère à position (défaut : fin)
    deleteBlock(id): void;                     // Désélectionne si c'est le bloc sélectionné
    moveBlock(id, "up" | "down"): void;        // Swap avec le voisin
    reorderBlocks(orderedIds: string[]): void; // Réordonnancement DnD (liste d'IDs)
    markSaved(): void;                         // Remet isDirty = false après save
}
```

**`insertBlock(block, position?)`** — Sémantique de `position` :
- `undefined` → insère en fin de liste.
- `n` → insère à l'index `n` (décale les blocs suivants).

---

## 5. Block Registry

**Chemin :** `src/lib/blockRegistry.tsx`

Registre centralisé de tous les types de blocs. Chaque `BlockDefinition` décrit :

| Champ | Rôle |
|-------|------|
| `type` | Identifiant unique (`"text"`, `"heading"`, …) |
| `label` | Nom affiché dans la palette |
| `defaultProps` | Props par défaut à l'insertion |
| `schema` | Schéma Zod pour la validation côté API |
| `fields` | Descripteurs de champs pour `DynamicPropsEditor` |
| `render` | Composant React pour le rendu (builder + lecture) |
| `editor?` | Composant d'édition custom (optionnel, non utilisé actuellement) |

**Types disponibles :**

| `type` | Label | Props principales |
|--------|-------|-------------------|
| `text` | Texte | `content: string`, `strong: string[]` |
| `heading` | Titre | `level: 2 \| 3`, `text: string` |
| `list` | Liste | `ordered: boolean`, `items: string[]` |
| `image-card` | Image | `src: string`, `title?: string` |
| `table` | Tableau | `headers: string[]`, `rows: string[][]` |
| `section-card` | Lien de section | `title: string`, `href: string`, `description?: string` |
| `named-component` | Composant interactif | `name: string` (clé dans `namedComponents`) |

**API du registry :**

```ts
getBlockDefinition(type: string): BlockDefinition | undefined
getAllBlockDefinitions(): BlockDefinition[]
```

---

## 6. Composants nommés

**Chemin :** `src/lib/namedComponents.ts`

Table de correspondance `name → React.ComponentType` pour le bloc `named-component`. Ces
composants sont des éléments interactifs réutilisables issus des cours (démos JS, graphiques…).

```ts
export const namedComponents = {
    ColorClickableBox,       // cours/javascript/2-les-evenements
    ClickableBox,
    ClickCounterBox,
    MouseTrackerBox,
    FormBox,
    KeyPressBox,
    MilgramMainChart,        // cours/javascript/4-fetch
    MilgramComparisonChart,
    MilgramVariantesChart,
    MilgramModalContent,
};
```

Pour ajouter un nouveau composant nommé : l'importer dans ce fichier et l'ajouter à l'objet.
Le champ `name` dans le bloc doit correspondre exactement à la clé de cet objet.

---

## 7. Routes API

Toutes les routes sont protégées par `withAdmin` (vérifie `role === "admin"` via `better-auth`).

### `GET /api/admin/content/[module]/[section]/[type]`

Lit le document `course_content` pour le triplet `(moduleSlug, sectionSlug, contentType)`.

**Réponse :**
```json
// Si document trouvé (source: "db")
{
  "contentId": "664abc...",
  "blocks": [...],
  "version": 3,
  "updatedAt": "2026-06-10T...",
  "source": "db"
}

// Si non trouvé (contenu fichier)
{ "blocks": [], "source": "file" }
```

---

### `PUT /api/admin/content/[module]/[section]/[type]`

Sauvegarde les blocs. Comportement **upsert** :

1. Si le document existe → `updateOne` : `$set { blocks, updatedAt }` + `$inc { version: 1 }`.
2. Si non → `insertOne` avec `version: 1`, `createdAt`, `updatedAt`.
3. Dans les deux cas → `updateOne` sur `modules` pour basculer `source: "db"` et stocker
   `contentId` dans le tableau `sections[].contents[]` (via `arrayFilters`).
4. `revalidateTag("content:{module}:{section}:{type}")` pour invalider le cache Next.js.

**Corps de la requête :**
```json
{ "blocks": [ { "id": "uuid", "type": "text", "props": {}, "colSpan": "full" }, ... ] }
```

**Validation :** chaque bloc doit avoir `id`, `type` et `props` (objet). La validation Zod
par `schema` est disponible dans le registry mais n'est pas appliquée côté API PUT (uniquement
dans l'assistant IA) — à renforcer si nécessaire.

---

### `DELETE /api/admin/content/[module]/[section]/[type]`

Supprime le document `course_content` et rebascule `source: "file"` (+ supprime `contentId`)
dans `modules`. Invalide le cache.

---

### `GET /api/admin/content/block-types`

Retourne la liste des types de blocs disponibles (depuis le registry) sans les fonctions `render`.
Utilisé par des clients externes (ex : serveur MCP).

```json
{
  "types": [
    { "type": "text", "label": "Texte", "defaultProps": {...}, "fields": [...] },
    ...
  ]
}
```

---

### `GET /api/admin/content/status`

Retourne une map `{ moduleSlug → { sectionSlug → { contentType → "file" | "db" } } }`.
Utilisé par la page admin pour afficher l'état de migration de tous les contenus.

---

### `POST /api/admin/content/ai-assist`

Appelle l'API Anthropic Claude (`claude-sonnet-4-6`) avec le contenu actuel et le message
utilisateur. Si Claude invoque le tool `update_blocks`, les nouveaux blocs sont écrits en base
immédiatement (même logique upsert que le PUT) et renvoyés au client.

Nécessite la variable d'environnement `ANTHROPIC_API_KEY`.

---

## 8. Collections MongoDB

### Collection `course_content`

Stocke le contenu créé via le builder.

```ts
interface CourseContent {
    _id?: ObjectId;
    moduleSlug: string;      // ex: "javascript"
    sectionSlug: string;     // ex: "1-le-dom"
    contentType: "cours" | "TP" | "examen";
    blocks: Block[];
    version: number;         // Incrémenté à chaque PUT
    createdAt: Date;
    updatedAt: Date;
}

interface Block {
    id: string;              // UUID v4 généré côté client
    type: string;            // Clé dans blockRegistry
    props: Record<string, unknown>;
    colSpan?: "full" | "half";
}
```

**Index recommandé :**
```js
db.course_content.createIndex(
    { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
    { unique: true }
)
```

Le triplet `(moduleSlug, sectionSlug, contentType)` est la clé naturelle. Toutes les requêtes
filtrent sur ces trois champs.

---

### Collection `modules` (impact du builder)

Le builder ne crée pas de documents dans `modules` mais en modifie les sous-documents.

**Structure concernée :**
```json
{
  "path": "javascript",
  "sections": [
    {
      "path": "1-le-dom",
      "contents": [
        {
          "type": "cours",
          "source": "file"         ← avant le premier save
        },
        {
          "type": "cours",
          "source": "db",          ← après le premier save
          "contentId": "664abc..."
        }
      ]
    }
  ]
}
```

La mise à jour se fait avec `arrayFilters` pour cibler le bon sous-document sans réécrire tout
le module :

```js
db.modules.updateOne(
    { path: moduleSlug },
    {
        $set: {
            "sections.$[s].contents.$[c].source": "db",
            "sections.$[s].contents.$[c].contentId": contentId,
        }
    },
    {
        arrayFilters: [
            { "s.path": sectionSlug },
            { "c.type": contentType }
        ]
    }
)
```

---

## 9. Cycle de vie du contenu

```
Fichier .tsx statique (source: "file")
        │
        │  Premier enregistrement via le builder
        ▼
course_content.insertOne(...)         → version: 1
modules.updateOne(source: "db", contentId: ...)
revalidateTag("content:...")
        │
        │  Éditions suivantes
        ▼
course_content.updateOne(...)         → version: n+1, updatedAt
revalidateTag("content:...")
        │
        │  Suppression (DELETE)
        ▼
course_content.deleteOne(...)
modules.updateOne(source: "file", $unset contentId)
revalidateTag("content:...")
```

La **lecture côté public** passe par `getContentBlocks` (`src/lib/getContentBlocks.ts`) qui
utilise `unstable_cache` de Next.js avec le tag `content:{module}:{section}:{type}`. Ce cache est
invalidé à chaque PUT ou DELETE via `revalidateTag`.

---

## 10. Système de cache

**`getContentBlocks`** (`src/lib/getContentBlocks.ts`) est utilisé par les pages de cours publiques
pour afficher le contenu DB. Il met en cache le résultat de `findOne` :

```ts
unstable_cache(
    async () => { /* findOne */ },
    [`content-${moduleSlug}-${sectionSlug}-${contentType}`],
    { tags: [`content:${moduleSlug}:${sectionSlug}:${contentType}`] }
)
```

Les routes PUT, DELETE et l'assistant IA appellent toutes :
```ts
revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 })
```

L'option `{ expire: 0 }` force une invalidation immédiate (pas de délai).

---

## 11. Assistant IA

**Route :** `POST /api/admin/content/ai-assist`  
**Modèle :** `claude-sonnet-4-6`  
**Statut :** Désactivé dans l'UI (bouton `disabled`), fonctionnel côté API.

L'assistant reçoit le contenu actuel en contexte système et expose un seul tool Anthropic :

```json
{
  "name": "update_blocks",
  "description": "Remplace entièrement la liste de blocs du contenu ouvert dans le builder.",
  "input_schema": {
    "type": "object",
    "properties": {
      "blocks": { "type": "array", "items": { ... } }
    }
  }
}
```

Quand Claude utilise ce tool, les blocs sont **écrits en base immédiatement** (sans passer par le
bouton Sauvegarder) et renvoyés au client qui met à jour le store via `setBlocks`.

Pour activer l'assistant, définir `ANTHROPIC_API_KEY` dans `.env.local` et retirer l'attribut
`disabled` du bouton dans `AiAssistantPanel.tsx`.
