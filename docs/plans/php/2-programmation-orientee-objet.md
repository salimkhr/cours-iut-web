# Tableaux associatifs et objets (`php/2-programmation-orientee-objet`)

## Statut
- **Phase** : relecture
- **Mis à jour le** : 2026-10-27
- **Validé** : rien pour l'instant
- **Désaccords en attente** : 5 (voir « Relecture du 2026-10-27 »)
- **Prochaine action** : l'utilisateur tranche les désaccords et choisit les remarques retenues à faire corriger.

## Relectures

### Relecture du 2026-10-27 (run `php-2-programmation-orientee-objet-20261027-094328`)
- **Supports relus** : cours (v70), slides (v46), TP (v254), source db, prod
- **Hors périmètre** : rien
- **Budget** : `courseIntroMinutes` absent en base ; hypothèse validée par l'utilisateur : 180 − 20 = 160 min
- **Rapports** : collecteur incomplet (budget, résolu par l'hypothèse) ; style cours ✔, slides ✔, TP ✔ ; cohérence cours ✔, slides ✔, TP ✔ (contre le repli, dépôt injoignable) ; contrat incomplet (aucune durée) ; fragile cours ✔, TP ✔ ; rapide ✔ (bonus : critère ✘)
- **Durées** : fragile 122 min / budget 160 min (76 %) ; rapide 75 min, bonus 6 min, 79 min non occupées
- **Vérifié par l'orchestrateur en PHP 8.3** : `var_dump("flambé")` → `string(7)` ; propriété publique inexistante → `Warning: Undefined property`, la page continue ; `"$sushi['nom']"` → `Parse error`. Capture du TP du fragile conforme (pochettes, tri par année, statistiques).
- **Limite de l'environnement** : l'export compact aplatit les sous-listes ; les étudiants ont vu `tp2-ex4-2` sans ses sous-items (f361baf1, 810ed0bc), présents dans `get_content`.

#### Synthèse arbitrée
##### Cours
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | cls-promues-res | BLOQUANT | fragile, cohérence, vérifié | Résultat annoncé `string(6) "flambé"`, réel `string(7)` | Corriger en `string(7)` ou prendre un mot sans accent | retenue |
| 2 | transition-table, transition-txt-2 | MAJEUR | cohérence, vérifié | « Clé ou propriété inconnue : Error » : une propriété publique inconnue donne un Warning | Réserver `Error` à la propriété privée | retenue |
| 3 | cls-methodes-callout-txt | MAJEUR | fragile | `$temps` sans `$this` : « le résultat est faux » ; en réalité `null < 10` vaut `true` | Dire le résultat réel et pourquoi | retenue |
| 4 | cls-declarer-code, cls-declarer-txt | MAJEUR | cohérence, fragile | Le texte annonce `new` et `->`, le code n'en contient pas ; `private` et `$this` utilisés avant leur définition ; la classe n'est pas instanciable en l'état | Une phrase sur `private` et `$this` dès ici, et dire que l'exemple est incomplet jusqu'au constructeur | retenue |
| 5 | assoc-catalogue-res | MAJEUR | cohérence, vérifié | « PHP s'arrête au `$sushi` » : c'est une Parse error | Citer le message réel | retenue |
| 6 | cls-constructeur, cls-promues, enc-private-res | MAJEUR | cohérence, fragile | TypeError et accès privé sans `callout warning`, message abrégé | Callouts avec `Sushi::__construct(): Argument #2 ($temps) must be of type int, string given` et `Uncaught Error: Cannot access private property Sushi::$nom` | retenue |
| 7 | tri-usort-txt, 7d82d26c, tri-filter-callout-txt | MINEUR | fragile, cohérence | `<=>` et ternaire non définis ; trou d'indices non illustré | Une phrase chacun, un exemple chiffré | MINEUR |

##### Slides
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | sl2-classe-res, sl2-getters-res, sl2-composition-res, sl2-private-res | MAJEUR | style, cohérence | Résultats affichés qui ne correspondent pas au code (Sushi / Recette, Chef / Auteur, résultat sans `new` ni `echo`) | Aligner chaque résultat sur son code | retenue |
| 2 | sl2-classe-note, sl2-constructeur-note, sl2-promues-note, sl2-composition-note | MAJEUR | style, cohérence | Notes qui décrivent un autre code (4 étapes avec `new`, version « du haut » absente, `Auteur`) | Réécrire les notes sur le code réel | retenue |
| 3 | sl2-compare-table, sl2-portees-table | MAJEUR | cohérence | Tableaux recopiés du cours ; `$r->nom` sur une propriété privée | Un seul contraste visuel ; `$r->getNom()` | retenue |
| 4 | dce87f5e, sl2-filter-code, c5a48b83, blocs vides | MINEUR | cohérence, style | Note « tri et filtre en bonus » contredite par le TP, `print_r` absent du cours, backticks, slide-text vides | Corriger | MINEUR |

##### TP
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | tp2-ex4-1 | BLOQUANT | cohérence (véto), fragile, rapide | `public const BASE_URL` et `self::` exigés, enseignés nulle part | Ajouter `const` et `self::` au cours, ou donner la ligne dans l'énoncé | retenue |
| 2 | tp2-ex4-2 (f361baf1, 810ed0bc) | MAJEUR | contrat, cohérence, style, fragile, rapide | Getters décrits sans leurs noms (`getTitle`, `getYear`, `getArtist` n'apparaissent qu'à l'ex. 7) ; sous-items au nominal | « Ajoutez `getTitle(): string`, `getYear(): int`, `getArtist(): Artist`, `getCover(): string`, `getCoverUrl(): string` » | retenue |
| 3 | 865e4be2, tp2-ex4-4 | MAJEUR | cohérence, style | `__toString` hors cours ; « Vous vous en servirez dans le bonus » alors qu'il sert dès l'ex. 5 | Marquer la notion comme introduite par le TP ou l'ajouter au cours ; corriger la phrase | retenue |
| 4 | tp2-ex7-2 | MAJEUR | contrat, cohérence, style | Champs `text` et `content` différents dans le même bloc | Garder une seule version, vider l'autre | retenue |
| 5 | tp2-ex1, b2495668, tp2-ex7, bonus | MAJEUR | contrat | Fichier non nommé | Nommer `catalogue.php` | retenue |
| 6 | tp2-ex2-1, tp2-ex8-1 | MAJEUR | style, fragile, rapide | Repère cité `// === Traitement ===`, squelette `// === Traitement (tri, filtre, statistiques) ===` | Aligner | retenue |
| 7 | 83f0e431, tp2-ex4-2 | MAJEUR | style | Consignes à l'indicatif ou au nominal | Impératif vouvoyé | retenue |
| 8 | tp2-bonus | MAJEUR | rapide, contrat | Bonus de 6 min pour 85 min restantes ; aucun critère de validation | 3 ou 4 bonus de 15 à 20 min (filtre par artiste, tri sur deux clés…) avec un critère chacun | retenue |
| 9 | tous les exercices | MAJEUR | contrat | Aucune durée par exercice | Durée estimée par exercice | retenue |
| 10 | tp2-ex7-3, 2162c711, tp2-ex5-4, tp2-ex4-1 | MINEUR | rapide, style | `fn` à suggérer (évite `use`) ; thead fourni qui donne la solution ; guidage encore pas à pas au 2e geste | Préciser ; alléger selon le verdict de guidage | MINEUR |

#### Désaccords en attente
| # | id | Remarques en présence | Recommandation | Tranché par l'utilisateur |
|---|---|---|---|---|
| 1 | tp2-ex3, tp2-ex4, b2495668 | Contrat : critère de validation absent (BLOQUANT, véto). Verdict actif : retirer « Vous avez terminé quand » des TP 1 et 2. | Critère observable sans la formule (« Résultat attendu : `echo $ssh;` affiche `SSH` »). | |
| 2 | cours et slides | Cohérence : le cours est en Sushi/Chef, 13 slides en Recette, 8 en Sushi ; exampleDomain « Recettes (Recette, Ingrédient, Auteur) ». | Un seul vocabulaire dans les deux supports ; Recette/Auteur pour suivre l'exampleDomain. | |
| 3 | brief vs tp2-ex3, tp2-ex4 | filRougeOutcome : « entities/Album.php et entities/Artist.php existent » ; le TP met les classes dans catalogue.php (la section 3 les range dans entities/). | Corriger le brief de la section 2 : le TP est cohérent avec la section 3. | |
| 4 | TP entier | Cohérence : aucune partie guidée hors fil rouge, Onzer dès l'ex. 1. Fragile : TP réussi en 122 min. | Garder la structure : le fragile n'a pas bloqué sur la progression. | |
| 5 | TP entier | Mesure du fragile : 122 min, 76 % du budget (hors plage 80–100 %). | Ne rien retirer ; étoffer les bonus (TP n° 8). | |

#### Remarques écartées
| # | id | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|
| 1 | tp2-ex7-1 | rapide | `match` jamais enseigné | Faux : enseigné en section 1 ; l'erreur vient du prompt de l'orchestrateur, qui l'avait omis |
| 2 | tri-fn-code, fonctions-table | fragile | `var_dump` et `count` non définis | Enseignés en section 1 (cours PHP 1, bloc 46023bbf) ; la liste fournie au fragile était incomplète |
| 3 | tp2-ex4-2 | fragile, rapide | Liste des méthodes vide | Artefact de l'export compact (sous-liste aplatie) ; le vrai défaut est le nom des getters (TP n° 2) |

#### MINEURS
- enc-intro, enc-private-txt, cls-promues-res, poo-intro-txt, style : redites « propriétés privées + getters », participes enchaînés.
- tri-intro, fonctions-txt, style : « toutes » et « les seules » inexacts.
- titres de callouts, style : quatre « Attention : » à l'identique.
- tp2-ex1-txt, tp2-ex5-tip-txt, a29314e2, tp2-ex7-txt, style : redites et phrases creuses.
- 9cb54dfa, contrat, style, cohérence : bloc texte vide.
- tp2-ex4 (numérotation 1, 2, 4), tp2-ex6 absent, contrat : numérotation.
