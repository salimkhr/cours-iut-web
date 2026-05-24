# Sticky Sidebar Nav Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déplacer ReadingProgress en sticky indépendant sous la navbar et ajouter un panneau de navigation vertical fixe dans la marge droite pour switcher entre contenus sans perdre de hauteur de lecture.

**Architecture:** Trois changements découplés. (1) ContentSwitcher perd ReadingProgress. (2) Nouveau composant serveur `ContentSidebarNav` — fixed en marge droite, visible uniquement à `2xl` (1536px+), contient les mêmes tabs que ContentSwitcher en vertical. (3) La page contenu importe ReadingProgress directement en sticky z-30 + importe ContentSidebarNav. Le TableOfContents existant est `fixed bottom-6 right-6` — aucun conflit. Le contenu de l'article garde sa largeur intacte (sidebar fixed, hors du flux).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Lucide React

---

## Fichiers modifiés / créés

| Fichier | Action |
|---------|--------|
| `src/components/page/ContentSwitcher.tsx` | Retirer `<ReadingProgress>` du rendu |
| `src/components/page/ContentSidebarNav.tsx` | CRÉER — composant serveur, sidebar vertical fixed |
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Importer ReadingProgress + ContentSidebarNav |

---

## Task 1 : Retirer ReadingProgress de ContentSwitcher

**Files:**
- Modify: `src/components/page/ContentSwitcher.tsx`

- [ ] **Step 1 : Supprimer l'import ReadingProgress**

Localiser ligne 5 :
```tsx
import ReadingProgress from "@/components/page/ReadingProgress";
```
Supprimer cette ligne.

- [ ] **Step 2 : Supprimer le composant ReadingProgress du rendu**

Localiser dans le `return (...)` :
```tsx
            <ReadingProgress modulePath={moduleSlug}/>
```
Supprimer cette ligne.

- [ ] **Step 3 : Vérifier le fichier final**

Le fichier complet doit être :

```tsx
import Link from "next/link";
import {BookOpen, Columns2, ExternalLink} from "lucide-react";
import {cn} from "@/lib/utils";
import {CONTENT_ICON, CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";

const SPLIT_KEY = 'split';
const SPLIT_LABEL = 'Côte à côte';

interface ContentSwitcherProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
    sectionTitle?: string;
}

interface Tab {
    key: string;
    href: string;
    label: string;
    Icon: React.ComponentType<{className?: string}>;
}

export default function ContentSwitcher({
                                            contents,
                                            currentContent,
                                            moduleSlug,
                                            sectionSlug,
                                            sectionTitle,
                                        }: ContentSwitcherProps) {
    const sorted = [...contents].sort(
        (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
    );

    const tabs: Tab[] = sorted.filter(
        (content) => content !== 'slide'
    ).map((content) => {
        const key = content as ContentKey;
        return {
            key: content,
            href: `/${moduleSlug}/${sectionSlug}/${content}`,
            label: CONTENT_LABELS[key] ?? content,
            Icon: CONTENT_ICON[key] ?? BookOpen,
        };
    });

    if (contents.includes('cours') && contents.includes('TP')) {
        tabs.push({
            key: SPLIT_KEY,
            href: `/${moduleSlug}/${sectionSlug}/${SPLIT_KEY}`,
            label: SPLIT_LABEL,
            Icon: Columns2,
        });
    }

    if (tabs.length <= 1 && !contents.includes('slide')) return null;

    return (
        <div className="w-full border-b border-border">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 flex items-stretch">
                {sectionTitle && (
                    <div className="hidden sm:flex items-center shrink-1 min-w-0 mr-4 border-b-2 border-transparent -mb-px">
                        <span className="text-sm text-brand-dark/50 dark:text-bridge-100/50 truncate">
                            {sectionTitle}
                        </span>
                    </div>
                )}

                <nav
                    aria-label="Types de contenu de la section"
                    className="flex items-stretch gap-0 ml-auto overflow-x-auto"
                >
                    {tabs.map(({key, href, label, Icon}) => {
                        const isActive = key === currentContent;
                        return (
                            <Link
                                key={key}
                                href={href}
                                scroll={false}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    "shrink-0 inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium",
                                    "border-b-2 -mb-px transition-colors duration-200",
                                    key === SPLIT_KEY && "hidden lg:inline-flex",
                                    isActive
                                        ? "text-brand-dark dark:text-bridge-50"
                                        : "border-transparent text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark dark:hover:text-bridge-100 hover:border-border"
                                )}
                                style={isActive ? {borderColor: `var(--color-${moduleSlug})`} : undefined}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0"/>
                                <span>{label}</span>
                            </Link>
                        );
                    })}

                    {contents.includes('slide') && (
                        <>
                            <div className="h-4 w-px bg-border mx-1 shrink-0 self-center"/>
                            <a
                                href={`/${moduleSlug}/${sectionSlug}/slide`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Ouvrir les slides dans un nouvel onglet"
                                className="shrink-0 inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium border-b-2 border-transparent -mb-px transition-colors duration-200 text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark dark:hover:text-bridge-100 hover:border-border cursor-pointer"
                            >
                                <ExternalLink className="w-3.5 h-3.5 shrink-0"/>
                                <span>Slides</span>
                            </a>
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
}
```

- [ ] **Step 4 : Commiter**

```bash
git add src/components/page/ContentSwitcher.tsx
git commit -m "refactor(content-switcher): extract ReadingProgress, keep as pure tab bar"
```

---

## Task 2 : Créer ContentSidebarNav

**Files:**
- Create: `src/components/page/ContentSidebarNav.tsx`

Ce composant est un **Server Component** (pas de hooks, pas de `"use client"`). Il reçoit les mêmes données que ContentSwitcher et rend un panneau vertical `fixed` visible uniquement à `2xl`.

Positionnement : `fixed top-[calc(var(--navbar-h)+16px)] right-2 z-20` — dans la marge droite, 8px du bord, sous la navbar. À `2xl` (1536px), la marge droite disponible est `(1536-1280)/2 = 128px`. La sidebar (`w-16` = 64px + `right-2` = 8px) occupe 72px, laissant 56px entre elle et le bord de l'article. Aucun conflit avec le TOC (`fixed bottom-6 right-6`).

- [ ] **Step 1 : Créer le fichier**

Créer `src/components/page/ContentSidebarNav.tsx` avec le contenu exact suivant :

```tsx
import Link from "next/link";
import {BookOpen, Columns2, ExternalLink} from "lucide-react";
import {cn} from "@/lib/utils";
import {CONTENT_ICON, CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";

const SPLIT_KEY = 'split';

interface ContentSidebarNavProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
}

export default function ContentSidebarNav({
                                              contents,
                                              currentContent,
                                              moduleSlug,
                                              sectionSlug,
                                          }: ContentSidebarNavProps) {
    const sorted = [...contents].sort(
        (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
    );

    const tabs = [
        ...sorted
            .filter((c) => c !== 'slide')
            .map((content) => {
                const key = content as ContentKey;
                return {
                    key: content,
                    href: `/${moduleSlug}/${sectionSlug}/${content}`,
                    label: CONTENT_LABELS[key] ?? content,
                    Icon: CONTENT_ICON[key] ?? BookOpen,
                };
            }),
        ...(contents.includes('cours') && contents.includes('TP')
            ? [{
                key: SPLIT_KEY,
                href: `/${moduleSlug}/${sectionSlug}/${SPLIT_KEY}`,
                label: 'Côte à côte',
                Icon: Columns2,
            }]
            : []),
    ];

    if (tabs.length <= 1 && !contents.includes('slide')) return null;

    return (
        <div className="hidden 2xl:flex fixed top-[calc(var(--navbar-h)+16px)] right-2 z-20 flex-col">
            <nav
                aria-label="Changer de type de contenu"
                className="flex flex-col gap-0.5 rounded-xl border border-border bg-brand-light/90 dark:bg-brand-dark/90 backdrop-blur-sm shadow-md p-1"
            >
                {tabs.map(({key, href, label, Icon}) => {
                    const isActive = key === currentContent;
                    return (
                        <Link
                            key={key}
                            href={href}
                            scroll={false}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                "flex flex-col items-center gap-1 w-14 px-1 py-2.5 rounded-lg",
                                "text-[10px] font-semibold text-center leading-tight",
                                "transition-colors duration-200",
                                isActive
                                    ? "text-white"
                                    : "text-brand-dark/60 dark:text-bridge-100/60 hover:bg-bridge-300/50 dark:hover:bg-bridge-700/50 hover:text-brand-dark dark:hover:text-bridge-100"
                            )}
                            style={isActive ? {backgroundColor: `var(--color-${moduleSlug})`} : undefined}
                        >
                            <Icon className="w-4 h-4 shrink-0"/>
                            <span className="break-words w-full">{label}</span>
                        </Link>
                    );
                })}

                {contents.includes('slide') && (
                    <>
                        <div className="h-px bg-border mx-1 my-0.5"/>
                        <a
                            href={`/${moduleSlug}/${sectionSlug}/slide`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ouvrir les slides dans un nouvel onglet"
                            className="flex flex-col items-center gap-1 w-14 px-1 py-2.5 rounded-lg text-[10px] font-semibold text-center leading-tight transition-colors duration-200 cursor-pointer text-brand-dark/60 dark:text-bridge-100/60 hover:bg-bridge-300/50 dark:hover:bg-bridge-700/50 hover:text-brand-dark dark:hover:text-bridge-100"
                        >
                            <ExternalLink className="w-4 h-4 shrink-0"/>
                            <span>Slides</span>
                        </a>
                    </>
                )}
            </nav>
        </div>
    );
}
```

- [ ] **Step 2 : Commiter**

```bash
git add src/components/page/ContentSidebarNav.tsx
git commit -m "feat(content-sidebar-nav): fixed vertical tab sidebar in right margin for 2xl+"
```

---

## Task 3 : Intégrer dans la page contenu

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

- [ ] **Step 1 : Ajouter les imports**

En haut du fichier, après les imports existants, ajouter :
```tsx
import ReadingProgress from "@/components/page/ReadingProgress";
import ContentSidebarNav from "@/components/page/ContentSidebarNav";
```

- [ ] **Step 2 : Ajouter ReadingProgress sticky après ContentSwitcher**

Localiser (après `</HeroSection>`) :
```tsx
            <ContentSwitcher
                contents={currentSection.contents}
                currentContent={isSplit ? SPLIT_SLUG : currentContent!}
                moduleSlug={moduleSlug}
                sectionSlug={sectionSlug}
                sectionTitle={`${currentSection.order}. ${currentSection.title}`}
            />
```

Après la fermeture `/>` de ContentSwitcher, ajouter :
```tsx
            <div className="sticky top-(--navbar-h) z-30 w-full">
                <ReadingProgress modulePath={currentModule.path}/>
            </div>
```

- [ ] **Step 3 : Ajouter ContentSidebarNav après ContentSwitcher**

Juste après le `<div className="sticky ..."><ReadingProgress .../></div>` ajouté à l'étape 2, ajouter :
```tsx
            <ContentSidebarNav
                contents={currentSection.contents}
                currentContent={isSplit ? SPLIT_SLUG : currentContent!}
                moduleSlug={moduleSlug}
                sectionSlug={sectionSlug}
            />
```

- [ ] **Step 4 : Commiter**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx"
git commit -m "feat(content-page): sticky ReadingProgress + fixed sidebar nav in right margin"
```

---

## Task 4 : Vérification finale

- [ ] **Step 1 : Lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Step 2 : Build TypeScript**

```bash
bun run build
```

Résultat attendu : build réussi, zéro erreur TypeScript.

- [ ] **Step 3 : Vérification visuelle**

Avec `bun run dev` sur `/javascript/1-le-dom/cours` :
- La barre de titre+tabs disparaît au scroll → toute la hauteur est pour le cours
- Une fine barre de progression colorée reste visible sous la navbar (sticky)
- Sur 2xl+ (1536px) : rectangle vertical à droite dans la marge, avec les tabs Cours/TP/Côte à côte
- Tab actif : fond coloré (couleur du module)
- Tabs inactifs : hover → fond gris léger
- Clic tab → navigation sans scroll to top (`scroll={false}`)

- [ ] **Step 4 : Push**

```bash
git push
```
