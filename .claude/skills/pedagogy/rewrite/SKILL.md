---
name: pedagogy:rewrite
description: Réécriture guidée de contenus pédagogiques à partir d'un REVIEW.md. Regroupe les problèmes par thème, brainstorme 2-3 angles de correction par thème, réécrit et marque les items comme traités.
---

# Skill — Réécriture de contenus pédagogiques IUT

## Invocation

```
/pedagogy:rewrite        → sur un dossier contenant un REVIEW.md produit par /pedagogy:review
```

---

## Étape 0 — Vérification préalable

1. Identifier le dossier cible (mentionné dans la conversation ou dossier actif)
2. Chercher `REVIEW.md` dans ce dossier avec l'outil Read
   - **Si absent** : afficher "Aucun REVIEW.md trouvé dans [dossier] — lancez d'abord `/pedagogy:review`." et s'arrêter.
3. Lire `REVIEW.md`
4. Compter les items `[ ]` (non traités) et les items `[x]` (traités)
   - **Si tous les items sont `[x]`** : afficher "Tous les points sont déjà traités. Relancez `/pedagogy:review` pour une nouvelle révision." et s'arrêter.
5. Lire les fichiers de cours présents dans le dossier : `Cours.tsx`, `Slide.tsx`, `TP.tsx`, `Examen.tsx`

---

## Étape 1 — Regroupement par thème

Analyser les items `[ ]` et les regrouper en **3–5 thèmes transversaux**.

Exemples de thèmes (adapter au contenu réel) :
- "Jargon non défini avant utilisation"
- "Guidage trop fort dans les exercices"
- "Incohérence Cours → TP"
- "Balises HTML brutes / conventions JSX"
- "Présupposés non enseignés"

Ordonner par **priorité pédagogique** : les problèmes qui bloquent la compréhension fondamentale avant les problèmes de forme (JSX, conventions).

Présenter sous ce format :

```
Thèmes identifiés (ordonnés par priorité) :

1. [Nom du thème] — N items
   Items concernés : [référence courte de chaque item]

2. [Nom du thème] — N items
   Items concernés : ...
```

Attendre la confirmation de l'utilisateur (il peut réordonner ou exclure des thèmes) avant de continuer.

---

## Étape 2 — Brainstorm thème par thème

Pour chaque thème (un à la fois, dans l'ordre validé) :

1. Citer les items concernés (texte complet depuis REVIEW.md)
2. Proposer **2–3 angles de correction** :

```
Thème : [Nom]

Items concernés :
- [item 1 — texte complet]
- [item 2 — texte complet]

Angles de correction :

A — [Titre court]
   [Description, 2-3 phrases, compromis éventuels]

B — [Titre court]
   [Description, 2-3 phrases, compromis éventuels]

C — [Titre court] (si pertinent)
   [Description, 2-3 phrases, compromis éventuels]

Votre choix (A / B / C) ?
```

3. Attendre le choix avant de passer au thème suivant.

---

## Étape 3 — Réécriture et mise à jour REVIEW.md

Pour chaque thème dont l'angle a été validé :

1. **Réécrire les passages ciblés** dans les fichiers `.tsx` correspondants
   - Expliquer chaque changement en une phrase avant de l'appliquer
   - Utiliser les outils Edit/Write sur les fichiers du dossier cible
   - Respecter les composants JSX imposés (`Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`, etc.)
   - Respecter le vouvoyé strict dans les instructions de TP

2. **Mettre à jour `REVIEW.md`** pour chaque item traité :
   - Remplacer `- [ ]` par `- [x]`
   - Ajouter sous l'item : `  > Traité : [angle choisi — résumé en une phrase]`

Exemple de mise à jour dans REVIEW.md :
```
- [x] [TP / Exercice 2] Problème : guidage trop fort → Suggestion : ...
  > Traité : Angle B — consigne reformulée en objectif fonctionnel uniquement
```

3. Après traitement de tous les thèmes, afficher :

```
REVIEW.md mise à jour — [N] items traités, [M] items restants.
```

Si tous les items sont `[x]` :
```
REVIEW.md complète — tous les points ont été traités.
```

---

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| REVIEW.md absent | Message explicite + arrêt (Étape 0) |
| Tous les items déjà `[x]` | Message explicite + arrêt (Étape 0) |
| Fichier `.tsx` mentionné dans REVIEW.md absent | Signaler le fichier manquant, passer à l'item suivant |
| Utilisateur refuse tous les angles proposés | Proposer de sauter l'item ou de brainstormer un angle personnalisé |

---
