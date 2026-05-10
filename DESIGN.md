---
name: Cours IUT Web
description: Plateforme pédagogique BUT Informatique — cours, TP, slides, examens (HTML/CSS, JS, PHP, Brainfuck).
colors:
  brand-primary: "#E85D04"
  brand-accent: "#FB923C"
  brand-accent-dark: "#C2410C"
  brand-dark: "#221e18"
  brand-light: "#f0d5b7"
  brand-gray-100: "#F1F5F9"
  brand-gray-300: "#CBD5E1"
  brand-gray-500: "#64748B"
  brand-gray-700: "#334155"
  bridge-50: "#f7ebd9"
  bridge-100: "#ecd4b3"
  bridge-200: "#e2bd8e"
  bridge-300: "#d59b6d"
  bridge-400: "#b8835a"
  bridge-500: "#93613a"
  bridge-600: "#74492b"
  bridge-700: "#5e3b22"
  bridge-800: "#3f2818"
  bridge-900: "#2a1d12"
  module-html-css: "#C13B1A"
  module-php: "#3B3F7A"
  module-javascript: "#C9A800"
  module-brainfuck: "#6B21A8"
  module-login: "#1338A0"
typography:
  display:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.2em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "1rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.brand-light}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-outline-module:
    backgroundColor: "transparent"
    textColor: "{colors.brand-dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  card-section:
    backgroundColor: "{colors.bridge-300}"
    textColor: "{colors.brand-dark}"
    rounded: "{rounded.lg}"
    padding: "1.75rem"
  switcher-tab-active:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.brand-light}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  switcher-tab-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.brand-dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
---

# Design System: Cours IUT Web

## 1. Overview

**Creative North Star: "Le pont chaleureux"**

Le système visuel est un pont en bois clair traversé en plein soleil — passage sûr et chaleureux entre l'étudiant et le savoir. La palette principale (`bridge-50` → `bridge-900`) descend du caramel toasté vers le cacao profond, dérivée littéralement de l'illustration du pont en hero. Les disciplines (HTML/CSS, PHP, JavaScript, Brainfuck) portent chacune une couleur identitaire saturée qui éclaire leurs surfaces sans contaminer les autres.

Le système rejette frontalement l'esthétique W3Schools (jaune criard, pubs envahissantes, mise en page désuète, navigation labyrinthique), les LMS universitaires gris déprimés, et le bleu corporate générique. Il rejette aussi les cards plates et les grilles d'icônes répétitives qui font « SaaS-cream ». Tout ce qui n'a pas de chaleur ou de hiérarchie n'a pas sa place ici.

**Key Characteristics:**

- Tons chauds (caramel/cacao) en surface ; jamais de gris froid par défaut
- Couleurs par module en accents identitaires forts, isolées par scoping `header-${path}`
- Cards toujours légèrement levées (shadow ambiante chaude au repos)
- Hiérarchie typographique évidente, lecture longue confortable (65-75ch corpus)
- Mode sombre soigné, pensé pour révision tardive

## 2. Colors: La Palette du Pont

La palette respire le bois et la lumière de fin d'après-midi. Les neutres tirent toujours vers le caramel — aucun gris neutre, aucun blanc pur. Les couleurs des modules sont vives, presque drapeau, mais tenues en cage par leur scope.

### Primary

- **Brûlot Orange** (`#E85D04`, `brand-primary`) : la signature du système. CTA primaires (« Continuer le cours »), tab actif du switcher, point d'accent après les titres en l'absence de couleur module. Rare, jamais un grand aplat.
- **Orange Doré** (`#FB923C`, `brand-accent`) : variante éclaircie, principalement pour le dark mode (Clerk auth, accents lisibles sur bridge-800).
- **Brique Cuite** (`#C2410C`, `brand-accent-dark`) : variante foncée, états pressés ou bordures appuyées.

### Secondary — La Palette Pont

Surface principale du système. Utilisée pour les cards, les barres sticky, les boutons surfaces.

- **Aurore** (`#f7ebd9`, `bridge-50`) : fond le plus clair, surfaces de paneaux dans dark mode.
- **Caramel Clair** (`#ecd4b3`, `bridge-100`) : alternance avec aurore, tags, états subtils.
- **Caramel Toasté** (`#e2bd8e`, `bridge-200`) : surface au hover des cards en light mode.
- **Pont Jour** (`#d59b6d`, `bridge-300`) : surface card par défaut en light mode. Le cœur visible du système.
- **Noisette** (`#b8835a`, `bridge-400`) : transitions, dividers visibles, états mid.
- **Pont Soir** (`#93613a`, `bridge-500`) : bordures, shadow color base, accents structurels.
- **Cacao Léger** (`#74492b`, `bridge-600`) : textes secondaires sur fonds clairs, accents.
- **Cacao Moyen** (`#5e3b22`, `bridge-700`) : surface card hover en dark mode, prev/next links.
- **Cacao Profond** (`#3f2818`, `bridge-800`) : surface card par défaut en dark mode, bg login Clerk dark.
- **Cacao Noir** (`#2a1d12`, `bridge-900`) : fond input dark, surfaces les plus profondes.

### Tertiary — Identités Modulaires

Une couleur par discipline, utilisée exclusivement dans le scope `.header-${modulePath}`. Texte blanc validé sur chaque (ratios ≥5.2:1, cf. `globals.css`).

- **Rouge Balise** (`#C13B1A`, `module-html-css`) : HTML5 / CSS — le rouge institutionnel HTML.
- **Indigo Dollar** (`#3B3F7A`, `module-php`) : PHP — indigo officiel, sobre et autoritaire.
- **Or Compilé** (`#C9A800`, `module-javascript`) : JavaScript — jaune assombri pour rester lisible sur fond clair (en light), `#F7DF1E` officiel sur fond bridge-800 en dark.
- **Violet Labyrinthe** (`#6B21A8`, `module-brainfuck`) : Brainfuck — violet foncé, pour la cryptique élégance des esoteric languages.
- **Bleu Profond** (`#1338A0`, `module-login`) : auth uniquement (login/register). Distinct des modules pédagogiques.

### Neutral

- **Cœur Cacao** (`#221e18`, `brand-dark`) : texte primaire en light mode, fond brand global en dark.
- **Crème Amande** (`#f0d5b7`, `brand-light`) : fond brand global en light mode, texte primaire en dark.

### Named Rules

**La Règle du Module.** Une page de cours appartient à *un* module et porte *sa* couleur. Le scope `header-${path}` propage l'identité aux titres (`h1, h2, h3`), aux utilitaires `.bg-module` et `.border-module`, et aux liens. Mélanger deux couleurs modules dans une même surface est interdit.

**La Règle des Couleurs Chaudes.** Le brand-primary est un orange. Le bleu profond (`module-login`) est cantonné à l'auth. Aucun bleu ne doit être ajouté comme accent par défaut, jamais. La chaleur de la palette est un choix stratégique non négociable.

**La Règle de l'Ombre Chaude.** Toute box-shadow utilise `rgba(147,97,58, X)` (= bridge-500) en light mode, jamais `rgba(0,0,0, X)`. En dark mode, on bascule sur `rgba(0,0,0, X)` parce qu'un fond cacao profond ne supporte pas une ombre chaude lisible.

## 3. Typography

**Display Font:** IBM Plex Sans (avec `ui-sans-serif, system-ui, sans-serif` en fallback)
**Body Font:** IBM Plex Sans (la même)
**Mono Font:** JetBrains Mono (avec `ui-monospace, SFMono-Regular, Menlo, monospace`)

**Character:** Une seule famille pour tout sauf le code. IBM Plex Sans est humaniste, légèrement technique, neutre mais chaude — bonne pédagogue sans être corporate. JetBrains Mono pour le code, distincte par le slab et le ductus, garde l'œil orienté.

### Hierarchy

- **Display** (800, `clamp(2.25rem, 6vw, 4.5rem)`, line-height 0.95, letter-spacing -0.025em) : titre hero des pages module et `[contentSlug]`. Toujours suivi d'un point en couleur module.
- **Headline** (700, 1.5rem-2rem, 1.2) : titres de section sur les landings, `<h2>` thématiques.
- **Title** (700, 1.25rem, 1.3) : titre de SectionCard, label sticky de SplitPane.
- **Body** (400, 0.875rem, 1.625) : texte courant. **Largeur max 65-75ch** sur le corpus pédagogique.
- **Label** (600, 0.6875rem, 0.2em letter-spacing, UPPERCASE) : eyebrow structurel — « Objectifs du cours », « Cours », « TP », « Précédent / Suivant ». Toujours discret mais reconnaissable.
- **Mono** (400, 0.875rem) : code inline, blocs de code, badges techniques.

### Named Rules

**La Règle de la Famille Unique.** Pas de serif. Pas de display dédié. IBM Plex Sans porte tous les niveaux du `<h1>` au `<small>`. La hiérarchie passe par poids + taille + letter-spacing, pas par changement de famille.

**La Règle de l'Eyebrow Reconnaissable.** Le pattern `text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70` est *réservé* aux étiquettes structurelles (sections, modes, indicateurs « Précédent / Suivant »). Jamais en titre principal. Sa rareté est sa force.

## 4. Elevation

Le système est *toujours légèrement levé*. Les cards portent une ombre ambiante chaude dès leur état de repos — pas plates, pas posées : prêtes à être saisies. Au hover, l'ombre s'épaissit et la card monte de 1.5 unité. La profondeur n'est pas un effet : c'est une affordance.

### Shadow Vocabulary

- **ambient-warm-low** (`box-shadow: 0 2px 12px -6px rgba(147,97,58,0.35)`) : SectionCard, NavLink prev/next, surfaces principales au repos en light mode.
- **ambient-warm-high** (`box-shadow: 0 22px 44px -14px rgba(147,97,58,0.55)`) : SectionCard hover en light mode.
- **nav-link-high** (`box-shadow: 0 18px 36px -14px rgba(147,97,58,0.5)`) : NavLink prev/next hover en light mode.
- **ambient-dark-low** (`box-shadow: 0 2px 14px -6px rgba(0,0,0,0.6)`) : équivalent dark mode au repos.
- **ambient-dark-high** (`box-shadow: 0 22px 44px -14px rgba(0,0,0,0.75)`) : équivalent dark mode hover.

### Named Rules

**La Règle du Toujours Levé.** Une card sans shadow au repos est cassée. La hiérarchie de surface (page → bridge-300 card → contenu) passe d'abord par l'ombre, ensuite par la couleur. Ne pas désactiver les shadows sans raison forte.

**La Règle de la Levée Sur Interaction.** Tout élément cliquable de niveau card (SectionCard, NavLink) gagne `-translate-y-1.5` + shadow plus intense au hover. Le mouvement est exponentiel (ease-out 300ms), jamais bounce.

## 5. Components

### Buttons

- **Shape:** `rounded-lg` (8px). Tactile, pas minimaliste.
- **Primary (filled):** background `brand-primary`, texte `brand-light`, padding `0.5rem 1rem`. Réservé aux CTA primaires (un par écran).
- **Outline-module:** bordure 2px en couleur module (`var(--color-${path})` ou variable CSS `--module-color`), bg transparent, texte `brand-dark`. Au hover : remplit avec la couleur module + texte blanc + shadow-md. Utilisé sur SectionCard pour les boutons Cours/TP/Slide/Projet/Examen.
- **Outline-module-dashed:** identique, mais `border-dashed` qui devient `border-solid` au hover. Utilisé pour le bouton « Correction » (Git).
- **Variant shadcn de base:** `Button asChild variant="outline" size="sm"` — les classes shadcn fournissent les focus rings + cursor-pointer + a11y, on twMerge par-dessus pour la couleur module.

### Cards (SectionCard)

- **Shape:** `rounded-2xl` (16px). Coins doux, presque accueillants.
- **Background:** `bridge-300` (light) / `bridge-800` (dark).
- **Border:** `bridge-500/45` (light) / `bridge-500/35` (dark) — chaude, subtile.
- **Shadow:** ambient-warm-low au repos, ambient-warm-high au hover.
- **Hover:** `-translate-y-1.5` + bg vers `bridge-200` (light) / `bridge-700` (dark).
- **Padding:** `p-7` (28px) sur mobile, `p-9` (36px) sur lg+.
- **Top edge highlight:** ligne 1px gradient horizontal `via-bridge-100/70` (clarté qui suggère une lumière du dessus).
- **Header:** chip d'ordre carré (`bg-${modulePath}`, texte blanc, mono bold) + titre h3 en couleur module + durée + cadenas si verrouillé.

### Hero (HeroSection)

- **Style:** image de fond pleine largeur (`bg-contain` mobile, `bg-cover` desktop) avec overlay gradient (`brand-light` → transparent à droite en desktop).
- **Particles:** ~70 particules en couleur module (Magic UI Particles).
- **Title:** Display, suivi d'un `.` en couleur module.
- **Underline:** barre 1px, 12-16px de large, en couleur module, juste sous le titre.
- **Compact mode:** min-height 26vh (mobile) / 34vh (desktop). Pour pages cours/TP.
- **Full mode:** min-height 60vh (mobile) / 80vh (desktop). Pour pages module landing.

### Content Switcher

- **Position:** sticky `top-(--navbar-h)` (38px), z-30.
- **Background:** `bg-brand-light/85 dark:bg-brand-dark/85` + `backdrop-blur-md`.
- **Tabs:** `rounded-lg`, gap-1, `px-3 py-2`, scroll horizontal sur overflow.
- **Active:** filled `brand-primary` + texte `brand-light` + shadow-sm + bordure `brand-primary`.
- **Inactive:** transparent + texte `brand-dark/70`, hover : bg `bridge-300/60` (light) / `bridge-700/60` (dark).
- **Reading Progress:** intégré en bas du switcher (`h-0.5`), track `bridge-500/20`, indicator en couleur module via `bg-current` + inline `style.color`.

### Navigation Prev/Next

- **Card-like Link:** `rounded-2xl`, bg `bridge-300`, ambient-warm-low.
- **Padding:** `p-4` mobile / `p-5` desktop.
- **Layout interne:** flex avec arrow icon (gauche pour prev, droite pour next, animée -1/+1 translate-x au hover) + colonne (eyebrow « Précédent/Suivant » + titre cible + icône type).
- **Hover:** `-translate-y-1`, bg vers `bridge-200`, shadow nav-link-high.

### Split Pane (mode côte-à-côte)

- **Layout:** `flex flex-col lg:flex-row` avec `lg:h-[calc(100dvh-var(--navbar-h)-3.5rem)]`.
- **Chaque colonne:** `lg:w-1/2 lg:overflow-y-auto`, séparateur central `lg:border-l lg:border-bridge-500/30`.
- **Sticky header par colonne (lg only):** label eyebrow + icône type en couleur module, `sticky top-0 backdrop-blur`.

## 6. Do's and Don'ts

### Do:

- **Do** utiliser `bridge-300` comme bg de card par défaut, `bridge-200` au hover (light) ; `bridge-800` → `bridge-700` (dark).
- **Do** scoper toute surface module-thématique par `className={\`header-${modulePath}\`}` pour que titres + utilitaires `.bg-module` / `.border-module` fonctionnent automatiquement.
- **Do** consommer la couleur module dynamiquement via `var(--color-${path})` ou via la CSS variable `--module-color` posée en inline style sur l'ancêtre, puis classes Tailwind v4 type `bg-(--module-color)`, `border-(--module-color)`, `hover:bg-(--module-color)`.
- **Do** garder les ombres chaudes en light : `rgba(147,97,58, X)`. Basculer sur `rgba(0,0,0, X)` uniquement en dark mode.
- **Do** réserver l'eyebrow `text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70` aux étiquettes structurelles (« Objectifs du cours », « Cours », « TP »).
- **Do** respecter `prefers-reduced-motion` sur Framer Motion ainsi que sur les classes `.animate-on-scroll` (déjà géré dans `globals.css`).
- **Do** capper le corpus de texte à 65-75ch (déjà fait via `max-w-6xl` sur le `<main>`, à durcir côté composants pédagogiques).
- **Do** isoler les couleurs modules : une page = un module = une couleur. Pas de mélange.

### Don't:

- **Don't** utiliser `#fff` ou `#000` pour texte ou background. Toujours teinter vers la palette bridge ou brand-dark/light.
- **Don't** introduire un bleu comme accent par défaut. Le bleu profond `module-login` est *réservé* à l'auth.
- **Don't** mélanger deux couleurs modules dans une même surface (pas de PHP indigo dans une page HTML/CSS).
- **Don't** aplatir les cards. La règle « toujours légèrement levé » est non-négociable. Une surface cliquable sans shadow est cassée.
- **Don't** utiliser `background-clip: text` + gradient pour faire du gradient text. La classe `.gradient-text` existe en hérité mais n'a pas d'usage légitime sur le contenu pédagogique.
- **Don't** empiler des grilles de cards identiques (icône + titre + texte, répété). La répétition uniforme tue la hiérarchie.
- **Don't** copier W3Schools : pubs, jaune criard, layout monobloc, navigation labyrinthique, exemples mal mis en valeur. Tout ce contre quoi le projet existe.
- **Don't** utiliser `border-left` ou `border-right` >1px comme stripe colorée d'accent (sur cards, alerts, callouts). Préférer une bordure complète, un background tinté, ou un préfixe numéro/icône.
- **Don't** ajouter de shadow froide (rgba pure noir avec haute opacité) en light mode. Garde la chaleur.
- **Don't** mettre de modal en premier réflexe. Inline et progressive disclosure d'abord.
