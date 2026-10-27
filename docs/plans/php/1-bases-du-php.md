# Bases du PHP (`php/1-bases-du-php`)

## Statut
- **Phase** : relecture
- **Mis à jour le** : 2026-10-27
- **Validé** : rien pour l'instant
- **Désaccords en attente** : 2 (voir « Relecture du 2026-10-27 »)
- **Prochaine action** : l'utilisateur tranche les désaccords et choisit les remarques retenues à faire corriger.

## Relectures

### Relecture du 2026-10-27 (run `php-1-bases-du-php-20261027-094328`)
- **Supports relus** : cours (v152), slides (v198), TP (v102), source db, prod
- **Hors périmètre** : rien
- **Rapports** : collecteur ✔ ; style cours ✔, slides ✔, TP ✔ ; cohérence cours ✔, slides ✔, TP incomplet (dépôt de référence injoignable) ; contrat incomplet (aucune durée dans le TP) ; fragile cours ✔, TP ✔ (journal d'étapes réduit à la liste des fichiers) ; rapide ✔ (bonus : critère ✘)
- **Durées** : fragile 124 min / budget 160 min (78 %) ; rapide 65 min, bonus 5 min, 90 min non occupées
- **Vérifié par l'orchestrateur en PHP 8.3** : `"douze" * 60` lève `TypeError: Unsupported operand types: string * int` ; paramètre optionnel avant obligatoire → `Deprecated: Optional parameter $a declared before required parameter $b is implicitly treated as a required parameter` ; argument positionnel après nommé → `Fatal error: Cannot use positional argument after named argument` (compilation). Capture du rappel HTML conforme (6 lignes, 4 colonnes).

#### Synthèse arbitrée
##### Cours
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | 96765f99, 9c2d4c89 | MAJEUR | cohérence, fragile, vérifié | « Sans typage, PHP aurait converti "douze" en 0 » : faux en PHP 8 (TypeError) | Changer l'argument : `"12"` accepté en silence (mode coercitif) face au typage strict, ou un autre cas réellement silencieux | retenue |
| 2 | 2e2dc2aa, 5ab5c7b8 | MAJEUR | cohérence, fragile, vérifié | « L'inverse est refusé par PHP » : c'est un `Deprecated`, le paramètre devient obligatoire | « Déprécié : le défaut ne sert plus à rien » ; garder la règle « optionnels en dernier » | retenue |
| 3 | aaec8701 | MAJEUR | cohérence, vérifié | « lève une Error à l'exécution » : erreur fatale de compilation | Citer `Fatal error: Cannot use positional argument after named argument` | retenue |
| 4 | 6672191f, 9c2d4c89, 809bf41a, ctrl-match-txt, ecr-txt-3 | MAJEUR | cohérence | Erreurs fréquentes en prose, sans `callout warning` ni message réel (tableau hors bornes, TypeError, portée, `UnhandledMatchError`, Parse error) | Un `callout warning` par notion avec le message exact | retenue |
| 5 | ctrl-if-code et suivants | MAJEUR | fragile TP, rapide | Le TP fait écrire `==`, des boucles qui ouvrent et ferment PHP autour du HTML (`<?= ?>`), `$t[$i]` dans une chaîne et `\"` : rien de cela n'est dans le cours | Ajouter `==` / `===`, un exemple de boucle autour du HTML et l'interpolation d'un élément de tableau | retenue (règle 2) |
| 6 | rappel-html-code | MAJEUR | cohérence | `table`, `thead`, `tbody`, `th`, `td` exigés au TP ex. 1, absents du rappel (présents dans les slides) | Ajouter au rappel ou renvoyer au module html-css | retenue |
| 7 | ctrl-switch-callout-txt | MINEUR | cohérence | Nombre de messages affichés sans `break` | Reformuler | MINEUR |
| 8 | ecr-txt-2, ctrl-while-callout-txt | MINEUR | fragile | « trois lignes de HTML » ; message des 30 s propre au serveur web | Reformuler | MINEUR |

##### Slides
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | ae80d252, e969b506, aaec8701 (notes) | MAJEUR | style, cohérence, vérifié | Mêmes affirmations fausses que le cours (n° 1 à 3) | Aligner sur le cours corrigé | retenue |
| 2 | sl-module-txt, sl-programme-table | MAJEUR | style | « 11 séances de 3 heures » face à un tableau de 7 séances | Vérifier et aligner | retenue |
| 3 | e00d6b23, 4d5c7732 | MAJEUR | cohérence, style | Deux slides « Les fonctions » consécutives, sans `slide-note` | Supprimer le doublon | retenue |
| 4 | sl-match-note, sl-switch-code, 2dfb08c7, sl-html-tables | MINEUR | style, cohérence | Décompte de lignes, `"moyen"` qui masque le piège du `break`, note « rien d'obligatoire » contredite par le TP, deux titres « Les tableaux » | Corriger | MINEUR |

##### TP
| # | id | Gravité | Agents | Problème | Proposition arbitrée | Décision |
|---|---|---|---|---|---|---|
| 1 | 2fd6f85f (7 sous-items) | MAJEUR | contrat | Sortie attendue non décrite pour plusieurs fonctions | Donner la valeur attendue de chaque affichage (ex. `compterAuDessus($montants, 50000)` → 12) | retenue |
| 2 | af428db0 | MAJEUR | fragile, cohérence | `part()` sans formule ni unité | « en pourcentage : valeur / total × 100 » | retenue |
| 3 | tp-ex2-3 | MAJEUR | fragile | Type de commentaire et emplacement non précisés | « commentaire PHP dans un bloc `<?php … ?>` avant le `<!DOCTYPE>` » | retenue |
| 4 | tp-bonus | MAJEUR | rapide | Bonus de 5 min pour 95 min restantes | Ajouter 3 ou 4 bonus de 15 à 20 min avec les seules notions du cours | retenue |
| 5 | tp-bonus-3, d00deaa5 | MAJEUR | contrat | Fichier non nommé | « dans classement.php » | retenue |
| 6 | tp-ex1 à tp-ex6, 2fd6f85f | MAJEUR | contrat | Aucune durée par exercice | Indiquer une durée estimée par exercice | retenue |
| 7 | tp-bonus-txt | MINEUR | style | « À faire si… » n'est pas un impératif | « Si vous avez fini…, faites ces deux ajouts. » | MINEUR |
| 8 | tp-ex3-4, tp-ex3-2, fab8cd66, e7004da1, tp-ex6-5 | MINEUR | fragile | Echo à modifier, `<br>`, `number_format` plutôt que `round`, espace avant `€`, `$i++` | Préciser | MINEUR |
| 9 | f6c08f49, tp-ex6-file, tp-bonus-3 | MINEUR | contrat, rapide | Signature de `indiceDuPlusBas`, numérotation du commentaire de classement.php, tolérance des 100 % | Préciser | MINEUR |

#### Désaccords en attente
| # | id | Remarques en présence | Recommandation | Tranché par l'utilisateur |
|---|---|---|---|---|
| 1 | tp-ex1, tp-ex2, tp-ex4, tp-ex6, 2fd6f85f | Contrat : critère de validation absent, BLOQUANT, propose « Vous avez fini quand… ». Verdict actif : « retire le Vous avez terminé quand … des TPs 1 et 2 ». | Garder un critère observable sans la formule : une ligne « Résultat attendu : … » ou un tableau d'essais. | |
| 2 | TP entier | Mesure du fragile : 124 min, soit 78 % du budget (hors plage 80–100 %). Budget lui-même calculé avec l'intro de 20 min. | Ne rien retirer ; les bonus étoffés (TP n° 4) absorbent l'écart pour les rapides. À revoir une fois les durées ajoutées. | |

#### Remarques écartées
| # | id | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|
| 1 | sl-intro, sl-programme-table, sl-module-onzer | cohérence | Mentions d'Onzer dans les slides | Présentation du module, pas un exemple : pas une fuite |
| 2 | tp-ex3 | contrat | Critère de validation « phrase cible » jugé limite | Laissé tel quel : la phrase verbatim est observable |

#### MINEURS
- intro-txt, style : l'introduction énumère le plan.
- blocs de sortie du cours, style : 13 commentaires ouvrent par « Affiche ».
- sl-intro-2, sl-module-onzer, 4f906971, 852419a2, style : gras en série, notes trop longues, gabarit « À dire : » / « pas X, c'est Y ».
- 46023bbf, fragile : date d'exemple figée.
- 77045245, rapide : ids décalés dans l'exercice 6.
