# Slide Builder — Design Spec

## Objectif

Permettre la création et l'édition de slides pédagogiques depuis l'admin builder et les outils MCP,
avec stockage en MongoDB. Les fichiers `Slide.tsx` existants restent en `source: "file"` jusqu'à
migration manuelle explicite.

## Architecture globale

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| `src/types/CourseContent.ts` | Ajouter `"slide"` au type union `contentType` |
| `src/lib/blockDefs.ts` | 6 nouveaux types `slide-*` dans catégorie `"Slides"` |
| `src/lib/blockSchemas.ts` | Règles conteneur pour `slide-*` + schémas Zod |
| `src/lib/blockRegistry.tsx` | Icons Lucide + composants de rendu pour `slide-*` |
| `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx` | Branch `source === "db"` → `SlideBlocksRenderer` + `EditContentFab` |
| `src/app/api/mcp/route.ts` | Ajouter `"slide"` à la validation Zod du paramètre `contentType` |

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `src/components/Slides/SlideBlocksRenderer.tsx` | Rend `Block[]` → `<SlidesScreen>` + `<SlideScreen>` + contenu slide |

### Fichiers inchangés

- `src/app/api/admin/content/[module]/[section]/[type]/route.ts` — accepte déjà `contentType` dynamiquement
- `src/app/admin/content/[moduleSlug]/[sectionSlug]/[contentType]/page.tsx` — fonctionne immédiatement
- Composants `SlidesScreen`, `SlideScreen`, `SlideCode`, `SlideText`, `SlideList`, `SlideNote` — réutilisés tels quels

## Types de blocs `slide-*`

### Catégorie

Nouvelle catégorie `"Slides"` dans `BlockCategory` de `blockDefs.ts`.

### Règles conteneur

```
slide          → children autorisés : slide-text, slide-code, slide-list, slide-note, columns
slide-list     → children autorisés : slide-list-item uniquement
slide-list-item → feuille
slide-text      → feuille
slide-code      → feuille
slide-note      → feuille
```

À la racine d'un contenu slide, seul le type `slide` est autorisé.

Le bloc `columns` est autorisé comme enfant direct d'un `slide` (mise en page côte-à-côte). Le bloc `column` doit accepter les types `slide-*` dans ses `children` quand il se trouve dans un contexte slide. En pratique : étendre `containerRules["column"]` pour inclure `slide-text`, `slide-code`, `slide-list`, `slide-note`.

### Définitions détaillées

#### `slide`
- **Label :** Slide
- **Props :** `{ title: string }`
- **Schema Zod :** `z.object({ title: z.string() })`
- **Conteneur :** oui — `initialChildren` : 1 `slide-text` vide
- **Rend :** `<SlideScreen title={title}>{children}</SlideScreen>`
- **inlineEditField :** `"title"`

#### `slide-text`
- **Label :** Texte slide
- **Props :** `{ content: string }` — markdown inline accepté (`**gras**`, `_em_`, `` `code` ``, `[lien](url)`)
- **Schema Zod :** `z.object({ content: z.string() })`
- **Rend :** `<SlideText>{content}</SlideText>` (parsing markdown inline identique au bloc `text`)
- **inlineEditField :** `"content"`

#### `slide-code`
- **Label :** Code slide
- **Props :** `{ language: string; code: string; highlight?: string }`
- **Schema Zod :**
  ```ts
  z.object({
      language: z.string(),
      code: z.string(),
      highlight: z.string().optional(),
  })
  ```
- **Champ `highlight` :** syntaxe libre `"1-3 | 5-7 | 9"` — les groupes séparés par `|` définissent les étapes d'animation. Validé au runtime par `SlideCode`, pas en Zod (format libre).
- **Rend :** `<SlideCode language={language} highlight={highlight}>{code}</SlideCode>`

#### `slide-list`
- **Label :** Liste slide
- **Props :** `{ ordered: boolean }`
- **Schema Zod :** `z.object({ ordered: z.boolean() })`
- **Conteneur :** oui — `initialChildren` : 1 `slide-list-item` vide
- **Rend :** `<SlideList ordered={ordered}>{children}</SlideList>`

#### `slide-list-item`
- **Label :** Élément liste slide
- **Props :** `{ text: string }` — markdown inline
- **Schema Zod :** `z.object({ text: z.string() })`
- **Rend :** `<SlideListItem>{text}</SlideListItem>`
- **inlineEditField :** `"text"`

#### `slide-note`
- **Label :** Note présentateur
- **Props :** `{ content: string }`
- **Schema Zod :** `z.object({ content: z.string() })`
- **Rend :** `<SlideNote>{content}</SlideNote>` — `SlideNote` est filtré du flux principal et affiché uniquement dans le panneau notes de `SlidesScreen`

## `SlideBlocksRenderer`

**Emplacement :** `src/components/Slides/SlideBlocksRenderer.tsx`  
**Type :** Server Component (pas de `"use client"`)

```tsx
// Signature
interface SlideBlocksRendererProps {
    blocks: Block[];
    module: Module;
    section: Section;
}
export function SlideBlocksRenderer({ blocks, module, section }: SlideBlocksRendererProps)
```

**Logique :**
1. Filtre les blocs racine pour ne garder que les `slide` (les autres types à la racine sont ignorés silencieusement)
2. Pour chaque bloc `slide`, rend un `<SlideScreen title={b.props.title}>`
3. Dans chaque `SlideScreen`, itère `b.children` et dispatch par `b.type` :
   - `slide-text` → `<SlideText>` avec parsing markdown inline
   - `slide-code` → `<SlideCode language highlight>{code}</SlideCode>`
   - `slide-list` → `<SlideList ordered>` + récursion sur `children` pour `slide-list-item`
   - `slide-list-item` → `<SlideListItem>`
   - `slide-note` → `<SlideNote>`
   - `columns` → grille existante avec colonnes récursives (réutilise la logique de `BlockRenderer`)
4. Enveloppe le tout dans `<SlidesScreen module={module} section={section}>`

Le `SlideBlocksRenderer` est un Server Component mais ses enfants (`SlidesScreen`, `SlideScreen`) sont des Client Components (ils le sont déjà dans le code existant).

## Modifications de `slide/page.tsx`

```
1. Récupérer currentSection via getModuleData
2. ref = getContentRef(currentSection.contents, "slide")
3. Si ref.source === "db"
   → getContentBlocks(moduleSlug, sectionSlug, "slide")
   → Si pas de doc en DB : notFound()
   → Rendre <SlideBlocksRenderer blocks={doc.blocks} module={currentModule} section={currentSection} />
4. Si ref.source === "file" (ou ref absent)
   → comportement actuel (contentImports) — inchangé
5. Ajouter <EditContentFab contentType="slide"> conditionnel (isAdmin)
```

## Compatibilité Approche 2 (panneau deck — future)

`BuilderPage` reçoit un prop optionnel `deckMode?: boolean` (non utilisé en Approche 1, `undefined` par défaut).  
Quand `contentType === "slide"`, la page admin passe `deckMode={true}` — ce qui n'a aucun effet en Approche 1 mais permettra à l'Approche 2 de brancher un `SlideDeckPanel` à la place de `EditorTree` sans modifier `BuilderPage`.

## MCP

Aucun nouvel outil. Les outils existants couvrent tout :

- `list_block_types` — expose `slide-*` automatiquement via `blockDefs`
- `get_content` / `save_content` — fonctionnent pour `contentType: "slide"`
- `insert_block` / `edit_block` / `delete_block` — fonctionnent sur les blocs `slide-*`

**Seule modification :** dans `src/app/api/mcp/route.ts`, si `contentType` est validé par un `z.enum(["cours", "TP", "examen"])`, ajouter `"slide"` à cet enum.

## Migration des Slide.tsx existants

Hors périmètre. Les 6 fichiers `Slide.tsx` restent en `source: "file"`. La migration se fait au cas par cas via le bouton "Passer en DB" du builder admin, sans script automatique.

## Tests

- Créer une slide en DB via le builder → vérifier le rendu sur `/{module}/{section}/slide`
- Navigation clavier (← →) et fullscreen fonctionnent
- `slide-code` avec `highlight="1-3 | 5-7"` produit 2 étapes d'animation
- `slide-note` n'est visible que dans le panneau notes, pas dans la slide
- `EditContentFab` apparaît sur la page slide pour les admins
- MCP : `insert_block` crée un bloc `slide` avec un `slide-text` enfant
