# Admin Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer l'admin accordéon par un tableau de gestion des utilisateurs et ajouter des FABs d'édition contextuelle sur les pages live modules/sections.

**Architecture:** Approche hybride — l'édition du contenu pédagogique (modules, sections) se fait via des Sheets flottants sur les pages publiques ; `/admin` devient exclusivement la gestion des comptes utilisateurs. Tous les formulaires admin utilisent Zod + react-hook-form avec zodResolver. Le design des Sheets se base sur `ModuleInfo.tsx` comme référence visuelle (header coloré en `bg-${modulePath}`, body `bg-[#f7ebd9] dark:bg-[#13110d]`, footer sticky).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, MongoDB (driver natif), better-auth v1.4 (plugin admin), shadcn/ui (Sheet, Dialog, Button, Input, Label, Checkbox, Textarea), react-hook-form, Zod v4, @hookform/resolvers v5, Sonner (toast), Framer Motion déjà en place.

> **Note visuelle:** Après les tâches fonctionnelles, utiliser `/impeccable craft` sur les Sheets et le tableau utilisateurs pour le polish visuel final.

---

## Structure des fichiers

### Nouveaux fichiers
- `src/lib/schemas/section.schema.ts` — schéma Zod du formulaire section
- `src/lib/schemas/module.schema.ts` — schéma Zod du formulaire module
- `src/app/api/admin/modules/[moduleId]/route.ts` — PUT update module
- `src/app/api/admin/users/[userId]/route.ts` — DELETE supprimer utilisateur
- `src/app/api/admin/users/[userId]/reset-password/route.ts` — POST reset password
- `src/components/admin/EditModuleFab.tsx` — FAB contextuel sur `/[moduleSlug]`
- `src/components/admin/EditModuleSheet.tsx` — Formulaire module en Sheet
- `src/components/admin/users/UsersTable.tsx` — Tableau utilisateurs (Client Component)
- `src/components/admin/users/UserRow.tsx` — Ligne avec avatar + actions
- `src/components/admin/users/DeleteUserDialog.tsx` — Confirmation suppression

### Fichiers modifiés
- `src/components/admin/SectionForm.tsx` — Dialog → Sheet + Zod
- `src/app/admin/page.tsx` — Remplacé par UsersTable
- `src/app/[moduleSlug]/page.tsx` — Ajout EditModuleFab si admin

### Fichiers inchangés (ne pas toucher)
- `src/components/admin/AdminSection.tsx`
- `src/components/admin/AddModuleButton.tsx`
- `src/components/admin/AddSectionButton.tsx`
- `src/components/admin/AdminModule.tsx`
- `src/components/admin/ModulesList.tsx`
- `src/hook/admin/useAdminApi.ts`

---

### Task 1: Schémas Zod — section et module

**Files:**
- Create: `src/lib/schemas/section.schema.ts`
- Create: `src/lib/schemas/module.schema.ts`

- [ ] **Step 1: Créer `src/lib/schemas/section.schema.ts`**

```ts
import {z} from "zod";

export const AVAILABLE_CONTENTS = ["cours", "TP", "slide", "projet", "examen"] as const;

export const sectionFormSchema = z.object({
    title: z.string().min(1, "Le titre est obligatoire"),
    path: z.string().min(1, "Le path est obligatoire"),
    description: z.string().optional(),
    objectives: z.string().optional(),
    tags: z.string().optional(),
    totalDuration: z.coerce.number().int().min(1, "Minimum 1 séance"),
    hasCorrection: z.boolean(),
    isAvailable: z.boolean(),
    correctionIsAvailable: z.boolean(),
    examenIsLock: z.boolean(),
    order: z.coerce.number().int().min(1, "Position minimum 1"),
    contents: z.array(z.string()).min(1, "Sélectionnez au moins un type de contenu"),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;
```

`objectives` et `tags` sont des strings dans le formulaire (textarea) — la conversion en tableau se fait dans le handler `onSubmit` du composant.

- [ ] **Step 2: Créer `src/lib/schemas/module.schema.ts`**

```ts
import {z} from "zod";

export const FIXED_COMPETENCES = [
    "1/ Réaliser un développement",
    "2/ Optimiser des applications",
    "3/ Administrer des systèmes informatiques communicants complexes",
    "4/ Gérer des données de l'information",
    "5/ Conduire un projet",
    "6/ Travailler en équipe",
] as const;

export const FIXED_SAES = [
    "S2.01 : Développement d'application",
    "S2.02 : Exploration algorithmique d'un problème",
    "S2.05 : Gestion d'un projet",
    "S3.01 : Développement d'une Application",
    "S4.01 : Développement d'une application",
] as const;

export const instructorSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.union([z.string().email("Email invalide"), z.literal("")]),
});

export const moduleFormSchema = z.object({
    title: z.string().min(1, "Le titre est obligatoire"),
    path: z.string().min(1, "Le path est obligatoire"),
    iconName: z.string().min(1, "L'icône est obligatoire"),
    description: z.string().optional(),
    associatedSae: z.array(z.string()).default([]),
    coefficients: z.array(z.object({
        competenceName: z.string(),
        value: z.coerce.number().int().min(0).max(100),
    })),
    manager: instructorSchema.optional(),
    instructors: z.array(instructorSchema).default([]),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

```bash
npm run lint
```

Attendu : aucune erreur sur les deux nouveaux fichiers.

- [ ] **Step 4: Commit**

```bash
git add src/lib/schemas/section.schema.ts src/lib/schemas/module.schema.ts
git commit -m "feat(admin): add Zod schemas for section and module forms"
```

---

### Task 2: API — PUT `/api/admin/modules/[moduleId]`

**Files:**
- Create: `src/app/api/admin/modules/[moduleId]/route.ts`

> Le dossier `src/app/api/admin/modules/` existe déjà (il contient `route.ts` pour le POST). Créer le sous-dossier `[moduleId]/`.

- [ ] **Step 1: Créer `src/app/api/admin/modules/[moduleId]/route.ts`**

```ts
import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {ObjectId} from "bson";
import {getServerSession} from "@/lib/auth";

export async function PUT(
    req: Request,
    {params}: {params: Promise<{moduleId: string}>}
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Non autorisé"}, {status: 403});
    }

    const {moduleId} = await params;
    const body = await req.json();

    // Ne jamais écraser _id ni sections via ce endpoint
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {_id, sections, ...updateData} = body;

    const db = await connectToDB();
    const result = await db.collection("modules").updateOne(
        {_id: new ObjectId(moduleId)},
        {$set: updateData}
    );

    if (result.matchedCount === 0) {
        return NextResponse.json({error: "Module introuvable"}, {status: 404});
    }

    return NextResponse.json({success: true});
}
```

- [ ] **Step 2: Tester manuellement via curl ou Postman**

```bash
# Remplacer MODULE_ID par un vrai ObjectId de la collection modules
curl -X PUT http://localhost:3000/api/admin/modules/MODULE_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: <cookie admin session>" \
  -d '{"title":"Test update"}'
```

Attendu : `{"success":true}` avec status 200, et le titre modifié en base.

- [ ] **Step 3: Vérifier le lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/modules/[moduleId]/route.ts
git commit -m "feat(admin/api): add PUT /api/admin/modules/[moduleId] for module updates"
```

---

### Task 3: API — Utilisateurs (DELETE + reset password)

**Files:**
- Create: `src/app/api/admin/users/[userId]/route.ts`
- Create: `src/app/api/admin/users/[userId]/reset-password/route.ts`

- [ ] **Step 1: Créer `src/app/api/admin/users/[userId]/route.ts`**

```ts
import {NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {getServerSession} from "@/lib/auth";

export async function DELETE(
    _req: Request,
    {params}: {params: Promise<{userId: string}>}
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Non autorisé"}, {status: 403});
    }

    const {userId} = await params;

    await auth.api.removeUser({
        body: {userId},
        headers: await headers(),
    });

    return NextResponse.json({success: true});
}
```

- [ ] **Step 2: Créer `src/app/api/admin/users/[userId]/reset-password/route.ts`**

```ts
import {NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {getServerSession} from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Non autorisé"}, {status: 403});
    }

    const {email} = await req.json() as {email: string};
    if (!email) {
        return NextResponse.json({error: "Email requis"}, {status: 400});
    }

    await auth.api.forgetPassword({
        body: {email, redirectTo: "/connexion"},
        headers: await headers(),
    });

    return NextResponse.json({success: true});
}
```

`auth.api.forgetPassword` est fourni par le plugin `emailAndPassword` de better-auth. Si `RESEND_API_KEY` n'est pas configurée (dev local sans email), l'appel ne fera rien mais ne devrait pas lever d'exception (il retourne juste sans envoyer).

- [ ] **Step 3: Vérifier le lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/users/
git commit -m "feat(admin/api): add DELETE user and POST reset-password routes"
```

---

### Task 4: Refonte `SectionForm` — Dialog → Sheet + Zod

**Files:**
- Modify: `src/components/admin/SectionForm.tsx`

Remplace le `Dialog` par un `Sheet` avec la charte visuelle bridge (header coloré, body beige, footer sticky). Ajoute `zodResolver`.

La prop `trigger` (jamais utilisée par les appelants) est supprimée. L'export du type `Section` est conservé pour la rétrocompatibilité avec `EditSectionFab` et `AddSectionButton`.

- [ ] **Step 1: Écrire le nouveau `SectionForm.tsx`**

```tsx
'use client';

import {useCallback, useEffect} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Pencil, Plus} from 'lucide-react';
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import {
    sectionFormSchema,
    type SectionFormValues,
    AVAILABLE_CONTENTS,
} from '@/lib/schemas/section.schema';

// Type exporté pour rétrocompatibilité avec EditSectionFab et AddSectionButton
export type Section = {
    title: string;
    path: string;
    description?: string;
    objectives?: string[] | string;
    tags: string[] | string;
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    contents: string[];
    examenIsLock?: boolean;
};

interface SectionFormProps {
    modData: Module;
    section?: Section;
    mode: 'add' | 'edit';
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (section: Section) => void;
}

function Eyebrow({children}: {children: React.ReactNode}) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
            {children}
        </p>
    );
}

export default function SectionForm({
    modData,
    section,
    mode,
    open,
    onOpenChange,
    onSubmit,
}: SectionFormProps) {
    const isEditMode = mode === 'edit' && section !== undefined;

    const getDefaultValues = useCallback((): SectionFormValues => {
        if (isEditMode && section) {
            return {
                title: section.title,
                path: section.path,
                description: section.description ?? '',
                objectives: Array.isArray(section.objectives)
                    ? section.objectives.join('\n')
                    : (section.objectives ?? ''),
                tags: Array.isArray(section.tags)
                    ? section.tags.join(',')
                    : (section.tags ?? ''),
                totalDuration: section.totalDuration,
                hasCorrection: section.hasCorrection,
                isAvailable: section.isAvailable ?? true,
                correctionIsAvailable: section.correctionIsAvailable ?? true,
                order: section.order,
                contents: section.contents,
                examenIsLock: section.examenIsLock ?? false,
            };
        }
        return {
            title: '',
            path: '',
            description: '',
            objectives: '',
            tags: '',
            totalDuration: 1,
            hasCorrection: true,
            isAvailable: true,
            correctionIsAvailable: true,
            examenIsLock: false,
            order: (modData.sections?.length ?? 0) + 1,
            contents: ['cours', 'TP'],
        };
    }, [isEditMode, section, modData.sections?.length]);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        watch,
        formState: {errors},
    } = useForm<SectionFormValues>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: getDefaultValues(),
    });

    const title = useWatch({control, name: 'title'});
    const contents = watch('contents') ?? [];

    useEffect(() => {
        if (open) reset(getDefaultValues());
    }, [open, reset, getDefaultValues]);

    useEffect(() => {
        if (!isEditMode && title) {
            setValue(
                'path',
                `${(modData.sections?.length ?? 0) + 1}-${title.toLowerCase().replace(/\s+/g, '-')}`,
            );
        }
    }, [title, setValue, modData.sections?.length, isEditMode]);

    const toggleContent = (item: string) => {
        setValue(
            'contents',
            contents.includes(item)
                ? contents.filter((c) => c !== item)
                : [...contents, item],
            {shouldDirty: true, shouldValidate: true},
        );
    };

    const handleFormSubmit = (data: SectionFormValues) => {
        const cleanedObjectives = (data.objectives ?? '')
            .split('\n')
            .map((o) => o.trim())
            .filter((o) => o.length > 0);

        const cleanedTags = (data.tags ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        onSubmit({
            ...data,
            objectives: cleanedObjectives,
            tags: cleanedTags,
        });

        if (!isEditMode) reset(getDefaultValues());
        onOpenChange(false);
    };

    const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
    const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

    return (
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
                <div
                    className={cn(
                        'relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0',
                        `bg-${modData.path}`,
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                        {isEditMode
                            ? <Pencil className="w-5 h-5 text-white" aria-hidden="true"/>
                            : <Plus className="w-5 h-5 text-white" aria-hidden="true"/>
                        }
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">
                            Section
                        </p>
                        <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                            {isEditMode ? 'Modifier la section' : 'Ajouter une section'}
                        </SheetTitle>
                    </div>
                </div>

                {/* Body + Footer */}
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                        {/* Identification */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Identification</Eyebrow>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="sf-title" className={labelCn}>Titre *</Label>
                                    <Input
                                        id="sf-title"
                                        className={inputCn}
                                        {...register('title')}
                                        aria-invalid={errors.title ? 'true' : 'false'}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                    )}
                                </div>
                                <div className="w-40">
                                    <Label htmlFor="sf-path" className={labelCn}>Path *</Label>
                                    <Input
                                        id="sf-path"
                                        className={cn(inputCn, isEditMode && 'opacity-60 cursor-not-allowed')}
                                        {...register('path')}
                                        readOnly={isEditMode}
                                        aria-invalid={errors.path ? 'true' : 'false'}
                                    />
                                    {errors.path && (
                                        <p className="text-red-500 text-xs mt-1">{errors.path.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="sf-description" className={labelCn}>Description</Label>
                                <Textarea id="sf-description" className={inputCn} {...register('description')}/>
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Contenu */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Types de contenu</Eyebrow>
                            <div className="grid grid-cols-3 gap-2">
                                {AVAILABLE_CONTENTS.map((content) => (
                                    <label key={content} className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={contents.includes(content)}
                                            onCheckedChange={() => toggleContent(content)}
                                            aria-label={content}
                                        />
                                        <span className="text-sm text-brand-dark dark:text-bridge-100 capitalize">
                                            {content}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.contents && (
                                <p className="text-red-500 text-xs">{errors.contents.message}</p>
                            )}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Pédagogie */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Pédagogie</Eyebrow>
                            <div>
                                <Label htmlFor="sf-objectives" className={labelCn}>Objectifs</Label>
                                <Textarea
                                    id="sf-objectives"
                                    rows={4}
                                    className={inputCn}
                                    {...register('objectives')}
                                />
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">
                                    Un objectif par ligne
                                </span>
                            </div>
                            <div>
                                <Label htmlFor="sf-tags" className={labelCn}>Tags</Label>
                                <Textarea id="sf-tags" rows={2} className={inputCn} {...register('tags')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">
                                    Séparés par une virgule
                                </span>
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Paramètres */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Paramètres</Eyebrow>
                            <div className="flex gap-4">
                                <div className="w-28">
                                    <Label htmlFor="sf-duration" className={labelCn}>Séances *</Label>
                                    <Input
                                        id="sf-duration"
                                        type="number"
                                        min={1}
                                        className={inputCn}
                                        {...register('totalDuration')}
                                    />
                                    {errors.totalDuration && (
                                        <p className="text-red-500 text-xs mt-1">{errors.totalDuration.message}</p>
                                    )}
                                </div>
                                <div className="w-28">
                                    <Label htmlFor="sf-order" className={labelCn}>Position *</Label>
                                    <Input
                                        id="sf-order"
                                        type="number"
                                        min={1}
                                        className={inputCn}
                                        {...register('order')}
                                    />
                                    {errors.order && (
                                        <p className="text-red-500 text-xs mt-1">{errors.order.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(
                                    [
                                        {name: 'isAvailable', label: 'Disponible'},
                                        {name: 'hasCorrection', label: 'Correction'},
                                        {name: 'correctionIsAvailable', label: 'Correction disponible'},
                                        {name: 'examenIsLock', label: 'Examen verrouillé'},
                                    ] as const
                                ).map(({name, label}) => (
                                    <label key={name} className="flex items-center gap-2 cursor-pointer">
                                        <Controller
                                            name={name}
                                            control={control}
                                            render={({field}) => (
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            )}
                                        />
                                        <span className="text-sm text-brand-dark dark:text-bridge-100">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Footer sticky */}
                    <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-brand-dark dark:text-bridge-200"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className={cn('text-white font-semibold', `bg-${modData.path} hover:opacity-90`)}
                        >
                            {isEditMode ? 'Enregistrer' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
```

- [ ] **Step 2: Vérifier que `EditSectionFab` et `AddSectionButton` compilent toujours**

```bash
npm run lint
```

Attendu : aucune erreur sur `EditSectionFab.tsx` ni `AddSectionButton.tsx` (ils importent `Section` depuis `SectionForm`).

- [ ] **Step 3: Démarrer le serveur dev et tester le Sheet section**

```bash
npm run dev
```

Naviguer sur une page de section en tant qu'admin, cliquer le FAB d'édition, vérifier :
- Sheet s'ouvre depuis la droite
- Header a la bonne couleur du module
- Body beige clair / sombre selon le mode
- Champs pré-remplis en mode édition
- Validation Zod s'affiche sur les champs requis si soumis vide
- Après soumission : sheet se ferme et `router.refresh()` recharge les données

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/SectionForm.tsx
git commit -m "feat(admin): migrate SectionForm Dialog→Sheet with bridge UI and Zod validation"
```

---

### Task 5: `EditModuleSheet` + `EditModuleFab`

**Files:**
- Create: `src/components/admin/EditModuleSheet.tsx`
- Create: `src/components/admin/EditModuleFab.tsx`

`EditModuleSheet` reprend la même structure visuelle que `SectionForm` (header coloré `bg-${modulePath}`, body bridge, footer sticky) mais expose les champs du module : titre, description, icône, coefficients, responsable, intervenants, SAÉ.

`EditModuleFab` est un bouton flottant bas-droite calqué sur `EditSectionFab`, qui ouvre `EditModuleSheet`.

- [ ] **Step 1: Créer `src/components/admin/EditModuleSheet.tsx`**

```tsx
'use client';

import {useEffect} from 'react';
import {Controller, useFieldArray, useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Settings} from 'lucide-react';
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import {
    moduleFormSchema,
    type ModuleFormValues,
    FIXED_COMPETENCES,
    FIXED_SAES,
} from '@/lib/schemas/module.schema';

interface EditModuleSheetProps {
    module: Module;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ModuleFormValues) => Promise<void>;
}

function Eyebrow({children}: {children: React.ReactNode}) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
            {children}
        </p>
    );
}

export default function EditModuleSheet({
    module,
    open,
    onOpenChange,
    onSubmit,
}: EditModuleSheetProps) {
    const defaultValues: ModuleFormValues = {
        title: module.title,
        path: module.path,
        iconName: module.iconName,
        description: module.description ?? '',
        associatedSae: module.associatedSae ?? [],
        coefficients: FIXED_COMPETENCES.map((c) => ({
            competenceName: c,
            value: module.coefficients?.find((k) => k.competenceName === c)?.value ?? 0,
        })),
        manager: module.manager ?? {firstName: '', lastName: '', email: ''},
        instructors: module.instructors?.length
            ? module.instructors
            : [{firstName: '', lastName: '', email: ''}],
    };

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema),
        defaultValues,
    });

    const {fields: instructorFields, append: appendInstructor, remove: removeInstructor} =
        useFieldArray({control, name: 'instructors'});

    const selectedSaes = useWatch({control, name: 'associatedSae'}) ?? [];

    useEffect(() => {
        if (open) reset(defaultValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleFormSubmit = async (data: ModuleFormValues) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    const toggleSae = (sae: string) => {
        const current = selectedSaes;
        const next = current.includes(sae)
            ? current.filter((s) => s !== sae)
            : [...current, sae];
        // Use react-hook-form setValue via Controller or useFormContext
        // Since we're using useWatch, we need to use setValue
    };

    const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
    const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[520px]',
                    'bg-[#f7ebd9] dark:bg-[#13110d]',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white',
                )}
            >
                {/* Header */}
                <div
                    className={cn(
                        'relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0',
                        `bg-${module.path}`,
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                        <Settings className="w-5 h-5 text-white" aria-hidden="true"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">
                            Module
                        </p>
                        <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                            Modifier le module
                        </SheetTitle>
                    </div>
                </div>

                {/* Body + Footer */}
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                        {/* Identification */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Identification</Eyebrow>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="em-title" className={labelCn}>Titre *</Label>
                                    <Input id="em-title" className={inputCn} {...register('title')}/>
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                    )}
                                </div>
                                <div className="w-36">
                                    <Label htmlFor="em-icon" className={labelCn}>Icône *</Label>
                                    <Input id="em-icon" className={inputCn} {...register('iconName')}/>
                                    {errors.iconName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="em-desc" className={labelCn}>Description</Label>
                                <Textarea id="em-desc" rows={3} className={inputCn} {...register('description')}/>
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Coefficients */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Coefficients des compétences</Eyebrow>
                            {FIXED_COMPETENCES.map((competence, index) => (
                                <div key={competence} className="flex items-center gap-3">
                                    <span className="flex-1 text-sm text-brand-dark dark:text-bridge-100 min-w-0">
                                        {competence}
                                    </span>
                                    <input
                                        type="hidden"
                                        {...register(`coefficients.${index}.competenceName`)}
                                        value={competence}
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={1}
                                        className={cn(inputCn, 'w-20 text-center')}
                                        {...register(`coefficients.${index}.value`)}
                                    />
                                </div>
                            ))}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Équipe */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Responsable</Eyebrow>
                            <div className="grid grid-cols-3 gap-2">
                                <Input
                                    placeholder="Prénom"
                                    className={inputCn}
                                    {...register('manager.firstName')}
                                />
                                <Input
                                    placeholder="Nom"
                                    className={inputCn}
                                    {...register('manager.lastName')}
                                />
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    className={inputCn}
                                    {...register('manager.email')}
                                />
                            </div>
                            {errors.manager?.email && (
                                <p className="text-red-500 text-xs">{errors.manager.email.message}</p>
                            )}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        <section className="flex flex-col gap-3">
                            <Eyebrow>Intervenants</Eyebrow>
                            {instructorFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                    <Input
                                        placeholder="Prénom"
                                        className={inputCn}
                                        {...register(`instructors.${index}.firstName`)}
                                    />
                                    <Input
                                        placeholder="Nom"
                                        className={inputCn}
                                        {...register(`instructors.${index}.lastName`)}
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        className={inputCn}
                                        {...register(`instructors.${index}.email`)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-bridge-500 hover:text-red-500"
                                        onClick={() => removeInstructor(index)}
                                        aria-label="Supprimer l'intervenant"
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="self-start text-bridge-600 dark:text-bridge-300 hover:text-bridge-800"
                                onClick={() => appendInstructor({firstName: '', lastName: '', email: ''})}
                            >
                                + Ajouter un intervenant
                            </Button>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* SAÉ */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>SAÉ associées</Eyebrow>
                            <div className="flex flex-col gap-2">
                                {FIXED_SAES.map((sae) => (
                                    <label key={sae} className="flex items-center gap-2 cursor-pointer">
                                        <Controller
                                            control={control}
                                            name="associatedSae"
                                            render={({field}) => (
                                                <Checkbox
                                                    checked={field.value?.includes(sae)}
                                                    onCheckedChange={(checked) => {
                                                        const next = checked
                                                            ? [...(field.value ?? []), sae]
                                                            : (field.value ?? []).filter((s) => s !== sae);
                                                        field.onChange(next);
                                                    }}
                                                />
                                            )}
                                        />
                                        <span className="text-sm text-brand-dark dark:text-bridge-100">{sae}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Footer sticky */}
                    <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-brand-dark dark:text-bridge-200"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn('text-white font-semibold', `bg-${module.path} hover:opacity-90`)}
                        >
                            {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
```

**Note — `toggleSae` inutilisée :** Dans le code ci-dessus, le `toggleSae` défini initialement peut être supprimé car la gestion des SAÉ se fait via un `Controller` Checkbox directement.

- [ ] **Step 2: Créer `src/components/admin/EditModuleFab.tsx`**

```tsx
'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Settings} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import EditModuleSheet from '@/components/admin/EditModuleSheet';
import {ModuleFormValues} from '@/lib/schemas/module.schema';

interface EditModuleFabProps {
    module: Module;
}

export default function EditModuleFab({module}: EditModuleFabProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: ModuleFormValues) => {
        const res = await fetch(`/api/admin/modules/${module._id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            toast.error('Erreur lors de la mise à jour du module');
            throw new Error('API error');
        }

        toast.success('Module mis à jour');
        router.refresh();
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                aria-label="Modifier le module"
                title="Modifier le module"
                className={cn(
                    'fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg',
                    `bg-${module.path} hover:opacity-90`,
                )}
            >
                <Settings className="w-5 h-5"/>
            </Button>

            <EditModuleSheet
                module={module}
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
            />
        </>
    );
}
```

- [ ] **Step 3: Vérifier le lint et la compilation**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/EditModuleSheet.tsx src/components/admin/EditModuleFab.tsx
git commit -m "feat(admin): add EditModuleFab and EditModuleSheet for contextual module editing"
```

---

### Task 6: Intégration du FAB sur `/[moduleSlug]/page.tsx`

**Files:**
- Modify: `src/app/[moduleSlug]/page.tsx`

- [ ] **Step 1: Importer `EditModuleFab` et le rendre conditionnel**

Dans `src/app/[moduleSlug]/page.tsx`, ajouter l'import :

```ts
import EditModuleFab from "@/components/admin/EditModuleFab";
```

À la fin du JSX retourné, avant le dernier `</div>` fermant, ajouter :

```tsx
{isAdmin && <EditModuleFab module={currentModule}/>}
```

Le placement après `<PageFooter>` suffit — le FAB est `fixed` donc indépendant du flux.

- [ ] **Step 2: Vérifier le lint**

```bash
npm run lint
```

- [ ] **Step 3: Tester dans le navigateur**

Naviguer sur `/html-css` (ou un autre module) en étant connecté admin. Vérifier :
- Un bouton rond s'affiche en bas-droite avec l'icône `Settings`
- Un clic ouvre le Sheet
- Les données actuelles du module sont pré-remplies
- Modifier le titre, soumettre → le titre se met à jour après `router.refresh()`
- En tant que non-admin, le FAB n'apparaît pas

- [ ] **Step 4: Commit**

```bash
git add src/app/[moduleSlug]/page.tsx
git commit -m "feat(module-page): add EditModuleFab for admin contextual editing"
```

---

### Task 7: Composants utilisateurs — `UsersTable`, `UserRow`, `DeleteUserDialog`

**Files:**
- Create: `src/components/admin/users/UsersTable.tsx`
- Create: `src/components/admin/users/UserRow.tsx`
- Create: `src/components/admin/users/DeleteUserDialog.tsx`

#### Type partagé

Les trois composants utilisent le type `AdminUser`. Le définir en tête de `UsersTable.tsx` (pas dans un fichier séparé — les types inférés sont trop simples pour mériter leur propre fichier).

#### Fonction d'avatar

L'initiale fallback utilise une palette oklch dérivée du nom par hash simple, sans dépendre des noms de classes Tailwind des modules.

- [ ] **Step 1: Créer `src/components/admin/users/DeleteUserDialog.tsx`**

```tsx
'use client';

import {useState} from 'react';
import {Trash2} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

interface DeleteUserDialogProps {
    userId: string;
    userName: string;
    onDeleted: (userId: string) => void;
}

export default function DeleteUserDialog({userId, userName, onDeleted}: DeleteUserDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {method: 'DELETE'});
            if (res.ok) onDeleted(userId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-bridge-400 hover:text-red-500 hover:bg-red-500/10"
                    aria-label={`Supprimer ${userName}`}
                >
                    <Trash2 className="w-4 h-4"/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
                className={cn(
                    'bg-[#f7ebd9] dark:bg-[#13110d]',
                    'border border-bridge-500/45',
                    'shadow-[0_22px_44px_-14px_rgba(147,97,58,0.45)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.7)]',
                )}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-brand-dark dark:text-bridge-100">
                        Supprimer le compte ?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-bridge-600 dark:text-bridge-400">
                        Le compte de <strong className="text-brand-dark dark:text-bridge-200">{userName}</strong> sera
                        définitivement supprimé. Cette action est irréversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-bridge-500/45">Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? 'Suppression…' : 'Supprimer'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
```

Si `AlertDialog` n'est pas encore installé, l'ajouter via :
```bash
npx shadcn@latest add alert-dialog
```

- [ ] **Step 2: Créer `src/components/admin/users/UserRow.tsx`**

```tsx
'use client';

import {KeyRound} from 'lucide-react';
import {useState} from 'react';
import Image from 'next/image';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import DeleteUserDialog from '@/components/admin/users/DeleteUserDialog';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
    createdAt: string; // ISO string (sérialisé depuis le Server Component)
    group?: string;
}

// Palette oklch pour les avatars fallback
const AVATAR_PALETTE = [
    'oklch(52% 0.16 27)',   // terracotta
    'oklch(52% 0.18 250)',  // steel-blue
    'oklch(48% 0.17 145)',  // forest-green
    'oklch(50% 0.20 295)',  // plum
    'oklch(55% 0.15 60)',   // amber
    'oklch(50% 0.16 190)',  // teal
];

function avatarColor(name: string): string {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
    return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0] ?? '')
        .join('')
        .toUpperCase();
}

interface UserRowProps {
    user: AdminUser;
    onDeleted: (userId: string) => void;
}

export default function UserRow({user, onDeleted}: UserRowProps) {
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        setResetting(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: user.email}),
            });
            if (res.ok) {
                toast.success(`Email de réinitialisation envoyé à ${user.email}`);
            } else {
                toast.error('Erreur lors de l\'envoi');
            }
        } finally {
            setResetting(false);
        }
    };

    const formattedDate = new Date(user.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <tr className="border-t border-bridge-700/10 dark:border-bridge-500/10">
            {/* Utilisateur */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white select-none">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span style={{backgroundColor: avatarColor(user.name)}} className="w-full h-full flex items-center justify-center">
                                {getInitials(user.name)}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-brand-dark dark:text-bridge-100 leading-tight truncate">
                            {user.name}
                        </span>
                        <span className="text-xs text-bridge-500 dark:text-bridge-400 truncate">{user.email}</span>
                    </div>
                </div>
            </td>
            {/* Groupe */}
            <td className="px-4 py-3">
                <span className="text-sm text-brand-dark dark:text-bridge-100">
                    {user.group ?? '—'}
                </span>
            </td>
            {/* Rôle */}
            <td className="px-4 py-3">
                <span
                    className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold',
                        user.role === 'admin'
                            ? 'bg-bridge-700 text-white dark:bg-bridge-600'
                            : 'bg-bridge-200/60 dark:bg-bridge-700/60 text-bridge-700 dark:text-bridge-200',
                    )}
                >
                    {user.role}
                </span>
            </td>
            {/* Créé le */}
            <td className="px-4 py-3">
                <span className="text-sm text-bridge-500 dark:text-bridge-400">{formattedDate}</span>
            </td>
            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200 hover:bg-bridge-500/10"
                        aria-label={`Réinitialiser le mot de passe de ${user.name}`}
                        onClick={handleReset}
                        disabled={resetting}
                    >
                        <KeyRound className="w-4 h-4"/>
                    </Button>
                    <DeleteUserDialog
                        userId={user.id}
                        userName={user.name}
                        onDeleted={onDeleted}
                    />
                </div>
            </td>
        </tr>
    );
}
```

- [ ] **Step 3: Créer `src/components/admin/users/UsersTable.tsx`**

```tsx
'use client';

import {useState} from 'react';
import UserRow, {type AdminUser} from '@/components/admin/users/UserRow';
import {cn} from '@/lib/utils';

interface UsersTableProps {
    users: AdminUser[];
}

const COLUMNS = ['Utilisateur', 'Groupe', 'Rôle', 'Créé le', 'Actions'] as const;

export default function UsersTable({users: initialUsers}: UsersTableProps) {
    const [users, setUsers] = useState(initialUsers);

    const handleDeleted = (userId: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const eyebrowCn = "text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 px-4 py-2 text-left whitespace-nowrap";

    return (
        <div
            className={cn(
                'rounded-xl border border-bridge-500/45 overflow-hidden',
                'bg-[#f7ebd9] dark:bg-[#13110d]',
                'shadow-[0_4px_16px_-4px_rgba(147,97,58,0.15)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]',
            )}
        >
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-bridge-700/20 dark:border-bridge-500/20">
                            {COLUMNS.map((col) => (
                                <th key={col} className={eyebrowCn}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-bridge-500 dark:text-bridge-400">
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <UserRow key={user.id} user={user} onDeleted={handleDeleted}/>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-2 border-t border-bridge-700/10 dark:border-bridge-500/10">
                <p className="text-[11px] text-bridge-400 dark:text-bridge-500">
                    {users.length} utilisateur{users.length !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Vérifier si `alert-dialog` est déjà dans le projet**

```bash
# Vérifier l'existence du composant
ls src/components/ui/alert-dialog.tsx 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

Si `MISSING`, l'installer :
```bash
npx shadcn@latest add alert-dialog
```

- [ ] **Step 5: Vérifier le lint**

```bash
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/users/
git commit -m "feat(admin): add UsersTable, UserRow and DeleteUserDialog components"
```

---

### Task 8: Page `/admin` — Remplacement par `UsersTable`

**Files:**
- Modify: `src/app/admin/page.tsx`

La page devient un Server Component qui charge les utilisateurs via `auth.api.listUsers` et les passe à `UsersTable`. Les dates `createdAt` sont sérialisées en ISO string avant d'être passées au Client Component.

- [ ] **Step 1: Réécrire `src/app/admin/page.tsx`**

```tsx
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {getServerSession} from "@/lib/auth";
import {notFound} from "next/navigation";
import UsersTable from "@/components/admin/users/UsersTable";
import type {AdminUser} from "@/components/admin/users/UserRow";
import {AddModuleButton} from "@/components/admin/AddModuleButton"; // conservé si déjà utilisé ailleurs
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Administration — Gestion des utilisateurs",
};

export default async function AdminPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const result = await auth.api.listUsers({
        headers: await headers(),
        query: {limit: "200"},
    });

    const users: AdminUser[] = (result?.users ?? []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image ?? null,
        role: (u as {role?: string}).role ?? "user",
        createdAt: u.createdAt instanceof Date
            ? u.createdAt.toISOString()
            : String(u.createdAt),
        group: (u as {group?: string}).group,
    }));

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                    Administration
                </p>
                <h1 className="text-2xl font-bold text-brand-dark dark:text-bridge-100">
                    Gestion des utilisateurs
                </h1>
            </div>
            <UsersTable users={users}/>
        </div>
    );
}
```

**Note :** `AddModuleButton` n'est pas affiché dans la nouvelle `/admin` — il reste fonctionnel dans `ModulesList.tsx` et pourra être réintégré dans une V2. Supprimer cet import si TypeScript se plaint de l'import inutilisé.

- [ ] **Step 2: Vérifier le lint et la compilation**

```bash
npm run lint
```

S'il y a des erreurs de type sur `auth.api.listUsers` (champs `role`, `group` non déclarés dans le type), utiliser le cast `(u as Record<string, unknown>)` ou les assertions de type déjà présentes dans le code ci-dessus.

- [ ] **Step 3: Tester dans le navigateur**

```bash
npm run dev
```

Naviguer sur `/admin` en étant connecté admin. Vérifier :
- Tableau avec toutes les colonnes (Utilisateur, Groupe, Rôle, Créé le, Actions)
- Avatars : image de profil si disponible, sinon initiales colorées
- Clic sur la corbeille → dialog de confirmation → après confirmation, la ligne disparaît
- Clic sur la clé → toast de succès (email envoyé si Resend est configuré)
- En dev local sans Resend, l'endpoint répond `200 {success: true}` sans envoyer d'email (comportement attendu)

- [ ] **Step 4: Commit final**

```bash
git add src/app/admin/page.tsx
git commit -m "feat(admin): replace accordion with UsersTable — admin is now user management only"
```

---

## Post-implémentation

Après que toutes les tâches passent, lancer un build complet pour détecter les erreurs TypeScript et d'import :

```bash
npm run build
```

Pour le polish visuel des Sheets et du tableau, utiliser :
```
/impeccable craft src/components/admin/SectionForm.tsx
/impeccable craft src/components/admin/users/UsersTable.tsx
```
