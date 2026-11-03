---
name: content-writer-v3
description: Orchestrateur du pipeline multi-agents de rédaction de cours. Mode relecture (supports existants en prod, synthèse arbitrée sans correction), modes conception / conception-rapide (cadrage, puis plan relu et validé), mode redaction (supports rédigés en brouillon d'après le plan, relus, validés, écrits en prod par l'orchestrateur seul, puis correction et clôture) et mode propagation (journal des retouches, analyse d'impact d'une modification, mises à jour sur accord) et mode quiz (questions sur une liste de sections, générées large, testées, sélectionnées). Lance les agents, arbitre leurs rapports, tient le statut de section.
disable-model-invocation: true
argument-hint: "[relecture|conception|conception-rapide|redaction|examen|propagation|quiz] [module] [section, ou sections du quiz : 1-4]"
---

# content-writer v3 : orchestrateur d'une section

**Ce skill ne charge JAMAIS le content-writer v2** : ni le fichier
`skills/content-writer/main.md`, ni `get_pedagogical_skill_manifest`, ni
`get_pedagogical_skill_document` (sur aucun serveur). Les règles utiles de la v2 sont
déjà réparties dans les agents de `.claude/agents/`.

Référence : `docs/pipeline/spec.md` (§ 2, § 5, § 6, § 12, § 13). En cas de
contradiction entre ce skill et la spec, arrêtez-vous et signalez-la à l'utilisateur.

## Modes

| Mode | Ce qu'il fait | Suite |
|---|---|---|
| `relecture` | relit des supports déjà rédigés (cours, slides, TP) et présente une synthèse arbitrée, sans rien corriger | § 1 à § 11 ci-dessous |
| `conception` | section non rédigée : cadrage (questions une par une, angles, fiche de conception validée), puis plan relu et validé | § 1 à § 3, puis `cadrage.md`, puis `plan.md` |
| `conception-rapide` | section simple : plan relu et validé, sans cadrage (seule Q0 si `courseIntroMinutes` manque) | § 1 à § 3, puis `plan.md` |
| `redaction` | plan validé : cours, slides puis TP rédigés en brouillon, relus, validés un par un, écrits en prod par vous ; correction et clôture | § 1 à § 3, puis `redaction.md`, puis `cloture.md` |
| `examen` | examen de fin de module, hors fil rouge, sur les seuls `curriculum` : plan écrit pour la traçabilité (sans cadrage ni validation du plan), rédaction par `redacteur-tp` en mode examen, sans correction | § 1 à § 3, `plan.md` § 2 (sans § 4 et § 5), puis `redaction.md` |
| `propagation` | un élément validé a changé après coup, ou le journal des retouches a des entrées en attente : inventaire des dépendances, analyse d'impact, rapport trié, mises à jour sur accord | § 1 à § 3, puis `propagation.md` |
| `quiz` | quiz unique du module, sur une liste de sections (`1-4`) : cadrage, génération, présélection, tests, sélection, validation, écriture en prod par vous | § 1, puis `quiz.md` |

Mode absent : à la reprise, **le statut de section fait foi** (son champ « Mode »), même
si des supports sont déjà en source `db` : une section en cours de rédaction a son cours
en prod avant son TP. Sans statut : section sans support en source `db` → `conception`,
plan validé dans `docs/plans/` → `redaction`, sinon `relecture` ; demandez confirmation
en une question.

## Ce que fait ce skill, et ce qu'il ne fait pas

- Source : le serveur MCP **prod**, en lecture seule. Outils de prod : préfixe
  `mcp__d1db0efe-14b0-4182-97b9-d6f36625dc09__` dans l'app Desktop,
  `mcp__claude_ai_cours-iut-web__` en CLI. N'utilisez jamais le serveur staging
  (`95c87654-…`, `claude_ai_cours-iut-staging`) ni le serveur local `cours-iut-mcp`.
- Modes `relecture`, `conception`, `conception-rapide` : **aucune écriture MCP**, ni
  prod ni staging, **aucune rédaction ni correction** de supports. La sortie est une
  synthèse arbitrée (relecture) ou un plan validé (conception).
- Modes `redaction` et `examen` : les rédacteurs écrivent des **brouillons**
  (`docs/plans/<module>/brouillons/<section>/`, ignoré par git), jamais sur un serveur.
  **Vous êtes le seul à écrire en prod** (`save_content`, `edit_section`,
  `push_correction`, `add_verdict`, `promote_exemplar`), chaque fois après la
  confirmation explicite de l'utilisateur pour cette écriture précise. Jamais staging,
  jamais `isAvailable` sans sa demande (`redaction.md` § 0).
- Mode `propagation` : le rapport d'impact n'écrit rien. Les mises à jour acceptées
  suivent les règles du mode `redaction` ; `mark_retouches_processed` s'y ajoute, après
  confirmation explicite (`propagation.md` § 0).
- Mode `quiz` : vous seul écrivez en prod (`create_quiz`, `add_quiz_question`), après la
  validation de la sélection et la confirmation de l'écriture (`quiz.md` § 7).
- Dans tous les modes, les autres écritures sont les fichiers de suivi
  (`docs/plans/<module>/<section>.md` et `docs/plans/<module>/etat.md`), les dossiers
  temporaires du bac à sable et les commits de ces fichiers de suivi (« Commits »).
- Relecture : **un seul cycle**. Plan : **deux cycles** au plus (`plan.md` § 4).
  Rédaction : **deux cycles** « relecture → correction » par support (`redaction.md` § 5).
  Relancer un agent dont le rapport est incomplet (couverture ou preuves) est permis et
  ne compte pas comme cycle.

Annexes de ce dossier, à lire au moment indiqué :

- `cadrage.md` : questions du cadrage, angles, fiche de conception (mode `conception`) ;
- `plan.md` : format du plan, messages d'erreur exécutés, relecture et validation du plan ;
- `redaction.md` : brouillons, rédacteurs, relecture, arbitrage et correction, validation,
  écriture en prod, relecture navigateur (mode `redaction`) ;
- `cloture.md` : correction du TP et clôture de la section (mode `redaction`) ;
- `propagation.md` : dépendances, analyse d'impact, rapport et mises à jour (mode
  `propagation`) ;
- `quiz.md` : cadrage, génération, tests, sélection et écriture du quiz (mode `quiz`) ;
- `bac-a-sable.md` : commandes de création, de contrôle et de nettoyage du conteneur ;
- `suivi.md` : format du statut de section et de l'état du module.

## Arguments

`$0` = mode, `$1` = slug du module, `$2` = slug de la section. Si le module ou la
section manque ou n'existe pas en prod (`list_modules`, `list_sections`), proposez la
liste des slugs et attendez le choix de l'utilisateur. En relecture, demandez aussi
quels supports relire si ce n'est pas dit : par défaut, tous ceux qui existent en source
`db`. En mode `propagation`, la section est facultative : sans elle, toutes les retouches
en attente du module sont traitées. En mode `quiz`, `$2` est une plage ou une liste de
sections (`quiz.md` § 0).

## Commits

À chaque **point de validation** obtenu de l'utilisateur (fiche de conception, plan,
réponse à la synthèse d'une relecture, support validé, relecture navigateur, clôture),
commitez les seuls fichiers de suivi du module (les brouillons sont ignorés par git) :

```bash
git add -- docs/plans/<module>/<section>.md docs/plans/<module>/etat.md
git commit -m "docs(plans): <module>/<section>, <point validé>" -- docs/plans/<module>/<section>.md docs/plans/<module>/etat.md
```

Chemins explicites seulement : jamais `git add -A` ni `git add .` (le dossier est partagé
avec d'autres sessions et contient des fichiers non suivis). Jamais `--no-verify` : si
le hook pre-commit échoue, montrez l'erreur à l'utilisateur. Pas de push. Les mises à
jour entre deux points de validation (« Étape en cours », réponses du cadrage) sont
écrites sans commit.

## Liste de tâches de l'orchestrateur

Tenez une liste de tâches visible par l'utilisateur avec l'outil de liste de tâches de
votre client (`TodoWrite` ou `TaskCreate`/`TaskUpdate` en CLI, `update_plan` dans l'app
Desktop). Une seule tâche en cours à la fois.

Liste type du mode `conception` (`conception-rapide` : sans les tâches 4 à 6) :

1. Lire le statut de la section (reprise)
2. Collecter le contexte (collecteur, mode conception)
3. Contrôler la fiche
4. Cadrage : Q0 à Q5, une par une
5. Proposer les angles, faire choisir
6. Fiche de conception : validation, commit
7. Écrire le plan
8. Exécuter les erreurs et les exemples dans le bac à sable
9. Relecture du plan (cohérence, contrat), cycle 1
10. Arbitrer, amender le plan (cycle 2 si besoin)
11. Validation du plan, statut, état du module, commit

Liste type du mode `redaction` (tâches 4 à 6 répétées pour les slides puis le TP ; le
détail de chaque support est dans `redaction.md` § 1) :

1. Lire le statut de la section (reprise)
2. Collecter le contexte (collecteur, mode conception)
3. Contrôler la fiche, comparer budgets et verdicts au plan validé
4. Cours : rédaction, relecture, arbitrage, correction (deux cycles au plus)
5. Cours : validation, écriture en prod (confirmation), commit
6. Cours : relecture navigateur, commit
7. Correction du TP, push (confirmation)
8. Clôture : curriculum, verdicts, matériau quiz, statut, commit

Liste type du mode `relecture` :

1. Lire le statut de la section (reprise)
2. Collecter le contexte (collecteur)
3. Contrôler la fiche
4. Exporter les supports et fixer la couverture
5. Préparer le bac à sable (ports par étudiant)
6. Préparer les supports dans le bac à sable (`preparateur`, § 5 bis)
7. Lancer les relectures en parallèle
8. Contrôler couverture et preuves des rapports
9. Arbitrer
10. Nettoyer le bac à sable
11. Mettre à jour le statut et l'état du module
12. Présenter la synthèse

Liste type du mode `propagation` :

1. Lire le journal des retouches et les plans concernés
2. Lister les changements, confirmer le périmètre
3. Inventaire des dépendances
4. Analyse d'impact (`relecteur-coherence`, un par section)
5. Contrôler les rapports, écrire le suivi
6. Présenter le rapport trié, attendre la décision
7. Mises à jour acceptées, une à une
8. Solder les retouches (confirmation), état du module, commit

Liste type du mode `quiz` :

1. Lire le journal, `quiz.md` et l'état du module
2. Collecter le contexte des sections visées
3. Cadrage : Q1 à Q8, une par une
4. Génération : un agent par section, un transversal
5. Présélection
6. Tests : deux étudiants, sans énoncé, lecture croisée
7. Corriger ou écarter, sélection finale
8. Validation, écriture en prod (confirmation), relecture
9. `quiz.md`, état du module, commit

À la reprise d'une section interrompue, reconstruisez la liste du mode à partir du
statut de section (étape 1) et reprenez à la première tâche non faite.

## 1. Reprise

Lisez `docs/plans/<module>/<section>.md` et `docs/plans/<module>/etat.md` s'ils
existent (format dans `suivi.md`). S'il y a un statut, résumez en deux lignes à
l'utilisateur où en est la section (phase, étape en cours, ce qui est validé ;
désaccords en attente et prochaine action) avant de continuer. Gardez la liste des
**remarques écartées** des relectures précédentes (de supports ou du plan) : elle sert à
l'arbitrage (règle 9).

**Journal des retouches, à chaque lancement** : avant tout le reste, quel que soit le mode,
appelez `list_retouches` en prod avec `status: pending` et `module`. S'il y a des entrées,
dites-en le nombre, les sections touchées et le `summary` de chacune, puis proposez
`propagation` en une question. L'utilisateur peut continuer le mode demandé : les entrées
restent en attente. `list_retouches` indisponible : dites-le et continuez.

Reprise fine : « Étape en cours » dit où la session s'est arrêtée (« cadrage : Q3
posée », « plan : relecture, cycle 1 »…). Les réponses déjà notées ne sont pas reposées ;
une question posée sans réponse notée est reposée. La fiche du collecteur n'est pas
gardée : relancez le collecteur (§ 2), puis comparez ses budgets et ses verdicts à ceux
de la fiche de conception ou du plan ; un changement en prod depuis (verdict ajouté,
`totalDuration` modifié) se signale à l'utilisateur avant de continuer.

## 2. Collecteur

Lancez l'agent `collecteur` avec : mode (`relecture` ou `conception`), module, section,
supports à relire (relecture) ou « section à concevoir » (conception). Il rend la fiche
de contexte.

## 3. Contrôle de la fiche

- Vérifiez sa définition de terminé : cinq ✔ avec preuve (dont la rubrique « Notions réellement enseignées », une ligne par section précédente selon `order`). Un ✘ ou une preuve absente
  → relancez-le une fois en citant ce qui manque. Toujours incomplet → montrez le trou
  à l'utilisateur et demandez s'il faut continuer.
- Recalculez vous-même les budgets à partir des valeurs citées.
- **Section sans brief** : dites-le à l'utilisateur et demandez s'il faut continuer.
  Sans brief, le bilan des notions du fragile porte sur les notions déduites des titres
  du cours, et ce choix est écrit dans la synthèse. Rien n'est inventé.
- **Support en source « file »** : il est invisible à `export_content_compact`, il ne
  peut pas être relu. Signalez-le et retirez-le du périmètre.
- Serveur MCP prod indisponible : arrêt immédiat, dites-le.
- **Mode redaction** : le plan validé fait foi. Un budget ou un verdict qui a changé en
  prod depuis sa validation se signale à l'utilisateur (amendement possible du plan,
  `redaction.md` § 7). Passez ensuite à `redaction.md`.
- **Mode propagation** : pas de collecteur, ces § 2 et § 3 ne s'appliquent pas. Passez
  directement à `propagation.md`, avec le plan et le journal lus au § 1.
- **Mode conception** : la section a déjà un support en source `db` → demandez s'il
  faut passer en relecture ou le reconcevoir (rien n'est écrasé : le plan est un
  fichier du dépôt). `courseIntroMinutes` manquant n'est pas un trou de la fiche : c'est
  la Q0 du cadrage. Puis passez à `cadrage.md` (ou `plan.md` en mode rapide) ; les § 4
  à § 11 ci-dessous ne concernent que la relecture.

## 4. Supports et référence de couverture

Sans plan (mode relecture), la référence de couverture est :

- l'arbre `get_content` de chaque support : la liste de TOUS ses blocs (`id`, type) et
  de tous ses exercices et bonus (titre, `id`) ;
- le brief : toutes ses notions doivent apparaître dans le bilan du fragile ;
- le budget : celui de la fiche du collecteur.

Pour chaque support : `export_content_compact` (le texte que reçoivent les agents, avec
les `<!--blockId-->`) et `get_content` (la liste des blocs). Dressez pour chaque
support la liste des `id` à couvrir, et pour chaque agent son sous-ensemble (style :
blocs porteurs de texte ; cohérence : tous les blocs ; contrat et rapide : exercices et
bonus ; fragile : exemples de code, variantes, exercices).

**Compter les marqueurs.** Un marqueur est une ligne qui ne contient que `<!--id-->`
(indentation tolérée) ; l'en-tête `<!-- export: … -->` et les commentaires HTML d'un
bloc de code (`<!-- === Affichage === -->`) n'en sont pas, car ils contiennent une
espace après `<!--`. L'export rend chaque bloc, vides compris (« (vide) »), sous-listes
et code imbriqué compris (indentés sous leur puce), `collapsible` en
`> [repliable] Titre` … `> [fin du repliable]`, contenu des `download-file` et chemins
des `file-tree`. Comparez l'ensemble des ids extraits de l'export à celui de
`get_content` : ils doivent être égaux. Un écart (export d'une version du serveur
antérieure à cette correction, par exemple) se signale dans la synthèse, et les blocs
manquants sont lus avec `get_content`.

`get_content` dépasse la limite de sortie des outils MCP sur les gros supports (cours
et TP de PHP 4, par exemple) : c'est `preparateur` (§ 5 bis) qui le lit, pas
votre contexte.

Repérez aussi les blocs `download-file` du TP et ce qui sert d'état de départ au fil
rouge (fiche du collecteur, rubrique « état initial reconstituable »).

## 5. Bac à sable

Seulement si un étudiant est lancé (cours ou TP dans le périmètre). Vérifiez d'abord
les prérequis de session (`bac-a-sable.md` § 0 : règle de permission, test de fumée de
la garde). Suivez ensuite `bac-a-sable.md` : image `cours-iut-bac:1`, run-id, dossier
`%TEMP%\cours-iut-bac\<run-id>` avec ses sous-dossiers, conteneur
`cours-iut-bac-<run-id>` en `--network none`. Les fichiers des `download-file` vont
dans `fournis/` (`preparateur`, § 5 bis), et dans `depart/` l'état initial du fil rouge
s'il est reconstituable depuis le dépôt de référence. Ce qui manque est dit aux
étudiants dans leur prompt (limite d'environnement).

Ne lancez jamais un étudiant si le conteneur ne répond pas au contrôle de
`bac-a-sable.md`, ni depuis une session non interactive (`claude -p`) ou un dossier
non approuvé : les hooks de frontmatter d'un agent projet ne tournent qu'une fois la
confiance du dossier acceptée, et sans hook la garde du bac à sable saute.

**Ports.** Les trois étudiants partagent le conteneur. Chacun reçoit dans son prompt
une plage de ports réservée, et n'en sort pas :

| Étudiant | Dossier | Ports |
|---|---|---|
| fragile, cours | `/work/fragile-cours` | 8000–8009 |
| fragile, TP | `/work/fragile-tp` | 8010–8019 |
| rapide | `/work/rapide` | 8020–8029 |

Un support qui impose un port (`php -S localhost:8000`) : l'étudiant prend le premier
port de sa plage et le note comme adaptation d'environnement, pas comme blocage.

## 5 bis. Préparation des supports (agent `preparateur`)

Les supports ne sont pas collés dans les prompts des étudiants (trop de contexte
pour l'orchestrateur). L'agent `preparateur` les dépose dans le bac à sable, une fois le
dossier créé (`bac-a-sable.md` § 1) et avant le lancement des étudiants. **Écart à la
lettre de la spec** (§ 2 et § 4 : contenu « dans le prompt ») : à faire valider par
l'utilisateur ; il est noté dans la synthèse.

`preparateur` n'a que quatre outils MCP de lecture prod (`export_content_compact`,
`get_content`, `list_sections`, `get_section`), aucun outil d'écriture MCP, et une garde
(`docker/etudiant-sandbox/garde-preparateur.mjs`, hook de son frontmatter) qui limite
`Write` à `<dir>\supports\cours.md`, `<dir>\supports\tp.md`, `<dir>\fournis\…` et
`<scratchpad>\couverture-<run-id>.md`, et `Bash` à `curl` depuis
`https://salimkhraimeche.dev/download/` et `unzip`, vers `<dir>\fournis\`. Ses cas sont
scriptés dans `tests/sandbox/garde-preparateur.test.ts`. Comme pour les étudiants, la
garde ne tourne que dans une session interactive dans un dossier approuvé : jamais de
`preparateur` depuis `claude -p`.

Lancez l'agent `preparateur` avec ce prompt (valeurs entre chevrons remplies), et rien
d'autre :

```
Module <module>, section <section>.
Supports à préparer : <cours, TP>.
Run-id : <run-id>.
Dossier du bac à sable : <dir>  (chemin Windows long, %LOCALAPPDATA%\Temp\cours-iut-bac\<run-id>)
Scratchpad : <scratchpad>  (dossier qui finit par \scratchpad)
```

Vérifiez son rendu (définition de terminé complète, fichiers présents, totaux et écart
export / `get_content` cohérents avec votre référence de l'étape 4, liste « Non déposé »
lue : un fichier écarté comme état de fin se tranche avec l'utilisateur). Un rapport
incomplet se relance comme ceux des autres agents (§ 7). Les étudiants lisent ensuite `/work/supports/` par la commande autorisée
(`docker exec … sh -c 'cd /work/<dossier> && cat /work/supports/tp.md'`) ; leur prompt
le dit, avec la liste des fichiers. Les relecteurs, eux, reçoivent toujours l'export
dans leur prompt (ou le lisent par `export_content_compact`).

## 6. Relectures en parallèle (spec § 2, étape 5)

Lancez dans un même message tous les agents applicables, un par support :

| Agent | cours | slides | TP |
|---|---|---|---|
| `relecteur-style` | oui | oui | oui |
| `relecteur-coherence` | oui | oui | oui |
| `etudiant-fragile` | oui, mode lecture, `/work/fragile-cours` | non | oui, mode exécution, `/work/fragile-tp` |
| `relecteur-contrat` | non | non | oui |
| `etudiant-rapide` | non | non | oui, `/work/rapide` |

Aucun étudiant sur les slides. Chaque prompt d'agent contient, et seulement cela :

- **relecteurs** (style, cohérence, contrat) : support, module, section, export compact
  du support, liste des `id` à couvrir, mode « première passe », et les **verdicts
  actifs du format relu**, recopiés verbatim de la fiche du collecteur (rubrique
  « Verdicts actifs par format » : format du support relu, plus `global` et le module) ;
  aucun verdict pour ce format → écrivez « aucun verdict actif pour <format> ». Pour la
  cohérence, en plus : la fiche du collecteur, dont la rubrique « Notions réellement
  enseignées » **verbatim**, et l'export du cours (si le support relu est les slides ou
  le TP). Pour le contrat, en plus : le budget TP avec son calcul, et les durées du
  plan s'il existe (sinon « pas de plan : durées non disponibles »). Pour un TP, à tous :
  la règle « jamais d'indice ni de solution dans un TP, elle prime sur la phrase sur
  l'indice replié du verdict `6ac67a63137711fbe6236783` » ;
- **étudiants** : chemin du support relu dans `/work/supports/` (mode lecture :
  `cours.md` ; mode exécution et rapide : `tp.md` et `cours.md`), rubrique « Notions
  réellement enseignées » de la fiche **verbatim** (à défaut : curriculum des sections
  précédentes, verbatim), notions du brief (fragile en mode lecture), budget TP
  (rapide), nom du conteneur, dossier de travail, **plage de ports** (§ 5), contenu de
  `fournis/` et `depart/` (ou leur absence). **Jamais** : universe, exampleDomain,
  projectSpec, état du fil rouge, dépôt de référence, verdicts, autres rapports.

**Copie, jamais reformulation.** La rubrique des notions enseignées et les verdicts
sont collés tels que la fiche les donne, en bloc. Vous n'en tirez pas une liste de
mémoire ni un résumé : un oubli (`match`, `var_dump`, `count` au test des sections PHP)
fait signaler à tort une notion « non enseignée ». Si la rubrique est trop longue,
transmettez-la entière quand même, ou demandez à l'utilisateur.

## 7. Contrôle couverture et preuves

Pour chaque rapport :

- la liste de tâches couvre toute la référence de l'étape 4 (chaque bloc, chaque
  exercice, chaque notion du brief pour le fragile) ;
- aucune proposition d'un relecteur ne contredit un verdict transmis ; un BLOQUANT
  « notion enseignée nulle part » de la cohérence cite sa recherche `search_content`
  (sans elle, il est renvoyé à l'agent) ;
- la définition de terminé est complète, chaque ✔ a sa preuve vérifiable (compte, calcul,
  sortie collée) ; recomptez les comptes contre votre référence ;
- chaque remarque a ses champs (§ 5) ; pour les étudiants, chaque étape du journal a sa
  source ou « aucune source ».

Rapport incomplet ou preuve fausse → relancez CET agent avec la liste de ce qui manque
(au plus deux relances par agent, hors cycle). Toujours incomplet après deux relances →
signalez-le dans la synthèse, sans le masquer.

Pour le HTML/CSS : regardez vous-même les captures PNG citées par les étudiants (dans
le dossier du bac à sable, avant le nettoyage) et comparez-les au rendu annoncé.

## 8. Arbitrage (spec § 6)

Sur l'ensemble des remarques :

0. **Fusion** : même bloc, même problème signalé par plusieurs agents → une seule
   remarque, gravité la plus haute, tous les agents cités.
1. **Véto** : les BLOQUANTS de `relecteur-contrat` et de `relecteur-coherence` sont
   toujours retenus.
2. **Tronc commun** (cours et TP hors bonus) : en cas de conflit, `etudiant-fragile`
   passe avant tous les autres (exemple : le style propose de couper un passage dont le
   fragile a eu besoin → le passage reste, le style ne porte que sur sa formulation).
3. **Style partout** : les règles du relecteur style s'appliquent à tout, y compris au
   guidage que d'autres remarques proposent d'ajouter. Reformulez la proposition
   retenue en conséquence.
4. **Étudiant rapide** : il ne fait modifier que les bonus. Ses remarques hors bonus
   sont écartées, sauf si un autre agent fait la même.
5. **Notion visée** : jamais d'indice ni de solution dans un TP (décision de
   l'utilisateur du 2026-10-27 ; elle prime sur la phrase « un indice replié qui donne
   le principe et le piège » du verdict `6ac67a63137711fbe6236783`). Si le fragile bloque
   sur la notion que l'exercice travaille :
   - au **premier exercice qui pratique cette notion** (début de la partie guidée) :
     le cours est insuffisant. La remarque part au plan du cours (exemple ou variante à
     renforcer) ; la consigne ne gagne au plus qu'une précision sur la méthode ou l'API
     imposée, jamais la solution ni un renvoi « relisez le cours » ;
   - **plus loin** dans le TP : désaccord à trancher par l'utilisateur (règle 8), avec
     votre recommandation.
   Réécrivez ou écartez toute proposition qui donnerait la réponse ou un indice.
6. **Durées** : la mesure du fragile fait foi. Total du tronc commun hors 80–100 % du
   budget TP → signalé comme désaccord à trancher (dans le pipeline complet, c'est un
   retour au plan que l'utilisateur revalide).
7. **MINEURS** : listés à part, ignorables.
7 bis. **Verdicts** : une proposition qui contredit un verdict actif (elle réintroduit
   une forme qu'il interdit) est réécrite dans une forme compatible, en citant le
   verdict, ou écartée avec la mention du verdict. Le relecteur aurait dû le faire :
   notez-le dans le contrôle de son rapport.
8. **Désaccord** : deux agents se contredisent sans qu'une règle tranche → désaccord en
   attente : bloc, remarque de chaque agent, votre recommandation.
9. **Retour d'une remarque écartée** : une remarque déjà écartée lors d'une relecture
   précédente (statut de section) qui revient n'est pas rejouée : elle remonte à
   l'utilisateur comme désaccord, avec la raison de l'écart d'alors.

Chaque remarque reçoit une décision : **retenue**, **écartée** (avec la règle ou la
raison), ou **à trancher**.

## 9. Nettoyage du bac à sable

Une fois tous les rapports contrôlés et les captures regardées : arrêtez le conteneur
et supprimez le dossier (`bac-a-sable.md`). Vérifiez : aucun conteneur
`cours-iut-bac-<run-id>` dans `docker ps -a`, dossier absent. Collez ces deux sorties
dans votre définition de terminé. À faire aussi si la relecture s'arrête en route.

## 10. Statut de section et état du module

Créez ou mettez à jour `docs/plans/<module>/<section>.md` (statut en tête, phase
« relecture », date, synthèse arbitrée, désaccords en attente, remarques écartées,
prochaine action) et `docs/plans/<module>/etat.md` (tableau des sections avec leur
phase). Format exact dans `suivi.md`. Ne touchez pas au reste d'un plan existant.
Commit (« Commits ») une fois que l'utilisateur a répondu à la synthèse.

## 11. Synthèse arbitrée

Présentez-la à l'utilisateur **par support** (cours, puis slides, puis TP), en
français, ton direct, sans corriger quoi que ce soit :

```
### TP
Rapports : style ✔, cohérence ✔, contrat ✔, fragile ✔ (1 relance), rapide ✔
Durées : fragile 92 min / budget 105 min (88 %) ; rapide 61 min, bonus 25 min, 19 min non occupées

Retenues (n)
| # | id | Gravité | Agents | Problème | Proposition arbitrée |

À trancher (n)
| # | id | Remarques en présence | Ma recommandation |

Écartées (n) : une ligne chacune, avec la règle.
MINEURS (n) : une ligne chacune.
```

Terminez par la prochaine action proposée (en général : l'utilisateur choisit les
remarques à faire corriger, ce qui relève d'une étape ultérieure du pipeline) et
n'enchaînez sur rien d'autre.

## Définition de terminé de l'orchestrateur (spec § 13)

**Mode conception**, à la fin de chaque phase (fiche de conception, plan) :

- ✔/✘ point de validation obtenu de l'utilisateur, explicitement (sa réponse citée) ;
- ✔/✘ statut de section et état du module à jour, et commités (hash du commit) ;
- ✔/✘ chaque notion du brief a son repère N, chaque élément du plan sa durée, totaux
  calculés (phase plan) ;
- ✔/✘ chaque message d'erreur du plan exécuté, avec outil et version, ou marqué « non
  vérifié » avec la raison (phase plan) ;
- ✔/✘ relecture du plan : rapports complets, au plus deux cycles, désaccords restants
  présentés (phase plan) ;
- ✔/✘ bac à sable supprimé (sorties de `bac-a-sable.md` § 6), s'il a servi ;
- ✔/✘ aucune écriture MCP, aucun support rédigé.

**Mode redaction** : définition de terminé par support (`redaction.md` § 8), puis celle
de la correction et de la clôture (`cloture.md` § 3).

**Mode propagation** : `propagation.md` § 7.

**Mode quiz** : `quiz.md` § 9.

**Mode relecture**. À la fin, listez critère par critère, ✔ avec preuve ou ✘ avec raison :

- ✔/✘ la synthèse arbitrée a été présentée à l'utilisateur (point de validation de la
  relecture ; sa réponse est attendue, pas supposée) ;
- ✔/✘ statut de section et état du module à jour (chemins des deux fichiers) ;
- ✔/✘ aucun rapport d'agent marqué « incomplet » laissé sans suite (relancé, ou signalé
  dans la synthèse) ;
- ✔/✘ couverture contrôlée pour chaque agent (<n blocs de référence, n couverts>) ;
- ✔/✘ bac à sable supprimé (sorties de `docker ps -a` et du test du dossier) ;
- ✔/✘ aucune écriture MCP faite, aucun support corrigé.

`docs/pipeline/etat.md` ne concerne que les sessions de déploiement du pipeline : ce
skill ne le modifie pas.
