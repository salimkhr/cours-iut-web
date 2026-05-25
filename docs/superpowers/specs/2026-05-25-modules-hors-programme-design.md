# Modules hors programme — Design

**Date :** 2026-05-25
**Statut :** approuvé

---

## Contexte

Certains modules (IA, déploiement, sécurité…) sont utiles mais hors du programme officiel BUT Informatique. Ils ne doivent pas parasiter la navigation ni la vitrine principale, mais rester accessibles aux étudiants connectés via une section dédiée sur la home.

---

## 1. Modèle de données

### `src/types/Module.ts`
Ajout d'un champ optionnel :
```ts
isExtra?: boolean;
```
Absent ou `false` → module du programme. `true` → hors programme.
Les documents existants en base sans ce champ sont traités comme `false` (rétrocompatibilité sans migration).

### `src/lib/schemas/module.schema.ts`
Ajout dans `moduleFormSchema` :
```ts
isExtra: z.boolean().default(false),
```

### `src/lib/getModules.ts`
Aucune modification — retourne tous les modules sans filtrage. Le filtrage est à la charge des consommateurs.

---

## 2. Home page (`src/app/page.tsx`)

### Visibilité selon l'état d'authentification
| État | Modules programme | Modules hors programme |
|------|-------------------|------------------------|
| Non connecté | Masqués (grille vide, CTA connexion) | Masqués |
| Connecté | Grille principale | Section "Voir plus" dépliable |

Avant ce changement, les modules programme étaient visibles sans connexion (sauf brainfuck). Ce comportement est corrigé.

### Filtrage
```ts
const programModules = allModules.filter(m => !m.isExtra);
const extraModules   = allModules.filter(m => m.isExtra);
```

### Section "hors programme"
- Affichée uniquement si `extraModules.length > 0` **et** `isAuthed`.
- Composant client (`"use client"`) avec `useState(false)` pour l'état ouvert/fermé.
- Bouton toggle : `Voir plus ↓` / `Voir moins ↑` (libellé et icône inversés selon l'état).
- Contenu : même `<ModuleCard>` et même mise en page grid que la grille principale.
- Positionnement : après la grille principale, avant `<AboutSection>`.

---

## 3. Barre de navigation (`src/components/NavBar.tsx`)

Filtre appliqué avant passage au client :
```ts
const modules = (await getModules()).filter(m => !m.isExtra);
```
Les modules hors programme n'apparaissent jamais dans la nav, quel que soit le rôle.

---

## 4. Admin

### Formulaire de création — `AddModuleButton`
Ajout d'un champ `isExtra` dans le formulaire `react-hook-form` :
- Composant : `<Switch>` shadcn/ui (`src/components/ui/switch.tsx`)
- Label : "Hors programme"
- Valeur par défaut : `false`
- Intégré via `<Controller>` (pattern déjà utilisé dans le composant pour les checkboxes)

### Formulaire d'édition — `EditModuleSheet`
Même champ `<Switch>` shadcn/ui :
- Valeur initialisée depuis `module.isExtra ?? false` dans `getDefaultValues()`
- Positionné dans la même zone que les autres champs booléens du formulaire

---

## 5. Ce qui ne change pas

- `getModules()` — aucun changement, pas de surcharge
- `ModuleCard` — aucun changement
- Routes API admin modules (`POST /api/admin/modules`, `PUT /api/admin/modules/[id]`) — acceptent déjà tout ce que `moduleFormSchema` valide ; le nouveau champ est donc automatiquement géré
- Accès à la page `/:path` d'un module hors programme — non restreint, un étudiant qui connaît l'URL y accède normalement

---

## 6. Tests à mettre à jour

- `tests/api/admin/modules.test.ts` : ajouter `isExtra` dans `VALID_MODULE` (valeur `false`) pour que le schéma Zod soit satisfait avec le nouveau champ `.default(false)`.
- Pas de nouveaux tests de route nécessaires (la logique est dans les composants UI).
