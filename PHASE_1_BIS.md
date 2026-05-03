# Phase 1 bis — Rework UI/UX (suite)

Plan reconstitué à partir de l'état du repo le 2026-05-03.
Stack : Next 16 (App Router), React 19, Tailwind v4, shadcn/ui, Framer Motion, next-themes.

## Contrainte non-négociable

La gestion du dark-mode posait des problèmes de SSR (les hooks `useIsDark` /
`useMounted` retournaient `null` côté serveur via `if (!mounted) return null`,
ce qui cassait le rendu serveur et le SEO).

**Règle :** ne JAMAIS réintroduire `useIsDark` / `useMounted` dans les composants
qui peuvent rester serveur. Toujours utiliser les classes Tailwind `dark:`
(next-themes positionne la classe `dark` sur `<html>`, le rendu serveur reste
cohérent).

Exceptions documentées : composants qui appellent une lib JS impérative qui
prend un objet thème en argument (ex. Mermaid, react-syntax-highlighter) — voir
lots 4 et 5.

## État working copy au moment du plan

- `src/app/layout.tsx` + `src/app/globals.css` : ajout de la police IBM Plex Sans
  comme `--font-sans`, JetBrains Mono reste en `--font-mono`.
- `src/components/Cards/BaseCard.tsx` : déjà migré (suppression de
  `useIsDark`/`useMounted`, hover `-translate-y-1 hover:shadow-2xl`, focus ring
  `ring-2 ring-offset-2`, support `motion-reduce`, `aria-hidden` sur les LEDs).
- `src/components/magicui/` (untracked) : `border-beam.tsx` + `particles.tsx`
  ajoutés mais non intégrés.

## Incohérences observées (à corriger en passant)

- **Body encore en `font-mono`** — `src/app/layout.tsx:38` :
  `<body className="min-h-screen font-mono">` alors que `globals.css:5-6`
  définit `--font-sans` (IBM Plex Sans). Tant que ce `font-mono` n'est pas
  retiré, IBM Plex Sans n'est appliqué nulle part.
- **`useIsDark` / `useMounted` toujours présents dans 4 Cards sur 9** alors que
  BaseCard est déjà migré : `CodeCard.tsx`, `CodeWithPreviewCard.tsx`,
  `DiagramCard.tsx`, `SectionCard.tsx`.
- **`ImageCard.tsx:21`** — hack `<span> </span>` avec commentaire
  `ne cherche pas TKT` pour le centrage du header. À nettoyer.
- **Conflit Tailwind sur `ActionButton`** — `BaseCard.tsx:113` impose `w-1/3`
  en dur, mais `SectionCard.tsx:54` et `ContentCard.tsx:30` passent un `w-1/...`
  dynamique en `className`. Comportement non garanti.

## Plan en 7 lots priorisés

### Lot 1 — Finir la migration typographique (P0, bloque tout le reste)

- `src/app/layout.tsx:38` → remplacer `font-mono` par `font-sans` sur `<body>`.
- Garder `font-mono` réservé aux `<Code>`, `<CodeCard>`, `<Badge>` techniques
  (déjà appliqué ponctuellement dans ces composants).
- Vérifier visuellement que les classes `font-mono` ponctuelles ne se voient
  pas perdues (`BaseCard.tsx:LEDIndicator`, `CodeCard:headerCard`).

### Lot 2 — Migrer `SectionCard` au pattern Tailwind `dark:` (P0)

- Fichier : `src/components/Cards/SectionCard.tsx`.
- Cas trivial : tous les usages sont du toggle de classes texte
  (`text-gray-200`/`text-white`, `text-gray-300`/`text-gray-700`).
- Supprimer `'use client'` (devient un Server Component).
- Retirer `useMounted` + `useIsDark` + le `if (!mounted) return null`.

### Lot 3 — Migrer `HeroSection` au pattern Tailwind `dark:` (partiellement) (P0)

- Fichier : `src/components/page/HeroSection.tsx`.
- Le `isDark` ligne 62 (description en `text-gray-400`/`text-gray-600`)
  → `text-gray-600 dark:text-gray-400`.
- Le `useMounted` reste **légitime** lignes 32-36 pour le `getComputedStyle`
  de la couleur module → garder cet usage **mais** retirer le `return null`
  global ligne 38 (le `<h1>` doit être rendu côté serveur pour SEO et LCP).
  Renvoyer une couleur fallback (`""` → SVG sans fill) tant que non monté.

### Lot 4 — Migrer `CodeCard` + `CodeWithPreviewCard` (P1, plus complexe)

- Fichiers : `src/components/Cards/CodeCard.tsx`,
  `src/components/Cards/CodeWithPreviewCard.tsx`.
- `react-syntax-highlighter` prend un objet JS (`oneDark`/`oneLight`), pas une
  classe CSS. **Solution sans hook** : rendre les deux highlighters et basculer
  en CSS :
  - `<div className="block dark:hidden">{...oneLight...}</div>`
  - `<div className="hidden dark:block">{...oneDark...}</div>`
  - Coût : double-render du même bloc de code (acceptable, le code est
    rarement gigantesque ; sinon on garde `useMounted` ici comme exception
    documentée).
- Reste interactif → `'use client'` reste obligatoire (à cause de `useState`
  pour copy/expand).

### Lot 5 — `DiagramCard` : exception Mermaid (P1, garder le hook)

- Fichier : `src/components/Cards/DiagramCard.tsx`.
- Mermaid s'initialise via un appel JS impératif
  (`mermaid.initialize({ theme })`) → on **doit** lire le thème en JS. Le
  `useMounted` ici renvoie déjà un *skeleton* propre (pas un `return null`),
  c'est correct.
- À faire : remplacer le squelette `bg-gray-200 dark:bg-gray-700` par un
  placeholder plus représentatif + ajouter un commentaire
  `// dark-mode JS impératif requis par Mermaid` pour expliquer l'écart.

### Lot 6 — Intégrer Magic UI (P2, valeur visuelle, pas bloquant)

- `BorderBeam` → sur `ModuleCard` (home). Visible **au hover seulement**
  (`opacity-0 group-hover:opacity-100`), couleurs `colorFrom`/`colorTo`
  dérivées de la couleur module (`--color-html-css`, `--color-php`, etc.).
  Effet "vivant" sur les 5 cards de la home, sans bruit visuel sur les autres
  pages.
- `Particles` → fond de `HeroSection` uniquement (la home + en-têtes de
  modules), `quantity={50-80}`, `color` = couleur du module courant. Respecte
  déjà `prefers-reduced-motion`.
- ⚠ `Particles` enregistre un listener `mousemove` global → ne le monter qu'à
  un seul endroit visible. Ne pas l'utiliser à l'intérieur de cards.
- `ModuleCard` n'est actuellement pas un Client Component ; ajouter
  `BorderBeam` impose `'use client'` → vérifier que ça n'impacte pas le SSR
  de la home.

### Lot 7 — Nettoyer les hacks UI résiduels (P2)

- `ImageCard.tsx:21` : retirer le `<span> </span>` et le commentaire
  « ne cherche pas TKT », corriger le centrage du header proprement (flex sur
  le header de BaseCard).
- `BaseCard.tsx:113` : retirer `w-1/3` en dur sur `ActionButton` (le
  `className` dynamique des callers fournit déjà la largeur).

## Hors scope phase 1 bis (à traiter en phase 2)

- `useIsDark`/`useMounted` encore utilisés dans : `Footer.tsx`,
  `PageFooter.tsx`, `ExamenGate.tsx`, `ThemeToggle.tsx`,
  `Slides/ui/Slide*.tsx`, `Slides/progress/ProgressGroup.tsx`, et tous les
  `ui/*` (`Text`, `Heading`, `List`, `Code`, `select`, `field`, `dialog`).
  Volume conséquent → phase séparée.
- `globals.css` contient ~250 lignes de classes `.text-/.bg-/.border-{module}`
  dupliquées pour 5 modules — candidat à dédup via `@theme` Tailwind v4
  (couleurs nommées) en phase 3.

## Ordre d'exécution suggéré

1. Lots 1 + 2 + 3 d'un bloc (gain visuel immédiat, 3 fichiers, faible risque) → commit.
2. Lots 4 + 5 (cas plus complexes liés aux libs JS) → commit.
3. Lots 6 + 7 (Magic UI + cleanup) → commit.

## Pour reprendre

Lire ce fichier puis :

```
Reprends la phase 1 bis selon PHASE_1_BIS.md, lot <N>.
```
