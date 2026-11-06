---
name: humanizer-fr
description: "Méthode anti-IA des supports de cours (cours, TP, slides, examen, quiz) : voix du TP1 de PHP, catalogue de motifs P/F, score de 0 à 100. À utiliser avant de livrer tout texte français destiné aux étudiants, et pour une relecture de style. Déclencheurs : humaniser, déslopifier, passe anti-IA, score anti-IA, relecture de style."
---

# Humanizer FR

La méthode complète est dans `docs/humanizer/humanizer-fr.md`. Lisez-la en entier avant
d'écrire ou de relire : voix cible (§ 1), ce qui ne bouge pas (§ 2), catalogue des motifs
P/F (§ 3), score (§ 4), les 8 passes (§ 5), compte rendu (§ 6). Ce fichier ne la résume
pas.

## Quand

- Avant de livrer un texte en français destiné aux étudiants : cours, TP, slides,
  examen, e-mail, consigne de quiz.
- En relecture de style d'un support existant (diagnostic par ID de motif, sans
  réécrire si on vous le demande).
- Sur vos propres propositions et synthèses en français adressées à l'utilisateur.

## Score

```bash
bun docs/humanizer/score.mjs <export.md | brouillon.json> [M] [--negations]
```

Le script donne B (rythme), V (lexique), les tirets cadratins et les phrases négatives.
M (motifs distincts présents) reste un jugement, avec la liste des occurrences. Un
brouillon JSON du pipeline (`cours.json`, `tp.json`…) est exporté par le script lui-même.

Seuil d'un support rédigé par le pipeline : **25** au plus (TP1 de PHP = 13, TP réécrits
autour de 17 à 21). Au-dessus, une passe de réécriture de plus.

Les verdicts actifs (`list_verdicts`) priment sur la méthode.
