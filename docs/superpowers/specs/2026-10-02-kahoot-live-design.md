# Quiz live par module — brief de conception

**Date :** 2026-10-02  
**Statut :** design validé  
**Branche :** `kahoot`

## 1. Objectif

Créer une expérience de quiz live inspirée de Kahoot, intégrée à la direction artistique et
aux outils pédagogiques du site. L'enseignant projette un QR code, les étudiants rejoignent
la session avec leur compte personnel et répondent depuis leur téléphone. La question reste
sur l'écran projeté ; le téléphone affiche uniquement les propositions.

Le quiz poursuit deux objectifs complémentaires :

1. animer une séance avec un chronomètre et un podium ;
2. fournir à l'enseignant un relevé durable des réponses et de la note de chaque étudiant.

La rapidité n'influence jamais la note. Elle départage uniquement les étudiants ayant la
même note dans le podium live.

## 2. Périmètre

### Inclus

- un quiz unique rattaché à chaque module ;
- un front d'administration pour créer et éditer le quiz ;
- des outils MCP limités à la lecture, la création et l'édition du quiz ;
- un écran projeté pour le lobby, les questions, les corrections et le podium ;
- une interface mobile authentifiée pour répondre ;
- des sessions live synchronisées en temps réel ;
- l'enregistrement des participants, réponses, temps et notes ;
- un tableau enseignant filtrable par session, groupe, nom et prénom.

### Non inclus

- plusieurs quiz concurrents dans un même module ;
- des propositions de réponse riches ;
- le lancement ou le pilotage d'une session par MCP ;
- la consultation des notes par MCP ;
- un classement nominatif complet projeté ;
- un bonus de note lié à la rapidité.

## 3. Modèle pédagogique

### 3.1 Quiz du module

Chaque module possède au plus un quiz. Le quiz contient :

- un identifiant stable ;
- le module auquel il appartient, avec une contrainte d'unicité ;
- le réglage global `negativeMarking` (« Points négatifs ») ;
- une liste ordonnée de questions ;
- les dates de création et de dernière modification.

Toutes les questions du quiz sont jouées, dans l'ordre défini. Il n'existe pas de sélection
partielle au lancement d'une session.

### 3.2 Question

Chaque question possède :

- un identifiant stable ;
- un contenu riche composé de blocs pédagogiques d'affichage ;
- au moins deux propositions de réponse en texte simple ;
- une ou plusieurs propositions correctes ;
- au moins une proposition incorrecte ;
- un poids strictement positif, `1` par défaut ;
- une durée propre, `30` secondes par défaut, comprise entre `5` et `300` secondes ;
- une position dans le quiz.

Le contenu riche réutilise le format `Block[]` et le moteur de rendu existants. La liste
autorisée est limitée aux blocs d'affichage pertinents, notamment texte, titre, liste,
tableau, code, image et diagramme. Les blocs interactifs et toute forme de quiz imbriqué sont
refusés par la validation.

Les propositions restent de courtes chaînes de texte afin de conserver une interaction
rapide et lisible sur téléphone.

## 4. Parcours utilisateur

### 4.1 Préparation

Dans l'administration d'un module, l'enseignant ouvre l'onglet « Quiz ». Il peut :

- créer le quiz s'il n'existe pas ;
- activer ou désactiver les points négatifs ;
- ajouter, modifier, supprimer et réordonner les questions ;
- composer le contenu riche de l'énoncé avec l'éditeur de blocs existant ;
- éditer les propositions, les réponses correctes, le poids et la durée ;
- vérifier les erreurs de validation avant l'enregistrement.

### 4.2 Lobby

L'enseignant lance une session depuis le front du module. L'écran projeté affiche :

- le nom du module ;
- un QR code à fort contraste ;
- un code court comme solution de secours ;
- le nombre de participants connectés ;
- l'action de démarrage, réservée à l'enseignant.

Le QR code ouvre une URL de participation contenant un code de session aléatoire et
non prédictible. Un étudiant non connecté passe par l'authentification, puis revient
automatiquement dans la session. Le compte personnel est obligatoire.

### 4.3 Question ouverte

L'écran projeté remplace le lobby par :

- le contenu riche de la question ;
- le nombre de bonnes réponses attendues ;
- un chronomètre très visible ;
- le nombre de réponses reçues, sans identité ni distribution intermédiaire.

Le téléphone affiche uniquement les propositions, le nombre de réponses attendues, le temps
restant et un bouton explicite de validation. La sélection est modifiable jusqu'à l'envoi.
Une fois envoyée, elle est verrouillée.

Le serveur fixe l'heure de début et l'échéance. Les clients affichent le temps restant à
partir de ces valeurs, mais une réponse arrivée après l'échéance est refusée côté serveur.

### 4.4 Correction et podium

À zéro, la question se ferme automatiquement. L'écran projeté et les téléphones passent à
la correction :

- toutes les propositions sont affichées ;
- les bonnes réponses sont distinguées par un libellé, une icône et une couleur ;
- chaque étudiant voit les points obtenus sur la question et son score cumulé ;
- l'écran projeté affiche le podium actualisé sous la forme `Prénom N.`.

L'enseignant reste sur cette vue aussi longtemps que nécessaire pour commenter. Il passe
manuellement à la question suivante avec les mêmes principes de navigation que les slides :
commandes visibles et raccourcis clavier.

À la dernière question, la session passe à l'état terminé et conserve le podium final.

## 5. Barème

Soient, pour une question :

- `W` : le poids de la question ;
- `C` : le nombre total de propositions correctes ;
- `I` : le nombre total de propositions incorrectes ;
- `G` : le nombre de propositions correctes sélectionnées ;
- `B` : le nombre de propositions incorrectes sélectionnées.

Sans points négatifs :

```text
scoreQuestion = W × G / C
```

Avec points négatifs :

```text
scoreBrut = W × (G / C − B / I)
scoreQuestion = max(0, scoreBrut)
```

Cette formule permet le crédit partiel. Sélectionner deux bonnes propositions sur trois
rapporte deux tiers du poids avant éventuelle pénalité. Lorsque les points négatifs sont
actifs, sélectionner toutes les propositions rapporte zéro.

La note cumulée est la somme des scores de question. Le tableau enseignant affiche les
points obtenus sur le total possible ainsi que le pourcentage correspondant. La rapidité
n'entre pas dans ce calcul.

Le podium est trié par :

1. note cumulée décroissante ;
2. en cas d'égalité seulement, temps de réponse cumulé croissant ;
3. si l'égalité persiste, ordre alphabétique afin de garantir un résultat déterministe.

Le temps cumulé ne compte que les questions auxquelles l'étudiant a répondu. Une absence de
réponse consomme la durée complète de la question pour le départage.

## 6. Architecture

### 6.1 Principe

L'architecture recommandée combine le SSE existant et MongoDB :

- SSE diffuse immédiatement l'état live vers la projection et les téléphones ;
- MongoDB conserve le quiz, l'état essentiel des sessions, les participants et les réponses ;
- un service métier partagé centralise les validations, transitions et calculs.

Cette approche réutilise l'infrastructure des slides sans ajouter Redis ni serveur WebSocket.
Elle vise l'usage actuel d'une classe et d'une instance applicative, tout en permettant aux
clients de se reconnecter sans perdre leur état.

### 6.2 Unités

#### QuizRepository

Lit et écrit le quiz unique d'un module. Il ne contient aucune logique d'interface ou MCP.

#### QuizService

Fournit les opérations de création et d'édition, applique les schémas Zod, contrôle les blocs
autorisés et protège l'unicité par module. Le front admin et le MCP utilisent ce même service.

#### LiveQuizRegistry

Étend le principe de `LiveSessionRegistry` avec des canaux SSE par session. Il diffuse un état
public différent selon le destinataire : enseignant/projection ou étudiant.

#### LiveQuizService

Crée les sessions, contrôle la machine à états, accepte ou refuse les réponses, calcule les
scores et publie les nouveaux états. Les transitions sensibles sont toujours décidées côté
serveur.

#### QuizResultsRepository

Enregistre les participants et réponses, puis produit les vues agrégées du tableau enseignant.

### 6.3 Machine à états

```text
lobby → question_open → reveal → question_open → … → reveal → finished
```

- `lobby` accepte les participants ;
- `question_open` accepte une réponse par étudiant jusqu'à l'échéance ;
- `reveal` expose la correction et le podium, sans accepter de nouvelle réponse ;
- `finished` ferme définitivement la session.

Le passage `question_open → reveal` est automatique à l'échéance. Les autres transitions
sont déclenchées par l'enseignant.

### 6.4 Instantané

Le lancement copie le quiz complet dans la session : questions, blocs, propositions,
réponses correctes, poids, durées et réglage de points négatifs. Une modification ultérieure
du quiz ne change jamais une session en cours ou passée.

## 7. Persistance

### 7.1 `module_quizzes`

Un document par module : configuration, questions embarquées, ordre et métadonnées. Un index
unique sur `moduleId` garantit la règle « un quiz par module ».

### 7.2 `quiz_sessions`

Contient le code de participation, l'enseignant, l'instantané du quiz, l'état courant,
l'index de la question, les heures de début/échéance et les dates de fin. Le code de
participation possède un index unique et une date d'expiration.

### 7.3 `quiz_participants`

Une ligne logique par couple session–utilisateur avec contrainte unique. Elle mémorise
l'identité et le groupe au moment de la session, la date d'arrivée, le score cumulé et le
temps cumulé. Elle permet d'afficher également un étudiant connecté n'ayant répondu à aucune
question.

### 7.4 `quiz_answers`

Une ligne logique par session–question–utilisateur avec contrainte unique : propositions
choisies, heure d'envoi, temps de réponse, score obtenu et score maximal. L'écriture est
idempotente afin qu'une reconnexion ou un double clic ne crée jamais deux réponses.

Les `ObjectId` sont convertis en chaînes avant toute transmission au client.

## 8. API et temps réel

Les routes exactes suivront les conventions App Router existantes, avec quatre familles :

- administration du quiz d'un module ;
- création et pilotage enseignant d'une session ;
- participation et envoi de réponse authentifiés ;
- lecture des résultats réservée à l'enseignant ou à l'administrateur.

Chaque session expose un flux SSE. Le payload étudiant ne contient jamais les indicateurs de
bonne réponse avant `reveal`. Le payload projeté ne contient jamais l'identité des réponses
individuelles, uniquement les compteurs et le podium autorisé.

Une reconnexion recharge d'abord l'état persistant, puis reprend le flux SSE. Si une réponse
a déjà été envoyée, le téléphone revient dans l'état verrouillé correspondant.

## 9. MCP de création et d'édition

Le MCP expose des outils pédagogiques cohérents avec les outils de contenu existants :

- lire le quiz d'un module ;
- créer le quiz unique d'un module ;
- modifier sa configuration ;
- ajouter une question ;
- modifier une question ;
- supprimer une question ;
- réordonner les questions.

Ces outils appellent `QuizService` et ses schémas Zod. Ils ne réimplémentent ni les règles de
blocs, ni le barème, ni les contraintes d'unicité.

Le MCP ne peut pas lancer ou piloter une session, répondre à une question, ni lire les notes.

## 10. Interfaces et direction artistique

### 10.1 Écran projeté

Le rendu privilégie la lisibilité à distance : grande typographie, largeur de lecture
contrôlée, contraste élevé, chronomètre stable avec chiffres tabulaires et QR code entouré
d'une zone calme. Le podium reste limité aux meilleures places et n'affiche jamais le bas du
classement.

### 10.2 Téléphone

Les propositions sont des contrôles natifs accessibles avec des cibles tactiles d'au moins
44 px. Le nombre de réponses attendues est annoncé par du texte, pas uniquement par la
couleur. La validation produit un retour visuel immédiat et un message de statut accessible.

### 10.3 Administration

L'éditeur s'intègre à la gestion existante du module et réutilise les composants source de
vérité. Le tableau de résultats réutilise `AdminDataTable` et propose :

- une recherche sur nom et prénom ;
- un filtre de groupe ;
- un filtre de session ;
- la note, le pourcentage et le détail des réponses ;
- un état vide explicite.

### 10.4 Règles visuelles

- utiliser exclusivement les tokens de `DESIGN.md` et les composants existants ;
- ne pas copier la palette ou les formes de Kahoot ;
- distinguer correct, incorrect et sélectionné par icône, libellé et couleur ;
- conserver des états de focus visibles ;
- respecter `prefers-reduced-motion` ;
- vérifier les modes clair et sombre, le mobile étroit et la projection 16:9.

## 11. Permissions, sécurité et confidentialité

- le compte personnel est obligatoire pour rejoindre ;
- seuls les enseignants autorisés et administrateurs peuvent éditer un quiz ou piloter une
  session ;
- les outils MCP de quiz utilisent les mêmes permissions privilégiées que les autres outils
  pédagogiques ;
- le serveur recalcule toujours les points et refuse les choix inconnus ;
- les réponses tardives sont refusées à partir de l'horloge serveur ;
- les bonnes réponses restent absentes des payloads étudiants avant la correction ;
- les codes de session sont aléatoires, uniques et expirent ;
- la projection n'affiche que `Prénom N.` ;
- le tableau enseignant conserve le nom complet et le groupe instantané ;
- aucune note ni réponse individuelle n'est exposée par le MCP.

## 12. Gestion des erreurs

- QR code invalide ou expiré : message explicite et retour vers les modules ;
- authentification requise : redirection avec retour automatique dans la session ;
- session non démarrée : maintien dans le lobby ;
- session terminée : affichage du score final personnel ;
- réponse trop tardive : verrouillage et message « Temps écoulé » ;
- double envoi : retour idempotent de la réponse déjà enregistrée ;
- perte SSE : reconnexion progressive et récupération de l'état courant ;
- redémarrage serveur : restauration depuis l'état persistant avant reprise du flux ;
- erreur d'enregistrement : message avec possibilité de réessayer tant que l'échéance n'est
  pas dépassée ;
- quiz invalide dans l'admin ou le MCP : erreurs localisées par question et propriété.

## 13. Stratégie de tests

### Unitaires

- barème avec et sans points négatifs ;
- crédit partiel, plancher à zéro et poids différents ;
- départage du podium par temps puis ordre alphabétique ;
- transitions de la machine à états ;
- échéances calculées par l'horloge serveur ;
- filtrage des blocs riches autorisés.

### Intégration

- unicité d'un quiz par module ;
- instantané immuable au lancement ;
- permissions admin, enseignant, étudiant et MCP ;
- unicité et idempotence des participations et réponses ;
- refus des réponses tardives ;
- absence des bonnes réponses avant `reveal` ;
- restauration après reconnexion ;
- filtres et agrégats du tableau enseignant.

### Composants et parcours

- éditeur admin et erreurs accessibles ;
- sélection multiple et validation mobile ;
- état verrouillé après envoi ;
- correction, score et podium ;
- navigation clavier de la projection ;
- parcours Playwright enseignant + étudiant depuis le QR code jusqu'au résultat final.

### Vérification visuelle

- largeur mobile de 375 px ;
- projection 16:9 ;
- modes clair et sombre ;
- zoom texte et navigation clavier ;
- mouvement réduit ;
- contraste du QR code, des états et des textes.

## 14. Critères d'acceptation

Le premier incrément est terminé lorsque :

1. un enseignant peut créer le quiz unique d'un module depuis le front ou le MCP ;
2. le contenu riche d'une question s'affiche correctement sur la projection ;
3. un étudiant authentifié rejoint par QR code et répond sur téléphone ;
4. le serveur ferme la question à l'échéance et refuse les réponses tardives ;
5. la correction, le score personnel et le podium apparaissent sans exposer le classement
   complet ;
6. la note respecte les poids, le crédit partiel et l'option de points négatifs ;
7. le tableau enseignant permet de retrouver chaque étudiant, ses réponses et sa note par
   session et groupe ;
8. une reconnexion ne perd ni la participation ni une réponse envoyée ;
9. les tests automatisés et les vérifications visuelles définis ci-dessus passent.
