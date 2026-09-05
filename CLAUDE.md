# CLAUDE.md

## 1. Présentation

Application Next.js (App Router) servant de site de cours web pour les étudiants de l'IUT
(BUT Informatique). Périmètre : contenus pédagogiques (HTML/CSS, JavaScript, PHP, Brainfuck)
sous forme de cours, TPs, slides et examens, avec authentification et espace admin.

## 2. Stack technique

- **Next.js** `16.3.0` (App Router exclusif, version épinglée sans `^`)
- **React** `^19.2.8`, **TypeScript** `6.0.3` (strict, épinglé)
- **MongoDB** : driver `mongodb@^7.5.0` (pas de Prisma) + `mongodb-memory-server` pour les tests.
  `bson` est **épinglé à `7.2.0`** (dépendance directe + `overrides`) — voir section 6.
- **better-auth** `^1.6.26` (`mongodbAdapter`, plugins `admin` + `captcha` Cloudflare Turnstile,
  `@better-auth/oauth-provider`)
- **Zod** `^4.4.3` + `react-hook-form` / `@hookform/resolvers` — validation des formulaires et
  des frontières API (schémas dans `src/lib/schemas/`)
- **Tailwind CSS v4** (`^4.3.3`) + `@tailwindcss/postcss`
- **shadcn/ui** via `radix-ui` (`^1.6.7`), **Framer Motion / motion** `^13.0.0`,
  **Zustand** `^5.0.14`. motion 13 a retiré `@emotion/is-prop-valid` des dépendances optionnelles ;
  sans CSS-in-JS dans le projet, aucune injection `<MotionConfig isValidProp>` n'est nécessaire.
- **MDX** : `@next/mdx@16.3.0`, `@mdx-js/react`, `remark-gfm`, `rehype-raw`
- **Mermaid** `^11.16.1` pour les diagrammes pédagogiques
- **MCP** : `@modelcontextprotocol/sdk` (serveur exposé via `/api/mcp`) + `@scalekit-sdk/node`
  (broker OAuth devant better-auth)
- **Majeures bloquées en amont** (vérifié le 2026-08-09, ne pas retenter sans revérifier) :
  - **ESLint 10** — `eslint-config-next` tire `eslint-plugin-react@7.37.5` (dernière publiée), qui
    appelle `context.getFilename()`, supprimé dans ESLint 10 → `TypeError` au chargement de la
    règle `react/display-name`. Rester en `eslint@^9`.
  - **TypeScript 7** — `tsc --noEmit` et `next build` passent, mais `typescript-eslint` refuse
    explicitement (`Error: typescript-eslint does not support TS 7.0`), y compris en 8.66.0. C'est
    un garde-fou volontaire, pas un bug contournable. Rester en `typescript@6.0.3`.
- **Builder / contenu** : `@monaco-editor/react` (éditeur), `recharts` (graphiques admin),
  `sharp` (images), `cheerio` / `turndown` / `gray-matter` (migration de contenu),
  `resend` (emails)
- **Tables admin** : composants `Table…` de shadcn (`src/components/ui/table.tsx`) pilotés par
  `AdminDataTable` (`src/components/admin/ui/AdminDataTable.tsx`). **Pas de `@tanstack/react-table`**
  — la dépendance a été retirée, aucune de ses fonctionnalités (tri, pagination, sélection)
  n'était utilisée. Déclarer les colonnes via le type `AdminColumn<TData>` (`id`, `header`, `cell`).

## 3. Commandes essentielles

```
bun dev                    # bunx next dev
bun run build              # bunx next build (mode standalone)
bun run postbuild          # node scripts/postbuild.js (copie static + public)
bun run start              # node .next/standalone/server.js
bun run lint               # bunx eslint .
bun run lint:fix           # bunx eslint . --fix
bun test                   # bun test (runner natif Bun, *.test.ts)
bun run migrate:db         # importe le contenu .tsx vers MongoDB (--dry-run, --force)
bun run migrate-contents-refs  # migre les références de contenu
bun run create-content-index   # crée les index MongoDB du contenu
bun run create-indexes       # crée/vérifie les index MongoDB (modules, course_content)
bun run seed-oauth-client  # provisionne un client OAuth better-auth
bun run generate-skill     # génère un skill pédagogique
bun run extract-cours      # bun script/extractCours.js
bun run extract-coursmd    # bun script/extractToMarkdown.js
bun run generate-imports   # bun script/generateContentImports.js
bun audit                  # bun audit
bun update                 # bunx npm-check-updates -u && bun install
```

> Hooks pre-commit via **husky** (`prepare`). Ne jamais les contourner (`--no-verify`).

Scripts de réparation ponctuels, lancés à la main (`bun src/scripts/<nom>.ts`), tous avec
`--dry-run` et sauvegarde JSON dans `backups/` : `migrate-slide-blocks` (écrans de slides restés
au format hérité), `migrate-tables` (tableaux migrés sans `headers`/`rows`), `migrate-clean-content`
(entités HTML, préfixes de titre, espaces JSX — passes `--entities` / `--titles` / `--spacers`,
**non idempotentes**, à ne jamais rejouer à l'aveugle).

> `migrate:db` est un **import**, pas une synchronisation : les `.tsx` de `src/cours/` sont figés et
> ne reflètent plus les corrections faites au builder. Le script ignore par défaut tout contenu
> modifié depuis sa migration (`--force` pour passer outre).

## 4. Architecture

- **App Router exclusif** (Next 16). Aucun dossier `pages/`.
- **Server Components par défaut**. `"use client"` uniquement quand nécessaire (hooks, événements,
  état, animations Framer Motion). ~90 fichiers clients dans le repo, principalement sous
  `src/components/` et tous les `Slide.tsx` des cours.
- **API** : Route Handlers (`src/app/api/.../route.ts`) = pattern dominant.
  Server Actions présentes dans `src/app/actions/auth-actions.ts` uniquement.
- **Proxy** (anciennement « middleware ») : `src/proxy.ts` — auth + CSRF + headers de sécurité +
  CSP. Le `matcher` est défini en bas du même fichier. Depuis Next 16 le fichier s'appelle
  officiellement `proxy.ts` (le terme « middleware » est obsolète) ; ne pas le renommer.

Modules :

- `src/app/` — routing (`[moduleSlug]/[sectionSlug]/[contentSlug]`, `admin/(dashboard)`, `api`,
  `login`, `register`, `oauth/consent`, `actions`). **29 routes API** dont `admin/*` (modules,
  sections, users, export/import, push-to-prod, calibrage, content), `auth/[...all]`, `live/*`
  (sessions temps réel SSE), `mcp`, `upload-avatar`, `avatar/[filename]`, `course-image/[filename]`,
  `health`.
- `src/components/ui/` — primitives UI (`Text`, `Heading`, `List`, `Code`, `Stack`, `Grid`, etc.)
- `src/components/Cards/` — cards composites (`CodeCard`, `ImageCard`, `DiagramCard`, `SectionCard`)
- `src/components/Slides/` — moteur de slides (hooks `useFullscreen`, `useKeyboardNav`)
- `src/components/builder/` — builder WYSIWYG de contenu (`BuilderPage`, éditeur Monaco)
- `src/components/admin/`, `src/components/login/`
- `src/lib/` — connexion DB (`mongodb.ts`), auth serveur (`auth.ts`) / client (`auth-client.ts`),
  utils (`utils.ts` — hub, ~200 usages via `cn`), métadonnées (`generatePageMetadata.ts`),
  modules (`getModules.ts`), garde admin (`withAdmin.ts`), OAuth broker (`scalekit.ts`),
  publication GitLab (`gitlab.ts`)
- `src/lib/schemas/` — schémas **Zod** (login, register, profile, module, section, pedagogy, user-edit)
- `src/lib/live/` — sessions live SSE (`LiveSessionRegistry`, `drift`, `stopwatch`, `liveTypes`)
- `src/lib/upload/` — pipeline d'upload d'images (`config`, `mime`, `scanner`, `processor`, `storage`)
- `src/lib/block*` — modèle de contenu par blocs migré en MongoDB (`blockDefs`, `blockRegistry`,
  `blockSchemas`, `blockTreeUtils`, `validateBlockTree`, `getContentBlocks`)
- `src/lib/store/` — stores Zustand (`builderStore`, `readingProgressStore`, `tocStore`)
- `src/scripts/` — scripts de migration (`migrate-to-db`, `migrate-contents-refs`, `create-content-index`)
- `src/cours/{html-css,javascript,php,brainfuck}/<n>-<slug>/` — `Cours.tsx`, `TP.tsx`, `Slide.tsx`,
  `Examen.tsx`. Voir section 10.
- `src/hook/`, `src/context/`, `src/types/`, `src/media/`

**Flux d'auth** : `proxy.ts` lit la session via `auth.api.getSession({ headers })`. `/admin/*` et
`/register` exigent `role === 'admin'`. Toutes les autres routes (sauf `/login`, `/api/auth`,
assets publics, `/`) exigent une session connectée.

## 5. Conventions de code

- **Imports via alias `@/*`** (mappé sur `./src/*` dans `tsconfig.json`). Pas de relatifs longs.
- **TypeScript strict** activé. Pas d'`any`, pas de `@ts-ignore` sans commentaire `// reason: ...`.
- **Function components** uniquement. Pas de classes.
- Nommage : `PascalCase` composants, `camelCase` fonctions/variables, `kebab-case` segments de route.
- **Indentation 4 espaces** (cohérent avec le code des cours).
- Apostrophes échappées (`&apos;`) dans le JSX texte (cf. section 10).

## 6. Conventions MongoDB

- **Connexion** : `src/lib/mongodb.ts`. `MongoClient` mis en cache via `globalThis._mongoClientPromise`
  en dev (survit au hot-reload), instance unique en prod. Mock automatique pendant la phase de build
  (`NEXT_PHASE === 'phase-production-build'`) — ne jamais introduire d'appel DB synchrone au
  module-load qui casserait `next build`.
- **Base** : nom en dur `cours-iut-web` (`connectToDB()` dans `src/lib/mongodb.ts`).
- **Validation** : **Zod** (`^4.4.3`) en place. Schémas dans `src/lib/schemas/`, appliqués aux
  frontières (Route Handlers, Server Actions, formulaires via `@hookform/resolvers`) avant insertion.
- **Collections** : pas de constantes centralisées ; les noms sont passés ad-hoc à `db.collection(...)`.
  À documenter au cas par cas.
- **`ObjectId`** : convertir en `string` avant de renvoyer au client (sérialisation JSON).
  Jamais exposer un `_id` brut.
- **Index** : déclarés dans `src/lib/db/indexes.ts`, appliqués par `bun run create-indexes`
  (idempotent). Actuels : `modules.path` (unique), `course_content.{moduleSlug,sectionSlug,contentType}`
  (unique). Tout nouvel index passe par ce fichier.
- **Transactions** : non utilisées. Nécessitent un replica set MongoDB.
- **`bson` épinglé à `7.2.0`** (dépendance directe **et** entrée `overrides` dans `package.json`).
  À partir de `7.3.0`, `bson` exécute au chargement du module un bloc `static` qui lit
  `process.getBuiltinModule('v8').startupSnapshot` ; sous Bun ce getter lève
  `NotImplementedError`, et l'optional chaining ne protège pas — **tout `import` de `mongodb`
  échoue** (`bun test`, `bun dev`, scripts `src/scripts/*.ts`). `mongodb@^7.5.0` déclare
  `bson: ^7.2.0`, la combinaison est donc supportée en amont. Ne pas relever `bson` sans avoir
  vérifié que Bun implémente `v8.startupSnapshot`.

## 7. Variables d'environnement

Toutes lues directement via `process.env.X` (pas de module `lib/env.ts`).

| Variable                       | Rôle                                                          | Source                          |
|--------------------------------|---------------------------------------------------------------|---------------------------------|
| `MONGODB_URI`                  | URI de connexion MongoDB                                      | `src/lib/mongodb.ts`            |
| `TURNSTILE_SECRET_KEY`         | Clé secrète Cloudflare Turnstile (côté serveur)               | `src/lib/auth.ts`               |
| `NEXT_PUBLIC_TURNSTILE_TOKEN`  | Sitekey Turnstile (côté client, formulaires login/register)   | `src/components/login/*.tsx`    |
| `NEXT_PUBLIC_WS_URL`           | URL WebSocket autorisée dans la CSP                           | `src/proxy.ts`                  |
| `NEXT_PUBLIC_GIT_URL`          | Base d'URL du groupe de corrections (bouton « Correction » côté étudiant) — **inlinée au build** | `src/components/Cards/SectionCard.tsx` |
| `NODE_ENV` / `NEXT_PHASE`      | Standards Next/Node, lus par `mongodb.ts` et `csrf-token`     | divers                          |
| `SYNC_SECRET`                  | Secret partagé staging/prod pour la sync inter-environnements | `api/admin/import`, `api/admin/push-to-prod` |
| `PROD_SYNC_URL`                | URL de la prod, cible du push (staging uniquement)            | `api/admin/push-to-prod`        |
| `GITLAB_CORRECTION_URL`        | Base d'URL du groupe de corrections côté serveur (runtime, ex: `https://git…/correction`) — repli sur `NEXT_PUBLIC_GIT_URL` | `src/lib/gitlab.ts` |
| `GITLAB_CORRECTION_TOKEN`      | PAT GitLab (scope `api`) — publication des corrections de TP  | `src/lib/gitlab.ts`             |
| `GITLAB_PROJET_URL`            | Base d'URL du serveur GitLab pour les projets privés créés via MCP (`publish_private_document`) — pas de groupe requis, écrit dans l'espace personnel du token, découplé de `GITLAB_CORRECTION_URL` | `src/lib/gitlab.ts` |
| `GITLAB_PROJET_TOKEN`          | PAT GitLab (scope `api`) — création/écriture de projets privés via `publish_private_document`, distinct de `GITLAB_CORRECTION_TOKEN` | `src/lib/gitlab.ts` |
| `BETTER_AUTH_SECRET`           | **À définir** : non référencé explicitement dans `src/`, mais lu en interne par `better-auth` |     |

Règles : `.env.local` est git-ignored. Jamais de secret en dur. Tout secret côté serveur uniquement
(pas de préfixe `NEXT_PUBLIC_`).

## 8. Tests

**Runner : `bun test`** (natif Bun, `bun-types`). Tests unitaires colocalisés en `*.test.ts` :
`src/lib/gitlab.test.ts`, `src/lib/live/*.test.ts` (`LiveSessionRegistry`, `drift`, `stopwatch`),
`src/lib/markdownToolbar.test.ts`, `src/lib/schemas/*.test.ts` (`module`, `section`, `pedagogy`),
`src/lib/store/builderStore.moveToIndex.test.ts`. `tsconfig.test.json` étend `tsconfig.json` avec
les types Bun.

- `mongodb-memory-server` disponible pour tester la logique DB en isolation.
- `@playwright/test` installé pour l'e2e (parcours login, navigation cours, admin) — à étoffer.
- Écrire les nouveaux tests près du code testé, en `*.test.ts`.

## 9. À ne JAMAIS faire

- Importer du code serveur (`src/lib/auth.ts`, `src/lib/mongodb.ts`) depuis un Client Component.
- Exposer la connexion DB ou un secret côté client (pas de `NEXT_PUBLIC_` pour des secrets).
- Faire un `findOne`/`find` sans filtre indexé sur une grosse collection (cf. section 6).
- Modifier `next.config.ts` ou `package.json` (versions, scripts) sans valider `npm run build`
  ensuite.
- Toucher `src/components/ui/` ou `src/components/Cards/` quand on travaille sur le contenu des
  cours — ces composants sont la source de vérité pour tout `src/cours/`.
- Inventer un composant qui existe déjà : vérifier `src/components/ui/` et `src/components/Cards/`
  avant d'écrire un nouveau composant.
- Skip les hooks pre-commit (`--no-verify`).

## 10. Cours pédagogiques

**Pour toute modification dans `src/cours/`, voir `PROMPT_CLAUDE_CODE.md` à la racine.**

Règles condensées :

- **Impératif vouvoyé strict** dans tous les `<ListItem>` d'une `<List ordered>` de TP : « Créez »,
  « Ouvrez », « Modifiez », « Utilisez », « Ajoutez », « Vérifiez », « Affichez ». **Jamais**
  d'infinitif (« Créer le fichier… ») ni de futur (« Vous créerez… »).
- Structure : `<article><section>`, une seule `<section>` par grand thème. La numérotation est
  **posée par le renderer** selon un plan scolaire — `A`, `B`, `C` au premier niveau, `1`, `2`,
  `3` au deuxième, `a`, `b`, `c` au troisième — et chaque niveau est indenté. Ne jamais écrire
  ce préfixe dans le titre : « Boucle `for` », pas « 2.1 Boucle `for` ».
- Composants imposés : `Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`,
  `CodeWithPreviewCard`, `ImageCard`, `DiagramCard`, `SectionCard`, `Table…`. **Jamais** de
  `<p>`, `<ul>`, `<li>`, `<h2>`, `<code>` bruts dans le contenu pédagogique.
- Apostrophes échappées (`&apos;` ou `&rsquo;`) dans le JSX texte. Guillemets : `&quot;`.
- TP : chaque exercice doit indiquer fichier cible, méthode/API imposée, résultat attendu,
  critère de validation.
- Pas de nouvelle dépendance pour les cours ; signaler tout composant manquant plutôt que de
  l'inventer.

## 11. Design Context

Pour toute tâche de design / UI / UX, consulter en priorité :

- **`PRODUCT.md`** (racine) — register, users, purpose, brand personality, anti-references,
  design principles, accessibilité. C'est la source de vérité stratégique.
- **`DESIGN.md`** (racine, si présent) — système visuel : palette, typographie, composants,
  layout. Utilisé par les commandes `/impeccable` pour rester on-brand.

Mettre à jour ces fichiers via `/impeccable teach` (stratégie) ou `/impeccable document`
(visuel) plutôt qu'en éditant à la main.

**Skill UI/UX obligatoire** : pour toute tâche touchant au design, à l'UI ou à l'UX
(nouveau composant, révision visuelle, layout, navigation, couleurs, typographie…),
invoquer le skill `ui-ux-pro-max` **avant** toute implémentation.

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
