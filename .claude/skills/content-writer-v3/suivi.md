# Suivi de production : statut de section et état du module (spec § 12)

Deux fichiers par module, écrits par l'orchestrateur à chaque relecture. Ils ne sont pas
commités par le skill.

## `docs/plans/<module>/<section>.md`

Le statut est TOUJOURS en tête du fichier. Si le fichier contient déjà un plan (étapes
ultérieures du pipeline), remplacez seulement le bloc « Statut » et la rubrique
« Relectures », sans toucher au reste.

```markdown
# <Titre de la section> (`<module>/<section>`)

## Statut
- **Phase** : relecture
- **Mis à jour le** : 2026-10-27
- **Validé** : rien pour l'instant | <élément> le <date>
- **Désaccords en attente** : 2 (voir « Relecture du 2026-10-27 »)
- **Prochaine action** : l'utilisateur choisit les remarques retenues à faire corriger.

## Relectures

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

La rubrique « Remarques écartées » est relue à chaque relecture suivante (règle 9 de
l'arbitrage) : une remarque qui y figure et revient remonte à l'utilisateur.

Une nouvelle relecture ajoute sa propre rubrique « Relecture du <date> » au-dessus de la
précédente ; quand il y en a plus de deux, résumez les plus anciennes en trois lignes
(date, nombre de remarques retenues, désaccords tranchés) pour que le fichier reste court.

## `docs/plans/<module>/etat.md`

```markdown
# État du module `<module>`

Mis à jour le 2026-10-27.

| # | Section | Phase | Dernière action | Date | Prochaine action |
|---|---|---|---|---|---|
| 1 | installation-cargo-premier-programme | — | — | — | — |
| 6 | structs-enums | relecture | synthèse arbitrée présentée | 2026-10-27 | choix des remarques à corriger |

## Quiz
- Dernier cadrage : non renseigné
- Sections couvertes : non renseigné
- Questions publiées : non renseigné
```

Le tableau liste TOUTES les sections du module dans l'ordre de `list_sections` (prod).
Une section jamais passée par le pipeline a une phase « — ». Mettez à jour seulement la
ligne de la section relue (et la date en tête) ; ajoutez les sections nouvelles si la
liste a changé. Les phases possibles sont celles du § 12 de la spec : cadrage, plan,
cours, slides, TP, relecture, relecture navigateur, correction, clôture.

## Reprise

À la reprise, lisez le bloc « Statut » et résumez en deux lignes : phase et date ;
désaccords en attente et prochaine action. Puis reconstruisez la liste de tâches.
