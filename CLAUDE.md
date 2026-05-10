# CLAUDE.md

## 1. Présentation

Application Next.js (App Router) servant de site de cours web pour les étudiants de l'IUT
(BUT Informatique). Périmètre : contenus pédagogiques (HTML/CSS, JavaScript, PHP, Brainfuck)
sous forme de cours, TPs, slides et examens, avec authentification, espace admin et chat IA.

## 2. Stack technique

- **Next.js** `^16.1.6` (App Router exclusif, Turbopack en dev)
- **React** `^19.2.4`, **TypeScript** `5.9.3` (strict)
- **MongoDB** : driver `mongodb@^7.1.0` (pas de Mongoose, pas de Prisma)
- **better-auth** `^1.4.18` (`mongodbAdapter`, plugins `admin` + `captcha` Cloudflare Turnstile)
- **drizzle-orm** `^0.45.1` — **À définir** : déclaré en deps mais aucun usage observé dans `src/`
- **Tailwind CSS v4** (`^4.1.18`) + `@tailwindcss/postcss`
- **shadcn/ui** via `radix-ui`, **Framer Motion** `^12.31.0`, **Zustand** `^5.0.11`
- **MDX** : `@next/mdx@^16.1.6`, `@mdx-js/react`, `remark-gfm`, `rehype-raw`
- **Mermaid** `^11.12.2` pour les diagrammes pédagogiques

## 3. Commandes essentielles

```
npm run dev               # next dev --turbopack
npm run build             # next build (mode standalone)
npm run postbuild_linux   # copie .next/static + public dans .next/standalone
npm run postbuild_win     # idem, version Windows (xcopy)
npm run start             # node .next/standalone/server.js
npm run lint              # next lint
npm run lint:fix          # next lint --fix
npm run extract-cours     # node script/extractCours.js
npm run extract-coursmd   # node script/extractToMarkdown.js
npm run generate-imports  # node script/generateContentImports.js
npm run audit             # npm audit --production
npm run update            # npx npm-check-updates -u && npm install
```

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

- `src/app/` — routing (`[moduleSlug]`, `admin`, `api`, `chat`, `login`, `register`, `actions`)
- `src/components/ui/` — primitives UI (`Text`, `Heading`, `List`, `Code`, `Box`, `Stack`, etc.)
- `src/components/Cards/` — cards composites (`CodeCard`, `ImageCard`, `DiagramCard`, `SectionCard`)
- `src/components/Slides/` — moteur de slides (hooks `useFullscreen`, `useKeyboardNav`)
- `src/components/admin/`, `src/components/login/`, `src/components/ia/`
- `src/lib/` — connexion DB (`mongodb.ts`), auth serveur (`auth.ts`), auth client (`auth-client.ts`),
  utils (`utils.ts`), métadonnées (`generatePageMetadata.ts`), modules (`getModules.ts`)
- `src/lib/store/` — stores Zustand
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
- **Validation** : aucune lib (Zod absent). **À définir** : recommandation = Zod aux frontières
  (Route Handlers et Server Actions) avant insertion.
- **Collections** : pas de constantes centralisées ; les noms sont passés ad-hoc à `db.collection(...)`.
  À documenter au cas par cas.
- **`ObjectId`** : convertir en `string` avant de renvoyer au client (sérialisation JSON).
  Jamais exposer un `_id` brut.
- **Index** : aucun fichier d'index recensé. **À mettre en place** dans `src/lib/db/indexes.ts`
  si la volumétrie l'exige.
- **Transactions** : non utilisées. Nécessitent un replica set MongoDB.

## 7. Variables d'environnement

Toutes lues directement via `process.env.X` (pas de module `lib/env.ts`).

| Variable                       | Rôle                                                          | Source                          |
|--------------------------------|---------------------------------------------------------------|---------------------------------|
| `MONGODB_URI`                  | URI de connexion MongoDB                                      | `src/lib/mongodb.ts`            |
| `TURNSTILE_SECRET_KEY`         | Clé secrète Cloudflare Turnstile (côté serveur)               | `src/lib/auth.ts`               |
| `NEXT_PUBLIC_TURNSTILE_TOKEN`  | Sitekey Turnstile (côté client, formulaires login/register)   | `src/components/login/*.tsx`    |
| `BACKEND_IA_API_URL`           | URL du backend du chat IA                                     | `src/app/api/chat/route.ts`     |
| `BACKEND_IA_API_KEY`           | Clé API du backend IA                                         | `src/app/api/chat/route.ts`     |
| `NEXT_PUBLIC_WS_URL`           | URL WebSocket autorisée dans la CSP                           | `src/proxy.ts`                  |
| `NEXT_PUBLIC_GIT_URL`          | Base d'URL du repo (lien « Éditer sur GitHub »)               | `src/components/Cards/SectionCard.tsx` |
| `NODE_ENV` / `NEXT_PHASE`      | Standards Next/Node, lus par `mongodb.ts` et `csrf-token`     | divers                          |
| `BETTER_AUTH_SECRET`           | **À définir** : non référencé explicitement dans `src/`, mais lu en interne par `better-auth` |     |

Règles : `.env.local` est git-ignored. Jamais de secret en dur. Tout secret côté serveur uniquement
(pas de préfixe `NEXT_PUBLIC_`).

## 8. Tests

**Pas encore en place.** Aucun fichier `*.test.*` ni `*.spec.*` dans `src/` ; aucune dépendance
Vitest/Jest/Playwright dans `package.json`.

Recommandation : Vitest pour les utils (`src/lib/utils.ts`) et la logique métier, Playwright pour
les parcours e2e (login, navigation cours, admin).

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
- Structure : `<article><section>` avec préfixes `A-`, `B-`, `C-` sur les `<Heading level={2}>`
  et `1.`, `2.`, `3.` sur les `<Heading level={3}>`. Une seule `<section>` par grand thème.
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
