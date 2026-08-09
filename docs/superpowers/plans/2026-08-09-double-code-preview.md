# Blocs à deux codes, gabarit d'aperçu et édition étudiante — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'étudiant de modifier le HTML/CSS/JS présenté dans un cours et d'en voir l'effet immédiatement, via un bloc à deux panneaux de code et un gabarit d'aperçu à marqueurs.

**Architecture:** Toute la logique d'assemblage sort de `blockRegistry.tsx` vers un module pur `src/lib/previewDocument.ts`, seul endroit testable et seul porteur de la décision d'exécuter du script. L'iframe descend dans `CodeWithPreviewCard` (déjà `'use client'`) pour pouvoir se recalculer à la frappe. Le builder gagne un type de champ `code` réutilisable par tous les blocs porteurs de code.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2, TypeScript 6.0.3 strict, Zod 4.4, `bun test`, `@monaco-editor/react` 4.7, `react-syntax-highlighter` (Prism).

## Global Constraints

- **Indentation 4 espaces.** Imports via l'alias `@/*`. Function components uniquement.
- **TypeScript strict** : pas d'`any`, pas de `@ts-ignore` sans commentaire `// reason: ...`.
- **Commentaires et libellés en français.** Apostrophes typographiques dans les libellés UI.
- **Tests** : `bun test`, fichiers colocalisés. Pas de `@testing-library` dans ce projet — les composants se testent par rendu statique, suivant le pattern déjà en place dans `src/components/builder/DynamicPropsEditor.test.tsx` :
  ```tsx
  import {renderToStaticMarkup} from "react-dom/server";
  const html = renderToStaticMarkup(<Composant … />);
  expect(html).toContain('rows="15"');
  ```
  Ne pas introduire d'autre bibliothèque de test. Les composants clients à état (Monaco, debounce) ne se testent pas ainsi : les vérifier dans le navigateur, comme indiqué dans les tâches concernées.
- **Ne jamais contourner les hooks pre-commit** (`--no-verify` interdit).
- **Le schéma du bloc est dupliqué** : `src/lib/blockDefs.ts` (champ `schema:`) **et** `src/lib/blockSchemas.ts`. Les deux doivent rester synchronisés.
- **Piège `markup`** : `normalizeLanguage("html")` retourne `"markup"`, pas `"html"` (alias dans `src/lib/syntaxHighlighter.ts:46`).
- Après toute modification de `package.json` : relancer `bunx next build`.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `src/lib/previewDocument.ts` *(créer)* | Fonction pure : classe les sources par langage, injecte aux marqueurs, assemble le document, décide `needsScripts` et `editable`. |
| `src/lib/previewDocument.test.ts` *(créer)* | Couverture complète du module ci-dessus, y compris la non-régression. |
| `src/lib/blockSchemas.ts` *(modifier)* | Schéma Zod du bloc — ajout des champs. |
| `src/lib/blockDefs.ts` *(modifier)* | Second schéma, champs builder, langages, description MCP. |
| `src/lib/blockRegistry.tsx` *(modifier)* | Ne fait plus que passer les props brutes ; perd `previewSrcDoc` et l'iframe. |
| `src/components/Cards/CodeWithPreviewCard.tsx` *(modifier)* | Deux panneaux, iframe, état d'édition, debounce, réinitialisation. |
| `src/components/builder/CodeField.tsx` *(créer)* | Champ de saisie de code avec coloration, pour le panneau Propriétés. |
| `src/lib/monacoTheme.ts` *(créer)* | Thème Monaco dérivé de `codeTheme.ts`. |
| `src/lib/blockTextUtils.ts` *(modifier)* | « Copier pour l'IA » inclut le second code. |

**Jalon :** les tâches 1 à 6 forment un livrable autonome (double code + aperçu correct, sans édition). Les tâches 7 à 10 ajoutent l'édition. On peut s'arrêter après la 6.

---

### Task 1: Module `previewDocument` — détection des langages exécutables

**Files:**
- Create: `src/lib/previewDocument.ts`
- Test: `src/lib/previewDocument.test.ts`

**Interfaces:**
- Consumes: `normalizeLanguage` depuis `@/lib/syntaxHighlighter`
- Produces: `isRunnable(language: string | null | undefined): boolean`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import {test, expect} from "bun:test";
import {isRunnable} from "@/lib/previewDocument";

test("reconnaît les langages exécutables par le navigateur", () => {
    expect(isRunnable("html")).toBe(true);
    expect(isRunnable("css")).toBe(true);
    expect(isRunnable("javascript")).toBe(true);
});

test("accepte les alias de langage", () => {
    expect(isRunnable("js")).toBe(true);
    expect(isRunnable("HTML")).toBe(true);
    expect(isRunnable("xml")).toBe(true);
});

test("rejette les langages sans interpréteur navigateur", () => {
    for (const lang of ["php", "rust", "sql", "bash", "json"]) {
        expect(isRunnable(lang)).toBe(false);
    }
});

test("rejette les langages qui exigeraient une transpilation", () => {
    for (const lang of ["typescript", "jsx", "tsx"]) {
        expect(isRunnable(lang)).toBe(false);
    }
});

test("tolère l'absence de langage", () => {
    expect(isRunnable(null)).toBe(false);
    expect(isRunnable(undefined)).toBe(false);
    expect(isRunnable("")).toBe(false);
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: FAIL — le module `previewDocument` n'existe pas.

- [ ] **Step 3: Écrire l'implémentation minimale**

```ts
import {normalizeLanguage} from "@/lib/syntaxHighlighter";

/**
 * Langages qu'un navigateur exécute tel quel, en **noms canoniques Prism**.
 *
 * Attention : `normalizeLanguage("html")` retourne `"markup"` (alias défini dans
 * syntaxHighlighter.ts). Écrire `"html"` ici rendrait tout bloc HTML non
 * exécutable et désactiverait silencieusement son aperçu.
 *
 * Sont volontairement absents : php, rust, sql, bash, json (aucun interpréteur
 * côté client) ainsi que typescript, jsx et tsx (transpilation requise).
 */
const RUNNABLE_LANGUAGES = new Set(["markup", "css", "javascript"]);

/** Vrai si le langage peut produire un rendu dans l'iframe d'aperçu. */
export function isRunnable(language: string | null | undefined): boolean {
    return RUNNABLE_LANGUAGES.has(normalizeLanguage(language));
}
```

- [ ] **Step 4: Lancer le test et vérifier qu'il passe**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/previewDocument.ts src/lib/previewDocument.test.ts
git commit -m "feat(preview): détecte les langages exécutables par le navigateur"
```

---

### Task 2: Assemblage hérité — reproduire le comportement actuel

Cette tâche déplace la logique existante de `blockRegistry.tsx:37` sans la changer. C'est le filet qui garantit que le contenu publié ne bouge pas.

**Files:**
- Modify: `src/lib/previewDocument.ts`
- Test: `src/lib/previewDocument.test.ts`
- Read only: `src/lib/blockRegistry.tsx:37-68` (source à transposer)

**Interfaces:**
- Consumes: `isRunnable` (Task 1)
- Produces:
  ```ts
  interface PreviewSources {
      language?: string | null;
      code?: string | null;
      secondaryLanguage?: string | null;
      secondaryCode?: string | null;
      preview?: string | null;
  }
  interface PreviewDocument {
      html: string;
      needsScripts: boolean;
      editable: boolean;
  }
  function buildPreviewDocument(sources: PreviewSources): PreviewDocument
  ```

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import {buildPreviewDocument} from "@/lib/previewDocument";

test("CSS : le code devient la feuille de style et preview le corps", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".intro { color: red }",
        preview: "<p class=\"intro\">Bonjour</p>",
    });

    expect(html).toContain("<style>.intro { color: red }</style>");
    expect(html).toContain("<p class=\"intro\">Bonjour</p>");
});

test("CSS sans preview : injecte la page de démonstration par défaut", () => {
    const {html} = buildPreviewDocument({language: "css", code: "body { margin: 0 }"});

    expect(html).toContain("Catalogue des formations");
    expect(html).toContain("body { margin: 0 }");
});

test("HTML : preview fait office de document quand il est fourni", () => {
    const {html} = buildPreviewDocument({
        language: "html",
        code: "<p>ignoré</p>",
        preview: "<p>retenu</p>",
    });

    expect(html).toContain("<p>retenu</p>");
    expect(html).not.toContain("ignoré");
});

test("HTML : un document complet dans preview est renvoyé tel quel", () => {
    const doc = "<html lang=\"fr\"><body><p>Salut</p></body></html>";
    const {html} = buildPreviewDocument({language: "html", code: "", preview: doc});

    expect(html).toBe(doc);
});

test("HTML sans preview : le code sert de corps de document", () => {
    const {html} = buildPreviewDocument({language: "html", code: "<p>Bonjour</p>"});

    expect(html).toContain("<p>Bonjour</p>");
    expect(html).toContain("<!doctype html>");
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: FAIL — `buildPreviewDocument` n'est pas exportée.

- [ ] **Step 3: Écrire l'implémentation**

Transposer `previewSrcDoc` (`blockRegistry.tsx:37-68`) à l'identique. Ne rien « améliorer » au passage : cette tâche est un déplacement, les écarts se verront en Task 3.

```ts
export interface PreviewSources {
    language?: string | null;
    code?: string | null;
    secondaryLanguage?: string | null;
    secondaryCode?: string | null;
    preview?: string | null;
}

export interface PreviewDocument {
    /** Document complet destiné au `srcDoc` de l'iframe. */
    html: string;
    /** Vrai si un script doit s'exécuter — pilote l'attribut `sandbox`. */
    needsScripts: boolean;
    /** Vrai si l'étudiant peut modifier les panneaux de code. */
    editable: boolean;
}

const PREVIEW_TEXT_STYLE = "body { color: #221e18; background: #ffffff; }";

const CSS_DEMO_BODY = `<main id="contenu-principal" class="conteneur">
                <h1>Développement web</h1>
                <p class="introduction">Découvrez un exemple de contenu stylé avec CSS.</p>
                <section class="grille">
                    <article class="carte"><span class="badge">Nouveau</span><h2>HTML et CSS</h2><p>Structure et présentation d&apos;une page.</p></article>
                    <article class="carte"><h2>JavaScript</h2><p>Interactions dans le navigateur.</p></article>
                </section>
            </main>`;

const CSS_DEMO_HEADER = `<header class="navigation">
                <strong>Catalogue des formations</strong>
                <nav><a href="#">Accueil</a> <a href="#">Formations</a></nav>
            </header>`;

/** Assemblage historique, conservé quand le gabarit ne porte aucun marqueur. */
function buildLegacyDocument(sources: PreviewSources): string {
    const code = String(sources.code ?? "");
    const language = String(sources.language ?? "html");
    const markup = sources.preview?.trim();

    if (language.trim().toLowerCase() === "css") {
        const body = markup || CSS_DEMO_BODY;
        const header = markup ? "" : CSS_DEMO_HEADER;
        return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${code}</style></head><body style="background: #ffffff !important;">
            ${header}
            ${body}
        </body></html>`;
    }

    if (markup) {
        if (/<html(?:\s|>)/i.test(markup)) return markup;
        return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${PREVIEW_TEXT_STYLE}</style></head><body>${markup}</body></html>`;
    }

    if (/<html(?:\s|>)/i.test(code)) {
        return code.replace(/<\/head>/i, `<style>${PREVIEW_TEXT_STYLE}</style></head>`);
    }

    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${PREVIEW_TEXT_STYLE}</style></head><body>${code}</body></html>`;
}

export function buildPreviewDocument(sources: PreviewSources): PreviewDocument {
    return {
        html: buildLegacyDocument(sources),
        needsScripts: false,
        editable: false,
    };
}
```

- [ ] **Step 4: Lancer le test et vérifier qu'il passe**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: PASS — 10 tests au total.

- [ ] **Step 5: Commit**

```bash
git add src/lib/previewDocument.ts src/lib/previewDocument.test.ts
git commit -m "refactor(preview): extrait l'assemblage du document dans un module pur"
```

---

### Task 3: Marqueurs `@edit:<langage>` dans le gabarit

**Files:**
- Modify: `src/lib/previewDocument.ts`
- Test: `src/lib/previewDocument.test.ts`

**Interfaces:**
- Produces: comportement d'injection de `buildPreviewDocument` (signature inchangée)

- [ ] **Step 1: Écrire le test qui échoue**

```ts
const GABARIT = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>/* @edit:css */</style></head>
<body><!-- @edit:html --><script>/* @edit:js */</script></body></html>`;

test("injecte chaque code au marqueur de son langage", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".intro { color: red }",
        secondaryLanguage: "html",
        secondaryCode: "<p class=\"intro\">Bonjour</p>",
        preview: GABARIT,
    });

    expect(html).toContain("<style>.intro { color: red }</style>");
    expect(html).toContain("<p class=\"intro\">Bonjour</p>");
    expect(html).not.toContain("@edit");
});

test("injecte le JavaScript au marqueur js", () => {
    const {html} = buildPreviewDocument({
        language: "javascript",
        code: "document.body.dataset.ok = '1';",
        secondaryLanguage: "html",
        secondaryCode: "<p>Bonjour</p>",
        preview: GABARIT,
    });

    expect(html).toContain("document.body.dataset.ok = '1';");
    expect(html).toContain("<p>Bonjour</p>");
});

test("un marqueur sans code correspondant est retiré", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".a { color: red }",
        preview: GABARIT,
    });

    expect(html).not.toContain("@edit");
    expect(html).toContain("<script></script>");
});

test("deux codes de même langage sont concaténés dans l'ordre des panneaux", () => {
    const {html} = buildPreviewDocument({
        language: "css",
        code: ".a { color: red }",
        secondaryLanguage: "css",
        secondaryCode: ".b { color: blue }",
        preview: "<style>/* @edit:css */</style>",
    });

    expect(html).toContain(".a { color: red }\n.b { color: blue }");
});

test("les alias de langage sont appariés aux marqueurs", () => {
    const {html} = buildPreviewDocument({
        language: "js",
        code: "console.log(1);",
        preview: "<script>/* @edit:js */</script>",
    });

    expect(html).toContain("console.log(1);");
});

test("non-régression : un gabarit sans marqueur garde l'assemblage historique", () => {
    const sansMarqueur = {
        language: "css",
        code: ".intro { color: red }",
        preview: "<p class=\"intro\">Bonjour</p>",
    };

    expect(buildPreviewDocument(sansMarqueur).html)
        .toContain("<style>.intro { color: red }</style>");
    expect(buildPreviewDocument(sansMarqueur).html)
        .toContain("<p class=\"intro\">Bonjour</p>");
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: FAIL — les marqueurs restent dans la sortie.

- [ ] **Step 3: Écrire l'implémentation**

```ts
/**
 * Marqueurs d'injection posés dans le gabarit `preview`.
 * Deux syntaxes selon le contexte d'accueil : commentaire de bloc dans
 * `<style>` et `<script>`, commentaire HTML dans le corps du document.
 */
const EDIT_MARKER = /(?:\/\*\s*@edit:([a-z]+)\s*\*\/|<!--\s*@edit:([a-z]+)\s*-->)/gi;

/** Suffixe de marqueur → nom canonique Prism du langage attendu. */
const SUFFIX_TO_CANONICAL: Record<string, string> = {
    css: "css",
    html: "markup",
    js: "javascript",
};

/** Regroupe les codes du bloc par langage canonique, dans l'ordre des panneaux. */
function groupSourcesByLanguage(sources: PreviewSources): Map<string, string[]> {
    const grouped = new Map<string, string[]>();

    const panels: Array<[string | null | undefined, string | null | undefined]> = [
        [sources.language, sources.code],
        [sources.secondaryLanguage, sources.secondaryCode],
    ];

    for (const [language, code] of panels) {
        if (!code) continue;
        const canonical = normalizeLanguage(language);
        const bucket = grouped.get(canonical) ?? [];
        bucket.push(code);
        grouped.set(canonical, bucket);
    }

    return grouped;
}

/** Vrai si le gabarit porte au moins un marqueur d'injection. */
function hasMarkers(template: string): boolean {
    EDIT_MARKER.lastIndex = 0;
    return EDIT_MARKER.test(template);
}

function injectIntoTemplate(template: string, sources: PreviewSources): string {
    const grouped = groupSourcesByLanguage(sources);

    return template.replace(EDIT_MARKER, (_match, blockSuffix, htmlSuffix) => {
        const suffix = String(blockSuffix ?? htmlSuffix).toLowerCase();
        const canonical = SUFFIX_TO_CANONICAL[suffix];
        if (!canonical) return "";
        return (grouped.get(canonical) ?? []).join("\n");
    });
}
```

Puis remplacer le corps de `buildPreviewDocument` :

```ts
export function buildPreviewDocument(sources: PreviewSources): PreviewDocument {
    const template = sources.preview?.trim() ?? "";
    const html = hasMarkers(template)
        ? injectIntoTemplate(template, sources)
        : buildLegacyDocument(sources);

    return {html, needsScripts: false, editable: false};
}
```

- [ ] **Step 4: Lancer le test et vérifier qu'il passe**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: PASS — 16 tests au total.

- [ ] **Step 5: Commit**

```bash
git add src/lib/previewDocument.ts src/lib/previewDocument.test.ts
git commit -m "feat(preview): injecte les codes présentés aux marqueurs @edit du gabarit"
```

---

### Task 4: `needsScripts` et `editable`

**Files:**
- Modify: `src/lib/previewDocument.ts`
- Test: `src/lib/previewDocument.test.ts`

**Interfaces:**
- Produces: champs `needsScripts` et `editable` réellement calculés

- [ ] **Step 1: Écrire le test qui échoue**

```ts
test("needsScripts est vrai dès qu'un panneau porte du JavaScript", () => {
    expect(buildPreviewDocument({
        language: "javascript", code: "alert(1)", preview: "<p>x</p>",
    }).needsScripts).toBe(true);

    expect(buildPreviewDocument({
        language: "css", code: ".a{}", preview: "<p>x</p>",
    }).needsScripts).toBe(false);
});

test("needsScripts ignore un panneau JavaScript vide", () => {
    expect(buildPreviewDocument({
        language: "javascript", code: "", preview: "<p>x</p>",
    }).needsScripts).toBe(false);
});

test("editable exige que TOUS les langages soient exécutables", () => {
    expect(buildPreviewDocument({
        language: "css", code: ".a{}",
        secondaryLanguage: "html", secondaryCode: "<p>x</p>",
        preview: "<p>x</p>",
    }).editable).toBe(true);

    expect(buildPreviewDocument({
        language: "php", code: "<?php echo 1;",
        secondaryLanguage: "html", secondaryCode: "<form></form>",
        preview: "<form></form>",
    }).editable).toBe(false);
});

test("editable est faux sans aperçu", () => {
    expect(buildPreviewDocument({
        language: "css", code: ".a{}",
    }).editable).toBe(false);
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: FAIL — `needsScripts` et `editable` valent toujours `false`.

- [ ] **Step 3: Écrire l'implémentation**

```ts
/** Panneaux réellement renseignés, sous forme [langage, code]. */
function filledPanels(sources: PreviewSources): Array<[string | null | undefined, string]> {
    const panels: Array<[string | null | undefined, string | null | undefined]> = [
        [sources.language, sources.code],
        [sources.secondaryLanguage, sources.secondaryCode],
    ];

    return panels
        .filter((panel): panel is [string | null | undefined, string] => Boolean(panel[1]))
        .map(([language, code]) => [language, code]);
}
```

Puis :

```ts
export function buildPreviewDocument(sources: PreviewSources): PreviewDocument {
    const template = sources.preview?.trim() ?? "";
    const html = hasMarkers(template)
        ? injectIntoTemplate(template, sources)
        : buildLegacyDocument(sources);

    const panels = filledPanels(sources);
    const showPreview = template.length > 0 && panels.some(([language]) => isRunnable(language));

    return {
        html,
        needsScripts: panels.some(([language]) => normalizeLanguage(language) === "javascript"),
        // Conjonctif : un seul langage non exécutable rend l'aperçu trompeur,
        // puisque ce langage resterait inerte quoi que l'étudiant modifie.
        editable: showPreview && panels.every(([language]) => isRunnable(language)),
    };
}
```

- [ ] **Step 4: Lancer le test et vérifier qu'il passe**

Run: `bun test src/lib/previewDocument.test.ts`
Expected: PASS — 20 tests au total.

- [ ] **Step 5: Commit**

```bash
git add src/lib/previewDocument.ts src/lib/previewDocument.test.ts
git commit -m "feat(preview): calcule needsScripts et l'éditabilité conjonctive"
```

---

### Task 5: Schémas et définition du bloc

**Files:**
- Modify: `src/lib/blockSchemas.ts:60-64`
- Modify: `src/lib/blockDefs.ts:238-254`
- Test: `src/lib/blockDefs.test.ts`

**Interfaces:**
- Produces: props `secondaryLanguage` et `secondaryCode` acceptées par la validation et exposées au builder comme au MCP.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter dans `src/lib/blockDefs.test.ts` :

```ts
test("le bloc code-with-preview propose les mêmes langages que le bloc code", () => {
    const codeDef = blockDefs.find((def) => def.type === "code");
    const previewDef = blockDefs.find((def) => def.type === "code-with-preview");

    const codeLangs = codeDef?.fields.find((f) => f.key === "language")?.options;
    const previewLangs = previewDef?.fields.find((f) => f.key === "language")?.options;

    expect(previewLangs).toEqual(codeLangs);
});

test("le second panneau de code est configuré comme le premier", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");
    const secondary = def?.fields.find((field) => field.key === "secondaryCode");

    expect(secondary?.rows).toBe(15);
    expect(def?.fields.find((f) => f.key === "secondaryLanguage")?.type).toBe("select");
});

test("la description du bloc documente les marqueurs pour le MCP", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");

    expect(def?.description).toContain("@edit:");
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `bun test src/lib/blockDefs.test.ts`
Expected: FAIL — les champs et la mention `@edit:` n'existent pas.

- [ ] **Step 3: Écrire l'implémentation**

Dans `src/lib/blockSchemas.ts`, remplacer l'entrée `"code-with-preview"` :

```ts
    "code-with-preview": z.object({
        language: z.string(),
        code: z.string(),
        preview: z.string().optional(),
        secondaryLanguage: z.string().optional(),
        secondaryCode: z.string().optional(),
    }),
```

Dans `src/lib/blockDefs.ts`, remplacer le bloc `code-with-preview` :

```ts
    {
        type: "code-with-preview",
        label: "Code + aperçu",
        category: "Code",
        description:
            "Un ou deux codes affichés avec leur rendu live côte à côte (iframe sandboxée). " +
            "Le champ « Gabarit de l'aperçu » est un document HTML complet ; on y pose des " +
            "marqueurs pour indiquer où injecter chaque code présenté : /* @edit:css */ dans " +
            "un <style>, <!-- @edit:html --> dans le corps, /* @edit:js */ dans un <script>. " +
            "Sans marqueur, le gabarit sert directement de rendu. Les codes deviennent " +
            "modifiables par l'étudiant quand tous les langages du bloc sont exécutables " +
            "par un navigateur (html, css, javascript).",
        defaultProps: {language: "html", code: "", preview: "", secondaryLanguage: "", secondaryCode: ""},
        schema: z.object({
            language: z.string(),
            code: z.string(),
            preview: z.string().optional(),
            secondaryLanguage: z.string().optional(),
            secondaryCode: z.string().optional(),
        }),
        fields: [
            {key: "language", label: "Langage", type: "select", options: ["javascript", "typescript", "html", "css", "php", "sql", "json", "bash", "jsx", "tsx", "rust"]},
            {key: "code", label: "Code", type: "textarea", rows: 15, placeholder: "<button>Cliquez</button>"},
            {key: "secondaryLanguage", label: "Langage du second panneau", type: "select", options: ["javascript", "typescript", "html", "css", "php", "sql", "json", "bash", "jsx", "tsx", "rust"]},
            {key: "secondaryCode", label: "Second code", type: "textarea", rows: 15, placeholder: "<p class=\"intro\">Bonjour</p>"},
            {key: "preview", label: "Gabarit de l'aperçu", type: "textarea", rows: 10, placeholder: "<!doctype html><html lang=\"fr\"><head><style>/* @edit:css */</style></head><body><!-- @edit:html --></body></html>"},
        ],
    },
```

- [ ] **Step 4: Lancer les tests et vérifier qu'ils passent**

Run: `bun test src/lib/blockDefs.test.ts && bunx tsc --noEmit`
Expected: PASS, puis exit 0 pour `tsc`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blockSchemas.ts src/lib/blockDefs.ts src/lib/blockDefs.test.ts
git commit -m "feat(blocks): ajoute le second panneau de code et documente les marqueurs"
```

---

### Task 6: Brancher le rendu sur le nouveau module

**Files:**
- Modify: `src/lib/blockRegistry.tsx:37-68` (supprimer `previewSrcDoc`), `:322-352` (rendu du bloc)
- Modify: `src/components/Cards/CodeWithPreviewCard.tsx`

**Interfaces:**
- Consumes: `buildPreviewDocument` (Task 4)
- Produces: `CodeWithPreviewCard` accepte `panels: CodePanelData[]` et `sources?: PreviewSources`
  ```ts
  interface CodePanelData { language: string; code: string; }
  ```

- [ ] **Step 1: Réécrire le rendu du registre**

Supprimer entièrement `previewSrcDoc` (`blockRegistry.tsx:37-68`) et son import devenu inutile. Remplacer l'entrée `"code-with-preview"` :

```tsx
    "code-with-preview": {
        icon: Eye,
        render: ({language, code, secondaryLanguage, secondaryCode, preview, currentModule}: BlockRenderProps) => {
            const panels = [
                {language: String(language ?? "html"), code: String(code ?? "")},
                {language: String(secondaryLanguage ?? ""), code: String(secondaryCode ?? "")},
            ].filter((panel) => panel.code.length > 0);

            const previewValue = typeof preview === "string" ? preview.trim() : "";

            if (!previewValue) {
                if (panels.length <= 1) {
                    return (
                        <CodeCard language={panels[0]?.language ?? "html"} currentModule={currentModule as Module | undefined}>
                            {panels[0]?.code ?? ""}
                        </CodeCard>
                    );
                }
                return (
                    <CodeWithPreviewCard panels={panels} currentModule={currentModule as Module | undefined}/>
                );
            }

            return (
                <CodeWithPreviewCard
                    panels={panels}
                    sources={{
                        language: String(language ?? "html"),
                        code: String(code ?? ""),
                        secondaryLanguage: String(secondaryLanguage ?? ""),
                        secondaryCode: String(secondaryCode ?? ""),
                        preview: previewValue,
                    }}
                    currentModule={currentModule as Module | undefined}
                />
            );
        },
    },
```

- [ ] **Step 2: Adapter le composant**

Dans `CodeWithPreviewCard.tsx`, remplacer la détection par `typeof children === 'string'` par des props explicites. Le composant construit lui-même l'iframe :

```tsx
"use client";

import {useMemo, useState} from "react";
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon, Code2, Eye} from "lucide-react";
import {SyntaxHighlighter, normalizeLanguage, courseCodeDark, courseCodeLight} from "@/lib/syntaxHighlighter";
import {buildPreviewDocument, type PreviewSources} from "@/lib/previewDocument";
import {cn} from "@/lib/utils";
import type Module from "@/types/Module";

export interface CodePanelData {
    language: string;
    code: string;
}

interface CodeWithPreviewCardProps {
    panels: CodePanelData[];
    /** Absent → carte sans aperçu : uniquement les panneaux de code. */
    sources?: PreviewSources;
    className?: string;
    currentModule?: Module;
}

export default function CodeWithPreviewCard({panels, sources, className, currentModule}: CodeWithPreviewCardProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Nommé `previewDoc`, jamais `document` : ce nom masquerait le `document`
    // global du DOM à l'intérieur du composant.
    const previewDoc = useMemo(() => (sources ? buildPreviewDocument(sources) : null), [sources]);

    const handleCopy = (code: string, index: number) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const codePanels = panels.map((panel, index) => (
        <div key={index} className="flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-bridge-400/40 px-3 py-1.5 dark:border-bridge-600/40">
                <span className="text-xs font-mono uppercase text-bridge-500 dark:text-bridge-400">
                    {panel.language.toLowerCase()}
                </span>
                <button
                    onClick={() => handleCopy(panel.code, index)}
                    className="flex items-center gap-1.5 text-xs text-bridge-500 hover:text-bridge-800 dark:text-bridge-400 dark:hover:text-bridge-100"
                    aria-label={`Copier le code ${panel.language}`}
                >
                    <ClipboardCopyIcon className="w-3.5 h-3.5"/>
                    {copiedIndex === index ? "Copié !" : "Copier"}
                </button>
            </div>
            <div className="block dark:hidden">
                <SyntaxHighlighter
                    style={courseCodeLight}
                    language={normalizeLanguage(panel.language)}
                    customStyle={{margin: 0, fontSize: "0.8125rem", lineHeight: "1.65", background: "transparent"}}
                    showLineNumbers
                >
                    {panel.code}
                </SyntaxHighlighter>
            </div>
            <div className="hidden dark:block">
                <SyntaxHighlighter
                    style={courseCodeDark}
                    language={normalizeLanguage(panel.language)}
                    customStyle={{margin: 0, fontSize: "0.8125rem", lineHeight: "1.65", background: "transparent"}}
                    showLineNumbers
                >
                    {panel.code}
                </SyntaxHighlighter>
            </div>
        </div>
    ));

    const content = (
        <div className="flex h-full">
            <div className="flex-1 min-w-0 divide-y divide-bridge-400/40 overflow-x-auto border-r border-bridge-400/40 dark:divide-bridge-600/40 dark:border-bridge-600/40">
                {codePanels}
            </div>
            {/* La colonne d'aperçu n'existe que si `sources` a produit un document :
                un bloc à deux codes sans preview (ex. PHP + HTML) n'a pas d'iframe. */}
            {previewDoc && (
                <div className="code-with-preview-preview flex-1 min-w-0 overflow-auto p-0 text-left">
                    <iframe
                        srcDoc={previewDoc.html}
                        sandbox={previewDoc.needsScripts ? "allow-scripts" : ""}
                        title="Aperçu du code"
                        className="w-full border-0 bg-white"
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className={cn("course-code-card my-8 sm:my-10", className)}>
            <BaseCard content={content} currentModule={currentModule} withLed={false} withHover={false} withMarge={false}/>
        </div>
    );
}
```

> `allow-scripts` **sans** `allow-same-origin` : combinées, ces deux valeurs permettraient au script de retirer son propre sandbox.
>
> Le rendu ci-dessus omet le `headerCard` et le jeu d'onglets mobile de l'original pour rester lisible dans ce plan — les reprendre de la version actuelle du fichier (bandeau de langage, bouton Copier, bascule `mobileTab` sous 640px) en les adaptant à N panneaux au lieu d'un seul. Le point non négociable est celui que ce step corrige : pas de variable nommée `document`, et la colonne d'aperçu conditionnée à `previewDoc`.

- [ ] **Step 3: Vérifier la compilation et la non-régression**

Run: `bunx tsc --noEmit && bun test && bunx eslint .`
Expected: exit 0 pour les trois.

- [ ] **Step 4: Vérifier le rendu dans le navigateur**

Démarrer `bunx next dev`, ouvrir `/html-css/1-rappel-de-html/cours`, puis exécuter dans la console :

```js
const p = [...document.querySelectorAll('.code-with-preview-preview')];
`aperçus=${p.length} hauteurZéro=${p.filter(e => e.getBoundingClientRect().height === 0).length}`
```

Expected: `aperçus=24 hauteurZéro=0`, et les rendus visibles à droite de chaque code, identiques à avant le changement.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blockRegistry.tsx src/components/Cards/CodeWithPreviewCard.tsx
git commit -m "refactor(preview): déplace l'iframe dans le composant client"
```

---

### Task 7: Thème Monaco dérivé du thème de code maison

**Files:**
- Create: `src/lib/monacoTheme.ts`
- Read only: `src/lib/codeTheme.ts` (source des couleurs)

**Interfaces:**
- Produces: `courseMonacoLight` / `courseMonacoDark` (objets `editor.IStandaloneThemeData`), et `MONACO_THEME_LIGHT` / `MONACO_THEME_DARK` (noms à passer à `<MonacoEditor theme=…>`).

- [ ] **Step 1: Exporter les palettes depuis `codeTheme.ts`**

Les constantes `LIGHT` et `DARK` (`codeTheme.ts:21` et `:39`) sont privées. Les exporter pour qu'il n'existe qu'une seule source de couleurs :

```ts
export const CODE_PALETTE_LIGHT = LIGHT;
export const CODE_PALETTE_DARK = DARK;
```

Ne modifier **aucune** valeur : chaque couleur est mesurée contre le fond réellement peint, avec son ratio en commentaire.

- [ ] **Step 2: Écrire le module**

```ts
import type {editor} from "monaco-editor";
import {CODE_PALETTE_LIGHT, CODE_PALETTE_DARK} from "@/lib/codeTheme";

/**
 * Thème Monaco dérivé de `codeTheme.ts`.
 *
 * Les thèmes livrés avec Monaco reproduisent le défaut qui avait fait
 * abandonner One Light / One Dark côté Prism : contrastes sous 4.5:1 et bleu
 * froid proscrit par DESIGN.md. On dérive donc du thème maison pour que le
 * passage lecture → édition ne change pas les couleurs sous l'œil du lecteur.
 */
export const MONACO_THEME_LIGHT = "cours-iut-light";
export const MONACO_THEME_DARK = "cours-iut-dark";

/** Monaco attend des couleurs sans `#`. */
const hex = (color: string) => color.replace("#", "");

function buildTheme(
    palette: typeof CODE_PALETTE_LIGHT,
    base: "vs" | "vs-dark",
    background: string,
): editor.IStandaloneThemeData {
    return {
        base,
        inherit: true,
        rules: [
            {token: "", foreground: hex(palette.base)},
            {token: "comment", foreground: hex(palette.muted), fontStyle: "italic"},
            {token: "delimiter", foreground: hex(palette.punctuation)},
            {token: "keyword", foreground: hex(palette.keyword)},
            {token: "tag", foreground: hex(palette.keyword)},
            {token: "attribute.name", foreground: hex(palette.property)},
            {token: "attribute.value", foreground: hex(palette.string)},
            {token: "string", foreground: hex(palette.string)},
            {token: "number", foreground: hex(palette.number)},
            {token: "type", foreground: hex(palette.fn)},
        ],
        colors: {
            "editor.background": background,
            "editor.foreground": palette.base,
            "editorLineNumber.foreground": palette.lineNumber,
        },
    };
}

export const courseMonacoLight = buildTheme(CODE_PALETTE_LIGHT, "vs", "#f7ebd9");
export const courseMonacoDark = buildTheme(CODE_PALETTE_DARK, "vs-dark", "#352418");
```

> Les fonds `#f7ebd9` (bridge-50) et `#352418` sont ceux contre lesquels les ratios de `codeTheme.ts` ont été mesurés. Les changer invaliderait les contrastes documentés.

- [ ] **Step 3: Vérifier la compilation**

Run: `bunx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/monacoTheme.ts
git commit -m "feat(builder): thème Monaco aligné sur le thème de code maison"
```

---

### Task 8: Champ builder de type `code`

**Files:**
- Create: `src/components/builder/CodeField.tsx`
- Modify: `src/lib/blockDefs.ts:14-25` (type `FieldDef`), puis `:249-253` (champs du bloc)
- Modify: `src/components/builder/DynamicPropsEditor.tsx` (routage du nouveau type)
- Test: `src/components/builder/DynamicPropsEditor.test.tsx`

**Interfaces:**
- Consumes: `MONACO_THEME_LIGHT` / `MONACO_THEME_DARK` (Task 7)
- Produces: `FieldDef.type` accepte `"code"`, plus deux propriétés :
  ```ts
  languageFrom?: string;   // clé de la prop portant le langage
  language?: string;       // langage fixe (gabarit : "html")
  ```

- [ ] **Step 1: Étendre le type `FieldDef`**

Dans `src/lib/blockDefs.ts:14-25` :

```ts
    type: "text" | "textarea" | "number" | "select" | "boolean" | "array-of-strings" | "image-upload" | "lucide-icon" | "code";
    /** Champ `code` : clé de la prop qui porte le langage à colorer. */
    languageFrom?: string;
    /** Champ `code` : langage fixe, quand il ne dépend d'aucune autre prop. */
    language?: string;
```

- [ ] **Step 2: Écrire le composant**

`CodeField.tsx` monte Monaco en `dynamic(..., {ssr: false})` — Monaco n'est pas SSR-safe, comme le rappelle déjà `CodeEditorModal.tsx:7`. Désactiver le correcteur orthographique, qui souligne actuellement le code en rouge dans les textarea.

- [ ] **Step 3: Écrire le test de routage qui échoue**

Ajouter dans `src/components/builder/DynamicPropsEditor.test.tsx`, en suivant le pattern déjà présent dans ce fichier :

```tsx
test("route les champs de type code vers l'éditeur coloré", () => {
    const fields: FieldDef[] = [
        {key: "code", label: "Code", type: "code", languageFrom: "language", rows: 15},
    ];

    const html = renderToStaticMarkup(
        <DynamicPropsEditor
            fields={fields}
            props={{language: "css", code: ".intro { color: red }"}}
            onChange={() => {}}
        />
    );

    expect(html).toContain("data-code-field");
    expect(html).toContain('data-language="css"');
});
```

Run: `bun test src/components/builder/DynamicPropsEditor.test.tsx`
Expected: FAIL — le type `code` n'est pas routé.

- [ ] **Step 4: Router le type dans le panneau Propriétés**

Ajouter la branche `case "code":` là où les autres types sont rendus, en résolvant le langage :
`field.language ?? String(props[field.languageFrom ?? ""] ?? "text")`.

`CodeField` doit poser `data-code-field` et `data-language` sur son conteneur — Monaco étant chargé côté client, ce sont ces attributs que le rendu statique peut vérifier.

Run: `bun test src/components/builder/DynamicPropsEditor.test.tsx`
Expected: PASS.

- [ ] **Step 5: Basculer les champs du bloc**

Dans `blockDefs.ts`, remplacer pour `code-with-preview` :

```ts
            {key: "code", label: "Code", type: "code", languageFrom: "language", rows: 15},
            {key: "secondaryCode", label: "Second code", type: "code", languageFrom: "secondaryLanguage", rows: 15},
            {key: "preview", label: "Gabarit de l'aperçu", type: "code", language: "html", rows: 10},
```

- [ ] **Step 6: Vérifier**

Run: `bunx tsc --noEmit && bun test && bunx eslint .`
Puis ouvrir `/admin/content/html-css/1-rappel-de-html/cours`, sélectionner un bloc « Code + aperçu » et vérifier que les trois champs sont colorés et sans soulignement orthographique.

- [ ] **Step 7: Commit**

```bash
git add src/components/builder/CodeField.tsx src/lib/blockDefs.ts
git commit -m "feat(builder): champ de saisie de code coloré, réutilisable par tous les blocs"
```

---

### Task 9: Édition par l'étudiant

**Files:**
- Modify: `src/components/Cards/CodeWithPreviewCard.tsx`

**Interfaces:**
- Consumes: `buildPreviewDocument` (Task 4), thème Monaco (Task 7)

- [ ] **Step 1: Ajouter l'état d'édition**

L'état est indexé par **clé de champ** (`"code"` ou `"secondaryCode"`), jamais par position
dans `panels` : ce tableau est filtré (Task 6 retire les panneaux vides), donc son index ne
correspond pas de façon fiable à la source d'origine dans `sources` — un bloc dont seul le
panneau secondaire est rempli mettrait le CSS présenté à l'index 0 du tableau affiché.

```tsx
type EditableField = "code" | "secondaryCode";

const [edited, setEdited] = useState<Partial<Record<EditableField, string>>>({});
const isDirty = Object.keys(edited).length > 0;

// Association panneau affiché → clé de champ dans `sources`, dans l'ordre où
// Task 6 les construit (primaire puis secondaire, avant filtrage des vides).
const fieldForPanel: EditableField[] = ["code", "secondaryCode"]
    .filter((_, i) => panels[i] !== undefined) as EditableField[];
```

- [ ] **Step 2: Recalculer l'aperçu avec debounce**

L'aperçu se recalcule 300 ms après la dernière frappe, à partir des valeurs courantes — pas
des valeurs d'origine — en fusionnant `edited` par-dessus `sources` avant de rappeler
`buildPreviewDocument` :

```tsx
const effectiveSources: PreviewSources | undefined = sources && {
    ...sources,
    code: edited.code ?? sources.code,
    secondaryCode: edited.secondaryCode ?? sources.secondaryCode,
};
```

Passer `effectiveSources` (debounced) à `useMemo` à la place de `sources` pour le calcul de
`previewDoc`. `sources` (non debounced) continue de déterminer si la colonne d'aperçu existe
et si les boutons « Modifier » apparaissent — seul le contenu envoyé à l'iframe suit la
frappe avec retard.

- [ ] **Step 3: Boutons**

Bouton « Modifier » par panneau affiché (visible seulement si `sources` existe et que
`buildPreviewDocument(sources).editable` est vrai), qui charge Monaco pour la clé de champ
associée via `fieldForPanel[index]`. Bouton « Réinitialiser » sur la carte, visible
seulement si `isDirty`, qui vide `edited`.

- [ ] **Step 4: Vérifier dans le navigateur**

Sur un bloc éditable : modifier le code, constater que l'aperçu change ; cliquer « Réinitialiser », constater le retour à l'original ; recharger la page, constater qu'aucune modification n'a été conservée.

Vérifier aussi qu'un bloc PHP + HTML n'affiche **aucun** bouton « Modifier ».

- [ ] **Step 5: Commit**

```bash
git add src/components/Cards/CodeWithPreviewCard.tsx
git commit -m "feat(preview): permet à l'étudiant de modifier le code et voir le rendu"
```

---

### Task 10: Copie pour l'IA

**Files:**
- Modify: `src/lib/blockTextUtils.ts:55-56` et `:324-332`

- [ ] **Step 1: Écrire le test qui échoue**

Créer `src/lib/blockTextUtils.test.ts` (le fichier n'existe pas encore) :

```ts
import {test, expect} from "bun:test";
import {blocksToMarkdown, extractTextFields} from "@/lib/blockTextUtils";
import type {Block} from "@/types/CourseContent";

const bloc = {
    id: "b1",
    type: "code-with-preview",
    props: {
        language: "css",
        code: ".a { color: red }",
        secondaryLanguage: "html",
        secondaryCode: "<p>Bonjour</p>",
    },
} as unknown as Block;

test("la copie Markdown inclut le second panneau de code", () => {
    const texte = blocksToMarkdown([bloc]);

    expect(texte).toContain(".a { color: red }");
    expect(texte).toContain("<p>Bonjour</p>");
});

test("la recherche indexe le second panneau de code", () => {
    expect(extractTextFields(bloc)).toContain("<p>Bonjour</p>");
});
```

> `blocksToMarkdown(blocks: Block[], includeLimitations = false)` prend un **tableau** de blocs — vérifié à `blockTextUtils.ts:432`.

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `bun test src/lib/blockTextUtils.test.ts`
Expected: FAIL — le second code est absent.

- [ ] **Step 3: Implémenter**

Ajouter `str(p.secondaryCode)` à la liste retournée pour `case "code-with-preview"` (ligne 55), et un second bloc de code balisé dans la sérialisation Markdown (ligne 324).

- [ ] **Step 4: Vérifier**

Run: `bun test && bunx tsc --noEmit && bunx eslint . && bunx next build`
Expected: exit 0 partout.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blockTextUtils.ts src/lib/blockTextUtils.test.ts
git commit -m "feat(copy): inclut le second code dans la copie pour l'IA"
```

---

## Vérification finale

- [ ] `bun test` — tous les tests passent, dont la non-régression de Task 3
- [ ] `bunx tsc --noEmit` — exit 0
- [ ] `bunx eslint .` — exit 0
- [ ] `bunx next build` — exit 0
- [ ] `/html-css/1-rappel-de-html/cours` : 24 aperçus, aucun à hauteur zéro
- [ ] Un bloc `php` + `html` : deux codes empilés, aucun bouton « Modifier »
- [ ] `/admin/content/...` : les trois champs de code sont colorés
