# Cours Builder — Plan 1 : Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Définir tous les types TypeScript, le registre de blocs, la map des composants interactifs, et migrer les données MongoDB existantes de `string[]` vers `ContentRef[]`.

**Architecture:** On crée les fondations sans toucher au rendu ni aux routes. `ContentRef` remplace `string` dans `Section.contents`. Des helpers `getContentTypes()` / `hasContentType()` permettent de mettre à jour les appelants sans réécrire les composants UI. Un script one-shot migre les documents MongoDB existants.

**Tech Stack:** TypeScript strict, Zod, MongoDB driver, `bun run tsx` pour le script de migration.

---

### Task 1 : Types `Block`, `ContentRef`, `CourseContent`

**Files:**
- Create: `src/types/CourseContent.ts`

- [ ] **Créer `src/types/CourseContent.ts`**

```typescript
import { ObjectId } from "bson";

export type ContentRef =
    | { type: string; source: "file" }
    | { type: string; source: "db"; contentId: string };

export interface Block {
    id: string;
    type: string;
    props: Record<string, unknown>;
    colSpan?: "full" | "half";
}

export interface CourseContent {
    _id?: ObjectId | string;
    moduleSlug: string;
    sectionSlug: string;
    contentType: "cours" | "TP" | "examen";
    blocks: Block[];
    version: number;
    createdAt: Date;
    updatedAt: Date;
}

export function getContentTypes(contents: ContentRef[]): string[] {
    return contents.map(c => c.type);
}

export function hasContentType(contents: ContentRef[], type: string): boolean {
    return contents.some(c => c.type === type);
}

export function getContentRef(contents: ContentRef[], type: string): ContentRef | undefined {
    return contents.find(c => c.type === type);
}
```

- [ ] **Vérifier la compilation**

```bash
bun run lint
```
Attendu : aucune erreur sur `src/types/CourseContent.ts`.

- [ ] **Commit**

```bash
git add src/types/CourseContent.ts
git commit -m "feat(builder): add Block, ContentRef, CourseContent types"
```

---

### Task 2 : Mettre à jour `Section.contents`

**Files:**
- Modify: `src/types/Section.ts`

- [ ] **Modifier `src/types/Section.ts`**

Remplacer `contents: string[]` par `contents: ContentRef[]` :

```typescript
import {ObjectId} from "bson";
import Instructor from "@/types/Instructor";
import Coefficient from "@/types/Coefficient";
import { ContentRef } from "@/types/CourseContent";

export default interface Section {
    _id?: string | ObjectId;
    title: string;
    path: string;
    description?: string;
    objectives?: string[];
    contents: ContentRef[];
    tags: string[];
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    examenIsLock?: boolean;
}
```

- [ ] **Lancer le lint pour voir toutes les erreurs de type**

```bash
bun run lint 2>&1 | head -80
```
Attendu : erreurs TypeScript sur tous les usages de `section.contents` qui traitent les éléments comme des strings. C'est normal, on les corrige dans les prochaines tasks.

- [ ] **Commit**

```bash
git add src/types/Section.ts
git commit -m "feat(builder): change Section.contents to ContentRef[]"
```

---

### Task 3 : Mettre à jour `getModuleData.ts`

**Files:**
- Modify: `src/hook/getModuleData.ts`

- [ ] **Mettre à jour la ligne 24 de `src/hook/getModuleData.ts`**

```typescript
import {notFound} from 'next/navigation';
import getModules from "@/lib/getModules";

interface UseModuleDataProps {
    moduleSlug: string;
    sectionSlug?: string;
    contentSlug?: string;
}

export async function getModuleData({moduleSlug, sectionSlug, contentSlug}: UseModuleDataProps) {
    const modules = await getModules();
    const currentModule = modules.find(m => m.path === moduleSlug);

    if (!currentModule) notFound();

    let currentSection = null;
    let currentContent = null;

    if (sectionSlug) {
        currentSection = currentModule.sections.find(s => s.path === sectionSlug);
        if (!currentSection) notFound();

        if (contentSlug) {
            // ContentRef[] — on compare c.type au lieu de c directement
            const ref = currentSection.contents.find(c => c.type === contentSlug);
            currentContent = ref ? ref.type : null;
            if (!currentContent) notFound();
        }
    }

    return {
        modules,
        currentModule,
        currentSection,
        currentContent
    };
}
```

- [ ] **Commit**

```bash
git add src/hook/getModuleData.ts
git commit -m "fix(builder): update getModuleData to use ContentRef.type"
```

---

### Task 4 : Mettre à jour les pages de contenu

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`
- Modify: `src/app/[moduleSlug]/[sectionSlug]/page.tsx`

- [ ] **Mettre à jour `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`**

Ligne 56 — split view check. Remplacer :
```typescript
if (!currentSection.contents.includes('cours') || !currentSection.contents.includes('TP')) {
```
Par :
```typescript
import { hasContentType, getContentTypes } from "@/types/CourseContent";
// ...
if (!hasContentType(currentSection.contents, 'cours') || !hasContentType(currentSection.contents, 'TP')) {
```

Ligne 135 — prop `contents` de `ContentSidebarNav`. Remplacer :
```typescript
contents={currentSection.contents}
```
Par :
```typescript
contents={getContentTypes(currentSection.contents)}
```

Ligne 184 — prop `sectionContents` de `TableOfContents`. Remplacer :
```typescript
sectionContents={currentSection.contents}
```
Par :
```typescript
sectionContents={getContentTypes(currentSection.contents)}
```

- [ ] **Mettre à jour `src/app/[moduleSlug]/[sectionSlug]/page.tsx`**

Ligne 187 — map sur les contenus. Remplacer :
```typescript
{currentSection?.contents.map((content, index) => (
```
Par :
```typescript
{currentSection?.contents.map(({ type: content }, index) => (
```

- [ ] **Vérifier**

```bash
bun run lint
```
Attendu : pas d'erreur sur ces deux fichiers.

- [ ] **Commit**

```bash
git add src/app/\[moduleSlug\]/\[sectionSlug\]/\[contentSlug\]/page.tsx src/app/\[moduleSlug\]/\[sectionSlug\]/page.tsx
git commit -m "fix(builder): update content pages to use ContentRef helpers"
```

---

### Task 5 : Mettre à jour les composants admin et cards

**Files:**
- Modify: `src/components/admin/AdminSection.tsx`
- Modify: `src/components/admin/SectionForm.tsx`
- Modify: `src/components/Cards/SectionCard.tsx`
- Modify: `src/components/page/ProgressSection.tsx`
- Modify: `src/lib/getModuleProgress.ts`

- [ ] **`src/components/admin/AdminSection.tsx` — lignes 54 et 73**

Ligne 54 :
```typescript
import { getContentTypes, hasContentType } from "@/types/CourseContent";
// ...
{getContentTypes(currentSection.contents).map(content => content.charAt(0).toUpperCase() + content.slice(1)).join(', ')}
```

Ligne 73 :
```typescript
{hasContentType(currentSection.contents, 'examen') && (
```

- [ ] **`src/components/admin/SectionForm.tsx` — lignes 85 et 103**

Importer en haut :
```typescript
import { ContentRef } from "@/types/CourseContent";
```

Ligne 85 (filtre sur les contenus) — adapter selon le contexte exact du filter. L'objectif est de filtrer les ContentRef par type :
```typescript
contents: section!.contents.filter(
    (c): c is ContentRef => !['examen'].includes(c.type)
),
```

Ligne 103 (valeur par défaut) :
```typescript
contents: prefill?.contents ?? [
    { type: 'cours', source: 'file' } as ContentRef,
    { type: 'TP', source: 'file' } as ContentRef,
],
```

- [ ] **`src/components/Cards/SectionCard.tsx` — ligne 33**

```typescript
import { getContentTypes } from "@/types/CourseContent";
// ...
const sortedContents = getContentTypes(section.contents).sort(
    (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
);
```

- [ ] **`src/components/page/ProgressSection.tsx` — ligne 19**

```typescript
import { hasContentType } from "@/types/CourseContent";
// ...
.filter((s: Section) => !hasContentType(s.contents, "examen"))
```

- [ ] **`src/lib/getModuleProgress.ts` — ligne 14**

```typescript
import { hasContentType } from "@/types/CourseContent";
// ...
(s: Section) => !hasContentType(s.contents, 'examen')
```

- [ ] **Vérifier**

```bash
bun run lint
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add src/components/admin/AdminSection.tsx src/components/admin/SectionForm.tsx src/components/Cards/SectionCard.tsx src/components/page/ProgressSection.tsx src/lib/getModuleProgress.ts
git commit -m "fix(builder): update admin/card components to use ContentRef helpers"
```

---

### Task 6 : Registre de blocs

**Files:**
- Create: `src/lib/blockRegistry.ts`

- [ ] **Créer `src/lib/blockRegistry.ts`**

```typescript
import { z } from "zod";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";
import { List, ListItem } from "@/components/ui/List";
import ImageCard from "@/components/Cards/ImageCard";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from "@/components/ui/Table";

export interface FieldDef {
    key: string;
    label: string;
    type: "text" | "textarea" | "number" | "select" | "boolean" | "array-of-strings";
    options?: string[];
    placeholder?: string;
}

export interface BlockRenderProps {
    [key: string]: unknown;
}

export interface BlockEditorProps {
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}

export interface BlockDefinition {
    type: string;
    label: string;
    defaultProps: Record<string, unknown>;
    schema: z.ZodTypeAny;
    fields: FieldDef[];
    render: React.ComponentType<BlockRenderProps>;
    editor?: React.ComponentType<BlockEditorProps>;
}

const blockDefinitions: BlockDefinition[] = [
    {
        type: "text",
        label: "Texte",
        defaultProps: { content: "", strong: [] },
        schema: z.object({
            content: z.string().min(1),
            strong: z.array(z.string()).optional(),
        }),
        fields: [
            { key: "content", label: "Contenu", type: "textarea" },
            { key: "strong", label: "Parties en gras", type: "array-of-strings" },
        ],
        render: ({ content, strong }: BlockRenderProps) => (
            <Text>
                {String(content ?? "")}
            </Text>
        ),
    },
    {
        type: "heading",
        label: "Titre",
        defaultProps: { level: 2, text: "" },
        schema: z.object({
            level: z.union([z.literal(2), z.literal(3)]),
            text: z.string().min(1),
        }),
        fields: [
            { key: "level", label: "Niveau", type: "select", options: ["2", "3"] },
            { key: "text", label: "Texte", type: "text" },
        ],
        render: ({ level, text }: BlockRenderProps) => (
            <Heading level={Number(level) as 2 | 3}>{String(text ?? "")}</Heading>
        ),
    },
    {
        type: "list",
        label: "Liste",
        defaultProps: { ordered: false, items: [] },
        schema: z.object({
            ordered: z.boolean(),
            items: z.array(z.string()),
        }),
        fields: [
            { key: "ordered", label: "Ordonnée", type: "boolean" },
            { key: "items", label: "Éléments", type: "array-of-strings" },
        ],
        render: ({ ordered, items }: BlockRenderProps) => (
            <List ordered={Boolean(ordered)}>
                {(items as string[] ?? []).map((item, i) => (
                    <ListItem key={i}>{item}</ListItem>
                ))}
            </List>
        ),
    },
    {
        type: "image-card",
        label: "Image",
        defaultProps: { src: "", alt: "", caption: "" },
        schema: z.object({
            src: z.string().min(1),
            alt: z.string().min(1),
            caption: z.string().optional(),
        }),
        fields: [
            { key: "src", label: "URL de l'image", type: "text", placeholder: "/images/..." },
            { key: "alt", label: "Texte alternatif", type: "text" },
            { key: "caption", label: "Légende", type: "text" },
        ],
        render: ({ src, alt, caption }: BlockRenderProps) => (
            <ImageCard src={String(src ?? "")} alt={String(alt ?? "")} caption={caption ? String(caption) : undefined} />
        ),
    },
    {
        type: "table",
        label: "Tableau",
        defaultProps: { headers: [], rows: [] },
        schema: z.object({
            headers: z.array(z.string()),
            rows: z.array(z.array(z.string())),
        }),
        fields: [
            { key: "headers", label: "En-têtes", type: "array-of-strings" },
        ],
        render: ({ headers, rows }: BlockRenderProps) => (
            <Table>
                <TableHeader>
                    <TableRow>
                        {(headers as string[] ?? []).map((h, i) => <TableHeaderCell key={i}>{h}</TableHeaderCell>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(rows as string[][] ?? []).map((row, i) => (
                        <TableRow key={i}>
                            {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ),
    },
    {
        type: "section-card",
        label: "Lien de section",
        defaultProps: { title: "", href: "", description: "" },
        schema: z.object({
            title: z.string().min(1),
            href: z.string().min(1),
            description: z.string().optional(),
        }),
        fields: [
            { key: "title", label: "Titre", type: "text" },
            { key: "href", label: "Lien", type: "text", placeholder: "/javascript/1-le-dom/cours" },
            { key: "description", label: "Description", type: "text" },
        ],
        render: ({ title, href, description }: BlockRenderProps) => (
            <a href={String(href ?? "")} className="block p-4 border rounded-lg hover:bg-accent/5">
                <strong>{String(title ?? "")}</strong>
                {description && <p className="text-sm text-muted-foreground mt-1">{String(description)}</p>}
            </a>
        ),
    },
    {
        type: "named-component",
        label: "Composant interactif",
        defaultProps: { name: "" },
        schema: z.object({
            name: z.string().min(1),
        }),
        fields: [
            { key: "name", label: "Nom du composant", type: "text", placeholder: "ColorClickableBox" },
        ],
        render: ({ name }: BlockRenderProps) => {
            // Le render réel utilise namedComponents — voir BlockRenderer.tsx
            return <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">⚡ {String(name ?? "")}</div>;
        },
    },
];

const registry = new Map<string, BlockDefinition>(
    blockDefinitions.map(def => [def.type, def])
);

export function getBlockDefinition(type: string): BlockDefinition | undefined {
    return registry.get(type);
}

export function getAllBlockDefinitions(): BlockDefinition[] {
    return blockDefinitions;
}

export default registry;
```

> **Note :** Les composants `ImageCard`, `Table`, etc. de `src/components/ui/` et `src/components/Cards/` peuvent avoir des interfaces légèrement différentes. Adapter les props des `render` en vérifiant le code source si le lint signale des erreurs.

- [ ] **Vérifier**

```bash
bun run lint
```

- [ ] **Commit**

```bash
git add src/lib/blockRegistry.ts
git commit -m "feat(builder): add block registry with 7 block definitions"
```

---

### Task 7 : Map des composants interactifs

**Files:**
- Create: `src/lib/namedComponents.ts`

- [ ] **Créer `src/lib/namedComponents.ts`**

```typescript
import React from "react";
import ColorClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ColorClickableBox";
import ClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ClickableBox";
import ClickCounterBox from "@/cours/javascript/2-les-evenements/Exemple/ClickCounterBox";
import MouseTrackerBox from "@/cours/javascript/2-les-evenements/Exemple/MouseTrackerBox";
import FormBox from "@/cours/javascript/2-les-evenements/Exemple/FormBox";
import KeyPressBox from "@/cours/javascript/2-les-evenements/Exemple/KeyPressBox";
import MilgramCharts from "@/cours/javascript/4-fetch/modal/MilgramCharts";
import MilgramModalContent from "@/cours/javascript/4-fetch/modal/MilgramModalContent";

export const namedComponents: Record<string, React.ComponentType> = {
    ColorClickableBox,
    ClickableBox,
    ClickCounterBox,
    MouseTrackerBox,
    FormBox,
    KeyPressBox,
    MilgramCharts,
    MilgramModalContent,
};

export function getNamedComponent(name: string): React.ComponentType | undefined {
    return namedComponents[name];
}
```

- [ ] **Vérifier**

```bash
bun run lint
```

- [ ] **Commit**

```bash
git add src/lib/namedComponents.ts
git commit -m "feat(builder): add namedComponents registry for interactive .tsx"
```

---

### Task 8 : Script de migration MongoDB

**Files:**
- Create: `src/scripts/migrate-contents-refs.ts`

- [ ] **Créer `src/scripts/migrate-contents-refs.ts`**

```typescript
import { connectToDB } from "@/lib/mongodb";
import { ContentRef } from "@/types/CourseContent";

async function migrateContentsRefs() {
    const db = await connectToDB();
    const modules = await db.collection("modules").find().toArray();

    let updated = 0;

    for (const module of modules) {
        const sections = (module.sections ?? []).map((section: Record<string, unknown>) => ({
            ...section,
            contents: ((section.contents ?? []) as (string | ContentRef)[]).map((c): ContentRef =>
                typeof c === "string" ? { type: c, source: "file" } : c
            ),
        }));

        await db.collection("modules").updateOne(
            { _id: module._id },
            { $set: { sections } }
        );
        updated++;
    }

    console.log(`Migration terminée — ${updated} modules mis à jour.`);
    process.exit(0);
}

migrateContentsRefs().catch((err) => {
    console.error("Erreur de migration :", err);
    process.exit(1);
});
```

- [ ] **Exécuter le script sur la DB locale**

```bash
bun run tsx src/scripts/migrate-contents-refs.ts
```
Attendu : `Migration terminée — N modules mis à jour.`

> **Important :** Exécuter ce script **avant** de déployer le code qui utilise `ContentRef[]`. Le script est idempotent (les objets déjà migrés sont laissés tels quels).

- [ ] **Vérifier que l'app fonctionne toujours**

```bash
bun dev
```
Naviguer vers une page de cours dans le navigateur. Le cours doit s'afficher normalement.

- [ ] **Commit**

```bash
git add src/scripts/migrate-contents-refs.ts
git commit -m "feat(builder): add MongoDB migration script for ContentRef[]"
```

---

### Task 9 : Vérification finale

- [ ] **Build complet**

```bash
bun run build
```
Attendu : build réussi, 0 erreur TypeScript.

- [ ] **Test manuel** : naviguer vers `/javascript/1-le-dom/cours` — la page doit s'afficher normalement.

- [ ] **Test manuel** : naviguer vers `/javascript/1-le-dom/split` — le mode split doit fonctionner normalement.
