# Quiz UI Redesign — Design Spec

**Date:** 2026-05-27
**Branch:** feat/tp-quiz
**Scope:** `src/components/quiz/` — tous les composants + `src/app/[moduleSlug]/[sectionSlug]/quiz/page.tsx`

---

## Contexte

La page quiz est fonctionnellement correcte mais visuellement insuffisante. Trois problèmes critiques identifiés :

1. `bg-${modulePath}` dans `QuizGame` — classe Tailwind dynamique non générée par JIT → couleur absente en production.
2. Barre de progression flottante (`h-1.5` sans padding vertical), déconnectée du header.
3. Écran de résultat inexistant — le score n'apparaît qu'en petit dans le header, aucune hiérarchie visuelle.

---

## Ce qui ne change pas

`QuizPageLayout` est conservé tel quel : fond escalier, gradient overlay, blobs ambiants, titre "Quiz.", lien retour. Seul le contenu de la card (enfant de `QuizPageLayout`) est redesigné.

---

## Architecture de la card

### Layout split

```
┌──────────────────────────────────────────────────┐
│  Sidebar (72px)  │  Main (flex-1)                 │
│  couleur module  │  fond bridge glassmorphism      │
└──────────────────┴────────────────────────────────┘
```

- `max-w-[560px]` (au lieu de 480px actuel)
- `grid-template-columns: 72px 1fr`
- `border-radius: 1rem`, `overflow: hidden`
- Ombre et backdrop-blur identiques à l'existant

**Mobile (< `sm` / 640px)** : la sidebar disparaît (`hidden sm:block`), remplacée par une barre de progression `h-1.5` pleine largeur en haut de la card (layout redevient colonne avec `grid-cols-1 sm:grid-cols-[72px_1fr]`).

---

## Sidebar

Fond : `style={{ backgroundColor: moduleColor }}` (CSS variable, corrige le bug JIT).

Contenu de haut en bas :

| Élément | Description |
|---------|-------------|
| Icône module | `w-8 h-8`, `bg-white/20 rounded-xl`, `ClipboardCheck` de Lucide (identique à l'existant) |
| Nom module | `text-[8px] uppercase tracking-widest text-white/55` |
| Arc de progression | `conic-gradient` proportionnel à `currentIndex / questions.length`, `w-11 h-11 rounded-full` avec cercle blanc centré, valeur `X/N` au centre |
| Étapes numérotées | Colonne de `N` pastilles `w-6 h-5 rounded-md` : `done` = `bg-white/85 text-[moduleColor]` + ✓, `curr` = `bg-white/40 text-white`, `pending` = `bg-white/18 text-white/50` |
| Spacer flex-1 | |
| Score live | Cercle `w-9 h-9 border-2 border-white/25`, valeur entière + label "pts" |

---

## Phase : answering

Zone main :

```
padding: px-4 pt-3 pb-4
gap: flex-col gap-3
```

- **Header ligne** : label `QUESTION` (`text-[9px] uppercase tracking-[0.16em] font-bold` + `style={{ color: moduleColor }}`) + compteur `X / N` (`text-[9px] text-bridge-500`) alignés `justify-between`
- **Texte question** : `text-sm font-bold text-brand-dark dark:text-bridge-100 leading-snug`
- **Choix** : boutons `w-full text-left px-3 py-2 rounded-lg border-[1.5px] text-xs flex items-center gap-2 cursor-pointer transition-colors duration-150`
  - Indicateur radio : `w-3.5 h-3.5 rounded-full border-[1.5px] flex-shrink-0`
  - État sélectionné : `border-2 bg-bridge-50 dark:bg-bridge-900/60` + `style={{ borderColor: moduleColor }}`, indicateur rempli avec `style={{ backgroundColor: moduleColor }}`
  - État neutre : `border-border bg-white/65 hover:bg-bridge-50 dark:hover:bg-bridge-800/50`
- **Bouton "Vérifier"** : `justify-end`, désactivé si aucune réponse sélectionnée, `style={{ backgroundColor: moduleColor }}` quand actif

---

## Phase : feedback (après "Vérifier")

Révélation complète — tous les choix se colorent simultanément :

| État du choix | Style |
|---------------|-------|
| Bonne réponse | `border-green-500 bg-green-50/80 dark:bg-green-950/20 text-green-900` + indicateur ✓ vert |
| Explication | Affiché inline **sous la bonne réponse** : `text-[10px] text-green-800/80 dark:text-green-300/70 pl-5 pb-1 leading-relaxed` |
| Sélection fausse | `border-red-500 bg-red-50/80 dark:bg-red-950/20 text-red-900` + indicateur ✗ rouge |
| Autres choix | `opacity-35 cursor-not-allowed` |

Pas de bannière séparée. L'explication vit directement sous la bonne réponse.

**Flux de données** : `explanation` vient de `QuizCheckResult.explanation` (réponse du `POST /check`). `QuizGame` reçoit ce champ dans `feedback` et le passe à `QuizQuestion` via la prop `explanation?: string`. `QuizQuestion` affiche cette prop inline sous la bonne réponse quand `hasFeedback === true`.

Bouton : "Suivant →" ou "Terminer" selon `isLastQuestion`, même style que "Vérifier".

---

## Phase : summary (écran de résultat)

### Sidebar résultat

- Icône `ClipboardCheck` dans `w-8 h-8 bg-white/20 rounded-xl`
- Score `font-black text-2xl text-white` + `/N` en `text-[10px] text-white/60`
- Mini-segments verticaux `h-1 w-7` (vert = correct, rouge = incorrect) — même couleurs que la phase feedback

### Main résultat

```
padding: px-4 py-4
gap: flex-col gap-3
```

- **Label** : `RÉCAPITULATIF` en `text-[9px] uppercase tracking-widest font-bold` + `style={{ color: moduleColor }}`
- **Liste des questions** : une ligne par question
  - Badge `w-4 h-4 rounded-full text-[8px] font-bold` : vert clair + `✓` / rouge clair + `✗`
  - Texte tronqué de la question : `text-[11px] text-brand-dark truncate`
- **Séparateur** `h-px bg-bridge-700/15 dark:bg-bridge-500/15 -mx-4`
- **Boutons** : `justify-between` — ghost "Retour au TP" + primary "Réessayer"

---

## Corrections techniques incluses

| Problème | Correction |
|----------|------------|
| `bg-${modulePath}` | Remplacer par `style={{ backgroundColor: moduleColor }}` dans tous les éléments concernés |
| `className={cn("...", \`bg-${modulePath}\`)}` | Idem — inline style sur tous les éléments qui nécessitent la couleur module comme fond |
| `QuizProgress.tsx` | Composant inutilisé dans le nouveau design (sidebar gère la progression) — garder mais ne plus importer dans `QuizGame` |

---

## Composants impactés

| Fichier | Changement |
|---------|------------|
| `src/components/quiz/QuizGame.tsx` | Refactoring complet — split layout, sidebar, toutes les phases |
| `src/components/quiz/QuizQuestion.tsx` | Ajout de l'explication inline + révélation complète des choix |
| `src/components/quiz/QuizPageLayout.tsx` | Inchangé |
| `src/components/quiz/QuizProgress.tsx` | Inchangé (conservé mais non utilisé dans la nouvelle version) |

---

## Accessibilité

- `role="radiogroup"` conservé sur les groupes de choix
- `aria-checked` / `aria-pressed` conservés
- `aria-disabled` ajouté sur les choix désactivés (phase feedback)
- Focus visible (`focus-visible:ring-2`) sur tous les boutons interactifs
- `prefers-reduced-motion` : supprimer les transitions si activé
