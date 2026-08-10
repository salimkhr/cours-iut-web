# Revue finale — Blocs à deux codes, gabarit d'aperçu et édition étudiante

**Date :** 2026-08-09 → 2026-08-10
**Plan :** `docs/superpowers/plans/2026-08-09-double-code-preview.md`
**Spec :** `docs/superpowers/specs/2026-08-09-double-code-preview-design.md`

## 1. Résultat de la revue de branche complète

Les 10 tâches du plan ont chacune été implémentées puis revues individuellement (spec +
qualité), avec une seule boucle de correction sur la Task 5 (test de synchronisation de
schéma manquant). Une **revue finale sur l'ensemble du diff** (14 commits, base
`9585069`..`66cacce`) a ensuite trouvé un défaut qu'aucune revue par tâche ne pouvait voir :
un bug de composition, invisible tant qu'on ne regarde qu'une tâche à la fois.

### Bug critique trouvé

**L'édition rétroactive activait un bouton « Modifier » mort sur le contenu déjà publié.**
`buildLegacyDocument` (chemin historique, sans marqueur `@edit:`) n'utilise `code` que pour
les blocs CSS — il l'injecte dans `<style>`. Pour tout autre langage avec un `preview` rempli
et aucun marqueur, le document est construit uniquement à partir de `preview` : `code` n'est
jamais lu. Or `editable` valait `true` dès que tous les langages étaient exécutables, sans
condition sur la présence d'un marqueur. Conséquence : les 24 blocs HTML de
`/html-css/1-rappel-de-html/cours` affichaient un bouton « Modifier » fonctionnel en
apparence, dont la frappe ne changeait jamais l'aperçu.

### Vague de correctifs (5 fixes, un seul passage)

| # | Correctif | Fichier(s) | Commit |
|---|---|---|---|
| 1 (critique) | `editable` exige un marqueur, sauf pour le CSS (seul chemin historique où `code` atteint réellement l'aperçu) | `src/lib/previewDocument.ts` | `d645e92` |
| 2 | `allow-modals` ajouté au `sandbox` de l'iframe — `alert()`/`confirm()` fonctionnent dans l'aperçu JS (jamais `allow-same-origin` ni `allow-forms`) | `src/components/Cards/CodeWithPreviewCard.tsx` | `1ac01dd` |
| 3 | Refus Zod si `secondaryCode` est rempli sans `secondaryLanguage`, synchronisé entre les deux schémas | `src/lib/blockSchemas.ts`, `src/lib/blockDefs.ts` | `ea5a7f4` |
| 4 | Montage unique de Monaco/l'iframe (au lieu de deux copies simultanées, une cachée) via `lg:contents` | `src/components/Cards/CodeWithPreviewCard.tsx` | `b0187e8` |
| 5 | `placeholder` MCP restauré (perdu au passage à `type: "code"` en Task 8), plombé jusqu'à Monaco | `src/components/builder/CodeField.tsx`, `src/lib/blockDefs.ts` | `f01de77` |

Une **re-revue ciblée** a vérifié chacun des 5 correctifs indépendamment (traçage à la main,
pas prise au mot du rapport de l'implémenteur) : les 5 sont **ADDRESSED**, aucune nouvelle
régression Critical/Important.

## 2. Résidus mis en attente à la fin de la revue

Trois points relevés par la re-revue, non bloquants mais réels :

1. **Le même défaut que le bug critique, sur le panneau secondaire d'un bloc CSS sans
   marqueur.** `isLegacyCssPath` autorise `editable` dès que `language === "css"`, mais le
   chemin historique CSS n'injecte que `code` dans `<style>` — jamais `secondaryCode`. Un
   bloc `{language: "css", secondaryLanguage: "html", …}` sans marqueur affiche donc un
   bouton « Modifier » sur les **deux** panneaux, alors que seul le premier a un effet réel.
   Indice trouvé en base : 23 boutons « Modifier » sur 22 cartes sur
   `/html-css/2-rappel-css/cours`.
2. **Aucun audit de la base** pour compter les blocs existants que le nouveau refus Zod
   (correctif 3) rendrait désormais impossibles à sauvegarder (`secondaryCode` sans
   `secondaryLanguage`).
3. **`DynamicPropsEditor.tsx:127`** affiche `options[0]` (« javascript ») pour tout champ
   `select` dont la prop est non définie — inoffensif avant le correctif 3, mais désormais
   trompeur : un auteur voit un select qui semble rempli, puis reçoit une erreur de
   validation qui semble contredire ce qu'il voit à l'écran.

## 3. Statut des résidus après cette session

- **Résidu 1** (bug CSS + panneau secondaire) : corrigé, commit `874b370`. `editable` exige
  désormais `panels.length <= 1` sur le chemin historique CSS — un bloc CSS avec panneau
  secondaire n'est éditable qu'avec un marqueur ciblant explicitement ce second champ.
- **Résidu 2** (audit base) : exécuté en lecture seule. **0 bloc existant** n'est concerné,
  ni par le refus Zod (résidu 3) ni par le bug CSS + secondaire (résidu 1) — aucune urgence
  de déploiement sur le contenu déjà publié.
- **Résidu 3** (select trompeur) : corrigé, commit `f825d2f`. `DynamicPropsEditor` affiche le
  `placeholder` du champ au lieu de `options[0]` quand la valeur est vide ou absente.

## 4. Référence — les blocs porteurs de code

Cinq types de blocs dans le registre (`src/lib/blockDefs.ts`) permettent d'afficher du code,
catégorie « Code » sauf mention contraire :

| Type | Usage |
|---|---|
| `code` | Extrait de code coloré simple. `filename`, numéros de ligne, repli, lignes surlignées. |
| `code-with-preview` | Un ou deux codes présentés + aperçu live avec marqueurs `@edit:<langage>`. Édition étudiante si tous les langages sont exécutables par le navigateur. |
| `input-card` | Code titré + phrase d'explication, sans aperçu rendu. Pour un catalogue d'exemples comparables. |
| `download-file` *(catégorie Médias)* | Bouton de téléchargement d'un fichier généré (`filename` + `code`). |
| `slide-code` *(catégorie Slides)* | Code dans une slide, étapes d'animation `highlight` séparées par `\|`. |
