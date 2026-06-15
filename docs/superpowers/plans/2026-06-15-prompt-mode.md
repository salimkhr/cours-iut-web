# Prompt Mode & Copy Context Guard — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Orienter automatiquement le LLM quand un étudiant copie du contenu pédagogique — prefix Markdown socratique pour le TP, explicatif pour le Cours — et offrir un bouton Prompt Mode sur les pages Cours pour extraire le contenu complet en Markdown.

**Architecture:** `CopyContextGuard` (wrapper client) intercepte `onCopy` et préfixe le clipboard selon le type de contenu via un record `CONTENT_COPY_PREFIX` dans `contentMeta.ts`. `PromptModeButton` (client) extrait le DOM rendu de `<main>`, nettoie les `CodeCard` via des `data-code-block` cachés, puis convertit en Markdown via Turndown dans un `Sheet` shadcn.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui (`Sheet`, `Button` déjà installés), `turndown` (à installer), `lucide-react` (`Bot`)

---

## Fichiers

| Fichier | Action |
|---|---|
| `src/lib/contentMeta.ts` | Modifier — ajouter `CONTENT_COPY_PREFIX` |
| `src/components/page/CopyContextGuard.tsx` | Créer |
| `src/components/page/PromptModeButton.tsx` | Créer |
| `src/components/Cards/CodeCard.tsx` | Modifier — ajouter `<div hidden data-code-block>` |
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Modifier — intégrer les deux composants |

---

## Task 1 : Installer Turndown et ajouter `CONTENT_COPY_PREFIX`

**Files:**
- Modify: `src/lib/contentMeta.ts`

- [ ] **Installer turndown**

```bash
bun add turndown @types/turndown
```

Vérifier que `package.json` contient `"turndown"` dans les dépendances.

- [ ] **Ajouter `CONTENT_COPY_PREFIX` dans `contentMeta.ts`**

Ouvrir `src/lib/contentMeta.ts`. Après le bloc `CONTENT_ICON`, ajouter :

```ts
export const CONTENT_COPY_PREFIX: Partial<Record<ContentKey, string>> = {
    cours: `> **Contexte : Cours**\n> Explique les concepts, donne des exemples, vérifie la compréhension de l'étudiant.\n\n---\n\n`,
    TP: `> **Contexte : TP — exercice pratique**\n> Tu es un professeur. Guide l'étudiant par des questions et stimule sa réflexion. Ne fournis jamais de solution directe ni de code complet.\n\n---\n\n`,
};
```

- [ ] **Vérifier la compilation**

```bash
bun run build 2>&1 | tail -20
```

Attendu : aucune erreur TypeScript.

- [ ] **Commit**

```bash
git add src/lib/contentMeta.ts package.json bun.lockb
git commit -m "feat(prompt-mode): add CONTENT_COPY_PREFIX to contentMeta + install turndown"
```

---

## Task 2 : Créer `CopyContextGuard`

**Files:**
- Create: `src/components/page/CopyContextGuard.tsx`

- [ ] **Créer le fichier**

```tsx
'use client';

import React from 'react';
import { CONTENT_COPY_PREFIX, ContentKey } from '@/lib/contentMeta';

interface CopyContextGuardProps {
    contentType: string;
    children: React.ReactNode;
}

export default function CopyContextGuard({ contentType, children }: CopyContextGuardProps) {
    const prefix = CONTENT_COPY_PREFIX[contentType as ContentKey];
    if (!prefix) return <>{children}</>;

    return (
        <div
            onCopy={(e) => {
                const selected = window.getSelection()?.toString() ?? '';
                if (!selected) return;
                e.preventDefault();
                e.clipboardData.setData('text/plain', prefix + selected);
            }}
        >
            {children}
        </div>
    );
}
```

- [ ] **Vérifier la compilation**

```bash
bun run build 2>&1 | tail -20
```

Attendu : aucune erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/page/CopyContextGuard.tsx
git commit -m "feat(prompt-mode): CopyContextGuard — prefix clipboard selon contentType"
```

---

## Task 3 : Ajouter `data-code-block` dans `CodeCard`

**Files:**
- Modify: `src/components/Cards/CodeCard.tsx`

- [ ] **Ajouter le div caché avant `BaseCard`**

Dans `src/components/Cards/CodeCard.tsx`, trouver le `return` final (ligne ~194) :

```tsx
    return (
        <div className="my-8">
            <BaseCard
```

Remplacer par :

```tsx
    return (
        <div className="my-8">
            <div hidden data-code-block data-code-lang={language}>{children}</div>
            <BaseCard
```

- [ ] **Vérifier la compilation**

```bash
bun run build 2>&1 | tail -20
```

Attendu : aucune erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/Cards/CodeCard.tsx
git commit -m "feat(prompt-mode): CodeCard expose raw code via data-code-block pour extraction DOM"
```

---

## Task 4 : Installer `BotIcon` animé et créer `PromptModeButton`

**Files:**
- Create: `src/components/icons/bot.tsx`
- Create: `src/components/page/PromptModeButton.tsx`

- [ ] **Installer l'icône Bot animée**

```bash
bunx --bun shadcn add "https://lucide-animated.com/r/bot.json"
```

Le fichier est installé dans `src/components/ui/bot.tsx`. Le déplacer :

```bash
mv src/components/ui/bot.tsx src/components/icons/bot.tsx
```

Ouvrir `src/components/icons/bot.tsx` et corriger l'import `cn` si nécessaire (doit pointer vers `@/lib/utils`).

- [ ] **Créer `PromptModeButton.tsx`**

```tsx
'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { CONTENT_COPY_PREFIX } from '@/lib/contentMeta';
import { BotIcon } from '@/components/icons/bot';
import type { BotIconHandle } from '@/components/icons/bot';

interface PromptModeButtonProps {
    modulePath: string;
    sectionTitle: string;
}

type ExtractionState = 'idle' | 'loading' | 'ready';

export default function PromptModeButton({ modulePath, sectionTitle }: PromptModeButtonProps) {
    const botRef = useRef<BotIconHandle>(null);
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<ExtractionState>('idle');
    const [markdown, setMarkdown] = useState('');
    const [copied, setCopied] = useState(false);

    const extractMarkdown = useCallback(async () => {
        setState('loading');

        const main = document.querySelector('main');
        if (!main) {
            setState('idle');
            return;
        }

        const clone = main.cloneNode(true) as HTMLElement;

        // Remplacer chaque CodeCard par un <pre data-lang> propre
        clone.querySelectorAll('[data-code-block]').forEach((codeEl) => {
            const lang = (codeEl as HTMLElement).getAttribute('data-code-lang') ?? '';
            const code = codeEl.textContent ?? '';
            const pre = document.createElement('pre');
            pre.setAttribute('data-lang', lang);
            pre.textContent = code;
            const wrapper = codeEl.parentElement;
            if (wrapper?.parentNode) {
                wrapper.parentNode.replaceChild(pre, wrapper);
            }
        });

        // Supprimer les SVG (icônes Lucide)
        clone.querySelectorAll('svg').forEach((svg) => svg.remove());

        // Import dynamique pour ne pas alourdir le bundle initial
        const TurndownService = (await import('turndown')).default;
        const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

        td.addRule('codeblock', {
            filter: (node) =>
                node.nodeName === 'PRE' && node.hasAttribute('data-lang'),
            replacement: (_content, node) => {
                const lang = node.getAttribute('data-lang') ?? '';
                const code = node.textContent ?? '';
                return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
            },
        });

        setMarkdown(td.turndown(clone.innerHTML));
        setState('ready');
    }, []);

    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (value && state === 'idle') extractMarkdown();
    };

    const handleCopy = async () => {
        const prefix = CONTENT_COPY_PREFIX.cours ?? '';
        await navigator.clipboard.writeText(prefix + markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(true)}
                onMouseEnter={() => botRef.current?.startAnimation()}
                onMouseLeave={() => botRef.current?.stopAnimation()}
                aria-label="Ouvrir en mode prompt"
                className="shrink-0 inline-flex items-center gap-0.5 px-2 sm:px-1.5 h-11 sm:h-7 rounded-md text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark dark:hover:text-bridge-100 hover:bg-bridge-300/40 dark:hover:bg-bridge-700/40"
            >
                <BotIcon ref={botRef} size={16} className="shrink-0" />
                <span className="hidden sm:inline text-sm font-medium">Prompt</span>
            </Button>

            <Sheet open={open} onOpenChange={handleOpenChange}>
                <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col gap-0">
                    <SheetHeader className="pb-4 border-b border-border">
                        <SheetTitle className="flex items-center gap-2 text-base">
                            <BotIcon size={16} />
                            Pour l&apos;IA — {sectionTitle}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 py-4">
                        {state === 'loading' && (
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Génération du Markdown…
                            </p>
                        )}
                        {state === 'ready' && (
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed text-brand-dark dark:text-bridge-100">
                                {markdown}
                            </pre>
                        )}
                    </div>

                    <SheetFooter className="pt-4 border-t border-border">
                        <Button
                            onClick={handleCopy}
                            disabled={state !== 'ready'}
                            style={
                                {
                                    '--module-color': `var(--color-${modulePath})`,
                                } as React.CSSProperties
                            }
                            className="w-full bg-(--module-color) hover:opacity-90 text-white"
                        >
                            {copied ? 'Copié ✓' : "Copier pour l'IA"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
```

- [ ] **Vérifier la compilation**

```bash
bun run build 2>&1 | tail -20
```

Attendu : aucune erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/icons/bot.tsx src/components/page/PromptModeButton.tsx
git commit -m "feat(prompt-mode): BotIcon animé + PromptModeButton — extraction DOM + Turndown + Sheet"
```

---

## Task 5 : Intégrer dans `[contentSlug]/page.tsx`

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

- [ ] **Ajouter les imports en haut du fichier**

Après les imports existants, ajouter :

```tsx
import CopyContextGuard from '@/components/page/CopyContextGuard';
import PromptModeButton from '@/components/page/PromptModeButton';
```

- [ ] **Ajouter `PromptModeButton` dans la sticky nav**

Trouver le bloc (ligne ~140) :

```tsx
            <div className={cn("flex px-1 border-l border-b border-border rounded-bl-xl bg-transparent backdrop-blur-xs", isSplit ? "py-1" : "pt-1 pb-1")}>
                <ContentSidebarNav
                    contents={getContentTypes(currentSection.contents)}
                    currentContent={isSplit ? SPLIT_SLUG : currentContent!}
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                />
            </div>
```

Remplacer par :

```tsx
            <div className={cn("flex items-center px-1 border-l border-b border-border rounded-bl-xl bg-transparent backdrop-blur-xs", isSplit ? "py-1" : "pt-1 pb-1")}>
                <ContentSidebarNav
                    contents={getContentTypes(currentSection.contents)}
                    currentContent={isSplit ? SPLIT_SLUG : currentContent!}
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                />
                {currentContent === 'cours' && !isSplit && (
                    <>
                        <div className="h-4 w-px bg-border mx-0.5 shrink-0" />
                        <PromptModeButton
                            modulePath={currentModule.path}
                            sectionTitle={currentSection.title}
                        />
                    </>
                )}
            </div>
```

- [ ] **Wrapper `CopyContextGuard` autour du contenu du `<main>`**

Trouver le bloc `<main>` (ligne ~172) :

```tsx
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
```

Remplacer par :

```tsx
                    <main
                        className={cn(
                            "w-full max-w-7xl mx-auto px-3 lg:px-4 py-10 lg:py-14",
                            `header-${currentModule.path}`
                        )}
                    >
                        <CopyContextGuard contentType={currentContent ?? ''}>
                            {currentContent === "examen" && currentSection.examenIsLock ? (
                                <ExamenWrapper currentModule={currentModule}>
                                    <ComponentToRender/>
                                </ExamenWrapper>
                            ) : (
                                <ComponentToRender/>
                            )}
                        </CopyContextGuard>
                    </main>
```

- [ ] **Vérifier la compilation complète**

```bash
bun run build 2>&1 | tail -30
```

Attendu : build réussi, aucune erreur TypeScript.

- [ ] **Commit**

```bash
git add src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx
git commit -m "feat(prompt-mode): intégrer CopyContextGuard + PromptModeButton dans la page contenu"
```

---

## Task 6 : Vérification manuelle

- [ ] **Lancer le serveur de dev**

```bash
bun dev
```

- [ ] **Tester `CopyContextGuard` sur une page Cours**

Naviguer vers `/javascript/1-le-dom/cours` (ou n'importe quelle page Cours).
Sélectionner un paragraphe de texte → Ctrl+C → coller dans un éditeur de texte.
Attendu : le texte collé commence par `> **Contexte : Cours**`.

- [ ] **Tester `CopyContextGuard` sur une page TP**

Naviguer vers `/javascript/1-le-dom/TP`.
Sélectionner un paragraphe → Ctrl+C → coller.
Attendu : le texte collé commence par `> **Contexte : TP — exercice pratique**`.

- [ ] **Tester que slide/examen ne sont pas affectés**

Naviguer vers une page Slides ou Examen.
Sélectionner du texte → Ctrl+C → coller.
Attendu : texte brut sans prefix.

- [ ] **Tester le bouton Prompt Mode**

Naviguer vers `/javascript/1-le-dom/cours`.
Vérifier que le bouton `🤖 Prompt` apparaît dans la sticky nav après `|`.
Cliquer → le Sheet s'ouvre avec "Génération du Markdown…" puis le Markdown apparaît.
Vérifier que les blocs de code (`CodeCard`) sont rendus en fenced code blocks Markdown.
Cliquer "Copier pour l'IA" → coller dans un éditeur → vérifier le prefix cours + Markdown.

- [ ] **Vérifier que le bouton n'apparaît pas sur TP/Slides**

Naviguer vers `/javascript/1-le-dom/TP` — pas de bouton `🤖` dans la nav.
Naviguer vers `/javascript/1-le-dom/slide` — pas de bouton `🤖`.

- [ ] **Commit final**

```bash
git push origin staging
```
