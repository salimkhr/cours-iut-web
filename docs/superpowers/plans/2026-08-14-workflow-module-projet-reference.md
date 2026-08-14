# Workflow de module — spec projet, dépôt de référence, admin progressif

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire du projet fil rouge un objet de première classe — spécifié en base, codé dans un dépôt GitLab de référence, validé par l'enseignant — et piloter tout le cycle de vie d'un module depuis un écran d'admin unique qui passe d'assistant guidé à tableau de bord.

**Architecture:** Trois couches. (1) MongoDB porte `projectSpec`, `exampleDomain`, `plannedNotions` sur le module et un `brief` enrichi sur la section ; deux portes `draft`/`validated` conditionnent la suite. (2) Le serveur MCP gagne `push_project_reference` / `get_project_reference` et refuse toute écriture de contenu tant que le dépôt de référence n'est pas validé — la logique de porte vit dans un module pur testable, pas dans le route handler. (3) L'admin expose `/admin/modules/[slug]`, un écran progressif dont les étapes se replient à mesure qu'elles sont franchies, et qui remplace toutes les surfaces flottantes existantes.

**Tech Stack:** Next.js 16.3.0 (App Router), React 19, TypeScript 6 strict, MongoDB driver 7 (pas d'ORM), Zod 4, react-hook-form, Tailwind v4, shadcn/ui (`radix-ui`), `@modelcontextprotocol/sdk`, runner `bun test`.

**Spec:** `docs/superpowers/specs/2026-08-14-workflow-module-projet-reference-design.md`

## Global Constraints

- **Indentation 4 espaces**, imports via l'alias `@/*`, function components uniquement.
- **TypeScript strict** : pas d'`any`, pas de `@ts-ignore` sans commentaire `// reason: ...`.
- **Tests** : runner `bun test`, fichiers `*.test.ts` colocalisés à côté du code testé.
- **MongoDB** : base `cours-iut-web`, collection `modules`. `ObjectId` converti en `string` avant tout retour client. Tout nouvel index passe par `src/lib/db/indexes.ts`.
- **Pas de `@tanstack/react-table`** : colonnes déclarées en `AdminColumn<TData>` pour `AdminDataTable`.
- **Jamais** de code serveur (`src/lib/auth.ts`, `src/lib/mongodb.ts`) importé depuis un Client Component.
- **Écriture MCP sur staging uniquement.** La prod reste une copie sur confirmation explicite.
- **Hooks pre-commit husky** : ne jamais passer `--no-verify`.
- Ne jamais éditer `src/lib/skills/pedagogy.ts` à la main — il est généré par `bun run generate-skill`.
- Cibles tactiles ≥ 44 px (`size-11` / `min-h-11`), `aria-label` sur tout bouton icône, focus visible, contraste vérifié en clair et en sombre.

---

# Chantier 1 — Socle données + MCP

### Task 1: Schémas du projet et du brief enrichi

**Files:**
- Modify: `src/lib/schemas/module.schema.ts`
- Modify: `src/lib/schemas/section.schema.ts`
- Modify: `src/types/Module.ts`
- Test: `src/lib/schemas/module.schema.test.ts` (existe), `src/lib/schemas/section.schema.test.ts` (existe)

**Interfaces:**
- Consomme : rien.
- Produit : `projectSpecSchema`, `exampleDomainSchema`, types `ProjectSpec`, `ExampleDomain` exportés depuis `@/lib/schemas/module.schema` ; `briefSchema` étendu de `filRougeOutcome: string` et `providedBase?: string`. `moduleFormSchema` gagne `projectSpec?`, `exampleDomain?`, `plannedNotions: string[]`. `universeSchema` et `ModuleUniverse` sont **conservés** (lus par la migration et les modules non migrés).

- [ ] **Step 1: Write the failing test**

Ajouter à `src/lib/schemas/module.schema.test.ts` :

```ts
import {describe, expect, test} from "bun:test";
import {projectSpecSchema, exampleDomainSchema, moduleFormSchema} from "@/lib/schemas/module.schema";

describe("projectSpecSchema", () => {
    test("accepte une spec complète en brouillon", () => {
        const parsed = projectSpecSchema.parse({
            name: "Gestion de restaurant",
            pitch: "Une application de prise de commandes en salle",
            finalDeliverable: "Un CLI qui enregistre les commandes et édite l'addition",
            entities: ["Order", "Table", "Plat"],
        });
        expect(parsed.status).toBe("draft");
        expect(parsed.referenceRepo).toBeUndefined();
    });

    test("refuse un status inconnu", () => {
        const result = projectSpecSchema.safeParse({
            name: "X", pitch: "Y", finalDeliverable: "Z", entities: [], status: "publie",
        });
        expect(result.success).toBe(false);
    });

    test("porte le dépôt de référence avec son propre statut", () => {
        const parsed = projectSpecSchema.parse({
            name: "X", pitch: "Y", finalDeliverable: "Z", entities: [],
            referenceRepo: {url: "https://git.example/u/projet-reference-rust"},
        });
        expect(parsed.referenceRepo?.status).toBe("draft");
    });
});

describe("exampleDomainSchema", () => {
    test("exige un nom et une description", () => {
        expect(exampleDomainSchema.safeParse({name: "", description: "x"}).success).toBe(false);
        expect(exampleDomainSchema.safeParse({name: "Bibliothèque", description: "Livres, emprunts"}).success).toBe(true);
    });
});

describe("moduleFormSchema", () => {
    test("plannedNotions vaut [] par défaut", () => {
        const parsed = moduleFormSchema.parse({
            title: "Rust", path: "rust", iconName: "Code", coefficients: [],
        });
        expect(parsed.plannedNotions).toEqual([]);
    });
});
```

Ajouter à `src/lib/schemas/section.schema.test.ts` :

```ts
test("le brief porte l'état observable de fin de section", () => {
    const parsed = briefSchema.parse({filRougeOutcome: "Le CLI affiche la carte du jour"});
    expect(parsed.filRougeOutcome).toBe("Le CLI affiche la carte du jour");
    expect(parsed.providedBase).toBeUndefined();
});

test("filRougeOutcome vaut une chaîne vide par défaut", () => {
    expect(briefSchema.parse({}).filRougeOutcome).toBe("");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/schemas/module.schema.test.ts src/lib/schemas/section.schema.test.ts`
Expected: FAIL — `projectSpecSchema` n'est pas exporté.

- [ ] **Step 3: Write minimal implementation**

Dans `src/lib/schemas/module.schema.ts`, après `universeSchema` :

```ts
export const referenceRepoSchema = z.object({
    url: z.string().url("URL de dépôt invalide"),
    status: z.enum(["draft", "validated"]).default("draft"),
});

export const projectSpecSchema = z.object({
    name: z.string().trim().min(1, "Le nom du projet est obligatoire"),
    pitch: z.string().trim().min(1, "Le pitch est obligatoire"),
    finalDeliverable: z.string().trim().min(1, "Le livrable final est obligatoire"),
    entities: z.array(z.string().trim().min(1)).default([]),
    status: z.enum(["draft", "validated"]).default("draft"),
    referenceRepo: referenceRepoSchema.optional(),
});

export const exampleDomainSchema = z.object({
    name: z.string().trim().min(1, "Le nom du domaine d'exemples est obligatoire"),
    description: z.string().trim().min(1, "La description du domaine d'exemples est obligatoire"),
});

export type ProjectSpec = z.infer<typeof projectSpecSchema>;
export type ExampleDomain = z.infer<typeof exampleDomainSchema>;
export type ReferenceRepo = z.infer<typeof referenceRepoSchema>;
```

Dans `moduleFormSchema`, à la suite de `universe` :

```ts
    projectSpec: projectSpecSchema.optional(),
    exampleDomain: exampleDomainSchema.optional(),
    plannedNotions: z.array(z.string().trim().min(1)).default([]),
```

Dans `src/lib/schemas/section.schema.ts`, `briefSchema` devient :

```ts
export const briefSchema = z.object({
    objectives: z.array(z.string()).default([]),
    notions: z.array(z.string()).default([]),
    filRougeStep: z.string().default(""),
    filRougeOutcome: z.string().default(""),
    providedBase: z.string().optional(),
    notes: z.string().optional(),
});
```

Dans `src/types/Module.ts` :

```ts
import type {ModuleUniverse, ProjectSpec, ExampleDomain} from "@/lib/schemas/module.schema";

export type {ModuleUniverse, ProjectSpec, ExampleDomain};
```

et dans l'interface, après `universe?: ModuleUniverse;` :

```ts
    projectSpec?: ProjectSpec;
    exampleDomain?: ExampleDomain;
    plannedNotions?: string[];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/lib/schemas/`
Expected: PASS. Puis `bunx tsc --noEmit` — aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas/module.schema.ts src/lib/schemas/section.schema.ts src/types/Module.ts src/lib/schemas/module.schema.test.ts src/lib/schemas/section.schema.test.ts
git commit -m "feat(schemas): projectSpec, exampleDomain, plannedNotions et brief enrichi"
```

---

### Task 2: Portes de validation (module pur)

**Files:**
- Create: `src/lib/pedagogy/gates.ts`
- Test: `src/lib/pedagogy/gates.test.ts`

**Interfaces:**
- Consomme : `ProjectSpec` de `@/lib/schemas/module.schema`.
- Produit : `canPushReference(spec)`, `canWriteContent(spec)`, `assertCanPushReference(spec, moduleSlug)`, `assertCanWriteContent(spec, moduleSlug)` — les deux `assert*` lèvent une `Error` dont le message nomme l'étape manquante. Signature commune : `(spec: ProjectSpec | undefined, moduleSlug: string) => void`.

**Pourquoi un module séparé :** les outils MCP vivent dans un `route.ts` de 1400 lignes, impossible à tester unitairement. La règle de porte est une fonction pure — elle se teste seule et s'appelle depuis les deux consommateurs (MCP et API admin).

- [ ] **Step 1: Write the failing test**

```ts
import {describe, expect, test} from "bun:test";
import {canPushReference, canWriteContent, assertCanPushReference, assertCanWriteContent} from "@/lib/pedagogy/gates";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

const spec = (over: Partial<ProjectSpec> = {}): ProjectSpec => ({
    name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: [], status: "draft", ...over,
});

describe("canPushReference — porte 1", () => {
    test("refuse tant que la spec projet est en brouillon", () => {
        expect(canPushReference(spec())).toBe(false);
    });
    test("autorise dès que la spec projet est validée", () => {
        expect(canPushReference(spec({status: "validated"}))).toBe(true);
    });
    test("refuse un module sans spec projet", () => {
        expect(canPushReference(undefined)).toBe(false);
    });
});

describe("canWriteContent — porte 2", () => {
    test("autorise un module migré, sans dépôt déclaré", () => {
        expect(canWriteContent(spec({status: "validated"}))).toBe(true);
        expect(canWriteContent(undefined)).toBe(true);
    });
    test("refuse dès qu'un dépôt est déclaré mais pas validé", () => {
        expect(canWriteContent(spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }))).toBe(false);
    });
    test("autorise quand le dépôt est validé", () => {
        expect(canWriteContent(spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "validated"},
        }))).toBe(true);
    });
});

describe("assertions", () => {
    test("assertCanPushReference nomme l'étape manquante", () => {
        expect(() => assertCanPushReference(spec(), "rust"))
            .toThrow(/spec projet du module "rust" n'est pas validée/);
    });
    test("assertCanWriteContent nomme l'étape manquante", () => {
        expect(() => assertCanWriteContent(spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }), "rust")).toThrow(/dépôt de référence du module "rust" n'est pas validé/);
    });
    test("assertCanWriteContent laisse passer un module migré", () => {
        expect(() => assertCanWriteContent(undefined, "javascript")).not.toThrow();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/pedagogy/gates.test.ts`
Expected: FAIL — module `@/lib/pedagogy/gates` introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
import type {ProjectSpec} from "@/lib/schemas/module.schema";

/** Porte 1 : on ne code le projet de référence qu'une fois la spec validée. */
export function canPushReference(spec: ProjectSpec | undefined): boolean {
    return spec?.status === "validated";
}

/** Porte 2 : on ne rédige pas tant que le code cible n'est pas relu.
 *  Un module sans `referenceRepo` (cas des modules migrés) reste ouvert :
 *  la porte se ferme d'elle-même dès qu'un dépôt est déclaré. */
export function canWriteContent(spec: ProjectSpec | undefined): boolean {
    if (!spec?.referenceRepo) return true;
    return spec.referenceRepo.status === "validated";
}

export function assertCanPushReference(spec: ProjectSpec | undefined, moduleSlug: string): void {
    if (canPushReference(spec)) return;
    throw new Error(
        `La spec projet du module "${moduleSlug}" n'est pas validée. `
        + `Complétez-la et validez-la dans l'admin (étape « Projet ») avant de pousser le code de référence.`
    );
}

export function assertCanWriteContent(spec: ProjectSpec | undefined, moduleSlug: string): void {
    if (canWriteContent(spec)) return;
    throw new Error(
        `Le dépôt de référence du module "${moduleSlug}" n'est pas validé. `
        + `Relisez-le sur GitLab et validez-le dans l'admin (étape « Référence ») avant de rédiger.`
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/pedagogy/gates.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pedagogy/gates.ts src/lib/pedagogy/gates.test.ts
git commit -m "feat(pedagogy): portes de validation spec projet et dépôt de référence"
```

---

### Task 3: Migration `universe` → `projectSpec`

**Files:**
- Create: `src/scripts/migrate-project-spec.ts`
- Create: `src/scripts/migrate-project-spec.test.ts`
- Modify: `package.json` (script `migrate:project-spec`)

**Interfaces:**
- Consomme : `ProjectSpec` de `@/lib/schemas/module.schema`.
- Produit : `buildProjectSpecFromUniverse(universe)` — fonction pure exportée, testée seule ; `main()` non exporté qui lit la collection `modules`, écrit une sauvegarde JSON dans `backups/` et applique.

**Convention du repo :** tous les scripts de `src/scripts/` acceptent `--dry-run` et sauvegardent avant d'écrire. Respecter ce contrat.

- [ ] **Step 1: Write the failing test**

```ts
import {describe, expect, test} from "bun:test";
import {buildProjectSpecFromUniverse} from "@/scripts/migrate-project-spec";

describe("buildProjectSpecFromUniverse", () => {
    test("reprend le nom et le pitch de l'univers, en validé", () => {
        const spec = buildProjectSpecFromUniverse({name: "Netflex", description: "Catalogue de films"});
        expect(spec).toEqual({
            name: "Netflex",
            pitch: "Catalogue de films",
            finalDeliverable: "",
            entities: [],
            status: "validated",
        });
    });

    test("renvoie undefined sans univers — rien à migrer", () => {
        expect(buildProjectSpecFromUniverse(undefined)).toBeUndefined();
    });

    test("ne déclare jamais de dépôt de référence", () => {
        const spec = buildProjectSpecFromUniverse({name: "X", description: "Y"});
        expect(spec?.referenceRepo).toBeUndefined();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/scripts/migrate-project-spec.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
/**
 * Migre `universe { name, description }` vers `projectSpec`.
 * Les modules migrés sont marqués `validated` : ils tournent déjà, on ne les gèle pas.
 * Aucun `referenceRepo` n'est déclaré, donc la porte 2 les laisse passer.
 *
 * Usage : bun run migrate:project-spec [--dry-run]
 */
import fs from "fs";
import path from "path";
import {connectToDB} from "@/lib/mongodb";
import type {ModuleUniverse, ProjectSpec} from "@/lib/schemas/module.schema";

export function buildProjectSpecFromUniverse(universe: ModuleUniverse | undefined): ProjectSpec | undefined {
    if (!universe) return undefined;
    return {
        name: universe.name,
        pitch: universe.description,
        finalDeliverable: "",
        entities: [],
        status: "validated",
    };
}

interface ModuleRow {
    _id: unknown;
    path: string;
    universe?: ModuleUniverse;
    projectSpec?: ProjectSpec;
}

async function main(): Promise<void> {
    const dryRun = process.argv.includes("--dry-run");
    const db = await connectToDB();
    const modules = await db.collection<ModuleRow>("modules")
        .find({}, {projection: {path: 1, universe: 1, projectSpec: 1}})
        .toArray();

    const todo = modules.filter((m) => m.universe && !m.projectSpec);
    console.log(`${todo.length} module(s) à migrer sur ${modules.length}.`);

    if (todo.length === 0) return;

    const backupDir = path.join(process.cwd(), "backups");
    fs.mkdirSync(backupDir, {recursive: true});
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `migrate-project-spec-${stamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(todo, null, 4), "utf-8");
    console.log(`Sauvegarde : ${path.relative(process.cwd(), backupFile)}`);

    for (const mod of todo) {
        const spec = buildProjectSpecFromUniverse(mod.universe);
        if (!spec) continue;
        console.log(`${dryRun ? "[dry-run] " : ""}${mod.path} → projectSpec "${spec.name}" (validated)`);
        if (dryRun) continue;
        await db.collection("modules").updateOne(
            {_id: mod._id as never},
            {$set: {projectSpec: spec, plannedNotions: [], updatedAt: new Date().toISOString()}}
        );
    }
    console.log(dryRun ? "Aucune écriture (dry-run)." : "Migration appliquée.");
}

if (import.meta.main) {
    main().then(() => process.exit(0)).catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
```

Dans `package.json`, section `scripts` :

```json
"migrate:project-spec": "bun src/scripts/migrate-project-spec.ts",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/scripts/migrate-project-spec.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Vérifier en dry-run sur staging**

Run: `bun run migrate:project-spec --dry-run`
Expected: la liste des modules à migrer, aucune écriture, un fichier dans `backups/`.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/migrate-project-spec.ts src/scripts/migrate-project-spec.test.ts package.json
git commit -m "feat(scripts): migration universe vers projectSpec avec dry-run et backup"
```

---

### Task 4: MCP — création et édition avec statut forcé en brouillon

**Files:**
- Modify: `src/app/api/mcp/route.ts:328` (`create_module`), `:390` (`edit_module`), `:780` (`get_module`)
- Create: `src/lib/pedagogy/mcpProjectSpec.ts`
- Test: `src/lib/pedagogy/mcpProjectSpec.test.ts`

**Interfaces:**
- Consomme : `projectSpecSchema` (Task 1), rien de Task 2.
- Produit : `forceDraft(input, existing)` — prend l'entrée d'un agent et la spec déjà en base, renvoie la `ProjectSpec` à écrire, **toujours** en `draft` si le contenu change, en conservant `referenceRepo` existant. Signature : `(input: unknown, existing?: ProjectSpec) => ProjectSpec`.

**Règle :** un agent ne valide jamais. S'il envoie `status: "validated"`, on écrit `draft` sans erreur — l'agent n'a pas à connaître le mécanisme, il constate juste que la validation reste à l'humain.

- [ ] **Step 1: Write the failing test**

```ts
import {describe, expect, test} from "bun:test";
import {forceDraft} from "@/lib/pedagogy/mcpProjectSpec";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

const input = {name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: ["Order"]};

describe("forceDraft", () => {
    test("écrit toujours draft, même si l'agent demande validated", () => {
        expect(forceDraft({...input, status: "validated"}).status).toBe("draft");
    });

    test("conserve le dépôt de référence déjà en base", () => {
        const existing: ProjectSpec = {
            ...input, status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "validated"},
        };
        const out = forceDraft(input, existing);
        expect(out.referenceRepo).toEqual({url: "https://git.example/u/x", status: "validated"});
        expect(out.status).toBe("draft");
    });

    test("rejette une entrée incomplète", () => {
        expect(() => forceDraft({name: "X"})).toThrow();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/pedagogy/mcpProjectSpec.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
import {projectSpecSchema, type ProjectSpec} from "@/lib/schemas/module.schema";

/** Normalise une spec projet envoyée par un agent MCP.
 *  Un agent ne valide jamais : le statut retombe systématiquement à "draft".
 *  Le dépôt de référence déjà en base est conservé tel quel — seul
 *  push_project_reference et l'admin y touchent. */
export function forceDraft(input: unknown, existing?: ProjectSpec): ProjectSpec {
    const parsed = projectSpecSchema.parse(input);
    return {
        ...parsed,
        status: "draft",
        referenceRepo: existing?.referenceRepo ?? parsed.referenceRepo,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/pedagogy/mcpProjectSpec.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Câbler dans les outils MCP**

Dans `src/app/api/mcp/route.ts`, ajouter aux imports :

```ts
import {projectSpecSchema, exampleDomainSchema} from "@/lib/schemas/module.schema";
import {forceDraft} from "@/lib/pedagogy/mcpProjectSpec";
```

Dans le bloc de paramètres de `create_module` (après `universe`) et de `edit_module` (après `universe`), ajouter les trois mêmes entrées :

```ts
            projectSpec: projectSpecSchema.optional()
                .describe("Spec du projet fil rouge : name, pitch, finalDeliverable, entities[]. "
                    + "Toujours enregistrée en brouillon — la validation se fait dans l'admin."),
            exampleDomain: exampleDomainSchema.optional()
                .describe("Domaine d'illustration RÉSERVÉ au cours, distinct du projet. "
                    + "Le cours ne doit jamais illustrer avec le domaine du projet."),
            plannedNotions: z.array(z.string()).optional()
                .describe("Notions à couvrir sur l'ensemble du module, posées avant le choix du projet."),
```

Dans le corps de `edit_module`, après les affectations existantes de `set` :

```ts
            if (projectSpec !== undefined) set.projectSpec = forceDraft(projectSpec, mod.projectSpec);
            if (exampleDomain !== undefined) set.exampleDomain = exampleDomainSchema.parse(exampleDomain);
            if (plannedNotions !== undefined) set.plannedNotions = plannedNotions;
```

Même traitement dans `create_module` (sans `existing`, donc `forceDraft(projectSpec)`), en ajoutant les trois clés à l'objet inséré.

Dans la `projection` de `get_module` (`route.ts:788`), ajouter :

```ts
                        projectSpec: 1,
                        exampleDomain: 1,
                        plannedNotions: 1,
```

- [ ] **Step 6: Vérifier la compilation et l'exposition**

Run: `bunx tsc --noEmit && bun test tests/mcp/`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/pedagogy/mcpProjectSpec.ts src/lib/pedagogy/mcpProjectSpec.test.ts src/app/api/mcp/route.ts
git commit -m "feat(mcp): projectSpec, exampleDomain et plannedNotions, toujours écrits en brouillon"
```

---

### Task 5: MCP — `push_project_reference`

**Files:**
- Create: `src/lib/pedagogy/projectReference.ts`
- Create: `src/lib/pedagogy/projectReference.test.ts`
- Modify: `src/app/api/mcp/route.ts` (nouvel outil, à la suite de `push_correction`)

**Interfaces:**
- Consomme : `assertCanPushReference` (Task 2) ; `getPrivateProjectConfig`, `ensurePrivateProject`, `commitFiles`, type `CorrectionFile` de `@/lib/gitlab`.
- Produit : `referenceProjectSlug(moduleSlug)` → `` `projet-reference-${moduleSlug}` `` ; `assertReferenceFiles(files)` qui rejette un chemin absolu, un `..` ou une liste vide.

**Rappel :** `ensurePrivateProject` écrit dans l'espace personnel du token `GITLAB_PROJET_TOKEN` (`getPrivateProjectConfig`), pas dans le groupe des corrections. `commitFiles` fait un commit qui **reflète exactement** la liste passée — les fichiers absents de la liste sont supprimés du dépôt.

- [ ] **Step 1: Write the failing test**

```ts
import {describe, expect, test} from "bun:test";
import {referenceProjectSlug, assertReferenceFiles} from "@/lib/pedagogy/projectReference";

describe("referenceProjectSlug", () => {
    test("préfixe le slug du module", () => {
        expect(referenceProjectSlug("rust")).toBe("projet-reference-rust");
    });
});

describe("assertReferenceFiles", () => {
    test("refuse une liste vide", () => {
        expect(() => assertReferenceFiles([])).toThrow(/au moins un fichier/);
    });
    test("refuse un chemin absolu", () => {
        expect(() => assertReferenceFiles([{path: "/etc/passwd", content: "x"}])).toThrow(/relatif/);
    });
    test("refuse une remontée de dossier", () => {
        expect(() => assertReferenceFiles([{path: "../hors", content: "x"}])).toThrow(/relatif/);
    });
    test("accepte des chemins relatifs normaux", () => {
        expect(() => assertReferenceFiles([
            {path: "src/main.rs", content: "fn main() {}"},
            {path: "Cargo.toml", content: "[package]"},
        ])).not.toThrow();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/pedagogy/projectReference.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
import type {CorrectionFile} from "@/lib/gitlab";

/** Nom du projet GitLab privé qui porte le code de référence d'un module. */
export function referenceProjectSlug(moduleSlug: string): string {
    return `projet-reference-${moduleSlug}`;
}

/** Le dépôt de référence ne contient que des chemins relatifs sous la racine :
 *  `commitFiles` reflète la liste telle quelle, une entrée malformée casse le commit. */
export function assertReferenceFiles(files: CorrectionFile[]): void {
    if (files.length === 0) {
        throw new Error("Le dépôt de référence doit contenir au moins un fichier.");
    }
    for (const file of files) {
        if (file.path.startsWith("/") || file.path.split("/").includes("..")) {
            throw new Error(`Chemin invalide "${file.path}" : un chemin relatif sous la racine est attendu.`);
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/pedagogy/projectReference.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Ajouter l'outil MCP**

Dans `src/app/api/mcp/route.ts`, imports :

```ts
import {getPrivateProjectConfig, ensurePrivateProject, commitFiles} from "@/lib/gitlab";
import {assertCanPushReference} from "@/lib/pedagogy/gates";
import {referenceProjectSlug, assertReferenceFiles} from "@/lib/pedagogy/projectReference";
```

Puis, à la suite de l'outil `push_correction` :

```ts
    // ── push_project_reference ────────────────────────────────────────────────
    server.tool(
        "push_project_reference",
        "Pousse la VERSION FINALE du projet fil rouge dans le dépôt GitLab privé du module. "
        + "Exige que la spec projet soit validée dans l'admin. Le dépôt reflète exactement les "
        + "fichiers envoyés (les absents sont supprimés). Réservé aux admins.",
        {
            module: z.string().describe("Slug du module, ex: rust"),
            files: z.array(z.object({
                path:    z.string().describe("Chemin relatif sous la racine, ex: src/main.rs"),
                content: z.string(),
            })).describe("Le projet terminé, dans son état de fin de module"),
            message: z.string().optional().describe("Message de commit"),
        },
        async ({module, files, message}) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const mod = await db.collection<Module>("modules").findOne({path: module});
            if (!mod) throw new Error(`Module "${module}" introuvable.`);

            assertCanPushReference(mod.projectSpec, module);
            assertReferenceFiles(files);

            const cfg = getPrivateProjectConfig();
            const slug = referenceProjectSlug(module);
            const project = await ensurePrivateProject(cfg, slug);
            const sha = await commitFiles(cfg, project.id, files, message ?? `Projet de référence — ${module}`);

            await db.collection("modules").updateOne(
                {path: module},
                {$set: {
                    "projectSpec.referenceRepo": {url: project.webUrl, status: "draft"},
                    updatedAt: new Date().toISOString(),
                }}
            );

            return {
                content: [{
                    type: "text" as const,
                    text: `Projet de référence poussé : ${project.webUrl} (commit ${sha.slice(0, 8)}). `
                        + `Statut « brouillon » — relisez-le et validez-le dans l'admin avant de rédiger les supports.`,
                }],
            };
        }
    );
```

- [ ] **Step 6: Vérifier la compilation**

Run: `bunx tsc --noEmit && bun run lint`
Expected: aucune erreur.

- [ ] **Step 7: Commit**

```bash
git add src/lib/pedagogy/projectReference.ts src/lib/pedagogy/projectReference.test.ts src/app/api/mcp/route.ts
git commit -m "feat(mcp): push_project_reference vers le dépôt privé du module"
```

---

### Task 6: MCP — `get_project_reference`

**Files:**
- Modify: `src/lib/gitlab.ts` (exporter la lecture de fichiers)
- Modify: `src/app/api/mcp/route.ts` (nouvel outil)

**Interfaces:**
- Consomme : `referenceProjectSlug` (Task 5), `getPrivateProjectConfig`, `ensurePrivateProject`.
- Produit : `listRepoFiles(cfg, projectId)` devient **exporté** (il existe déjà en privé, utilisé par `commitFiles`) ; nouvelle `readRepoFile(cfg, projectId, filePath): Promise<string>`.

**Pourquoi :** `content-writer` doit relire le code cible avant de rédiger un TP, dans une session qui n'a pas écrit ce code.

- [ ] **Step 1: Écrire la lecture de fichier**

Dans `src/lib/gitlab.ts`, passer `listRepoFiles` en `export` et ajouter :

```ts
/** Contenu d'un fichier sur `main`, décodé depuis la base64 renvoyée par l'API. */
export async function readRepoFile(
    cfg: GitlabConfig, projectId: number, filePath: string
): Promise<string> {
    const res = await gitlabFetch(
        cfg,
        `/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}?ref=main`
    );
    if (!res.ok) throw await gitlabError(res, `lecture du fichier ${filePath}`);
    const file = await res.json() as { content: string };
    return Buffer.from(file.content, "base64").toString("utf-8");
}
```

- [ ] **Step 2: Ajouter l'outil MCP**

Dans `src/app/api/mcp/route.ts`, à la suite de `push_project_reference` :

```ts
    // ── get_project_reference ─────────────────────────────────────────────────
    server.tool(
        "get_project_reference",
        "Lit le projet de référence d'un module. Sans `path`, retourne l'arbre des fichiers ; "
        + "avec `path`, le contenu du fichier. À lire AVANT de rédiger un TP : le résultat "
        + "observable de chaque exercice doit sortir de ce code, pas d'une invention.",
        {
            module: z.string().describe("Slug du module, ex: rust"),
            path:   z.string().optional().describe("Chemin d'un fichier ; omis = arbre complet"),
        },
        async ({module, path: filePath}) => {
            const db = await connectToDB();
            const mod = await db.collection<Module>("modules").findOne({path: module});
            if (!mod) throw new Error(`Module "${module}" introuvable.`);
            if (!mod.projectSpec?.referenceRepo) {
                throw new Error(`Le module "${module}" n'a pas encore de projet de référence.`);
            }

            const cfg = getPrivateProjectConfig();
            const project = await ensurePrivateProject(cfg, referenceProjectSlug(module));

            if (filePath) {
                const content = await readRepoFile(cfg, project.id, filePath);
                return {content: [{type: "text" as const, text: content}]};
            }

            const files = await listRepoFiles(cfg, project.id);
            return {
                content: [{
                    type: "text" as const,
                    text: `${files.length} fichier(s) :\n${files.join("\n")}`,
                }],
            };
        }
    );
```

Compléter les imports : `listRepoFiles`, `readRepoFile`.

- [ ] **Step 3: Vérifier la compilation**

Run: `bunx tsc --noEmit && bun run lint`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/lib/gitlab.ts src/app/api/mcp/route.ts
git commit -m "feat(mcp): get_project_reference pour relire le code cible avant rédaction"
```

---

### Task 7: MCP — verrou sur les outils d'écriture de contenu

**Files:**
- Modify: `src/app/api/mcp/route.ts` (`save_content:866`, `insert_block`, `edit_block`, `delete_block`, `reorder_blocks`)
- Test: `src/lib/pedagogy/gates.test.ts` (déjà couvert par Task 2)

**Interfaces:**
- Consomme : `assertCanWriteContent` (Task 2).
- Produit : `assertModuleWritable(db, moduleSlug)` — helper local à `route.ts`, charge le module et délègue à `assertCanWriteContent`.

- [ ] **Step 1: Ajouter le helper**

Dans `src/app/api/mcp/route.ts`, à côté des autres fonctions utilitaires (après `saveBlocks`) :

```ts
/** Porte 2 : refuse toute écriture de contenu tant que le dépôt de référence
 *  du module n'est pas validé. Les modules sans dépôt déclaré passent. */
async function assertModuleWritable(moduleSlug: string): Promise<void> {
    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne(
        {path: moduleSlug},
        {projection: {projectSpec: 1}}
    );
    if (!mod) throw new Error(`Module "${moduleSlug}" introuvable.`);
    assertCanWriteContent(mod.projectSpec, moduleSlug);
}
```

Compléter l'import : `assertCanWriteContent` depuis `@/lib/pedagogy/gates`.

- [ ] **Step 2: Câbler dans les cinq outils**

Dans `save_content`, juste après `if (!isAdmin) throw new Error("Forbidden");` :

```ts
            await assertModuleWritable(module);
```

Faire de même en tête de `insert_block`, `edit_block`, `delete_block` et `reorder_blocks`, chacun disposant déjà d'un paramètre `module`.

- [ ] **Step 3: Vérifier la compilation et les tests**

Run: `bunx tsc --noEmit && bun test`
Expected: PASS.

- [ ] **Step 4: Vérifier le comportement réel sur staging**

Via un client MCP, appeler `save_content` sur un module dont `projectSpec.referenceRepo.status` vaut `draft`.
Expected: erreur « Le dépôt de référence du module "…" n'est pas validé ». Sur un module migré (sans `referenceRepo`), l'écriture passe.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): verrouille l'écriture de contenu sur la validation du dépôt de référence"
```

---

### Task 8: API admin — écriture des champs de conception et validation des portes

**Files:**
- Modify: `src/app/api/admin/modules/[id]/route.ts`
- Create: `src/app/api/admin/modules/[id]/validate/route.ts`
- Create: `src/lib/pedagogy/validateGate.ts`
- Test: `src/lib/pedagogy/validateGate.test.ts`

**Interfaces:**
- Consomme : `moduleFormSchema` (Task 1), `ProjectSpec`.
- Produit : `validateGateSchema` (Zod, `{gate: "projectSpec" | "referenceRepo"}`), `buildGateUpdate(gate, spec)` → objet `$set` MongoDB, ou lève si la porte précédente n'est pas franchie. Signature : `(gate: "projectSpec" | "referenceRepo", spec: ProjectSpec | undefined) => Record<string, unknown>`.

**Règle métier :** on ne valide pas le dépôt avant la spec, et on ne valide pas une spec incomplète.

- [ ] **Step 1: Write the failing test**

```ts
import {describe, expect, test} from "bun:test";
import {buildGateUpdate} from "@/lib/pedagogy/validateGate";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

const spec = (over: Partial<ProjectSpec> = {}): ProjectSpec => ({
    name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: ["Order"], status: "draft", ...over,
});

describe("buildGateUpdate", () => {
    test("valide la spec projet", () => {
        expect(buildGateUpdate("projectSpec", spec())).toEqual({"projectSpec.status": "validated"});
    });

    test("refuse de valider une spec sans livrable final", () => {
        expect(() => buildGateUpdate("projectSpec", spec({finalDeliverable: ""})))
            .toThrow(/livrable final/);
    });

    test("refuse de valider un dépôt inexistant", () => {
        expect(() => buildGateUpdate("referenceRepo", spec({status: "validated"})))
            .toThrow(/aucun dépôt de référence/);
    });

    test("refuse de valider le dépôt avant la spec", () => {
        expect(() => buildGateUpdate("referenceRepo", spec({
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }))).toThrow(/spec projet/);
    });

    test("valide le dépôt quand la spec l'est déjà", () => {
        expect(buildGateUpdate("referenceRepo", spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }))).toEqual({"projectSpec.referenceRepo.status": "validated"});
    });

    test("refuse un module sans spec", () => {
        expect(() => buildGateUpdate("projectSpec", undefined)).toThrow(/aucune spec projet/);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/pedagogy/validateGate.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
import {z} from "zod";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

export const validateGateSchema = z.object({
    gate: z.enum(["projectSpec", "referenceRepo"]),
});

/** Construit le `$set` d'une validation de porte, ou lève si l'ordre n'est pas respecté.
 *  Seul l'humain passe par ici : les agents MCP écrivent toujours en brouillon. */
export function buildGateUpdate(
    gate: "projectSpec" | "referenceRepo",
    spec: ProjectSpec | undefined
): Record<string, unknown> {
    if (!spec) throw new Error("Ce module n'a aucune spec projet à valider.");

    if (gate === "projectSpec") {
        if (!spec.finalDeliverable.trim()) {
            throw new Error("Renseignez le livrable final avant de valider la spec projet.");
        }
        return {"projectSpec.status": "validated"};
    }

    if (spec.status !== "validated") {
        throw new Error("Validez d'abord la spec projet, puis le dépôt de référence.");
    }
    if (!spec.referenceRepo) {
        throw new Error("Ce module n'a aucun dépôt de référence : faites-le pousser avant de valider.");
    }
    return {"projectSpec.referenceRepo.status": "validated"};
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/pedagogy/validateGate.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Créer la route de validation**

`src/app/api/admin/modules/[id]/validate/route.ts` :

```ts
import {NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {connectToDB} from "@/lib/mongodb";
import {withAdmin} from "@/lib/withAdmin";
import {validateGateSchema, buildGateUpdate} from "@/lib/pedagogy/validateGate";
import type Module from "@/types/Module";

export const POST = withAdmin(async (req: Request, {params}: {params: Promise<{id: string}>}) => {
    const {id} = await params;
    const parsed = validateGateSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({error: "Porte inconnue."}, {status: 400});
    }

    const db = await connectToDB();
    const mod = await db.collection<Module>("modules").findOne({_id: new ObjectId(id)});
    if (!mod) return NextResponse.json({error: "Module introuvable."}, {status: 404});

    try {
        const update = buildGateUpdate(parsed.data.gate, mod.projectSpec);
        await db.collection("modules").updateOne(
            {_id: new ObjectId(id)},
            {$set: {...update, updatedAt: new Date().toISOString()}}
        );
        return NextResponse.json({ok: true});
    } catch (error) {
        return NextResponse.json({error: (error as Error).message}, {status: 409});
    }
});
```

Vérifier la signature exacte de `withAdmin` dans `src/lib/withAdmin.ts` et l'aligner sur celle des routes voisines (`src/app/api/admin/modules/[id]/route.ts`).

- [ ] **Step 6: Accepter les nouveaux champs en PUT**

Dans `src/app/api/admin/modules/[id]/route.ts`, le handler `PUT` valide déjà le corps avec `moduleFormSchema` : les trois nouveaux champs passent automatiquement puisqu'ils y ont été ajoutés en Task 1. Vérifier qu'aucune liste blanche de clés ne les filtre en amont ; si c'est le cas, y ajouter `projectSpec`, `exampleDomain`, `plannedNotions`.

- [ ] **Step 7: Vérifier**

Run: `bunx tsc --noEmit && bun run lint && bun test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/pedagogy/validateGate.ts src/lib/pedagogy/validateGate.test.ts src/app/api/admin/modules/
git commit -m "feat(api): validation des portes spec projet et dépôt de référence"
```

---

# Chantier 2 — Admin, écran progressif

### Task 9: États dérivés du module (module pur)

**Files:**
- Create: `src/lib/pedagogy/moduleProgress.ts`
- Test: `src/lib/pedagogy/moduleProgress.test.ts`

**Interfaces:**
- Consomme : `Module`, `Section`.
- Produit :
  - `type StepId = "cadrage" | "notions" | "projet" | "reference" | "sections" | "briefs" | "reglages"`
  - `type StepState = "todo" | "done"`
  - `moduleSteps(module): Array<{id: StepId; label: string; state: StepState}>` — dans l'ordre du workflow.
  - `currentStepId(module): StepId` — la première étape `todo`, ou `"reglages"` si tout est fait.
  - `sectionProgress(section): {brief: boolean; cours: boolean; slide: boolean; tp: boolean; examen: boolean}`

**Règle :** aucun statut n'est stocké. Tout se lit sur le document existant.

- [ ] **Step 1: Write the failing test**

```ts
import {describe, expect, test} from "bun:test";
import {moduleSteps, currentStepId, sectionProgress} from "@/lib/pedagogy/moduleProgress";
import type Module from "@/types/Module";
import type Section from "@/types/Section";

const emptyModule = {
    _id: "1", title: "Rust", path: "rust", iconName: "Code",
    sections: [], associatedSae: [],
} as unknown as Module;

const fullModule = {
    ...emptyModule,
    sessionDurationMinutes: 90,
    plannedNotions: ["ownership", "traits"],
    projectSpec: {
        name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: ["Order"],
        status: "validated" as const,
        referenceRepo: {url: "https://git.example/u/x", status: "validated" as const},
    },
    exampleDomain: {name: "Bibliothèque", description: "Livres"},
    sections: [{
        title: "Bases", path: "bases", order: 1, totalDuration: 2, contents: [], tags: [],
        hasCorrection: false,
        brief: {objectives: [], notions: [], filRougeStep: "x", filRougeOutcome: "y"},
    } as unknown as Section],
} as unknown as Module;

describe("moduleSteps", () => {
    test("tout est à faire sur un module vide", () => {
        const steps = moduleSteps(emptyModule);
        expect(steps.map((s) => s.id)).toEqual(
            ["cadrage", "notions", "projet", "reference", "sections", "briefs", "reglages"]
        );
        expect(steps.filter((s) => s.state === "done")).toHaveLength(0);
    });

    test("tout est fait sur un module complet", () => {
        expect(moduleSteps(fullModule).every((s) => s.state === "done")).toBe(true);
    });

    test("le projet reste à faire tant que la spec est en brouillon", () => {
        const mod = {...fullModule, projectSpec: {...fullModule.projectSpec!, status: "draft" as const}};
        const steps = moduleSteps(mod as Module);
        expect(steps.find((s) => s.id === "projet")?.state).toBe("todo");
    });
});

describe("currentStepId", () => {
    test("pointe la première étape non franchie", () => {
        expect(currentStepId(emptyModule)).toBe("cadrage");
    });

    test("pointe le projet quand cadrage et notions sont faits", () => {
        const mod = {...emptyModule, sessionDurationMinutes: 90, plannedNotions: ["a"]} as Module;
        expect(currentStepId(mod)).toBe("projet");
    });

    test("retombe sur les réglages quand tout est fait", () => {
        expect(currentStepId(fullModule)).toBe("reglages");
    });
});

describe("sectionProgress", () => {
    test("marque le brief dès que le fil rouge est renseigné", () => {
        const section = {
            contents: [], brief: {objectives: [], notions: [], filRougeStep: "x", filRougeOutcome: "y"},
        } as unknown as Section;
        expect(sectionProgress(section).brief).toBe(true);
    });

    test("un brief sans étape fil rouge ne compte pas", () => {
        const section = {
            contents: [], brief: {objectives: [], notions: [], filRougeStep: "", filRougeOutcome: ""},
        } as unknown as Section;
        expect(sectionProgress(section).brief).toBe(false);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/pedagogy/moduleProgress.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {getContentTypes} from "@/types/CourseContent";

export type StepId = "cadrage" | "notions" | "projet" | "reference" | "sections" | "briefs" | "reglages";
export type StepState = "todo" | "done";

export interface ModuleStep {
    id: StepId;
    label: string;
    state: StepState;
}

const LABELS: Record<StepId, string> = {
    cadrage:   "Cadrage",
    notions:   "Notions",
    projet:    "Projet",
    reference: "Référence",
    sections:  "Sections",
    briefs:    "Briefs",
    reglages:  "Réglages",
};

const ORDER: StepId[] = ["cadrage", "notions", "projet", "reference", "sections", "briefs", "reglages"];

function isDone(module: Module, step: StepId): boolean {
    switch (step) {
        case "cadrage":   return Boolean(module.sessionDurationMinutes);
        case "notions":   return (module.plannedNotions?.length ?? 0) > 0;
        case "projet":    return module.projectSpec?.status === "validated";
        case "reference": return module.projectSpec?.referenceRepo?.status === "validated";
        case "sections":  return module.sections.length > 0;
        case "briefs":    return module.sections.length > 0
            && module.sections.every((section) => sectionProgress(section).brief);
        case "reglages":  return Boolean(module.exampleDomain);
    }
}

export function moduleSteps(module: Module): ModuleStep[] {
    return ORDER.map((id) => ({id, label: LABELS[id], state: isDone(module, id) ? "done" : "todo"}));
}

/** La première étape non franchie — celle que l'écran déplie au chargement. */
export function currentStepId(module: Module): StepId {
    return moduleSteps(module).find((step) => step.state === "todo")?.id ?? "reglages";
}

export interface SectionProgress {
    brief: boolean;
    cours: boolean;
    slide: boolean;
    tp: boolean;
    examen: boolean;
}

export function sectionProgress(section: Section): SectionProgress {
    const types = getContentTypes(section.contents);
    const brief = Boolean(section.brief?.filRougeStep?.trim() || section.brief?.filRougeOutcome?.trim());
    return {
        brief,
        cours:  types.includes("cours"),
        slide:  types.includes("slide"),
        tp:     types.includes("TP"),
        examen: types.includes("examen"),
    };
}
```

Vérifier la casse exacte des types de contenu dans `src/types/CourseContent.ts` et `src/lib/contentMeta.ts` avant de figer les comparaisons.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/pedagogy/moduleProgress.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pedagogy/moduleProgress.ts src/lib/pedagogy/moduleProgress.test.ts
git commit -m "feat(pedagogy): états d'avancement dérivés du module et des sections"
```

---

### Task 10: Page module et frise d'étapes

**Files:**
- Create: `src/app/admin/(dashboard)/modules/[slug]/page.tsx`
- Create: `src/components/admin/module-workflow/ModuleWorkflow.tsx`
- Create: `src/components/admin/module-workflow/StepStrip.tsx`
- Create: `src/components/admin/module-workflow/WorkflowStep.tsx`

**Interfaces:**
- Consomme : `moduleSteps`, `currentStepId`, `StepId` (Task 9) ; `getModules` de `@/lib/getModules` ; `Collapsible` de `@/components/ui/collapsible`.
- Produit :
  - `<StepStrip steps={ModuleStep[]} currentId={StepId} onSelect={(id: StepId) => void} />`
  - `<WorkflowStep id={StepId} label={string} state={StepState} open={boolean} onOpenChange={(open: boolean) => void}>{children}</WorkflowStep>`
  - `<ModuleWorkflow module={Module} />` — client component, tient l'étape ouverte dans un `useState` initialisé à `currentStepId(module)`.

**Contraintes UI (issues de `ui-ux-pro-max`) :** indicateur « Étape N sur 7 » obligatoire ; `Collapsible`, jamais un `div onClick` ; boutons ≥ 44 px ; `aria-current="step"` sur l'étape active ; l'état ne doit pas se lire uniquement à la couleur — chaque pastille porte aussi une icône (`Check` / `Circle` de lucide) et un `aria-label`.

- [ ] **Step 1: Créer la page serveur**

```tsx
import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import ModuleWorkflow from "@/components/admin/module-workflow/ModuleWorkflow";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({defaultTitle: "Module", noIndex: true});

export default async function AdminModulePage({params}: {params: Promise<{slug: string}>}) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const {slug} = await params;
    const modules = await getModules();
    const module = modules.find((candidate) => candidate.path === slug);
    if (!module) notFound();

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title={module.title}
                description="Concevez le projet, poussez le code de référence, puis pilotez la rédaction."
            />
            <ModuleWorkflow module={JSON.parse(JSON.stringify(module))}/>
        </>
    );
}
```

`JSON.parse(JSON.stringify(...))` garantit qu'aucun `ObjectId` ne franchit la frontière serveur/client (règle CLAUDE.md section 6). Si `getModules()` sérialise déjà, retirer cette ligne.

- [ ] **Step 2: Créer la frise**

`StepStrip.tsx` :

```tsx
"use client";

import {Check, Circle} from "lucide-react";
import {cn} from "@/lib/utils";
import type {ModuleStep, StepId} from "@/lib/pedagogy/moduleProgress";

interface StepStripProps {
    steps: ModuleStep[];
    currentId: StepId;
    onSelect: (id: StepId) => void;
}

export default function StepStrip({steps, currentId, onSelect}: StepStripProps) {
    const position = steps.findIndex((step) => step.id === currentId) + 1;

    return (
        <nav aria-label="Étapes de conception du module" className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-bridge-600 dark:text-bridge-400">
                Étape {position} sur {steps.length}
            </p>
            <ol className="flex flex-wrap items-center gap-1.5">
                {steps.map((step) => {
                    const active = step.id === currentId;
                    const done = step.state === "done";
                    const Icon = done ? Check : Circle;
                    return (
                        <li key={step.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(step.id)}
                                aria-current={active ? "step" : undefined}
                                aria-label={`${step.label} — ${done ? "franchie" : "à faire"}`}
                                className={cn(
                                    "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-semibold",
                                    "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
                                    "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                                    active
                                        ? "bg-brand-primary text-white"
                                        : "text-brand-dark hover:bg-bridge-100 dark:text-bridge-200 dark:hover:bg-bridge-900",
                                )}
                            >
                                <Icon className="size-4" aria-hidden="true"/>
                                {step.label}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
```

- [ ] **Step 3: Créer l'étape repliable**

`WorkflowStep.tsx` :

```tsx
"use client";

import type {ReactNode} from "react";
import {Check, ChevronDown, Circle} from "lucide-react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {cn} from "@/lib/utils";
import type {StepState} from "@/lib/pedagogy/moduleProgress";

interface WorkflowStepProps {
    label: string;
    summary?: string;
    state: StepState;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export default function WorkflowStep({label, summary, state, open, onOpenChange, children}: WorkflowStepProps) {
    const done = state === "done";
    const Icon = done ? Check : Circle;

    return (
        <Collapsible open={open} onOpenChange={onOpenChange}>
            <section className="rounded-lg border border-bridge-500/45 bg-card">
                <CollapsibleTrigger
                    className={cn(
                        "flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left",
                        "transition-colors duration-200 hover:bg-bridge-100/40 dark:hover:bg-bridge-900/30",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                    )}
                >
                    <Icon
                        className={cn("size-4 shrink-0", done ? "text-bridge-700 dark:text-bridge-200" : "text-brand-accent-dark")}
                        aria-hidden="true"
                    />
                    <span className="flex-1 text-sm font-semibold text-brand-dark dark:text-bridge-100">
                        {label}
                    </span>
                    {summary && !open && (
                        <span className="hidden truncate text-xs text-bridge-600 sm:block dark:text-bridge-400">
                            {summary}
                        </span>
                    )}
                    <ChevronDown
                        className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
                        aria-hidden="true"
                    />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-bridge-500/20 px-4 py-4">
                    {children}
                </CollapsibleContent>
            </section>
        </Collapsible>
    );
}
```

- [ ] **Step 4: Assembler le conteneur**

`ModuleWorkflow.tsx` : composant client qui appelle `moduleSteps(module)`, tient `const [openStep, setOpenStep] = useState<StepId>(currentStepId(module))`, rend `<StepStrip/>` puis un `<WorkflowStep/>` par étape. Le contenu de chaque étape arrive aux tâches 11 à 14 ; pour cette tâche, rendre un `<p>` nommant l'étape afin que la page soit navigable.

- [ ] **Step 5: Vérifier dans le navigateur**

Run: `bun dev` puis ouvrir `/admin/modules/<un-slug-existant>`.
Expected: la frise indique « Étape N sur 7 », l'étape courante est dépliée, les autres repliées. Vérifier au clavier (Tab + Entrée) et en thème sombre.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/\(dashboard\)/modules/\[slug\]/ src/components/admin/module-workflow/
git commit -m "feat(admin): page module avec frise d'étapes et sections repliables"
```

---

### Task 11: Étapes de conception éditées en place

**Files:**
- Create: `src/components/admin/module-workflow/steps/CadrageStep.tsx`
- Create: `src/components/admin/module-workflow/steps/NotionsStep.tsx`
- Create: `src/components/admin/module-workflow/steps/ProjetStep.tsx`
- Modify: `src/components/admin/module-workflow/ModuleWorkflow.tsx`

**Interfaces:**
- Consomme : `WorkflowStep` (Task 10), `moduleFormSchema` / `projectSpecSchema` / `exampleDomainSchema` (Task 1), la route `PUT /api/admin/modules/[id]` et `POST /api/admin/modules/[id]/validate` (Task 8).
- Produit : chaque composant d'étape reçoit `{module: Module; onSaved: (patch: Partial<Module>) => void}` et gère son propre `useForm`.

**Contraintes UI :** `react-hook-form` + `zodResolver`, `Label` lié par `htmlFor`, message d'erreur sous le champ, bouton désactivé pendant la soumission (`isSubmitting`) — c'est le pattern de `ModuleFormFields.tsx`, s'y aligner. Jamais de placeholder en guise de label.

- [ ] **Step 1: Cadrage**

Champs : `sessionDurationMinutes` (number, min 1). Bouton « Enregistrer » → `PUT /api/admin/modules/${module._id}` avec le module complet patché, `toast.success` puis `onSaved`.

- [ ] **Step 2: Notions**

`plannedNotions: string[]` édité en liste : un `Input` + bouton « Ajouter », chaque notion affichée en `Badge` avec un bouton de retrait portant `aria-label={`Retirer ${notion}`}`. Enregistrement par le même `PUT`.

- [ ] **Step 3: Projet**

Champs `projectSpec` : `name`, `pitch`, `finalDeliverable` (`Textarea`), `entities[]` (même motif de liste que les notions), plus `exampleDomain.name` et `exampleDomain.description`.

Sous le champ `exampleDomain`, afficher un texte d'aide constant :

```tsx
<p className="mt-1 text-xs text-bridge-600 dark:text-bridge-400">
    Domaine d&apos;illustration du cours. Il doit être différent du projet : sinon un
    copier-coller du cours suffit à faire le TP.
</p>
```

Bouton « Valider la spec projet » → `POST /api/admin/modules/${module._id}/validate` avec `{gate: "projectSpec"}`. En cas de réponse 409, afficher le message du serveur via `toast.error` — c'est lui qui nomme le champ manquant.

Une fois `projectSpec.status === "validated"`, remplacer le bouton par un `Badge` « Validée » et un bouton « Repasser en brouillon » qui envoie un `PUT` remettant `status: "draft"`.

- [ ] **Step 4: Vérifier**

Run: `bun run lint && bunx tsc --noEmit`, puis dans le navigateur : remplir cadrage, notions, projet, valider la spec. Vérifier qu'une spec sans livrable final refuse la validation avec le message attendu.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/module-workflow/
git commit -m "feat(admin): étapes cadrage, notions et projet éditées en place"
```

---

### Task 12: Étape référence

**Files:**
- Create: `src/components/admin/module-workflow/steps/ReferenceStep.tsx`
- Modify: `src/components/admin/module-workflow/ModuleWorkflow.tsx`

**Interfaces:**
- Consomme : `POST /api/admin/modules/[id]/validate` avec `{gate: "referenceRepo"}`.
- Produit : `<ReferenceStep module={Module} onSaved={(patch: Partial<Module>) => void} />`.

**Cette étape ne crée rien** : le dépôt est poussé par l'agent via `push_project_reference`. L'écran l'affiche et le valide.

- [ ] **Step 1: Trois états à rendre**

1. `projectSpec.status !== "validated"` → message « Validez d'abord la spec projet. », aucun bouton.
2. Pas de `referenceRepo` → message « Aucun code de référence poussé. Demandez à l'assistant de coder le projet, il le poussera ici. »
3. `referenceRepo` présent → lien externe vers `referenceRepo.url` (avec `target="_blank" rel="noopener noreferrer"` et une icône `ExternalLink` doublée d'un texte), plus un bouton « J'ai relu, valider le code de référence ».

- [ ] **Step 2: Bouton de validation**

`POST` sur la route de validation avec `{gate: "referenceRepo"}`, `toast` de succès, `onSaved({projectSpec: {...module.projectSpec!, referenceRepo: {...repo, status: "validated"}}})`.

Ajouter un avertissement au-dessus du bouton, en `Alert` :

```tsx
<Alert>
    <AlertDescription>
        Valider ouvre la rédaction des cours et des TP. Les supports seront écrits pour
        atteindre ce code : relisez-le avant.
    </AlertDescription>
</Alert>
```

- [ ] **Step 3: Vérifier**

Dans le navigateur, sur un module sans dépôt : le message d'attente s'affiche. Après un `push_project_reference` via MCP, recharger : le lien apparaît, la validation fonctionne, et `save_content` cesse d'être refusé.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/module-workflow/steps/ReferenceStep.tsx src/components/admin/module-workflow/ModuleWorkflow.tsx
git commit -m "feat(admin): étape de validation du dépôt de référence"
```

---

### Task 13: Tableau de pilotage et édition de section en ligne

**Files:**
- Create: `src/components/admin/module-workflow/steps/SectionsStep.tsx`
- Create: `src/components/admin/module-workflow/SectionProgressBadges.tsx`
- Create: `src/components/admin/module-workflow/InlineSectionRow.tsx`
- Modify: `src/components/admin/AdminSection.tsx`

**Interfaces:**
- Consomme : `sectionProgress` (Task 9), `AdminDataTable` et `AdminColumn` de `@/components/admin/ui/AdminDataTable`, `useAdminApi` de `@/hook/admin/useAdminApi`.
- Produit :
  - `<SectionProgressBadges progress={SectionProgress} />` — une pastille par support, chacune avec `title` et texte accessible.
  - `<InlineSectionRow module={Module} section={Section | null} onDone={() => void} />` — formulaire en ligne, `section === null` pour une création.
  - `<SectionsStep module={Module} />` — le tableau complet.

**Rappel CLAUDE.md :** colonnes déclarées en `AdminColumn<TData>`, pas de `@tanstack/react-table`.

- [ ] **Step 1: Badges d'avancement**

Un `Badge` par support (`brief`, `cours`, `slide`, `TP`, `examen`) : `variant="default"` si présent, `variant="outline"` sinon. La couleur ne porte jamais l'information seule — chaque badge affiche son libellé et un `title` explicite (« Cours rédigé » / « Cours à rédiger »).

- [ ] **Step 2: Édition en ligne**

`InlineSectionRow` reprend les champs de `SectionForm` (titre, path, `totalDuration`, `courseIntroMinutes`, `contents`, objectifs, tags, brief) dans une ligne dépliée sous la section, en `react-hook-form` + `sectionFormSchema`. Soumission via `useAdminApi().editSection` / `addSection` — les mêmes appels qu'aujourd'hui, seule la surface change.

- [ ] **Step 3: Le tableau**

`SectionsStep` rend un `AdminDataTable` dont les colonnes sont : numéro d'ordre, titre, badges d'avancement, switches (réutiliser `AdminSection` pour cette partie), actions (éditer en ligne, supprimer via `AlertDialog` existant). Un bouton « Ajouter une section » ouvre un `InlineSectionRow` vide en fin de tableau.

- [ ] **Step 4: Vérifier**

Run: `bun run lint && bunx tsc --noEmit`. Dans le navigateur : créer, éditer et supprimer une section sans qu'aucune modale de formulaire ne s'ouvre. Vérifier à 375 px que le tableau défile horizontalement dans son propre conteneur sans faire déborder la page.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/module-workflow/ src/components/admin/AdminSection.tsx
git commit -m "feat(admin): tableau de pilotage et édition de section en ligne"
```

---

### Task 14: Étapes briefs et réglages

**Files:**
- Create: `src/components/admin/module-workflow/steps/BriefsStep.tsx`
- Create: `src/components/admin/module-workflow/steps/ReglagesStep.tsx`
- Modify: `src/components/admin/module-workflow/ModuleWorkflow.tsx`

**Interfaces:**
- Consomme : `briefSchema` (Task 1), `ModuleFormFields` existant.
- Produit : `<BriefsStep module={Module} />`, `<ReglagesStep module={Module} />`.

- [ ] **Step 1: Briefs**

Une ligne par section, chacune avec `filRougeStep`, `filRougeOutcome` et `providedBase` (optionnel) en `Textarea`. Enregistrement par section via `useAdminApi().editSection`.

Texte d'aide sous `filRougeOutcome` :

```tsx
<p className="mt-1 text-xs text-bridge-600 dark:text-bridge-400">
    Ce qui tourne à la fin de la section, pas ce qui a été appris.
</p>
```

- [ ] **Step 2: Réglages**

Monter `ModuleFormFields` tel quel dans l'étape, dans un `<form>` qui soumet vers `PUT /api/admin/modules/${module._id}`. Retirer de `ModuleFormFields` les champs de conception qui vivent désormais dans les étapes projet et cadrage (`universe`, `sessionDurationMinutes`) : ils y feraient doublon.

- [ ] **Step 3: Vérifier**

Run: `bun run lint && bunx tsc --noEmit`. Dans le navigateur : modifier une couleur, un coefficient, un brief ; recharger et confirmer la persistance.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/module-workflow/
git commit -m "feat(admin): étapes briefs et réglages"
```

---

# Chantier 3 — Skill

### Task 15: Réécriture de `module-design`

**Files:**
- Modify: `skills/module-design/main.md`

**Interfaces:**
- Consomme : les outils `create_module`, `edit_module`, `push_project_reference`, `get_project_reference` (Tasks 4-6).
- Produit : un document dont le workflow suit six étapes, chacune sous un titre `###` **repris verbatim** par un prompt MCP (Task 16) : `Cadrage`, `Notions`, `Projet`, `Code de référence`, `Sections`, `Briefs`. Aucune étape « Contexte » séparée : la lecture des ressources MCP (`list_modules`, `list_sections`, `list_verdicts`) devient une sous-consigne au sein de l'étape qui en a besoin, pas un palier à part — elle n'a pas d'écran ni de porte qui lui corresponde.

- [ ] **Step 1: Remplacer la section « Workflow »**

Les titres deviennent, dans l'ordre, exactement : `### Cadrage`, `### Notions`, `### Projet`, `### Code de référence`, `### Sections`, `### Briefs`. Ces six titres sont un contrat : Task 16 les cite verbatim dans les prompts MCP `module_cadrage` … `module_briefs`. Ne pas les reformuler après coup sans répercuter le changement sur Task 16.

Points à écrire explicitement :

- Étape « Cadrage » : collecte matière/thème, niveau, nombre de séances, durée de séance.
- Étape « Notions » : liste `plannedNotions`, la progression à couvrir — **avant** tout choix de projet.
- Étape « Projet » : sous-consigne de lecture du contexte (`list_modules`, `list_sections` des prérequis, `list_verdicts` format `module-design`) puis l'agent propose une `projectSpec` **et** un `exampleDomain` distinct, les écrit via `edit_module` (toujours en brouillon), puis **s'arrête** : « relisez et validez dans l'admin ».
- Étape « Code de référence » : une fois la spec validée, l'agent écrit le projet complet et le pousse via `push_project_reference`, puis **s'arrête** de nouveau.
- Étape « Sections » : l'agent relit son code via `get_project_reference` et propose un découpage où **chaque section est une tranche du projet**, avec la vérification « somme des séances = budget du module ».
- Étape « Briefs » : `filRougeStep`, `filRougeOutcome` et `providedBase` de chaque section.

La septième étape de l'écran admin, « Réglages » (couleurs, coefficients, intervenants, SAÉ), n'a **aucune** contrepartie dans ce document : c'est de la saisie factuelle sans jugement pédagogique, déjà couverte par `edit_module`. Son prompt MCP (Task 16) ne référence donc pas ce document.

- [ ] **Step 2: Mettre à jour la « Philosophie »**

Remplacer « Un univers par module » par la règle des deux domaines : le projet porte le fil rouge, `exampleDomain` porte les exemples du cours, et ils ne se recouvrent jamais.

- [ ] **Step 3: Vérifier la cohérence**

Relire le document en entier : aucune mention résiduelle de « 2-3 univers candidats », aucune étape de création de module avant la validation de la spec.

- [ ] **Step 4: Commit**

```bash
git add skills/module-design/main.md
git commit -m "docs(skill): module-design sur les 7 étapes et le projet de référence"
```

---

### Task 16: MCP — prompts par étape (module-design)

**Files:**
- Create: `src/lib/pedagogy/stepPrompts.ts`
- Create: `src/lib/pedagogy/stepPrompts.test.ts`
- Modify: `src/app/api/mcp/route.ts`

**Interfaces:**
- Consomme : `StepId` de `@/lib/pedagogy/moduleProgress` (Task 9) — les identifiants doivent correspondre terme à terme ; les titres `###` de `skills/module-design/main.md` (Task 15) — repris verbatim.
- Produit : `MODULE_STEP_PROMPTS: StepPromptDef[]` (un par étape de l'écran admin, `reglages` compris) et `buildModuleStepPromptMessage(stepLabel: string, moduleSlug: string): string`, tous deux exportés et testés seuls ; sept appels `server.registerPrompt(...)` dans `route.ts`.

**Pourquoi un prompt par étape :** le serveur MCP n'expose aujourd'hui que des *tools* (fonctions) et des *resources* (les documents de skill, lus passivement — l'agent doit deviner où il en est dans un document de plusieurs milliers de mots). Le protocole MCP a un troisième type d'objet, les *prompts* : un item nommé et paramétré que le client (Claude Desktop, claude.ai) affiche dans une palette et invoque directement. Un prompt par étape rend chaque étape de l'écran `/admin/modules/[slug]` directement lançable, sans reformuler une phrase libre en espérant que l'agent retrouve la bonne section du document.

Le contenu pédagogique reste dans les deux documents de skill (`module-design/main.md`, `content-writer/main.md`) : un prompt ne duplique jamais ce texte, il pointe l'agent vers la bonne section et lui interdit d'en déborder. Sept petits documents à maintenir en plus des deux existants aurait été la vraie duplication.

- [ ] **Step 1: Write the failing test**

```ts
import {describe, expect, test} from "bun:test";
import {MODULE_STEP_PROMPTS, buildModuleStepPromptMessage} from "@/lib/pedagogy/stepPrompts";
import {moduleSteps} from "@/lib/pedagogy/moduleProgress";
import type Module from "@/types/Module";

describe("MODULE_STEP_PROMPTS", () => {
    test("un prompt par étape de l'écran, dans le même ordre", () => {
        const emptyModule = {sections: [], associatedSae: []} as unknown as Module;
        const screenSteps = moduleSteps(emptyModule).map((s) => s.id);
        expect(MODULE_STEP_PROMPTS.map((p) => p.stepId)).toEqual(screenSteps);
    });

    test("des noms de prompt uniques, préfixés module_", () => {
        const ids = MODULE_STEP_PROMPTS.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.every((id) => id.startsWith("module_"))).toBe(true);
    });

    test("l'étape réglages ne référence aucun document de skill", () => {
        const reglages = MODULE_STEP_PROMPTS.find((p) => p.stepId === "reglages");
        expect(reglages?.stepLabel).toBeUndefined();
    });

    test("chaque autre étape porte le titre exact du document module-design", () => {
        const projet = MODULE_STEP_PROMPTS.find((p) => p.stepId === "projet");
        expect(projet?.stepLabel).toBe("Projet");
    });
});

describe("buildModuleStepPromptMessage", () => {
    test("nomme le module et l'étape, et interdit de déborder", () => {
        const msg = buildModuleStepPromptMessage("Projet", "rust");
        expect(msg).toContain("rust");
        expect(msg).toContain("« Projet »");
        expect(msg).toContain("module-design");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/pedagogy/stepPrompts.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Write minimal implementation**

```ts
import type {StepId} from "@/lib/pedagogy/moduleProgress";

export interface StepPromptDef {
    id: string;
    stepId: StepId;
    title: string;
    description: string;
    /** Titre `###` exact dans skills/module-design/main.md. Absent pour "reglages",
     *  qui est de la saisie factuelle (edit_module) sans contrepartie pédagogique. */
    stepLabel?: string;
}

export const MODULE_STEP_PROMPTS: StepPromptDef[] = [
    {
        id: "module_cadrage", stepId: "cadrage", stepLabel: "Cadrage",
        title: "Cadrer un nouveau module",
        description: "Matière, niveau, nombre de séances, durée de séance — première étape de conception.",
    },
    {
        id: "module_notions", stepId: "notions", stepLabel: "Notions",
        title: "Lister les notions à couvrir",
        description: "Progression de notions à poser avant de choisir le projet fil rouge.",
    },
    {
        id: "module_projet", stepId: "projet", stepLabel: "Projet",
        title: "Concevoir le projet fil rouge",
        description: "Spec du projet et domaine d'exemples du cours, jusqu'à la validation dans l'admin.",
    },
    {
        id: "module_reference", stepId: "reference", stepLabel: "Code de référence",
        title: "Construire le dépôt de référence",
        description: "Code le projet fil rouge complet et le pousse sur GitLab, jusqu'à la validation.",
    },
    {
        id: "module_sections", stepId: "sections", stepLabel: "Sections",
        title: "Découper en sections",
        description: "Relit le code de référence validé et propose le découpage en sections.",
    },
    {
        id: "module_briefs", stepId: "briefs", stepLabel: "Briefs",
        title: "Rédiger les briefs de section",
        description: "filRougeStep, filRougeOutcome et providedBase de chaque section.",
    },
    {
        id: "module_reglages", stepId: "reglages",
        title: "Régler les paramètres du module",
        description: "Couleurs, coefficients, intervenants, SAÉ — aucun contenu pédagogique.",
    },
];

/** Seed message d'un prompt d'étape : nomme le module, pointe l'agent vers la
 *  section exacte du document module-design, et lui interdit d'en déborder
 *  sans validation explicite si l'étape en comporte une. */
export function buildModuleStepPromptMessage(stepLabel: string, moduleSlug: string): string {
    return `Le module concerné est "${moduleSlug}". Chargez le document skill://pedagogy/module-design `
        + `(get_pedagogical_skill_document avec id="module-design") et exécutez UNIQUEMENT l'étape `
        + `« ${stepLabel} » de son workflow. Ne passez pas aux étapes suivantes sans validation `
        + `explicite si l'étape en comporte une.`;
}

/** Réglages n'a pas de document à charger : la consigne reste directe. */
export function buildReglagesPromptMessage(moduleSlug: string): string {
    return `Le module concerné est "${moduleSlug}". Demandez à l'utilisateur les valeurs à régler `
        + `(couleurs, coefficients, intervenants, SAÉ) et appliquez-les via edit_module. `
        + `Aucun document de skill à charger pour cette étape.`;
}
```

`moduleSteps()` (Task 9) prend un `Module` complet ; sur un module vide toutes les étapes sont `"todo"` mais l'ordre des `id` renvoyés est stable et sert de référence ici — c'est ce que le premier test vérifie.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/lib/pedagogy/stepPrompts.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Enregistrer les sept prompts MCP**

Dans `src/app/api/mcp/route.ts`, imports :

```ts
import {MODULE_STEP_PROMPTS, buildModuleStepPromptMessage, buildReglagesPromptMessage} from "@/lib/pedagogy/stepPrompts";
```

Dans `buildMcpServer`, après le dernier `server.tool(...)` :

```ts
    // ── Prompts d'étape (module-design) ─────────────────────────────────────────
    for (const def of MODULE_STEP_PROMPTS) {
        server.registerPrompt(
            def.id,
            {
                title: def.title,
                description: def.description,
                argsSchema: {module: z.string().describe("Slug du module, ex: rust")},
            },
            ({module}) => {
                if (!isAdmin) throw new Error("Forbidden");
                const text = def.stepLabel
                    ? buildModuleStepPromptMessage(def.stepLabel, module)
                    : buildReglagesPromptMessage(module);
                return {
                    messages: [{role: "user" as const, content: {type: "text" as const, text}}],
                };
            }
        );
    }
```

- [ ] **Step 6: Vérifier la compilation et l'exposition**

Run: `bunx tsc --noEmit && bun run lint`
Expected: aucune erreur.

Vérifier manuellement via un client MCP connecté (Claude Desktop ou `claude mcp list-prompts` si disponible) que les sept prompts apparaissent dans la palette, chacun demandant un argument `module`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/pedagogy/stepPrompts.ts src/lib/pedagogy/stepPrompts.test.ts src/app/api/mcp/route.ts
git commit -m "feat(mcp): un prompt par étape du workflow module (palette du client MCP)"
```

---

### Task 17: Réécriture de `content-writer`

**Files:**
- Modify: `skills/content-writer/main.md`
- Modify: `src/app/api/mcp/route.ts` (un prompt `content_writer`)

- [ ] **Step 1: Ajouter les deux invariants durs**

Dans « Invariants non négociables » :

```markdown
- **Cours — domaine d'illustration** : le cours illustre avec l'`exampleDomain` du module,
  JAMAIS avec le domaine du projet fil rouge. Un exemple de cours qui reprend le projet est
  un défaut BLOQUANT : il rend le TP faisable par copier-coller.
- **TP — cible réelle** : avant d'écrire le squelette, lisez le code cible avec
  `get_project_reference`. Le résultat observable de chaque exercice sort de ce code, pas
  d'une invention. Un TP dont la cible ne correspond pas au dépôt est un défaut BLOQUANT.
```

- [ ] **Step 2: Ajouter l'exemple d'arbre de blocs**

Nouvelle section, avant « Grammaire des blocs » — c'est l'application du verdict du 2026-07-15 :

````markdown
## Format de l'arbre de blocs

`save_content` attend un tableau de blocs. Chaque bloc porte un `id` unique, un `type` du
registre, ses `props`, et `children` pour les conteneurs.

```json
[
  {
    "id": "sec-1",
    "type": "section",
    "props": {"title": "Les variables"},
    "children": [
      {"id": "txt-1", "type": "text", "props": {"content": "Une variable garde une valeur."}},
      {
        "id": "code-1",
        "type": "code",
        "props": {"language": "rust", "filename": "src/main.rs", "code": "let plat = \"ratatouille\";"}
      }
    ]
  }
]
```

Un bloc sans `children` n'en déclare pas. Les `id` sont libres mais uniques dans l'arbre.
`list_block_types` fait foi pour les `props` exactes de chaque type.
````

- [ ] **Step 3: Ajouter le tableau des outils**

````markdown
## Quel outil quand

| Situation | Outil | Piège |
|---|---|---|
| Première écriture d'un contenu | `save_content` | **Écrase tout l'arbre** — jamais pour une retouche |
| Ajouter un bloc | `insert_block` | — |
| Corriger un bloc | `edit_block` | — |
| Relire pour copier (staging → prod) | `get_content` | Renvoie le JSON, round-trip sans perte |
| Relire pour se documenter | `export_content_compact` | Markdown, **lecture seule** : jamais pour une copie |
| Connaître l'état du projet cible | `get_project_reference` | À lire avant tout squelette de TP |
````

- [ ] **Step 4: Mettre à jour l'étape 2 du workflow**

La liste des lectures de contexte gagne : `get_module` pour `projectSpec` et `exampleDomain`,
et `get_project_reference` pour le code cible.

- [ ] **Step 5: Enregistrer le prompt MCP `content_writer`**

Contrairement à `module-design`, la rédaction n'a pas d'étapes d'écran séparées à faire
correspondre : un seul prompt suffit, qui laisse le document lui-même demander quels supports
rédiger (sa propre étape 1 « Cadrage »).

Dans `src/app/api/mcp/route.ts`, à la suite des sept `registerPrompt` de Task 16 :

```ts
    server.registerPrompt(
        "content_writer",
        {
            title: "Rédiger cours, TP, slides ou examen",
            description: "Rédige les supports d'une section existante, en suivant le workflow content-writer.",
            argsSchema: {
                module: z.string().describe("Slug du module, ex: rust"),
                section: z.string().describe("Slug de la section, ex: ownership"),
            },
        },
        ({module, section}) => {
            if (!isAdmin) throw new Error("Forbidden");
            const text = `Le module concerné est "${module}", la section "${section}". `
                + `Chargez le document skill://pedagogy/content-writer `
                + `(get_pedagogical_skill_document avec id="content-writer") et suivez son workflow `
                + `en entier, en commençant par son étape 1 (choix des supports à rédiger).`;
            return {
                messages: [{role: "user" as const, content: {type: "text" as const, text}}],
            };
        }
    );
```

- [ ] **Step 6: Vérifier la compilation**

Run: `bunx tsc --noEmit && bun run lint`
Expected: aucune erreur.

- [ ] **Step 7: Commit**

```bash
git add skills/content-writer/main.md src/app/api/mcp/route.ts
git commit -m "docs(skill): invariants domaine d'exemples et cible réelle, format des blocs, prompt content_writer"
```

---

### Task 18: Régénération et vérification de l'exposition

**Files:**
- Modify: `src/lib/skills/pedagogy.ts` (généré)
- Modify: `tests/mcp/skill-exposure.test.ts`

- [ ] **Step 1: Ajouter un test d'exposition**

```ts
test("content-writer documente le format de l'arbre de blocs", () => {
    const doc = SKILL_DOCUMENTS["content-writer"];
    expect(doc.content).toContain("Format de l'arbre de blocs");
    expect(doc.content).toContain("get_project_reference");
});

test("module-design décrit le code de référence", () => {
    expect(SKILL_DOCUMENTS["module-design"].content).toContain("push_project_reference");
});
```

Aligner l'import de `SKILL_DOCUMENTS` sur celui déjà présent dans le fichier de test.

- [ ] **Step 2: Régénérer**

Run: `bun run generate-skill`
Expected: `Généré : src/lib/skills/pedagogy.ts (hash …)` — un hash différent de `986cd0636354`.

- [ ] **Step 3: Run tests**

Run: `bun test tests/mcp/`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/skills/pedagogy.ts tests/mcp/skill-exposure.test.ts
git commit -m "chore(skill): régénère les documents pédagogiques"
```

---

# Chantier 4 — Démontage des surfaces flottantes

### Task 19: Suppression du Dialog, du Sheet et du SectionForm

**Files:**
- Modify: `src/components/admin/AdminModule.tsx`
- Modify: `src/components/admin/ModulesList.tsx`
- Delete: `src/components/admin/EditModuleSheet.tsx`
- Delete: `src/components/admin/SectionForm.tsx`
- Delete: `src/components/admin/EditSectionButton.tsx`
- Delete: `src/components/admin/AdminSheetHeader.tsx` (si plus aucun consommateur)

**Interfaces:**
- Consomme : la page `/admin/modules/[slug]` (Task 10) et ses étapes (Tasks 11-14), qui doivent être complètes avant cette tâche.

**Cette tâche vient en dernier** : elle supprime les surfaces existantes une fois leur remplaçant en place et vérifié.

- [ ] **Step 1: Vérifier les consommateurs**

Run: `bun run lint` après suppression, et rechercher chaque symbole avant de supprimer :

```bash
grep -rn "EditModuleSheet\|SectionForm\|EditSectionButton\|AdminSheetHeader" src/
```

`AdminSheetHeader` et `ExportImportSheet` / `MigrateSheet` peuvent partager des dépendances : ne supprimer `AdminSheetHeader` que si la recherche ne renvoie plus aucun usage.

- [ ] **Step 2: Transformer l'icône en lien**

Dans `AdminModule.tsx`, le bouton « Gérer les sections » (`AdminModule.tsx:184`) devient un lien :

```tsx
<Button
    asChild
    variant="ghost"
    size="icon"
    className="size-11 text-bridge-600 hover:bg-brand-primary/10 hover:text-brand-primary dark:text-bridge-300"
>
    <Link href={`/admin/modules/${modData.path}`} aria-label={`Ouvrir le module ${modData.title}`} title="Ouvrir le module">
        <FolderOpen aria-hidden="true"/>
    </Link>
</Button>
```

Supprimer le bouton « Modifier le module » (l'icône `Settings`) : les réglages vivent dans la page.

- [ ] **Step 3: Retirer le Dialog**

Supprimer le bloc `<Dialog open={detailsOpen} …>` (`AdminModule.tsx:247-335`) et les états `detailsOpen`, `editModuleOpen`, `addSectionOpen` devenus inutiles, ainsi que les handlers `handleEditModule` et `addSection`. Conserver l'`AlertDialog` de suppression du module et `AdminModuleVisibility`.

- [ ] **Step 4: Supprimer les fichiers**

```bash
git rm src/components/admin/EditModuleSheet.tsx src/components/admin/SectionForm.tsx src/components/admin/EditSectionButton.tsx
```

- [ ] **Step 5: Vérifier de bout en bout**

Run: `bunx tsc --noEmit && bun run lint && bun test && bun run build`
Expected: aucune erreur. Dans le navigateur : depuis `/admin/modules`, ouvrir un module, parcourir les 7 étapes, créer et supprimer une section. Aucune modale de formulaire ne doit s'ouvrir.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/admin/
git commit -m "refactor(admin): supprime le dialog des sections et les formulaires en panneau latéral"
```

---

### Task 20: Vérification finale et détection de régression

- [ ] **Step 1: Suite complète**

Run: `bunx tsc --noEmit && bun run lint && bun test && bun run build`
Expected: aucune erreur, build standalone réussi.

- [ ] **Step 2: Portée des changements**

Utiliser `detect_changes({scope: "compare", base_ref: "main"})` (GitNexus) et vérifier que les symboles touchés correspondent aux fichiers listés dans ce plan — c'est la règle du projet avant tout commit d'ampleur.

- [ ] **Step 3: Vérifier la migration sur staging**

Run: `bun run migrate:project-spec --dry-run` puis, après lecture du rapport, `bun run migrate:project-spec`
Expected: chaque module ayant un `universe` obtient un `projectSpec` validé ; aucun n'obtient de `referenceRepo`, donc aucune rédaction existante n'est bloquée.

- [ ] **Step 4: Vérifier le parcours complet sur un module neuf**

Créer un module de test via l'admin, parcourir les 7 étapes, faire pousser un projet de référence par l'assistant, le valider, puis rédiger un cours. Vérifier qu'avant validation `save_content` refuse avec le message attendu, et qu'après validation il passe.

- [ ] **Step 5: Vérifier la palette de prompts MCP**

Depuis un client MCP connecté (Claude Desktop, claude.ai), lister les prompts disponibles : les huit doivent apparaître (`module_cadrage`, `module_notions`, `module_projet`, `module_reference`, `module_sections`, `module_briefs`, `module_reglages`, `content_writer`), chacun demandant les arguments attendus (`module`, et `section` pour `content_writer`). Invoquer `module_projet` sur un module de test et vérifier que le message reçu par l'agent nomme le module et l'étape « Projet ».
