# Suivi de production : statut de section et état du module (spec § 12)

Deux fichiers par module, écrits par l'orchestrateur. Ils sont commités à chaque point
de validation (`SKILL.md`, « Commits ») ; entre deux points, « Étape en cours » et les
réponses du cadrage sont mises à jour sans commit.

## `docs/plans/<module>/<section>.md`

Le statut est TOUJOURS en tête du fichier. Ordre des rubriques : Statut, Cadrage, Fiche
de conception, Plan, Relectures du plan, Rédaction, Écarts réalisés, Relectures (de
supports), Propagations, Matériau quiz. Une rubrique sans objet est omise. Mettez à jour seulement la
rubrique concernée, sans toucher aux autres.

```markdown
# <Titre de la section> (`<module>/<section>`)

## Statut
- **Mode** : conception | conception-rapide | relecture | redaction | examen
- **Phase** : cadrage | plan | cours | slides | TP | relecture | relecture navigateur | correction | clôture
- **Étape en cours** : cadrage : Q3 posée | plan : relecture, cycle 1 | en attente de rédaction | …
- **Mis à jour le** : 2026-10-27
- **Validé** : rien pour l'instant | fiche de conception le 2026-10-27 ; plan v2 le 2026-10-28
- **Désaccords en attente** : 2 (voir « Relectures du plan ») | aucun
- **Prochaine action** : l'utilisateur valide le plan.

## Cadrage
| # | Question | Défaut proposé | Réponse de l'utilisateur | Date |
|---|---|---|---|---|
| Q0 | courseIntroMinutes | 20 min (comme PHP 1) | défaut accepté | 2026-10-27 |
| Q1 | … | … | … | … |
- **Angles proposés** : A <nom>, B <nom>, C <nom> ; recommandé : B
- **Angle choisi** : B (« … », réponse verbatim si combinaison)

## Fiche de conception (validée le <date> | en attente)
<format dans `cadrage.md` § 4>

## Plan (version <n>, <date>)
<format dans `plan.md` § 2>

## Relectures du plan
### Cycle 1, plan v1 (<date>)
- **Rapports** : cohérence ✔ ; contrat ✔ (1 relance)
| # | Repère | Gravité | Agent | Problème | Décision | Changement fait (v2) |
|---|---|---|---|---|---|---|
#### Désaccords en attente
| # | Repère | Remarque du relecteur | Réponse de l'orchestrateur | Recommandation | Tranché par l'utilisateur |
|---|---|---|---|---|---|
#### Remarques écartées
| # | Repère | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|

## Rédaction
### Cours
- **Brouillon** : docs/plans/<module>/brouillons/<section>/cours.json (<n> blocs)
- **Rédacteur** : rendu le <date> (<n> relance(s)) ; écarts au plan : aucun | <repère : décision>
- **Score anti-IA** : <total> (M <n>, B <b>, V <v>) ; passes anti-IA de plus : <n> ; après cycle 1 : <total>
- **Cycle 1** (<date>) : rapports style ✔, cohérence ✔, fragile ✔ ; retenues <n>, écartées <n> ; ids modifiés : <liste>
| # | id | Gravité | Agents | Problème | Décision | Fait au cycle |
|---|---|---|---|---|---|---|
- **Cycle 2** (<date>) : ids relus <liste> ; retenues <n> | sans objet
- **Désaccords** : aucun | voir tableau (tranchés par l'utilisateur le <date>)
- **Validé** : <date> (réponse de l'utilisateur)
- **Prod** : save_content le <date>, contentId <id>, version <n>, comparer IDENTIQUE
- **Relecture navigateur** : OK le <date> | corrections : <ids>, réécrit version <n>
#### Remarques écartées
| # | id | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|
### Slides
...
### TP
...
### Correction
- **Run** : <run-id> ; dossiers : <liste> ; vérifications conformes <n sur n> ; non exécuté : <liste>
- **Push** : push_correction le <date> (<n> fichiers) | échec : <raison>, fichiers gardés dans <chemin>

## Écarts réalisés
| Repère | Plan validé | Réalisé | Raison | Date |
|---|---|---|---|---|

## Relectures
<rubriques « Relecture du <date> » du mode relecture, ci-dessous>

## Propagations
### <date> : <changement en une phrase>
- **Origine** : retouche <id> | décrit par l'utilisateur
- **Rapports** : <section> ✔, <section> ✔ (1 relance)
| # | Section | Support | id | Impact | Gravité | Passage concerné | Décision | Fait |
|---|---|---|---|---|---|---|---|---|
- **Sans impact** : <support> (<raison>)
- **Journal** : soldé le <date> | en attente : <raison> | sans objet

## Matériau quiz
### Gestes clés du TP
| Exercice | Code écrit (extrait) | API imposée | Résultat observé |
|---|---|---|---|
### Blocages de l'étudiant fragile
- <exercice ou notion> : <ce qu'il a dû deviner> (<id du bloc>)
### Erreurs rencontrées au TP
- <geste> : `<message réel>`
```

La rubrique « Rédaction » est remplie au fil de `redaction.md` ; « Écarts réalisés » et
« Matériau quiz » à la clôture (`cloture.md`). Les remarques écartées des supports sont
relues comme celles du plan (règle 9 de l'arbitrage).

En mode relecture, la rubrique « Relectures » a cette forme :

```markdown
### Relecture du 2026-10-27 (run `rust-structs-enums-20261027-143000`)
- **Supports relus** : cours, slides, TP (source db, prod)
- **Hors périmètre** : <support en source file, ou rien>
- **Rapports** : collecteur ✔ ; style cours ✔, slides ✔, TP ✔ ; cohérence … ; contrat ✔ ;
  fragile cours ✔, TP ✔ (1 relance) ; rapide ✔
- **Durées** : fragile <n> min / budget <b> min (<p> %) ; rapide <n> min, bonus <n> min,
  <n> min non occupées

#### Synthèse arbitrée
##### Cours
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
##### Slides
...
##### TP
...

#### Désaccords en attente
| # | id | Remarques en présence | Recommandation | Tranché par l'utilisateur |
|---|---|---|---|---|

#### Remarques écartées
| # | id | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|

#### MINEURS
Une ligne chacun : id, agent, remarque.
```

Les rubriques « Remarques écartées » (du plan comme des supports) sont relues à chaque
relecture suivante (règle 9 de l'arbitrage) : une remarque qui y figure et revient
remonte à l'utilisateur.

Une nouvelle relecture ajoute sa propre rubrique « Relecture du <date> » au-dessus de la
précédente ; quand il y en a plus de deux, résumez les plus anciennes en trois lignes
(date, nombre de remarques retenues, désaccords tranchés) pour que le fichier reste court.
Même règle pour les cycles de relecture du plan d'une version validée antérieure.

Un fichier de section écrit avant le 2026-10-27 (étape 1) n'a ni « Mode » ni « Étape en
cours » : ajoutez-les à la première mise à jour (`relecture`, « synthèse présentée »).

## `docs/plans/<module>/etat.md`

```markdown
# État du module `<module>`

Mis à jour le 2026-10-27.

| # | Section | Phase | Dernière action | Date | Prochaine action |
|---|---|---|---|---|---|
| 1 | installation-cargo-premier-programme | — | — | — | — |
| 6 | structs-enums | relecture | synthèse arbitrée présentée | 2026-10-27 | choix des remarques à corriger |
| 7 | traits | plan | plan v2 validé | 2026-10-28 | rédaction du cours |

## Quiz
- Dernier cadrage : non renseigné
- Sections couvertes : non renseigné
- Questions publiées : non renseigné

## Propagations
- <date> : <changement> ; sections touchées : <liste> ; état : rapport présenté | en cours | terminé
```

Le tableau liste TOUTES les sections du module dans l'ordre de `list_sections` (prod).
Une section jamais passée par le pipeline a une phase « — ». Mettez à jour seulement la
ligne de la section traitée (et la date en tête), à chaque point de validation ;
ajoutez les sections nouvelles si la liste a changé. Les phases possibles sont celles
du § 12 de la spec : cadrage, plan, cours, slides, TP, relecture, relecture navigateur,
correction, clôture. Une propagation ne change pas la phase d'une section : elle se note
dans sa rubrique, et la section garde sa phase.

## `docs/plans/<module>/quiz.md`

Un fichier par module, écrit en mode `quiz` : cadrage (Q1 à Q7, réponses, date), puis une
rubrique par passage du workflow, la plus récente en tête.

```markdown
## Passage du <date> : sections <liste>
- **Étape en cours** : cadrage : Q3 posée | tests | en attente de validation | terminé
- **Répartition Bloom** : comprendre <n>, appliquer <n>, analyser <n>, evaluer <n>
| Id en prod | Candidate | Sections | Geste | Notion | Type | Bloom | Lecture croisée | Pourquoi retenue |
|---|---|---|---|---|---|---|---|---|
- **Écartées** : <id> : <raison>
```

## Reprise

À la reprise, lisez le bloc « Statut » et résumez en deux lignes : phase, étape en cours
et ce qui est validé ; désaccords en attente et prochaine action. Puis reconstruisez la
liste de tâches du mode et reprenez à la première tâche non faite (`SKILL.md` § 1).
