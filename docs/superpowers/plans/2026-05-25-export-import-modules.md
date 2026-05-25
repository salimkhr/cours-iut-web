# Export / Import modules — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'admin d'exporter tous les modules (JSON téléchargeable) depuis un environnement et de les importer dans un autre, sans ressaisie manuelle.

**Architecture:** Deux Route Handlers Next.js protégés par `withAdmin` + un Sheet client React branché sur le FAB admin existant. L'upsert est keyed par `path` (slug) pour les modules et les sections.

**Tech Stack:** Next.js 16 App Router, MongoDB driver natif (`mongodb@^7`), bun:test + mongodb-memory-server pour les tests, shadcn/ui Sheet/Button, React 19 `useRef`/`useState`.

---

## Fichiers

| Action  | Chemin                                              | Rôle                                  |
|---------|-----------------------------------------------------|---------------------------------------|
| Créer   | `src/app/api/admin/export/route.ts`                 | GET — dump MongoDB → JSON download    |
| Créer   | `src/app/api/admin/import/route.ts`                 | POST — upsert modules depuis JSON     |
| Créer   | `src/components/admin/ExportImportSheet.tsx`        | Sheet UI export + import              |
| Créer   | `tests/api/admin/export-import.test.ts`             | Tests bun:test des deux routes        |
| Modifier| `src/components/admin/AdminHomeFab.tsx`             | Ajouter entrée dropdown + monter Sheet|

---

## Task 1 : GET /api/admin/export

**Files:**
- Create: `src/app/api/admin/export/route.ts`
- Create: `tests/api/admin/export-import.test.ts`

- [ ] **Étape 1 — Écrire les tests qui échouent**

Créer `tests/api/admin/export-import.test.ts` :

```ts
import { beforeAll, afterAll, beforeEach, afterEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;
let session: { user: { id: string; role: string } } | null = null;

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

mock.module("@/lib/auth", () => ({
    getServerSession: async () => session,
    auth: {},
}));

const { GET: exportModules } = await import("@/app/api/admin/export/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
}, 60000);
afterAll(async () => { await stopDb?.(); }, 10000);

beforeEach(() => { session = null; });
afterEach(async () => { await db.collection("modules").deleteMany({}); });

const ADMIN_SESSION = { user: { id: "u1", role: "admin" } };

function makeGetReq() {
    return new Request("http://localhost/api/admin/export", { method: "GET" });
}

describe("GET /api/admin/export", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await exportModules(makeGetReq(), {});
        expect(res.status).toBe(403);
    });

    test("200 avec tableau vide si aucun module", async () => {
        session = ADMIN_SESSION;
        const res = await exportModules(makeGetReq(), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body).toHaveLength(0);
    });

    test("200 avec modules sans _id", async () => {
        session = ADMIN_SESSION;
        await db.collection("modules").insertOne({
            title: "JS", path: "javascript", iconName: "code",
            sections: [], isExtra: false, associatedSae: [],
            coefficients: [], instructors: [],
        });
        const res = await exportModules(makeGetReq(), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(1);
        expect(body[0]._id).toBeUndefined();
        expect(body[0].path).toBe("javascript");
    });

    test("header Content-Disposition présent", async () => {
        session = ADMIN_SESSION;
        const res = await exportModules(makeGetReq(), {});
        expect(res.headers.get("Content-Disposition")).toContain("attachment");
    });
});
```

- [ ] **Étape 2 — Vérifier que les tests échouent**

```bash
cd "C:/Users/Utilisateur/PhpstormProjects/cours-iut-web"
bun test tests/api/admin/export-import.test.ts 2>&1 | head -30
```

Attendu : erreur `Cannot find module "@/app/api/admin/export/route"`.

- [ ] **Étape 3 — Implémenter la route**

Créer `src/app/api/admin/export/route.ts` :

```ts
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import Module from "@/types/Module";
import { WithId } from "mongodb";

export const GET = withAdmin(async (): Promise<Response> => {
    const db = await connectToDB();
    const docs = await db.collection<Module>("modules").find().toArray() as WithId<Module>[];

    const payload = docs.map(({ _id, ...rest }) => rest);

    return new Response(JSON.stringify(payload, null, 2), {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="modules-export.json"',
        },
    });
});
```

- [ ] **Étape 4 — Vérifier que les tests passent**

```bash
bun test tests/api/admin/export-import.test.ts 2>&1 | grep -E "✓|✗|PASS|FAIL|export"
```

Attendu : 4 tests `✓` dans le describe `GET /api/admin/export`.

- [ ] **Étape 5 — Commit**

```bash
git add src/app/api/admin/export/route.ts tests/api/admin/export-import.test.ts
git commit -m "feat: GET /api/admin/export — dump modules sans _id"
```

---

## Task 2 : POST /api/admin/import

**Files:**
- Create: `src/app/api/admin/import/route.ts`
- Modify: `tests/api/admin/export-import.test.ts`

- [ ] **Étape 1 — Ajouter les tests qui échouent**

Ajouter à la fin de `tests/api/admin/export-import.test.ts` (après le mock existant et les imports, ajouter l'import de la route POST) :

En haut du fichier, après la ligne `const { GET: exportModules } = ...`, ajouter :

```ts
const { POST: importModules } = await import("@/app/api/admin/import/route");
```

Puis ajouter le describe à la fin du fichier :

```ts
function makePostReq(body: unknown) {
    return new Request("http://localhost/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const VALID_MODULE = {
    title: "JavaScript",
    path: "javascript",
    iconName: "code",
    description: "",
    isExtra: false,
    associatedSae: [],
    coefficients: [],
    manager: { firstName: "", lastName: "", email: "" },
    instructors: [],
    sections: [
        {
            title: "Intro",
            path: "1-intro",
            order: 1,
            contents: ["cours"],
            totalDuration: 1,
            isAvailable: true,
            hasCorrection: false,
            correctionIsAvailable: false,
            examenIsLock: false,
            description: "",
            objectives: [],
            tags: [],
        },
    ],
};

describe("POST /api/admin/import", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await importModules(makePostReq([VALID_MODULE]), {});
        expect(res.status).toBe(403);
    });

    test("400 si body n'est pas un tableau", async () => {
        session = ADMIN_SESSION;
        const res = await importModules(makePostReq({ notAnArray: true }), {});
        expect(res.status).toBe(400);
    });

    test("400 si un module n'a pas de path", async () => {
        session = ADMIN_SESSION;
        const res = await importModules(makePostReq([{ title: "Sans path" }]), {});
        expect(res.status).toBe(400);
    });

    test("200 — insère un nouveau module", async () => {
        session = ADMIN_SESSION;
        const res = await importModules(makePostReq([VALID_MODULE]), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.inserted).toBe(1);
        expect(body.updated).toBe(0);

        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.title).toBe("JavaScript");
        expect(doc?.sections).toHaveLength(1);
    });

    test("200 — met à jour un module existant", async () => {
        session = ADMIN_SESSION;
        await db.collection("modules").insertOne({ ...VALID_MODULE, sections: [] });

        const updated = { ...VALID_MODULE, title: "JavaScript Avancé" };
        const res = await importModules(makePostReq([updated]), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.inserted).toBe(0);
        expect(body.updated).toBe(1);

        const doc = await db.collection("modules").findOne({ path: "javascript" });
        expect(doc?.title).toBe("JavaScript Avancé");
    });

    test("sections existantes en prod non présentes dans l'import sont conservées", async () => {
        session = ADMIN_SESSION;
        const existingSection = {
            title: "Section prod",
            path: "99-prod-only",
            order: 99,
            contents: ["cours"],
            totalDuration: 1,
            isAvailable: true,
            hasCorrection: false,
            correctionIsAvailable: false,
            examenIsLock: false,
            description: "",
            objectives: [],
            tags: [],
        };
        await db.collection("modules").insertOne({
            ...VALID_MODULE,
            sections: [existingSection],
        });

        // Import avec une section différente (path différent)
        const res = await importModules(makePostReq([VALID_MODULE]), {});
        expect(res.status).toBe(200);

        const doc = await db.collection("modules").findOne({ path: "javascript" });
        const paths = doc?.sections.map((s: { path: string }) => s.path);
        expect(paths).toContain("99-prod-only");   // conservée
        expect(paths).toContain("1-intro");        // importée
    });
});
```

- [ ] **Étape 2 — Vérifier que les tests échouent**

```bash
bun test tests/api/admin/export-import.test.ts 2>&1 | head -30
```

Attendu : erreur `Cannot find module "@/app/api/admin/import/route"`.

- [ ] **Étape 3 — Implémenter la route**

Créer `src/app/api/admin/import/route.ts` :

```ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";

type SectionData = {
    path: string;
    [key: string]: unknown;
};

type ModuleData = {
    path: string;
    sections?: SectionData[];
    [key: string]: unknown;
};

export const POST = withAdmin(async (req: Request): Promise<Response> => {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
    }

    if (!Array.isArray(body)) {
        return NextResponse.json({ error: "Le body doit être un tableau" }, { status: 400 });
    }

    const modules = body as ModuleData[];
    if (modules.some(m => typeof m.path !== "string" || !m.path)) {
        return NextResponse.json({ error: "Chaque module doit avoir un champ path" }, { status: 400 });
    }

    const db = await connectToDB();
    const col = db.collection("modules");

    let inserted = 0;
    let updated = 0;

    for (const moduleData of modules) {
        const { sections = [], ...moduleFields } = moduleData;

        const existing = await col.findOne({ path: moduleFields.path });

        if (!existing) {
            await col.insertOne({ ...moduleFields, sections });
            inserted++;
        } else {
            // Conserver les sections prod non présentes dans l'import
            const existingSections: SectionData[] = existing.sections ?? [];
            const importedPaths = new Set(sections.map((s) => s.path));
            const keptSections = existingSections.filter((s) => !importedPaths.has(s.path));
            const mergedSections = [...keptSections, ...sections];

            await col.updateOne(
                { path: moduleFields.path },
                { $set: { ...moduleFields, sections: mergedSections } },
            );
            updated++;
        }
    }

    return NextResponse.json({ inserted, updated });
});
```

- [ ] **Étape 4 — Vérifier que tous les tests passent**

```bash
bun test tests/api/admin/export-import.test.ts 2>&1 | grep -E "✓|✗|PASS|FAIL"
```

Attendu : 4 tests export + 6 tests import tous `✓`.

- [ ] **Étape 5 — Commit**

```bash
git add src/app/api/admin/import/route.ts tests/api/admin/export-import.test.ts
git commit -m "feat: POST /api/admin/import — upsert modules par path, merge sections"
```

---

## Task 3 : ExportImportSheet

**Files:**
- Create: `src/components/admin/ExportImportSheet.tsx`

Pas de test unitaire pour ce composant UI pur. Vérification visuelle dans le navigateur.

- [ ] **Étape 1 — Créer le composant**

Créer `src/components/admin/ExportImportSheet.tsx` :

```tsx
'use client';

import { useState, useRef } from 'react';
import { ArrowUpDown, Download, Upload } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Eyebrow from '@/components/admin/ui/Eyebrow';

interface ExportImportSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ExportImportSheet({ open, onOpenChange }: ExportImportSheetProps) {
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [preview, setPreview] = useState<{ modules: number; sections: number } | null>(null);
    const [importResult, setImportResult] = useState<{ inserted: number; updated: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileData, setFileData] = useState<unknown[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleExport() {
        setExportLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/export');
            if (!res.ok) throw new Error('Export échoué');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'modules-export.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur export');
        } finally {
            setExportLoading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setPreview(null);
        setImportResult(null);
        setError(null);
        setFileData(null);
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                if (!Array.isArray(json)) throw new Error('Le fichier doit contenir un tableau JSON');
                const totalSections = (json as { sections?: unknown[] }[])
                    .reduce((sum, m) => sum + (m.sections?.length ?? 0), 0);
                setPreview({ modules: json.length, sections: totalSections });
                setFileData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Fichier invalide');
            }
        };
        reader.readAsText(file);
    }

    async function handleImport() {
        if (!fileData) return;
        setImportLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fileData),
            });
            if (!res.ok) {
                const body = await res.json() as { error?: string };
                throw new Error(body.error ?? 'Import échoué');
            }
            const result = await res.json() as { inserted: number; updated: number };
            setImportResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur import');
        } finally {
            setImportLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[440px]',
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
                        <ArrowUpDown className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">Admin</p>
                        <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                            Exporter / Importer
                        </SheetTitle>
                        <SheetDescription className="text-white/70 text-sm mt-0.5">
                            Transférez vos modules entre environnements
                        </SheetDescription>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

                    {/* Export */}
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Export</Eyebrow>
                        <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                            Télécharge tous les modules et leurs sections au format JSON.
                        </p>
                        <Button
                            variant="outline"
                            className="self-start gap-2 border-bridge-500/45"
                            onClick={handleExport}
                            disabled={exportLoading}
                        >
                            <Download className="w-4 h-4" />
                            {exportLoading ? 'Export en cours…' : "Télécharger l'export JSON"}
                        </Button>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6" />

                    {/* Import */}
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Import</Eyebrow>
                        <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                            Importe un fichier JSON exporté depuis un autre environnement.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outline"
                            className="self-start gap-2 border-bridge-500/45"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4" />
                            Choisir un fichier…
                        </Button>

                        {preview && (
                            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                                {preview.modules} module{preview.modules > 1 ? 's' : ''},{' '}
                                {preview.sections} section{preview.sections > 1 ? 's' : ''} détectés
                            </p>
                        )}

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        {importResult && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Import terminé : {importResult.inserted} créé{importResult.inserted > 1 ? 's' : ''},
                                {' '}{importResult.updated} mis à jour
                            </p>
                        )}

                        <Button
                            className="self-start gap-2 bg-brand-primary text-white hover:opacity-90"
                            onClick={handleImport}
                            disabled={!fileData || importLoading}
                        >
                            {importLoading ? 'Import en cours…' : 'Importer'}
                        </Button>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
```

- [ ] **Étape 2 — Vérifier le lint**

```bash
cd "C:/Users/Utilisateur/PhpstormProjects/cours-iut-web"
bun run lint 2>&1 | tail -10
```

Attendu : aucune erreur sur `ExportImportSheet.tsx`.

- [ ] **Étape 3 — Commit**

```bash
git add src/components/admin/ExportImportSheet.tsx
git commit -m "feat: ExportImportSheet — UI export/import JSON"
```

---

## Task 4 : Câblage dans AdminHomeFab

**Files:**
- Modify: `src/components/admin/AdminHomeFab.tsx`

Le fichier actuel fait ~117 lignes. Il a déjà un `DropdownMenu` avec deux entrées ("Créer un module" et "Synchroniser les cours"). Il faut ajouter une 3ème entrée et monter `<ExportImportSheet>`.

- [ ] **Étape 1 — Modifier `AdminHomeFab.tsx`**

Voici le fichier complet après modification :

```tsx
'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowUpDown, Plus, RefreshCw, Wrench} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddModuleButton from '@/components/admin/AddModuleButton';
import SyncSheet from '@/components/admin/SyncSheet';
import ExportImportSheet from '@/components/admin/ExportImportSheet';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';
import type {SyncResponse} from '@/app/api/admin/sync/route';

export default function AdminHomeFab() {
    const [addModuleOpen, setAddModuleOpen] = useState(false);
    const [syncSheetOpen, setSyncSheetOpen] = useState(false);
    const [exportImportOpen, setExportImportOpen] = useState(false);
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
        let cancelled = false;
        fetch('/api/admin/sync')
            .then((res) => res.ok ? res.json() : null)
            .then((data: SyncResponse | null) => {
                if (!cancelled && data) setSyncData(data);
            })
            .catch(() => {
                // silencieux — le badge reste à 0 en cas d'erreur réseau
            });
        return () => { cancelled = true; };
    }, []);

    const handleAdd = async (newMod: Omit<Module, '_id'>) => {
        await addModule(newMod);
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
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setExportImportOpen(true)}
                    >
                        <ArrowUpDown className="w-4 h-4"/>
                        Exporter / Importer
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

            <ExportImportSheet
                open={exportImportOpen}
                onOpenChange={setExportImportOpen}
            />
        </>
    );
}
```

- [ ] **Étape 2 — Vérifier le lint**

```bash
bun run lint 2>&1 | tail -10
```

Attendu : aucune erreur.

- [ ] **Étape 3 — Lancer le serveur de dev et tester manuellement**

```bash
bun dev
```

Vérifier dans le navigateur (en tant qu'admin) :
1. Le FAB affiche bien 3 entrées dans le dropdown
2. "Exporter / Importer" ouvre le Sheet
3. "Télécharger l'export JSON" déclenche un téléchargement du fichier JSON
4. Choisir ce fichier dans l'import affiche le preview (`X modules, Y sections détectés`)
5. Cliquer "Importer" affiche le résumé (`X créés, Y mis à jour`)

- [ ] **Étape 4 — Commit final**

```bash
git add src/components/admin/AdminHomeFab.tsx
git commit -m "feat: wire ExportImportSheet into AdminHomeFab dropdown"
```
