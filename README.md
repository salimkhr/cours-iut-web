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