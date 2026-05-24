# Unified Context Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le ContentSwitcher (pills) par une barre contextuelle unifiée : titre de section à gauche, tabs underline à droite, bouton Slides externe séparé.

**Architecture:** Deux fichiers touchés de façon découplée. (1) `ContentSwitcher` reçoit une nouvelle prop optionnelle `sectionTitle` et change son layout/style interne. (2) La page contenu passe `sectionTitle`. Le style underline actif utilise `border-b-2 -mb-px` pour recouvrir la `border-b` de la barre (pattern standard). La couleur de l'underline actif vient de `var(--color-${moduleSlug})` via `style` inline.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Lucide React (`ExternalLink` déjà importé)

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/components/page/ContentSwitcher.tsx` | Nouvelle prop `sectionTitle?`, layout flex justify-between, style underline tabs |
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Passer `sectionTitle` au ContentSwitcher |

---

## Task 1 : Refactorer ContentSwitcher — barre unifiée underline

**Files:**
- Modify: `src/components/page/ContentSwitcher.tsx`

**État actuel du fichier :** 113 lignes, pills compacts avec séparateur + bouton Slides. Interface :
```tsx
interface ContentSwitcherProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
}
```

### Changements requis

- [ ] **Step 1 : Ajouter `sectionTitle` à l'interface**

Localiser :
```tsx
interface ContentSwitcherProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
}
```
Remplacer par :
```tsx
interface ContentSwitcherProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
    sectionTitle?: string;
}
```

- [ ] **Step 2 : Ajouter `sectionTitle` au destructuring**

Localiser :
```tsx
export default function ContentSwitcher({
                                            contents,
                                            currentContent,
                                            moduleSlug,
                                            sectionSlug,
                                        }: ContentSwitcherProps) {
```
Remplacer par :
```tsx
export default function ContentSwitcher({
                                            contents,
                                            currentContent,
                                            moduleSlug,
                                            sectionSlug,
                                            sectionTitle,
                                        }: ContentSwitcherProps) {
```

- [ ] **Step 3 : Remplacer le bloc `return (...)` entier**

Localiser et supprimer tout le bloc `return (` jusqu'à la fermeture `);`, et le remplacer par :

```tsx
    return (
        <div
            className={cn(
                "sticky top-(--navbar-h) z-30 w-full",
                "bg-transparent backdrop-blur-xs",
                "border-b border-border"
            )}
        >
            <ReadingProgress modulePath={moduleSlug}/>
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
```

- [ ] **Step 4 : Vérifier le fichier final complet**

Le fichier `src/components/page/ContentSwitcher.tsx` doit être exactement :

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
        <div
            className={cn(
                "sticky top-(--navbar-h) z-30 w-full",
                "bg-transparent backdrop-blur-xs",
                "border-b border-border"
            )}
        >
            <ReadingProgress modulePath={moduleSlug}/>
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

- [ ] **Step 5 : Commiter**

```bash
git add src/components/page/ContentSwitcher.tsx
git commit -m "feat(content-switcher): unified context bar — section title left, underline tabs right"
```

---

## Task 2 : Passer `sectionTitle` depuis la page contenu

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

- [ ] **Step 1 : Ajouter `sectionTitle` au composant `ContentSwitcher`**

Localiser (lignes ~128-133) :
```tsx
<ContentSwitcher
    contents={currentSection.contents}
    currentContent={isSplit ? SPLIT_SLUG : currentContent!}
    moduleSlug={moduleSlug}
    sectionSlug={sectionSlug}
/>
```

Remplacer par :
```tsx
<ContentSwitcher
    contents={currentSection.contents}
    currentContent={isSplit ? SPLIT_SLUG : currentContent!}
    moduleSlug={moduleSlug}
    sectionSlug={sectionSlug}
    sectionTitle={`${currentSection.order}. ${currentSection.title}`}
/>
```

- [ ] **Step 2 : Commiter**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx"
git commit -m "feat(content-page): pass sectionTitle to unified context bar"
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
- Barre sticky : `1. Le DOM` tronqué à gauche (visible sur sm+), tabs à droite
- Tab actif (`Cours`) : underline couleur module (orange/rouge pour javascript), texte plein
- Tabs inactifs : texte muted, underline transparent, hover → underline gris + texte plein
- Si section a un slide : `|` + `↗ Slides` à droite, sans underline actif
- Sur mobile (<640px) : titre section masqué, tabs seuls centrés

- [ ] **Step 4 : Push**

```bash
git push
```
