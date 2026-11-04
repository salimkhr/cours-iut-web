# Lire des données en base (PDO) (`php/5-lire-des-donnees-en-base`)

## Statut
- **Mode** : redaction (slides seules : cours et TP déjà en prod, inchangés)
- **Phase** : slides
- **Étape en cours** : slides : en attente de rédaction
- **Mis à jour le** : 2026-11-04
- **Validé** : plan v3 le 2026-11-04 (« Oui, les deux »)
- **Désaccords en attente** : aucun
- **Prochaine action** : paragraphe sur le motif Singleton à ajouter au cours (demande du 2026-11-04, « Cours aussi »), puis rédaction des slides.

## Cadrage
| # | Question | Défaut proposé | Réponse de l'utilisateur | Date |
|---|---|---|---|---|
| — | Périmètre | relecture puis correction des slides | « Réécriture complète » des slides | 2026-11-04 |
| Q0 | courseIntroMinutes | 30 min (brief : 2 × 180 − 30) | défaut accepté : 30 min | 2026-11-04 |

Signalements du collecteur (2026-11-04) : dépôt de référence injoignable (`ECONNREFUSED`), sans effet sur les slides (seul le nom d'Onzer est transmis) ; `universe` absent du module ; aucun verdict slide, cours ou module-design ; aucun exemplaire en base.

## Plan (version 3, 2026-11-04)

v3, demande de l'utilisateur du 2026-11-04 (« il faut expliquer le patern singleton ») : S20 ajoutée avant S5 pour expliquer le motif lui-même, S5 garde son code ; S7 et S19 passent à 1 min pour tenir les 30 min.

Plan des seules slides. La source est le cours en prod (version 81, 95 blocs), export : `docs/plans/php/brouillons/5-lire-des-donnees-en-base/cours.md`. Les repères N renvoient aux notions du brief, dans l'ordre du cours :

- N1 — PDO : DSN, `config.php`, options (cours : « Le DSN et l'objet PDO ») → S3, S4, S5
- N2 — Lecture : `query`, `fetchAll`, `fetch`, `fetchColumn` (« Une requête simple : query() », table des méthodes `find...`) → S7, S8, S11
- N3 — Requêtes préparées et injection SQL (« Une requête préparée ») → S9, S10
- N4 — Hydratation dans une méthode privée `hydrate()` (« Ce qui sépare une ligne d'un objet », « Une fonction d'hydratation ») → S13, S14, S17
- N5 — `json_decode($json, true)` (« Une fonction d'hydratation ») → S14
- N6 — Jointure aliasée, problème N+1 (« Construire l'objet imbriqué ») → S15 (N+1 dans la note)
- N7 — Repository pattern (« Utiliser les repositories ») → S17, S18
- N8 — Singleton : `Repository::getPdo()` (« Une seule connexion : le Singleton ») → S20, S5

Règles (décision de l'utilisateur du 2026-10-31, appliquée au PHP 7) : aucune erreur fréquente servie dans les slides, ni en slide ni en note (pas de message d'erreur PHP ou SQL, pas de « piège », pas de code marqué « à ne pas faire »). Les callouts « Attention » du cours (`db5-query-warn`, `db5-prep-how-warn`, `db5-hy-warn`, `db5-join-warn`, `db5-repo-ingr-warn`) ne sont pas repris, ni la ligne `json_decode($json)` (stdClass) de `db5-hy-json`. Une règle reste en une phrase quand le cours la pose comme règle de lecture : `fetch()` renvoie `false` sans résultat (S8). L'injection SQL n'est pas une erreur fréquente : c'est la notion N3 du brief ; S9 la montre par la requête produite, sans méthode fautive complète. Les notes ne citent le fil rouge que par son nom, jamais ses objets (ni album ni artiste, même en comparaison).

### Slides — 20 slides, 30 min (temps commun au cours et aux slides, présenté en début de séance)
| Repère | Titre | Idée unique | Bloc principal | Notion source | Durée |
|---|---|---|---|---|---|
| S1 | Des recettes qui survivent à la requête | la source des données change, les vues ne bougent pas | `slide-table` (jusqu'ici / aujourd'hui) | intro (`db5-intro`) | 1 min |
| S2 | 1 Se connecter | une seule connexion, ouverte une seule fois | `slide-transition` | — | 0,5 min |
| S3 | Le DSN dit où trouver la base | `new PDO(dsn, user, password)`, morceaux du DSN | `slide-code` + `slide-table` (`db5-dsn-c1`, `db5-dsn-table`) | N1 | 2 min |
| S4 | config.php : quatre constantes | les identifiants vivent dans quatre constantes, le DSN s'assemble à partir d'elles | `slide-code` (`db5-dsn-c2` + ligne `$dsn` de `db5-dsn-c3`) | N1 | 2 min |
| S20 | Le motif Singleton | une classe ne crée qu'une seule instance d'un objet et la donne à tous ceux qui la demandent | `diagram` (flowchart : `RecipeRepository` et `IngredientRepository` appellent `getPdo()` → « `self::$pdo` vaut `null` ? » → oui : `new PDO`, rangé dans `self::$pdo` ; non : le même objet est renvoyé) ; note : le problème de départ (`db5-repo-single-t1` : un `new PDO` par classe, deux connexions pour une page, DSN construit à plusieurs endroits), les trois ingrédients du motif (propriété statique privée, création au premier appel, point d'accès unique) et un autre usage courant (une configuration chargée une fois) | N8 | 2 min |
| S5 | Une seule connexion : getPdo() | le motif en PHP : propriété `private static ?PDO`, test `=== null`, `getPdo()` protégée | `slide-code` (`db5-repo-single-c`, options `ERRMODE_EXCEPTION` et `FETCH_ASSOC` expliquées en note) | N8, N1 | 2 min |
| S6 | 2 Faire une requête | du SQL dans le PHP, sans y coller une saisie | `slide-transition` | — | 0,5 min |
| S7 | Deux tables reliées | `recipe_id` relie l'ingrédient à sa recette (substituts en JSON : en note) | `slide-code` sql (extrait de `db5-base-sql`) | N2 | 1 min |
| S8 | query() puis fetchAll() | `query()` renvoie un résultat à lire ; trois façons de le lire, `false` sans résultat | `slide-code` + `slide-table` (`db5-query-c1`, `db5-query-table`) | N2 | 2 min |
| S9 | Une saisie collée dans le SQL | concaténée, la saisie devient du code SQL | `slide-code` (la seule ligne de concaténation de `db5-prep-why-c` et la requête produite par `x' OR 1=1 --`) | N3 | 2 min |
| S10 | prepare() puis execute() | marqueurs nommés, valeurs envoyées à part : l'attaque devient une recherche | `slide-code` + `slide-table` (`db5-prep-how-c2`, `db5-prep-how-table`) | N3 | 2 min |
| S11 | Le nom annonce le résultat | `findBy...` → liste, `findOneBy...` / `findById` → une ligne ou rien | `slide-table` (`ccde5e58…`) | N2 | 1 min |
| S12 | 3 Des lignes aux objets | hydrater : combler l'écart entre la base et PHP | `slide-transition` | — | 0,5 min |
| S13 | Une ligne n'est pas un objet | chaque colonne ne correspond pas telle quelle à une propriété | `columns` : `slide-code` (`Ingredient`) + `slide-table` (`db5-base-table`) ; `Recipe` (id, name, time) rappelée en note | N4 | 2 min |
| S14 | hydrateIngredient() : une ligne entre, un objet sort | la fonction comble chaque écart : casts, objet imbriqué, `json_decode(…, true)` | `slide-code` (`db5-hy-c2`, highlight casts et `json_decode`) ; note : première ligne de `db5-hy-json`, et `recipe_name` annoncé pour la slide suivante | N4, N5 | 2 min |
| S15 | La jointure apporte la recette | les alias donnent aux colonnes les noms attendus (N+1 en note) | `slide-code` sql + `slide-table` (`db5-join-c1`, `db5-join-table`) | N6 | 2 min |
| S16 | 4 Les repositories | une classe par entité, des objets pour la page | `slide-transition` | — | 0,5 min |
| S17 | IngredientRepository | un repository par entité : il hérite de `getPdo()` et garde `hydrate()` privée | `slide-code` (`db5-repo-ingr-c`, réduit à `SELECT`, `findById`, `hydrate`) ; note : `RecipeRepository` sur le même modèle, schéma « Qui parle à qui » à l'oral | N7, N4 | 2 min |
| S18 | La page appelle, la vue affiche | la page n'écrit aucun SQL | `slide-code` (`db5-repo-use-c2`) | N7 | 2 min |
| S19 | À retenir | besoin → outil | `slide-table` (`db5-recap-table`) | toutes | 1 min |

Une `slide-note` par slide (oral, question à la salle ; pour S1, S8, S17 et S18, une phrase sur ce que l'étudiant fera dans Onzer, avec le seul nom du fil rouge). Notes de vocabulaire à prévoir : `const` (S4), `abstract`, `static`, `self::` (S5, d'après `db5-repo-single-table`), `extends` et `private const` (S17), `http_response_code(404)` (S18). Ordre d'affichage : S1 à S4, S20, S5 à S19 (S20 garde son numéro, repère ajouté). Total : S1, S7, S11 et S19 à 1 min, 12 slides à 2 min (dont S20), 4 transitions à 0,5 min : 4 + 24 + 2 = 30 min. Les transitions sont des intercalaires : la plage 1 à 2 min ne s'applique qu'aux slides de contenu.

## Relectures du plan
### Cycle 1, plan v1 (2026-11-04)
- **Rapports** : cohérence ✔ (19 slides, 8 notions, 0 BLOQUANT, 0 MAJEUR, 10 MINEURS) ; contrat sans objet (aucun TP)
| # | Repère | Gravité | Agent | Problème | Décision | Changement fait (v2) |
|---|---|---|---|---|---|---|
| 1 | S9 | MINEUR | cohérence | méthode fautive complète « à ne pas faire » | retenue | seule la ligne de concaténation et la requête produite |
| 2 | S10 | MINEUR | cohérence | règle du marqueur reprise d'un callout écarté | retenue | règle retirée |
| 3 | S14 | MINEUR | cohérence | `json_decode` sans table, titre « hydrate() » | retenue | titre `hydrateIngredient()`, première ligne de `db5-hy-json` en note, ligne stdClass écartée |
| 4 | S14 | MINEUR | cohérence | alias utilisés avant la jointure | retenue | note qui annonce S15 |
| 5 | S15 | MINEUR | cohérence | N+1 sans bloc | retenue | N+1 en note, dit au plan |
| 6 | S4, S5 | MINEUR | cohérence | redite DSN et options | retenue | S4 : constantes et `$dsn` ; options en S5 |
| 7 | S7, S13, S17, S18 | MINEUR | cohérence | plusieurs idées | retenue | une idée chacune, `Recipe` en note de S13 |
| 8 | S17 | MINEUR | cohérence | `RecipeRepository` absent | retenue | cité en note de S17 |
| 9 | S4, S5, S17, S18 | MINEUR | cohérence | `const`, `self::`, `extends`, `http_response_code` hors rubrique | retenue | notes de vocabulaire prévues |
| 10 | transitions | MINEUR | cohérence | 0,5 min hors plage 1–2 min | écartée | intercalaires, total exact (30 min) |
