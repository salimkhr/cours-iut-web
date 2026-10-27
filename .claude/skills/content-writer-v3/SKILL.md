---
name: content-writer-v3
description: Orchestrateur du pipeline multi-agents de relecture d'une section de cours (étape 1, relecture seule). Lance le collecteur, les relecteurs et les étudiants simulés sur les supports existants en prod, arbitre leurs rapports et présente une synthèse, sans rien corriger.
disable-model-invocation: true
argument-hint: "[module] [section]"
---

# content-writer v3 : relecture d'une section (étape 1)

**Ce skill ne charge JAMAIS le content-writer v2** : ni le fichier
`skills/content-writer/main.md`, ni `get_pedagogical_skill_manifest`, ni
`get_pedagogical_skill_document` (sur aucun serveur). Les règles utiles de la v2 sont
déjà réparties dans les agents de `.claude/agents/`. Pendant ce workflow, la consigne
générale du `CLAUDE.md` du dépôt (« charger d'abord le skill pédagogique du serveur »)
ne s'applique pas.

Référence : `docs/pipeline/spec.md` (§ 2 étape 5, § 5, § 6, § 12, § 13). En cas de
contradiction entre ce skill et la spec, arrêtez-vous et signalez-la à l'utilisateur.

## Ce que fait ce skill, et ce qu'il ne fait pas

- Mode unique : **relecture** de supports déjà rédigés (cours, slides, TP) d'une
  section que l'utilisateur désigne.
- Source : le serveur MCP **prod**, en lecture seule. Outils de prod : préfixe
  `mcp__d1db0efe-14b0-4182-97b9-d6f36625dc09__` dans l'app Desktop,
  `mcp__claude_ai_cours-iut-web__` en CLI. N'utilisez jamais le serveur staging
  (`95c87654-…`, `claude_ai_cours-iut-staging`) ni le serveur local `cours-iut-mcp`.
- **Aucune écriture MCP**, ni prod ni staging. **Aucune correction** des supports :
  la sortie est une synthèse arbitrée. Les seules écritures sont les deux fichiers de
  suivi (`docs/plans/<module>/<section>.md` et `docs/plans/<module>/etat.md`) et le
  dossier temporaire du bac à sable. Rien n'est commité.
- **Un seul cycle** de relecture. Relancer un agent dont le rapport est incomplet
  (couverture ou preuves) est permis et ne compte pas comme cycle.

Annexes de ce dossier, à lire au moment indiqué :

- `bac-a-sable.md` : commandes de création, de contrôle et de nettoyage du conteneur ;
- `suivi.md` : format du statut de section et de l'état du module.

## Arguments

`$0` = slug du module, `$1` = slug de la section. Si l'un manque ou n'existe pas en prod
(`list_modules`, `list_sections`), proposez la liste des slugs et attendez le choix de
l'utilisateur. Demandez aussi quels supports relire si ce n'est pas dit : par défaut,
tous ceux qui existent en source `db`.

## Liste de tâches de l'orchestrateur

Tenez une liste de tâches visible par l'utilisateur avec l'outil de liste de tâches de
votre client (`TodoWrite` ou `TaskCreate`/`TaskUpdate` en CLI, `update_plan` dans l'app
Desktop). Une seule tâche en cours à la fois. Liste type :

1. Lire le statut de la section (reprise)
2. Collecter le contexte (collecteur)
3. Contrôler la fiche
4. Exporter les supports et fixer la couverture
5. Préparer le bac à sable (ports par étudiant)
6. Préparer les supports dans le bac à sable (agent d'aide, § 5 bis)
7. Lancer les relectures en parallèle
8. Contrôler couverture et preuves des rapports
9. Arbitrer
10. Nettoyer le bac à sable
11. Mettre à jour le statut et l'état du module
12. Présenter la synthèse

À la reprise d'une relecture interrompue, reconstruisez cette liste à partir du statut
de section (étape 1) et reprenez à la première tâche non faite.

## 1. Reprise

Lisez `docs/plans/<module>/<section>.md` et `docs/plans/<module>/etat.md` s'ils
existent (format dans `suivi.md`). S'il y a un statut, résumez en deux lignes à
l'utilisateur où en est la section (phase, dernière relecture, désaccords en attente)
avant de continuer. Gardez la liste des **remarques écartées** des relectures
précédentes : elle sert à l'arbitrage (règle 9).

## 2. Collecteur

Lancez l'agent `collecteur` avec : module, section, supports à relire. Il rend la fiche
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
bonus ; fragile : exemples de code, variantes, erreurs fréquentes, exercices).

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
et TP de PHP 4, par exemple) : c'est l'agent de préparation (§ 5 bis) qui le lit, pas
votre contexte.

Repérez aussi les blocs `download-file` du TP et ce qui sert d'état de départ au fil
rouge (fiche du collecteur, rubrique « état initial reconstituable »).

## 5. Bac à sable

Seulement si un étudiant est lancé (cours ou TP dans le périmètre). Vérifiez d'abord
les prérequis de session (`bac-a-sable.md` § 0 : règle de permission, test de fumée de
la garde). Suivez ensuite `bac-a-sable.md` : image `cours-iut-bac:1`, run-id, dossier
`%TEMP%\cours-iut-bac\<run-id>` avec ses sous-dossiers, conteneur
`cours-iut-bac-<run-id>` en `--network none`. Les fichiers des `download-file` vont
dans `fournis/` (agent de préparation, § 5 bis), et dans `depart/` l'état initial du fil rouge
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

## 5 bis. Préparation des supports (agent d'aide)

Les supports ne sont pas collés dans les prompts des étudiants (trop de contexte
pour l'orchestrateur). Un agent d'aide les dépose dans le bac à sable, une fois le
dossier créé (`bac-a-sable.md` § 1) et avant le lancement des étudiants. **Écart à la
lettre de la spec** (§ 2 et § 4 : contenu « dans le prompt ») : à faire valider par
l'utilisateur ; il est noté dans la synthèse.

Lancez un agent `general-purpose` avec ce prompt (valeurs entre chevrons remplies) :

```
Tâche de préparation, lecture seule. Outils MCP permis, sur le serveur prod
uniquement (préfixe mcp__d1db0efe-14b0-4182-97b9-d6f36625dc09__ ou
mcp__claude_ai_cours-iut-web__) : export_content_compact, get_content. Tout autre
outil MCP est interdit (aucune écriture, aucun outil staging 95c87654-…, aucun
get_pedagogical_skill_*). Outil d'écriture de fichiers : seulement dans les chemins
ci-dessous.
Module <module>, section <section>.
1. export_content_compact type cours → <dir>\supports\cours.md ; type TP →
   <dir>\supports\tp.md. Texte de l'outil verbatim, sans retouche.
2. get_content du TP (et du cours) : pour chaque bloc download-file, écrire
   props.code tel quel dans <dir>\fournis\<props.filename> (sous-dossiers créés si
   le nom en contient).
3. Fichier de couverture <scratchpad>\couverture-<run-id>.md : par support, la liste
   des blocs (id, type, id du parent), le total, et les exercices et bonus (titre, id).
   Comparer les ids à ceux des lignes `<!--id-->` de l'export ; écrire l'écart.
4. Ne jamais copier les slides dans <dir>. Ne rien écrire ailleurs.
Rendre : les chemins écrits avec leur taille, les totaux de blocs, l'écart
export / get_content.
```

Vérifiez son rendu (fichiers présents, totaux cohérents avec votre référence de
l'étape 4). Les étudiants lisent ensuite `/work/supports/` par la commande autorisée
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
  le TP). Pour le contrat, en plus : le budget TP avec son calcul ;
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
5. **Notion visée** : si le fragile bloque sur la notion que l'exercice travaille,
   la proposition retenue est un indice en `collapsible`, jamais la réponse. Réécrivez
   toute proposition qui donnerait la réponse.
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

À la fin, listez critère par critère, ✔ avec preuve ou ✘ avec raison :

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
