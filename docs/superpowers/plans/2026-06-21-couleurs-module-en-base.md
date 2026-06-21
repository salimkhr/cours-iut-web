# Couleurs de module en base — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stocker la couleur (light + dark) de chaque module dans MongoDB, l'injecter au runtime via un `<style>` généré dans le layout, l'éditer depuis l'admin, et l'assigner automatiquement à la création.

**Architecture:** A-inject. `globals.css` reste inchangé (valeurs par défaut). Le layout racine lit `getModules()` et rend une balise `<style>` qui override `:root{--color-{path}}` / `.dark{--color-{path}}` avec les valeurs de la base. Tous les consommateurs existants (classes `bg-${path}`, styles inline `var(--color-${path})`, lectures `getComputedStyle`) restent inchangés. Création → couleur piochée dans une palette curée. Édition → deux `<input type="color">` dans `EditModuleSheet`, persistés via le `moduleFormSchema` existant.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, MongoDB driver, Zod v4, react-hook-form, runner de tests `bun:test` (DB mémoire via `tests/helpers/db.ts`).

**Spec:** `docs/superpowers/specs/2026-06-21-couleurs-module-en-base-design.md`

---

## Conventions de ce plan

- Lancer un fichier de test : `bun test <chemin>`
- Indentation 4 espaces, imports via alias `@/*`, pas d'`any`.
- Commits fréquents, un par tâche.

---

### Task 1: Champs couleur sur le modèle Module + schema

**Files:**
- Modify: `src/types/Module.ts`
- Modify: `src/lib/schemas/module.schema.ts`
- Test: `tests/lib/module-schema.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Créer `tests/lib/module-schema.test.ts` :

```ts
import { describe, test, expect } from "bun:test";
import { moduleFormSchema } from "@/lib/schemas/module.schema";

const BASE = {
    title: "Rust",
    path: "rust",
    iconName: "Code",
    coefficients: [],
};

describe("moduleFormSchema — couleurs", () => {
    test("accepte un hex valide (light + dark)", () => {
        const r = moduleFormSchema.safeParse({ ...BASE, colorLight: "#C13B1A", colorDark: "#FF8568" });
        expect(r.success).toBe(true);
    });

    test("accepte l'absence de couleur", () => {
        const r = moduleFormSchema.safeParse(BASE);
        expect(r.success).toBe(true);
    });

    test("rejette un hex invalide", () => {
        const r = moduleFormSchema.safeParse({ ...BASE, colorLight: "red" });
        expect(r.success).toBe(false);
    });

    test("rejette un hex à 3 chiffres", () => {
        const r = moduleFormSchema.safeParse({ ...BASE, colorLight: "#fff" });
        expect(r.success).toBe(false);
    });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `bun test tests/lib/module-schema.test.ts`
Expected: FAIL (le hex invalide est accepté car le champ n'existe pas encore → `rejette un hex invalide` échoue).

- [ ] **Step 3: Ajouter les champs au schema**

Dans `src/lib/schemas/module.schema.ts`, ajouter avant `export const moduleFormSchema` :

```ts
export const hexColorSchema = z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide (#rrggbb)");
```

Puis, dans l'objet `moduleFormSchema`, ajouter deux propriétés (par ex. après `isExtra`) :

```ts
    colorLight: hexColorSchema.optional(),
    colorDark: hexColorSchema.optional(),
```

- [ ] **Step 4: Ajouter les champs au type Module**

Dans `src/types/Module.ts`, ajouter dans l'interface `Module` (après `isExtra?: boolean;`) :

```ts
    colorLight?: string;
    colorDark?: string;
```

- [ ] **Step 5: Lancer le test pour vérifier le succès**

Run: `bun test tests/lib/module-schema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/types/Module.ts src/lib/schemas/module.schema.ts tests/lib/module-schema.test.ts
git commit -m "feat(modules): champs colorLight/colorDark sur Module + schema"
```

---

### Task 2: Palette curée + helper d'assignation de couleur

**Files:**
- Create: `src/lib/moduleColorPalette.ts`
- Create: `src/lib/assignModuleColor.ts`
- Test: `tests/lib/assignModuleColor.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Créer `tests/lib/assignModuleColor.test.ts` :

```ts
import { describe, test, expect } from "bun:test";
import { assignModuleColor } from "@/lib/assignModuleColor";
import { MODULE_COLOR_PALETTE } from "@/lib/moduleColorPalette";

describe("assignModuleColor", () => {
    test("retourne une paire de la palette", () => {
        const pair = assignModuleColor([], () => 0);
        expect(pair).toEqual(MODULE_COLOR_PALETTE[0]);
    });

    test("évite une paire déjà utilisée", () => {
        const used = [{ colorLight: MODULE_COLOR_PALETTE[0].colorLight }];
        // rng=0 → premier élément du pool "libre" (donc PAS l'index 0 global)
        const pair = assignModuleColor(used, () => 0);
        expect(pair.colorLight).not.toBe(MODULE_COLOR_PALETTE[0].colorLight);
    });

    test("retombe sur la palette complète si tout est pris", () => {
        const used = MODULE_COLOR_PALETTE.map((p) => ({ colorLight: p.colorLight }));
        const pair = assignModuleColor(used, () => 0);
        expect(pair).toEqual(MODULE_COLOR_PALETTE[0]);
    });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `bun test tests/lib/assignModuleColor.test.ts`
Expected: FAIL (modules introuvables : "Cannot find module").

- [ ] **Step 3: Créer la palette**

Créer `src/lib/moduleColorPalette.ts` :

```ts
export interface ModuleColorPair {
    colorLight: string;
    colorDark: string;
}

/**
 * Paires (light/dark) au contraste pré-validé :
 * - light : lisible sur fond crème #f7ebd9 ET avec texte blanc
 * - dark  : lisible sur fond sombre ET en fond avec texte sombre
 * Les 4 premières reprennent les couleurs historiques de globals.css.
 */
export const MODULE_COLOR_PALETTE: ModuleColorPair[] = [
    { colorLight: "#C13B1A", colorDark: "#FF8568" }, // rouge
    { colorLight: "#3B3F7A", colorDark: "#9198E5" }, // indigo
    { colorLight: "#7A6200", colorDark: "#FFD93D" }, // or
    { colorLight: "#6B21A8", colorDark: "#C07AF8" }, // violet
    { colorLight: "#1338A0", colorDark: "#6B9FFF" }, // bleu
    { colorLight: "#0F6E6E", colorDark: "#4FD1C5" }, // teal
    { colorLight: "#2F6B2F", colorDark: "#7BD88F" }, // vert
    { colorLight: "#9D1D5A", colorDark: "#F472B6" }, // magenta
];
```

- [ ] **Step 4: Créer le helper**

Créer `src/lib/assignModuleColor.ts` :

```ts
import { MODULE_COLOR_PALETTE, type ModuleColorPair } from "@/lib/moduleColorPalette";

/**
 * Choisit une paire de couleurs pour un nouveau module.
 * Privilégie une paire dont le `colorLight` n'est pas déjà utilisé ;
 * si toutes sont prises, tire au hasard dans la palette complète.
 * `rng` est injectable pour les tests (défaut: Math.random).
 */
export function assignModuleColor(
    used: { colorLight?: string }[],
    rng: () => number = Math.random,
): ModuleColorPair {
    const usedLights = new Set(
        used.map((m) => m.colorLight).filter((c): c is string => !!c),
    );
    const free = MODULE_COLOR_PALETTE.filter((p) => !usedLights.has(p.colorLight));
    const pool = free.length > 0 ? free : MODULE_COLOR_PALETTE;
    const index = Math.floor(rng() * pool.length) % pool.length;
    return pool[index];
}
```

- [ ] **Step 5: Lancer le test pour vérifier le succès**

Run: `bun test tests/lib/assignModuleColor.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/moduleColorPalette.ts src/lib/assignModuleColor.ts tests/lib/assignModuleColor.test.ts
git commit -m "feat(modules): palette curée + assignModuleColor"
```

---

### Task 3: Assigner une couleur à la création (POST admin + MCP)

**Files:**
- Modify: `src/app/api/admin/modules/route.ts`
- Modify: `src/app/api/mcp/route.ts` (branche `create_module`, ~lignes 193-221)
- Test: `tests/api/admin/modules.test.ts` (ajout)

- [ ] **Step 1: Ajouter le test qui échoue**

Dans `tests/api/admin/modules.test.ts`, ajouter ce test dans le `describe` du POST (après les tests existants, avant la fermeture du fichier) :

```ts
test("POST assigne une couleur si absente", async () => {
    session = ADMIN_SESSION;
    const res = await postModule(new Request("http://x/api/admin/modules", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...VALID_MODULE, sections: [] }),
    }));
    expect(res.status).toBe(201);
    const doc = await db.collection("modules").findOne({ path: "javascript" });
    expect(doc?.colorLight).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(doc?.colorDark).toMatch(/^#[0-9a-fA-F]{6}$/);
});

test("POST conserve une couleur fournie", async () => {
    session = ADMIN_SESSION;
    const res = await postModule(new Request("http://x/api/admin/modules", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...VALID_MODULE, sections: [], colorLight: "#0F6E6E", colorDark: "#4FD1C5" }),
    }));
    expect(res.status).toBe(201);
    const doc = await db.collection("modules").findOne({ path: "javascript" });
    expect(doc?.colorLight).toBe("#0F6E6E");
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `bun test tests/api/admin/modules.test.ts`
Expected: FAIL ("POST assigne une couleur si absente" : `doc.colorLight` est `undefined`).

- [ ] **Step 3: Modifier le POST admin**

Dans `src/app/api/admin/modules/route.ts`, ajouter l'import :

```ts
import {assignModuleColor} from "@/lib/assignModuleColor";
```

Puis remplacer le bloc d'insertion :

```ts
        const db = await connectToDB();
        const collection = db.collection('modules');

        const result = await collection.insertOne(parsed.data);
```

par :

```ts
        const db = await connectToDB();
        const collection = db.collection('modules');

        const hasColor = !!(parsed.data.colorLight && parsed.data.colorDark);
        const colors = hasColor
            ? {}
            : assignModuleColor(
                await collection.find({}, {projection: {colorLight: 1}}).toArray(),
            );

        const result = await collection.insertOne({...parsed.data, ...colors});
```

- [ ] **Step 4: Modifier la branche MCP `create_module`**

Dans `src/app/api/mcp/route.ts`, ajouter l'import en tête de fichier (avec les autres imports `@/lib/...`) :

```ts
import {assignModuleColor} from "@/lib/assignModuleColor";
```

Dans la branche `create_module`, remplacer l'insertion :

```ts
            const r = await db.collection<Omit<Module, "_id">>("modules").insertOne({
                ...parsed.data,
                sections: [],
                updatedAt: new Date().toISOString(),
            });
```

par :

```ts
            const colors = assignModuleColor(
                await db.collection<Module>("modules")
                    .find({}, {projection: {colorLight: 1}}).toArray(),
            );

            const r = await db.collection<Omit<Module, "_id">>("modules").insertOne({
                ...parsed.data,
                ...colors,
                sections: [],
                updatedAt: new Date().toISOString(),
            });
```

- [ ] **Step 5: Lancer le test pour vérifier le succès**

Run: `bun test tests/api/admin/modules.test.ts`
Expected: PASS (tous les tests, dont les 2 nouveaux).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/modules/route.ts src/app/api/mcp/route.ts tests/api/admin/modules.test.ts
git commit -m "feat(modules): assignation auto de couleur à la création (POST + MCP)"
```

---

### Task 4: Script de migration (seed des 5 modules existants)

**Files:**
- Create: `src/scripts/migrate-module-colors.ts`

> Pas de package.json modifié (cf. CLAUDE.md §9) : on lance le script ad-hoc.

- [ ] **Step 1: Créer le script**

Créer `src/scripts/migrate-module-colors.ts` (même pattern que `src/scripts/migrate-contents-refs.ts`) :

```ts
import {connectToDB} from "@/lib/mongodb";

/** Couleurs historiques de globals.css → seed en base (aucun changement visuel). */
const COLORS: Record<string, {colorLight: string; colorDark: string}> = {
    "html-css":   {colorLight: "#C13B1A", colorDark: "#FF8568"},
    "php":        {colorLight: "#3B3F7A", colorDark: "#9198E5"},
    "javascript": {colorLight: "#7A6200", colorDark: "#FFD93D"},
    "brainfuck":  {colorLight: "#6B21A8", colorDark: "#C07AF8"},
};

async function main() {
    const db = await connectToDB();
    for (const [path, colors] of Object.entries(COLORS)) {
        const res = await db.collection("modules").updateOne(
            {path},
            {$set: colors},
        );
        console.log(`${path}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
    }
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
```

- [ ] **Step 2: Lancer la migration**

Run: `bunx dotenv-cli -e .env -e .env.local -- bun src/scripts/migrate-module-colors.ts`
Expected: 4 lignes `… matched=1 modified=1` (ou `modified=0` si déjà à jour). Si un module a `matched=0`, vérifier son `path` réel en base avant de continuer.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/migrate-module-colors.ts
git commit -m "chore(modules): script de migration des couleurs historiques"
```

---

### Task 5: Générateur de CSS de thème (sanitizé)

**Files:**
- Create: `src/lib/generateModuleThemeCss.ts`
- Test: `tests/lib/generateModuleThemeCss.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Créer `tests/lib/generateModuleThemeCss.test.ts` :

```ts
import { describe, test, expect } from "bun:test";
import { generateModuleThemeCss } from "@/lib/generateModuleThemeCss";

describe("generateModuleThemeCss", () => {
    test("émet :root et .dark pour un module valide", () => {
        const css = generateModuleThemeCss([
            { path: "php", colorLight: "#3B3F7A", colorDark: "#9198E5" },
        ]);
        expect(css).toContain(":root{--color-php:#3B3F7A}");
        expect(css).toContain(".dark{--color-php:#9198E5}");
    });

    test("ignore un path non conforme (anti-injection)", () => {
        const css = generateModuleThemeCss([
            { path: "php}; body{display:none", colorLight: "#3B3F7A" },
        ]);
        expect(css).toBe("");
    });

    test("ignore une couleur non hex", () => {
        const css = generateModuleThemeCss([
            { path: "php", colorLight: "red; }", colorDark: "#9198E5" },
        ]);
        expect(css).not.toContain("red");
        expect(css).toContain(".dark{--color-php:#9198E5}");
        expect(css).not.toContain(":root");
    });

    test("chaîne vide si aucune couleur", () => {
        expect(generateModuleThemeCss([{ path: "php" }])).toBe("");
        expect(generateModuleThemeCss([])).toBe("");
    });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `bun test tests/lib/generateModuleThemeCss.test.ts`
Expected: FAIL ("Cannot find module").

- [ ] **Step 3: Créer le générateur**

Créer `src/lib/generateModuleThemeCss.ts` :

```ts
import type Module from "@/types/Module";

const PATH_RE = /^[a-z0-9-]+$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type ThemeModule = Pick<Module, "path" | "colorLight" | "colorDark">;

/**
 * Génère un CSS qui override `--color-{path}` (light) et `.dark --color-{path}` (dark)
 * depuis les couleurs en base. Sanitize strictement `path` et chaque couleur pour
 * empêcher toute injection CSS. Un champ non conforme est ignoré.
 */
export function generateModuleThemeCss(modules: ThemeModule[]): string {
    const light: string[] = [];
    const dark: string[] = [];

    for (const m of modules) {
        if (!m.path || !PATH_RE.test(m.path)) continue;
        if (m.colorLight && HEX_RE.test(m.colorLight)) {
            light.push(`--color-${m.path}:${m.colorLight}`);
        }
        if (m.colorDark && HEX_RE.test(m.colorDark)) {
            dark.push(`--color-${m.path}:${m.colorDark}`);
        }
    }

    let css = "";
    if (light.length) css += `:root{${light.join(";")}}`;
    if (dark.length) css += `.dark{${dark.join(";")}}`;
    return css;
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `bun test tests/lib/generateModuleThemeCss.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/generateModuleThemeCss.ts tests/lib/generateModuleThemeCss.test.ts
git commit -m "feat(theme): generateModuleThemeCss (sanitizé, anti-injection)"
```

---

### Task 6: Injecter le `<style>` dans le layout racine

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Modifier le layout**

Dans `src/app/layout.tsx`, ajouter les imports :

```ts
import getModules from "@/lib/getModules";
import {generateModuleThemeCss} from "@/lib/generateModuleThemeCss";
```

Rendre le composant `async` et calculer le CSS. Remplacer la signature :

```ts
export default function RootLayout({children}: { children: React.ReactNode }) {
```

par :

```ts
export default async function RootLayout({children}: { children: React.ReactNode }) {
    // Tolérant à la phase de build (DB mockée) : pas de couleur → fallback globals.css.
    let themeCss = "";
    try {
        themeCss = generateModuleThemeCss(await getModules());
    } catch {
        themeCss = "";
    }
```

Puis insérer la balise `<style>` en **premier enfant de `<body>`** (avant `<ThemeProvider>`), pour qu'elle vienne après `globals.css` dans l'ordre source et gagne le cascade :

```tsx
            <body className="min-h-screen font-sans bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light">
                {themeCss && (
                    <style id="module-theme-vars" dangerouslySetInnerHTML={{__html: themeCss}}/>
                )}
                <ThemeProvider
```

- [ ] **Step 2: Vérifier le build**

Run: `bun run build`
Expected: build OK (pas d'erreur TS ; `next build` se termine).

- [ ] **Step 3: Vérification visuelle manuelle**

Run: `bun dev` puis ouvrir :
- la home (cartes modules colorées),
- une page de cours (`/php/...`), une page slide,
- bascule light/dark.

Expected: couleurs **identiques** à avant (les valeurs DB = valeurs historiques après Task 4). Dans le DevTools, vérifier la présence de `<style id="module-theme-vars">` dans le `<body>` et que `--color-php` calculé vient bien de cette balise.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(theme): injection runtime des couleurs de module dans le layout"
```

---

### Task 7: Color picker dans EditModuleSheet

**Files:**
- Modify: `src/components/admin/EditModuleSheet.tsx`

- [ ] **Step 1: Ajouter les valeurs par défaut du formulaire**

Dans `src/components/admin/EditModuleSheet.tsx`, dans `getDefaultValues()`, ajouter (après `isExtra`) :

```ts
        colorLight: module.colorLight ?? '#C2410C',
        colorDark: module.colorDark ?? '#FB923C',
```

- [ ] **Step 2: Ajouter la section « Couleurs » dans le formulaire**

Dans le JSX, juste après le séparateur qui suit la section « Identification » (la `<div className="h-px bg-bridge-700/20 …"/>` après `</section>`), insérer une nouvelle section :

```tsx
                        {/* Couleurs */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Couleurs du module</Eyebrow>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="em-color-light"
                                        type="color"
                                        className="h-9 w-12 rounded-md border border-bridge-500/45 bg-transparent cursor-pointer"
                                        {...register('colorLight')}
                                    />
                                    <Label htmlFor="em-color-light" className={labelCn}>Clair</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="em-color-dark"
                                        type="color"
                                        className="h-9 w-12 rounded-md border border-bridge-500/45 bg-transparent cursor-pointer"
                                        {...register('colorDark')}
                                    />
                                    <Label htmlFor="em-color-dark" className={labelCn}>Sombre</Label>
                                </div>
                            </div>
                            {(errors.colorLight || errors.colorDark) && (
                                <p className="text-red-500 text-xs">Couleur invalide (format #rrggbb).</p>
                            )}
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>
```

> `<input type="color">` renvoie toujours un `#rrggbb` minuscule valide → conforme à `hexColorSchema`. Pas de `Controller` nécessaire, `register` suffit.

- [ ] **Step 3: Vérifier le lint et le build**

Run: `bun run lint`
Expected: pas d'erreur sur `EditModuleSheet.tsx`.

Run: `bun run build`
Expected: build OK.

- [ ] **Step 4: Vérification manuelle**

`bun dev` → admin → éditer un module → changer la couleur claire/sombre → Enregistrer.
Recharger la page de ce module : la nouvelle couleur s'applique (classes `bg-${path}` et styles inline). Bascule light/dark cohérente.

> Le payload passe par `moduleFormSchema` (Task 1) et la route PUT `modules/[moduleId]` (déjà existante, valide via le même schema) → `colorLight`/`colorDark` sont persistés sans nouvelle route.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/EditModuleSheet.tsx
git commit -m "feat(admin): color picker light/dark dans EditModuleSheet"
```

---

### Task 8: Vérification finale

**Files:** aucun (vérification).

- [ ] **Step 1: Suite de tests complète**

Run: `bun test`
Expected: tous les tests passent (dont `tests/lib/*` et `tests/api/admin/modules.test.ts`).

- [ ] **Step 2: Lint + build**

Run: `bun run lint`
Run: `bun run build`
Expected: aucun warning bloquant ; build standalone OK.

- [ ] **Step 3: Checklist visuelle (light + dark)**

Vérifier le rendu **identique à l'avant-projet** pour les 5 modules, puis qu'une édition admin change bien la couleur :

- [ ] Home — cartes modules (icône, titre, barre de progression)
- [ ] Page module `/[module]` — `SectionCard`, `ModuleInfo`, stats
- [ ] Page section/contenu — titres, liens, badges, `header-${path}`
- [ ] Page slide — `SlideTitle` (lecture `getComputedStyle`)
- [ ] `HeroSection` (lecture `getComputedStyle`)
- [ ] Admin — `AdminModule`, `EditModuleSheet`
- [ ] Édition d'une couleur en admin → reflétée après reload
- [ ] Création d'un module (MCP `create_module` ou admin) → couleur auto distincte

- [ ] **Step 4: Commit éventuel des ajustements**

```bash
git add -A
git commit -m "fix(theme): ajustements post-vérification"
```

---

## Couverture du spec

| Section spec | Tâche(s) |
|---|---|
| §3 Modèle de données | Task 1 |
| §4 Injection runtime | Task 5, Task 6 |
| §5 Consommateurs inchangés | Task 6 step 3 + Task 8 step 3 (vérif) |
| §6 Color picker admin | Task 7 |
| §7 Assignation auto + login statique | Task 2, Task 3 (login : non touché) |
| §8 Migration | Task 4 |
| §10 Tests | Task 1, 2, 3, 5 (auto) + Task 4, 6, 7, 8 (manuel) |
