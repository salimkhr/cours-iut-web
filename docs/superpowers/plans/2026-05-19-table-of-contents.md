# Table of Contents — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating TOC button (bottom-right) that opens a three-tab panel (Cours / TP / Examen) with H2+H3 headings on Cours, TP and Examen pages.

**Architecture:** `TableOfContents` is a `"use client"` component that DOM-scans the current page's `<main>` on mount (injecting slugified IDs), persists headings in a Zustand store (`tocStore`), and uses `IntersectionObserver` for active-heading tracking. The other tabs read from the store (populated on prior visits) and navigate via `router.push`. The component integrates into the existing `[contentSlug]/page.tsx` server component via a single conditional render.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Zustand 5, Tailwind CSS v4, lucide-react.

---

## Files

| Action | Fichier | Rôle |
|--------|---------|------|
| Créer | `src/lib/store/tocStore.ts` | Zustand store — cache des headings par page |
| Créer | `src/components/TableOfContents.tsx` | Composant client TOC complet |
| Modifier | `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Intégration du composant |

---

## Context important à lire avant de commencer

- `ContentKey` = `'cours' | 'TP' | 'slide' | 'projet' | 'examen'` — **TP est en majuscule**. Voir `src/lib/contentMeta.ts`.
- `CONTENT_LABELS` dans `src/lib/contentMeta.ts` : `{ cours: 'Cours', TP: 'TP', examen: 'Examen' }`.
- `currentContent` dans `page.tsx` est de type `ContentKey` — peut valoir `'TP'` (uppercase) dans l'URL.
- `currentSection.contents` est un `string[]` qui contient les ContentKey disponibles pour cette section.
- La couleur module se passe via `style={{ color: \`var(--color-${modulePath})\` }}` — pas de classe Tailwind pour ça.
- Aucun test unitaire dans le projet (`## 8. Tests: Pas encore en place` dans `CLAUDE.md`). Vérification par `pnpm dev` + navigateur.
- Zustand v5 : `create<State>()(set => ({ ... }))` — noter la double invocation `create<T>()()`.

---

## Task 1 : Store Zustand `tocStore`

**Files:**
- Create: `src/lib/store/tocStore.ts`

- [ ] **Step 1 : Créer le fichier store**

```typescript
import { create } from 'zustand'

export interface TocEntry {
    id: string
    text: string
    level: 2 | 3
}

interface TocStore {
    headings: Record<string, TocEntry[]>
    setHeadings: (key: string, entries: TocEntry[]) => void
}

export const useTocStore = create<TocStore>()((set) => ({
    headings: {},
    setHeadings: (key, entries) =>
        set((state) => ({ headings: { ...state.headings, [key]: entries } })),
}))
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```powershell
pnpm tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```powershell
git add src/lib/store/tocStore.ts
git commit -m "feat(toc): add tocStore Zustand store for heading cache"
```

---

## Task 2 : Composant `TableOfContents`

**Files:**
- Create: `src/components/TableOfContents.tsx`

- [ ] **Step 1 : Créer le fichier avec les imports et types**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTocStore, TocEntry } from '@/lib/store/tocStore'
import { CONTENT_LABELS, ContentKey } from '@/lib/contentMeta'

const TOC_TABS: ContentKey[] = ['cours', 'TP', 'examen']

interface TableOfContentsProps {
    modulePath: string
    currentContent: ContentKey
    moduleSlug: string
    sectionSlug: string
    sectionContents: string[]
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[''`'"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 2 : Ajouter le composant principal**

Ajouter sous les déclarations de types :

```tsx
export default function TableOfContents({
    modulePath,
    currentContent,
    moduleSlug,
    sectionSlug,
    sectionContents,
}: TableOfContentsProps) {
    const router = useRouter()
    const { headings, setHeadings } = useTocStore()

    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<ContentKey>(currentContent)
    const [activeId, setActiveId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const visibleTabs = TOC_TABS.filter((t) => sectionContents.includes(t))

    // DOM scan + injection d'IDs slugifiés + peuplement du store
    useEffect(() => {
        const main = document.querySelector('main')
        if (!main) return

        const elements = Array.from(main.querySelectorAll('h2, h3')) as HTMLElement[]
        const extracted: TocEntry[] = []

        elements.forEach((el) => {
            const text = el.textContent?.trim() ?? ''
            if (!text) return
            if (!el.id) el.id = slugify(text)
            extracted.push({ id: el.id, text, level: el.tagName === 'H2' ? 2 : 3 })
        })

        setHeadings(`${sectionSlug}/${currentContent}`, extracted)
    }, [sectionSlug, currentContent, setHeadings])

    // IntersectionObserver — actif uniquement sur l'onglet courant
    useEffect(() => {
        if (activeTab !== currentContent) return

        const main = document.querySelector('main')
        if (!main) return

        const elements = Array.from(main.querySelectorAll('h2[id], h3[id]'))

        const observer = new IntersectionObserver(
            (entries) => {
                const intersecting = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (intersecting.length > 0) {
                    setActiveId(intersecting[0].target.id)
                }
            },
            { rootMargin: '-10% 0px -80% 0px' }
        )

        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [activeTab, currentContent])

    // Fermeture au clic extérieur
    useEffect(() => {
        if (!isOpen) return
        function handleMouseDown(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [isOpen])

    // Fermeture à la touche Escape
    useEffect(() => {
        if (!isOpen) return
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const currentHeadings = headings[`${sectionSlug}/${currentContent}`] ?? []
    if (currentHeadings.length === 0) return null

    function handleEntryClick(entry: TocEntry) {
        if (activeTab === currentContent) {
            document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth' })
        } else {
            router.push(`/${moduleSlug}/${sectionSlug}/${activeTab}#${entry.id}`)
        }
        setIsOpen(false)
    }

    const displayedHeadings = headings[`${sectionSlug}/${activeTab}`] ?? []
    const moduleColor = `var(--color-${modulePath})`

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
            {isOpen && (
                <div className="w-64 max-h-[60vh] bg-brand-light dark:bg-brand-dark border border-bridge-200 dark:border-bridge-600 rounded-xl shadow-xl flex flex-col overflow-hidden">
                    {/* Header onglets */}
                    <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-bridge-100 dark:border-bridge-700 shrink-0">
                        <div className="flex gap-1">
                            {visibleTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        'text-xs font-semibold px-2 py-1 border-b-2 transition-colors',
                                        activeTab !== tab && 'border-transparent text-brand-dark/40 dark:text-bridge-300/40'
                                    )}
                                    style={
                                        activeTab === tab
                                            ? { borderColor: moduleColor, color: moduleColor }
                                            : {}
                                    }
                                >
                                    {CONTENT_LABELS[tab as ContentKey]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-brand-dark/40 dark:text-bridge-300/40 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Liste des headings */}
                    <div className="overflow-y-auto flex-1 py-2">
                        {displayedHeadings.length === 0 ? (
                            <div className="px-4 py-4 text-xs text-brand-dark/50 dark:text-bridge-300/50">
                                Visitez le {CONTENT_LABELS[activeTab as ContentKey]} pour charger sa table des matières.{' '}
                                <button
                                    className="underline hover:text-brand-dark dark:hover:text-bridge-100 transition-colors"
                                    onClick={() => {
                                        router.push(`/${moduleSlug}/${sectionSlug}/${activeTab}`)
                                        setIsOpen(false)
                                    }}
                                >
                                    Y aller →
                                </button>
                            </div>
                        ) : (
                            displayedHeadings.map((entry) => {
                                const isActive = activeTab === currentContent && entry.id === activeId
                                return (
                                    <button
                                        key={entry.id}
                                        onClick={() => handleEntryClick(entry)}
                                        className={cn(
                                            'w-full text-left px-3 py-1 transition-colors hover:bg-bridge-100 dark:hover:bg-bridge-700/30',
                                            entry.level === 3 ? 'pl-7 text-xs' : 'text-sm font-semibold',
                                            !isActive && 'text-brand-dark/80 dark:text-bridge-200/80'
                                        )}
                                        style={isActive ? { color: moduleColor } : {}}
                                    >
                                        {entry.text}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Bouton flottant */}
            <button
                onClick={() => setIsOpen((p) => !p)}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: moduleColor }}
                aria-label="Table des matières"
            >
                <List className="w-5 h-5" />
            </button>
        </div>
    )
}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```powershell
pnpm tsc --noEmit
```

Expected : aucune erreur TypeScript. Si `CONTENT_LABELS[tab as ContentKey]` génère une erreur de type, vérifier que `tab` est bien `ContentKey` et non `string` — ajuster le cast si besoin.

- [ ] **Step 4 : Vérifier en dev (avant intégration)**

```powershell
pnpm dev
```

Pas d'erreur de compilation dans la console. Le composant n'est pas encore visible (pas encore intégré dans `page.tsx`).

- [ ] **Step 5 : Commit**

```powershell
git add src/components/TableOfContents.tsx
git commit -m "feat(toc): add TableOfContents client component"
```

---

## Task 3 : Intégration dans `page.tsx`

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

- [ ] **Step 1 : Ajouter l'import**

En haut du fichier, après les imports existants :

```tsx
import TableOfContents from "@/components/TableOfContents";
import {ContentKey} from "@/lib/contentMeta";
```

Note : `ContentKey` est peut-être déjà importé (vérifier ligne ~14). Si oui, ne pas dupliquer.

- [ ] **Step 2 : Ajouter le composant dans le JSX**

Localiser ce bloc dans le return (autour de la ligne 158-176) :

```tsx
} : ComponentToRender && (
    <>
        {/* Lesson body */}
        <main
            className={cn(
                "w-full max-w-7xl mx-auto px-3 lg:px-4 py-10 lg:py-14",
                `header-${currentModule.path}`
            )}
        >
            {currentContent === "examen" && currentSection.examenIsLock ? (
                <ExamenWrapper currentModule={currentModule}>
                    <ComponentToRender/>
                </ExamenWrapper>
            ) : (
                <ComponentToRender/>
            )}
        </main>
    </>
)}
```

Le remplacer par :

```tsx
} : ComponentToRender && (
    <>
        {/* Lesson body */}
        <main
            className={cn(
                "w-full max-w-7xl mx-auto px-3 lg:px-4 py-10 lg:py-14",
                `header-${currentModule.path}`
            )}
        >
            {currentContent === "examen" && currentSection.examenIsLock ? (
                <ExamenWrapper currentModule={currentModule}>
                    <ComponentToRender/>
                </ExamenWrapper>
            ) : (
                <ComponentToRender/>
            )}
        </main>
        {(currentContent === 'cours' || currentContent === 'TP' || currentContent === 'examen') && (
            <TableOfContents
                modulePath={currentModule.path}
                currentContent={currentContent as ContentKey}
                moduleSlug={moduleSlug}
                sectionSlug={sectionSlug}
                sectionContents={currentSection.contents}
            />
        )}
    </>
)}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```powershell
pnpm tsc --noEmit
```

Expected : aucune erreur.

- [ ] **Step 4 : Tester en navigateur**

```powershell
pnpm dev
```

Naviguer vers une page Cours (ex: `/javascript/1-le-dom/cours`).

Checklist de validation :
- [ ] Le bouton rond ≡ apparaît en bas à droite
- [ ] Clic → panneau s'ouvre avec les onglets Cours / TP (et Examen si disponible)
- [ ] L'onglet Cours est actif par défaut, les headings H2+H3 sont listés
- [ ] Scroll dans la page → le heading actif se surligne dans la couleur du module
- [ ] Clic sur un heading → smooth scroll + fermeture du panneau
- [ ] Clic à l'extérieur du panneau → fermeture
- [ ] Touche Escape → fermeture
- [ ] Onglet TP (autre page) → "Visitez le TP pour charger..." + lien navigation
- [ ] Naviguer vers TP puis revenir sur Cours → l'onglet TP affiche maintenant les headings du TP
- [ ] En mode TP : bouton présent, onglet TP actif par défaut
- [ ] En mode Examen : bouton présent, onglet Examen actif par défaut
- [ ] En mode Slides : aucun bouton TOC
- [ ] En mode split (côte à côte) : aucun bouton TOC

- [ ] **Step 5 : Commit**

```powershell
git add src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx
git commit -m "feat(toc): integrate TableOfContents into content page"
```

---

## Self-review checklist

Après Task 3, relire le diff complet :

- [ ] `TocEntry` exporté depuis `tocStore.ts`, importé dans `TableOfContents.tsx` ✓
- [ ] `useTocStore` correctement créé avec syntaxe Zustand v5 `create<T>()()` ✓
- [ ] `slugify` gère les apostrophes françaises (`'`) et les caractères spéciaux ✓
- [ ] `visibleTabs` filtre sur `sectionContents` — seuls les onglets existants apparaissent ✓
- [ ] `activeTab` reset à `currentContent` si on navigue entre pages (composant remonté) ✓
- [ ] `IntersectionObserver` désactivé si `activeTab !== currentContent` ✓
- [ ] Bouton flottant masqué si la page courante n'a aucun heading (`currentHeadings.length === 0`) ✓
- [ ] Pas de TOC en mode split (`!isSplit` géré par la condition dans `page.tsx`) ✓
- [ ] `currentContent as ContentKey` cast valide car le condition `=== 'cours' || 'TP' || 'examen'` le garantit ✓
