# Design : Refonte UX navigation de retour (back button au-dessus du titre)

**Date :** 2026-05-20
**Statut :** Approuvé
**Remplace :** `2026-05-20-back-navigation-design.md` (implémentation précédente corrigée)

## Problèmes identifiés

1. **Back button mélangé aux CTAs** : `← Tous les cours` et `Continuer le cours →` avaient le même poids visuel dans le même flex row. Règle UX violée : la navigation arrière ne doit jamais concurrencer visuellement une action primaire.
2. **Breadcrumb isolé** : `BreadcrumbGenerator` flottait seul entre le hero et le contenu, sans relation visuelle avec l'un ou l'autre — élément orphelin sans appartenance.

## Solution retenue

**Back button au-dessus du titre, style lien léger. Breadcrumb supprimé des pages.**

Le lien de retour remplace fonctionnellement le breadcrumb : il indique le contexte parent et permet d'y revenir. Un seul élément, une seule responsabilité.

## Hiérarchie visuelle cible

```
[ ← Tous les cours ]      ← text-sm, opacity atténuée, hover pleine couleur
[ Titre. ]                ← h1, inchangé
[ — ]                     ← barre colorée, inchangée
[ description ]
[ CTA(s) ]                ← bloc children exclusivement pour les actions
```

## Changements

### 1. `HeroSection` (`src/components/page/HeroSection.tsx`)

Le rendu de `backHref/backLabel` quitte le bloc `{(backHref || children) && ...}` et se place **avant le titre**, dans le même bloc de contenu (`<div className="w-full max-w-[640px]">`).

Style du lien :
```tsx
{backHref && (
  <Link
    href={backHref}
    className="inline-flex items-center gap-1 text-sm text-brand-dark/55 dark:text-bridge-300/55 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors mb-3 lg:mb-4"
  >
    <ChevronLeft className="size-3.5" />
    {backLabel}
  </Link>
)}
```

Le bloc `children` redevient pur :
```tsx
{children && (
  <div className={cn("w-full flex flex-wrap items-center gap-3 justify-center lg:justify-start", compact ? "mt-4" : "mt-7")}>
    {children}
  </div>
)}
```

### 2. Pages — suppression de `BreadcrumbGenerator`

`BreadcrumbGenerator` est retiré du JSX des trois pages. Le composant reste dans la codebase mais n'est plus utilisé dans ces pages.

| Page | Changement |
|------|-----------|
| `src/app/[moduleSlug]/page.tsx` | Supprimer `<BreadcrumbGenerator ... />` après HeroSection |
| `src/app/[moduleSlug]/[sectionSlug]/page.tsx` | Idem |
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Idem |

L'import `BreadcrumbGenerator` est retiré de chaque page si c'était le seul usage.

## Ce qui ne change pas

- `backHref` et `backLabel` sur les pages : valeurs inchangées (même logique de retour)
- `children` des pages (CTAs) : inchangés
- `BreadcrumbGenerator.tsx` : conservé (non supprimé du projet)
- Imports `ChevronLeft` et `Link` dans HeroSection : déjà présents

## Rendu final par page

| Page | Lien de retour |
|------|---------------|
| `/javascript` | `← Tous les cours` (au-dessus de "JavaScript.") |
| `/javascript/1-le-dom` | `← JavaScript` (au-dessus de "1. Le DOM.") |
| `/javascript/1-le-dom/cours` | `← 1. Le DOM` (au-dessus du titre + icon) |
