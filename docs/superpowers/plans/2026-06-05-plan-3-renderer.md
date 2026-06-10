# Cours Builder — Plan 3 : Renderer + Fallback

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer `BlockRenderer.tsx` (rendu de production des blocs DB) et mettre à jour `getContentComponent.ts` pour fallback DB → fichier.

**Architecture:** `BlockRenderer` regroupe les blocs `colSpan: "half"` consécutifs en grille CSS. Pour `named-component`, il résout le composant depuis `namedComponents.ts`. `getContentComponent` vérifie d'abord `source === "db"` (lit `course_content` via `getContentBlocks`), sinon fallback sur le système de fichiers existant.

**Tech Stack:** React Server Component, Next.js `unstable_cache` (via `getContentBlocks`).

**Prérequis :** Plans 1 et 2 complétés (`blockRegistry`, `namedComponents`, `getContentBlocks` disponibles).

---

### Task 1 : `BlockRenderer.tsx`

**Files:**
- Create: `src/components/builder/BlockRenderer.tsx`

- [ ] **Créer le dossier**

```bash
mkdir -p src/components/builder
```

- [ ] **Créer `src/components/builder/BlockRenderer.tsx`**

```typescript
import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { getNamedComponent } from "@/lib/namedComponents";

// Regroupe les blocs consécutifs colSpan "half" en sous-tableaux
function groupByColSpan(blocks: Block[]): Block[][] {
    const groups: Block[][] = [];
    let i = 0;

    while (i < blocks.length) {
        const block = blocks[i];
        if (block.colSpan === "half" && blocks[i + 1]?.colSpan === "half") {
            groups.push([block, blocks[i + 1]]);
            i += 2;
        } else {
            groups.push([block]);
            i += 1;
        }
    }

    return groups;
}

function BlockItem({ block }: { block: Block }) {
    // Cas spécial : named-component résout depuis le registre des interactifs
    if (block.type === "named-component") {
        const name = String(block.props?.name ?? "");
        const Component = getNamedComponent(name);
        if (!Component) {
            return (
                <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">
                    ⚡ Composant introuvable : {name}
                </div>
            );
        }
        return <Component />;
    }

    const def = getBlockDefinition(block.type);
    if (!def) {
        return (
            <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">
                Bloc inconnu : {block.type}
            </div>
        );
    }

    const Render = def.render;
    return <Render {...block.props} />;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    const groups = groupByColSpan(blocks);

    return (
        <article>
            {groups.map((group, groupIndex) =>
                group.length === 1 ? (
                    <BlockItem key={group[0].id} block={group[0]} />
                ) : (
                    <div
                        key={`group-${groupIndex}`}
                        className="grid grid-cols-2 gap-4"
                    >
                        {group.map((b) => (
                            <BlockItem key={b.id} block={b} />
                        ))}
                    </div>
                )
            )}
        </article>
    );
}
```

- [ ] **Vérifier**

```bash
bun run lint
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/builder/BlockRenderer.tsx
git commit -m "feat(builder): add BlockRenderer with colSpan grouping"
```

---

### Task 2 : Mise à jour de `getContentComponent.ts`

**Files:**
- Modify: `src/lib/getContentComponent.ts`

L'objectif est d'ajouter le fallback DB → fichier. Si `ContentRef.source === "db"`, charger depuis `course_content` et retourner un composant qui rend `BlockRenderer`. Sinon, utiliser `contentImports` comme avant.

- [ ] **Remplacer `src/lib/getContentComponent.ts`**

```typescript
import { contentImports } from "@/lib/contentImports";
import { notFound } from "next/navigation";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import { getContentRef } from "@/types/CourseContent";
import { getContentBlocks } from "@/lib/getContentBlocks";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import React from "react";

interface GetContentComponentArgs {
    currentModule: Module;
    currentSection: Section;
    currentContent: string;
}

export async function getContentComponent({
    currentModule,
    currentSection,
    currentContent,
}: GetContentComponentArgs) {
    const ref = getContentRef(currentSection.contents, currentContent);

    if (!ref) notFound();

    // Chemin DB : charger les blocs depuis course_content
    if (ref.source === "db") {
        const doc = await getContentBlocks(
            currentModule.path,
            currentSection.path,
            currentContent
        );

        if (!doc) notFound();

        const blocks = doc.blocks;
        // Retourner un composant fonctionnel qui rend les blocs
        return function DbContent() {
            return React.createElement(BlockRenderer, { blocks });
        };
    }

    // Chemin fichier : fallback sur contentImports.ts (système existant)
    const componentKey =
        currentContent.charAt(0).toUpperCase() + currentContent.slice(1);

    const importFunc =
        contentImports?.[currentModule.path]?.[currentSection.path]?.[componentKey];

    if (typeof importFunc !== "function") {
        notFound();
    }

    const Component = (await importFunc()).default;

    if (!Component) notFound();

    return Component;
}
```

- [ ] **Vérifier**

```bash
bun run lint
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/lib/getContentComponent.ts
git commit -m "feat(builder): add DB fallback in getContentComponent"
```

---

### Task 3 : Vérification du rendu

- [ ] **Build complet**

```bash
bun run build
```
Attendu : build réussi, 0 erreur TypeScript.

- [ ] **Test manuel fichier** : démarrer `bun dev`, naviguer vers `/javascript/1-le-dom/cours` — le cours `.tsx` existant doit s'afficher normalement (chemin `source: "file"`).

- [ ] **Test manuel DB** : via le terminal, insérer un document de test dans `course_content` :

```bash
bun run tsx -e "
import { connectToDB } from '@/lib/mongodb';
const db = await connectToDB();
await db.collection('course_content').insertOne({
  moduleSlug: 'javascript',
  sectionSlug: '1-le-dom',
  contentType: 'cours',
  blocks: [
    { id: 'test-1', type: 'heading', props: { level: 2, text: 'Test DB render' }, colSpan: 'full' },
    { id: 'test-2', type: 'text', props: { content: 'Ce contenu vient de MongoDB.', strong: [] }, colSpan: 'full' },
  ],
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Mettre à jour la ref dans modules
await db.collection('modules').updateOne(
  { path: 'javascript' },
  {
    \$set: {
      'sections.\$[s].contents.\$[c].source': 'db',
      'sections.\$[s].contents.\$[c].contentId': 'test',
    }
  },
  { arrayFilters: [{ 's.path': '1-le-dom' }, { 'c.type': 'cours' }] }
);
console.log('Inséré.');
process.exit(0);
"
```

Naviguer vers `/javascript/1-le-dom/cours` — doit afficher "Test DB render" et le paragraphe DB.

- [ ] **Nettoyer le test** : après vérification, supprimer le document de test et repasser `source: "file"` via :

```bash
bun run tsx src/scripts/migrate-contents-refs.ts
```

> La migration est idempotente — les documents existants en `source: "file"` ne bougent pas. Pour supprimer le document test DB : utiliser `db.collection('course_content').deleteOne({ moduleSlug: 'javascript', sectionSlug: '1-le-dom', contentType: 'cours' })` dans un script.
