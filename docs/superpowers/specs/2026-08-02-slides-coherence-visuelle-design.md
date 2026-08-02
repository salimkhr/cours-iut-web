# Cohérence visuelle des slides — Design

**Date :** 2026-08-02
**Statut :** validé, prêt pour le plan d'implémentation

## Problème

Les slides sont restées sur l'ancienne direction artistique alors que Cours et TP ont été refondus. Concrètement :

- **Aucune règle CSS dédiée.** `globals.css` contient ~180 lignes pour `.course-content` (rythme vertical, badges de section, ombres chaudes, largeur de lecture) et **zéro** pour les slides. `grep '\.slide-' src/app/globals.css` ne remonte rien.
- **Tokens shadcn génériques** dans tous les composants desktop : `text-muted-foreground`, `bg-background/70`, `bg-primary/50`, `text-red-500`, `bg-green-500`. Aucune référence à la palette bridge ni aux couleurs module.
- **`FooterSvg`** (236 Ko de SVG inliné en JSX, 331 paths) est encore consommé par `SlideTitle` — vestige de l'ancienne DA.
- **`bg-white` en dur** sur le mode plein écran (`SlidesScreen.tsx:150`), ce qui viole la règle « Don't utiliser `#fff` » de DESIGN.md et produit un flash blanc franc en projection.
- **Échelle typographique autonome** : `slideConfig.ts` définit ses propres tailles Tailwind, déconnectées des rôles DESIGN.md.

Point positif à préserver : `SlidesMobileView` utilise **déjà** `bg-bridge-50 dark:bg-bridge-900`. Le mobile est partiellement aligné ; seuls ses indicateurs de statut dérivent.

## Direction retenue

**Même palette que Cours/TP, langage visuel distinct.** Les slides ne sont pas « un cours en plein écran » : elles sont projetées, lues à distance, parcourues au clavier. Elles empruntent la palette bridge, les couleurs module, la typographie IBM Plex Sans et les ombres chaudes, mais assument une mise en page propre.

Deux décisions de mise en page, validées sur maquettes :

### Slide de contenu — bandeau titre + progression latérale

Le titre vit dans un **bloc plein couleur module** en haut de slide (eyebrow module discret + titre), le contenu sur fond crème en dessous. La progression est une **colonne de points discrets à droite** (elle remplace la barre de progression en pied, qui disparaît).

Rationnel : la séparation titre/contenu est nette et lisible à distance ; le bandeau porte l'identité du module sans consommer de largeur de contenu ; les points latéraux donnent position **et** étapes, ce qu'une barre de pied ne fait pas.

### Slide de titre — colonne pont + numéro

Une colonne de **36 % de largeur** portant le pont (`pont-light.png` / `pont-dark.png`), avec fondu vers le crème, reprenant le principe d'`AuthLayout` en miroir (image à gauche, contenu à droite). Le **numéro de section s'ancre en surimpression** sur l'image, en couleur module. À droite : titre suivi du point signature, filet court, description, tags.

Rationnel : réutilise l'asset pont déjà employé par le login plutôt que de réintroduire une illustration dédiée ; supprime `FooterSvg` ; le numéro en surimpression sert de repère de chapitrage quand on enchaîne les sections.

## Architecture

Les styles suivent le modèle déjà établi par Cours/TP : un bloc `.slide-*` dans `src/app/globals.css` porte le rythme vertical, le bandeau et les badges ; les composants React ne portent que la structure et les états.

Ce choix maintient la symétrie avec `.course-content` et centralise les futurs ajustements typographiques en un seul endroit, plutôt que de les disperser dans huit composants.

## Composants et traitement

| Fichier | État actuel | Cible |
|---|---|---|
| `src/app/globals.css` | aucune règle slide | nouveau bloc `.slide-*` (bandeau, rythme, badges) |
| `Slides/SlideScreen.tsx` | `header` + contenu sans identité | bandeau titre plein couleur module, contenu sur crème |
| `Slides/ui/SlideTitle.tsx` | consomme `FooterSvg` | colonne pont 36 % + numéro en surimpression |
| `Slides/SlidesScreen.tsx` | `bg-muted/30`, fullscreen `bg-white` | `bg-bridge-50 dark:bg-bridge-900`, ombres chaudes |
| `Slides/ui/SlideHeading.tsx` | `text-primary`, `text-muted-foreground` | couleur module + `brand-dark`/`brand-light` |
| `Slides/SlidesProgress.tsx` | `bg-background/80` | pastille bridge, ombre chaude |
| `Slides/progress/ProgressPoint.tsx` | `bg-primary/50`, `bg-muted-foreground/25` | points en couleur module (actif / passé / à venir) |
| `Slides/SlidesActions.tsx` | `bg-background/70` + statuts vifs | palette bridge + statuts réchauffés |
| `Slides/SlidesMobileView.tsx` | bridge OK, statuts vifs | statuts réchauffés (cohérence desktop) |
| `Slides/ui/config/slideConfig.ts` | échelle Tailwind autonome | échelle projection, alignée sur les *attributs* DESIGN.md (voir ci-dessous) |

`FooterSvg.tsx` devient orphelin une fois `SlideTitle` refait : à supprimer (236 Ko).

### Typographie : ne pas confondre alignement et copie

`slideConfig.ts` **conserve une échelle propre**. Les tailles de DESIGN.md sont calibrées pour la lecture à 50 cm (`body` = 1rem) ; les reprendre telles quelles rendrait une slide projetée illisible au fond d'une salle. L'alignement porte sur les **attributs**, pas sur les tailles :

- famille : IBM Plex Sans partout, JetBrains Mono pour le code (déjà le cas)
- graisses et `letter-spacing` : ceux des rôles DESIGN.md correspondants (display 800 / -0.025em, headline 700 / -0.015em, label 600 / 0.2em uppercase)
- le pattern eyebrow (`uppercase`, `0.2em`, 600) est réutilisé pour la mention module du bandeau — c'est son usage documenté (« étiquettes structurelles »)

Les **valeurs de taille** restent celles d'une échelle projection, révisées pour former une progression cohérente plutôt que les paliers actuels choisis au cas par cas.

### Statuts de session live

Les indicateurs live portent une information fonctionnelle (qui contrôle, qui suit, connexion perdue) et ne doivent pas perdre en lisibilité. Ils sont **réchauffés vers la palette** plutôt que supprimés :

- **Leader / vous contrôlez** → `brand-primary` (`#C2410C`, le rouge-brique du système)
- **Suiveur** → `bridge-600` neutre chaud, distingué par un point plein
- **Alerte connexion** (reconnexion, hors ligne) → `amber` conservé, déjà chaud

Les rôles restent distinguables par teinte **et** par forme du point, pas par la couleur seule (contrainte d'accessibilité de PRODUCT.md : « la couleur n'est pas le seul indicateur »).

Ce traitement s'applique **identiquement** sur desktop (`SlidesActions`) et mobile (`SlidesMobileView`), qui utilisent aujourd'hui les mêmes `text-red-500` / `bg-green-500` / `text-amber-500`.

## Cas limites

**Inversion du texte en dark mode — le point critique.** Les couleurs `module-*` en light sont sombres et calibrées pour du texte crème (≥5.9:1) ; les `module-*-dark` sont des pastels clairs calibrés pour du texte `brand-dark` (≥7.8:1). Le bandeau titre doit donc inverser sa couleur de texte selon le thème. C'est exactement le bug corrigé sur `.course-section-badge` au commit `b51f4b3` : un bandeau qui garderait le texte crème en dark serait illisible. Même pattern à appliquer.

**Titres longs.** Le bandeau accepte le retour à la ligne sans casser la hauteur de la zone de contenu ni pousser le code hors de l'écran.

**Slides sans module ni section.** `SlidesScreen` accepte `module` et `section` en optionnel et n'ajoute `SlideTitle` que si les deux existent. Le bandeau a besoin d'un repli neutre (bridge) quand `--module-color` n'est pas défini.

**Thème du pont.** Bascule `pont-light.png` / `pont-dark.png` selon le thème, comme `AuthLayout` le fait déjà via `useIsDark()` + `useMounted()`.

**Contenu existant.** `SlideBlocksRenderer` et les `Slide.tsx` des cours doivent continuer à rendre sans modification. Le rendu des blocs DB passe par le même `blockRegistry` que les cours.

## Vérification

La vérification est visuelle, pas unitaire — il n'y a pas d'assertion pertinente à écrire sur une couleur de bandeau.

Matrice de contrôle dans Chrome : **les 5 modules × light/dark**, plus le mode plein écran et la vue mobile. Les couleurs module étant la variable, c'est là qu'apparaîtront les régressions de contraste. Supports existants : `zz-test-design/tous-les-blocs`, et les slides JS/PHP déjà en base (`javascript/1-le-dom/slide`, `php/11-twig/slide`).

Garde-fous non négociables :
- `bun run lint` et `bunx tsc --noEmit` propres
- `bun test` reste à **309 pass / 3 fail** (les 3 échecs sont préexistants sur `GET /api/admin/export`)
- aucun `#fff` / `#000` littéral introduit
- aucune ombre froide (`rgba(0,0,0,…)`) en light mode

## Hors périmètre

- Le moteur de navigation, de synchronisation live et de plein écran : aucun changement fonctionnel.
- La structure des contenus de slides (`SlideBlocksRenderer`, blocs DB).
- Le format d'authoring des `Slide.tsx` existants.
