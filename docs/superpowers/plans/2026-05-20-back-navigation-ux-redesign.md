# Back Navigation UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déplacer le bouton de retour au-dessus du titre dans HeroSection (style lien léger) et supprimer BreadcrumbGenerator de toutes les pages.

**Architecture:** Un seul composant modifié (`HeroSection`) — le rendu de `backHref/backLabel` remonte avant le bloc titre, avec un style lien minimaliste. Le bloc `children` redevient exclusivement pour les CTAs. Les trois pages retirent leur `<BreadcrumbGenerator>` et son import.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Lucide React (`ChevronLeft`, déjà importé)

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/components/page/HeroSection.tsx` | Déplacer back button au-dessus du titre, simplifier children block |
| `src/app/[moduleSlug]/page.tsx` | Supprimer BreadcrumbGenerator + import |
| `src/app/[moduleSlug]/[sectionSlug]/page.tsx` | Supprimer BreadcrumbGenerator + import |
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Supprimer BreadcrumbGenerator + import |

---

## Task 1 : Refactorer HeroSection

**Files:**
- Modify: `src/components/page/HeroSection.tsx`

- [ ] **Step 1 : Remplacer le bloc `{(backHref || children) && ...}` par deux blocs séparés**

Localiser ce bloc (lignes 142-158) :

```tsx
{(backHref || children) && (
    <div className={cn(
        "w-full flex flex-wrap items-center gap-3 justify-center lg:justify-start",
        compact ? "mt-4" : "mt-7"
    )}>
        {backHref && (
            <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold border border-bridge-500/30 bg-white/30 dark:bg-black/30 hover:bg-white dark:hover:bg-bridge-900 backdrop-blur-md transition-colors"
            >
                <ChevronLeft className="size-4"/>
                {backLabel}
            </Link>
        )}
        {children}
    </div>
)}
```

Le remplacer par le bloc `children` simplifié (sans le back button) :

```tsx
{children && (
    <div className={cn(
        "w-full flex flex-wrap items-center gap-3 justify-center lg:justify-start",
        compact ? "mt-4" : "mt-7"
    )}>
        {children}
    </div>
)}
```

- [ ] **Step 2 : Ajouter le lien de retour au-dessus du titre**

Localiser la ligne `<div className="w-full max-w-[640px]">` (ligne 99). Juste après cette ouverture et avant le bloc `{compact ? (...)  : (...)}` (ligne 100), insérer :

```tsx
{backHref && (
    <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-brand-dark/55 dark:text-bridge-300/55 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors mb-3 lg:mb-4"
    >
        <ChevronLeft className="size-3.5"/>
        {backLabel}
    </Link>
)}
```

Le résultat dans `<div className="w-full max-w-[640px]">` doit être dans cet ordre :
1. `{backHref && <Link ...>}` ← nouveau lien de retour
2. `{compact ? (...) : (...)}` ← bloc titre (inchangé)
3. `<span ... />` ← barre colorée (inchangée)
4. `{description && <p>}` ← description (inchangée)
5. `{children && <div>...</div>}` ← CTAs seuls (simplifié)

- [ ] **Step 3 : Vérifier le fichier final**

Le fichier `src/components/page/HeroSection.tsx` doit ressembler à ceci dans la zone modifiée :

```tsx
<div className="w-full max-w-[640px]">
    {backHref && (
        <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-brand-dark/55 dark:text-bridge-300/55 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors mb-3 lg:mb-4"
        >
            <ChevronLeft className="size-3.5"/>
            {backLabel}
        </Link>
    )}
    {compact ? (
        <div className="flex items-center gap-3 lg:gap-4 justify-center lg:justify-start leading-none text-brand-dark dark:text-brand-light text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">
            {icon && (
                <div className="shrink-0 inline-flex items-center [&_svg]:w-[0.85em] [&_svg]:h-[0.85em] [&_svg]:block">
                    {icon}
                </div>
            )}
            <h1 className="font-extrabold tracking-tight">
                {title}
                <span style={{color: `var(--color-${path || 'brand-primary'})`}}>.</span>
            </h1>
        </div>
    ) : (
        <>
            {icon && <div className="mb-4 flex justify-center lg:justify-start">{icon}</div>}
            <h1 className="font-extrabold tracking-tight leading-[0.95] text-center lg:text-left text-brand-dark dark:text-brand-light text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
                {title}
                <span style={{color: `var(--color-${path || 'brand-primary'})`}}>.</span>
            </h1>
        </>
    )}

    <span
        aria-hidden="true"
        className={cn(
            "block h-1 rounded-full mx-auto lg:mx-0",
            compact ? "w-12 mt-3" : "w-16 mt-6"
        )}
        style={{backgroundColor: `var(--color-${path || 'brand-primary'})`}}
    />

    {description && (
        <p className={cn(
            "leading-relaxed text-brand-gray-700 dark:text-brand-gray-300 text-center lg:text-left max-w-prose mx-auto lg:mx-0",
            compact
                ? "mt-3 text-sm sm:text-base lg:text-base"
                : "mt-5 text-base sm:text-lg lg:text-lg xl:text-xl"
        )}>
            {description}
        </p>
    )}

    {children && (
        <div className={cn(
            "w-full flex flex-wrap items-center gap-3 justify-center lg:justify-start",
            compact ? "mt-4" : "mt-7"
        )}>
            {children}
        </div>
    )}
</div>
```

- [ ] **Step 4 : Commiter**

```bash
git add src/components/page/HeroSection.tsx
git commit -m "refactor(hero): move back button above title as subtle link, separate from CTAs"
```

---

## Task 2 : Nettoyer la page module

**Files:**
- Modify: `src/app/[moduleSlug]/page.tsx`

- [ ] **Step 1 : Supprimer l'import BreadcrumbGenerator**

Localiser et supprimer cette ligne en haut du fichier :
```tsx
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
```

- [ ] **Step 2 : Supprimer le composant BreadcrumbGenerator du JSX**

Localiser et supprimer ces 4 lignes (juste après `</HeroSection>`) :
```tsx
<BreadcrumbGenerator
    currentModule={currentModule}
    className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-3"
/>
```

- [ ] **Step 3 : Commiter**

```bash
git add "src/app/[moduleSlug]/page.tsx"
git commit -m "feat(module-page): remove BreadcrumbGenerator, back button in hero replaces it"
```

---

## Task 3 : Nettoyer la page section

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/page.tsx`

- [ ] **Step 1 : Supprimer l'import BreadcrumbGenerator**

Localiser et supprimer :
```tsx
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
```

- [ ] **Step 2 : Supprimer le composant BreadcrumbGenerator du JSX**

Localiser et supprimer ces 5 lignes (juste après `/>` de HeroSection) :
```tsx
<BreadcrumbGenerator
    currentModule={currentModule}
    currentSection={currentSection ?? undefined}
    className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-3"
/>
```

- [ ] **Step 3 : Commiter**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/page.tsx"
git commit -m "feat(section-page): remove BreadcrumbGenerator, back button in hero replaces it"
```

---

## Task 4 : Nettoyer la page contenu

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

- [ ] **Step 1 : Supprimer l'import BreadcrumbGenerator**

Localiser et supprimer :
```tsx
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
```

- [ ] **Step 2 : Supprimer le composant BreadcrumbGenerator du JSX**

Localiser et supprimer ces 6 lignes (juste après `</HeroSection>`) :
```tsx
<BreadcrumbGenerator
    currentModule={currentModule}
    currentSection={currentSection}
    currentContent={isSplit ? 'Côte à côte' : currentContent!}
    className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-3"
/>
```

- [ ] **Step 3 : Commiter**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx"
git commit -m "feat(content-page): remove BreadcrumbGenerator, back button in hero replaces it"
```

---

## Task 5 : Vérification finale

- [ ] **Step 1 : Lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Step 2 : Build**

```bash
bun run build
```

Résultat attendu : build réussi, zéro erreur TypeScript.

- [ ] **Step 3 : Vérification visuelle**

Avec `bun run dev`, vérifier sur chaque page :

- `/javascript` : `← Tous les cours` apparaît **au-dessus** de "JavaScript." ; `Continuer le cours →` est **seul** dans le bloc CTAs, sans concurrence
- `/javascript/1-le-dom` : `← JavaScript` apparaît **au-dessus** du titre de section ; aucun breadcrumb orphelin sous le hero
- `/javascript/1-le-dom/cours` : `← 1. Le DOM` apparaît **au-dessus** du titre + icône ; objectifs dans le bloc children seuls

- [ ] **Step 4 : Push**

```bash
git push
```
