# Structurer son code (`php/3-structurer-son-code`)

## Statut
- **Phase** : relecture
- **Mis à jour le** : 2026-10-27
- **Validé** : rien pour l'instant
- **Désaccords en attente** : 3 (voir « Relecture du 2026-10-27 »)
- **Prochaine action** : l'utilisateur tranche les désaccords et choisit les remarques retenues à faire corriger.

## Relectures

### Relecture du 2026-10-27 (run `php-3-structurer-son-code-20261027-094328`)
- **Supports relus** : cours (v207), slides (v172), TP (v119), source db, prod
- **Hors périmètre** : rien
- **Budget** : `courseIntroMinutes` absent en base ; hypothèse validée par l'utilisateur : 180 − 20 = 160 min
- **Rapports** : collecteur incomplet (budget, résolu par l'hypothèse) ; style cours ✔, slides ✔, TP ✔ ; cohérence cours ✔, slides ✔, TP incomplet (dépôt injoignable, 3 résultats sur 12 confrontés) ; contrat incomplet (aucune durée) ; fragile cours incomplet (3 notions du brief absentes du cours), TP ✔ ; rapide ✔ (bonus : critère ✘)
- **Durées** : fragile 112 min / budget 160 min (70 %) ; rapide 66 min, bonus 9 min, 85 min non occupées
- **État de départ** : non fourni (dépôt injoignable) ; les étudiants ont réécrit Artist et Album d'après le tableau des entités.
- **Vérifié par l'orchestrateur** : `htmlspecialchars` n'apparaît dans aucun contenu des sections 1 à 3 hors de ce TP (search_content prod) ; capture du lecteur conforme (Beta, morceau 2 actif, 03:54).
- **Limites de l'export** : le code de `footer.php` (`tp3-extract-2-code`) et l'arborescence `tp3-recap-tree` ne sont pas rendus par l'export compact ; ils existent dans `get_content`.

#### Synthèse arbitrée
##### Cours
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | cours entier | BLOQUANT | cohérence, fragile | Notions du brief absentes : `redirect()`, constante partagée (`const` / `define`), entités enrichies (id, fichier d'image), page statique puis alimentée | Voir désaccord n° 1 | à trancher |
| 2 | cours entier | BLOQUANT (impact TP) | cohérence (véto), vérifié | `htmlspecialchars()` exigé par le TP, enseigné nulle part avant la section 4 | Ajouter un exemple avec une donnée contenant `&` ou `'` (« Crème d'été & fraises ») | retenue |
| 3 | 0dfeedde, 50e9712e, 29d1f832, a113612b | MAJEUR | cohérence, fragile | Aucun `callout warning` : erreurs de `require`, de double déclaration, de variable absente, de syntaxe alternative non montrées | Callouts avec les messages constatés : `Failed opening required …`, `Cannot declare class Recipe, because the name is already in use`, `Warning: Undefined variable $showInstructions`, `Parse error: … unexpected end of file` | retenue |
| 4 | 3e326d3e | MAJEUR | fragile, style | « la vue ne peut plus dépendre par accident d'une autre variable » : inexact, et la clé manquante (Warning) n'est pas dite | Nuancer, et dire ce qui se passe si une clé manque | retenue |
| 5 | b60ab859, c401522b | MAJEUR | fragile, cohérence | `$showInstructions` transmis par `render()` mais absent de la vue complète ; deux vues sans dire laquelle garder | Intégrer `$showInstructions` à la vue finale | retenue |
| 6 | 93a8ff7d | MAJEUR | fragile | Fragment sans `<?php` ni emplacement | Montrer `recipes.php` complet ou dire où le placer | retenue |
| 7 | 8bad4bf5, 0dfeedde, 29d1f832 | MAJEUR | fragile | `__DIR__` et `require_once` utilisés avant leur explication ; nommage `view_<nom>` non annoncé | Définir `__DIR__`, déplacer le tableau avant le premier `require_once` | retenue (règle 2) |

##### Slides
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | 15 slides | MAJEUR | cohérence, style | Aucune `slide-note` | Une note par slide (oral, erreur fréquente, question à la salle) | retenue |
| 2 | slide3-08, slide3-12, slide3-03, slide3-05-footer | MAJEUR | cohérence | Code et tableau repris du cours presque à l'identique | Extraits commentés (`// getters`), deux lignes du tableau au plus | retenue |
| 3 | slide3-05-page, slide3-11, slide3-13, slide3-05, slides de code | MINEUR | cohérence | Deux idées par slide, redites de l'appel `render`, ordre, `filename` absents, pas d'aperçu de la vue | Scinder, réordonner, ajouter un `slide-code-with-preview` | MINEUR |

##### TP
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | tp3-cview-2, tp3-player-5 | BLOQUANT | cohérence (véto) | `htmlspecialchars()` exigé sans avoir été enseigné | Corriger dans le cours (cours n° 2) | retenue |
| 2 | tp3-sec-entities, tp3-sec-catalog-file | BLOQUANT | contrat (véto) | Aucun critère de validation | « `count(getAllAlbums())` renvoie 6 ; `getCoverUrl()` de Rootkit renvoie `images/pochettes/…` » | retenue (le verdict sur « Vous avez terminé quand » vise les TP 1 et 2) |
| 3 | tp3-entities-2 | MAJEUR | fragile, cohérence | « Vos propriétés et méthodes du TP2 gardent leur nom » : les noms exigés par `catalog.php` et les vues ne sont pas listés | Lister `ajouterAlbum(Album)`, `getName`, `getTitle`, `getYear`, `getArtist`, `getCoverUrl` dans le tableau des entités | retenue |
| 4 | tp3-cview-2, tp3-player-5, tp3-player-6 | MAJEUR | style (verdict guidage) | Deuxième geste encore guidé pas à pas, en-tête de boucle donné | Contrat + une ou deux consignes | retenue |
| 5 | tp3-intro, tp3-recap-txt, tp3-player-3 | MAJEUR | style (verdict « ni session ni base ») | Négations répétées sur ce qui n'est pas encore fait (`$_GET`, 404, recherche) | Une seule phrase de périmètre | retenue |
| 6 | tp3-extract-2 | MAJEUR | cohérence | `footer.php` lit `$showPlayerFooter`, jamais transmise par deux pages | Dire de tester avec `!empty()` | retenue |
| 7 | tp3-bonus | MAJEUR | rapide | Bonus de 9 min pour 94 min restantes | 3 ou 4 bonus de 15 à 20 min (page d'un artiste avec `getAlbums()`, total des durées d'un album…) | retenue |
| 8 | tp3-bonus-2 | BLOQUANT (bonus) | rapide, contrat | Initiales : `mb_substr`, `mb_strtoupper` non enseignés ; pas de critère | Donner la fonction ou se limiter à la première lettre ; critère « cercle contenant L pour Loopal » | retenue (règle 4) |
| 9 | 9 parties | MAJEUR | contrat | Aucune durée par partie | Durée estimée par partie | retenue |
| 10 | tp3-index-txt, tp3-extract-warning-txt, tp3-entities-warning-txt, tp3-bonus-3, tp3-index-3 | MINEUR | style, cohérence | « aucune donnée » contredit par `pageTitle`, paraphrase, cas de l'affichage en clair, indicatif, apostrophe courbe | Corriger | MINEUR |

#### Désaccords en attente
| # | id | Remarques en présence | Recommandation | Tranché par l'utilisateur |
|---|---|---|---|---|
| 1 | brief vs cours | Cohérence et fragile : 4 notions du brief absentes du cours (`redirect`, constante, entités enrichies, statique puis données). Le TP les pratique (sauf `redirect`). | Ajouter au cours `const` et `redirect()` (exemples Recette courts) ; retirer du brief « page statique puis données » et « entités enrichies », qui sont des gestes du TP. | |
| 2 | TP entier | Mesure du fragile : 112 min, 70 % du budget (hors plage 80–100 %). | Étoffer les bonus (TP n° 7) et revoir après l'ajout des durées. | |
| 3 | TP entier | Cohérence : pas de partie guidée hors fil rouge (à confirmer). Fragile : TP réussi sans blocage. | Garder la structure. | |

#### Remarques écartées
| # | id | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|
| 1 | tp3-extract-1 | cohérence | `??` enseigné nulle part (BLOQUANT) | Faux : enseigné en section 2 (slide « L'opérateur ?? », cours) ; repli sur les seuls briefs |
| 2 | tp3-entities-table | cohérence | Types nullables `?string`, `= null` absents | Enseignés en section 2 (`cls-promues`, slide « ?string ») |
| 3 | tp3-extract-2 | fragile, rapide, style | Code de `footer.php` absent | Artefact de l'export compact : le bloc existe dans `get_content` (lu par le contrat) |

#### MINEURS
- 322ae6a9, 1fba622f, struct-recap-t, struct-render-t, 29d1f832, style : redites « le fichier principal prépare, la vue affiche ».
- ad713366, struct-load, style : titres qui gouvernent peu de contenu.
- tp3-bonus-1, tp3-bonus-3, rapide : bonus triviaux.
- tp3-bonus (titre), contrat : le mot « bonus » n'apparaît pas.
