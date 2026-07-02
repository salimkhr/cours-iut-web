# Refonte génération cours & TP du skill pédagogie — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter `sessionDurationMinutes` au module (type + MCP), refondre `ref-tp` (fil rouge, calibrage, blocs), calibrer `ref-cours`, ajuster les rôles, et traduire les références JSX → blocs.

**Architecture:** La durée de séance devient une prop optionnelle du module MongoDB, exposée par les outils MCP (`create_module`, `edit_module`, `list_modules`) ; `list_sections` expose `totalDuration`. Les documents du skill `skills/pedagogie/` sont réécrits puis embarqués dans `src/lib/skills/pedagogie.ts` via `bun run generate-skill`.

**Tech Stack:** Next.js 16 App Router, MongoDB driver, Zod, MCP (`src/app/api/mcp/route.ts`), bun test (mongodb-memory-server via `tests/helpers/db.ts`).

**Spec :** `docs/superpowers/specs/2026-07-02-skill-pedagogie-tp-cours-design.md`

---

## Fichiers touchés

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/types/Module.ts` | Modifier | Ajouter `sessionDurationMinutes?: number` |
| `src/lib/schemas/module.schema.ts` | Modifier | Valider la prop dans `moduleFormSchema` |
| `src/app/api/mcp/route.ts` | Modifier | `create_module`, `edit_module`, `list_modules`, `list_sections` |
| `tests/lib/module-schema.test.ts` | Modifier | Tests Zod de la prop |
| `tests/mcp/module-duration.test.ts` | Créer | Tests d'intégration MCP durées |
| `skills/pedagogie/references/tp.md` | Réécrire | Nouveau modèle de TP (blocs, fil rouge, calibrage) |
| `skills/pedagogie/references/cours.md` | Réécrire | Calibrage + traduction blocs |
| `skills/pedagogie/agents/auditeur-apprenant.md` | Modifier | Points de contrôle budget + chaîne fil rouge |
| `skills/pedagogie/agents/garant-coherence.md` | Modifier | Vérifications budget + chaîne fil rouge |
| `skills/pedagogie/SKILL.md` | Modifier | Ligne `editorial_format` du contrat d'entrée |
| `skills/pedagogie/manifest.json` | Modifier | Champs `purpose` de ref-cours / ref-tp (le hash est régénéré par script) |
| `tests/mcp/skill-exposure.test.ts` | Modifier | Assertions sur le nouveau contenu |

Note : `src/lib/skills/pedagogie.ts` est **généré** (`bun run generate-skill`), jamais édité à la main.

---

### Task 1: `sessionDurationMinutes` — type et schéma Zod

**Files:**
- Modify: `src/types/Module.ts`
- Modify: `src/lib/schemas/module.schema.ts`
- Test: `tests/lib/module-schema.test.ts`

- [ ] **Step 1: Écrire les tests qui échouent**

Ajouter à la fin de `tests/lib/module-schema.test.ts` :

```ts
describe("moduleFormSchema — sessionDurationMinutes", () => {
    const base = {
        title: "PHP",
        path: "php",
        iconName: "Code",
        associatedSae: [],
        coefficients: [],
        instructors: [],
        isExtra: false,
    };

    it("accepte une durée entière positive", () => {
        const r = moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: 150 });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.sessionDurationMinutes).toBe(150);
    });

    it("est optionnelle", () => {
        const r = moduleFormSchema.safeParse(base);
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.sessionDurationMinutes).toBeUndefined();
    });

    it("rejette zéro, négatif et non-entier", () => {
        expect(moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: 0 }).success).toBe(false);
        expect(moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: -30 }).success).toBe(false);
        expect(moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: 90.5 }).success).toBe(false);
    });
});
```

(Adapter `describe`/`it` aux imports déjà présents dans le fichier — il utilise `bun:test`.)

- [ ] **Step 2: Vérifier l'échec**

Run: `bun test tests/lib/module-schema.test.ts`
Expected: FAIL — `sessionDurationMinutes` absent du schéma (le test « accepte une durée » passe peut-être si Zod ignore les clés inconnues : dans ce cas c'est `r.data.sessionDurationMinutes` qui vaut `undefined` et l'assertion échoue).

- [ ] **Step 3: Implémenter**

Dans `src/types/Module.ts`, après `isExtra?: boolean;` :

```ts
    isExtra?: boolean;
    sessionDurationMinutes?: number;
```

Dans `src/lib/schemas/module.schema.ts`, dans `moduleFormSchema` après `isExtra` :

```ts
    isExtra: z.boolean().default(false),
    sessionDurationMinutes: z.number().int().min(1).optional(),
```

- [ ] **Step 4: Vérifier le succès**

Run: `bun test tests/lib/module-schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/Module.ts src/lib/schemas/module.schema.ts tests/lib/module-schema.test.ts
git commit -m "feat(module): prop sessionDurationMinutes (type + schéma Zod)"
```

---

### Task 2: MCP — exposer les durées (`create_module`, `edit_module`, `list_modules`, `list_sections`)

**Files:**
- Modify: `src/app/api/mcp/route.ts` (create_module ~l.376, edit_module ~l.431, list_modules ~l.668, list_sections ~l.684)
- Test: `tests/mcp/module-duration.test.ts` (créer)

- [ ] **Step 1: Écrire le test d'intégration qui échoue**

Créer `tests/mcp/module-duration.test.ts` (harnais calqué sur `tests/mcp/content-tools.test.ts`) :

```ts
import { beforeAll, afterAll, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

// L'email du token de test doit être admin pour edit_module.
process.env.MCP_ADMIN_EMAILS = "user@test.com";

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

mock.module("@/lib/scalekit", () => ({
    validateScalekitToken: async (token: string) => {
        if (token === "valid-token") return { sub: "u1", email: "user@test.com" };
        return null;
    },
}));

mock.module("@/lib/publicOrigin", () => ({
    getPublicOrigin: () => "http://localhost",
}));

mock.module("next/cache", () => ({
    revalidateTag: () => {},
}));

const { POST } = await import("../../src/app/api/mcp/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());

    await db.collection("modules").insertOne({
        path: "php",
        title: "PHP",
        isExtra: false,
        sections: [{
            path: "1-decouverte",
            title: "Découverte",
            order: 1,
            contents: [{ type: "TP", source: "db" }],
            objectives: [], tags: [], totalDuration: 2,
            hasCorrection: false, isAvailable: true,
            correctionIsAvailable: false, examenIsLock: false,
        }],
    });
    await db.collection("modules").insertOne({
        path: "brainfuck",
        title: "Brainfuck",
        isExtra: true,
        sections: [],
    });
}, 60_000);

afterAll(async () => { await stopDb?.(); }, 10_000);

async function callTool(name: string, params: Record<string, unknown>): Promise<string> {
    const req = new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer valid-token",
            "Accept": "application/json, text/event-stream",
            "mcp-session-id": `test-${name}`,
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name, arguments: params },
        }),
    });
    const res = await POST(req);
    const text = await res.text();
    const dataLines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of dataLines) {
        let parsed: unknown;
        try { parsed = JSON.parse(line.slice("data: ".length)); } catch { continue; }
        const p = parsed as { error?: { message?: string }; result?: { isError?: boolean; content?: { text?: string }[] } };
        if (p?.error) throw new Error(p.error.message ?? "JSON-RPC error");
        if (p?.result) {
            if (p.result.isError) throw new Error(p.result.content?.[0]?.text ?? "tool error");
            return p.result.content?.[0]?.text ?? "";
        }
    }
    // Réponse JSON directe (non-SSE)
    const p = JSON.parse(text) as { error?: { message?: string }; result?: { isError?: boolean; content?: { text?: string }[] } };
    if (p?.error) throw new Error(p.error.message ?? "JSON-RPC error");
    if (p.result?.isError) throw new Error(p.result.content?.[0]?.text ?? "tool error");
    return p.result?.content?.[0]?.text ?? "";
}

describe("MCP — durées de séance", () => {
    test("edit_module accepte sessionDurationMinutes", async () => {
        const out = await callTool("edit_module", { module: "php", sessionDurationMinutes: 150 });
        expect(out).toContain("sessionDurationMinutes");
    });

    test("list_modules renvoie sessionDurationMinutes et isExtra", async () => {
        const out = JSON.parse(await callTool("list_modules", {}));
        const php = out.find((m: { slug: string }) => m.slug === "php");
        expect(php.sessionDurationMinutes).toBe(150);
        expect(php.isExtra).toBe(false);
        const bf = out.find((m: { slug: string }) => m.slug === "brainfuck");
        expect(bf.isExtra).toBe(true);
        expect(bf.sessionDurationMinutes).toBeUndefined();
    });

    test("list_sections renvoie totalDuration", async () => {
        const out = JSON.parse(await callTool("list_sections", { module: "php" }));
        expect(out[0].totalDuration).toBe(2);
    });

    test("create_module accepte sessionDurationMinutes", async () => {
        await callTool("create_module", { title: "Rust", sessionDurationMinutes: 120 });
        const mod = await db.collection("modules").findOne({ path: "rust" });
        expect(mod?.sessionDurationMinutes).toBe(120);
    });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `bun test tests/mcp/module-duration.test.ts`
Expected: FAIL — `edit_module` ne mentionne pas `sessionDurationMinutes`, `list_modules` ne renvoie ni `sessionDurationMinutes` ni `isExtra`, `list_sections` ne renvoie pas `totalDuration`.

- [ ] **Step 3: Implémenter dans `src/app/api/mcp/route.ts`**

**`create_module`** — ajouter le paramètre au schéma d'entrée et le passer au parse :

```ts
        {
            title:       z.string().describe("Titre affiché du module, ex: Rust"),
            iconName:    iconNameSchema.optional(),
            path:        z.string().optional().describe("Slug du module (défaut: dérivé du titre)"),
            description: z.string().optional(),
            sessionDurationMinutes: z.number().int().min(1).optional()
                .describe("Durée d'une séance en minutes (ex: 150 pour 2h30). Absent pour les modules bonus."),
        },
        async ({ title, iconName, path, description, sessionDurationMinutes }) => {
```

et dans l'appel `moduleFormSchema.safeParse({ ... })` ajouter :

```ts
                isExtra: true,
                sessionDurationMinutes,
```

**`edit_module`** — ajouter le paramètre et le `$set` :

```ts
            colorDark:   z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
                .describe("Couleur sombre du thème en hex (#rrggbb)"),
            sessionDurationMinutes: z.number().int().min(1).optional()
                .describe("Durée d'une séance en minutes (ex: 150 pour 2h30)"),
        },
        async ({ module, title, iconName, description, colorLight, colorDark, sessionDurationMinutes }) => {
```

et après `if (colorDark !== undefined) set.colorDark = colorDark;` :

```ts
            if (sessionDurationMinutes !== undefined) set.sessionDurationMinutes = sessionDurationMinutes;
```

**`list_modules`** — élargir la projection et le mapping :

```ts
            const modules = await db.collection<{ path: string; title?: string; isExtra?: boolean; sessionDurationMinutes?: number }>("modules")
                .find({}, { projection: { path: 1, title: 1, isExtra: 1, sessionDurationMinutes: 1, _id: 0 } })
                .toArray();
            const result = modules.map((m) => ({
                slug: m.path,
                title: m.title ?? m.path,
                isExtra: m.isExtra ?? false,
                ...(m.sessionDurationMinutes !== undefined && { sessionDurationMinutes: m.sessionDurationMinutes }),
            }));
```

**`list_sections`** — ajouter `totalDuration` au mapping :

```ts
            const sections = (mod.sections ?? []).map((s) => ({
                slug: s.path,
                title: s.title ?? s.path,
                totalDuration: s.totalDuration ?? 1,
                contents: Object.fromEntries((s.contents ?? []).map((c) => [c.type, c.source ?? "file"])),
            }));
```

(Si le type `ModuleDoc` local ne déclare pas `totalDuration` sur les sections, l'ajouter à sa définition.)

**Description de `edit_module`** — mentionner la durée :

```ts
        "Édite les métadonnées d'un module : titre, description, icône, couleurs thème (colorLight/colorDark en hex), durée de séance (sessionDurationMinutes). Réservé aux admins.",
```

- [ ] **Step 4: Vérifier le succès**

Run: `bun test tests/mcp/module-duration.test.ts`
Expected: PASS (4 tests)

Run: `bun test tests/mcp/`
Expected: PASS — pas de régression sur `content-tools` et `skill-exposure`.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/mcp/route.ts tests/mcp/module-duration.test.ts
git commit -m "feat(mcp): exposer sessionDurationMinutes/isExtra (list_modules) et totalDuration (list_sections)"
```

---

### Task 3: Refonte `skills/pedagogie/references/tp.md`

**Files:**
- Rewrite: `skills/pedagogie/references/tp.md`
- Modify: `skills/pedagogie/manifest.json` (purpose de `ref-tp`)
- Test: `tests/mcp/skill-exposure.test.ts`

- [ ] **Step 1: Écrire les assertions qui échouent**

Ajouter dans `tests/mcp/skill-exposure.test.ts`, dans le `describe("Skill pédagogique — documents")` :

```ts
    it("ref-tp et ref-cours ne parlent plus JSX ni fichiers .tsx", () => {
        for (const id of ["ref-tp", "ref-cours"]) {
            const doc = SKILL_DOCUMENTS[id];
            expect(doc.content).not.toContain(".tsx");
            expect(doc.content).not.toContain("@/components");
            expect(doc.content).not.toContain("src/cours/");
            expect(doc.content.toLowerCase()).not.toContain("jsx");
        }
    });

    it("ref-tp décrit le fil rouge et le calibrage", () => {
        const tp = SKILL_DOCUMENTS["ref-tp"].content;
        expect(tp).toContain("fil rouge");
        expect(tp).toContain("sessionDurationMinutes");
        expect(tp).toContain("totalDuration");
        expect(tp).toContain("list_block_types");
        expect(tp).toContain("À ce stade, votre projet contient");
        expect(tp).not.toContain("pas de dépendance exercice");
    });
```

- [ ] **Step 2: Vérifier l'échec**

Run: `bun run generate-skill; bun test tests/mcp/skill-exposure.test.ts`
Expected: FAIL — l'actuel `tp.md` contient `src/cours/php/` et pas de section fil rouge.

- [ ] **Step 3: Réécrire `skills/pedagogie/references/tp.md`**

Contenu complet du fichier :

```markdown
# Règles pédagogiques — Type : TP

## Format d'écriture : blocs

Le TP est un arbre de blocs écrit via les outils MCP (`save_content`, `insert_block`,
`edit_block`…). Avant de rédiger, appelez `list_block_types()` pour obtenir la liste à
jour des types de blocs, leurs props exactes, les blocs conteneurs et leurs enfants
autorisés. Ne devinez jamais un type ou une prop.

Conventions d'usage pédagogique (non déductibles du schéma) :

| Usage | Bloc |
|-------|------|
| Un exercice | `section` avec `title` : « Exercice N — [objectif] » |
| Consignes pas-à-pas | `list` avec `ordered: true`, une action par `list-item` |
| Code (squelette, signature, exemple) | `code` avec `language` et `filename` — jamais de code dans un bloc `text` |
| Fichier de départ fourni | `download-file` (données réalistes du livrable) |
| Récapitulatif d'état du projet | `callout` variant `info`, title « À ce stade, votre projet contient » |
| Avertissement / rappel | `callout` variant `warning` ou `reminder` |

## Structure obligatoire du TP

1. **Annonce du livrable** — le TP s'ouvre sur un bloc `text` :
   « À la fin de ce TP, vous aurez construit **X** ». X est un objet concret et
   démontrable (un memory game, une galerie filtrée, une page de profil…), jamais
   « des exercices sur les boucles ».
2. **Exercice 1 — échauffement indépendant** — application directe de la notion du
   cours, sans lien avec le fil rouge, démarrable même sans avoir tout compris.
   Guidage fort.
3. **Exercices 2 et suivants — fil rouge séquentiel** — chaque exercice fait avancer
   le livrable en s'appuyant sur le résultat de l'exercice précédent. Les dépendances
   entre exercices du fil rouge sont autorisées et attendues.

## Récapitulatif d'état (filet de sécurité)

Chaque exercice du fil rouge commence par un `callout` info
« À ce stade, votre projet contient : » listant les fichiers, les fonctions ou classes
définies et les fonctionnalités en place.

- Le récapitulatif de l'exercice N décrit **exactement** le résultat attendu de
  l'exercice N−1 — ni plus, ni moins.
- Il permet à un étudiant bloqué de se resynchroniser rapidement avec l'aide de
  l'enseignant, sans maintenir de code de rattrapage.

## Schéma Définir → Utiliser

Chaque exercice suit ce schéma en deux temps :

### Étape 1 — Définir
L'étudiant crée la fonction, la classe ou le module. Imposer :
- Le **nom exact** de la fonction/classe
- Les **paramètres** et leur type attendu (en commentaire ou en description)
- Le **type de retour** attendu
- **Ne jamais donner le corps** de la fonction

### Étape 2 — Utiliser
L'étudiant appelle ce qu'il vient de créer dans un contexte réel. Imposer :
- Le **fichier cible** où l'appel doit se faire
- Le **résultat observable** attendu (affichage console, rendu visuel, valeur retournée)
- **Ne jamais donner l'appel exact**

## Guidage progressif

### Exercices 1–2 : guidage fort

- Fichier cible précisé explicitement
- Méthode ou API à utiliser imposée
- Résultat attendu décrit avec précision
- Critère de validation explicite (« Vous devriez voir X dans la console / le navigateur »)
- Chaque action formulée à l'**impératif vouvoyé** :
  `Créez`, `Ajoutez`, `Modifiez`, `Vérifiez`, `Ouvrez`, `Utilisez`, `Affichez`
- **Jamais d'infinitif** (« Créer le fichier… ») ni de futur (« Vous créerez… »)

### Exercices 3 et suivants : guidage léger

- Objectif fonctionnel uniquement (« Faites en sorte que… »)
- Contraintes techniques listées (ex : « sans boucle `for` », « avec la méthode `reduce` »)
- L'étudiant détermine lui-même les étapes
- Pas de numérotation des étapes — juste l'objectif et les contraintes

## Anti-abstraction

- Au-delà de l'exercice 1, chaque exercice manipule les **données réelles du livrable**
  (des films, des scores, des produits…) — jamais de `foo`/`bar` ni de fonctions jouets
  (« une fonction qui additionne deux nombres »).
- Si l'exercice a besoin de données, les fournir via un bloc `download-file` avec des
  données réalistes.

## Calibrage temporel

Budget TP = `totalDuration` (section, nb de séances) × `sessionDurationMinutes` (module)
− temps de cours en séance.

- Lire les durées via `list_modules()` (`sessionDurationMinutes`, `isExtra`) et
  `list_sections(module)` (`totalDuration`).
- Temps de cours en séance : nombre de blocs `slide` dans
  `get_content(module, section, "slide")` × 2 minutes. Si les slides n'existent pas
  encore, déduire un forfait de 30 minutes de la première séance.
- Le fil rouge doit être finissable dans le budget par un étudiant moyen.
- Chaque exercice indique une **durée indicative** ; vérifier à la rédaction que la
  somme respecte le budget.
- Modules avec `isExtra: true` (bonus à faire chez soi) : aucune contrainte de durée,
  mais le TP doit être **auto-suffisant** (réalisable sans enseignant).

## Deux échelles de fil rouge

- **Projet annuel** (ex : Netflex en PHP) : chaque TP fait avancer le même projet d'une
  séance à l'autre. Avant d'écrire ou de réviser, reconstruire l'état courant du projet
  en lisant les TPs des sections précédentes via `list_sections(module)` puis
  `get_content(module, section, "TP")` : fichiers existants, classes et fonctions déjà
  définies, structure de base de données, fonctionnalités en place. Les exercices
  s'appuient sur cet état sans le répéter ni le contredire.
- **Livrable par TP** (HTML/CSS, JS…) : chaque TP construit un objet terminé,
  sans dépendance entre TPs.

## Règles absolues

- **Jamais de code solution** dans le TP, même partiel
- Chaque exercice guidé (1–2) a toujours : fichier cible + méthode/API + résultat
  attendu + critère de validation
- Le récapitulatif d'état de l'exercice N correspond exactement au résultat de N−1
```

- [ ] **Step 4: Mettre à jour le purpose dans `skills/pedagogie/manifest.json`**

```json
      "purpose": "Règles éditoriales (blocs) pour la rédaction des TPs : fil rouge, calibrage, guidage",
```

(remplace `"Règles éditoriales JSX pour la rédaction des TPs"`.)

- [ ] **Step 5: Régénérer et vérifier**

Run: `bun run generate-skill; bun test tests/mcp/skill-exposure.test.ts`
Expected: le test « ref-tp décrit le fil rouge » PASS ; le test « ne parlent plus JSX » FAIL encore sur `ref-cours` (normal, Task 4). Si le fichier de test fait échouer toute la suite, c'est attendu — noter que seule l'assertion ref-cours reste rouge.

- [ ] **Step 6: Commit**

```bash
git add skills/pedagogie/references/tp.md skills/pedagogie/manifest.json tests/mcp/skill-exposure.test.ts
git commit -m "feat(skill): refonte ref-tp — fil rouge, calibrage temporel, écriture en blocs"
```

---

### Task 4: Refonte `skills/pedagogie/references/cours.md`

**Files:**
- Rewrite: `skills/pedagogie/references/cours.md`
- Modify: `skills/pedagogie/manifest.json` (purpose de `ref-cours`)
- Test: `tests/mcp/skill-exposure.test.ts` (assertions de la Task 3 + une nouvelle)

- [ ] **Step 1: Ajouter l'assertion qui échoue**

Dans `tests/mcp/skill-exposure.test.ts` :

```ts
    it("ref-cours décrit le calibrage et l'alignement TP", () => {
        const cours = SKILL_DOCUMENTS["ref-cours"].content;
        expect(cours).toContain("30 min");
        expect(cours).toContain("list_block_types");
        expect(cours).toContain("À savoir pour ce cours");
        expect(cours).toContain("collapsible");
    });
```

Run: `bun test tests/mcp/skill-exposure.test.ts`
Expected: FAIL

- [ ] **Step 2: Réécrire `skills/pedagogie/references/cours.md`**

Contenu complet du fichier :

```markdown
# Règles pédagogiques — Type : Cours

## Format d'écriture : blocs

Le cours est un arbre de blocs écrit via les outils MCP (`save_content`, `insert_block`,
`edit_block`…). Avant de rédiger, appelez `list_block_types()` pour obtenir la liste à
jour des types de blocs, leurs props exactes, les blocs conteneurs et leurs enfants
autorisés. Ne devinez jamais un type ou une prop.

Conventions d'usage pédagogique (non déductibles du schéma) :

| Usage | Bloc |
|-------|------|
| Grand thème | `section` avec `title` préfixé « A — », « B — », « C — » |
| Paragraphe explicatif | `text` (markdown inline pour gras/italique/code inline) |
| Chapeau prérequis | `collapsible` avec title « À savoir pour ce cours » |
| Code d'exemple | `code` avec `language` + `title`/`filename` descriptifs — jamais de code dans un bloc `text` |
| Démonstration HTML/CSS | `code-with-preview` |
| Pièges, avertissements, rappels | `callout` avec variant `warning` / `tip` / `reminder` / `info` |
| Énumérations | `list` + `list-item` (`ordered` selon le sens) |
| Schémas et diagrammes | `diagram` (syntaxe Mermaid) |

## Chapeau obligatoire « À savoir pour ce cours »

**Toujours présent en tête de cours, avant tout contenu.**

- Bloc `collapsible` avec title exact : « À savoir pour ce cours »
- Contenu : **3 à 5 notions** du ou des cours précédents
- Chaque notion = un bloc `text` d'une phrase de rappel + un bloc `code` court
- Maximum 10 lignes de code au total dans ce chapeau
- **En mode écriture** : demander quel cours précède avant de générer ce chapeau

## Structure imposée pour chaque concept

Chaque concept du cours suit cet ordre :

1. **Contexte** — pourquoi ce concept existe, quel problème concret il résout (1 bloc `text`)
2. **Définition** — explication en langage naturel, sans jargon préalable (1 bloc `text`)
3. **Exemple minimal** — le cas le plus simple possible (bloc `code`)
4. **Exemple complet** — cas réaliste et utile (bloc `code` ou `code-with-preview`)
5. **Pièges courants** — 2 à 3 erreurs fréquentes avec explication (bloc `list` non
   ordonnée, ou `callout` variant `warning`)

## Calibrage

- Le cours se lit **avant la séance** : viser ~30 min de lecture maximum par séance
  prévue (`totalDuration` de la section, via `list_sections`).
- **Alignement cours ↔ TP** : chaque concept du cours doit être utilisé par au moins
  un exercice du TP de la section. Un concept qui n'apparaît dans aucun exercice est
  coupé ou déplacé vers une autre section.

## Règles supplémentaires

- Chaque terme technique **défini avant sa première utilisation**, jamais l'inverse
- Progression linéaire : chaque section repart de ce que l'étudiant vient d'apprendre
- Les blocs `code` ont toujours un `title` descriptif (« Syntaxe de base »,
  « Exemple complet »…)
- Un seul grand thème par bloc `section`, préfixé « A — », « B — », « C — »
```

- [ ] **Step 3: Mettre à jour le purpose dans `skills/pedagogie/manifest.json`**

```json
      "purpose": "Règles éditoriales (blocs) pour la rédaction des cours : structure, chapeau prérequis, calibrage",
```

- [ ] **Step 4: Régénérer et vérifier**

Run: `bun run generate-skill; bun test tests/mcp/skill-exposure.test.ts`
Expected: PASS — toutes les assertions des Tasks 3 et 4, y compris « ne parlent plus JSX ».

- [ ] **Step 5: Commit**

```bash
git add skills/pedagogie/references/cours.md skills/pedagogie/manifest.json tests/mcp/skill-exposure.test.ts
git commit -m "feat(skill): refonte ref-cours — calibrage lecture, alignement TP, écriture en blocs"
```

---

### Task 5: Rôles et contrat d'entrée

**Files:**
- Modify: `skills/pedagogie/agents/auditeur-apprenant.md`
- Modify: `skills/pedagogie/agents/garant-coherence.md`
- Modify: `skills/pedagogie/SKILL.md` (ligne `editorial_format`)

- [ ] **Step 1: Auditeur apprenant — points de contrôle fil rouge**

Dans `skills/pedagogie/agents/auditeur-apprenant.md`, section « Ce que tu recherches »,
ajouter à la fin de la liste :

```markdown
- Fil rouge du TP irréalisable dans le budget temps de la section
  (`totalDuration × sessionDurationMinutes` moins le temps de cours)
- Récapitulatif « À ce stade, votre projet contient » de l'exercice N qui ne correspond
  pas au résultat réel de l'exercice N−1
- Exercice du fil rouge qui suppose du code que l'étudiant n'a jamais écrit
```

- [ ] **Step 2: Garant de cohérence — vérifications fil rouge**

Dans `skills/pedagogie/agents/garant-coherence.md`, section « Cohérence multi-supports »,
ajouter à la fin de la liste :

```markdown
- La chaîne du fil rouge du TP est-elle continue (chaque exercice s'appuie uniquement
  sur du code écrit dans les exercices précédents ou fourni en téléchargement) ?
- La somme des durées indicatives des exercices respecte-t-elle le budget de la section
  (`totalDuration × sessionDurationMinutes` − temps de cours estimé depuis les slides) ?
```

- [ ] **Step 3: SKILL.md — contrat d'entrée**

Dans `skills/pedagogie/SKILL.md`, remplacer :

```yaml
  editorial_format: "JSX composants imposés (charger ref-cours, ref-tp ou ref-slide)"
```

par :

```yaml
  editorial_format: "blocs MongoDB (charger ref-cours, ref-tp ou ref-slide ; liste des types via list_block_types)"
```

- [ ] **Step 4: Régénérer et vérifier**

Run: `bun run generate-skill; bun test tests/mcp/`
Expected: PASS (l'assertion « ne parlent plus JSX » ne porte que sur ref-tp/ref-cours,
pas sur SKILL.md ni les rôles — mais vérifier qu'aucun test existant ne casse).

- [ ] **Step 5: Commit**

```bash
git add skills/pedagogie/agents/auditeur-apprenant.md skills/pedagogie/agents/garant-coherence.md skills/pedagogie/SKILL.md skills/pedagogie/manifest.json
git commit -m "feat(skill): rôles — contrôles budget temps et chaîne du fil rouge"
```

---

### Task 6: Vérification globale et renseignement des durées en base

**Files:** aucun (vérification + opération de données)

- [ ] **Step 1: Suite complète**

Run: `bun test`
Expected: PASS — aucune régression.

Run: `bun run build`
Expected: build OK (`generateSkillModule` tourne en `prebuild` ; `next build` mocke la DB).

- [ ] **Step 2: Renseigner les durées en base**

Après déploiement (ou sur staging), via le serveur MCP en tant qu'admin :

```
edit_module(module: "php",       sessionDurationMinutes: 150)
edit_module(module: "javascript", sessionDurationMinutes: 120)
edit_module(module: "html-css",  sessionDurationMinutes: 90)
```

(Vérifier d'abord les slugs exacts avec `list_modules()` — les modules `isExtra`
restent sans valeur.)

- [ ] **Step 3: Vérifier**

Appeler `list_modules()` : PHP → 150, JS → 120, HTML/CSS → 90, modules bonus sans
`sessionDurationMinutes`.
```
