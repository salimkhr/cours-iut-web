# Règles pédagogiques — Type : Cours

## Format d'écriture : blocs

Le cours est un arbre de blocs écrit via les outils MCP (`save_content`, `insert_block`,
`edit_block`…). Avant de rédiger, appelez `list_block_types()` pour obtenir la liste à
jour des types de blocs, leurs props exactes, les blocs conteneurs et leurs enfants
autorisés. Ne devinez jamais un type ou une prop.

Conventions d'usage pédagogique (non déductibles du schéma) :

| Usage | Bloc |
|-------|------|
| Grand thème | `section` avec `title` préfixé « A — », « B — », « C — » |
| Paragraphe explicatif | `text` (markdown inline pour gras/italique/code inline) |
| Chapeau prérequis | `collapsible` avec title « À savoir pour ce cours » |
| Code d'exemple | `code` avec `language` + `title`/`filename` descriptifs — jamais de code dans un bloc `text` |
| Démonstration HTML/CSS | `code-with-preview` |
| Pièges, avertissements, rappels | `callout` avec variant `warning` / `tip` / `reminder` / `info` |
| Énumérations | `list` + `list-item` (`ordered` selon le sens) |
| Schémas et diagrammes | `diagram` (syntaxe Mermaid) |

## Chapeau obligatoire « À savoir pour ce cours »

**Toujours présent en tête de cours, avant tout contenu.**

- Bloc `collapsible` avec title exact : « À savoir pour ce cours »
- Contenu : **3 à 5 notions** du ou des cours précédents
- Chaque notion = un bloc `text` d'une phrase de rappel + un bloc `code` court
- Maximum 10 lignes de code au total dans ce chapeau
- **En mode écriture** : demander quel cours précède avant de générer ce chapeau

## Structure imposée pour chaque concept

Chaque concept du cours suit cet ordre :

1. **Contexte** — pourquoi ce concept existe, quel problème concret il résout (1 bloc `text`)
2. **Définition** — explication en langage naturel, sans jargon préalable (1 bloc `text`)
3. **Exemple minimal** — le cas le plus simple possible (bloc `code`)
4. **Exemple complet** — cas réaliste et utile (bloc `code` ou `code-with-preview`)
5. **Pièges courants** — 2 à 3 erreurs fréquentes avec explication (bloc `list` non
   ordonnée, ou `callout` variant `warning`)

## Calibrage

- Le cours se lit **avant la séance** : viser ~30 min de lecture maximum par séance
  prévue (`totalDuration` de la section, via `list_sections`).
- **Alignement cours ↔ TP** : chaque concept du cours doit être utilisé par au moins
  un exercice du TP de la section. Un concept qui n'apparaît dans aucun exercice est
  coupé ou déplacé vers une autre section.

## Règles supplémentaires

- Chaque terme technique **défini avant sa première utilisation**, jamais l'inverse
- Progression linéaire : chaque section repart de ce que l'étudiant vient d'apprendre
- Les blocs `code` ont toujours un `title` descriptif (« Syntaxe de base »,
  « Exemple complet »…)
- Un seul grand thème par bloc `section`, préfixé « A — », « B — », « C — »
