# AGENTS.md

Site de cours de l'IUT (BUT Informatique) : modules, sections, cours, TP, slides, examens,
quiz live, espace admin et serveur MCP. Next.js 16 (App Router), React 19, TypeScript strict,
MongoDB (driver natif), better-auth, Zod, Tailwind v4 + shadcn/ui. Runtime et paquets : **Bun**.

Avant de modifier une fonction ou de committer, suivez `NEXUS.md` (analyse d'impact GitNexus).

## Commandes

```bash
bun dev                          # serveur de dev (http://localhost:3000)
bun run lint                     # eslint
bunx tsc --noEmit                # typecheck
bun test                         # tous les tests
bun test tests/lib/getModules    # un fichier (filtre sur le chemin)
bun test -t "nom du test"        # un test par nom (regex)
bun run build                    # build standalone, à lancer si config ou dépendances touchées
bun run create-indexes           # applique src/lib/db/indexes.ts (idempotent)
```

Les scripts qui touchent la base passent par `dotenv-cli` (`.env` + `.env.local`) : utilisez
les scripts `package.json` plutôt que `bun src/scripts/x.ts` en direct.

## Avant de rendre la main

Le hook pre-commit (husky) lance seulement `lint` et `tsc --noEmit`, pas les tests. Lancez
vous-même `bun test` sur la zone modifiée, et `bun run build` si vous avez touché
`next.config.ts`, `package.json` ou `src/proxy.ts`. Ne contournez jamais le hook (`--no-verify`).

## Tests

Runner natif `bun:test`, timeout 30 s (`bunfig.toml`). Deux emplacements :

- `tests/{api,lib,mcp}/` — tests d'intégration sur une vraie base en mémoire
  (`startMemoryDb()` de `tests/helpers/db.ts`, `mongodb-memory-server`).
- `src/**/*.test.ts(x)` — tests unitaires colocalisés. Les composants se testent avec
  `renderToStaticMarkup` (`react-dom/server`), sans bibliothèque DOM.

Pour une route API, mockez avant d'importer la route, sinon le vrai module est chargé :

```ts
mock.module("@/lib/mongodb", () => ({ connectToDB: async () => db }));
mock.module("@/lib/auth", () => ({ getServerSession: async () => session, auth: {} }));
const { POST } = await import("@/app/api/admin/modules/route");
```

Pour un bug, écrivez d'abord le test qui le reproduit. Pas d'e2e en place (Playwright est
installé mais sans configuration).

## Architecture

- App Router exclusif. Server Components par défaut, `"use client"` seulement pour l'état,
  les événements ou les animations.
- API en Route Handlers (`src/app/api/**/route.ts`). Les Server Actions se limitent à
  `src/app/actions/auth-actions.ts`.
- `src/proxy.ts` porte l'auth, le CSRF, la CSP et les headers de sécurité. C'est le nom
  officiel du middleware depuis Next 16 : ne le renommez pas.
- Accès : `/admin/*` et `/register` exigent `role === 'admin'` ; tout le reste sauf `/`,
  `/login`, `/api/auth` et les assets exige une session.
- Le contenu pédagogique vit dans MongoDB sous forme d'arbre de blocs (`src/lib/block*`),
  édité par le builder (`src/components/builder/`) ou les outils MCP (`src/lib/mcp/`).
- Le quiz live n'écrit que par `QuizService` (`src/lib/quiz/`), partagé admin et MCP.
- Validation Zod (`src/lib/schemas/`) à chaque frontière, avant toute écriture en base.

## Conventions

- Imports via `@/*`. Indentation 4 espaces. Function components uniquement.
- Pas d'`any` ; un `@ts-ignore` porte un commentaire `// reason: ...`.
- Un `ObjectId` est converti en `string` avant d'aller au client.
- Les listes de modules, sections ou contenus viennent de la base (`getModules()`), jamais
  d'une constante en dur.
- Utilisez les composants shadcn de `src/components/ui/` (Button, Card, Tabs…) avant d'écrire
  un `<div>` stylé. Vérifiez `ui/` et `Cards/` avant de créer un composant.
- Tables admin : `AdminDataTable` + type `AdminColumn<TData>`, pas de `@tanstack/react-table`.
- Tout nouvel index MongoDB se déclare dans `src/lib/db/indexes.ts`.

## Pièges connus

- **`bson` épinglé à `7.2.0`** (dépendance + `overrides`) : dès 7.3, son chargement lit
  `v8.startupSnapshot`, que Bun n'implémente pas, et tout `import "mongodb"` plante. Le driver
  reste donc en `mongodb@~7.6.0`, car 7.7 exige `bson ^7.3.2`.
- **ESLint 10 bloqué** : `eslint-plugin-react` appelle `context.getFilename()`, supprimé.
  Restez en `eslint@^9`.
- **TypeScript 7 bloqué** : `typescript-eslint` le refuse explicitement. Restez en `6.0.3`.
- **Pas d'appel DB au chargement d'un module** : `src/lib/mongodb.ts` renvoie un mock pendant
  `next build` (`NEXT_PHASE`), un appel synchrone au top-level casse le build.
- **`src/cours/` est figé** : ces `.tsx` ont été importés en base et ne sont plus lus par
  l'app. Ne les modifiez pas pour corriger un cours, corrigez en base.
- **`bun run migrate:db` est un import, pas une synchro** : il saute ce qui a été modifié depuis
  la migration, et `--force` écrase les corrections faites au builder.
- **`migrate-clean-content` n'est pas idempotent** : ne le rejouez pas à l'aveugle.
- `NEXT_PUBLIC_*` est inliné au build : changer la valeur exige un rebuild.

## Données et environnement

- Base `cours-iut-web`, connexion via `connectToDB()` de `src/lib/mongodb.ts`.
- Les collections de better-auth (`user`, `session`, `oauthClient`…) se manipulent uniquement
  via l'API better-auth : leur schéma interne change entre versions.
- Variables lues via `process.env`, secrets dans `.env.local` (git-ignoré). Un secret n'a
  jamais le préfixe `NEXT_PUBLIC_`. Pour savoir où une variable est lue :
  `grep -rn "process.env.NOM" src`.
- Deux environnements, staging et prod. Le contenu passe de l'un à l'autre via
  `/api/admin/push-to-prod` (`SYNC_SECRET`).

## Limites

✅ **Toujours** : lancer les tests de la zone touchée ; valider les entrées avec Zod ; garder
le code serveur (`@/lib/auth`, `@/lib/mongodb`) hors des Client Components.

⚠️ **Demander d'abord** : toute écriture sur la base de staging ou de prod (scripts de
migration, outils MCP, push-to-prod), même si un constat semble l'appeler ; ajouter ou monter
une dépendance ; modifier `next.config.ts` ; rejouer un script de migration.

🚫 **Jamais** : exposer un secret au client ; contourner les hooks ; requêter une grosse
collection sans filtre indexé ; modifier `src/components/ui/` ou `src/components/Cards/` dans
le cadre d'une tâche de contenu ; éditer `PRODUCT.md` ou `DESIGN.md` à la main (ils sont
maintenus par l'outil `impeccable`, proposez le changement à l'utilisateur).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
