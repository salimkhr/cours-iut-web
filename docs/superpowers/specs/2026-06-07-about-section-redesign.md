# AboutSection — Remplacement des citations

**Date :** 2026-06-07
**Périmètre :** `src/components/page/AboutSection.tsx` + `src/app/page.tsx`

---

## Contexte

La section `AboutSection` affiche actuellement une citation tirée aléatoirement selon le jour du mois (tableau `QUOTES` de 31 entrées). Cette approche est rejetée car trop générique et sans lien avec le contenu pédagogique du site.

## Objectif

Remplacer les citations par deux blocs utiles à l'étudiant, superposés sur l'image d'escalier existante.

---

## Design retenu

**Approche A — Variante 1 :** deux blocs empilés en overlay sur l'image, séparés par une ligne dorée horizontale. Même structure visuelle qu'aujourd'hui (gradient solide gauche → transparent droite, image pleine largeur).

### Bloc 1 — Dernières mises à jour

- Affiché à **tous** (connectés et non-connectés)
- Contenu : 3 modules triés par `updatedAt` décroissant
- Chaque ligne : nom du module + date relative (ex. "il y a 2 j")
- Label : `DERNIÈRES MISES À JOUR` (même style monospace doré que l'actuel `PHILOSOPHIE`)
- Même règle dorée (`2px`, `2.5rem`) en haut de section

**Contrainte à résoudre à l'implémentation :** le type `Module` n'expose pas de champ `updatedAt`. Deux options :
1. Ajouter `updatedAt?: Date` au type `Module` et alimenter ce champ en base (préféré)
2. Fallback : afficher les modules dans leur ordre de retour MongoDB sans date relative

### Séparateur

Ligne `width: 100%`, `height: 1px`, `background: rgba(200,169,110,0.2)` — visible uniquement si les deux blocs sont affichés (connecté).

### Bloc 2 — Ma progression

- Affiché **uniquement si connecté** (`isAuthed === true`)
- Masqué entièrement si non connecté (pas de CTA, pas de placeholder)
- Contenu : barre de progression dorée (`#c8a96e`) + texte "X / Y modules déverrouillés" + sous-texte "Z modules en attente"
- Label : `MA PROGRESSION` (même style)

**Contrainte à résoudre à l'implémentation :** le type `Module` n'a pas de champ `locked`. La définition de "déverrouillé" est à confirmer en lisant le schéma MongoDB réel. Hypothèse de travail : modules où `isExtra === false` = programme principal, modules `isExtra === true` = extra (potentiellement liés à un déblocage). À affiner selon la logique métier réelle.

---

## Modifications fichiers

| Fichier | Changement |
|---|---|
| `src/components/page/AboutSection.tsx` | Suppression de `QUOTES` et `<blockquote>`. Ajout props `modules: (Module & { _id: string })[]` et `isAuthed: boolean`. Deux blocs empilés en remplacement. |
| `src/app/page.tsx` | `<AboutSection/>` → `<AboutSection modules={allModules} isAuthed={isAuthed}/>` |
| `src/types/Module.ts` | Ajout optionnel `updatedAt?: Date` selon option retenue |

---

## Ce qui ne change pas

- Image d'escalier (`escalier-dark.png` / `escalier-light.png`) — conservée
- Gradient overlay (solid gauche → transparent droite) — conservé
- Composant reste `'use client'` (nécessaire pour `useIsDark`)
- Aucune nouvelle dépendance
- Aucun nouvel endpoint API — les données viennent de `getModules()` déjà appelé dans `page.tsx`

---

## Hors périmètre

- Système de suivi de progression complet (pages vues, cours complétés) — non implémenté
- Mode light (les couleurs brand s'adaptent via les variables CSS existantes)
