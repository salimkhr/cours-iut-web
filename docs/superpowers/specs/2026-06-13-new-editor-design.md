# Spec : Nouvel éditeur de contenu — MCP + Fallback Web

**Date :** 2026-06-13
**Périmètre :** Remplacer le builder WYSIWYG + IA Ollama par un MCP server stdio + une interface web légère (fallback sans tokens).

---

## 1. Contexte et problème résolu

Le contenu des cours est actuellement dans des fichiers `.tsx`. Corriger une faute de frappe impose un push + déploiement. Le builder WYSIWYG précédent (DnD Kit, palette, canvas, IA Ollama locale) était trop complexe à maintenir et pas assez fiable en pratique.

**Objectif :** pouvoir modifier tout type de contenu (texte, code, images, structure) sans déploiement, via Claude Desktop (chemin principal) ou une interface web (fallback quand les tokens sont épuisés).

---

## 2. Architecture

```
Claude Desktop (ou tout client MCP)
    └── MCP server (stdio, mcp-server/)
            │
            └──── MongoDB (course_content) ◄──── Next.js app (lecture)
                                                        │
                                              Fallback Web Editor
                                         (/admin/[module]/[section]/[type])
```

**Source de vérité :** MongoDB, collection `course_content`.

**Fichiers `.tsx` existants :** inchangés, lus comme avant en l'absence de document MongoDB. Migration différée.

---

## 3. Modèle de blocs

### 3.1 Nouveau type : `section`

Remplace le bloc `heading`. Un `section` est un conteneur nommé dont la profondeur d'imbrication détermine automatiquement le niveau de titre.

```typescript
interface SectionBlock {
    id: string;
    type: "section";
    props: { title: string };
    children: Block[];
}
```

| Profondeur | Heading généré |
|-----------|---------------|
| 0 (racine) | `<Heading level={2}>` |
| 1 | `<Heading level={3}>` |
| 2 | `<Heading level={4}>` |

Un `section` peut contenir n'importe quel bloc, y compris d'autres `section`.

### 3.2 Bloc supprimé

- `heading` — rendu obsolète par `section`.

### 3.3 Blocs feuilles conservés

Tous les types existants : `text`, `list`, `list-item`, `columns`, `column`, `callout`, `collapsible`, `code`, `code-with-preview`, `diagram`, `download-file`, `quote`, `divider`, `image-card`, `table`, `section-card`.

Les schémas Zod et les règles d'imbrication existants (`blockSchemas.ts`) sont conservés. La règle pour `section` :

```typescript
"section": { allowedChildren: "any" }
```

### 3.4 Type TypeScript mis à jour

```typescript
// src/types/CourseContent.ts
export type Block = {
    id: string;
    type: string;
    props: Record<string, unknown>;
    children?: Block[];
};
```

---

## 4. MCP Server

### 4.1 Emplacement

`mcp-server/` à la racine du repo — package Node.js autonome.

```
mcp-server/
  src/
    index.ts        # point d'entrée, enregistrement des outils
    db.ts           # connexion MongoDB (MONGODB_URI)
    tools/
      list-modules.ts
      list-sections.ts
      get-content.ts
      insert-block.ts
      update-block.ts
      delete-block.ts
      reorder-blocks.ts
    utils/
      tree.ts       # findBlock, insertInTree, deleteFromTree, reorderInTree
  package.json
  tsconfig.json
```

**Dépendances :** `@modelcontextprotocol/sdk`, `mongodb`, `typescript`.

### 4.2 Transport

Stdio standard — compatible Claude Desktop, Cursor, et tout client MCP.

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "cours-iut": {
      "command": "node",
      "args": ["/chemin/absolu/mcp-server/dist/index.js"],
      "env": { "MONGODB_URI": "mongodb://..." }
    }
  }
}
```

### 4.3 Outils

#### `list_modules`
Retourne la liste des modules disponibles depuis `getModules()`.

```typescript
// Retour
{ modules: { slug: string; title: string }[] }
```

#### `list_sections(moduleSlug)`
Retourne les sections d'un module avec leurs types de contenu présents en DB.

```typescript
// Paramètres
{ moduleSlug: string }
// Retour
{ sections: { slug: string; title: string; contentTypes: string[] }[] }
```

#### `get_content(moduleSlug, sectionSlug, contentType)`
Retourne l'arbre complet de blocs.

```typescript
// Paramètres
{ moduleSlug: string; sectionSlug: string; contentType: string }
// Retour
{ blocks: Block[] }
```

#### `insert_block(moduleSlug, sectionSlug, contentType, blockType, props, parentBlockId?, afterBlockId?)`
Insère un nouveau bloc dans l'arbre.

```typescript
// Paramètres
{
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blockType: string;           // type du bloc à créer
    props: Record<string, unknown>;
    parentBlockId?: string | null; // null = racine
    afterBlockId?: string | null;  // null = fin de la liste du parent
}
// Retour
{ ok: true; blockId: string }
```

#### `update_block(moduleSlug, sectionSlug, contentType, blockId, props)`
Met à jour les props d'un bloc existant (trouvé par ID dans tout l'arbre).

```typescript
// Paramètres
{
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blockId: string;
    props: Record<string, unknown>; // merge partiel avec les props existantes
}
// Retour
{ ok: true }
```

#### `delete_block(moduleSlug, sectionSlug, contentType, blockId)`
Supprime un bloc et tous ses enfants.

```typescript
// Paramètres
{ moduleSlug: string; sectionSlug: string; contentType: string; blockId: string }
// Retour
{ ok: true }
```

#### `reorder_blocks(moduleSlug, sectionSlug, contentType, parentBlockId, blockIds)`
Réordonne les enfants directs d'un parent (ou de la racine).

```typescript
// Paramètres
{
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    parentBlockId: string | null; // null = racine
    blockIds: string[];           // IDs dans le nouvel ordre
}
// Retour
{ ok: true }
```

### 4.4 Persistance

Chaque outil lit l'arbre depuis MongoDB, applique la modification en mémoire, puis écrit l'arbre complet avec `updateOne + upsert`. Pas de transaction (pas de replica set requis) — opération atomique sur un document unique.

---

## 5. Fallback Web Editor

### 5.1 Route

`/admin/[moduleSlug]/[sectionSlug]/[contentType]` — remplace la page builder actuelle.

### 5.2 Layout

Split panel horizontal — redimensionnable via un séparateur draggable :

```
┌─────────────────────────┬──────────────────────────┐
│  Toolbar                                            │
├─────────────────────────┼──────────────────────────┤
│  Arbre de blocs         │  iframe (cours réel)     │
│  (éditeur)              │                          │
│                         │                          │
└─────────────────────────┴──────────────────────────┘
```

- **Gauche :** arbre récursif de blocs avec formulaires inline
- **Droite :** `<iframe src="/[moduleSlug]/[sectionSlug]/[contentType]">` rechargée après chaque sauvegarde

### 5.3 Toolbar

- Fil d'Ariane : `Admin > [module] > [section] > [contentType]`
- Badge source (`DB` / `fichier`)
- Indicateur "Non sauvegardé" si `isDirty`
- Bouton **Sauvegarder** (désactivé si clean ou en cours)

### 5.4 Arbre de blocs

**Structure visuelle :** indentation selon la profondeur. Les blocs `section` sont repliables (chevron) — pour naviguer rapidement dans un document long.

**Par bloc :**
- En-tête : type + titre/résumé du contenu (ex: les 40 premiers caractères de `content` ou `title`)
- Formulaire inline des props (champs déterminés dynamiquement par type)
- Bouton supprimer (confirmation inline 1.5 s)
- Bouton "Ajouter un bloc enfant" (si conteneur) et "Ajouter un bloc après" (sibling)

**Sélecteur de type :** liste déroulante des types disponibles → crée le bloc avec des props par défaut.

**Formulaire par type de prop :**
| Type de valeur | Contrôle UI |
|---------------|-------------|
| string court | `<input type="text">` |
| string long (code, chart, content) | `<textarea>` avec hauteur auto |
| boolean | `<checkbox>` |
| number | `<input type="number">` |
| enum | `<select>` |
| array de strings | champs répétables + bouton "+" |
| array d'arrays (table rows) | grille éditable |

### 5.5 Undo / Redo

Historique de snapshots géré par `zundo` (middleware Zustand `temporal`).

- Chaque modification (édition, ajout, suppression) pousse un snapshot
- Max 50 entrées
- `Ctrl+Z` → `undo()`
- `Ctrl+Y` → `redo()`
- Les indicateurs undo/redo disponibles sont exposés dans le store

### 5.6 Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` | Sauvegarder |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Refaire |
| `Ctrl+I` | Ouvrir le sélecteur d'insertion de bloc |

`Ctrl+I` ouvre une palette de types de blocs (popover ou dialog) permettant de choisir le type et l'emplacement d'insertion.

### 5.7 Sauvegarde

`PUT /api/admin/content/[moduleSlug]/[sectionSlug]/[contentType]` — route existante, corps `{ blocks }`. Après succès : `markSaved()` + reload de l'iframe.

---

## 6. Ce qui est supprimé

| Fichier / composant | Raison |
|---------------------|--------|
| `src/components/builder/BuilderCanvas.tsx` | Builder DnD |
| `src/components/builder/BlockPalette.tsx` | Builder DnD |
| `src/components/builder/BlockPaletteGrid.tsx` | Builder DnD |
| `src/components/builder/BlockTree.tsx` | Builder DnD |
| `src/components/builder/ColumnsEditor.tsx` | Builder DnD |
| `src/components/builder/PropsPanel.tsx` | Remplacé par formulaires inline |
| `src/components/builder/InlineTextEditor.tsx` | Builder DnD |
| `src/components/builder/AiAssistantPanel.tsx` | IA Ollama |
| `src/components/builder/StandaloneChatPanel.tsx` | IA Ollama |
| `src/lib/hooks/useChatSession.ts` | IA Ollama |
| `src/app/api/admin/content/ai-assist-local/route.ts` | IA Ollama |
| `src/app/api/admin/content/ai-assist/route.ts` | IA Ollama |
| `src/app/api/admin/content/ai-status/route.ts` | IA Ollama |
| `src/app/api/admin/content/ai-chat-history/route.ts` | IA Ollama |
| `src/app/admin/chat/[...]/` | IA Ollama (popup) |
| `@dnd-kit/*` | Plus de DnD |

**Conservés :**
- `src/components/builder/BlockRenderer.tsx` — utilisé dans l'aperçu
- `src/components/builder/DynamicPropsEditor.tsx` — simplifié pour le fallback
- `src/components/builder/ImageUploadField.tsx` — toujours nécessaire
- `src/components/builder/TableBlockEditor.tsx` — toujours nécessaire
- `src/lib/store/builderStore.ts` — allégé + `zundo`
- `src/lib/blockSchemas.ts`, `src/lib/blockRegistry.tsx`, `src/lib/blockTreeUtils.ts` — conservés

---

## 7. Ce qui n'est PAS dans ce périmètre

- Migration des fichiers `.tsx` existants vers MongoDB
- Interface de consultation de l'historique des modifications
- Gestion multi-utilisateurs / conflits d'édition simultanée
- Drag & drop pour réordonner les blocs dans le fallback web (via MCP uniquement)
- Auth propre du MCP server (il lit `MONGODB_URI` directement)
