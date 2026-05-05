---
name: cours-iut-web
description: Atelier-laboratoire de cours web pour BUT Informatique, éclairé à l'heure dorée
colors:
  html-css: "#9e371a"
  php: "#53567d"
  javascript: "#D4A017"
  login: "#0000b3"
  brainfuck: "#8A2BE2"
  php-night: "#777bb4"
  studio-black: "#121212"
  studio-cream: "#ffffff"
  ink-100: "#f3f4f6"
  ink-200: "#e5e7eb"
  ink-300: "#d1d5db"
  ink-400: "#9ca3af"
  ink-600: "#4b5563"
  ink-700: "#374151"
  ink-800: "#1f2937"
  ink-900: "#111827"
typography:
  hero:
    fontFamily: "var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 6rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display:
    fontFamily: "var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  heading:
    fontFamily: "var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-emphasis:
    fontFamily: "var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.025em"
  code:
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.studio-black}"
    textColor: "{colors.studio-cream}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-outline-module:
    backgroundColor: "{colors.studio-cream}"
    textColor: "{colors.studio-black}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-ghost:
    textColor: "{colors.studio-black}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  badge-tag:
    backgroundColor: "{colors.studio-cream}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.md}"
    padding: "0.125rem 0.5rem"
    typography: "{typography.label}"
  input-default:
    backgroundColor: "{colors.studio-cream}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  card-module:
    backgroundColor: "{colors.studio-cream}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  navigation-link:
    textColor: "{colors.ink-900}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
---

# Design System: cours-iut-web

## 1. Overview

**Creative North Star: "The Neo-Mirai Lab Station"**

Un atelier-laboratoire japonais futuriste, éclairé à l'heure dorée. L'étudiant
en BUT Informatique entre dans un workshop où chaque langage est un
**instrument** identifié par sa couleur de châssis : la rouille profonde du
HTML, l'or saturé du JS, l'ardoise crépusculaire du PHP, l'indigo ukiyo-e du
Login, le violet électrique de Brainfuck. Les voyants blancs sur l'en-tête
des cartes sont des indicateurs d'état (LED). Le mono JetBrains sert de
langage du terminal pour toutes les métadonnées (durées, tags `#mono`,
libellés langage, numéros de ligne). Le glitch sur le titre du hero est le
signal CRT du studio.

Cette identité s'oppose explicitement à **W3Schools** (vieux, moche, dense
en publicités, sans hiérarchie typographique) et à toute la pédagogie
"scolaire institutionnelle" type Moodle / Sakai / Canvas (beige, formulaires
partout, hiérarchie plate). La discipline visuelle vient de Tailwind UI :
composants nets, espacements respirés, typographie disciplinée. La chaleur
Neo-Mirai vient du choix de couleurs saturées-chaudes plutôt que froides, et
d'un dark mode qui reste tiède (charbon `#121212` + glows ambrés/rouille)
plutôt que bleu-cyberpunk générique.

**Key Characteristics:**

- Couleur par langage = wayfinding strict, pas ornement
- Châssis BaseCard (bordure 2px en couleur module, en-tête coloré + LED
  blanches, corps neutre)
- Typo bicéphale : IBM Plex Sans pour la prose, JetBrains Mono pour les
  métadonnées
- Dark mode tiède (`#121212` + accents saturés) plutôt que bleu-froid
- Élévation : plat au repos, levé sur interaction (translate-y + shadow-2xl)
- Motion : tout `transition` / `animation` a un partner `motion-reduce:`

## 2. Colors

Une palette **Full palette** par contrainte produit : cinq couleurs nommées
(quatre langages + l'écran d'authentification), chacune assignée à un rôle
fixe. Aucune n'est interchangeable.

### Primary

- **Foundry Rouille** (`#9e371a`): identité **HTML/CSS**. Rouille de forge
  saturée, terre cuite. Apparaît sur le châssis (bordure et en-tête) des
  cartes module/section HTML/CSS, sur le `h2` des pages, sur les particules
  du hero, sur la bordure des `ActionButton` du module.
- **Golden Hour Amber** (`#D4A017`): identité **JavaScript**. Or saturé,
  voltage. C'est la couleur signature de l'heure dorée du système : la plus
  chaude, la plus lumineuse, posée seulement sur les surfaces JS.

### Secondary

- **Twilight Slate** (`#53567d`): identité **PHP** en mode jour. Ardoise
  violette crépusculaire, plus calme que les primaries.
- **Neon Iris** (`#777bb4`, alias `php-night`): identité **PHP** en mode
  nuit. Le slate s'éclaircit et bascule vers le violet officiel de
  l'élePHPant. Token logique unique côté CSS (`--color-php`), valeur
  swappée par `.dark`.

### Tertiary

- **Indigo Vertical** (`#0000b3`): identité **Login** uniquement. Bleu
  ukiyo-e ultra-profond, signale "vous changez de surface" (porte
  d'entrée, séparée du reste de l'app). Ne jamais utiliser hors `/login`,
  `/register`.
- **Synapse Violet** (`#8A2BE2`): identité **Brainfuck**. Violet électrique
  ésotérique, signale le langage de niche/expérimental. Jamais hors module
  Brainfuck.

### Neutral

- **Studio Black** (`#121212`): scrollbar (mode clair), fond `bg-footer` du
  dark mode, fond du Footer fixe. Pas un noir pur, légèrement levé pour
  éviter le contraste agressif sur OLED.
- **Studio Cream** (`#ffffff`): fond clair des cartes et des corps de
  contenu. **Tendance d'évolution** : tinter cette valeur de chroma 0.005
  vers la rouille (cf. The Tinted-Cream Rule ci-dessous).
- **Ink** (`ink-100` → `ink-900`, mappés sur Tailwind `gray-100` →
  `gray-900`): texte, bordures, fonds secondaires. Texte courant en
  `ink-900` (clair) / `ink-100` (sombre).

### Named Rules

**The Module-Color Rule.** Les couleurs `html-css`, `php`, `javascript`,
`login`, `brainfuck` sont du **wayfinding strict**. Elles n'apparaissent que
sur les surfaces dont elles signalent l'identité (carte module, header de
page, particules de hero du module, bordure d'ActionButton du module).
**Interdites** comme accent décoratif sur les pages neutres (admin, chat,
home), interdites en couleur de bouton générique, interdites en background
de section non-module.

**The Golden Hour Rule.** Quand plusieurs couleurs cohabitent dans une
composition (page d'accueil avec ses 4 modules), la palette penche sur le
**chaud** : Foundry Rouille et Golden Hour Amber priment visuellement,
Twilight Slate et Indigo Vertical sont leurs contre-poids. Le dark mode
**ne refroidit pas** vers le bleu : il garde le charbon `#121212` et laisse
les accents ambrés/rouille faire le glow. Pas de teinte bleu-cyberpunk
générique.

**The Tinted-Cream Rule.** Les fonds clairs (`bg-white`) sont actuellement
en `#ffffff` pur, ce qui est un héritage Tailwind. La trajectoire est de les
faire glisser vers une crème tintée chroma ≤ 0.01 vers la rouille
(`oklch(99% 0.005 30)` env.). À appliquer progressivement quand on touche
`globals.css`. Aucun nouveau composant ne doit hardcoder `#fff` ou
`bg-white` brut sans intention.

## 3. Typography

**Display Font:** IBM Plex Sans (avec `ui-sans-serif, system-ui, sans-serif`
en fallback). Sans-serif humaniste, dessinée par IBM, lecture longue-durée
confortable. C'est la voix du **prof**.

**Mono Font:** JetBrains Mono (avec `ui-monospace, SFMono-Regular, Menlo,
monospace` en fallback). Mono à ligatures, taillée pour le code. C'est la
voix du **terminal**.

**Character:** Le pairing IBM Plex × JetBrains Mono est délibérément un
pairing "métier de développement" : ce sont les polices que les étudiants
voient déjà dans leur IDE et dans la documentation IBM/JetBrains. Le site se
range parmi les outils qu'ils utilisent au quotidien plutôt que parmi les
plateformes pédagogiques institutionnelles.

### Hierarchy

- **Hero** (800, `clamp(2.25rem, 6vw, 6rem)`, line-height 1.05): titre
  d'accueil et de module, traversé par l'effet `GlitchText`. Une seule
  occurrence par page.
- **Display** (700, 3rem, line-height 1.1): titre de page interne (h1),
  niveau au-dessus du flux normal de cours.
- **Heading** (700, 1.875rem ≈ `text-3xl`, line-height 1.2): titres de
  section (h2). Préfixe alphabétique (`A-`, `B-`, `C-`) imposé dans les
  cours.
- **Title** (700, 1.5rem ≈ `text-2xl`, line-height 1.3): titres de
  sous-section (h3). Préfixe numérique (`1.`, `2.`, `3.`) imposé dans les
  cours.
- **Body** (400, 1rem, line-height 1.6): texte courant. Largeur de ligne
  bornée à **65–75ch** sur les pages de cours et de TP.
- **Body-emphasis** (600, 1rem): mise en avant inline, sans bascule
  italique.
- **Label** (500, 0.75rem, letter-spacing 0.025em, **JetBrains Mono**):
  durées (`X Séances`), tags `#mono`, libellés langage dans CodeCard,
  numéros de ligne, badges de catégorie.
- **Code** (400, 0.875rem, **JetBrains Mono**): code inline (`<Code>`),
  blocs de code (CodeCard).

### Named Rules

**The Mono-for-Metadata Rule.** JetBrains Mono est **réservé** au code et
aux métadonnées-données : extensions, tags `#mono`, durées, libellés
langage, numéros de ligne, comptes (`50 lignes`), badges de catégorie. IBM
Plex Sans tient **tout le reste** : titres, corps, navigation, boutons,
labels d'UI, descriptions. Mélanger les deux dans une même phrase est une
erreur ; basculer en mono signale "donnée".

**The 65-75ch Rule.** Le corps de texte des pages de cours est borné en
largeur de ligne entre **65 et 75 caractères**. La cible la plus exigeante
est l'étudiant qui révise la veille du partiel à 1h du mat ; au-delà de
75ch les yeux décrochent.

## 4. Elevation

**Plat au repos, levé à l'interaction.** Le système n'utilise pas de
hiérarchie tonale type Material : tout est plat sauf quand l'utilisateur
agit dessus.

### Shadow Vocabulary

- **Subtle** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`, alias
  Tailwind `shadow-xs`): boutons, inputs, badges. Suffisant pour donner une
  surface, pas de présence visuelle.
- **Resting** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`, alias
  Tailwind `shadow-md`): cartes (BaseCard) au repos. Les détache du fond
  sans les faire flotter.
- **Lifted** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`, alias
  Tailwind `shadow-2xl`): carte au hover, combinée à `-translate-y-1`. La
  carte se lève comme un instrument qu'on pose sur l'établi.
- **Card-hover-effect** (`box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15)`):
  variante custom dans `globals.css`, équivalent fonctionnel de `Lifted`.

### Named Rules

**The Lift-on-Touch Rule.** Une carte ne se lève que quand l'utilisateur
peut agir dessus (clic, focus, hover). Une carte non-cliquable reste plate.
Le mouvement vertical est un signal d'affordance, pas une décoration. La
levée est désactivée via `motion-reduce:hover:translate-y-0`.

## 5. Components

### Buttons

- **Shape:** `rounded-md` (0.375rem). Hauteur 2.25rem (`h-9`) en taille
  par défaut, padding `px-4 py-2`.
- **Primary** (shadcn `default`): fond `--primary` (héritage shadcn,
  généralement Studio Black en mode clair), texte `--primary-foreground`,
  `shadow-xs`, hover assombrit à 90%. Usage : actions neutres globales.
- **Outline / Ghost / Link** : variantes shadcn standard, conservées.
- **ActionButton** (custom, `BaseCard.tsx`) : variante signature du projet.
  Bordure 2px en couleur module, texte en couleur module, fond `bg-white`
  au repos, hover augmente la luminosité (`brightness-110`). C'est le
  bouton qui ouvre Cours / TP / Slide / Examen / Correction depuis une
  SectionCard. Padding `px-4 py-2`, hauteur 2.25rem, focus-visible avec
  anneau 2px en `currentColor`.

### Chips / Badges

- **Tag chip** (utilisé dans SectionCard) : badge shadcn variant `default`
  surchargé en bordure 2px couleur module, fond transparent, **JetBrains
  Mono** taille `text-xs`, texte préfixé `#`. Usage : tags de section
  (`#dom`, `#fetch`, `#hooks`).
- **Status / metadata chip** : `text-xs font-mono text-white` posé dans
  l'en-tête coloré d'une carte (durée séance, langage du CodeCard).

### Cards / Containers

- **BaseCard (signature)** : conteneur `rounded-lg`, bordure 2px en couleur
  module, `shadow-md` au repos, `shadow-2xl` + `-translate-y-1` au hover
  (désactivable via `withHover={false}`).
  - **Header** : fond plein en couleur module, texte blanc, optionnellement
    3 voyants blancs (`LEDIndicator`) qui pulsent au hover (désactivable
    via `withLed={false}`).
  - **Body** : fond `studio-cream` (clair) / `studio-black` (sombre, via
    `bg-footer`), padding `p-6` par défaut, alignement central.
  - **Footer** : optionnel, `p-4`, fond cohérent avec le body.
- **CodeCard (variante)** : BaseCard avec `withMarge={false}`,
  `withHover={false}`, `withLed={false}`. Header mono affichant
  `LANGUAGE` + nombre de lignes + actions (Copier / Télécharger /
  Afficher-Masquer). Body = `react-syntax-highlighter` avec thème
  `oneLight` (clair) / `oneDark` (sombre).
- **SectionCard (variante)** : BaseCard avec `withHover={false}`. Header
  mono "X Séance(s)". Body avec ordre + titre coloré, description, ligne
  de tags. Footer avec rangée d'`ActionButton` flex-1 (Cours / TP / Slide
  / Examen / Correction).

### Inputs / Fields

- **Input shadcn** : `rounded-md`, hauteur `h-9`, bordure `border-input`,
  fond transparent (clair) / `dark:bg-input/30` (sombre), `shadow-xs`.
- **Focus** : bordure `focus-visible:border-ring`, anneau 3px
  `focus-visible:ring-ring/50`. Pas de glow coloré.
- **Erreur** : `aria-invalid:border-destructive`, anneau
  `aria-invalid:ring-destructive/20`.

### Navigation

- **NavBar** : barre supérieure `border-b-2 border-border`. Items en
  `navigationMenuTriggerStyle` (h-9, `rounded-md`, `px-4 py-2`,
  `text-sm font-medium`, hover `bg-accent`).
- **Modules dans NavBar** : icône Lucide 28px + label `text-lg` masqué en
  dessous de `md:`. Visible uniquement si `isLoggedIn`.
- **ThemeToggle + LogoutButton** : ancrés `ml-auto`.

### Hero (signature)

- Section pleine largeur, `min-h-[45vh]`, `Particles` en background-z-10
  colorées par la couleur du module, `GlitchText` traversant le titre
  `text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold`.
- Côté droit (≥ `lg`) : `HeaderSvg` 500px coloré par la couleur du module.
- Animations `animate-fade-in` sur le bloc texte, `animate-fade-in-right`
  sur l'illustration.

### LED Indicator (custom)

- 3 cercles `w-2 h-2 bg-white rounded-full`, gap-2, posés dans le header
  coloré.
- Pulsent en cascade (`group-hover:animate-pulse` + `animationDelay 0.2s,
  0.4s`), désactivés en `motion-reduce`.
- `aria-hidden="true"` (purement visuel).

## 6. Do's and Don'ts

### Do:

- **Do** réserver les couleurs `html-css`, `php`, `javascript`, `login`,
  `brainfuck` à leurs surfaces propriétaires. Si tu dessines un bouton
  d'action générique, utilise Studio Black ou la variante shadcn neutre.
- **Do** utiliser BaseCard pour tout point d'entrée vers un module ou une
  section. Bordure 2px en couleur module, header coloré, body neutre. C'est
  la signature visuelle.
- **Do** doubler systématiquement le code couleur d'un libellé textuel
  (nom du module visible) ou d'un picto Lucide. La couleur n'est jamais
  l'unique porteur de sens (a11y daltonisme).
- **Do** ajouter `motion-reduce:` partner à toute `transition`, `animate-`
  ou `duration-`. Les particules, le glitch, les fade-in, le translate-y
  hover ont tous une version sans-mouvement définie.
- **Do** utiliser JetBrains Mono pour : tags `#xxx`, durées, libellés
  langage, numéros de ligne, extensions, comptes. IBM Plex Sans pour
  tout le reste.
- **Do** borner le corps de texte des cours à 65–75ch.
- **Do** garder le dark mode **tiède** : charbon `#121212` + glows
  rouille/ambre. Si tu ajoutes une couleur d'accent en mode sombre, elle
  reste dans la famille chaude.

### Don't:

- **Don't** ressembler à **W3Schools**. Concrètement : aucune publicité,
  aucun encart sponsorisé, aucun "Try it Yourself" inline qui casse la
  hiérarchie, pas de typographie système banale, pas de fond gris-bleu
  daté. Le contenu prend 100% de l'écran.
- **Don't** ressembler à **Moodle / Sakai / Canvas**. Pas de fond beige,
  pas de formulaires partout, pas d'interface plate institutionnelle. Si
  une page ressemble à un portail universitaire, elle a échoué.
- **Don't** utiliser `border-left` ou `border-right` > 1px comme bande
  colorée d'accent (callouts, alertes, list items). Le système entier
  fonctionne en bordures pleines 2px ou rien.
- **Don't** appliquer `gradient-text` (la classe existe encore dans
  `globals.css`) sur du nouveau contenu : le gradient text est banni
  par les lois partagées Impeccable. Single solid color, emphase par
  poids ou taille.
- **Don't** créer de cartes identiques à 4-couleurs sur des pages neutres.
  Le grid de ModuleCards sur la home est justifié (4 modules réels, 4
  couleurs réelles, 4 icônes réelles). Reproduire ce pattern sur une
  page sans wayfinding par couleur est de la décoration vide.
- **Don't** mélanger `<p>`, `<ul>`, `<h2>`, `<code>` bruts dans le
  contenu pédagogique. Toujours `Text`, `List`, `Heading`, `Code` /
  `CodeCard` (cf. `CLAUDE.md` section 10).
- **Don't** utiliser `#000` ou `#fff` purs pour de nouveaux fonds. Les
  fonds `bg-white` existants sont un héritage à faire glisser vers la
  crème tintée (cf. The Tinted-Cream Rule).
- **Don't** animer des propriétés CSS layout (`width`, `height`, `top`,
  `margin`). Uniquement `transform`, `opacity`, et propriétés de
  couleur.
- **Don't** utiliser `bounce` ou `elastic` comme courbe d'easing. Le
  système est en `ease-out` exponentiel (équivalent `ease-out-quart` à
  `expo`).
- **Don't** introduire un modal pour une action qui peut tenir en inline
  (édition rapide, confirmation simple). Le modal est rare et délibéré.
