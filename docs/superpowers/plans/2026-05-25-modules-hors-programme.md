# Modules hors programme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un flag `isExtra` sur les modules pour les masquer de la nav et de la grille principale, et les exposer via une section "Voir plus" dépliable sur la home (connectés uniquement).

**Architecture:** Champ `isExtra?: boolean` ajouté au type `Module` et au schéma Zod ; filtrage dans `NavBar.tsx` (server) et `page.tsx` (server) ; section toggle rendue par un nouveau composant client `ExtraModulesSection` ; switch shadcn ajouté dans les deux formulaires admin.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, MongoDB (driver natif), Zod, react-hook-form + zodResolver, shadcn/ui (`Switch`, `Controller`), Tailwind CSS v4, bun:test.

---

## Fichiers touchés

| Action | Fichier |
|--------|---------|
| Modify | `src/types/Module.ts` |
| Modify | `src/lib/schemas/module.schema.ts` |
| Modify | `tests/api/admin/modules.test.ts` |
| Modify | `src/components/NavBar.tsx` |
| **Create** | `src/components/page/ExtraModulesSection.tsx` |
| Modify | `src/app/page.tsx` |
| Modify | `src/components/admin/AddModuleButton.tsx` |
| Modify | `src/components/admin/EditModuleSheet.tsx` |

---

## Task 1 — Type `Module` + schéma Zod

**Files:**
- Modify: `src/types/Module.ts`
- Modify: `src/lib/schemas/module.schema.ts`

- [ ] **Étape 1 : Ajouter `isExtra` au type `Module`**

Remplacer le contenu de `src/types/Module.ts` :

```ts
import Section from "@/types/Section";
import {ObjectId} from "bson";
import Instructor from "@/types/Instructor";
import Coefficient from "@/types/Coefficient";

export default interface Module {
    _id: string | ObjectId;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
    coefficients?: Coefficient[];
    instructors?: Instructor[];
    manager?: Instructor;
    associatedSae: string[];
    isExtra?: boolean;
}
```

- [ ] **Étape 2 : Ajouter `isExtra` au schéma Zod**

Dans `src/lib/schemas/module.schema.ts`, ajouter `isExtra` à la fin de `moduleFormSchema` (avant la parenthèse fermante de `z.object({...})`) :

```ts
export const moduleFormSchema = z.object({
    title: z.string().min(1, "Le titre est obligatoire"),
    path: z.string().min(1, "Le path est obligatoire"),
    iconName: z.string().min(1, "L'icône est obligatoire"),
    description: z.string().optional(),
    associatedSae: z.array(z.string()).default([]),
    coefficients: z.array(z.object({
        competenceName: z.string(),
        value: z.number().int().min(0).max(100),
    })),
    manager: instructorSchema.optional(),
    instructors: z.array(instructorSchema).default([]),
    isExtra: z.boolean().default(false),
});
```

- [ ] **Étape 3 : Vérifier qu'il n'y a pas d'erreurs TypeScript**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Étape 4 : Commit**

```bash
git add src/types/Module.ts src/lib/schemas/module.schema.ts
git commit -m "feat: add isExtra flag to Module type and schema"
```

---

## Task 2 — Mise à jour de la fixture de test

**Files:**
- Modify: `tests/api/admin/modules.test.ts`

- [ ] **Étape 1 : Vérifier que les tests passent avant le changement**

```bash
bun test tests/api/admin/modules.test.ts
```

Résultat attendu : 8 pass, 0 fail (Zod `.default(false)` complète automatiquement le champ absent).

- [ ] **Étape 2 : Ajouter `isExtra` dans `VALID_MODULE`**

Dans `tests/api/admin/modules.test.ts`, modifier la constante `VALID_MODULE` :

```ts
const VALID_MODULE = {
    title: "JavaScript",
    path: "javascript",
    iconName: "js",
    description: "Cours JS",
    associatedSae: [],
    coefficients: [{ competenceName: "1/ Réaliser un développement", value: 10 }],
    instructors: [],
    isExtra: false,
};
```

- [ ] **Étape 3 : Relancer les tests**

```bash
bun test tests/api/admin/modules.test.ts
```

Résultat attendu : 8 pass, 0 fail.

- [ ] **Étape 4 : Vérifier la suite complète**

```bash
bun test
```

Résultat attendu : 50 pass, 0 fail.

- [ ] **Étape 5 : Commit**

```bash
git add tests/api/admin/modules.test.ts
git commit -m "test: add isExtra to VALID_MODULE fixture"
```

---

## Task 3 — Filtrage NavBar

**Files:**
- Modify: `src/components/NavBar.tsx`

- [ ] **Étape 1 : Filtrer les modules `isExtra` dans NavBar**

Dans `src/components/NavBar.tsx`, modifier la ligne de récupération des modules :

```ts
// Avant :
const modules = await getModules();

// Après :
const modules = (await getModules()).filter(m => !m.isExtra);
```

Le fichier complet après modification :

```ts
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import getModules from "@/lib/getModules";
import NavBarClient from "./NavBarClient";

export default async function NavBar() {
    const session = await auth.api.getSession({headers: await headers()});
    const modules = (await getModules()).filter(m => !m.isExtra);

    const safeUser = session
        ? {
            id: session.user.id,
            username: session.user.name ?? null,
            imageUrl: session.user.image ?? null,
            email: session.user.email ?? null,
        }
        : null;

    return (
        <NavBarClient
            userId={session?.user.id ?? null}
            role={session?.user.role ?? ""}
            user={safeUser}
            modules={modules}
        />
    );
}
```

- [ ] **Étape 2 : Vérifier le lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add src/components/NavBar.tsx
git commit -m "feat: exclude isExtra modules from navbar"
```

---

## Task 4 — Composant `ExtraModulesSection`

**Files:**
- Create: `src/components/page/ExtraModulesSection.tsx`

- [ ] **Étape 1 : Créer le composant**

Créer `src/components/page/ExtraModulesSection.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ModuleCard from '@/components/Cards/ModuleCard';
import type Module from '@/types/Module';

type Props = {
    modules: (Module & { _id: string })[];
};

export default function ExtraModulesSection({ modules }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 mt-2 mb-8 flex flex-col items-center gap-4">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/60 dark:text-bridge-200/60 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors"
            >
                {open
                    ? <><ChevronUp className="w-3.5 h-3.5" /> Voir moins</>
                    : <><ChevronDown className="w-3.5 h-3.5" /> Voir plus</>
                }
            </button>

            {open && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
                    {modules.map((currentModule, index) => (
                        <div
                            key={`${currentModule.path}_extra_${index}`}
                            className="opacity-0 animate-fade-in-up w-full"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <ModuleCard currentModule={currentModule} isAuthed={true} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Étape 2 : Vérifier le lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add src/components/page/ExtraModulesSection.tsx
git commit -m "feat: add ExtraModulesSection toggle component"
```

---

## Task 5 — Home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Étape 1 : Mettre à jour `page.tsx`**

Remplacer le contenu de `src/app/page.tsx` :

```tsx
import ModuleCard from "@/components/Cards/ModuleCard";
import Link from "next/link";
import {ArrowRight, Lock} from "lucide-react";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import AboutSection from "@/components/page/AboutSection";
import AuthCTAPair from "@/components/page/AuthCTAPair";
import PageFooter from "@/components/page/PageFooter";
import ExtraModulesSection from "@/components/page/ExtraModulesSection";
import {Button} from "@/components/ui/button";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {Metadata} from "next";
import AdminHomeFab from "@/components/admin/AdminHomeFab";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Développement Web | Salim Khraimeche",
    noIndex: false,
});

export default async function Home() {
    const session = await getServerSession();
    const isAuthed = !!session;

    const allModules = await getModules();
    const programModules = isAuthed ? allModules.filter(m => !m.isExtra) : [];
    const extraModules   = isAuthed ? allModules.filter(m => m.isExtra)  : [];

    return (
        <main className="flex flex-col w-full items-center justify-start min-h-screen bg-brand-light dark:bg-brand-dark">
            <HeroSection
                title="Développement Web"
                description={
                    isAuthed
                        ? "Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les frameworks modernes."
                        : "Plateforme dédiée aux étudiants de l'IUT. Cours, TP, slides et examens en HTML/CSS, JavaScript, PHP et plus."
                }
                imagePath="/images/header/pont.png"
                imageAlt="Pont en bois clair traversé par la lumière"
            >
                {isAuthed ? (
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="group h-auto rounded-lg border-2 border-brand-accent-dark bg-transparent text-brand-dark dark:text-brand-light hover:bg-brand-accent-dark hover:text-white hover:border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-none transition-all duration-300"
                    >
                        <Link href="#cours">
                            Voir les cours
                            <ArrowRight
                                className="size-4 text-brand-accent-dark group-hover:text-white transition-all duration-300 group-hover:translate-x-1"/>
                        </Link>
                    </Button>
                ) : (
                    <AuthCTAPair/>
                )}
            </HeroSection>

            <div id="cours" className="w-full mt-8">
                <CoursesSection
                    title="Liste des cours"
                    containerClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full"
                >
                    {programModules.map((currentModule, index) => (
                        <div
                            key={`${currentModule.path}_${index}`}
                            className="opacity-0 animate-fade-in-up w-full"
                            style={{animationDelay: `${index * 0.1}s`}}
                        >
                            <ModuleCard currentModule={currentModule} isAuthed={isAuthed}/>
                        </div>
                    ))}
                </CoursesSection>
            </div>

            {isAuthed && extraModules.length > 0 && (
                <ExtraModulesSection modules={extraModules} />
            )}

            {!isAuthed && (
                <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-8 lg:-mt-12 mb-16 lg:mb-24 flex flex-col items-center gap-5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/60 dark:text-bridge-200/60">
                        <Lock className="w-3 h-3"/>
                        Accessible après connexion
                    </span>
                    <AuthCTAPair className="justify-center"/>
                </section>
            )}

            {session?.user.role === 'admin' && <AdminHomeFab />}

            <AboutSection/>

            <PageFooter/>
        </main>
    );
}
```

- [ ] **Étape 2 : Vérifier le lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: hide modules from unauthenticated users, add extra modules section"
```

---

## Task 6 — `AddModuleButton` — champ `isExtra`

**Files:**
- Modify: `src/components/admin/AddModuleButton.tsx`

- [ ] **Étape 1 : Mettre à jour `AddModuleButton.tsx`**

Remplacer le contenu de `src/components/admin/AddModuleButton.tsx` :

```tsx
'use client';

import {useEffect, useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {Sheet, SheetContent, SheetTitle, SheetDescription} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import Section from "@/types/Section";
import Coefficient from "@/types/Coefficient";
import Instructor from "@/types/Instructor";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {FIXED_COMPETENCES, FIXED_SAES} from "@/lib/schemas/module.schema";

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
        isExtra?: boolean;
    }) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultPath?: string;
}

type FormData = {
    title: string;
    path: string;
    iconName: string;
    description?: string;
    associatedSae: string[];
    coefficients: Coefficient[];
    manager: Instructor;
    instructors: Instructor[];
    isExtra: boolean;
};

const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

export default function AddModuleButton({onAdd, open: controlledOpen, onOpenChange, defaultPath}: AddModuleButtonProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

    const {register, handleSubmit, control, setValue, reset, formState: {errors}} = useForm<FormData>({
        defaultValues: {
            path: defaultPath ?? '',
            coefficients: FIXED_COMPETENCES.map(c => ({competenceName: c, value: 0})),
            instructors: [{firstName: "", lastName: "", email: ""}],
            manager: {firstName: "", lastName: "", email: ""},
            isExtra: false,
        }
    });

    const title = useWatch({control, name: "title"});
    const instructors = useWatch({control, name: "instructors"});

    useEffect(() => {
        if (!defaultPath && title) {
            setValue("path", title.toLowerCase().replace(/\s+/g, '-'));
        }
    }, [title, setValue, defaultPath]);

    const onSubmit = (data: FormData) => {
        onAdd({
            ...data,
            sections: [],
        });
        reset();
        setOpen(false);
    };

    return (
        <>
            {!isControlled && (
                <div className="flex justify-end">
                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-accent-dark"
                    >
                        Ajouter un module
                    </Button>
                </div>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
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
                    <div className="relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0 bg-brand-primary">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">
                                Module
                            </p>
                            <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                                Ajouter un nouveau module
                            </SheetTitle>
                        </div>
                        <SheetDescription className="sr-only">
                            Formulaire de création d&apos;un nouveau module
                        </SheetDescription>
                    </div>

                    {/* Body + Footer */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                            {/* Titre + Path */}
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div className="flex-1">
                                    <Label htmlFor="am-title" className={labelCn}>Titre *</Label>
                                    <Input
                                        id="am-title"
                                        className={inputCn}
                                        {...register("title", {required: "Le titre est obligatoire"})}
                                        aria-invalid={errors.title ? "true" : "false"}
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                                </div>
                                <div className="w-36">
                                    <Label htmlFor="am-path" className={labelCn}>Path *</Label>
                                    <Input
                                        id="am-path"
                                        className={inputCn}
                                        {...register("path", {required: "Le path est obligatoire"})}
                                        aria-invalid={errors.path ? "true" : "false"}
                                    />
                                    {errors.path && <p className="text-red-500 text-xs mt-1">{errors.path.message}</p>}
                                </div>
                            </div>

                            {/* Icon */}
                            <div>
                                <Label htmlFor="am-icon" className={labelCn}>Icon Name *</Label>
                                <Input
                                    id="am-icon"
                                    className={inputCn}
                                    {...register("iconName", {required: "L'icône est obligatoire"})}
                                    aria-invalid={errors.iconName ? "true" : "false"}
                                />
                                {errors.iconName && <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="am-description" className={labelCn}>Description</Label>
                                <Textarea id="am-description" className={inputCn} {...register("description")}/>
                            </div>

                            {/* Hors programme */}
                            <Controller
                                control={control}
                                name="isExtra"
                                render={({field}) => (
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="am-isExtra"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <Label htmlFor="am-isExtra" className={cn(labelCn, 'cursor-pointer font-normal')}>
                                            Hors programme
                                        </Label>
                                    </div>
                                )}
                            />

                            {/* Coefficients */}
                            <div>
                                <Label className={labelCn}>Coefficients</Label>
                                <div className="space-y-2 mt-1">
                                    {FIXED_COMPETENCES.map((competence, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <span className="flex-1 text-sm text-brand-dark dark:text-bridge-100">{competence}</span>
                                            <Input
                                                type="number"
                                                step="1"
                                                className={cn(inputCn, "w-20 text-center")}
                                                {...register(`coefficients.${index}.value` as const, {valueAsNumber: true})}
                                            />
                                            <input
                                                type="hidden"
                                                {...register(`coefficients.${index}.competenceName` as const)}
                                                value={competence}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Responsable */}
                            <div>
                                <Label className={labelCn}>Responsable du module</Label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    <Input placeholder="Prénom" className={inputCn} {...register("manager.firstName")}/>
                                    <Input placeholder="Nom" className={inputCn} {...register("manager.lastName")}/>
                                    <Input placeholder="Email" type="email" className={inputCn} {...register("manager.email")}/>
                                </div>
                            </div>

                            {/* Enseignants */}
                            <div>
                                <Label className={labelCn}>Enseignants</Label>
                                <div className="space-y-2 mt-1">
                                    {instructors.map((_, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-2">
                                            <Input placeholder="Prénom" className={inputCn} {...register(`instructors.${index}.firstName` as const)}/>
                                            <Input placeholder="Nom" className={inputCn} {...register(`instructors.${index}.lastName` as const)}/>
                                            <Input placeholder="Email" type="email" className={inputCn} {...register(`instructors.${index}.email` as const)}/>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SAÉ */}
                            <div>
                                <Label className={labelCn}>SAÉ associées</Label>
                                <select
                                    multiple
                                    className="mt-1 border border-bridge-500/45 rounded-md p-2 w-full bg-bridge-100/60 dark:bg-bridge-800/60"
                                    {...register("associatedSae")}
                                >
                                    {FIXED_SAES.map((sae, index) => (
                                        <option key={index} value={sae}>{sae}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Footer sticky */}
                        <div className="shrink-0 border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-brand-dark dark:text-bridge-200"
                                onClick={() => setOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-primary text-white hover:bg-brand-accent-dark"
                            >
                                Ajouter
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
```

- [ ] **Étape 2 : Vérifier le lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add src/components/admin/AddModuleButton.tsx
git commit -m "feat: add isExtra switch to AddModuleButton form"
```

---

## Task 7 — `EditModuleSheet` — champ `isExtra`

**Files:**
- Modify: `src/components/admin/EditModuleSheet.tsx`

- [ ] **Étape 1 : Ajouter l'import de `Switch`**

Dans `src/components/admin/EditModuleSheet.tsx`, ajouter l'import de `Switch` après l'import de `Checkbox` (ligne 12) :

```ts
import {Switch} from '@/components/ui/switch';
```

- [ ] **Étape 2 : Ajouter `isExtra` dans `getDefaultValues`**

Dans `EditModuleSheet.tsx`, mettre à jour la fonction `getDefaultValues` pour inclure `isExtra` :

```ts
const getDefaultValues = useCallback((): ModuleFormValues => ({
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
    isExtra: module.isExtra ?? false,
}), [module]);
```

- [ ] **Étape 3 : Ajouter le switch `isExtra` dans le formulaire**

Dans la `<section>` d'Identification (après le champ Description, avant la fermeture `</section>`), ajouter le bloc suivant :

```tsx
<Controller
    control={control}
    name="isExtra"
    render={({field}) => (
        <div className="flex items-center gap-3">
            <Switch
                id="em-isExtra"
                checked={field.value}
                onCheckedChange={field.onChange}
            />
            <Label htmlFor="em-isExtra" className={cn(labelCn, 'cursor-pointer font-normal')}>
                Hors programme
            </Label>
        </div>
    )}
/>
```

La section Identification complète devient :

```tsx
{/* Identification */}
<section className="flex flex-col gap-3">
    <Eyebrow>Identification</Eyebrow>
    <div className="flex gap-3">
        <div className="flex-1">
            <Label htmlFor="em-title" className={labelCn}>Titre *</Label>
            <Input
                id="em-title"
                className={inputCn}
                {...register('title')}
                aria-invalid={errors.title ? 'true' : 'false'}
            />
            {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
        </div>
        <div className="w-36">
            <Label htmlFor="em-icon" className={labelCn}>Icône *</Label>
            <Input
                id="em-icon"
                className={inputCn}
                {...register('iconName')}
                aria-invalid={errors.iconName ? 'true' : 'false'}
            />
            {errors.iconName && (
                <p className="text-red-500 text-xs mt-1">{errors.iconName.message}</p>
            )}
        </div>
    </div>
    <div className="w-36">
        <Label htmlFor="em-path" className={labelCn}>Path</Label>
        <Input
            id="em-path"
            className={cn(inputCn, 'opacity-60 cursor-not-allowed')}
            {...register('path')}
            readOnly
        />
    </div>
    <div>
        <Label htmlFor="em-desc" className={labelCn}>Description</Label>
        <Textarea id="em-desc" rows={3} className={inputCn} {...register('description')}/>
    </div>
    <Controller
        control={control}
        name="isExtra"
        render={({field}) => (
            <div className="flex items-center gap-3">
                <Switch
                    id="em-isExtra"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
                <Label htmlFor="em-isExtra" className={cn(labelCn, 'cursor-pointer font-normal')}>
                    Hors programme
                </Label>
            </div>
        )}
    />
</section>
```

- [ ] **Étape 4 : Vérifier le lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur.

- [ ] **Étape 5 : Relancer tous les tests**

```bash
bun test
```

Résultat attendu : 50 pass, 0 fail.

- [ ] **Étape 6 : Commit final**

```bash
git add src/components/admin/EditModuleSheet.tsx
git commit -m "feat: add isExtra switch to EditModuleSheet form"
```
