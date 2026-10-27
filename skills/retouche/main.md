# Skill retouche — Corriger un bloc depuis l'app Claude

À utiliser pour une petite correction sur un support déjà en ligne, depuis l'app
Claude, souvent sur téléphone. Un seul modèle, pas de subagent. La retouche s'écrit
directement en prod, après l'accord explicite de l'utilisateur sur l'avant/après.

## Périmètre

Accepté : une faute, une reformulation, un exemple de code à corriger, un callout à
ajouter ou à reprendre, une consigne de TP à ajuster, une question de quiz à revoir.

Refusé : un nouvel exercice, une nouvelle notion, une restructuration (déplacer,
découper, supprimer des blocs), la rédaction complète d'un support. Répondez en une
phrase que ce travail passe par le pipeline Claude Code (`/content-writer-v3`), puis
arrêtez-vous. Une demande qui grossit en cours de route (« et tant qu'on y est… »)
sort du périmètre au même titre.

## Serveur

Lecture et écriture se font sur le connecteur de production, jamais sur staging : les
ids de blocs ne sont pas les mêmes d'un serveur à l'autre, un id lu sur staging ne
désigne rien en prod. Si deux connecteurs sont attachés et que vous ne savez pas
lequel est la prod, demandez avant le premier appel.

## Écrire pour un téléphone

L'utilisateur lit sur un petit écran. Chaque message tient sur un écran : quelques
lignes, pas de tableau large, jamais de JSON affiché. L'avant/après se présente en
deux citations courtes, réduites au passage qui change, pas le bloc entier. Une
seule question par message, à laquelle on répond par oui, non ou un mot.

## Déroulé

### 1. Trouver le bloc

Partez de ce que l'utilisateur donne : module, section, support (cours, TP, slide,
examen) et un bout du texte à corriger. S'il manque quelque chose, demandez-le en une
question. Retrouvez ensuite le bloc :

- `search_content` avec quelques mots du passage cité, filtré sur le module ;
- sinon `get_content` sur le support, puis repérez le bloc dans l'arbre ;
- pour une question de quiz, `get_quiz` sur le module, puis la question par son
  énoncé.

Plusieurs candidats : citez-les en une ligne chacun et faites choisir.

### 2. Montrer et garder l'original

Citez à l'utilisateur le passage concerné, tel qu'il est en ligne. Gardez dans la
conversation, sans l'afficher, le JSON complet de l'élément d'origine : toutes les
props du bloc (et son id, son type), ou la question entière lue par `get_quiz`. Ce
JSON sert deux fois : à construire l'écriture, puis à journaliser l'« avant ».

### 3. Vérifier

Préparez la nouvelle version et passez-la au crible avant de la montrer. Le résultat
tient en une ligne de coches, par exemple « ✔ domaine ✔ impératif ✔ curriculum
✔ style ». Un point sans objet ne s'affiche pas.

- **Domaine d'exemple** : un exemple de cours puise dans l'`exampleDomain` du module
  (`get_module`), jamais dans le domaine du projet fil rouge ; un exemple de TP puise
  dans l'`universe`. Un exemple de cours qui reprend le projet rend le TP faisable par
  copier-coller : ✘ bloquant.
- **Impératif vouvoyé** dans les consignes de TP : « Créez », « Ouvrez »,
  « Modifiez ». Ni infinitif, ni futur, ni tutoiement.
- **Contrat de consigne**, si un exercice est touché : les six champs restent
  présents et justes (fichier cible, noms exacts à créer, données d'entrée, méthode ou
  API imposée, résultat observable, critère de validation).
- **Curriculum** : la retouche n'introduit aucune notion absente du `curriculum` de la
  section et des sections précédentes (`list_sections`). Une notion nouvelle n'est
  plus une retouche, c'est le pipeline.
- **Style** : passe humaniseur-fr (voir plus bas) sur le texte proposé.

### 4. Proposer l'avant/après

Deux citations courtes, « Avant » puis « Après », suivies de la ligne de coches. Si
un point reste ✘, ne proposez pas : dites ce qui bloque. Terminez par une question
fermée : « J'écris en prod ? »

### 5. Écrire en prod, après un oui explicite

Rien ne s'écrit avant un accord clair sur cet avant/après précis. Un « ok » donné à
une version antérieure ne vaut pas pour la suivante.

- Modifier un bloc : `edit_block` avec module, section, type, blockId et les props
  complètes, c'est-à-dire le JSON d'origine avec la seule modification appliquée. Le
  serveur fusionne les props envoyées avec celles en place : une prop omise est
  conservée telle quelle, on ne peut donc pas retirer une prop en l'omettant. Si la
  retouche exige d'en retirer une, arrêtez-vous et renvoyez vers le pipeline.
- Ajouter un bloc (un callout, par exemple) : `insert_block` avec le parent et le
  bloc après lequel insérer. Notez l'id du nouveau bloc, donné dans la réponse
  (« Bloc … inséré »), pour l'étape 6.
- Question de quiz : `edit_quiz_question` remplace la question entière. Renvoyez tous
  les champs lus par `get_quiz` : énoncé (`blocks`), propositions avec leurs `id`,
  `weight` et `durationSeconds`. Un champ oublié revient à sa valeur par défaut
  (poids 1, 30 secondes) et des propositions sans id changent d'identité.

Jamais `save_content` : il écrase tout l'arbre du support. Pas non plus de
`delete_block`, `reorder_blocks` ni `move_block` : supprimer ou déplacer, c'est
restructurer.

Relisez ensuite avec `get_content` (ou `get_quiz`) et confirmez en une ligne que le
texte en ligne est bien le nouveau. Si l'écriture a échoué, citez l'erreur telle
quelle et ne retentez pas sans accord.

### 6. Dépendances et journal

Depuis l'app, rien n'est propagé : on ne corrige jamais en cascade les slides, le TP
ou la correction qui reprennent l'élément retouché. Le workflow de propagation s'en
charge plus tard, à partir du journal.

Journalisez avec `log_retouche`, juste après la relecture, uniquement si l'élément
retouché sert de base à un autre support. Pour en juger, demandez-vous si un autre
contenu le reprend, le cite ou s'appuie dessus :

- un exemple de cours repris par les slides ou par un exercice du TP ;
- une consigne ou un résultat observable dont dépend la correction publiée ;
- une notion ou une API listée dans le `curriculum`, que les sections suivantes
  supposent acquise ;
- tout ce qui découle de l'`exampleDomain`, de l'`universe` ou de la `projectSpec`
  (noms d'entités, données du fil rouge) ;
- une question de quiz bâtie sur un exemple ou un exercice précis.

Une faute d'orthographe ou une tournure corrigée dans un paragraphe que rien d'autre
ne cite ne se journalise pas. Dans le doute, journalisez : une entrée en trop coûte
une lecture, un oubli laisse un support incohérent.

Paramètres de `log_retouche`, sur le même serveur que l'écriture (la prod) :

- `target` : `block` ou `quiz-question` ;
- `module`, puis pour un bloc `section`, `type` et `blockId` (l'id renvoyé par
  `insert_block` pour un ajout), pour une question `questionId` ;
- `operation` : `edit` ou `insert` ;
- `before` : le JSON d'origine gardé à l'étape 2 (props du bloc ou question
  entière), `null` pour un insert ;
- `summary` : ce qui a changé, en une phrase ;
- `dependencyNote`, obligatoire : quels supports dépendent de l'élément et en quoi
  (« exemple repris slide 4 et exercice 2 du TP »).

L'« après » n'est pas à fournir : le serveur le relit lui-même en base. Dites ensuite
à l'utilisateur, en une ligne, que la retouche est journalisée et quels supports
restent à aligner.

## Passe humaniseur-fr

Si le skill humaniseur-fr est disponible, appliquez-le au texte proposé, avec les
réglages du relecteur style du pipeline :

- registre courant, vouvoiement, voix d'enseignant ; ne demandez pas le registre à
  l'utilisateur, il est fixé ;
- dans la partie 4 du skill, désactivez seulement l'argot, les abréviations, le
  « je » dans les consignes et l'ignorance feinte ; le reste s'applique ;
- patterns 36 (absence de trous) et 28 (Markdown résiduel) désactivés : un support
  de cours répond aux questions qu'il pose, et le Markdown y est le format natif ;
- patterns 16, 17 et 34 (gras, listes à en-têtes, sur-sectionnement) : seul l'abus
  compte, le gras d'un terme défini ou une liste de fichiers à créer restent
  légitimes.

Sans le skill, la coche « style » devient « style non vérifié », et dites-le à
l'utilisateur.
