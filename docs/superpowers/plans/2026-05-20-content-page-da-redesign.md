# Content Page DA Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger la DA de la page contenu — retour vers le module, ContentSwitcher compact, et bouton Slides externe séparé.

**Architecture:** Deux modifications indépendantes. (1) `backHref` de la page contenu remonte vers le module (pas la section) car le ContentSwitcher gère déjà Cours↔TP↔etc. en place. (2) Le ContentSwitcher est resserré visuellement (`py-2`→`py-1`, `px-3 py-2`→`px-2.5 py-1.5`, icônes `w-4`→`w-3.5`) et reçoit un bouton Slides séparé par un diviseur vertical, s'ouvrant en nouvel onglet.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Lucide React (`ExternalLink` à ajouter, `Presentation` déjà dans `contentMeta.ts`)

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Changer `backHref` et `backLabel` |
| `src/components/page/ContentSwitcher.tsx` | Compact pills + bouton Slides externe |

---

## Task 1 : Corriger le bouton retour de la page contenu

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

- [ ] **Step 1 : Localiser et modifier `backHref` et `backLabel`**

Localiser ces deux props sur `HeroSection` (lignes ~99-100) :

```tsx
backHref={`/${moduleSlug}/${sectionSlug}`}
backLabel={currentSection.title}
```

Les remplacer par :

```tsx
backHref={`/${moduleSlug}`}
backLabel={currentModule.title}
```

`backHref` pointe désormais vers la page module (liste de tous les chapitres). Le ContentSwitcher gère déjà la navigation inter-contenus au sein de la section.

- [ ] **Step 2 : Commiter**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx"
git commit -m "fix(content-page): back button targets module page (list of chapters)"
```

---

## Task 2 : Redesign ContentSwitcher — compact + bouton Slides

**Files:**
- Modify: `src/components/page/ContentSwitcher.tsx`

**Contexte :** Le fichier actuel (102 lignes) filtre déjà `slide` des tabs. Il faut :
1. Ajouter `ExternalLink` aux imports Lucide
2. Réduire la hauteur : `py-2`→`py-1` sur le `<nav>`, `px-3 py-2`→`px-2.5 py-1.5` + `gap-2`→`gap-1.5` sur les `<Link>`, icônes `w-4 h-4`→`w-3.5 h-3.5`
3. Ajouter séparateur + bouton Slides en `<a target="_blank">` après les tabs internes
4. Ajuster la condition `return null` pour ne pas cacher la barre si seul un slide existe

- [ ] **Step 1 : Ajouter `ExternalLink` à l'import Lucide**

Ligne 2, remplacer :
```tsx
import {BookOpen, Columns2} from "lucide-react";
```
Par :
```tsx
import {BookOpen, Columns2, ExternalLink} from "lucide-react";
```

- [ ] **Step 2 : Réduire la hauteur du `<nav>`**

Localiser (ligne ~72) :
```tsx
className="flex items-center gap-1 overflow-x-auto py-2"
```
Remplacer par :
```tsx
className="flex items-center gap-1 overflow-x-auto py-1"
```

- [ ] **Step 3 : Réduire padding + taille des icônes des tabs**

Localiser dans le `.map()` le className du `<Link>` et l'`<Icon>` :

```tsx
className={cn(
    "shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold",
    "border transition-colors duration-200",
    key === SPLIT_KEY && "hidden lg:inline-flex",
    isActive
        ? "bg-brand-primary text-brand-light border-brand-primary shadow-sm"
        : "text-brand-dark/70 dark:text-bridge-100/70 border-transparent hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60"
)}
```
et
```tsx
<Icon className="w-4 h-4 shrink-0"/>
```

Remplacer par :
```tsx
className={cn(
    "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold",
    "border transition-colors duration-200",
    key === SPLIT_KEY && "hidden lg:inline-flex",
    isActive
        ? "bg-brand-primary text-brand-light border-brand-primary shadow-sm"
        : "text-brand-dark/70 dark:text-bridge-100/70 border-transparent hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60"
)}
```
et
```tsx
<Icon className="w-3.5 h-3.5 shrink-0"/>
```

- [ ] **Step 4 : Ajouter séparateur + bouton Slides**

Juste après la fermeture du `{tabs.map(...)}`, avant `</nav>`, insérer :

```tsx
{contents.includes('slide') && (
    <>
        <div className="h-4 w-px bg-border mx-1 shrink-0" aria-hidden="true"/>
        <a
            href={`/${moduleSlug}/${sectionSlug}/slide`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ouvrir les slides dans un nouvel onglet"
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold border border-transparent transition-colors duration-200 text-brand-dark/70 dark:text-bridge-100/70 hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60 cursor-pointer"
        >
            <ExternalLink className="w-3.5 h-3.5 shrink-0"/>
            <span>Slides</span>
        </a>
    </>
)}
```

- [ ] **Step 5 : Ajuster la condition de retour null**

Localiser (ligne ~56) :
```tsx
if (tabs.length <= 1) return null;
```
Remplacer par :
```tsx
if (tabs.length <= 1 && !contents.includes('slide')) return null;
```

Ceci garantit que la barre reste visible si la section n'a qu'un seul contenu textuel mais possède un slide.

- [ ] **Step 6 : Vérifier le fichier final**

Le fichier `src/components/page/ContentSwitcher.tsx` complet doit être :

```tsx
import Link from "next/link";
import {BookOpen, Columns2, ExternalLink} from "lucide-react";
import {cn} from "@/lib/utils";
import {CONTENT_ICON, CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";
import ReadingProgress from "@/components/page/ReadingProgress";

const SPLIT_KEY = 'split';
const SPLIT_LABEL = 'Côte à côte';

interface ContentSwitcherProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
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
        <div
            className={cn(
                "sticky top-(--navbar-h) z-30 w-full",
                "bg-transparent backdrop-blur-xs",
                "border-b border-border"
            )}
        >
            <ReadingProgress modulePath={moduleSlug}/>
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <nav
                    aria-label="Types de contenu de la section"
                    className="flex items-center gap-1 overflow-x-auto py-1"
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
                                    "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold",
                                    "border transition-colors duration-200",
                                    key === SPLIT_KEY && "hidden lg:inline-flex",
                                    isActive
                                        ? "bg-brand-primary text-brand-light border-brand-primary shadow-sm"
                                        : "text-brand-dark/70 dark:text-bridge-100/70 border-transparent hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0"/>
                                <span>{label}</span>
                            </Link>
                        );
                    })}

                    {contents.includes('slide') && (
                        <>
                            <div className="h-4 w-px bg-border mx-1 shrink-0" aria-hidden="true"/>
                            <a
                                href={`/${moduleSlug}/${sectionSlug}/slide`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Ouvrir les slides dans un nouvel onglet"
                                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold border border-transparent transition-colors duration-200 text-brand-dark/70 dark:text-bridge-100/70 hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60 cursor-pointer"
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

- [ ] **Step 7 : Commiter**

```bash
git add src/components/page/ContentSwitcher.tsx
git commit -m "feat(content-switcher): compact pills (-30% height), add slides external button"
```

---

## Task 3 : Vérification finale

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

Avec `bun run dev`, vérifier sur `/javascript/1-le-dom/cours` :
- `← JavaScript` au-dessus du titre, pointe vers `/javascript` (pas `/javascript/1-le-dom`)
- Barre ContentSwitcher ~30% moins haute (nav `py-1`, links `py-1.5`)
- Si la section a un slide : `|` + `↗ Slides` visible à droite des tabs principaux
- Clic `↗ Slides` → nouvel onglet sur `/javascript/1-le-dom/slide`

- [ ] **Step 4 : Push**

```bash
git push
```
