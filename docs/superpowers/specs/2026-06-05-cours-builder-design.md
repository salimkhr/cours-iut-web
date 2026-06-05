# Cours Builder — Design Spec

**Date** : 2026-06-05  
**Statut** : Approuvé  
**Périmètre** : Phase 1 — Cours, TP, Examen (Slides en phase 2)

---

## 1. Contexte et objectif

Actuellement, le contenu pédagogique (Cours, TP, Examen) est stocké sous forme de fichiers `.tsx` dans `src/cours/{module}/{section}/`. Chaque fichier est un composant React utilisant la bibliothèque de composants custom (`Text`, `Heading`, `CodeCard`, etc.).

**Objectif** : Migrer ce contenu vers MongoDB sous forme de blocs structurés, exposer un builder WYSIWYG dans l'interface admin, et permettre la création/édition de contenu par une IA via un serveur MCP.

**Ce que ce système remplace** :
- Les fichiers `.tsx` de contenu dans `src/cours/`
- Le script `generateContentImports.js` (supprimé après migration complète)
- Le fichier `src/lib/contentImports.ts` (généré automatiquement, supprimé après migration)

**Ce qui ne change pas** :
- La collection MongoDB `modules` et son schéma (métadonnées, disponibilité, objectifs)
- Les composants interactifs (`.tsx` dans `src/cours/`) — ils restent en fichiers, référencés par nom
- L'architecture App Router de Next.js

---

## 2. Modèle de données

### 2.1 Nouvelle collection `course_content`

Un document par triplet `(moduleSlug, sectionSlug, contentType)`.

```typescript
interface CourseContent {
  _id: ObjectId;
  moduleSlug:  string;          // ex: "javascript"
  sectionSlug: string;          // ex: "1-le-dom"
  contentType: "cours" | "TP" | "examen"; // "slide" en phase 2
  blocks:      Block[];
  version:     number;          // commence à 1, incrémenté à chaque PUT
  createdAt:   Date;
  updatedAt:   Date;
}
```

Index unique obligatoire :
```javascript
db.course_content.createIndex(
  { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
  { unique: true }
)
```

### 2.2 Structure d'un bloc

```typescript
interface Block {
  id:       string;                    // UUID v4, stable à travers les éditions
  type:     string;                    // clé du registre de blocs
  props:    Record<string, unknown>;   // dépend du type
  colSpan?: "full" | "half";          // défaut: "full"
}
```

La propriété `colSpan` est universelle (présente sur tout bloc). Deux blocs `"half"` consécutifs sont automatiquement regroupés en grille CSS par le renderer.

### 2.3 Types de blocs — Phase 1

| type | props principales | Notes |
|------|------------------|-------|
| `text` | `content: string`, `strong?: string[]` | Paragraphe avec parties en gras |
| `heading` | `level: 2 \| 3`, `text: string` | Titres de section |
| `list` | `ordered: boolean`, `items: string[]` | Liste ordonnée ou non |
| `image-card` | `src: string`, `alt: string`, `caption?: string` | Image avec légende |
| `diagram-card` | `content: string`, `type: "mermaid"` | Diagramme Mermaid |
| `table` | `headers: string[]`, `rows: string[][]` | Tableau de données |
| `section-card` | `title: string`, `href: string`, `description?: string` | Lien de section |
| `named-component` | `name: string` | Référence un composant `.tsx` interactif par son nom |

**Phase 2** (hors scope) : `code-card`, `code-with-preview`, `slide`.

### 2.4 Registre de blocs

Chaque type de bloc est une entrée dans un registre central (`src/lib/blockRegistry.ts`). Ajouter un nouveau type = ajouter une entrée, zéro code ailleurs.

```typescript
interface BlockDefinition {
  type:         string;
  label:        string;
  defaultProps: Record<string, unknown>;
  schema:       ZodSchema;                         // validation côté serveur
  render:       React.ComponentType<BlockRenderProps>;  // affichage
  editor:       React.ComponentType<BlockEditorProps>;  // formulaire dans le panneau
}
```

### 2.5 Évolution de `Section.contents`

`Section.contents` passe de `string[]` à `ContentRef[]` dans le type TypeScript et dans MongoDB.

```typescript
type ContentRef =
  | { type: string; source: "file" }
  | { type: string; source: "db"; contentId: string }; // string = ObjectId sérialisé

// Dans Section.ts
contents: ContentRef[];
```

**Règles** :
- Avant migration : `{ type: "cours", source: "file" }`
- Après migration : `{ type: "cours", source: "db", contentId: "<ObjectId>" }`
- Le `PUT /api/admin/content/...` met à jour automatiquement la ref lors d'un upsert
- Intégrité référentielle gérée dans le code : la suppression d'un `course_content` repasse `source` à `"file"` dans `modules`

**Migration des données existantes dans MongoDB** :
Les documents actuels dans `modules` ont `contents: string[]` (ex: `["cours", "TP", "slide"]`). Une migration one-shot est nécessaire avant de déployer le nouveau code :

```javascript
// Script à exécuter une seule fois (src/scripts/migrate-contents-refs.ts)
db.collection("modules").find().forEach(module => {
  module.sections = module.sections.map(section => ({
    ...section,
    contents: section.contents.map(c =>
      typeof c === "string" ? { type: c, source: "file" } : c
    )
  }));
  db.collection("modules").replaceOne({ _id: module._id }, module);
});
```

Cette migration est idempotente (si `c` est déjà un objet, il est laissé tel quel).

---

## 3. Stratégie de transition (fallback)

`getContentComponent()` vérifie la source avant de charger :

```typescript
const ref = section.contents.find(c => c.type === contentSlug);

if (!ref) return null;

if (ref.source === "db") {
  const doc = await db.collection("course_content")
    .findOne({ _id: new ObjectId(ref.contentId) });
  return () => <BlockRenderer blocks={doc.blocks} />;
} else {
  // fallback fichier .tsx (contentImports.ts)
  return contentImports[moduleSlug]?.[sectionSlug]?.[contentSlug] ?? null;
}
```

Les deux systèmes coexistent pendant la migration. La migration se fait cours par cours via le MCP. Une fois tous les contenus migrés, le fallback et `contentImports.ts` sont supprimés.

---

## 4. API Routes

Toutes sous `/api/admin/content/`, protégées par `withAdmin`.

### Routes

| Méthode | Route | Action |
|---------|-------|--------|
| `GET` | `/api/admin/content/[module]/[section]/[type]` | Charge les blocs d'un contenu |
| `PUT` | `/api/admin/content/[module]/[section]/[type]` | Upsert blocs + met à jour `contentId` dans `modules` |
| `DELETE` | `/api/admin/content/[module]/[section]/[type]` | Supprime `course_content` + repasse `source: "file"` |
| `GET` | `/api/admin/content/block-types` | Liste les types du registre (pour la palette) |
| `GET` | `/api/admin/content/status` | État de migration (file/db) de tous les cours |

### PUT — corps de la requête

```typescript
// Request body
{ blocks: Block[] }

// Ce que la route fait (séquentiel, sans transaction)
// 1. Valide chaque bloc via son schéma Zod dans le registre
// 2. Upsert course_content (insert ou replace)
// 3. Met à jour sections[].contents[type] dans modules
//    → source: "db", contentId: result._id.toString()
// 4. Retourne { contentId, version, updatedAt }
```

### GET /status — réponse

```json
{
  "javascript": {
    "1-le-dom": { "cours": "file", "TP": "db", "slide": "file" },
    "2-les-evenements": { "cours": "db", "TP": "db" }
  },
  "php": { ... }
}
```

---

## 5. MCP Server

### Architecture

Serveur Node.js séparé (`src/mcp/server.ts`), port 3001. N'accède jamais à MongoDB directement — appelle les API Routes Next.js avec un token admin en header `Authorization: Bearer <token>`.

```
Claude Desktop / Claude Code
        ↓ tool call
   MCP Server (port 3001)
        ↓ fetch + Bearer token
   API Routes Next.js (port 3000)
        ↓
      MongoDB
```

### Implémentation

```typescript
// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const BASE  = process.env.NEXT_URL;         // http://localhost:3000
const TOKEN = process.env.MCP_ADMIN_TOKEN;  // session token better-auth

const api = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}/api/admin/content/${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...opts?.headers }
  });
```

### 8 tools exposés

| Tool | Params | Action |
|------|--------|--------|
| `get_migration_status` | — | État file/db de tous les cours |
| `get_content` | `module, section, type` | Retourne le tableau de blocs |
| `list_block_types` | — | Liste les types du registre |
| `save_content` | `module, section, type, blocks[]` | PUT complet (upsert) |
| `delete_content` | `module, section, type` | Supprime le contenu |
| `insert_block` | `module, section, type, block, position?, afterBlockId?` | Insère un bloc. Si ni `position` ni `afterBlockId` → append à la fin |
| `edit_block` | `module, section, type, blockId, props` | Remplace entièrement les props d'un bloc (replace, pas merge) |
| `delete_block` | `module, section, type, blockId` | Supprime un bloc par son ID |

**`insert_block` — résolution de position** :
1. Si `position` fourni → insère à l'index `position`
2. Sinon si `afterBlockId` fourni → insère après le bloc avec cet ID
3. Sinon → append à la fin

### Configuration Claude Desktop

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "cours-iut": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "env": {
        "NEXT_URL": "http://localhost:3000",
        "MCP_ADMIN_TOKEN": "<token>"
      }
    }
  }
}
```

### Variables d'environnement

```bash
# .env.local (jamais committé)
MCP_ADMIN_TOKEN=<session token better-auth d'un compte admin>
NEXT_URL=http://localhost:3000
```

### Scénario de migration

```
Vous : "Migre tous les cours JavaScript"
Claude : appelle get_migration_status
       → voit javascript/1-le-dom/cours = "file"
Claude : lit src/cours/javascript/1-le-dom/Cours.tsx
       → convertit les composants JSX en blocs JSON
Claude : appelle save_content("javascript", "1-le-dom", "cours", [...blocks])
Claude : passe au cours suivant → répète
```

---

## 6. Builder UI

### Layout

Page admin : `/admin/content/[moduleSlug]/[sectionSlug]/[contentType]`

```
┌─────────────────────────────────────────────────────┐
│ ← Sections │ JavaScript — Le DOM │ [cours] [DB ✓]  │ [Aperçu public] [Sauvegarder] │
├──────────────────────────────┬──────────────────────┤
│                              │                      │
│   ZONE RENDU LIVE            │  PANNEAU PROPS       │
│   (blocs rendus réellement)  │  (ouvert au clic)    │
│                              │                      │
│   ── + ──                    │  [type du bloc]      │
│   ▌ A- Sélectionner...       │  champ 1 : ...       │
│   ── + ──                    │  champ 2 : ...       │
│   ▌ La structure d'une...◄── │                      │
│   ── + ──                    │  [↑] [↓]             │
│   ▌ ⚡ ColorClickableBox     │  [🗑 Suppr] [✓ Apply]│
│   ── + ──                    │                      │
│                              │                      │
│                          [✦] │                      │
└──────────────────────────────┴──────────────────────┘
```

### Comportement des panneaux

| Largeur fenêtre | Panneau props | Panneau IA |
|----------------|---------------|------------|
| ≥ 1024px | Permanent à droite (260px) | Flottant overlay bas-droit |
| < 1024px (demi-écran PC) | Overlay depuis la droite, ferme avec × | Idem |

Implémentation : `shadcn/ui Sheet` avec `side="right"`. Un hook `useBuilderLayout` retourne `"fixed" \| "overlay"` selon `window.innerWidth`.

### Interactions

**Ajouter un bloc** :
- Bouton `+` entre chaque bloc (visible au survol de la zone entre deux blocs)
- Clic → palette modale avec les types du registre + champ de recherche
- Sélection → `insert_block` en état local → rendu mis à jour instantanément

**Sélectionner / éditer un bloc** :
- Survol → outline léger + poignée `⠿` visible
- Clic → outline accent + badge type + ouverture du panneau props
- Panneau affiche les champs éditables du bloc (générés depuis `BlockDefinition.editor`)
- "Appliquer" → mise à jour de l'état local → rendu mis à jour instantanément
- Pas de sauvegarde automatique

**Réordonner** :
- Drag & drop via poignée `⠿` (indicator de drop = ligne bleue entre blocs)
- Boutons ↑ ↓ dans le panneau props (déplace d'une position)

**Mise en colonnes** :
- Dans le panneau props : sélecteur "Largeur" → `full` | `half`
- Deux blocs consécutifs avec `colSpan: "half"` → rendu en grille `grid-cols-2`
- Le renderer regroupe automatiquement les séquences de blocs `half`

**Sauvegarder** :
- Bouton "Sauvegarder" en top bar
- `PUT /api/admin/content/[module]/[section]/[type]` avec l'état local complet
- Toast de confirmation

**Badge DB / file** :
- `source: "db"` → badge vert "DB ✓" + builder actif
- `source: "file"` → badge orange "Fichier" + bouton "Migrer vers DB" (lance la migration via MCP)

### État local

Géré avec Zustand (`src/lib/store/builderStore.ts`) :

```typescript
interface BuilderStore {
  blocks:       Block[];
  selectedId:   string | null;
  isDirty:      boolean;       // true si changements non sauvegardés
  setBlocks:    (blocks: Block[]) => void;
  selectBlock:  (id: string | null) => void;
  updateBlock:  (id: string, props: Record<string, unknown>) => void;
  insertBlock:  (block: Block, position?: number) => void;
  deleteBlock:  (id: string) => void;
  moveBlock:    (id: string, direction: "up" | "down") => void;
  reorderBlocks:(orderedIds: string[]) => void;
}
```

### Assistant IA embarqué

Bouton `✦` flottant bas-droit. Clic → panneau flottant (même pattern que les boutons admin existants).

Claude reçoit en contexte :
- Les blocs actuels du cours (sérialisés en JSON)
- Les types de blocs disponibles

Claude appelle les mêmes tools que le MCP server (via des Server Actions Next.js qui proxient vers les API Routes avec le token de session de l'admin connecté) :
- `insert_block`, `edit_block`, `delete_block`, `save_content`

Chaque action de Claude met à jour l'état Zustand → rendu live mis à jour.

---

## 7. Renderer de blocs

Composant `BlockRenderer` (`src/components/builder/BlockRenderer.tsx`) :

```typescript
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  // Regroupe les blocs "half" consécutifs en grille
  const groups = groupByColSpan(blocks);

  return (
    <article>
      {groups.map((group) =>
        group.length === 1 ? (
          <BlockItem key={group[0].id} block={group[0]} />
        ) : (
          <div key={group[0].id} className="grid grid-cols-2 gap-4">
            {group.map((b) => <BlockItem key={b.id} block={b} />)}
          </div>
        )
      )}
    </article>
  );
}

function BlockItem({ block }: { block: Block }) {
  const def = blockRegistry.get(block.type);
  if (!def) return <UnknownBlock type={block.type} />;
  const Render = def.render;
  return <Render {...block.props} />;
}
```

Le `named-component` résout son composant depuis un registre de composants interactifs (`src/lib/namedComponents.ts`) qui importe explicitement chaque `.tsx` interactif :

```typescript
// src/lib/namedComponents.ts
import ColorClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ColorClickableBox";
import MilgramCharts from "@/cours/javascript/4-fetch/modal/MilgramCharts";
// ...

export const namedComponents: Record<string, React.ComponentType> = {
  ColorClickableBox,
  MilgramCharts,
};
```

---

## 8. Découpage en phases

### Phase 1 (ce spec)
- [ ] Schéma `Block`, `ContentRef`, `CourseContent`
- [ ] Migration de `Section.contents` (string[] → ContentRef[])
- [ ] Collection `course_content` + index
- [ ] Registre de blocs (8 types)
- [ ] Renderer `BlockRenderer` + `namedComponents.ts`
- [ ] Fallback dans `getContentComponent()`
- [ ] API Routes (5 routes)
- [ ] MCP Server + 8 tools
- [ ] Builder UI (layout, blocs, panneau props, drag & drop, ↑↓, colSpan)
- [ ] Assistant IA embarqué (panneau flottant)
- [ ] Migration des cours existants via MCP

### Phase 2 (hors scope)
- Slides
- Types de blocs `code-card` et `code-with-preview`
- Suppression du fallback `.tsx` et de `contentImports.ts`
- Responsive mobile (<600px)

---

## 9. Fichiers créés / modifiés

### Nouveaux fichiers
```
src/types/CourseContent.ts          — interfaces Block, ContentRef, CourseContent
src/lib/blockRegistry.ts            — registre des types de blocs
src/lib/namedComponents.ts          — map nom → composant interactif
src/components/builder/
  BlockRenderer.tsx                 — renderer de production
  BuilderCanvas.tsx                 — zone de rendu éditable (avec handles)
  BlockPalette.tsx                  — palette d'ajout de blocs
  PropsPanel.tsx                    — panneau propriétés latéral
  AiAssistantPanel.tsx              — panneau assistant IA flottant
  editors/                          — un composant editor par type de bloc
    TextEditor.tsx
    HeadingEditor.tsx
    ...
src/lib/store/builderStore.ts       — état Zustand du builder
src/app/admin/content/
  [moduleSlug]/[sectionSlug]/
    [contentType]/page.tsx          — page builder
src/app/api/admin/content/
  [module]/[section]/[type]/route.ts
  block-types/route.ts
  status/route.ts
src/mcp/server.ts                   — MCP server
```

### Fichiers modifiés
```
src/types/Section.ts                — contents: ContentRef[]
src/lib/getContentComponent.ts      — ajout fallback DB/file
src/app/admin/page.tsx              — liens vers le builder par section
```

---

## 10. Décisions de design

| Décision | Choix | Raison |
|----------|-------|--------|
| Architecture | API Routes comme backbone | Auth centralisée (better-auth), logique dans Next.js, MCP = consommateur |
| MCP accès DB | Via API Routes (jamais direct) | Validation Zod unique, withAdmin unique |
| Auth MCP | Bearer token = session token admin | Réutilise better-auth, pas de nouvelle couche |
| Schema blocs | Plat (pas de blocs imbriqués) | Simplicité du builder et du MCP |
| Colonnes | `colSpan: "half"` sur le bloc | Évite les blocs imbriqués, schema reste plat |
| Sauvegarde | Manuelle (bouton) | Évite les sauvegardes accidentelles |
| edit_block props | Replace entier (pas merge) | Prévisible, pas d'état caché |
| Migration | Via MCP (Claude lit .tsx) | Valide les tools, pas de script à maintenir |
| Slides | Phase 2 | Complexité différente, pas bloquant pour le reste |
