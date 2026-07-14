# Skills pédagogiques MCP — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deux skills MCP (`module-design`, `content-writer`) avec calibrage vivant en MongoDB, champs pédagogiques sur Module/Section, et visibilité admin.

**Architecture:** Documents de skill en Markdown dans le repo, compilés en module TS et servis via le manifeste MCP. Verdicts et exemplaires en MongoDB via 5 nouveaux outils MCP. Champs `brief`/`curriculum`/`courseIntroMinutes` sur Section, `universe` (sans `scope`) sur Module.

**Tech Stack:** Next.js 16 (App Router), MongoDB driver natif, Zod 4, MCP SDK (`@modelcontextprotocol/sdk`), bun test.

**Spec:** `docs/superpowers/specs/2026-07-14-skills-pedagogiques-mcp-design.md`

**Décisions d'alignement avec l'existant** (prises au moment du plan) :

- `Section.sessionCount` (spec) = le champ existant **`totalDuration`** (déjà « nombre de séances », min 1). Aucun nouveau champ, aucun renommage.
- Les formats calibrage utilisent l'énum MCP existante `cours | TP | examen | slide` (+ `module-design` pour les verdicts), pas la casse de la spec (`tp`, `slides`) — cohérence avec `CONTENT_TYPE` et tous les outils existants.
- `universe.scope` existe en DB/code avec `scope: "module" | "tp"` : il est **supprimé** (spec : toujours cumulatif). Les documents Mongo existants qui portent encore `scope` ne sont pas migrés — Zod ne valide que les écritures, le champ résiduel est ignoré à la lecture.

---

### Task 1 : Stabiliser le working tree (démolition de l'ancien skill)

Le working tree contient la suppression non commitée de l'ancien skill (`skills/pedagogie/`, `.claude/skills/pedagogy-*`, `scripts/generateSkillModule.js`, `docs/PEDAGOGY.md`) et les modifications associées (`src/app/api/mcp/route.ts`, `package.json`, `tests/mcp/skill-exposure.test.ts`, `MCP_CAPABILITY_GAPS.md`). Le test `tests/mcp/skill-exposure.test.ts` importe `src/lib/skills/pedagogie` qui n'existe plus : il est cassé.

**Files:**
- Delete: `tests/mcp/skill-exposure.test.ts` (réécrit en Task 8)
- Delete: `tests/fixtures/pedagogie/` (dossier entier, si présent)
- Delete: `tmp_rust1.py`, `tmp_rust1_cours.json`, `tmp_rust1_tp.json`, `tmp_rust_cours_final.json`, `tmp_rust_rewrite.py`, `tmp_rust_tp_final.json`, `onzeheure.md` (fichiers de travail temporaires à la racine — vérifier avec `git status` qu'ils sont bien untracked et jetables avant suppression)

- [ ] **Step 1 : Supprimer le test cassé et les fixtures**

```bash
rm tests/mcp/skill-exposure.test.ts
rm -rf tests/fixtures/pedagogie
```

- [ ] **Step 2 : Vérifier que la suite de tests passe**

Run: `bun test`
Expected: PASS (plus aucune référence à `src/lib/skills/pedagogie`)

- [ ] **Step 3 : Vérifier que le build passe**

Run: `bun run build`
Expected: succès (le route.ts modifié ne référence plus l'ancien skill)

- [ ] **Step 4 : Committer la démolition**

```bash
git add -A skills/ .claude/skills/ scripts/generateSkillModule.js docs/PEDAGOGY.md src/app/api/mcp/route.ts package.json tests/mcp/ tests/fixtures/ MCP_CAPABILITY_GAPS.md
git commit -m "chore: démolition de l'ancien skill pédagogique (remplacé par la spec 2026-07-14)"
```

Note : ne pas committer `docs/superpowers/plans/2026-07-01-mcp-search-export.md` ni les tmp_* dans ce commit ; supprimer les tmp_* séparément (untracked).

---

### Task 2 : Retirer `universe.scope` (schéma, admin, MCP)

**Files:**
- Modify: `src/lib/schemas/module.schema.ts:30-36`
- Modify: `src/lib/schemas/module.schema.test.ts`
- Modify: `src/components/admin/ModuleFormFields.tsx:116-180` (env.)
- Modify: `src/app/api/mcp/route.ts:216-217, 282-283` (descriptions `create_module` / `edit_module`)
- Test: `src/lib/schemas/module.schema.test.ts`

- [ ] **Step 1 : Adapter le test du schéma (RED)**

Dans `src/lib/schemas/module.schema.test.ts`, remplacer toute assertion référençant `scope` par :

```ts
it("universe valide sans scope", () => {
    const r = universeSchema.safeParse({ name: "Netflex", description: "catalogue de films : title, year, genre, rating" });
    expect(r.success).toBe(true);
});

it("universe rejette un scope résiduel (strip silencieux interdit ? non : Zod object non-strict l'ignore)", () => {
    const r = universeSchema.safeParse({ name: "Netflex", description: "catalogue", scope: "module" });
    expect(r.success).toBe(true); // champ inconnu ignoré à l'écriture, pas d'erreur
    if (r.success) expect("scope" in r.data).toBe(false);
});
```

Run: `bun test src/lib/schemas/module.schema.test.ts`
Expected: FAIL (le schéma actuel exige `scope`)

- [ ] **Step 2 : Retirer `scope` du schéma**

Dans `src/lib/schemas/module.schema.ts`, remplacer :

```ts
export const universeSchema = z.object({
    name: z.string().trim().min(1, "Le nom de l'univers est obligatoire"),
    description: z.string().trim().min(1, "La description de l'univers est obligatoire"),
});
```

- [ ] **Step 3 : Run test**

Run: `bun test src/lib/schemas/module.schema.test.ts`
Expected: PASS

- [ ] **Step 4 : Retirer le select scope du formulaire admin**

Dans `src/components/admin/ModuleFormFields.tsx` :
- ligne ~118 : le default à l'activation devient `{name: '', description: ''}` (retirer `scope: 'tp'`) ;
- supprimer le bloc `<Controller name="universe.scope" …>` (autour de la ligne 168) et son wrapper/label.

- [ ] **Step 5 : Mettre à jour les descriptions MCP**

Dans `src/app/api/mcp/route.ts`, les `.describe()` de `universe` sur `create_module` (l. ~216) et `edit_module` (l. ~282) deviennent :

```ts
universe: universeSchema.optional()
    .describe("Univers thématique du module (fil rouge cumulatif) : name (ex: Netflex), description (domaine + données types)"),
```

- [ ] **Step 6 : Vérifier build + tests, committer**

Run: `bun test && bun run build`
Expected: PASS

```bash
git add src/lib/schemas/module.schema.ts src/lib/schemas/module.schema.test.ts src/components/admin/ModuleFormFields.tsx src/app/api/mcp/route.ts
git commit -m "feat(module): universe sans scope — fil rouge toujours cumulatif"
```

---

### Task 3 : Champs Section — `courseIntroMinutes`, `brief`, `curriculum` (types + schémas)

**Files:**
- Modify: `src/lib/schemas/section.schema.ts`
- Modify: `src/types/Section.ts`
- Create: `src/lib/schemas/section.schema.test.ts`

- [ ] **Step 1 : Écrire les tests du schéma (RED)**

Create `src/lib/schemas/section.schema.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import { briefSchema, curriculumSchema, sectionApiSchema } from "./section.schema";

describe("briefSchema", () => {
    it("accepte un brief complet", () => {
        const r = briefSchema.safeParse({
            objectives: ["Manipuler le DOM"],
            notions: ["querySelector", "addEventListener"],
            filRougeStep: "Le catalogue affiche les films depuis un tableau JS",
            notes: "Insister sur la différence NodeList/Array",
        });
        expect(r.success).toBe(true);
    });

    it("applique les défauts sur un brief vide", () => {
        const r = briefSchema.safeParse({});
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.objectives).toEqual([]);
            expect(r.data.notions).toEqual([]);
            expect(r.data.filRougeStep).toBe("");
        }
    });
});

describe("curriculumSchema", () => {
    it("accepte notions + apis", () => {
        const r = curriculumSchema.safeParse({
            notions: ["sélection d'éléments", "événements click"],
            apis: ["document.querySelector", "element.addEventListener"],
        });
        expect(r.success).toBe(true);
    });
});

describe("sectionApiSchema — nouveaux champs", () => {
    const base = {
        title: "Le DOM", path: "1-le-dom", totalDuration: 2,
        hasCorrection: false, isAvailable: false, correctionIsAvailable: false,
        examenIsLock: false, order: 1, contents: ["cours", "TP"],
        objectives: [], tags: [],
    };

    it("accepte courseIntroMinutes, brief et curriculum", () => {
        const r = sectionApiSchema.safeParse({
            ...base,
            courseIntroMinutes: 30,
            brief: { objectives: ["a"], notions: ["b"], filRougeStep: "c" },
            curriculum: { notions: ["b"], apis: ["x"] },
        });
        expect(r.success).toBe(true);
    });

    it("les nouveaux champs sont optionnels (rétrocompatibilité)", () => {
        expect(sectionApiSchema.safeParse(base).success).toBe(true);
    });

    it("rejette courseIntroMinutes négatif", () => {
        expect(sectionApiSchema.safeParse({ ...base, courseIntroMinutes: -10 }).success).toBe(false);
    });
});
```

Run: `bun test src/lib/schemas/section.schema.test.ts`
Expected: FAIL (`briefSchema` n'existe pas)

- [ ] **Step 2 : Ajouter les schémas**

Dans `src/lib/schemas/section.schema.ts`, ajouter après `AVAILABLE_CONTENTS` :

```ts
export const briefSchema = z.object({
    objectives: z.array(z.string()).default([]),
    notions: z.array(z.string()).default([]),
    filRougeStep: z.string().default(""),
    notes: z.string().optional(),
});
export type SectionBrief = z.infer<typeof briefSchema>;

export const curriculumSchema = z.object({
    notions: z.array(z.string()).default([]),
    apis: z.array(z.string()).default([]),
});
export type SectionCurriculum = z.infer<typeof curriculumSchema>;
```

Dans `sectionFormSchema`, ajouter :

```ts
    courseIntroMinutes: z.number().int().min(0).optional(),
```

Dans `sectionApiSchema` (l'`extend` existant), ajouter :

```ts
    brief: briefSchema.optional(),
    curriculum: curriculumSchema.optional(),
```

- [ ] **Step 3 : Run tests**

Run: `bun test src/lib/schemas/section.schema.test.ts`
Expected: PASS

- [ ] **Step 4 : Étendre le type Section**

Dans `src/types/Section.ts` :

```ts
import {ObjectId} from "bson";
import { ContentRef } from "@/types/CourseContent";
import type { SectionBrief, SectionCurriculum } from "@/lib/schemas/section.schema";

export default interface Section {
    _id?: string | ObjectId;
    title: string;
    path: string;
    description?: string;
    objectives?: string[];
    contents: ContentRef[];
    tags: string[];
    // Statistiques de la section
    totalDuration: number;          // nombre de séances (= sessionCount de la spec)
    courseIntroMinutes?: number;    // temps cours/slides en ouverture de la 1re séance
    brief?: SectionBrief;           // le prévu — écrit par le skill module-design
    curriculum?: SectionCurriculum; // le réalisé — mis à jour par content-writer
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    examenIsLock?: boolean;
}
```

- [ ] **Step 5 : Vérifier compilation + committer**

Run: `bun test && bunx tsc --noEmit`
Expected: PASS

```bash
git add src/lib/schemas/section.schema.ts src/lib/schemas/section.schema.test.ts src/types/Section.ts
git commit -m "feat(section): champs courseIntroMinutes, brief (prévu) et curriculum (réalisé)"
```

---

### Task 4 : Exposer les champs Section via MCP

**Files:**
- Modify: `src/app/api/mcp/route.ts` (`create_section` l. ~324, `edit_section` l. ~419, `list_sections` l. ~538, interface `ModuleDoc` l. ~43)

- [ ] **Step 1 : Importer les schémas**

En tête de `src/app/api/mcp/route.ts`, compléter l'import existant :

```ts
import { sectionApiSchema, briefSchema, curriculumSchema } from "@/lib/schemas/section.schema";
import type { SectionBrief, SectionCurriculum } from "@/lib/schemas/section.schema";
```

- [ ] **Step 2 : Enrichir `ModuleDoc`**

```ts
    sections?: Array<{
        path: string;
        title?: string;
        totalDuration?: number;
        courseIntroMinutes?: number;
        brief?: SectionBrief;
        curriculum?: SectionCurriculum;
        contents?: Array<{ type: string; source?: string }>;
    }>;
```

- [ ] **Step 3 : `create_section` — nouveaux args**

Ajouter aux paramètres de l'outil :

```ts
            courseIntroMinutes: z.number().int().min(0).optional()
                .describe("Minutes de cours/slides en ouverture de la 1re séance (ex: 30). Le budget TP = totalDuration × sessionDurationMinutes − courseIntroMinutes."),
            brief: briefSchema.optional()
                .describe("Cahier des charges de la section : objectives (ce que l'étudiant saura faire), notions (à couvrir), filRougeStep (ce que le TP ajoute au projet fil rouge), notes libres."),
```

Dans le handler : les destructurer, les passer au `rawCheck` (`sectionApiSchema.safeParse({ ..., courseIntroMinutes, brief })`) et à l'objet `section` inséré :

```ts
                ...(courseIntroMinutes !== undefined && { courseIntroMinutes }),
                ...(brief !== undefined && { brief }),
```

- [ ] **Step 4 : `edit_section` — nouveaux args**

Ajouter aux paramètres :

```ts
            courseIntroMinutes: z.number().int().min(0).optional(),
            brief:              briefSchema.optional(),
            curriculum:         curriculumSchema.optional()
                .describe("Notions effectivement enseignées + APIs vues. Mis à jour par le skill content-writer après rédaction."),
```

Dans le tableau `meta` du handler, ajouter :

```ts
                ["courseIntroMinutes", args.courseIntroMinutes], ["brief", args.brief], ["curriculum", args.curriculum],
```

Mettre à jour la description de l'outil : `"Édite les métadonnées d'une section (rename, nb séances, courseIntroMinutes, brief, curriculum, ordre, objectifs, flags). …"`.

- [ ] **Step 5 : `list_sections` — exposer les champs**

Dans le mapping des sections :

```ts
            const sections = (mod.sections ?? []).map((s) => ({
                slug: s.path,
                title: s.title ?? s.path,
                totalDuration: s.totalDuration ?? 1,
                ...(s.courseIntroMinutes !== undefined && { courseIntroMinutes: s.courseIntroMinutes }),
                ...(s.brief !== undefined && { brief: s.brief }),
                ...(s.curriculum !== undefined && { curriculum: s.curriculum }),
                contents: Object.fromEntries((s.contents ?? []).map((c) => [c.type, c.source ?? "file"])),
            }));
```

- [ ] **Step 6 : Vérifier + committer**

Run: `bun test && bun run build`
Expected: PASS

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): create/edit/list_section exposent courseIntroMinutes, brief et curriculum"
```

---

### Task 5 : Calibrage — types, collections, outils verdicts

**Files:**
- Create: `src/types/Pedagogy.ts`
- Create: `src/lib/schemas/pedagogy.schema.ts`
- Create: `src/lib/schemas/pedagogy.schema.test.ts`
- Modify: `src/app/api/mcp/route.ts` (3 nouveaux outils, à insérer après `export_content_compact`, avant `return server;` l. ~945)

- [ ] **Step 1 : Tests des schémas (RED)**

Create `src/lib/schemas/pedagogy.schema.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import { addVerdictSchema, promoteExemplarSchema } from "./pedagogy.schema";

describe("addVerdictSchema", () => {
    it("accepte un verdict avec format contenu", () => {
        const r = addVerdictSchema.safeParse({ format: "TP", verdict: "Les exercices sont trop courts, 40 min pour 150 min de budget" });
        expect(r.success).toBe(true);
    });

    it("accepte le format module-design", () => {
        const r = addVerdictSchema.safeParse({ format: "module-design", verdict: "Trop de sections théoriques en début de module", moduleSlug: "rust" });
        expect(r.success).toBe(true);
    });

    it("rejette un verdict vide", () => {
        expect(addVerdictSchema.safeParse({ format: "cours", verdict: "  " }).success).toBe(false);
    });

    it("rejette un format inconnu", () => {
        expect(addVerdictSchema.safeParse({ format: "quiz", verdict: "x" }).success).toBe(false);
    });
});

describe("promoteExemplarSchema", () => {
    it("accepte une promotion complète", () => {
        const r = promoteExemplarSchema.safeParse({
            module: "javascript", section: "1-le-dom", type: "TP",
            level: "debutant", annotations: ["Les consignes donnent le fichier ET le résultat verbatim"],
        });
        expect(r.success).toBe(true);
    });

    it("rejette module-design comme format d'exemplaire", () => {
        const r = promoteExemplarSchema.safeParse({
            module: "javascript", section: "1-le-dom", type: "module-design",
            level: "debutant", annotations: [],
        });
        expect(r.success).toBe(false);
    });

    it("exige au moins une annotation", () => {
        const r = promoteExemplarSchema.safeParse({
            module: "javascript", section: "1-le-dom", type: "TP",
            level: "debutant", annotations: [],
        });
        expect(r.success).toBe(false);
    });
});
```

Run: `bun test src/lib/schemas/pedagogy.schema.test.ts`
Expected: FAIL (fichier absent)

- [ ] **Step 2 : Créer les schémas**

Create `src/lib/schemas/pedagogy.schema.ts` :

```ts
import {z} from "zod";

/** Formats de contenu + conception de module. Aligné sur CONTENT_TYPE MCP (cours | TP | examen | slide). */
export const VERDICT_FORMATS = ["cours", "TP", "examen", "slide", "module-design"] as const;
export const EXEMPLAR_FORMATS = ["cours", "TP", "examen", "slide"] as const;
export const EXEMPLAR_LEVELS = ["debutant", "intermediaire", "avance"] as const;

export const addVerdictSchema = z.object({
    format: z.enum(VERDICT_FORMATS),
    verdict: z.string().trim().min(1, "Le verdict ne peut pas être vide"),
    moduleSlug: z.string().optional(),
});
export type AddVerdictValues = z.infer<typeof addVerdictSchema>;

export const promoteExemplarSchema = z.object({
    module: z.string().min(1),
    section: z.string().min(1),
    type: z.enum(EXEMPLAR_FORMATS),
    level: z.enum(EXEMPLAR_LEVELS),
    annotations: z.array(z.string().trim().min(1)).min(1, "Au moins une annotation « pourquoi c'est bon »"),
});
export type PromoteExemplarValues = z.infer<typeof promoteExemplarSchema>;
```

- [ ] **Step 3 : Run tests**

Run: `bun test src/lib/schemas/pedagogy.schema.test.ts`
Expected: PASS

- [ ] **Step 4 : Créer les types**

Create `src/types/Pedagogy.ts` :

```ts
import {ObjectId} from "bson";
import type {Block} from "@/types/CourseContent";
import type {VERDICT_FORMATS, EXEMPLAR_FORMATS, EXEMPLAR_LEVELS} from "@/lib/schemas/pedagogy.schema";

export type PedagogyFormat = (typeof VERDICT_FORMATS)[number];
export type ExemplarFormat = (typeof EXEMPLAR_FORMATS)[number];
export type ExemplarLevel = (typeof EXEMPLAR_LEVELS)[number];

/** Collection `pedagogy_verdicts` — la mémoire vivante du calibrage. */
export interface PedagogyVerdict {
    _id?: string | ObjectId;
    date: Date;
    format: PedagogyFormat;
    moduleSlug?: string;
    verdict: string;                 // critique utilisateur, verbatim
    status: "active" | "distilled";  // distilled = promu en invariant/annotation, retiré des lectures
}

/** Collection `pedagogy_exemplars` — les étalons promus. */
export interface PedagogyExemplar {
    _id?: string | ObjectId;
    date: Date;
    format: ExemplarFormat;
    moduleSlug: string;
    sectionSlug: string;
    level: ExemplarLevel;
    snapshot: Block[];               // copie figée des blocs à la promotion
    annotations: string[];           // notes « pourquoi c'est bon », validées à la promotion
}
```

- [ ] **Step 5 : Outils MCP verdicts**

Dans `src/app/api/mcp/route.ts`, ajouter les imports :

```ts
import { addVerdictSchema, VERDICT_FORMATS } from "@/lib/schemas/pedagogy.schema";
import type { PedagogyVerdict, PedagogyExemplar } from "@/types/Pedagogy";
import { ObjectId } from "bson";
```

Puis, avant `return server;`, insérer :

```ts
    // ── add_verdict ───────────────────────────────────────────────────────────
    server.tool(
        "add_verdict",
        "Enregistre un verdict de calibrage (critique utilisateur verbatim sur un contenu généré). À appeler quand l'utilisateur exprime une déception sur une génération. Réservé aux admins.",
        {
            format: z.enum(VERDICT_FORMATS).describe("Format concerné : cours | TP | examen | slide | module-design"),
            verdict: z.string().min(1).describe("La critique, verbatim (citer l'utilisateur, ne pas reformuler)"),
            moduleSlug: z.string().optional().describe("Module d'où vient le verdict (contexte)"),
        },
        async (args) => {
            if (!isAdmin) throw new Error("Forbidden");
            const parsed = addVerdictSchema.safeParse(args);
            if (!parsed.success) throw new Error(`Verdict invalide : ${JSON.stringify(parsed.error.flatten())}`);

            const db = await connectToDB();
            const r = await db.collection<Omit<PedagogyVerdict, "_id">>("pedagogy_verdicts").insertOne({
                date: new Date(),
                format: parsed.data.format,
                ...(parsed.data.moduleSlug && { moduleSlug: parsed.data.moduleSlug }),
                verdict: parsed.data.verdict,
                status: "active",
            });
            return { content: [{ type: "text" as const, text: `Verdict enregistré. verdictId=${r.insertedId.toString()}` }] };
        }
    );

    // ── list_verdicts ─────────────────────────────────────────────────────────
    server.tool(
        "list_verdicts",
        "Retourne les verdicts de calibrage ACTIFS (critiques utilisateur passées). À lire OBLIGATOIREMENT avant toute rédaction de contenu ou conception de module.",
        {
            format: z.enum(VERDICT_FORMATS).optional().describe("Filtrer par format. Omis = tous"),
        },
        async ({ format }) => {
            const db = await connectToDB();
            const filter: Record<string, unknown> = { status: "active" };
            if (format) filter.format = format;
            const verdicts = await db.collection<PedagogyVerdict>("pedagogy_verdicts")
                .find(filter).sort({ date: 1 }).toArray();
            const result = verdicts.map((v) => ({
                id: v._id!.toString(),
                date: v.date instanceof Date ? v.date.toISOString().slice(0, 10) : v.date,
                format: v.format,
                ...(v.moduleSlug && { moduleSlug: v.moduleSlug }),
                verdict: v.verdict,
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ── distill_verdicts ──────────────────────────────────────────────────────
    server.tool(
        "distill_verdicts",
        "Marque des verdicts comme distillés (promus en annotation d'exemplaire ou invariant du skill). Ils disparaissent de list_verdicts. À appeler après validation utilisateur de la distillation. Réservé aux admins.",
        {
            verdictIds: z.array(z.string().min(1)).min(1).describe("IDs des verdicts à distiller"),
        },
        async ({ verdictIds }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const ids = verdictIds.map((id) => {
                if (!ObjectId.isValid(id)) throw new Error(`ID invalide : ${id}`);
                return new ObjectId(id);
            });
            const r = await db.collection<PedagogyVerdict>("pedagogy_verdicts").updateMany(
                { _id: { $in: ids }, status: "active" },
                { $set: { status: "distilled" } }
            );
            return { content: [{ type: "text" as const, text: `${r.modifiedCount} verdict(s) distillé(s).` }] };
        }
    );
```

Note : `ObjectId` est importé depuis `bson` (déjà en dépendance, cohérent avec `src/types/Module.ts`).

- [ ] **Step 6 : Vérifier + committer**

Run: `bun test && bun run build`
Expected: PASS

```bash
git add src/types/Pedagogy.ts src/lib/schemas/pedagogy.schema.ts src/lib/schemas/pedagogy.schema.test.ts src/app/api/mcp/route.ts
git commit -m "feat(mcp): calibrage vivant — add_verdict, list_verdicts, distill_verdicts"
```

---

### Task 6 : Outils exemplaires — `promote_exemplar`, `list_exemplars`

**Files:**
- Modify: `src/app/api/mcp/route.ts` (2 outils, après `distill_verdicts`)

- [ ] **Step 1 : Ajouter les outils**

Compléter l'import : `import { addVerdictSchema, promoteExemplarSchema, VERDICT_FORMATS, EXEMPLAR_FORMATS, EXEMPLAR_LEVELS } from "@/lib/schemas/pedagogy.schema";`

```ts
    // ── promote_exemplar ──────────────────────────────────────────────────────
    server.tool(
        "promote_exemplar",
        "Promeut un contenu validé en exemplaire de référence : copie FIGÉE des blocs + annotations « pourquoi c'est bon ». À appeler uniquement après un « c'est exactement ça » de l'utilisateur, annotations validées par lui. Réservé aux admins.",
        {
            module: z.string().describe("Slug du module"),
            section: z.string().describe("Slug de la section"),
            type: z.enum(EXEMPLAR_FORMATS).describe("Type de contenu : cours | TP | examen | slide"),
            level: z.enum(EXEMPLAR_LEVELS).describe("Niveau des étudiants visés : debutant | intermediaire | avance"),
            annotations: z.array(z.string()).min(1).describe("Notes « pourquoi c'est bon », validées par l'utilisateur"),
        },
        async (args) => {
            if (!isAdmin) throw new Error("Forbidden");
            const parsed = promoteExemplarSchema.safeParse(args);
            if (!parsed.success) throw new Error(`Promotion invalide : ${JSON.stringify(parsed.error.flatten())}`);
            const { module, section, type, level, annotations } = parsed.data;

            const blocks = await loadBlocks({ moduleSlug: module, sectionSlug: section, contentType: type });
            if (blocks.length === 0) {
                throw new Error(`Aucun bloc en DB pour ${module}/${section}/${type} — rien à promouvoir.`);
            }

            const db = await connectToDB();
            const r = await db.collection<Omit<PedagogyExemplar, "_id">>("pedagogy_exemplars").insertOne({
                date: new Date(),
                format: type,
                moduleSlug: module,
                sectionSlug: section,
                level,
                snapshot: blocks,
                annotations,
            });
            return { content: [{ type: "text" as const, text: `Exemplaire promu (snapshot figé de ${blocks.length} blocs racine). exemplarId=${r.insertedId.toString()}` }] };
        }
    );

    // ── list_exemplars ────────────────────────────────────────────────────────
    server.tool(
        "list_exemplars",
        "Retourne les exemplaires de référence (étalons annotés). withSnapshot=false (défaut) liste les métadonnées + annotations ; withSnapshot=true inclut les blocs figés de l'exemplaire le plus pertinent. À lire avant toute rédaction : imiter l'exemplaire le plus proche (même format, niveau voisin).",
        {
            format: z.enum(EXEMPLAR_FORMATS).optional().describe("Filtrer par type de contenu"),
            level: z.enum(EXEMPLAR_LEVELS).optional().describe("Filtrer par niveau"),
            withSnapshot: z.boolean().optional().describe("Inclure les blocs figés (coûteux en tokens — ne l'activer que sur l'exemplaire choisi)"),
        },
        async ({ format, level, withSnapshot }) => {
            const db = await connectToDB();
            const filter: Record<string, unknown> = {};
            if (format) filter.format = format;
            if (level) filter.level = level;
            const exemplars = await db.collection<PedagogyExemplar>("pedagogy_exemplars")
                .find(filter, withSnapshot ? {} : { projection: { snapshot: 0 } })
                .sort({ date: -1 }).toArray();
            const result = exemplars.map((e) => ({
                id: e._id!.toString(),
                date: e.date instanceof Date ? e.date.toISOString().slice(0, 10) : e.date,
                format: e.format,
                moduleSlug: e.moduleSlug,
                sectionSlug: e.sectionSlug,
                level: e.level,
                annotations: e.annotations,
                ...(withSnapshot && { snapshot: e.snapshot }),
            }));
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
    );
```

- [ ] **Step 2 : Vérifier + committer**

Run: `bun test && bun run build`
Expected: PASS

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): exemplaires — promote_exemplar (snapshot figé) et list_exemplars"
```

---

### Task 7 : Documents skill Markdown (sources canoniques)

**Files:**
- Create: `skills/module-design/main.md`
- Create: `skills/content-writer/main.md`

- [ ] **Step 1 : Créer `skills/module-design/main.md`**

Contenu complet :

````markdown
# Skill module-design — Concevoir un module pédagogique

À utiliser pour créer un nouveau module : brainstorm des sections, définition de
l'univers fil rouge, découpage en séances. Le livrable est un plan validé par
l'utilisateur PUIS le module créé en base (staging uniquement).

## Philosophie

- **L'apprentissage se joue dans le TP.** Le cours et les slides amorcent la première
  séance (`courseIntroMinutes`) ; tout le reste du temps est du TP. Concevez les
  sections autour de ce que l'étudiant FERA, pas de ce qu'il écoutera.
- **Public réel** : étudiants de BUT Informatique, niveaux hétérogènes. Une section
  se juge à ceci : l'étudiant fragile démarre, le rapide ne s'ennuie pas.
- **Un univers par module, fil rouge cumulatif** : le projet grossit de section en
  section. Chaque section déclare ce que le projet gagne à cette étape.
- **Modèle temporel** : durée de séance uniforme par module (`sessionDurationMinutes`).
  Le cours/slides n'ouvre QUE la première séance d'une section ; les séances
  suivantes sont 100 % TP.

## Workflow (6 étapes, dans l'ordre)

### 1. Cadrage
Collectez : matière/thème, niveau des étudiants (BUT 1/2/3, débutants ou non),
nombre total de séances, durée d'une séance. Par arguments ou questions.

### 2. Contexte — jamais de conception « de tête »
- `list_modules` : modules existants (éviter les doublons, situer le niveau).
- `list_sections` sur les modules prérequis : leurs `curriculum` disent ce que les
  étudiants savent VRAIMENT (pas ce qui était prévu).
- `list_verdicts` avec `format: "module-design"` : les critiques passées de
  l'utilisateur sur des conceptions. Les relire AVANT de proposer quoi que ce soit.

Si le serveur MCP est indisponible : ARRÊT immédiat avec message clair.

### 3. Découpage en sections
Brainstorm de la progression des notions avec l'utilisateur : liste des sections,
`totalDuration` (nombre de séances) et `courseIntroMinutes` par section, objectifs
et notions de chacune. Vérifiez : la somme des séances = le budget du module.
Le `brief` de chaque section est rempli SAUF `filRougeStep`.

### 4. Univers + plan d'avancement
Proposez 2-3 univers candidats (domaine + données types). Chacun est présenté avec
son plan d'avancement section par section : « section 1 : le projet affiche X ;
section 2 : on ajoute Y ; … fin de module : l'application fait Z ». L'utilisateur
choisit ; remplissez alors le `filRougeStep` de chaque brief.

### 5. Plan écrit
Restituez le plan complet dans la conversation : module (univers, durée de séance)
+ chaque section avec son brief complet. L'utilisateur valide, ou vous retournez
aux étapes 3/4.

### 6. Création en base — staging uniquement, après le « go » explicite
- `create_module` avec `universe` et `sessionDurationMinutes`.
- `create_section` pour chaque section avec `totalDuration`, `courseIntroMinutes`,
  `brief`, `objectives`, et les `contentTypes` (cours, TP, slide au minimum ;
  examen sur la dernière section du module).
- Restituez les slugs créés.
- JAMAIS d'écriture sur le serveur de production. Le passage en prod est une copie
  séparée, sur confirmation explicite de l'utilisateur.

## Clôture
Si l'utilisateur critique la conception (structure bancale, univers plat, mauvais
découpage), enregistrez sa critique VERBATIM via `add_verdict`
(`format: "module-design"`) avant de terminer.
````

- [ ] **Step 2 : Créer `skills/content-writer/main.md`**

Contenu complet :

````markdown
# Skill content-writer — Rédiger cours, TP, slides, examen

À utiliser pour rédiger les supports d'une section existante (créée par
module-design ou à la main). Écrit sur staging uniquement ; la prod est une copie
séparée sur confirmation.

## Philosophie

- **L'apprentissage se joue dans le TP.** Le cours donne le minimum pour démarrer
  le TP — pas l'exhaustivité. Les slides portent l'oral d'ouverture.
- **Public réel** : BUT Informatique, niveaux hétérogènes. L'étudiant fragile doit
  démarrer chaque exercice en moins de 2 minutes sans lever la main ; le rapide
  trouve des exercices bonus en fin de TP (hors budget temps).
- **Code réaliste uniquement** : jamais de foo/bar/toto. Toutes les données et tous
  les exemples puisent dans l'`universe` du module.
- **Progression dans chaque TP** : exercices guidés « classiques » pour installer le
  geste, puis remise en pratique dans le fil rouge où le guidage s'allège.
- **Voix d'enseignant** : ton direct, vouvoiement. Impératif vouvoyé STRICT dans les
  consignes de TP (« Créez », « Ouvrez », « Modifiez » — jamais d'infinitif, jamais
  de futur). Interdits : phrases creuses (« il est important de noter que »),
  conclusions plaquées, enthousiasme artificiel, listes sèches sans lien logique.
- **Structure** : imbriquez les blocs (`section` et sous-parties) sans écrire de
  numérotation — elle est générée automatiquement par le rendu.

## Invariants non négociables

- **TP — contrat de consigne** : chaque exercice indique fichier(s) cible(s), noms
  exacts à créer, données d'entrée, méthode/API imposée (pour empêcher le
  contournement de la notion visée), résultat observable (sortie verbatim ou
  description précise du rendu), critère de validation.
- **TP — budget temps** : somme des durées estimées entre 80 et 100 % du budget.
  Hors plage = BLOQUANT : redimensionnez avant de rédiger.
- **Cours** : chaque notion = un exemple univers minimal → une variante réaliste →
  une erreur fréquente commentée (anticiper le blocage plutôt que le subir).
- **Slides** : support de l'oral, pas un cours dupliqué — une idée par slide, le
  détail reste dans le cours écrit.
- **Examen** : contrat de consigne intégral, HORS fil rouge, notions issues des
  `curriculum` uniquement (jamais une notion non enseignée).

## Grammaire des blocs

| Intention pédagogique | Bloc |
|---|---|
| Commande à exécuter dans le terminal | `code` avec `language: "bash"` (jamais dans un bloc texte) |
| Fichier à créer/modifier par l'étudiant | `code` avec `filename` renseigné (le nom exact du contrat de consigne) |
| Résultat visuel attendu (HTML/CSS) | `code-with-preview` |
| Fichier de départ, assets, données fournies | `download-file` (jamais « recopiez ce long code ») |
| Piège / erreur fréquente | `callout` variant `warning` |
| Astuce, bonne pratique | `callout` variant `tip` |
| Rappel d'une notion d'une section précédente | `callout` variant `reminder` |
| Indice ou solution masquée | `collapsible` |
| Partie fil rouge d'un TP | `section` avec `projectRef: true` |
| Renvoi vers le cours depuis le TP | `section-card` |
| Schéma de concept (flux, arborescence, cycle) | `diagram` (Mermaid) |
| Comparaison / récapitulatif d'API | `table` |
| Mise en valeur de lignes clés | `code` avec `highlightLines` |
| Notes enseignant sur une slide | `slide-note` (jamais visible étudiant) |

Appelez `list_block_types` avant toute écriture : la grammaire guide le choix,
l'outil fait foi pour les props exactes. Un type inexistant n'est JAMAIS inventé —
si une intention n'a pas de bloc adapté, signalez-le au lieu de bricoler.

## Workflow (7 étapes)

### 1. Cadrage
Module + section cibles, supports demandés (cours, slides, TP — un seul, plusieurs
ou tous). Si plusieurs : ordre cours → slides → TP, chacun validé avant le suivant.

### 2. Contexte MCP — jamais de génération « de tête »
- `list_modules` : `universe`, `sessionDurationMinutes` du module.
- `list_sections` : `brief` (le cahier des charges), `totalDuration`,
  `courseIntroMinutes` de la section cible ; `curriculum` des sections précédentes
  (les acquis réels).
- `export_content_compact` sur les TP des sections précédentes : l'état réel du
  projet fil rouge.
- `list_block_types`.

Budgets : cours + slides = `courseIntroMinutes` ;
TP = `totalDuration × sessionDurationMinutes − courseIntroMinutes`.

Section sans `brief` → proposez de le co-construire maintenant (mini-conception),
ne rédigez JAMAIS à l'aveugle. Serveur MCP indisponible → ARRÊT immédiat.

### 3. Imprégnation
- `list_verdicts` filtré sur le format à rédiger : relisez chaque critique.
- `list_exemplars` filtré sur le format : choisissez l'exemplaire le plus proche
  (niveau voisin), chargez-le avec `withSnapshot: true`, lisez ses annotations.
  Imitez sa voix, son niveau de détail, son réalisme — pas son sujet.

### 4. Squelette, validé en chat
- TP : liste d'exercices avec durée estimée chacun, part « classique » vs part
  « fil rouge », somme dans 80–100 % du budget. Hors plage = redimensionnez.
- Cours/slides : plan des notions avec minutage.
L'utilisateur valide ou amende AVANT toute rédaction.

### 5. Rédaction sur staging
Écrivez les blocs via `save_content` (première écriture) puis `insert_block` /
`edit_block` / `delete_block` / `reorder_blocks`. Staging uniquement.

### 6. Relecture navigateur
L'utilisateur relit le rendu réel. Corrigez via les outils de blocs jusqu'à son OK.

### 7. Clôture
- Mettez à jour le `curriculum` de la section via `edit_section` (notions
  effectivement enseignées + APIs vues — uniquement ce qui est dans les blocs).
- Signalez tout écart au `brief` et proposez la mise à jour des briefs suivants.
- Verdict utilisateur négatif → `add_verdict` (verbatim).
- « C'est exactement ça » → proposez `promote_exemplar` (annotations validées par
  l'utilisateur).
- Proposez la copie vers prod : relisez via `get_content` (staging) et rejouez via
  `save_content` (prod), avec confirmation explicite AVANT chaque écriture prod.
  `get_content` renvoie l'arbre de blocs JSON — jamais `export_content_compact`
  (Markdown, lecture seule) pour une copie.

## Cas particulier — l'examen

Structurellement un TP indépendant : mêmes règles de consigne, mais HORS fil rouge —
sujet autonome avec son propre contexte, remobilisant les notions des `curriculum`
du module. Aucune dépendance au projet fil rouge. Généré en fin de module, en
autonomie (pas de validation de squelette) ; durée cible = une séance. Si des
`curriculum` sont vides, signalez les sections non rédigées et arrêtez-vous.

## Hygiène du calibrage

Quand un motif revient dans 3 verdicts ou plus (`list_verdicts`), proposez à
l'utilisateur de le distiller : en annotation d'exemplaire ou en invariant de ce
document. Après validation, appelez `distill_verdicts` sur les verdicts concernés.
Le calibrage reste court par construction.
````

- [ ] **Step 3 : Committer les sources**

```bash
git add skills/module-design/main.md skills/content-writer/main.md
git commit -m "feat(skills): sources canoniques module-design et content-writer"
```

---

### Task 8 : Génération + exposition MCP des skills

**Files:**
- Create: `scripts/generate-skill.ts`
- Create: `src/lib/skills/pedagogy.ts` (généré — jamais édité à la main)
- Modify: `package.json` (script `generate-skill`)
- Modify: `src/app/api/mcp/route.ts` (2 outils + `SERVER_INSTRUCTIONS`)
- Create: `tests/mcp/skill-exposure.test.ts`

- [ ] **Step 1 : Écrire le test (RED)**

Create `tests/mcp/skill-exposure.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { SKILL_MANIFEST, SKILL_DOCUMENTS } from "../../src/lib/skills/pedagogy";

describe("Skills pédagogiques — manifeste", () => {
    it("expose les deux skills avec les champs obligatoires", () => {
        expect(SKILL_MANIFEST.id).toBe("pedagogy");
        expect(typeof SKILL_MANIFEST.version).toBe("string");
        expect(typeof SKILL_MANIFEST.content_hash).toBe("string");
        const ids = SKILL_MANIFEST.documents.map((d) => d.id);
        expect(ids).toContain("module-design");
        expect(ids).toContain("content-writer");
        expect(ids.length).toBe(2);
    });

    it("chaque document a un uri et un path sûrs", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            expect(doc.uri).toMatch(/^skill:\/\/pedagogy\//);
            expect(doc.path).not.toContain("..");
        }
    });
});

describe("Skills pédagogiques — documents", () => {
    it("les documents générés correspondent aux sources canoniques", () => {
        const skillRoot = path.join(process.cwd(), "skills");
        for (const doc of SKILL_MANIFEST.documents) {
            const loaded = SKILL_DOCUMENTS[doc.id];
            expect(loaded).toBeDefined();
            const source = fs.readFileSync(path.resolve(skillRoot, doc.path), "utf-8").replace(/\r\n/g, "\n");
            expect(loaded.content).toBe(source);
        }
    });

    it("aucun document orphelin : SKILL_DOCUMENTS = manifeste", () => {
        expect(Object.keys(SKILL_DOCUMENTS).sort()).toEqual(
            SKILL_MANIFEST.documents.map((d) => d.id).sort()
        );
    });

    it("les hashes sont cohérents avec le contenu", () => {
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            const computed = crypto.createHash("sha256").update(doc.content).digest("hex").slice(0, 12);
            expect(doc.contentHash).toBe(computed);
        }
    });

    it("module-design contient le workflow et les invariants clés", () => {
        const md = SKILL_DOCUMENTS["module-design"].content;
        for (const kw of ["list_verdicts", "module-design", "filRougeStep", "brief",
            "create_module", "create_section", "staging", "add_verdict", "courseIntroMinutes"]) {
            expect(md).toContain(kw);
        }
    });

    it("content-writer contient le workflow, la grammaire et les invariants", () => {
        const cw = SKILL_DOCUMENTS["content-writer"].content;
        for (const kw of ["list_verdicts", "list_exemplars", "list_block_types",
            "80", "100 %", "contrat de consigne", "fil rouge", "curriculum",
            "promote_exemplar", "distill_verdicts", "get_content", "save_content",
            "code-with-preview", "download-file", "collapsible", "projectRef",
            "slide-note", "Créez", "vouvoyé"]) {
            expect(cw).toContain(kw);
        }
    });

    it("l'examen est décrit comme TP indépendant hors fil rouge", () => {
        const cw = SKILL_DOCUMENTS["content-writer"].content;
        expect(cw).toContain("TP indépendant");
        expect(cw).toContain("HORS fil rouge");
    });

    it("aucun document ne contient de secret ni de chemin absolu", () => {
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            for (const p of [/MONGODB_URI/, /SCALEKIT_/, /BETTER_AUTH_SECRET/, /MCP_ADMIN_EMAILS/, /C:\\Users\\/, /\/home\//]) {
                expect(doc.content).not.toMatch(p);
            }
        }
    });
});
```

Run: `bun test tests/mcp/skill-exposure.test.ts`
Expected: FAIL (`src/lib/skills/pedagogy` absent)

- [ ] **Step 2 : Écrire le générateur**

Create `scripts/generate-skill.ts` :

```ts
/**
 * Compile les sources Markdown de skills/ en module TypeScript
 * src/lib/skills/pedagogy.ts, servi par les outils MCP
 * get_pedagogical_skill_manifest / get_pedagogical_skill_document.
 *
 * Usage : bun run generate-skill
 * Ne JAMAIS éditer src/lib/skills/pedagogy.ts à la main.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT_FILE = path.join(ROOT, "src", "lib", "skills", "pedagogy.ts");
const VERSION = "2.0.0";

interface DocEntry {
    id: string;
    path: string;   // relatif à skills/
    content: string;
}

const docs: DocEntry[] = [
    { id: "module-design", path: "module-design/main.md", content: "" },
    { id: "content-writer", path: "content-writer/main.md", content: "" },
];

for (const doc of docs) {
    const abs = path.join(SKILLS_DIR, doc.path);
    if (!fs.existsSync(abs)) {
        console.error(`Source manquante : ${abs}`);
        process.exit(1);
    }
    doc.content = fs.readFileSync(abs, "utf-8").replace(/\r\n/g, "\n");
}

const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);
const contentHash = hash(docs.map((d) => d.content).join("\n"));

const manifest = {
    id: "pedagogy",
    version: VERSION,
    content_hash: contentHash,
    documents: docs.map((d) => ({
        id: d.id,
        uri: `skill://pedagogy/${d.id}`,
        path: d.path,
        mimeType: "text/markdown",
    })),
};

const documentsRecord = Object.fromEntries(
    docs.map((d) => [d.id, {
        id: d.id,
        path: d.path,
        content: d.content,
        contentHash: hash(d.content),
        mimeType: "text/markdown",
    }])
);

const out = `// GÉNÉRÉ par scripts/generate-skill.ts — NE PAS ÉDITER À LA MAIN.
// Sources canoniques : skills/module-design/main.md, skills/content-writer/main.md
// Régénérer : bun run generate-skill

export interface SkillDocument {
    id: string;
    path: string;
    content: string;
    contentHash: string;
    mimeType: string;
}

export interface SkillManifest {
    id: string;
    version: string;
    content_hash: string;
    documents: Array<{ id: string; uri: string; path: string; mimeType: string }>;
}

export const SKILL_MANIFEST: SkillManifest = ${JSON.stringify(manifest, null, 4)};

export const SKILL_DOCUMENTS: Record<string, SkillDocument> = ${JSON.stringify(documentsRecord, null, 4)};
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, out, "utf-8");
console.log(`Généré : ${path.relative(ROOT, OUT_FILE)} (hash ${contentHash})`);
```

- [ ] **Step 3 : Ajouter le script npm et générer**

Dans `package.json`, ajouter aux `scripts` :

```json
    "generate-skill": "bun scripts/generate-skill.ts",
```

Run: `bun run generate-skill`
Expected: `Généré : src/lib/skills/pedagogy.ts (hash …)`

- [ ] **Step 4 : Run test**

Run: `bun test tests/mcp/skill-exposure.test.ts`
Expected: PASS

- [ ] **Step 5 : Outils MCP + instructions serveur**

Dans `src/app/api/mcp/route.ts` :

Import : `import { SKILL_MANIFEST, SKILL_DOCUMENTS } from "@/lib/skills/pedagogy";`

Remplacer `SERVER_INSTRUCTIONS` :

```ts
const SERVER_INSTRUCTIONS = `Ce serveur gère le référentiel pédagogique multi-supports du BUT Informatique.

Deux skills pédagogiques sont disponibles :
- "module-design" : concevoir un module (sections, univers fil rouge, découpage en séances).
- "content-writer" : rédiger les supports d'une section (cours, slides, TP, examen).

Chargement : get_pedagogical_skill_manifest() puis get_pedagogical_skill_document(id)
avec id = "module-design" ou "content-writer" selon la tâche.

Avant toute production, le workflow du skill impose de lire list_verdicts (critiques
utilisateur passées) et list_exemplars (étalons annotés). Les outils d'écriture ne
visent QUE le serveur staging ; la copie vers la production exige une confirmation
explicite de l'utilisateur.`;
```

Ajouter les deux outils (avant `return server;`) :

```ts
    // ── get_pedagogical_skill_manifest ────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_manifest",
        "Retourne le manifeste des skills pédagogiques (module-design, content-writer) : version, hash, liste des documents.",
        {},
        async () => ({
            content: [{ type: "text" as const, text: JSON.stringify(SKILL_MANIFEST, null, 2) }],
        })
    );

    // ── get_pedagogical_skill_document ────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_document",
        "Retourne un document de skill pédagogique. id = module-design (conception de module) | content-writer (rédaction cours/TP/slides/examen).",
        {
            id: z.string().describe("ID du document : module-design | content-writer"),
        },
        async ({ id }) => {
            const doc = SKILL_DOCUMENTS[id];
            if (!doc) {
                const available = Object.keys(SKILL_DOCUMENTS).join(", ");
                throw new Error(`Document "${id}" inconnu. Disponibles : ${available}`);
            }
            return { content: [{ type: "text" as const, text: doc.content }] };
        }
    );
```

- [ ] **Step 6 : Vérifier + committer**

Run: `bun test && bun run build`
Expected: PASS

```bash
git add scripts/generate-skill.ts src/lib/skills/pedagogy.ts package.json src/app/api/mcp/route.ts tests/mcp/skill-exposure.test.ts
git commit -m "feat(mcp): expose les skills module-design et content-writer via le manifeste"
```

---

### Task 9 : Admin — SectionForm (courseIntroMinutes, brief, curriculum)

**Files:**
- Modify: `src/lib/schemas/section.schema.ts` (variante formulaire des nouveaux champs)
- Modify: `src/components/admin/SectionForm.tsx`
- Modify: `src/app/api/admin/[moduleId]/sections/route.ts` et `src/app/api/admin/[moduleId]/sections/[order]/route.ts` (si validation explicite des champs — vérifier qu'ils utilisent `sectionApiSchema`, déjà étendu en Task 3)

Le formulaire édite les champs structurés en textareas « une entrée par ligne » (même pattern que `objectives` existant).

- [ ] **Step 1 : Variante formulaire dans le schéma**

Dans `src/lib/schemas/section.schema.ts`, ajouter à `sectionFormSchema` (les champs texte bruts, transformés à la soumission comme `objectives`/`tags`) :

```ts
    briefObjectives: z.string().optional(),   // une entrée par ligne
    briefNotions: z.string().optional(),      // une entrée par ligne
    briefFilRougeStep: z.string().optional(),
    briefNotes: z.string().optional(),
    curriculumNotions: z.string().optional(), // une entrée par ligne
    curriculumApis: z.string().optional(),    // une entrée par ligne
```

(`sectionApiSchema` garde `brief`/`curriculum` structurés — la transformation se fait dans le composant, comme pour `objectives`.)

- [ ] **Step 2 : Étendre le type `Section` local et les defaults du formulaire**

Dans `src/components/admin/SectionForm.tsx` :

- Ajouter au type `Section` exporté (l. 26-39) :

```ts
    courseIntroMinutes?: number;
    brief?: { objectives: string[]; notions: string[]; filRougeStep: string; notes?: string };
    curriculum?: { notions: string[]; apis: string[] };
```

- Dans `getDefaultValues()`, mode édition :

```ts
                courseIntroMinutes: section!.courseIntroMinutes,
                briefObjectives: (section!.brief?.objectives ?? []).join('\n'),
                briefNotions: (section!.brief?.notions ?? []).join('\n'),
                briefFilRougeStep: section!.brief?.filRougeStep ?? '',
                briefNotes: section!.brief?.notes ?? '',
                curriculumNotions: (section!.curriculum?.notions ?? []).join('\n'),
                curriculumApis: (section!.curriculum?.apis ?? []).join('\n'),
```

- Mode création : `courseIntroMinutes: undefined` et chaînes vides pour les six champs texte.

- [ ] **Step 3 : Transformation à la soumission**

Dans `handleFormSubmit`, construire `brief`/`curriculum` avant `onSubmit` :

```ts
        const splitLines = (s?: string) =>
            (s ?? '').split('\n').map((x) => x.trim()).filter((x) => x.length > 0);

        const brief = {
            objectives: splitLines(data.briefObjectives),
            notions: splitLines(data.briefNotions),
            filRougeStep: (data.briefFilRougeStep ?? '').trim(),
            ...(data.briefNotes?.trim() && { notes: data.briefNotes.trim() }),
        };
        const curriculum = {
            notions: splitLines(data.curriculumNotions),
            apis: splitLines(data.curriculumApis),
        };
        const hasBrief = brief.objectives.length > 0 || brief.notions.length > 0 || brief.filRougeStep.length > 0;
        const hasCurriculum = curriculum.notions.length > 0 || curriculum.apis.length > 0;

        onSubmit({
            ...data,
            objectives: cleanedObjectives,
            tags: cleanedTags,
            ...(hasBrief && { brief }),
            ...(hasCurriculum && { curriculum }),
        });
```

(Retirer les champs `brief*`/`curriculum*` bruts de l'objet transmis si l'API les rejette — `sectionApiSchema` n'étant pas `.strict()`, ils sont ignorés.)

- [ ] **Step 4 : Champs UI**

Dans la section « Paramètres » du formulaire, à côté de « Séances * », ajouter :

```tsx
                                <div className="w-36">
                                    <Label htmlFor="sf-intro" className={labelCn}>Cours 1re séance (min)</Label>
                                    <Input
                                        id="sf-intro"
                                        type="number"
                                        min={0}
                                        className={inputCn}
                                        {...register('courseIntroMinutes', {
                                            setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                                        })}
                                    />
                                </div>
```

Après la section « Pédagogie », ajouter deux nouvelles sections (mêmes séparateurs et style que l'existant) :

```tsx
                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Brief — le prévu */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Brief (le prévu)</Eyebrow>
                            <div>
                                <Label htmlFor="sf-brief-objectives" className={labelCn}>Objectifs du brief</Label>
                                <Textarea id="sf-brief-objectives" rows={3} className={inputCn} {...register('briefObjectives')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Un par ligne</span>
                            </div>
                            <div>
                                <Label htmlFor="sf-brief-notions" className={labelCn}>Notions à couvrir</Label>
                                <Textarea id="sf-brief-notions" rows={3} className={inputCn} {...register('briefNotions')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                            </div>
                            <div>
                                <Label htmlFor="sf-brief-filrouge" className={labelCn}>Étape fil rouge</Label>
                                <Input id="sf-brief-filrouge" className={inputCn} {...register('briefFilRougeStep')}/>
                            </div>
                            <div>
                                <Label htmlFor="sf-brief-notes" className={labelCn}>Notes</Label>
                                <Textarea id="sf-brief-notes" rows={2} className={inputCn} {...register('briefNotes')}/>
                            </div>
                        </section>

                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                        {/* Curriculum — le réalisé */}
                        <section className="flex flex-col gap-3">
                            <Eyebrow>Curriculum (le réalisé)</Eyebrow>
                            <div>
                                <Label htmlFor="sf-curriculum-notions" className={labelCn}>Notions enseignées</Label>
                                <Textarea id="sf-curriculum-notions" rows={3} className={inputCn} {...register('curriculumNotions')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                            </div>
                            <div>
                                <Label htmlFor="sf-curriculum-apis" className={labelCn}>APIs / fonctions vues</Label>
                                <Textarea id="sf-curriculum-apis" rows={3} className={inputCn} {...register('curriculumApis')}/>
                                <span className="text-xs text-bridge-500 dark:text-bridge-400 mt-1 block">Une par ligne</span>
                            </div>
                        </section>
```

- [ ] **Step 5 : Vérifier la persistance côté API admin**

Lire `src/app/api/admin/[moduleId]/sections/route.ts` et `[order]/route.ts` : s'ils valident avec `sectionApiSchema` (déjà étendu en Task 3) et propagent l'objet entier vers Mongo, rien à changer. S'ils listent les champs un à un, ajouter `courseIntroMinutes`, `brief`, `curriculum` à la propagation.

- [ ] **Step 6 : Vérifier + committer**

Run: `bun test && bun run build`
Expected: PASS

Vérification manuelle : `bun dev`, ouvrir l'admin d'un module, éditer une section — les champs Brief/Curriculum/Cours 1re séance apparaissent, se sauvegardent et se rechargent.

```bash
git add src/lib/schemas/section.schema.ts src/components/admin/SectionForm.tsx src/app/api/admin/
git commit -m "feat(admin): édition de courseIntroMinutes, brief et curriculum sur les sections"
```

---

### Task 10 : Admin — page calibrage (verdicts + exemplaires)

**Files:**
- Create: `src/app/api/admin/calibrage/verdicts/route.ts`
- Create: `src/app/api/admin/calibrage/exemplars/route.ts`
- Create: `src/app/admin/calibrage/page.tsx`
- Create: `src/components/admin/CalibrageList.tsx`

La protection `/admin/*` est déjà assurée par `src/proxy.ts` (rôle admin requis).

- [ ] **Step 1 : API verdicts**

Create `src/app/api/admin/calibrage/verdicts/route.ts` :

```ts
import { NextResponse } from "next/server";
import { ObjectId } from "bson";
import { connectToDB } from "@/lib/mongodb";
import type { PedagogyVerdict } from "@/types/Pedagogy";

export async function GET() {
    const db = await connectToDB();
    const verdicts = await db.collection<PedagogyVerdict>("pedagogy_verdicts")
        .find({}).sort({ date: -1 }).toArray();
    return NextResponse.json(verdicts.map((v) => ({
        id: v._id!.toString(),
        date: v.date instanceof Date ? v.date.toISOString() : v.date,
        format: v.format,
        moduleSlug: v.moduleSlug ?? null,
        verdict: v.verdict,
        status: v.status,
    })));
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ error: "id manquant ou invalide" }, { status: 400 });
    }
    const db = await connectToDB();
    const r = await db.collection<PedagogyVerdict>("pedagogy_verdicts")
        .deleteOne({ _id: new ObjectId(id) });
    if (r.deletedCount === 0) {
        return NextResponse.json({ error: "verdict introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2 : API exemplaires**

Create `src/app/api/admin/calibrage/exemplars/route.ts` :

```ts
import { NextResponse } from "next/server";
import { ObjectId } from "bson";
import { connectToDB } from "@/lib/mongodb";
import type { PedagogyExemplar } from "@/types/Pedagogy";

export async function GET() {
    const db = await connectToDB();
    const exemplars = await db.collection<PedagogyExemplar>("pedagogy_exemplars")
        .find({}, { projection: { snapshot: 0 } }).sort({ date: -1 }).toArray();
    return NextResponse.json(exemplars.map((e) => ({
        id: e._id!.toString(),
        date: e.date instanceof Date ? e.date.toISOString() : e.date,
        format: e.format,
        moduleSlug: e.moduleSlug,
        sectionSlug: e.sectionSlug,
        level: e.level,
        annotations: e.annotations,
    })));
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ error: "id manquant ou invalide" }, { status: 400 });
    }
    const db = await connectToDB();
    const r = await db.collection<PedagogyExemplar>("pedagogy_exemplars")
        .deleteOne({ _id: new ObjectId(id) });
    if (r.deletedCount === 0) {
        return NextResponse.json({ error: "exemplaire introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3 : Composant client de listing**

Create `src/components/admin/CalibrageList.tsx` :

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Verdict {
    id: string; date: string; format: string;
    moduleSlug: string | null; verdict: string; status: 'active' | 'distilled';
}
interface Exemplar {
    id: string; date: string; format: string;
    moduleSlug: string; sectionSlug: string; level: string; annotations: string[];
}

export default function CalibrageList() {
    const [verdicts, setVerdicts] = useState<Verdict[]>([]);
    const [exemplars, setExemplars] = useState<Exemplar[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const [v, e] = await Promise.all([
            fetch('/api/admin/calibrage/verdicts').then((r) => r.json()),
            fetch('/api/admin/calibrage/exemplars').then((r) => r.json()),
        ]);
        setVerdicts(v);
        setExemplars(e);
        setLoading(false);
    }, []);

    useEffect(() => { void load(); }, [load]);

    const deleteItem = async (kind: 'verdicts' | 'exemplars', id: string) => {
        await fetch(`/api/admin/calibrage/${kind}?id=${id}`, { method: 'DELETE' });
        await load();
    };

    if (loading) return <p className="text-sm text-bridge-500">Chargement…</p>;

    return (
        <div className="flex flex-col gap-8">
            <section>
                <h2 className="text-lg font-semibold mb-3">Verdicts ({verdicts.length})</h2>
                {verdicts.length === 0 && (
                    <p className="text-sm text-bridge-500">Aucun verdict enregistré.</p>
                )}
                <ul className="flex flex-col gap-2">
                    {verdicts.map((v) => (
                        <li key={v.id} className="flex items-start gap-3 rounded-md border border-bridge-500/30 p-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>{v.format}</Badge>
                                    {v.moduleSlug && <span className="text-xs text-bridge-500">{v.moduleSlug}</span>}
                                    <span className="text-xs text-bridge-500">{v.date.slice(0, 10)}</span>
                                    {v.status === 'distilled' && (
                                        <span className="text-xs italic text-bridge-400">distillé</span>
                                    )}
                                </div>
                                <p className="text-sm">{v.verdict}</p>
                            </div>
                            <Button variant="ghost" size="icon" aria-label="Supprimer le verdict"
                                onClick={() => void deleteItem('verdicts', v.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-3">Exemplaires ({exemplars.length})</h2>
                {exemplars.length === 0 && (
                    <p className="text-sm text-bridge-500">Aucun exemplaire promu.</p>
                )}
                <ul className="flex flex-col gap-2">
                    {exemplars.map((e) => (
                        <li key={e.id} className="flex items-start gap-3 rounded-md border border-bridge-500/30 p-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge>{e.format}</Badge>
                                    <span className="text-sm font-medium">{e.moduleSlug}/{e.sectionSlug}</span>
                                    <Badge variant="secondary">{e.level}</Badge>
                                    <span className="text-xs text-bridge-500">{e.date.slice(0, 10)}</span>
                                </div>
                                <ul className="text-sm list-disc pl-5">
                                    {e.annotations.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            </div>
                            <Button variant="ghost" size="icon" aria-label="Supprimer l'exemplaire"
                                onClick={() => void deleteItem('exemplars', e.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
```

Note : si `Badge` n'existe pas dans `src/components/ui/`, remplacer par un `<span>` stylé du même ton que l'admin existant — ne pas créer de nouveau composant UI.

- [ ] **Step 4 : Page admin**

Create `src/app/admin/calibrage/page.tsx` :

```tsx
import CalibrageList from '@/components/admin/CalibrageList';
import { generatePageMetadata } from '@/lib/generatePageMetadata';

export const metadata = generatePageMetadata({
    title: 'Calibrage pédagogique',
    description: 'Verdicts et exemplaires des skills pédagogiques',
});

export default function CalibragePage() {
    return (
        <main className="mx-auto max-w-4xl px-6 py-10">
            <h1 className="text-2xl font-bold mb-2">Calibrage pédagogique</h1>
            <p className="text-sm text-bridge-500 mb-8">
                Verdicts (critiques verbatim lues avant chaque génération) et exemplaires
                (étalons figés imités par le skill content-writer).
            </p>
            <CalibrageList/>
        </main>
    );
}
```

Note : vérifier la signature réelle de `generatePageMetadata` dans `src/lib/generatePageMetadata.ts` et l'adapter (ou utiliser un objet `metadata` statique si l'utilitaire attend d'autres paramètres). Ajouter un lien vers `/admin/calibrage` dans la navigation admin existante (`src/app/admin/page.tsx`) en suivant le pattern des entrées existantes.

- [ ] **Step 5 : Vérifier + committer**

Run: `bun test && bun run build`
Expected: PASS

Vérification manuelle : `bun dev`, ouvrir `/admin/calibrage` (compte admin) — listes vides avec messages, pas d'erreur console.

```bash
git add src/app/api/admin/calibrage/ src/app/admin/calibrage/ src/components/admin/CalibrageList.tsx src/app/admin/page.tsx
git commit -m "feat(admin): page calibrage — consultation et suppression des verdicts et exemplaires"
```

---

### Task 11 : Recette finale

- [ ] **Step 1 : Suite complète**

Run: `bun test && bun run lint && bun run build`
Expected: tout PASS

- [ ] **Step 2 : Vérifier l'exposition MCP en local**

Run: `bun dev` puis, avec un client MCP connecté au serveur local (ou via staging après déploiement) :
1. `get_pedagogical_skill_manifest` → 2 documents (`module-design`, `content-writer`).
2. `get_pedagogical_skill_document("content-writer")` → contenu du main.md.
3. `add_verdict` (format `TP`, texte de test) → `list_verdicts` le renvoie → `distill_verdicts` → `list_verdicts` ne le renvoie plus.
4. `list_sections` sur un module existant → `totalDuration` présent, pas d'erreur sur les sections sans `brief`.

- [ ] **Step 3 : Recette métier (hors plan — première utilisation réelle)**

La recette de bout en bout de la spec (concevoir un petit module réel avec module-design, rédiger une section avec content-writer, générer l'examen, copier en prod) se fait en session d'usage réel sur staging, pas dans ce plan. Elle valide le contenu des documents skill ; toute critique alimente `add_verdict`.

- [ ] **Step 4 : Commit final si retouches**

```bash
git add -A
git commit -m "chore: recette skills pédagogiques MCP"
```
