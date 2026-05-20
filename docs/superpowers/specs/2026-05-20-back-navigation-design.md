# Design : Navigation de retour (back button + fil d'ariane)

**Date :** 2026-05-20
**Statut :** Approuvé

## Problème

Le `BreadcrumbGenerator` est rendu **avant** `HeroSection` dans le DOM. Or `HeroSection` a un `-mt-(--navbar-h)` qui le fait remonter par-dessus le composant précédent. La breadcrumb est donc visuellement invisible sur toutes les pages. Par ailleurs, la page section (`/[moduleSlug]/[sectionSlug]`) appelle `BreadcrumbGenerator` sans passer `currentSection`, ce qui rend le nom du module non-cliquable (`BreadcrumbPage` au lieu de `BreadcrumbLink`).

## Solution retenue : Approche A révisée

- **Bouton de retour** : nouvelles props `backHref` / `backLabel` sur `HeroSection`, rendu sous le titre avec les `children` existants.
- **Fil d'ariane** : déplacé **après** `HeroSection` dans le DOM sur chaque page (plus d'overlap). `BreadcrumbGenerator` perd ses marges hardcodées et accepte un `className`.

## Layout cible (toutes les pages concernées)

```
[ Navbar ]
[ HeroSection — titre + description + bouton ← Retour ]
[ BreadcrumbGenerator — sous le hero ]
[ ContentSwitcher / Stats / contenu ]
```

## Changements par composant

### 1. `HeroSection` (`src/components/page/HeroSection.tsx`)

Nouvelles props :

```tsx
backHref?: string   // URL de retour, ex: "/javascript"
backLabel?: string  // Label du bouton, ex: "JavaScript"
```

Rendu : si `backHref` est fourni, un bouton `← {backLabel}` est injecté dans le même conteneur flex que `children` (sous le titre). Le bouton est stylé de façon sobre : `ChevronLeft` + texte, bordure légère (`border-bridge-500/30`), fond transparent, cohérent avec les boutons secondaires existants.

```tsx
{(backHref || children) && (
  <div className="w-full flex flex-wrap items-center gap-3 justify-center lg:justify-start mt-4 (ou mt-7 selon compact)">
    {backHref && (
      <Link href={backHref} className="...bouton secondaire sobre...">
        <ChevronLeft className="size-4" />
        {backLabel}
      </Link>
    )}
    {children}
  </div>
)}
```

### 2. `BreadcrumbGenerator` (`src/components/BreadcrumbGenerator.tsx`)

- Suppression de `className={'mx-5 mt-3'}` hardcodé sur `<Breadcrumb>`.
- Ajout d'une prop `className?: string` passée à `<Breadcrumb>`.

### 3. Pages — déplacement de `BreadcrumbGenerator` après `HeroSection`

Chaque page retire `<BreadcrumbGenerator>` d'avant `HeroSection` et le place immédiatement après, avec `className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-3"`.

#### Page module (`src/app/[moduleSlug]/page.tsx`)

```tsx
<HeroSection backHref="/" backLabel="Tous les cours" ...>
  {/* children existants inchangés */}
</HeroSection>
<BreadcrumbGenerator currentModule={currentModule} className="..." />
```

#### Page section (`src/app/[moduleSlug]/[sectionSlug]/page.tsx`)

```tsx
<HeroSection backHref={`/${moduleSlug}`} backLabel={currentModule.title} ...>
  {/* pas de children — le bouton de retour est le seul élément */}
</HeroSection>
<BreadcrumbGenerator
  currentModule={currentModule}
  currentSection={currentSection}   {/* ← BUG FIX : était absent */}
  className="..."
/>
```

#### Page contenu (`src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`)

```tsx
<HeroSection backHref={`/${moduleSlug}/${sectionSlug}`} backLabel={currentSection.title} ...>
  {/* children existants (objectifs) inchangés */}
</HeroSection>
<BreadcrumbGenerator
  currentModule={currentModule}
  currentSection={currentSection}
  currentContent={isSplit ? 'Côte à côte' : currentContent!}
  className="..."
/>
```

## Fil d'ariane par page

| Page | Rendu |
|------|-------|
| `/javascript` | `Accueil > JavaScript` (JavaScript = page courante) |
| `/javascript/1-le-dom` | `Accueil > JavaScript > 1. Le DOM` |
| `/javascript/1-le-dom/cours` | `Accueil > JavaScript > 1. Le DOM > Cours` |

## Bouton de retour par page

| Page | `backLabel` | `backHref` |
|------|-------------|------------|
| `/javascript` | `Tous les cours` | `/` |
| `/javascript/1-le-dom` | `JavaScript` (= `currentModule.title`) | `/javascript` |
| `/javascript/1-le-dom/cours` | `1. Le DOM` (= `currentSection.title`) | `/javascript/1-le-dom` |

## Ce qui ne change pas

- `BreadcrumbList`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` : inchangés.
- La logique de rendu de `BreadcrumbGenerator` (liens vs texte selon les props) : inchangée.
- Les `children` existants de `HeroSection` sur les pages module et contenu : inchangés.
- La page slide (`src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx`) : hors scope (pas de HeroSection).

## Hors scope

- Page d'accueil (`/`) : pas de back navigation nécessaire.
- Pages admin, login, register : hors scope.
- Mode split (`/[moduleSlug]/[sectionSlug]/split`) : même traitement que la page contenu.
