# Builder Canvas Redesign — Design Spec

**Date :** 2026-06-24  
**Statut :** Approuvé  
**Périmètre :** Refonte complète de l'UI du Builder — mode Slides (PowerPoint) + mode Cours/TP/Examen (Word) avec canvas éditable et barre contextuelle unifiée.

---

## 1. Vue d'ensemble

Le Builder passe d'une architecture à deux panneaux (arbre gauche + prévisualisation droite) vers un **canvas-first** : le rendu public EST la surface d'édition. Cliquer un bloc dans le canvas l'édite directement, sans panneau de propriétés séparé.

Deux modes de travail :

| Mode | Métaphore | Contenu |
|------|-----------|---------|
| **Slides** | PowerPoint | `contentType === "slide"` |
| **Cours/TP/Examen** | Word | tous les autres `contentType` |

Les deux modes partagent la même barre contextuelle (`ContextualTopBar`) et le même wrapper de bloc éditable (`EditableBlock`).

---

## 2. Layouts

### 2.1 Mode Slides

```
┌────────────────────────────────────────────────────────────┐
│ ContextualTopBar (haut pleine largeur)                      │
├──────────────────┬─────────────────────────────────────────┤
│ SlideThumbnailList│         SlideEditCanvas                 │
│ (gauche, 200px)  │   (centre, fond sombre #1e293b)         │
│                  │                                          │
│ miniature #1     │    ┌──────────────────────────┐         │
│ miniature #2 ◀   │    │   ZoomedSlide (active)   │         │
│ miniature #3     │    │   scale = fit(W, H)       │         │
│                  │    └──────────────────────────┘         │
│ [+ Slide]        │                                          │
└──────────────────┴─────────────────────────────────────────┘
```

- **SlideThumbnailList** : panneau gauche fixe 200 px, scroll vertical, miniatures `ZoomedSlide` à scale ~0.22, `+Slide` en bas.
- **SlideEditCanvas** : centre flex-1, fond `#1e293b`, contient la slide active en `ZoomedSlide` avec scale dynamique.
- **ContextualTopBar** : haut, pleine largeur.

### 2.2 Mode Cours/TP/Examen

```
┌────────────────────────────────────────────────────────────┐
│ ContextualTopBar (haut pleine largeur)                      │
├────────────────────────────────────────────────────────────┤
│               CourseEditCanvas (pleine largeur)             │
│   max-w-3xl centré, fond #f1f5f9, scroll vertical          │
│                                                             │
│   [Section A] titre                                         │
│   [Bloc texte EN ÉDITION → InlineTextEditor]                │
│   [Bloc code → clic = Monaco modal]                         │
│   ─────── + Bloc ici (hover) ───────                        │
│   [Bloc liste repos]                                        │
└────────────────────────────────────────────────────────────┘
```

**Pas de panneau gauche.** L'`EditorTree` est retiré des deux modes.

---

## 3. Composant ZoomedSlide

Wrapper CSS `transform: scale()` qui rend `<SlideScreen>` (jamais `<SlidesScreen>`) à un coefficient variable selon le contexte.

```tsx
// Signature
interface ZoomedSlideProps {
    slide: Block;           // bloc de type "slide"
    mode: "thumbnail" | "canvas-edit";
    isActive?: boolean;     // thumbnail sélectionnée
    onClick?: () => void;   // thumbnail → activer
}
```

### Scale formula

- **Thumbnail** : scale fixe `~0.22` — calculé pour tenir dans la colonne 200 px.
- **Canvas** : `Math.min(panelW / SLIDE_W, panelH / SLIDE_H)` avec `SLIDE_W = 960`, `SLIDE_H = 540`. Recalculé via `ResizeObserver` sur le conteneur parent.

### Rendu interne

```tsx
// Conteneur extérieur : dimensions naturelles de la slide (960×540)
// transform-origin: top left
<div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})` }}>
    <SlideScreen title={slide.props.title}>
        {/* blocs enfants rendus ici */}
    </SlideScreen>
</div>
```

> **Important :** `SlideScreen` = titre + contenu filtré (notes exclues). `SlidesScreen` = chrome de navigation (clavier, fullscreen, barre de progression) — NE PAS inclure dans ZoomedSlide.

### Pointer events

| mode | inner div | raison |
|------|-----------|--------|
| `thumbnail` | `pointerEvents: none` | évite les clics accidentels dans la miniature |
| `canvas-edit` | `pointerEvents: auto` | les blocs à l'intérieur sont cliquables |

### FOUC / hydratation

Le composant est chargé avec `ssr: false` (dynamic import). Pendant la phase de hydratation, afficher un skeleton `animate-pulse` aux dimensions calculées.

### scrollIntoView

Quand `isActive` change à `true`, la miniature appelle `ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })`.

---

## 4. ContextualTopBar

Barre unique en haut du builder, partagée par les deux modes. Deux zones séparées par un `Separator` vertical :

```
[ Zone gauche — actions globales ] | [ Zone droite — props du bloc actif ]
```

### 4.1 Zone gauche — toujours visible

| Élément | Icône Lucide | Description |
|---------|-------------|-------------|
| `+ Bloc` (bouton primaire) | `Plus` | Ouvre le picker de bloc |
| Section active (cours/TP) | `FolderOpen` | Nom de la section courante, cliquable pour changer |
| Titre slide (mode slides) | `Type` | Champ inline éditable pour `slide.props.title` |
| Fond slide (mode slides) | `Palette` | Picker couleur de fond |
| Undo | `Undo2` | `Ctrl+Z` |
| Redo | `Redo2` | `Ctrl+Y` |
| n / total (mode slides) | — | Compteur texte, ex. `2 / 5` |

### 4.2 Zone droite — contextuelle selon le bloc sélectionné

Vide quand aucun bloc n'est sélectionné. Affiche des contrôles spécifiques quand `selectedId !== null` :

| Type de bloc | Contrôles (icônes Lucide) |
|-------------|---------------------------|
| `text`, `slide-text`, `heading`, `list-item`, `slide-list-item` | `Bold` · `Italic` · `Code` · `Link` (formatage markdown inline) |
| `code`, `slide-code` | `Code2` sélecteur de langage ▾ · `Highlighter` champ `highlight` · `Maximize2` ouvre Monaco |
| `image-card` | `ImagePlus` Remplacer · `Type` légende (champ inline) |
| `callout` | `Info`/`AlertTriangle`/`Lightbulb`/`BookMarked` sélecteur de variante ▾ |
| `heading` | `Heading2`/`Heading3` sélecteur de niveau ▾ |
| `list`, `slide-list` | `List` Puces · `ListOrdered` Numérotée (toggle `ordered`) |
| `divider`, `slide-note` | — (aucune prop exposée) |

La zone droite est `null` → le `Separator` central disparaît également (no empty space).

---

## 5. EditableBlock

Wrapper universel autour de chaque bloc dans le canvas (cours ET slides). Gère le cycle repos → hover → édition.

```tsx
interface EditableBlockProps {
    block: Block;
    children: React.ReactNode;  // rendu public du bloc (inchangé)
    onUpdate: (props: Record<string, unknown>) => void;
    onSelect: () => void;
    isSelected: boolean;
    canInlineEdit: boolean;     // inlineEditField !== undefined
}
```

### 3 états

| État | Visuel | Déclencheur |
|------|--------|-------------|
| **Repos** | rendu public normal | par défaut |
| **Hover** | bordure `border-blue-300`, badge `✎ {type}` coin supérieur droit | `onMouseEnter` |
| **Édition** | bordure `border-blue-500` + fond `bg-blue-50`, curseur actif | clic dans le contenu texte |

### Curseurs

| Type de bloc | Curseur |
|-------------|---------|
| Blocs texte (`inlineEditField` défini) | `cursor-text` |
| Blocs action (`code`, `image-card`, `table`) | `cursor-pointer` |
| Conteneurs (`section`, `callout`, fond) | `cursor-default` |

### Sauvegarde

- **Auto-save on blur** : la valeur est envoyée à `onUpdate` quand le focus quitte le bloc.
- **Escape** : annule et restaure la valeur d'origine.
- Pas de bouton "Valider" visible.

### Sélection vs Édition

- Clic dans la **zone texte** → édition inline directe.
- Clic sur le **handle drag** ou **la bordure** → sélection seule (pas d'édition).

### Drag handle

- `GripVertical` (Lucide), visible au hover sur la gauche du bloc.
- Déclenche le réordonnancement via drag-and-drop (même logique que l'actuel `EditorTree`).

### + Bloc entre blocs

Séparateur discret entre chaque paire de blocs, visible au hover :

```
────────────── + Bloc ici ──────────────
```

Cliqué → ouvre le block picker en insérant après ce bloc.

### Supprimer un bloc

- `Trash2` (Lucide) dans la barre d'actions hover (bouton secondaire discret, côté droit de la bordure).

---

## 6. Monaco Editor — modal plein écran

Les blocs `code` et `slide-code` n'ouvrent **pas** Monaco à l'échelle dans le canvas. À la place :

1. Clic sur le bloc code → ouvre `CodeEditorModal` (Dialog shadcn fullscreen).
2. Le modal affiche Monaco en taille réelle.
3. À la fermeture (✕ ou `Escape`) → auto-save vers `block.props.content`.

Raison : Monaco à 60% de scale (mode slide) est illisible et le curseur est décalé.

---

## 7. SlideThumbnailList

Panneau gauche fixe 200 px en mode slides.

```tsx
interface SlideThumbnailListProps {
    slides: Block[];     // blocs de type "slide" au premier niveau
    activeId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
}
```

- **Rendu** : liste verticale de `ZoomedSlide` en mode `thumbnail`, enveloppés dans un bouton cliquable.
- **Indicateur actif** : ring bleu `ring-2 ring-blue-500` autour de la miniature active.
- **scrollIntoView** : la miniature active se centre automatiquement lors de la navigation clavier.
- **Tooltip** : titre de la slide tronqué au survol.
- **+ Slide** : bouton en bas de liste, ajoute une slide vide après la slide active.
- **Skeleton** : `animate-pulse` pendant le chargement initial (SSR false).

---

## 8. SlideEditCanvas

Zone centrale en mode slides.

```tsx
interface SlideEditCanvasProps {
    slide: Block;       // slide active
    onUpdate: (blockId: string, props: Record<string, unknown>) => void;
}
```

- Fond `bg-slate-800` (`#1e293b`), flex centré.
- Contient un `ZoomedSlide` en mode `canvas-edit` avec scale dynamique (ResizeObserver).
- À l'intérieur du `ZoomedSlide`, chaque bloc enfant est enveloppé dans `EditableBlock`.
- Ombre portée `box-shadow: 0 8px 32px rgba(0,0,0,.4)` sur la slide rendue.

---

## 9. CourseEditCanvas

Zone centrale en mode Cours/TP/Examen. Remplace l'ancien `EditorPreview`.

```tsx
interface CourseEditCanvasProps {
    blocks: Block[];
    onUpdate: (blockId: string, props: Record<string, unknown>) => void;
    onSelect: (id: string | null) => void;
    selectedId: string | null;
}
```

- Fond `bg-slate-100`, scroll vertical.
- Contenu centré `max-w-3xl mx-auto py-8`.
- Chaque bloc de premier niveau est enveloppé dans `EditableBlock`.
- Les blocs conteneurs (callout, collapsible) font descendre récursivement `EditableBlock` sur leurs enfants.

---

## 10. BuilderPage — logique de branchement

`BuilderPage.tsx` branch sur `contentType` pour sélectionner le layout :

```tsx
// Pseudo-code simplifié
if (contentType === "slide") {
    return (
        <>
            <ContextualTopBar mode="slide" />
            <div className="flex flex-1 overflow-hidden">
                <SlideThumbnailList ... />
                <SlideEditCanvas ... />
            </div>
        </>
    );
} else {
    return (
        <>
            <ContextualTopBar mode="course" />
            <CourseEditCanvas ... />
        </>
    );
}
```

La prop `deckMode` préparée dans les commits précédents est remplacée par ce branchement direct sur `contentType`.

---

## 11. Modifications builderStore

Ajouts au store Zustand existant (`src/lib/store/builderStore.ts`) :

```ts
// Nouveaux champs
activeSlideId: string | null;    // id de la slide active en mode deck
editingBlockId: string | null;   // id du bloc actuellement en édition inline

// Nouvelles actions
setActiveSlide: (id: string | null) => void;
setEditingBlock: (id: string | null) => void;
```

Les champs existants (`selectedId`, `isDirty`, `_history`, etc.) restent inchangés.

---

## 12. Composants retirés

| Composant | Fichier | Raison |
|-----------|---------|--------|
| `EditorTree` | `src/components/builder/EditorTree.tsx` | Remplacé par canvas-first dans les deux modes |
| `EditorPreview` | `src/components/builder/EditorPreview.tsx` | Remplacé par `CourseEditCanvas` |
| `SlidePreviewList` | `src/components/builder/SlidePreviewList.tsx` | Remplacé par `SlideThumbnailList` + `SlideEditCanvas` |
| `PropsPanel` | `src/components/builder/PropsPanel.tsx` | Remplacé par `ContextualTopBar` zone droite |

Ces fichiers seront supprimés lors de l'implémentation. Leurs fonctionnalités (undo/redo, sélection, mise à jour) sont conservées dans le store et dans les nouveaux composants.

---

## 13. Nouveaux composants à créer

| Composant | Chemin suggéré |
|-----------|---------------|
| `ZoomedSlide` | `src/components/builder/ZoomedSlide.tsx` |
| `SlideThumbnailList` | `src/components/builder/SlideThumbnailList.tsx` |
| `SlideEditCanvas` | `src/components/builder/SlideEditCanvas.tsx` |
| `CourseEditCanvas` | `src/components/builder/CourseEditCanvas.tsx` |
| `ContextualTopBar` | `src/components/builder/ContextualTopBar.tsx` |
| `EditableBlock` | `src/components/builder/EditableBlock.tsx` |
| `CodeEditorModal` | `src/components/builder/CodeEditorModal.tsx` |

---

## 14. Composants inchangés

- `SlideScreen` — rendu interne d'une slide (titre + enfants filtrés). Utilisé par `ZoomedSlide`.
- `SlidesScreen` — player public avec navigation. NON utilisé dans le builder.
- `SlideBlocksRenderer` — rendu serveur pour la page publique. NON modifié.
- Tous les composants `src/components/ui/` et `src/components/Cards/`.

---

## 15. Icônes Lucide — tableau de référence

| Action | Icône Lucide |
|--------|-------------|
| + Bloc | `Plus` |
| Section active | `FolderOpen` |
| Titre slide | `Type` |
| Fond slide | `Palette` |
| Undo / Redo | `Undo2` · `Redo2` |
| Gras / Italique | `Bold` · `Italic` |
| Code inline | `Code` |
| Lien | `Link` |
| Langage code | `Code2` |
| Highlight | `Highlighter` |
| Monaco plein écran | `Maximize2` |
| Remplacer image | `ImagePlus` |
| Légende image | `Type` |
| Callout info | `Info` |
| Callout warning | `AlertTriangle` |
| Callout tip | `Lightbulb` |
| Callout remarque | `BookMarked` |
| Heading H2/H3 | `Heading2` · `Heading3` |
| Liste puces | `List` |
| Liste numérotée | `ListOrdered` |
| Drag handle | `GripVertical` |
| Supprimer bloc | `Trash2` |

---

## 16. Non-périmètre

- Le rendu public des slides (`/[moduleSlug]/[sectionSlug]/slide`) n'est pas modifié.
- L'authentification, le middleware proxy et les routes API ne sont pas touchés.
- Le MCP server et ses outils (`insert_block`, `edit_block`, etc.) restent inchangés.
- Les composants pédagogiques dans `src/cours/` ne sont pas modifiés.
