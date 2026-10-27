# Spécification : pipeline multi-agents de rédaction de cours

Ce document fait foi pour toutes les étapes de déploiement. Une étape n'implémente que ce que son prompt lui demande, mais respecte toujours ce document. Toute contradiction entre ce document et le code existant m'est signalée, jamais tranchée seul.

## 1. Principes

- Les agents sont des subagents Claude Code (`.claude/agents/*.md`, frontmatter `name`, `description`, `tools`, `model`), dans ce dépôt.
- Les agents n'ont pas l'outil `Agent` : ils ne lancent aucun subagent (Claude Code le permettrait, jusqu'à trois niveaux). L'orchestrateur n'est PAS un agent, c'est le skill `content-writer` v3, exécuté dans la session principale. Il dialogue avec moi, lance les agents, arbitre leurs rapports et fait la clôture.
- Méthode inspirée de obra/superpowers (brainstorming → plan → exécution) : toutes mes décisions remontent AVANT la rédaction, qui devient de l'exécution.
- Aucun agent n'écrit en prod. Seul l'orchestrateur le fait, après ma confirmation explicite.
- L'actuel `content-writer` (v2) reste en place et utilisable jusqu'à ce que je valide la v3.

## 2. Workflow de section

1. `collecteur` → fiche de contexte compacte.
2. **Cadrage** (session principale) : à partir de la fiche, l'orchestrateur me pose ses questions UNE PAR UNE (ce que les étudiants ratent d'habitude sur ce sujet, les erreurs que je vois réellement en TP, les exemples qui marchent en classe, ce que je veux absolument voir ou éviter). Il propose ensuite 2 ou 3 angles pédagogiques avec leurs compromis et en recommande un. Sortie : une **fiche de conception** que je valide. Aucune rédaction pendant cette phase.
3. **Plan**, écrit par l'orchestrateur, assez détaillé pour que les rédacteurs n'aient plus de décision à prendre :
   - cours : pour chaque notion, l'exemple exact (données comprises), la variante réaliste, l'erreur fréquente avec son message réel, le minutage ;
   - slides : liste des slides (titre, idée unique, type de bloc principal, minutage) ;
   - TP : chaque exercice avec son contrat de consigne entièrement rempli, sa durée, sa part guidée ou fil rouge ; les bonus avec leur contrat.
   `relecteur-coherence` et `relecteur-contrat` relisent le PLAN avant que je le voie (fuite du fil rouge, notions hors curriculum, budget hors plage, contrat incomplet). Puis je le valide.
   Le plan est persistant : `docs/plans/<module>/<section>.md` (ou via `publish_private_document` si plus adapté, à me proposer).
4. **Exécution** séquentielle, chaque support validé avant le suivant : `redacteur-cours` → `redacteur-slides` → `redacteur-tp`. Chaque rédacteur reçoit le plan de son support et les supports déjà validés. Il suit le plan à la lettre : un écart nécessaire est signalé à l'orchestrateur, jamais improvisé.
5. **Relecture** en parallèle :
   - `relecteur-style`, `relecteur-coherence` : tous les supports ;
   - `etudiant-fragile` : cours (mode lecture) et TP (mode exécution) ;
   - `relecteur-contrat`, `etudiant-rapide` : TP uniquement ;
   - aucun étudiant sur les slides.
6. **Arbitrage** par l'orchestrateur (§ 6), puis les remarques retenues vont au rédacteur du format concerné, qui corrige.
7. Relecture navigateur par moi.
8. `correction` (TP uniquement) : écrit, exécute, vérifie, pousse.
9. **Clôture** par l'orchestrateur : `curriculum` de la section, verdicts, exemplaire, mise à jour du plan avec les écarts réellement faits, rubrique **« Matériau quiz »** dans le plan (gestes clés du TP : code, API imposée, résultat observé ; blocages relevés par l'étudiant fragile ; erreurs fréquentes du cours), copie vers prod avec ma confirmation explicite.

**Mode rapide** (sur demande, section simple) : saute le cadrage, garde le plan et sa validation.

**Points de validation avec moi** : fiche de conception, plan, chaque support rédigé, relecture navigateur, prod.

## 3. Agents

| Agent | Modèle | Outils |
|---|---|---|
| collecteur | haiku | MCP lecture seule (list_*, get_*, export_content_compact, list_verdicts, list_exemplars) |
| redacteur-cours | opus | MCP lecture + écriture staging uniquement |
| redacteur-slides | sonnet | MCP lecture + écriture staging uniquement |
| redacteur-tp | opus | MCP lecture + écriture staging + get_project_reference |
| relecteur-style | sonnet | MCP lecture seule |
| relecteur-coherence | sonnet | MCP lecture seule + get_project_reference |
| relecteur-contrat | haiku | MCP lecture seule |
| etudiant-fragile | sonnet | lecture du contenu de la section uniquement + Bash (bac à sable) |
| etudiant-rapide | sonnet | idem fragile |
| correction | sonnet | Bash, push_correction |
| redacteur-quiz-section | sonnet | MCP lecture + get_quiz, aucune écriture |
| redacteur-quiz-transversal | opus | MCP lecture + get_quiz, aucune écriture |

Modèles : les rédacteurs cours et TP restent en opus au départ. Le plan prenant les décisions en amont, sonnet pourrait suffire : comparaison à prévoir avec skill-creator (même section, opus vs sonnet).

## 4. Règles par agent

Les règles du `content-writer` v2 sont réparties entre les agents. En plus :

**collecteur** : fiche structurée (budgets calculés, universe, exampleDomain, projectSpec, brief, curriculum précédents, état du fil rouge, verdicts et exemplaire pertinents par format ; pour le quiz : matériaux quiz des plans et questions existantes). Section sans brief → le signaler, ne rien inventer.

**redacteur-cours** : ne reçoit PAS le dépôt de référence ni le détail du fil rouge, seulement le nom de son domaine pour l'éviter. Le minimum pour démarrer le TP. Chaque notion : exemple minimal → variante réaliste → erreur fréquente (`callout warning`, message d'erreur réel). Domaine d'illustration = `exampleDomain`, noms et données = `universe`.

**redacteur-slides** : part du cours validé, n'ajoute aucune notion (signale si besoin). Une idée par slide, `slide-transition` entre les parties, `slide-code` avec `highlight`, `slide-code-with-preview` pour tout rendu visuel, une `slide-note` par slide (oral, erreur fréquente, question à la salle). Repère : 1 à 2 min par slide.

**redacteur-tp** : contrat de consigne complet par exercice, bonus compris (fichier cible, noms exacts, données d'entrée, API imposée, résultat observable, critère de validation). Budget 80–100 %, bonus hors budget. Progression guidée → fil rouge (`projectRef: true`). Cible réelle via get_project_reference (repli : export_content_compact des TP précédents). Démarrage < 2 min pour l'étudiant fragile. Impératif vouvoyé. Notion manquante dans le cours → le signaler à l'orchestrateur, ne pas l'expliquer dans le TP. Après validation, transmet la liste des contrats à `correction`.
Mode examen : hors fil rouge, curriculum uniquement, pas de cadrage ni de validation du plan (le plan est quand même écrit pour la traçabilité), pas de correction ; curriculum vide → arrêt.

**relecteur-style** : applique `humaniseur-fr` en mode DIAGNOSTIC (ne réécrit pas). Registre fixé : courant, vouvoiement, voix d'enseignant ; ne demande jamais le registre. Désactivés : partie 4 (argot, abréviations, « je » dans les consignes, ignorance feinte) et pattern 36. Patterns 16, 17, 34 : seul l'abus est signalé. Une seule passe : en seconde relecture, seulement les blocs modifiés.

**relecteur-coherence** : exampleDomain respecté (fuite du fil rouge = BLOQUANT), notions présentes dans les curriculum, TP conforme au dépôt, slides qui ne recopient pas le cours (paragraphe repris presque mot pour mot = MAJEUR).

**relecteur-contrat** : checklist des 6 champs du contrat par exercice, somme des durées.

**etudiant-fragile** : contexte limité au support relu, au cours et aux curriculum précédents. N'utilise que ce qui est écrit ou déjà enseigné ; dès qu'il doit deviner, il s'arrête et le note.
**Ancrage obligatoire** : chaque étape qu'il réalise (commande tapée, fichier créé, ligne de code écrite, réponse de quiz) cite l'`id` du bloc qui la justifie, ou la notion du `curriculum` sur laquelle il s'appuie. Une étape sans source citable est une étape devinée : elle est signalée comme blocage, même s'il l'a réussie. Même règle pour `etudiant-rapide`.
- *Mode lecture (cours)* : exécute chaque exemple de code et compare au résultat annoncé ; relève chaque terme utilisé avant d'être défini ou absent des curriculum ; avant chaque variante réaliste, prédit son résultat puis compare (mauvaise prédiction = explication insuffisante) ; bilan final : pour chaque notion du brief, peut-il dire à quoi elle sert et l'utiliser ?
- *Mode exécution (TP)* : fait réellement le TP à la lettre dans un bac à sable, mesure le temps réel par exercice.

**etudiant-rapide** : même contexte. Finit tout, mesure le temps restant, vérifie que les bonus occupent ce temps sans notion non enseignée.

**correction** : un dossier par exercice (slug du titre), `fil-rouge/`, README sobre. Noms de fichiers = contrat exact. Exécute chaque fichier et vérifie le résultat observable avant de pousser. Jamais de correction d'examen sauf demande explicite.

## 5. Format des rapports de relecture

Liste de remarques, chacune avec : `id` du bloc, gravité (BLOQUANT / MAJEUR / MINEUR), passage concerné, proposition de correction. Les étudiants ajoutent : ligne de consigne en cause, ce qu'ils ont dû deviner, temps perdu estimé, et en annexe le journal de leurs étapes avec, pour chacune, l'`id` du bloc ou la notion citée (ou « aucune source » pour une étape devinée).

## 6. Arbitrage

1. Contrat et cohérence ont un véto : leurs BLOQUANTS sont toujours corrigés.
2. L'étudiant fragile passe avant tous les autres sur le tronc commun (cours et TP).
3. Le style s'applique à tout, y compris au guidage ajouté.
4. L'étudiant rapide ne modifie que les bonus.

Si le fragile bloque sur la notion visée elle-même : indice en `collapsible`, jamais la réponse.
Durées : la mesure du fragile fait foi ; hors plage 80–100 % → retour au plan (que je revalide).
Les MINEURS peuvent être ignorés.

**Limite des boucles** : deux cycles « relecture → correction » maximum par support (et deux pour la relecture du plan). Au second cycle, seuls les blocs modifiés sont relus. S'il reste des BLOQUANTS ou MAJEURS, l'orchestrateur s'arrête et me présente chaque désaccord : bloc, remarque du relecteur, réponse du rédacteur, sa recommandation. Je tranche. Une remarque déjà écartée qui revient m'est remontée, jamais rejouée.

## 7. Workflow quiz de module

Le quiz est unique par module : workflow séparé, lancé sur demande, sur tout ou partie des sections rédigées. Principe : générer large, puis sélectionner.

1. `collecteur` : cours et TP validés, matériaux quiz des plans, curriculum, questions existantes (get_quiz).
2. **Cadrage** : l'orchestrateur me pose ses questions UNE PAR UNE, chacune avec une valeur par défaut argumentée : sections couvertes ; nombre total de questions et répartition par section ; part transversale (repère 20–30 %) ; usage (révision, début de séance, évaluation notée) ; points négatifs ; durée totale visée ; notions à cibler ou exclure. Récapitulatif, je valide.
3. **Génération en parallèle** : un `redacteur-quiz-section` PAR SECTION (contexte de sa seule section, vivier d'environ 8 questions) et un `redacteur-quiz-transversal` (curriculum, matériaux quiz et code du fil rouge de toutes les sections visées ; questions qui relient plusieurs sections).
4. **Présélection** : environ 1,5 fois la taille cible.
5. **Tests** sur la présélection ; les questions qui échouent sont corrigées une fois par leur auteur ou écartées.
6. **Sélection finale**.
7. Je valide ; les questions écartées me sont listées à part (une ligne chacune) pour échange éventuel.
8. Ajout sur staging (`create_quiz` si besoin), puis proposition de copie vers prod.

**Règles de rédaction (section et transversal)** : vérifier la compréhension de la théorie derrière ce que l'étudiant a FAIT en TP. Chaque question part d'un geste réel du TP et interroge le pourquoi ou le « que se passe-t-il si » : prédire la sortie d'une variante, diagnostiquer une erreur, choisir entre deux codes apparemment équivalents, justifier une méthode imposée. Énoncé autosuffisant (code remontré dans un bloc `code`). Interdits : récitation, pièges de syntaxe sans enjeu, notion hors curriculum. Distracteurs = vraies idées fausses (erreurs fréquentes, blocages du fragile), jamais absurdes. Par question : propositions (≥ 1 correcte, ≥ 1 incorrecte), `durationSeconds` réaliste, `weight`, étiquettes (section(s), geste visé, notion, type, niveau de Bloom, difficulté). Niveaux de Bloom utilisés : comprendre, appliquer, analyser, évaluer. « Se souvenir » est exclu (c'est de la récitation) et « créer » ne se prête pas au QCM. Aucun doublon avec le quiz existant.

**Tests** :
- `etudiant-fragile` et `etudiant-rapide` répondent séparément, sans les bonnes réponses : choix, justification d'une ligne, temps estimé.
- Lecture croisée : les deux justes → facile ; fragile faux et rapide juste → discriminante, à condition que l'erreur corresponde à un distracteur prévu (sinon énoncé ambigu) ; rapide faux → BLOQUANT ; les deux faux → BLOQUANT.
- `durationSeconds` couvre le temps du fragile ; si même le rapide dépasse, la durée est nettement trop courte.
- `relecteur-contrat` fait le test « sans énoncé » : répondre avec les seules propositions ; s'il trouve par élimination, distracteurs trop faibles.

**Critères de sélection** : couverture proportionnelle à l'importance des sections, notions centrales d'abord ; part transversale respectée ; diversité des types et des niveaux de Bloom (pas plus d'un tiers des questions au même niveau ; au moins quelques questions « analyser » ou « évaluer »), progression de difficulté ; pas de redondance ; aucune question ambiguë ou devinable ; répartition facile / discriminante adaptée à l'usage choisi. Pour chaque question retenue, une ligne qui explique pourquoi elle a gagné.

## 8. Workflow de propagation

Se déclenche quand un élément validé change après coup (support d'une section terminée, `curriculum`, `exampleDomain`, `universe`, `projectSpec`), ou au lancement si le journal des retouches (§ 9) a des entrées en attente.

1. **Inventaire des dépendances** : même section (cours → slides, TP ; TP → correction, matériau quiz) ; sections suivantes (curriculum → leurs cours et TP ; fil rouge → leurs TP et corrections) ; module (questions du quiz, examen).
2. **Analyse d'impact** par `relecteur-coherence`, lecture seule : impact certain / à vérifier / aucun, avec le passage concerné.
3. **Rapport** trié de l'impact le plus fort au plus faible, avec propositions.
4. **Mises à jour** par le circuit normal (amendement du plan → rédacteur → relecture → ma validation). Jamais de cascade sans mon accord explicite.
5. Plans concernés mis à jour avec le changement et sa date.

## 9. Skill « retouche » (hors Claude Code)

Document de skill pédagogique servi par le serveur MCP (`get_pedagogical_skill_document`, id `retouche`), pour les retouches depuis l'app Claude, notamment sur téléphone. Un seul modèle, sans subagent.

**Périmètre** : faute, reformulation, correction d'un exemple de code, callout, ajustement d'une consigne, question de quiz. Hors périmètre (nouvel exercice, nouvelle notion, restructuration, rédaction complète) → refus et renvoi vers le pipeline.

**Déroulé** : identifier le bloc en prod et me le montrer ; conserver le JSON d'origine dans la conversation ; proposer un avant/après court, lisible sur mobile ; après ma confirmation explicite, écrire directement en prod avec `edit_block` / `insert_block` (jamais `save_content`) ; vérification intégrée (domaine d'exemple, impératif vouvoyé, contrat si exercice touché, curriculum, passe humaniseur-fr si le skill est disponible, avec les exceptions du relecteur style). Pas de passage par staging : les ids de blocs divergent entre les deux serveurs (décision du 2026-10-27).

**Dépendances** : si la retouche touche un élément dont d'autres dépendent, rien n'est propagé depuis l'app. La retouche est alors consignée dans un **journal des retouches** accessible via le MCP (section, bloc, avant/après, date), tenu en prod, lu par le workflow de propagation. Les retouches sans dépendance ne sont pas journalisées.

## 10. Points ouverts

- Slides d'exercice ou de question à la salle ?
- Le repère de 1–2 min par slide est-il juste ?

## 11. Passage de relais entre sessions : `docs/pipeline/etat.md`

Chaque étape tourne dans sa propre session. Pour ne rien perdre de ce qui a été décidé en cours de route, `docs/pipeline/etat.md` est lu en début de session (après la spec) et mis à jour en fin de session, puis commité.

Format :
- **Étape courante** : numéro, statut (en cours / terminée / validée par moi).
- **Fait** : fichiers créés ou modifiés, une ligne chacun.
- **Décisions prises en session** : ce que j'ai tranché (choix d'implémentation, réponses aux points ouverts), avec la date. Une décision qui modifie la spec est AUSSI reportée dans `spec.md`, avec mon accord.
- **Écarts à la spec** : ce qui n'a pas pu être fait comme prévu, et pourquoi.
- **Résultats des tests** : verdict en une ou deux lignes.
- **À faire avant l'étape suivante** : prérequis, questions en suspens.

Le fichier reste court : on remplace le contenu d'une étape terminée par sa synthèse plutôt que d'empiler les détails.

## 12. Suivi de la production et listes de tâches

`docs/pipeline/etat.md` (§ 11) ne suit que le déploiement du pipeline. La production des contenus est suivie à part, au niveau section, module et agent.

**Statut de section**, en tête du plan `docs/plans/<module>/<section>.md` : phase en cours (cadrage, plan, cours, slides, TP, relecture navigateur, correction, clôture), ce qui est validé et quand, désaccords en attente, prochaine action. L'orchestrateur le met à jour à chaque point de validation. À la reprise d'une section, il le lit et me résume en deux lignes où on en est avant de continuer.

**État du module**, `docs/plans/<module>/etat.md` : tableau des sections avec leur phase, et pour le quiz : dernier cadrage, sections couvertes, nombre de questions publiées. Mis à jour à chaque clôture de section et à chaque fin de workflow quiz ou propagation.

**Liste de tâches de chaque agent** : avant d'agir, chaque agent construit sa liste de tâches à partir de ses entrées, avec l'outil de liste de tâches de Claude Code s'il est disponible pour les subagents (à vérifier), sinon en tête de son rapport. Granularité :
- collecteur : une tâche par source à lire ;
- rédacteurs : une tâche par élément du plan (notion, slide, exercice, bonus) ;
- relecteurs : une tâche par bloc ou exercice et par critère de leur grille ;
- étudiants : une tâche par exemple de code, par variante à prédire, par exercice ou par question de quiz ;
- correction : une tâche par exercice, plus fil rouge et README ;
- rédacteurs de quiz : une tâche par geste du TP retenu comme point de départ.
Le rapport final de l'agent reprend la liste avec le statut de chaque tâche : faite, ou non faite avec la raison. Une tâche n'est jamais abandonnée en silence. L'orchestrateur vérifie que la liste couvre bien toutes les entrées (chaque notion du plan, chaque exercice, chaque bloc) : une couverture incomplète renvoie l'agent au travail, sans compter comme un cycle de relecture.

**Liste de tâches de l'orchestrateur** : dans la session principale, visible par moi, alignée sur les phases du workflow en cours. Elle est reconstruite à partir du statut de section ou de l'état du module à chaque reprise.

## 13. Définition de terminé

Chaque agent a une définition de terminé (ci-dessous). Il ne se déclare terminé que si tous ses critères sont remplis. Son rapport se termine par cette liste, critère par critère : ✔ avec une preuve vérifiable (un compte du type « 14 blocs relus sur 14 », une sortie collée, un total calculé), ou ✘ avec la raison. Un agent avec un ✘ rend un rapport marqué « incomplet », jamais « terminé ». L'orchestrateur contrôle les preuves ; un rapport incomplet renvoie l'agent au travail, sans compter comme un cycle de relecture.

**collecteur**
- chaque champ de la fiche rempli, ou marqué « non disponible » avec la raison ;
- budgets calculés, avec le calcul visible ;
- brief présent, ou absence signalée ;
- sources prévues toutes lues, ou indisponibilité signalée (dépôt de référence absent, etc.).

**redacteur-cours**
- chaque notion du plan rédigée avec ses trois temps (exemple, variante, erreur fréquente avec message réel) ;
- aucun écart au plan, ou chaque écart signalé ;
- écriture sur staging relue avec `get_content` : l'arbre correspond à ce qui était prévu ;
- uniquement des types de blocs du registre ;
- minutage total dans le budget.

**redacteur-slides**
- chaque slide du plan présente, une idée par slide ;
- une `slide-note` sur chaque slide ;
- aucune notion absente du cours ;
- écriture relue avec `get_content` ;
- minutage total dans le budget.

**redacteur-tp**
- chaque exercice et chaque bonus avec ses 6 champs de contrat ;
- budget recalculé, entre 80 et 100 % ;
- chaque résultat observable rattaché au dépôt de référence (ou aux TP précédents à défaut) ;
- impératif vouvoyé dans toutes les consignes ;
- écriture relue avec `get_content` ;
- liste des contrats prête pour `correction`.

**relecteur-style**
- tous les blocs de texte relus, consignes et `slide-note` comprises (« N blocs relus sur N ») ;
- chaque remarque avec `id`, numéro de pattern, passage et proposition.

**relecteur-coherence**
- chaque exemple vérifié contre l'`exampleDomain` ;
- chaque notion utilisée confrontée aux `curriculum` ;
- pour un TP : chaque résultat observable confronté au dépôt ;
- pour des slides : comparaison au cours faite.

**relecteur-contrat**
- grille complète : chaque exercice et bonus × 6 champs, présent ou absent ;
- somme des durées et pourcentage du budget.

**etudiant-fragile**
- mode lecture : chaque exemple exécuté, chaque variante prédite puis comparée, bilan rempli pour chaque notion du brief ;
- mode exécution : chaque exercice mené jusqu'au bout ou jusqu'au blocage, temps mesuré par exercice ;
- chaque étape du journal cite sa source, ou est marquée « aucune source » ;
- bac à sable supprimé.

**etudiant-rapide**
- tout le TP terminé, bonus compris, ou blocage signalé ;
- temps total et temps restant ;
- chaque bonus vérifié : il occupe le temps restant sans notion non enseignée ;
- journal d'étapes sourcé, bac à sable supprimé.

**correction**
- un dossier par exercice, plus `fil-rouge/` et `README.md` ;
- noms de fichiers identiques aux contrats ;
- chaque fichier exécuté, sa sortie collée dans le rapport et comparée au résultat observable annoncé ;
- push effectué, rappel `correctionIsAvailable` fait.

**redacteur-quiz-section**
- chaque geste du matériau quiz de la section examiné (retenu comme point de départ ou écarté avec la raison) ;
- environ 8 candidates, chacune complète : énoncé, propositions, durée, poids, étiquettes avec niveau de Bloom ;
- absence de doublon vérifiée avec `get_quiz`.

**redacteur-quiz-transversal**
- chaque candidate relie au moins deux sections, nommées dans ses étiquettes ;
- candidates complètes, absence de doublon vérifiée.

**orchestrateur**, à la fin de chaque phase :
- le point de validation prévu a été obtenu de moi, explicitement ;
- statut de section et état du module à jour ;
- aucun rapport d'agent marqué « incomplet » laissé sans suite ;
- en fin de session de déploiement : `docs/pipeline/etat.md` à jour.
