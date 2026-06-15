# Prompt Mode & Copy Context Guard

**Date** : 2026-06-15  
**Périmètre** : Pages Cours et TP uniquement  
**Objectif** : Orienter le comportement du LLM quand un étudiant copie du contenu pédagogique

---

## Résumé

Deux features complémentaires activées sur les pages de contenu (`[contentSlug]/page.tsx`) :

1. **Copy Context Guard** — `onCopy` intercepte la sélection et préfixe le clipboard avec un header Markdown qui oriente le LLM (mode explication pour Cours, mode prof socratique pour TP). Transparent : l'étudiant peut supprimer le header, c'est son choix.
2. **Prompt Mode** (`🤖` button, Cours uniquement) — génère le Markdown complet du cours depuis le DOM et l'affiche dans un Sheet shadcn avec copie intégrée.

---

## 1. Copy Context Guard

### Mécanisme

Un composant client `CopyContextGuard` wrape le `<ComponentToRender/>` dans le `<main>`. Il écoute `onCopy`, et si le type de contenu a un prefix configuré, remplace le clipboard par :

```
{prefix Markdown}
{texte sélectionné par l'étudiant}
```

### Switch Cours / TP

Le switch est un record dans `contentMeta.ts`, cohérent avec `CONTENT_LABELS`, `CONTENT_DESC`, `CONTENT_ICON` déjà en place :

```ts
// src/lib/contentMeta.ts
export const CONTENT_COPY_PREFIX: Partial<Record<ContentKey, string>> = {
    cours: `> **Contexte : Cours**\n> Explique les concepts, donne des exemples, vérifie la compréhension de l'étudiant.\n\n---\n\n`,
    TP: `> **Contexte : TP — exercice pratique**\n> Tu es un professeur. Guide l'étudiant par des questions et stimule sa réflexion. Ne fournis jamais de solution directe ni de code complet.\n\n---\n\n`,
};
```

`slide`, `projet`, `examen` → `undefined` → aucune modification du clipboard.

### Implémentation

```tsx
// src/components/page/CopyContextGuard.tsx
'use client';

import { CONTENT_COPY_PREFIX, ContentKey } from '@/lib/contentMeta';

interface Props {
    contentType: string;
    children: React.ReactNode;
}

export default function CopyContextGuard({ contentType, children }: Props) {
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

### Intégration dans la page

```tsx
// src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx
<main ...>
    <CopyContextGuard contentType={currentContent ?? ''}>
        {currentContent === 'examen' && currentSection.examenIsLock ? (
            <ExamenWrapper ...><ComponentToRender /></ExamenWrapper>
        ) : (
            <ComponentToRender />
        )}
    </CopyContextGuard>
</main>
```

---

## 2. Prompt Mode (Cours uniquement)

### Objectif

Générer le Markdown complet du Cours et l'afficher dans un Sheet pour que l'étudiant puisse le copier vers un LLM afin de comprendre les concepts — pas faire le TP.

### Bouton dans la sticky nav

```
[ Cours ][ TP ][ Côte à côte ]   |   🤖
```

Même séparateur `|` que celui avant "Slides". Icône `Bot` de lucide. Uniquement rendu quand `currentContent === 'cours'`.

```tsx
// src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx
<div className="flex sticky top-(--navbar-h) z-[25] w-full justify-end">
    <div className={cn("flex px-1 border-l border-b border-border rounded-bl-xl ...")}>
        <ContentSidebarNav ... />
        {currentContent === 'cours' && (
            <>
                <div className="h-4 w-px bg-border mx-0.5 shrink-0 self-center" />
                <PromptModeButton modulePath={currentModule.path} sectionTitle={currentSection.title} />
            </>
        )}
    </div>
</div>
```

### Extraction DOM → Markdown

`PromptModeButton` est un composant client. Au clic :

1. Clone `document.querySelector('main')` (le DOM déjà rendu côté client)
2. Pour chaque `[data-code-block]` trouvé :
   - Lit `data-code-lang` et `textContent` (le code brut)
   - Crée un `<pre data-lang="...">` propre
   - Remplace le parent `.my-8` (wrapper CodeCard) par ce `<pre>`
3. Supprime les SVG du clone
4. Passe `clone.innerHTML` à Turndown avec règle custom `pre[data-lang]` → fenced code block
5. Affiche le Markdown dans le Sheet

### Modification CodeCard

`CodeCard` ajoute un élément `hidden` avec le code brut, avant le `BaseCard` :

```tsx
// src/components/Cards/CodeCard.tsx
return (
    <div className="my-8">
        <div hidden data-code-block data-code-lang={language}>{children}</div>
        <BaseCard ... />
    </div>
);
```

### Sheet

Sheet shadcn depuis la droite :
- **Header** : "Pour l'IA" + icône `Bot`
- **Body** : `<pre>` scrollable avec le Markdown. État `idle | loading | ready`.
- **Footer** : bouton "Copier" avec état "Copié ✓" pendant 2 s. Le bouton copie `CONTENT_COPY_PREFIX.cours + markdown` via `navigator.clipboard.writeText()` — pas via un `onCopy` event (le Sheet est un portal hors du `CopyContextGuard`).

### Dépendance

`turndown` + `@types/turndown` — ~15 kB, import dynamique (`import('turndown')`) pour ne pas alourdir le bundle initial.

---

## 3. Fichiers

| Fichier | Action |
|---|---|
| `src/lib/contentMeta.ts` | Ajouter `CONTENT_COPY_PREFIX` |
| `src/components/page/CopyContextGuard.tsx` | **Nouveau** |
| `src/components/page/PromptModeButton.tsx` | **Nouveau** |
| `src/components/Cards/CodeCard.tsx` | Ajouter `<div hidden data-code-block>` |
| `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` | Intégrer `CopyContextGuard` + `PromptModeButton` |

**Dépendance** : `bun add turndown @types/turndown`

---

## 4. Ce qui n'est pas dans le périmètre

- Mode split (Cours + TP côte à côte) : `CopyContextGuard` non appliqué sur les `SplitPane`
- Slides : aucune modification
- Examen / Projet : `CONTENT_COPY_PREFIX` ne couvre pas ces types → comportement natif du navigateur
- Persistance côté serveur : aucune log des copies
