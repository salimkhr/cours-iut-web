# Rapports bruts — relecture PHP 1 à 4 (2026-10-27)



---

## Préparation des bacs à sable

## Préparation de la relecture, module php (sections 1 à 4)

Les 4 sections sont prêtes. J'ai seulement lu le serveur MCP PROD d1db0efe, sans aucune écriture MCP. Aucune slide n'a été copiée dans les bacs à sable.

**Problème commun :** `get_project_reference(php)` échoue deux fois sur `connect ECONNREFUSED 172.22.0.2:443` (dépôt de référence injoignable). `depart/` reste donc **vide** pour les sections 3 et 4 : l'état de fin de section n'est pas identifiable, je n'ai rien copié.

Les blocs `download-file` n'ont pas d'URL : leur contenu est intégré au bloc (`props.code`). Je l'ai écrit tel quel dans `fournis/`. Seuls les liens `/download/...` cités dans le texte ont été téléchargés depuis https://salimkhraimeche.dev (HTTP 200). Aucun TP n'annonce de durée.

**Fichiers de couverture**, dans `C:\Users\UTILIS~1\AppData\Local\Temp\claude\C--Users-Utilisateur-PhpstormProjects-cours-iut-web\476b8c25-51d3-4184-b603-d792066538d6\scratchpad\relecture-php\` :
- `couverture-1-bases-du-php.md`
- `couverture-2-programmation-orientee-objet.md`
- `couverture-3-structurer-son-code.md`
- `couverture-4-formulaire.md`

Chacun commence par une rubrique « Points d'attention ». Les sous-dossiers `_raw`, `_tools` et `_notes` du même dossier contiennent les données intermédiaires et les scripts.

### Section 1, bases du PHP
- Blocs : cours 140, TP 73, slides 104.
- TP : 7 exercices, 2 bonus.
- `fournis/` : `rappel.html` et `classement.php`. Pas de départ (sans objet).
- Le dossier de bac à sable de cette section a été supprimé avant la fin de mon travail. `supports/cours.md` et `tp.md` y avaient été écrits, mais je n'ai pas pu revérifier les marqueurs après coup.

### Section 2, programmation orientée objet
- Blocs : cours 84, TP 85, slides 77.
- TP : 10 exercices, 2 bonus.
- `fournis/` : `catalogue.php`, plus `pochettes-tp2.zip` et sa décompression `pochettes-tp2/` (6 PNG). Pas de départ (sans objet).
- Le dossier de bac à sable a lui aussi été supprimé entre-temps, avec la même conséquence que pour la section 1.
- **Le support exporté est incomplet :** la sous-liste de `tp2-ex4-2` (getters, `getCover()` et `getCoverUrl()`) n'apparaît pas dans l'export. Un étudiant simulé verra une consigne qui finit sur « : » sans la liste, alors que le site l'affiche.
- J'ai aussi relevé des sorties de slides incohérentes : `Recette::$nom` pour une classe `Sushi`, « Chef Marlène » au lieu d'« Akira », etc.

### Section 3, structurer son code
- Fichiers écrits : `C:\Users\Utilisateur\AppData\Local\Temp\cours-iut-bac\php-3-structurer-son-code-20261027-094328\supports\cours.md` et `supports\tp.md`.
- Blocs : cours 50, TP 80, slides 30.
- TP : 7 exercices (dont une partie avec 3 sous-parties), 3 bonus.
- `fournis/` :
  - `functions.php`, `view_index.php`, `view_list_albums.php`, `catalog.php`, `view_player.php` ;
  - `ressources-tp3.zip` et `ressources-tp3/` (`css/onzer.css` et 4 portraits) ;
  - `pochettes-tp2.zip` et `pochettes-tp2/`, re-téléchargés parce que le TP demande les pochettes du TP2.
- **Le support exporté est incomplet :** le code de `footer.php` (`tp3-extract-2-code`, imbriqué dans une consigne) et l'arborescence `tp3-recap-tree` ne sont pas rendus dans l'export.
- `depart/` : vide, pour la raison donnée plus haut.

### Section 4, formulaire
- Fichiers écrits : `C:\Users\Utilisateur\AppData\Local\Temp\cours-iut-bac\php-4-formulaire-20261027-094328\supports\cours.md` et `supports\tp.md`.
- Blocs : cours 144 (10 blocs de texte vides non exportés), TP 150, slides 107.
- TP : 13 exercices (5 dans la partie hackathon, 8 dans la partie Onzer), 5 bonus.
- `fournis/` : `stockage.php`, `equipes.json`, `view_404.php`, `users.php`, `view_login.php`, `view_create_user.php`, `view_artist_form.php`, `view_album_form.php`. Aucun lien `/download/` dans cette section.
- Le bloc « Indice : associer un titre à sa durée » est un bloc repliable. L'export l'affiche comme un titre `###`, ce qui peut le faire passer pour un exercice.
- `depart/` : vide. La partie Onzer part de l'état final du TP3, que je n'ai pas pu identifier.

Tous les supports sont en UTF-8 avec fins de ligne LF. Le contrôle des marqueurs `<!--id-->` a été refait pour les sections 3 et 4 : les seuls blocs absents sont les textes vides et le code imbriqué signalé en section 3.


---

## PHP 1 — collecteur

# Fiche de contexte : php/1-bases-du-php
Statut du rapport : terminé (une source indisponible, signalée ci-dessous)

## Liste de tâches
- [x] 1. list_modules : faite (6 modules, php en ordre 2)
- [x] 2. get_module php : faite
- [x] 3. list_sections php : faite (11 sections)
- [x] 4. get_section 1-bases-du-php : faite
- [x] 5. get_content cours, TP, slide : faite (3 sur 3)
- [ ] 6. get_project_reference : non faite, indisponible. Deux tentatives, même erreur : `connect ECONNREFUSED 172.22.0.2:443`. Aucun fichier lu.
- [ ] 7. export TP précédents (repli fil rouge) : non applicable. La section est au rang 1 (order 1), donc il n'existe aucune section précédente à exporter.
- [x] 8. list_verdicts par format : faite (cours : 0 ; TP : 6 ; slide : 0)
- [x] 9. list_exemplars par format : faite (cours, TP, slide : tous `[]`, et sans filtre : `[]`)
- [x] 10. list_block_types : faite (29 types)
- [ ] 11. search_content : non faite, aucun point précis à vérifier.

## Module
- slug : php ; titre : PHP ; sessionDurationMinutes : 180 (get_module et list_modules)
- universe : non disponible (champ absent de list_modules et get_module pour php ; seul rust en a un)
- exampleDomain : « Recettes de cuisine » : « Petite appli de recettes (Recette, Ingrédient, Auteur), utilisée uniquement pour illustrer le cours — jamais d'albums, d'utilisateurs Onzer ou de catalogue musical dans les exemples. »
- projectSpec (résumé, get_module) :
  - Nom : Onzer. Statut : draft. Dépôt de référence déclaré « validated » (url non consultée, voir Signalements).
  - Pitch : catalogue d'albums de musique avec comptes utilisateur et administration.
  - Livrable : appli PHP procédurale, une action = un fichier à la racine, entités User/Artist/Album, repositories PDO (PostgreSQL), sessions.
  - Vues en PHP natif (syntaxe alternative), Bootstrap 5.3.8 + Font Awesome, thème sombre.
  - Pages : Home, Player, Auth, CRUD Albums, Artistes (ajout seul).
  - Notions prévues : bases du PHP, fonctions et tableaux, POO, structuration, formulaires, lecture et écriture PDO, sessions, Symfony, Twig.
  - Onzer n'entre en scène qu'en section 2 (filRougeOutcome de la section 1).

## Section
- slug : 1-bases-du-php ; titre : Bases du PHP ; rang : 1 sur 11 (order 1 ; sectionCount 11)
- description (get_section) : « Découverte du PHP : syntaxe, variables et structures de contrôle pour générer des pages web dynamiques. »
- objectives (get_section) : « Écrire et exécuter un script PHP » ; « Déclarer et utiliser des variables » ; « Utiliser les structures de contrôle (if, boucles) » ; « Générer du HTML dynamique avec echo »
- totalDuration : 1 (séances de 180 min) ; courseIntroMinutes : 20
- brief : PRÉSENT
  - objectives (brief) : [] (vide)
  - notions (verbatim) :
    1. Syntaxe PHP
    2. echo
    3. Variables et types
    4. Tableaux indexés
    5. Structures de contrôle (if/elseif/else, switch, match)
    6. Boucles (for, foreach, while)
    7. Fonctions : déclaration, paramètres obligatoires et optionnels, typage, return, portée
  - filRougeStep : vide (« » dans le brief)
  - filRougeOutcome (verbatim) : « Pas d'incrément du fil rouge Onzer à ce stade : on pose la totalité des bases du langage — syntaxe, variables, tableaux indexés, structures de contrôle, boucles et fonctions — sur des exemples du domaine d'exemple (Recettes de cuisine) et un TP sur le classement Z-Event. Onzer entre en scène en section 2. »
  - notes (verbatim) : « Séance dense : la partie fonctions vient de l'ancienne section « Fonctions et tableaux », supprimée. Le TP tient en sept exercices, les deux derniers (boucles puis fonctions) occupant plus de la moitié du temps machine. Les tableaux associatifs sont volontairement absents : ils sont reportés en section 2. »
- curriculum actuel : null (aucun)

## Budgets
- cours + slides : courseIntroMinutes = 20 min
- TP : 1 × 180 − 20 = 160 min ; plage 80–100 % : 0,8 × 160 = 128 min à 160 min

## Contenus de la section
| Support | Source | Blocs (get_content) | Exercices / bonus |
|---|---|---|---|
| cours | db (contentId 6a743107fd6b8af974d7e8dc, version 152) | 140 nœuds au total (8 blocs de premier niveau) | — |
| TP | db (contentId 6a743107fd6b8af974d7e8dd, version 102) | 72 nœuds | 7 exercices, 2 bonus (voir ci-dessous) |
| slide | db (contentId 6a93e962433640f46add912d, version 198) | 104 nœuds (26 slides) | — |

Comptes faits à la main sur les JSON de get_content : ils sont à reprendre si un chiffre précis compte.

Exercices du TP (get_content) :
- Ex 1, « Rappel de HTML » (tp-ex1) : tableau HTML des six streamers
- Ex 2, « Votre première page PHP » (tp-ex2)
- Ex 3, « Variables et affichage » (tp-ex3)
- Ex 4, « Déboguer » (tp-ex4)
- Ex 5, « Conditions » (tp-ex5)
- Ex 6, « Boucles » (tp-ex6)
- Ex 7, « Des fonctions pour les statistiques » (id 2fd6f85f-679d-42b0-8899-e1f84c2281e2, 7 questions : 10d174cc-6f6d-4a7b-a2fd-9b53104e772d, fab8cd66-bd9c-41ef-85c2-56d0e4dedc59, f6c08f49-8d47-4154-8183-d4c84f9ed94d, 6e0e8337-17b6-48f8-b566-57ce5917c0bb, af428db0-d3a3-4f20-8aab-7476f41ec86b, e7004da1-d41d-4741-8886-0dfdd84bd397, 19ebb098-b4ea-4c97-93c9-9d43f4cb2295)
- Bonus « Pour aller plus loin » (tp-bonus) : 2 items : tp-bonus-3 (colonne « Part du total ») et d00deaa5-dcba-4c1e-bd50-210c52409d18 (chercherPseudo)

Support slide : 26 slides, dont une slide-transition « Les fonctions » (id e00d6b23-9a52-491e-99ae-5f0a0f76948a). Chaque slide porte une slide-note.

## Curriculum des sections précédentes
Aucune : la section 1 est la première du module. Rien à signaler de plus.

## État du fil rouge avant la section
- source : get_project_reference indisponible (ECONNREFUSED, deux tentatives). Repli export TP précédents : non applicable (rang 1).
- fichiers et fonctions existants à l'entrée : non disponible (dépôt inaccessible). Attendu selon le brief : aucun, l'état d'entrée est vide (filRougeStep vide, pas d'incrément Onzer).
- ce que la section doit y ajouter : rien (filRougeOutcome : pas d'incrément).
- état initial reconstituable pour un bac à sable : non vérifiable (dépôt inaccessible). Pas nécessaire pour cette section selon le brief.

## Verdicts actifs par format
- cours : aucun (list_verdicts format=cours : `[]`)
- TP : 6 verdicts
  1. 6a9c32df5d2dd2e6d3b1e55c (2026-09-05) : « il y a toujours la repetition sur le squeette »
  2. 6a9c32e15d2dd2e6d3b1e55d (2026-09-05) : « Téléchargez le squelette si dessus .... »
  3. 6a9c32e45d2dd2e6d3b1e55e (2026-09-05) : « retire le Vous avez terminé quand et "Exercice x —" des TPs 1 et 2 »
  4. 6a9c32e65d2dd2e6d3b1e55f (2026-09-05) : « comme sur le TP1, regarde l'affichage de la reponse sur les calculs qui son a réaliser — précision ensuite : pour moi, c'est utile uniquement sur la 8 »
  5. 6ac3edecd38d537522ddd73e (2026-10-05, php) : « retire ce genre de commentaire : "Il n'y a ni session ni base de données à ce stade :" »
  6. 6ac67a63137711fbe6236783 (2026-10-07, php) : « "Le TP ne guide pas trop les etudiants ?" (TP4 Formulaire, partie Onzer) » : règle validée, texte tronqué ici, texte complet via list_verdicts format=TP. Résumé : dans la partie fil rouge, seul le premier exercice d'un geste nouveau est guidé pas à pas, puis ne garder que le contrat et une ou deux consignes, pas de code de solution dans les astuces.
  - Les verdicts 1 à 4 n'ont pas de moduleSlug : ils ne sont pas rattachés à php.
- slide : aucun (list_verdicts format=slide : `[]`)

## Exemplaire par format
- cours : non disponible (list_exemplars format=cours : `[]`)
- TP : non disponible (list_exemplars format=TP : `[]`)
- slide : non disponible (list_exemplars format=slide : `[]`)

## Registre des blocs
file-tree, text, section, list, list-item, columns, column, callout, collapsible, image-card, table, section-card, code, code-with-preview, input-card, diagram, download-file, quote, divider, slide, slide-text, slide-code, slide-list, slide-list-item, slide-note, slide-table, slide-image, slide-transition, slide-code-with-preview (29 types)

## Signalements
- Les trois supports sont en source db : ils sont lisibles par export_content_compact et indexés par search_content. Aucun support en source file.
- get_project_reference : `connect ECONNREFUSED 172.22.0.2:443` (deux tentatives). Le dépôt de référence (url déclarée dans projectSpec.referenceRepo, status validated) n'a pas été lu.
- Aucune section précédente : repli fil rouge sans objet.
- list_exemplars vide pour les trois formats : aucun étalon à imiter.
- list_verdicts : aucun verdict cours ni slide ; 6 verdicts TP dont 4 sans moduleSlug.
- Les serveurs MCP cours-iut-mcp et phpstorm sont en échec de connexion (message de l'environnement). Ils ne sont pas utilisés ici.

## Définition de terminé
- ✔ chaque champ de la fiche rempli ou marqué « non disponible » avec la raison : module, section, brief, budgets, contenus, verdicts et exemplaires renseignés. Non disponibles avec raison : universe du module (champ absent), état du fil rouge (dépôt inaccessible, ECONNREFUSED), exemplaires (list_exemplars `[]`).
- ✔ budgets calculés avec le calcul visible : cours + slides = courseIntroMinutes = 20 min ; TP = 1 × 180 − 20 = 160 min ; plage 128 à 160 min.
- ✔ brief présent : brief de la section 1 renvoyé par list_sections et get_section (notions verbatim, 7 entrées).
- ✔ sources prévues lues ou indisponibilité signalée : 9 sources lues sur 10 prévues (list_modules, get_module, list_sections, get_section, get_content ×3, list_verdicts ×3 par format, list_exemplars ×3 par format, list_block_types). Indisponible et signalé : get_project_reference (ECONNREFUSED, deux tentatives). Non applicable : export TP précédents (rang 1). Non faite : search_content (aucune vérification demandée).



---

## PHP 1 — style cours

# Relecture style : php/1-bases-du-php — cours
Statut du rapport : terminé

## Liste de tâches
Source : prod, `export_content_compact` v152. J'ai compté 104 blocs porteurs de texte : titres, text, callouts (titre et corps), légende du mermaid, cellules de table, items de liste, lien, et paragraphes d'explication placés sous les blocs de code. J'ai exclu les blocs de code purs et le conteneur de liste `web-meth-list`, qui est vide. Chaque bloc a été relu selon A, B, C, D, E.
- [x] blocs 1 à 20 (A B C D E) : intro-txt, sec-rappel, rappel-html-txt, rappel-html-txt-2, rappel-html-lien, sec-web, web-cycle, web-txt-1, 96e87d9b, web-txt-2, web-callout, web-callout-txt, web-url, web-url-txt, web-url-table, web-methodes, web-meth-txt, web-meth-get, web-meth-post, web-meth-txt-2
- [x] blocs 21 à 41 (A B C D E) : sec-ecrire, ecr-balises, ecr-txt-1, ecr-callout, ecr-callout-txt, ecr-echo, ecr-txt-2, ecr-syntaxe, ecr-txt-3, sec-var, var-declarer, var-txt-1, var-txt-2, var-interp, var-interp-txt-1, var-interp-txt-2, 38b9d813, cc69ba21, 8bd7bee0, ab058d5a, 07d3c70a
- [x] blocs 42 à 62 (A B C D E) : ea975109, 5a57f055, 2b206b19, 827c5199, 28bbdd1b, a569b89c, d82ffa57, sec-controle, ctrl-cond, ctrl-if, ctrl-if-txt, 9323aef7, ctrl-switch, ctrl-switch-txt, 3569cb91, ctrl-switch-callout, ctrl-switch-callout-txt, ctrl-match, ctrl-match-txt, 6e2e7ab3, ctrl-match-txt-2
- [x] blocs 63 à 91 (A B C D E) : ctrl-boucles, ctrl-for, ctrl-for-txt, e658970c, ctrl-foreach, ctrl-foreach-txt, aad927da, ctrl-while, ctrl-while-txt, 698b8ee2, ctrl-while-callout, ctrl-while-callout-txt, 8e05eda5, fea26d76, 9ad2a129, a5e7d95f, a5feabcf, b07d1074, 8592120e, 73767fef, f3b3f0a9, 15ee4c80 (code, exclu), a4586a79, 5ab5c7b8, 2e2dc2aa, ceed502c, a31e548b, d4463274, ee846411, aaec8701
- [x] blocs 92 à 104 (A B C D E) : 8a21dfee, 48262a3d, 51f3d5cc, 632691ce, 2f86c6ac, 96765f99, c2e23ca4, be5cd8ac, 580ca91b, 9b21d793, 6cc7cb42, 46023bbf, fd9fffc1
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | intro-txt | MINEUR | 30, 10 | « Ici, le langage lui-même : sa syntaxe, ses variables, ses tableaux, ses conditions, ses boucles et ses fonctions. Les exemples tournent autour d'un carnet de recettes. » | Supprimer l'énumération de six items, qui recopie le plan des titres. Garder « Les exemples tournent autour d'un carnet de recettes » et finir sur un fait concret, par exemple la première page `.php` à écrire. |
| 2 | support entier (blocs 53, 56, 61, 66, 69, 72, 78, 81, 84, 89, 94, 97, 100) | MINEUR | 27 (anaphore) | « Affiche `Recette rapide.` » / « Affiche `Un peu de technique.` » / « Affiche deux fois… » | Treize commentaires de sortie ouvrent par « Affiche ». Varier l'attaque sur quelques-uns : « On obtient », « Le navigateur reçoit », « Résultat : », ou une phrase qui part de la cause. |

## Vue d'ensemble
Le support est propre : pas de vocabulaire IA, pas de tiret cadratin, vouvoiement tenu, titres en minuscules, gras de repère seulement. Il y a des opinions (« prenez `match` », « ne fermez pas avec `?>` »), des messages d'erreur exacts et des détails vérifiables.
Les seuls tics sont l'intro qui énumère son plan et la répétition de « Affiche » en tête des commentaires de sortie.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 104 blocs relus sur 104 (aucune consigne ni slide-note dans ce cours)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 2 remarques, 2 complètes



---

## PHP 1 — style slides

# Relecture style : php/1-bases-du-php — slides
Statut du rapport : terminé

Source : export compact de la prod (db), v198 du 2026-10-21. Je n'ai pas eu besoin de `get_content` : l'export suffit pour le texte.

## Liste de tâches
Les blocs de code, de sortie et d'aperçu (b7cfe612, 2d12fd92, 1fc44206, 9080324a, 9faef9fe, 47832653, sl-var-code, sl-var-res, sl-quotes-code, sl-quotes-res, sl-cond-code, sl-cond-res, sl-switch-code, sl-switch-res, sl-match-code, sl-match-res, sl-while-code, sl-while-res, 920da8ce, 917ed70c, 0a4da58d, be3aa747, 56a420cb, 39af3ddc, 517db450, 5e3932aa, f52475df, dbb9ce2b, ff3e8355, 2fc39275, 9164facf) ne sont pas des blocs de prose. Je les ai seulement parcourus pour repérer des artefacts (critère E) et je ne les compte pas dans la couverture.

- [x] sl-intro, sl-intro-1, sl-intro-2, sl-intro-conception, sl-intro-3, sl-intro-bdd, sl-intro-claude, sl-intro-note (A B C D E)
- [x] sl-module, sl-module-txt, sl-module-1, sl-module-2, sl-module-onzer, sl-module-orga, sl-module-qcm, sl-module-exam, sl-module-note (A B C D E)
- [x] sl-programme, sl-programme-table (cellules comprises), sl-programme-note (A B C D E)
- [x] sl-html-page, sl-html-page-note, sl-html-texte, sl-html-texte-note, sl-html-listes, sl-html-listes-note, sl-html-tables, sl-html-tables-note, sl-html-attrs, sl-html-attrs-note (A B C D E)
- [x] sl-dyn, sl-dyn-1, sl-dyn-2, sl-dyn-note, sl-cycle, sl-cycle-diag, sl-cycle-note, sl-bloc, sl-bloc-note (A B C D E)
- [x] sl-var, sl-var-note, sl-quotes, sl-quotes-note, sl-cond, sl-cond-note, sl-switch, sl-switch-note, sl-match, sl-match-note, sl-while, sl-while-note, sl-for, sl-for-note (A B C D E)
- [x] 829b1d90, c7cbc237, sl-boucles, sl-boucles-note (A B C D E)
- [x] e00d6b23, 4d5c7732, a0683fd3, 896e7ce0, bd8c9cec, 4f906971, e969b506, ae80d252 (A B C D E)
- [x] cddca790, 02192097, 2dfb08c7, 852419a2 (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | sl-module-txt (et sl-programme-table) | MAJEUR, à voir par contrat/cohérence | hors grille | « écrit de zéro en 11 séances de 3 heures » | Le tableau du programme ne liste que 7 séances. Compléter le tableau ou corriger le nombre de séances. |
| 2 | sl-intro-2 (et -conception, -3, -bdd) | MINEUR | 16, 17 | « **L'accompagnement au changement** : aider le client… » | Quatre puces de suite sous la forme « **Terme** : définition ». Garder le gras sur le premier mot seulement, ou fondre deux puces en une phrase. |
| 3 | sl-intro-claude | MINEUR | D, 8 | « Exploité quotidiennement par **Claude Code** » | Le sujet est flou : exploité par qui, et en quoi ? La puce rompt aussi le parallèle avec les quatre autres. Écrire par exemple « Au quotidien : Claude Code, comme vous ». |
| 4 | sl-module-onzer (et -qcm, -exam) | MINEUR | 16 | « **Onzer**… », « **Évaluation** », « **examen final** » | Gras sur la moitié des puces de la liste. Le garder sur « Onzer » seulement. |
| 5 | sl-quotes-note | MINEUR | D (clarté), à voir par cohérence | « rester sur la slide précédente ou masquer le bas de l'écran » | L'instruction est confuse pour l'oral. Écrire « Masquer le bas de l'écran, poser la question, puis dévoiler. » |
| 6 | sl-match-note | MINEUR | à voir par cohérence | « Quatre lignes contre onze pour le même résultat » | Les décomptes ne collent pas : environ 5 lignes pour `match`, 8 pour `switch`. Recompter, ou dire « moitié moins de lignes ». |
| 7 | sl-html-listes-note | MINEUR | D (clarté) | « C'est la balise qu'ils vont produire en boucle » | Le référent est ambigu (`<ol>` ou `<li>`). Écrire « C'est le `<li>` qu'ils vont produire en boucle… ». |
| 8 | e00d6b23 et 4d5c7732 | MINEUR | 34 | « Les fonctions » / « Les fonctions » (suivis de « Une fonction ») | Trois titres consécutifs sur le même sujet. Supprimer un des doublons. |
| 9 | 4f906971 et 852419a2 | MINEUR | 27, 32, 16 | « Trois étapes… » ; « OBLIGATOIRES… OPTIONNELS… APRÈS » | Notes de 9 à 12 paragraphes qui recopient les étapes de l'animation et abusent des majuscules d'insistance. Couper ce qui redit la slide et garder 3 ou 4 phrases à dire. |
| 10 | ae80d252 | MINEUR, à voir par contrat/cohérence | hors grille | « PHP aurait converti "douze" en 0 et affiché 0, sans un mot » | Affirmation à vérifier : en PHP 8, `"douze" * 60` lève une TypeError. À contrôler avant de la dire en cours. |
| 11 | (support entier) | MINEUR | 9, 32, 27 | « ce n'est pas un exercice d'école, c'est un vrai site web » ; « Ce n'est pas une limitation, c'est ce qui rend… » ; « À dire : » (environ 17 notes) ; « Trois étapes : » (environ 10 notes) | Le parallélisme « pas X, c'est Y » revient dans au moins 6 notes. Chaque note s'ouvre sur « À dire : » ou « Trois étapes : ». Varier les attaques et garder « pas X, c'est Y » pour deux ou trois endroits. |

## Vue d'ensemble
Le ton est celui d'un enseignant : ancré, avec des chiffres, des messages d'erreur exacts, des avis (« celle qu'ils garderont ») et de vraies remarques de classe. Il n'y a aucun artefact ni aucun tutoiement.
Ce qui revient : le gabarit répétitif des notes (« À dire : », « Trois étapes : », le tour « pas X, c'est Y ») et deux notes trop longues.
À corriger surtout : l'écart de 11 séances annoncées contre 7 dans le tableau, et quelques repères de gras en trop sur l'intro et la liste du module.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 69 blocs relus sur 69
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 11 remarques, 11 complètes (les remarques 1, 5, 6 et 10 relèvent de la cohérence ou du contrat et sont marquées « hors grille » ou « à voir par cohérence »)


---

## PHP 1 — style TP

# Relecture style : php/1-bases-du-php — TP
Statut du rapport : terminé

## Liste de tâches
Contenu lu via export_content_compact (prod, source db, v102). Chaque bloc relu selon A B C D E.
- [x] bloc tp-intro (A B C D E)
- [x] bloc tp-woody, tp-woody-txt, tp-woody-txt-2 (A B C D E)
- [x] bloc tp-donnees, tp-donnees-txt, tp-donnees-table, tp-donnees-callout, tp-donnees-callout-txt (A B C D E)
- [x] bloc tp-ex1, tp-ex1-txt, tp-ex1-1, tp-ex1-2, tp-ex1-3, tp-ex1-4 (A B C D E)
- [x] bloc tp-ex2, tp-ex2-txt, tp-ex2-1, tp-ex2-2, tp-ex2-3 (A B C D E)
- [x] bloc tp-ex3, tp-ex3-txt, tp-ex3-1 à tp-ex3-5 (A B C D E)
- [x] bloc tp-ex4, tp-ex4-txt, tp-ex4-1 à tp-ex4-3 (A B C D E)
- [x] bloc tp-ex5, tp-ex5-txt, tp-ex5-1 à tp-ex5-5 (A B C D E)
- [x] bloc tp-ex6, tp-ex6-txt, tp-ex6-1, tp-ex6-2, tp-ex6-3, 77045245-c12c-4ec8-b515-5a69b26257a8, tp-ex6-4 (A B C D E)
- [x] bloc 2fd6f85f-679d-42b0-8899-e1f84c2281e2, a08edf01-c277-4c48-9df5-819096e86ba1 (A B C D E)
- [x] bloc 10d174cc-6f6d-4a7b-a2fd-9b53104e772d, fab8cd66-bd9c-41ef-85c2-56d0e4dedc59, f6c08f49-8d47-4154-8183-d4c84f9ed94d, 6e0e8337-17b6-48f8-b566-57ce5917c0bb, af428db0-d3a3-4f20-8aab-7476f41ec86b, e7004da1-d41d-4741-8886-0dfdd84bd397, 19ebb098-b4ea-4c97-93c9-9d43f4cb2295 (A B C D E)
- [x] bloc tp-bonus, tp-bonus-txt, tp-bonus-3, d00deaa5-dcba-4c1e-bd50-210c52409d18 (A B C D E)
- [x] support entier (B D)

Blocs non comptés (sans texte) : les 3 blocs de code (hello.php, debug.php, CSS), les 2 pièces jointes (rappel.html, classement.php) et les blocs vides tp-ex1-list, efb79690-fdf5-4940-b78e-fdc9baf3bae5, tp-ex*-list.

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | tp-bonus-txt | MINEUR | D (impératif vouvoyé) | « À faire si vous avez fini avant la fin de la séance. » | « Si vous avez fini avant la fin de la séance, faites ces deux ajouts. » La forme nominale « À faire » n'est pas l'impératif vouvoyé attendu. |

Verdicts TP actifs : déjà respectés dans cette version. Aucun « Vous avez terminé quand », aucun titre « Exercice x — », aucune numérotation écrite à la main dans les titres. Le commentaire du type « Il n'y a ni session ni base de données à ce stade » est absent. Rien à retirer.

## Vue d'ensemble
Le TP est propre. Les consignes sont à l'impératif vouvoyé, sans tutoiement, sans annonce de plan, sans phrase creuse ni artéfact. Il n'y a ni tiret cadratin ni conclusion plaquée. Le gras sert de repère et ne s'accumule pas. Le rythme est varié et les détails sont ancrés (valeurs, pseudos, piège `>` contre `>=`). Seule retouche : la remarque 1.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes comprises : 59 blocs relus sur 59 (pas de slide-note dans ce support)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 1 remarque, 1 complète


---

## PHP 1 — cohérence

# Relecture cohérence : php/1-bases-du-php (cours, slides, TP)
Trois rapports séparés. Dépôt de référence injoignable (ECONNREFUSED) : critère « TP conforme au dépôt » non vérifiable, donc rapport TP « incomplet » pour cette seule raison (externe).

---
# COURS — Statut : terminé

## Liste de tâches
- [x] 25 exemples (code, tableaux, diagramme) × domaine
- [x] 7 notions du brief × curriculum et structure
- [x] 8 notions hors brief × curriculum
- [x] Grammaire des blocs, par partie (6 parties)

## Remarques
| # | id du bloc | Gravité | Critère | Passage | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | 9c2d4c89, 96765f99 | MAJEUR | 3 (à confirmer par etudiant-fragile) | « Sans typage, PHP aurait converti "douze" en 0 et affiché 0 » | Le cours cible PHP 8 ; en PHP 8 `"douze" * 60` lève une TypeError (chaîne non numérique). Même phrase dans la note de la slide « Le typage ». | Vérifier sur PHP 8 puis corriger l'argument. |
| 2 | 5ab5c7b8, 2e2dc2aa | MAJEUR | 3 (à confirmer) | « L'inverse est refusé par PHP » (optionnel avant obligatoire) | Callout sans message réel ; en PHP 8.x c'est un `Deprecated` (« Optional parameter $x declared before required parameter $y is implicitly treated as a required parameter »), pas un refus. | Citer le message exact observé. |
| 3 | aaec8701 | MAJEUR | 3 (à confirmer) | « un positionnel après un nommé lève une Error à l'exécution » | Message réel attendu : `Fatal error: Cannot use positional argument after named argument`, erreur de compilation. | Corriger type et message. |
| 4 | 6672191f / 827c5199 | MAJEUR | 3 temps manquant | Tableaux : pas de callout warning | Message attendu `Warning: Undefined array key 3`. | Ajouter callout. |
| 5 | 9c2d4c89 / 96765f99 | MAJEUR | 3 | Typage : TypeError seulement en prose | Message réel dans la slide : `Argument #1 ($minutes) must be of type int, string given`. | Callout warning. |
| 6 | 809bf41a / 580ca91b | MAJEUR | 3 | Portée : `Warning: Undefined variable $plat` en prose | Pas de callout. | Callout warning. |
| 7 | ctrl-match-txt / 6e2e7ab3 | MAJEUR | 3 | match : « PHP lève une erreur » sans la nommer | Message réel `UnhandledMatchError: Unhandled match case`. | Callout. |
| 8 | ctrl-if-code, ctrl-for-code, ctrl-foreach-code, ed5bc123, ecr-code-1/3 | MAJEUR | 3 | if, for, foreach, return, echo/`;` sans callout warning | `Parse error` seulement en prose (ecr-txt-3), sans message complet (`syntax error, unexpected token "echo", expecting "," or ";"`). | Callouts avec messages réels. |
| 9 | var-code-1 | MINEUR | 3 | Variables/types sans erreur fréquente | Casse `$Nom`/`$nom` → `Undefined variable`. | Callout. |
| 10 | ecr-code-1, d82ffa57 | MINEUR | 2 | echo et variables utilisés avant leur sous-section ; `for` cité avant d'être enseigné | Ordre du cours. | Annoncer ou déplacer. |
| 11 | ctrl-if-code, ctrl-for-code | MINEUR | 2 | `<`, `<=`, `++` non expliqués | — | Une ligne. |
| 12 | ctrl-switch-callout-txt | MINEUR | 3 | « sans break afficherait les trois messages » | `facile` n'est pas atteint avec « moyen » ; chute libre exécute aussi `default` (quatre). | Reformuler. |
| 13 | ecr-callout-txt | MINEUR | 2 | « envoi d'en-têtes plus tard » | Anticipe header sans l'expliquer. | Signaler pour curriculum. |
| 14 | rappel-html-code | MINEUR | 2 | Le rappel n'a ni table/thead/tbody/th/td, ni ol | Présents dans slides et exigés au TP ex. 1. | Ajouter ou renvoyer à html-css. |
| 15 | b41de7c4 | MINEUR | 2 hors brief | Paramètres nommés | Absents du brief ; utilisés au TP ex. 7.7. | Signaler pour curriculum. |

## Confrontations
- exampleDomain : 25 exemples sur 25, tous Recettes, aucune fuite Onzer. universe : sans objet.
- curriculum : 15 notions sur 15 ; section 1, aucun curriculum antérieur. Introduites hors brief : paramètres nommés ; count, number_format, round, date, var_dump, die ; `$t[] =` ; guillemets simples/doubles ; HTTP GET/POST ; URL. Tableaux associatifs absents (conforme).
- Structure : temps 1 et 2 présents partout ; temps 3 (callout avec message réel) manque pour la plupart des notions.

## Définition de terminé
- ✔ exemples vs exampleDomain : 25/25
- ✔ notions vs curriculum : 15/15
- sans objet : dépôt ; slides

---
# SLIDES — Statut : terminé

## Liste de tâches
- [x] 24 exemples × domaine
- [x] 27 slides × critère 5
- [x] 7 notions du brief × couverture
- [x] Grammaire des blocs

## Remarques
| # | id | Gravité | Critère | Passage | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | e00d6b23, 4d5c7732 | MAJEUR | 5 | Deux slides « Les fonctions » consécutives, sans contenu ni slide-note | Aucune note dans l'export. | Supprimer le doublon ou annoter. |
| 2 | sl-dyn-1/2 | MINEUR | 5 | « Un fichier .html est renvoyé tel quel, identique pour tout le monde » | Cours web-txt-2 quasi identique. | Reformuler. |
| 3 | sl-html-page…sl-html-attrs | MAJEUR | 5 | table/thead/tbody, ol, h2 en slides, absents du cours | rappel-html-code n'en contient pas ; TP ex. 1 les exige. | Ajouter au cours. |
| 4 | sl-intro, sl-programme-table, sl-module-onzer | MINEUR | 1 | Mentions d'Onzer | Brief : aucune trace d'Onzer attendue ; présentation du module, pas un exemple. | Arbitrer. |
| 5 | bd8c9cec | MINEUR | 5 | Deux idées (obligatoire + optionnel) | Titre de la slide. | Scinder. |
| 6 | a0683fd3 | MINEUR | 5 | « Une fonction » mêle déclaration, return, paramètre | La note anticipe les paramètres. | Scinder. |
| 7 | 2dfb08c7 (note) | MINEUR | 5 | « Rien d'obligatoire dans le TP » | TP ex. 7.7 : « nommez l'argument ». | Corriger la note. |
| 8 | sl-switch-code / note | MINEUR | 5 | « sans les deux break » | `"moyen"` est le dernier case : sortie identique, piège invisible. | Utiliser `"facile"`. |
| 9 | e969b506, aaec8701 (notes) | MAJEUR | 3/5 (à confirmer) | Mêmes affirmations douteuses que cours #1 et #3 | — | Aligner. |
| 10 | sl-html-tables / 829b1d90 | MINEUR | 5 | Deux titres « Les tableaux » | — | Renommer « Tableaux HTML ». |
| 11 | ordre | MINEUR | 5 | while, for, tableaux, foreach ; typage, portée, nommés | Ordre différent du cours. | Aligner. |
| 12 | brief | MINEUR | 2 | Pas de slide sur echo/`;`/commentaires ni sur var_dump, die, number_format | Utilisés par le TP. | Slide ou note d'annonce. |

## Confrontations
- exampleDomain : 24/24 (Recettes).
- curriculum : 7/7 notions du brief ; absentes du cours : tableaux HTML, ol.
- cours : 27/27 slides comparées ; slide-note partout sauf les deux doublons ; aucun paragraphe recopié intégralement.

## Définition de terminé
- ✔ exemples 24/24 ; ✔ notions 7/7 ; sans objet : dépôt ; ✔ comparaison au cours 27/27

---
# TP — Statut : incomplet
Raison : get_project_reference injoignable (ECONNREFUSED), aucun TP précédent pour se replier, classement.php (download-file) non lisible. Cause externe, pas un défaut du TP.

## Liste de tâches
- [x] ex. 1 « Rappel de HTML » (tp-ex1) × notions et dépôt
- [x] ex. 2 « Votre première page PHP » (tp-ex2)
- [x] ex. 3 « Variables et affichage » (tp-ex3)
- [x] ex. 4 « Déboguer » (tp-ex4)
- [x] ex. 5 « Conditions » (tp-ex5)
- [x] ex. 6 « Boucles » (tp-ex6)
- [x] ex. 7 « Des fonctions pour les statistiques » (2fd6f85f)
- [x] bonus « Part du total » et « chercherPseudo »
- [x] progression guidé → fil rouge (pas de projectRef : rien à inverser)
- [x] grammaire des blocs, par partie (8)

## Remarques
| # | id | Gravité | Critère | Passage | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp-ex1-2/3 | MAJEUR | 2 | table, thead, th, tbody, td | Absents du cours (rappel-html) ; seulement dans les slides. | Ajouter au cours. |
| 2 | tp-ex1-4, tp-ex6-2 | MINEUR | 2 | classe Bootstrap `table` | Bootstrap enseigné nulle part ici ; dépendance html-css non vérifiable. | Préciser. |
| 3 | 2fd6f85f | MINEUR | 2 | Portée (brief) jamais exercée explicitement | La note de slide cddca790 l'annonce mais aucune consigne. | Consigne de test. |
| 4 | af428db0 | MINEUR | 4 | `part()` sans formule ni unité | Le bonus parle de 100 % : pourcentage implicite. | Préciser. |
| 5 | be0c3951 | MINEUR | 6 | Bloc CSS sans filename | — | Préciser le fichier cible. |
| 6 | d00deaa5 | MINEUR | 4 | Pseudo `Ponce` | Non vérifiable (fichier non exportable). | Confirmer. |

## Confrontations
- exampleDomain : sans objet.
- curriculum : 8/8 exercices et bonus ; toutes les notions sont dans le cours sauf table HTML (#1) et Bootstrap (#2) ; aucun BLOQUANT.
- dépôt : 0 sur 9 résultats observables confrontés. Fichiers lus : aucun. Repli : « AntoineDaniel est classé 1 avec 120000 euros », `120 000` et l'égalité des deux premiers sont cohérents avec la table de données et le cours.
- Progression : ex. 1-5 guidés, ex. 6 semi-guidé, ex. 7 autonome ; aucune solution visible. Budget 160 min : durées non exportées, non vérifié.

## Définition de terminé
- sans objet : exemples ; ✔ notions 8/8 ; ✘ dépôt 0/9 (voir raison) ; sans objet : slides


---

## PHP 1 — contrat TP

# Relecture contrat : php/1-bases-du-php — TP
Statut du rapport : incomplet (somme des durées non calculable)

Source : export prod, source db, version TP 102. Contenu lu via export_content_compact, get_content (fichiers fournis inclus) et get_section. Serveurs cours-iut-mcp et phpstorm non utilisés (non connectés). Content-writer non chargé.

## Liste de tâches
- [x] tp-ex1 « Rappel de HTML » : 6 champs + durée (durée absente)
- [x] tp-ex2 « Votre première page PHP » : 6 champs + durée (durée absente)
- [x] tp-ex3 « Variables et affichage » : 6 champs + durée (durée absente)
- [x] tp-ex4 « Déboguer » : 6 champs + durée (durée absente)
- [x] tp-ex5 « Conditions » : 6 champs + durée (durée absente)
- [x] tp-ex6 « Boucles » : 6 champs + durée (durée absente)
- [x] 2fd6f85f « Des fonctions pour les statistiques » (ex 7, 7 sous-items) : 6 champs + durée (durée absente)
- [x] tp-bonus-3 « Part du total » : 6 champs + durée (durée absente)
- [x] d00deaa5 « chercherPseudo » : 6 champs + durée (durée absente)
- [ ] somme des durées et pourcentage du budget : non réalisable (0 durée sur 7 blocs du tronc commun)

## Grille
Règle appliquée : « présent » = consigne verbatim ou critère explicite de fin ; « vague » = décrit sans vérification ; « absent » = rien pour ce champ.

| Exercice (id) | Type | 1 Fichier | 2 Noms | 3 Données | 4 API | 5 Résultat | 6 Validation | Durée |
|---|---|---|---|---|---|---|---|---|
| tp-ex1 | tronc | présent | présent | présent (six streamers de la section Données, squelette rappel.html) | présent | présent | absent | absente |
| tp-ex2 | tronc | présent | présent | sans objet (aucune saisie) | présent (code fourni) | présent | absent | absente |
| tp-ex3 | tronc | présent | présent | présent | présent | présent (phrases cibles verbatim) | présent (phrase cible verbatim) | absente |
| tp-ex4 | tronc | présent | présent | présent (code fourni) | présent | vague | absent | absente |
| tp-ex5 | tronc | présent | présent | présent | présent | présent | présent (« les trois doivent afficher la même chose ») | absente |
| tp-ex6 | tronc | présent | présent | présent (classement.php fourni, 100 streamers) | présent | présent | absent | absente |
| 2fd6f85f (ex 7) | tronc | présent | présent (indiceDuPlusBas sans signature) | présent | présent | vague | absent | absente |
| tp-bonus-3 | bonus | vague (fichier implicite) | présent | présent | présent | présent | présent (« vérifiez… 100 % ») | absente |
| d00deaa5 | bonus | vague (fichier implicite) | présent | présent | présent | présent | présent (test avec pseudo inexistant) | absente |

## Budget
- tronc commun : durées absentes pour 7/7 blocs (tp-ex1 à tp-ex6, 2fd6f85f) : somme non calculable.
- budget TP : 1 × 180 − 20 = 160 min ; plage 128–160 min (valeurs du collecteur, non recalculées).
- pourcentage : non évaluable. Aucune conclusion « hors plage » n'est posée.
- bonus (hors budget) : durées absentes ; impossible de vérifier qu'ils ne sont pas comptés.
- Indice non chiffré : la note de section indique que les exercices boucles et fonctions occupent « plus de la moitié du temps machine ». Ce n'est pas une durée par exercice.

## Remarques
| # | id du bloc | Gravité | Champ | Passage concerné | Proposition |
|---|---|---|---|---|---|
| 1 | tp-ex1 | BLOQUANT | 6 Validation | aucune phrase de fin ; « Ajoutez la classe table pour obtenir des bordures » décrit un rendu | ajouter : « Vous avez fini quand la page affiche un tableau de 4 colonnes et 6 lignes de données, avec bordures. » |
| 2 | tp-ex2 | BLOQUANT | 6 Validation | les questions 1 à 3 demandent des observations, sans critère de fin | ajouter : « Vous avez fini quand la page affiche le titre et la date, et que votre commentaire répond aux deux questions. » |
| 3 | tp-ex4 | BLOQUANT | 6 Validation | « Notez ce qui a disparu » sans sortie attendue | ajouter le type attendu pour chaque variable (string, int, bool) et l'absence de « Fin de la page. » après die(). Champ 5 vague : préciser la sortie de var_dump. |
| 4 | tp-ex6 | BLOQUANT | 6 Validation | aucune phrase de fin (étapes 1 à 5) | ajouter : « Vous avez fini quand la page affiche les 100 lignes, le podium coloré et le total. » |
| 5 | 2fd6f85f (sous-items 10d174cc, fab8cd66, f6c08f49, 6e0e8337, af428db0, e7004da1, 19ebb098) | BLOQUANT | 6 Validation | aucun critère de fin ; « appelez-la sans le second pour voir l'erreur » n'est pas un critère | ajouter un critère par sous-item, par ex. compterAuDessus($montants, 50000) affiche 12. |
| 6 | 2fd6f85f (10d174cc, fab8cd66, f6c08f49, 6e0e8337, af428db0, e7004da1, 19ebb098) | MAJEUR | 5 Résultat | rendu non décrit pour totalCollecte, compterAuDessus, indiceDuPlusHaut/Bas, classeDuRang ; erreur PHP non nommée | donner la sortie attendue de chaque affichage |
| 7 | 2fd6f85f (f6c08f49) | MINEUR | 2 Noms | « Écrivez indiceDuPlusBas() sur le même modèle » : signature sans paramètre ni type de retour, contrairement à la règle du texte | écrire : indiceDuPlusBas(array $montants): int |
| 8 | tp-ex6-file (fichier fourni classement.php) | MINEUR | 3 Données | commentaire « Question 4 : le total collecté » ; dans la consigne, le total est l'étape 5 (tp-ex6-4) et la couleur est l'étape 4 | aligner la numérotation du commentaire sur la consigne |
| 9 | tp-ex1, tp-ex2, tp-ex3, tp-ex4, tp-ex5, tp-ex6, 2fd6f85f | MAJEUR | Durée | aucune durée estimée dans l'arbre du TP (les champs totalDuration et courseIntroMinutes sont des données de section) | ajouter une durée estimée par exercice ; la somme deviendra calculable |
| 10 | tp-bonus-3, d00deaa5 | MAJEUR | Mention « bonus » | titre « Pour aller plus loin », texte « À faire si vous avez fini… » : le mot « bonus » n'apparaît pas | intituler la section « Bonus » |
| 11 | tp-bonus-3 | MAJEUR | 1 Fichier | « Ajoutez au tableau une colonne » : le fichier n'est pas nommé | écrire : « dans classement.php ». |
| 12 | d00deaa5 | MAJEUR | 1 Fichier | fichier non nommé | écrire : « dans classement.php ». |
| 13 | tp-bonus-3, d00deaa5 | MAJEUR | Durée | durée absente | ajouter une durée estimée |
| 14 | tp-bonus-1, tp-bonus-2 | information | — | les identifiants tp-bonus-1 et tp-bonus-2 n'existent pas dans l'export ; la liste des bonus commence à tp-bonus-3 | vérifier s'il manque des bonus, ou renuméroter |
| 15 | 2fd6f85f | information | — | ce bloc est le titre de l'exercice 7 ; sa consigne est dans ses 7 sous-items | la ligne du rapport regroupe les 7 sous-items |
| 16 | tp-ex3 | information | 6 Validation | le critère retenu est la phrase cible verbatim ; si vous jugez ce critère insuffisant, passez le champ à absent (BLOQUANT) | à trancher par le responsable |

## Définition de terminé
- ✔ grille complète, chaque exercice et bonus × 6 champs : 9 lignes sur 9, 6 cases chacune remplies (dont « sans objet » pour tp-ex2 champ 3).
- ✘ somme des durées et pourcentage du budget : non calculés. Durées absentes pour 7/7 blocs du tronc commun ; budget 160 min, plage 128–160 min, pourcentage non évaluable.

Le rapport est incomplet : la somme ne peut pas être calculée tant que les durées ne sont pas ajoutées. Il comporte 5 BLOQUANT (champ 6 absent sur tp-ex1, tp-ex2, tp-ex4, tp-ex6 et 2fd6f85f), et plusieurs MAJEUR (durées, mention « bonus », fichiers implicites des bonus, rendus du sous-item 2fd6f85f).



---

## PHP 1 — étudiant fragile cours

# Étudiant fragile : php/1-bases-du-php — cours, mode lecture
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-1-bases-du-php-20261027-094328, dossier /work/fragile-cours

## Liste de tâches
- [x] Les 22 exemples de code exécutés (recette.php, interp, guillemets, tableaux x2, if, switch, match, for, foreach, while, fonctions f1 à f8)
- [x] Rappel HTML (rappel-html-code) : bloc HTML statique, non exécuté via rendu-html. Il n'annonce aucun rendu à comparer.
- [x] Variante : paramètre manquant, prédit « ArgumentCountError: Too few arguments », comparé : conforme
- [x] Variante : optionnel avant obligatoire, prédit « refusé par PHP », comparé : **faux** (remarque 1)
- [x] Variante : positionnel après nommé, prédit « Error », comparé : conforme (Fatal error: Cannot use positional argument after named argument)
- [x] Variante : `"douze"` passé à une fonction non typée, prédit « 0 affiché » (d'après code-typage), comparé : **faux** (remarque 2)
- [x] Erreur fréquente : portée, Warning `Undefined variable $plat` : conforme
- [x] Erreurs fréquentes : guillemets simples (conforme), oubli de `break` (décrit seulement, non reproduit), boucle infinie (non reproduite volontairement, 30 s)
- [x] Bilan des 7 notions

## Remarques
| # | id du bloc | Gravité | Ligne en cause | Ce que j'ai dû deviner | Temps perdu | Proposition |
|---|---|---|---|---|---|---|
| 1 | 2e2dc2aa (callout « L'ordre des paramètres ») | MAJEUR | « L'inverse est refusé par PHP » | Rien à deviner, mais l'affirmation est fausse en 8.3. `function f($unite = "minutes", $plat, $minutes)` s'exécute et affiche `<p>b : 3 a.</p>`. PHP émet seulement un Deprecated (« Optional parameter $unite declared before required parameter $minutes is implicitly treated as a required parameter »), masqué par la config CLI par défaut. Le paramètre devient obligatoire, ce qui donne un résultat absurde sans erreur. | 3 min | Écrire « déprécié, et le paramètre devient obligatoire : le défaut ne sert plus à rien ». Garder la règle « optionnels en dernier ». |
| 2 | 96765f99 (texte après code-typage) | MAJEUR | « Sans typage, PHP aurait converti "douze" en 0 et affiché 0 sans rien signaler » | Non reproductible en PHP 8.3. Sans typage, `"douze" * 60` lève `TypeError: Unsupported operand types: string * int`. Mon exemple a donc une erreur, pas un « 0 ». | 3 min | Corriger l'argument. Un contre-exemple correct : `"12abc"` donne un Warning « A non-numeric value » ou 720 selon la version. Ou montrer le typage via `"12"` converti silencieusement (mode coercitif), ou `null`. |
| 3 | 96765f99 | MINEUR | Même passage | Le typage `int` accepte `"12"` (coercition) et `12.5` (Deprecated). Le cours laisse croire à une vérification stricte. | 1 min | Une phrase sur le mode coercitif, ou ne pas dire « PHP vérifie ». |
| 4 | ecr-code-1 / ecr-txt-2 | MINEUR | « le navigateur reçoit trois lignes de HTML » | La sortie réelle compte 4 lignes non vides ou plus, avec des lignes vides. Le `?>` avale le retour à la ligne suivant, d'où `<p>Temps…</p>` collé à `<p>Bon appétit.</p>`. L'exemple ecr-code-2 montre une ligne vide entre les deux, ce qui diffère de la sortie réelle. | 1 min | Dire « trois balises » plutôt que « trois lignes », ou aligner le bloc sur la sortie réelle. |
| 5 | ecr-code-3 | MINEUR | Parse error « désigne la ligne suivante » | Aucun exemple d'erreur fourni. J'ai pris l'affirmation telle quelle. | 0 | Ajouter le message `syntax error, unexpected ...`. |
| 6 | ctrl-while-callout-txt | MINEUR | « Maximum execution time of 30 seconds exceeded » | Non reproduit : en CLI, `max_execution_time` vaut 0. Le message ne vaut que derrière un serveur web. | 0 | Préciser « sur le serveur web ». |
| 7 | 5ea1509a / d82ffa57 | MINEUR | « la condition `$i < count($tableau)` dans une boucle for » | `for` sur un tableau n'est vu qu'ici, en passant, avec `<=` et `count`. Aucun exemple ne parcourt un tableau avec `for`. | 1 min | Ajouter un exemple, ou retirer la phrase avant `for`. |
| 8 | ctrl-switch-txt, web-meth-list | MINEUR | « comparer une même variable » | Termes `case`, `break`, `default` non expliqués. `default` n'est décrit que dans le code. `match` utilise `default` avant sa définition. | 1 min | Une phrase sur `default`. |
| 9 | var-code-1 | MINEUR | `true` | `bool` écrit en minuscules sans mention. Aucune sortie affichée pour un bool : `echo true` donne `1`, `echo false` ne donne rien. Piège non couvert, mais hors exemples du cours. | 0 | Optionnel. |
| 10 | tableau fonctions (46023bbf) | MINEUR | `date('d/m/Y')` renvoie `30/08/2026` | Valeur d'exemple figée. J'ai obtenu `27/10/2026`. Normal, mais pas dit. | 0 | « par exemple le jour de l'exécution ». |
| 11 | web-callout, ecr-callout | MINEUR | `?>` final : « casser un envoi d'en-têtes plus tard dans le module » | Terme « en-têtes » non défini. Le lien n'est pas explicite. | 1 min | Renvoyer à la section concernée ou retirer. |
| 12 | Section « tableaux » | MINEUR | Titre « Créer un tableau » | Titre `##` sans id lisible, sans lien avec « tableaux indexés » du brief : le mot « indexé » n'apparaît pas. Les tableaux associatifs ne sont pas traités, ce qui est cohérent avec le brief. | 0 | Dire « tableau indexé » au moins une fois. |

Aucun BLOQUANT : tous les exemples produisent le résultat annoncé (texte). Seules les explications des remarques 1 et 2 sont fausses.

## Temps (barème fixe)
| Partie | Détail | Total | Statut |
|---|---|---|---|
| Lecture du cours | env. 3 100 mots en prose et callouts = 16 min ; 22 blocs de code environ 200 lignes à 6 s = 20 min | 36 min | fini |
| Exécution | 22 exemples + 5 variantes, tout par script : 5 commandes à 20 s, exécution 10 s | 3 min | fini |
Temps de lecture du cours : 36 min (hors exécution)

## Bilan des notions du brief
| Notion | À quoi elle sert (source) | Utilisation (mini-exemple exécuté, bilan.php) | Résultat |
|---|---|---|---|
| Syntaxe PHP | Le code vit entre `<?php` et `?>`, `;` à chaque instruction, commentaires `//` et `/* */` (ecr-txt-1, ecr-txt-3) | `<?php` + instructions terminées par `;` dans bilan.php | oui |
| echo | Écrit dans la page à l'endroit de l'instruction (ecr-txt-2) | `echo etiquette($f, $prix), " ($t)\n";` | oui |
| Variables et types | Stocker une valeur, type déduit (var-txt-1) ; interpolation et guillemets (var-interp-txt-1, cc69ba21) | `$prix = 3.5; $dispo = true; var_dump($prix)` donne `float(3.5)` | oui |
| Tableaux indexés | Ranger plusieurs valeurs, indice depuis 0, `count`, `[]` (2b206b19, a569b89c) | `$fruits[$i]`, `count($fruits)` | oui |
| Structures de contrôle | `if/elseif/else` (ctrl-if-txt), `switch` + `break` (ctrl-switch-txt), `match` strict qui renvoie une valeur (ctrl-match-txt) | if/elseif/else, switch avec break, match | oui. Mais j'ai utilisé `match (true)`, qui n'est pas enseigné : je l'ai écrit en m'appuyant sur mes connaissances générales, donc **aucune source** pour cette ligne. Plus sûr : un `match` classique sur une valeur. |
| Boucles | `for` avec compteur, `foreach` sur un tableau, `while` tant que (ctrl-for-txt, ctrl-foreach-txt, ctrl-while-txt) | `for` sur `count`, `while ($n > 0)`, `foreach` | oui. J'ai écrit `foreach ($fruits as $i => $f)` : la forme `clé => valeur` n'est pas dans le cours (**aucune source**). |
| Fonctions | Déclarer, appeler, paramètres obligatoires et optionnels, nommés, `return`, typage, portée (be677b53, 505b8e73, 15ee4c80, b41de7c4, ed5bc123, 9c2d4c89, 809bf41a) | `function etiquette(string $f, float $p = 1.0): string` | oui. Réserves : l'explication du typage est fausse sur le cas `"douze"` (remarque 2), et celle de l'ordre des paramètres est inexacte (remarque 1). |

## Définition de terminé
- ✔ mode lecture : exemples exécutés (22 sur 22), variantes prédites puis comparées (4 sur 4, dont 2 mauvaises prédictions : remarques 1 et 2), bilan rempli (7 sur 7)
- ✔ chaque étape du journal cite sa source ou est marquée « aucune source » (voir l'annexe : 30 étapes, 28 sourcées, 2 devinées)
- ✔ aucun fichier hors /work/fragile-cours. Sortie de `ls /work` : `depart fournis fragile-cours fragile-tp rapide supports`

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | Création de recette.php | ecr-code-1 | sortie conforme à ecr-code-2 au saut de ligne près (remarque 4) |
| 2 | interp.php (concaténation et interpolation) | var-interp-code | les deux lignes sont identiques, conforme |
| 3 | guill.php | c9b05c9c | `Plat : Gaspacho de pastèquePlat : $nom`, conforme |
| 4 | tab.php, tab2.php | 6672191f, 5ea1509a | `pastèquementhe` ; `3`, conforme |
| 5 | if.php | ctrl-if-code | `Recette rapide.` |
| 6 | switch.php | ctrl-switch-code | `Un peu de technique.` |
| 7 | match.php | ctrl-match-code | `Un peu de technique.` |
| 8 | for.php, foreach.php, while.php | ctrl-for-code, ctrl-foreach-code, ctrl-while-code | sorties conformes |
| 9 | f1.php | be677b53 | deux « Bon appétit » |
| 10 | f2.php, f2b.php | 505b8e73 | conforme ; ArgumentCountError « Too few arguments », conforme |
| 11 | f3.php | 15ee4c80 | conforme |
| 12 | f3b.php (optionnel avant obligatoire) | 2e2dc2aa | pas refusé : Deprecated seulement (remarque 1) |
| 13 | f4.php | b41de7c4 | conforme |
| 14 | f4b.php (positionnel après nommé) | aaec8701 | Fatal error: Cannot use positional argument after named argument |
| 15 | f5.php | ed5bc123 | `Préparation : 720 secondes.` |
| 16 | f6.php | 9c2d4c89 | `720` puis TypeError, conforme |
| 17 | f6b.php (sans typage) | 96765f99 | TypeError « Unsupported operand types: string * int », pas « 0 » (remarque 2) |
| 18 | f7.php | 809bf41a | Warning `Undefined variable $plat`, conforme |
| 19 | f8.php (count, number_format, round, date, var_dump) | 46023bbf | `2\|120 000\|13.5\|27/10/2026\|int(12)`, conforme |
| 20 | bilan.php : tableau, variables, fonction typée avec défaut | 6672191f, var-code-1, 9c2d4c89, 15ee4c80 | OK |
| 21 | bilan.php : `foreach ($fruits as $i => $f)` | aucune source | fonctionne, mais deviné |
| 22 | bilan.php : `match (true) { $i === 0 => ... }` | aucune source | fonctionne, mais deviné |
| 23 | bilan.php : for, while, switch, if/elseif/else, `$n--` | ctrl-for-code, ctrl-while-code, ctrl-switch-code, ctrl-if-code | OK. `$n--` n'est pas expliqué non plus, mais `$etape++` est dans ctrl-for-code, par analogie. |
| 24 | Commande `php -d error_reporting=-1` pour afficher le Deprecated | aucune source nécessaire pour l'analyse du rapport (hors exécution des exemples) | Deprecated visible |
| 25 à 30 | Écriture des fichiers de test et lecture du cours | consigne du prompt | OK |

Les deux étapes « aucune source » (21 et 22) viennent de ma propre fantaisie dans le bilan. Elles ne révèlent pas un trou du cours, puisqu'elles dépassent le cours, mais elles montrent que `clé => valeur` dans `foreach` n'est pas enseigné, alors qu'un étudiant voudra récupérer l'indice (cf. remarque 7).


---

## PHP 1 — étudiant fragile TP

# Étudiant fragile : php/1-bases-du-php — TP, mode exécution
Statut du rapport : terminé (tronc commun ex. 1 à 6 et section « fonctions » 1 à 7 faits ; bonus non faits)
Conteneur : cours-iut-bac-php-1-bases-du-php-20261027-094328, dossier /work/fragile-tp

## Liste de tâches
- [x] ex-1 Rappel HTML (rappel.html, rendu-html OK : table.table, 4 colonnes, 6 lignes, capture /work/fragile-tp/rappel.html.rendu.png)
- [x] ex-2 hello.php (exécuté en CLI : « Nous sommes le 27/10/2026 à 08:55 », aucune ligne PHP dans la sortie)
- [x] ex-3 streamer.php (concaténation, interpolation, guillemets simples, number_format)
- [x] ex-4 debug.php (var_dump puis die)
- [x] ex-5 couleur.php (if, switch, match ; rangs 1, 2, 3, 7 ; retrait du break)
- [x] ex-6 classement.php (foreach, for, number_format, podium, while)
- [x] fonctions 1 à 7 (totalCollecte, moyenneDons, indices, compterAuDessus, part, classeDuRang, formaterMontant)
- [ ] bonus : non faits, ils n'étaient pas demandés explicitement
- Limite d'environnement : pas de woody ni de public_html. Fichiers dans /work/fragile-tp et exécution en CLI (php). Je n'ai pas lancé php -S, ni vérifié via un navigateur l'« Afficher le code source » (ex2 q2). Bootstrap CDN : servi localement par rendu-html, je n'ai pas rendu classement.php.

## Résultats observés
- ex2 : l'heure affichée est celle du serveur. Le PHP n'apparaît pas dans la sortie.
- ex3 : concaténation et interpolation donnent « AntoineDaniel est classé 1 avec 120000 euros. ». Avec guillemets simples, la sortie est littéralement `$pseudo est classé $rang avec $montant euros.`. Avec number_format : « 120 000 euros ».
- ex4 : var_dump donne `string(13) "AntoineDaniel"`, `int(120000)`, `bool(true)`. Avec die(), « Fin de la page. » disparaît.
- ex5 : les trois versions donnent gold / silver / bronze / (vide) pour les rangs 1, 2, 3 et 7. Sans le break du case 1, avec rang 1, la sortie est « gold » puis « silver » (débordement sur le case suivant), conforme au callout du cours.
- ex6 : 100 `<li>` ; 100 lignes de données (101 `<tr>` avec l'en-tête) ; classes gold, silver et bronze posées sur les 3 premières lignes ; total 2 588 000 €.
- Fonctions : moyenne 25 880,00 € ; plus haut AntoineDaniel (120 000 €) ; plus bas Etique_tv (1 000 €) ; au-dessus de la moyenne : 33 ; au-dessus de 50000 : 12 ; part du podium 13.5 % puis 13.524 % avec 3 décimales. L'appel de compterAuDessus sans second argument produit `ArgumentCountError: Too few arguments to function compterAuDessus(), 1 passed ... and exactly 2 expected`, ce que le cours annonce (« Too few arguments »).

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp-ex2-3 | MAJEUR | « Écrivez en commentaire, en haut du fichier » | Quel commentaire : HTML (visible dans le source) ou PHP ? Il faut ouvrir un bloc `<?php /* */ ?>` avant le DOCTYPE, ce que le cours ne montre pas avec `?>` en milieu de fichier suivi de HTML. J'ai choisi un commentaire PHP. | 3 min | Préciser « commentaire PHP dans un bloc `<?php ... ?>` placé avant `<!DOCTYPE>` ». |
| 2 | tp-ex3-4 / tp-ex3-5 | MINEUR | « Ajoutez un troisième echo … » puis « number_format » | Sur quel echo appliquer number_format (le 2e ? un 4e ?). J'ai ajouté un 4e echo. | 1 min | Dire « modifiez l'echo d'interpolation » ou « ajoutez un quatrième echo ». |
| 3 | tp-ex3-2 | MINEUR | « en concaténation » | Le `<br>` ou « \n » entre les echo n'est pas indiqué (les phrases se collent). J'ai ajouté `<br>`. | 1 min | Mentionner d'ajouter `<br>` ou de mettre chaque echo dans un `<p>`. |
| 4 | tp-ex4-1 | MINEUR | « relevez ce que var_dump indique en plus » | Le résultat attendu (type et taille) est lisible mais le tableau du cours ne montre que `int(12)`, donc `string(13)` et `bool(true)` surprennent un peu. | 1 min | Un exemple var_dump de chaîne et de bool dans le cours. |
| 5 | tp-ex5-1 | MAJEUR | « avec un if / elseif / else » | Comparateur `==` ou `===` : le cours ne montre `==` ni `===` dans les conditions (il n'a que `<` dans `if`). Le cours dit que `match` est strict, mais ne présente pas `==`. J'ai utilisé `==`. Aucune source pour la syntaxe d'égalité. | 3 min | Montrer `==` dans l'exemple if du cours, ou un callout `==` / `===`. |
| 6 | tp-ex6-1 / ex6-2 | MAJEUR | « Chaque tour de boucle doit produire un `<li>` », « tableau HTML » | Mélanger PHP et HTML (`<?php foreach (...) { ?> ... <?php } ?>`, `<?= ... ?>`) : le cours ne montre que `echo` dans un bloc PHP. `<?=` et la syntaxe de boucle ouverte/fermée autour de HTML n'apparaissent nulle part. Deviné (connaissances générales). | 3 min | Ajouter dans le cours un exemple de boucle qui ouvre et ferme PHP autour de HTML, ou imposer `echo`. |
| 7 | tp-ex6-4 (77045245…) | MINEUR | « Les trois classes sont déjà définies dans le `<style>` » | Aucune. Mais la consigne arrive avant l'ex. fonctions qui demande de sortir la règle ; j'ai codé directement avec `classeDuRang`. | 0 | Rien. |
| 8 | tp-ex6-5 | MINEUR | « boucle while qui parcourt $montants » | Faut-il un compteur ? `while` sans `foreach`, donc il faut `$i` et `count()` ; le cours le permet (count, tableau), mais ne montre pas `$i++`. | 1 min | Rappeler `$i++` dans l'exemple while. |
| 9 | section fonctions (efb79690 / a08edf01) | MINEUR | « placée en haut de classement.php juste après les tableaux » | Les tableaux sont dans un bloc `<?php ... ?>` : insérer les fonctions avant le `?>`. Compris, non explicité. | 1 min | Préciser « avant le `?>` qui ferme le bloc du haut ». |
| 10 | fab8cd66 | MINEUR | « Affichez le résultat avec deux décimales » | Avec `round()` le `.00` n'apparaît pas ; il faut `number_format`. L'ex. 7 donne ensuite la solution (decimales: 2) : OK au final. | 1 min | Dire « avec number_format » ou renvoyer à l'ex. 7. |
| 11 | af428db0 | MAJEUR | « la part du podium » | Part = pourcentage ? La formule n'est pas donnée (`valeur / total * 100`). J'ai supposé un pourcentage car la bonus parle de « 100 % ». Deviné. | 3 min | Donner la formule ou l'unité (« en pourcentage »). |
| 12 | 6e0e8337 | MINEUR | « appelez-la avec la moyenne » | `float $seuil` accepte aussi `50000` (int) : conversion silencieuse que le cours ne mentionne pas (il parle de TypeError sur `"douze"`). | 0 | Une phrase sur int vers float. |
| 13 | e7004da1 | MINEUR | `formaterMontant(float $montant, string $symbole = '€')` | Le format exact (espace avant `€` ou non) n'est pas dit. J'ai mis un espace. | 1 min | Préciser « 120 000 € ». |
| 14 | tp-ex6-3 | MINEUR | « suivi de € » | Idem : espace ou non. | 0 | Idem. |
| 15 | tp-woody | Limite d'environnement | | woody / public_html absents. | | Noté. |

## Temps (barème fixe)
| Exercice | Détail du calcul | Total | Démarrage | Statut |
|---|---|---|---|---|
| ex-1 | lecture 150 mots = 1 min ; 18 lignes recopiées/écrites ≈ 3 min ; 2 commandes 40 s ; rendu 10 s ; vérif 30 s | 6 min | 1 min | fini |
| ex-2 | lecture 160 mots ; 17 lignes recopiées = 3 min ; hésitation (remarque 1) 3 min ; 2 commandes ; vérif | 9 min | 1 min | fini |
| ex-3 | lecture 190 mots = 1 min ; 12 lignes écrites = 6 min ; hésitation 3 min ; 1 commande ; vérif | 12 min | 1 min | fini |
| ex-4 | lecture 120 mots ; 8 lignes recopiées ; 3 lignes écrites = 2 min ; 2 commandes ; vérif | 5 min | 1 min | fini |
| ex-5 | lecture 270 mots = 2 min ; 30 lignes écrites = 15 min ; hésitation 3 min ; 4 commandes ; vérif | 22 min | 1 min | fini |
| ex-6 | lecture 300 mots = 2 min ; 22 lignes écrites = 11 min ; 2 hésitations 6 min ; 3 commandes ; erreurs 0 ; vérif | 22 min | 1 min | fini |
| fonctions 1 à 7 | lecture 650 mots = 4 min ; 70 lignes écrites = 35 min ; 2 hésitations 6 min ; 1 erreur provoquée 1 min ; 3 commandes ; vérif | 48 min | 1 min | fini |
Total tronc commun : 124 min (budget 160 min). Aucun démarrage supérieur à 2 min.

## Bilan des notions
Sans objet en mode exécution.

## Définition de terminé
- ✔ chaque exercice mené au bout (8 sur 8 : ex 1 à 6, fonctions, ce qui compte pour 7 parties), temps calculé par exercice (7 sur 7)
- ✔ étapes sourcées : toutes se rattachent aux blocs tp-ex1 à tp-ex6, aux ids de la section fonctions et aux blocs du cours. Étapes devinées (aucune source) : `==` dans les conditions (remarque 5), `<?= ?>` et boucle ouverte/fermée autour de HTML (remarque 6), pourcentage dans `part()` (remarque 11), commentaire PHP avant DOCTYPE (remarque 1).
- ✔ `ls /work` : depart fournis fragile-cours fragile-tp rapide supports (tout est dans /work/fragile-tp)

## Annexe : fichiers produits
/work/fragile-tp : rappel.html, hello.php, streamer.php, debug.php, couleur.php, classement.php (final avec toutes les fonctions), plus classement.php copié depuis fournis puis écrasé. Les fichiers intermédiaires funcs.txt et corps.txt ont servi à assembler classement.php. Dans /tmp du conteneur : variantes de test.



---

## PHP 1 — étudiant rapide TP

# Étudiant rapide : php/1-bases-du-php — TP
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-1-bases-du-php-20261027-094328, dossier /work/rapide

## Liste de tâches
- [x] ex-1 Rappel HTML (rappel.html, 7 `<tr>` vérifiés)
- [x] ex-2 hello.php (page rendue avec `php`, date du serveur)
- [x] ex-3 streamer.php (concaténation, interpolation, guillemets simples, number_format)
- [x] ex-4 debug.php (var_dump, die)
- [x] ex-5 couleur.php (if, switch, match ; tests 1, 2, 3 et 7 identiques ; test sans `break` : `gold | goldsilver | gold`)
- [x] ex-6 classement.php (foreach, for, number_format, podium, total en while)
- [x] ex-7 fonctions (statistiques, `classeDuRang`, `formaterMontant` avec argument nommé)
- [x] bonus-1 colonne « Part du total »
- [x] bonus-2 `chercherPseudo`
- [x] temps restant
- [x] bilan des bonus

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp-bonus-txt, tp-bonus-3, d00deaa5-dcba-4c1e-bd50-210c52409d18 | MAJEUR | « À faire si vous avez fini avant la fin de la séance » | Rien : les bonus sont faisables. Ils sont trop courts : 5 min au barème pour 95 min restantes, soit environ 90 min non occupées (seuil : 10 min). | 0 | Ajouter des bonus substantiels avec les seules notions du cours. Exemples : un classement filtré ou paginé avec une fonction maison, un tri écrit à la main avec des boucles, des statistiques supplémentaires (médiane, répartition par tranche) qui réutilisent les fonctions de l'exercice 7. |
| 2 | tp-bonus-3 | MINEUR | « Ajoutez au tableau une colonne “Part du total” » | Bonus trivial : 1 min. Il réutilise `part()` déjà écrite à l'exercice 7.5. | 0 | Le fusionner dans l'exercice 7 ou lui donner une vraie extension. |
| 3 | tp-bonus-3 | MINEUR | « Vérifiez que la somme de la colonne fait bien 100 %, à l'arrondi près » | La tolérance n'est pas chiffrée. Résultat obtenu : somme = 100.5 avec 1 décimale. Je n'ai pas su si 0,5 point d'écart est « à l'arrondi près ». | 1 min | Donner la valeur attendue ou une tolérance. Demander la somme avec `part(..., 3)`. |
| 4 | d00deaa5-dcba-4c1e-bd50-210c52409d18 | MINEUR | « Affichez le rang et le montant de `Ponce` » | Bonus de 4 min. Le rang vaut l'indice + 1, ce que l'énoncé ne dit pas, mais c'est déductible du cours (indices à partir de 0). `Ponce` est bien dans le fichier fourni (rang 8). | 0 | Rien à corriger. Le bonus reste trop court (voir remarque 1). |
| 5 | e7004da1-d41d-4741-8886-0dfdd84bd397 et chaînes de classement.php | MINEUR (tronc commun, non bloquant) | Écrire les lignes du tableau en `echo` | Trois notions absentes du cours, devinées : `$pseudos[$i]` dans une chaîne entre guillemets doubles, l'échappement `\"` dans une chaîne, et la comparaison `==` (le cours montre `<`, `>`, `<=`). Ma première version utilisait aussi `$_GET` et `<?=`. Je les ai retirés car ils ne sont pas enseignés. | 3 min | Ajouter au cours : l'interpolation d'un élément de tableau, l'échappement des guillemets, `==` / `===`. |
| 6 | 77045245-c12c-4ec8-b515-5a69b26257a8, tp-ex6-4 | MINEUR | Numérotation de l'exercice 6 | Les ids des items sont décalés : l'item 4 porte un UUID et l'item 5 porte `tp-ex6-4`. | 0 | Harmoniser les ids. |

Limites d'environnement (hors défaut du contenu) :
- Pas de serveur woody ni de `public_html` : j'ai travaillé en ligne de commande avec `php` et `php -l`.
- Bootstrap est servi par CDN, donc indisponible sans réseau. Je n'ai pas lancé `rendu-html`.
- Les fichiers `rappel.html` et `classement.php` étaient bien dans `/work/fournis`.

## Temps (barème fixe)
| Exercice ou bonus | Détail du calcul | Total | Statut |
|---|---|---|---|
| Lecture du cours | environ 3 300 mots ÷ 350 = 9,5 min | 10 min | fait |
| ex-1 | prose 0,4 min ; 12 lignes écrites × 12 s = 144 s ; 3 commandes × 8 s ; exécution 10 s ; vérification 10 s | 4 min | fait |
| ex-2 | 15 lignes recopiées × 4 s = 60 s ; 2 lignes de commentaire × 12 s ; lecture 30 s ; prose 26 s ; 3 commandes ; exécution 10 s ; vérification 10 s | 3 min | fait |
| ex-3 | prose 43 s ; 7 lignes × 12 s = 84 s ; 2 commandes ; recherche `number_format` 20 s ; exécution 10 s ; vérification 10 s | 3 min | fait |
| ex-4 | 10 lignes recopiées × 4 s = 40 s ; lecture 20 s ; prose 26 s ; 2 lignes × 12 s ; 2 commandes ; exécution 20 s ; vérification 10 s | 3 min | fait |
| ex-5 | prose 51 s ; 28 lignes × 12 s = 336 s ; 4 commandes ; 4 exécutions × 10 s ; test sans `break` 30 s ; vérification 10 s | 9 min | fait |
| ex-6 | prose 69 s ; 30 lignes × 12 s = 360 s ; 6 commandes ; exécution 30 s ; vérification 10 s | 10 min | fait |
| ex-7 | prose 103 s ; 70 lignes × 12 s = 840 s ; 6 commandes ; 1 erreur voulue (`ArgumentCountError`) 30 s ; exécutions 60 s ; vérification 70 s ; 3 étapes devinées = 3 min | 23 min | fait |
| bonus-1 | 3 lignes × 12 s ; exécution 10 s ; vérification 10 s ; prose | 1 min | fait |
| bonus-2 | 9 lignes de fonction + 4 lignes d'affichage × 12 s ≈ 156 s ; prose ; exécution 20 s | 4 min | fait |

Tronc commun : 10 + 4 + 3 + 3 + 3 + 9 + 10 + 23 = 65 min. Budget TP : 160 min. Temps restant : 95 min.
Bonus : 5 min (hors budget) → occupent le temps restant : non (écart d'environ 90 min).

## Bilan des bonus
| Bonus | Notions utilisées (source) | Notion non enseignée ? | Résultat face à l'annoncé |
|---|---|---|---|
| bonus-1 Part du total | `part()` (af428db0-d3a3-4f20-8aab-7476f41ec86b), `for`, `round` (cours, table des fonctions fournies) | Non | La colonne s'affiche (4.6 %, 4.6 %, 4.3 %, …). La somme vaut 100.5 avec 1 décimale, ce qui reste ambigu face à « 100 % à l'arrondi près ». Les 100 lignes sont rendues. |
| bonus-2 chercherPseudo | `function` typée, `for`, `return` dans une boucle, `count` (cours : renvoyer une valeur, typage) ; `==` non enseigné | `==` seulement (mineur) | Résultat conforme : `Ponce` rang 8, 85 000 € ; pseudo inconnu : `-1`. |

## Définition de terminé
- ✔ tout le TP terminé, bonus compris : 7 exercices sur 7, 2 bonus sur 2.
- ✔ temps total et temps restant : 65 min au tronc commun, 160 − 65 = 95 min restantes, bonus 5 min.
- ✘ chaque bonus vérifié (temps restant occupé, aucune notion non enseignée) : 2 bonus sur 2 vérifiés, mais le temps restant n'est pas occupé (environ 90 min d'écart) et `==` n'est pas enseigné. Le critère n'est donc pas rempli.
- ✔ journal d'étapes sourcé : 26 étapes, 23 sourcées, 3 devinées (voir remarque 5).
- ✔ aucun fichier laissé hors de /work/rapide. Sortie de `ls /work` : `depart fournis fragile-cours fragile-tp rapide supports`. Les dossiers `fragile-cours` et `fragile-tp` ne sont pas de moi. Les fichiers temporaires `gen.py`, `t.php`, `fonc.txt` et `corps.txt` ont été supprimés.

Le critère 3 reste ✘, donc la définition de terminé n'est pas entièrement remplie. Le rapport est néanmoins complet : le TP est fini et le blocage est signalé (remarque 1, MAJEUR).

## Annexe : journal d'étapes
| # | Étape | Source (id du bloc, curriculum:…, ou « aucune source ») | Résultat |
|---|---|---|---|
| 1 | Lecture du TP et du cours | tp.md et cours.md | ok |
| 2 | Copier `rappel.html` et `classement.php` | tp-ex1-1, tp-ex6 | ok |
| 3 | Table avec `thead`, `th`, `tbody`, `td`, classe `table` | tp-ex1-2, tp-ex1-3, tp-ex1-4, rappel-html-code | ok |
| 4 | `hello.php` recopié, commentaires de réponse | tp-ex2-code, tp-ex2-3, web-callout-txt | ok |
| 5 | Variables et trois `echo` | tp-ex3-1 à tp-ex3-4, var-interp-code, cc69ba21-35ae-4ef7-ba5f-c8e7c8591377 | ok |
| 6 | `number_format` | tp-ex3-5, 46023bbf-2e2c-4056-a9ae-bbd2a35a1035 | `120 000` |
| 7 | `debug.php` avec `var_dump` et `die` | tp-ex4-code, tp-ex4-2 | `string(13)`, `int(120000)`, `bool(true)` |
| 8 | `if` / `elseif` / `else` | tp-ex5-1, ctrl-if-code | ok |
| 9 | `switch` avec `break` | tp-ex5-2, ctrl-switch-code | ok |
| 10 | Test sans `break` | tp-ex5-3, ctrl-switch-callout-txt | `gold | goldsilver | gold` |
| 11 | `match` rangé dans `$couleur` | tp-ex5-4, ctrl-match-code | ok |
| 12 | Tests avec rang 1, 2, 3 et 7 | tp-ex5-5 | identiques |
| 13 | `foreach` avec `<li>` | tp-ex6-1, ctrl-foreach-code | ok |
| 14 | Table avec `for` | tp-ex6-2, ctrl-for-code | ok |
| 15 | Montant formaté avec `€` | tp-ex6-3 | ok |
| 16 | Classes du podium dans la boucle | 77045245-c12c-4ec8-b515-5a69b26257a8 | ok |
| 17 | Total avec `while` | tp-ex6-4, ctrl-while-code | 2 588 000 € |
| 18 | `totalCollecte`, `moyenneDons` | efb79690-fdf5-4940-b78e-fdc9baf3bae5, fab8cd66-bd9c-41ef-85c2-56d0e4dedc59, 632691ce-c908-42f3-921e-250501897e4a | moyenne 25 880,00 |
| 19 | `indiceDuPlusHaut`, `indiceDuPlusBas` avec `>` et `<` | f6c08f49-8d47-4154-8183-d4c84f9ed94d | AntoineDaniel, Etique_tv |
| 20 | `compterAuDessus` et appel sans le second argument | 6e0e8337-17b6-48f8-b566-57ce5917c0bb, 8592120e-ea85-4ed0-aad2-97a89fdde71e | `ArgumentCountError`, 33 et 12 |
| 21 | `part` avec paramètre optionnel | af428db0-d3a3-4f20-8aab-7476f41ec86b, 73767fef-3d0c-4576-a6b2-f54c05f9c2ac | 13.5 % et 13.524 % |
| 22 | `classeDuRang`, `formaterMontant`, argument nommé `decimales:` | e7004da1-d41d-4741-8886-0dfdd84bd397, 19ebb098-b4ea-4c97-93c9-9d43f4cb2295, ceed502c-edc7-479f-ae7e-965058758a6e | ok |
| 23 | Bonus 1 : colonne « Part du total » | tp-bonus-3 | somme 100.5 |
| 24 | Bonus 2 : `chercherPseudo` | d00deaa5-dcba-4c1e-bd50-210c52409d18 | rang 8 ; `-1` pour l'inconnu |
| 25 | `$pseudos[$i]` dans une chaîne, `\"` | aucune source (devinée) | ok |
| 26 | `==` dans `chercherPseudo` et `couleur.php` | aucune source (devinée) | ok |

Les 26 étapes comptent 3 devinées : l'étape 25 vaut 2 occurrences (`$pseudos[$i]` et `\"`), l'étape 26 en vaut 1.

Fichiers produits : `/work/rapide/rappel.html`, `/work/rapide/hello.php`, `/work/rapide/streamer.php`, `/work/rapide/debug.php`, `/work/rapide/couleur.php`, `/work/rapide/classement.php` (dans le conteneur).


---

## PHP 2 — collecteur

# Fiche de contexte : php/2-programmation-orientee-objet
Statut du rapport : incomplet (budgets non calculables faute de `courseIntroMinutes` ; dépôt de référence injoignable)

## Liste de tâches
- [x] 1. list_modules : faite
- [x] 2. get_module (php) : faite
- [x] 3. list_sections (php) : faite
- [x] 4. get_section (2-programmation-orientee-objet) : faite
- [x] 5. get_content cours, TP, slide : faite (3 sur 3)
- [ ] 6. get_project_reference : non faite, ECONNREFUSED 172.22.0.2:443 (2 tentatives, message verbatim). Repli appliqué en tâche 7.
- [x] 7. export TP des sections précédentes : faite (1-bases-du-php, TP, seule section d'ordre inférieur)
- [x] 8. list_verdicts cours, TP, slide : faite (3 sur 3)
- [x] 9. list_exemplars cours, TP, slide (sans snapshot) : faite (3 sur 3)
- [x] 10. list_block_types : faite
- [ ] 11. search_content : non faite, aucun point précis à vérifier

Sources : 16 prévues, 15 lues, 1 indisponible (signalée).

## Module
- slug : php ; titre : PHP ; sessionDurationMinutes : 180 (get_module et list_modules) ; description : « R3.01 Développement WEB » ; associatedSae : S3.01 ; manager : Rodolphe Charrier ; instructors : Salim Khraimeche ; sectionCount : 11
- universe : non disponible. Le champ est absent de list_modules et de get_module pour php.
- exampleDomain : « Recettes de cuisine » : « Petite appli de recettes (Recette, Ingrédient, Auteur), utilisée uniquement pour illustrer le cours — jamais d'albums, d'utilisateurs Onzer ou de catalogue musical dans les exemples. »
- projectSpec (résumé) : nom Onzer. Appli PHP procédurale (une action = un fichier à la racine), entités User, Artist, Album, repositories orientés objet (Singleton PDO/PostgreSQL). Authentification par sessions. CRUD des albums, création d'artistes. Morceaux (titre + durée) en JSON. Vues en PHP natif, Bootstrap 5.3.8. Pages : Home, Player, Auth, CRUD Albums, Artistes (ajout seul). status : draft. referenceRepo : https://git.salimkhraimeche.dev/projet/projet-reference-php, status validated (injoignable, voir Signalements).
- plannedNotions (verbatim) : Bases du PHP ; Fonctions et tableaux ; POO : classes, objets, encapsulation — les entités ; Structurer son code ; Formulaires et superglobales ; BD lecture PDO ; BD écriture ; Sessions et authentification ; Symfony ; Twig.

## Section
- slug : 2-programmation-orientee-objet ; titre : « Tableaux associatifs et objets » ; rang : order 2 sur 11 (get_section.order et sectionCount). La position dans le tableau de list_sections est la 10e : cet ordre ne suit pas le champ order.
- totalDuration : 1 ; courseIntroMinutes : null (list_sections et get_section)
- objectives (get_section, 4) : « Écrire une classe avec un constructeur » ; « Utiliser des propriétés privées et des getters » ; « Instancier et manipuler des objets » ; « Remplacer un tableau associatif par un objet »
- brief : présent. brief.objectives : []
  - notions (verbatim) : « Tableaux associatifs » ; « Tri et filtre de tableaux » ; « Classes et objets » ; « Constructeur à propriétés promues » ; « Encapsulation (propriétés privées, getters) »
  - filRougeStep (verbatim) : « Premier contact avec Onzer, en deux temps. D'abord le catalogue d'albums (titre, année, artiste) comme tableau de tableaux associatifs en dur, trié et filtré par des fonctions écrites en section 1. Puis la même donnée transformée en objets : les classes Album et Artist remplacent les tableaux associatifs, avec constructeur à propriétés promues et getters. »
  - filRougeOutcome (verbatim) : « Une page affiche le catalogue d'albums, trié et filtré ; entities/Album.php et entities/Artist.php existent et le catalogue manipule des objets au lieu de tableaux associatifs. Toujours sans base de données. »
  - providedBase : « Les fonctions et les tableaux indexés de la section 1. »
  - notes (verbatim) : « Cette section absorbe la moitié de l'ancienne section « Fonctions et tableaux » (tableaux associatifs, tri, filtre) en plus de la POO. À surveiller sur une séance de 3 h : si c'est trop, le tri et le filtre peuvent passer en exercices bonus, la POO étant la notion à garder. »
- hasCorrection : true ; correctionIsAvailable : true ; isAvailable : true ; examenIsLock : false
- curriculum actuel de la section : null

## Budgets
- cours + slides : non calculable. Champ manquant : courseIntroMinutes = null. Calcul : 1 × 180 − null.
- TP : non calculable. Calcul : totalDuration × sessionDurationMinutes − courseIntroMinutes = 1 × 180 − null.
- plage 80–100 % : non calculable. Formule une fois la valeur fournie : de 0,8 × (180 − courseIntroMinutes) à (180 − courseIntroMinutes) min.

## Contenus de la section
| Support | Source | Blocs (get_content, récursif) | Exercices / bonus |
|---|---|---|---|
| cours | db (contentId 6a93dd687912a2788e7b91a8, version 70) | 84 (7 de premier niveau) | — |
| TP | db (contentId 6a93dd687912a2788e7b91a9, version 254) | 85 (6 de premier niveau) | 10 sections d'exercice, 2 bonus |
| slide | db (contentId 6a95a486d5799aeb850f6982, version 46) | 77 (21 slides de premier niveau) | — |

Méthode de comptage : chaque bloc compté une fois, y compris les blocs imbriqués.

Exercices du TP (id, titre) :
- 396b8ed8-91c4-4c20-9c39-98fe5afb8c60 : Le tableau des artistes
- 89aefd4b-9831-4cd4-ab37-3aa7b1492375 : Un album en tableau associatif
- tp2-ex1 : Le catalogue complet
- tp2-ex2 : Trier et filtrer (statique)
- tp2-ex3 : La classe Artist
- tp2-ex4 : La classe Album
- b2495668-7d7e-49d4-8db3-a1f230870b4e : Le lien Album et Artist
- tp2-ex5 : Construire le catalogue
- tp2-ex7 : Un tableau triable par colonne
- tp2-ex8 : Des statistiques
- Bonus : tp2-bonus-1 (estRecent), tp2-bonus-2 (chercherAlbum)

Plan du cours (sections de premier niveau) : Les tableaux associatifs ; Trier et filtrer ; Du tableau à l'objet ; Les classes et les objets ; L'encapsulation ; Les fonctions de tableaux à connaître.

Titres des slides : Rappel section 1 (données) ; Rappel section 1 (fonctions) ; Une recette dans un tableau indexé ; Des clés plutôt que des indices ; Ajouter, modifier, vérifier ; L'opérateur ?? ; Parcourir : as $cle => $valeur ; Un catalogue de recettes ; Les fonctions fléchées ; Trier avec usort ; Filtrer avec array_filter ; Tableau ou objet ? ; Déclarer une classe ; Le constructeur ; Les propriétés promues ; ?string : une valeur ou null ; Les méthodes et $this ; private ; Les getters ; Un objet dans un objet ; Les trois portées.

## Curriculum des sections précédentes
- 1-bases-du-php (order 1) : curriculum absent. La clé `curriculum` n'existe pas dans list_sections. Section signalée.
- Notions de la section 1 (brief.notions, verbatim) : « Syntaxe PHP » ; « echo » ; « Variables et types » ; « Tableaux indexés » ; « Structures de contrôle (if/elseif/else, switch, match) » ; « Boucles (for, foreach, while) » ; « Fonctions : déclaration, paramètres obligatoires et optionnels, typage, return, portée »
- Note de la section 1 : « Les tableaux associatifs sont volontairement absents : ils sont reportés en section 2. »

## État du fil rouge avant la section
- source : get_project_reference indisponible (ECONNREFUSED). Repli : export_content_compact du TP de 1-bases-du-php (v102, 2026-10-21).
- Fichiers Onzer à l'entrée : aucun. Le brief de la section 1 indique « Pas d'incrément du fil rouge Onzer à ce stade » et « Onzer entre en scène en section 2 ». Le TP de la section 1 porte sur le classement Z-Event.
- Fonctions existantes à l'entrée (section 1, Z-Event, pas Onzer) : totalCollecte(array $montants): int ; moyenneDons(array $montants): float ; indiceDuPlusHaut(array $montants): int ; indiceDuPlusBas() ; compterAuDessus(array $montants, float $seuil): int ; part(float $valeur, float $total, int $decimales = 1): float ; classeDuRang(int $rang): string ; formaterMontant(float $montant, string $symbole = '€', int $decimales = 0): string ; bonus : chercherPseudo(array $pseudos, string $recherche): int. Toutes opèrent sur les tableaux `$pseudos` et `$montants` du Z-Event.
- Ce que la section ajoute (filRougeStep) : voir brief ci-dessus. Premiers fichiers : entities/Album.php, entities/Artist.php ; une page de catalogue trié et filtré.
- État initial reconstituable pour un bac à sable : oui pour le code de départ. Le squelette `catalogue.php` est un bloc download-file (id c20fcb95-6abe-4863-9119-0138ea0ad06c, dans le TP, visible seulement via get_content, car l'export ne le contient pas). Les pochettes ne sont pas dans les blocs : archive `/download/php/tp2/pochettes-tp2.zip`, et six fichiers d'images référencés dans le tableau de données.

## Verdicts actifs par format
- cours : [] (aucun)
- slide : [] (aucun)
- TP (6) :
  - 6a9c32df5d2dd2e6d3b1e55c (2026-09-05, global) : « il y a toujours la repetition sur le squeette »
  - 6a9c32e15d2dd2e6d3b1e55d (2026-09-05, global) : « Téléchargez le squelette si dessus .... »
  - 6a9c32e45d2dd2e6d3b1e55e (2026-09-05, global) : « retire le Vous avez terminé quand et "Exercice x —" des TPs 1 et 2 »
  - 6a9c32e65d2dd2e6d3b1e55f (2026-09-05, global) : « comme sur le TP1, regarde l'affichage de la reponse sur les calculs qui son a réaliser — précision ensuite : pour moi, c'est utile uniquement sur la 8 »
  - 6ac3edecd38d537522ddd73e (2026-10-05, php) : « retire ce genre de commentaire : "Il n'y a ni session ni base de données à ce stade :" »
  - 6ac67a63137711fbe6236783 (2026-10-07, php) : « "Le TP ne guide pas trop les etudiants ?" (TP4 Formulaire, partie Onzer). Règle validée par l'utilisateur : dans la partie fil rouge, seul le premier exercice d'un geste nouveau est guidé pas à pas ; à partir du deuxième, ne garder que le contrat [...] Pas de code de solution dans les astuces. » (abrégé)

## Exemplaire par format
- cours : non disponible. list_exemplars renvoie [].
- TP : non disponible. list_exemplars renvoie [].
- slide : non disponible. list_exemplars renvoie [].

## Registre des blocs
29 types (list_block_types) : file-tree, text, section, list, list-item, columns, column, callout, collapsible, image-card, table, section-card, code, code-with-preview, input-card, diagram, download-file, quote, divider, slide, slide-text, slide-code, slide-list, slide-list-item, slide-note, slide-table, slide-image, slide-transition, slide-code-with-preview.

## Signalements
- Budgets non calculables : courseIntroMinutes est null dans list_sections et get_section. Le champ manquant doit être fourni avant le calcul.
- Dépôt de référence injoignable : get_project_reference a échoué deux fois avec « connect ECONNREFUSED 172.22.0.2:443 ». Panne réseau, le dépôt est marqué validated. Repli appliqué.
- Curriculum de la section précédente absent : 1-bases-du-php n'a pas de clé curriculum.
- Contenus : les trois supports sont en source db. Rien n'est en file pour cette section. Le download-file du TP (c20fcb95-…) n'apparaît pas dans export_content_compact (limitation signalée par l'outil).
- Points factuels relevés dans les contenus (sans jugement) : numérotation du TP sans tp2-ex6 (tp2-ex5 puis tp2-ex7) ; le bloc tp2-ex7-2 porte à la fois `text` et `content`, aux textes différents ; blocs vides : TP 9cb54dfa-b85b-453a-bc13-216ddf59ac10 (text), slide-text vides d34ad0d2-c972-4f17-bab2-a72ca8f4d5c2, a7d03c43-b0a9-4187-b8fb-d61bc8d06940, 54388029-e468-462b-ac4b-d124e6260870, eff95224-b48a-469e-a794-4dd3a510a835.
- Ordre des sections : order 2 (get_section) ne correspond pas à la position 10 sur 11 dans list_sections.
- Outils du MCP cours-iut-web non utilisés : aucun appel de l'orchestrateur à relancer.

## Définition de terminé
- ✔ chaque champ rempli ou marqué « non disponible » avec sa raison. Preuve : universe absent de list_modules et get_module ; curriculum de 1-bases-du-php absent ; exemplaires [] pour les trois formats ; cours et slide sans verdict.
- ✘ budgets calculés avec le calcul visible. Preuve : courseIntroMinutes = null, calcul 1 × 180 − null non calculable. La règle prévoit « non calculable » avec le champ manquant : c'est signalé, donc le rapport reste incomplet.
- ✔ brief présent. Preuve : get_section.brief et list_sections.brief pour 2-programmation-orientee-objet (notions, filRougeStep, notes).
- ✔ sources prévues lues ou indisponibilité signalée. Preuve : 15 lues sur 16 ; get_project_reference indisponible (ECONNREFUSED 172.22.0.2:443, deux fois) et signalé.



---

## PHP 2 — style cours

# Relecture style : php/2-programmation-orientee-objet — cours
Statut du rapport : terminé

Remarque de méthode : le contenu n'était pas dans le prompt, je l'ai donc lu avec `export_content_compact` (prod, source db, v70). Les blocs de code ne portent pas de texte à relire et sont exclus de la couverture. Les titres, `text`, callouts (titre et corps) et cellules de tableaux sont couverts.

## Liste de tâches
- [x] poo-intro-txt (A B C D E)
- [x] poo-sec-assoc (A B C D E)
- [x] assoc-intro (A B C D E)
- [x] assoc-cles (A B C D E)
- [x] assoc-cles-txt (A B C D E)
- [x] assoc-cles-res (A B C D E)
- [x] assoc-modif (A B C D E)
- [x] assoc-modif-txt (A B C D E)
- [x] assoc-modif-res (A B C D E)
- [x] assoc-modif-callout (A B C D E)
- [x] assoc-modif-callout-txt (A B C D E)
- [x] 7d82d26c-4a1d-4fbd-9d43-3ef3ef535e29 (A B C D E)
- [x] 52073bb7-f82d-47a3-9891-a6d73e180b0f (A B C D E)
- [x] assoc-foreach (A B C D E)
- [x] assoc-foreach-txt (A B C D E)
- [x] assoc-foreach-res (A B C D E)
- [x] assoc-catalogue (A B C D E)
- [x] assoc-catalogue-txt (A B C D E)
- [x] assoc-catalogue-res (A B C D E)
- [x] poo-sec-tri (A B C D E)
- [x] tri-intro (A B C D E)
- [x] tri-fn (A B C D E)
- [x] tri-fn-txt (A B C D E)
- [x] tri-fn-res (A B C D E)
- [x] tri-usort (A B C D E)
- [x] tri-usort-txt (A B C D E)
- [x] tri-usort-res (A B C D E)
- [x] tri-usort-callout (A B C D E)
- [x] tri-usort-callout-txt (A B C D E)
- [x] tri-filter (A B C D E)
- [x] tri-filter-txt (A B C D E)
- [x] tri-filter-res (A B C D E)
- [x] tri-filter-callout (A B C D E)
- [x] tri-filter-callout-txt (A B C D E)
- [x] poo-sec-transition (A B C D E)
- [x] transition-txt-1 (A B C D E)
- [x] transition-txt-2 (A B C D E)
- [x] transition-table (A B C D E)
- [x] poo-sec-classes (A B C D E)
- [x] cls-declarer (A B C D E)
- [x] cls-declarer-txt (A B C D E)
- [x] cls-declarer-res (A B C D E)
- [x] cls-constructeur (A B C D E)
- [x] cls-constructeur-txt (A B C D E)
- [x] cls-constructeur-res (A B C D E)
- [x] cls-promues (A B C D E)
- [x] cls-promues-txt (A B C D E)
- [x] cls-promues-res (A B C D E)
- [x] cls-methodes (A B C D E)
- [x] cls-methodes-txt (A B C D E)
- [x] cls-methodes-res (A B C D E)
- [x] cls-methodes-callout (A B C D E)
- [x] cls-methodes-callout-txt (A B C D E)
- [x] poo-sec-encaps (A B C D E)
- [x] enc-intro (A B C D E)
- [x] enc-private (A B C D E)
- [x] enc-private-txt (A B C D E)
- [x] enc-private-res (A B C D E)
- [x] enc-getters (A B C D E)
- [x] enc-getters-txt (A B C D E)
- [x] enc-getters-res (A B C D E)
- [x] enc-composition (A B C D E)
- [x] enc-composition-txt (A B C D E)
- [x] enc-composition-res (A B C D E)
- [x] enc-portee-table (A B C D E)
- [x] poo-sec-fonctions (A B C D E)
- [x] fonctions-txt (A B C D E)
- [x] fonctions-table (A B C D E)
- [x] fonctions-lien (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | enc-intro | MINEUR | 7, 24, 30 | « Depuis le début de nos objets, les propriétés sont `private` [...] notamment les getters. » | Tournure bancale et « notamment » de remplissage. Proposition : « Jusqu'ici, toutes les propriétés étaient `private` : le code extérieur ne peut pas les modifier directement. C'est l'encapsulation : la classe garde la main sur ses données et n'expose que ses méthodes publiques. » |
| 2 | enc-private-txt, enc-getters-txt | MINEUR | 30, 32 | « C'est le choix utilisé pour les propriétés de nos objets » / « Les objets du cours utilisent donc systématiquement des propriétés privées et des getters publics. » | Le même constat (propriétés privées + getters) est déjà dit dans `cls-declarer-res`, `cls-promues-txt`, `cls-promues-res` et `enc-intro`. Supprimer ces deux phrases de constat et commencer `enc-getters-txt` à « La convention nomme le getter `getNom()`... ». |
| 3 | tri-intro | MINEUR | 24, 31 (à voir par contrat/cohérence) | « elles attendent toutes que vous leur passiez une fonction en argument » | Inexact : `sort` et `ksort`, citées dans `tri-usort-callout-txt`, n'en prennent pas. Proposition : « elles attendent souvent une fonction en argument ». |
| 4 | fonctions-txt | MINEUR | 24 (à voir par contrat/cohérence) | « voici les seules dont vous aurez besoin cette séance. » | `array_keys`, `in_array` et `array_map` figurent au tableau mais ne sont jamais utilisées dans la séance. Proposition : « voici celles à garder sous la main cette séance ». |
| 5 | cls-promues-res | MINEUR | 27, 32 | « Les propriétés sont déclarées et initialisées directement dans le constructeur, mais restent `private`. Le code extérieur passe donc par les getters. » | La phrase redit `cls-promues-txt`, juste au-dessus. Proposition : la supprimer et garder le paragraphe sur `?`, qui apporte du contenu. |
| 6 | assoc-modif-callout, tri-usort-callout, tri-filter-callout, cls-methodes-callout | MINEUR | 18, 27 | « Attention : La clé mal orthographiée », « Attention : Les indices survivent au filtre » | Les quatre titres de callout ont la même attaque « Attention : » suivie d'une majuscule après les deux-points. Proposition : minuscule après les deux-points, et varier une ou deux attaques (« Piège : usort ne renvoie pas... »). |
| 7 | poo-intro-txt | MINEUR | 3, 8 | « en imposant la forme de la donnée et en lui attachant son comportement » | Deux participes présents enchaînés dans une phrase de transition. Proposition : « Les objets vont plus loin : ils imposent la forme de la donnée et lui attachent son comportement. » |

## Vue d'ensemble
Le support est de bonne tenue : vouvoiement et registre tenus, pas d'artefact, pas de ton servile, des exemples concrets (messages d'erreur exacts, voix d'enseignant dans `enc-getters-res` et `assoc-modif-res`). Ce qui revient, ce sont des redites sur « propriétés privées + getters » entre quatre sections, et des petites généralisations de remplissage. Aucune remarque MAJEURE.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 69 blocs relus sur 69 (le cours n'a ni consigne ni slide-note ; blocs de code exclus)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 7 remarques, 7 complètes


---

## PHP 2 — style slides

# Relecture style : php/2-programmation-orientee-objet — slides
Statut du rapport : terminé

Le contenu n'était pas dans le prompt. Je l'ai lu avec `export_content_compact` (prod, source db, v46 du 2026-10-21). Je n'ai pas appelé `get_content`, donc je n'ai pas de liste d'ids de référence. J'ai compté les blocs porteurs de texte dans l'export : 21 titres de slide, 21 slide-note, 1 `sl2-probleme-txt`, 2 tableaux (`sl2-compare-table`, `sl2-portees-table`), soit 45 blocs.

## Liste de tâches
- [x] dce87f5e (titre), a7bffec8 (note) (A B C D E)
- [x] ce6e7fcd (titre), 605aebdb (note) (A B C D E)
- [x] sl2-probleme (titre), sl2-probleme-txt, sl2-probleme-note (A B C D E)
- [x] sl2-cles, sl2-cles-note (A B C D E)
- [x] sl2-modif, sl2-modif-note (A B C D E)
- [x] 26813ca7 (titre), c5a48b83 (note) (A B C D E)
- [x] sl2-foreach, sl2-foreach-note (A B C D E)
- [x] sl2-catalogue, sl2-catalogue-note (A B C D E)
- [x] sl2-fn, sl2-fn-note (A B C D E)
- [x] sl2-usort, sl2-usort-note (A B C D E)
- [x] sl2-filter, sl2-filter-note (A B C D E)
- [x] sl2-compare, sl2-compare-table, sl2-compare-note (A B C D E)
- [x] sl2-classe, sl2-classe-note (A B C D E)
- [x] sl2-constructeur, sl2-constructeur-note (A B C D E)
- [x] sl2-promues, sl2-promues-note (A B C D E)
- [x] c305ba3b (titre), 44171804 (note) (A B C D E)
- [x] sl2-methodes, sl2-methodes-note (A B C D E)
- [x] sl2-private, sl2-private-note (A B C D E)
- [x] sl2-getters, sl2-getters-note (A B C D E)
- [x] sl2-composition, sl2-composition-note (A B C D E)
- [x] sl2-portees, sl2-portees-table, sl2-portees-note (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | sl2-classe-note | MAJEUR | à voir par contrat/cohérence | « Quatre étapes. 1. La classe… 2. `new`… 3. L'affectation d'une propriété. 4. La lecture. » et « `$gaspacho->nom` » | Le code de la slide ne contient ni `new`, ni affectation, ni lecture. Il montre seulement la déclaration. Réaligner la note sur le code, ou ajouter le code manquant. |
| 2 | sl2-classe-res | MAJEUR | à voir par contrat/cohérence | Résultat « Nigiri saumon » | Le code n'a aucun `echo` ni `new`, donc il ne peut rien afficher. Supprimer le résultat ou compléter le code. |
| 3 | sl2-constructeur-note | MAJEUR | à voir par contrat/cohérence | « `new Recette("Gaspacho", "douze")` » et « créer une recette à moitié remplie » | La classe du code s'appelle `Sushi`. Écrire `new Sushi("Nigiri", "douze")`, ou renommer la classe en `Recette`. |
| 4 | sl2-promues-note | MAJEUR | à voir par contrat/cohérence | « sur la version du haut : quatre fois… La version du bas » | La slide ne montre qu'une seule version, déjà promue. Il manque la version « avant » (propriétés déclarées plus affectation dans le corps), ou la note doit changer. |
| 5 | sl2-getters-res | MAJEUR | à voir par contrat/cohérence | Résultat « Gaspacho de pastèque » | Le code affiche `getNom()` sur « Nigiri saumon ». Corriger le résultat. |
| 6 | sl2-composition-res et sl2-composition-note | MAJEUR | à voir par contrat/cohérence | Résultat « Chef Marlène ». Note : « `private Auteur $auteur` », « `getAuteur()` » | Le code utilise `Chef`, `$akira`, `getChef()`, et affiche « Akira ». Aligner le résultat et la note sur le code. |
| 7 | sl2-private-res | MAJEUR | à voir par contrat/cohérence | « Cannot access private property Recette::$nom » | La classe du code est `Sushi`. Écrire `Sushi::$nom`. |
| 8 | sl2-private-note, sl2-getters-note, sl2-methodes-note, sl2-classe-note | MINEUR | à voir par contrat/cohérence | « `$recette->temps = -5;` », « `$recette` », « Deux recettes issues de la même classe » | Le code est en `Sushi`, mais les notes parlent de recettes. Choisir un seul univers dans les notes et dans le code. |
| 9 | sl2-compare-note | MINEUR | D | « Ajoutez qu'une clé mal tapée ne déclenche qu'un `Warning`… » | Le reste du bloc est à l'infinitif (« Prendre le temps », « Parcourir », « Ne pas vendre »). Écrire « Ajouter que… ». Garder le vouvoiement seulement dans la phrase adressée aux étudiants (« encadrez », dans sl2-catalogue-note). |
| 10 | c5a48b83 | MINEUR | C | « Enchaîner directement sur isset()… ?? renvoie la valeur… 0 s'affiche. » | Ni `isset()`, ni `??`, ni `$_GET` n'ont de backticks, alors que toutes les autres notes en mettent. Mettre le code entre backticks. |
| 11 | support entier (a7bffec8, 605aebdb et les notes suivantes) | MINEUR | 27, 32 | « Quatre clics, deux minutes. » / « Trois étapes. » / « Deux étapes. » | Presque toutes les notes ouvrent sur le décompte des étapes, puis les énumèrent. Varier les attaques. Garder le décompte seulement là où il guide le rythme du présentateur. |
| 12 | a7bffec8 | MINEUR | 10, 27 | « Les trois types de base, le tableau indexé, l'interpolation, le foreach. » | Cette phrase sans verbe est une énumération sèche, collée à « Sur chaque étape… ». La faire porter par un verbe : « Ils doivent nommer les trois types, le tableau indexé, l'interpolation et le foreach. » |

## Vue d'ensemble
La voix est bonne : oral net, consignes d'animation concrètes, opinions assumées (« L'erreur à devancer », « la seconde est préférable »), anglicismes et remplissage absents. Aucun signal de pattern IA ne s'accumule dans un bloc. Le vrai problème est la dérive de cohérence entre le code et les notes ou résultats (Sushi/Recette, Chef/Auteur, `new` absent). C'est à traiter par contrat/cohérence, avant tout polissage de style.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 45 blocs relus sur 45 (45 comptés dans l'export, sans liste d'ids de référence fournie)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 12 remarques, 12 complètes (les n° 1 à 8 sont marquées « à voir par contrat/cohérence » faute de numéro de pattern de style)


---

## PHP 2 — style TP

# Relecture style : php/2-programmation-orientee-objet — TP
Statut du rapport : terminé

Source : `get_content` (v254, source db). L'export compact aplatit les sous-listes de `tp2-ex4-2`, donc j'ai relu l'arbre complet. Deux blocs de code (`c20fcb95` squelette, `2162c711` en-tête HTML) n'ont pas de prose. Je les ai lus pour la cohérence, sans les compter dans les blocs de texte.

## Liste de tâches
- [x] bloc tp2-intro (A B C D E)
- [x] bloc 8718dead-103b-4bcd-8948-e09523ec43b5 (A B C D E)
- [x] bloc b0a3f926-f8fc-46c2-bdb3-81a5576f66d5 (A B C D E)
- [x] bloc tp2-donnees (A B C D E)
- [x] bloc tp2-donnees-txt (A B C D E)
- [x] bloc tp2-donnees-table (A B C D E)
- [x] bloc tp2-partie-tableaux (A B C D E)
- [x] bloc 396b8ed8-91c4-4c20-9c39-98fe5afb8c60 (A B C D E)
- [x] bloc 1976a7d0-cf67-43bd-9fb5-40195758d9f1 (A B C D E)
- [x] bloc b89cf4cc-d8e4-4030-82ae-73ef4ad031c9 (A B C D E)
- [x] bloc 06a51ce7-fa1c-4d2a-ba10-9025a982bd5f (A B C D E)
- [x] bloc 12aa2c8e-5737-4ad8-ad33-511b40d579c0 (A B C D E)
- [x] bloc 89aefd4b-9831-4cd4-ab37-3aa7b1492375 (A B C D E)
- [x] bloc 88539aa5-0a14-4b81-9068-b8d19600e039 (A B C D E)
- [x] bloc 7c3036e2-8c02-41c3-bd93-335081843b94 (A B C D E)
- [x] bloc 59e484da-b24e-430d-a674-3b251457c5fc (A B C D E)
- [x] bloc 394205d5-7ea6-4b2f-8b3c-85b8f7fda75c (A B C D E)
- [x] bloc tp2-ex1 (A B C D E)
- [x] bloc tp2-ex1-txt (A B C D E)
- [x] bloc tp2-ex1-2 (A B C D E)
- [x] bloc tp2-ex1-3 (A B C D E)
- [x] bloc tp2-ex2 (A B C D E)
- [x] bloc tp2-ex2-txt (A B C D E)
- [x] bloc tp2-ex2-1 (A B C D E)
- [x] bloc tp2-ex2-2 (A B C D E)
- [x] bloc tp2-ex2-3 (A B C D E)
- [x] bloc tp2-partie-objets (A B C D E)
- [x] bloc tp2-ex3 (A B C D E)
- [x] bloc tp2-ex3-txt (A B C D E)
- [x] bloc tp2-ex3-1 (A B C D E)
- [x] bloc tp2-ex3-2 (A B C D E)
- [x] bloc 865e4be2-b732-4add-8f78-909d55e39a97 (A B C D E)
- [x] bloc tp2-ex4 (A B C D E)
- [x] bloc tp2-ex4-txt (A B C D E)
- [x] bloc tp2-ex4-1 (A B C D E)
- [x] bloc tp2-ex4-2 (A B C D E)
- [x] bloc f361baf1-72dc-4314-be44-345dc10c9f25 (A B C D E)
- [x] bloc 810ed0bc-7a8d-4f33-80f5-7974492b7197 (A B C D E)
- [x] bloc tp2-ex4-4 (A B C D E)
- [x] bloc b2495668-7d7e-49d4-8db3-a1f230870b4e (A B C D E)
- [x] bloc 9cb54dfa-b85b-453a-bc13-216ddf59ac10 (A B C D E)
- [x] bloc a29314e2-81e2-419f-ab61-0c8005ebc806 (A B C D E)
- [x] bloc 83f0e431-b1c1-4375-913b-61215bf8ba65 (A B C D E)
- [x] bloc 32915758-e959-43c3-83c5-e2ff0c8ed07f (A B C D E)
- [x] bloc e7ca00cc-c904-4d54-bcb1-d68a45a4b78a (A B C D E)
- [x] bloc tp2-ex5 (A B C D E)
- [x] bloc tp2-ex5-txt (A B C D E)
- [x] bloc tp2-ex5-1 (A B C D E)
- [x] bloc 06465bb5-681a-4789-88a8-920bb6efb328 (A B C D E)
- [x] bloc tp2-ex5-2 (A B C D E)
- [x] bloc 4333ab96-c8d2-47bb-a0d1-2ac89cef095d (A B C D E)
- [x] bloc 3d96bd38-4d6b-4688-a084-e3a7fb754a4f (A B C D E)
- [x] bloc tp2-ex5-4 (A B C D E)
- [x] bloc tp2-ex5-tip (A B C D E)
- [x] bloc tp2-ex5-tip-txt (A B C D E)
- [x] bloc tp2-ex7 (A B C D E)
- [x] bloc tp2-ex7-txt (A B C D E)
- [x] bloc 1eb86acb-3d00-411b-9105-04b3849e3eaf (A B C D E)
- [x] bloc b3ea04db-d7a6-497b-ad72-38e084df1859 (A B C D E)
- [x] bloc tp2-ex7-1 (A B C D E)
- [x] bloc tp2-ex7-2 (A B C D E)
- [x] bloc tp2-ex7-3 (A B C D E)
- [x] bloc tp2-ex7-5 (A B C D E)
- [x] bloc tp2-ex8 (A B C D E)
- [x] bloc tp2-ex8-txt (A B C D E)
- [x] bloc tp2-ex8-1 (A B C D E)
- [x] bloc tp2-ex8-3 (A B C D E)
- [x] bloc tp2-bonus (A B C D E)
- [x] bloc tp2-bonus-txt (A B C D E)
- [x] bloc tp2-bonus-1 (A B C D E)
- [x] bloc tp2-bonus-2 (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | tp2-ex7-2 | MAJEUR (à voir par contrat/cohérence) | artefact hors grille | Le bloc porte un champ `content` résiduel : « 2. Récupérez d'abord le paramètre `tri` avec `isset()` … Remplacez ensuite ces deux tests par l'opérateur `??` … » | Ce texte contredit le `text` affiché (`??` directement). Supprimer le champ `content` pour qu'aucune version ne puisse resurgir. |
| 2 | tp2-ex7-2 | MINEUR | 27, 32 | « Récupérez `$_GET['sens']` … Vérifiez ensuite … Faites de même pour `colonne` … Testez avec … » | Cinq actions en un seul bloc. Donner le contrat (valeurs autorisées, repli sur la valeur par défaut) en une ou deux consignes, comme le demande le verdict fil rouge. |
| 3 | 9cb54dfa-b85b-453a-bc13-216ddf59ac10 | MINEUR | artefact hors grille | bloc `text` au contenu vide (`""`) | Supprimer le bloc. |
| 4 | a29314e2-81e2-419f-ab61-0c8005ebc806 | MINEUR | 24, 30 | « Album et Artist existent tous les deux, chacun peut référencer l'autre sans problème. » | Phrase creuse. Dire ce qui change : « Un artiste connaît maintenant ses albums, l'album connaît son artiste. » |
| 5 | 83f0e431-b1c1-4375-913b-61215bf8ba65 | MAJEUR | D (impératif) | « Le constructeur d'`Artist` prend une seconde propriété promue : `private array $albums = []`. » | Consigne à l'indicatif. Écrire : « Ajoutez au constructeur d'`Artist` une seconde propriété promue : `private array $albums = []`. » |
| 6 | tp2-ex4-4 | MAJEUR (à voir par contrat/cohérence) | D (futur), 30 | « Vous vous en servirez dans le bonus. » | Futur dans une consigne. De plus, `__toString` de `Album` sert dès la vérification de l'exercice « Construire le catalogue » (`echo $albumsObjets[0]`), pas seulement au bonus. Supprimer la phrase ou écrire : « Vous le testerez dans l'exercice suivant. » |
| 7 | tp2-ex4-2, f361baf1-72dc-4314-be44-345dc10c9f25, 810ed0bc-7a8d-4f33-80f5-7974492b7197 | MINEUR | D | « Les getters du titre, de l'année et de l'artiste… » ; « `getCover(): string`, qui renvoie uniquement le nom du fichier… » | Les sous-items sont des groupes nominaux, pas des consignes. Écrire : « Ajoutez les getters du titre, de l'année et de l'artiste… » et « Ajoutez `getCover(): string`… et `getCoverUrl(): string`… » |
| 8 | tp2-ex3-txt | MINEUR | B (à voir par contrat/cohérence) | « Un artiste a un nom et une liste d'albums, vide au départ. » | L'exercice ne crée que `name`. La liste arrive dans « Le lien Album et Artist ». Ne parler que du nom ici. |
| 9 | tp2-ex1-txt | MINEUR | 24, 30 | « Le catalogue complet contient six albums. » | Répète le texte des données (« les six albums du catalogue de départ »). Supprimer, ou en faire l'amorce de la consigne. |
| 10 | tp2-ex2-1 | MAJEUR (à voir par contrat/cohérence) | repère ambigu | « Sous le repère `// === Traitement ===` » | Le squelette contient `// === Traitement (tri, filtre, statistiques) ===`. Aligner le texte des consignes (ici et en `tp2-ex8-1`) ou le squelette. |
| 11 | tp2-ex5-4 | MINEUR | 27, 31 | « Chaque ligne affiche la pochette obtenue avec `getCoverUrl()`, puis le titre, l'année et l'artiste avec les getters. Les images ont un texte alternatif et une largeur de `96`. » | Ce geste (tableau et boucle) a déjà été guidé à l'exercice « Le catalogue complet ». Passer au contrat : « Reproduisez le tableau avec les objets : six lignes, mêmes colonnes, pochettes de largeur 96. » |
| 12 | tp2-ex5-tip-txt | MINEUR | 30 | « SSH et Maitre Git sont utilisés par deux albums chacun, Katy Query et Loopal par un seul. » | Redit le décompte de la consigne `4333ab96`. Garder la seule phrase utile : « Un objet `Artist` ne se construit qu'une fois, même s'il est réutilisé. » |
| 13 | tp2-ex7-txt | MINEUR | 24, orthographe | « Le tri va être pilotable depuis l'URL, avec des entêtes de colonnes cliquables. » | Annonce au futur proche, avec un mot technique en trop. Écrire : « Le tri se choisit dans l'URL, avec des en-têtes de colonnes cliquables. » |
| 14 | 2162c711-a3b3-4351-8ba6-5ffc0359fb04 | MINEUR (à voir par contrat/cohérence) | verdict fil rouge | le `<thead>` complet avec ses ternaires imbriqués | Le bloc de code donne la solution du geste (lien de tri + flèche). Fourni tel quel il est acceptable, mais `tp2-ex7-5` se réduit alors à un copier-coller. Donner seulement le contrat (flèche ▲/▼, sens inversé au second clic) et laisser écrire un des trois liens. |
| 15 | tp2-ex4-1 | MINEUR | verdict fil rouge | « Ajoutez une constante publique `BASE_URL` … puis un constructeur avec quatre propriétés privées promues : … » | Deuxième classe, même geste que `Artist` (propriétés promues). Ne garder que le contrat : propriétés et types, plus `BASE_URL`. |

## Vue d'ensemble
Le registre est tenu : vouvoiement et impératif propres presque partout, sans vocabulaire IA, sans annonce de plan ni conclusion plaquée. Les verdicts « Vous avez terminé quand », « Exercice x — » et « Il n'y a ni session… » ne se déclenchent nulle part. Les défauts sont locaux : des consignes à l'indicatif, au nominal ou au futur (n° 5, 6, 7), deux phrases creuses ou redondantes (n° 4, 9, 12) et un guidage encore trop pas à pas aux exercices 4, 5 et 7 (n° 2, 11, 14, 15). Le champ `content` résiduel de `tp2-ex7-2` (n° 1) est le seul vrai artefact. À l'échelle du support, le mélange « album » et « disque » (`tp2-ex1-2`, `tp2-ex5-2`, `tp2-ex8-txt`) reste tolérable, mais choisir un seul mot serait plus net.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 72 blocs relus sur 72 (plus 2 blocs de code sans prose, `c20fcb95` et `2162c711`, lus pour la cohérence). Il n'y a pas de slide-note dans un TP.
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 15 remarques, 15 complètes (pour les nos 1, 3, 8, 10, 14 et 15, le « pattern » est un artefact hors grille ou une mention de contrat/cohérence, comme le prévoit le cadre).


---

## PHP 2 — cohérence

# Relecture cohérence : php/2-programmation-orientee-objet — cours, slides, TP

Statut des trois rapports : terminé, avec une réserve sur le TP (dépôt de référence injoignable). Source : prod, source db. Mode : première passe.

Toutes les confrontations « dépôt » du TP ont été faites contre le repli seul : TP de la section 1 (v102), briefs des sections 1, 3, 4 et 5 lus via `list_sections`. `get_project_reference` n'a pas été appelé, le collecteur l'ayant donné injoignable (ECONNREFUSED). « TP conforme au dépôt » est donc vérifié seulement contre ce repli.

Je n'ai trouvé aucune fuite Onzer dans le cours ni dans les slides (aucun album, artiste, morceau, catalogue musical).

Constat transversal : le cours est écrit en Sushi/Chef, les slides mélangent Recette/Gaspacho (13 slides) et Sushi/Chef (8 slides), alors que l'`exampleDomain` est « Recettes de cuisine » (Recette, Ingrédient, Auteur). Les résultats affichés sur plusieurs slides contredisent leur code (détail dans le rapport slides).

---

# Relecture cohérence : php/2-programmation-orientee-objet — cours
Statut du rapport : terminé

## Liste de tâches
- [x] 17 blocs d'exemple × domaine : assoc-cles-code, assoc-modif-code, 4c8a3bf2, assoc-foreach-code, assoc-catalogue-code, tri-fn-code, tri-usort-code, tri-filter-code, transition-table, cls-declarer-code, cls-constructeur-code, cls-promues-code, cls-methodes-code, enc-private-code, enc-getters-code, enc-composition-code, fonctions-table
- [x] 16 notions × curriculum : isset, `??`, `fn`, `<=>`, usort, array_filter, array_values, array_keys/in_array/array_map, class/new/`->`/`$this`, `?type`, valeur par défaut de paramètre, TypeError, public/private/protected, getters, composition, typage de propriété
- [x] 5 notions du brief × critères 2 et 3 : Tableaux associatifs, Tri et filtre, Classes et objets, Constructeur à propriétés promues, Encapsulation
- [x] Grammaire des blocs × 6 parties (assoc, tri, transition, classes, encaps, fonctions)

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | poo-intro-txt (et tous les exemples) | MAJEUR | 1 domaine | « Les exemples de cette séance tournent désormais autour d'un catalogue de sushis » ; `class Sushi`, `class Chef` partout | exampleDomain : « Recette, Ingrédient, Auteur ». Les slides utilisent `Recette`/Gaspacho pour 13 slides. | Réécrire en Recette (et Auteur à la place de Chef). Le mot « désormais » n'a pas de sens, rien ne précède. |
| 2 | transition-table (ligne 3) et transition-txt-2 | MAJEUR | 2 factuel, à confirmer par etudiant-fragile | « Clé ou propriété inconnue : `Error`, la page s'arrête » | Lire une propriété publique inexistante donne `Warning: Undefined property`, pas une `Error`. Seul l'accès à une propriété privée lève `Error`. | Reformuler : propriété privée ou méthode inexistante → `Error`. Ou supprimer la généralisation. |
| 3 | cls-promues-res | MAJEUR | factuel | `string(6) "flambé"` | « flambé » fait 7 octets en UTF-8 (é = 2 octets), `var_dump` affiche `string(7)`. | Corriger en `string(7) "flambé"`. |
| 4 | assoc-catalogue-res | MAJEUR | factuel, à confirmer | « sans elles, PHP s'arrête au `$sushi` et n'irait pas chercher la clé » | `"$sushi['nom']"` avec apostrophes en syntaxe simple est une erreur de syntaxe (Parse error), pas un arrêt silencieux. | Citer le vrai message de Parse error, ou reformuler. La slide `sl2-catalogue` répète l'affirmation. |
| 5 | cls-declarer-code / cls-declarer-txt | MAJEUR | 3 structure | Le texte annonce « `new` fabrique un objet, la flèche `->` accède… », le code ne contient ni constructeur, ni `new`, ni appel | Les propriétés typées sans valeur ne sont pas initialisées. Un appel à `getNom()` donnerait `Typed property Sushi::$nom must not be accessed before initialization`. | Montrer `new` et un échec réel, ou fusionner avec l'exemple du constructeur. |
| 6 | cls-constructeur, cls-promues (aucun callout) | MAJEUR | 3 structure | « `new Sushi("California", "douze")` provoque une `TypeError` » (en prose) ; « refuse `null` et déclenche une `TypeError` » | Le message n'est donné nulle part. Il n'y a pas de `callout` `warning` pour ces deux notions, alors que Tableaux associatifs, Tri et Méthodes en ont. | Ajouter un `callout` `warning` avec le message réel (`Sushi::__construct(): Argument #2 ($temps) must be of type int, string given`). |
| 7 | enc-private-res | MAJEUR | 3 structure, à confirmer par etudiant-fragile | `Fatal error: Cannot access private property Sushi::$nom` | PHP 8 écrit `Fatal error: Uncaught Error: Cannot access private property Sushi::$nom in … on line N`. Le message est abrégé et placé dans un texte de résultat, pas dans un `callout` `warning`. | Citer le message complet dans un `callout` `warning`. |
| 8 | cls-constructeur-txt, cls-promues-txt | MINEUR | 3 | La notion « propriétés promues » démarre directement sur 4 paramètres (défaut, `?string`) | Il n'y a pas d'exemple minimal (2 paramètres) avant la variante réaliste. | Faire précéder l'exemple à 4 paramètres d'une version à 2 paramètres. |
| 9 | 7d82d26c, 4c8a3bf2 (`??`) | MINEUR | 2 | Opérateur `??` | Hors brief (Tableaux associatifs…) et hors section 1. Introduit ici, utilisé au TP ex7. | Signaler pour le curriculum. |
| 10 | tri-fn-txt (`fn`), tri-usort-txt (`<=>`), cls-promues-res (`?string`, `= null`) | MINEUR | 2 | Fonctions fléchées, `<=>`, types nullables | Absents du brief de la section 2 et de la section 1. Introduits et expliqués par le cours. | Signaler pour le curriculum. |
| 11 | tri-usort-callout-txt, tri-filter-callout-txt | MINEUR | 3 | « la page affiche `1` » ; « `$rapides[1]` peut alors échouer » | Pas de vrai message cité (`Warning: Undefined array key 1`). | Citer le message. |
| 12 | (parties classes, encaps) | MINEUR | 6 | Aucun défaut détecté | Les exemples sont des `code` php. Pas de commande de terminal. Pas de fichier à créer. | Sans objet. |

## Confrontations
- exampleDomain : 17 exemples vérifiés sur 17. Aucun n'est dans le domaine Recette. 17 sont en Sushi/Chef, ce qui est de la cuisine mais pas le domaine déclaré. Remarque 1.
- Fuite Onzer : 17 exemples vérifiés sur 17. Aucune fuite. La structure tableau de tableaux puis composition Sushi→Chef est isomorphe à Album→Artist. C'est voulu (note du brief de la section 5) et ce n'est pas un copier-coller possible.
- curriculum : 16 notions confrontées sur 16. Notions introduites par la section : isset, `??`, `fn`, `<=>`, `?type`, `= null`, `protected` (mentionné seulement). Utilisées comme acquises : typage, valeur par défaut, `foreach`, `count`, `var_dump`.
- notions du brief : 5 sur 5 présentes dans le cours. Toutes pratiquées au TP. Pas de setters dans le cours, conforme au brief.

## Définition de terminé
- ✔ chaque exemple vérifié contre l'exampleDomain : 17 sur 17 (écart signalé)
- ✔ chaque notion utilisée confrontée aux curriculum : 16 sur 16
- sans objet : résultats observables confrontés au dépôt (cours)
- sans objet : comparaison au cours (cours)

---

# Relecture cohérence : php/2-programmation-orientee-objet — slides
Statut du rapport : terminé

## Liste de tâches
- [x] 21 slides × critère 5 (comparaison au cours) : dce87f5e, ce6e7fcd, sl2-probleme, sl2-cles, sl2-modif, 26813ca7, sl2-foreach, sl2-catalogue, sl2-fn, sl2-usort, sl2-filter, sl2-compare, sl2-classe, sl2-constructeur, sl2-promues, c305ba3b, sl2-methodes, sl2-private, sl2-getters, sl2-composition, sl2-portees
- [x] 21 slides × domaine
- [x] 21 slides × note présentateur : les 21 en ont une.
- [x] Notions des slides vs cours et vs curriculum
- [x] Grammaire des blocs : 1 partie (toutes les slides)

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | sl2-classe-code / sl2-classe-res / sl2-classe-note | MAJEUR | 5 notion absente du cours | Le code n'a ni `new`, ni affectation, ni lecture. Le résultat affiche `Nigiri saumon`. La note décrit 4 étapes (new, affectation d'une propriété, lecture) et la règle `$gaspacho->$nom`. | Le cours ne montre jamais d'affectation de propriété depuis l'extérieur (les propriétés sont `private`). cls-declarer-code n'a pas non plus de `new`. | Aligner la slide et la note sur cls-declarer-code, après correction du cours. |
| 2 | sl2-private-res | MAJEUR | cohérence | `Fatal error: Cannot access private property Recette::$nom` | Le code de la slide déclare `class Sushi`. | Mettre le même nom de classe dans le code et dans le résultat. |
| 3 | sl2-getters-res | MAJEUR | cohérence | Résultat `Gaspacho de pastèque` | Le code fait `new Sushi("Nigiri saumon")` et `echo $nigiri->getNom()`. | Corriger le résultat ou le code. |
| 4 | sl2-composition-res / sl2-composition-note | MAJEUR | cohérence | Résultat `Chef Marlène`, note `private Auteur $auteur`, `getAuteur()` | Le code est `Chef $akira`, `getChef()`, `echo … getNom()` donc `Akira`. | Un seul vocabulaire, Recette/Auteur selon l'exampleDomain. |
| 5 | sl2-promues-note | MAJEUR | cohérence | « Compter `nom` sur la version du haut : quatre fois… La version du bas… Le `public` devant le paramètre » | La slide n'a qu'un seul bloc de code (promues, `private`). Il n'y a pas de version à comparer. | Ajouter la version longue (comparaison avant/après) ou réécrire la note. |
| 6 | sl2-compare-table | MAJEUR | 5 recopie du cours | Tableau repris de transition-table. Ligne 4 : `$r->nom` | Le cours dit `$sushi->getNom()`, et `nom` est `private`, donc `$r->nom` provoque la `Fatal error` de la slide `sl2-private`. La ligne « Clé inconnue : `Error` » reprend l'erreur du cours (remarque 2 du cours). | Ne pas recopier le tableau : un seul contraste en visuel. Corriger `$r->getNom()`. |
| 7 | sl2-portees-table | MAJEUR | 5 recopie du cours | Tableau identique mot pour mot à enc-portee-table | Mêmes trois lignes, mêmes formulations (« Par défaut, les propriétés »). | Remplacer par une phrase de règle (propriétés `private`, méthodes `public`) et renvoyer au cours. |
| 8 | sl2-classe, sl2-constructeur, sl2-promues, c305ba3b, sl2-methodes, sl2-private, sl2-getters, sl2-composition | MAJEUR | 1 domaine | 8 slides en `Sushi`/`Chef`/`Akira` | exampleDomain : Recette. Les 13 autres slides sont en Recette/Gaspacho, ce qui est incohérent à l'intérieur d'une même séance. | Basculer en Recette/Auteur (en même temps que le cours). |
| 9 | sl2-compare-note | MINEUR | 5 | La note redit transition-txt-1 en quasi-verbatim | Mêmes arguments dans le même ordre. | Réduire la note à l'angle oral. |
| 10 | sl2-modif | MINEUR | 5 une idée par slide | Ajouter, modifier et vérifier sur une seule slide (3 étapes) | La note annonce 3 étapes. | Découper `isset` à part, ou accepter. |
| 11 | sl2-filter-code | MINEUR | 2 | `print_r(array_keys($rapides))` | `print_r` n'est ni dans le cours ni dans le curriculum. Le cours ne montre que `array_keys`. | Utiliser `var_dump` ou l'ajouter au cours. |
| 12 | sl2-catalogue-note | MINEUR | cohérence | « Sans les accolades, PHP s'arrête au `$recette` » | Même inexactitude que la remarque 4 du cours (Parse error). | À corriger avec le cours. |
| 13 | dce87f5e note | MINEUR | cohérence | « Si le temps manque en TP, tri et filtre passent en bonus » | Le TP les place en ex2 obligatoire (`tp2-ex2`), pas en bonus. | Aligner (voir aussi remarque 5 du TP). |
| 14 | blocs `slide-text` vides (d34ad0d2, a7d03c43, 54388029, eff95224) | MINEUR | 6 | Blocs vides relevés par le collecteur | Non visibles dans l'export compact : à confirmer par `get_content`. | À supprimer s'ils existent. |

## Confrontations
- cours (slides) : 21 slides comparées sur 21. Notions des slides absentes du cours : `print_r`, affectation de propriété `->nom = …` (sl2-classe-note). Toutes les autres (`??`, `?string`, `fn`, `<=>`, getters, composition, portées) sont dans le cours.
- exampleDomain : 21 slides vérifiées sur 21. 13 sont en Recette (ou neutres), 8 en Sushi.
- slide-code-with-preview : le rendu HTML textuel de `sl2-cles-res` et `sl2-filter-res` n'est pas visuel. Seule `sl2-foreach` a un aperçu. Rien à signaler.
- Notes présentateur : 21 sur 21.

## Définition de terminé
- ✔ chaque exemple vérifié contre l'exampleDomain : 21 sur 21 (écart signalé)
- ✔ chaque notion utilisée confrontée aux curriculum : 21 slides sur 21 (via comparaison au cours)
- sans objet : résultats observables confrontés au dépôt (slides)
- ✔ pour des slides : comparaison au cours faite : 21 slides sur 21

---

# Relecture cohérence : php/2-programmation-orientee-objet — TP
Statut du rapport : terminé, avec réserve : dépôt de référence non lu, confrontation contre le repli (TP section 1 v102, briefs des sections 1, 3, 4 et 5)

## Liste de tâches
- [x] 12 exercices × critères 2 et 4 : Tableau des artistes, Un album en tableau associatif, ex-1 `tp2-ex1`, ex-2 `tp2-ex2`, ex-3 `tp2-ex3`, ex-4 `tp2-ex4`, Lien Album/Artist (`b2495668…`), ex-5 `tp2-ex5`, ex-7 `tp2-ex7`, ex-8 `tp2-ex8`, bonus-1 `tp2-bonus-1`, bonus-2 `tp2-bonus-2`
- [x] Progression guidé → fil rouge
- [x] Grammaire des blocs × 4 parties (données, tableaux, objets, bonus)

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp2-ex4-1 | BLOQUANT | 2 notion enseignée nulle part | « Ajoutez une constante publique `BASE_URL` contenant le chemin relatif… » ; `getCoverUrl()` « à partir de `BASE_URL` » | Ni le cours (`const`, `self::`) ni le brief ne l'enseignent. Rien dans le curriculum de la section 1. | Ajouter au cours (constante de classe et `self::`) ou donner la ligne `public const BASE_URL = 'pochettes/';` dans l'énoncé. |
| 2 | 865e4be2 (ex3-3), tp2-ex4-4, 3d96bd38, tp2-bonus-2 | MAJEUR | 2 | `__toString()`, `echo $ssh;`, `echo $albumsObjets[0];`, bonus `echo` | Notion absente du cours et du brief. Expliquée seulement dans l'énoncé de ex3-3 (« Cette méthode magique… »). Elle conditionne les vérifications de ex5 et le bonus 2. | Ajouter au cours ou au brief. Sinon marquer comme notion introduite par le TP. |
| 3 | tp2-ex4-2 (sous-liste `f361baf1`) vs tp2-ex7-1 | MAJEUR | 4 signature | « Les getters du titre, de l'année et de l'artiste, avec un type de retour adapté » | Les noms ne sont pas donnés ici. ex7-1 exige `getTitle()`, `getYear()`, `getArtist()->getName()`. Les noms des paramètres du constructeur ne sont pas imposés non plus. Le cours enseigne `getNom()` (français). | Nommer explicitement `getTitle(): string`, `getYear(): int`, `getArtist(): Artist`. |
| 4 | tp2-ex7-2 (props `text` ≠ `content`) | MAJEUR | cohérence | `text` : « … avec `'asc'` comme valeur par défaut s'il est absent (utilisez `??`)… » ; `content` : « Récupérez d'abord le paramètre `tri` avec `isset()`… Remplacez ensuite ces deux tests par `??` … » | Deux consignes différentes dans le même bloc (celle de `content` est plus progressive). Le rendu affiche `text`. | Garder une seule version, de préférence guidée (isset, puis `??`), et vider l'autre champ. |
| 5 | Progression : toutes les parties `tp2-partie-tableaux`/`tp2-partie-objets` sont `projectRef: true` | MAJEUR | 4 progression | Le TP ne contient aucune partie guidée non-fil rouge. Onzer démarre dès l'exercice 1. | Seules « Les données » et le bonus sont `projectRef: false`. Le TP1 (repli) avait une partie classique complète (Z-Event). Le TP est constitué de 12 éléments pour un budget de 160 min, avec une note slides disant que tri et filtre sont bonus. | Prévoir une partie guidée courte (domaine Recette) avant l'Onzer, ou faire passer le tri et le filtre (ex2, ex7) en bonus comme la note du brief le prévoit. |
| 6 | Brief filRougeOutcome vs tp2-ex3-1 / tp2-ex4-1 | MAJEUR | 4 état du fil rouge | Outcome : « entities/Album.php et entities/Artist.php existent ». Le TP place les classes dans `catalogue.php` sous `// === Classes ===`. | Brief de la section 3 : « les classes Artist et Album du TP2, rangées dans entities/ ». Le TP n'est pas conforme à l'outcome de son propre brief, mais conforme au brief de la section 3. | Arbitrer : corriger le brief de la section 2 (entities/ arrive en section 3) ou faire créer les fichiers au TP. |
| 7 | Brief filRougeStep vs tp2-ex2 | MINEUR | 4 | « trié et filtré par des fonctions écrites en section 1 » | Le TP et le cours utilisent `usort` et `array_filter` natifs. | Corriger le brief. |
| 8 | tp2-ex7-1 (`string\|int`), tp2-ex7-2 (`$_GET`, `in_array`) | MINEUR | 2 | Type union, `$_GET`, écriture de `valeurPour` | Hors cours et brief. Le callout `1eb86acb` explique l'essentiel de `$_GET` et renvoie au TP4. `in_array` est dans le cours. | Mentionner `string\|int` dans le callout. |
| 9 | e7ca00cc (`ajouterAlbum(Album $album): void`) | MINEUR | 2 | Type de retour `void`, ajout `$this->albums[] = …` | Absents du cours de la section 2. Section 1 non vérifiable : pas de curriculum. | À confirmer. |
| 10 | tp2-ex7-5 (HTML `thead` fourni) | MINEUR | 6 grammaire | Long code à recopier, `language: html` avec du PHP, sans `filename` | `code` simple de 8 lignes, avec `&` brut dans les `href`. | Passer en `download-file` (`thead.php`), ou `language: php` avec un nom. |
| 11 | tp2-ex7-2 / thead | MINEUR | 4 | Les variables `$colonne` et `$sens` ne sont pas nommées dans l'énoncé. | Le `thead` fourni les utilise. | Nommer les variables dans la consigne. |
| 12 | tp2-bonus-1 | MINEUR | 4 | « dans le tableau de l'exercice 7 » | Les sections n'ont pas de numéros dans l'export. Numérotation ex-6 absente (ids : ex5 puis ex7). | Vérifier que la numérotation rendue correspond. |
| 13 | b2495668 / 9cb54dfa | MINEUR | 6 | Bloc `text` vide `9cb54dfa` ; `tp2-ex3-txt` annonce « une liste d'albums, vide au départ » alors que la liste n'est ajoutée que dans la section suivante | Cohérence interne. | Supprimer le bloc vide. Déplacer ou reformuler la phrase. |
| 14 | Autres exercices | — | — | Tableau des artistes, album, ex1, ex2, ex3, ex5, ex8, bonus | Aucun défaut. Résultats cohérents avec le tableau de données : Rootkit 2019 SSH ; filtre > 2014 donne Couche 7, Trop bool, Rootkit ; `Rootkit (2019) — SSH` ; SSH et Maitre Git ont 2 albums, Katy Query et Loopal 1. | Sans objet. |

## Confrontations
- exampleDomain : sans objet (le TP est fil rouge).
- curriculum : 12 exercices confrontés sur 12 à la section 1 (brief, pas de curriculum) et au cours. Notions introduites par le TP seul : constante de classe, `__toString`, `void`, `string|int`, `$_GET`.
- dépôt (TP) : 12 résultats observables confrontés sur 12, contre le repli seulement. Fichiers lus : TP section 1 (`export_content_compact` php/1-bases-du-php TP), briefs des sections 1, 3, 4, 5 (`list_sections`). Le dépôt de référence n'a pas pu être lu.
- Cohérence avec la section 3 (brief) : compatible. La section 3 enrichit Artist (id, avatar) et Album, et remplace `BASE_URL` par `POCHETTES_BASE_URL`, alors que `providedBase` dit « classes du TP2 ».
- cours (TP) : notions des 5 du brief pratiquées. Tri et filtre sont pratiqués (ex2, ex7).

## Définition de terminé
- ✔ chaque exemple vérifié contre l'exampleDomain : sans objet (TP)
- ✔ chaque notion utilisée confrontée aux curriculum : 12 sur 12
- ✔ pour un TP : chaque résultat observable confronté au dépôt : 12 sur 12, contre le repli uniquement (dépôt injoignable)
- sans objet : comparaison au cours (slides)


---

## PHP 2 — contrat TP

# Relecture contrat : php/2-programmation-orientee-objet — TP
Statut du rapport : incomplet

Source : prod, source db, TP version 254 (export compact et get_content). Aucune durée par exercice n'existe dans le contenu : la somme est donc non calculable.

## Liste de tâches
- [x] tp2-ex… « Le tableau des artistes » (396b8ed8) : 6 champs + durée
- [x] 89aefd4b « Un album en tableau associatif » : 6 champs + durée
- [x] tp2-ex1 « Le catalogue complet » : 6 champs + durée
- [x] tp2-ex2 « Trier et filtrer (statique) » : 6 champs + durée
- [x] tp2-ex3 « La classe Artist » : 6 champs + durée
- [x] tp2-ex4 « La classe Album » : 6 champs + durée
- [x] b2495668 « Le lien Album et Artist » : 6 champs + durée
- [x] tp2-ex5 « Construire le catalogue » : 6 champs + durée
- [x] tp2-ex7 « Un tableau triable par colonne » : 6 champs + durée
- [x] tp2-ex8 « Des statistiques » : 6 champs + durée
- [x] tp2-bonus-1 « estRecent() » : 6 champs + durée
- [x] tp2-bonus-2 « chercherAlbum() » : 6 champs + durée
- [ ] somme des durées et pourcentage du budget : non calculée (0 durée renseignée sur 10 exercices du tronc commun)

## Grille
| Exercice (id) | Type | 1 Fichier | 2 Noms | 3 Données | 4 API | 5 Résultat | 6 Validation | Durée |
|---|---|---|---|---|---|---|---|---|
| 396b8ed8-91c4-4c20-9c39-98fe5afb8c60 (Le tableau des artistes) | tronc | présent | présent | présent (4 noms donnés) | présent (foreach) | présent (4 lignes) | présent (4 lignes, une par artiste) | absent |
| 89aefd4b-9831-4cd4-ab37-3aa7b1492375 (Un album en tableau associatif) | tronc | présent (repère catalogue.php) | présent | présent (renvoi tableau de départ, Rootkit) | présent (tableau associatif) | présent (Rootkit, 2019, SSH) | présent (rendu observable) | absent |
| tp2-ex1 (Le catalogue complet) | tronc | vague (aucun fichier ni repère) | présent | présent (tableau de départ) | présent (structure associative, boucle) | présent (6 lignes) | présent (pochette ↔ titre) | absent |
| tp2-ex2 (Trier et filtrer) | tronc | présent (repère Traitement) | présent | présent (tableau $albums) | présent (usort, array_filter) | présent (Couche 7, Trop bool, Rootkit) | présent (ordre affiché) | absent |
| tp2-ex3 (La classe Artist) | tronc | présent (repère Classes, fichier non nommé) | présent | sans objet (aucune saisie) | présent (propriété promue, __toString) | présent (retours getName, __toString) | absent | absent |
| tp2-ex4 (La classe Album) | tronc | présent (repère Classes, fichier non nommé) | vague (propriétés et getters sans noms) | sans objet (aucune saisie) | présent (constante, constructeur promu, getCover, getCoverUrl) | présent (format Titre (Année) — Artiste) | absent | absent |
| b2495668-7d7e-49d4-8db3-a1f230870b4e (Le lien Album et Artist) | tronc | vague (aucun fichier ni repère) | présent | sans objet (aucune saisie) | présent (propriété promue, getAlbums, ajouterAlbum) | présent (range à la fin de la liste) | absent | absent |
| tp2-ex5 (Construire le catalogue) | tronc | présent (repère Données) | présent (11 variables) | présent (tableau de départ) | présent (constructeur, ajouterAlbum) | présent (SSH, Rootkit (2019) — SSH, 6 lignes) | présent (2/2/1/1 albums, 6 lignes) | absent |
| tp2-ex7 (Un tableau triable par colonne) | tronc | vague (aucun fichier ni repère) | présent (valeurPour, $sens, $colonne) | présent (URL de test) | vague (deux méthodes contradictoires) | présent (six albums, ordre inversé) | présent (tests par URL) | absent |
| tp2-ex8 (Des statistiques) | tronc | présent (repères Traitement, Affichage) | présent | présent ($albumsObjets) | présent (pas de max(), getAlbums) | présent (« Le plus récent : Titre (Année) ») | présent (rendu décrit) | absent |
| tp2-bonus-1 (estRecent) | bonus | vague (renvoi à « l'exercice 7 », fichier non nommé) | présent | présent (seuil 2016) | présent (méthode bool sur Album) | présent (« (Nouveau) » après le titre) | absent | non indiquée (bonus) |
| tp2-bonus-2 (chercherAlbum) | bonus | vague (aucun fichier) | présent | présent (Rootkit ; titre absent non précisé) | présent (echo, __toString, test null) | présent (« Aucun résultat. ») | absent | non indiquée (bonus) |

Note : la plupart des consignes ne nomment pas catalogue.php ; le fichier n'est déduit que des repères `// === … ===` du squelette. Cette déduction est comptée comme présente, voir remarque 10.

## Budget
- tronc commun : 0 durée renseignée sur 10 exercices, somme non calculable (ex. 396b8ed8 = absent, … tp2-ex8 = absent)
- budget TP : 1 × 180 − 20 = 160 min (hypothèse validée par l'utilisateur, courseIntroMinutes absent en base) ; plage 80–100 % = 128 à 160 min
- pourcentage : non calculable (somme absente)
- bonus (hors budget) : tp2-bonus-1 et tp2-bonus-2, durées non indiquées ; mention « bonus » présente (section « Pour aller plus loin », texte « À faire si vous avez fini avant la fin de la séance »), donc pas de remarque de budget
- information : le champ `totalDuration` de la section vaut 1, unité non documentée, et ne donne pas de durée par exercice ; il n'a pas été utilisé.

## Remarques
| # | id du bloc | Gravité | Champ | Passage concerné | Proposition |
|---|---|---|---|---|---|
| 1 | tp2-ex3 | BLOQUANT | 6 Validation | consigne ex3 : aucun critère de réussite | ajouter, par ex. « `echo new Artist('SSH');` affiche `SSH` » |
| 2 | tp2-ex4 | BLOQUANT | 6 Validation | consigne ex4 : aucun critère | ajouter, par ex. « `echo` d'un Album (Rootkit) affiche `Rootkit (2019) — SSH` » |
| 3 | b2495668-7d7e-49d4-8db3-a1f230870b4e | BLOQUANT | 6 Validation | consigne : aucun critère | ajouter, par ex. « après un ajout, `count($ssh->getAlbums())` affiche 1 » |
| 4 | 396b8ed8, 89aefd4b, tp2-ex1, tp2-ex2, tp2-ex3, tp2-ex4, b2495668, tp2-ex5, tp2-ex7, tp2-ex8 | MAJEUR | Durée | aucune durée dans le contenu (somme incomplète) | indiquer une durée par exercice, puis recalculer la somme contre la plage 128–160 min |
| 5 | tp2-ex1 | MAJEUR | 1 Fichier | consigne sans fichier ni repère | nommer `catalogue.php` dans la consigne |
| 6 | b2495668-7d7e-49d4-8db3-a1f230870b4e | MAJEUR | 1 Fichier | consigne sans fichier ni repère | nommer le fichier des classes |
| 7 | tp2-ex7 | MAJEUR | 1 Fichier | consigne sans fichier ni repère | nommer `catalogue.php` |
| 8 | tp2-ex7 (tp2-ex7-2) | MAJEUR | 4 API | deux versions du même item : `text` (`??` puis `in_array`) et `content` (`isset()` puis `??`) | ne conserver qu'une version |
| 9 | tp2-ex4 (tp2-ex4-2) | MAJEUR | 2 Noms | « Les getters du titre, de l'année et de l'artiste » sans noms ni noms des propriétés ; `getTitle`, `getYear`, `getArtist` n'apparaissent qu'en ex7 | imposer les noms des propriétés et des getters |
| 10 | tp2-ex3, tp2-ex4 | MAJEUR | 1 Fichier | le brief indique `entities/Album.php` et `entities/Artist.php`, le TP place les classes dans `catalogue.php` sous `// === Classes ===` | aligner le brief et le TP |
| 11 | tp2-bonus-1 | MAJEUR | 6 Validation | bonus : aucun critère | ajouter, par ex. « `Rootkit (2019) — SSH (Nouveau)` apparaît, `Couche 7` sans mention » |
| 12 | tp2-bonus-2 | MAJEUR | 6 Validation | bonus : aucun critère | ajouter, par ex. « `chercherAlbum($albums, 'Rootkit')` affiche `Rootkit (2019) — SSH` ; titre absent affiche `Aucun résultat.` » |
| 13 | tp2-bonus-1, tp2-bonus-2 | MAJEUR | 1 Fichier | bonus : fichier non nommé | nommer `catalogue.php` |
| 14 | 89aefd4b, tp2-ex2, tp2-ex3, tp2-ex4, tp2-ex5, tp2-ex8 | MINEUR | 1 Fichier | fichier seulement implicite par les repères | nommer le fichier dans chaque consigne |
| 15 | tp2-ex4 | MINEUR | structure | numérotation 1, 2, 4 (pas de 3) | vérifier qu'une étape n'a pas été supprimée |
| 16 | tp2-ex6 (absent de l'export) | MINEUR | structure | pas de tp2-ex6 ; bonus-1 renvoie à « l'exercice 7 » | confirmer la numérotation (tp2-ex6 n'est pas dans la liste attendue) |
| 17 | bloc 9cb54dfa-b85b-453a-bc13-216ddf59ac10 (dans b2495668) | MINEUR | — | bloc texte vide | supprimer le bloc |
| 18 | tp2-ex… 396b8ed8 (lien pochettes-tp2.zip) | MINEUR | — | fichiers téléchargeables non exportables (limite de l'export) ; squelette présent | vérifier côté prod que l'archive existe (non vérifié) |

## Définition de terminé
- ✔ grille complète, chaque exercice et bonus × 6 champs : 12 lignes sur 12 (10 tronc + 2 bonus), 6 cases chacune renseignées, plus la colonne durée
- ✘ somme des durées et pourcentage du budget : non calculés, aucune durée renseignée (0 sur 10 exercices du tronc commun) ; plage attendue 128–160 min, budget 160 min. Rapport incomplet tant que les durées ne sont pas fournies.



---

## PHP 2 — étudiant fragile cours

# Étudiant fragile : php/2-programmation-orientee-objet — cours, mode lecture
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-2-programmation-orientee-objet-20261027-094328, dossier /work/fragile-cours

## Liste de tâches
- [x] assoc-cles-code exécuté : `California saumon avocat12`, conforme
- [x] assoc-modif-code exécuté : `Non renseigné.`, conforme
- [x] 4c8a3bf2 (`??`) exécuté : `0`, conforme
- [x] assoc-foreach-code exécuté : conforme
- [x] assoc-catalogue-code exécuté : conforme (une ligne `<li>` par sushi)
- [x] tri-fn-code exécuté : `bool(true)`, conforme
- [x] tri-usort-code exécuté : `Maki concombre`, conforme
- [x] tri-filter-code exécuté : `2`, conforme
- [x] cls-declarer-code : classe écrite, mais le bloc ne contient aucun `new` et n'affiche rien (voir remarques 3 et 4)
- [x] cls-constructeur-code exécuté : `12`, et `TypeError` obtenue avec `"douze"`, conforme
- [x] cls-promues-code exécuté : NON conforme (`string(7)` au lieu de `string(6)`)
- [x] cls-methodes-code exécuté : `bool(false)` puis `900`, conforme
- [x] enc-private-code exécuté : erreur obtenue, message légèrement différent
- [x] enc-getters-code exécuté : conforme
- [x] enc-composition-code exécuté : `Akira`, conforme
- [x] fonctions-table : `array_keys`, `array_map`, `in_array` exécutés, conformes
- [x] Variante prédite puis comparée : filtre `> 10` sur le catalogue. Prédiction : clés `0,2`, et `$r[0]` fonctionne. Résultat identique.
- [x] Variante prédite puis comparée : `isset` sur une clé valant `null`. Prédiction `false`, et `??` donne la valeur par défaut. Résultat identique.
- [x] Variante prédite puis comparée : `$temps` sans `$this`. Prédiction : le Warning, résultat `false`, comme annoncé par cls-methodes-callout-txt. Résultat réel : `true` (voir remarque 1).
- [x] Callout `tri-usort-callout-txt` reproduit : `$t = usort(...)` donne `1`, conforme
- [x] Callout `assoc-modif-callout-txt` reproduit : `Warning: Undefined array key "tmps"` et la page continue, conforme
- [x] Callout `cls-methodes-callout-txt` reproduit : Warning conforme, conséquence annoncée fausse
- [x] Callout `tri-filter-callout-txt` : les indices survivent (`0,2`), conforme
- [x] Bilan des 5 notions du brief

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu | Proposition |
|---|---|---|---|---|---|---|
| 1 | cls-methodes-callout-txt | MAJEUR (mauvaise prédiction) | « la comparaison part sur une valeur nulle, donc le résultat est faux » | Rien à deviner, mais c'est faux : `null < 10` vaut `true`. Ma variante `return $temps < 10;` a donné `bool(true)` pour un nigiri de 15 min. | 3 min | Écrire « le résultat est faux sans que la page plante » → « le résultat est faux (ici `true` alors que le sushi dure 15 min), sans que la page plante ». |
| 2 | cls-promues-res | BLOQUANT (l'exemple ne produit pas le résultat annoncé) | « `string(6) "flambé"` » | Le vrai résultat est `string(7) "flambé"` : `var_dump` compte les octets et `é` en fait 2. Un étudiant croit avoir fait une faute. | 2 min | Corriger en `string(7)`, ou remplacer « flambé » par « grillé » (ou « braisé ») qui ne contient pas d'accent, ou ajouter une note sur l'UTF-8. |
| 3 | cls-declarer-txt / cls-declarer-code | MAJEUR (terme avant définition) | « `new` fabrique un objet, la flèche `->` accède à ses propriétés » | Le bloc de code ne montre ni `new` ni `->`. Les getters utilisent `$this`, défini seulement dans cls-methodes-txt. `private` et `public` sont employés dans cls-declarer-code ; ils ne sont expliqués qu'en enc-intro et enc-private-txt. J'ai testé `new Sushi()` : `Error: Typed property Sushi::$temps must not be accessed before initialization`. Le texte ne dit pas que cette classe est inutilisable en l'état. | 4 min | Dire en une phrase ce que sont `private` (inaccessible de l'extérieur) et `$this` (l'objet courant) dès cls-declarer. Préciser que cet exemple est volontairement incomplet jusqu'au constructeur. |
| 4 | cls-declarer-res | MINEUR | « Les propriétés de l'objet sont `private` : le code extérieur ne peut pas les lire directement » | `->` est annoncé comme servant à accéder aux propriétés, mais le cours n'en montre l'usage (`$california->nom`) que dans enc-private-code, où ça échoue. | 1 min | Ajouter un exemple de `->` sur une méthode dès cls-constructeur (déjà fait par `$california->getTemps()`) et le dire. |
| 5 | enc-private-res | MAJEUR (message d'erreur cité différent du réel) | « arrête la page sur `Fatal error: Cannot access private property Sushi::$nom` » | Message réel : `PHP Fatal error:  Uncaught Error: Cannot access private property Sushi::$nom in …:7` avec une stack trace. Le tableau de transition dit `Error`, ce qui est cohérent. | 1 min | Citer « Fatal error: Uncaught Error: Cannot access private property Sushi::$nom ». |
| 6 | tri-intro / tri-filter-code / fonctions-table | MAJEUR (termes non définis) | `var_dump` (tri-fn-code), `count`, `implode` | `var_dump` et `count` sont utilisés sans définition. Ils ne figurent pas dans la liste de la section 1 fournie. `var_dump` est la seule façon de voir `NULL` ou `bool` ; j'ai compris leur effet par le résultat annoncé. | 2 min | Ajouter une ligne « `var_dump` affiche le type et la valeur » et « `count` compte les éléments » dans la table des fonctions. |
| 7 | 7d82d26c / 52073bb7 | MINEUR | « C'est un raccourci pour `isset(...) ? ... : 0` » | L'opérateur ternaire `? :` n'est pas dans le curriculum. Je l'ai pris comme pseudo-code. | 1 min | Dire « comme un if/else » ou introduire le ternaire. |
| 8 | assoc-modif-callout-txt | MINEUR | « le pendant exact du `$nom` entre guillemets simples de la section 1 » | Je ne vois pas ce renvoi dans ce que je sais de la section 1. | 1 min | Rappeler le cas en une demi-phrase. |
| 9 | tri-usort-txt | MINEUR | « renvoie un nombre négatif... L'opérateur `<=>` produit exactement ce nombre » | `<=>` n'est pas défini : son rôle se déduit seulement du contexte. Les noms `$a` et `$b` ne sont pas expliqués. | 1 min | Une phrase : « `<=>` compare deux valeurs et rend -1, 0 ou 1 ». |
| 10 | enc-getters-res, assoc-modif-res | MINEUR | « la question que pose la moitié de la promo », « neuf fois sur dix » | Formules de remplissage sans information. | 0,5 min | Les supprimer ou les chiffrer. |
| 11 | tri-filter-callout-txt | MINEUR | « `$rapides[1]` peut alors échouer » | Avec l'exemple du cours (filtre `< 15`), les clés sont 0 et 1 et `$rapides[1]` fonctionne. Le callout n'est pas illustré. J'ai dû inventer le filtre `> 10` (clés 0 et 2) pour voir le trou. | 2 min | Donner dans le callout un exemple chiffré avec ses clés. |
| 12 | fonctions-lien | MINEUR | « `array_filter` prend le tableau en premier, `array_map` prend la fonction » | Cohérent avec ce que j'ai écrit, mais la table n'indique pas l'ordre des arguments de `usort`. | 0,5 min | Hors sujet pour la section ; à garder tel quel. |

## Temps (barème fixe)
| Exercice ou partie | Détail du calcul | Total | Démarrage | Statut |
|---|---|---|---|---|
| Lecture du cours | prose environ 2800 mots = 14 min ; code environ 330 lignes à 6 s = 33 min | 47 min | sans objet | fini |
Temps de lecture du cours : 47 min (hors exécution)

## Bilan des notions du brief (mode lecture)
| Notion | À quoi elle sert (source) | Utilisation (mini-exemple exécuté) | Résultat |
|---|---|---|---|
| Tableaux associatifs | Nommer chaque case par une clé au lieu d'un indice (assoc-intro, assoc-cles-txt) | `$s=["nom"=>"Maki","temps"=>8,"note"=>null]; isset($s["note"])` donne `false`, `$s["note"] ?? "aucune"` donne `"aucune"`, `$p[]=5` donne la clé 0 (fichier v1.php) | oui |
| Tri et filtre de tableaux | Ordonner avec `usort` et `fn` ; garder certains éléments avec `array_filter` (tri-usort-txt, tri-filter-txt) | filtre `temps > 10` donne les clés `0,2`, et `$r[0]` existe (a8.php) ; `array_map` et `array_keys` (d1.php) | oui (réserve : remarque 11 sur l'illustration du trou d'indices) |
| Classes et objets | La classe est le plan, `new` fabrique un objet, les méthodes portent le comportement (cls-declarer-txt, cls-methodes-txt) | `estRapide()` et la méthode de test avec `$temps` sans `$this` (c4.php) | partiellement : `$this` et `private` utilisés avant leur définition (remarque 3) |
| Constructeur à propriétés promues | Déclarer et initialiser les propriétés dans les paramètres du constructeur (cls-promues-txt) | `new Sushi("A",12,4.5)` et `new Sushi("B",15,4.8,"flambé")` (c3.php) | oui, avec l'écart `string(7)` de la remarque 2 |
| Encapsulation (propriétés privées, getters) | Garder le contrôle des données et exposer des méthodes (enc-intro, enc-getters-res) | accès direct `->nom` refusé par `Error`, `getChef()->getNom()` fonctionne (c5.php, c6.php) | oui |

## Définition de terminé
- ✔ mode lecture : chaque exemple exécuté (15 sur 15), chaque variante prédite puis comparée (3 sur 3, dont 1 mauvaise prédiction due au cours), bilan rempli (5 sur 5)
- ✘ mode exécution : sans objet
- ✔ chaque étape du journal cite sa source (28 étapes, 28 sourcées, 0 devinée ; les cas de variantes sont rattachés à leurs blocs)
- ✔ aucun fichier hors /work/fragile-cours. Sortie de `ls /work` : `depart fournis fragile-cours fragile-tp rapide supports`

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | `a1.php` : tableau `$sushi` et deux `echo` | assoc-cles-code | conforme |
| 2 | `a2.php` : ajout de `chef`, écrasement de `temps`, `isset` | assoc-modif-code | `Non renseigné.` |
| 3 | `a2b.php` : lecture de la clé `tmps` | assoc-modif-callout-txt | `PHP Warning: Undefined array key "tmps"`, la suite s'exécute |
| 4 | `a3.php` : opérateur `??` | 4c8a3bf2 | `0` |
| 5 | `a4.php` : `foreach` avec `$cle => $valeur` | assoc-foreach-code | conforme |
| 6 | `a5.php` : catalogue avec `{$sushi['nom']}` | assoc-catalogue-code | conforme |
| 7 | `a6.php` : `function` et `fn` | tri-fn-code | `bool(true)` |
| 8 | `a7.php` : `usort` avec `<=>` | tri-usort-code | `Maki concombre` |
| 9 | `a7.php` : `$t = usort(...)` | tri-usort-callout-txt | `1` |
| 10 | `a8.php` : `array_filter` puis `count` | tri-filter-code | `2` |
| 11 | `a8.php` : variante `> 10`, clés puis `$r[0]` | tri-filter-callout-txt | clés `0,2` |
| 12 | `c1.php` : classe sans constructeur, `new Sushi()` | cls-declarer-code | `Error` : propriété typée non initialisée |
| 13 | `c2.php` : constructeur classique, `getTemps()` | cls-constructeur-code | `12` |
| 14 | `c2.php` : `new Sushi("California","douze")` | cls-constructeur-res | `TypeError`, conforme |
| 15 | `c3.php` : propriétés promues, `?string`, `var_dump` | cls-promues-code | `4.5NULL string(7) "flambé"` (écart avec string(6)) |
| 16 | `c4.php` : `estRapide` et `tempsEnSecondes` | cls-methodes-code | `bool(false)` puis `900` |
| 17 | `c4.php` : méthode avec `$temps` sans `$this` | cls-methodes-callout-txt | Warning ; résultat `true` |
| 18 | `c5.php` : lecture de `$california->nom` | enc-private-code | Fatal error, Uncaught Error |
| 19 | `c2.php` (getters) et `c3.php` | enc-getters-code | conforme |
| 20 | `c6.php` : objet `Chef` dans `Sushi` | enc-composition-code | `Akira` |
| 21 | `d1.php` : `array_keys`, `array_map`, `in_array` | fonctions-table | conforme |
| 22 | `v1.php` : `isset` sur une clé nulle | assoc-modif-res | `false` |
| 23 | `v1.php` : `$p[] = 5` | curriculum:section 1:« Tableaux indexés » | clé 0 ajoutée |
| 24 | Création de gen.sh pour écrire les fichiers | consigne de l'orchestrateur | ok (première tentative refusée par la garde : `cd /work` obligatoire) |
| 25 | Lancement `sh gen.sh` dans le conteneur | consigne de l'orchestrateur | ok |
| 26 | Choix du filtre `> 10` pour la variante | tri-filter-callout-txt | ok |
| 27 | Lecture du cours | consigne de l'orchestrateur | ok |
| 28 | `ls /work` | consigne de l'orchestrateur | ok |


---

## PHP 2 — étudiant fragile TP

# Étudiant fragile : php/2-programmation-orientee-objet — TP, mode exécution
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-2-programmation-orientee-objet-20261027-094328, dossier /work/fragile-tp

Résultat : toutes les étapes du tronc commun sont faites. Les bonus ne sont pas faits (non demandés). Fichier produit : /work/fragile-tp/catalogue.php, avec les pochettes dans /work/fragile-tp/pochettes/. Il est servi par `php -S localhost:8000`. Capture PNG : /work/rendu.png (état `?tri=annee&sens=desc`). Le serveur woody et public_html ne sont pas disponibles (limite d'environnement). Les étapes « créer ~/public_html/TP2 » et « télécharger » ont été remplacées par une copie depuis /work/fournis.

Vérifications faites avec rendu-html :
- Tableau 1 : 4 artistes.
- Tableau 2 (`$recents`) : Couche 7 (2015), Trop bool (2018), Rootkit (2019), dans cet ordre.
- Tableau 3 avec `?tri=annee&sens=desc` : 6 lignes, de Rootkit 2019 à I Queried a View 2008, l'entête affiche « Année ▼ ».
- Ligne « Le plus récent : Rootkit (2019) ».
- Liste : SSH : 2, Maitre Git : 2, Katy Query : 1, Loopal : 1.
- `?tri=nimportequoi` : aucun Warning ni Error, tri par titre ▲.
- `php -l` ne signale aucune erreur.
- Je n'ai pas vérifié visuellement que chaque pochette correspond à son titre (je ne vois pas le PNG). L'orchestrateur doit regarder /work/rendu.png.

## Liste de tâches
- [x] Tableau des artistes (étapes 1-3) : fait
- [x] Un album en tableau associatif (étapes 1-3) : fait
- [x] Le catalogue complet : fait
- [x] Trier et filtrer : fait
- [x] La classe Artist : faite
- [x] La classe Album : faite, avec des méthodes devinées (remarques 1 et 2)
- [x] Le lien Album et Artist : fait
- [x] Construire le catalogue : fait
- [x] Un tableau triable par colonne : fait
- [x] Des statistiques : fait
- [ ] Bonus : non demandés

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp2-ex4-2 | BLOQUANT (réussi seulement par déduction) | « Complétez la classe `Album` avec les méthodes suivantes : » | La liste est vide, ni dans le TP ni dans le cours (export aplati). J'ai déduit `getTitle`, `getYear`, `getArtist` et `getCoverUrl()` d'ex5-6 et d'ex7-1. J'ai inventé `getCover()` (nom du fichier). Je n'ai aucune indication sur le contenu de `getCoverUrl()`. | 3 min d'hésitation + 1 min de recherche | Rétablir la liste : `getTitle(): string`, `getYear(): int`, `getArtist(): Artist`, `getCover(): string`, `getCoverUrl(): string` (BASE_URL + fichier). |
| 2 | tp2-ex4-1 | MAJEUR | « une constante publique `BASE_URL` contenant le chemin relatif du dossier des pochettes » | Le cours ne parle ni de `const`, ni de `self::`, ni de `Classe::CONST`. J'ai deviné `public const BASE_URL = 'pochettes/'` (slash final) et `self::BASE_URL . $this->cover`. | 3 min + 1 min (terme non défini) | Ajouter au cours un bloc sur `const` et `self::`, ou donner la ligne en exemple. Dire explicitement « avec un `/` final ». |
| 3 | 4333ab96 / tp2-ex5-2 | MINEUR | « `echo $ssh;` : la page affiche `SSH` » | Il faut avoir fait `__toString` en ex3-3 (ça marche), mais ces `echo` « puis retirez » ralentissent. Rien de gênant sinon. | 0 | RAS. |
| 4 | squelette / tp2-ex2-1 | MINEUR | Repères `// === Traitement ===` et `// === Données ===` | Le squelette contient `// === Traitement (tri, filtre, statistiques) ===`, légèrement différent de ce que cite le TP. Il n'y a pas de repère `// === Fonctions ===` : j'ai mis `valeurPour` sous Traitement. | 1 min | Aligner la formulation. |
| 5 | c20fcb95 / cd4ba9d5 / tp2-ex1-list | MINEUR | Blocs de code vides dans l'export (« 📎 catalogue.php » sans contenu) | Rien de bloquant : j'ai lu le fichier fourni. | 0 | Signaler que l'export est tronqué. |
| 6 | tp2-ex2-3 | MINEUR | « Affichez `$recents` à la place du catalogue complet » | Le tableau 2 doit-il être remplacé, ou faut-il garder une copie du catalogue complet ? J'ai remplacé la boucle de `$albums` dans le tableau 2. | 1 min | Préciser « dans le deuxième tableau ». |
| 7 | tp2-ex7-5 | MINEUR | « parcourez le résultat trié et remplacez son `<thead>` » | « Son » est ambigu. J'ai pris le thead du tableau des objets (le troisième). | 1 min | Écrire « le `<thead>` du tableau des objets ». |
| 8 | tp2-ex7-3 | MINEUR | « inversez le résultat de la comparaison » | Je n'ai pas deviné : j'ai utilisé `-$r`, par déduction du cours (`<=>` donne un nombre, tri-usort-txt). Un `use ($colonne, $sens)` a été nécessaire, alors que le cours n'enseigne que `fn`, qui voit les variables extérieures. | 1 min | Suggérer `fn` ou donner l'indice sur `use`. |
| 9 | tp2-ex7-1 | MINEUR | `match` | Le cours fourni ne couvre pas la syntaxe `match`. Je l'ai prise dans le curriculum section 1 (« if/elseif/else, switch, match »). | 0 | RAS. |

## Temps (barème fixe)
Les temps d'écriture sont regroupés par exercice. L'ordre de grandeur est approximatif, car j'ai écrit le fichier en un seul bloc.
| Exercice | Détail du calcul | Total | Démarrage | Statut |
|---|---|---|---|---|
| Tableau des artistes + album assoc. | lecture ~400 mots = 2 min ; ~25 lignes écrites = 12,5 min ; 3 commandes = 1 min ; exécution 10 s ; vérification 1 min | 17 min | 1 min | fini |
| Catalogue complet + trier/filtrer | lecture ~250 mots = 2 min ; ~20 lignes = 10 min ; vérification 1 min | 13 min | 1 min | fini |
| Artist + Album + lien | lecture ~400 mots = 2 min ; ~60 lignes = 30 min ; hésitation (rem. 1 et 2) 6 min ; recherche 2 min ; terme non défini 1 min | 41 min | 1 min | fini |
| Construire le catalogue | lecture ~400 mots = 2 min ; ~30 lignes = 15 min ; vérification 1 min | 18 min | 1 min | fini |
| Triable par colonne | lecture ~500 mots = 3 min ; recopie du thead 6 lignes = 1 min ; ~25 lignes = 12,5 min ; hésitation (rem. 7, 8) 6 min ; vérification 1 min | 24 min | 1 min | fini |
| Statistiques | lecture ~200 mots = 1 min ; ~15 lignes = 7,5 min ; vérification 30 s | 9 min | 1 min | fini |
Total tronc commun : environ 122 min (budget 160 min). Aucun démarrage > 2 min.

## Bilan des notions du brief (mode lecture)
Non applicable (mode exécution).

## Définition de terminé
- ✔ mode exécution : chaque exercice mené au bout (10 sur 10), temps calculé par exercice (6 groupes sur 6 groupes)
- ✘ étapes sourcées : voir le journal. 26 étapes, 22 sourcées, 4 devinées (remarques 1 et 2). Pas de blocage complet, mais le contenu de `Album` repose sur des devinettes, donc rapport « terminé » avec réserve.
- ✔ sortie de `ls /work` : depart fournis fragile-cours fragile-tp rapide rendu.png supports. Le fichier rendu.png vient de rendu-html. Rien de laissé hors /work.

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | Copie de catalogue.php et des pochettes vers /work/fragile-tp/ et pochettes/ | b89cf4cc | ok |
| 2 | `$artistes` tableau indexé de 4 chaînes | 06a51ce7 | ok |
| 3 | `foreach` dans le tableau 1 | 12aa2c8e, curriculum:section 1:« foreach » | 4 lignes |
| 4 | `$album` assoc. (titre, annee, artiste, pochette) | 7c3036e2, assoc-cles-code | ok |
| 5 | `$albums = []` puis `$albums[] = …` | 59e484da, curriculum:section 1:« Tableaux indexés » | ok |
| 6 | Ligne `<tr>` avec img, largeur 96, alt | 394205d5 | ok |
| 7 | Cinq autres albums, boucle sur 6 lignes | tp2-ex1-2, tp2-ex1-3, assoc-catalogue-code | ok |
| 8 | `usort` sur `annee` | tp2-ex2-1, tri-usort-code | ok |
| 9 | `array_filter` avec `fn`, `> 2014` | tp2-ex2-2, tri-filter-code | ok |
| 10 | Affichage de `$recents`, ordre 2015, 2018, 2019 | tp2-ex2-3 | ok |
| 11 | Classe `Artist`, propriété promue `name` | tp2-ex3-1, cls-promues-code | ok |
| 12 | `getName()` | tp2-ex3-2, enc-getters-code | ok |
| 13 | `__toString()` | 865e4be2 | `echo $ssh` affiche `SSH` |
| 14 | Classe `Album` : 4 propriétés promues | tp2-ex4-1, cls-promues-code, enc-composition-code | ok |
| 15 | `public const BASE_URL = 'pochettes/'` | aucune source (rem. 2) | compile |
| 16 | `self::BASE_URL . $this->cover` | aucune source (rem. 2) | compile |
| 17 | `getTitle`, `getYear`, `getArtist` | tp2-ex7-1, tp2-ex5-2 (déduction) | ok |
| 18 | `getCover()` et `getCoverUrl()` : contenu inventé | aucune source (rem. 1) | ok |
| 19 | `Album::__toString` | tp2-ex4-4 | `Rootkit (2019) — SSH` |
| 20 | `Artist` : `array $albums = []`, `getAlbums`, `ajouterAlbum` | 83f0e431, 32915758, e7ca00cc | ok |
| 21 | 4 objets Artist, 6 Album, `$albumsObjets` | tp2-ex5-1, tp2-ex5-2, enc-composition-code | ok |
| 22 | 6 appels à `ajouterAlbum` | 4333ab96 | 2, 2, 1, 1 |
| 23 | Tableau 3 avec getters | tp2-ex5-4 | 6 lignes |
| 24 | `valeurPour` avec `match`, `??`, `in_array`, `usort` sur une copie avec inversion | tp2-ex7-1, 7-2, 7-3, curriculum:section 1:« match », assoc `??` | `?tri=nimportequoi` sans erreur |
| 25 | thead fourni recopié | tp2-ex7-5 | ok |
| 26 | `albumLePlusRecent` (boucle, sans `max`), `<ul>` avec `count(getAlbums())` | tp2-ex8-1, tp2-ex8-3 | ok |



---

## PHP 2 — étudiant rapide TP

# Étudiant rapide : php/2-programmation-orientee-objet — TP
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-2-programmation-orientee-objet-20261027-094328, dossier /work/rapide

Fichier produit : `/work/rapide/catalogue.php`, plus `/work/rapide/pochettes/`. Le serveur `php -S` n'a pas été lancé. J'ai exécuté la page en ligne de commande avec `php -r 'include ...'` et des `$_GET` simulés (limite d'environnement : woody et public_html indisponibles).

## Liste de tâches
- [x] ex-1 Le tableau des artistes
- [x] ex-2 Un album en tableau associatif
- [x] ex-3 Le catalogue complet (`tp2-ex1`)
- [x] ex-4 Trier et filtrer (`tp2-ex2`)
- [x] ex-5 La classe Artist (`tp2-ex3`)
- [x] ex-6 La classe Album (`tp2-ex4`)
- [x] ex-7 Le lien Album et Artist
- [x] ex-8 Construire le catalogue (`tp2-ex5`)
- [x] ex-9 Un tableau triable par colonne (`tp2-ex7`)
- [x] ex-10 Des statistiques (`tp2-ex8`)
- [x] bonus-1 `estRecent()` et « (Nouveau) »
- [x] bonus-2 `chercherAlbum`
- [x] temps restant
- [x] bilan des bonus

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | `tp2-ex4-2` (et `tp2-ex4-list`) | Blocage tronc commun, contourné en devinant | « Complétez la classe `Album` avec les méthodes suivantes : » | La liste ou le tableau des méthodes est vide dans l'export. J'ai déduit `getTitle`, `getYear`, `getArtist`, `getCoverUrl` de `tp2-ex5-2` et `tp2-ex7-1`. J'ai inventé `getCover()` et la construction de l'URL (`BASE_URL` concaténée au nom du fichier). | 1 min | Réintégrer la liste des signatures dans le bloc, avec ce que renvoie `getCoverUrl()`. |
| 2 | `tp2-ex7-1` | BLOQUANT (tronc commun) | « Utilisez `match` » | `match` n'est ni dans le cours ni dans le curriculum. J'ai deviné la syntaxe `match(...) { "x" => ... }`. | 1 min | Ajouter `match` au cours, ou demander un `if` ou un `switch`. |
| 3 | `tp2-ex4-1` | BLOQUANT (tronc commun) | « constante publique `BASE_URL` » | `const` dans une classe et `self::BASE_URL` ne sont pas enseignés. Le type de retour `string\|int` de `tp2-ex7-1` ne l'est pas non plus. | 1 min | Ajouter un bloc de cours sur `public const` et `self::`, et signaler l'union de types. |
| 4 | `tp2-bonus-1` | MINEUR, redondant | « Ajoutez `estRecent(): bool` … » | Rien. Ce bonus reprend un getter-prédicat comme `estRapide()` (cours `cls-methodes-code`) et un `if` dans une cellule. | 0 | Le fusionner avec un exercice utile, ou le remplacer par une vraie extension (par exemple un filtre `?artiste=`). |
| 5 | `tp2-bonus-2` | MINEUR, redondant | « Écrivez `chercherAlbum(...)` » | Rien. C'est la même boucle que `albumLePlusRecent` (`tp2-ex8-1`), avec `?Album` vu au cours (`cls-promues-res`). Durée : 4 min. | 0 | À enrichir : recherche partielle, ou plusieurs résultats. |
| 6 | `tp2-bonus` (les deux) | MAJEUR | « À faire si vous avez fini avant la fin de la séance » | Le temps restant est de 85 min. Les bonus en prennent 6, donc 79 min restent non occupées (plus de 10 min). | 79 min non occupées | Ajouter 3 ou 4 bonus de 15 à 20 min chacun, avec les seules notions enseignées. Exemples : tri sur deux clés, filtre par artiste via `$_GET`, page des artistes avec leurs albums, affichage de la moyenne d'années par artiste. |
| 7 | `tp2-ex7` | Observation | « Triez une copie … `usort` … si `$sens` vaut `'desc'`, inversez » | La consigne pousse vers une fonction anonyme qui capture `$colonne` et `$sens`. Le cours (`tri-fn-txt`) dit que `fn` voit les variables extérieures. J'ai écrit `function ... use (...)`, ce que le cours n'enseigne pas. Un `fn` en une expression aurait suffi. | 0 | Préciser dans la consigne « avec `fn` ». |
| 8 | `tp2-intro` / squelette | Observation | Repère `// === Traitement ===` | Le squelette fourni porte `// === Traitement (tri, filtre, statistiques) ===`. | 0 | Aligner le libellé du repère. |
| 9 | `tp2-ex7-5` | Observation | « remplacez son `<thead>` par celui fourni » | Le `<thead>` fourni lit `$colonne` et `$sens` avec des guillemets simples. Il fonctionne tel quel. | 0 | Rien à corriger. |

Les remarques 1 à 3 touchent le tronc commun. Elles ne m'ont pas empêché d'atteindre les bonus, mais elles m'ont obligé à deviner.

## Temps (barème fixe)
| Exercice ou bonus | Détail du calcul | Total | Statut |
|---|---|---|---|
| Lecture TP | ≈ 1 700 mots de prose ÷ 350 = 4,9 min | 5 min | fait |
| Lecture cours | ≈ 2 300 mots de prose ÷ 350 = 6,6 min, plus ≈ 330 lignes de code × 2 s = 11 min | 18 min | fait |
| ex-1 | 6 lignes × 12 s + 3 commandes × 8 s + 10 s d'exécution + 10 s de vérification = 116 s | 2 min | OK |
| ex-2 | 10 lignes × 12 s + 30 s | 3 min | OK |
| ex-3 | 13 lignes × 12 s + 30 s | 3 min | OK |
| ex-4 | 8 lignes × 12 s + 30 s | 2 min | OK |
| ex-5 | 14 lignes × 12 s + 30 s | 4 min | OK |
| ex-6 | 35 lignes × 12 s = 420 s + 30 s | 8 min | OK, 2 étapes devinées |
| ex-7 | 8 lignes × 12 s + 30 s | 2 min | OK |
| ex-8 | 35 lignes × 12 s + 2 commandes × 8 s + 30 s | 8 min | OK |
| ex-9 | 31 lignes × 12 s + 8 lignes recopiées × 4 s + 30 s d'erreur + 30 s | 8 min | OK, 1 étape devinée |
| ex-10 | 20 lignes × 12 s + 30 s | 5 min | OK |
| Retours au cours | 12 recherches × 20 s | 4 min | fait |
| Étapes devinées | 3 occurrences (remarques 1, 2, 3) × 1 min | 3 min | fait |
| bonus-1 | 6 lignes × 12 s + 10 s de lecture + 10 s de vérification | 2 min | OK |
| bonus-2 | 14 lignes × 12 s + 30 s | 4 min | OK |

Tronc commun : 5 + 18 + 2 + 3 + 3 + 2 + 4 + 8 + 2 + 8 + 8 + 5 + 4 + 3 = 75 min. Budget TP : 160 min. Temps restant : 85 min.
Bonus : 2 + 4 = 6 min → occupent le temps restant : non (écart de 79 min).

## Bilan des bonus
| Bonus | Notions utilisées (source) | Notion non enseignée ? | Résultat face à l'annoncé |
|---|---|---|---|
| bonus-1 | Méthode booléenne (`cls-methodes-code`) ; accès via `$this` (`cls-methodes-callout`) ; `if` (curriculum:section 1:« contrôle ») | Non | Conforme. Avec `?tri=annee`, « (Nouveau) » apparaît sur Trop bool (2018) et Rootkit (2019) uniquement. |
| bonus-2 | `?Album` (`cls-promues-res`) ; boucle (curriculum:section 1:« boucles ») ; `__toString` (`tp2-ex3`, bloc `865e4be2`) ; `null` | Non | Conforme. La sortie est `Rootkit (2019) — SSH`, puis `Aucun résultat.` pour « Inconnu ». |

Conclusion : les bonus s'appuient sur des notions enseignées, mais ils sont trop courts (6 min pour 85 min de temps restant).

## Résultats observés (vérification de l'exécution)
- Aucun Warning ni Fatal sur `?tri=annee`, `?tri=annee&sens=desc` et `?tri=nimportequoi`. Ce dernier se comporte comme l'absence de paramètre : tri par titre croissant.
- Page chargée sans paramètre : 9 balises `<img>`, soit 3 pour le tableau des récents et 6 pour le tableau d'objets.
- Tableau des artistes : 4 lignes.
- `$recents` : Couche 7, Trop bool, Rootkit, dans cet ordre.
- Tri `annee` croissant : 2008, 2013, 2013, 2015, 2018, 2019. En `desc`, l'ordre est inversé.
- Statistiques : SSH 2, Maitre Git 2, Katy Query 1, Loopal 1. Le plus récent est Rootkit (2019).

## Définition de terminé
- ✔ tout le TP terminé, bonus compris : 10 exercices sur 10, 2 bonus sur 2. Trois blocages signalés (remarques 1 à 3), contournés en devinant.
- ✔ temps total et temps restant : 75 min de tronc commun, 160 − 75 = 85 min restantes, 6 min de bonus.
- ✘ chaque bonus vérifié (temps restant occupé, aucune notion non enseignée) : 2 sur 2 sans notion non enseignée, mais le temps restant n'est pas occupé (remarque 6). Critère non satisfait.
- ✔ journal d'étapes sourcé : 24 étapes, 21 sourcées, 3 devinées (remarques 1, 2, 3).
- ✔ aucun fichier de ma part hors de /work/rapide. Sortie de `ls /work` : `depart fournis fragile-cours fragile-tp rapide rendu.png supports`. Le fichier `rendu.png` n'est pas de moi : je n'ai pas lancé `rendu-html` (probablement un autre agent ou l'orchestrateur).

Le rapport est donc terminé, mais un critère est ✘ à cause du temps restant non occupé.

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | Lire le TP et le cours | `tp2-intro`, `poo-intro-txt` | OK |
| 2 | Copier le squelette, copier les pochettes de `/work/fournis/pochettes-tp2/` vers `pochettes/` | `b89cf4cc` | OK (zip remplacé par le dossier fourni : limite d'environnement) |
| 3 | `$artistes` et `foreach` | `06a51ce7`, `12aa2c8e`, curriculum:section 1:« tableaux indexés », « boucles » | OK |
| 4 | `$album` assoc, `$albums[]`, ligne d'affichage | `7c3036e2`, `59e484da`, `394205d5`, `assoc-cles-code` | OK |
| 5 | Interpolation et accès `$a["clé"]` | `assoc-catalogue-res` | OK |
| 6 | Six albums, boucle | `tp2-ex1-2`, `tp2-ex1-3` | OK |
| 7 | `usort` avec `fn` et `<=>` | `tri-usort-code` | OK |
| 8 | `array_filter` > 2014 | `tri-filter-code` | OK |
| 9 | Affichage de `$recents` | `tp2-ex2-3` | OK |
| 10 | Classe `Artist` avec propriété promue | `cls-promues-code`, `tp2-ex3-1` | OK |
| 11 | `getName()` | `enc-getters-code` | OK |
| 12 | `__toString` de `Artist` | `865e4be2` | OK |
| 13 | `Album` : constructeur à propriétés promues | `tp2-ex4-1`, `cls-promues-code` | OK |
| 14 | `const BASE_URL`, `self::BASE_URL` | aucune source | Deviné |
| 15 | Getters de `Album`, `getCoverUrl` (liste de méthodes absente de l'export) | aucune source (déduit de `tp2-ex5-6`) | Deviné |
| 16 | `__toString` de `Album` avec `—` | `tp2-ex4-4`, `3d96bd38` | OK |
| 17 | `private array $albums = []`, `getAlbums`, `ajouterAlbum` | `83f0e431`, `32915758`, `e7ca00cc` | OK |
| 18 | Construction des artistes, des albums et de `$albumsObjets`, appels à `ajouterAlbum` | `tp2-ex5-1`, `tp2-ex5-2`, `4333ab96`, `tp2-ex5-tip-txt` | OK |
| 19 | Tableau d'objets avec `getCoverUrl()` | `tp2-ex5-4` | OK |
| 20 | `valeurPour` avec `match` | aucune source | Deviné |
| 21 | `$_GET` avec `??` et `in_array` | `7d82d26c`, `b3ea04db`, `tp2-ex7-2`, tableau `fonctions-table` | OK |
| 22 | `usort` sur une copie, inversion en `desc` | `tp2-ex7-3`, `tri-usort-res` | OK |
| 23 | `<thead>` fourni, `albumLePlusRecent` sans `max()`, `<ul>` avec `getAlbums()` | `2162c711`, `tp2-ex8-1`, `tp2-ex8-3` | OK |
| 24 | Bonus 1 et 2, vérification par `php -r` avec `$_GET` simulé | `tp2-bonus-1`, `tp2-bonus-2` | OK |



---

## PHP 3 — collecteur

# Fiche de contexte : php/3-structurer-son-code
Statut du rapport : incomplet (critère « budgets calculés » ✘ : courseIntroMinutes absent, voir Signalements)

## Liste de tâches
- [x] 1. list_modules : faite
- [x] 2. get_module (php) : faite
- [x] 3. list_sections (php) : faite
- [x] 4. get_section (3-structurer-son-code) : faite
- [x] 5. get_content cours, TP, slide : faite (3 supports sur 3)
- [ ] 6. get_project_reference : non faite, échec. Deux tentatives, `connect ECONNREFUSED 172.22.0.2:443`. Le dépôt existe (referenceRepo.status = "validated") : il s'agit d'une indisponibilité de connexion, pas d'un dépôt absent.
- [x] 7. export TP précédents (repli) : faite pour les sections 1 et 2, plus get_content du TP de la section 2 pour le squelette et les consignes complètes.
- [x] 8. list_verdicts : faite (sans filtre, puis cours, slide, TP)
- [x] 9. list_exemplars : faite (sans filtre, puis cours, TP, slide) : toujours []
- [x] 10. list_block_types : faite
- [ ] 11. search_content : non faite, aucun point précis à vérifier

## Module
- slug : php ; titre : PHP ; sessionDurationMinutes : 180 (get_module et list_modules) ; sectionCount : 11
- universe : non disponible. php n'a pas de champ `universe` dans list_modules ni dans get_module (la clé est absente de la réponse). Les autres modules (rust, TastyRusty) ne sont pas utilisés ici.
- exampleDomain : « Recettes de cuisine ». Description verbatim : « Petite appli de recettes (Recette, Ingrédient, Auteur), utilisée uniquement pour illustrer le cours — jamais d'albums, d'utilisateurs Onzer ou de catalogue musical dans les exemples. »
- projectSpec (résumé) : nom Onzer, status draft, dépôt de référence https://git.salimkhraimeche.dev/projet/projet-reference-php (validated, non lisible ici).
  - Appli PHP procédurale, une action = un fichier à la racine, pas de contrôleurs.
  - Entités et repositories OO, repository pattern avec Singleton PDO/PostgreSQL, requêtes préparées.
  - Sessions : inscription, connexion, déconnexion, utilisateur/admin.
  - CRUD albums ; création d'artistes seulement ; album lié à un artiste, morceaux (titre + durée) en JSON.
  - Vues en PHP natif, Bootstrap 5.3.8 + Font Awesome, thème sombre, lecteur fixe en bas.
  - Entités : User, Artist, Album.
  - Arborescence prévue : config.php, schema.sql, css/onzer.css, core/ (Repository.php, functions.php), entities/, repositories/, views/ (view_<nom>.php), fichiers d'action à la racine.

## Section
- slug : 3-structurer-son-code ; titre : Structurer son code
- rang : position 2 sur 11 dans l'ordre de list_sections et de sectionSlugs (get_module). Le champ `order` de get_section vaut 3. Incohérence signalée : la section 2 (2-programmation-orientee-objet) est en position 10 du tableau, alors que le fil rouge la place avant la section 3.
- description (get_section) : « Séparer la logique de traitement de l'affichage, et regrouper les fonctions transverses du projet. »
- totalDuration : 1 ; courseIntroMinutes : ABSENT (null dans list_sections et dans get_section)
- brief : présent.
  - objectives (brief.objectives) : [] (vide)
  - objectives (niveau section, get_section) : « Séparer la logique de traitement et l'affichage » ; « Créer un fichier par action et un fichier de vue dédié » ; « Extraire des fonctions utilitaires partagées » ; « Structurer un projet web maintenable »
  - notions (verbatim, 6) : « Séparation logique / affichage » ; « Fonctions utilitaires partagées (render, redirect) » ; « Header et footer partagés (require) » ; « Page statique puis page alimentée par des données » ; « Entités enrichies : id, morceaux, fichier d'avatar » ; « Constante partagée POCHETTES_BASE_URL »
  - filRougeStep (verbatim) : « Les trois pages sans formulaire sont construites en deux temps. D'abord les vues fournies en HTML statique : views/view_index.php (accueil sans menu), views/view_list_albums.php et views/view_player.php. Ensuite avec données : les classes Artist et Album du TP2, rangées dans entities/ et enrichies (id, avatar sur Artist ; id, morceaux titre + durée sur Album ; getCoverUrl() utilise POCHETTES_BASE_URL de core/functions.php), sont instanciées par core/catalog.php fourni (4 artistes, 6 albums, leurs morceaux). list_albums.php prépare les données et délègue à sa vue ; play_track.php affiche un album et un morceau fixés dans le code (Beta, « Laissez compiler »). Enfin header.php, footer.php et player_footer.php sont extraits ; index.php transmet authLayout = false. »
  - filRougeOutcome (verbatim) : « index.php, list_albums.php et play_track.php fonctionnent avec un catalogue en mémoire, sans base de données, sans $_GET et sans session. core/functions.php (render, redirect, POCHETTES_BASE_URL), entities/Artist.php, entities/Album.php, core/catalog.php et les vues header, footer, player_footer, index, list_albums et player existent et sont réutilisés pour la suite. »
  - providedBase (verbatim) : « Les classes Artist et Album du TP2 (le lien Album → Artist reste un objet Artist), core/functions.php, le CSS et les avatars, les pochettes du TP2, core/catalog.php, et les vues statiques index, list_albums et player. »
  - notes (verbatim) : « La lecture des paramètres d'URL et la page 404 sont reportées au TP4 (exercices « Rappel » et « Lire l'URL et répondre 404 »). Pas de show_album.php : le player est la seule page de détail. Le champ de recherche du catalogue est décoratif. »
- curriculum actuel de la section : null (aucun)

## Budgets
- cours + slides : NON CALCULABLE. Champ manquant : courseIntroMinutes (null dans list_sections et get_section). Calcul : courseIntroMinutes = null, donc budget = non calculable.
- TP : NON CALCULABLE. Calcul : totalDuration × sessionDurationMinutes − courseIntroMinutes = 1 × 180 − null. Champ manquant : courseIntroMinutes. Plage 80 à 100 % : non calculable (même cause). Aucune valeur n'a été reprise d'une autre section ni des notes.

## Contenus de la section
| Support | Source | Blocs (get_content, compte récursif) | Exercices / bonus |
|---|---|---|---|
| cours | db | 50 (5 blocs de premier niveau) | — (aucun exercice) |
| TP | db | 80 (10 blocs de premier niveau) | 7 parties obligatoires et 28 étapes numérotées (pas d'exercices nommés « Exercice x ») ; bonus : 3 items |
| slide | db | 30 (15 blocs slide, 1 enfant chacun) | — |

Détail du TP (ids) :
- Parties obligatoires : tp3-sec-setup « Mise en place » (3 étapes) ; tp3-sec-index « L'accueil : index.php » (3) ; tp3-sec-catalog-title « Le catalogue : transmettre le titre » (3) ; tp3-sec-catalog-data « Le catalogue : transmettre les albums » (3 sous-parties : tp3-sec-entities « Enrichir les entités » (3 étapes), tp3-sec-catalog-file « Construire le catalogue en mémoire » (1), tp3-sec-catalog-view « Afficher le catalogue » (3)) ; tp3-sec-player « Le lecteur : play_track.php » (7) ; tp3-sec-extract « Extraire header.php et footer.php » (5) ; tp3-sec-recap « Arborescence et vérification » (sans étape).
- Bonus : tp3-bonus « Pour aller plus loin » : tp3-bonus-1 (changer album et morceau dans play_track.php), tp3-bonus-2 (avatar absent : initiales), tp3-bonus-3 (catalogue vide).

Méthode de comptage : tous les blocs à tous les niveaux, sauf les items de liste, comptés en tant que blocs.

## Curriculum des sections précédentes
- 1-bases-du-php (position 1) : aucune clé `curriculum` dans la réponse de list_sections. SIGNALÉ : curriculum vide.
  - Brief (notions, verbatim) : « Syntaxe PHP » ; « echo » ; « Variables et types » ; « Tableaux indexés » ; « Structures de contrôle (if/elseif/else, switch, match) » ; « Boucles (for, foreach, while) » ; « Fonctions : déclaration, paramètres obligatoires et optionnels, typage, return, portée »
  - filRougeOutcome : pas d'incrément du fil rouge Onzer. Le TP porte sur le Z-Event.
- 2-programmation-orientee-objet (position 10 dans list_sections, section 2 pour le fil rouge) : curriculum = null. SIGNALÉ : curriculum vide.
  - Brief (notions, verbatim) : « Tableaux associatifs » ; « Tri et filtre de tableaux » ; « Classes et objets » ; « Constructeur à propriétés promues » ; « Encapsulation (propriétés privées, getters) »
  - filRougeStep : voir la section « État du fil rouge » ci-dessous.

## État du fil rouge avant la section
- source : get_project_reference en échec (ECONNREFUSED 172.22.0.2:443, deux tentatives). Repli : export_content_compact du TP de la section 1 (Z-Event, aucun code Onzer) et du TP de la section 2 (v254, 2026-10-21), complétés par get_content du TP de la section 2 (version 254, source db).
- fichiers et fonctions existants à l'entrée de la section (d'après les consignes du TP2, pas d'après du code réel) :
  - un seul fichier `catalogue.php` (squelette download-file avec les repères `// === Classes ===`, `// === Données ===`, `// === Traitement ===`, `<!-- === Affichage === -->`). Pas d'entities/, core/ ni views/.
  - classe Artist : constructeur à propriétés promues `private string $name`, `private array $albums = []` ; méthodes getName(), __toString(), getAlbums(), ajouterAlbum(Album $album).
  - classe Album : constante publique BASE_URL ; constructeur `private` promu (titre string, année int, artiste Artist, nom du fichier string) ; méthodes getTitle(), getYear(), getArtist(), getCover(), getCoverUrl(), __toString().
  - fonctions de tri et de filtre (valeurPour, usort, array_filter, $_GET) ; le TP2 contient aussi des tableaux associatifs (ex 1 à 2).
  - nom de version : aucun. Le champ `version` de get_content vaut 254 pour le TP de la section 2 (TP export v254).
- ce que la section doit y ajouter (filRougeStep) : déplacer Artist et Album dans entities/, les enrichir (id ; avatar sur Artist ; id et morceaux titre + durée sur Album ; getCoverUrl() via POCHETTES_BASE_URL), créer core/functions.php (render, redirect, POCHETTES_BASE_URL), core/catalog.php fourni, les vues header, footer, player_footer, index, list_albums, player, et les fichiers index.php, list_albums.php, play_track.php.
- état initial reconstituable pour un bac à sable : oui, avec réserve. Blocs sources : get_content php/2-programmation-orientee-objet TP (squelette catalogue.php, consignes ex3 à ex5), get_content php/3-structurer-son-code TP (core/functions.php, catalog.php et views fournis, téléchargements à partir de tp3-functions-download, tp3-catalog-download, tp3-index-download, tp3-list-albums-download, tp3-player-download). La réserve : le code réel des classes Artist et Album produit par les étudiants n'est pas dans la base ; il faut le reconstruire à partir des consignes du TP2. Les archives ressources-tp3.zip et pochettes-tp2.zip n'ont pas été lues.

## Verdicts actifs par format
- cours : aucun (list_verdicts format=cours : [])
- slide : aucun (list_verdicts format=slide : [])
- TP : 6 verdicts actifs (list_verdicts format=TP, identique à l'appel sans filtre)
  - 6a9c32df5d2dd2e6d3b1e55c (2026-09-05) : « il y a toujours la repetition sur le squeette »
  - 6a9c32e15d2dd2e6d3b1e55d (2026-09-05) : « Téléchargez le squelette si dessus .... »
  - 6a9c32e45d2dd2e6d3b1e55e (2026-09-05) : « retire le Vous avez terminé quand et "Exercice x —" des TPs 1 et 2 »
  - 6a9c32e65d2dd2e6d3b1e55f (2026-09-05) : « comme sur le TP1, regarde l'affichage de la reponse sur les calculs qui son a réaliser — précision ensuite : pour moi, c'est utile uniquement sur la 8 »
  - 6ac3edecd38d537522ddd73e (2026-10-05, php) : « retire ce genre de commentaire : "Il n'y a ni session ni base de données à ce stade :" »
  - 6ac67a63137711fbe6236783 (2026-10-07, php) : « "Le TP ne guide pas trop les etudiants ?" (TP4 Formulaire, partie Onzer). Règle validée par l'utilisateur : dans la partie fil rouge, seul le premier exercice d'un geste nouveau est guidé pas à pas ; à partir du deuxième, ne garder que le contrat ... Pas de code de solution dans les astuces : un indice replié qui donne le principe et le piège. »

## Exemplaire par format
- cours : non disponible (list_exemplars format=cours : [])
- TP : non disponible (list_exemplars format=TP : [])
- slide : non disponible (list_exemplars format=slide : [])
- Appel sans filtre : [] également.

## Registre des blocs
file-tree, text, section, list, list-item, columns, column, callout, collapsible, image-card, table, section-card, code, code-with-preview, input-card, diagram, download-file, quote, divider, slide, slide-text, slide-code, slide-list, slide-list-item, slide-note, slide-table, slide-image, slide-transition, slide-code-with-preview

## Signalements
1. courseIntroMinutes absent (list_sections et get_section) : budgets cours + slides et TP non calculables. Le calcul TP (80 à 100 %) ne peut pas être établi.
2. Dépôt de référence inaccessible : get_project_reference a échoué deux fois avec `connect ECONNREFUSED 172.22.0.2:443`. Repli utilisé (exports TP, get_content TP section 2).
3. Curriculum précédent vide : section 1 (aucune clé curriculum) et section 2 (curriculum: null).
4. Ordre des sections incohérent : list_sections et sectionSlugs placent 2-programmation-orientee-objet en position 10 sur 11 ; get_section donne order 3 pour la section cible, et le fil rouge place la section 2 avant la section 3.
5. Pas de contenu en source « file » : cours, TP et slide sont tous en db, donc indexés et exportables.
6. Champ universe absent pour php (non disponible).
7. Aucun exemplaire pour aucun format.
8. Aucun autre message d'erreur d'outil. Les notices de connexion (cours-iut-mcp, phpstorm) ne concernent pas les outils utilisés.

## Définition de terminé
- ✔ Champs de la fiche remplis ou marqués « non disponible » avec raison : universe (absent de la réponse), exemplaires (list_exemplars = []), curriculum section 1 (clé absente), repo (ECONNREFUSED), courseIntroMinutes (null).
- ✘ Budgets calculés avec le calcul visible : courseIntroMinutes = null, donc cours + slides et TP ne peuvent pas être calculés. Le calcul est présenté (1 × 180 − null), mais aucun résultat n'est possible.
- ✔ Brief présent : get_section.brief renvoyé (notions, filRougeStep, filRougeOutcome, providedBase, notes), et objectives au niveau section.
- ✔ Sources lues : 9 sur 10 (list_modules, get_module, list_sections, get_section, get_content cours/TP/slide, export TP sections 1 et 2, get_content TP section 2, list_verdicts, list_exemplars, list_block_types). get_project_reference indisponible (ECONNREFUSED, signalé). search_content non utilisé (aucun point à vérifier).

Le critère « budgets » est ✘, donc le statut reste : incomplet. Le champ manquant à compléter est courseIntroMinutes sur la section 3 (dans list_sections et get_section). Sans lui, l'orchestrateur ne peut pas vérifier la durée du TP.



---

## PHP 3 — style cours

# Relecture style : php/3-structurer-son-code — cours
Statut du rapport : terminé

Source : get_content (prod, source db, v207) a tenu sous la limite de sortie. L'export compact a servi de contre-vérification des marqueurs. Les blocs de code ne portent pas de texte relu.

## Liste de tâches
- [x] bloc struct-intro (A B C D E)
- [x] bloc struct-load (A B C D E)
- [x] bloc struct-load-t (A B C D E)
- [x] bloc struct-dir-callout (A B C D E)
- [x] bloc struct-dir-t (A B C D E)
- [x] bloc 872fa2e2-9e7d-406c-805e-acc6bce1d811 (A B C D E)
- [x] bloc 71d0a3db-0790-4b4e-80af-1c201358769b (A B C D E)
- [x] bloc struct-display (A B C D E)
- [x] bloc ad713366-213b-4458-ba58-2a22857a5422 (A B C D E)
- [x] bloc d171b488-067a-4e92-a6cf-4b9b370ddc5a (A B C D E)
- [x] bloc struct-view (A B C D E)
- [x] bloc struct-view-t (A B C D E)
- [x] bloc f61fb102-5bd8-4d39-a5f0-200f31718dae (A B C D E)
- [x] bloc 4e309889-d0f4-4755-a5bf-12be25f65fa4 (A B C D E)
- [x] bloc 0dfeedde-c7c5-4654-8a20-8f00b469b8f6 (A B C D E)
- [x] bloc 50e9712e-02d5-4a40-ae65-5a837fb9cad3 (A B C D E)
- [x] bloc 1fba622f-b000-4f70-b99b-384eb21a235a (A B C D E)
- [x] bloc 1dd94154-a16e-443c-b56f-ffc71216a532 (A B C D E)
- [x] bloc 322ae6a9-4c75-489a-bc3c-8ea57efcca5c (A B C D E)
- [x] bloc struct-common-functions (A B C D E)
- [x] bloc struct-render (A B C D E)
- [x] bloc struct-render-t (A B C D E)
- [x] bloc 64695a69-83b3-4c96-acf1-74887e496a29 (A B C D E)
- [x] bloc a113612b-a7ed-425a-a565-dd15b97cb6c2 (A B C D E)
- [x] bloc 5a54b56b-d9d7-4ccd-86f0-705311d9f15b (A B C D E)
- [x] bloc c401522b-2bfe-4b95-a0da-9cc2ebf90a33 (A B C D E)
- [x] bloc df777c13-dbd0-4fe8-b80c-f25d30b73dac (A B C D E)
- [x] bloc f40052fe-ed3f-45ad-befd-445327da815c (A B C D E)
- [x] bloc 52e1651f-c709-4c8b-9f2d-8606f5f3bfdc (A B C D E)
- [x] bloc 3e326d3e-d65d-479d-a7cb-10ceee15752d (A B C D E)
- [x] bloc 29d1f832-84c5-46a0-8092-547e028c6421 (A B C D E)
- [x] bloc 1c7c414c-42c5-4c17-bdae-569ac42fc052 (A B C D E)
- [x] bloc bf8e90cd-41b5-4682-96a1-6a032d60756a (A B C D E)
- [x] bloc d44e441e-f12a-47e1-a461-4eadfd211256 (A B C D E)
- [x] bloc struct-recap (A B C D E)
- [x] bloc struct-recap-table (A B C D E)
- [x] bloc struct-recap-t (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | 322ae6a9-4c75-489a-bc3c-8ea57efcca5c | MINEUR | 30, 32 | « Le fichier principal prépare les données, puis charge la vue. La vue les affiche sans construire les objets… » | Supprimer le bloc : il répète 4e309889 et 1fba622f. Si vous le gardez, ajoutez un fait nouveau, par exemple l'erreur « Undefined variable » si la vue appelle une variable absente. |
| 2 | 1fba622f-b000-4f70-b99b-384eb21a235a + 1dd94154-a16e-443c-b56f-ffc71216a532 | MINEUR | 17, 30 | « `views/view_recipes.php` peut donc utiliser directement ces deux variables. » puis un tableau à deux lignes qui le redit | Garder la phrase et retirer le tableau (deux lignes, aucune comparaison). Ou garder le tableau et réduire la phrase. |
| 3 | struct-recap-t | MINEUR | 30, 26 | « La classe décrit une recette, le fichier principal construit les objets et la vue les affiche. » | Cette phrase reprend struct-intro et le tableau juste au-dessus. Finir sur un fait neuf : par exemple, `extract()` écrase les variables existantes, donc les clés de `$data` doivent être choisies avec soin. |
| 4 | struct-recap-table + struct-recap-t | MINEUR | 30, 31 | Tableau « Emplacement / Responsabilité », puis paragraphe qui le résume | Garder une seule des deux formes. Le tableau suffit. |
| 5 | 3e326d3e-d65d-479d-a7cb-10ceee15752d | MINEUR | 7, 8, 24 | « L'appel montre d'emblée les données attendues, et la vue ne peut plus dépendre par accident… » | Les phrases se suivent toutes à la même longueur et sur le même schéma (avantage puis avantage). Raccourcir : « L'appel liste les données attendues. La vue ne peut plus piocher par hasard dans une autre variable. » |
| 6 | 29d1f832-84c5-46a0-8092-547e028c6421 | MINEUR | 35, 27 | « Les valeurs associées sont conservées sans modification. » | Phrase de remplissage. La remplacer par un point précis, par exemple « `extract` écrase une variable qui porterait déjà ce nom. » |
| 7 | struct-dir-t | MINEUR | 8, 27 | « `Recipe` connaît les propriétés d'une recette et fournit les méthodes pour les lire. » | « `Recipe` stocke les propriétés d'une recette et les expose par des getters. » |
| 8 | ad713366-213b-4458-ba58-2a22857a5422 | MINEUR | 34 | Titre « Extraire la classe Recipe » (un paragraphe et un code) | Un titre qui gouverne si peu de contenu est à fusionner avec « Retirer le HTML du fichier principal ». Une remarque seulement car l'abus ne se répète pas ailleurs. |
| 9 | struct-load / struct-load-t / struct-dir-callout / 872fa2e2 | MINEUR | 31, 27 | La section « Partir des classes métier » ne décrit pas de classe : le callout et la classe `Recipe` complète arrivent avant le sous-titre « Point de départ… » | À voir par contrat/cohérence : le titre promet un contenu que la section ne livre qu'en sous-section. Renommer en « Point de départ : une page qui fait tout » ou rapprocher le callout de la séparation. |
| 10 | struct-render-t | MINEUR | 30, 32 | « Le fichier `views/view_recipes.php` est exécuté par le `require` placé à la fin de `recipes.php`. Il dispose déjà de `$pageTitle`… » | Cela répète 4e309889 et 1fba622f (le trio est redit trois fois). Retirer ce bloc ou y mettre l'information nouvelle, ici la boucle `foreach`. |

## Vue d'ensemble
La rédaction est propre : vouvoiement et impératif tenus (« Déplacez », « remplacez », « utilisez »), aucun tutoiement, aucune formule d'IA ni artefact de conversation. Aucune remarque MAJEURE. Le défaut qui revient est la redite : la même idée (le fichier principal prépare, la vue affiche) est servie trois à quatre fois, en prose, en tableau, puis en récapitulatif. Il manque aussi un fait concret (erreur PHP, piège de `extract`) pour casser l'altitude constante.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 37 blocs relus sur 37 (la référence de couverture est get_content, qui n'a pas dépassé la limite de sortie)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 10 remarques, 10 complètes


---

## PHP 3 — style slides

# Relecture style : php/3-structurer-son-code — slides
Statut du rapport : terminé

Le contenu n'était pas dans le prompt. Je l'ai lu avec `get_content` (php, 3-structurer-son-code, slide, source db, version 172). Les deux serveurs `cours-iut-mcp` et `phpstorm` ont échoué à la connexion, mais le serveur prod utilisé n'était pas concerné.

## Liste de tâches
Titres de slide (14) :
- [x] bloc slide3-02 (A B C D E)
- [x] bloc slide3-05-footer (A B C D E)
- [x] bloc slide3-03 (A B C D E)
- [x] bloc slide3-05 (A B C D E)
- [x] bloc slide3-05-use (A B C D E)
- [x] bloc slide3-05-page (A B C D E)
- [x] bloc slide3-06 (A B C D E)
- [x] bloc slide3-07 (A B C D E)
- [x] bloc slide3-10 (A B C D E)
- [x] bloc slide3-08 (A B C D E)
- [x] bloc slide3-11 (A B C D E)
- [x] bloc slide3-12 (A B C D E)
- [x] bloc slide3-13 (A B C D E)
- [x] bloc slide3-14 (A B C D E)
- [x] bloc slide3-09 (A B C D E)

Blocs de contenu porteurs de texte (15) :
- [x] bloc 58b32d6b-e8d9-4bb2-ae2f-7e0e200becf7, slide-code, commentaires inclus (A B C D E)
- [x] bloc 36650685-bb71-42c3-a107-fb4049e0ea7c, slide-table, en-têtes et cellules (A B C D E)
- [x] bloc 0b668d86-3f35-4266-b597-293a98aaf139, slide-code (A B C D E)
- [x] bloc slide3-05-header-code, slide-code (A B C D E)
- [x] bloc slide3-05-use-code, slide-code (A B C D E)
- [x] bloc slide3-05-page-code, slide-code, commentaires HTML (A B C D E)
- [x] bloc slide3-06-c1, slide-code (A B C D E)
- [x] bloc slide3-07-c, slide-code (A B C D E)
- [x] bloc slide3-10-c, slide-code (A B C D E)
- [x] bloc 0e40700a-722a-4e93-a2ce-155072d5408d, slide-code (A B C D E)
- [x] bloc d68f6c4b-43d0-48c0-9451-70ea6f0dee8d, slide-code, commentaires (A B C D E)
- [x] bloc slide3-12-c, slide-code (A B C D E)
- [x] bloc slide3-13-c, slide-code, commentaires (A B C D E)
- [x] bloc 65bc2ed5-a342-4cd8-8d5b-fc17bb35e155, slide-code (A B C D E)
- [x] bloc f9ee31a9-b242-4f93-8373-a8b5bba23ea1, file-tree, titre « Structure après le découpage » (A B C D E)
- [x] support entier (B D)

Il n'y a aucune `slide-note` dans le support : aucun bloc de ce type n'est à couvrir.

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| (aucune) | | | | | |

Je n'ai trouvé aucun marqueur du catalogue dans les titres, le tableau, le titre du file-tree ni les commentaires de code. Ce sont des libellés courts et factuels : « Retirer le HTML du fichier principal », « avertissement, le script continue », « // Suprême aux morilles et Saint-Jacques au panais ». Il n'y a ni vocabulaire gonflé, ni annonce de plan, ni tutoiement, ni numérotation manuelle. La casse des titres est française et le gras n'est jamais abusif.

## Vue d'ensemble
Le support est un enchaînement de slides de code avec des titres sobres. Le style n'appelle aucune correction. Les titres ne mêlent pas verbes et groupes nominaux de façon gênante.
Deux points ne relèvent pas du style et sont à voir par contrat/cohérence.
- L'ordre des slides : le tableau `include`/`require` (slide3-05-footer) arrive juste après le point de départ, avant l'extraction de la classe (slide3-03). `render()` est utilisé en slide3-11 avant sa définition en slide3-12, ce qui est sans doute voulu.
- L'absence totale de `slide-note`. Aucun bloc oral n'a pu être jugé, ce qui n'est pas forcément un défaut.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 30 blocs relus sur 30 (15 titres de slide, 14 blocs de contenu et le titre du file-tree ; aucune slide-note n'existe)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 0 remarque, 0 incomplète


---

## PHP 3 — style TP

# Relecture style : php/3-structurer-son-code — TP
Statut du rapport : terminé

Source : `export_content_compact`, prod, source db, v119 du 2026-10-21. La liste de couverture n'a pas été fournie dans le prompt. J'ai donc compté sur les marqueurs `<!--id-->` de l'export, sans appeler `get_content`. Les blocs vides (conteneurs de listes) et `tp3-recap-tree` (file-tree, sans texte) sont exclus.

## Liste de tâches
- [x] tp3-intro, tp3-woody, tp3-woody-txt (A B C D E)
- [x] tp3-sec-setup, tp3-setup-txt, tp3-functions-download, tp3-setup-1 à -3 (A B C D E)
- [x] tp3-sec-index, tp3-index-txt, tp3-index-download, tp3-index-1 à -3 (A B C D E)
- [x] tp3-sec-catalog-title, tp3-ctitle-txt, tp3-list-albums-download, tp3-ctitle-1 à -3 (A B C D E)
- [x] tp3-sec-catalog-data, tp3-cdata-intro, tp3-sec-entities, tp3-entities-txt, tp3-entities-table, tp3-entities-1 à -3, tp3-entities-warning et -txt (A B C D E)
- [x] tp3-sec-catalog-file, tp3-catalog-txt, tp3-catalog-download, tp3-catalog-1 (A B C D E)
- [x] tp3-sec-catalog-view, tp3-cview-txt, tp3-cview-1 à -3, tp3-cview-warning et -txt (A B C D E)
- [x] tp3-sec-player, tp3-player-txt, tp3-player-download, tp3-player-table, tp3-player-1 à -7 (A B C D E)
- [x] tp3-sec-extract, tp3-extract-txt, tp3-extract-1 à -5, tp3-extract-warning et -txt (A B C D E)
- [x] tp3-sec-recap, tp3-recap-txt, tp3-bonus, tp3-bonus-txt, tp3-bonus-1 à -3 (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | tp3-cview-2 | MAJEUR | verdict TP, 31 (à voir par contrat/cohérence) | « remplacez le modèle de portrait par `foreach ($artists as $artist)` : utilisez `getAvatarUrl()` et `getName()`. Remplacez la carte Rootkit par `foreach ($albums as $album)` : utilisez `getCoverUrl()`, `getTitle()` et `getYear()`… » | Le geste « boucler sur des objets dans la vue » est nouveau ici, donc le guidage pas à pas se justifie. Il reste pourtant très détaillé : il nomme la boucle et tous les getters, et redit ce que `tp3-cview-txt` et `tp3-cview-warning-txt` disent déjà (classes CSS, échappement). Garder le contrat (« une boucle par collection, classes CSS inchangées ») et une ou deux consignes. |
| 2 | tp3-player-6 | MAJEUR | verdict TP (à voir par contrat/cohérence) | « remplacez les quatre lignes statiques par `foreach ($album->getTracks() as $index => $t)`. Chaque ligne affiche `$index + 1`, le titre et la durée… ; ajoutez `active` lorsque… Gardez le lien… et la classe `player-track` » | Le `foreach` a déjà été guidé en `tp3-cview-2`. Donner le contrat : « une ligne par morceau, numéro, titre, durée ; la ligne dont l'index vaut `$trackIndex` porte `active` ». Retirer l'en-tête de boucle, c'est du code de solution. Même remarque pour `tp3-player-5` (« à l'aide du tableau ci-dessus » plus rappel des classes et de l'échappement) : une phrase suffit. |
| 3 | tp3-intro | MINEUR | 30, 24 | « Chaque fichier à la racine prépare les données et appelle `render()` ; la vue produit le HTML. » / « aucune lecture audio ni recherche n'est demandée » | Même famille que le commentaire « Il n'y a ni session ni base de données à ce stade » : une négation sur des fonctions absentes. Garder une seule phrase de périmètre (« Les commandes du lecteur et la recherche restent visuelles ») et supprimer « aucune lecture audio ni recherche n'est demandée ». |
| 4 | tp3-recap-txt | MINEUR | 30, 24 | « ses liens de connexion et d'inscription seront traités plus tard… Aucun fichier ne lit encore `$_GET` et aucune page 404 n'est créée dans ce TP. » | Le bloc répète trois fois ce que l'intro, `tp3-index-txt`, `tp3-index-3`, `tp3-player-txt` et `tp3-player-3` disent déjà. Même famille de négations que le commentaire à retirer. Supprimer la dernière phrase, ne garder que le résultat observable par page. |
| 5 | tp3-player-3 | MINEUR | 30 | « Les identifiants et les index ne proviennent pas encore de `$_GET`. » | Quatrième rappel du report de `$_GET` au TP suivant (intro, `tp3-player-txt`, `tp3-recap-txt`). Supprimer la phrase. |
| 6 | tp3-index-txt, tp3-index-2 | MINEUR | 30, cohérence | « `index.php` n'a aucune donnée à lui transmettre » / « sans transmettre aucune donnée » | Le texte annonce « aucune donnée » alors que `tp3-extract-4` fait transmettre `pageTitle` et `authLayout`. La deuxième occurrence redit la première. À voir par contrat/cohérence : dire « pas de données métier » et ne le dire qu'une fois. |
| 7 | tp3-extract-warning-txt | MINEUR | 30, 24 | « `index.php` transmet explicitement `authLayout => false` lors de l'extraction ; les autres pages utilisent la valeur par défaut `true`. » | Paraphrase de `tp3-extract-1` et `tp3-extract-4`. Le titre dit aussi « avant le require » alors que les variables passent par `render()` (à voir par contrat/cohérence). Garder les symptômes et leur contrôle : « Menu sur l'accueil ou barre absente du lecteur : vérifiez le tableau passé à `render()` ». |
| 8 | tp3-cview-warning-txt | MINEUR | 30 | « passez chaque titre et chaque nom dans `htmlspecialchars()` » | Redit la fin de `tp3-cview-2` (« Passez les textes… dans `htmlspecialchars()` »). Garder l'échappement à un seul endroit, de préférence ici, avec l'exemple « J'me push ». |
| 9 | tp3-index-3 | MINEUR | 20 | « Les liens « S’identifier » et « Commencer avec Onzer »… » | L'apostrophe courbe (’) cohabite avec les droites du reste du TP (« J'me push », « d'albums »). Harmoniser en apostrophe droite. |
| 10 | tp3-bonus-3 | MINEUR | D (impératif) | « si `$albums` est vide, la vue affiche `<div class="alert alert-info">…</div>` à la place de la grille. » | La consigne est à l'indicatif. Écrire : « Si `$albums` est vide, affichez… à la place de la grille. » |
| 11 | tp3-extract-2 | MINEUR | cohérence (à voir par contrat/cohérence) | « …puis les balises fermantes du document : » | La phrase se termine par deux-points et le bloc de code attendu n'apparaît pas dans l'export (limite signalée de l'export). Vérifier dans `get_content` que le code est bien présent. |
| 12 | tp3-entities-txt | MINEUR | 10, 1 | « elles gagnent chacune un fichier, un identifiant, et ce qui manquait pour afficher le lecteur » | Énumération en trois éléments avec formule floue (« ce qui manquait »). Écrire : « elles passent dans un fichier chacune, reçoivent un identifiant, un portrait pour `Artist` et des morceaux pour `Album` ». |

Les commentaires des fichiers fournis (`functions.php`, `catalog.php`, vues) ne sont pas exportés. Je n'ai donc pas pu vérifier la présence du commentaire « Il n'y a ni session ni base de données à ce stade » ni les paraphrases de commentaires. Les blocs du TP ne contiennent pas cette phrase exacte ; les remarques 3 à 5 traitent les négations voisines. Le tutoiement n'apparaît qu'en citation du titre d'onglet « Toute ta musique », donc ce n'est pas un défaut de voix.

## Vue d'ensemble
Le registre est propre : vouvoiement, impératif tenu, aucun artefact de conversation, aucune annonce de plan ni conclusion plaquée. Le défaut dominant est la redite : le report de `$_GET`/404 et de la recherche, ainsi que l'échappement et les classes CSS, reviennent en 4 ou 5 blocs, et les consignes des boucles `foreach` répètent les getters au lieu de donner un contrat. Les deux verdicts TP (guidage unique du premier geste, pas de paraphrase) ne sont pas respectés en `tp3-cview-2` et `tp3-player-5/6`. Le corps du TP ne contient aucun indice replié pour le point « pas de code de solution dans les astuces ».

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises (aucune slide-note dans un TP) : 69 blocs relus sur 69 (comptés sur les marqueurs de l'export, liste de couverture non fournie)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 12 remarques, 12 complètes


---

## PHP 3 — cohérence

# Relecture cohérence : php/3-structurer-son-code — 3 supports (prod, source db)

Réserves générales
- Dépôt de référence injoignable (ECONNREFUSED). Les résultats observables du TP ne sont vérifiables que contre le repli TP2, et le TP2 n'a pas de détail pour les morceaux ni le catalogue. Rapport TP : **incomplet** sur le critère dépôt.
- Aucun curriculum en base. Repli utilisé : briefs des sections 1 et 2, puis brief de la section 3.
- Aucun fichier fourni (`functions.php`, `catalog.php`, les vues `view_*.php`) n'est lisible dans les exports. Les téléchargements ne s'exportent pas.

---
# Rapport 1 — COURS (v207)
Statut du rapport : terminé

## Liste de tâches
- [x] Domaine × 13 blocs d'exemple (struct-load-t, 55159321, 74d56674, 8bad4bf5, 97626c4c, struct-render-c, 47c9ea7d, 91d7277d, 93a8ff7d, b60ab859 et blocs voisins) : aucune fuite Onzer, tout est en Recette.
- [x] Notions utilisées × curriculum : classes, constructeur promu, foreach, if/elseif, tableaux (sections 1 et 2) ; `require`/`include`, `<?= ?>`, syntaxe alternative, `extract`, `__DIR__`, `require_once`.
- [x] Brief « Séparation logique / affichage » × critères 2 et 3
- [x] Brief « Fonctions utilitaires partagées (render, redirect) » × critères 2 et 3
- [x] Brief « Header et footer partagés (require) » × critères 2 et 3
- [x] Brief « Page statique puis page alimentée par des données » × critères 2 et 3
- [x] Brief « Entités enrichies : id, morceaux, fichier d'avatar » × critères 2 et 3
- [x] Brief « Constante partagée POCHETTES_BASE_URL » × critères 2 et 3
- [x] Grammaire des blocs, par partie : 4 parties vérifiées.

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | (cours entier) | MAJEUR | 2 notion du brief absente | `redirect()` | Le seul contenu de `core/functions.php` dans le cours est `render()` (bloc 4af838f7). Le brief demande « render, redirect ». | Ajouter `redirect()` (`header('Location: …'); exit;`) ou retirer la notion du brief. Le TP ne la pratique pas non plus. |
| 2 | (cours entier) | MAJEUR | 2 notion du brief absente | Constante `POCHETTES_BASE_URL` | Aucune occurrence de `const`, `define` ou `POCHETTES_BASE_URL` dans le cours. Le TP l'exige (tp3-entities-3). | Ajouter un exemple dans le domaine Recette, par exemple `const IMAGES_BASE_URL = 'images/recettes/'`, utilisée par une méthode `getImageUrl()`. |
| 3 | (cours entier) | MAJEUR | 2 notion du brief absente | Entités enrichies (id, liste, fichier d'image) | `Recipe` n'a ni `id`, ni fichier d'image. Le lien entre objets (Auteur) n'apparaît pas. | Ajouter une variante `Recipe` avec `int $id`, `?string $imageFile` et un objet `Author`. |
| 4 | struct-intro, 872fa2e2 | MINEUR | 2 notion du brief partielle | « Page statique puis page alimentée par des données » | Le cours part d'une page qui fait tout, pas d'une vue statique que l'on alimente ensuite. | Si ce n'est pas assumé, le dire explicitement dans le curriculum. |
| 5 | Tout le cours | MAJEUR | 3 structure | Aucun `callout` `warning` dans le cours. Le seul callout est `struct-dir-callout`, de type Info. | Export : seul bloc callout = « Info : Le métier ne connaît pas l'affichage ». | Ajouter une erreur fréquente avec message réel par notion, voir les lignes 5a à 5d. |
| 5a | f61fb102, 0dfeedde | MAJEUR | 3 erreur manquante (require) | Table `include`/`require` sans cas d'échec montré | Pas de message réel. | Warning avec par exemple `Fatal error: Uncaught Error: Failed opening required '…/views/view_recipes.php'`. À confirmer par etudiant-fragile. |
| 5b | 74d56674, 8bad4bf5 | MAJEUR | 3 erreur manquante (`require_once`) | Choix `require_once` pour la classe | Le cours dit « ne doit pas être déclarée deux fois » (50e9712e) sans montrer l'erreur. | `Fatal error: Cannot declare class Recipe, because the name is already in use`. À confirmer par etudiant-fragile. |
| 5c | 29d1f832, 3e326d3e | MAJEUR | 3 erreur manquante (`render`/`extract`) | Variable absente du tableau transmis | Rien sur le sujet. | `Warning: Undefined variable $showInstructions`. À confirmer par etudiant-fragile. |
| 5d | a113612b, b79ea767 | MAJEUR | 3 erreur manquante (syntaxe alternative) | `endif;` / `endforeach;` oublié | Rien sur le sujet. | `Parse error: syntax error, unexpected end of file`. À confirmer par etudiant-fragile. |
| 6 | (cours entier) | BLOQUANT (impact TP) | 2 notion exigée par le TP, enseignée nulle part | `htmlspecialchars()` | Cours : `<?= $recipe->getName() ?>` partout, sans échappement. TP : tp3-cview-2, tp3-player-5 et tp3-cview-warning exigent `htmlspecialchars()`. Absent des briefs 1 et 2. | Ajouter un exemple avec une donnée contenant `&` ou `'`, par exemple « Crème d'été & fraises ». Le gravité BLOQUANT vaut pour le TP ; côté cours c'est MAJEUR. |
| 7 | (cours entier) | BLOQUANT (impact TP) | 2 notion exigée par le TP | Opérateur `??` | TP tp3-extract-1 : `($authLayout ?? true)`. Aucune occurrence dans le cours ni dans les briefs. | L'enseigner ou le fournir dans le TP. |
| 8 | (cours entier) | MAJEUR | 2 notion hors briefs utilisée par le TP | Types nullables `?string`, `?Album`, paramètre par défaut `= null` | TP, tableau tp3-entities-table : `?string $avatarFile = null`, `getAvatarUrl(): ?string`. Rien dans le cours. | Ajouter une courte variante dans le cours. |
| 9 | 64695a69, a113612b, 3e326d3e, 4af838f7, 50e9712e | MINEUR | 2 notion hors brief introduite | `<?= ?>`, syntaxe alternative `if:`/`endforeach`, `extract()`, `__DIR__`, tableau des quatre include | Hors brief de la section et hors briefs 1 et 2. Ils sont expliqués dans le cours. | À ajouter au curriculum. |
| 10 | b60ab859 vs c401522b | MINEUR | 1/2 cohérence interne | `$showInstructions` introduit par `render()` | La « vue complète » (struct-render-c) n'utilise pas `$showInstructions`, alors que l'appel `render()` le transmet. | Harmoniser. |
| 11 | struct-common-functions | MINEUR | 6 | Le titre de section est « Construire la vue », mais l'id de la section est `struct-common-functions`. | Export. | Sans impact pour l'élève. |

## Confrontations
- exampleDomain : 13 exemples vérifiés sur 13, 0 fuite Onzer. Les recettes sont gastronomiques, pas « petite appli », ce que j'accepte en MINEUR. Le vocabulaire Auteur est absent (cf. remarque 3).
- curriculum : 14 notions confrontées sur 14, dont les 6 notions du brief. Notions introduites par la section : `<?= ?>`, syntaxe alternative, `extract`, `__DIR__`, `require`/`include` et variantes.
- Dépôt : sans objet.

## Définition de terminé
- ✔ exemples vs exampleDomain : 13 sur 13
- ✔ notions vs curriculum : 14 sur 14
- sans objet : dépôt et slides

---
# Rapport 2 — SLIDES (v172)
Statut du rapport : terminé (get_content utilisé pour vérifier l'absence de `slide-note`)

## Liste de tâches
- [x] 14 slides × critère 5 : slide3-02, 05-footer, 03, 05, 05-use, 05-page, 06, 07, 10, 08, 11, 12, 13, 14, plus slide3-09 (file-tree), soit 15 slides.
- [x] Chaque exemple × domaine : 15 sur 15.
- [x] Notions des slides × cours.
- [x] Grammaire des blocs (1 partie).

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | Les 15 slides | MAJEUR | 5 slide sans `slide-note` | Toutes | `get_content` : aucun bloc `slide-note` parmi les `children`. Chaque slide contient seulement `slide-code`, `slide-table` ou `file-tree`. | Ajouter une `slide-note` à chaque slide. |
| 2 | slide3-08, 0e40700a | MAJEUR | 5 recopie du cours | « La vue complète » | Reprise presque mot pour mot de `struct-render-c` (header, titre, if/else, foreach imbriqués, footer). | Alléger : la slide ne garde que la structure. |
| 3 | slide3-12, slide3-03 | MAJEUR | 5 recopie du cours | `render()` et `Recipe` | Code identique à 4af838f7 et 74d56674. | Remplacer par des extraits (commentaires `// getters`), comme slide3-02. |
| 4 | slide3-05-footer | MAJEUR | 5 recopie du cours | Tableau `include`/`require` | Table de 0dfeedde avec les mêmes quatre lignes, formulations raccourcies. | Garder deux lignes (`require` et `require_once`) ou la raisonner autrement. |
| 5 | slide3-05-page | MINEUR | 5 deux idées | Syntaxe classique vs courte + `count($recipes)` | Les lignes 1-2, 4-5 et 7 portent deux idées. | Scinder. |
| 6 | slide3-11, slide3-13 | MINEUR | 5 deux idées | `require` direct vs `render()` ; slide 13 répète l'appel de slide 11 | Même appel `render('recipes', …)` dans slide3-11, slide3-13 et slide3-14. | Fusionner les redites. |
| 7 | slide3-02, 03, 05, 05-use, 06, 08, 11, 14 | MINEUR | 6 `filename` manquant | Fichiers à créer ou modifier | `props` sans `filename` (08 est une vue ; 14 est `recipes.php`). | Ajouter les `filename`. |
| 8 | slide3-05 | MINEUR | 5 | Titre « recipes.php après l'extraction », avec un bloc dont l'id est `slide3-05-header-code` | Ids hérités d'un ancien découpage ; ordre des slides discutable (le tableau include arrive en 2e position). | Réordonner : include/require avant la slide « Retirer le HTML ». |
| 9 | slide3-09 | MINEUR | 5 | Arborescence `gastronomie/` | Racine `gastronomie/` : cohérente avec le domaine. Le `file-tree` n'est pas exporté en Markdown (vérifié dans `get_content`). | Rien. |
| 10 | (slides entières) | MINEUR | 5 rendu visuel | Aucun `slide-code-with-preview` | Les slides montrent des vues HTML (`view_recipes.php`) sans rendu. | Ajouter un aperçu à la slide « La vue complète ». |
| 11 | (slides entières) | — | 5 notion présente dans les slides et absente du cours | Aucune. | 15 slides comparées au cours. | — |

## Confrontations
- exampleDomain : 15 exemples vérifiés sur 15, 0 fuite.
- curriculum : mêmes notions que le cours (voir rapport 1), 6 notions de brief confrontées ; mêmes lacunes que le cours.
- cours (slides) : 15 slides comparées sur 15.

## Définition de terminé
- ✔ exemples : 15 sur 15
- ✔ notions : confrontées au cours (voir rapport 1)
- ✔ slides : comparaison au cours faite, 15 sur 15
- sans objet : dépôt

---
# Rapport 3 — TP (v119)
Statut du rapport : **incomplet** (dépôt injoignable, repli TP2 insuffisant pour les données du catalogue)

## Liste de tâches
- [x] Setup (tp3-setup-1 à 3) × critères 2 et 4
- [x] Exercice « L'accueil » (tp3-index-1 à 3) × critères 2 et 4
- [x] Exercice « Le catalogue : transmettre le titre » (tp3-ctitle-1 à 3) × critères 2 et 4
- [x] Exercice « Enrichir les entités » (tp3-entities-1 à 3) × critères 2 et 4
- [x] Exercice « Construire le catalogue en mémoire » (tp3-catalog-1) × critères 2 et 4
- [x] Exercice « Afficher le catalogue » (tp3-cview-1 à 3) × critères 2 et 4
- [x] Exercice « Le lecteur » (tp3-player-1 à 7) × critères 2 et 4
- [x] Exercice « Extraire header.php et footer.php » (tp3-extract-1 à 5) × critères 2 et 4
- [x] Bonus 1, 2, 3 × critères 2 et 4
- [x] Progression guidé → fil rouge
- [x] Grammaire des blocs (parties : setup, accueil, catalogue, entités, lecteur, extraction, bonus)

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp3-cview-2, tp3-player-5, tp3-cview-warning | BLOQUANT | 2 notion exigée, enseignée nulle part | `htmlspecialchars()` | Pas dans le cours (rapport 1, remarque 6) ni dans les briefs 1 et 2. Le warning explique le pourquoi, pas l'usage. | L'enseigner dans le cours. |
| 2 | tp3-extract-1 | BLOQUANT | 2 notion exigée, enseignée nulle part | `($authLayout ?? true)` | `??` n'apparaît dans aucun brief ni dans le cours. | L'enseigner (ou fournir l'expression). |
| 3 | tp3-entities-table | MAJEUR | 2 | Types nullables `?string`, `?Album`, `= null` | Absents du cours. | Voir rapport 1, remarque 8. |
| 4 | tp3-entities-table, tp3-entities-2 | MAJEUR (à confirmer) | 4 entrée du fil rouge | Constructeurs `int $id, string $title, int $year, Artist $artist, string $fileName, array $tracks` et « Vos propriétés et méthodes du TP2 gardent leur nom » | Repli TP2 : propriétés « titre, année, artiste, fichier », méthodes `getTitle`, `getYear`, `getArtist`, `getCover`, `getCoverUrl`. Si les propriétés TP2 sont en français (`titre`, `fichier`), la consigne est contradictoire avec les noms `title`/`fileName`/`avatarFile`. | Vérifier le TP2, puis aligner les noms. |
| 5 | tp3-extract-2 | MAJEUR (à confirmer) | 6/4 | « …et enfin les balises fermantes du document : » | La phrase finit par un deux-points et aucun bloc de code ne suit dans l'export. L'export aplatit les enfants des items de liste, donc le bloc peut exister sans apparaître. | Vérifier dans l'éditeur que le code de `footer.php` y est. |
| 6 | tp3-extract-2 / tp3-extract-warning | MAJEUR | 2 | `footer.php` lit `$showPlayerFooter`, que `index.php` et `list_albums.php` ne transmettent pas | Le TP ne dit pas de tester la variable (`?? false` ou `isset`). Sans cela : `Warning: Undefined variable $showPlayerFooter`. | Ajouter l'indication. |
| 7 | tp3-intro, tp3-entities-3, tp3-player-2 | MAJEUR | 2 notion du brief jamais pratiquée | `redirect()` | Le TP ne mentionne `redirect` nulle part. | Retirer `redirect` du brief ou l'utiliser. |
| 8 | tp3-sec-* | MAJEUR (à confirmer) | 4 progression | Pas de partie guidée avant la partie fil rouge | Les 8 parties de l'export portent toutes sur Onzer. Les flags `projectRef` ne sont pas visibles dans l'export. L'étape « cours » joue le rôle de guidage (domaine Recette). | Vérifier les `projectRef` ; sinon, la progression repose entièrement sur le cours. |
| 9 | tp3-ctitle-3, tp3-cview-3, tp3-player-7, bonus 1 et 2 | MAJEUR (non confrontable) | 4 | Rootkit (2019) en premier, Trop bool (2018) en dernier, Beta id 4, Maitre Git 2013, « Laissez compiler » 03:54, « Waking Up in Vagrant » id 5 | Dépôt injoignable, `catalog.php` non lisible dans l'export. | Confronter à `core/catalog.php` fourni ; à défaut, à une exécution réelle. |
| 10 | tp3-setup-txt, tp3-entities-3 | MAJEUR (non confrontable) | 4 | `images/pochettes/`, `POCHETTES_BASE_URL`, `images/artists/` | La constante est dans `functions.php`, non lisible. Le TP2 utilise `BASE_URL`, la valeur du TP2 n'est pas connue. | Vérifier que la valeur de la constante pointe sur `images/pochettes/`. |
| 11 | tp3-entities-warning-txt | MINEUR | 2 | « Si `entities/Artist.php` s'affiche en clair dans le navigateur » | Ces fichiers sont chargés par `require`, pas ouverts à l'URL. Le texte brut apparaît dans la page appelante. | Reformuler. |
| 12 | tp3-extract-5, tp3-recap-txt | MINEUR | 4 | « les liens « Lire » ouvrent pour l'instant le même lecteur Beta » | Cohérent avec tp3-player-3. | Rien. |

## Confrontations
- exampleDomain : sans objet pour un TP.
- curriculum : 12 notions confrontées sur 12 : `render`, `require_once`, `htmlspecialchars`, `??`, types nullables, `foreach … as $i => $x`, constructeurs, `const`, tableaux, `count`, `getAlbumById`, `extract` (hors-TP). Notions introduites : néant.
- dépôt (TP) : 3 résultats confrontés au repli TP2 (structure des classes `Artist`/`Album`, constante `BASE_URL`, `getCoverUrl()`, fichier `catalogue.php`) sur 12 ; les 9 autres sont non confrontables. Fichiers lus : aucun (dépôt injoignable).
- État du fil rouge : le TP part bien de `catalogue.php` avec `Artist` et `Album` (conforme au repli TP2), sauf la remarque 4. La sortie annoncée (`index.php`, `list_albums.php`, `play_track.php`, `core/functions.php`, `entities/`, `core/catalog.php`, vues header/footer/player_footer/index/list_albums/player) est bien produite par le TP.
- Budget : 160 min non évalué, les durées par exercice ne sont pas dans l'export.

## Définition de terminé
- ✔ notions : 12 sur 12 confrontées
- ✘ dépôt : 3 résultats confrontés sur 12, dépôt injoignable
- sans objet : exemples du TP, slides

Fichiers : aucun fichier local n'a été écrit ou lu.


---

## PHP 3 — contrat TP

# Relecture contrat : php/3-structurer-son-code — TP
Statut du rapport : incomplet

Sources : export compact (export_content_compact) puis get_content (php / 3-structurer-son-code / TP, v119, source db). Le get_content a permis de lire les fichiers téléchargeables, les blocs de liste et l'arborescence `tp3-recap-tree`, absents de l'export compact. Aucun contenu de cours ni de slide n'a été chargé.

## Liste de tâches
- [x] tp3-sec-setup « Mise en place » : 6 champs revus, durée absente
- [x] tp3-sec-index « L'accueil : index.php » : 6 champs revus, durée absente
- [x] tp3-sec-catalog-title « Le catalogue : transmettre le titre » : 6 champs revus, durée absente
- [x] tp3-sec-catalog-data « Le catalogue : transmettre les albums » (contenu évalué : tp3-sec-entities) : 6 champs revus, durée absente
- [x] tp3-sec-catalog-file « Construire le catalogue en mémoire » : 6 champs revus, durée absente
- [x] tp3-sec-catalog-view « Afficher le catalogue » : 6 champs revus, durée absente
- [x] tp3-sec-player « Le lecteur : play_track.php » : 6 champs revus, durée absente
- [x] tp3-sec-extract « Extraire header.php et footer.php » : 6 champs revus, durée absente
- [x] tp3-sec-recap « Arborescence et vérification » : 6 champs revus, durée absente
- [x] tp3-bonus-1 « Changer l'album et le morceau » : 6 champs revus, durée absente (hors budget)
- [x] tp3-bonus-2 « Artiste sans portrait » : 6 champs revus, durée absente (hors budget)
- [x] tp3-bonus-3 « Catalogue vide » : 6 champs revus, durée absente (hors budget)
- [ ] somme des durées et pourcentage du budget : non calculable (0 durée sur 9 parties)

Cause de l'échec de la somme : le contenu source ne porte aucune durée (ni sur les sections, ni sur les blocs). Ce n'est pas un oubli de relecture : il faut ajouter une durée estimée par partie dans le contenu avant de relancer la relecture.

## Grille
Les ids sont ceux des sections et des bonus. Le parent `tp3-sec-catalog-data` est gradé sur son contenu réel, `tp3-sec-entities` (ses autres contenus, `tp3-sec-catalog-file` et `tp3-sec-catalog-view`, ont leurs propres lignes).

| Exercice (id) | Type | 1 Fichier | 2 Noms | 3 Données | 4 API | 5 Résultat | 6 Validation | Durée |
|---|---|---|---|---|---|---|---|---|
| tp3-sec-setup | tronc | présent | présent | présent | sans objet (aucune notion de code) | présent | présent | absente |
| tp3-sec-index | tronc | présent | présent | sans objet (aucune donnée transmise) | présent | présent | présent | absente |
| tp3-sec-catalog-title | tronc | présent | présent | présent | présent | présent | présent | absente |
| tp3-sec-catalog-data (contenu : tp3-sec-entities) | tronc | présent | présent | présent | présent | vague | absent | absente |
| tp3-sec-catalog-file | tronc | présent | présent | présent | présent | vague | absent | absente |
| tp3-sec-catalog-view | tronc | présent | présent | présent | présent | présent | présent | absente |
| tp3-sec-player | tronc | présent | présent | présent | présent | présent | présent | absente |
| tp3-sec-extract | tronc | présent | présent | présent | présent | présent | présent | absente |
| tp3-sec-recap | tronc | présent | présent | sans objet (aucune saisie) | sans objet (aucun code écrit) | présent | présent | absente |
| tp3-bonus-1 | bonus | présent | présent | présent | présent | présent | présent | absente (hors budget) |
| tp3-bonus-2 | bonus | présent | présent | présent | présent | présent | absent | absente (hors budget) |
| tp3-bonus-3 | bonus | présent | présent | présent | présent | présent | présent | absente (hors budget) |

Détails qui fondent les cases :
- Fichiers téléchargeables lus via get_content : `functions.php` (render, redirect, POCHETTES_BASE_URL), `catalog.php` (4 artistes, 6 albums, trois fonctions), `view_index.php`, `view_list_albums.php`, `view_player.php`. Ils comptent comme présents pour les champs 1 et 3.
- `footer.php` figure dans le bloc de code de `tp3-extract-2-code` (filename `footer.php`). Il est donc présent pour les champs 2, 4 et 5 de l'extraction.
- Arborescence `tp3-recap-tree` lue : elle nomme les fichiers attendus (index.php, list_albums.php, play_track.php, core/, entities/, views/, css/, images/). Champs 1 et 2 de recap gradés sur ce contenu.
- Le titre `<title>` de `view_index.php` est statique (« Onzer — Toute ta musique »), donc l'onglet de l'accueil n'est pas une lacune de contrat.
- Cohérence vérifiée : Rootkit est l'album 1 et Trop bool l'album 6 ; Beta est l'album 4 ; `getAlbumById(5)` est « I Queried a View », dont l'index 2 est « Waking Up in Vagrant » (bonus-1 correct).

## Budget
- tronc commun : 9 parties, 0 durée renseignée → somme non calculable (0 durée sur 9 parties)
- budget TP : 1 × 180 − 20 = 160 min (hypothèse validée) ; plage 128–160 min
- pourcentage : non calculable. Le test BLOQUANT « somme hors 80–100 % » ne peut pas être exécuté.
- bonus (hors budget) : 3 bonus, aucune durée, non comptés dans le budget.
- `totalDuration: 1` de la section : champ au niveau section, unité inconnue, non utilisé comme somme.

## Remarques
| # | id du bloc | Gravité | Champ | Passage concerné | Proposition |
|---|---|---|---|---|---|
| 1 | tp3-sec-setup, tp3-sec-index, tp3-sec-catalog-title, tp3-sec-catalog-data, tp3-sec-catalog-file, tp3-sec-catalog-view, tp3-sec-player, tp3-sec-extract, tp3-sec-recap (9 ids) | MAJEUR | Durée | toutes les parties du tronc commun : aucune durée dans les blocs | ajouter une durée estimée par partie ; la somme reste incomplète tant que ce n'est pas fait |
| 2 | tp3-sec-entities (dans tp3-sec-catalog-data) | BLOQUANT | 6 Validation | tp3-entities-1 à tp3-entities-3 : aucun critère de fin ; seul l'avertissement sur `<?php` (tp3-entities-warning) est un dépannage, pas un critère | ajouter un critère observable, par ex. « `count(getAllAlbums())` renvoie 6 » ou « `getCoverUrl()` de Rootkit renvoie `images/pochettes/rootkit-ssh.png` » |
| 3 | tp3-sec-catalog-file | BLOQUANT | 6 Validation | tp3-catalog-1 : « Enregistrez le fichier ci-dessus » (aucun critère) | ajouter un critère, par ex. « `count(getAllArtists())` renvoie 4 et `count(getAllAlbums())` renvoie 6 » |
| 4 | tp3-sec-catalog-file | MAJEUR | 5 Résultat | tp3-catalog-txt : « construit les quatre artistes et les six albums en mémoire » (description, pas de rendu) | décrire le rendu, par ex. « `getAllAlbums()[0]->getTitle()` renvoie « Rootkit » » |
| 5 | tp3-sec-entities (dans tp3-sec-catalog-data) | MAJEUR | 5 Résultat | tp3-entities-2 : « Vos propriétés et méthodes du TP2 gardent leur nom » (pas de résultat observable) | décrire un retour attendu, par ex. « `getAvatarUrl()` de Loopal renvoie `images/artists/loopal.png` » |
| 6 | tp3-bonus (section « Pour aller plus loin ») | MAJEUR | mention « bonus » | titre « Pour aller plus loin », intro « À faire si vous avez fini avant la fin de la séance » : le mot « bonus » n'apparaît nulle part dans la source | intituler la section « Bonus — Pour aller plus loin » |
| 7 | tp3-bonus-2 | MAJEUR | 6 Validation | tp3-bonus-2 : aucune vérification demandée | ajouter un critère, par ex. « la page catalogue affiche un cercle contenant « L » à la place du portrait de Loopal » |

## Définition de terminé
- ✔ grille complète, chaque exercice et bonus × 6 champs : 12 lignes sur 12 (9 parties tronc, dont catalog-data gradé sur tp3-sec-entities, et 3 bonus), 6 cases chacune
- ✘ somme des durées et pourcentage du budget : non calculés. 0 durée renseignée sur 9 parties du tronc commun ; le budget 160 min et la plage 128–160 min sont posés, mais la somme ne peut pas être comparée à la plage.

Statut : incomplet. La cause est le contenu source (aucune durée), pas un manque de relecture. Il faut ajouter les durées estimées par partie puis relancer la relecture ; les remarques 2 et 3 (BLOQUANT sur la validation) sont à corriger dans le même passage.



---

## PHP 3 — étudiant fragile cours

# Étudiant fragile : php/3-structurer-son-code — cours, mode lecture
Statut du rapport : incomplet (3 notions du brief sur 6 absentes du cours, donc « non » au bilan)
Conteneur : cours-iut-bac-php-3-structurer-son-code-20261027-094328, dossier /work/fragile-cours

## Liste de tâches
- [x] 55159321 (monolithe recipes.php) exécuté : via `rendu-html` sur http://localhost:8002, texte visible conforme (titre, 3 recettes, durées, listes)
- [x] d171b488/74d56674 (entities/Recipe.php) écrit
- [x] 8bad4bf5 (recipes.php + require de la vue) exécuté : rendu identique au monolithe, plus l'en-tête, le pied de page et la phrase « 3 recettes à la carte. »
- [x] 97626c4c (ligne `require` seule) : fragment redondant avec 8bad4bf5, rien à exécuter
- [x] 64695a69 (`<?= ?>`), b79ea767 (if/elseif/else/endif) et 8eee3844 (foreach) : exécutés via la vue complète c401522b. Je n'ai pas lancé chaque fragment isolément.
- [x] c401522b / struct-render-c (vue complète avec header et footer) exécuté : OK
- [x] 47c9ea7d (header.php) et 91d7277d (footer.php) exécutés : OK
- [x] 4af838f7 (render) et 93a8ff7d (appel render) exécutés : sortie identique, par `diff`, à la version avec `require` direct
- [x] b60ab859 (vue avec `$showInstructions`) exécuté
- [x] Variante : `showInstructions` à true, à false, puis absent. Prédiction écrite avant exécution : avec true, étapes affichées ; avec false, pas d'étapes ; avec absent, avertissement « Undefined variable » et rendu comme false. Résultat : prédiction juste.
- [x] Tableau des instructions 0dfeedde : `include` d'un fichier absent donne un avertissement et le script continue, ce qui est conforme. `require` d'un fichier absent arrête le script avec une Fatal error, conforme. `require_once` deux fois fonctionne, conforme. `require` d'un fichier de classe déjà chargé donne « Cannot declare class Recipe, because the name is already in use », conforme au tableau (« chargé à nouveau ») et à 50e9712e.
- [x] Aucun `callout warning` dans ce cours (un seul callout Info, struct-dir-callout)
- [x] Bilan : 6 notions renseignées (voir tableau)

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | (brief) | BLOQUANT | Notion « Fonctions utilitaires partagées (render, redirect) » | `redirect()` n'apparaît nulle part dans le cours. Seul `render()` est traité (4af838f7). | n/a | Ajouter `redirect()` avec `header('Location: …')` et `exit`, ou retirer `redirect` du brief. |
| 2 | (brief) | BLOQUANT | Notions « Page statique puis page alimentée par des données » et « Entités enrichies : id, morceaux, fichier d'avatar » | Le cours porte sur des recettes. Il n'y a ni id, ni morceaux, ni avatar. La progression « statique → données » n'est pas montrée : la page de départ est déjà dynamique (55159321). | n/a | Aligner le brief sur le cours, ou ajouter ces contenus. |
| 3 | (brief) | BLOQUANT | Notion « Constante partagée POCHETTES_BASE_URL » | Absente du cours. Aucune `define` ni `const` n'est enseignée, ni dans le curriculum. | n/a | Ajouter un bloc sur `const` et `define`, ou retirer la notion. |
| 4 | 93a8ff7d | MAJEUR | « Dans `recipes.php`, remplacez le `require` direct… » | Le fragment n'a pas de `<?php` et ne dit pas où le placer. J'ai déduit : après le tableau, à la place du `require` de la vue. | 3 min | Montrer le fichier `recipes.php` complet, ou écrire « à la fin du fichier, à la place de la dernière ligne ». |
| 5 | b60ab859 | MAJEUR | Vue avec `$showInstructions` | Elle diffère de la vue complète c401522b : pas de header, pas de footer, pas de liste d'ingrédients, `$showInstructions` absent. Il n'est pas dit qu'elle remplace la vue complète ni comment les fusionner. L'étudiant ne sait pas quelle version garder. | 3 min | Intégrer `$showInstructions` à la vue complète finale, ou signaler que b60ab859 est un extrait à greffer dans c401522b. |
| 6 | c401522b | MAJEUR | `header.php` utilise `$pageTitle` | La vue complète n'utilise pas `$showInstructions`. Le tableau bf8e90cd annonce pourtant que la variable est créée. Cohérence partielle. | 1 min | Utiliser `$showInstructions` dans la vue finale. |
| 7 | 3e326d3e | MAJEUR | « la vue ne peut plus dépendre par accident d'une autre variable » | C'est faux en pratique. `render()` exécute `require` dans sa portée, donc la vue voit `$view` et `$data`, et `require` direct n'est pas la seule fuite. Pire : avec la clé `showInstructions` absente, PHP émet un avertissement (« Undefined variable », constaté), ce que le cours ne dit pas. | 1 min | Dire ce qui se passe si une clé manque. Nuancer « ne peut plus ». |
| 8 | 29d1f832 | MAJEUR | `extract($data)` | `extract` n'est ni dans le curriculum ni défini avant ce bloc. L'explication (clé devient variable) est correcte. Les conventions de nom `view_` + `$view` ne sont pas annoncées avant le code. | 1 min | Une phrase sur le nommage `views/view_<nom>.php` avant le code. |
| 9 | 0dfeedde | MAJEUR | Tableau `include`/`require` | `__DIR__` est utilisé dès 8bad4bf5 sans définition. `require_once` apparaît dans 8bad4bf5 avant le tableau qui l'explique. | 2 min | Définir `__DIR__` en une phrase et déplacer le tableau avant le premier `require_once`. |
| 10 | struct-dir-callout | MINEUR | Callout « Info : Le métier ne connaît pas l'affichage » | Le titre est suivi du bloc struct-dir-t, mais le callout lui-même est vide dans l'export. | 30 s | Vérifier que le corps est bien rattaché au callout. |
| 11 | d171b488 | MINEUR | Extraire Recipe, puis 8bad4bf5 | Le cours ne dit pas explicitement qu'il faut créer les dossiers `entities/`, `views/` et `core/`. | 30 s | Un schéma de l'arborescence en début de section. |
| 12 | 8eee3844 | MINEUR | Syntaxe alternative `foreach:` / `endforeach;` | Le cours dit « syntaxe alternative » (a113612b) sans la comparer à celle de 55159321. | 30 s | Une ligne de comparaison avec les accolades. |
| 13 | (environnement) | MINEUR | Port 8000 | Le port 8000 était déjà occupé dans le conteneur (404 sur recipes.php). J'ai utilisé 8001 et 8002. Limite d'environnement, pas un défaut du contenu. | 1 min | (aucune) |
| 14 | (environnement) | MINEUR | `rendu-html` | `rendu-html` a écrit `rendu.png` dans /work (hors de /work/fragile-cours). Limite d'environnement. | n/a | (aucune) |

## Temps (barème fixe)
| Exercice ou partie | Détail du calcul | Total | Démarrage | Statut |
|---|---|---|---|---|
| Lecture du cours | environ 1 500 mots de prose ≈ 8 min ; environ 330 lignes de code lues à 6 s ≈ 33 min | 41 min | n/a | fait |

Temps de lecture du cours : 41 min (mode lecture).

## Bilan des notions du brief
| Notion | À quoi elle sert (source) | Utilisation (mini-exemple exécuté) | Résultat |
|---|---|---|---|
| Séparation logique / affichage | Classe métier sans HTML, fichier principal qui prépare les données, vue qui affiche (struct-intro, struct-dir-t, struct-recap-t) | mini.php avec `Boisson` et `view_boissons.php`, rendu via `render()` : `<li>Thé</li><li>Café</li>` | oui |
| Fonctions utilitaires partagées (render, redirect) | `render()` charge une vue avec un tableau de données explicite (3e326d3e) | `render('boissons', [...])` : OK. `redirect` : absent du cours. | partiellement (render oui, redirect non, voir remarque 1) |
| Header et footer partagés (require) | Même début et même fin de document pour toutes les vues (df777c13) | `view_boissons.php` fait `require` de header.php et footer.php : titre « Boissons » et pied de page présents | oui |
| Page statique puis page alimentée par des données | (aucune source) | (aucun) | non (remarque 2) |
| Entités enrichies : id, morceaux, fichier d'avatar | (aucune source) | (aucun) | non (remarque 2) |
| Constante partagée POCHETTES_BASE_URL | (aucune source) | (aucun) | non (remarque 3) |

## Définition de terminé
- ✘ mode lecture : exemples exécutés (13 sur 13 ; certains fragments exécutés uniquement dans la vue complète), variantes prédites puis comparées (1 sur 1), bilan rempli pour 6 notions sur 6, mais 3 notions restent « non » faute de contenu dans le cours (BLOQUANT)
- ✔ chaque étape du journal cite sa source (18 étapes, 18 sourcées, 0 devinée), sauf les 2 marquées « deviné » ci-dessous (placement du fragment render, choix de la vue b60ab859)
- ✔ aucun fichier de travail hors de /work/fragile-cours, hormis /work/rendu.png créé par `rendu-html`. Sortie de `ls /work` : depart fournis fragile-cours fragile-tp rapide rendu.png supports

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | `mkdir` de v1 et de v2/{entities,views,core} | 8bad4bf5 (arborescence déduite) | OK |
| 2 | Création de v1/recipes.php (monolithe) | 55159321 | OK |
| 3 | Rendu du monolithe sur le port 8002 | 71d0a3db | texte conforme |
| 4 | Création de entities/Recipe.php | 74d56674 | OK |
| 5 | Création de recipes.php avec `require_once` et `require` de la vue | 8bad4bf5 | OK |
| 6 | Création de header.php | 47c9ea7d | OK |
| 7 | Création de footer.php | 91d7277d | OK |
| 8 | Création de view_recipes.php (vue complète) | c401522b | rendu OK |
| 9 | Création de core/functions.php | 4af838f7 | OK |
| 10 | Remplacement du `require` final par l'appel `render()` dans recipes_render.php | 93a8ff7d ; placement : aucune source (deviné) | sortie identique (`diff`) |
| 11 | Création de view_simple.php | b60ab859 ; choix de cette vue à part : aucune source (deviné) | OK |
| 12 | var.php : cas `showInstructions` true / false / absent | b60ab859 | prédiction juste |
| 13 | inc.php : `include` d'un fichier absent | 0dfeedde | Warning puis la suite s'exécute |
| 14 | inc.php : `require_once` deux fois | 0dfeedde | OK |
| 15 | inc.php : `require` d'une classe déjà chargée | 0dfeedde, 50e9712e | Fatal error « Cannot declare class » |
| 16 | req.php : `require` d'un fichier absent | 0dfeedde | Fatal error |
| 17 | mini.php et view_boissons.php | 3e326d3e, df777c13 | rendu OK |
| 18 | Rendu de http://localhost:8001/recipes.php | c401522b | texte conforme, capture /work/rendu.png |



---

## PHP 3 — étudiant fragile TP

# Étudiant fragile : php/3-structurer-son-code — TP, mode exécution
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-3-structurer-son-code-20261027-094328, dossier /work/fragile-tp (projet final : /work/fragile-tp/onzer/, serveur `php -S localhost:8000` lancé depuis ce dossier)

## Liste de tâches
- [x] Mise en place (dossiers, pochettes, ressources, functions.php) : faite
- [x] Accueil index.php : fait, rendu vérifié (titre « Onzer — Toute ta musique », bandeau, 3 offres, sans menu)
- [x] Catalogue, titre : fait (onglet « Catalogue — Onzer », Loopal et Rootkit 2019)
- [x] Entités Artist/Album : faites (classes TP2 réécrites, limite d'environnement)
- [x] core/catalog.php : fait
- [x] Afficher le catalogue : fait (4 portraits, 6 cartes dans l'ordre, Rootkit en premier, Trop bool en dernier)
- [x] Lecteur play_track.php : fait (onglet « Laissez compiler — Onzer », Beta, Maitre Git, 2013, 4 morceaux, ligne 2 active, barre 03:54)
- [x] Extraction header/footer/player_footer : faite et vérifiée (accueil sans menu ni barre ; catalogue avec menu, sans barre ; lecteur avec menu et barre)
- Bonus non faits (non demandés).

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp3-extract-2 | MAJEUR (limite d'export signalée) | « Créez `views/footer.php` avec la fermeture de `<main>`, puis l'inclusion conditionnelle de `player_footer.php`, et enfin les balises fermantes : » (le code manque) | Contenu de footer.php : j'ai repris la ligne `<?php if (!empty($showPlayerFooter)) { require __DIR__ . '/player_footer.php'; } ?>` présente dans view_list_albums.php fourni. Sans cette ligne, impossible de deviner la condition ni le chemin. | 3 min | Vérifier que le bloc de code est bien rendu dans le support réel. Sinon, donner la condition (`!empty($showPlayerFooter)`) dans la prose. |
| 2 | tp3-entities-txt / tp3-entities-2 | MAJEUR (limite d'environnement, mais la consigne est incomplète) | « Vos propriétés et méthodes du TP2 gardent leur nom. » | Le TP2 n'était pas fourni. Je n'ai que le tableau des ajouts. `catalog.php` appelle `ajouterAlbum()` et les vues utilisent `getName/getTitle/getYear/getArtist/getCoverUrl`. J'ai donc écrit moi-même `getAlbums()`, `getName()`, etc. Un étudiant dont le TP2 a d'autres noms (ex. `addAlbum`) tombe sur une erreur « undefined method » dans `catalog.php`. | 3 min | Lister dans le tableau des entités les noms de méthodes que `catalog.php` et les vues exigent (`ajouterAlbum(Album)`, `getName`, `getTitle`, `getYear`, `getArtist`, `getCoverUrl`). |
| 3 | tp3-entities-3 | MINEUR | « utilisable depuis n'importe quel fichier du projet » | Rien de bloquant. `POCHETTES_BASE_URL` n'est défini que si `core/functions.php` est chargé avant d'appeler `getCoverUrl()`. Le support ne dit pas que `catalog.php` ne charge pas `functions.php` lui-même. Ça marche ici parce que chaque action charge functions.php d'abord. | 0 | Ajouter une phrase sur l'ordre des `require_once`. |
| 4 | tp3-setup-1 / tp3-setup-2 | MINEUR | « Copiez-y le dossier `pochettes/` de votre TP2 » | Aucun deviné. Hors TP : le lien de l'archive est un lien `/download/...` et les fichiers sont dans `/work/fournis` (limite d'environnement). | 0 | RAS. |
| 5 | tp3-cview-2 | MINEUR | « Passez les textes et attributs issus des objets dans `htmlspecialchars()` » | Pour `getYear()` (un int) j'ai écrit `htmlspecialchars((string) $album->getYear())`, parce que le cours n'enseigne pas `strict_types` ni les conversions. Sans cast, ça marche aussi hors `strict_types`. Le support ne dit pas si échapper un entier est attendu. De même, `getAvatarUrl()` peut renvoyer `null` : `htmlspecialchars(null)` est déprécié en PHP 8.1+, mais aucun artiste n'a `null` avant le bonus 2. | 1 min | Préciser « les entiers n'ont pas besoin d'être échappés » ou donner l'exemple. |
| 6 | tp3-extract-1 / tp3-index-3 | MINEUR | « Ouvrez `index.php` : l'onglet affiche « Onzer — Toute ta musique » » | À l'étape index-2, `render('index')` ne transmet aucun `pageTitle`, et `view_index.php` le code en dur : ça marche. À l'extraction, `header.php` lit `$pageTitle` et l'action l'ajoute (étape extract-4) : cohérent mais à lire attentivement. | 0 | RAS. |
| 7 | tp3-extract-1 | MINEUR | « Faites afficher le menu seulement si `($authLayout ?? true)` vaut `true` » | `??` est connu (section 2), mais la syntaxe alternative `if (...): ... endif;` vient du cours : OK. Je l'ai utilisée dans `header.php` (source : cours, bloc `a113612b`). | 0 | RAS. |
| 8 | tp3-extract-4 | MINEUR | « Remplacez l'enveloppe HTML … par les `require` de `header.php` au début et de `footer.php` à la fin » | Le chemin des `require` dans `views/` n'est pas donné : j'ai pris `__DIR__ . '/header.php'` d'après le cours (`<?php require __DIR__ . '/header.php'; ?>`, bloc `df777c13`). | 0 | RAS. |
| 9 | tp3-recap-tree | MINEUR (limite d'export) | arborescence non rendue | Je me suis fié au texte pour placer les fichiers. | 0 | RAS. |

## Temps (barème fixe)
Lecture du TP en une fois : 2039 mots ≈ 10,2 min, arrondi 11 min (réparti sur les exercices ci-dessous pour le démarrage, non ajouté deux fois).
| Exercice | Détail du calcul | Total | Démarrage | Statut |
|---|---|---|---|---|
| Lecture TP complète | 2039 mots / 200 | 11 min | — | fait |
| Mise en place | 4 commandes = 80 s ; exécution 10 s ; vérification 30 s | 2 min | 1 min | fini |
| ex-index | 5 lignes copiées 10 s chacune = 50 s ; 2 commandes = 40 s ; exécution 10 s ; vérification 30 s | 3 min | 1 min | fini |
| ex-catalog-title | 5 lignes à recopier = 50 s ; 2 commandes = 40 s ; exécution 10 s ; vérif 30 s | 3 min | 1 min | fini |
| ex-entities | 56 lignes non vides écrites (Artist 30 + Album 26) = 28 min ; 2 commandes = 40 s ; exécution 10 s ; erreur à corriger 0 ; hésitation (remarque 2) +3 min ; vérif 30 s | 33 min | 1 min 30 s | fini |
| ex-catalog-file | 1 commande = 20 s ; exécution 10 s ; vérif 30 s | 1 min | 0 min 30 s | fini |
| ex-catalog-view | 10 lignes dans list_albums.php (9 non vides) = 4,5 min ; 20 lignes modifiées/ajoutées dans la vue = 10 min ; 3 commandes = 1 min ; 1 recherche cours (foreach alternatif) = 1 min ; exécution 10 s ; vérif 30 s | 17 min | 1 min 30 s | fini |
| ex-player | play_track.php 11 lignes = 5,5 min ; vue : environ 12 lignes modifiées = 6 min ; 3 commandes = 1 min ; lecture bloc de code 112 lignes × 6 s = 11 min ; exécution 10 s ; vérif 30 s | 24 min | 1 min | fini |
| ex-extract | header 17 lignes, footer 4 lignes, player_footer par déplacement = 11 min ; remplacement des enveloppes 3 vues, environ 6 commandes = 2 min ; index.php 1 ligne = 30 s ; hésitation footer (remarque 1) +3 min ; 3 pages vérifiées = 1,5 min ; exécution 10 s | 18 min | 1 min | fini |
Total tronc commun : 112 min (budget 160 min) — aucun exercice bloqué ; remarque : j'ai ajouté 11 min de lecture et 3 + 3 min d'hésitation (déjà comptés ci-dessus).

## Bilan des notions du brief (mode lecture)
Sans objet (mode exécution).

## Définition de terminé
- ✔ mode exécution : chaque exercice mené au bout (8 sur 8, pas de blocage), temps calculé par exercice (8 sur 8)
- ✔ chaque étape du journal cite sa source ou est marquée « aucune source » (26 étapes, 20 sourcées, 6 devinées ou semi-devinées : n° 8, 9, 10, 13, 14, 20)
- ✔ aucun fichier laissé hors de /work/<dossier>. `ls /work` : depart fournis fragile-cours fragile-tp rapide supports (le serveur écrit dans la sortie standard ; aucun fichier créé hors de fragile-tp, hormis la capture automatique `/work/rendu.png` de `rendu-html`).
- Captures : `rendu-html` écrit toujours `/work/rendu.png` (écrasée à chaque appel) ; dernière capture : play_track.php.

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | mkdir onzer, images/, core/, views/, entities/ | tp3-setup-1, tp3-setup-3, tp3-index-1, tp3-entities-1 | dossiers créés |
| 2 | copie du dossier pochettes-tp2 vers images/pochettes | tp3-setup-1 | 6 pochettes présentes |
| 3 | copie de css/ et images/artists (équivalent de l'extraction du zip) | tp3-setup-2 | présents |
| 4 | functions.php copié sous core/ | tp3-setup-3 | ok |
| 5 | view_index.php copié sous views/ | tp3-index-1 | ok |
| 6 | création de index.php avec `require_once __DIR__ . '/core/functions.php'` + `render('index')` | tp3-index-2 | ok |
| 7 | lancement `php -S localhost:8000` + `rendu-html` sur index.php | consigne du prompt + tp3-index-3 | titre et contenu conformes, aucune erreur |
| 8 | `docker exec -d` refusé par la garde, relance avec `run_in_background` | aucune source (spécifique au bac) | ok |
| 9 | view_list_albums.php copié sous views/ | tp3-ctitle-1 | ok |
| 10 | catalog.php copié dans core/ avant l'étape du TP (par commodité, avec les autres fichiers fournis) | tp3-catalog-1 (mais ordre non respecté) | ok |
| 11 | list_albums.php avec `render('list_albums', ['pageTitle' => 'Catalogue — Onzer'])` | tp3-ctitle-2 | ok |
| 12 | vérification de la page : titre, Loopal, Rootkit 2019 | tp3-ctitle-3 | conforme |
| 13 | écriture des classes Artist et Album (constructeurs promus, getters) | tp3-entities-table, curriculum:2:« constructeur et propriétés promues », « getters », « ?string » ; noms `getName/getTitle/getYear/getArtist/getCoverUrl/getAlbums/ajouterAlbum` : aucune source dans le TP (seul catalog.php et les vues les imposent) | ok |
| 14 | `getAvatarUrl()` renvoie `null` si pas de portrait | tp3-entities-table | ok |
| 15 | `getCoverUrl()` : `POCHETTES_BASE_URL . $this->fileName`, suppression de BASE_URL | tp3-entities-3 | ok |
| 16 | `require_once` de core/catalog.php, `$albums = getAllAlbums();` `$artists = getAllArtists();`, transmission à render | tp3-cview-1 | ok |
| 17 | foreach artistes et albums dans la vue, avec `htmlspecialchars` et `aria-label` | tp3-cview-2, cours bloc `5a54b56b` | ok |
| 18 | vérification : 4 portraits, 6 cartes dans l'ordre | tp3-cview-3 | conforme |
| 19 | play_track.php : require_once, `getAlbumById(4)`, `$trackIndex = 1`, `$track = ...`, render avec 5 clés | tp3-player-2, tp3-player-3, tp3-player-4 | ok |
| 20 | vue du lecteur : remplacement des valeurs en dur, `foreach ... as $index => $t`, `active` si `$index === $trackIndex` | tp3-player-5, tp3-player-6, tableau tp3-player-table | ok ; le `count()` ajouté tel quel dans le HTML (aucun pluriel géré), `<?= ... ?>` du cours |
| 21 | vérification de play_track.php | tp3-player-7 | conforme (barre 03:54, ligne 2 active) |
| 22 | header.php avec `($authLayout ?? true)` et choix de la classe de `<main>` | tp3-extract-1, cours `a113612b` | ok |
| 23 | footer.php : `</main>`, ligne conditionnelle player_footer, `</body></html>` | tp3-extract-2 (code absent) : condition reprise du view_list_albums.php fourni | ok, devinée en partie |
| 24 | player_footer.php : déplacement du `<footer class="onzer-player">` | tp3-extract-3 | ok |
| 25 | remplacement de l'enveloppe des 3 vues par `require __DIR__ . '/header.php'` / `footer.php` | tp3-extract-4, cours `df777c13` | ok |
| 26 | index.php : `render('index', ['pageTitle' => ..., 'authLayout' => false])` ; vérification des 3 pages | tp3-extract-4, tp3-extract-5 | conforme (accueil sans menu, catalogue avec menu sans barre, lecteur avec menu et barre) |

Fichiers du projet (/work/fragile-tp/onzer/) : index.php, list_albums.php, play_track.php, core/{functions,catalog}.php, entities/{Artist,Album}.php, views/{header,footer,player_footer,view_index,view_list_albums,view_player}.php, css/onzer.css, images/{artists,pochettes}.

Limites d'environnement : woody/public_html (projet construit dans /work/fragile-tp/onzer/), état initial TP2 absent (Artist/Album réécrites), code de footer.php et arborescence absents de l'export, Bootstrap et FontAwesome servis par CDN (FontAwesome n'est pas Bootstrap Icons : les icônes `fa-solid` peuvent ne pas s'afficher dans le bac, texte non affecté).


---

## PHP 3 — étudiant rapide TP

# Étudiant rapide : php/3-structurer-son-code — TP
Statut du rapport : terminé (avec les réserves des remarques 1 à 3)
Conteneur : cours-iut-bac-php-3-structurer-son-code-20261027-094328, dossier /work/rapide (projet : /work/rapide/onzer)

## Liste de tâches
- [x] ex-1 Mise en place (tp3-sec-setup)
- [x] ex-2 Accueil index.php (tp3-sec-index)
- [x] ex-3 Catalogue, titre (tp3-sec-catalog-title)
- [x] ex-4 Entités Artist et Album (tp3-sec-entities)
- [x] ex-5 core/catalog.php (tp3-sec-catalog-file)
- [x] ex-6 Afficher le catalogue (tp3-sec-catalog-view)
- [x] ex-7 Lecteur play_track.php (tp3-sec-player)
- [x] ex-8 Extraire header.php et footer.php (tp3-sec-extract)
- [x] ex-9 Arborescence et vérification (tp3-sec-recap)
- [x] bonus-1 (tp3-bonus-1)
- [x] bonus-2 (tp3-bonus-2)
- [x] bonus-3 (tp3-bonus-3)
- [x] temps restant
- [x] bilan des bonus

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp3-bonus-1, tp3-bonus-3 | MAJEUR | « À faire si vous avez fini avant la fin de la séance » | Rien : les deux bonus sont faisables avec le cours. Mais les trois bonus font 9 min au barème pour 92 min restantes. | 83 min de temps restant non occupé (> 10 min) | Ajouter des bonus plus substantiels et enseignés. Exemples : une page de détail d'artiste listant `getAlbums()`, un `view_artist.php` réutilisant header/footer, un total des durées de l'album, ou un `Track` objet à la place du tableau. |
| 2 | tp3-bonus-2 | BLOQUANT | « affichez à la place un cercle contenant les initiales de l'artiste » | Extraire les initiales demande `explode`, `mb_substr` et `mb_strtoupper`. Aucune de ces fonctions n'est dans le cours (tp3 cours.md) ni dans le curriculum (sections 1 et 2). J'ai donc deviné 2 étapes : découper le nom en mots, puis prendre et mettre en majuscule la première lettre. | 2 min (+2 min devinées au barème) | Donner la fonction dans le TP (« utilisez `mb_substr($name, 0, 1)` »). Ou limiter la consigne à la première lettre, ou à une initiale fournie par une méthode `getInitials()` déjà écrite. Ou enseigner les fonctions de chaînes au cours. |
| 3 | tp3-extract-2 (limite d'export) | Hors gravité (tronc commun, résolu en devinant) | « les balises fermantes du document : » (code non rendu) | Le contenu de `footer.php`. Je l'ai reconstitué depuis la phrase du TP et la fin des vues fournies : `</main>`, `require` de `player_footer.php` si `!empty($showPlayerFooter)`, `</body></html>`. | 1 min (étape devinée) | Vérifier que le bloc de code est exporté. |
| 4 | tp3-bonus-1 | MINEUR | « essayez `getAlbumById(5)` et `$trackIndex = 2` » | Rien | – | Trivial (1 min) et redondant avec la vérification de l'ex-7. À remplacer ou à fusionner avec un bonus plus riche (voir remarque 1). |
| 5 | tp3-bonus-3 | MINEUR | « si `$albums` est vide… » | Rien | – | 3 min seulement. Redondant avec la syntaxe alternative `if/else/endif` du cours (struct-render, bloc `b79ea767…`). |
| 6 | tp3-entities-txt | Hors gravité (limite d'environnement) | « Copiez la classe `Artist` de `catalogue.php` du TP2 » | Le TP2 n'était pas fourni. J'ai réécrit les getters `getName`, `getTitle`, `getYear`, `getArtist`, `getCoverUrl`, ainsi que `ajouterAlbum` et `getAlbums`, déduits de `core/catalog.php` fourni. Les noms viennent de catalog.php et de la vue, pas du TP2. | 0 (non compté au-delà de la limite) | Aucune. |
| 7 | tp3-bonus-2 | MINEUR (cohérence) | « remplacez le fichier d'avatar de Loopal par `null` » | Le test `getAvatarUrl() !== null` doit venir avant `htmlspecialchars()`. Sinon on passe `null` à `htmlspecialchars` (dépréciation PHP 8.1+). Le TP ne le dit pas. | – | Le préciser dans la consigne. |

Note sur l'environnement : `rendu-html` a écrit sa capture dans `/work/rendu.png`, hors de `/work/rapide`. Je l'ai supprimée (voir `ls /work` plus bas).

## Temps (barème fixe)
| Exercice ou bonus | Détail du calcul | Total | Statut |
|---|---|---|---|
| Lecture du cours | 1908 mots / 350 = 5,5 min, plus 5 retours au cours × 20 s = 100 s | 7 min | ok |
| ex-1 Mise en place | prose 200 mots = 36 s ; 6 commandes = 48 s ; exécution 10 s ; vérification 10 s ; total 104 s | 2 min | ok |
| ex-2 Accueil | prose 38 s ; 3 lignes écrites = 36 s ; 2 commandes = 16 s ; exécution 10 s ; vérification 10 s ; total 110 s | 2 min | ok |
| ex-3 Catalogue, titre | prose 31 s ; 3 lignes = 36 s ; 2 commandes = 16 s ; exécution 10 s ; vérification 10 s ; total 103 s | 2 min | ok |
| ex-4 Entités | prose 57 s ; ~55 lignes écrites × 12 s = 660 s ; 3 commandes = 24 s ; exécution 10 s ; vérification 10 s ; total 761 s | 13 min | ok |
| ex-5 catalog.php | prose 17 s ; lecture de 110 lignes × 2 s = 220 s ; 1 commande = 8 s ; vérification 10 s ; total 255 s | 5 min | ok |
| ex-6 Afficher le catalogue | prose 57 s ; lecture de la vue 70 lignes = 140 s ; 5 lignes de l'action = 60 s ; 23 lignes de la vue = 276 s ; 3 commandes = 24 s ; exécution 10 s ; vérification 10 s ; total 577 s | 10 min | ok |
| ex-7 Lecteur | prose 77 s ; lecture de la vue 120 lignes = 240 s ; 14 lignes de l'action = 168 s ; 22 lignes de la vue = 264 s ; 4 commandes = 32 s ; exécution 10 s ; vérification 10 s ; total 801 s | 14 min | ok |
| ex-8 Extraction | prose 57 s ; header : 4 lignes écrites + 18 recopiées = 120 s ; footer : 4 lignes = 48 s ; player_footer : 35 lignes déplacées = 140 s ; 3 vues × 2 lignes = 72 s ; index.php 12 s ; 6 commandes = 48 s ; exécution 10 s ; vérification 10 s ; étape devinée (footer) 60 s ; total 577 s | 10 min | ok |
| ex-9 Vérification | prose 17 s ; 3 pages × 10 s ; commandes 16 s ; total ~63 s | 1 min | ok |
| bonus-1 | prose 7 s ; 2 lignes = 24 s ; 1 commande = 8 s ; exécution 10 s ; vérification 10 s ; total 59 s | 1 min | ok |
| bonus-2 | prose 12 s ; catalog 12 s ; vue 10 lignes = 120 s ; 2 commandes = 16 s ; exécution 10 s ; vérification 10 s ; 2 étapes devinées = 120 s ; total 300 s | 5 min | ok, avec devinettes |
| bonus-3 | prose 9 s ; 4 lignes = 48 s ; test temporaire 2 × 12 = 24 s ; 3 commandes = 24 s ; exécution 10 s ; vérification 10 s ; total 125 s | 3 min | ok |

Tronc commun : 7 + 2 + 2 + 2 + 13 + 5 + 10 + 14 + 10 + 1 = 66 min. Budget TP : 160 min. Temps restant : 94 min.
Bonus : 1 + 5 + 3 = 9 min → occupent le temps restant : non (écart de 85 min non occupées). Le temps étant hors budget, je note seulement que les bonus ne sont pas trop longs.

## Bilan des bonus
| Bonus | Notions utilisées (source) | Notion non enseignée ? | Résultat face à l'annoncé |
|---|---|---|---|
| 1 | `getAlbumById`, indice de tableau, `render()` (tp3-player-3, tp3-player-4) | Non | Conforme. Titre « Waking Up in Vagrant — Onzer », pochette, ligne 3 active et barre fixe (03:22) changent ensemble. |
| 2 | `null` dans catalog.php (curriculum:2:« ?string »), `if/else` en syntaxe alternative (cours `b79ea767…`), `foreach` (cours `8eee3844…`) ; **`explode`, `mb_substr`, `mb_strtoupper` : aucune source** | **Oui** (fonctions de chaînes) | Conforme au résultat annoncé. Un `<div class="artist-avatar">L</div>` s'affiche pour Loopal, mais seulement grâce aux fonctions devinées. |
| 3 | `count()` (curriculum:1:« count »), `if/else/endif` (cours `b79ea767…`) | Non | Conforme. `<div class="alert alert-info">Aucun album pour le moment.</div>` s'affiche et aucune `album-card` n'est produite avec `$albums = []`. L'essai a été remis à `getAllAlbums()` ensuite. |

## Définition de terminé
- ✔ tout le TP terminé, bonus compris : 9 exercices sur 9, 3 bonus sur 3. Blocages signalés : notion non enseignée au bonus 2 (remarque 2) et code de footer.php non exporté (remarque 3).
- ✔ temps total et temps restant : tronc commun 66 min, bonus 9 min ; temps restant 160 − 66 = 94 min.
- ✘ chaque bonus vérifié (temps restant occupé, aucune notion non enseignée) : 2 sur 3 sans notion non enseignée (1 et 3) ; le bonus 2 exige des fonctions de chaînes non enseignées. Le temps restant n'est pas occupé (9 min sur 94).
- ✘ journal d'étapes sourcé : 27 étapes, 24 sourcées, 3 devinées ou sans source. Les deux fonctions de chaînes du bonus 2 comptent comme 1 étape dans le journal mais 2 au barème (+2 min).
- ✔ aucun fichier hors de /work/rapide : `ls /work` donne `depart fournis fragile-cours fragile-tp rapide supports` (la capture `/work/rendu.png` a été supprimée).

Verdict global : les bonus ne remplissent pas le temps restant (MAJEUR), le bonus 2 sort des notions enseignées (BLOQUANT), et les bonus 1 et 3 sont triviaux (MINEUR).

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | Création de `images/` et de `core/` ; copie des pochettes et des ressources | tp3-setup-1, tp3-setup-2, tp3-setup-3 | ok |
| 2 | `functions.php` placé dans `core/` | tp3-setup-3 | ok |
| 3 | `views/view_index.php` placé | tp3-index-1 | ok |
| 4 | `index.php` : `require_once` puis `render('index')` | tp3-index-2, cours `93a8ff7d…` | ok |
| 5 | `views/view_list_albums.php` placé | tp3-ctitle-1 | ok |
| 6 | `list_albums.php` avec le titre | tp3-ctitle-2 | ok |
| 7 | `Artist` réécrite (propriétés promues, `?string`, getters) | tp3-entities-table, curriculum:2:« propriétés promues » | ok |
| 8 | `Album` réécrite avec `POCHETTES_BASE_URL` et `getTracks()` | tp3-entities-3, curriculum:2:« composition » | ok |
| 9 | `getName`, `getTitle`, `getYear`, `getArtist`, `getCoverUrl`, `ajouterAlbum`, `getAlbums` | curriculum:2:« getters » et usage dans catalog.php | ok (noms déduits, limite d'environnement) |
| 10 | `core/catalog.php` placé | tp3-catalog-1 | ok |
| 11 | `list_albums.php` : `require_once`, appels de `getAll*`, `render` avec 3 clés | tp3-cview-1 | ok |
| 12 | Boucle `foreach` des artistes dans la vue | tp3-cview-2, cours `8eee3844…` | ok |
| 13 | Boucle `foreach` des albums, `aria-label`, `htmlspecialchars` | tp3-cview-2, tp3-cview-warning | ok, 6 cartes dans l'ordre |
| 14 | `view_player.php` placé | tp3-player-1 | ok |
| 15 | `play_track.php` : `getAlbumById(4)`, `$trackIndex = 1`, `$track` | tp3-player-3 | ok |
| 16 | `render('player', [...])` avec 5 clés | tp3-player-4 | ok |
| 17 | En-tête, pochette, barre fixe et `count()` | tp3-player-table, tp3-player-5, curriculum:1:« count » | ok |
| 18 | Boucle `foreach ... as $index => $t` avec classe `active` | tp3-player-6 | ok |
| 19 | Vérification du lecteur (`rendu-html` : « Laissez compiler — Onzer », 03:54) | tp3-player-7 | ok |
| 20 | `header.php` avec menu conditionnel `($authLayout ?? true)` et classe de `<main>` | tp3-extract-1, curriculum:2:« ?? » | ok |
| 21 | `footer.php` | tp3-extract-2 (code non rendu) | **deviné** |
| 22 | `player_footer.php` déplacé | tp3-extract-3 | ok |
| 23 | Enveloppes remplacées par `require`, `index.php` avec `authLayout => false` | tp3-extract-4, cours `47c9ea7d…` | ok |
| 24 | Vérification des trois pages : accueil sans menu, barre fixe seulement sur le lecteur | tp3-extract-5 | ok |
| 25 | Bonus 1 : `getAlbumById(5)`, `$trackIndex = 2` | tp3-bonus-1 | ok |
| 26 | Bonus 2 : `null` pour Loopal ; initiales avec `explode`, `mb_substr`, `mb_strtoupper` | tp3-bonus-2 ; fonctions : **aucune source** | **deviné** ; résultat « L » |
| 27 | Bonus 3 : `count($albums) === 0` puis alerte | tp3-bonus-3, cours `b79ea767…` | ok |


---

## PHP 4 — collecteur

# Fiche de contexte : php/4-formulaire
Statut du rapport : incomplet (un seul critère ✘ : budgets calculés, cause : courseIntroMinutes absent en prod)

## Liste de tâches
- [x] 1. list_modules : faite
- [x] 2. get_module (php) : faite
- [x] 3. list_sections (php) : faite
- [x] 4. get_section (4-formulaire) : faite
- [~] 5. get_content : slide faite (get_content direct) ; cours et TP non faits en direct : sortie > limite (77 811 caractères / 1 567 lignes ; 81 742 / 1 809). Remplacés par export_content_compact (voir Contenus). Fichiers de sortie sauvegardés illisibles : aucun outil Read/Grep chargeable.
- [x] 6. get_project_reference : tenté, échec « connect ECONNREFUSED 172.22.0.2:443 » (dépôt de référence indisponible)
- [x] 7. repli export TP précédents (sections 1, 2, 3) : fait
- [x] 8. list_verdicts : fait (sans filtre, puis format cours et slide)
- [x] 9. list_exemplars : fait pour cours, TP, slide (sans filtre : aucun)
- [x] 10. list_block_types : fait
- [ ] 11. search_content : non faite, aucun point précis à vérifier n'a été demandé

## Budgets (à lire en premier)
- Cause : courseIntroMinutes est null dans get_section ET dans list_sections. Valeur absente en prod, pas un échec de collecte.
- Cours + slides : courseIntroMinutes = null → non calculable. Calcul partiel : 2 × 180 = 360 min de séance ; 360 − courseIntroMinutes (null) : impossible.
- TP : 2 × 180 − courseIntroMinutes (null) → non calculable ; plage 80–100 % : non calculable.
- Ne pas reprendre les 30 min de intro des notes de la section 5 (« 2 × 180 − 30 »), elles concernent une autre section.

## Module
- slug : php ; titre : PHP ; sessionDurationMinutes : 180 (get_module et list_modules) ; order 2.
- description : « R3.01 Développement WEB » ; associatedSae : S3.01 : Développement d'une Application.
- universe : non disponible (aucun champ universe pour php dans get_module ni list_modules ; seul rust en a un).
- exampleDomain : « Recettes de cuisine » : « Petite appli de recettes (Recette, Ingrédient, Auteur), utilisée uniquement pour illustrer le cours — jamais d'albums, d'utilisateurs Onzer ou de catalogue musical dans les exemples. »
- projectSpec (résumé fidèle) : nom Onzer ; app PHP procédurale, une action par fichier à la racine ; entités User, Artist, Album ; repositories via Singleton PDO/PostgreSQL ; sessions ; CRUD albums ; création d'artistes (sans liste/édition/suppression) ; morceaux (titre + durée) en JSON ; Bootstrap 5.3.8 + Font Awesome ; pages Home, Player, Auth, CRUD Albums, Artistes ; statut du projet : draft ; referenceRepo : https://git.salimkhraimeche.dev/projet/projet-reference-php, status validated (non consulté, get_project_reference en échec).

## Section
- slug 4-formulaire ; titre « Formulaire » ; rang : order 4 sur 11 sections du module (position 3 dans le tableau list_sections).
- description : « Création et traitement des formulaires HTML en PHP, avec validation et sécurisation des données saisies. »
- objectives : Traiter des formulaires HTML en PHP ; Récupérer des données avec GET et POST ; Valider et sécuriser les entrées utilisateur ; Afficher des messages d'erreur adaptés.
- totalDuration : 2 ; courseIntroMinutes : null (absent)
- brief : PRÉSENT. brief.objectives vide (les objectifs sont au niveau section).
  - notions (8, verbatim) : « $_GET / $_POST, lecture avec ?? et valeur par défaut » ; « Test de la méthode de la requête ($_SERVER['REQUEST_METHOD']) » ; « Champs à choix : radio, checkbox, select, select multiple ; name="x[]" et tableau en POST » ; « Validation côté serveur : tableau $errors, liste de valeurs autorisées, mb_strlen » ; « Réaffichage des valeurs saisies » ; « htmlspecialchars et faille XSS » ; « Paramètres d'URL sans formulaire et réponse 404 (http_response_code) » ; « Tableaux parallèles track[] / duration[] recollés par rang ».
  - filRougeStep (verbatim) : « Partie classique : un formulaire d'inscription à un hackathon (recherche GET, inscription POST, champs à choix, validation, enregistrement dans un fichier JSON via des fonctions fournies, échappement). Partie Onzer, à partir de l'état final du TP3 : exercice « Rappel » qui ajoute la vue views/view_404.php fournie (elle fixe elle-même son titre d'onglet) ; header.php gère trois mises en page (onzer-main, auth-page, auth-page home-page via $homeLayout) et son menu gagne quatre liens (Ajouter un album, Ajouter un artiste, Connexion, Inscription) ; play_track.php lit album_id et track dans l'URL et répond 404 ; les liens des cartes du catalogue et des lignes du lecteur portent ces paramètres ; login.php et create_user.php comparent la saisie aux deux comptes en dur de core/users.php (findUserByEmail, mots de passe en clair) ; create_artist.php (trois règles, doublon casse ignorée) ; create_album.php et update_album.php partagent views/view_album_form.php et core/validation.php (validateAlbum, cinq règles, champs track[]/duration[]). Rien n'est enregistré : un message de succès s'affiche et les données disparaissent avec la réponse. »
  - filRougeOutcome (verbatim) : « index.php, list_albums.php et play_track.php (paramètres d'URL, 404), login.php, create_user.php, create_artist.php, create_album.php et update_album.php fonctionnent sur le catalogue en mémoire de core/catalog.php et les comptes de core/users.php ; views/view_404.php, views/view_login.php, views/view_create_user.php, views/view_artist_form.php, views/view_album_form.php et core/validation.php existent ; le menu affiche Catalogue et quatre liens en permanence (rendus conditionnels en section 7). »
  - providedBase (verbatim) : « L'état final du TP3 (entités, core/catalog.php, core/functions.php, vues header/footer/player_footer/index/list_albums/player). Fournis par le TP : stockage.php et equipes.json (partie classique), views/view_404.php, core/users.php, et les vues login, create_user, artist_form et album_form avec leurs commentaires d'emplacement du formulaire. »
  - notes (verbatim) : « Le TP a dépassé l'ancien brief (cinq champs morceau[] sans durée, création d'album seule) : il construit aussi la connexion, l'inscription, la modification d'album et la durée des morceaux en tableaux parallèles. Les liens du menu mènent à des pages créées au fil du TP. Le formulaire d'inscription porte novalidate pour que la règle sur l'email reste testable. Point de vigilance en séance : les formulaires Onzer n'enregistrent rien, le dire dès le début. »
- curriculum actuel de la section : null (absent).

## Contenus de la section
| Support | Source | Blocs | Exercices / bonus |
|---|---|---|---|
| cours | db | 134 : comptage manuel des marqueurs `<!--id-->` de export_content_compact (get_content hors limite ; ±2 possible) | — |
| TP | db | 149 : comptage manuel des marqueurs de export_content_compact (même réserve) | 11 exercices + 2 étapes de préparation + 5 bonus (détail ci-dessous) |
| slide | db | 105 : 30 slides de niveau 1 + 71 enfants directs + 4 imbriqués (2 column, 1 diagram, 1 slide-code dans slide4-flow), comptés sur le JSON de get_content | — |

Détail TP (ids = marqueurs d'export) :
- Partie classique (hackathon) : tp4-ex1 Rechercher une équipe ; tp4-ex2 Inscrire une équipe ; tp4-ex3 Compléter le formulaire ; tp4-ex4 Valider la saisie ; tp4-ex5 Échapper les saisies. (5 exercices)
- Partie Onzer, étapes de préparation : 78378c03 « Rappel » (view_404) ; bb8683f8 « Mise en place ».
- Partie Onzer, exercices : 94a74efd « Lire l'URL et répondre 404 » ; 3deef7ae « Se connecter » ; 9702af6b « S'inscrire » ; 5fe64482 « Créer un artiste » ; 225ff249 « Créer un album » ; 1ff07309 « Modifier un album ». (6 exercices)
- Bonus (5) : 19992953 « Nom déjà pris » ; a58304dd « Recherche mémorisée » ; 6a3a1014 « Deux ateliers au plus » ; 8fcc9986 « Un message par champ » ; d335e97d « Doublon de morceau ».
- Fichiers fournis (download-file, absents de l'export) : tp4-a-download (stockage.php), fb697916 (equipes.json), f30b0c40 (view_404.php), ef1756c4 (users.php), 66356f40 (view_login.php), 1701ef3c (view_create_user.php), 38e5bec4 (view_artist_form.php), adfd360e (view_album_form.php).
- Vérification : 3 blocs slide-text vides (ebfad59c, 57620728, abcd6483) ; cours : 0 slide-text vide relevé.

## Curriculum des sections précédentes (ordre croissant)
- 1-bases-du-php (order 1) : curriculum ABSENT (champ non présent dans list_sections : signalé). Notions (brief, verbatim) : Syntaxe PHP ; echo ; Variables et types ; Tableaux indexés ; Structures de contrôle (if/elseif/else, switch, match) ; Boucles (for, foreach, while) ; Fonctions : déclaration, paramètres obligatoires et optionnels, typage, return, portée. filRougeOutcome : « Pas d'incrément du fil rouge Onzer à ce stade… Onzer entre en scène en section 2. » ; apis : non disponible (pas de curriculum).
- 2-programmation-orientee-objet (order 2) : curriculum null (signalé). Notions (brief) : Tableaux associatifs ; Tri et filtre de tableaux ; Classes et objets ; Constructeur à propriétés promues ; Encapsulation (propriétés privées, getters). filRougeOutcome (verbatim) : « Une page affiche le catalogue d'albums, trié et filtré ; entities/Album.php et entities/Artist.php existent et le catalogue manipule des objets au lieu de tableaux associatifs. Toujours sans base de données. » apis : non disponible.
- 3-structurer-son-code (order 3) : curriculum null (signalé). Notions (brief) : Séparation logique / affichage ; Fonctions utilitaires partagées (render, redirect) ; Header et footer partagés (require) ; Page statique puis page alimentée par des données ; Entités enrichies : id, morceaux, fichier d'avatar ; Constante partagée POCHETTES_BASE_URL. filRougeOutcome (verbatim) : « index.php, list_albums.php et play_track.php fonctionnent avec un catalogue en mémoire, sans base de données, sans $_GET et sans session. core/functions.php (render, redirect, POCHETTES_BASE_URL), entities/Artist.php, entities/Album.php, core/catalog.php et les vues header, footer, player_footer, index, list_albums et player existent et sont réutilisés pour la suite. » apis : non disponible.

## État du fil rouge avant la section
- source : get_project_reference ÉCHEC (« connect ECONNREFUSED 172.22.0.2:443 ») → repli : export_content_compact des TP 1, 2, 3 (+ filRougeOutcome des sections 2 et 3).
- Fichiers et fonctions existants à l'entrée de la section (état après TP3, d'après brief et export) : index.php, list_albums.php, play_track.php (album et morceau fixés en dur, pas de $_GET, pas de session) ; core/functions.php (render, redirect, POCHETTES_BASE_URL) ; core/catalog.php (getAllArtists, getAllAlbums, getAlbumById) ; entities/Artist.php (id, name, avatarFile, albums ; getAvatarUrl) ; entities/Album.php (id, title, year, artist, fileName, tracks ; getCoverUrl, getTracks) ; views header.php, footer.php, player_footer.php, view_index.php, view_list_albums.php, view_player.php ; css/onzer.css ; images/pochettes/ et images/artists/. Nom de version : non disponible (aucun champ de version pour php ; updatedAt du module 2026-10-25).
- Ce que la section doit y ajouter (filRougeStep) : voir le brief ci-dessus. Résumé : views/view_404.php ; header.php à trois mises en page et quatre liens de menu ; play_track.php lit album_id et track et répond 404 ; liens des cartes et du lecteur avec paramètres ; login.php, create_user.php (core/users.php, comptes en dur) ; create_artist.php ; create_album.php et update_album.php avec view_album_form.php et core/validation.php ; rien n'est enregistré.
- Ce qui est fourni et ce qui est à écrire par l'étudiant : fourni (download-file) : view_404, users.php, view_login, view_create_user, view_artist_form, view_album_form, stockage.php, equipes.json. À écrire (consignes seulement) : header.php, footer.php, player_footer.php, list_albums.php, play_track.php, entités enrichies, si l'état précédent n'est pas dans le dépôt.
- État initial reconstituable pour un bac à sable : PARTIEL. Oui pour les fichiers fournis (contenu dans la propriété code des blocs download-file, lisible par get_content, non par export_content_compact). Non pour les fichiers écrits par l'étudiant aux sections 1 à 3 (décrits seulement par consignes).

## Verdicts actifs par format
- cours : aucun (list_verdicts format=cours : []).
- slide : aucun (list_verdicts format=slide : []).
- TP (6 verdicts, tous format TP) :
  - 6ac67a63137711fbe6236783 (2026-10-07, module php) : « "Le TP ne guide pas trop les etudiants ?" (TP4 Formulaire, partie Onzer). Règle validée : dans la partie fil rouge, seul le premier exercice d'un geste nouveau est guidé pas à pas ; à partir du deuxième, ne garder que le contrat (fichiers, name des champs, variables transmises, règles et messages verbatim, tableau des essais attendus) et une ou deux consignes. Ne pas paraphraser ce que les commentaires des fichiers fournis disent déjà. Pas de code de solution dans les astuces : un indice replié qui donne le principe et le piège. »
  - 6ac3edecd38d537522ddd73e (2026-10-05, php) : « retire ce genre de commentaire : "Il n'y a ni session ni base de données à ce stade :" »
  - 6a9c32df5d2dd2e6d3b1e55c (2026-09-05, sans module) : « il y a toujours la repetition sur le squeette »
  - 6a9c32e15d2dd2e6d3b1e55d (2026-09-05, sans module) : « Téléchargez le squelette si dessus .... »
  - 6a9c32e45d2dd2e6d3b1e55e (2026-09-05, sans module) : « retire le Vous avez terminé quand et "Exercice x —" des TPs 1 et 2 »
  - 6a9c32e65d2dd2e6d3b1e55f (2026-09-05, sans module) : « comme sur le TP1, regarde l'affichage de la reponse sur les calculs qui son a réaliser — précision ensuite : pour moi, c'est utile uniquement sur la 8 »

## Exemplaire par format
- cours : aucun (list_exemplars format=cours : []).
- TP : aucun (list_exemplars format=TP : []).
- slide : aucun (list_exemplars format=slide : []).

## Registre des blocs (29 types)
file-tree, text, section, list, list-item, columns, column, callout, collapsible, image-card, table, section-card, code, code-with-preview, input-card, diagram, download-file, quote, divider, slide, slide-text, slide-code, slide-list, slide-list-item, slide-note, slide-table, slide-image, slide-transition, slide-code-with-preview

## Signalements
- BUDGET : courseIntroMinutes null (get_section et list_sections) : budgets non calculables. Cause : valeur absente en prod, pas un échec de collecte.
- get_project_reference : « connect ECONNREFUSED 172.22.0.2:443 » : dépôt de référence indisponible. Repli appliqué (export TP 1, 2, 3).
- get_content cours : « Error: result (77 811 characters across 1 567 lines) exceeds maximum allowed tokens » ; get_content TP : « Error: result (81 742 characters across 1 809 lines) exceeds maximum allowed tokens ». Fichiers de sortie non lisibles (aucun outil Read/Grep chargeable : ToolSearch « select:Read,Grep » sans résultat). Comptage par marqueurs d'export.
- Sources des 3 supports : toutes en db (pas de contenu file pour 4-formulaire). Slides lus par get_content, cours et TP par export_content_compact.
- Fichiers fournis (download-file) : contenus absents de export_content_compact (limitation de l'outil).
- Curriculum : section 1 sans clé curriculum ; sections 2, 3 et 4 à null.
- Ordre : order 4 (get_section) ; position 3 dans list_sections ; 2-programmation-orientee-objet est en 10e position de list_sections, avec order 2. Sections précédentes retenues par order et slug : 1, 2, 3.
- Module projectSpec.status : draft, alors que referenceRepo.status : validated.
- Serveurs MCP cours-iut-mcp (CONNECTION_CLOSED) et phpstorm (ECONNREFUSED) en échec de connexion ; non utilisés. Lecture faite sur le serveur prod d1db0efe-14b0-4182-97b9-d6f36625dc09.
- Sections voisines à source file (non concernées par cette fiche) : section 5 (slide file), section 6 (slide file), section 7 (cours, TP, slide file), section 9 (cours, TP file).

## Définition de terminé
- ✔ chaque champ rempli ou « non disponible » avec raison : module, section, brief, contenus, curriculum, verdicts, exemplaires, registre remplis ; non disponible : universe du module (absent de get_module), curriculum section 1 (clé absente), apis des sections 1 à 3 (pas de curriculum), version du fil rouge (aucun champ de version), budgets (courseIntroMinutes null).
- ✘ budgets calculés avec calcul visible : 2 × 180 = 360 min ; 360 − courseIntroMinutes (null) → non calculable ; plage 80–100 % non calculable. Cause : valeur absente en prod.
- ✔ brief présent : get_section.brief, notions 8 (liste ci-dessus).
- ✔ sources prévues lues : 3 sur 3 (slide par get_content ; cours et TP par export_content_compact, get_content hors limite), plus repli fil rouge (3 sections). Indisponibilité du dépôt de référence signalée.

Résultat : incomplet, à cause du seul critère budget. Pour le débloquer, il faut une valeur de courseIntroMinutes pour 4-formulaire dans la base prod.



---

## PHP 4 — style cours

# Relecture style : php/4-formulaire — cours
Statut du rapport : terminé

Source : export_content_compact (prod, source db, v201). Je compte 134 marqueurs `<!--id-->`, comme le collecteur. Les blocs de code et les diagrammes ne portent pas de prose : ils sont relus pour les artéfacts (E) et la typographie (C), les cellules de tableau pour A à D.

## Liste de tâches
- [x] bloc form-part-recall (A B C D E)
- [x] bloc form-recall-cycle (A B C D E)
- [x] bloc form-recall-cycle-text (A B C D E)
- [x] bloc form-recall-cycle-diagram (C E)
- [x] bloc bdb93764-28ca-4b38-a377-7c90d7b34088 (A B C D E)
- [x] bloc 29bd65ca-63a4-4dfe-b9e7-5dece7d730f0 (A B C D E)
- [x] bloc 722d8df4-a161-4bc5-9d0d-5267be46171d (A B C D E)
- [x] bloc aba849bf-6dcc-4422-9e4a-57b6517b2e3f (C E)
- [x] bloc 04530da2-1107-464c-8ea5-838e350a4183 (A B C D E)
- [x] bloc e9949f26-6620-4f86-a3c0-e6a0f2957bed (C E)
- [x] bloc 70b0469a-fced-42a6-9252-6cb5225bd0fa (A B C D E)
- [x] bloc 56ce5d42-02ae-42c0-94bd-33f10d7f4e26 (A B C D E)
- [x] bloc b73c10eb-9fc2-4b5e-9d58-7bd6fe461b2c (A B C D E)
- [x] bloc 371cc5a2-1039-4ca2-b6ac-8817f124ff30 (A B C D E)
- [x] bloc ade922fc-eb7c-4de2-ad09-ca84a3e5e069 (A B C D E)
- [x] bloc 397fc615-b8f5-4132-bfb1-629308a74247 (A B C D E)
- [x] bloc d0ef19c4-8cff-46f0-91fc-c555ff7f74d4 (A B C D E)
- [x] bloc 5c2c71dc-8e56-49c2-8ea8-e7d8b84c8810 (A B C D E)
- [x] bloc 5409ff15-93de-40b1-b25e-d1b016f717fd (A B C D E)
- [x] bloc 54d70b3b-4004-4db9-8911-03ba1a89f981 (A B C D E)
- [x] bloc a68e57b7-748c-45cf-b91d-1ac20ab7096e (A B C D E)
- [x] bloc form-part-search (A B C D E)
- [x] bloc form-search-html (A B C D E)
- [x] bloc form-search-html-text (A B C D E)
- [x] bloc form-search-html-code (C E)
- [x] bloc form-search-read (A B C D E)
- [x] bloc form-search-read-text (A B C D E)
- [x] bloc form-search-examples (A B C D E)
- [x] bloc form-search-warning (A B C D E)
- [x] bloc form-search-warning-text (A B C D E)
- [x] bloc 28310df0-8812-493c-9490-9fb74e9d7dca (A B C D E)
- [x] bloc 86bfa100-4e92-4cf8-be3e-d04abc44b3aa (A B C D E)
- [x] bloc 090eccb9-defc-445b-a133-86dbe89a2afc (C E)
- [x] bloc 481be035-3a8a-4ad8-a678-9c795d667eed (C E)
- [x] bloc form-part-simple (A B C D E)
- [x] bloc form-simple-html (A B C D E)
- [x] bloc form-simple-html-text (A B C D E)
- [x] bloc form-simple-html-code (C E)
- [x] bloc form-simple-flow (A B C D E)
- [x] bloc form-simple-flow-text (A B C D E)
- [x] bloc form-simple-flow-diagram (C E)
- [x] bloc form-simple-flow-code (C E)
- [x] bloc form-simple-flow-text2 (A B C D E)
- [x] bloc form-simple-flow-warning (A B C D E)
- [x] bloc form-simple-flow-warning-text (A B C D E)
- [x] bloc form-simple-read (A B C D E)
- [x] bloc form-simple-read-code (C E)
- [x] bloc form-simple-conversion-warning (A B C D E)
- [x] bloc form-simple-conversion-warning-text (A B C D E)
- [x] bloc form-simple-result-text (A B C D E)
- [x] bloc form-part-complex (A B C D E)
- [x] bloc form-complex-radio (A B C D E)
- [x] bloc form-complex-radio-text (A B C D E)
- [x] bloc form-complex-radio-code (C E)
- [x] bloc form-complex-checkbox (A B C D E)
- [x] bloc form-complex-checkbox-text (A B C D E)
- [x] bloc form-complex-checkbox-code (C E)
- [x] bloc form-complex-checkbox-example (A B C D E)
- [x] bloc form-complex-select (A B C D E)
- [x] bloc form-complex-select-text (A B C D E)
- [x] bloc form-complex-select-code (C E)
- [x] bloc form-complex-multiple (A B C D E)
- [x] bloc form-complex-multiple-text (A B C D E)
- [x] bloc form-complex-multiple-code (C E)
- [x] bloc form-complex-multiple-example (A B C D E)
- [x] bloc form-complex-read (A B C D E)
- [x] bloc form-complex-read-text (A B C D E)
- [x] bloc form-complex-list-code (C E)
- [x] bloc form-complex-read-code (C E)
- [x] bloc form-part-xss (A B C D E)
- [x] bloc form-xss-problem (A B C D E)
- [x] bloc form-xss-problem-text (A B C D E)
- [x] bloc form-xss-unsafe (C E)
- [x] bloc form-xss-payload (A B C D E)
- [x] bloc form-xss-escape (A B C D E)
- [x] bloc form-xss-escape-text (A B C D E)
- [x] bloc form-xss-safe-text (A B C D E)
- [x] bloc form-xss-safe (C E)
- [x] bloc form-xss-late-callout (A B C D E)
- [x] bloc form-xss-late-text (A B C D E)
- [x] bloc form-part-errors (A B C D E)
- [x] bloc form-errors-simple (A B C D E)
- [x] bloc form-errors-simple-text (A B C D E)
- [x] bloc form-errors-simple-code (C E)
- [x] bloc form-errors-simple-table (A B C D E)
- [x] bloc form-errors-choices-def (A B C D E)
- [x] bloc form-errors-choices-def-text (A B C D E)
- [x] bloc form-errors-choices-def-code (C E)
- [x] bloc form-errors-choice (A B C D E)
- [x] bloc form-errors-choice-code (C E)
- [x] bloc form-errors-choice-text (A B C D E)
- [x] bloc form-errors-choice-table (A B C D E)
- [x] bloc form-errors-choice-warning (A B C D E)
- [x] bloc form-errors-choice-warning-text (A B C D E)
- [x] bloc form-errors-display (A B C D E)
- [x] bloc form-errors-display-text (A B C D E)
- [x] bloc form-errors-display-code (C E)
- [x] bloc form-errors-display-note (A B C D E)
- [x] bloc form-errors-choices-display (A B C D E)
- [x] bloc form-errors-choices-display-text (A B C D E)
- [x] bloc form-errors-choices-display-code (C E)
- [x] bloc form-errors-choices-display-table (A B C D E)
- [x] bloc form-errors-valid (A B C D E)
- [x] bloc form-errors-valid-code (C E)
- [x] bloc form-errors-valid-text (A B C D E)
- [x] bloc 5883f30c-4a19-43bb-a54e-77af8e3314e7 (A B C D E)
- [x] bloc 789195aa-f1e7-43d8-a17c-8f1d01bf8492 (A B C D E)
- [x] bloc ae4f9940-3847-42a8-bcf0-b8608dba7009 (C E)
- [x] bloc form-errors-prg (A B C D E)
- [x] bloc form-errors-prg-text (A B C D E)
- [x] bloc form-errors-prg-code (C E)
- [x] bloc form-errors-prg-note (A B C D E)
- [x] bloc form-errors-prg-note-text (A B C D E)
- [x] bloc form-xss-difference (A B C D E)
- [x] bloc form-xss-difference-table (A B C D E)
- [x] bloc form-xss-difference-text (A B C D E)
- [x] bloc 9ac26975-2962-4672-8bed-e7d838786d65 (A B C D E)
- [x] bloc f555fc1d-0521-4a79-8bdc-df7c47e0ef4b (A B C D E)
- [x] bloc 2c6f1e79-39a5-4e3d-a5fa-5f7e109451e7 (A B C D E)
- [x] bloc c674d4e7-494d-4d7f-ae0c-4332c42696f1 (A B C D E)
- [x] bloc 9b49c673-6b1f-4720-b553-163d812450e5 (A B C D E)
- [x] bloc 8770482e-c2ff-470d-a6d7-a72fadabf099 (A B C D E)
- [x] bloc 81a6d095-59e2-4f6d-a1e1-bc88f0f3eb28 (C E)
- [x] bloc 6a9c4c97-a2ce-439d-813d-7342046ab54c (A B C D E)
- [x] bloc c7f5500b-3683-4ed0-b29f-85b0f928ad72 (A B C D E)
- [x] bloc 239460fe-e150-4d73-80b2-f43eb72a93bd (A B C D E)
- [x] bloc 7f739f58-a98c-4f46-9616-20acccd2e761 (C E)
- [x] bloc 6fc71e97-c9c1-418e-80b7-34e0e0051d70 (C E)
- [x] bloc form-part-recap (A B C D E)
- [x] bloc form-recap-diagram (C E)
- [x] bloc form-recap-table (A B C D E)
- [x] bloc form-recap-reflex-table (A B C D E)
- [x] bloc form-recap-more (A B C D E)
- [x] bloc form-recap-more-text (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | form-complex-read-text | MAJEUR (à voir par contrat/cohérence) | hors grille | « Les radios et le select simple donnent une chaîne ; sans choix, la clé est absente et `cleanString()` renvoie `''` » | Le select simple a une option `value=""` : sa clé est présente, avec `''`. Seul le radio non coché a une clé absente. Scinder : « Sans choix, un radio n'envoie pas sa clé ; un select simple envoie `''`. Dans les deux cas `cleanString()` renvoie `''`. » |
| 2 | form-recall-cycle-text | MINEUR | 30 (annonce de plan), 32 | « Le cours suit deux formulaires : … Les deux commencent dans un seul fichier PHP et ne sont découpés en contrôleur et vue qu'à la fin. » ; même tic dans a68e57b7 : « Les parties suivantes le vérifient champ par champ. » | Deux annonces de programme, dans deux blocs distincts. Supprimer la seconde phrase de a68e57b7 (le contenu suit immédiatement). Garder l'annonce du fil rouge dans form-recall-cycle-text, qui est utile. |
| 3 | 6a9c4c97-a2ce-439d-813d-7342046ab54c | MINEUR (à voir par contrat/cohérence) | 35 | « Le HTML de `search.php`, avec son échappement, part tel quel dans `views/view_search.php`. » | La vue de recherche est décrite mais jamais montrée, alors que celle du formulaire l'est en entier. Ajouter le code de `view_search.php`, ou dire en une phrase qu'il suffit de coller le HTML de la partie XSS entre les deux `require`. |

## Vue d'ensemble
Écriture sobre et concrète : copules directes, messages d'erreur réels, exemples chiffrés, avis assumés (« POST ne cache rien »), aucun tiret cadratin, aucune formule IA ni tutoiement, consignes à l'impératif vouvoyé. Les gras de repère, les tableaux de comparaison et les callouts restent dans l'usage normal des blocs. Rien ne s'accumule à trois signaux dans un même bloc. Les points à traiter sont une inexactitude technique (remarque 1) et deux annonces de plan isolées.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes et slide-note comprises : 134 blocs relus sur 134 (le support n'a pas de slide-note)
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 3 remarques, 3 complètes (les remarques 1 et 3 relèvent du contrat ou de la cohérence et n'ont pas de numéro de pattern, ce qui est prévu par la mention « à voir par contrat/cohérence »)



---

## PHP 4 — style slides

# Relecture style : php/4-formulaire — slides (rapport mis à jour)
Statut du rapport : terminé

Relance traitée avec `get_content` (php/4-formulaire, slide, v141, source db).
- **`slide4-render-tree`** : c'est un bloc file-tree. Son titre est « Après découpage » et il liste 7 chemins : `recettes/search.php`, `create_recipe.php`, `core/functions.php`, `views/header.php`, `views/footer.php`, `views/view_search.php`, `views/view_recipe_form.php`. Je l'ai relu avec la grille A-E : rien à signaler. Le titre est en minuscules, il n'y a pas de numérotation et il n'y a pas de marqueur IA. Les noms de fichiers concordent avec `slide4-render-note` et avec `41c2e926` (`views/view_recipe_form.php`).
- **Blocs absents de ma liste** : trois blocs `slide-text` au contenu vide (`content: ""`), sans texte à relire :
  - `ebfad59c-0514-47be-a008-597ea1000759` (slide « Construire la recette »)
  - `57620728-7222-4d4d-8628-de9d33755075` (slide « Le formulaire complet »)
  - `abcd6483-9553-486b-b542-42b04f86b739` (slide « Le contrôleur appelle render() »)

  Je ne peux pas dire lequel est le 105e du collecteur. Ces trois blocs et les 104 de mon export font 107 identifiants. Le collecteur en compte 105, probablement parce qu'il écarte certains blocs vides ou conteneurs. J'ai donc couvert tous les identifiants de l'arbre `get_content`.

## Liste de tâches
Chaque bloc listé a été relu selon les critères A, B, C, D et E.
- [x] slide4-cycle, slide4-cycle-diagram, slide4-cycle-note
- [x] slide4-form-attrs, -code, -text, bfafb008 (tableau), -note
- [x] slide4-form-dump, -code, -text, -note
- [x] b43026b9, 0c1f7c43, 61240f08
- [x] 13e82a87, c2e5e447, 72204470
- [x] d0ee1334, 7d6ebfff, 64549a0a
- [x] dd1d3ddc, d275724b, baade147
- [x] 9673330d, da3e0e26, 4b03ceda
- [x] 7117cc34, ec9be625, 27172c2d
- [x] slide4-radio, 732c7a4c, -text, -note
- [x] slide4-checkbox, 7ae1b4c4, -note
- [x] slide4-select, f0e04054, -text, -note
- [x] slide4-select-multiple, 19842156, -note
- [x] ea3145d8, 96248979, babc0104
- [x] slide4-search-form, -code, -text, -note
- [x] slide4-simple-form, -code, -note
- [x] slide4-flow, d23c9300, 831a627b, -note ; d95ae889, 40784740, 1cf68606 (colonnes, sans texte)
- [x] slide4-simple-read, -code, -text, -note
- [x] slide4-errors-simple, -code, -note
- [x] slide4-xss, 4c8987d3, -text, -note
- [x] slide4-escape, -code, -note
- [x] slide4-redisplay, -code, -note
- [x] 208cc91b, ebfad59c (vide), e5ce96d2, 6bd02e7e
- [x] slide4-prg, -code, -text, -note
- [x] 43fdfc34, 57620728 (vide), 53e8661c, 1d9315c8
- [x] slide4-clean-validate-escape, -table, -note
- [x] slide4-render, slide4-render-tree, slide4-render-note
- [x] 5d65123f, abcd6483 (vide), 3d7d5e0e, 41c2e926, cfd72a61
- [x] slide4-progression, -diagram, -note
- [x] slide4-recap, -table, -note
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | slide4-render-note | MAJEUR (à voir par contrat/cohérence) | 35 | « Le fichier unique dépasse 200 lignes » | Le fichier complet montré en `53e8661c` fait une quarantaine de lignes. L'affirmation est fausse pour ce support, ou elle vise le fichier du TP. Corriger en « Le fichier devient long et mélange deux tâches ». |
| 2 | slide4-progression, slide4-progression-note, slide4-recap | MINEUR | 30, 34 | « Refaire le chemin parcouru, une difficulté à la fois » ; légende du diagramme « Une difficulté à la fois » ; slide « À retenir » | La progression et le récapitulatif redisent deux fois le même parcours, et la note reprend la légende du diagramme. Fusionner les deux slides, ou garder le tableau et supprimer le diagramme. |
| 3 | slide4-errors-simple-code, 53e8661c | MINEUR | 20 | « L’ingrédient est obligatoire. » (apostrophe courbe dans le code) | Les notes et les textes utilisent l'apostrophe droite (« l'URL », « d'abord »). Choisir une seule apostrophe pour tout le support. |
| 4 | ebfad59c, 57620728, abcd6483 | MINEUR | hors grille | `content: ""` | Trois blocs `slide-text` vides, en tête de slide, avant le code. Les supprimer, ou y mettre la phrase d'accroche prévue. |

## Vue d'ensemble
Le support est sobre et ancré : valeurs, messages d'erreur et démos concrètes (XSS avec img/onerror, `Warning: Undefined array key`). Les `slide-note` ont une voix d'enseignant avec des opinions, comme « POST ne cache rien ». Je n'ai trouvé ni tutoiement, ni vocabulaire IA, ni artéfact. Ce qui revient : une récapitulation doublée en fin de support, une cohérence chiffrée à vérifier (remarque 1) et quelques blocs vides.

## Définition de terminé
- ✔ tous les blocs de texte relus : tous les identifiants de l'arbre `get_content` sont couverts, soit 104 blocs de l'export plus 3 `slide-text` vides. Cela fait 107 identifiants contre 105 annoncés par le collecteur. J'attribue l'écart au fait que le collecteur écarte certains blocs vides ou conteneurs, mais je ne l'ai pas vérifié.
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 4 remarques, 4 complètes.


---

## PHP 4 — style TP

# Relecture style : php/4-formulaire — TP
Statut du rapport : terminé

Je n'ai pas pu vérifier le compte exact de 149 blocs avec `get_content`, qui dépasse la limite de sortie. Mon décompte à la main de l'export donne environ 151 annotations, dont une dizaine de conteneurs vides (listes, `setup`). Chaque bloc porteur de texte de l'export a été relu.

## Liste de tâches
- [x] Partie A, intro et mise en place : tp4-intro, tp4-woody, tp4-woody-txt, tp4-sec-a, tp4-a-intro, tp4-a-download, fb697916, tp4-a-setup-1, tp4-a-setup-2, 2eb6a4b3, 0672d6b1 (A B C D E). Le conteneur tp4-a-setup est vide.
- [x] Exercices 1 et 2 : tp4-ex1, ex1-txt, c0d75df6, ex1-1 à ex1-5, ex1-check-txt, ex1-table, tp4-ex2, ex2-txt, f01403ee, ex2-1, ex2-2, 48bb7beb, 08391900, ex2-table, ex2-check (A B C D E). Les conteneurs ex1-list et ex2-list sont vides.
- [x] Exercices 3 et 4 : tp4-ex3, ex3-txt, ex3-table, ex3-1 à ex3-4, ex3-lines, ex3-check, ex3-warn, ex3-warn-txt, tp4-ex4, ex4-txt, ex4-rules, ex4-1 à ex4-4, a86c0507, ex4-check-txt, ex4-check, 2f3e3833, 96f8c702 (A B C D E)
- [x] Exercice 5 : tp4-ex5, ex5-txt, ex5-1 à ex5-4, 81e95e3c, ex5-table, ex5-warn, ex5-warn-txt (A B C D E)
- [x] Onzer, intro, Rappel, Mise en place : d7ce210b, 99555507, 78378c03, 9bd20982, f30b0c40, 09124da4, 026fe4d1, bb8683f8, 146bb32f, 9ffdc186, de74edc5, e696ce5b (A B C D E)
- [x] Onzer, Lire l'URL : 94a74efd, 20d1c296, 1594664c, 881acbd4, efee52c9, f2c0636d, 981ff27d, edf4e795 (A B C D E)
- [x] Onzer, Se connecter et S'inscrire : 3deef7ae, 224b2926, ef1756c4, 66356f40, 7670db36, 1c622ef6, 6a73fa39, 8a55e1d8, 225c776d, 9702af6b, a8507c32, 1701ef3c, da1803ce, 571dd9fc, b3f60f71, 9ba8d599, a6b8525e, 4c9ccecd, c0576ba8 (A B C D E)
- [x] Onzer, artiste, album, modification : 5fe64482, d5d0f9e1, 38e5bec4, 629b, 9a0a2e3c, 8c4f291e, 0ebacab4, 630c5a65, 225ff249, c55e9471, adfd360e, 1bdc5f07, cda025bb, 13ccc6e9, b1fb2a52, ded93d6b, 6edce4fc, 077a4b43, c5786f23, 6ad0c80c, 8b3f86af, 1ff07309, 07f2f4ef, c188ba3c, 0380b345, f4be79d8 (A B C D E)
- [x] Pour aller plus loin : 08f5d3b1, 19992953, a58304dd, 6a3a1014, 8fcc9986, d335e97d (A B C D E)
- [x] support entier (B D)

## Remarques
| # | id du bloc | Gravité | Pattern(s) | Passage concerné (verbatim court) | Proposition |
|---|---|---|---|---|---|
| 1 | 99555507 | MINEUR | 24, 30 (verdict « commentaires du type ni session ni base ») | « Les vérifications s'appuient sur deux comptes et sur le catalogue en mémoire, et rien n'est enregistré : un message de succès s'affiche, puis les données disparaissent avec la réponse. » | Supprimer la deuxième moitié. Garder « Vous continuez dans `~/public_html/onzer/`, le dossier du TP3. » |
| 2 | 0380b345, 077a4b43 | MINEUR | 24, 30 (même verdict) | « Rien n'est enregistré. » (deux fois) | Supprimer ces phrases : la ligne « le catalogue n'a pas changé » du tableau de l'artiste suffit à porter l'attendu. |
| 3 | 0ebacab4 | MINEUR | 24, 30 (même verdict) | « L'artiste n'est pas enregistré : il n'apparaît pas dans le catalogue. » | Supprimer. La dernière ligne du tableau `list_albums.php` dit déjà la même chose. |
| 4 | tp4-ex2-txt | MINEUR | 24 | « Rien n'est encore enregistré : l'écriture dans `equipes.json` arrive à l'exercice 4, une fois la saisie contrôlée. » | À trancher avec le verdict : si la partie A est visée, garder « L'enregistrement dans `equipes.json` arrive à l'exercice 4. » |
| 5 | 026fe4d1 | MAJEUR (à voir par contrat/cohérence) | 30, 24, verdict guidage | « Lisez sa première ligne : la vue fixe elle-même `$pageTitle` à « 404 — Onzer » avant d'inclure `header.php`… le menu affiché, puisque `authLayout` n'est pas transmis. » | Ne garder que le contrat : « Une action appelle `render('404')` sans titre ni `authLayout`. » La consigne commente le contenu du fichier fourni, ce que le verdict interdit. |
| 6 | 6a73fa39 | MINEUR (à voir par contrat/cohérence) | 30, verdict guidage | « L'adresse est réaffichée depuis `$email` ; le mot de passe ne l'est jamais. » | Cette phrase paraphrase la vue fournie. La supprimer : le tableau des essais (« le mot de passe est vide ») porte déjà l'attendu. |
| 7 | 1c622ef6, 6a73fa39, 8a55e1d8 | MINEUR (à voir par contrat/cohérence) | verdict guidage | trois consignes enchaînées : « il charge `core/functions.php` et `core/users.php`, puis affiche la vue… » | Premier geste POST de la partie : le pas à pas est légitime. À conserver, mais sans les détails de chargement déjà vus au TP3. |
| 8 | b3f60f71, 4c9ccecd, c0576ba8 | MINEUR | 24, 30 | « sans lui, le navigateur refuse d'envoyer `camille` et la règle 3 ne peut pas être testée » (consigne), puis, dans le callout, « Gardez `novalidate` sur le formulaire pendant l'exercice. » | Explication donnée deux fois. Garder `novalidate` dans la consigne en quelques mots, ou le callout seul. |
| 9 | 571dd9fc | MINEUR | 24 | « adresse refusée par `filter_var($email, FILTER_VALIDATE_EMAIL)`, qui renvoie `false` pour une adresse invalide » | Garder la fonction (contrat), supprimer l'explication de sa valeur de retour. |
| 10 | b1fb2a52 | MAJEUR | verdict (code de solution) | « testez-la avec `preg_match('/^\d{2}:[0-5]\d$/', $duration)`, qui renvoie `1` quand la durée est valide » | Retirer l'expression régulière toute faite. Garder le format « mm:ss, secondes de 00 à 59 » et déplacer l'indice dans le bloc replié : `preg_match` renvoie `1`, pas un booléen. |
| 11 | c5786f23, 6ad0c80c | MAJEUR | verdict (indice replié) | « ### Indice : associer un titre à sa durée » suivi du texte à plat | L'indice est un titre de section déplié, visible de tous. Le convertir en `collapsible`. Le contenu (le rang relie les deux tableaux, et le piège de la ligne vide) est bon. |
| 12 | ded93d6b | MINEUR (à voir par contrat/cohérence) | 30, verdict guidage | « Au premier affichage, `form` contient un titre, une année et un artiste vides, et cinq lignes de morceaux vides. » | Cette phrase redit `cda025bb` (« au moins cinq lignes ») et la première ligne du tableau d'essais. La garder une seule fois, dans le tableau de `$form`. |
| 13 | 077a4b43 | MINEUR (à voir par contrat/cohérence) | verdict guidage | « reconstruisez `form` depuis les valeurs postées, puis validez-le. En cas d'erreur, transmettez `error` ; sinon… » | À partir du deuxième formulaire, ramener à une ou deux consignes : « Validez avec `validateAlbum()` ; transmettez `error` ou `success` (message verbatim). » |
| 14 | 13ccc6e9 | MINEUR (à voir par contrat/cohérence) | verdict guidage | « liste déroulante : une option par artiste de `$artists` (valeur : son identifiant, texte : son nom), avec l'artiste de `$form` sélectionné » | Décrit ce que la vue fournie fait déjà. Réduire à `name` et nature des champs, ou supprimer le tableau. |
| 15 | 07f2f4ef, 0380b345 | MINEUR | 30 | « La vue `album_form` et la fonction `validateAlbum()` sont réutilisées telles quelles. » puis « réutilise la vue `album_form` et `validateAlbum()` sans dupliquer aucune règle » | Redite. Supprimer la phrase d'intro. |
| 16 | tp4-ex5-3 | MINEUR | 24 | « `htmlspecialchars($nom)` suffit. » | Cette phrase vaut code de solution : ne garder que « Depuis PHP 8.1, l'appel sans option échappe les guillemets, en UTF-8. » |
| 17 | 5fe64482 → 0ebacab4 (Artiste) | MINEUR (à voir par contrat/cohérence) | verdict guidage | le bloc d'intro et la consigne 2 racontent séquence et résultat | Déjà bref. À garder comme modèle de longueur pour l'album et la modification. |

## Vue d'ensemble
Le style est propre : vouvoiement et impératif tenus, ni tutoiement, ni plan annoncé, ni vocabulaire IA ni gras semé. Ce qui revient est de la redite entre consigne, tableau d'essais, callout et vue fournie, avec des commentaires « rien n'est enregistré ». À partir de l'exercice « S'inscrire », certaines consignes décrivent aussi ce que font les fichiers fournis ou donnent du code de solution (regex), contre le verdict de guidage. L'indice de l'album doit être replié.

## Définition de terminé
- ✔ tous les blocs de texte relus, consignes comprises : tous les blocs de l'export (environ 140 blocs de texte, hors une dizaine de conteneurs vides), mais mon décompte à la main (151 annotations) ne recoupe pas exactement les 149 du collecteur. Je n'ai pas pu vérifier sans `get_content`.
- ✔ chaque remarque avec id, numéro de pattern, passage et proposition : 17 remarques, 17 complètes. Pour les remarques liées aux verdicts, le champ « pattern » renvoie au numéro le plus proche (24 ou 30) et nomme le verdict.


---

## PHP 4 — cohérence

# Relecture cohérence : php/4-formulaire (cours, slides, TP)

Trois rapports séparés. Ils partagent des limites de lecture, que je liste d'abord.

## Limites de lecture
- `get_project_reference` : ECONNREFUSED (172.22.0.2:443). Dépôt injoignable, repli sur le TP3 (`export_content_compact` php/3-structurer-son-code TP) et sur les briefs des sections 5 à 7 (`list_sections`).
- Les 8 `download-file` du TP ne sont pas exportés : `stockage.php`, `equipes.json`, `view_404.php`, `users.php`, `view_login.php`, `view_create_user.php`, `view_artist_form.php`, `view_album_form.php`. Je n'ai pas pu vérifier leur contenu.
- Le TP3 non plus : `catalog.php`, `view_list_albums.php`, `view_player.php`, `functions.php`, `header.php` sont des téléchargements.
- Curriculum des sections précédentes : `curriculum: null` en base. Repli sur les notions de brief des sections 1 à 3.
- `search_content` ne trouve `mb_strlen`, `implode` et `strtolower` que dans la section `2-fonctions-et-tableaux`. Cette section n'existe plus dans `list_sections` (supprimée, absorbée en 1 et 2). Aucun contenu actuel des sections 1 à 4 ne les enseigne. Cela reste à confirmer sur les cours 1 et 2 réels.
- Aucune durée d'exercice n'est exportée. Je ne peux pas confronter le budget de 340 min.

---

# Relecture cohérence : php/4-formulaire — cours
Statut du rapport : terminé

## Liste de tâches
- [x] 30 blocs de code × domaine
- [x] 3 diagrammes (`form-recall-cycle-diagram`, `form-simple-flow-diagram`, `form-recap-diagram`) × domaine
- [x] 7 tableaux de données × domaine
- [x] notion « $_GET / $_POST, ?? » × curriculum + structure
- [x] notion « REQUEST_METHOD » × curriculum + structure
- [x] notion « radio, checkbox, select, select multiple, name[] » × curriculum + structure
- [x] notion « validation, $errors, liste autorisée » × curriculum + structure
- [x] notion « mb_strlen » × curriculum + structure (absente)
- [x] notion « réaffichage » × curriculum + structure
- [x] notion « htmlspecialchars / XSS » × curriculum + structure
- [x] notion « paramètres d'URL sans formulaire, 404 » × curriculum + structure (absente)
- [x] notion « track[] / duration[] » × curriculum + structure (absente)
- [x] notions utilisées hors brief : `filter_var`, `array_diff`, `cleanString`/`cleanList`, `mb_stripos`, fonction fléchée `fn`, `mixed`, `is_string`, `array_keys`, `array_values`, PRG (`header` + `exit`), `aria-describedby`, mention CSRF
- [x] grammaire des blocs (toutes les parties)

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | `form-errors-simple-text` (partie `form-part-errors`) | MAJEUR | 2 notion du brief absente | Validation sans aucune règle de longueur | Brief : « Validation côté serveur : tableau $errors, liste de valeurs autorisées, mb_strlen ». Aucun `mb_strlen`, `strlen` ni règle de longueur dans les 134 blocs. Le TP l'exige (voir TP, remarque 1). | Ajouter une règle de longueur avec `mb_strlen` (exemple : titre de recette de 100 caractères au plus), puis la variante accentuée et l'erreur fréquente `strlen` en octets. |
| 2 | (aucun bloc) | MAJEUR | 2 notion du brief absente | Paramètres d'URL sans formulaire, `http_response_code(404)` | Brief : « Paramètres d'URL sans formulaire et réponse 404 (http_response_code) ». Aucune occurrence dans le cours. Seul le TP porte un callout « GET sans formulaire ». La section 3 a reporté cette notion au TP4. | Ajouter une partie : lien `recipe.php?id=3`, lecture de `$_GET['id']`, recette introuvable, `http_response_code(404)` puis `exit`, avec une erreur fréquente. |
| 3 | (aucun bloc) | MAJEUR | 2 notion du brief absente | Tableaux parallèles `track[]` / `duration[]` recollés par rang | Brief : « Tableaux parallèles track[] / duration[] recollés par rang ». Aucune occurrence. Le TP ne donne qu'un « Indice » d'un paragraphe. | Ajouter l'exemple `step[]` / `minutes[]` d'une recette : deux tableaux en POST, recollage par rang, ligne vide ignorée après recollage. |
| 4 | `form-complex-radio`, `form-complex-checkbox`, `form-complex-select`, `form-complex-multiple` | MAJEUR | 3 temps manquant : pas de callout `warning` | Quatre champs, chacun avec exemple et tableau de valeurs, sans erreur fréquente. Seul le warning `form-errors-choice-warning` traite la valeur inventée, plus loin. | Les callouts `warning` du cours portent sur : `name` absent, POST, clé absente, test de méthode, conversion, valeur inventée. Aucun ne traite `diet` sans `[]` ni la clé absente d'une case décochée. | Un warning pour les cases et le select multiple : sans `[]`, seule la dernière valeur arrive, et sans case cochée `Warning: Undefined array key "diet"`. Message à confirmer par etudiant-fragile. |
| 5 | `form-errors-display-code`, `form-errors-choices-display-code` | MINEUR | 3 temps manquant | Réaffichage sans erreur fréquente | Pas de callout. Le cas courant est un `value` non échappé ou un `checked` oublié sur une case. | Un warning court. |
| 6 | `form-search-html-code`, `090eccb9-defc-445b-a133-86dbe89a2afc`, `form-complex-list-code` | MINEUR | 2 notions hors curriculum de brief | `fn(array $recipe): bool =>`, `array_filter`, `mixed`, `is_string`, `array_values`, `array_keys` utilisés sans explication | Briefs 1 à 3 : pas de fonctions fléchées, pas de `mixed`. `array_filter` est à confirmer en section 2 (« Tri et filtre »). | À confirmer sur les cours 1 et 2. Sinon, une phrase d'explication. |
| 7 | `form-errors-prg-text`, `form-recap-more-text`, `form-errors-simple-text` | MINEUR | 2 notions hors brief à signaler pour le curriculum | PRG, CSRF, `filter_var` + `FILTER_VALIDATE_INT`, `array_diff`, `cleanString`/`cleanList`, `mb_stripos`, `aria-describedby` | Absents des 8 notions du brief. | À inscrire au curriculum de la section. |
| 8 | `5883f30c-4a19-43bb-a54e-77af8e3314e7`, `6fc71e97-c9c1-418e-80b7-34e0e0051d70` (blocs code `ae4f9940-3847-42a8-bcf0-b8608dba7009` et `6fc71e97-c9c1-418e-80b7-34e0e0051d70`) | MINEUR | 6 long code à recopier | Fichier complet de ~190 lignes, puis ~140 lignes de vue, en blocs code | Le même HTML apparaît deux fois (fichier unique, puis vue). | `download-file` pour la vue, ou renvoi vers le fichier complet. |
| 9 | `form-errors-prg-code` | MINEUR | 1 exemple | `header('Location: recipes.php')` renvoie vers une page jamais définie | Aucune `recipes.php` dans le cours. | Nommer la page de destination ou le dire dans le texte. |

Aucune fuite Onzer : aucun exemple n'utilise album, artiste, utilisateur ou catalogue musical. Tous les exemples sont en recettes (Tarte, Risotto, Éclair, `create_recipe`).

Le message `Uncaught TypeError: trim(): Argument #1 ($string) must be of type string, array given` et le message `Warning: Undefined array key "query"` correspondent à PHP 8. Aucun message inventé.

## Confrontations
- exampleDomain : 40 exemples vérifiés sur 40 (30 code, 3 diagrammes, 7 tableaux de données). Aucune fuite, aucun foo/bar.
- curriculum : 21 notions confrontées sur 21 (8 du brief, dont 3 absentes, et 13 notions d'appui). Notions introduites hors brief : voir remarque 7.
- dépôt (TP) : sans objet.
- cours (slides) : sans objet.

## Définition de terminé
- ✔ chaque exemple vérifié contre l'exampleDomain : 40 sur 40
- ✔ chaque notion confrontée au curriculum : 21 sur 21 (curriculum en base absent, repli sur les briefs)
- sans objet : dépôt (TP) et comparaison slides

---

# Relecture cohérence : php/4-formulaire — slides
Statut du rapport : terminé

## Liste de tâches
- [x] 30 slides × exemple/domaine
- [x] 30 slides × critère 5 (cours, `slide-note`, idée unique, rendu visuel)
- [x] notion « champs de base email, password, date, textarea, hidden » × cours
- [x] notion « liste de valeurs autorisées » × cours
- [x] notion « réaffichage des choix » × cours
- [x] notion « $_GET / $_POST, REQUEST_METHOD, htmlspecialchars, XSS, validation, découpage » × cours
- [x] notions du brief absentes des slides : mb_strlen, 404, track[] / duration[]
- [x] grammaire des blocs

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | `d0ee1334-00fc-415d-9b38-a426b619758a`, `dd1d3ddc-eb1c-46f6-8aac-efbac4d03d55`, `9673330d-54e2-41c6-9142-200b35276dd2`, `7117cc34-7005-4c10-9bfe-1c7fe51561f7`, `ea3145d8-2d35-4601-8826-fc2cf8fbbdac` | MAJEUR | 5 notion dans les slides, absente du cours | Slides `email`, `password`, `date`, `textarea`, `hidden` | Le cours (`5c2c71dc-8e56-49c2-8ea8-e7d8b84c8810`) ne cite que `text`, `number`, `search`, radio, case, `select`. Aucune occurrence de `type="email"`, `password`, `date`, `textarea` ni `hidden` dans le cours. | Soit ajouter ces champs au cours (une ligne chacun), soit retirer les slides. |
| 2 | `dd1d3ddc-eb1c-46f6-8aac-efbac4d03d55` (`baade147-3d20-453d-93c8-33967cc14d47`) | MINEUR | 5 notion absente du cours | Note : « password_hash() viendra avec la connexion » | Absent du cours. Cohérent avec la section 7, où il est enseigné. | Garder en note, en annonce. |
| 3 | `slide4-errors-simple`, `slide4-redisplay`, `slide4-escape` (aucune slide sur les choix) | MAJEUR | 2 notion du brief absente (slides) | La validation d'une liste de valeurs autorisées (`in_array`, `array_diff`) et le réaffichage `checked`/`selected` n'ont aucune slide | Brief : « liste de valeurs autorisées ». Le cours leur consacre `form-errors-choice-*` et `form-errors-choices-display-*`. | Ajouter une slide « valeur inventée » et une slide « réafficher un choix ». |
| 4 | `e5ce96d2-ff78-4d81-b66e-d45e4bbc2698`, `53e8661c-d99c-4489-ba1b-efc15d354be4`, `slide4-simple-read-code` | MINEUR | 5 cohérence avec le cours | Les slides lisent avec `trim($_POST[...] ?? '')`. Le cours a remplacé `trim` par `cleanString()` parce que `trim` plante sur un tableau (`form-search-...`, TypeError). | Cours : `cleanString()`/`cleanList()`. Slides : aucune mention. | Aligner sur `cleanString()`, ou le dire en note. |
| 5 | `1d9315c8-2528-4f18-98e4-1cacac19a4bf` | MINEUR | 5 renvoi erroné | La note renvoie vers « le fichier complet avec les trois champs » | Le fichier complet du cours (`ae4f9940-…`) a sept champs, pas trois. | Corriger la note. |
| 6 | `43fdfc34-776a-4421-ba75-868d72fab017` | MINEUR | 5 deux idées par slide | « Le formulaire complet » : une quarantaine de lignes. Elle double aussi « Construire la recette » (`208cc91b-d0cf-49d0-b3bc-fae3a02087ad`). | Les deux montrent `$recipe = [...]` et `htmlspecialchars($recipe['name'])`. | Supprimer l'une des deux ou scinder. |
| 7 | `slide4-form-attrs` | MINEUR | 5 deux idées par slide | Code `action`/`method`/`name` plus tableau GET/POST dans une même slide | Le cours les sépare (`29bd65ca-…`, `b73c10eb-…`). | Scinder. |
| 8 | `ebfad59c-0514-47be-a008-597ea1000759`, `57620728-7222-4d4d-8628-de9d33755075`, `abcd6483-9553-486b-b542-42b04f86b739` | MINEUR | 6 grammaire | `slide-text` avec `content: ""` dans trois slides | Contenu vide. | Les supprimer. |
| 9 | `slide4-form-attrs-code`, `slide4-search-form-code`, `slide4-simple-form-code` | MINEUR | 5 rendu visuel sans `slide-code-with-preview` | Formulaires HTML montrés en `slide-code` | Les autres champs utilisent `slide-code-with-preview`. | `slide-code-with-preview` pour au moins le formulaire de création. |
| 10 | `slide4-xss` (`4c8987d3-647f-479d-8a89-88a88fc34294`) | MINEUR | 5 variante absente du cours | La démo casse `value="…"` avec `"><img onerror>` | Le cours montre `<script>` dans un paragraphe (`form-xss-unsafe`). La sortie de `value` non échappée n'apparaît que dans une phrase (`form-xss-safe-text`). | Une phrase du cours qui montre la sortie de `value` non échappé. |
| 11 | `slide4-progression-diagram` | MINEUR | 5 ordre | Validation puis Échappement | Le cours : XSS avant validation (diagramme `form-recap-diagram` : Échappement puis Validation). | Aligner l'ordre. |
| 12 | (aucun bloc) | MAJEUR | 2 notion du brief absente (slides) | `mb_strlen`, 404/`http_response_code`, `track[]`/`duration[]` | Voir cours, remarques 1 à 3. | À traiter après le cours. |

- Slide sans `slide-note` : aucune (30 sur 30 en ont une).
- Paragraphe du cours repris presque mot pour mot : aucun. Les tableaux GET/POST (`bfafb008-…`) et nettoyer/valider/échapper sont des versions abrégées du cours.
- Fuite Onzer : aucune. Tous les exemples sont en recettes.

## Confrontations
- exampleDomain : 30 slides vérifiées sur 30. Aucune fuite.
- curriculum : notions des slides confrontées au cours, 12 sur 12.
- dépôt (TP) : sans objet.
- cours (slides) : 30 slides comparées sur 30.

## Définition de terminé
- ✔ exemples vérifiés contre l'exampleDomain : 30 sur 30
- ✔ notions utilisées confrontées au curriculum : 12 sur 12
- sans objet : dépôt (TP)
- ✔ comparaison au cours faite : 30 slides sur 30

---

# Relecture cohérence : php/4-formulaire — TP
Statut du rapport : incomplet

Raison : dépôt injoignable et fichiers fournis illisibles. Seuls 10 résultats observables sur ~61 ont pu être confrontés au TP3 et aux briefs des sections 5 à 7. Le reste est cohérent en interne mais pas vérifié contre le code fourni.

## Liste de tâches
- [x] Ex.1 « Rechercher une équipe » (`tp4-ex1`) × cours × dépôt (fichiers fournis illisibles)
- [x] Ex.2 « Inscrire une équipe » (`tp4-ex2`) × cours × dépôt
- [x] Ex.3 « Compléter le formulaire » (`tp4-ex3`) × cours × dépôt
- [x] Ex.4 « Valider la saisie » (`tp4-ex4`) × cours × dépôt
- [x] Ex.5 « Échapper les saisies » (`tp4-ex5`) × cours × dépôt
- [x] Rappel (`9bd20982-…`, vue 404) × cours × TP3
- [x] Mise en place (`146bb32f-…`) × cours × TP3
- [x] Lire l'URL et répondre 404 (`20d1c296-…`) × cours × TP3
- [x] Se connecter (`3deef7ae-…`) × cours × brief s7
- [x] S'inscrire (`9702af6b-…`) × cours
- [x] Créer un artiste (`5fe64482-…`) × cours
- [x] Créer un album (`225ff249-…`) × cours
- [x] Modifier un album (`1ff07309-…`) × cours × TP3
- [x] 5 bonus × cours
- [x] progression guidé → fil rouge
- [x] état du fil rouge à l'entrée de la section
- [x] grammaire des blocs

## Remarques
| # | id du bloc | Gravité | Critère | Passage concerné | Preuve | Proposition |
|---|---|---|---|---|---|---|
| 1 | `tp4-ex4-rules` ; `571dd9fc-4c12-4f85-be11-4269eeb06f54` ; `9a0a2e3c-5014-447e-89e4-08e857f46aef` | BLOQUANT | 2 notion exigée, enseignée nulle part | « 200 caractères au plus, un caractère accentué comptant pour un », « plus de 100 caractères », « moins de 8 caractères », « plus de 255 caractères » | Le cours n'a ni `mb_strlen` ni `strlen`. `search_content mb_strlen` ne renvoie que l'ancienne section `2-fonctions-et-tableaux`, absente de `list_sections`. Les briefs 1 à 3 ne listent aucune fonction de chaînes. | Enseigner `mb_strlen` dans le cours (voir cours, remarque 1). À défaut, citer la fonction dans la consigne. Bloquant tant que les cours 1 et 2 ne la couvrent pas, à confirmer. |
| 2 | `tp4-ex4-rules` | MAJEUR | 2 notion du brief jamais pratiquée | Brief : « Validation... mb_strlen ». Pratiquée dans 4 exercices, mais enseignée nulle part. | Voir remarque 1. | Voir remarque 1. |
| 3 | `630c5a65-9744-4593-a5dc-05e0b216bab6` (règle 3 de `9a0a2e3c-…`) | MINEUR | 2 notion non enseignée | « casse ignorée » : `ssh` doit être refusé car SSH existe | Le cours n'a que `mb_stripos`. `strtolower`, `mb_strtolower` et `strcasecmp` sont absents des cours actuels. | Citer la fonction attendue ou l'enseigner. À confirmer sur les cours 1 et 2. |
| 4 | `c5786f23-39c0-49c9-bda8-74ae14a1c299` | MAJEUR | 2 notion du brief absente du cours | « Indice : associer un titre à sa durée » : recoller `track[]` et `duration[]` par rang | Notion de brief absente du cours (cours, remarque 3). Le TP ne donne qu'un paragraphe d'indice, pas de motif de code. | Mettre l'exemple dans le cours, garder l'indice dans le TP. |
| 5 | `efee52c9-a13f-4b46-b3aa-6f788c0098c5` | MAJEUR | 2 notion du brief absente du cours | `http_response_code(404)` et lecture de `album_id` / `track` en entiers | Cours sans 404 ni lecture de `$_GET` entier (cours, remarque 2). Le TP porte seul un callout « GET sans formulaire » (`1594664c-…`). | Mettre la notion dans le cours. La consigne nomme la fonction, ce qui évite le blocage. |
| 6 | `tp4-ex3-1`, `tp4-ex3-table` (`textarea`) | MINEUR | 2 notion non enseignée | `<textarea name="description">`, avec valeur réaffichée entre balises (`tp4-ex4-4`) | Le cours ne cite pas `textarea` (la slide `7117cc34-…` oui, avec la note « entre les deux balises »). | Une ligne dans le cours. |
| 7 | `48bb7beb-fcab-492c-a140-2d9cd6649e9a`, `tp4-ex3-4` | MINEUR | 2 notion non enseignée | « valeurs séparées par des virgules » (`implode`) | `implode` absent des cours actuels (seulement dans l'ancienne section 2). | Nommer `implode` dans la consigne, ou à confirmer sur le cours 2. |
| 8 | `a8507c32-49d7-4389-a620-cab81c8af156` | MINEUR | 2 notion non enseignée | `novalidate`, `filter_var(..., FILTER_VALIDATE_EMAIL)` | Cours : seulement `FILTER_VALIDATE_INT`. `FILTER_VALIDATE_EMAIL` est donné dans la consigne, `novalidate` aussi. | Acceptable : la consigne suffit. |
| 9 | `ded93d6b-3c33-4634-b938-45c8e746a152`, `077ab43a-a4da-43b4-9c94-e5767b4d5632`, règle 2 de `b1fb2a52-…` | MINEUR | 2 notion non enseignée | `date('Y')` et `preg_match` | `preg_match` : la regex est fournie. `date('Y')` : la consigne la cite. Aucun des deux dans le cours. | Acceptable. |
| 10 | règle 3 de `b1fb2a52-bbff-4311-9c5f-3fb5f4bf450c` | MINEUR | 2 notion non enseignée | « artiste absent de `$artists` » : tableau d'objets `Artist` à parcourir avec `getId()`, en comparant une chaîne postée à un `int` | Le cours valide avec `in_array` sur des clés de chaînes, jamais sur des objets. | Piège à mentionner dans la consigne (cast de `artist_id`). |
| 11 | `0672d6b1-ef1c-4b8b-bbb4-19e61c8a828b` | MINEUR | 6 commande dans un bloc texte + message à confirmer | Callout `warning` « Droits d'écriture » : `chmod 666 equipes.json` en ligne, et « Permission denied » | La commande est en texte inline, hors `code` `bash`. Le message exact de `ecrireEquipes()` dépend de `stockage.php`, illisible. | `code` `bash` pour la commande. Message à confirmer par etudiant-fragile. |
| 12 | `tp4-sec-a` (`tp4-a-download`, `fb697916-…`) | MINEUR | 4 non vérifiable | Résultats `recherche.php?q=git` → Git Happens seule, `q=NULL` → Null Pointers seule, 5 équipes initiales | `equipes.json` et `stockage.php` illisibles : aucun nom d'équipe confronté. | Relire avec le fichier : `git` ne doit trouver qu'une équipe. |
| 13 | `f30b0c40-c09f-4b08-84bb-6bc84c560e04` | MINEUR | 4 non vérifiable | `view_404.php` « fixe elle-même `$pageTitle` à 404 — Onzer » ; `render('404')` sans données | `view_404.php` illisible. Le TP3 ne décrit pas la signature de `render()`. | Relire le fichier fourni. |
| 14 | `94a74efd-d1e7-4a5d-a1f9-34e261ef6476`, `981ff27d-0a9a-4c8d-8df4-bb7b2a65d8ca` | MINEUR | 4 non vérifiable | Premier morceau « Tout commit », album 5 « I Queried a View », Rootkit → « Champs chiffrés », SSH, « les trois liens de chaque carte » | Le TP3 donne seulement Beta (id 4), « Laissez compiler » (index 1), « Waking Up in Vagrant » (album 5, index 2) et Maitre Git 2013. Pas de titres de morceaux ni de nombre de liens (catalog.php et vue illisibles). | Relire `core/catalog.php` et `view_list_albums.php`. |
| 15 | `e696ce5b-3b2b-4e2c-b0e4-ee91a1a32e66` | MINEUR | 4 non vérifiable | « le menu compte désormais cinq liens » | Le TP3 ne décrit pas le menu actuel (`header.php` illisible). | Relire `header.php` du TP3 : Catalogue seul avant ajout. |
| 16 | `9ffdc186-5869-4627-9b91-68d4b58a17d2` | (info, cohérent) | 4 | Classes `onzer-main` / `auth-page` / `auth-page home-page`, `$homeLayout` | TP3 : « `onzer-main` pour true, `auth-page home-page` pour false », `($authLayout ?? true)`. Le TP4 scinde cohéremment. | Rien. |

Aucune solution visible dans le TP : pas de violation « solution hors collapsible ».

### État du fil rouge à l'entrée
Le Rappel est cohérent avec la fin du TP3 :
- trois pages, `render()`, `authLayout` par défaut `true` ;
- `play_track.php` en dur sur `getAlbumById(4)` et `$trackIndex = 1` ;
- le TP3 n'a ni `$_GET` ni 404 (sa conclusion le dit) ;
- le TP4 retire le lien sans paramètre.

Pas de contradiction trouvée avec les briefs des sections 5 et 7 :
- `core/users.php` est supprimé en section 7 ;
- `admin@onzer.local` / Alain Ministration et `user@onzer.local` / Ulysse Sateur reprennent le brief 7 ;
- `validateAlbum()`, `track[]`/`duration[]` et `view_album_form` correspondent au brief 5 ;
- les mots de passe en clair sont assumés (`Admin123!`, `User123!`).

### Progression guidé → fil rouge
La partie classique (guidée, 5 exercices) précède la partie Onzer. Je n'ai pas pu lire l'attribut `projectRef` dans l'export. Dans la partie Onzer, le guidage diminue : consignes de plus en plus brèves, vues fournies. C'est cohérent.

## Confrontations
- exampleDomain : sans objet (domaine du TP : hackathon, hors fil rouge, comme prévu par la fiche).
- curriculum : 18 tâches (13 exercices + 5 bonus) confrontées sur 18. Notions introduites ou exigées sans cours : mb_strlen (BLOQUANT), casse ignorée, `implode`, `textarea`, `http_response_code`, `track[]`/`duration[]`, `date('Y')`, `preg_match`. Les trois dernières sont données par la consigne.
- dépôt (TP) : 10 résultats observables confrontés sur ~61. Les 10 : Beta id 4, index 1, « Laissez compiler », Maitre Git 2013, quatre morceaux, album 5 index 2, classes de `<main>`, `homeLayout`/`authLayout`, comptes admin/user (brief 7), absence de `$_GET` au TP3. Fichiers lus : TP3 export, briefs des sections 3, 5, 6, 7. Fichiers illisibles : `stockage.php`, `equipes.json`, `view_404.php`, `users.php`, quatre vues Onzer, `catalog.php`, `view_list_albums.php`, `view_player.php`, `functions.php`, `header.php` du TP3.
- cours (slides) : sans objet.

## Définition de terminé
- ✔ exemples vérifiés contre l'exampleDomain : sans objet (TP)
- ✔ notions utilisées confrontées au curriculum : 18 sur 18
- ✘ chaque résultat observable confronté au dépôt : 10 sur ~61. Dépôt injoignable (ECONNREFUSED) et 12 fichiers fournis ou TP3 non exportés. Rapport « incomplet ».
- sans objet : comparaison slides

---

## Synthèse pour l'orchestrateur
- Fuite Onzer : aucune dans le cours ni dans les slides. Le domaine « Recettes » est respecté (40 sur 40 et 30 sur 30).
- Blocage principal : `mb_strlen` est exigé dans quatre règles de validation du TP (description, nom et prénom, mot de passe, nom d'artiste) mais enseigné nulle part, ni dans ce cours ni dans les briefs des sections 1 à 3.
- Trois notions du brief manquent au cours et aux slides : `mb_strlen`, les paramètres d'URL sans formulaire avec 404, et les tableaux parallèles. Le TP les couvre seul.
- Les slides ajoutent cinq types de champs absents du cours : email, password, date, textarea, hidden.

Fichiers : aucun fichier créé ou lu en local. Tout a été lu via le MCP prod.


---

## PHP 4 — contrat TP

# Relecture contrat : php/4-formulaire — TP
Statut du rapport : incomplet

Source lue : `export_content_compact` (php, 4-formulaire, TP, v294, 2026-10-21, source db). Les 8 download-file ne sont pas dans l'export : leurs noms (`stockage.php`, `equipes.json`, `users.php`, `view_login.php`, `view_404.php`, `view_create_user.php`, `view_artist_form.php`, `view_album_form.php`) ont servi au champ 1. `get_content` non lu (limite de sortie). Aucun skill pédagogique chargé.

## Liste de tâches
- [x] tp4-ex1 « Rechercher une équipe » : 6 champs + durée
- [x] tp4-ex2 « Inscrire une équipe » : 6 champs + durée
- [x] tp4-ex3 « Compléter le formulaire » : 6 champs + durée
- [x] tp4-ex4 « Valider la saisie » : 6 champs + durée (champ 4 vague)
- [x] tp4-ex5 « Échapper les saisies » : 6 champs + durée
- [x] 78378c03-0065-47ad-a116-b1de158107b5 « Rappel » : 6 champs + durée (champ 6 absent)
- [x] bb8683f8-a2d8-4750-b790-8687530e1f76 « Mise en place » : 6 champs + durée
- [x] 94a74efd-d1e7-4a5d-a1f9-34e261ef6476 « Lire l'URL et répondre 404 » : 6 champs + durée
- [x] 3deef7ae-5b4d-495a-9fb5-f38739ebb32f « Se connecter » : 6 champs + durée
- [x] 9702af6b-0112-4f5e-a9e8-96dbad02ce1d « S'inscrire » : 6 champs + durée
- [x] 5fe64482-b3c9-4751-b968-44eeeaf2f3bf « Créer un artiste » : 6 champs + durée
- [x] 225ff249-cb6a-470a-afeb-f6a1027bf1b2 « Créer un album » : 6 champs + durée
- [x] 1ff07309-4b54-4c5a-ae57-ca69b3e4c6d8 « Modifier un album » : 6 champs + durée
- [x] 19992953-513c-4e0e-a79f-76faea759566 « Nom déjà pris » (bonus) : 6 champs + durée
- [x] a58304dd-c380-4b66-9d66-65cd90761aeb « Recherche mémorisée » (bonus) : 6 champs + durée
- [x] 6a3a1014-1e82-4f6b-9ae6-bd03dc748dc1 « Deux ateliers au plus » (bonus) : 6 champs + durée
- [x] 8fcc9986-3a7d-491f-8ba2-1b9e5b398381 « Un message par champ » (bonus) : 6 champs + durée
- [x] d335e97d-f6f9-4ffa-ada6-8c5e85d382b3 « Doublon de morceau » (bonus) : 6 champs + durée
- [ ] somme des durées et pourcentage du budget : impossible, 0/13 durées renseignées

## Grille
| Exercice (id) | Type | 1 Fichier | 2 Noms | 3 Données | 4 API | 5 Résultat | 6 Validation | Durée |
|---|---|---|---|---|---|---|---|---|
| tp4-ex1 | tronc | présent | présent | présent | présent | présent | présent | absente |
| tp4-ex2 | tronc | présent | présent | présent | présent | présent | présent | absente |
| tp4-ex3 | tronc | présent | présent | présent | présent | présent | présent | absente |
| tp4-ex4 | tronc | présent | présent | présent | vague | présent | présent | absente |
| tp4-ex5 | tronc | présent | présent | présent | présent | présent | présent | absente |
| 78378c03-0065-47ad-a116-b1de158107b5 | tronc | présent | présent | sans objet (aucune saisie) | présent | vague | absent | absente |
| bb8683f8-a2d8-4750-b790-8687530e1f76 | tronc | présent | présent | sans objet (aucune saisie) | présent | présent | présent | absente |
| 94a74efd-d1e7-4a5d-a1f9-34e261ef6476 | tronc | présent | présent | présent | présent | présent | présent | absente |
| 3deef7ae-5b4d-495a-9fb5-f38739ebb32f | tronc | présent | présent | présent | présent | présent | présent | absente |
| 9702af6b-0112-4f5e-a9e8-96dbad02ce1d | tronc | présent | présent | présent | présent | présent | présent | absente |
| 5fe64482-b3c9-4751-b968-44eeeaf2f3bf | tronc | présent | présent | présent | présent | présent | présent | absente |
| 225ff249-cb6a-470a-afeb-f6a1027bf1b2 | tronc | présent | présent | présent | présent | présent | présent | absente |
| 1ff07309-4b54-4c5a-ae57-ca69b3e4c6d8 | tronc | présent | présent | présent | présent | présent | présent | absente |
| 19992953-513c-4e0e-a79f-76faea759566 | bonus | présent | présent | vague | présent | présent | vague | absente |
| a58304dd-c380-4b66-9d66-65cd90761aeb | bonus | présent | présent | sans objet (reprend ex-1) | vague | présent | absent | absente |
| 6a3a1014-1e82-4f6b-9ae6-bd03dc748dc1 | bonus | absent | vague | absent | vague | présent | absent | absente |
| 8fcc9986-3a7d-491f-8ba2-1b9e5b398381 | bonus | vague | vague | absent | vague | vague | absent | absente |
| d335e97d-f6f9-4ffa-ada6-8c5e85d382b3 | bonus | vague | présent | absent | vague | présent | absent | absente |

Critère appliqué aux champs 4 et 6 : une méthode est « imposée » si elle est nommée, ou si un test de la table de vérification la rend incontournable. Par exemple, ex1 est présent (le test sans paramètre impose la valeur par défaut) et ex2 est présent (le test formulaire vide écarte `!empty()`). ex4 champ 4 est vague : le test de 201 caractères ne contient aucun accent, donc `strlen()` passe.

## Budget
- tronc commun : 13 exercices (5 classiques + 8 Onzer). Durées renseignées : 0/13. Somme : non calculable.
- budget TP : 2 × 180 − 20 = 340 min (hypothèse validée par l'utilisateur) ; plage 272–340 min.
- pourcentage : non calculable (aucune durée visible dans l'export compact).
- bonus (hors budget) : 5 items, durées absentes. Aucun n'est marqué « bonus » dans son item (voir remarque 10).
- Tous les items non bonus (les deux parties) sont traités comme tronc commun.

## Remarques
| # | id du bloc | Gravité | Champ | Passage concerné | Proposition |
|---|---|---|---|---|---|
| 1 | 78378c03-0065-47ad-a116-b1de158107b5 | BLOQUANT | 6 Validation | « Enregistrez le fichier fourni sous `views/view_404.php` » ; aucun critère de vérification | ajouter une ligne vérifiable, par ex. « le fichier est dans `views/` ; à l'exercice 94a74efd, `play_track.php?album_id=99&track=0` affiche la page 404 » |
| 2 | 78378c03-0065-47ad-a116-b1de158107b5 | MAJEUR | 5 Résultat | « Une action qui l'affiche appelle `render('404')` » : rendu non décrit | décrire le rendu observable, par ex. page avec titre d'onglet « 404 — Onzer » et menu |
| 3 | tp4-ex1-txt, tp4-ex2-txt, tp4-ex3-txt, tp4-ex4-txt, tp4-ex5-txt, 78378c03-0065-47ad-a116-b1de158107b5, bb8683f8-a2d8-4750-b790-8687530e1f76, 94a74efd-d1e7-4a5d-a1f9-34e261ef6476, 3deef7ae-5b4d-495a-9fb5-f38739ebb32f, 9702af6b-0112-4f5e-a9e8-96dbad02ce1d, 5fe64482-b3c9-4751-b968-44eeeaf2f3bf, 225ff249-cb6a-470a-afeb-f6a1027bf1b2, 1ff07309-4b54-4c5a-ae57-ca69b3e4c6d8 | MAJEUR | Durée | Aucune durée visible dans l'export compact ; `get_content` non lisible (limite de sortie). La section expose `totalDuration: 2`, sans unité ni décomposition : non utilisé. | Le collecteur doit confirmer les durées par exercice (métadonnées de bloc non rendues par l'export ?) avant que ces 13 remarques soient retenues. La somme reste non calculée en attendant. |
| 4 | tp4-ex4-rules | MAJEUR | 4 Méthode | « description : 200 caractères au plus, un caractère accentué comptant pour un » : aucune méthode imposée | nommer `mb_strlen()` dans la consigne, ou ajouter une ligne de test avec un accent |
| 5 | 19992953-513c-4e0e-a79f-76faea759566 | MAJEUR | 3 Données, 6 Validation | « refusez un nom déjà présent… » : aucun essai donné | ajouter un essai, par ex. « GIT HAPPENS » → « Ce nom d'équipe est déjà pris. », équipe non ajoutée |
| 6 | a58304dd-c380-4b66-9d66-65cd90761aeb | MAJEUR | 4 Méthode, 6 Validation | « réaffichez la saisie `$q` dans le champ » : méthode non imposée, aucun test | imposer `value` avec `htmlspecialchars()` et ajouter un test : saisir « git », le champ garde « git » |
| 7 | 6a3a1014-1e82-4f6b-9ae6-bd03dc748dc1 | MAJEUR | 1 Fichier, 3 Données, 6 Validation | « Deux ateliers au plus » : aucun fichier nommé, aucun essai | nommer le fichier (`tp4/inscription.php`) ; ajouter un essai à trois ateliers |
| 8 | 8fcc9986-3a7d-491f-8ba2-1b9e5b398381 | MAJEUR | 1, 3, 4, 5, 6 | « Un message par champ » : fichier non chemin exact, « comme dans la partie A » sans méthode, pas d'essai | nommer `tp4/inscription.php` ou `views/view_create_user.php` ; un essai par champ fautif |
| 9 | d335e97d-f6f9-4ffa-ada6-8c5e85d382b3 | MAJEUR | 1, 3, 4, 6 | « Doublon de morceau » : `validateAlbum()` sans chemin, aucun essai, méthode de comparaison non imposée | nommer `core/validation.php` ; ajouter un essai avec « Lune » et « lune » ; imposer `mb_strtolower()` et `trim()` |
| 10 | 96f8c702-cc68-4f30-9bed-a3e4fc4ead58 | MAJEUR | mention « bonus » | Le texte du TP dit « Le bonus « Nom déjà pris » », mais les items sous « Pour aller plus loin » ne portent pas ce mot (les 5 bonus) | préfixer chaque item de « Bonus : » |

## Définition de terminé
- ✔ grille complète, chaque exercice et bonus × 6 champs : 18 lignes sur 18 (13 tronc + 5 bonus), 6 cases chacune, chaque « sans objet » avec sa raison.
- ✘ somme des durées et pourcentage du budget : 0/13 durées renseignées ; somme non calculable ; plage 272–340 min, pourcentage non calculable. Rapport incomplet.



---

## PHP 4 — étudiant fragile cours

# Étudiant fragile : php/4-formulaire — cours, mode lecture
Statut du rapport : incomplet (3 notions du brief absentes du cours, donc impossibles à pratiquer ; tout le reste a été exécuté)
Conteneur : cours-iut-bac-php-4-formulaire-20261027-094328, dossier /work/fragile-cours

## Liste de tâches
- [x] form-search-html-code (search.php) exécuté : 4 recettes ; `query=tarte` donne 2 tartes ; `query=éclair` donne l'éclair ; `query=` et l'absence de clé donnent les 4 recettes.
- [x] Erreur fréquente « clé absente » (form-search-warning) reproduite : `Warning: Undefined array key "query"`, message identique à celui du cours.
- [x] Section « Se protéger d'une valeur inattendue » : `query[]=tarte` avec `trim` donne le TypeError cité (message identique, ligne 10 comme annoncé). Avec `cleanString` (core/functions.php) la page répond 200 avec les 4 recettes.
- [x] Faille XSS (form-xss-unsafe) : `<script>alert(1)</script>` ressort tel quel dans la page. Version sûre (form-xss-safe) : `&lt;script&gt;`, et `value="&quot;&gt;..."` pour l'attribut.
- [x] create_recipe.php complet (ae4f9940) exécuté en GET, POST vide, POST avec durée 600, POST valide, POST avec valeurs inventées. Tout est conforme (messages, `checked`, `selected`, valeurs conservées). `Poisson & légumes` s'affiche `Poisson &amp; légumes`.
- [x] Tableaux `diet[]` et `allergen[]` (curl `-d`) reçus comme tableaux ; `title[]=a` ne plante pas grâce à cleanString.
- [x] PRG (form-errors-prg-code) : 302 Found obtenu avec `Location` et `exit`.
- [x] Découpage contrôleur/vue (2c6f1e79 et suivants) exécuté, mais avec un render()/header/footer que j'ai dû écrire moi-même (voir remarque 3).
- [x] rendu-html sur create_recipe.php : texte visible correct. La capture est dans /work/rendu.png (je ne peux pas la voir).
- [x] Variantes à prédire : le cours n'en propose aucune explicite. J'ai prédit puis exécuté 3 cas de mon cru.
  - POST avec `title[]` : prédit « pas de plantage », constaté pareil.
  - `diet[]=vegan` : prédit « erreur diet », constaté pareil.
  - Ouverture directe : prédit « aucune erreur affichée », constaté pareil.
- [ ] Notion « mb_strlen », « paramètres d'URL sans formulaire + 404 (http_response_code) », « tableaux parallèles track[]/duration[] » : bloquées, absentes du cours (recherche par grep : aucune occurrence de mb_strlen, http_response_code, 404, track, duration).

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | cours entier | BLOQUANT | Brief : « validation ($errors, … mb_strlen) », « paramètres d'URL sans formulaire et réponse 404 (http_response_code) », « tableaux parallèles track[] / duration[] recollés par rang » | Rien dans le cours. Aucune source possible, les 3 notions restent « non » au bilan. | 10 min de blocage par notion | Ajouter ces trois parties au cours, ou les retirer du brief. La validation de longueur du titre est absente (le titre n'est testé que vide). Le cours n'a ni lien `?id=3` ni 404. Le formulaire de recette n'a pas de pistes parallèles. |
| 2 | form-simple-flow-code, form-errors-simple-code, form-errors-valid-text | MAJEUR | « Initialisez `$recipe = null;` avant le bloc POST » | Les fragments successifs sont dispersés (`$choices` « avant le bloc POST », `$recipe` dans le texte après le code). Je me suis appuyé sur le fichier complet (ae4f9940) pour l'ordre. `$time` n'existe que dans le bloc POST. | 3 min | Montrer l'ordre final des déclarations dès form-complex-read-code, ou renvoyer explicitement au fichier complet. |
| 3 | 2c6f1e79, c674d4e7, 6fc71e97 | MAJEUR | « `core/functions.php` : `render()` … », `render('search', …)`, `views/view_search.php` | Le curriculum de la section 3 donne « render() avec extract » mais pas sa signature ni le préfixe `view_`. J'ai écrit `render(string $view, array $data)` avec `require views/view_<nom>.php`. header.php utilise `$pageTitle`, ce que le cours ne dit pas. Le contenu de header.php/footer.php n'est pas donné. | 3 min | Rappeler la signature de render() et le contenu minimal de header.php (avec `$pageTitle`). |
| 4 | 6a9c4c97 | MAJEUR | « Le HTML de search.php … part tel quel dans views/view_search.php » | Le fichier view_search.php n'est pas montré. Je n'ai pas pu l'exécuter tel quel. | 2 min | Donner le fichier, comme pour view_recipe_form.php. |
| 5 | form-search-html-code | MINEUR | `action="search.php"` | Le premier exemple utilise `trim` (TypeError possible). `cleanString` n'apparaît qu'ensuite. Il faut réécrire la ligne à la main : la note « search.php (début du fichier) » montre `$recipes = [ // inchangé ]`. | 1 min | Dire que le fichier devient la version cleanString. |
| 6 | form-search-read-text | MINEUR | « La ligne 10 lit la saisie » | Exact seulement avec le bloc de code tel quel (sans require_once). Cela change après l'ajout de cleanString, qui décale la ligne. | 30 s | Supprimer le numéro de ligne ou citer l'instruction. |
| 7 | form-xss-unsafe | MINEUR | « search.php (partie HTML) » | L'emplacement du `<p>` « Résultats pour » n'est pas précisé : avant le `<ul>` (je l'ai deviné). | 1 min | Préciser « entre le formulaire et la liste ». |
| 8 | form-complex-*-code | MINEUR | « Les fragments s'ajoutent dans le form » | Les fragments statiques sont ensuite remplacés par des boucles (form-errors-choices-display). Le lecteur qui les a recopiés doit tout refaire. | 1 min | Signaler le remplacement dès le premier fragment. |
| 9 | outil | Limite d'environnement | — | `curl` interprète `[]` (globbing) : `query[]=` demande `-g`. Le cours ne le mentionne pas. | 2 min | Ajouter `-g` si le cours propose des commandes curl. |
| 10 | form-xss-escape-text | MINEUR | « Depuis PHP 8.1, l'appel sans option échappe aussi … en UTF-8 » | Vérifié : `&quot;` obtenu en PHP 8.3 (OK). `htmlspecialchars` est utilisé sans définition préalable ni apparition dans le curriculum, mais il est défini juste après. | 1 min | Aucune. |
| 11 | form-errors-simple-text | MINEUR | `filter_var`, `FILTER_VALIDATE_INT`, `array_diff`, `in_array` (un seul en sections précédentes ?) | Termes non présents dans le curriculum, mais définis là où ils servent (OK). `array_keys` et le `true` strict de `in_array` ne sont pas expliqués. | 2 min | Une phrase sur le troisième argument `true`. |
| 12 | outil | Limite d'environnement | — | `rendu-html` a écrit /work/rendu.png (hors /work/fragile-cours). | — | À nettoyer par l'orchestrateur. |

## Temps (barème fixe)
| Exercice ou partie | Détail du calcul | Total |
|---|---|---|
| Lecture du cours | ~5 600 mots / 200 = 28 min ; ~560 lignes de code lues à 6 s = 56 min | ~84 min |
| Exécution des exemples | ~30 commandes à 20 s = 10 min ; recopie ~350 lignes à 10 s = 58 min ; erreurs (garde, EOF) 2 min | ~70 min |
Temps de lecture du cours : ~84 min (lecture seule) ; tests compris ~154 min.

## Bilan des notions du brief
| Notion | À quoi elle sert (source) | Utilisation (mini-exemple exécuté) | Résultat |
|---|---|---|---|
| $_GET / $_POST, lecture avec ?? et valeur par défaut | Reçoivent les paires name=valeur ; `?? ''` évite l'absence de clé (722d8df4, form-search-warning) | `curl search.php?query=x`, clé absente, `-d` en POST | oui |
| $_SERVER['REQUEST_METHOD'] | Distinguer affichage (GET) et traitement (POST) (form-simple-flow-text) | `curl` GET puis `-d` : formulaire vide puis erreurs | oui |
| radio, checkbox, select, select multiple, name="x[]" | Forme PHP selon le champ ; `[]` donne un tableau (a68e57b7, form-complex-*) | `diet[]=vegetarian&allergen[]=gluten&allergen[]=nuts` : `checked`/`selected` réaffichés | oui |
| validation côté serveur ($errors, liste autorisée) | `in_array`/`array_diff` sur `$choices` (form-errors-choice-text) | `category=zzz` et `diet[]=vegan` : erreurs affichées | oui |
| validation avec mb_strlen | Absent du cours | — | non (aucune source) |
| réaffichage des valeurs saisies | `value`, `checked`, `selected` depuis `$values` (form-errors-display-text) | POST durée 600 : valeurs conservées | oui |
| htmlspecialchars et faille XSS | Empêcher une saisie de devenir du HTML (form-xss-*) | `<script>` ressort brut puis échappé | oui |
| paramètres d'URL sans formulaire et 404 (http_response_code) | Absent du cours | — | non (aucune source) |
| tableaux parallèles track[] / duration[] | Absent du cours | — | non (aucune source) |

## Définition de terminé
- ✘ mode lecture : exemples exécutés (tous ceux du cours : oui, sauf view_search.php non fourni), variantes (3 sur 3, de mon cru, le cours n'en propose pas), bilan rempli pour 6 notions sur 9 (3 absentes du cours).
- ✔ chaque étape cite sa source ou est marquée sans source (voir journal : 24 étapes, 21 sourcées, 3 devinées).
- ✔ aucun fichier laissé hors de /work/fragile-cours, sauf /work/rendu.png créé par rendu-html. Sortie de `ls /work` : depart, fournis, fragile-cours, fragile-tp, rapide, supports.

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | Lecture du cours par `sed` | consigne du prompt | OK |
| 2 | core/functions.php (cleanString, cleanList) | 090eccb9, form-complex-list-code | OK |
| 3 | search.php (version trim) | form-search-html-code | conforme |
| 4 | `php -S localhost:8000` | consigne du prompt | OK |
| 5 | curl `query=…` (tarte, éclair, vide, absent) | form-search-examples | conforme |
| 6 | `query[]=tarte` avec trim | 86bfa100 | TypeError identique |
| 7 | passage à cleanString | 090eccb9 | OK |
| 8 | version sans `??` | form-search-warning | Warning identique |
| 9 | `<?= $query ?>` non échappé | form-xss-unsafe | `<script>` brut |
| 10 | version échappée | form-xss-safe | OK |
| 11 | create_recipe.php complet (cr_a + cr_b) | ae4f9940 | OK |
| 12 | POST vide, 600, valide, inventé | form-errors-*, ae4f9940 | conforme |
| 13 | PRG (`header` + `exit`) | form-errors-prg-code | 302 |
| 14 | découpage sp/ : render() avec extract | curriculum:section3:« render() avec extract » | OK |
| 15 | signature `render(string $view, array $data)` | aucune source (devinée) | OK |
| 16 | préfixe `view_` du fichier | c674d4e7 | OK |
| 17 | contenu header.php / footer.php | aucune source (deviné) | OK |
| 18 | `$pageTitle` dans le `<title>` du header | aucune source (deviné) | OK |
| 19 | rendu-html | consigne du prompt | OK |
| 20 | `curl -g` pour `[]` | limite d'environnement | OK |
| 21 | emplacement du `<p>` « Résultats pour » avant le `<ul>` | form-xss-unsafe (partiel) | OK |
| 22 | `$_SERVER['REQUEST_METHOD']` | form-simple-flow-code | OK |
| 23 | `require_once __DIR__ . '/core/functions.php'` | curriculum:section3:« require_once, __DIR__ » | OK |
| 24 | syntaxe alternative (if:/foreach:) dans les vues | curriculum:section3:« syntaxe alternative » | OK |

Fichiers : /work/fragile-cours (search.php, s_*.php, create_recipe.php, sp/, prg.php, scripts *.sh).


---

## PHP 4 — étudiant fragile TP

# Étudiant fragile : php/4-formulaire — TP, mode exécution
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-4-formulaire-20261027-094328, dossier /work/fragile-tp (tp4/ pour la partie A, onzer/ pour Onzer)
Serveurs php -S : 8010 (tp4), 8011 (onzer). Tout a été vérifié avec curl. Un seul rendu-html a été fait (login.php), la capture est dans /work/rendu.png (hors de /work/fragile-tp, créée par l'outil). Aucun test en vrai navigateur : l'alerte XSS, le comportement de `<form>` sans `action` et le `novalidate` ne sont pas vérifiés visuellement.

## Liste de tâches
- [x] A-ex1 Rechercher une équipe : fini, les 4 URL donnent le résultat attendu
- [x] A-ex2 Inscrire une équipe : fini
- [x] A-ex3 Compléter le formulaire : fini (var_dump comparé avec/sans case cochée puis retiré)
- [x] A-ex4 Valider la saisie : fini, les 4 situations vérifiées (formulaire vide : 6 messages, `equipes.json` inchangé)
- [x] A-ex5 Échapper : faille exploitée (balises brutes en sortie), puis corrigée, puis `equipes.json` restauré
- [x] Onzer Rappel (view_404)
- [x] Onzer Mise en place (header, index)
- [x] Onzer Lire l'URL et 404 (6 URL du tableau OK, codes 404 vérifiés)
- [x] Onzer Se connecter (5 lignes OK)
- [x] Onzer S'inscrire (6 règles OK)
- [x] Onzer Créer un artiste (OK, le catalogue reste inchangé)
- [x] Onzer Créer un album (7 lignes OK, plus le singulier « 1 morceau »)
- [x] Onzer Modifier un album (6 lignes OK)
- Bonus : non faits, comme demandé.

## Remarques
| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | tp4-ex4-rules, tp4-ex4-1 | MAJEUR | « 200 caractères au plus, un caractère accentué comptant pour un » ; Onzer : « plus de 100 / 255 caractères » | La fonction à employer. `mb_strlen` n'apparaît ni dans le TP ni dans le cours (0 occurrence), et `strlen` donnerait faux avec les accents. J'ai pris `mb_strlen` de tête, donc sans source. | 3 min | Nommer `mb_strlen()` dans le tableau (comme `filter_var` ou `preg_match` le sont) ou l'ajouter au cours. |
| 2 | Onzer « Créer un artiste », règle 3 | MAJEUR | « casse ignorée » | `mb_strtolower` n'est pas enseigné. Je l'ai pris de tête. Le curriculum de `users.php` (`strcasecmp`) aurait pu servir, mais je ne l'ai pas utilisé. | 3 min | Indiquer la fonction (`mb_strtolower` ou `strcasecmp`), ou renvoyer à l'exemple de `findUserByEmail`. |
| 3 | Onzer « Créer un album », étape 1 | MAJEUR | « cinq lignes de morceaux vides » | Pas de source pour fabriquer ce tableau de 5 lignes (`array_fill`, absent du cours et du TP). J'ai pris `array_fill` de tête. Une boucle `for` du curriculum section 1 aurait suffi. | 3 min | Donner un indice (`array_fill(0, 5, [...])` ou une boucle). |
| 4 | Onzer « Créer un album », étape 1 | MINEUR | « Le formulaire s'envoie à l'URL de la page courante, paramètres compris » | J'ai omis `action`, d'après le cours « sans `action`, la requête repart vers l'URL de la page courante ». Je n'ai pas pu vérifier que la query-string est conservée, car curl ne se comporte pas comme un navigateur. L'énoncé ne dit pas s'il faut omettre `action` ou mettre `$_SERVER['REQUEST_URI']` (absent du cours). | 1 min | Écrire « laissez `action` absent ». |
| 5 | Onzer « Mise en place », étape 2 | MINEUR | « quatre liens sur le même modèle » | Le modèle contient une icône `fa-solid fa-house`. Pour les quatre nouveaux liens j'ai inventé les icônes (`fa-circle-plus`, etc.) ; rien ne dit s'il en faut une ni laquelle. | 1 min | Donner les classes d'icône ou dire « sans icône ». |
| 6 | Onzer « Lire l'URL », étape 1 | MINEUR | « envoyez le code 404 avec `http_response_code(404)` » | Aucun problème : la fonction est donnée dans la consigne. À noter seulement qu'elle est absente du cours, la consigne la fournit. | 0 | RAS |
| 7 | tp4-ex2-3 / tp4-ex4-5 | MINEUR | « `membres` y est enregistré en entier » | En ex4, le récapitulatif doit afficher l'entier ou la chaîne ? Sans effet visible, j'ai créé `$nbMembres` (nom libre). Au passage de l'ex3 à l'ex4 il faut changer la variable du récapitulatif, ce que la consigne ne dit pas. | 1 min | Dire de quelle variable le récapitulatif lit le nombre de membres. |
| 8 | Onzer album, tableau de `form` | MINEUR | « `form` contient un titre, une année et un artiste vides » | La liste déroulante n'a pas d'option vide : visuellement le premier artiste est sélectionné alors que `artist_id` est ''. Le tableau d'essais « tous les champs vides → règle 1 » n'est pas sensible à ça. | 1 min | Préciser s'il faut une option « Choisissez ». |
| 9 | Onzer « Modifier un album », étape 2 | MINEUR | « complété par des lignes vides jusqu'à cinq morceaux au moins » | Il faut que les morceaux de l'album aient les clés `title` et `duration` pour les recopier dans `form`. Je l'ai déduit de `view_player.php` (TP3), c'est sourcé mais implicite. | 1 min | Rappeler la forme des morceaux de l'entité `Album`. |
| 10 | tp4-a-intro, bloc « Indice » | MINEUR | Export | Bloc repliable rendu en titre `###` (limite d'export connue). | 0 | RAS |

Limites d'environnement : aucune bloquante. Les CDN Bootstrap / Font Awesome ne sont pas évalués, le rendu n'a pas été examiné visuellement. L'état de départ Onzer correspondait à ce que supposait le TP4 : aucun écart gênant.

## Temps (barème fixe)
| Exercice | Détail du calcul | Total | Démarrage | Statut |
|---|---|---|---|---|
| A-ex1 | lecture ~330 mots = 2 min ; 17 lignes écrites = 8,5 min ; 4 cmds = 1,5 min ; exécution 10 s ; vérification 30 s | 14 min | ~1 min | fini |
| A-ex2 | lecture ~400 mots = 2 min ; 25 lignes = 12,5 min ; 3 cmds = 1 min ; vérif. 30 s | 18 min | ~1 min | fini |
| A-ex3 | lecture ~450 mots = 3 min ; ~60 lignes = 30 min ; 4 cmds ; vérif. | 36 min | ~1 min | fini |
| A-ex4 | lecture ~500 mots = 3 min ; ~85 lignes = 42 min ; 1 recherche cours (filter_var) 1 min ; 1 terme non défini (mb_strlen) 1 min ; 1 hésitation 3 min ; cmds, vérif. | 54 min | ~1 min | fini |
| A-ex5 | lecture ~400 mots = 2 min ; ~12 lignes modifiées = 6 min ; 4 cmds ; vérif. | 12 min | ~1 min | fini |
| Onzer Rappel + Mise en place | lecture 3 min ; ~12 lignes = 6 min ; cmds, vérif. | 10 min | ~1 min | fini |
| Onzer 404 / URL | lecture 2 min ; 6 lignes + 2 liens = 4 min ; cmds, vérif. | 9 min | ~1 min | fini |
| Onzer Connexion | lecture 2 min ; ~25 lignes = 12 min ; cmds, vérif. | 17 min | ~1 min | fini |
| Onzer Inscription | lecture 2 min ; ~50 lignes = 25 min ; cmds, vérif. | 31 min | ~1 min | fini |
| Onzer Artiste | lecture 1 min ; ~30 lignes = 15 min ; 1 hésitation 3 min ; vérif. | 22 min | ~1 min | fini |
| Onzer Album | lecture 3 min ; ~90 lignes = 45 min ; 2 hésitations 6 min ; vérif. | 59 min | ~1 min | fini |
| Onzer Modifier | lecture 1 min ; ~50 lignes = 25 min ; vérif. | 29 min | ~1 min | fini |

Total tronc commun : environ 311 min, sous le budget de 340 min mais avec seulement ~29 min de marge. Les exercices les plus lourds sont l'album (59 min) et l'ex4 (54 min), parce qu'on écrit beaucoup de lignes. Aucun démarrage > 2 min.

## Bilan des notions du brief (mode lecture)
Sans objet : mode exécution.

## Définition de terminé
- ✔ mode exécution : chaque exercice mené au bout (12 sur 12), temps calculé par exercice (12 sur 12)
- ✔ chaque étape du journal cite sa source ou est marquée « aucune source » (voir annexe : 28 étapes, 22 sourcées, 6 devinées)
- ✔ aucun fichier de travail hors de /work/fragile-tp, hormis /work/rendu.png créé par l'outil rendu-html. Sortie de `ls /work` : fournis, fragile-cours, fragile-tp, rapide, rendu.png, supports

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | Copier stockage.php / equipes.json dans tp4/ | tp4-a-setup-1, tp4-a-setup-2 | ok |
| 2 | recherche.php : `require_once`, `lireEquipes()` | gabarit tp4-ex1, curriculum:section3:« require_once » | ok |
| 3 | `$q = trim($_GET['q'] ?? '')` | cours (lignes `$query = trim($_GET['query'] ?? '')`), tp4-ex1-3 | ok, sans warning |
| 4 | `filtrerEquipes($equipes, $q)` | tp4-ex1-4 | ok |
| 5 | Formulaire GET `type=search name=q`, boucle `foreach` avec syntaxe alternative | tp4-ex1-2, curriculum:section3:« syntaxe alternative » | 4 URL conformes |
| 6 | inscription.php : formulaire POST, `$_SERVER['REQUEST_METHOD'] === 'POST'` | tp4-ex2, cours (exemple create_recipe) | conforme |
| 7 | Ajout des 5 champs, `name="technos[]"`, `<select multiple>` | tp4-ex3-table | ok |
| 8 | `var_dump($_POST)` avec PHP+Rust puis sans case | tp4-ex3-2, tp4-ex3-warn | `technos` absent sans case |
| 9 | Lectures avec `?? ''` / `?? []` | tp4-ex3-3 | ok |
| 10 | `implode(', ', …)` pour les tableaux | aucune source (le TP dit « valeurs séparées par des virgules » sans nommer la fonction ; non vérifié dans le cours) | ok, deviné |
| 11 | `filter_var(..., FILTER_VALIDATE_INT, ['options' => min_range/max_range])` | tp4-ex4-rules, cours (exemple `$time = filter_var(...)`) | ok |
| 12 | `mb_strlen($description) > 200` | aucune source | 201 « é » refusés, 200 acceptés ; deviné |
| 13 | `in_array` / `array_diff` pour les listes autorisées | cours (sections in_array / array_diff) | ok |
| 14 | Réaffichage `checked` / `selected` avec `in_array($v, $tab, true)` | cours (tableau « checkbox / select ») | ok |
| 15 | Écriture : `lireEquipes()`, ajout, `ecrireEquipes()` | tp4-ex4-5 | sixième équipe écrite ; fichier restauré à la fin |
| 16 | Exploitation de la faille (`<b>`, `<script>`) | tp4-ex5-1, tp4-ex5-2 | balises brutes constatées en sortie |
| 17 | `htmlspecialchars()` partout où une valeur est affichée | tp4-ex5-3 | texte échappé ; 5 équipes après restauration |
| 18 | header.php : classe de `<main>` à trois cas, `$homeLayout ?? false` | tp-mise-en-place 1, curriculum:section3:« header partagé », curriculum:section2:« ?? » | ok |
| 19 | Quatre liens `nav-link` avec icônes inventées | tp-mise-en-place 2 pour les liens ; icônes : aucune source | liens ok, icônes devinées |
| 20 | view_404 copiée, `render('404')` | tp Rappel | ok |
| 21 | play_track : `(int) ($_GET[…] ?? 0)`, `http_response_code(404)`, `exit` | tp 404 étape 1 ; cours (4 occurrences de `exit`), curriculum:section3:« redirect » | 6 URL conformes |
| 22 | Liens des vues avec `album_id` et `track` | tp 404 étape 2 | ok |
| 23 | login.php + formulaire dans la vue ; `findUserByEmail` | tp Se connecter 1-3 | 5 cas conformes |
| 24 | create_user.php : règles dans l'ordre (`elseif`), `filter_var(FILTER_VALIDATE_EMAIL)` | tp S'inscrire tableau des règles | 6 cas conformes |
| 25 | create_artist.php : `mb_strtolower` pour la casse | aucune source | « ssh » refusé ; deviné |
| 26 | create_album.php : `array_fill(0, 5, …)`, recollage des deux tableaux par rang | `array_fill` : aucune source ; recollage : indice du TP (« Indice : associer un titre à sa durée ») | 7 cas conformes ; `array_fill` deviné |
| 27 | validation.php : `preg_match`, `date('Y')`, `filter_var` | tp album, règles 2 et 5 (fonctions données) | ok |
| 28 | update_album.php + lien « Modifier » | tp Modifier un album | 6 cas conformes |



---

## PHP 4 — étudiant rapide TP

# Étudiant rapide : php/4-formulaire — TP
Statut du rapport : terminé
Conteneur : cours-iut-bac-php-4-formulaire-20261027-094328, dossier /work/rapide (contient `tp4/` et `onzer/`)

Résultat en une ligne : le tronc commun et les 5 bonus ont été faits et vérifiés. Au barème, le tronc commun coûte 141 min pour un budget de 340 min. Les bonus coûtent 19 min, donc il reste environ 180 min non occupées. C'est le défaut principal du TP (remarque 1).

## Liste de tâches
- [x] ex-1 Rechercher une équipe
- [x] ex-2 Inscrire une équipe
- [x] ex-3 Compléter le formulaire
- [x] ex-4 Valider la saisie
- [x] ex-5 Échapper les saisies
- [x] Onzer : Rappel (404) et Mise en place
- [x] Onzer : Lire l'URL et répondre 404
- [x] Onzer : Se connecter
- [x] Onzer : S'inscrire
- [x] Onzer : Créer un artiste
- [x] Onzer : Créer un album (avec l'indice)
- [x] Onzer : Modifier un album
- [x] bonus-1 Nom déjà pris
- [x] bonus-2 Recherche mémorisée
- [x] bonus-3 Deux ateliers au plus
- [x] bonus-4 Un message par champ
- [x] bonus-5 Doublon de morceau
- [x] temps restant
- [x] bilan des bonus

## Remarques
Les remarques portent sur les bonus. Les trous du tronc commun sont signalés parce qu'ils m'ont forcé à deviner.

| # | id du bloc | Gravité | Ligne de consigne en cause | Ce que j'ai dû deviner | Temps perdu estimé | Proposition |
|---|---|---|---|---|---|---|
| 1 | 08f5d3b1-0d81-4511-af68-398172bd50c9 (Pour aller plus loin), bloc des 5 puces | MAJEUR | Les 5 bonus | Rien à deviner, mais ils totalisent 19 min au barème. Temps restant non occupé : 340 − 141 − 19 = 180 min. | 0 (c'est du temps vide) | Les bonus ne remplissent pas du tout le temps restant. Il faudrait des bonus lourds et enseignés : enregistrer réellement l'artiste ou l'album (Post/Redirect/Get, tableau en session simulé), pagination de la recherche d'Onzer, ou un formulaire complet avec les messages par champ. Sinon, réduire le budget annoncé ou allonger le tronc commun. |
| 2 | a58304dd-c380-4b66-9d66-65cd90761aeb (bonus Recherche mémorisée) | MINEUR | « réaffichez la saisie `$q` dans le champ » | Rien. Le cours montre déjà `value="<?= htmlspecialchars($query) ?>"` dans le champ de recherche (form-escape). | 0 | Bonus redondant (≈ 1 min), à supprimer ou à remplacer. Il ne précise pas non plus l'échappement du `value`. |
| 3 | 6a3a1014-1e82-4f6b-9ae6-bd03dc748dc1 (Deux ateliers au plus) | MINEUR | « refusez plus de deux ateliers » | Rien. Une condition avec `count()` suffit (≈ 2 min). | 0 | Trivial. Le combiner avec un autre bonus ou en faire un contrôle plus riche (par exemple « jamais le même atelier deux fois »). |
| 4 | d335e97d-f6f9-4ffa-ada6-8c5e85d382b3 (Doublon de morceau) | MINEUR | « sans tenir compte de la casse ni des espaces de bordure » | `mb_strtolower` n'est enseignée nulle part : la casse n'est vue qu'avec `mb_stripos` (cours, form-search-filter). J'ai deviné `mb_strtolower`, +1 min. | 1 min | Citer `mb_strtolower()` dans le sujet, ou dans le cours. Le bonus est trivial (≈ 2 min). |
| 5 | 19992953-513c-4e0e-a79f-76faea759566 (Nom déjà pris) | MINEUR | « sans tenir compte de la casse » | Même devinette de `mb_strtolower`, +1 min. Temps du bonus : 4 min, donc < 5 min. | 1 min | Comme la remarque 4. Ajouter, par exemple, un test de l'actualisation (F5) avec Post/Redirect/Get, pour en faire un vrai bonus. |
| 6 | 8fcc9986-3a7d-491f-8ba2-1b9e5b398381 (Un message par champ) | aucun défaut de notion | « comme dans la partie A » | Rien : tout est enseigné (`$errors` indexé par champ). Bonus le plus substantiel, 10 min. | 0 | Il reste ambigu sur un point : les 6 règles s'appliquaient dans l'ordre (la première qui échoue), et ce n'est plus vrai avec un message par champ. Dire quelles règles se combinent. Par exemple : la règle 5 (confirmation) ne s'applique que si la règle 4 (longueur) passe. J'ai choisi ce comportement. |
| 7 | 48bb7beb… (ex2-3) et a86c0507… (ex4-5), bloc ex-4 | tronc commun, sans blocage | « 200 caractères au plus, un caractère accentué comptant pour un » ; règle onzer « plus de 100 caractères » | `mb_strlen` n'est ni dans le cours ni dans le TP. Ni `strlen`, ni `mb_strlen` n'apparaissent. J'ai deviné `mb_strlen`, trois fois (ex-4, S'inscrire, Créer un artiste), +3 min. | 3 min | Ajouter `mb_strlen()` au cours (une ligne dans « Valider les champs simples ») ou la nommer dans le sujet. L'indication « un caractère accentué comptant pour un » suggère `mb_` sans le dire. |
| 8 | tp4-ex3-4 | tronc commun, sans blocage | « Les deux tableaux s'affichent en valeurs séparées par des virgules » | `implode(', ', …)` n'est pas enseignée. Une étape devinée, +1 min. | 1 min | Nommer `implode()` dans le sujet ou le cours. |
| 9 | tp4-ex4-1 vs cours (form-validate-choices) | tronc commun, sans blocage | « technos : au moins une case cochée, chaque valeur autorisée » | Pas de blocage : la règle « au moins une » est un `=== []`, et les valeurs autorisées utilisent `array_diff`, tous deux enseignés. | 0 | Rien. |
| 10 | 225ff249… (Créer un album, validateAlbum) | tronc commun, sans blocage | « artiste absent de `$artists` » | `$artists` est indexé par identifiant (`getAllArtists()` renvoie `1 => …`). J'ai utilisé `isset($artists[$form['artist_id']])`. C'est possible, mais le lien avec « chaîne » et « clé entière » n'est pas dit. Pas compté comme devinette (`isset` : curriculum:2:« isset »). | 0 | Préciser dans l'énoncé que `$artists` est indexé par id. |
| 11 | Sandbox | limite d'environnement | `rendu.png` dans /work | Un fichier `rendu.png` (propriétaire `etudiant`), ainsi que `fragile-cours` et `fragile-tp`, existent dans `/work`. Je ne les ai pas créés. | 0 | Rien à faire côté contenu. |

## Temps (barème fixe)
Mots lus par section avec awk, hors code. Code : lignes non vides. Chaque total est arrondi à la minute supérieure.

| Exercice ou bonus | Détail du calcul | Total | Statut |
|---|---|---|---|
| ex-1 | Prose 371 mots / 350 = 64 s. Gabarit 18 l. lues 36 s. Gabarit recopié 18 × 4 = 72 s. 16 lignes écrites = 192 s. 3 commandes de mise en place 24 s. 4 tests × 8 = 32 s. Exécutions 4 × 10 = 40 s. 3 recherches dans le cours 60 s. Vérification 10 s. Somme 530 s. | 9 min | fait, 4 URL conformes |
| ex-2 | Prose 266 mots 46 s. Gabarit 32 s + 56 s. 18 l. écrites 216 s. Commandes 32 s. Exécutions 40 s. 2 recherches 40 s. Vérif 10 s. Somme 472 s. | 8 min | fait |
| ex-3 | Prose 446 mots 76 s. 38 l. écrites 456 s. `var_dump` retiré 12 s. Commandes 48 s. Exécutions 60 s. 3 recherches 60 s. 1 devinette (`implode`) 60 s. Vérif 10 s. Somme 782 s. | 14 min | fait |
| ex-4 | Prose 566 mots 97 s. 70 l. écrites 840 s. 2 erreurs × 30 = 60 s. 1 devinette (`mb_strlen`) 60 s. Commandes 8 × 10 = 80 s. 4 recherches 80 s. Vérif 10 s. Somme 1227 s. | 21 min | fait |
| ex-5 | Prose 305 mots 52 s. Exploit : 8 commandes + 40 s d'exécution = 72 s. 12 l. modifiées 144 s. Nouveaux tests 72 s. Nettoyage 8 s. 1 recherche 20 s. Vérif 10 s. Somme 378 s. | 7 min | fait |
| Rappel + Mise en place | Rappel : prose 197 mots 34 s, 2 cp 16 s, vérif 10 s, lecture 6 s = 66 s → 2 min. Mise en place : prose 198 mots 34 s, lecture de header 40 s, 6 l. écrites 72 s, 3 URL × 8 + exécutions 54 s, vérif 10 s = 210 s → 4 min. | 6 min | fait (accueil sans menu, `auth-page` sur login, 5 liens) |
| 404 | Prose 314 mots 54 s. play_track 10 l. 120 s. Vue 4 l. 48 s. Recherche 20 s. 6 URL (48 + 60 s). Lecture du tableau 12 s. Vérif 10 s. Somme 372 s. | 7 min | fait (200 / 200 / 200 / 404 / 404 / 404) |
| Se connecter | Prose 342 mots 59 s. 2 cp 16 s. Lectures 84 s. login.php 14 l. 168 s. Vue 10 l. 120 s. 5 essais × 18 s = 90 s. Recherche 20 s. Vérif 10 s. Somme 567 s. | 10 min | fait |
| S'inscrire | Prose 481 mots 83 s. Lecture vue 44 s. cp 8 s. Contrôleur 28 l. 336 s. Vue 24 l. 288 s. Devinette `mb_strlen` 60 s. 6 essais × 18 s = 108 s. 1 erreur 30 s. Recherche `filter_var` 20 s. Vérif 10 s. Somme 987 s. | 17 min | fait (6 règles) |
| Créer un artiste | Prose 286 mots 49 s. Lecture vue 38 s. Contrôleur 22 l. 264 s. Vue 8 l. 96 s. Devinettes `mb_strlen` + `mb_strtolower` 120 s. 4 essais 72 s. Vérif 10 s. Somme 649 s. | 11 min | fait |
| Créer un album (+ indice) | Prose 713 mots 122 s. Lecture vue 48 s. validation.php : validateAlbum 264 s + readAlbumForm 180 s = 444 s. create_album.php 18 l. 216 s. Vue 28 l. 336 s. 7 essais × 18 s = 126 s. 1 erreur 30 s. Recherche 20 s. Vérif 10 s. Somme 1352 s. | 23 min | fait (7 cas conformes, mêmes valeurs de retour) |
| Modifier un album | Prose 217 mots 37 s. Lien « Modifier » 12 s. update_album.php 25 l. 300 s. 6 essais × 18 s = 108 s. Vérif 10 s. Somme 467 s. | 8 min | fait |
| bonus-1 Nom déjà pris | Prose 7 s. 6 l. 72 s. 2 essais 36 s. Devinette `mb_strtolower` 60 s. Vérif 10 s. Somme 185 s. | 4 min | fait |
| bonus-2 Recherche mémorisée | 1 l. 12 s. Test 18 s. Vérif 10 s. | 1 min | fait |
| bonus-3 Deux ateliers | 3 l. 36 s. Test 18 s. Vérif 10 s. | 2 min | fait |
| bonus-4 Un message par champ | Contrôleur ≈ 20 l. réécrites 240 s. Vue 15 l. 180 s. 6 essais 108 s. 1 erreur de correction 30 s (insertion mal placée). Vérif 10 s. Somme ≈ 570 s. | 10 min | fait |
| bonus-5 Doublon de morceau | 6 l. 72 s. 2 essais 36 s. Vérif 10 s. Somme 118 s. | 2 min | fait |

Tronc commun : 9 + 8 + 14 + 21 + 7 + 6 + 7 + 10 + 17 + 11 + 23 + 8 = 141 min. Budget TP : 340 min. Temps restant : 340 − 141 = 199 min. La lecture du cours (≈ 2900 mots de prose, ≈ 9 min, plus le code) n'est pas comptée dans le tronc commun : c'est du travail préalable. En la comptant, le temps restant reste supérieur à 170 min.
Bonus : 4 + 1 + 2 + 10 + 2 = 19 min, hors budget. Ils occupent le temps restant : non (199 − 19 = 180 min non occupées, soit bien plus que 10 min).

## Bilan des bonus
| Bonus | Notions utilisées (source) | Notion non enseignée ? | Résultat face à l'annoncé |
|---|---|---|---|
| Nom déjà pris | `lireEquipes()` (tp4-a-intro) ; `foreach` (curriculum:1:« boucles ») ; `$errors['nom']` (cours, form-validate-simple) ; comparaison de casse sans accents | Oui, `mb_strtolower` (devinée). On pouvait aussi utiliser `strcasecmp`, non enseignée. | « Git Happens » en minuscules est refusé avec « Ce nom d'équipe est déjà pris. ». |
| Recherche mémorisée | `value="<?= htmlspecialchars($q) ?>"` (cours, form-escape-display) | Non | Le champ affiche `value="git"` après envoi. |
| Deux ateliers au plus | `count()` (cours) ; `$errors` | Non | Trois ateliers donnent le message attendu ; deux passent (« Ateliers : git, tests »). |
| Un message par champ | `$errors` indexé par `name` (cours, form-validate-simple) ; `isset($errors[…])` dans la vue (cours, form-redisplay) ; `elseif` | Oui, `mb_strlen` (devinée, comme dans le tronc commun). | Un message sous chaque champ, le champ fautif réaffiché, mots de passe jamais réaffichés. Le comportement de combinaison des règles a dû être choisi. |
| Doublon de morceau | `in_array` (cours) ; tableau `$seen[]` ; `foreach` | Oui, `mb_strtolower` (devinée). | « Lune » et « lune » (avec espace de bordure) donnent « Deux morceaux portent le même titre. » ; deux titres différents passent. |

## Définition de terminé
- ✔ tout le TP terminé, bonus compris : 12 blocs de tronc commun (5 exercices de la partie A + 7 de la partie Onzer) sur 12, 5 bonus sur 5. Aucun blocage.
- ✔ temps total et temps restant : 141 min de tronc commun, 340 − 141 = 199 min restantes, 19 min de bonus, 180 min non occupées.
- ✘ chaque bonus vérifié (temps restant occupé, aucune notion non enseignée) : 5 bonus sur 5 vérifiés par exécution, mais le temps restant n'est pas occupé (180 min libres), et 4 bonus sur 5 reposent sur `mb_strlen` ou `mb_strtolower`, non enseignées. Le critère n'est donc pas rempli.
- ✔ journal d'étapes sourcé : 38 étapes, 31 sourcées, 7 devinées (voir annexe). `implode` et `mb_strlen` ×3 (ex-4, S'inscrire, Créer un artiste) ; `mb_strtolower` ×4 (Créer un artiste, bonus 1, bonus 5, bonus 4 via `mb_strlen`) ; ce comptage est conservateur.
- ✔ aucun fichier laissé hors de /work/rapide. `ls /work` : `depart fournis fragile-cours fragile-tp rapide rendu.png supports`. `fragile-cours`, `fragile-tp` et `rendu.png` ne viennent pas de moi. J'ai supprimé mes scripts temporaires de `/work/rapide` et arrêté mes serveurs `php -S` (ports 8020 et 8021).

Le statut est « terminé » parce que tous les critères d'exécution sont remplis. Le critère 3 reste ✘ sur le fond (temps libre et notions non enseignées), et c'est ce qu'il faut corriger côté contenu.

## Annexe : journal d'étapes
| # | Étape | Source | Résultat |
|---|---|---|---|
| 1 | Copier `depart/onzer` vers `rapide/onzer`, créer `tp4` | consigne de l'orchestrateur | ok |
| 2 | `recherche.php` : copier le gabarit | c0d75df6… | ok |
| 3 | Formulaire GET, champ `search` `name=q` | aba849bf… (cours, action/method) | ok |
| 4 | `$q = trim($_GET['q'] ?? '')` | cours « Lire la saisie et filtrer » | ok, sans avertissement |
| 5 | `filtrerEquipes($equipes, $q)` | tp4-ex1-4 | ok |
| 6 | Ligne « Résultats pour » et liste | tp4-ex1-5 | ok |
| 7 | Vérifier les 4 URL | tp4-ex1-table | ok |
| 8 | `inscription.php` : formulaire POST, 3 champs, `$_POST` avec `?? ''` et `trim` | f01403ee…, 48bb7beb… | ok |
| 9 | `$_SERVER['REQUEST_METHOD'] === 'POST'` | cours « Afficher ou traiter ? » | ok |
| 10 | Les 5 champs : textarea, radio, checkbox `technos[]`, select, select multiple | tp4-ex3-table, cours « Choisir plusieurs régimes » | ok |
| 11 | `var_dump($_POST)` avec et sans case cochée | tp4-ex3-2, cours form-checkbox-table | clé `technos` absente |
| 12 | Valeurs par défaut `[]` pour tableaux | tp4-ex3-3, cours « Lire les nouveaux champs » | ok |
| 13 | Liste de 7 lignes avec `aucun` / `aucune` | tp4-ex3-4 | ok |
| 14 | Tableau `implode(', ', …)` | aucune source | ok, devinée |
| 15 | `$errors`, une condition par ligne | tp4-ex4-1, cours « Valider les champs simples » | 6 messages sur formulaire vide |
| 16 | `filter_var` 2 à 5 | tp4-ex4-rules, cours | ok |
| 17 | `mb_strlen($description) > 200` | aucune source | ok, devinée |
| 18 | `in_array` / `array_diff` sur les listes autorisées | cours « Valider les choix » | ok |
| 19 | Réafficher valeurs et sélections | tp4-ex4-4, cours « Réafficher les choix » | ok |
| 20 | `lireEquipes()` / `ecrireEquipes()` | a86c0507… | sixième équipe écrite |
| 21 | `htmlspecialchars` partout | tp4-ex5-3, cours « Échapper au moment de l'affichage » | `<script>` affiché en texte |
| 22 | `header.php` : classe `onzer-main` / `auth-page` / `auth-page home-page`, 4 liens, `index.php` | 9ffdc186…, e696ce5b…, curriculum:3:« render », « <?= ?> » | ok |
| 23 | `play_track.php` : `(int)`, `http_response_code(404)`, `render('404')`, `exit` | efee52c9…, cours « Info : Pourquoi exit » | 6 URL conformes |
| 24 | Liens de `view_list_albums.php` et `view_player.php` | f2c0636d… | ok |
| 25 | `login.php` et vue | 1c622ef6…, 6a73fa39…, 8a55e1d8… | 5 cas conformes |
| 26 | `create_user.php` : 6 règles dans l'ordre | b3f60f71…, 9ba8d599…, 571dd9fc… | 6 cas conformes |
| 27 | `mb_strlen` > 100 et < 8 | aucune source | ok, devinée |
| 28 | `create_artist.php` : 3 règles | 8c4f291e…, 0ebacab4… | 3 cas conformes |
| 29 | `mb_strtolower` pour la casse | aucune source | ok, devinée |
| 30 | `core/validation.php` (`validateAlbum`, `preg_match` donné) | 077ab43a…, b1fb2a52… | 7 cas conformes |
| 31 | Recoller `track[]` et `duration[]` par rang avant filtrage | c5786f23… (Indice) | ok |
| 32 | `create_album.php`, vue avec `$form` | ded93d6b…, 13ccc6e9… | ok |
| 33 | `padTracks` avec boucle `while` et `count` | tp (07f2f4ef… « lignes vides jusqu'à cinq ») ; curriculum:1:« boucles » | ok |
| 34 | `update_album.php` et lien « Modifier » | c188ba3c…, 2.. | 404 pour id inconnu ; messages conformes |
| 35 | Bonus 1 à 3 | 19992953…, a58304dd…, 6a3a1014… | conformes |
| 36 | Bonus 4 : `$errors` par champ dans `create_user.php` | 8fcc9986… | conforme |
| 37 | Bonus 5 : doublon sans casse | d335e97d… | conforme |
| 38 | Lancer `php -S` sur 8020 et 8021, tester avec `curl` | consignes de l'orchestrateur | ok |

Fichiers livrés : /work/rapide/tp4/ (`recherche.php`, `inscription.php`, `stockage.php`, `equipes.json` restauré) et /work/rapide/onzer/ (`login.php`, `create_user.php`, `create_artist.php`, `create_album.php`, `update_album.php`, `play_track.php`, `core/users.php`, `core/validation.php`, vues).
