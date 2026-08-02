# Cohérence visuelle des slides — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aligner les slides sur la direction artistique de Cours/TP — même palette, langage visuel propre à la projection — et supprimer les vestiges de l'ancienne DA.

**Architecture :** Les styles vivent dans un bloc `.slide-*` de `src/app/globals.css`, sur le modèle des ~180 lignes déjà existantes pour `.course-content`. Les composants React ne portent que la structure et les états. Les variables `--module-color` / `--module-color-dark` sont déjà posées par la page slide, les composants les consomment directement.

**Tech Stack :** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, CSS custom properties.

## Global Constraints

Ces contraintes s'appliquent à **chaque** tâche, sans être répétées à chaque fois :

- **Aucun `#fff` / `#000` littéral** — DESIGN.md §6 : « Toujours teinter vers la palette bridge ou brand-dark/light ».
- **Aucune ombre froide en light mode** — « La Règle de l'Ombre Chaude » : `rgba(147,97,58, X)` en light, `rgba(0,0,0, X)` en dark uniquement.
- **Indentation 4 espaces**, TypeScript strict, pas d'`any` ni de `@ts-ignore` sans `// reason: ...`.
- **Hooks pre-commit jamais contournés** (`--no-verify` interdit).
- **Ne pas modifier** : le moteur de navigation/live (`useSlidesNavigation`, `useLiveSession`, `useFollowerSync`), `SlideBlocksRenderer` (sauf Task 2), les `Slide.tsx` de `src/cours/`.
- **État de référence des tests : 309 pass / 3 fail.** Les 3 échecs sont préexistants sur `GET /api/admin/export`. Un 4ᵉ échec = régression.
- **Ne pas lancer `bun run build`** pendant les tâches (long) — il est lancé en Task 8.

## Contexte technique à connaître

Trois faits vérifiés qui conditionnent l'implémentation :

1. **`--module-color` et `--module-color-dark` sont déjà disponibles.** `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx` les pose en inline style avec la classe `header-module`, sur les deux branches (DB et fichier). Aucun prop drilling de couleur n'est nécessaire.

2. **`.header-module h1, h2, h3` colore déjà les titres en couleur module** (`globals.css:286`). C'est pourquoi le titre de slide s'affiche en or sur le module JavaScript. **Le bandeau ayant un fond couleur module, il doit surcharger cette règle** — sinon texte module sur fond module.

3. **Les couleurs `module-*-dark` sont des pastels clairs** calibrés pour du texte `brand-dark` (≥7.8:1), pas du crème. Tout élément à fond couleur module doit inverser sa couleur de texte en dark. C'est le bug corrigé sur `.course-section-badge` au commit `b51f4b3`.

## Structure des fichiers

**Modifiés**
- `src/app/globals.css` — nouveau bloc `.slide-*` en fin de fichier
- `src/components/Slides/ui/config/slideConfig.ts` — échelle projection alignée sur les attributs DESIGN.md
- `src/components/Slides/context/SlidesContext.tsx` — expose `moduleTitle` / `sectionTitle`
- `src/components/Slides/SlidesScreen.tsx` — alimente le contexte, conteneur + fullscreen
- `src/components/Slides/SlideScreen.tsx` — bandeau titre
- `src/components/Slides/ui/SlideTitle.tsx` — colonne pont + numéro
- `src/components/Slides/ui/SlideHeading.tsx` — couleurs palette
- `src/components/Slides/SlidesProgress.tsx`, `progress/ProgressGroup.tsx`, `progress/ProgressPoint.tsx` — points couleur module
- `src/components/Slides/SlidesActions.tsx`, `SlidesMobileView.tsx` — statuts réchauffés

**Supprimé**
- `src/components/FooterSvg.tsx` (236 Ko) — orphelin après Task 4

---

### Task 1 : Fondations CSS et échelle typographique

**Files:**
- Modify: `src/app/globals.css` (ajout en fin de fichier)
- Modify: `src/components/Slides/ui/config/slideConfig.ts`

**Interfaces:**
- Produces: les classes CSS `.slide-banner`, `.slide-banner-eyebrow`, `.slide-body`, `.slide-surface` ; l'objet `slideTextSizes` conserve sa forme actuelle (`heading[1|2|3]`, `text.default|large|xl`, `title.module|section|description`) — aucun consommateur ne casse.

- [ ] **Step 1 : Ajouter le bloc `.slide-*` à la fin de `globals.css`**

Colle ce bloc à la fin du fichier :

```css
/* ===== Slides — bandeau, surface, rythme =====
   Les slides sont projetées et lues à distance : elles empruntent la palette
   de .course-content mais gardent leur propre échelle et leur propre rythme. */

.slide-surface {
    background: var(--color-bridge-50);
}
.dark .slide-surface {
    background: var(--color-bridge-900);
}

/* Bandeau titre d'une slide de contenu : bloc plein couleur module.
   Surcharge nécessaire de `.header-module h1,h2,h3` (globals.css §header-module),
   qui colore les titres en couleur module : sur un fond module, le titre doit
   passer en crème, sinon texte invisible sur son propre fond. */
.slide-banner {
    background: var(--module-color, var(--color-bridge-500));
    padding: 1.25rem 2rem 1.15rem;
}
.dark .slide-banner {
    background: var(--module-color-dark, var(--module-color, var(--color-bridge-500)));
}

.slide-banner :where(h1, h2, h3) {
    color: var(--color-bridge-50);
    margin: 0;
    line-height: 1.05;
    text-align: left;
}
/* Les couleurs module-*-dark sont des pastels clairs calibrés pour du texte
   brand-dark (≥7.8:1), pas du crème : le texte du bandeau s'inverse en dark.
   Même règle que .course-section-badge. */
.dark .slide-banner :where(h1, h2, h3) {
    color: var(--color-brand-dark);
}

/* Eyebrow du bandeau — réutilise le pattern documenté dans DESIGN.md
   (« étiquettes structurelles ») : 600, 0.2em, uppercase. */
.slide-banner-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-bridge-50);
    opacity: 0.78;
    margin-bottom: 0.3rem;
}
.dark .slide-banner-eyebrow {
    color: var(--color-brand-dark);
    opacity: 0.72;
}

/* Corps de slide : le contenu respire, le code garde sa place en bas. */
.slide-body {
    padding: 1.75rem 2rem;
}
.slide-body > * + * {
    margin-top: 1.15rem;
}
```

- [ ] **Step 2 : Vérifier que le CSS ne casse rien**

```bash
bun run lint
```

Attendu : aucune erreur.

- [ ] **Step 3 : Aligner l'échelle typographique sur les attributs DESIGN.md**

Remplace **intégralement** `src/components/Slides/ui/config/slideConfig.ts` par :

```ts
// Échelle typographique des slides.
//
// Les tailles restent propres aux slides : DESIGN.md calibre `body` à 1rem pour
// une lecture à 50 cm, ce qui serait illisible projeté au fond d'une salle.
// Ce qui est aligné sur DESIGN.md, ce sont les ATTRIBUTS : famille (IBM Plex
// Sans, héritée), graisses et letter-spacing des rôles correspondants
// (display 800 / -0.025em, headline 700 / -0.015em, label 600 / 0.2em).

export const slideTextSizes = {
    // Titres internes à une slide
    heading: {
        1: "text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] mb-0",
        2: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-[-0.015em] mb-4",
        3: "text-xl md:text-2xl lg:text-3xl font-semibold mb-3",
    },

    // Contenu courant (également utilisé par les items de liste)
    text: {
        default: "text-lg md:text-2xl lg:text-3xl",
        large: "text-xl md:text-3xl lg:text-4xl",
        xl: "text-2xl md:text-4xl lg:text-5xl",
    },

    // Slide de titre
    title: {
        module: "text-[0.6875rem] font-semibold tracking-[0.2em] uppercase",
        section: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.025em]",
        description: "text-lg md:text-xl lg:text-2xl font-light",
    },
} as const;

// Helper type for type safety
export type HeadingLevel = keyof typeof slideTextSizes.heading;
export type TextSize = keyof typeof slideTextSizes.text;
```

- [ ] **Step 4 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur. `slideTextSizes` garde exactement les mêmes clés, donc `SlideHeading`, `SlideText`, `SlideList` et `SlideTitle` continuent de compiler.

- [ ] **Step 5 : Vérifier la non-régression des tests**

```bash
bun test
```

Attendu : **309 pass / 3 fail** (référence inchangée).

- [ ] **Step 6 : Commit**

```bash
git add src/app/globals.css src/components/Slides/ui/config/slideConfig.ts
git commit -m "feat(slides): fondations CSS et echelle typographique

Ajoute le bloc .slide-* dans globals.css (bandeau, surface, rythme) sur le
modele de .course-content, et recale slideConfig sur les attributs DESIGN.md
(graisses, letter-spacing) en gardant une echelle propre a la projection.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2 : Exposer le module et la section dans le contexte

Le bandeau affiche un eyebrow « MODULE · SECTION ». `SlideScreen` ne reçoit aujourd'hui qu'un `title`, et `SlideBlocksRenderer` ne lui passe rien d'autre. Le contexte est le bon véhicule : `SlidesScreen` a déjà `module` et `section`, et les `Slide.tsx` de `src/cours/` qui utilisent `SlideScreen` sans module continueront de fonctionner (l'eyebrow est simplement absent).

**Files:**
- Modify: `src/components/Slides/context/SlidesContext.tsx`
- Modify: `src/components/Slides/SlidesScreen.tsx`

**Interfaces:**
- Consumes: rien.
- Produces: `useSlides()` expose deux champs supplémentaires — `moduleTitle?: string` et `sectionTitle?: string`. Consommés par `SlideScreen` en Task 3.

- [ ] **Step 1 : Lire le contexte existant**

```bash
cat src/components/Slides/context/SlidesContext.tsx
```

Repère l'interface du contexte (le type de `value`) et la fonction `useSlides`.

- [ ] **Step 2 : Ajouter les deux champs à l'interface du contexte**

Dans `src/components/Slides/context/SlidesContext.tsx`, ajoute ces deux propriétés **optionnelles** à l'interface qui type le contexte, à côté des champs `/* UI */` :

```ts
    /* Identité (pour l'eyebrow du bandeau) */
    moduleTitle?: string;
    sectionTitle?: string;
```

Elles sont optionnelles : un `Slide.tsx` de cours qui rend `SlideScreen` hors d'un `SlidesScreen` avec module ne doit pas planter.

- [ ] **Step 3 : Alimenter le contexte depuis `SlidesScreen`**

Dans `src/components/Slides/SlidesScreen.tsx`, dans l'objet `value={{...}}` du `SlidesContext.Provider`, ajoute après le bloc `/* UI */` (qui contient `isFullscreen` et `toggleFullscreen`) :

```tsx
                /* Identité */
                moduleTitle: module?.title,
                sectionTitle: section?.title,
```

`module` et `section` sont déjà les props du composant, aucun autre changement n'est nécessaire.

- [ ] **Step 4 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur.

- [ ] **Step 5 : Vérifier la non-régression**

```bash
bun test
```

Attendu : **309 pass / 3 fail**.

- [ ] **Step 6 : Commit**

```bash
git add src/components/Slides/context/SlidesContext.tsx src/components/Slides/SlidesScreen.tsx
git commit -m "feat(slides): expose moduleTitle et sectionTitle dans le contexte

Champs optionnels : les Slide.tsx de cours qui rendent SlideScreen sans
module continuent de fonctionner, l'eyebrow est simplement absent.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3 : Bandeau titre de la slide de contenu

**Files:**
- Modify: `src/components/Slides/SlideScreen.tsx`

**Interfaces:**
- Consumes: `useSlides()` → `moduleTitle`, `sectionTitle` (Task 2) ; les classes `.slide-banner`, `.slide-banner-eyebrow`, `.slide-body` (Task 1).
- Produces: rien de nouveau — la signature `SlideScreenProps { title, children }` est **inchangée**, `SlideBlocksRenderer` et les `Slide.tsx` continuent d'appeler `<SlideScreen title="…">` à l'identique.

- [ ] **Step 1 : Remplacer le rendu de `SlideScreen`**

Remplace **intégralement** `src/components/Slides/SlideScreen.tsx` par :

```tsx
'use client';
import React from 'react';
import {SlideHeading} from "./ui/SlideHeading";
import {SlideNote} from "./ui/SlideNote";
import {useSlides} from "@/components/Slides/context/SlidesContext";

export interface SlideScreenProps {
    title: string;
    children: React.ReactNode;
}

export const SlideScreen: React.FC<SlideScreenProps> = ({title, children}) => {
    const {moduleTitle, sectionTitle} = useSlides();

    // Filtrer les enfants pour ne pas afficher le composant SlideNote dans le flux principal
    const filteredChildren = React.Children.toArray(children).filter(child => {
        if (React.isValidElement(child)) {
            const type = child.type;
            const isSlideNote = type === SlideNote || (typeof type === 'function' && ('displayName' in type && type.displayName === 'SlideNote' || 'name' in type && type.name === 'SlideNote'));
            return !isSlideNote;
        }
        return true;
    });

    // L'eyebrow n'apparaît que si le contexte porte l'identité (slides d'un
    // module) ; un Slide.tsx rendu hors de ce contexte affiche juste le titre.
    const eyebrow = [moduleTitle, sectionTitle].filter(Boolean).join(" · ");

    return (
        <div className="flex flex-col h-full w-full mx-auto overflow-y-auto slide-surface">
            <header className="slide-banner">
                {eyebrow && (
                    <div className="slide-banner-eyebrow">{eyebrow}</div>
                )}
                <SlideHeading level={1}>
                    {title}
                </SlideHeading>
            </header>

            <div className="flex-1 slide-body overflow-hidden">
                {filteredChildren}
            </div>
        </div>
    );
};
```

Note : `space-y-10` a été retiré au profit de `.slide-body > * + *` (Task 1), qui porte désormais le rythme vertical côté CSS.

- [ ] **Step 2 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur.

- [ ] **Step 3 : Vérification visuelle du bandeau**

Le serveur de dev doit tourner (`bun dev`). Ouvre `http://localhost:3000/javascript/1-le-dom/slide` et avance d'une slide (flèche droite ou clic sur la zone).

Vérifie :
1. Le bandeau est un bloc plein en **or JavaScript**, le titre dedans est en **crème** (pas en or — c'est la surcharge de `.header-module h1`).
2. L'eyebrow « JavaScript · Le DOM » est présent au-dessus du titre, en petites capitales espacées.
3. Le contenu est sur fond crème sous le bandeau.

- [ ] **Step 4 : Vérification en dark mode — le point critique**

Dans la console du navigateur :

```js
document.documentElement.classList.add('dark')
```

Vérifie que le titre du bandeau devient **sombre** (`brand-dark`) sur le fond or clair, et reste parfaitement lisible. S'il reste crème sur pastel clair, la règle `.dark .slide-banner :where(h1,h2,h3)` de Task 1 n'est pas appliquée — corrige avant de continuer.

Puis reviens en light :

```js
document.documentElement.classList.remove('dark')
```

- [ ] **Step 5 : Vérifier la non-régression**

```bash
bun test
```

Attendu : **309 pass / 3 fail**.

- [ ] **Step 6 : Commit**

```bash
git add src/components/Slides/SlideScreen.tsx
git commit -m "feat(slides): bandeau titre plein couleur module

Le titre vit dans un bloc couleur module avec eyebrow module/section, le
contenu sur creme en dessous. Le rythme vertical passe cote CSS (.slide-body).
Signature SlideScreenProps inchangee : aucun appelant ne casse.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4 : Slide de titre — colonne pont et numéro

C'est la tâche qui retire `FooterSvg` du chemin. Le pont reprend le principe d'`AuthLayout` (login) en miroir : image à gauche, contenu à droite, fondu entre les deux.

**Files:**
- Modify: `src/components/Slides/ui/SlideTitle.tsx`

**Interfaces:**
- Consumes: `slideTextSizes.title.*` (Task 1) ; `useIsDark()` et `useMounted()` (hooks existants) ; `TagsBadges` (existant, inchangé).
- Produces: rien — `SlideTitle` garde sa signature `{module, section}`, appelée par `SlidesScreen`.

- [ ] **Step 1 : Remplacer le rendu de `SlideTitle`**

Remplace **intégralement** `src/components/Slides/ui/SlideTitle.tsx` par :

```tsx
'use client';

import React from 'react';
import Module from "@/types/Module";
import Section from "@/types/Section";
import TagsBadges from "@/components/page/TagsBadges";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";
import {useIsDark} from "@/hook/useIsDark";
import {useMounted} from "@/hook/useMounted";

interface SlideTitleProps {
    module: Module;
    section: Section;
}

export const SlideTitle: React.FC<SlideTitleProps> = ({module, section}) => {
    const mounted = useMounted();
    const isDark = useIsDark();

    if (!mounted) return null;

    // Même bascule d'asset que AuthLayout (page de login).
    const bridgeImage = isDark
        ? "/images/header/pont-dark.png"
        : "/images/header/pont-light.png";

    const order = section.order ?? 1;

    return (
        <div className="relative flex w-full h-screen overflow-hidden slide-surface">
            {/* Colonne pont — 36 % de la largeur, fondu vers le fond de slide */}
            <div
                className="relative hidden md:block w-[36%] shrink-0 bg-cover bg-center"
                style={{backgroundImage: `url(${bridgeImage})`}}
                role="img"
                aria-label="Pont en bois clair traversé par la lumière"
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-bridge-50 dark:to-bridge-900"
                />
                {/* Numéro de section ancré dans l'image, en couleur module */}
                <div className="absolute left-6 bottom-6 z-10">
                    <div
                        className={`${slideTextSizes.title.module} text-brand-dark/75 dark:text-bridge-100/80 mb-1`}
                    >
                        {module.title}
                    </div>
                    <div
                        className="font-mono font-bold leading-[0.85] text-6xl lg:text-7xl text-(--module-color) dark:text-(--module-color-dark)"
                    >
                        {String(order).padStart(2, "0")}
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12">
                {/* Sur mobile la colonne pont est masquée : l'identité module
                    revient ici pour ne pas perdre le repère. */}
                <div className={`${slideTextSizes.title.module} text-brand-dark/70 dark:text-bridge-100/75 mb-2 md:hidden`}>
                    {module.title}
                </div>

                <h2 className={`${slideTextSizes.title.section} text-brand-dark dark:text-brand-light`}>
                    {section.title}
                    <span className="text-(--module-color) dark:text-(--module-color-dark)">.</span>
                </h2>

                <span
                    aria-hidden="true"
                    className="block h-1 w-16 mt-4 rounded-full bg-(--module-color) dark:bg-(--module-color-dark)"
                />

                {section.description && (
                    <p className={`${slideTextSizes.title.description} mt-5 max-w-2xl leading-relaxed text-bridge-600 dark:text-bridge-300`}>
                        {section.description}
                    </p>
                )}

                {section.tags && section.tags.length > 0 && (
                    <div className="mt-8">
                        <TagsBadges tags={section.tags} moduleTheme={module.title}/>
                    </div>
                )}
            </div>
        </div>
    );
};
```

Trois changements notables par rapport à l'existant :
- `FooterSvg` et `GlitchText` ne sont plus importés (voir Step 2).
- Le `<h2>` porte une couleur explicite : `.header-module h2` le colorerait en couleur module, or ici on veut `brand-dark` avec seulement le point en couleur module (le pattern `HeroSection`).
- `TagsBadges` n'est plus centré : le bloc de contenu est aligné à gauche.

- [ ] **Step 2 : Vérifier que `GlitchText` n'a plus d'usage — sans le supprimer**

```bash
grep -rn "GlitchText" src/ --include=*.tsx | grep -v "components/GlitchText.tsx"
```

Attendu : **aucune sortie**. `GlitchText` devient orphelin, mais **ne le supprime pas** : c'est un composant d'effet réutilisable, sa suppression est une décision distincte hors périmètre de ce plan. Signale-le simplement dans ton rapport.

- [ ] **Step 3 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur.

- [ ] **Step 4 : Vérification visuelle de la slide de titre**

Ouvre `http://localhost:3000/javascript/1-le-dom/slide` (première slide).

Vérifie :
1. La colonne pont occupe environ un tiers de la largeur à gauche, avec un fondu vers le crème sur son bord droit.
2. Le numéro `01` est en bas de l'image, en **or JavaScript**, avec `JavaScript` en petites capitales au-dessus.
3. À droite : titre `Le DOM` en encre sombre suivi d'un **point or**, filet or court dessous, description, tags.
4. **Plus aucune illustration en pied de page** (l'ancien `FooterSvg` a disparu).

- [ ] **Step 5 : Vérification dark mode et responsive**

En console : `document.documentElement.classList.add('dark')`.
Vérifie que l'image bascule sur `pont-dark.png`, que le numéro passe en or clair (`--module-color-dark`) et que le fondu va bien vers `bridge-900`.

Puis réduis la fenêtre sous 768 px : la colonne pont doit disparaître (`hidden md:block`) et le nom du module réapparaître au-dessus du titre.

Reviens en light : `document.documentElement.classList.remove('dark')`.

- [ ] **Step 6 : Vérifier la non-régression**

```bash
bun test
```

Attendu : **309 pass / 3 fail**.

- [ ] **Step 7 : Commit**

```bash
git add src/components/Slides/ui/SlideTitle.tsx
git commit -m "feat(slides): slide de titre avec colonne pont et numero

Reprend le principe d'AuthLayout en miroir : pont a gauche (36 %), fondu
vers le fond de slide, numero de section ancre dans l'image en couleur
module. Titre + point signature a droite, comme HeroSection.

Retire FooterSvg (236 Ko) et GlitchText du rendu. GlitchText devient
orphelin mais n'est pas supprime (decision distincte).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5 : Conteneur de slides et mode plein écran

**Files:**
- Modify: `src/components/Slides/SlidesScreen.tsx` (bloc de rendu uniquement)

**Interfaces:**
- Consumes: `.slide-surface` (Task 1).
- Produces: rien.

- [ ] **Step 1 : Corriger le conteneur et le plein écran**

Dans `src/components/Slides/SlidesScreen.tsx`, remplace le `className` du `<div ref={containerRef}>` :

```tsx
                className={cn(
                    "relative flex flex-col min-h-[600px] w-full transition-all",
                    isFullscreen
                        ? "fixed inset-0 z-50 bg-white"
                        : "bg-muted/30 rounded-2xl border"
                )}
```

par :

```tsx
                className={cn(
                    "relative flex flex-col min-h-[600px] w-full transition-all slide-surface",
                    isFullscreen
                        ? "fixed inset-0 z-50"
                        : cn(
                            "rounded-2xl border border-bridge-500/45 dark:border-bridge-500/35",
                            "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)]",
                            "dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                        )
                )}
```

Le `bg-white` disparaît (violation directe de DESIGN.md, flash blanc en projection) : `.slide-surface` fournit le fond dans les deux modes. Les ombres reprennent le vocabulaire `ambient-warm-low` / `ambient-dark-low` de DESIGN.md §4.

- [ ] **Step 2 : Corriger la barre de progression du bas**

Toujours dans `SlidesScreen.tsx`, remplace le bloc :

```tsx
                <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/20">
                    <div
                        className="h-full bg-primary transition-all"
```

par :

```tsx
                <div className="absolute bottom-0 left-0 h-1 w-full bg-bridge-500/20">
                    <div
                        className="h-full bg-(--module-color) dark:bg-(--module-color-dark) transition-all"
```

- [ ] **Step 3 : Vérifier qu'aucun `bg-white` ne subsiste dans les slides**

```bash
grep -rn "bg-white\|#fff\|#FFF" src/components/Slides/
```

Attendu : **aucune sortie**.

- [ ] **Step 4 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur.

- [ ] **Step 5 : Vérification visuelle du plein écran**

Sur `http://localhost:3000/javascript/1-le-dom/slide`, clique l'icône plein écran dans la barre d'actions (ou touche `f`).

Vérifie : le fond est **crème**, pas blanc. En dark mode, il est cacao (`bridge-900`). Sors du plein écran : le conteneur a des coins arrondis, une bordure chaude et une ombre ambiante.

- [ ] **Step 6 : Vérifier la non-régression**

```bash
bun test
```

Attendu : **309 pass / 3 fail**.

- [ ] **Step 7 : Commit**

```bash
git add src/components/Slides/SlidesScreen.tsx
git commit -m "fix(slides): supprime le bg-white du plein ecran

Le mode plein ecran forcait un fond blanc pur, en violation directe de
DESIGN.md (« Don't utiliser #fff ») et produisant un flash blanc en
projection. Passe sur .slide-surface (creme / cacao) avec bordure et
ombres chaudes du vocabulaire DESIGN.md.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6 : Titres internes et indicateurs de progression

**Files:**
- Modify: `src/components/Slides/ui/SlideHeading.tsx`
- Modify: `src/components/Slides/SlidesProgress.tsx`
- Modify: `src/components/Slides/progress/ProgressGroup.tsx`
- Modify: `src/components/Slides/progress/ProgressPoint.tsx`

**Interfaces:**
- Consumes: `slideTextSizes.heading` (Task 1).
- Produces: `ProgressPoint` perd sa prop `isDark` (le thème est géré en CSS via les variantes `dark:`) — `ProgressGroup` est mis à jour en conséquence dans la même tâche.

- [ ] **Step 1 : Recaler les couleurs de `SlideHeading`**

Dans `src/components/Slides/ui/SlideHeading.tsx`, remplace l'objet `styles` :

```tsx
    const styles: Record<number, string> = {
        1: `${slideTextSizes.heading[1]} text-primary`,
        2: `${slideTextSizes.heading[2]} text-secondary-foreground`,
        3: `${slideTextSizes.heading[3]} text-muted-foreground`,
    };
```

par :

```tsx
    // Le niveau 1 est rendu dans .slide-banner, qui impose déjà sa couleur
    // (crème en light, brand-dark en dark) : on ne la fixe pas ici.
    const styles: Record<number, string> = {
        1: slideTextSizes.heading[1],
        2: `${slideTextSizes.heading[2]} text-brand-dark dark:text-brand-light`,
        3: `${slideTextSizes.heading[3]} text-bridge-600 dark:text-bridge-300`,
    };
```

- [ ] **Step 2 : Recaler la pastille de progression**

Dans `src/components/Slides/SlidesProgress.tsx`, remplace la ligne du conteneur interne :

```tsx
            <div className="flex flex-col gap-2 max-h-[90vh] overflow-y-auto p-1 bg-background/80 rounded-full border">
```

par :

```tsx
            <div className="flex flex-col gap-2 max-h-[90vh] overflow-y-auto p-1 rounded-full border border-bridge-500/40 bg-bridge-50/85 dark:bg-bridge-800/85 backdrop-blur-sm">
```

- [ ] **Step 3 : Recaler le groupe de progression**

Dans `src/components/Slides/progress/ProgressGroup.tsx`, remplace le `className` du conteneur :

```tsx
            className={cn(
                "flex flex-col items-center gap-1 p-0.5 rounded-full border",
                isCurrentSlide
                    ? "border-primary/30 bg-primary/5"
                    : "border-transparent"
            )}
```

par :

```tsx
            className={cn(
                "flex flex-col items-center gap-1 p-0.5 rounded-full border",
                isCurrentSlide
                    ? "border-(--module-color)/35 dark:border-(--module-color-dark)/35"
                    : "border-transparent"
            )}
```

Puis, dans le `<ProgressPoint>` rendu plus bas, **supprime** la ligne `isDark={isDark}`. Supprime aussi la variable `const isDark = useIsDark();` et l'import `useIsDark` devenus inutiles — mais **garde** `useMounted` et le `if (!mounted) return null;`.

- [ ] **Step 4 : Recaler les points de progression**

Remplace **intégralement** `src/components/Slides/progress/ProgressPoint.tsx` par :

```tsx
import {forwardRef} from "react";
import {cn} from "@/lib/utils";

interface ProgressPointProps {
    isActive: boolean;
    isPast: boolean;
}

export const ProgressPoint = forwardRef<HTMLDivElement, ProgressPointProps>(({isActive, isPast}, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative w-1.5 h-1.5 rounded-full transition-transform",
            isActive
                ? "scale-125 bg-(--module-color) dark:bg-(--module-color-dark)"
                : isPast
                    ? "bg-(--module-color)/45 dark:bg-(--module-color-dark)/45"
                    : "bg-bridge-500/30 dark:bg-bridge-300/25"
        )}
    />
));
ProgressPoint.displayName = "ProgressPoint";
```

La prop `isDark` disparaît : le thème passe par les variantes `dark:` de Tailwind, ce qui évite un `useIsDark()` par point.

- [ ] **Step 5 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur. Si `tsc` signale `isDark` manquant ou en trop, c'est que Step 3 ou Step 4 est incomplet.

- [ ] **Step 6 : Vérification visuelle de la progression**

Sur `http://localhost:3000/javascript/1-le-dom/slide`, avance de plusieurs slides.

Vérifie : les points passés sont en **or translucide**, le point actif en **or plein et légèrement agrandi**, les points à venir en brun neutre. La pastille qui les contient est crème avec une bordure chaude. Le groupe de la slide courante a un anneau or discret.

- [ ] **Step 7 : Vérifier la non-régression**

```bash
bun test
```

Attendu : **309 pass / 3 fail**.

- [ ] **Step 8 : Commit**

```bash
git add src/components/Slides/ui/SlideHeading.tsx src/components/Slides/SlidesProgress.tsx src/components/Slides/progress/ProgressGroup.tsx src/components/Slides/progress/ProgressPoint.tsx
git commit -m "feat(slides): titres et progression sur la palette

Les titres internes passent sur brand-dark/bridge, la progression sur la
couleur module (actif plein, passe translucide, a venir neutre). Le point
de progression perd sa prop isDark : le theme passe par les variantes
Tailwind dark:, ce qui retire un useIsDark() par point.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7 : Statuts de session live réchauffés

Les indicateurs live portent une information fonctionnelle. Ils sont réchauffés vers la palette **sans** perdre en lisibilité, et restent distingués par teinte **et** par forme, pas par la couleur seule (contrainte d'accessibilité PRODUCT.md).

**Files:**
- Modify: `src/components/Slides/SlidesActions.tsx`
- Modify: `src/components/Slides/SlidesMobileView.tsx`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: rien.

- [ ] **Step 1 : Recaler la barre d'actions desktop**

Dans `src/components/Slides/SlidesActions.tsx` :

a) Le conteneur — remplace :

```tsx
            <div className={cn(
                "flex items-center gap-2 p-2 rounded-xl border backdrop-blur-md transition-opacity",
                hovered ? "opacity-100 bg-background/70" : "opacity-40 bg-background/40"
            )}>
```

par :

```tsx
            <div className={cn(
                "flex items-center gap-2 p-2 rounded-xl border border-bridge-500/40 backdrop-blur-md transition-opacity",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                hovered
                    ? "opacity-100 bg-bridge-50/85 dark:bg-bridge-800/85"
                    : "opacity-45 bg-bridge-50/55 dark:bg-bridge-800/55"
            )}>
```

b) Le point de statut — remplace :

```tsx
                            <span className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                isController ? "bg-red-500 animate-pulse" : "bg-green-500"
                            )} />
```

par :

```tsx
                            {/* Distinction par teinte ET par forme : le leader pulse
                                sur un disque plein, le suiveur porte un anneau. */}
                            <span className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                isController
                                    ? "bg-brand-primary dark:bg-brand-accent animate-pulse"
                                    : "border-2 border-bridge-600 dark:border-bridge-300"
                            )} />
```

c) Le libellé du rôle — remplace :

```tsx
                                <span className={cn(
                                    "text-xs font-semibold",
                                    isController ? "text-red-500" : "text-green-600 dark:text-green-400"
                                )}>
```

par :

```tsx
                                <span className={cn(
                                    "text-xs font-semibold",
                                    isController
                                        ? "text-brand-primary dark:text-brand-accent"
                                        : "text-bridge-600 dark:text-bridge-300"
                                )}>
```

d) Le sous-libellé — remplace `className="text-[10px] text-muted-foreground"` par :

```tsx
                                <span className="text-[10px] text-bridge-600/80 dark:text-bridge-300/80">
```

e) L'icône d'arrêt — remplace `<StopCircle className="text-red-500" />` par :

```tsx
                                <StopCircle className="text-brand-primary dark:text-brand-accent" />
```

L'indicateur de connexion (`text-amber-500`) est **conservé tel quel** : l'ambre est déjà une teinte chaude, cohérente avec la palette, et signale un état transitoire distinct des rôles.

- [ ] **Step 2 : Recaler la vue mobile**

Dans `src/components/Slides/SlidesMobileView.tsx` :

a) Le point de statut — remplace :

```tsx
                        <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            isController ? "bg-red-500 animate-pulse" : "bg-green-500"
                        )}/>
```

par :

```tsx
                        <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            isController
                                ? "bg-brand-primary dark:bg-brand-accent animate-pulse"
                                : "border-2 border-bridge-600 dark:border-bridge-300"
                        )}/>
```

b) Le libellé — remplace :

```tsx
                        <span className={cn(
                            "text-xs font-medium",
                            isController ? "text-red-500" : "text-green-600 dark:text-green-400"
                        )}>
```

par :

```tsx
                        <span className={cn(
                            "text-xs font-medium",
                            isController
                                ? "text-brand-primary dark:text-brand-accent"
                                : "text-bridge-600 dark:text-bridge-300"
                        )}>
```

c) Le bouton « Reprendre » — remplace `className="h-7 px-2 gap-1.5 text-xs text-green-600"` par :

```tsx
                        className="h-7 px-2 gap-1.5 text-xs text-brand-primary dark:text-brand-accent"
```

d) Le bouton d'arrêt — remplace :

```tsx
                        className="w-full flex items-center justify-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
```

par :

```tsx
                        className="w-full flex items-center justify-center gap-2 text-brand-primary border-brand-primary/40 hover:bg-brand-primary/10 dark:text-brand-accent dark:border-brand-accent/40 dark:hover:bg-brand-accent/10"
```

Le badge de décrochage follower (`bg-amber-50 border-amber-200 text-amber-700`) est **conservé** : même justification que l'indicateur de connexion.

- [ ] **Step 3 : Vérifier qu'aucun rouge/vert vif ne subsiste sur les rôles**

```bash
grep -rn "text-red-500\|bg-green-500\|text-green-600\|text-green-400\|border-red-200\|hover:bg-red-50" src/components/Slides/
```

Attendu : **aucune sortie**.

- [ ] **Step 4 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur.

- [ ] **Step 5 : Vérification visuelle de la barre d'actions**

Sur `http://localhost:3000/javascript/1-le-dom/slide`, survole la barre d'actions en bas.

Vérifie : elle est crème translucide avec bordure et ombre chaudes (plus de gris neutre), les boutons de navigation et plein écran sont lisibles. En dark mode, elle est cacao.

Note : les états Leader/Suiveur exigent une session live active pour être visibles. Si tu ne peux pas en démarrer une, contente-toi de vérifier que le code compile et signale ce point comme non vérifié visuellement.

- [ ] **Step 6 : Vérifier la non-régression**

```bash
bun test
```

Attendu : **309 pass / 3 fail**.

- [ ] **Step 7 : Commit**

```bash
git add src/components/Slides/SlidesActions.tsx src/components/Slides/SlidesMobileView.tsx
git commit -m "feat(slides): rechauffe les statuts de session live

Leader passe sur brand-primary, suiveur sur bridge-600 avec un anneau au
lieu d'un disque plein : les roles restent distingues par teinte ET par
forme, pas par la couleur seule (contrainte a11y PRODUCT.md). L'ambre des
alertes de connexion est conserve, deja chaud.

Applique identiquement sur desktop et mobile.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8 : Suppression de `FooterSvg` et vérification d'ensemble

**Files:**
- Delete: `src/components/FooterSvg.tsx`

**Interfaces:**
- Consumes: l'absence d'usage de `FooterSvg`, produite par Task 4.
- Produces: rien.

- [ ] **Step 1 : Confirmer que `FooterSvg` n'a plus aucun consommateur**

```bash
grep -rn "FooterSvg" src/ scripts/
```

Attendu : **une seule sortie**, la définition dans `src/components/FooterSvg.tsx`. Si `SlideTitle` y apparaît encore, Task 4 est incomplète — arrête-toi et signale-le.

- [ ] **Step 2 : Supprimer le fichier**

```bash
git rm src/components/FooterSvg.tsx
```

- [ ] **Step 3 : Vérifier lint + typecheck**

```bash
bun run lint
bunx tsc --noEmit -p tsconfig.json
```

Attendu : aucune erreur.

- [ ] **Step 4 : Contrôle des garde-fous globaux**

```bash
echo "=== #fff / #000 litteraux dans les slides ==="
grep -rn "#fff\|#000\|bg-white\|text-white" src/components/Slides/ || echo "  aucun"

echo "=== ombres froides en light (hors variantes dark:) ==="
grep -rn "shadow-\[.*rgba(0,0,0" src/components/Slides/ | grep -v "dark:" || echo "  aucune"

echo "=== tokens shadcn generiques residuels ==="
grep -rn "bg-background/\|text-muted-foreground\|bg-primary\b\|bg-muted/" src/components/Slides/ || echo "  aucun"
```

Attendu : les trois contrôles répondent « aucun ». Une occurrence résiduelle de `text-muted-foreground` dans `SlidesMobileView` (le message « Aucune note ») est **acceptable** — c'est du texte secondaire neutre, pas un élément d'identité ; signale-la sans la corriger si elle apparaît.

- [ ] **Step 5 : Suite de tests complète**

```bash
bun test
```

Attendu : **309 pass / 3 fail**, strictement l'état de référence.

- [ ] **Step 6 : Build de production**

```bash
bun run build
```

Attendu : build en succès (exit 0). C'est le seul build du plan : il valide que rien ne casse à la compilation Turbopack.

- [ ] **Step 7 : Vérification visuelle finale — matrice modules × thèmes**

Le point de risque est le contraste du bandeau sur les 5 couleurs module. Parcours ces pages, en light **puis** en dark (`document.documentElement.classList.toggle('dark')`) :

| Module | URL |
|---|---|
| JavaScript | `http://localhost:3000/javascript/1-le-dom/slide` |
| PHP | `http://localhost:3000/php/11-twig/slide` |

Pour chacune, vérifie : slide de titre (pont + numéro), au moins une slide de contenu (bandeau + progression), et le mode plein écran.

Le critère : **le titre du bandeau reste lisible dans les deux thèmes**. En dark, il doit être sombre sur pastel clair — s'il est crème sur pastel, la règle d'inversion ne s'applique pas.

Note : seuls JavaScript et PHP ont des slides en base. Pour t'en assurer, ouvre `http://localhost:3000/api/admin/content/status` en session admin et cherche les entrées `"slide"`. Les autres modules n'ont pas de slide à contrôler — ne cherche pas à en créer.

- [ ] **Step 8 : Commit**

```bash
git add -A
git commit -m "chore(slides): supprime FooterSvg, devenu orphelin

Dernier vestige de l'ancienne DA des slides : 236 Ko de SVG inline en JSX
(331 paths), plus aucun consommateur depuis la refonte de SlideTitle.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Auto-revue

**Couverture du spec**

| Exigence du spec | Tâche |
|---|---|
| Bloc `.slide-*` dans globals.css | 1 |
| Échelle typo alignée sur les attributs (pas les tailles) | 1 |
| Bandeau titre plein couleur module | 3 (CSS en 1) |
| Progression en points latéraux, barre de pied supprimée | 6 (la barre de pied de `SlidesScreen` est recolorée en 5, la progression latérale existait déjà) |
| Slide de titre : pont 36 % + numéro | 4 |
| `FooterSvg` supprimé | 4 (usage) + 8 (fichier) |
| `bg-white` du plein écran corrigé | 5 |
| Statuts live réchauffés, desktop **et** mobile | 7 |
| Inversion du texte en dark mode | 1 (règle CSS) + 3 (vérification) + 8 (matrice) |
| Titres longs | 1 (`.slide-banner` sans hauteur fixe, le contenu suit) |
| Repli neutre sans module | 1 (`var(--module-color, var(--color-bridge-500))`) + 2 (eyebrow optionnel) |
| Bascule pont light/dark | 4 |
| Contenu existant préservé | 3 (signature `SlideScreenProps` inchangée) |
| Garde-fous (`#fff`, ombres froides, tests) | 8 |

**Point non couvert volontairement :** le spec évoque « une progression cohérente » pour les paliers typographiques. Task 1 fixe des valeurs concrètes ; si elles se révèlent trop petites en projection réelle, c'est un ajustement d'une ligne dans `slideConfig.ts`, pas une reprise du plan.

**Cohérence des types :** `ProgressPoint` perd `isDark` en Task 6 Step 4, et `ProgressGroup` cesse de la passer au Step 3 de la même tâche — les deux changements sont dans la même tâche, donc jamais dans un état intermédiaire non compilable. `SlideScreenProps` et `SlideTitleProps` sont inchangés, aucun appelant externe n'est affecté.

**Risque principal :** l'inversion dark du bandeau. Elle est vérifiée trois fois (Task 3 Step 4, Task 8 Step 7) parce que c'est exactement le bug qui est passé inaperçu sur `.course-section-badge` jusqu'à une inspection visuelle en dark mode.
