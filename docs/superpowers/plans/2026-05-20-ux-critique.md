# Critique UX — Cours IUT Web
> Générée le 2026-05-20

---

## Critique (bloquant / accessibilité)

- [ ] **`role="img"` sur `<section>` avec contenu interactif** — `src/components/page/HeroSection.tsx:59`
  Supprimer le `role="img"` : la section contient des liens et boutons qui deviennent invisibles pour les lecteurs d'écran.

- [ ] **`opacity-0` sans fallback `prefers-reduced-motion`** — `src/app/[moduleSlug]/page.tsx` et autres
  Ajouter `@media (prefers-reduced-motion: reduce) { .animate-fade-in-up { opacity: 1; } }` pour éviter que le contenu reste invisible si les animations ne jouent pas.

---

## Problèmes importants

- [ ] **Toggle de thème enfoui dans le dropdown** — `src/components/NavBarClient.tsx:209`
  Action fréquente cachée derrière 2 clics. Exposer `ThemeToggle` directement dans la navbar (le composant `src/components/ThemeToggle.tsx` existe déjà).

- [ ] **`ContentSidebarNav` positionnée en coin haut-droit non conventionnel** — `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx:134`
  La nav Cours / TP / Côte à côte ressemble à une étiquette de coin (border-left + border-bottom). Revoir en pleine largeur sous le hero ou dans une sidebar pour plus de découvrabilité.

- [x] **Deux zones sticky superposées** — `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx:129–143`
  ~~`ReadingProgress` (z-30) et `ContentSidebarNav` (z-25) collées au même `top-(--navbar-h)` créent une interface fragmentée.~~ **Résolu** : `ReadingProgress` déplacé dans le `<header>` via `NavReadingProgress` (absolute bottom-0) + store Zustand `readingProgressStore`. Plus aucun z-index conflict ni valeur hardcodée `--navbar-h` à corriger.

- [ ] **Double CTA redondant dans `ModuleCard`** — `src/components/Cards/ModuleCard.tsx:124–145`
  "Voir les chapitres" fait la même chose que cliquer sur la carte (overlay link z-10 déjà en place). Supprimer le CTA secondaire ou le différencier clairement.

---

## Problèmes moyens

- [ ] **Labels boutons masqués sur mobile dans `SectionCard`** — `src/components/Cards/SectionCard.tsx:183`
  `hidden md:inline` cache les labels (Cours, TP, Examen, Correction) sur mobile. Les icônes seules ne sont pas assez claires dans ce contexte — afficher au moins un label court.

- [ ] **Message TOC confus quand l'onglet n'est pas visité** — `src/components/TableOfContents.tsx:171`
  "Visitez le Cours pour charger sa table des matières" oblige à naviguer pour pré-charger. Pré-populer côté serveur ou masquer l'onglet tant qu'il n'a pas été visité.

- [ ] **Wording "Progression" trompeur dans `ModuleCard`** — `src/components/Cards/ModuleCard.tsx:109`
  Le `pct` reflète la progression du **prof** (sections disponibles / total), pas celle de l'étudiant. Renommer en "Disponible" ou implémenter une vraie progression utilisateur.

- [ ] **Hero trop haut sur la page d'accueil** — `src/components/page/HeroSection.tsx:62`
  `min-h-[60vh] lg:min-h-[80vh]` repousse la liste des cours trop bas. Réduire à `50vh` max sur une page consultée quotidiennement.

---

## Points positifs (à conserver)

- `useReducedMotion()` utilisé dans les animations Framer Motion
- `aria-label` sur le bouton menu utilisateur
- `aria-current="page"` sur les liens actifs dans `ContentSidebarNav`
- `passive: true` sur les listeners scroll dans `ReadingProgress`
- Split pane Cours + TP côte à côte
- TOC avec IntersectionObserver + lien profond via hash

---

## Récapitulatif

| Priorité | Nbre | Effort estimé |
|----------|------|---------------|
| Critique  | 2    | ~20 min       |
| Important | 4    | ~2h30         |
| Moyen     | 4    | ~1h           |
