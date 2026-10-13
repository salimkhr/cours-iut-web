# AGENTS.md

Instructions pour les agents de code (Codex CLI, Cursor, etc.) travaillant sur ce dépôt.
Claude Code lit `CLAUDE.md` (référence complète) ; ce fichier en reprend l'essentiel.

## Stack

Next.js 16 (App Router exclusif), React 19, TypeScript 6 (strict), MongoDB (driver natif,
pas de Prisma, `bson` épinglé à `7.2.0`), better-auth, Zod, Tailwind CSS v4, shadcn/ui
(`radix-ui`), Zustand. Runtime/gestionnaire de paquets : **Bun**.

## Skills à utiliser

Installés en scope user (`claude plugin list`) — nécessitent un redémarrage de session pour
être actifs après installation. À invoquer proactivement selon la tâche, pas seulement sur
demande explicite :

- **`ui-ux-pro-max`** — **obligatoire avant toute tâche de design/UI/UX** (nouveau composant,
  révision visuelle, layout, navigation, couleurs, typographie), cf. section 11 de `CLAUDE.md`.
  Sous-skills : `design`, `design-system`, `ui-styling`, `brand`, `slides`, `banner-design`.
- **`impeccable`** — vocabulaire de commandes pour maintenir la cohérence design du projet :
  `/impeccable teach` (met à jour `PRODUCT.md` — stratégie produit) et `/impeccable document`
  (met à jour `DESIGN.md` — système visuel) sont les commandes de référence pour ces deux
  fichiers (cf. section 11 de `CLAUDE.md` — **ne jamais les éditer à la main**). Autres verbes
  utiles sur une UI existante : `/impeccable polish`, `/impeccable audit`, `/impeccable critique`.
- **`superpowers`** — méthodologie de développement. Skills clés : `brainstorming` (cadrer une
  feature avant de coder), `test-driven-development` (tests avant code — cohérent avec
  `bun test`), `systematic-debugging`, `writing-plans` / `executing-plans`,
  `requesting-code-review` / `receiving-code-review`, `subagent-driven-development`. En cas de
  doute sur quel skill s'applique, passer par `using-superpowers`.
- **`gitnexus`** — analyse de code intelligence (impact, dépendances, flux d'exécution). Voir
  le bloc généré automatiquement plus bas dans ce fichier (section « GitNexus — Code
  Intelligence ») pour les commandes MCP/CLI exactes ; ne pas l'éditer à la main, il est
  régénéré par `gitnexus analyze`.

## Commandes

```
bun dev                # serveur de dev
bun run build           # build production (standalone)
bun run lint            # eslint .
bun run lint:fix
bun test                # bun test (runner natif Bun, *.test.ts)
```

Hooks pre-commit via husky (`prepare`) — ne jamais les contourner (`--no-verify`).

## Architecture

- App Router exclusif, pas de dossier `pages/`.
- Server Components par défaut ; `"use client"` seulement si nécessaire (hooks, état, événements).
- API en Route Handlers (`src/app/api/.../route.ts`).
- Auth + CSRF + CSP dans `src/proxy.ts` (anciennement middleware, renommé depuis Next 16).
- `src/lib/schemas/` : validation Zod aux frontières (API, formulaires) avant toute insertion DB.

## Conventions

- Imports via alias `@/*` (pas de relatifs longs).
- TypeScript strict : pas d'`any`, pas de `@ts-ignore` sans `// reason: ...`.
- Function components uniquement, pas de classes.
- `PascalCase` composants, `camelCase` fonctions/variables, `kebab-case` routes.
- Indentation 4 espaces.
- `ObjectId` MongoDB toujours converti en `string` avant renvoi au client.

## À ne jamais faire

- Importer du code serveur (`src/lib/auth.ts`, `src/lib/mongodb.ts`) dans un Client Component.
- Exposer un secret côté client (pas de `NEXT_PUBLIC_` pour un secret).
- Modifier `next.config.ts` ou `package.json` sans valider `bun run build` ensuite.
- Toucher `src/components/ui/` ou `src/components/Cards/` pour une tâche de contenu de cours —
  ce sont les composants source de vérité, utilisés par tout `src/cours/`.
- Inventer un composant déjà existant : vérifier `src/components/ui/` et `src/components/Cards/`
  avant d'en écrire un nouveau.
- Sauter les hooks pre-commit (`--no-verify`).

## Piloter le navigateur pour tester une modif UI

`@playwright/test` est une dépendance du projet (`node_modules/playwright` est déjà installé,
Chromium headless aussi). Pour vérifier visuellement un changement, piloter Chromium en
headless directement depuis Bash plutôt que de tenter d'ouvrir une fenêtre visible :

```js
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000/...', { waitUntil: 'domcontentloaded' });
await page.screenshot({ path: '/chemin/vers/capture.png' });
await browser.close();
```

Le serveur de dev doit tourner (`bun dev`, vérifier `http://localhost:3000`). Écrire le script
dans le répertoire du projet (pas dans `/tmp`) pour que la résolution de module Bun prenne la
version de `playwright` épinglée par `package.json` plutôt qu'une version globale en cache — un
écart de version entre `playwright` et les binaires déjà téléchargés dans
`~/.cache/ms-playwright/` fait échouer `chromium.launch()`. Supprimer le script une fois le test
terminé (ne pas le committer). Relire la capture avec l'outil de lecture d'image pour juger du
rendu.

Cette méthode headless suffit pour vérifier/tester par moi-même (screenshots, clics, navigation).
Elle ne montre rien à l'écran de l'utilisateur — si l'utilisateur doit voir la fenêtre, un autre
mécanisme est nécessaire (non résolu à ce jour : Chromium via Playwright sous WSLg reste invisible
côté utilisateur malgré un lancement réussi).

## Contenu pédagogique (`src/cours/`)

Voir section 10 de `CLAUDE.md` pour les règles détaillées (impératif vouvoyé, structure
`<article><section>`, composants imposés, apostrophes échappées). Ne jamais utiliser de
balises HTML brutes (`<p>`, `<ul>`, `<h2>`, `<code>`) dans le contenu pédagogique.

## Détails complets

Stack précise (versions, majeures bloquées), variables d'environnement, conventions MongoDB
détaillées, tests : voir `CLAUDE.md` à la racine.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **cours-iut-web** (8100 symbols, 14761 relationships, 351 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/cours-iut-web/context` | Codebase overview, check index freshness |
| `gitnexus://repo/cours-iut-web/clusters` | All functional areas |
| `gitnexus://repo/cours-iut-web/processes` | All execution flows |
| `gitnexus://repo/cours-iut-web/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
