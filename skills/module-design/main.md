# Skill module-design — Concevoir un module pédagogique

À utiliser pour créer un nouveau module : cadrage, notions à couvrir, projet fil
rouge spécifié puis codé dans un dépôt de référence, découpage en sections, briefs.
Le workflow progresse par portes : chaque étape sensible s'arrête et attend une
validation de l'utilisateur dans l'admin avant de continuer. Écrit sur staging
uniquement — `create_module` et `edit_module` forcent systématiquement
`projectSpec.status` à `draft` côté serveur, quoi que vous leur envoyiez ; seul un
geste explicite dans l'admin fait passer une porte.

## Philosophie

- **L'apprentissage se joue dans le TP.** Le cours et les slides amorcent la première
  séance (`courseIntroMinutes`) ; tout le reste du temps est du TP. Concevez les
  sections autour de ce que l'étudiant FERA, pas de ce qu'il écoutera.
- **Public réel** : étudiants de BUT Informatique, niveaux hétérogènes. Une section
  se juge à ceci : l'étudiant fragile démarre, le rapide ne s'ennuie pas.
- **Deux domaines, jamais confondus.** Le projet fil rouge (`projectSpec`) porte
  l'histoire qui grossit de section en section ; l'`exampleDomain` porte les exemples
  du cours. Ils ne se recouvrent jamais. Un cours qui illustre une notion avec le
  domaine du projet rend le TP suivant soluble par copier-coller — l'étudiant a déjà
  vu la solution avant l'exercice. Projet « gestion de restaurant » : le cours
  n'illustre PAS avec des plats, des commandes ou des tables ; il choisit un domaine
  sans rapport (bibliothèque, météo, inventaire de jeu vidéo — peu importe lequel,
  pourvu qu'il n'ait rien à voir).
- **Modèle temporel** : durée de séance uniforme par module (`sessionDurationMinutes`).
  Le cours/slides n'ouvre QUE la première séance d'une section ; les séances
  suivantes sont 100 % TP.

## Workflow (6 étapes, dans l'ordre)

### Cadrage
Collectez : matière/thème, niveau des étudiants (BUT 1/2/3, débutants ou non),
nombre total de séances (le budget du module), durée d'une séance. Par arguments ou
questions. Créez le module via `create_module` (`title`, `path`, `iconName`,
`sessionDurationMinutes`) — c'est le seul champ de conception pédagogique que cette
étape écrit, tout le reste (notions, projet, sections, briefs) se remplit aux étapes
suivantes.

Cette étape correspond, côté admin, à l'écran « Cadrage » du workflow module — qui
porte aussi les réglages administratifs (couleurs, coefficients de compétences,
intervenants, SAÉ associées). Ces champs n'ont pas de contrepartie MCP : aucun outil
ne les expose, parce qu'ils n'ont pas de réponse pédagogiquement défendable — ce sont
des faits administratifs, pas des choix de conception. Ne les inventez pas ; laissez
l'utilisateur les compléter directement dans l'admin. Si l'utilisateur demande une
couleur ou une description pour le module, `edit_module` (`colorLight`, `colorDark`,
`description`) les couvre.

### Notions
Listez `plannedNotions` : la progression de notions à couvrir sur le module, AVANT
tout choix de projet. Écrivez-la via `edit_module`. Le projet se choisit pour
mobiliser cette progression, pas l'inverse — un projet séduisant qui ne convoque pas
les notions prévues est un mauvais projet, même s'il est amusant.

### Projet
Jamais de conception « de tête » :
- `list_modules` : modules existants (éviter les doublons, situer le niveau).
- `list_sections` sur les modules prérequis : leurs `curriculum` disent ce que les
  étudiants savent VRAIMENT, pas ce qui était prévu.
- `list_verdicts` avec `format: "module-design"` : critiques passées de
  l'utilisateur sur des conceptions. À relire AVANT de proposer quoi que ce soit.

Si le serveur MCP est indisponible : ARRÊT immédiat avec message clair.

Proposez une `projectSpec` (`name`, `pitch`, `finalDeliverable`, `entities`) qui
mobilise les `plannedNotions`, ET un `exampleDomain` (`name`, `description`)
distinct — voir Philosophie. Écrivez les deux via `edit_module` (toujours forcé en
`draft` côté serveur). Puis **arrêtez-vous** : « la spec est écrite en brouillon,
relisez-la et validez-la dans l'admin avant que je code le projet ». Ne passez pas à
l'étape suivante sans ce go explicite.

### Code de référence
Une fois `projectSpec.status` passé à `validated` dans l'admin, codez le projet
complet — son état de FIN de module, pas un squelette de départ — et poussez-le via
`push_project_reference` (`module`, `files`, `message`). Le dépôt reflète exactement
la liste envoyée : un fichier absent de la liste est supprimé du dépôt. Le push
laisse `referenceRepo.status` à `draft`. **Arrêtez-vous** de nouveau : « le dépôt est
poussé, relisez-le et validez-le dans l'admin ». Tant que ce statut n'est pas
`validated`, les outils de rédaction de contenu (`save_content` et consorts) restent
verrouillés pour toute section du module — inutile d'insister avant.

### Sections
Relisez votre propre code via `get_project_reference`. Découpez-le en tranches :
chaque section correspond à un incrément du projet (« section 1 : le CLI affiche le
menu ; section 2 : on ajoute la commande ; … »), jamais à un chapitre de cours choisi
indépendamment du code. Pour chaque section : `totalDuration` (nombre de séances),
`courseIntroMinutes`, et le cahier des charges hors fil rouge (`brief.objectives`,
`brief.notions`, puisées dans `plannedNotions`). Vérifiez : la somme des
`totalDuration` = le budget du module posé au Cadrage. Créez les sections via
`create_section`.

### Briefs
Pour chaque section, à partir du code de référence déjà lu aux étapes précédentes,
complétez ce que seule cette lecture permet d'écrire : `filRougeStep` (ce que le
projet gagne concrètement à cette étape), `filRougeOutcome` (l'état observable en
fin de section — ce que l'étudiant peut montrer, pas une intention vague),
`providedBase` (le code de départ fourni, si la section ne repart pas de zéro).
Écrivez via `edit_section`.

## Clôture
Si l'utilisateur critique la conception (structure bancale, projet plat, mauvais
découpage, domaines qui se recoupent), enregistrez sa critique VERBATIM via
`add_verdict` (`format: "module-design"`) avant de terminer.
