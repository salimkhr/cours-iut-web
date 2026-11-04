# Écrire des données en base (`php/6-ecrire-des-donnees-en-base`)

## Statut
- **Mode** : redaction (slides seules ; cours en prod amendé, TP inchangé)
- **Phase** : clôture
- **Étape en cours** : clôture : écritures en prod à confirmer
- **Mis à jour le** : 2026-11-04
- **Validé** : relecture navigateur des slides le 2026-11-04 (« OK, c'est bon ») ; slides le 2026-11-04 (« Oui, valide et écris ») ; plan v2 le 2026-11-04 (« Oui, les deux »)
- **Désaccords en attente** : aucun
- **Prochaine action** : clôture : écrire `courseIntroMinutes` = 30 et ajouter `never` et le dépliage `...` au curriculum en prod (sur confirmation).

## Cadrage
| # | Question | Défaut proposé | Réponse de l'utilisateur | Date |
|---|---|---|---|---|
| — | Périmètre | relecture puis correction des slides | « Réécriture complète » des slides | 2026-11-04 |
| Q0 | courseIntroMinutes | 30 min (comme le brief de la section 5) | défaut accepté : 30 min | 2026-11-04 |
| — | Formulaire dynamique du cours (`db6-sec-dyn`), retiré du TP | hors slides, gardé au cours | « a retirer aussi du cours » | 2026-11-04 |

Signalements du collecteur (2026-11-04) : dépôt de référence injoignable (`ECONNREFUSED`), sans effet sur les slides ; `universe` absent du module ; aucun verdict slide, cours ou module-design ; aucun exemplaire en base.

## Plan (version 2, 2026-11-04)

Plan des seules slides. Source : le cours en prod (version 104, 114 blocs), export `docs/plans/php/brouillons/6-ecrire-des-donnees-en-base/cours.md`, après la retouche ci-dessous.

**Retouche du cours (décision du 2026-11-04)** : la sous-partie « Ajouter une ligne sans JavaScript » (`db6-dyn-btn` et ses 9 descendants : t1, c1, t2, c2, table, warn1, warn1-t, warn2, warn2-t ; bouton `add_line`) est supprimée. « Deux tableaux parallèles » (`db6-dyn-par`) reste : `readSubstituteLines()` et `substitutesFromLines()` sont appelées par `create_ingredient.php` et `update_ingredient.php`, comme `track[]` / `duration[]` au TP. La partie `db6-sec-dyn` est renommée « Lire les lignes de substituts » ; `db6-intro`, `db6-ins-page-t2` et la ligne « ajouter une ligne au formulaire » de `db6-recap-table` sont ajustés. La cellule « valeurs vides, deux lignes de substituts vides » de `db6-upd-form-table` reste : le formulaire a un nombre fixe de lignes, comme les morceaux au TP.

Repères N, notions du brief dans l'ordre du cours :

- N1 — Entité non enregistrée : `?int` à `null` (« Un objet sans identifiant »)
- N2 — `INSERT` préparé avec `RETURNING id` (« Insérer une recette »)
- N3 — `toParams()`, inverse d'`hydrate()` (« Insérer un ingrédient »)
- N4 — `json_encode` avec `JSON_UNESCAPED_UNICODE` (même partie, table `db6-ins-ingr-json`)
- N5 — Post/Redirect/Get avec `redirect()` et code `status` (« Enregistrer depuis le formulaire », « Un message après la redirection »)
- N6 — Doublon : `findOneByName` (« Refuser un doublon »)
- N7 — `UPDATE` préparé et `rowCount` ; vue partagée création/édition (« Modifier une ligne »)
- N8 — `DELETE` : confirmation en `GET`, suppression en `POST` (« Supprimer une ligne »)
- N9 — Envoi de fichier (« Envoyer un fichier »)

Règles (décision de l'utilisateur du 2026-10-31, appliquée au PHP 7) : aucune erreur fréquente dans les slides, ni en slide ni en note (pas de message d'erreur PHP ou SQL, pas de « piège »). Ne sont pas repris : `db6-id-warn`, `db6-ins-ingr-warn`, `db6-upd-repo-warn` (le WHERE oublié), `db6-upd-form-warn`, `db6-dyn-par-warn`, `db6-del-fk` (SQLSTATE 23503), `ab198ce8…` (enctype oublié), la contrainte `UNIQUE` et SQLSTATE 23505 (`db6-ins-dup-info`). Une règle peut rester en une phrase, formulée en positif (jamais « sinon ça casse »), quand le cours la pose comme règle : un code dans l'URL, jamais le texte du message (S7) ; sans `action`, le formulaire garde `?id` (S11) ; `enctype` obligatoire pour envoyer un fichier (S15) ; le serveur choisit le nom du fichier (S16). Le formulaire dynamique n'a aucune slide.

### Slides — 18 slides, 30 min (temps commun au cours et aux slides, présenté en début de séance)
| Repère | Titre | Idée unique | Bloc principal | Notion source | Durée |
|---|---|---|---|---|---|
| S1 | Le chemin inverse | lire : ligne → objet ; écrire : objet → valeurs de requête | `diagram` (formulaire → objet → `toParams()` → `INSERT`/`UPDATE`) | intro (`db6-intro`) | 1,5 min |
| S2 | 1 Insérer | l'identifiant vient de la base | `slide-transition` | — | 0,5 min |
| S3 | ?int : pas encore enregistré | `null` tant que l'objet n'est pas en base | `slide-code` + `slide-table` (`db6-id-c`, `db6-id-table`) | N1 | 2 min |
| S4 | INSERT … RETURNING id | marqueurs, objet reçu, identifiant lu par `fetchColumn()` | `slide-code` (`db6-ins-recipe-c`) | N2 | 2 min |
| S5 | toParams() : l'hydratation à l'envers | objet `Recipe` → `recipe_id`, tableau → JSON, `null` → `NULL` | `slide-code` (`db6-ins-ingr-c`, highlight `toParams`) | N3, N4 | 2 min |
| S6 | Valider, construire, insérer, rediriger | l'objet n'est construit et inséré qu'après la validation | `slide-code` (`db6-ins-page-c`, appel de `substitutesFromLines()` réduit à `// …`) ; note : `redirect()` (`db6-ins-page-redirect`) et `never`, « ne rend jamais la main » | N5 | 2 min |
| S7 | Un message après la redirection | code `status` dans l'URL, liste fixe de messages | `slide-code` + `slide-table` (`db6-ins-msg-c`, `db6-ins-msg-table`) | N5 | 2 min |
| S8 | Refuser un doublon | `findOneByName()` avant l'`INSERT`, message dans `$errors` | `slide-code` (`db6-ins-dup-c2`) | N6 | 1 min |
| S9 | 2 Modifier et supprimer | on cible une ligne par son identifiant | `slide-transition` | — | 0,5 min |
| S10 | UPDATE et rowCount() | `toParams()` + `id`, lignes touchées | `slide-code` + `slide-table` (`db6-upd-repo-c`, `db6-upd-repo-table`) ; note : le dépliage `...` (`db6-upd-repo-t2`) | N7 | 2 min |
| S11 | Une seule vue pour créer et modifier | trois différences entre création et modification | `slide-table` + `slide-code` (`db6-upd-form-table`, `db6-upd-form-c3`) ; note : sans `action`, le formulaire repart vers l'URL courante, `?id` compris | N7 | 2 min |
| S12 | Supprimer : confirmer en GET, agir en POST | un `GET` ne modifie jamais rien | `diagram` (`db6-del-page-diag`) | N8 | 2 min |
| S13 | deleteById() | la suppression ne reçoit qu'un identifiant | `slide-code` (`db6-del-repo-c`) ; note : déroulé de `delete_ingredient.php` (lire, 404, supprimer en `POST`, rediriger) | N8 | 2 min |
| S14 | 3 Envoyer un fichier | la base garde le nom, le disque garde l'image | `slide-transition` | — | 0,5 min |
| S15 | Le formulaire et $_FILES | `enctype`, `type="file"`, cinq clés, codes `UPLOAD_ERR_*` en note | `slide-code` + `slide-table` (`d9076e14…`, `5dbc56ca…`) | N9 | 2 min |
| S16 | validatePhoto() et savePhoto() | type réel lu dans le contenu, nom tiré par le serveur, `move_uploaded_file()` | `slide-code` (`9d34822e…`) | N9 | 2 min |
| S17 | Valider avec le reste, enregistrer à la fin | la photo n'est déplacée qu'une fois toutes les erreurs écartées | `slide-code` + `slide-table` (`ae80e5eb…`, `20620856…`) | N9 | 2 min |
| S18 | À retenir | besoin → outil, sans la ligne du formulaire dynamique | `slide-table` (`db6-recap-table`) | toutes | 2 min |

Une `slide-note` par slide (oral, question à la salle ; pour S1, S5, S8, S13 et S17, une phrase sur ce que l'étudiant fera dans Onzer, avec le seul nom du fil rouge). Total : S1 à 1,5 min, S8 à 1 min, 13 slides à 2 min, 3 transitions à 0,5 min : 2,5 + 26 + 1,5 = 30 min. Les transitions sont des intercalaires : la plage 1 à 2 min ne s'applique qu'aux slides de contenu. Notions à signaler au curriculum : `never` (S6), dépliage `...` (S10).

## Rédaction
### Cours (retouche)
- **Prod** : le 2026-11-04 après confirmation (« Oui, écris en prod ») : `delete_block` db6-dyn-btn (10 blocs), `edit_block` db6-sec-dyn, db6-intro, db6-ins-page-t2, db6-recap-table ; version 104 → 109, 114 → 104 blocs, relu par `get_content` (aucune occurrence restante de `add_line` ni de « formulaire dynamique »).

### Slides
- **Brouillon** : docs/plans/php/brouillons/6-ecrire-des-donnees-en-base/slides.json (61 blocs, 18 slides)
- **Rédacteur** : rendu le 2026-11-04 (validation lancée par l'orchestrateur : cwd du rédacteur hors racine) ; écarts de forme acceptés : S10 tableau à 2 lignes sans la remarque MySQL, S11 code réduit au champ nom, S16 `validatePhoto()` réduite au contrôle du type, numéros des transitions en `eyebrow`.
- **Cycle 1** (2026-11-04) : style ✔ (61 blocs, 5 MINEURS), cohérence ✔ (18 slides, 1 MINEUR) ; retenues 2, écartées 4 ; ids modifiés : s6-s1-note, s6-s5-note, s6-s8-note, s6-s11-note, s6-s13-note, s6-s17-note ; `valider` VALIDE, 61 marqueurs pour 61 blocs.
| # | id | Gravité | Agents | Problème | Décision | Fait au cycle |
|---|---|---|---|---|---|---|
| 1 | s6-s1/s5/s8/s13/s17-note | MINEUR | style | « Dans Onzer, vous… » répété cinq fois, adressé aux étudiants | retenue : gardée en S5 et S17, tournée vers le présentateur | 1 |
| 2 | s6-s11-note | MINEUR | style | trois différences annoncées, deux citées | retenue | 1 |
- **Cycle 2** : sans objet (aucun BLOQUANT ni MAJEUR)
- **Validé** : 2026-11-04 (« Oui, valide et écris »)
- **Prod** : `save_content` le 2026-11-04 après confirmation, contentId 6aea75af81690c08422e6512, version 1 → 2, 61 blocs, `isAvailable` inchangé à `false`. Comparaison partielle : `get_content` revenu en ligne, version 2, ids racine et nombre de slides conformes à `slides-couverture.md`, `comparer` non lancé.
#### Remarques écartées
| # | id | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|
| 1 | s6-s2/s9/s14-transition | style | numérotation à la main | le numéro est le champ `eyebrow`, affiché par l'export |
| 2 | s6-s2, s6-s9, s6-s14 | cohérence | numéro absent du titre de la slide | même raison : `eyebrow` |

## Relectures du plan
### Cycle 1, plan v1 (2026-11-04)
- **Rapports** : cohérence ✔ (18 slides, 9 notions, retouche du cours, 0 BLOQUANT, 0 MAJEUR, 13 MINEURS) ; contrat sans objet (aucun TP)
| # | Repère | Gravité | Agent | Problème | Décision | Changement fait (v2) |
|---|---|---|---|---|---|---|
| 1 | total | MINEUR | cohérence | 3 transitions et non 4 : 29,5 min | retenue | S1 à 1,5 min, total 30 min |
| 2 | règles | MINEUR | cohérence | `enctype` attribué à S14 (transition) | retenue | S15 |
| 3 | S6 | MINEUR | cohérence | deux idées, deux blocs | retenue | `redirect()` en note |
| 4 | S11 | MINEUR | cohérence | formulaire sans `action` en seconde idée | retenue | en note, formulé en positif |
| 5 | S13 | MINEUR | cohérence | deux blocs, plusieurs idées | retenue | `deleteById()` seul, déroulé de la page en note |
| 6 | S9 | MINEUR | cohérence | « toujours un WHERE » reprend l'avertissement écarté | retenue | « on cible une ligne par son identifiant » |
| 7 | S7, S11, S15, S16 | MINEUR | cohérence | règles tirées de callouts | retenue | formulées en positif |
| 8 | S6 | MINEUR | cohérence | `never` enseigné nulle part avant (`search_content`) | retenue | note de S6, signalé au curriculum |
| 9 | S6, S11 | MINEUR | cohérence | `substitutesFromLines()`, « deux lignes » sans slide | retenue | appel réduit à `// …` |
| 10 | S10 | MINEUR | cohérence | dépliage `...` non expliqué | retenue | note de S10 |
| 11 | retouche | MINEUR | cohérence | 9 descendants et non 7 | retenue | plan corrigé |
| 12 | retouche | MINEUR | cohérence | partie à un seul enfant | écartée | acceptable, `db6-dyn-par-t1` ouvre la partie sans renvoi |
| 13 | retouche | MINEUR | cohérence | « deux lignes de substituts vides » | retenue | cellule gardée (nombre fixe), dit au plan |
