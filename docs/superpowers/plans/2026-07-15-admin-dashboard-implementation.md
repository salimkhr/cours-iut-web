# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer `/admin` en tableau de bord a onglets qui centralise modules, sections, utilisateurs et outils, sans FAB admin et sans action de synchronisation.

**Architecture:** `/admin` reste un Server Component qui verifie la session admin, charge les utilisateurs et les modules, puis delegue l'interface interactive a des Client Components. Les onglets, libelles et outils visibles sont centralises dans une petite configuration testee. Les composants admin existants sont renforces plutot que remplaces.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, Tailwind CSS v4, shadcn/Radix Tabs/Dialog/Sheet, lucide-react, bun:test.

## Global Constraints

- `/admin` devient un tableau de bord a onglets.
- L'onglet par defaut est `Modules & sections`.
- Il n'y a plus de FAB admin sur la home.
- Toutes les actions admin sont deplacees dans `/admin`.
- L'action `Synchroniser les cours` est retiree.
- Les utilisateurs restent gerables, mais dans un onglet dedie.
- Les outils secondaires sont regroupes dans `Outils`.
- Pas de bleu admin generique.
- Pas de section hero marketing.
- Ne pas ajouter de dependance.
- Ne pas importer de code serveur depuis un Client Component.
- Verification finale obligatoire : `bun test`, `bun run lint`, `bun run build`.

---

## File Map

- Create: `src/components/admin/adminDashboardConfig.ts`
  - Source de verite client-safe pour les valeurs d'onglets et les outils visibles.
- Create: `src/components/admin/adminDashboardConfig.test.ts`
  - Tests bun garantissant l'onglet par defaut et l'absence de synchronisation.
- Create: `src/components/admin/AdminToolsPanel.tsx`
  - Onglet `Outils`, avec migration, export/import, calibrage pedagogique et pedagogie.
- Modify: `src/app/admin/page.tsx`
  - Charge utilisateurs + modules et rend le dashboard a onglets.
- Modify: `src/components/admin/AdminTabs.tsx`
  - Devient le shell d'onglets `Modules & sections`, `Utilisateurs`, `Outils`.
- Modify: `src/components/admin/ModulesList.tsx`
  - Ajoute l'en-tete de l'onglet modules et gere les creations via `router.refresh`.
- Modify: `src/components/admin/AdminModule.tsx`
  - Ajoute les actions module inline : masquer/afficher, modifier, ajouter section, supprimer.
- Modify: `src/components/admin/AdminSection.tsx`
  - Ajoute liens d'edition de contenu, toggles robustes, actions section inline.
- Modify: `src/app/page.tsx`
  - Retire le FAB admin de la home.
- Modify: `src/app/[moduleSlug]/page.tsx`
  - Retire le FAB admin module.
- Modify: `src/app/[moduleSlug]/[sectionSlug]/page.tsx`
  - Retire le FAB admin section.
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`
  - Retire le FAB d'edition contenu.
- Modify: `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx`
  - Retire le FAB d'edition slide.
- Modify: `src/components/admin/SectionForm.tsx`
  - Corrige le commentaire de retrocompatibilite si les FAB sont supprimes.
- Delete: `src/components/admin/AdminHomeFab.tsx`
- Delete: `src/components/admin/AdminModuleFab.tsx`
- Delete: `src/components/admin/EditModuleFab.tsx`
- Delete: `src/components/admin/AddModuleFab.tsx`
- Delete: `src/components/admin/AddSectionFab.tsx`
- Delete: `src/components/admin/EditSectionFab.tsx`
- Delete: `src/components/admin/EditContentFab.tsx`
- Delete: `src/components/admin/SyncSheet.tsx`
  - Delete it only after `rg "SyncSheet" src -n` confirms it has no remaining imports.
  - Do not delete `src/app/api/admin/sync/route.ts` in this plan; the requirement is de l'exclure de l'UI.

---

### Task 1: Dashboard Config

**Files:**
- Create: `src/components/admin/adminDashboardConfig.ts`
- Create: `src/components/admin/adminDashboardConfig.test.ts`

**Interfaces:**
- Produces:
  - `type AdminTabValue = "modules" | "users" | "tools"`
  - `type AdminToolActionId = "migration" | "export-import" | "calibrage" | "pedagogie"`
  - `interface AdminToolAction`
  - `ADMIN_DEFAULT_TAB: AdminTabValue`
  - `ADMIN_TABS: readonly { value: AdminTabValue; label: string; description: string }[]`
  - `ADMIN_TOOL_ACTIONS: readonly AdminToolAction[]`
- Consumes: none.

- [ ] **Step 1: Write the config test first**

Create `src/components/admin/adminDashboardConfig.test.ts`:

```ts
import {describe, expect, it} from "bun:test";
import {ADMIN_DEFAULT_TAB, ADMIN_TABS, ADMIN_TOOL_ACTIONS} from "./adminDashboardConfig";

describe("adminDashboardConfig", () => {
    it("ouvre Modules & sections par defaut", () => {
        expect(ADMIN_DEFAULT_TAB).toBe("modules");
        expect(ADMIN_TABS[0]).toEqual({
            value: "modules",
            label: "Modules & sections",
            description: "Pilotez les modules, les sections, les verrous et les contenus.",
        });
    });

    it("expose les outils admin sans synchronisation", () => {
        const labels = ADMIN_TOOL_ACTIONS.map((action) => `${action.id} ${action.title} ${action.description}`.toLowerCase());

        expect(ADMIN_TOOL_ACTIONS.map((action) => action.id)).toEqual([
            "migration",
            "export-import",
            "calibrage",
            "pedagogie",
        ]);
        expect(labels.some((label) => label.includes("synchron"))).toBe(false);
    });
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run: `bun test src/components/admin/adminDashboardConfig.test.ts`

Expected: FAIL because `./adminDashboardConfig` does not exist.

- [ ] **Step 3: Add the config**

Create `src/components/admin/adminDashboardConfig.ts`:

```ts
export type AdminTabValue = "modules" | "users" | "tools";
export type AdminToolActionId = "migration" | "export-import" | "calibrage" | "pedagogie";

export interface AdminToolAction {
    id: AdminToolActionId;
    title: string;
    description: string;
    href?: string;
}

export const ADMIN_DEFAULT_TAB: AdminTabValue = "modules";

export const ADMIN_TABS = [
    {
        value: "modules",
        label: "Modules & sections",
        description: "Pilotez les modules, les sections, les verrous et les contenus.",
    },
    {
        value: "users",
        label: "Utilisateurs",
        description: "Gerez les comptes, les groupes, les roles et les bannissements.",
    },
    {
        value: "tools",
        label: "Outils",
        description: "Accedez aux actions techniques et aux vues pedagogiques.",
    },
] as const satisfies readonly {
    value: AdminTabValue;
    label: string;
    description: string;
}[];

export const ADMIN_TOOL_ACTIONS = [
    {
        id: "migration",
        title: "Migration",
        description: "Migrer les anciens contenus fichier vers MongoDB.",
    },
    {
        id: "export-import",
        title: "Exporter / importer",
        description: "Transferer les modules et sections entre environnements.",
    },
    {
        id: "calibrage",
        title: "Calibrage pedagogique",
        description: "Ajuster les verdicts et exemplaires utilises par les skills.",
        href: "/admin/calibrage",
    },
    {
        id: "pedagogie",
        title: "Pedagogie",
        description: "Consulter les briefs et curriculums des sections.",
        href: "/admin/pedagogie",
    },
] as const satisfies readonly AdminToolAction[];
```

- [ ] **Step 4: Run the config test and verify it passes**

Run: `bun test src/components/admin/adminDashboardConfig.test.ts`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/components/admin/adminDashboardConfig.ts src/components/admin/adminDashboardConfig.test.ts
git commit -m "test(admin): cadrer les onglets du dashboard"
```

---

### Task 2: Admin Page Shell and Tools Tab

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/components/admin/AdminTabs.tsx`
- Create: `src/components/admin/AdminToolsPanel.tsx`

**Interfaces:**
- Consumes: `ADMIN_DEFAULT_TAB`, `ADMIN_TABS`, `ADMIN_TOOL_ACTIONS` from Task 1.
- Produces: `/admin` renders the three tabs and no longer renders loose random actions above the user table.

- [ ] **Step 1: Update `/admin` data loading**

Modify `src/app/admin/page.tsx`:

```ts
import {auth, getServerSession} from "@/lib/auth";
import {headers} from "next/headers";
import {notFound} from "next/navigation";
import AdminTabs from "@/components/admin/AdminTabs";
import type {AdminUser} from "@/components/admin/users/UsersTable";
import getModules from "@/lib/getModules";

export default async function AdminPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const modules = await getModules();
    let users: AdminUser[] = [];

    try {
        // reason: better-auth admin plugin types not fully exposed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (auth.api as any).listUsers({
            headers: await headers(),
            query: {limit: "200", sortBy: "createdAt", sortDirection: "desc"},
        });
        users = (result?.users ?? []).map(
            (u: {
                id: string;
                name: string;
                email: string;
                image?: string | null;
                role?: string;
                group?: string | null;
                username?: string | null;
                banned?: boolean | null;
                createdAt: Date | string;
            }) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                image: u.image ?? null,
                role: u.role ?? "user",
                group: u.group ?? null,
                username: u.username ?? null,
                banned: u.banned ?? false,
                createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
            })
        );
    } catch (error) {
        console.error("[admin] listUsers error:", error);
    }

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                    Administration
                </p>
                <h1 className="mt-1 text-2xl font-bold text-brand-dark dark:text-bridge-100">
                    Tableau de bord
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-bridge-600 dark:text-bridge-300">
                    Gere les modules, les sections, les comptes et les outils internes depuis un seul espace.
                </p>
            </div>

            <AdminTabs users={users} modules={modules}/>
        </main>
    );
}
```

- [ ] **Step 2: Replace `AdminTabs` with the three-tab shell**

Modify `src/components/admin/AdminTabs.tsx`:

```tsx
"use client";

import {BookOpen, Settings, Users} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import UsersTable from "@/components/admin/users/UsersTable";
import ModulesList from "@/components/admin/ModulesList";
import AdminToolsPanel from "@/components/admin/AdminToolsPanel";
import type {AdminUser} from "@/components/admin/users/UsersTable";
import type Module from "@/types/Module";
import {ADMIN_DEFAULT_TAB, ADMIN_TABS} from "@/components/admin/adminDashboardConfig";

interface AdminTabsProps {
    users: AdminUser[];
    modules: Module[];
}

const TAB_ICONS = {
    modules: BookOpen,
    users: Users,
    tools: Settings,
} as const;

export default function AdminTabs({users, modules}: AdminTabsProps) {
    return (
        <Tabs defaultValue={ADMIN_DEFAULT_TAB} className="gap-6">
            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg border border-bridge-500/30 bg-bridge-100/60 p-1 dark:bg-bridge-800/60">
                {ADMIN_TABS.map((tab) => {
                    const Icon = TAB_ICONS[tab.value];
                    const count = tab.value === "modules" ? modules.length : tab.value === "users" ? users.length : null;
                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="min-h-11 flex-none gap-2 rounded-md px-3 data-[state=active]:bg-brand-primary data-[state=active]:text-white dark:data-[state=active]:text-brand-dark"
                        >
                            <Icon className="size-4" aria-hidden="true"/>
                            {tab.label}
                            {count !== null && (
                                <span className="ml-1 text-[10px] opacity-75">({count})</span>
                            )}
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            <TabsContent value="modules">
                <ModulesList initialModules={modules}/>
            </TabsContent>

            <TabsContent value="users">
                <UsersTable users={users}/>
            </TabsContent>

            <TabsContent value="tools">
                <AdminToolsPanel/>
            </TabsContent>
        </Tabs>
    );
}
```

- [ ] **Step 3: Create the tools panel without sync**

Create `src/components/admin/AdminToolsPanel.tsx`:

```tsx
"use client";

import {useState} from "react";
import Link from "next/link";
import {ArrowRight, Database, FileText, GraduationCap, UploadCloud} from "lucide-react";
import {Button} from "@/components/ui/button";
import MigrateButton from "@/components/admin/MigrateButton";
import ExportImportSheet from "@/components/admin/ExportImportSheet";
import {ADMIN_TOOL_ACTIONS} from "@/components/admin/adminDashboardConfig";

const TOOL_ICONS = {
    migration: Database,
    "export-import": UploadCloud,
    calibrage: GraduationCap,
    pedagogie: FileText,
} as const;

export default function AdminToolsPanel() {
    const [exportImportOpen, setExportImportOpen] = useState(false);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                {ADMIN_TOOL_ACTIONS.map((action) => {
                    const Icon = TOOL_ICONS[action.id];
                    return (
                        <article
                            key={action.id}
                            className="rounded-lg border border-bridge-500/35 bg-bridge-50 p-5 shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:bg-bridge-800 dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]"
                        >
                            <div className="mb-4 flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/12 text-brand-accent-dark dark:bg-brand-primary/20 dark:text-brand-primary">
                                    <Icon className="size-5" aria-hidden="true"/>
                                </span>
                                <div>
                                    <h2 className="font-bold text-brand-dark dark:text-bridge-100">{action.title}</h2>
                                    <p className="mt-1 text-sm leading-relaxed text-bridge-600 dark:text-bridge-300">
                                        {action.description}
                                    </p>
                                </div>
                            </div>

                            {action.id === "migration" ? (
                                <MigrateButton/>
                            ) : action.id === "export-import" ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="min-h-11 gap-2 border-bridge-500/45"
                                    onClick={() => setExportImportOpen(true)}
                                >
                                    Ouvrir
                                    <ArrowRight className="size-4" aria-hidden="true"/>
                                </Button>
                            ) : (
                                <Button asChild variant="outline" className="min-h-11 gap-2 border-bridge-500/45">
                                    <Link href={action.href ?? "/admin"}>
                                        Ouvrir
                                        <ArrowRight className="size-4" aria-hidden="true"/>
                                    </Link>
                                </Button>
                            )}
                        </article>
                    );
                })}
            </div>

            <ExportImportSheet open={exportImportOpen} onOpenChange={setExportImportOpen}/>
        </>
    );
}
```

- [ ] **Step 4: Verify Task 2**

Run: `bun test src/components/admin/adminDashboardConfig.test.ts`

Expected: PASS.

Run: `bun run lint`

Expected: exit 0.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/app/admin/page.tsx src/components/admin/AdminTabs.tsx src/components/admin/AdminToolsPanel.tsx
git commit -m "feat(admin): structurer le dashboard en onglets"
```

---

### Task 3: Modules and Sections Admin Cards

**Files:**
- Modify: `src/components/admin/ModulesList.tsx`
- Modify: `src/components/admin/AdminModule.tsx`
- Modify: `src/components/admin/AdminSection.tsx`
- Modify: `src/components/admin/EditSectionButton.tsx`

**Interfaces:**
- Consumes: existing `useAdminApi`, `updateSectionState`, `EditModuleSheet`, `SectionForm`, `EditSectionButton`.
- Produces:
  - Module cards expose visibility, edit, add section, delete.
  - Section cards expose lock/unlock, correction toggle, edit, delete, content edit links.

- [ ] **Step 1: Make `ModulesList` the module-tab surface**

Modify `src/components/admin/ModulesList.tsx` so it uses `useRouter`, refreshes after module creation, and keeps local state for instant display:

```tsx
"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import AdminModule from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import {Accordion} from "@/components/ui/accordion";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/Module";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";

interface ModulesListProps {
    initialModules: Module[];
}

export default function ModulesList({initialModules}: ModulesListProps) {
    const [modules, setModules] = useState(initialModules);
    const router = useRouter();
    const {addModule} = useAdminApi();

    const handleAddModule = async (data: ModuleFormValues) => {
        const createdModule = await addModule({...data, sections: []});
        setModules((prev) => [...prev, createdModule]);
        router.refresh();
    };

    const handleDeleteModule = (moduleId: string) => {
        setModules((prev) => prev.filter((mod) => String(mod._id) !== moduleId));
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                        Contenu pedagogique
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-brand-dark dark:text-bridge-100">
                        Modules & sections
                    </h2>
                    <p className="mt-1 text-sm text-bridge-600 dark:text-bridge-300">
                        {modules.length} module{modules.length > 1 ? "s" : ""} gere{modules.length > 1 ? "s" : ""} depuis MongoDB.
                    </p>
                </div>
                <AddModuleButton onAdd={handleAddModule}/>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
                {modules.map((mod) => (
                    <AdminModule
                        key={`${mod._id}_${mod.sections?.length}`}
                        module={mod}
                        onDelete={handleDeleteModule}
                    />
                ))}
            </Accordion>
        </section>
    );
}
```

- [ ] **Step 2: Update `AdminModuleProps` and imports**

In `src/components/admin/AdminModule.tsx`, add imports:

```tsx
import {useRouter} from "next/navigation";
import {Plus, Settings, Trash2, Eye, EyeOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import EditModuleSheet from "@/components/admin/EditModuleSheet";
import SectionForm, {Section} from "@/components/admin/SectionForm";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
```

Replace the props interface:

```ts
interface AdminModuleProps {
    module: Module;
    onDelete?: (moduleId: string) => void;
}
```

Change the function signature:

```ts
export default function AdminModule({module, onDelete}: AdminModuleProps) {
```

- [ ] **Step 3: Add module action state and handlers**

Inside `AdminModule`, after `const [visible, setVisible] = useState(...)`, add:

```tsx
const [editModuleOpen, setEditModuleOpen] = useState(false);
const [addSectionOpen, setAddSectionOpen] = useState(false);
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [deleting, setDeleting] = useState(false);
const router = useRouter();
const {addSection: addSectionApi, toggleModuleVisibility, deleteModule} = useAdminApi();
```

Replace the existing `const {addSection: addSectionApi, toggleModuleVisibility} = useAdminApi();`.

Add these handlers:

```tsx
const handleEditModule = async (data: ModuleFormValues) => {
    const res = await fetch(`/api/admin/modules/${modData._id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        toast.error("Erreur lors de la mise a jour du module.");
        throw new Error("API error");
    }

    setModData((prev) => ({...prev, ...data}));
    toast.success("Module mis a jour.");
    router.refresh();
};

const handleDeleteModule = async () => {
    setDeleting(true);
    try {
        await deleteModule(modData._id as unknown as string);
        toast.success(`Module "${modData.title}" supprime.`);
        setDeleteConfirmOpen(false);
        onDelete?.(String(modData._id));
        router.refresh();
    } catch {
        toast.error("Erreur lors de la suppression du module.");
        setDeleting(false);
    }
};
```

Change `addSection` to open from the card and refresh:

```tsx
const addSection = async (section: Section) => {
    const savedSection = await addSectionApi(modData._id as unknown as string, section);
    setModData((prev) => ({
        ...prev,
        sections: [...prev.sections, savedSection],
    }));
    toast.success("Section ajoutee.");
    router.refresh();
};
```

- [ ] **Step 4: Replace module trigger content with card actions**

Remove these old imports from `src/components/admin/AdminModule.tsx` because their UI is replaced by the inline action bar:

```tsx
import AddSectionButton from "@/components/admin/AddSectionButton";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
```

Inside `AccordionTrigger`, use this structure for the trigger row:

```tsx
<AccordionTrigger className="rounded-lg border border-bridge-500/35 bg-bridge-50 px-4 py-3 text-left shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] hover:no-underline dark:bg-bridge-800">
    <div className="flex w-full min-w-0 items-center gap-3 pr-3">
        <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white dark:text-brand-dark"
            style={{color: "white", backgroundColor: moduleColor(modData)}}
        >
            <Icon className="size-5"/>
        </div>
        <div className="min-w-0 flex-1">
            <Heading level={3}>{modData.title}</Heading>
            <p className="mt-1 text-sm text-bridge-600 dark:text-bridge-300">
                {modData.sections.length} section{modData.sections.length > 1 ? "s" : ""} · {visible ? "Visible" : "Masque"}
            </p>
        </div>
    </div>
</AccordionTrigger>
```

In `AccordionContent`, remove the old visibility switch block and the old `AddSectionButton` render:

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-bridge-500/20">
    ...
</div>
<AddSectionButton onAdd={addSection} modData={modData}/>
```

Then add the module action bar before the sections:

```tsx
<div className="flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-x border-b border-bridge-500/25 bg-bridge-50/70 px-4 py-3 dark:bg-bridge-900/35">
    <div className="flex flex-wrap items-center gap-2">
        <Button
            type="button"
            variant="outline"
            className="min-h-11 gap-2 border-bridge-500/45"
            onClick={() => setEditModuleOpen(true)}
        >
            <Settings className="size-4" aria-hidden="true"/>
            Modifier
        </Button>
        <Button
            type="button"
            className="min-h-11 gap-2 text-white dark:text-brand-dark hover:opacity-90"
            style={{backgroundColor: moduleColor(modData)}}
            onClick={() => setAddSectionOpen(true)}
        >
            <Plus className="size-4" aria-hidden="true"/>
            Ajouter une section
        </Button>
    </div>
    <div className="flex flex-wrap items-center gap-2">
        <Button
            type="button"
            variant="outline"
            className="min-h-11 gap-2 border-bridge-500/45"
            onClick={() => handleToggleVisibility(!visible)}
        >
            {visible ? <Eye className="size-4" aria-hidden="true"/> : <EyeOff className="size-4" aria-hidden="true"/>}
            {visible ? "Visible" : "Masque"}
        </Button>
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" className="min-h-11 gap-2 border-bridge-500/45 text-destructive hover:text-destructive">
                    <Trash2 className="size-4" aria-hidden="true"/>
                    Supprimer
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="p-0 gap-0 overflow-hidden bg-card border-bridge-500/45">
                <div className="flex items-center gap-3 px-6 py-4" style={{backgroundColor: moduleColor(modData)}}>
                    <Trash2 className="w-5 h-5 text-white shrink-0"/>
                    <AlertDialogTitle className="text-white font-bold text-lg">Supprimer le module ?</AlertDialogTitle>
                </div>
                <div className="px-6 py-5">
                    <AlertDialogDescription className="text-brand-dark dark:text-bridge-200">
                        Le module <strong>{modData.title}</strong> et toutes ses sections seront definitivement supprimes.
                        Cette action est irreversible.
                    </AlertDialogDescription>
                </div>
                <AlertDialogFooter className="px-6 pb-5">
                    <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteModule} disabled={deleting} variant="destructive">
                        {deleting ? "Suppression..." : "Supprimer definitivement"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</div>
```

Wrap the returned `AccordionItem` in a fragment and render the sheets after it:

```tsx
return (
    <>
        <AccordionItem value={modData.path}>
            ...
        </AccordionItem>

        <EditModuleSheet
            module={modData}
            open={editModuleOpen}
            onOpenChange={setEditModuleOpen}
            onSubmit={handleEditModule}
        />

        <SectionForm
            modData={modData}
            mode="add"
            open={addSectionOpen}
            onOpenChange={setAddSectionOpen}
            onSubmit={addSection}
        />
    </>
);
```

- [ ] **Step 5: Make `AdminSection` toggles robust and add content edit links**

In `src/components/admin/AdminSection.tsx`, add imports:

```tsx
import Link from "next/link";
import {Pencil, ExternalLink} from "lucide-react";
import {CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";
```

Replace `handleToggle` with an async rollback version:

```tsx
const handleToggle = async (
    key: keyof Pick<Section, "correctionIsAvailable" | "isAvailable" | "examenIsLock">,
    value: boolean
) => {
    const previous = currentSection[key];
    setCurrentSection((prev) => ({...prev, [key]: value}));
    try {
        await updateSectionState(moduleId, currentSection.order, key, value);
        toast.success("Section mise a jour.");
    } catch {
        setCurrentSection((prev) => ({...prev, [key]: previous}));
        toast.error("Erreur lors de la mise a jour de la section.");
    }
};
```

Before the return, add:

```tsx
const sortedContents = getContentTypes(currentSection.contents).sort(
    (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
);
```

In the card body, after the correction switch, add the content edit links:

```tsx
<div className="border-t border-bridge-500/20 pt-3">
    <p className="mb-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
        Contenus
    </p>
    <div className="flex flex-wrap gap-2">
        {sortedContents.map((content) => {
            const key = content as ContentKey;
            return (
                <Button
                    key={content}
                    asChild
                    variant="outline"
                    size="sm"
                    className="min-h-10 gap-1.5 border-bridge-500/45"
                >
                    <Link href={`/admin/content/${modData.path}/${currentSection.path}/${content}`}>
                        <Pencil className="size-3.5" aria-hidden="true"/>
                        {CONTENT_LABELS[key] ?? content}
                    </Link>
                </Button>
            );
        })}
        <Button asChild variant="outline" size="sm" className="min-h-10 gap-1.5 border-bridge-500/45">
            <Link href={`/${modData.path}/${currentSection.path}`}>
                <ExternalLink className="size-3.5" aria-hidden="true"/>
                Voir
            </Link>
        </Button>
    </div>
</div>
```

- [ ] **Step 6: Tighten `EditSectionButton` icon button accessibility**

In `src/components/admin/EditSectionButton.tsx`, change the button to:

```tsx
<Button
    onClick={() => setOpen(true)}
    size="icon"
    aria-label="Modifier la section"
    className="h-10 w-10 text-white dark:text-brand-dark hover:opacity-90 border-transparent"
    style={{backgroundColor: moduleColor(modData)}}
>
    <Edit className="size-4" aria-hidden="true"/>
</Button>
```

Keep the existing `SectionForm` below it.

- [ ] **Step 7: Verify Task 3**

Run: `bun test src/components/admin/adminDashboardConfig.test.ts`

Expected: PASS.

Run: `bun run lint`

Expected: exit 0.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/components/admin/ModulesList.tsx src/components/admin/AdminModule.tsx src/components/admin/AdminSection.tsx src/components/admin/EditSectionButton.tsx
git commit -m "feat(admin): centraliser la gestion modules sections"
```

---

### Task 4: Remove Visible Admin FABs

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/[moduleSlug]/page.tsx`
- Modify: `src/app/[moduleSlug]/[sectionSlug]/page.tsx`
- Modify: `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`
- Modify: `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx`
- Modify: `src/components/admin/SectionForm.tsx`
- Delete: admin FAB component files listed in the file map.

**Interfaces:**
- Consumes: content edit links now available in `/admin`.
- Produces: No admin FAB is visible on home, module, section, content or slide pages.

- [ ] **Step 1: Remove home FAB usage**

In `src/app/page.tsx`:

Remove:

```ts
import AdminHomeFab from "@/components/admin/AdminHomeFab";
```

Remove this render block:

```tsx
{session?.user.role === 'admin' && <AdminHomeFab />}
```

- [ ] **Step 2: Remove module FAB usage**

In `src/app/[moduleSlug]/page.tsx`:

Remove:

```ts
import AdminModuleFab from "@/components/admin/AdminModuleFab";
```

Remove:

```tsx
{isAdmin && <AdminModuleFab module={currentModule} />}
```

Keep `isAdmin` because it is still used by `SectionCard`.

- [ ] **Step 3: Remove section FAB usage**

In `src/app/[moduleSlug]/[sectionSlug]/page.tsx`:

Remove:

```ts
import {getServerSession} from "@/lib/auth";
import EditSectionFab from "@/components/admin/EditSectionFab";
```

Remove:

```ts
const session = await getServerSession();
const isAdmin = session?.user.role === "admin";
```

Remove:

```tsx
{isAdmin && currentSection && (
    <EditSectionFab modData={currentModule} section={currentSection}/>
)}
```

- [ ] **Step 4: Remove content FAB usage**

In `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`, remove:

```ts
import EditContentFab from "@/components/admin/EditContentFab";
```

Remove the final FAB render:

```tsx
{isAdmin && !isSplit && currentContent && (
    <EditContentFab
        moduleSlug={moduleSlug}
        sectionSlug={sectionSlug}
        contentType={currentContent}
        modulePath={currentModule.path}
    />
)}
```

Keep `getServerSession` and `isAdmin`; this page still uses admin access behavior.

- [ ] **Step 5: Remove slide FAB usage**

In `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx`, remove:

```ts
import EditContentFab from "@/components/admin/EditContentFab";
```

Remove both `EditContentFab` render blocks in the DB and FILE branches.

Keep `getServerSession`, `isAdmin`, and admin redirects.

- [ ] **Step 6: Delete unused FAB components**

Run: `rg "AdminHomeFab|AdminModuleFab|EditModuleFab|AddModuleFab|AddSectionFab|EditSectionFab|EditContentFab" src -n`

Expected before deletion: only component definitions remain.

Delete:

```text
src/components/admin/AdminHomeFab.tsx
src/components/admin/AdminModuleFab.tsx
src/components/admin/EditModuleFab.tsx
src/components/admin/AddModuleFab.tsx
src/components/admin/AddSectionFab.tsx
src/components/admin/EditSectionFab.tsx
src/components/admin/EditContentFab.tsx
```

If `src/components/admin/SyncSheet.tsx` is no longer imported, delete it too:

Run: `rg "SyncSheet" src -n`

Expected: no imports after `AdminHomeFab.tsx` is deleted. Then delete `src/components/admin/SyncSheet.tsx`.

- [ ] **Step 7: Update stale SectionForm comment**

In `src/components/admin/SectionForm.tsx`, replace:

```ts
// Type exporté pour rétrocompatibilité avec EditSectionFab et AddSectionButton
```

with:

```ts
// Type exporte pour les formulaires d'ajout et d'edition de section.
```

- [ ] **Step 8: Verify no FAB references remain**

Run: `rg "AdminHomeFab|AdminModuleFab|EditModuleFab|AddModuleFab|AddSectionFab|EditSectionFab|EditContentFab|fixed bottom-6 right-6|fixed bottom-20 right-6" src -n`

Expected: no matches in admin components or app pages. Matches in course text such as "Fabien" are irrelevant only if they do not match these exact symbols.

- [ ] **Step 9: Verify Task 4**

Run: `bun test src/components/admin/adminDashboardConfig.test.ts`

Expected: PASS.

Run: `bun run lint`

Expected: exit 0.

- [ ] **Step 10: Commit Task 4**

```bash
git add src/app/page.tsx src/app/[moduleSlug]/page.tsx src/app/[moduleSlug]/[sectionSlug]/page.tsx src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx src/components/admin/SectionForm.tsx
git add -u src/components/admin
git commit -m "refactor(admin): retirer les fab admin"
```

---

### Task 5: Final Verification and Manual QA

**Files:**
- No planned source edits unless verification exposes a bug.

**Interfaces:**
- Consumes: all tasks.
- Produces: verified branch ready for commit/push workflow.

- [ ] **Step 1: Run the full test suite**

Run: `bun test`

Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run: `bun run lint`

Expected: exit 0.

- [ ] **Step 3: Run production build**

Run: `bun run build`

Expected: exit 0. The known Node `DEP0205` warning is non-blocking if the build succeeds.

- [ ] **Step 4: Inspect admin UI manually**

Start dev server: `bun dev`

Open `/admin` as an admin account and verify:

- `Modules & sections` is active by default.
- `Utilisateurs` shows the users table.
- `Outils` shows migration, export/import, calibrage pedagogique and pedagogie.
- No `Synchroniser` action appears.
- Module visibility toggle works and rolls back on API failure.
- Section availability toggle works and rolls back on API failure.
- Correction toggle works when enabled and is disabled when `hasCorrection` is false.
- Content edit links open `/admin/content/<module>/<section>/<type>`.
- Home, module, section, content and slide pages show no admin FAB.

- [ ] **Step 5: Commit any verification fixes**

If Task 5 required code changes, commit them:

```bash
git add <changed-files>
git commit -m "fix(admin): stabiliser le dashboard"
```

If no code changes were required, do not create an empty commit.
