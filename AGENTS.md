# AGENTS.md

Instructions pour les agents de code (Codex CLI, Cursor, etc.) travaillant sur ce dépôt.
Claude Code lit `CLAUDE.md` (référence complète) ; ce fichier en reprend l'essentiel.

## Stack

Next.js 16 (App Router exclusif), React 19, TypeScript 6 (strict), MongoDB (driver natif,
pas de Prisma, `bson` épinglé à `7.2.0`), better-auth, Zod, Tailwind CSS v4, shadcn/ui
(`radix-ui`), Zustand. Runtime/gestionnaire de paquets : **Bun**.

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
