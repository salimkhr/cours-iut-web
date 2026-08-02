# Optimisations performance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réduire le poids du bundle client des pages de cours et le coût serveur par requête, sans changement fonctionnel ni visuel.

**Architecture :** Trois axes indépendants. (1) *Bundle* — sortir Mermaid, l'éditeur de tableau et les 250+ langages de Prism du chemin de rendu étudiant, et supprimer un doublon de moteur d'animation. (2) *Serveur/DB* — arrêter de charger tous les modules complets à chaque rendu de layout, indexer `modules.path`, remplacer les boucles d'`updateOne` par des `bulkWrite`. (3) *Hygiène* — casser deux cycles d'import type-only et déclarer `optimizePackageImports`.

**Tech Stack :** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, MongoDB driver 7, `bun test`, Tailwind v4.

---

## Contexte de départ (constats vérifiés)

| # | Constat | Preuve |
|---|---|---|
| 1 | `BlockRenderer` (rendu étudiant, toutes les pages de cours en DB) → `blockRegistry.tsx` qui importe **statiquement** `mermaid` via `DiagramCard` | `src/lib/blockRegistry.tsx:13`, `src/components/Cards/DiagramCard.tsx:3` |
| 2 | Idem pour `TableBlockEditor` (éditeur du builder admin) | `src/lib/blockRegistry.tsx:27,187` |
| 3 | Le champ `editor` de la `BlockDefinition` **n'a aucun consommateur** : `grep -rn '\.editor\b' src` ne retourne que la définition | vérifié |
| 4 | 3 composants importent `{Prism as SyntaxHighlighter}` (= refractor + tous les langages) et le **barrel** de styles (~200 thèmes) | `CodeCard.tsx:6-7`, `CodeWithPreviewCard.tsx:5-6`, `InputCard.tsx:6,9` |
| 5 | Langages réellement utilisés dans `src/cours` : php(177), javascript(154), html(70), twig(28), bash(16), typescript(10), js(6), json(5), sql(4), css(3), txt/text(4), jsx(2), brainfuck(1), SH(1) | `grep -rhoE 'language="[a-z]+"' src/cours` |
| 6 | `framer-motion@12.40.0` **et** `motion@12.40.0` installés, même moteur, 4 fichiers vs ~35 | `package.json:71,78` |
| 7 | `HeaderSvg.tsx` (175 Ko) : **0 importateur** dans le graphe GitNexus | `cypher` sur les arêtes `IMPORTS` |
| 8 | `getModules()` fait un `find()` sans projection, appelé depuis `layout.tsx` (donc chaque page) alors que le layout n'utilise que `path` + `colorLight` | `src/lib/getModules.ts:10`, `src/app/layout.tsx:40`, `src/lib/generateModuleThemeCss.ts:7` |
| 9 | `/api/admin/import` : `findOne` + `updateOne` séquentiels par module, puis `updateOne` par contenu | `src/app/api/admin/import/route.ts:126,141,163` |
| 10 | 3 cycles d'import détectés par `gitnexus check` | voir Tâches 5 et 10 |

**Correction à mon audit initial :** les 3 cycles sont tous des cycles **type-only** (`import type`). TypeScript les efface à la compilation — ils ne bloquent donc **pas** le tree-shaking. Le gain est en robustesse et lisibilité, pas en performance. Les tâches correspondantes sont classées en dernier.

**Hors périmètre (décision utilisateur) :** `FooterSvg.tsx` (236 Ko, importé par `SlideTitle`) reste inchangé.

---

## Structure des fichiers

**Créés**
- `src/lib/syntaxHighlighter.ts` — instance `PrismLight` unique + enregistrement des 11 langages du projet + `normalizeLanguage()`. Responsabilité : être le seul point d'entrée de la coloration syntaxique.
- `src/lib/syntaxHighlighter.test.ts` — couverture des alias et de la liste des langages.
- `src/components/Cards/DiagramSkeleton.tsx` — squelette de chargement extrait de `DiagramCard`, sans dépendance à Mermaid (sinon le `loading:` de `next/dynamic` retirerait tout l'intérêt du split).
- `src/lib/admin/importOps.ts` — construction pure des opérations `bulkWrite` d'import.
- `src/lib/admin/importOps.test.ts` — tests de `importOps`.
- `src/lib/getModules.test.ts` — test de la projection thème.
- `src/lib/db/indexes.ts` — création idempotente des index Mongo (emplacement prévu par CLAUDE.md §6).
- `src/scripts/create-indexes.ts` — runner du script d'index.
- `src/components/admin/adminTypes.ts` — `ModuleOption`, pour casser le cycle `AdminToolsPanel` ↔ `ExportImportSheet`.
- `src/types/blocks.ts` — `BlockRenderProps` / `BlockEditorProps`, pour casser le cycle `blockRegistry` ↔ `TableBlockEditor`.

**Modifiés**
- `src/lib/blockRegistry.tsx` — `DiagramCard` et `TableBlockEditor` en `next/dynamic` ; `BlockEditorProps` / `BlockRenderProps` déplacés vers `src/types/blocks.ts` et réexportés.
- `src/components/Cards/{CodeCard,CodeWithPreviewCard,InputCard}.tsx` — consomment `@/lib/syntaxHighlighter`.
- `src/components/Cards/DiagramCard.tsx` — utilise `DiagramSkeleton` extrait.
- `src/components/Slides/ui/SlideDiagram.tsx` — Mermaid en import dynamique.
- `src/components/Cards/{BaseCard,ModuleCard,SectionCard,ContentCard}.tsx` — `framer-motion` → `motion/react`.
- `src/lib/getModules.ts` — ajout de `fetchModulesTheme` / `getModulesTheme`.
- `src/app/layout.tsx` — consomme `getModulesTheme`.
- `src/app/api/admin/import/route.ts` — `bulkWrite`.
- `src/components/admin/{AdminToolsPanel,ExportImportSheet}.tsx`, `src/components/admin/users/EditUserDialog.tsx` — cycles.
- `next.config.ts` — `optimizePackageImports`.
- `package.json` — retrait de `framer-motion`, ajout du script `create-indexes`.
- `CLAUDE.md` — §3 (script), §6 (index).

**Supprimé**
- `src/components/HeaderSvg.tsx` (175 Ko, code mort).

---

### Tâche 0 : Baseline mesurée et branche de travail

Sans chiffre de départ, aucune des tâches suivantes n'est vérifiable. Cette tâche est obligatoire.

**Files:** aucun fichier modifié.

- [ ] **Step 1 : Créer la branche depuis `staging`**

```bash
git checkout staging
git pull
git checkout -b perf/bundle-et-db
```

- [ ] **Step 2 : Construire et capturer la baseline**

```bash
bun run build 2>&1 | tee /tmp/baseline-build.txt
```

Attendu : build en succès, suivi du tableau `Route (app) / Size / First Load JS`.

- [ ] **Step 3 : Archiver les chiffres qui serviront de référence**

Relever et noter dans le message de commit de la Tâche 12 les trois lignes suivantes du tableau :
- `/[moduleSlug]/[sectionSlug]/[contentSlug]`
- `/[moduleSlug]/[sectionSlug]/slide`
- `First Load JS shared by all`

```bash
grep -E 'contentSlug|slide|First Load JS shared' /tmp/baseline-build.txt
```

Attendu : trois lignes avec des tailles en kB. Si le build échoue, s'arrêter ici et corriger avant toute autre tâche : toutes les mesures suivantes en dépendent.

---

### Tâche 1 : Supprimer `HeaderSvg.tsx` (code mort, 175 Ko)

**Files:**
- Delete: `src/components/HeaderSvg.tsx`

- [ ] **Step 1 : Confirmer l'absence de référence**

```bash
grep -rn "HeaderSvg" src/ scripts/ docs/ 2>/dev/null
```

Attendu : **aucune sortie** (le seul fichier concerné est celui à supprimer, dont le nom n'apparaît pas dans son propre contenu). Si une référence apparaît, ne pas supprimer et signaler.

- [ ] **Step 2 : Supprimer**

```bash
git rm src/components/HeaderSvg.tsx
```

- [ ] **Step 3 : Vérifier que le typecheck et le lint passent**

```bash
bun run lint
```

Attendu : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git commit -m "chore(perf): supprime HeaderSvg, composant mort de 175 Ko

Aucun importateur dans le graphe de dépendances.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 2 : Module de coloration syntaxique partagé (TDD)

`{Prism as SyntaxHighlighter}` embarque refractor et l'intégralité des langages Prism ; `from '.../styles/prism'` embarque le barrel des ~200 thèmes. On remplace les deux par un module unique.

**Files:**
- Create: `src/lib/syntaxHighlighter.ts`
- Test: `src/lib/syntaxHighlighter.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `src/lib/syntaxHighlighter.test.ts` :

```ts
import { describe, expect, test } from "bun:test";
import { REGISTERED_LANGUAGES, normalizeLanguage } from "@/lib/syntaxHighlighter";

describe("normalizeLanguage", () => {
    test("mappe les alias du projet vers un langage enregistré", () => {
        expect(normalizeLanguage("html")).toBe("markup");
        expect(normalizeLanguage("xml")).toBe("markup");
        expect(normalizeLanguage("js")).toBe("javascript");
        expect(normalizeLanguage("ts")).toBe("typescript");
        expect(normalizeLanguage("sh")).toBe("bash");
        expect(normalizeLanguage("SH")).toBe("bash");
        expect(normalizeLanguage("shell")).toBe("bash");
        expect(normalizeLanguage("yml")).toBe("yaml");
    });

    test("laisse passer un langage déjà canonique", () => {
        expect(normalizeLanguage("php")).toBe("php");
        expect(normalizeLanguage("twig")).toBe("twig");
        expect(normalizeLanguage("brainfuck")).toBe("brainfuck");
    });

    test("renvoie 'text' pour un langage inconnu ou vide", () => {
        expect(normalizeLanguage("cobol")).toBe("text");
        expect(normalizeLanguage("txt")).toBe("text");
        expect(normalizeLanguage("")).toBe("text");
    });
});

describe("REGISTERED_LANGUAGES", () => {
    test("couvre tous les langages utilisés dans les cours", () => {
        // Relevé par: grep -rhoE 'language="[a-zA-Z]+"' src/cours | sort -u
        const utilises = [
            "php", "javascript", "html", "twig", "bash", "typescript",
            "js", "json", "sql", "css", "jsx", "brainfuck", "sh", "xml",
        ];
        for (const lang of utilises) {
            expect(REGISTERED_LANGUAGES).toContain(normalizeLanguage(lang));
        }
    });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
bun test src/lib/syntaxHighlighter.test.ts
```

Attendu : ÉCHEC — `Cannot find module '@/lib/syntaxHighlighter'`.

- [ ] **Step 3 : Écrire l'implémentation**

Créer `src/lib/syntaxHighlighter.ts` :

```ts
import { PrismLight } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import brainfuck from "react-syntax-highlighter/dist/esm/languages/prism/brainfuck";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import twig from "react-syntax-highlighter/dist/esm/languages/prism/twig";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import oneDarkStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLightStyle from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

/**
 * Point d'entrée unique de la coloration syntaxique.
 *
 * On utilise `PrismLight` (et non `Prism`) : l'export `Prism` embarque refractor
 * avec ses ~290 langages, soit plusieurs centaines de Ko dans le bundle client de
 * chaque page de cours. `PrismLight` n'embarque que les langages enregistrés ici.
 * Idem pour les thèmes : import direct du fichier plutôt que du barrel
 * `styles/prism` qui tire les ~200 thèmes.
 */
const LANGUAGE_MODULES = {
    bash,
    brainfuck,
    css,
    javascript,
    json,
    jsx,
    markup,
    php,
    sql,
    twig,
    typescript,
    yaml,
} as const;

for (const [name, definition] of Object.entries(LANGUAGE_MODULES)) {
    PrismLight.registerLanguage(name, definition);
}

export const REGISTERED_LANGUAGES: readonly string[] = Object.keys(LANGUAGE_MODULES);

/** Alias employés dans les contenus pédagogiques → nom canonique Prism. */
const ALIASES: Record<string, string> = {
    html: "markup",
    xml: "markup",
    svg: "markup",
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
};

/**
 * Ramène un langage saisi dans un cours vers un langage enregistré.
 * Tout ce qui n'est pas reconnu retombe sur "text" : Prism affiche alors le code
 * sans coloration au lieu de logger un avertissement à chaque rendu.
 */
export function normalizeLanguage(language: string): string {
    const key = (language ?? "").trim().toLowerCase();
    if (!key) return "text";
    const canonical = ALIASES[key] ?? key;
    return REGISTERED_LANGUAGES.includes(canonical) ? canonical : "text";
}

export { PrismLight as SyntaxHighlighter };
export const oneDark = oneDarkStyle;
export const oneLight = oneLightStyle;
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
bun test src/lib/syntaxHighlighter.test.ts
```

Attendu : PASS — 3 tests dans `normalizeLanguage`, 1 dans `REGISTERED_LANGUAGES`.

- [ ] **Step 5 : Commit**

```bash
git add src/lib/syntaxHighlighter.ts src/lib/syntaxHighlighter.test.ts
git commit -m "feat(perf): module de coloration syntaxique a langages restreints

PrismLight + 12 langages du projet au lieu de Prism complet, et import
direct des deux themes au lieu du barrel styles/prism.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 3 : Brancher les trois cartes sur le module partagé

**Files:**
- Modify: `src/components/Cards/CodeCard.tsx:6-7,148`
- Modify: `src/components/Cards/CodeWithPreviewCard.tsx:5-6`
- Modify: `src/components/Cards/InputCard.tsx:6,9,117`

- [ ] **Step 1 : Analyse d'impact préalable (règle CLAUDE.md)**

```bash
# via MCP GitNexus
impact({target: "CodeCard", direction: "upstream", repo: "cours-iut-web", summaryOnly: true})
```

Attendu : fan-in élevé (utilisé dans tout `src/cours` et le `blockRegistry`). C'est un composant hub — la signature publique `CodeCardProps` ne doit **pas** changer. Signaler le niveau de risque avant de poursuivre.

- [ ] **Step 2 : `CodeCard.tsx` — remplacer les imports**

Remplacer les lignes 6-7 :

```tsx
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark, oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism';
```

par :

```tsx
import {SyntaxHighlighter, normalizeLanguage, oneDark, oneLight} from '@/lib/syntaxHighlighter';
```

- [ ] **Step 3 : `CodeCard.tsx` — normaliser le langage passé au highlighter**

Dans `sharedHighlighterProps` (ligne 147-148), remplacer :

```tsx
    const sharedHighlighterProps = {
        language,
```

par :

```tsx
    const sharedHighlighterProps = {
        language: normalizeLanguage(language),
```

Ne pas toucher aux autres usages de `language` dans le fichier : `getMimeType(language)` (ligne 66), l'affichage de l'onglet (lignes 81, 86) et `data-code-lang` (ligne 200) doivent conserver la valeur d'origine saisie par l'enseignant.

- [ ] **Step 4 : `CodeWithPreviewCard.tsx` — remplacer les imports**

Remplacer les lignes 5-6 :

```tsx
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark, oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
```

par :

```tsx
import {SyntaxHighlighter, normalizeLanguage, oneDark, oneLight} from '@/lib/syntaxHighlighter';
```

- [ ] **Step 5 : `CodeWithPreviewCard.tsx` — normaliser le langage**

Localiser l'unique usage `language={language}` sur le composant `<SyntaxHighlighter>` :

```bash
grep -n 'language=' src/components/Cards/CodeWithPreviewCard.tsx
```

Sur la ligne trouvée qui est une prop de `<SyntaxHighlighter>`, remplacer `language={language}` par `language={normalizeLanguage(language)}`.

- [ ] **Step 6 : `InputCard.tsx` — remplacer les imports**

Supprimer les lignes 6 et 9 :

```tsx
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
...
import {oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
```

et ajouter à la place, après la ligne 5 :

```tsx
import {SyntaxHighlighter, normalizeLanguage, oneLight} from '@/lib/syntaxHighlighter';
```

- [ ] **Step 7 : `InputCard.tsx` — normaliser le langage**

Ligne 117, remplacer :

```tsx
                    language={language}
```

par :

```tsx
                    language={normalizeLanguage(language)}
```

- [ ] **Step 8 : Vérifier lint + typecheck**

```bash
bun run lint
```

Attendu : aucune erreur. En particulier aucun import inutilisé restant de `react-syntax-highlighter`.

- [ ] **Step 9 : Vérifier qu'aucun import direct ne subsiste**

```bash
grep -rn "react-syntax-highlighter" src/ --include=*.tsx --include=*.ts | grep -v "src/lib/syntaxHighlighter.ts"
```

Attendu : seule sortie tolérée, les deux lignes **commentées** de `src/app/mdx-components.tsx:2-3`. Les supprimer par la même occasion (code mort commenté).

- [ ] **Step 10 : Vérification visuelle**

```bash
bun dev
```

Ouvrir `http://localhost:3000/php/1-introduction-au-php/cours` et vérifier :
1. Le code PHP est coloré (mots-clés en couleur, pas de bloc monochrome).
2. Basculer en thème sombre : la coloration change de palette.
3. Ouvrir un cours HTML (`/html-css/6-rappel-de-html/cours`) : les balises sont colorées.
4. Console navigateur : aucun avertissement `Language ... not registered`.

- [ ] **Step 11 : Commit**

```bash
git add src/components/Cards/CodeCard.tsx src/components/Cards/CodeWithPreviewCard.tsx src/components/Cards/InputCard.tsx src/app/mdx-components.tsx
git commit -m "perf(cards): branche les cartes de code sur PrismLight

Retire l'import de Prism complet (~290 langages) et du barrel de themes
dans les trois cartes de code.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 4 : Charger Mermaid à la demande

Mermaid v11 pèse plusieurs centaines de Ko. Il est aujourd'hui dans le bundle de **toute** page de cours, y compris celles sans aucun diagramme.

**Files:**
- Create: `src/components/Cards/DiagramSkeleton.tsx`
- Modify: `src/components/Cards/DiagramCard.tsx:16-30`
- Modify: `src/lib/blockRegistry.tsx:13`
- Modify: `src/components/Slides/ui/SlideDiagram.tsx:3`

- [ ] **Step 1 : Extraire le squelette dans son propre fichier**

Créer `src/components/Cards/DiagramSkeleton.tsx` avec le contenu exact de la fonction actuellement interne à `DiagramCard.tsx:16-30` :

```tsx
/**
 * Squelette de chargement du DiagramCard. Volontairement dans son propre fichier :
 * il sert de `loading:` au `next/dynamic` qui charge DiagramCard, il ne doit donc
 * surtout pas dépendre de Mermaid.
 */
export default function DiagramSkeleton() {
    return (
        <div
            className="h-48 w-full flex items-center justify-center gap-6 px-8 animate-pulse"
            role="status"
            aria-label="Chargement du diagramme"
        >
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
            <div className="h-px w-8 bg-bridge-400/50 dark:bg-bridge-600/50"/>
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
            <div className="h-px w-8 bg-bridge-400/50 dark:bg-bridge-600/50"/>
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
        </div>
    );
}
```

- [ ] **Step 2 : `DiagramCard.tsx` — consommer le squelette extrait**

Supprimer la déclaration locale `function DiagramSkeleton() { ... }` (lignes 16-30) et ajouter après la ligne 8 :

```tsx
import DiagramSkeleton from "@/components/Cards/DiagramSkeleton";
```

Les usages de `<DiagramSkeleton/>` dans le corps de `DiagramCard` restent valides tels quels.

- [ ] **Step 3 : `blockRegistry.tsx` — charger DiagramCard dynamiquement**

Remplacer la ligne 13 :

```tsx
import DiagramCard from "@/components/Cards/DiagramCard";
```

par :

```tsx
import dynamic from "next/dynamic";
import DiagramSkeleton from "@/components/Cards/DiagramSkeleton";

// Mermaid pèse plusieurs centaines de Ko et ne concerne qu'une minorité de blocs :
// on ne le charge que si un bloc "diagram" est effectivement rendu.
const DiagramCard = dynamic(() => import("@/components/Cards/DiagramCard"), {
    ssr: false,
    loading: () => <DiagramSkeleton/>,
});
```

Aucun changement dans le `render` du bloc `"diagram"` (lignes 261-266) : la prop passée reste identique.

- [ ] **Step 4 : `SlideDiagram.tsx` — charger Mermaid dynamiquement**

Supprimer la ligne 3 `import mermaid from "mermaid";` et charger le module à l'intérieur de l'effet qui l'utilise :

```tsx
const mermaid = (await import("mermaid")).default;
```

Placer cette ligne comme première instruction de la fonction `async` interne au `useEffect`, juste avant l'appel à `mermaid.initialize(...)`. Si l'effet n'est pas déjà `async`, l'envelopper :

```tsx
useEffect(() => {
    let isMounted = true;
    void (async () => {
        const mermaid = (await import("mermaid")).default;
        // ... corps existant inchangé
    })();
    return () => { isMounted = false; };
}, [/* dépendances existantes inchangées */]);
```

- [ ] **Step 5 : Vérifier lint + typecheck**

```bash
bun run lint
```

Attendu : aucune erreur.

- [ ] **Step 6 : Vérification visuelle du rendu des diagrammes**

```bash
bun dev
```

Ouvrir un cours contenant un bloc diagramme :

```bash
grep -rln "DiagramCard\|<Diagram" src/cours | head -3
```

Vérifier sur l'une de ces pages : le squelette pulsant apparaît brièvement, puis le diagramme Mermaid s'affiche correctement en thème clair **et** sombre. Vérifier aussi une slide contenant un `SlideDiagram`.

- [ ] **Step 7 : Vérifier que Mermaid a bien quitté le bundle initial**

```bash
bun run build 2>&1 | grep -E 'contentSlug|First Load JS shared'
```

Attendu : le `First Load JS` de `/[moduleSlug]/[sectionSlug]/[contentSlug]` a **baissé** par rapport à la baseline de la Tâche 0. Si la valeur est identique, le `dynamic` n'a pas pris effet — vérifier qu'aucun autre fichier n'importe `DiagramCard` ou `mermaid` statiquement :

```bash
grep -rn "from \"mermaid\"\|from 'mermaid'\|Cards/DiagramCard" src/ | grep -v "import("
```

- [ ] **Step 8 : Commit**

```bash
git add src/components/Cards/DiagramSkeleton.tsx src/components/Cards/DiagramCard.tsx src/lib/blockRegistry.tsx src/components/Slides/ui/SlideDiagram.tsx
git commit -m "perf(diagram): charge Mermaid a la demande

DiagramCard passe en next/dynamic dans le blockRegistry et SlideDiagram
importe mermaid dans son effet. Mermaid quitte le bundle de toutes les
pages de cours qui ne contiennent aucun diagramme.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 5 : Sortir `TableBlockEditor` du bundle étudiant et casser le cycle

`blockRegistry.tsx:187` référence `TableBlockEditor` (composant du builder admin) dans une structure consommée par `BlockRenderer` côté étudiant. Le champ `editor` n'a par ailleurs **aucun consommateur** aujourd'hui — on le conserve (l'intention est documentée dans `docs/superpowers/plans/2026-06-12-table-block-editor.md`) mais on le sort du chemin critique.

**Files:**
- Create: `src/types/blocks.ts`
- Modify: `src/lib/blockRegistry.tsx:27,31-32,40-48,187`
- Modify: `src/components/builder/TableBlockEditor.tsx:8`

> `blockDefs.ts` n'est **pas** le bon hôte pour ces types : son en-tête impose « AUCUN import React/JSX/lucide ici » car il est consommé côté serveur par la route MCP. On crée donc un fichier de types dédié.

- [ ] **Step 1 : Créer le fichier de types partagé**

Créer `src/types/blocks.ts` :

```ts
import type { ReactNode } from "react";

/**
 * Props transmises au composant de rendu d'un bloc. Défini dans un module de types
 * dédié pour que les éditeurs du builder puissent se typer sans importer
 * blockRegistry — ce qui créait un cycle d'import.
 */
export interface BlockRenderProps {
    children?: ReactNode;
    [key: string]: unknown;
}

export interface BlockEditorProps {
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}
```

- [ ] **Step 2 : `blockRegistry.tsx` — réexporter au lieu de redéfinir**

Remplacer les lignes 40-48 :

```tsx
export interface BlockRenderProps {
    children?: React.ReactNode;
    [key: string]: unknown;
}

export interface BlockEditorProps {
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}
```

par :

```tsx
// Définis dans src/types/blocks.ts ; réexportés ici pour ne casser aucun
// import existant.
export type { BlockRenderProps, BlockEditorProps } from "@/types/blocks";
```

Et ajouter, à côté de l'import de `blockDefs` (ligne 31-32), l'import des types pour qu'ils restent utilisables dans le corps du fichier :

```tsx
import type { BlockRenderProps, BlockEditorProps } from "@/types/blocks";
```

- [ ] **Step 3 : `TableBlockEditor.tsx` — importer depuis la source**

Remplacer la ligne 8 :

```tsx
import type { BlockEditorProps } from "@/lib/blockRegistry";
```

par :

```tsx
import type { BlockEditorProps } from "@/types/blocks";
```

- [ ] **Step 4 : `blockRegistry.tsx` — charger l'éditeur dynamiquement**

Supprimer la ligne 27 (`import { TableBlockEditor } from "@/components/builder/TableBlockEditor";`) et ajouter, à côté du `dynamic` de la Tâche 4 :

```tsx
// Éditeur réservé au builder admin : jamais rendu côté étudiant.
const TableBlockEditor = dynamic(
    () => import("@/components/builder/TableBlockEditor").then((m) => m.TableBlockEditor),
    { ssr: false },
);
```

La ligne 187 (`editor: TableBlockEditor,`) reste inchangée.

- [ ] **Step 5 : Vérifier que le cycle a disparu**

```bash
# via MCP GitNexus, après réindexation
node .gitnexus/run.cjs analyze
```

puis :

```
check({repo: "cours-iut-web"})
```

Attendu : le cycle `TableBlockEditor.tsx ↔ blockRegistry.tsx` n'apparaît plus. Les deux cycles `admin` restent (Tâche 10).

- [ ] **Step 6 : Vérifier lint + build**

```bash
bun run lint && bun run build 2>&1 | grep -E 'contentSlug|First Load JS shared'
```

Attendu : lint propre, `First Load JS` de la page de contenu à nouveau en baisse.

- [ ] **Step 7 : Vérification fonctionnelle du builder**

```bash
bun dev
```

Se connecter en admin, ouvrir `/admin/content/<module>/<section>/cours`, insérer un bloc `table` et vérifier que l'édition du tableau fonctionne toujours (ajout de ligne, de colonne, saisie).

- [ ] **Step 8 : Commit**

```bash
git add src/types/blocks.ts src/lib/blockRegistry.tsx src/components/builder/TableBlockEditor.tsx
git commit -m "perf(builder): sort TableBlockEditor du bundle etudiant

Charge l'editeur en next/dynamic et deplace BlockRenderProps/BlockEditorProps
vers src/types/blocks.ts, ce qui casse le cycle blockRegistry <-> TableBlockEditor.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 6 : Consolider `framer-motion` → `motion`

`motion` est le successeur renommé de `framer-motion` — même version (`12.40.0`), même API. Les deux paquets sont actuellement bundlés côte à côte.

**Files:**
- Modify: `src/components/Cards/BaseCard.tsx:4`
- Modify: `src/components/Cards/SectionCard.tsx:5`
- Modify: `src/components/Cards/ModuleCard.tsx:5`
- Modify: `src/components/Cards/ContentCard.tsx:5`
- Modify: `package.json:71`

- [ ] **Step 1 : Lister les fichiers concernés**

```bash
grep -rln "from 'framer-motion'\|from \"framer-motion\"" src/
```

Attendu : exactement 4 fichiers — `BaseCard.tsx`, `SectionCard.tsx`, `ModuleCard.tsx`, `ContentCard.tsx`. Si la liste diffère, traiter tous les fichiers retournés.

- [ ] **Step 2 : Remplacer la source d'import dans les 4 fichiers**

`src/components/Cards/BaseCard.tsx` ligne 4 :

```tsx
import {motion, useReducedMotion} from 'framer-motion';
```

devient :

```tsx
import {motion, useReducedMotion} from 'motion/react';
```

`src/components/Cards/SectionCard.tsx` ligne 5 et `src/components/Cards/ModuleCard.tsx` ligne 5 : même remplacement, à l'identique.

`src/components/Cards/ContentCard.tsx` ligne 5 :

```tsx
import {useReducedMotion} from 'framer-motion';
```

devient :

```tsx
import {useReducedMotion} from 'motion/react';
```

- [ ] **Step 3 : Vérifier qu'il ne reste aucune référence**

```bash
grep -rn "framer-motion" src/
```

Attendu : **aucune sortie**.

- [ ] **Step 4 : Désinstaller le paquet**

```bash
bun remove framer-motion
```

- [ ] **Step 5 : Vérifier lint + build**

```bash
bun run lint && bun run build
```

Attendu : build en succès. `package.json` ne contient plus `framer-motion` et `bun.lock` est à jour.

- [ ] **Step 6 : Vérification visuelle des animations**

```bash
bun dev
```

Ouvrir la page d'accueil : les `ModuleCard` doivent conserver leur animation d'apparition et leur effet au survol. Ouvrir une page de module : les `SectionCard` doivent s'animer de la même façon qu'avant.

- [ ] **Step 7 : Commit**

```bash
git add src/components/Cards/BaseCard.tsx src/components/Cards/SectionCard.tsx src/components/Cards/ModuleCard.tsx src/components/Cards/ContentCard.tsx package.json bun.lock
git commit -m "perf(deps): consolide framer-motion et motion sur un seul paquet

motion@12.40.0 est le successeur renomme de framer-motion@12.40.0, meme
API. Les deux etaient installes et bundles en parallele.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 7 : Projection sur les modules pour le layout (TDD)

`layout.tsx` s'exécute sur chaque page rendue et charge tous les modules avec leurs sections complètes, alors que `generateModuleThemeCss` ne lit que `path` et `colorLight`.

**Files:**
- Modify: `src/lib/getModules.ts`
- Modify: `src/app/layout.tsx:40`
- Test: `src/lib/getModules.test.ts`

- [ ] **Step 1 : Analyse d'impact préalable (règle CLAUDE.md)**

```
impact({target: "getModules", direction: "upstream", repo: "cours-iut-web", summaryOnly: true})
```

Note : le graphe ne relie pas les imports par défaut, le fan-in réel se relève par :

```bash
grep -rln "@/lib/getModules" src/
```

Attendu : 9 fichiers (`NavBar`, `page.tsx`, `layout.tsx`, `getModuleData`, `PageFooter`, et 4 pages admin). On **ajoute** un export sans modifier `getModules` — le risque sur les appelants existants est nul.

- [ ] **Step 2 : Écrire le test qui échoue**

Créer `src/lib/getModules.test.ts` :

```ts
import { afterAll, beforeAll, expect, test } from "bun:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

let mongod: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    await client.db("cours-iut-web").collection("modules").insertMany([
        {
            path: "php",
            title: "PHP",
            colorLight: "#777bb4",
            sections: [{ path: "1-intro", title: "Intro", contents: [{ type: "cours" }] }],
        },
        {
            path: "javascript",
            title: "JavaScript",
            colorLight: "#f7df1e",
            sections: [{ path: "1-le-dom", title: "Le DOM", contents: [{ type: "cours" }] }],
        },
    ]);
});

afterAll(async () => {
    await client.close();
    await mongod.stop();
});

test("fetchModulesTheme ne renvoie que path et colorLight", async () => {
    const { fetchModulesTheme } = await import("@/lib/getModules");
    const modules = await fetchModulesTheme();

    expect(modules).toHaveLength(2);
    const php = modules.find((m) => m.path === "php");
    expect(php?.colorLight).toBe("#777bb4");
    // La projection doit exclure les sections : c'est tout l'intérêt.
    expect(php).not.toHaveProperty("sections");
    expect(php).not.toHaveProperty("title");
});
```

- [ ] **Step 3 : Lancer le test pour vérifier qu'il échoue**

```bash
bun test src/lib/getModules.test.ts
```

Attendu : ÉCHEC — `fetchModulesTheme is not a function`.

- [ ] **Step 4 : Écrire l'implémentation**

Ajouter dans `src/lib/getModules.ts`, avant `export default getModules;` :

```ts
export type ModuleTheme = { path: string; colorLight?: string };

/**
 * Variante projetée de getModules() pour le layout racine : celui-ci s'exécute à
 * chaque rendu de page mais n'a besoin que de `path` et `colorLight` pour
 * générer les variables CSS de thème. Charger les sections complètes de tous les
 * modules à cet endroit est du transfert pur.
 *
 * Séparée de `getModulesTheme` (non mémoïsée) pour rester testable hors rendu RSC.
 */
export async function fetchModulesTheme(): Promise<ModuleTheme[]> {
    const db = await connectToDB();
    const docs = await db
        .collection<Module>("modules")
        .find({}, { projection: { _id: 0, path: 1, colorLight: 1 } })
        .toArray();

    return docs as unknown as ModuleTheme[];
}

export const getModulesTheme = cache(fetchModulesTheme);
```

- [ ] **Step 5 : Lancer le test pour vérifier qu'il passe**

```bash
bun test src/lib/getModules.test.ts
```

Attendu : PASS.

- [ ] **Step 6 : Brancher le layout**

Dans `src/app/layout.tsx`, remplacer la ligne 7 :

```tsx
import getModules from "@/lib/getModules";
```

par :

```tsx
import {getModulesTheme} from "@/lib/getModules";
```

et la ligne 40 :

```tsx
        themeCss = generateModuleThemeCss(await getModules());
```

par :

```tsx
        themeCss = generateModuleThemeCss(await getModulesTheme());
```

Le type `ThemeModule` de `generateModuleThemeCss` est déjà `Pick<Module, "path" | "colorLight" | "colorDark">` : `ModuleTheme` y est assignable, aucun cast nécessaire.

- [ ] **Step 7 : Vérifier lint + rendu**

```bash
bun run lint
bun dev
```

Ouvrir la page d'accueil puis une page de cours : les couleurs de module (bandeau, accents) doivent être identiques à avant, en thème clair et sombre. Inspecter `<style id="module-theme-vars">` dans le DOM : il doit contenir les mêmes règles `--color-<module>` qu'avant le changement.

- [ ] **Step 8 : Commit**

```bash
git add src/lib/getModules.ts src/lib/getModules.test.ts src/app/layout.tsx
git commit -m "perf(db): projette les modules charges par le layout racine

Le layout s'execute a chaque rendu de page et ne consomme que path et
colorLight : inutile d'y charger les sections completes de tous les modules.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 8 : Index MongoDB sur `modules.path`

CLAUDE.md §6 note « aucun fichier d'index recensé, à mettre en place dans `src/lib/db/indexes.ts` ». Seul `course_content` en a un, créé par un script dédié.

**Files:**
- Create: `src/lib/db/indexes.ts`
- Create: `src/scripts/create-indexes.ts`
- Modify: `package.json` (scripts)
- Modify: `CLAUDE.md` (§3 et §6)

- [ ] **Step 1 : Écrire le module d'index**

Créer `src/lib/db/indexes.ts` :

```ts
import type { Db } from "mongodb";

/**
 * Index applicatifs, création idempotente (createIndex ne fait rien si l'index
 * existe déjà à l'identique). Appelé par `bun run create-indexes`.
 */
export async function ensureIndexes(db: Db): Promise<string[]> {
    const created: string[] = [];

    created.push(
        await db.collection("modules").createIndex(
            { path: 1 },
            { unique: true, name: "unique_module_path" },
        ),
    );

    created.push(
        await db.collection("course_content").createIndex(
            { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
            { unique: true, name: "unique_content_ref" },
        ),
    );

    return created;
}
```

- [ ] **Step 2 : Écrire le runner**

Créer `src/scripts/create-indexes.ts` :

```ts
import { connectToDB } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/db/indexes";

async function main() {
    const db = await connectToDB();
    const created = await ensureIndexes(db);
    console.log(`Index en place : ${created.join(", ")}`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
});
```

- [ ] **Step 3 : Déclarer le script**

Dans `package.json`, ajouter à côté de `create-content-index` :

```json
    "create-indexes": "bun src/scripts/create-indexes.ts",
```

- [ ] **Step 4 : Vérifier l'absence de doublons de `path` avant de créer un index unique**

Un index `unique` échoue si des doublons existent. Contrôler d'abord, en local :

```bash
bun -e "const {MongoClient}=require('mongodb');(async()=>{const c=new MongoClient(process.env.MONGODB_URI);await c.connect();const r=await c.db('cours-iut-web').collection('modules').aggregate([{\$group:{_id:'\$path',n:{\$sum:1}}},{\$match:{n:{\$gt:1}}}]).toArray();console.log(r);await c.close();})()"
```

Attendu : `[]`. **Si la sortie n'est pas vide**, ne pas créer l'index unique : signaler les doublons à l'utilisateur et s'arrêter — c'est une anomalie de données à traiter séparément.

- [ ] **Step 5 : Exécuter en local**

```bash
bun run create-indexes
```

Attendu : `Index en place : unique_module_path, unique_content_ref`.

- [ ] **Step 6 : Documenter**

Dans `CLAUDE.md` §3, ajouter à la liste des commandes :

```
bun run create-indexes       # crée/vérifie les index MongoDB (modules, course_content)
```

Dans `CLAUDE.md` §6, remplacer la ligne :

```
- **Index** : aucun fichier d'index recensé. **À mettre en place** dans `src/lib/db/indexes.ts`
  si la volumétrie l'exige.
```

par :

```
- **Index** : déclarés dans `src/lib/db/indexes.ts`, appliqués par `bun run create-indexes`
  (idempotent). Actuels : `modules.path` (unique), `course_content.{moduleSlug,sectionSlug,contentType}`
  (unique). Tout nouvel index passe par ce fichier.
```

- [ ] **Step 7 : Commit**

```bash
git add src/lib/db/indexes.ts src/scripts/create-indexes.ts package.json CLAUDE.md
git commit -m "feat(db): centralise les index MongoDB et indexe modules.path

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 8 : Note de déploiement**

Signaler à l'utilisateur que `bun run create-indexes` doit être exécuté **une fois sur staging et une fois sur prod** après déploiement. Ne pas l'exécuter sur prod sans accord explicite (règle mémorisée : aucune action prod sans confirmation).

---

### Tâche 9 : `bulkWrite` dans `/api/admin/import` (TDD)

Aujourd'hui : un `findOne` + un `updateOne` par module, puis un `updateOne` par contenu. Sur un push staging → prod, chaque opération est un aller-retour réseau.

**Files:**
- Create: `src/lib/admin/importOps.ts`
- Test: `src/lib/admin/importOps.test.ts`
- Modify: `src/app/api/admin/import/route.ts:37-65,115-178`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `src/lib/admin/importOps.test.ts` :

```ts
import { describe, expect, test } from "bun:test";
import { buildContentOps, buildModuleOps, mergeSections } from "@/lib/admin/importOps";

describe("mergeSections", () => {
    test("conserve l'etat de publication existant", () => {
        const existing = [{ path: "1-intro", order: 1, isAvailable: true, correctionIsAvailable: true, examenIsLock: true }];
        const imported = [{ path: "1-intro", order: 1, title: "Intro modifiee", isAvailable: false }];

        const merged = mergeSections(existing, imported);

        expect(merged).toHaveLength(1);
        expect(merged[0].title).toBe("Intro modifiee");
        expect(merged[0].isAvailable).toBe(true);
        expect(merged[0].correctionIsAvailable).toBe(true);
        expect(merged[0].examenIsLock).toBe(true);
    });

    test("une nouvelle section arrive depubliee", () => {
        const merged = mergeSections([], [{ path: "2-nouveau", order: 2, isAvailable: true }]);
        expect(merged[0].isAvailable).toBe(false);
        expect(merged[0].correctionIsAvailable).toBe(false);
    });

    test("conserve les sections absentes du payload et trie par order", () => {
        const existing = [{ path: "9-orpheline", order: 9, isAvailable: true }];
        const imported = [{ path: "1-intro", order: 1 }];

        const merged = mergeSections(existing, imported);

        expect(merged.map((s) => s.path)).toEqual(["1-intro", "9-orpheline"]);
    });
});

describe("buildModuleOps", () => {
    test("insere un module inconnu, masque et depublie", () => {
        const ops = buildModuleOps(new Map(), [
            { path: "rust", title: "Rust", isVisible: true, sections: [{ path: "1-intro", order: 1, isAvailable: true }] },
        ]);

        expect(ops.operations).toHaveLength(1);
        const doc = (ops.operations[0] as { insertOne: { document: Record<string, unknown> } }).insertOne.document;
        expect(doc.isVisible).toBe(false);
        expect((doc.sections as { isAvailable: boolean }[])[0].isAvailable).toBe(false);
        expect(ops.inserted).toBe(1);
        expect(ops.updated).toBe(0);
    });

    test("met a jour un module connu sans toucher a isVisible", () => {
        const existing = new Map([["php", { path: "php", isVisible: true, sections: [] }]]);
        const ops = buildModuleOps(existing, [{ path: "php", title: "PHP v2", isVisible: false, sections: [] }]);

        expect(ops.operations).toHaveLength(1);
        const update = (ops.operations[0] as { updateOne: { filter: unknown; update: { $set: Record<string, unknown> } } }).updateOne;
        expect(update.filter).toEqual({ path: "php" });
        expect(update.update.$set.title).toBe("PHP v2");
        expect(update.update.$set.isVisible).toBe(true);
        expect(ops.inserted).toBe(0);
        expect(ops.updated).toBe(1);
    });

    test("n'emet aucune operation pour un payload vide", () => {
        expect(buildModuleOps(new Map(), []).operations).toHaveLength(0);
    });
});

describe("buildContentOps", () => {
    test("emet un upsert par contenu, cle sur le triplet", () => {
        const ops = buildContentOps([
            { moduleSlug: "php", sectionSlug: "1-intro", contentType: "cours", blocks: [{ id: "a" }], version: 3 },
        ]);

        expect(ops).toHaveLength(1);
        const op = (ops[0] as { updateOne: { filter: unknown; update: { $set: Record<string, unknown> }; upsert: boolean } }).updateOne;
        expect(op.filter).toEqual({ moduleSlug: "php", sectionSlug: "1-intro", contentType: "cours" });
        expect(op.update.$set.version).toBe(3);
        expect(op.upsert).toBe(true);
    });

    test("applique la version 1 par defaut", () => {
        const ops = buildContentOps([{ moduleSlug: "php", sectionSlug: "1-intro", contentType: "TP", blocks: [] }]);
        const op = (ops[0] as { updateOne: { update: { $set: Record<string, unknown> } } }).updateOne;
        expect(op.update.$set.version).toBe(1);
    });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
bun test src/lib/admin/importOps.test.ts
```

Attendu : ÉCHEC — `Cannot find module '@/lib/admin/importOps'`.

- [ ] **Step 3 : Écrire l'implémentation**

Créer `src/lib/admin/importOps.ts` :

```ts
import type { AnyBulkWriteOperation, Document } from "mongodb";

export type SectionData = {
    path: string;
    order?: number;
    [key: string]: unknown;
};

export type ModuleData = {
    path: string;
    sections?: SectionData[];
    [key: string]: unknown;
};

export type ContentData = {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks: unknown[];
    version?: number;
};

/** Sur un module existant en prod, l'import ne doit jamais changer l'état de publication. */
export function mergeSections(existingSections: SectionData[], importedSections: SectionData[]): SectionData[] {
    const existingByPath = new Map(existingSections.map((s) => [s.path, s]));
    const importedPaths = new Set(importedSections.map((s) => s.path));

    const merged = importedSections.map(({ _id, ...sec }) => {
        void _id;
        const existing = existingByPath.get(sec.path);
        if (existing) {
            return {
                ...sec,
                isAvailable: existing.isAvailable ?? false,
                correctionIsAvailable: existing.correctionIsAvailable ?? false,
                examenIsLock: existing.examenIsLock ?? false,
            };
        }
        // Nouvelle section : arrive dépubliée quel que soit son état sur staging.
        return { ...sec, isAvailable: false, correctionIsAvailable: false };
    });

    const kept = existingSections
        .filter((s) => !importedPaths.has(s.path))
        .map(({ _id, ...sec }) => {
            void _id;
            return sec as SectionData;
        });

    return [...kept, ...merged]
        .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));
}

export interface ModuleOpsResult {
    operations: AnyBulkWriteOperation<Document>[];
    inserted: number;
    updated: number;
}

/**
 * Construit les opérations bulkWrite pour les modules à partir des documents déjà
 * en base (préchargés en une seule requête) et du payload importé.
 */
export function buildModuleOps(
    existingByPath: Map<string, ModuleData>,
    modules: ModuleData[],
): ModuleOpsResult {
    const operations: AnyBulkWriteOperation<Document>[] = [];
    let inserted = 0;
    let updated = 0;

    for (const moduleData of modules) {
        const { _id, sections = [], ...moduleFields } = moduleData;
        void _id;

        const existing = existingByPath.get(moduleFields.path);

        if (!existing) {
            // Nouveau module : arrive masqué, sections dépubliées.
            operations.push({
                insertOne: {
                    document: {
                        ...moduleFields,
                        isVisible: false,
                        sections: sections.map(({ _id: _sid, ...sec }) => {
                            void _sid;
                            return { ...sec, isAvailable: false, correctionIsAvailable: false };
                        }),
                    },
                },
            });
            inserted++;
        } else {
            operations.push({
                updateOne: {
                    filter: { path: moduleFields.path },
                    update: {
                        $set: {
                            ...moduleFields,
                            isVisible: existing.isVisible ?? false,
                            sections: mergeSections((existing.sections ?? []) as SectionData[], sections),
                        },
                    },
                },
            });
            updated++;
        }
    }

    return { operations, inserted, updated };
}

/** Un upsert par contenu, clé sur le triplet unique indexé de course_content. */
export function buildContentOps(contents: ContentData[]): AnyBulkWriteOperation<Document>[] {
    const now = new Date();

    return contents.map((content) => {
        const key = {
            moduleSlug: content.moduleSlug,
            sectionSlug: content.sectionSlug,
            contentType: content.contentType,
        };
        return {
            updateOne: {
                filter: key,
                update: {
                    $set: {
                        blocks: content.blocks,
                        version: content.version ?? 1,
                        updatedAt: now,
                    },
                    $setOnInsert: { ...key, createdAt: now },
                },
                upsert: true,
            },
        };
    });
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
bun test src/lib/admin/importOps.test.ts
```

Attendu : PASS — 8 tests.

- [ ] **Step 5 : Brancher la route sur les nouvelles fonctions**

Dans `src/app/api/admin/import/route.ts` :

a) Remplacer les définitions de types locales (lignes 6-24) et la fonction `mergeSections` (lignes 36-65) par un import :

```ts
import {
    buildContentOps,
    buildModuleOps,
    type ContentData,
    type ModuleData,
} from "@/lib/admin/importOps";
```

b) Remplacer tout le bloc `try` du corps de `POST` (lignes 115-183) par :

```ts
    try {
        const db = await connectToDB();
        const col = db.collection("modules");

        // Un seul aller-retour pour connaître l'état existant, au lieu d'un findOne par module.
        const existingDocs = await col
            .find({ path: { $in: paths } })
            .toArray();
        const existingByPath = new Map(
            existingDocs.map((doc) => [doc.path as string, doc as unknown as ModuleData]),
        );

        const { operations, inserted, updated } = buildModuleOps(existingByPath, modules);
        if (operations.length > 0) {
            await col.bulkWrite(operations, { ordered: false });
        }

        const contentOps = buildContentOps(contents);
        if (contentOps.length > 0) {
            await db.collection("course_content").bulkWrite(contentOps, { ordered: false });
        }

        return NextResponse.json({ inserted, updated, contentsUpserted: contentOps.length });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Import échoué" }, { status: 500 });
    }
}
```

La constante `paths` est déjà calculée ligne 102 — la réutiliser telle quelle.

- [ ] **Step 6 : Vérifier lint + typecheck**

```bash
bun run lint
```

Attendu : aucune erreur, aucun import devenu inutile dans `route.ts`.

- [ ] **Step 7 : Test bout-en-bout de l'export/import en local**

```bash
bun dev
```

En admin, ouvrir le panneau Outils → Export/Import, exporter un module, puis réimporter le fichier obtenu. Vérifier :
1. La réponse indique `updated: 1`, `contentsUpserted: N` (N = nombre de contenus du module).
2. L'état de publication du module et de ses sections est **inchangé** après réimport (c'est l'invariant critique de cette route).
3. Le contenu des cours est intact.

- [ ] **Step 8 : Commit**

```bash
git add src/lib/admin/importOps.ts src/lib/admin/importOps.test.ts src/app/api/admin/import/route.ts
git commit -m "perf(import): remplace les boucles updateOne par des bulkWrite

Precharge les modules existants en une requete et regroupe les ecritures.
Extrait la logique pure dans importOps.ts, desormais couverte par des tests.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 10 : Casser les deux cycles d'import restants

Cycles type-only : effacés à la compilation, donc **sans effet sur le bundle**. On les corrige pour la lisibilité et pour ramener `gitnexus check` à zéro.

**Files:**
- Create: `src/components/admin/adminTypes.ts`
- Modify: `src/components/admin/AdminToolsPanel.tsx:16`
- Modify: `src/components/admin/ExportImportSheet.tsx:17`
- Modify: `src/components/admin/users/EditUserDialog.tsx:14`

- [ ] **Step 1 : Extraire `ModuleOption`**

Lire la définition actuelle :

```bash
sed -n '16,24p' src/components/admin/AdminToolsPanel.tsx
```

Créer `src/components/admin/adminTypes.ts` en y copiant **à l'identique** l'interface `ModuleOption` relevée, avec l'en-tête :

```ts
/** Types partagés entre les composants d'administration, pour éviter que
 *  ExportImportSheet ait à importer AdminToolsPanel (cycle d'import). */
```

- [ ] **Step 2 : `AdminToolsPanel.tsx` — réexporter depuis la nouvelle source**

Remplacer la déclaration `export interface ModuleOption { ... }` par :

```tsx
export type { ModuleOption } from "@/components/admin/adminTypes";
```

et ajouter l'import du type s'il est utilisé dans le corps du fichier :

```tsx
import type { ModuleOption } from "@/components/admin/adminTypes";
```

- [ ] **Step 3 : `ExportImportSheet.tsx` — pointer sur la source**

Remplacer la ligne 17 :

```tsx
import type { ModuleOption } from '@/components/admin/AdminToolsPanel';
```

par :

```tsx
import type { ModuleOption } from '@/components/admin/adminTypes';
```

- [ ] **Step 4 : `EditUserDialog.tsx` — pointer sur le type source**

`UsersTable.tsx:16` ne fait que réexporter `@/types/AdminUser`. Remplacer la ligne 14 de `EditUserDialog.tsx` :

```tsx
import type { AdminUser } from './UsersTable';
```

par :

```tsx
import type AdminUser from '@/types/AdminUser';
```

- [ ] **Step 5 : Vérifier lint + typecheck**

```bash
bun run lint
```

Attendu : aucune erreur.

- [ ] **Step 6 : Vérifier que les cycles ont disparu**

```bash
node .gitnexus/run.cjs analyze
```

puis :

```
check({repo: "cours-iut-web"})
```

Attendu : `status: "ok"`, `cycleCount: 0`.

- [ ] **Step 7 : Vérification fonctionnelle**

```bash
bun dev
```

En admin : ouvrir le panneau Outils (le sélecteur de module doit être peuplé), puis la page Utilisateurs et la boîte d'édition d'un utilisateur.

- [ ] **Step 8 : Commit**

```bash
git add src/components/admin/adminTypes.ts src/components/admin/AdminToolsPanel.tsx src/components/admin/ExportImportSheet.tsx src/components/admin/users/EditUserDialog.tsx
git commit -m "refactor(admin): casse les deux cycles d'import restants

Cycles type-only (sans effet runtime) : ModuleOption passe dans adminTypes.ts
et EditUserDialog importe AdminUser depuis sa source.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 11 : `optimizePackageImports`

**Files:**
- Modify: `next.config.ts:50-52`

- [ ] **Step 1 : Ajouter la déclaration**

Remplacer le bloc `experimental` (lignes 50-52) :

```ts
    experimental: {
        authInterrupts: true,
    },
```

par :

```ts
    experimental: {
        authInterrupts: true,
        // Transforme les imports de barrel en imports directs (moins de modules
        // à parcourir au build, bundle plus fin).
        optimizePackageImports: [
            'motion',
            '@tanstack/react-table',
            'recharts',
        ],
    },
```

Ne pas y ajouter `react-syntax-highlighter` : la Tâche 2 supprime déjà tous ses imports de barrel, l'entrée serait sans effet.

- [ ] **Step 2 : Valider le build (obligatoire — règle CLAUDE.md §9)**

```bash
bun run build
```

Attendu : build en succès. **Si le build échoue ou si une page casse, retirer l'entrée fautive** de la liste : cette optimisation est facultative, elle ne doit bloquer aucune autre tâche.

- [ ] **Step 3 : Vérification fonctionnelle des pages concernées**

```bash
bun dev
```

Ouvrir `/admin/utilisateurs` (`@tanstack/react-table`) et le tableau de bord admin (`recharts`) : les tableaux et graphiques doivent s'afficher normalement.

- [ ] **Step 4 : Commit**

```bash
git add next.config.ts
git commit -m "perf(build): declare optimizePackageImports

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Tâche 12 : Mesure finale et vérification d'ensemble

**Files:** aucun fichier modifié.

- [ ] **Step 1 : Suite de tests complète**

```bash
bun test
```

Attendu : tous les tests passent, y compris les tests préexistants (`gitlab`, `live/*`, `schemas/*`, `markdownToolbar`, `builderStore`). Aucun échec n'est acceptable pour clore le plan.

- [ ] **Step 2 : Lint complet**

```bash
bun run lint
```

Attendu : aucune erreur.

- [ ] **Step 3 : Build final et comparaison chiffrée**

```bash
bun run build 2>&1 | tee /tmp/final-build.txt
grep -E 'contentSlug|slide|First Load JS shared' /tmp/baseline-build.txt
grep -E 'contentSlug|slide|First Load JS shared' /tmp/final-build.txt
```

Attendu : les trois lignes du build final affichent des tailles **inférieures** à la baseline. Noter les valeurs avant/après — c'est le résultat livrable de ce plan.

- [ ] **Step 4 : Vérifier le périmètre réel des changements**

```
detect_changes({repo: "cours-iut-web", scope: "compare", base_ref: "staging"})
```

Attendu : les symboles affectés correspondent aux fichiers listés dans « Structure des fichiers ». Toute route ou tout composant affecté hors de cette liste doit être expliqué avant d'ouvrir la PR.

- [ ] **Step 5 : Parcours de fumée**

```bash
bun run start
```

(après `bun run build && bun run postbuild`). Parcourir : accueil → un module → un cours avec code → un cours avec diagramme → une slide → `/admin` → panneau Outils. Aucune erreur en console navigateur.

- [ ] **Step 6 : Rapport à l'utilisateur**

Présenter le tableau avant/après des trois métriques du Step 3, la liste des tâches réalisées, et rappeler les deux actions de déploiement en attente :
1. `bun run create-indexes` à exécuter sur staging puis sur prod (**demander confirmation avant la prod**).
2. Aucune migration de données n'est nécessaire.

---

## Auto-revue

**Couverture des 8 points de l'audit**

| Point | Tâche(s) |
|---|---|
| 1. Mermaid + builder dans le bundle étudiant | 4, 5 |
| 2. `react-syntax-highlighter` en build complet | 2, 3 |
| 3. Doublon `framer-motion` / `motion` | 6 |
| 4. SVG inlinés | 1 (`HeaderSvg`) — `FooterSvg` hors périmètre, décision utilisateur |
| 5. `getModules()` sans projection + index | 7, 8 |
| 6. Boucles `updateOne` dans `/api/admin/import` | 9 |
| 7. Cycles d'import | 5 (cycle builder), 10 (cycles admin) |
| 8. `optimizePackageImports` | 11 |

**Risques connus**

- **Tâche 3** — `CodeCard` est un composant hub (tout `src/cours` en dépend). La signature publique est inchangée ; le seul risque est un langage non enregistré, couvert par `normalizeLanguage` (repli sur `text`) et par le test de la Tâche 2.
- **Tâche 4** — `ssr: false` sur `DiagramCard` supprime son rendu serveur. C'est sans conséquence : le composant ne produisait déjà rien au premier rendu (`useMounted()` renvoie `false` côté serveur, `DiagramCard.tsx:33`).
- **Tâche 8** — l'index `unique` sur `modules.path` échoue si des doublons existent ; le Step 4 le vérifie avant création et prévoit un arrêt.
- **Tâche 9** — la route d'import porte l'invariant « ne jamais modifier l'état de publication en prod ». Il est verrouillé par trois tests dans `importOps.test.ts` plus la vérification manuelle du Step 7.
- **Tâche 11** — `optimizePackageImports` est marqué expérimental ; le plan prévoit explicitement de retirer toute entrée qui casse le build.

**Ordre d'exécution** — Les tâches 1 à 6 (bundle) et 7 à 11 (serveur, hygiène) sont indépendantes entre blocs. La Tâche 0 est un prérequis strict, la Tâche 12 se fait en dernier. Les Tâches 2 → 3 et 4 → 5 doivent respecter leur ordre interne.
