# Design — Refonte génération cours & TP du skill pédagogie

Date : 2026-07-02
Statut : validé en brainstorm, en attente de plan d'implémentation

## Contexte et problème

Le skill `skills/pedagogie/` (servi via MCP `get_pedagogical_skill_manifest` /
`get_pedagogical_skill_document`) guide la génération des contenus pédagogiques.
Trois problèmes identifiés sur les cours et TPs générés :

1. **Calibrage absent** — aucune règle ne relie la longueur d'un cours ou d'un TP à la
   durée réelle des séances. Les durées varient par module (PHP 2h30, JS 2h,
   HTML/CSS 1h30) et certains modules sont des bonus à faire chez soi (`isExtra`).
2. **TPs abstraits** — les exercices manipulent des cas d'école déconnectés
   (fonctions `foo`, additions de nombres) au lieu de construire quelque chose de concret.
3. **Interdiction du fil rouge intra-TP** — la règle « chaque exercice testable de manière
   autonome — pas de dépendance exercice N → N+1 » de `ref-tp` empêche les TPs
   « construction » où l'on bâtit un livrable de bout en bout.

Problème transverse : les références éditoriales (`ref-cours`, `ref-tp`) sont écrites en
termes de composants JSX et de fichiers `.tsx` (`<CodeCard>`, imports `@/components/...`,
chemins `src/cours/php/`), alors que l'écriture passe désormais par les blocs MongoDB via
MCP (`save_content`, `insert_block`). Le modèle improvise la correspondance JSX → blocs.

## Décisions

| Sujet | Décision |
|-------|----------|
| Structure d'un TP | Exercice 1 indépendant (échauffement), exercices 2+ en fil rouge séquentiel |
| Étudiant bloqué dans le fil rouge | Filet léger : récapitulatif d'état en tête de chaque exercice, pas de code de rattrapage à maintenir |
| Échelle du fil rouge | Selon le module : projet annuel quand il existe (PHP → Netflex), sinon livrable autonome par TP (HTML/CSS, JS) |
| Source de la durée de séance | Nouvelle prop du **module** (`sessionDurationMinutes`), pas de la section |
| Budget temps d'un TP | `section.totalDuration` × `module.sessionDurationMinutes` − temps de cours en séance |
| Temps de cours en séance | Estimé depuis les slides : nb de slides × ~2 min (via `get_content`) ; fallback forfaitaire 30 min sur la première séance si les slides n'existent pas encore |
| Modules bonus | `isExtra: true` (existant) → aucune contrainte de durée, TP auto-suffisant à faire chez soi |
| Liste des blocs dans les références | Jamais dupliquée : renvoi vers `list_block_types()` comme source de vérité |
| Périmètre traduction JSX → blocs | `ref-cours` et `ref-tp` uniquement ; `ref-slide` et `ref-examen` plus tard |

## 1. Schéma & MCP

- Ajouter `sessionDurationMinutes?: number` à `src/types/Module.ts`.
- Exposer la prop dans les outils MCP `create_module` et `edit_module` (Zod
  `z.number().int().min(1).optional()`), et la renvoyer dans `list_modules`.
- Renseigner les valeurs en base : PHP 150, JS 120, HTML/CSS 90. Les modules
  `isExtra` restent sans valeur.

## 2. `ref-tp` — refonte

### Nouveau modèle de TP

- **Livrable annoncé d'entrée** : le TP s'ouvre sur « À la fin de ce TP, vous aurez
  construit X » — X est concret et démontrable (un jeu, une galerie filtrée, une page
  de profil…), jamais « des exercices sur les boucles ».
- **Exercice 1 — échauffement indépendant** : application directe de la notion du cours,
  sans lien avec le fil rouge, démarrable même sans avoir tout compris. Guidage fort
  (fichier cible + méthode/API imposée + résultat attendu + critère de validation).
- **Exercices 2+ — fil rouge séquentiel** : chaque exercice fait avancer le livrable en
  s'appuyant sur le précédent. La règle « chaque exercice testable de manière autonome »
  est **supprimée**. Guidage dégressif conservé (fort au début, objectif + contraintes
  ensuite).
- **Récapitulatif d'état** : chaque exercice du fil rouge s'ouvre sur
  « À ce stade, votre projet contient : … » (généralisation de la règle Netflex).
- **Anti-abstraction** : au-delà de l'exercice 1, les exercices manipulent les données
  réelles du livrable (films, scores, produits…), jamais de `foo`/`bar` ni de fonctions
  jouets. Le bloc `download-file` peut fournir des fichiers de départ (données réalistes).

### Deux échelles de fil rouge

- **Projet annuel** (PHP → Netflex) : règles existantes conservées, mais l'état du projet
  se reconstruit via `list_sections` + `get_content` sur les TPs précédents du module —
  plus jamais par lecture de `src/cours/php/`.
- **Livrable par TP** (HTML/CSS, JS…) : chaque TP construit un objet terminé, sans
  dépendance entre TPs.

### Calibrage

- Budget = `totalDuration × sessionDurationMinutes − temps de cours en séance`
  (durées lues via `list_modules` / `list_sections`).
- Temps de cours en séance : nombre de slides de la section × ~2 min (lu via
  `get_content(module, section, "slides")`). Si les slides n'existent pas encore,
  fallback forfaitaire : 30 min déduites de la première séance.
- Le fil rouge doit être finissable dans le budget par un étudiant moyen.
- Chaque exercice porte une durée indicative ; la somme est vérifiée à la rédaction.
- Modules `isExtra` : pas de contrainte de durée, TP auto-suffisant.

### Conservé tel quel

Impératif vouvoyé, jamais de code solution (même partiel), schéma Définir → Utiliser,
guidage dégressif, fichier cible + résultat attendu + critère de validation sur les
exercices guidés.

## 3. `ref-cours` — calibrage

Le schéma par concept (contexte → définition → exemple minimal → exemple complet →
pièges) ne change pas. Ajouts :

- **Temps de lecture** : le cours se lit avant la séance en ~30 min max par séance
  prévue (`totalDuration`).
- **Alignement cours ↔ TP** : chaque concept du cours doit être utilisé par au moins un
  exercice du TP ; un concept absent du TP est coupé ou déplacé.

## 4. Rôles — ajustements

- **Auditeur apprenant** (`agents/auditeur-apprenant.md`) : nouveaux points de contrôle —
  le fil rouge est-il réalisable dans le budget temps ? L'état du projet annoncé en tête
  de l'exercice N correspond-il au résultat réel de l'exercice N−1 ?
- **Garant de cohérence** (`agents/garant-coherence.md`) : vérifie la chaîne du fil rouge
  (aucun exercice ne suppose du code jamais écrit) et la somme des durées indicatives vs
  le budget de la section.

## 5. Traduction JSX → blocs (`ref-cours`, `ref-tp`)

- Réécrire les deux références en termes de **types de blocs** du registre
  (`src/lib/blockDefs.ts`) : plus aucune mention de JSX, d'imports `@/components/...`
  ni de fichiers `.tsx`.
- **Ne pas dupliquer la liste des blocs** : les références instruisent d'appeler
  `list_block_types()` pour obtenir la liste à jour (props exactes, blocs conteneurs,
  enfants autorisés).
- Les références ne conservent que les **conventions d'usage pédagogique** non déductibles
  du schéma, par exemple :
  - chapeau « À savoir pour ce cours » = bloc `collapsible` avec ce titre exact ;
  - structure `A-`/`B-`/`C-` = blocs `section` avec prop `title` préfixée ;
  - tout code dans un bloc `code` avec `title`/`filename` descriptifs, jamais dans un
    bloc `text` ;
  - encadrés pédagogiques = `callout` avec le `variant` adapté (info/warning/tip/reminder) ;
  - démonstrations HTML/CSS = `code-with-preview`.
- Les règles éditoriales de fond restent identiques (définir avant d'utiliser, un thème
  par `section`, progression linéaire…).
- `ref-slide` et `ref-examen` sont hors périmètre (chantier ultérieur).

## Hors périmètre

- Refonte de `ref-slide` et `ref-examen` (traduction blocs, étoffement).
- Intégration de l'examen comme 4e support dans les rôles et le contrat d'entrée.
- Modification du routage / workflow de `SKILL.md` (seule la régénération du manifest
  suit mécaniquement les éditions de documents).

## Critères de réussite

- `list_modules` renvoie `sessionDurationMinutes` pour PHP (150), JS (120),
  HTML/CSS (90) ; rien pour les modules `isExtra`.
- `ref-tp` et `ref-cours` ne contiennent plus aucune référence JSX, `.tsx` ou
  `src/cours/`.
- Un TP généré avec le skill révisé : exercice 1 indépendant, fil rouge ensuite,
  récapitulatifs d'état, durées indicatives dont la somme respecte le budget
  (déduction faite du temps de cours estimé depuis les slides).
- Le manifest (`manifest.json`) est régénéré après édition des documents
  (`content_hash` à jour).