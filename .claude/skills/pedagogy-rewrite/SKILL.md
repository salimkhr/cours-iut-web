---
name: pedagogy-rewrite
description: À utiliser quand un REVIEW.md contient des items non traités à corriger dans un contenu pédagogique.
---

# Skill — Réécriture de contenus pédagogiques IUT

## Invocation

```
/pedagogy:rewrite [module] [section]   → sur une section dont le REVIEW.md est dans reviews/
```

## Étape 0 — Vérification préalable

1. Identifier `module` et `section` (slugs DB, via args, conversation ou question).
2. Lire `reviews/[module]-[section]-REVIEW.md` avec l'outil Read.
   - **Absent** : afficher « Aucun REVIEW.md trouvé pour cette section — lancez
     d'abord `/pedagogy:review`. » et s'arrêter.
3. Compter les items `[ ]` et `[x]`.
   - **Tous `[x]`** : afficher « Tous les points sont déjà traités. Relancez
     `/pedagogy:review` pour une nouvelle révision. » et s'arrêter.
4. Lire le contenu via MCP : `get_content(module, section, type)` pour chaque support
   cité dans le REVIEW.md. **Aucun contenu en DB → STOP** (pas de repli sur
   `src/cours/*.tsx`).
5. Lire la référence du type concerné (`skills/pedagogie/references/tp.md`,
   `cours.md`…) : toute réécriture doit respecter ces règles, en particulier le
   **contrat de consigne universel** des TP.

## Étape 1 — Regroupement par thème

Regrouper les items `[ ]` en **3–5 thèmes transversaux**, ordonnés par priorité
pédagogique (ce qui bloque la compréhension avant la forme). Exemples : « Jargon non
défini avant utilisation », « Consignes sans résultat observable », « TP
sous-dimensionné », « Exemples hors univers ».

Présenter les thèmes avec leurs items et **attendre la validation de l'utilisateur**
(il peut réordonner ou exclure).

## Étape 2 — Brainstorm thème par thème

Pour chaque thème validé, un à la fois :

1. Citer les items concernés (texte complet du REVIEW.md).
2. Proposer 2–3 angles de correction (titre + description + compromis).
3. Attendre le choix (A / B / C) avant de passer au thème suivant.

Contrainte transversale : aucun angle ne peut retirer un élément du contrat de
consigne (fichier cible, noms exacts, données d'entrée, résultat observable, critère
de validation). Alléger le guidage = retirer les étapes intermédiaires, jamais le
contrat.

## Étape 3 — Réécriture via MCP et mise à jour du REVIEW.md

Pour chaque thème dont l'angle est validé :

1. Appeler `list_block_types()` avant toute écriture.
2. Corriger les blocs ciblés via `edit_block` / `insert_block` / `delete_block` /
   `reorder_blocks` — expliquer chaque changement en une phrase avant de l'appliquer.
3. Vérifier le résultat réel avec `get_content` après chaque lot de modifications.
4. Mettre à jour `reviews/[module]-[section]-REVIEW.md` :
   - `- [ ]` → `- [x]`
   - Ajouter sous l'item : `  > Traité : [angle choisi — résumé en une phrase]`

Après tous les thèmes, afficher : `REVIEW.md mise à jour — [N] items traités,
[M] items restants.`

5. Invoquer `/pedagogy:sync` sur le module/section.

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| REVIEW.md absent | Message explicite + arrêt (Étape 0) |
| Tous les items déjà `[x]` | Message explicite + arrêt (Étape 0) |
| Contenu absent de la DB | Message explicite + arrêt (Étape 0) |
| Bloc cité dans REVIEW.md introuvable | Signaler, passer à l'item suivant |
| Utilisateur refuse tous les angles | Proposer de sauter l'item ou brainstormer un angle personnalisé |
