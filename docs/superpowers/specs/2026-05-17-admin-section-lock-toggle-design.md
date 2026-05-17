# Design — Toggle lock/unlock section (admin) + cohérence Sheet

**Date :** 2026-05-17
**Statut :** Approuvé

---

## Contexte

Deux lacunes identifiées dans l'interface admin :

1. Sur les pages de module (`/[moduleSlug]`), les admins ne voient aucun indicateur de l'état `isAvailable` des sections — le badge "Verrouillé" n'est affiché qu'aux non-admins. Un admin ne peut donc pas savoir d'un coup d'œil quelles sections sont accessibles aux étudiants.

2. `AddModuleButton` ouvre un `Dialog` (modale centrée), alors que toutes les autres actions admin (`EditModuleSheet`, `SectionForm`) utilisent un `Sheet` (panneau latéral). Incohérence visuelle et UX.

---

## Feature 1 — Toggle lock/unlock sur SectionCard

### Fichier concerné

- `src/components/Cards/SectionCard.tsx`

### Comportement actuel

```ts
const isLocked = !isAdmin && !section.isAvailable;
```

Le badge "Verrouillé" n'est visible qu'aux non-admins sur les sections non disponibles. Les admins voient toutes les sections sans aucun indicateur d'état.

### Comportement cible

Quand `isAdmin = true`, afficher un **badge interactif** à la place du badge statique, reflétant l'état réel de `isAvailable` :

| État | Badge | Icône | Clic |
|------|-------|-------|------|
| `isAvailable = true` | Vert — "Disponible" | `<Unlock />` | Verrouille la section |
| `isAvailable = false` | Ambre — "Verrouillé" | `<Lock />` | Déverrouille la section |

Le badge non-admin ("Verrouillé" statique) reste inchangé pour `isAdmin = false`.

### Implémentation

- Ajouter `useState<boolean>(section.isAvailable)` dans `SectionCard` pour la mise à jour optimiste
- Ajouter un handler qui :
  1. Met à jour le state local immédiatement (optimiste)
  2. Appelle `updateSectionState(currentModule._id as string, section.order, "isAvailable", newValue)` — hook déjà disponible dans `@/hook/admin/updateSectionState`
- Remplacer le bloc `{isLocked && <span>…</span>}` par une condition à deux branches :
  - `isAdmin` → badge `<button>` cliquable avec `pointer-events-auto`
  - sinon → badge statique existant (inchangé)
- `currentModule._id` est déjà disponible via la prop `currentModule: Module`

### Périmètre

Uniquement `isAvailable`. `correctionIsAvailable` et `examenIsLock` restent dans le panneau admin existant (`AdminSection`).

---

## Feature 2 — Migrer AddModuleButton de Dialog vers Sheet

### Fichier concerné

- `src/components/admin/AddModuleButton.tsx`

### Changement

Remplacer les imports et JSX `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogFooter` par leurs équivalents Sheet :

```tsx
// Avant
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Après
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
```

Le contenu du formulaire reste **identique**. Seul le conteneur change pour correspondre au pattern de `EditModuleSheet` et `SectionForm`.

---

## Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/components/Cards/SectionCard.tsx` | Ajout toggle lock admin |
| `src/components/admin/AddModuleButton.tsx` | Dialog → Sheet |
