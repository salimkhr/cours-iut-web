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

#### Architecture OAuth 2.0

```
Claude.ai
  ├─ GET  /.well-known/oauth-authorization-server/api/auth  → découverte
  ├─ GET  /api/auth/oauth2/authorize                         → login + consentement
  ├─ POST /api/auth/oauth2/token                             → access_token
  └─ POST /api/mcp  (Authorization: Bearer <token>)          → tools MCP
```

#### Variables d’environnement

```bash
# .env.local
BETTER_AUTH_SECRET=<secret 32 octets — générer avec: node -e "console.log(require(‘crypto’).randomBytes(32).toString(‘hex’))">
MCP_CLIENT_ID=<uuid>
MCP_CLIENT_SECRET=<uuid>
```

#### Enregistrement du client OAuth (à faire une fois)

```bash
bun run seed-oauth-client
```

Ce script insère le client Claude.ai dans la collection `oauthClient` avec `skipConsent: true`.

#### Configuration du connecteur Claude.ai

Dans **claude.ai → Paramètres → Connecteurs personnalisés** :

| Champ | Valeur |
|-------|--------|
| URL | `https://<domaine-prod>/api/mcp` |
| Client ID | valeur de `MCP_CLIENT_ID` |
| Client secret | valeur de `MCP_CLIENT_SECRET` |

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