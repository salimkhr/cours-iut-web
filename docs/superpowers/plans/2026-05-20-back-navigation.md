# Back Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un bouton de retour dans HeroSection et déplacer le fil d'ariane après le hero sur toutes les pages module/section/contenu.

**Architecture:** `HeroSection` reçoit deux props optionnelles `backHref/backLabel` qui rendent un bouton de retour sobre sous le titre. `BreadcrumbGenerator` perd ses marges hardcodées et s'affiche après `HeroSection` dans chaque page, évitant l'overlap avec le `-mt-(--navbar-h)` du hero. Un bug est corrigé au passage : la page section ne passait pas `currentSection` à `BreadcrumbGenerator`, rendant le lien module non-cliquable.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Lucide React, shadcn/ui

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/components/BreadcrumbGenerator.tsx` | Supprimer marges hardcodées, ajouter prop `className` |
| `src/components/page/HeroSection.tsx` | Ajouter props `backHref/backLabel`, rendre bouton retour |
| `src/app/[moduleSlug]/page.tsx` | Passer `backHref/backLabel` au hero, déplacer breadcrumb après |
| `src/app/[moduleSlug]/[sectionSlug]/page.tsx` | Idem + fix bug `currentSection` manquant |
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Idem |

---

## Task 1 : Mettre à jour `BreadcrumbGenerator`

**Files:**
- Modify: `src/components/BreadcrumbGenerator.tsx`

- [ ] **Step 1 : Remplacer le contenu du fichier**

```tsx
import * as React from "react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Module from "@/types/Module";
import Section from "@/types/Section";

interface BreadcrumbPageProps {
    currentModule: Module;
    currentSection?: Section;
    currentContent?: string;
    className?: string;
}

export default function BreadcrumbGenerator({currentModule, currentSection, currentContent, className}: BreadcrumbPageProps) {
    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>

                <BreadcrumbItem>
                    {currentSection || currentContent ? (
                        <BreadcrumbLink href={`/${currentModule?.path}`}>
                            {currentModule?.title}
                        </BreadcrumbLink>
                    ) : (
                        <BreadcrumbPage>{currentModule?.title}</BreadcrumbPage>
                    )}
                </BreadcrumbItem>

                {currentSection && (
                    <>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            {currentContent ? (
                                <BreadcrumbLink href={`/${currentModule?.path}/${currentSection?.path}`}>
                                    {currentSection?.title}
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{currentSection?.title}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </>
                )}

                {currentContent && (
                    <>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{currentContent}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
```

> Note : "Home" devient "Accueil" pour la cohérence avec le reste de l'interface en français.

- [ ] **Step 2 : Commiter**

```bash
git add src/components/BreadcrumbGenerator.tsx
git commit -m "refactor(breadcrumb): remove hardcoded margins, add className prop, rename Home→Accueil"
```

---

## Task 2 : Mettre à jour `HeroSection`

**Files:**
- Modify: `src/components/page/HeroSection.tsx`

- [ ] **Step 1 : Ajouter les imports**

En haut du fichier, ajouter `Link` et `ChevronLeft` aux imports existants :

```tsx
import Link from "next/link";
import {ChevronLeft} from "lucide-react";
```

- [ ] **Step 2 : Étendre l'interface des props**

Remplacer :
```tsx
interface HeroSectionProps {
    title: string;
    description?: string;
    imagePath: string;
    imageAlt: string;
    children?: ReactNode;
    tags?: string[];
    icon?: ReactNode;
    path?: string;
    compact?: boolean;
}
```

Par :
```tsx
interface HeroSectionProps {
    title: string;
    description?: string;
    imagePath: string;
    imageAlt: string;
    children?: ReactNode;
    tags?: string[];
    icon?: ReactNode;
    path?: string;
    compact?: boolean;
    backHref?: string;
    backLabel?: string;
}
```

- [ ] **Step 3 : Ajouter `backHref` et `backLabel` à la destructuration**

Remplacer :
```tsx
export default function HeroSection({
                                        title,
                                        description,
                                        imagePath,
                                        imageAlt,
                                        children,
                                        icon,
                                        tags = [],
                                        path = '',
                                        compact = false
                                    }: HeroSectionProps) {
```

Par :
```tsx
export default function HeroSection({
                                        title,
                                        description,
                                        imagePath,
                                        imageAlt,
                                        children,
                                        icon,
                                        tags = [],
                                        path = '',
                                        compact = false,
                                        backHref,
                                        backLabel,
                                    }: HeroSectionProps) {
```

- [ ] **Step 4 : Remplacer le bloc `children` existant**

Localiser et remplacer :
```tsx
{children && <div className={cn(
    "w-full flex justify-center lg:justify-start",
    compact ? "mt-4" : "mt-7"
)}>{children}</div>}
```

Par :
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

- [ ] **Step 5 : Commiter**

```bash
git add src/components/page/HeroSection.tsx
git commit -m "feat(hero): add backHref/backLabel props to render back navigation button"
```

---

## Task 3 : Mettre à jour la page module

**Files:**
- Modify: `src/app/[moduleSlug]/page.tsx`

- [ ] **Step 1 : Déplacer le BreadcrumbGenerator après HeroSection et ajouter les props de retour**

Dans le JSX retourné, remplacer :

```tsx
<BreadcrumbGenerator currentModule={currentModule}/>

<HeroSection
    title={currentModule.title}
    description={currentModule.description}
    imagePath={`images/header/header_${currentModule.path}.svg`}
    imageAlt={currentModule.title}
    tags={allTags}
    icon={<Icon size={56} className="mb-4"/>}
    path={currentModule.path}
    compact
>
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {hasAvailableContent && lastAvailableSectionPath && (
            <Button ...>
                ...
            </Button>
        )}
        <ModuleInfo currentModule={currentModule}/>
    </div>
</HeroSection>
```

Par :

```tsx
<HeroSection
    title={currentModule.title}
    description={currentModule.description}
    imagePath={`images/header/header_${currentModule.path}.svg`}
    imageAlt={currentModule.title}
    tags={allTags}
    icon={<Icon size={56} className="mb-4"/>}
    path={currentModule.path}
    compact
    backHref="/"
    backLabel="Tous les cours"
>
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {hasAvailableContent && lastAvailableSectionPath && (
            <Button
                asChild
                variant="outline"
                size="lg"
                style={{'--module-color': `var(--color-${currentModule.path})`} as React.CSSProperties}
                className="group h-auto rounded-lg border-[3px] border-(--module-color) bg-transparent text-brand-dark dark:text-brand-light hover:bg-(--module-color) hover:text-white hover:border-(--module-color) px-6 py-3 text-sm font-semibold tracking-wide shadow-none transition-all duration-300"
            >
                <Link href={`/${currentModule.path}/${lastAvailableSectionPath}`}>
                    Continuer le cours
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4 text-(--module-color) group-hover:text-white transition-all duration-300 group-hover:translate-x-1"
                    >
                        <path d="M5 12h14"/>
                        <path d="M13 5l7 7-7 7"/>
                    </svg>
                </Link>
            </Button>
        )}
        <ModuleInfo currentModule={currentModule}/>
    </div>
</HeroSection>

<BreadcrumbGenerator
    currentModule={currentModule}
    className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-3"
/>
```

- [ ] **Step 2 : Vérifier visuellement**

Lancer `pnpm dev` et naviguer sur `/javascript`. Vérifier :
- Le bouton `← Tous les cours` apparaît sous le titre, à gauche du bouton "Continuer le cours"
- Le fil d'ariane `Accueil > JavaScript` apparaît sous le hero, avant la barre de progression
- Le hero ne chevauche plus le breadcrumb

- [ ] **Step 3 : Commiter**

```bash
git add src/app/\[moduleSlug\]/page.tsx
git commit -m "feat(module-page): add back button and relocate breadcrumb below hero"
```

---

## Task 4 : Mettre à jour la page section

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/page.tsx`

- [ ] **Step 1 : Déplacer le BreadcrumbGenerator après HeroSection, ajouter props de retour, passer `currentSection` (bug fix)**

Dans le JSX retourné, remplacer :

```tsx
<BreadcrumbGenerator currentModule={currentModule}/>

<HeroSection
    title={`${currentSection?.order}. ${currentSection?.title}`}
    description={currentSection?.description}
    imagePath={`images/header/header_${currentModule.path}.svg`}
    imageAlt={currentModule.title}
    path={currentModule.path}
    tags={currentSection?.tags ?? []}
    compact
/>
```

Par :

```tsx
<HeroSection
    title={`${currentSection?.order}. ${currentSection?.title}`}
    description={currentSection?.description}
    imagePath={`images/header/header_${currentModule.path}.svg`}
    imageAlt={currentModule.title}
    path={currentModule.path}
    tags={currentSection?.tags ?? []}
    compact
    backHref={`/${moduleSlug}`}
    backLabel={currentModule.title}
/>

<BreadcrumbGenerator
    currentModule={currentModule}
    currentSection={currentSection ?? undefined}
    className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-3"
/>
```

- [ ] **Step 2 : Vérifier visuellement**

Naviguer sur `/javascript/1-le-dom`. Vérifier :
- Le bouton `← JavaScript` apparaît sous le titre dans le hero
- Le fil d'ariane `Accueil > JavaScript > 1. Le DOM` apparaît sous le hero, avant les stats
- `Accueil` et `JavaScript` sont des liens cliquables (bug fix vérifié)

- [ ] **Step 3 : Commiter**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/page.tsx"
git commit -m "feat(section-page): add back button, relocate breadcrumb, fix missing currentSection prop"
```

---

## Task 5 : Mettre à jour la page contenu

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

- [ ] **Step 1 : Déplacer le BreadcrumbGenerator après HeroSection et ajouter props de retour**

Dans le JSX du bloc `ComponentToRender && (...)`, remplacer :

```tsx
<BreadcrumbGenerator
    currentModule={currentModule}
    currentSection={currentSection}
    currentContent={isSplit ? 'Côte à côte' : currentContent!}
/>

<HeroSection
    title={`${currentSection.order}. ${currentSection.title}`}
    description={contentDesc}
    imagePath={`images/header/header_${currentModule.path}.svg`}
    imageAlt={currentModule.title}
    path={currentModule.path}
    icon={<ContentIcon/>}
    compact
>
    {currentSection.objectives && currentSection.objectives.length > 0 && (
        ...objectifs...
    )}
</HeroSection>
```

Par :

```tsx
<HeroSection
    title={`${currentSection.order}. ${currentSection.title}`}
    description={contentDesc}
    imagePath={`images/header/header_${currentModule.path}.svg`}
    imageAlt={currentModule.title}
    path={currentModule.path}
    icon={<ContentIcon/>}
    compact
    backHref={`/${moduleSlug}/${sectionSlug}`}
    backLabel={currentSection.title}
>
    {currentSection.objectives && currentSection.objectives.length > 0 && (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
                <Target
                    className="w-4 h-4"
                    style={{color: `var(--color-${currentModule.path})`}}
                />
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                    Objectifs du cours
                </h2>
            </div>
            <ul className="space-y-1.5 sm:columns-2 sm:gap-x-6 text-sm text-brand-dark/85 dark:text-bridge-100/85">
                {currentSection.objectives.map((objective, i) => (
                    <li key={i} className="flex items-start gap-2 break-inside-avoid">
                        <span
                            className="mt-2 h-1 w-1 rounded-full shrink-0"
                            style={{backgroundColor: `var(--color-${currentModule.path})`}}
                        />
                        <span>{objective}</span>
                    </li>
                ))}
            </ul>
        </div>
    )}
</HeroSection>

<BreadcrumbGenerator
    currentModule={currentModule}
    currentSection={currentSection}
    currentContent={isSplit ? 'Côte à côte' : currentContent!}
    className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-3"
/>
```

> Note : pour le mode split (`isSplit === true`), `backHref` et `backLabel` pointent vers la page section, ce qui est correct. `currentSection` est toujours défini après le `notFound()` en amont.

- [ ] **Step 2 : Vérifier visuellement**

Naviguer sur `/javascript/1-le-dom/cours`. Vérifier :
- Le bouton `← 1. Le DOM` apparaît sous le titre dans le hero, avant les objectifs
- Le fil d'ariane `Accueil > JavaScript > 1. Le DOM > Cours` apparaît sous le hero, avant le `ContentSwitcher`
- Naviguer sur `/javascript/1-le-dom/split` et vérifier que le bouton `← 1. Le DOM` apparaît également

- [ ] **Step 3 : Commiter**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx"
git commit -m "feat(content-page): add back button and relocate breadcrumb below hero"
```

---

## Task 6 : Vérification finale

- [ ] **Step 1 : Vérifier le lint**

```bash
pnpm lint
```

Résultat attendu : aucune erreur.

- [ ] **Step 2 : Vérifier le build**

```bash
pnpm build
```

Résultat attendu : build réussi, aucune erreur TypeScript.

- [ ] **Step 3 : Test de navigation complet**

Avec `pnpm dev`, parcourir ce chemin et vérifier chaque étape :

1. `/` → cliquer sur un module → arrive sur `/javascript`
2. Sur `/javascript` : bouton `← Tous les cours` visible → cliquer → retour sur `/`
3. Fil d'ariane `Accueil > JavaScript` → cliquer `Accueil` → retour sur `/`
4. Cliquer sur une section → arrive sur `/javascript/1-le-dom`
5. Sur `/javascript/1-le-dom` : bouton `← JavaScript` visible → cliquer → retour sur `/javascript`
6. Fil d'ariane `Accueil > JavaScript > 1. Le DOM` → `Accueil` et `JavaScript` sont cliquables
7. Cliquer sur "Cours" → arrive sur `/javascript/1-le-dom/cours`
8. Bouton `← 1. Le DOM` visible → cliquer → retour sur `/javascript/1-le-dom`
9. Fil d'ariane `Accueil > JavaScript > 1. Le DOM > Cours` → liens corrects

- [ ] **Step 4 : Push**

```bash
git push
```
