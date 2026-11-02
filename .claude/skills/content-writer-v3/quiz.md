# Quiz de module (spec § 7)

À lire en mode `quiz`. Le quiz est unique par module : ce workflow lui ajoute des questions
sur une liste de sections. Principe : générer large, puis sélectionner.

## 0. Règles

- **Sections visées** : `$2` en plage (`1-4`) ou en liste (`1,3,4`), ou en slugs. Un numéro
  désigne le préfixe du slug (`4` : `4-formulaire`), jamais la position dans `list_sections`.
  Sans `$2`, proposez toutes les sections rédigées, au cadrage.
- Rien n'est écrit en prod avant la validation de l'utilisateur et sa confirmation de
  l'écriture. Jamais staging : il n'a pas les cours et aucun mécanisme ne copie un quiz
  (décision du 2026-11-02). Une question en prod n'atteint les étudiants que lorsque
  l'enseignant lance une session.
- Une question part d'un geste du TP, jamais de son exemple : elle est transposée dans
  l'`exampleDomain` (décision du 2026-11-02).
- Les questions existantes ne sont ni modifiées ni supprimées, sauf demande.
- Les étiquettes ne vont pas en base : le schéma n'a pas de champ pour elles. Elles
  restent dans `docs/plans/<module>/quiz.md`.
- Brouillons dans `docs/plans/<module>/brouillons/quiz/`, ignorés par git. Le fichier
  `cle.md` qui y est écrit n'entre jamais dans le bac à sable.

## 1. Collecteur

Lancez `collecteur` en mode quiz avec le module et les sections. Il rend curriculum, notions
enseignées, verdicts, questions existantes et brief de chaque section. Lisez vous-même la
rubrique « Matériau quiz » de chaque plan (`docs/plans/<module>/<section>.md`).

Une section sans support en source `db` sort de la liste, et vous le dites. Une section
sans matériau quiz reste possible : son rédacteur relève les gestes dans le TP, sans
blocages du fragile. Dites-le dans le cadrage.

## 2. Cadrage

Une question à la fois, chacune avec sa valeur par défaut argumentée. Notez les réponses
dans `docs/plans/<module>/quiz.md`, sans commit.

| # | Question | Défaut |
|---|---|---|
| Q1 | Sections couvertes | la liste de `$2`, ou toutes les sections rédigées |
| Q2 | Nombre total et répartition par section | 4 questions par section, plus la part transversale |
| Q3 | Part transversale | 25 % (repère 20–30 %), 0 pour une seule section |
| Q4 | Usage | révision, sauf indication contraire |
| Q5 | Points négatifs | non : ils se justifient pour une évaluation notée |
| Q6 | Durée totale visée | somme des `durationSeconds`, 1 min par question en repère |
| Q7 | Notions à cibler ou à exclure | aucune |

Récapitulez, puis faites valider. Q5 ne s'applique que si le quiz n'a pas encore de
questions ; sinon, gardez la configuration et dites-le.

## 3. Génération

Dans un même message : un `redacteur-quiz-section` par section (vivier d'environ 8) et un
`redacteur-quiz-transversal` (environ 1,5 fois sa part). Chaque prompt suit les entrées de
l'agent. Contrôlez chaque rendu : définition de terminé complète, sortie de `valider-quiz`.
Rapport incomplet : relancez au plus deux fois.

Comptes attendus : au moins deux sections pour le transversal ; sans elles, pas d'agent
transversal.

## 4. Présélection

Environ 1,5 fois la taille cible, selon les critères du § 6. Une ligne par écartée, avec la
raison.

```bash
bun src/scripts/brouillon.ts extraire-quiz docs/plans/<module>/brouillons/quiz/preselection.json --ids <id,id> docs/plans/<module>/brouillons/quiz/<fichier>.json ...
```

## 5. Tests

**Préparation** : bac à sable (`bac-a-sable.md`), avec les dossiers `fragile-quiz` et
`rapide-quiz`. Un `preparateur` par section, en mode quiz, dépose `supports\<section>\cours.md`
et `tp.md` : chacun recopie ses exports verbatim, et un échec n'en touche qu'une. Puis, depuis
le dépôt :

```bash
bun src/scripts/brouillon.ts exporter-quiz docs/plans/<module>/brouillons/quiz/preselection.json --sortie <dir>/supports/quiz.md --cle docs/plans/<module>/brouillons/quiz/cle.md
bun src/scripts/brouillon.ts exporter-quiz docs/plans/<module>/brouillons/quiz/preselection.json --sortie docs/plans/<module>/brouillons/quiz/sans-enonce.md --sans-enonce
```

Vérifiez que `quiz.md` ne contient ni `correct` ni id de proposition.

**En parallèle** :

- `etudiant-fragile` et `etudiant-rapide`, mode quiz, séparément : conteneur, dossier, liste
  des sections, notions réellement enseignées verbatim. Jamais la clé, le plan ou les
  étiquettes ;
- `relecteur-contrat`, mode quiz : chemin de `sans-enonce.md`, le test « sans énoncé ».

**Lecture croisée**, avec `cle.md` :

| Fragile | Rapide | Lecture |
|---|---|---|
| juste | juste | facile |
| faux | juste | discriminante si l'erreur correspond à un distracteur prévu, sinon énoncé ambigu : MAJEUR |
| juste | faux | BLOQUANT |
| faux | faux | BLOQUANT |

Durées : `durationSeconds` couvre le temps du fragile ; si même le rapide dépasse, la durée
est nettement trop courte. Test « sans énoncé » : réponse trouvée par élimination,
distracteurs trop faibles.

Une question qui échoue repart une fois à son auteur, ou elle est écartée. Une réponse sans
bloc cité est une réponse devinée, même juste : elle se signale. Si aucun des deux étudiants
ne trouve de bloc pour le point central, la question porte sur une notion non enseignée :
écartez-la, ou gardez-la en le disant à l'utilisateur. Une erreur du fragile sur une telle
question ne prouve pas qu'elle est discriminante.

Avant de présenter la sélection, exécutez dans le bac à sable les comportements dont dépendent
les bonnes réponses : ni les rédacteurs ni les étudiants n'exécutent ce code. Nettoyez ensuite
le bac à sable.

## 6. Sélection finale

Critères de la spec § 7 : couverture proportionnelle à l'importance des sections, notions
centrales d'abord ; part transversale respectée ; diversité des types ; pas plus d'un tiers
des questions au même niveau de Bloom ; quelques questions `analyser` ou `evaluer` ;
progression de difficulté ; pas de redondance ; aucune question ambiguë ou devinable ;
répartition facile / discriminante adaptée à l'usage. Une ligne par question retenue : pourquoi
elle a gagné.

Extrayez `selection.json` dans l'ordre de difficulté voulu.

## 7. Validation et écriture

Générez d'abord le fichier de relecture et envoyez-le à l'utilisateur, avec son chemin :

```bash
bun src/scripts/brouillon.ts relire-quiz docs/plans/<module>/brouillons/quiz/selection.json --sortie docs/plans/<module>/brouillons/quiz/selection.md
```

Présentez : les questions retenues en entier avec leur bonne réponse et leur justification,
la lecture croisée avec le bloc cité pour chaque réponse, la répartition par niveau de
Bloom, les écartées en une ligne chacune. L'utilisateur peut échanger.

Puis, après sa confirmation explicite de l'écriture, en prod : `create_quiz` si le module
n'a pas de quiz, avec `negativeMarking` ; un `add_quiz_question` par question, sans les
`etiquettes` ni l'`id` de candidate, en gardant ceux des propositions. Relisez avec
`get_quiz` : même nombre de questions, mêmes énoncés, mêmes bonnes réponses. Un échec en
cours de route s'arrête et se signale avec les questions déjà ajoutées.

## 8. Suivi

- `docs/plans/<module>/quiz.md` : cadrage, sections, questions écrites avec leur id en prod et
  leurs étiquettes, écartées, date.
- `docs/plans/<module>/etat.md`, rubrique « Quiz » : dernier cadrage, sections couvertes,
  questions publiées.
- Commit de ces deux fichiers à chaque point de validation (`SKILL.md`, « Commits »).

## 9. Définition de terminé

- ✔/✘ cadrage validé (réponse citée) ;
- ✔/✘ un rapport complet par section et un transversal : <n sur n> ;
- ✔/✘ présélection testée par les deux étudiants et `relecteur-contrat`, bloc cité pour chaque
  réponse : <n sur n> ;
- ✔/✘ aucun BLOQUANT dans la sélection ;
- ✔/✘ au plus un tiers des questions au même niveau de Bloom : <répartition> ;
- ✔/✘ sélection validée, écriture confirmée (réponses citées) ;
- ✔/✘ `get_quiz` relu : <n questions sur n> ;
- ✔/✘ bac à sable supprimé (sorties de `bac-a-sable.md` § 6) ;
- ✔/✘ `quiz.md`, état du module, commit (hash).
