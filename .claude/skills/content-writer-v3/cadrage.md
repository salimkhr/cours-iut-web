# Cadrage d'une section (mode `conception`, spec § 2 étape 2)

Le cadrage fait remonter les décisions de l'utilisateur AVANT le plan. Vous ne rédigez
rien pendant cette phase : ni bloc, ni plan, ni brouillon de consigne. La sortie est une
**fiche de conception** que l'utilisateur valide.

Mode `conception-rapide` : le cadrage est sauté, sauf Q0 si `courseIntroMinutes`
manque (le budget en dépend). Passez directement à `plan.md`, en notant dans la fiche
de conception « mode rapide : pas de cadrage, angle par défaut » et l'angle retenu en
une ligne.

## 1. Entrées

- La fiche du collecteur en mode conception (`SKILL.md` § 2), contrôlée (§ 3).
- Le statut de la section s'il existe (reprise : réponses déjà notées dans la rubrique
  « Cadrage », voir `suivi.md`).

## 2. Questions, une par une

Une seule question par message, avec l'outil de question de votre client
(`AskUserQuestion`) ou en texte si l'outil manque. Chaque question porte une **valeur
par défaut argumentée**, tirée de la fiche (brief, notions enseignées, verdicts,
exemplaire, état du fil rouge) et marquée « (Recommandé) ». Vous n'enchaînez pas deux
questions dans le même message, même courtes.

Après chaque réponse : écrivez-la tout de suite dans la rubrique « Cadrage » du fichier
de section et mettez à jour « Étape en cours » (par exemple « cadrage : Q3 posée »),
sans commit (`suivi.md`). Une session coupée reprend ainsi à la première question sans
réponse.

| # | Question | Quand | Défaut à proposer |
|---|---|---|---|
| Q0 | `courseIntroMinutes` de la section (temps de cours + slides en début de séance) | seulement s'il manque en prod | la valeur des sections précédentes du module (fiche), sinon 20 min ; montrez le budget TP qui en découle |
| Q1 | Ce que les étudiants ratent d'habitude sur ce sujet | toujours | 2 ou 3 points tirés des notions du brief et des blocages relevés dans les relectures précédentes du module (`docs/plans/<module>/`) |
| Q2 | Les erreurs que vous voyez réellement en TP | toujours | les erreurs plausibles des notions du brief, chacune avec l'outil qui l'émet. Elles servent à concevoir le TP et le quiz : le cours ne les sert jamais |
| Q3 | Les exemples qui marchent en classe | toujours | 2 exemples dans l'`exampleDomain`, avec les noms de l'`universe`, jamais dans le domaine du fil rouge |
| Q4 | Ce que vous voulez absolument voir ou éviter | toujours | rappel des verdicts actifs du module qui s'appliquent (id + une ligne), et « rien de plus » |
| Q5 | Répartition du TP entre partie guidée et fil rouge (`projectRef: true`) | toujours, sauf mode examen | à partir du `filRougeStep` du brief et de l'état du fil rouge : par exemple « 2 exercices guidés (40 %), puis 3 exercices fil rouge » ; rappelez le verdict « seul le premier exercice d'un geste nouveau est guidé pas à pas » s'il est actif |

L'utilisateur peut répondre « défaut » : notez la valeur par défaut comme réponse, avec
la mention « défaut accepté ». Une réponse qui contredit un verdict actif : signalez-le
en une ligne et demandez laquelle des deux l'emporte, avant la question suivante.

Section sans brief : avant Q1, demandez les notions visées (une question), avec en
défaut les notions déduites du titre et de la place de la section ; rien n'est inventé
sans réponse.

## 3. Angles pédagogiques

Une fois Q0 à Q5 répondues, proposez **2 ou 3 angles** dans un seul message. Pour
chacun :

- **Idée directrice** (une phrase) : par quel problème on entre dans la section.
- **Progression** : l'ordre des notions du brief, en une ligne.
- **Exemple fil conducteur du cours** : domaine et données, dans l'`exampleDomain`.
- **Compromis** : ce que l'angle coûte (durée, risque de blocage du fragile sur telle
  notion, proximité avec le fil rouge à surveiller, notion repoussée).
- **Ce qu'il fait des réponses** : quelles réponses Q1 à Q4 il traite, et comment.

Recommandez-en un, en deux phrases, et demandez le choix (une question). L'utilisateur
peut combiner : notez la combinaison telle qu'il la décrit.

## 4. Fiche de conception

Écrivez-la dans la rubrique « Fiche de conception » du fichier de section (format dans
`suivi.md`), puis présentez-la à l'utilisateur :

```markdown
## Fiche de conception (validée le <date> | en attente)
- **Angle retenu** : <nom> — <idée directrice>
- **Progression des notions** : N1 <notion> → N2 … (liste complète du brief, aucune ajoutée sans réponse de l'utilisateur)
- **Exemple fil conducteur du cours** : <domaine, données>
- **Erreurs vues en TP** : <Q2 ; matière du TP et du quiz, jamais servie dans le cours>
- **À voir absolument / à éviter** : <réponses Q4, verdicts cités par id>
- **TP** : <n> exercices guidés puis <n> fil rouge ; bonus : <idée en une ligne>
- **Budgets** : cours + slides <n> min ; TP <calcul> (plage <a>–<b> min)
- **courseIntroMinutes** : <valeur> (<en prod | fixé au cadrage, écrit en prod à la clôture>)
- **Points laissés au plan** : <ce qui reste à détailler>
```

Demandez la validation (une question). Corrections demandées : modifiez la fiche, puis
redemandez. Une fois validée :

1. statut : phase `plan`, « Validé : fiche de conception le <date> », étape en cours
   « plan : rédaction » ;
2. `docs/plans/<module>/etat.md` : ligne de la section mise à jour ;
3. commit des deux fichiers (`SKILL.md`, « Commits ») ;
4. passez à `plan.md`.

Aucune écriture MCP pendant le cadrage. `courseIntroMinutes` reste dans la fiche
jusqu'à la clôture.
