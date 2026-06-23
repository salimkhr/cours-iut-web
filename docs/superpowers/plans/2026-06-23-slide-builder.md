# Slide Builder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre la création et l'édition de slides pédagogiques depuis l'admin builder et le MCP, avec stockage en MongoDB, en ajoutant 6 types de blocs `slide-*` dédiés et un `SlideBlocksRenderer` côté rendu.

**Architecture:** Types de blocs dédiés (`slide`, `slide-text`, `slide-code`, `slide-list`, `slide-list-item`, `slide-note`) stockés dans `course_content` comme les cours/TP. La page `/[module]/[section]/slide` branche sur `SlideBlocksRenderer` quand `source === "db"`, laissant les `Slide.tsx` existants intacts. Le builder admin existant fonctionne sans modification (il charge l'URL slide en iframe).

**Tech Stack:** Next.js 16 App Router, TypeScript strict, MongoDB driver, Zod, `blockDefs.ts` + `blockRegistry.tsx` pattern existant, composants `SlideScreen`/`SlideText`/`SlideCode`/`SlideList`/`SlideNote` existants.

---

## Fichiers modifiés / créés

| Fichier | Action |
|---|---|
| `src/types/CourseContent.ts` | Modifier — ajouter `"slide"` au type union `contentType` |
| `src/lib/blockSchemas.ts` | Modifier — schémas Zod + règles conteneur `slide-*` |
| `src/lib/blockDefs.ts` | Modifier — 6 nouvelles defs + catégorie `"Slides"` |
| `src/lib/blockRegistry.tsx` | Modifier — icons + renders pour `slide-*` |
| `src/components/Slides/SlideBlocksRenderer.tsx` | **Créer** — rend `Block[]` → `SlidesScreen` |
| `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx` | Modifier — branch DB + `EditContentFab` |
| `src/app/api/mcp/route.ts` | Modifier — ajouter `"slide"` au `CONTENT_TYPE` enum |
| `src/components/builder/BuilderPage.tsx` | Modifier — ajouter prop `deckMode?: boolean` (inutilisé, prépare l'Approche 2) |

---

## Task 1 : Système de types — `CourseContent.ts` + `blockSchemas.ts`

**Files:**
- Modify: `src/types/CourseContent.ts` (ligne 20)
- Modify: `src/lib/blockSchemas.ts` (lignes 32-87 pour les schémas, lignes 96-103 pour les règles)

### Étape 1.1 — Ajouter `"slide"` au type union `contentType`

Dans `src/types/CourseContent.ts`, remplacer :
```ts
contentType: "cours" | "TP" | "examen";
```
par :
```ts
contentType: "cours" | "TP" | "examen" | "slide";
```

### Étape 1.2 — Ajouter les schémas de props `slide-*` dans `blockPropsSchemas`

Dans `src/lib/blockSchemas.ts`, ajouter à la fin de l'objet `blockPropsSchemas` (après `"section-card"`) :

```ts
    "slide": z.object({ title: z.string() }),
    "slide-text": z.object({ content: z.string() }),
    "slide-code": z.object({
        language: z.string(),
        code: z.string(),
        highlight: z.string().optional(),
    }),
    "slide-list": z.object({ ordered: z.boolean() }),
    "slide-list-item": z.object({ text: z.string() }),
    "slide-note": z.object({ content: z.string() }),
```

### Étape 1.3 — Ajouter les règles conteneur `slide-*`

Dans `src/lib/blockSchemas.ts`, ajouter à la fin de l'objet `containerRules` (après `"section"`) :

```ts
    "slide": {
        allowedChildren: ["slide-text", "slide-code", "slide-list", "slide-note", "columns"],
        allowedParents: [null],
    },
    "slide-list": {
        allowedChildren: ["slide-list-item"],
    },
    "slide-list-item": {
        allowedChildren: "any",
        allowedParents: ["slide-list"],
    },
```

Et modifier la règle existante `"column"` pour qu'elle accepte aussi les types slide à l'intérieur. Remplacer :
```ts
    "column": { allowedChildren: "any", allowedParents: ["columns"] },
```
par (inchangé — `"any"` couvre déjà tous les types, y compris slide-*) :
```ts
    "column": { allowedChildren: "any", allowedParents: ["columns"] },
```
Aucune modification nécessaire ici : `"any"` signifie déjà tout type.

### Étape 1.4 — Vérifier le lint

```bash
cd C:\Users\Utilisateur\PhpstormProjects\cours-iut-web
bun run lint
```
Attendu : aucune erreur TypeScript ni ESLint.

### Étape 1.5 — Commit

```bash
git add src/types/CourseContent.ts src/lib/blockSchemas.ts
git commit -m "feat(slide-builder): type union slide + schémas blockSchemas"
```

---

## Task 2 : Définitions de blocs — `blockDefs.ts`

**Files:**
- Modify: `src/lib/blockDefs.ts`

### Étape 2.1 — Ajouter la catégorie `"Slides"` au type `BlockCategory`

Dans `src/lib/blockDefs.ts`, remplacer :
```ts
export type BlockCategory = "Contenu" | "Structure" | "Listes" | "Code" | "Médias" | "Composants";
```
par :
```ts
export type BlockCategory = "Contenu" | "Structure" | "Listes" | "Code" | "Médias" | "Composants" | "Slides";
```

### Étape 2.2 — Ajouter les 6 définitions de blocs slide-*

Dans `src/lib/blockDefs.ts`, ajouter à la fin du tableau `blockDefs` (avant la ligne `];`) :

```ts
    {
        type: "slide",
        label: "Slide",
        category: "Slides",
        description: "Un écran de présentation (titre + contenu). Conteneur direct des blocs slide-*. Chaque bloc `slide` = une diapositive dans le player.",
        defaultProps: { title: "" },
        schema: z.object({ title: z.string() }),
        fields: [
            { key: "title", label: "Titre de la slide", type: "text", placeholder: "A — Introduction" },
        ],
        container: containerRules["slide"],
        initialChildren: () => [
            { id: uuidv4(), type: "slide-text", props: { content: "" }, children: [] },
        ],
        inlineEditField: "title",
    },
    {
        type: "slide-text",
        label: "Texte slide",
        category: "Slides",
        description: "Paragraphe de texte dans une slide. Accepte le markdown inline (**gras**, _italique_, `code`, [lien](url)).",
        defaultProps: { content: "" },
        schema: z.object({ content: z.string() }),
        fields: [
            {
                key: "content",
                label: "Contenu",
                type: "textarea",
                inlineMarkdown: true,
                placeholder: "Texte de la slide (markdown inline accepté)",
            },
        ],
        inlineEditField: "content",
    },
    {
        type: "slide-code",
        label: "Code slide",
        category: "Slides",
        description: "Bloc de code dans une slide. `highlight` = étapes d'animation séparées par `|` (ex: \"1-3 | 5-7 | 9\"). Chaque groupe s'affiche à l'appui sur →.",
        defaultProps: { language: "javascript", code: "", highlight: "" },
        schema: z.object({
            language: z.string(),
            code: z.string(),
            highlight: z.string().optional(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["javascript", "typescript", "html", "css", "php", "sql", "json", "bash", "jsx", "tsx"] },
            { key: "code", label: "Code", type: "textarea", placeholder: "const x = 42;" },
            { key: "highlight", label: "Étapes (highlight)", type: "text", placeholder: "1-3 | 5-7 | 9" },
        ],
    },
    {
        type: "slide-list",
        label: "Liste slide",
        category: "Slides",
        description: "Liste à puces ou numérotée dans une slide. Ne contient QUE des blocs `slide-list-item`.",
        defaultProps: { ordered: false },
        schema: z.object({ ordered: z.boolean() }),
        fields: [
            { key: "ordered", label: "Numérotée", type: "boolean" },
        ],
        container: containerRules["slide-list"],
        initialChildren: () => [
            { id: uuidv4(), type: "slide-list-item", props: { text: "" }, children: [] },
        ],
    },
    {
        type: "slide-list-item",
        label: "Élément liste slide",
        category: "Slides",
        description: "Un élément d'une liste de slide (markdown inline dans `text`). Doit être enfant direct d'un `slide-list`.",
        defaultProps: { text: "" },
        schema: z.object({ text: z.string() }),
        fields: [
            { key: "text", label: "Texte", type: "text", inlineMarkdown: true },
        ],
        container: containerRules["slide-list-item"],
        inlineEditField: "text",
    },
    {
        type: "slide-note",
        label: "Note présentateur",
        category: "Slides",
        description: "Note visible uniquement dans le panneau notes du player (touche N). Invisible dans la slide affichée aux étudiants.",
        defaultProps: { content: "" },
        schema: z.object({ content: z.string() }),
        fields: [
            { key: "content", label: "Note", type: "textarea", placeholder: "Points à aborder oralement..." },
        ],
        inlineEditField: "content",
    },
```

### Étape 2.3 — Lint

```bash
bun run lint
```
Attendu : aucune erreur. Si TypeScript signale que `containerRules["slide"]` ou `containerRules["slide-list"]` est `undefined`, c'est que Task 1 n'a pas ajouté ces clés — vérifier l'étape 1.3.

### Étape 2.4 — Commit

```bash
git add src/lib/blockDefs.ts
git commit -m "feat(slide-builder): 6 blockDefs slide-* + catégorie Slides"
```

---

## Task 3 : Registry client — `blockRegistry.tsx`

**Files:**
- Modify: `src/lib/blockRegistry.tsx`

### Étape 3.1 — Ajouter les imports nécessaires

Dans `src/lib/blockRegistry.tsx`, dans le bloc d'imports lucide-react existant (ligne ~16), ajouter :
```ts
    Monitor, StickyNote, Play,
```
(Monitor → slide, StickyNote → slide-note, Play → slide-list. Si ces icônes n'existent pas dans la version installée, utiliser `Presentation`, `FileText`, `List as ListIcon2` respectivement.)

Dans le même fichier, ajouter les imports des composants Slide :
```ts
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { renderInline } from "@/lib/inlineMarkdown";
```

Note : ne pas importer `SlideScreen` ici — le render de `slide` dans le registry est un placeholder (le vrai rendu est dans `SlideBlocksRenderer`).

### Étape 3.2 — Ajouter les `clientParts` pour `slide-*`

Dans `src/lib/blockRegistry.tsx`, dans l'objet `clientParts`, ajouter à la fin (après `"divider"`) :

```ts
    "slide": {
        icon: Monitor,
        render: ({ title, children }: BlockRenderProps) => (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">
                    Slide — {String(title ?? "")}
                </p>
                <div className="space-y-3">{children}</div>
            </div>
        ),
    },
    "slide-text": {
        icon: AlignLeft,
        render: ({ content }: BlockRenderProps) => (
            <SlideText>{renderInline(String(content ?? ""))}</SlideText>
        ),
    },
    "slide-code": {
        icon: Code,
        render: ({ language, code, highlight }: BlockRenderProps) => (
            <SlideCode
                language={String(language ?? "javascript")}
                highlight={highlight ? String(highlight) : undefined}
            >
                {String(code ?? "")}
            </SlideCode>
        ),
    },
    "slide-list": {
        icon: ListIcon,
        render: ({ ordered, children }: BlockRenderProps) => (
            <SlideList ordered={Boolean(ordered)}>{children}</SlideList>
        ),
    },
    "slide-list-item": {
        icon: Dot,
        render: ({ text }: BlockRenderProps) => (
            <SlideListItem>{renderInline(String(text ?? ""))}</SlideListItem>
        ),
    },
    "slide-note": {
        icon: StickyNote,
        render: ({ content }: BlockRenderProps) => (
            <SlideNote>{String(content ?? "")}</SlideNote>
        ),
    },
```

### Étape 3.3 — Lint

```bash
bun run lint
```
Si TypeScript signale une erreur sur `Monitor` ou `StickyNote` (icônes inconnues), remplacer par `Presentation` et `FileText` respectivement — ces noms varient selon la version de lucide-react installée. Vérifier avec :
```bash
grep -r "\"Monitor\"" node_modules/lucide-react/dist/lucide-react.js | head -1
```

### Étape 3.4 — Commit

```bash
git add src/lib/blockRegistry.tsx
git commit -m "feat(slide-builder): clientParts slide-* dans blockRegistry"
```

---

## Task 4 : SlideBlocksRenderer

**Files:**
- Create: `src/components/Slides/SlideBlocksRenderer.tsx`

### Étape 4.1 — Créer `SlideBlocksRenderer.tsx`

Créer `src/components/Slides/SlideBlocksRenderer.tsx` avec le contenu suivant :

```tsx
import React from "react";
import type { Block } from "@/types/CourseContent";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import { SlidesScreen } from "@/components/Slides/SlidesScreen";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import { renderInline } from "@/lib/inlineMarkdown";

interface SlideBlocksRendererProps {
    blocks: Block[];
    module: Module;
    section: Section;
}

export function SlideBlocksRenderer({ blocks, module, section }: SlideBlocksRendererProps) {
    const slideBlocks = blocks.filter((b) => b.type === "slide");

    return (
        <SlidesScreen module={module} section={section}>
            {slideBlocks.map((slide) => (
                <SlideScreen key={slide.id} title={String(slide.props.title ?? "")}>
                    {(slide.children ?? []).map((child) => (
                        <SlideBlockItem key={child.id} block={child} />
                    ))}
                </SlideScreen>
            ))}
        </SlidesScreen>
    );
}

function SlideBlockItem({ block }: { block: Block }) {
    switch (block.type) {
        case "slide-text":
            return (
                <SlideText>
                    {renderInline(String(block.props.content ?? ""))}
                </SlideText>
            );
        case "slide-code":
            return (
                <SlideCode
                    language={String(block.props.language ?? "javascript")}
                    highlight={block.props.highlight ? String(block.props.highlight) : undefined}
                >
                    {String(block.props.code ?? "")}
                </SlideCode>
            );
        case "slide-list":
            return (
                <SlideList ordered={Boolean(block.props.ordered)}>
                    {(block.children ?? []).map((item) => (
                        <SlideListItem key={item.id}>
                            {renderInline(String(item.props.text ?? ""))}
                        </SlideListItem>
                    ))}
                </SlideList>
            );
        case "slide-note":
            return <SlideNote>{String(block.props.content ?? "")}</SlideNote>;
        case "columns":
            return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {(block.children ?? []).map((col) => (
                        <div
                            key={col.id}
                            className={`${COL_SPAN_CLASS[Number(col.props.span)] ?? "md:col-span-6"} flex flex-col gap-4 min-w-0`}
                        >
                            {(col.children ?? []).map((inner) => (
                                <SlideBlockItem key={inner.id} block={inner} />
                            ))}
                        </div>
                    ))}
                </div>
            );
        default:
            return null;
    }
}
```

### Étape 4.2 — Lint

```bash
bun run lint
```
Attendu : aucune erreur. Si TypeScript signale que `SlidesScreen` n'accepte pas `module`/`section` (props optionnelles dans la définition actuelle), vérifier la signature dans `src/components/Slides/SlidesScreen.tsx` — les deux props sont déjà marquées `module?: Module` et `section?: Section`, donc les passer en non-optionnel est compatible.

### Étape 4.3 — Commit

```bash
git add src/components/Slides/SlideBlocksRenderer.tsx
git commit -m "feat(slide-builder): SlideBlocksRenderer — Block[] → SlidesScreen"
```

---

## Task 5 : Page slide — branch DB

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx`

### Étape 5.1 — Réécrire la page slide pour supporter `source: "db"`

Remplacer le contenu entier de `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx` par :

```tsx
import { contentImports } from "@/lib/contentImports";
import { notFound } from "next/navigation";
import { getModuleData } from "@/hook/getModuleData";
import { generatePageMetadata } from "@/lib/generatePageMetadata";
import { getContentRef } from "@/types/CourseContent";
import { getContentBlocks } from "@/lib/getContentBlocks";
import { SlideBlocksRenderer } from "@/components/Slides/SlideBlocksRenderer";
import { getServerSession } from "@/lib/auth";
import EditContentFab from "@/components/admin/EditContentFab";

interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateMetadata({ params }: ContentPageProps) {
    const { moduleSlug, sectionSlug } = await params;
    const { currentModule, currentSection } = await getModuleData({ moduleSlug, sectionSlug });
    return currentSection !== null ? generatePageMetadata({ currentModule, currentSection }) : {};
}

export default async function Content({ params }: ContentPageProps) {
    const { moduleSlug, sectionSlug } = await params;
    const { currentModule, currentSection } = await getModuleData({ moduleSlug, sectionSlug });

    if (!currentSection) notFound();
    if (currentSection.isAvailable === false) notFound();

    const session = await getServerSession();
    const isAdmin = session?.user.role === "admin";

    const ref = getContentRef(currentSection.contents, "slide");

    // Branche DB
    if (ref?.source === "db") {
        const doc = await getContentBlocks(moduleSlug, sectionSlug, "slide");
        if (!doc) notFound();

        return (
            <div className={`header-${currentModule.path}`}>
                <SlideBlocksRenderer
                    blocks={doc.blocks}
                    module={currentModule}
                    section={currentSection}
                />
                {isAdmin && (
                    <EditContentFab
                        moduleSlug={moduleSlug}
                        sectionSlug={sectionSlug}
                        contentType="slide"
                        modulePath={currentModule.path}
                    />
                )}
            </div>
        );
    }

    // Branche FILE (comportement existant, inchangé)
    const importFunc = contentImports?.[moduleSlug]?.[sectionSlug]?.["Slide"];
    if (!importFunc) notFound();

    const ComponentToRender = (await importFunc()).default;
    if (!ComponentToRender) notFound();

    return (
        <div className={`header-${currentModule.path}`}>
            <ComponentToRender />
            {isAdmin && (
                <EditContentFab
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                    contentType="slide"
                    modulePath={currentModule.path}
                />
            )}
        </div>
    );
}
```

### Étape 5.2 — Lint

```bash
bun run lint
```
Attendu : aucune erreur. `currentSection` (type `Section | null`) est maintenant vérifié via `if (!currentSection) notFound()` donc TypeScript ne signale plus d'ambiguïté.

### Étape 5.3 — Commit

```bash
git add src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx
git commit -m "feat(slide-builder): page slide — branch source:db + EditContentFab admin"
```

---

## Task 6 : MCP + BuilderPage prep

**Files:**
- Modify: `src/app/api/mcp/route.ts` (ligne 27)
- Modify: `src/components/builder/BuilderPage.tsx` (interface `BuilderPageProps`)

### Étape 6.1 — Ajouter `"slide"` au `CONTENT_TYPE` enum du MCP

Dans `src/app/api/mcp/route.ts`, à la ligne 27, remplacer :
```ts
const CONTENT_TYPE = z.enum(["cours", "TP", "examen"]);
```
par :
```ts
const CONTENT_TYPE = z.enum(["cours", "TP", "examen", "slide"]);
```

Également mettre à jour les descriptions des outils MCP qui mentionnent "cours, TP ou examen" pour inclure "slide". Chercher dans le fichier :
```bash
grep -n "cours, TP ou examen\|cours | TP | examen" src/app/api/mcp/route.ts
```
Et remplacer chaque occurrence par `"cours | TP | examen | slide"`.

### Étape 6.2 — Ajouter `deckMode` à `BuilderPageProps`

Dans `src/components/builder/BuilderPage.tsx`, dans l'interface `BuilderPageProps` (ligne ~38), ajouter :
```ts
    /** Prépare l'Approche 2 (panneau deck slide). Non utilisé pour l'instant. */
    deckMode?: boolean;
```

### Étape 6.3 — Lint

```bash
bun run lint
```

### Étape 6.4 — Build complet

```bash
bun run build
```
Attendu : build réussi sans erreur TypeScript. Les warnings de taille de bundle sont normaux.

### Étape 6.5 — Commit

```bash
git add src/app/api/mcp/route.ts src/components/builder/BuilderPage.tsx
git commit -m "feat(slide-builder): MCP CONTENT_TYPE + BuilderPage deckMode prep"
```

---

## Task 7 : Vérification manuelle

**Files:** Aucun fichier modifié — vérification uniquement.

### Étape 7.1 — Lancer le serveur de dev

```bash
bun dev
```

### Étape 7.2 — Créer une slide de test en DB via le builder admin

1. Ouvrir `http://localhost:3000/admin/content/javascript/1-le-dom/slide`
2. Le builder s'ouvre (panneau arbre à gauche, preview en iframe à droite)
3. Cliquer "Ajouter un bloc" → vérifier que la catégorie **Slides** apparaît avec `slide`, `slide-text`, `slide-code`, `slide-list`, `slide-note`
4. Insérer 2 blocs `slide` :
   - Slide 1 : titre "Introduction", enfant `slide-text` content "JavaScript est un langage…"
   - Slide 2 : titre "A — Variables", enfant `slide-code` language="javascript", code="const x = 42;", highlight="1"
5. Cliquer **Passer en DB** (si source="file") pour basculer la référence
6. Sauvegarder (Ctrl+S)

### Étape 7.3 — Vérifier le rendu

1. Ouvrir `http://localhost:3000/javascript/1-le-dom/slide`
2. Vérifier :
   - [ ] La slide titre apparaît (générée par `SlidesScreen` quand `module` et `section` sont fournis)
   - [ ] La navigation ← → fonctionne entre les slides
   - [ ] La slide 1 affiche le `SlideText`
   - [ ] La slide 2 affiche le `SlideCode` avec la ligne 1 surlignée
   - [ ] Le `EditContentFab` (crayon flottant) est visible en tant qu'admin
3. Ajouter un bloc `slide-note` sur la slide 1, sauvegarder, puis appuyer sur **N** dans le player → vérifier que la note apparaît dans le panneau notes

### Étape 7.4 — Vérifier la régression des fichiers TSX existants

Ouvrir `http://localhost:3000/javascript/2-les-evenements/slide` — cette section n'a pas de source DB (ref.source === "file"). Vérifier :
- [ ] La slide TSX existante se rend normalement (pas de régression)

### Étape 7.5 — Commit final si tout est vert

```bash
git add -A
git commit -m "chore(slide-builder): vérification manuelle OK"
```

---

## Résumé des commits attendus

1. `feat(slide-builder): type union slide + schémas blockSchemas`
2. `feat(slide-builder): 6 blockDefs slide-* + catégorie Slides`
3. `feat(slide-builder): clientParts slide-* dans blockRegistry`
4. `feat(slide-builder): SlideBlocksRenderer — Block[] → SlidesScreen`
5. `feat(slide-builder): page slide — branch source:db + EditContentFab admin`
6. `feat(slide-builder): MCP CONTENT_TYPE + BuilderPage deckMode prep`

## Points d'attention pour l'implémenteur

- **`renderInline`** retourne `React.ReactNode[]` — peut être passé directement comme `children` à `SlideText` et `SlideListItem`.
- **`SlideNote` rend `null`** — c'est normal, les notes sont lues par `useSlideNotes` via `React.Children.toArray`. La passer comme enfant de `SlideScreen` suffit.
- **`SlidesScreen` injecte automatiquement une slide de titre** quand `module` et `section` sont fournis — la première slide visible est donc auto-générée, les blocs `slide` en DB sont les slides suivantes.
- **Ne pas modifier** `SlidesScreen`, `SlideScreen`, `SlideCode`, `SlideText`, `SlideList`, `SlideNote` — ils sont réutilisés tels quels.
- **Le builder admin existant** (`/admin/content/[module]/[section]/slide`) fonctionne sans modification — la page `ContentBuilderPage` accepte n'importe quel `contentType`.
