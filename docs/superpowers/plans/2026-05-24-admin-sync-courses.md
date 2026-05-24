# Admin Sync — Cours filesystem / MongoDB — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter dans le FAB admin un badge indiquant les cours présents dans `src/cours` mais absents de MongoDB, avec un sheet permettant de les créer via les formulaires existants pré-remplis.

**Architecture:** Une Route Handler lit le filesystem et compare avec MongoDB pour produire un diff. `AdminHomeFab` récupère ce diff au montage, affiche un badge, et ouvre un `SyncSheet`. Celui-ci délègue la création aux composants `AddModuleButton` et `SectionForm` déjà existants, étendus d'une prop de pré-remplissage.

**Tech Stack:** Next.js App Router, Node.js `fs/promises`, React Hook Form, Radix Sheet, MongoDB driver, TypeScript strict.

---

## File Map

| Fichier | Action | Responsabilité |
|---|---|---|
| `src/app/api/admin/sync/route.ts` | Créer | Diff filesystem / MongoDB, renvoie modules et sections manquants avec prefill |
| `src/components/admin/SyncSheet.tsx` | Créer | Sheet listant les manquants, orchestre l'ouverture des formulaires existants |
| `src/components/admin/SectionForm.tsx` | Modifier | Accepte `prefill?: Partial<SectionFormValues>` pour le mode add |
| `src/components/admin/AddModuleButton.tsx` | Modifier | Accepte `defaultPath?: string` pour pré-remplir le champ path |
| `src/components/admin/AdminHomeFab.tsx` | Modifier | Fetch diff au montage, badge rouge, item dropdown, intégration SyncSheet |

---

## Task 1 — Route Handler `GET /api/admin/sync`

**Files:**
- Create: `src/app/api/admin/sync/route.ts`

**Contexte:**
- `AVAILABLE_CONTENTS` (dans `src/lib/schemas/section.schema.ts`) : `["cours", "TP", "slide", "projet", "examen"]`
- Les fichiers `.tsx` dans une section s'appellent `Cours.tsx`, `TP.tsx`, `Slide.tsx`, `Examen.tsx`
- L'accès admin est géré par `proxy.ts` qui vérifie `role === 'admin'` — pas besoin de re-vérifier dans la route
- `connectToDB()` est dans `src/lib/mongodb.ts`
- `getModules()` (dans `src/lib/getModules.ts`) récupère tous les modules MongoDB

- [ ] **Créer le fichier `src/app/api/admin/sync/route.ts`** avec le contenu suivant :

```ts
import {NextResponse} from "next/server";
import fs from "fs/promises";
import path from "path";
import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";
import {WithId} from "mongodb";
import {AVAILABLE_CONTENTS} from "@/lib/schemas/section.schema";
import {SectionFormValues} from "@/lib/schemas/section.schema";

// Mappe le nom du fichier .tsx vers la valeur du schema
const FILE_TO_CONTENT: Record<string, typeof AVAILABLE_CONTENTS[number]> = {
    "Cours": "cours",
    "TP": "TP",
    "Slide": "slide",
    "Examen": "examen",
};

// "1-le-dom" → "Le Dom"
function slugToTitle(slug: string): string {
    return slug
        .replace(/^\d+-/, "")
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export type MissingSectionItem = {
    module: Module & {_id: string};
    sectionSlug: string;
    prefill: Pick<SectionFormValues, "title" | "path" | "order" | "contents"> & {
        isAvailable: false;
        hasCorrection: false;
        totalDuration: 1;
    };
};

export type SyncResponse = {
    missingModules: {slug: string}[];
    missingSections: MissingSectionItem[];
};

export async function GET(): Promise<NextResponse<SyncResponse>> {
    const coursDir = path.join(process.cwd(), "src", "cours");
    const db = await connectToDB();
    const modules = await db.collection<Module>("modules").find().toArray() as WithId<Module>[];

    const modulesByPath = new Map(modules.map(m => [m.path, m]));

    const missingModules: {slug: string}[] = [];
    const missingSections: MissingSectionItem[] = [];

    const moduleSlugs = await fs.readdir(coursDir);

    for (const moduleSlug of moduleSlugs) {
        const moduleStat = await fs.stat(path.join(coursDir, moduleSlug));
        if (!moduleStat.isDirectory()) continue;

        const existingModule = modulesByPath.get(moduleSlug);

        if (!existingModule) {
            missingModules.push({slug: moduleSlug});
            continue;
        }

        const existingSectionPaths = new Set(
            (existingModule.sections ?? []).map(s => s.path)
        );

        const sectionSlugs = await fs.readdir(path.join(coursDir, moduleSlug));

        for (const sectionSlug of sectionSlugs) {
            const sectionStat = await fs.stat(path.join(coursDir, moduleSlug, sectionSlug));
            if (!sectionStat.isDirectory()) continue;

            if (existingSectionPaths.has(sectionSlug)) continue;

            const files = await fs.readdir(path.join(coursDir, moduleSlug, sectionSlug));
            const contents = files
                .filter(f => f.endsWith(".tsx"))
                .map(f => FILE_TO_CONTENT[f.replace(".tsx", "")])
                .filter((c): c is typeof AVAILABLE_CONTENTS[number] => c !== undefined);

            const orderMatch = sectionSlug.match(/^(\d+)-/);
            const order = orderMatch ? parseInt(orderMatch[1], 10) : (existingModule.sections?.length ?? 0) + 1;

            missingSections.push({
                module: {...existingModule, _id: existingModule._id.toString()},
                sectionSlug,
                prefill: {
                    title: slugToTitle(sectionSlug),
                    path: sectionSlug,
                    order,
                    contents: contents.length > 0 ? contents : ["cours", "TP"],
                    isAvailable: false,
                    hasCorrection: false,
                    totalDuration: 1,
                },
            });
        }
    }

    return NextResponse.json({missingModules, missingSections});
}
```

- [ ] **Vérifier que `pnpm build` ne régresse pas** (le `fs.readdir` ne doit pas s'exécuter au module-load, uniquement dans le handler `GET` — c'est déjà le cas)

- [ ] **Tester manuellement** en lançant `pnpm dev` et en appelant `http://localhost:3000/api/admin/sync` avec un cookie admin. Vérifier que la réponse JSON liste correctement les manquants.

- [ ] **Commit**

```bash
git add src/app/api/admin/sync/route.ts
git commit -m "feat(admin): route GET /api/admin/sync — diff filesystem / MongoDB"
```

---

## Task 2 — Étendre `SectionForm` avec prop `prefill`

**Files:**
- Modify: `src/components/admin/SectionForm.tsx`

**Contexte :** `SectionForm` appelle `reset(getDefaultValues())` à chaque fois que `open` change (ligne 112). `getDefaultValues` est un `useCallback`. Il suffit d'ajouter `prefill` comme dépendance et de l'utiliser dans la branche `mode === 'add'`.

- [ ] **Modifier l'interface `SectionFormProps`** (vers la ligne 38) :

```ts
interface SectionFormProps {
    modData: Module;
    section?: Section;
    mode: 'add' | 'edit';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (section: Section) => void;
    prefill?: {
        title?: string;
        path?: string;
        order?: number;
        contents?: SectionFormValues['contents'];
        isAvailable?: boolean;
        hasCorrection?: boolean;
        totalDuration?: number;
    };
}
```

- [ ] **Mettre à jour la signature de la fonction** (ligne 47) :

```ts
export default function SectionForm({
    modData,
    section,
    mode,
    open,
    onOpenChange,
    onSubmit,
    prefill,
}: SectionFormProps) {
```

- [ ] **Mettre à jour `getDefaultValues`** — remplacer la branche `add` (lignes 80-93) :

```ts
return {
    title: prefill?.title ?? '',
    path: prefill?.path ?? '',
    description: '',
    objectives: '',
    tags: '',
    totalDuration: prefill?.totalDuration ?? 1,
    hasCorrection: prefill?.hasCorrection ?? true,
    isAvailable: prefill?.isAvailable ?? true,
    correctionIsAvailable: true,
    examenIsLock: false,
    order: prefill?.order ?? (modData.sections?.length ?? 0) + 1,
    contents: prefill?.contents ?? ['cours', 'TP'],
};
```

- [ ] **Ajouter `prefill` aux dépendances du `useCallback`** (ligne 94) :

```ts
}, [isEditMode, section, modData.sections?.length, prefill]);
```

- [ ] **Désactiver l'auto-dérivation du path depuis le titre quand un prefill path est fourni** (autour de la ligne 115) :

```ts
useEffect(() => {
    if (!isEditMode && !prefill?.path && title) {
        setValue(
            'path',
            `${(modData.sections?.length ?? 0) + 1}-${title.toLowerCase().replace(/\s+/g, '-')}`,
        );
    }
}, [title, setValue, modData.sections?.length, isEditMode, prefill?.path]);
```

- [ ] **Vérifier** en lançant `pnpm dev` que le formulaire de section existant fonctionne toujours normalement (sans `prefill`)

- [ ] **Commit**

```bash
git add src/components/admin/SectionForm.tsx
git commit -m "feat(admin): SectionForm accepte prop prefill pour le mode add"
```

---

## Task 3 — Étendre `AddModuleButton` avec prop `defaultPath`

**Files:**
- Modify: `src/components/admin/AddModuleButton.tsx`

**Contexte :** `AddModuleButton` auto-dérive `path` depuis `title` via un `useEffect`. Quand `defaultPath` est fourni, on l'utilise comme valeur initiale et on désactive la dérivation automatique.

- [ ] **Ajouter `defaultPath` à l'interface `AddModuleButtonProps`** (vers la ligne 16) :

```ts
interface AddModuleButtonProps {
    onAdd: (module: {
        title: string;
        path: string;
        iconName: string;
        description?: string;
        associatedSae: string[];
        coefficients: Coefficient[];
        manager?: Instructor;
        instructors?: Instructor[];
        sections: Section[];
    }) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultPath?: string;
}
```

- [ ] **Mettre à jour la signature de la fonction** (ligne 46) :

```ts
export default function AddModuleButton({onAdd, open: controlledOpen, onOpenChange, defaultPath}: AddModuleButtonProps) {
```

- [ ] **Utiliser `defaultPath` dans les `defaultValues` du formulaire** (autour de la ligne 52) :

```ts
const {register, handleSubmit, control, setValue, reset, formState: {errors}} = useForm<FormData>({
    defaultValues: {
        path: defaultPath ?? '',
        coefficients: FIXED_COMPETENCES.map(c => ({competenceName: c, value: 0})),
        instructors: [{firstName: "", lastName: "", email: ""}],
        manager: {firstName: "", lastName: "", email: ""}
    }
});
```

- [ ] **Conditionner l'auto-dérivation du path** (autour de la ligne 63) :

```ts
useEffect(() => {
    if (!defaultPath && title) {
        setValue("path", title.toLowerCase().replace(/\s+/g, '-'));
    }
}, [title, setValue, defaultPath]);
```

- [ ] **Vérifier** que le formulaire existant (sans `defaultPath`) fonctionne toujours

- [ ] **Commit**

```bash
git add src/components/admin/AddModuleButton.tsx
git commit -m "feat(admin): AddModuleButton accepte prop defaultPath"
```

---

## Task 4 — Créer `SyncSheet`

**Files:**
- Create: `src/components/admin/SyncSheet.tsx`

**Contexte :**
- Importe les types `SyncResponse` et `MissingSectionItem` depuis `src/app/api/admin/sync/route.ts`
- Réutilise `AddModuleButton` (étendu en Task 3) et `SectionForm` (étendu en Task 2)
- `useAdminApi` (dans `src/hook/admin/useAdminApi.ts`) expose `addModule` et `addSection`
- Style du sheet : copier celui de `AddModuleButton` (`bg-[#f7ebd9] dark:bg-[#13110d]`, `border-bridge-500/45`)

- [ ] **Créer `src/components/admin/SyncSheet.tsx`** :

```tsx
'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {AlertCircle, CheckCircle2, ChevronRight, Layers} from 'lucide-react';
import {Sheet, SheetContent, SheetDescription, SheetTitle} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import AddModuleButton from '@/components/admin/AddModuleButton';
import SectionForm, {Section} from '@/components/admin/SectionForm';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';
import {MissingSectionItem} from '@/app/api/admin/sync/route';

interface SyncSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingModules: {slug: string}[];
    missingSections: MissingSectionItem[];
    onCreated: () => void;
}

export default function SyncSheet({
    open,
    onOpenChange,
    missingModules,
    missingSections,
    onCreated,
}: SyncSheetProps) {
    const router = useRouter();
    const {addModule, addSection} = useAdminApi();

    const [addModuleOpen, setAddModuleOpen] = useState(false);
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | null>(null);

    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [selectedSectionItem, setSelectedSectionItem] = useState<MissingSectionItem | null>(null);

    const totalMissing = missingModules.length + missingSections.length;

    // Regroupe les sections manquantes par module slug
    const sectionsByModule = missingSections.reduce<Record<string, MissingSectionItem[]>>((acc, item) => {
        const key = item.module.path;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    // Tous les modules concernés (ceux qui manquent + ceux qui ont des sections manquantes)
    const allModuleSlugs = [
        ...missingModules.map(m => m.slug),
        ...Object.keys(sectionsByModule),
    ];
    const uniqueModuleSlugs = [...new Set(allModuleSlugs)];

    function openAddModule(slug: string) {
        setSelectedModuleSlug(slug);
        onOpenChange(false);
        setAddModuleOpen(true);
    }

    function openAddSection(item: MissingSectionItem) {
        setSelectedSectionItem(item);
        onOpenChange(false);
        setAddSectionOpen(true);
    }

    async function handleModuleCreated(newMod: Omit<Module, '_id'>) {
        await addModule(newMod as unknown as Omit<Module, '_id'>);
        onCreated();
        router.refresh();
    }

    async function handleSectionCreated(section: Section) {
        if (!selectedSectionItem) return;
        await addSection(selectedSectionItem.module._id as string, section);
        onCreated();
        router.refresh();
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="right"
                    className={cn(
                        'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[480px]',
                        'bg-[#f7ebd9] dark:bg-[#13110d]',
                        'border-l border-bridge-500/45',
                        '[&>button]:text-white/80 [&>button:hover]:text-white',
                    )}
                >
                    {/* Header */}
                    <div className="relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0 bg-brand-primary">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                            <Layers className="w-5 h-5 text-white"/>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">
                                Synchronisation
                            </p>
                            <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                                Cours non synchronisés
                            </SheetTitle>
                            <SheetDescription className="text-white/70 text-sm mt-0.5">
                                {totalMissing > 0
                                    ? `${totalMissing} élément${totalMissing > 1 ? 's' : ''} à créer dans MongoDB`
                                    : 'Tout est synchronisé'}
                            </SheetDescription>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {totalMissing === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500"/>
                                <p className="text-sm text-bridge-600 dark:text-bridge-400">
                                    Tous les cours sont synchronisés avec MongoDB.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {uniqueModuleSlugs.map(slug => {
                                    const isModuleMissing = missingModules.some(m => m.slug === slug);
                                    const sections = sectionsByModule[slug] ?? [];

                                    return (
                                        <div key={slug}>
                                            {/* Module header */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs uppercase tracking-widest font-semibold text-bridge-500 dark:text-bridge-400">
                                                    {slug}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5">
                                                {isModuleMissing && (
                                                    <div className="flex items-center justify-between rounded-lg border border-orange-300/50 bg-orange-50/60 dark:bg-orange-950/20 px-3 py-2.5 gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <AlertCircle className="w-4 h-4 text-orange-500 shrink-0"/>
                                                            <span className="text-sm font-medium text-brand-dark dark:text-bridge-100 truncate">
                                                                Module absent de MongoDB
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="shrink-0 text-brand-accent-dark hover:text-brand-accent-dark hover:bg-brand-accent-dark/10 gap-1 px-2"
                                                            onClick={() => openAddModule(slug)}
                                                        >
                                                            Créer
                                                            <ChevronRight className="w-3.5 h-3.5"/>
                                                        </Button>
                                                    </div>
                                                )}

                                                {sections.map(item => (
                                                    <div
                                                        key={item.sectionSlug}
                                                        className="flex items-center justify-between rounded-lg border border-bridge-300/50 dark:border-bridge-700/50 bg-bridge-50/60 dark:bg-bridge-900/20 px-3 py-2.5 gap-2"
                                                    >
                                                        <span className="text-sm text-brand-dark dark:text-bridge-100 truncate">
                                                            {item.sectionSlug}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="shrink-0 text-brand-accent-dark hover:text-brand-accent-dark hover:bg-brand-accent-dark/10 gap-1 px-2"
                                                            onClick={() => openAddSection(item)}
                                                        >
                                                            Créer
                                                            <ChevronRight className="w-3.5 h-3.5"/>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Sheet création module */}
            <AddModuleButton
                onAdd={handleModuleCreated}
                open={addModuleOpen}
                onOpenChange={setAddModuleOpen}
                defaultPath={selectedModuleSlug ?? undefined}
            />

            {/* Sheet création section */}
            {selectedSectionItem && (
                <SectionForm
                    modData={selectedSectionItem.module as Module}
                    mode="add"
                    open={addSectionOpen}
                    onOpenChange={setAddSectionOpen}
                    onSubmit={handleSectionCreated}
                    prefill={selectedSectionItem.prefill}
                />
            )}
        </>
    );
}
```

- [ ] **Vérifier** qu'il n'y a pas d'erreur TypeScript : `pnpm build` ou lancer `pnpm dev` et inspecter la console

- [ ] **Commit**

```bash
git add src/components/admin/SyncSheet.tsx
git commit -m "feat(admin): composant SyncSheet — liste et crée les cours manquants"
```

---

## Task 5 — Mettre à jour `AdminHomeFab`

**Files:**
- Modify: `src/components/admin/AdminHomeFab.tsx`

**Contexte :** `AdminHomeFab` est un Client Component. Il utilise déjà `useState` et `useRouter`. On ajoute `useEffect` + `useState` pour le fetch du diff, un badge sur le bouton, et l'item dropdown + `SyncSheet`.

- [ ] **Remplacer le contenu de `src/components/admin/AdminHomeFab.tsx`** par :

```tsx
'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Plus, RefreshCw, Wrench} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddModuleButton from '@/components/admin/AddModuleButton';
import SyncSheet from '@/components/admin/SyncSheet';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';
import {SyncResponse} from '@/app/api/admin/sync/route';

export default function AdminHomeFab() {
    const [addModuleOpen, setAddModuleOpen] = useState(false);
    const [syncSheetOpen, setSyncSheetOpen] = useState(false);
    const [syncData, setSyncData] = useState<SyncResponse>({missingModules: [], missingSections: []});
    const router = useRouter();
    const {addModule} = useAdminApi();

    const totalMissing = syncData.missingModules.length + syncData.missingSections.length;

    async function fetchSync() {
        try {
            const res = await fetch('/api/admin/sync');
            if (res.ok) {
                const data: SyncResponse = await res.json();
                setSyncData(data);
            }
        } catch {
            // silencieux — le badge reste à 0 en cas d'erreur réseau
        }
    }

    useEffect(() => {
        fetchSync();
    }, []);

    const handleAdd = async (newMod: Omit<Module, '_id'>) => {
        await addModule(newMod as unknown as Omit<Module, '_id'>);
        router.refresh();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Actions admin"
                        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg bg-brand-primary text-white hover:bg-brand-accent-dark"
                    >
                        <Wrench className="w-5 h-5"/>
                        {totalMissing > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                {totalMissing > 9 ? '9+' : totalMissing}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="top"
                    align="end"
                    className="mb-2 min-w-[200px] bg-[#f7ebd9] dark:bg-[#13110d] border-bridge-500/45 shadow-[0_8px_24px_-4px_rgba(147,97,58,0.3)]"
                >
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setAddModuleOpen(true)}
                    >
                        <Plus className="w-4 h-4"/>
                        Créer un module
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setSyncSheetOpen(true)}
                    >
                        <RefreshCw className="w-4 h-4"/>
                        Synchroniser les cours
                        {totalMissing > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {totalMissing}
                            </span>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AddModuleButton
                onAdd={handleAdd}
                open={addModuleOpen}
                onOpenChange={setAddModuleOpen}
            />

            <SyncSheet
                open={syncSheetOpen}
                onOpenChange={setSyncSheetOpen}
                missingModules={syncData.missingModules}
                missingSections={syncData.missingSections}
                onCreated={fetchSync}
            />
        </>
    );
}
```

- [ ] **Lancer `pnpm dev`**, aller sur `/admin`, vérifier que :
  1. Le FAB se charge normalement
  2. Si des cours manquent dans MongoDB, le badge rouge apparaît avec le bon compte
  3. Le dropdown affiche "Synchroniser les cours" avec le badge inline
  4. "Créer un module" fonctionne toujours

- [ ] **Tester le flux complet** : cliquer "Synchroniser les cours" → vérifier la liste → cliquer "Créer →" sur une section → vérifier que le `SectionForm` s'ouvre pré-rempli avec title, path, order, contents corrects → soumettre → vérifier que le badge se met à jour

- [ ] **Commit**

```bash
git add src/components/admin/AdminHomeFab.tsx
git commit -m "feat(admin): badge sync sur FAB + SyncSheet intégré"
```

---

## Task 6 — Push

- [ ] **Push sur staging**

```bash
git push
```
