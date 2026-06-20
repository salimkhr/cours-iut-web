### Résumé du projet

📦 Nom du projet, version et description
- Nom: `cours-iut-web`
- Version: `0.1.0`
- Description: non renseignée dans `package.json`

⚙️ Versions clés
- Next.js: `^16.0.1`
- React: `^19.2.0` (`react-dom`: `^19.2.0`)
- Node.js: image Docker `node:20.18-alpine` (donc Node 20.18 en production)
- TailwindCSS: `^4.1.16` (avec `@tailwindcss/postcss` ^4 et `postcss` ^8)

📁 Structure principale du dépôt
- `src/app/`
    - App Router Next 13+ (Next 16) avec pages et routes dynamiques:
        - `page.tsx` (page d’accueil)
        - `admin/page.tsx`, `login/page.tsx`, `chat/page.tsx`
        - `[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` (routing dynamique)
        - `mdx-components.tsx` (mapping de composants pour MDX)
- `src/components/`
    - `ui/` (composants shadcn/ui: `button`, `card`, `dialog`, `tabs`, `table`, etc.)
    - `page/` (sections de page: `HeroSection`, `CoursesGrid`, etc.)
    - `admin/` (UI d’administration)
    - `Cards/` (cartes de contenu, code, diagrammes, images…)
    - `ia/` (composants de chat IA)
    - Autres utilitaires: `ThemeProvider`, `ThemeToggle`, `AntiCopyProtector`, etc.
- `src/lib/`
    - Utilitaires de contenu (`contentImports.ts`) et alias `@lib` (cf. config)
- `src/types/`
    - Types TypeScript: `Section`, `SectionState`, etc.
- `src/context/`
    - Contexte applicatif (`AuthContext.tsx`)
- `rag/markdown/`
    - Contenus pédagogiques en Markdown/MDX (ex. `php/…`, `html-css/…`) + scripts d’extraction dans `script/`
- `public/`
    - Assets statiques et destination PWA (`next-pwa` → `dest: 'public'`)
- Fichiers de configuration principaux
    - `next.config.ts` (PWA + MDX + images + Turbopack + standalone)
    - `tailwind.confi.ts` (TailwindCSS)
    - `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`
    - `Dockerfile`, `docker-compose.yml`

💡 Fonctionnalités clés détectées
- PWA
    - Plugin: `next-pwa` configuré (`register: true`, `skipWaiting: true`, `dest: 'public'`)
    - Sortie Next en mode `standalone` (optimisée pour déploiement/Docker)
- MDX
    - Support via `@next/mdx` et `@mdx-js/loader`; extensions de page `['js','jsx','ts','tsx','md','mdx']`
    - Composants MDX personnalisés via `src/app/mdx-components.tsx`
- App Router (Next 16)
    - Routes dynamiques et segments imbriqués pour modules/sections/contenus
- Thème & UI
    - shadcn/ui (via composants `ui/*`), Radix UI primitives, `lucide-react`
    - Thème sombre/claire avec `next-themes`
    - TailwindCSS v4 + `tailwind-merge`
- Contenu pédagogique enrichi
    - Rendu Markdown/MDX (`react-markdown`, `remark-gfm`, `rehype-raw`)
    - Syntax highlighting (`highlight.js`), diagrammes `mermaid`
- Animations
    - `framer-motion` / `motion` et `tw-animate-css`
- Images externes optimisées
    - `next/image` avec `remotePatterns` (Giphy, MDN, Picsum, Placehold, etc.) et formats `avif/webp`
- Sécurité & Auth
    - `csrf`, `cookies`, `rate-limiter-flexible`, `jose` (JWT/JOSE)
    - Contexte d’authentification (`src/context/AuthContext.tsx`)
- Données & persistance
    - `mongodb` + `drizzle-orm`
- Scripts de maintenance
    - Extraction/ génération de contenus (`script/extractCours.js`, `extractToMarkdown.js`, `generateContentImports.js`)
- Outils dev & qualité
    - ESLint (`eslint`, `eslint-config-next`), `typescript` 5, Turbopack (dev), Yarn 4 (PnP)

🔧 Scripts npm utiles (`package.json`)
- `dev`: `next dev --turbopack`
- `build`: `next build`
- `start`: `node .next/standalone/server.js` (exécution standalone)
- `lint` / `lint:fix`: linting Next
- `extract-cours`, `extract-coursmd`, `generate-imports`: gestion du contenu
- `audit`: `npm audit --production`

🐳 Déploiement Docker
- Image base: `node:20.18-alpine`
- Build multi-étapes (deps → build → runner)
- Copie de `.next/standalone` et `.next/static`; lancement via `node server.js`

Si vous souhaitez, je peux transformer ce résumé en un `README.md` complet avec badges, instructions d’installation et sections d’usage/tests/déploiement.

---

## 🤖 MCP — Serveur de contenu pour IA

Le projet expose un serveur MCP (Model Context Protocol) avec 8 tools permettant à une IA de lire et modifier le contenu pédagogique stocké dans MongoDB.

### Serveur unique

| Fichier | Client | Auth |
|---------|--------|------|
| `src/app/api/mcp/route.ts` | Claude.ai web | OAuth 2.1 délégué à Scalekit (Bearer token) |

> Les anciens serveurs stdio (`src/mcp/server.ts`, package `mcp-server/`) ont été supprimés au
> profit de cette unique route HTTP, seule à invalider le cache Next via `revalidateTag`.

---

### Mode HTTP (Claude.ai web)

#### Architecture OAuth 2.1 — Scalekit en broker

L'Authorization Server est délégué à **Scalekit**, qui fédère le login vers better-auth :

```
Claude.ai
  ├─ GET  /.well-known/oauth-protected-resource  → pointe vers l'AS Scalekit
  ├─ (OAuth 2.1 + DCR + PKCE chez Scalekit)      → Scalekit délègue le login à
  │                                                 better-auth (connexion OIDC)
  └─ POST /api/mcp  (Authorization: Bearer <JWT Scalekit>)  → tools MCP
```

`/api/mcp` valide le JWT Scalekit (`validateScalekitToken`, JWKS + audience) et dérive le
rôle de l'allowlist `MCP_ADMIN_EMAILS`. Aucune lecture directe des collections d'auth.

#### Variables d’environnement

```bash
# .env.local — credentials API Scalekit (pour le SDK)
SCALEKIT_ENVIRONMENT_URL=https://<env>.scalekit.dev
SCALEKIT_CLIENT_ID=skc_...
SCALEKIT_CLIENT_SECRET=...
SCALEKIT_RESOURCE_ID=res_...           # audience des JWT (Server Id du serveur MCP Scalekit)
MCP_ADMIN_EMAILS=prof@exemple.fr       # emails admin (écriture), séparés par virgules
BETTER_AUTH_URL=https://<domaine>      # issuer OIDC public vu par Scalekit
```

#### Fédération OIDC (à faire une fois)

Enregistrer Scalekit comme client OIDC de better-auth, via l'API (pas d'insert Mongo) :

```bash
BASE_URL=https://<domaine> SCALEKIT_OIDC_REDIRECT_URI=<callback Scalekit> \
  bun run scripts/register-scalekit-oidc-client.ts
```

Coller le `client_id`/`client_secret` affichés dans la **connexion OIDC** du dashboard Scalekit
(issuer = `https://<domaine>/api/auth`).

#### Configuration du connecteur Claude.ai

Dans **claude.ai → Paramètres → Connecteurs personnalisés**, URL = `https://<domaine>/api/mcp`.
L'enregistrement du client se fait automatiquement (DCR Scalekit) — pas de client_id/secret à saisir.

---

### Contrôle d’accès des tools

| Tool | Accès |
|------|-------|
| `get_migration_status` | Tout utilisateur authentifié |
| `list_block_types` | Tout utilisateur authentifié |
| `get_content` | Tout utilisateur authentifié |
| `save_content` | Admin uniquement |
| `delete_content` | Admin uniquement |
| `insert_block` | Admin uniquement |
| `edit_block` | Admin uniquement |
| `delete_block` | Admin uniquement |

---

### Scénario de migration (contenu fichier → MongoDB)

```
Vous  : "Migre tous les cours JavaScript"
Claude: appelle get_migration_status
        → voit javascript/1-le-dom/cours = "file"
Claude: lit src/cours/javascript/1-le-dom/Cours.tsx
        → convertit les composants JSX en blocs JSON
Claude: appelle save_content("javascript", "1-le-dom", "cours", [...blocks])
        → passe au cours suivant, répète
```