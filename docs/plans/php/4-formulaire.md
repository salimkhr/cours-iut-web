# Formulaire (`php/4-formulaire`)

## Statut
- **Phase** : relecture
- **Mis à jour le** : 2026-10-27
- **Validé** : rien pour l'instant
- **Désaccords en attente** : 1 (voir « Relecture du 2026-10-27 »)
- **Prochaine action** : l'utilisateur tranche le désaccord et choisit les remarques retenues à faire corriger.

## Relectures

### Relecture du 2026-10-27 (run `php-4-formulaire-20261027-094328`)
- **Supports relus** : cours (v201), slides (v141), TP (v294), source db, prod
- **Hors périmètre** : rien
- **Budget** : `courseIntroMinutes` absent en base ; hypothèse validée par l'utilisateur : 2 × 180 − 20 = 340 min
- **Rapports** : collecteur incomplet (budget, résolu par l'hypothèse) ; style cours ✔, slides ✔ (1 relance de couverture), TP ✔ (compte de blocs non recoupé : get_content hors limite) ; cohérence cours ✔, slides ✔, TP incomplet (10 résultats sur ~61 confrontés, dépôt injoignable) ; contrat incomplet (aucune durée) ; fragile cours incomplet (3 notions du brief absentes), TP ✔ ; rapide ✔ (bonus : critère ✘)
- **Durées** : fragile 311 min / budget 340 min (91 %, dans la plage) ; rapide 141 min, bonus 19 min, 180 min non occupées
- **État de départ de la partie Onzer** : fin de TP3 produite par l'étudiant fragile de la section 3 (pas l'état de référence, dépôt injoignable) ; aucun écart gênant signalé. Capture de la page de connexion conforme.
- **Limite de l'export** : l'« Indice : associer un titre à sa durée » est un `collapsible` sur le site, rendu comme un titre `###` par l'export compact.

#### Synthèse arbitrée
##### Cours
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | cours entier | BLOQUANT | cohérence, fragile | Trois notions du brief absentes : `mb_strlen`, paramètres d'URL sans formulaire + 404 (`http_response_code`), tableaux parallèles `track[]` / `duration[]` | Voir désaccord n° 1 | à trancher |
| 2 | form-complex-read-text | MAJEUR | style | « sans choix, la clé est absente » vaut pour le radio, pas pour le select simple (option `value=""` envoyée) | Distinguer les deux cas | retenue |
| 3 | form-complex-radio, -checkbox, -select, -multiple | MAJEUR | cohérence | Aucun `callout warning` sur les champs à choix (`name` sans `[]` : seule la dernière valeur arrive ; case décochée : clé absente) | Un callout avec le message réel | retenue |
| 4 | form-simple-flow-code, form-errors-*, 2c6f1e79, c674d4e7, 6fc71e97, 6a9c4c97 | MAJEUR | fragile, style | Fragments dispersés (ordre des déclarations), signature de `render()` et contenu de `header.php` non rappelés, `view_search.php` jamais montré | Renvoyer au fichier complet, rappeler `render()`, montrer `view_search.php` | retenue (règle 2) |
| 5 | form-recall-cycle-text, a68e57b7, 6a9c4c97, form-errors-prg-code | MINEUR | style, cohérence | Annonces de plan, page de destination du PRG non définie | Corriger | MINEUR |

##### Slides
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | d0ee1334, dd1d3ddc, 9673330d, 7117cc34, ea3145d8 | MAJEUR | cohérence | Champs `email`, `password`, `date`, `textarea`, `hidden` présents dans les slides, absents du cours | Une ligne chacun dans le cours (le TP utilise `textarea`) | retenue |
| 2 | (aucune slide) | MAJEUR | cohérence | Ni la liste de valeurs autorisées, ni le réaffichage `checked` / `selected`, ni les trois notions manquantes du brief | Ajouter les slides après correction du cours | retenue |
| 3 | slide4-render-note | MAJEUR | style | « Le fichier unique dépasse 200 lignes » pour un fichier d'une quarantaine de lignes | « Le fichier devient long et mélange deux tâches » | retenue |
| 4 | e5ce96d2, 1d9315c8, 43fdfc34, slide4-form-attrs, slide4-progression, ebfad59c, 57620728, abcd6483 | MINEUR | cohérence, style | `trim` au lieu de `cleanString`, renvoi « trois champs », doublons, deux idées par slide, ordre, slide-text vides, apostrophes | Corriger | MINEUR |

##### TP
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | tp4-ex4-rules, 571dd9fc, 9a0a2e3c | BLOQUANT | cohérence (véto), fragile, rapide, contrat | `mb_strlen` exigé par quatre règles de longueur, nommé nulle part | Nommer `mb_strlen()` dans la consigne et l'enseigner au cours | retenue |
| 2 | 630c5a65, 48bb7beb, tp4-ex3-4, création d'album | MAJEUR | fragile, rapide, cohérence | `mb_strtolower` (casse ignorée), `implode`, `array_fill` devinés | Nommer la fonction attendue (ou une boucle) dans la consigne | retenue (règle 2) |
| 3 | 78378c03 | BLOQUANT | contrat (véto) | « Rappel » sans critère de vérification | « `play_track.php?album_id=99&track=0` affiche la page 404 » | retenue |
| 4 | b1fb2a52 | MAJEUR | style (verdict) | Expression régulière toute faite dans la consigne | Garder le format « mm:ss », mettre l'indice dans un bloc replié | retenue |
| 5 | 026fe4d1, 6a73fa39, 13ccc6e9, 077a4b43 | MAJEUR | style (verdict guidage) | La consigne commente les fichiers fournis ou redétaille un geste déjà guidé | Contrat seul + une ou deux consignes | retenue |
| 6 | 99555507, 0380b345, 077a4b43, 0ebacab4 | MAJEUR | style (verdict « ni session ni base ») | « Rien n'est enregistré » répété | Une seule mention en début de partie Onzer | retenue |
| 7 | 08f5d3b1 (bonus) | MAJEUR | rapide | 19 min de bonus pour 199 min restantes | Bonus lourds et enseignés, ou revoir le budget de la partie | retenue |
| 8 | 19992953, a58304dd, 6a3a1014, 8fcc9986, d335e97d | MAJEUR | contrat, rapide | Bonus sans fichier nommé, sans essai, sans méthode ; « Un message par champ » ambigu sur la combinaison des règles | Contrat complet par bonus | retenue |
| 9 | 13 exercices | MAJEUR | contrat | Aucune durée par exercice | Durée estimée par exercice | retenue |
| 10 | tp4-ex2-3, tp4-ex4-5, mise en place, album, 0672d6b1, tp4-ex5-3 | MINEUR | fragile, cohérence, style | Variable du récapitulatif, icônes des liens, `action` à omettre, option vide du select, `chmod` en texte, « `htmlspecialchars($nom)` suffit » | Préciser | MINEUR |

#### Désaccords en attente
| # | id | Remarques en présence | Recommandation | Tranché par l'utilisateur |
|---|---|---|---|---|
| 1 | brief vs cours | Cohérence et fragile : `mb_strlen`, 404 et tableaux parallèles manquent au cours. Le TP les rend praticables (`http_response_code` nommé, indice sur le recollage), sauf `mb_strlen`. | Ajouter au cours `mb_strlen` (règle de longueur d'un titre de recette) et un court exemple `recipe.php?id=3` → 404 ; laisser le recollage par rang au TP (indice existant) et le retirer du brief du cours. | |

#### Remarques écartées
| # | id | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|
| 1 | c5786f23, 6ad0c80c | style | Indice déplié, à convertir en `collapsible` | Artefact de l'export : le bloc est déjà un `collapsible` sur le site |

#### MINEURS
- form-recall-cycle-text, a68e57b7, style : annonces de programme.
- slide4-progression, slide4-recap, style : récapitulatif doublé.
- tp4-ex5-3, b3f60f71, 571dd9fc, ded93d6b, 07f2f4ef, style : redites et explications de valeurs de retour.
- a58304dd, 6a3a1014, d335e97d, rapide : bonus triviaux (1 à 2 min).
