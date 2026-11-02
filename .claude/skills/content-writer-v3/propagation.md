# Propagation d'une modification (spec § 8)

À lire en mode `propagation`, après `SKILL.md` § 1 à § 3. Un élément validé a changé
après coup : ce workflow cherche ce qui en dépend, le dit à l'utilisateur, puis met à
jour seulement ce qu'il a accepté.

## 0. Règles

- Le rapport d'impact n'écrit rien. Aucune mise à jour ne part sans l'accord explicite de
  l'utilisateur, élément par élément : jamais de cascade.
- Chaque mise à jour passe par le circuit normal (§ 5). Un écart ne se corrige pas par
  un `edit_block` direct, même court.
- `mark_retouches_processed` est une écriture en prod : confirmation explicite, comme les
  autres (§ 6).
- Ce workflow lit la prod, jamais staging. Le journal des retouches est tenu en prod.

## 1. Point de départ

Une propagation porte sur un ou plusieurs **changements**. Chacun a son origine :

- une entrée du journal (`list_retouches`, `status: pending`, filtre `module`) : gardez
  son id, son `before`, son `after`, son `summary` et son `dependencyNote` ;
- une modification décrite par l'utilisateur : support d'une section terminée,
  `curriculum`, `exampleDomain`, `universe` ou `projectSpec`.

Sans section en argument, traitez toutes les entrées en attente du module. Une
modification décrite mais pas encore faite s'analyse quand même : dites dans le rapport
qu'elle est hypothétique. Listez les changements et faites confirmer le périmètre en
une question avant de lancer les agents.

## 2. Inventaire des dépendances

Pour chaque changement, dressez la liste des éléments à examiner, d'après `list_sections`
(ordre `order`) et `search_content` sur les termes du changement (noms, API, valeurs) :

| Élément modifié | À examiner |
|---|---|
| cours | slides et TP de la section ; matériau quiz du plan |
| slides | cours de la section, pour l'écart seulement |
| TP | correction et matériau quiz de la section ; TP suivants s'il touche au fil rouge |
| `curriculum` | cours et TP des sections suivantes ; examen |
| `exampleDomain` | cours et slides de tout le module |
| `universe` | supports de tout le module ; quiz |
| `projectSpec`, fil rouge | TP et corrections des sections suivantes ; dépôt de référence |
| question de quiz | cours et TP dont elle part |
| tout élément | questions du quiz et examen du module, s'ils portent sur lui |

Une section ou un support sans lien établi reste dans l'inventaire avec la raison de son
exclusion, en une ligne. Un support en source « file » ne peut pas être lu : il va en
« à vérifier ».

## 3. Analyse d'impact

Lancez, dans un même message, un `relecteur-coherence` en mode impact par section
concernée, et aucun autre agent. Celui de la section modifiée reçoit aussi le quiz et
l'examen du module. Chaque prompt contient, et seulement cela :

- mode « impact », module, section examinée, supports à examiner ;
- la description de chaque changement : avant, après, origine (id de retouche ou
  « décrit par l'utilisateur ») ;
- chemin absolu du plan de la section s'il existe, sinon « pas de plan » ;
- « quiz et examen à examiner : oui » ou « non ».

Contrôlez ensuite chaque rapport (`SKILL.md` § 7) : chaque support de l'inventaire a son
classement, chaque « certain » cite un passage réel. Un rapport incomplet se relance, au
plus deux fois.

Limites à redire dans le rapport : l'agent ne lit pas les dépôts de correction, donc une
correction dépendante reste « à vérifier » ; si `get_project_reference` échoue, le fil
rouge se juge sur les TP, et le rapport le précise.

## 4. Rapport à l'utilisateur

Fusionnez les rapports, puis triez : BLOQUANT avant MAJEUR avant MINEUR, et à l'intérieur
« certain » avant « à vérifier ». Le classement « aucun » tient en une ligne par support.

```
### Impact : <module>, <changement en une phrase>
Origine : retouche <id> | décrit par l'utilisateur (hypothétique ou fait)
Rapports : <section> ✔, <section> ✔ (1 relance)

Certain (n)
| # | Section | Support | id | Gravité | Passage concerné | Proposition |

À vérifier (n)
| # | Section | Support | id | Ce qu'il faut vérifier | Qui peut le faire |

Aucun : <support> (<raison>), …
Non examiné : <élément, raison>
```

Puis arrêtez-vous : l'utilisateur choisit les lignes à mettre à jour. Écrivez le rapport
dans le suivi (§ 6) avant de présenter la suite. Une analyse demandée seule s'arrête là.

## 5. Mises à jour

Pour chaque ligne acceptée, une section et un support à la fois, dans l'ordre cours,
slides, TP :

1. amendement du plan (`redaction.md` § 7), avec une ligne dans « Relectures du plan » ;
2. rédacteur en mode correction, sur les seuls blocs concernés ;
3. relecture de ces blocs, arbitrage, validation (`redaction.md` § 4 à § 6) ;
4. écriture en prod après confirmation, `comparer`, relecture navigateur ;
5. TP modifié : correction relancée, comme dans `cloture.md`.

Une section sans plan n'a rien à amender : dites-le, et proposez de la faire passer par
`conception-rapide` limité au passage concerné. Une correction du fil rouge qui change un
exercice suivant ouvre un nouveau changement : il repart au § 2, avec votre accord.

## 6. Suivi

- **Plan de chaque section touchée** : rubrique « Propagations » (`suivi.md`), datée, avec
  le changement, l'impact et la décision, y compris « rien à faire ». Section sans plan :
  créez le fichier avec son seul statut et cette rubrique.
- **`docs/plans/<module>/etat.md`** : rubrique « Propagations ».
- **Journal** : quand toutes les lignes d'une retouche sont faites ou écartées, demandez
  confirmation, puis appelez `mark_retouches_processed` avec ses ids et une note qui dit
  ce qui a été propagé ou décidé. Une retouche dont une ligne attend reste en attente.
- **Commit** des fichiers de suivi à chaque décision de l'utilisateur (`SKILL.md`,
  « Commits »).

## 7. Définition de terminé

- ✔/✘ changements listés et périmètre confirmé (réponse citée) ;
- ✔/✘ inventaire complet : <n éléments>, chaque exclusion justifiée ;
- ✔/✘ rapports d'impact complets (<n sections sur n>), aucun « incomplet » sans suite ;
- ✔/✘ rapport trié présenté, décision de l'utilisateur citée ;
- ✔/✘ chaque mise à jour passée par le circuit normal, ou sans objet ;
- ✔/✘ plans datés, état du module à jour, commit (hash) ;
- ✔/✘ retouches soldées après confirmation, ou encore en attente avec la raison ;
- ✔/✘ aucune écriture sans confirmation explicite.
