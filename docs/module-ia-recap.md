# Récapitulatif du module IA

## Statut

- Module staging existant : `ia`
- Titre : `IA`
- Durée de séance retenue : `60` minutes
- Sections staging : non créées pour l'instant
- Fil rouge retenu : **Lead BDE**

Le module doit rester orienté pratique : le cours et les slides amorcent la notion, puis les étudiants manipulent rapidement en TP. Les sections de 2 séances utilisent la première séance pour introduire et démarrer, puis la deuxième séance pour approfondir en TP.

## Positionnement

Le module IA introduit l'IA générative comme outil de développement, de simulation et d'assistance à la décision dans un contexte web réaliste.

Les étudiants ont déjà un socle HTML/CSS, JavaScript, `fetch`, PHP, formulaires, MVC simple, base de données et sessions. Le module ne doit donc pas repartir de zéro côté web : il doit s'appuyer sur ces acquis pour construire une expérience IA progressive.

## Objectifs pédagogiques

À la fin du module, les étudiants doivent savoir :

- expliquer ce qu'une IA générative peut faire et ce qu'elle ne garantit pas ;
- écrire un prompt structuré avec rôle, contexte, contraintes et format attendu ;
- concevoir un skill IA simple, limité et testable ;
- intégrer une interaction IA dans une petite application web ;
- gérer un historique de conversation ;
- fournir un contexte métier à l'IA sans la laisser inventer les règles ;
- utiliser un corpus de documents comme référence ;
- distinguer réponse générée, décision métier et action contrôlée ;
- évaluer une réponse IA et détecter les dérives ;
- mettre en place des garde-fous simples.

## Fil rouge : Lead BDE

**Lead BDE** est un JDR réaliste de gestion de projet étudiant.

Le joueur incarne le lead d'une équipe de BUT Informatique chargée de réaliser une SAÉ : créer le site web du BDE en une semaine et demie.

Le projet simulé repose sur un cahier des charges fourni par l'équipe pédagogique. La stack technique est imposée :

- PHP côté serveur ;
- JavaScript vanilla côté client ;
- PostgreSQL ;
- HTML/CSS ;
- aucun framework lourd.

Les livrables attendus dans la simulation sont :

- analyse du cahier des charges ;
- rapport de conception ;
- réalisation du site ;
- rapport de fin de projet ;
- démonstration finale.

Le jeu sert de support au module IA : les étudiants ne construisent pas seulement un chatbot, ils construisent progressivement un simulateur réaliste dans lequel l'IA anime les situations, les réactions humaines, les imprévus et les arbitrages, pendant que le code garde le contrôle des règles.

## Principe du jeu

Le joueur ou les joueurs doivent gérer :

- les priorités projet ;
- les livrables ;
- les contraintes techniques ;
- les réactions de l'équipe ;
- la charge de travail ;
- les imprévus ;
- les interventions pédagogiques ;
- la cohésion humaine.

L'IA joue le maître du jeu, le client BDE, l'équipe pédagogique et certains événements. Elle ne doit pas terminer le projet magiquement.

Le moteur applicatif garde l'état réel :

- avancement ;
- bugs ;
- stress ;
- cohésion ;
- respect du cadre pédagogique ;
- satisfaction BDE ;
- risque de retard.

## Agents du fil rouge

Version solo : le joueur est lead, les autres membres sont simulés par l'IA.

Version multijoueur : chaque vrai joueur peut incarner un membre de l'équipe.

Rôles principaux :

- **Lead projet** : priorise, arbitre, coordonne, absorbe la pression.
- **Front-end JS** : gère HTML, CSS, JavaScript vanilla, DOM, `fetch`, responsive.
- **Back-end PHP** : gère PHP, formulaires, sessions, validation serveur, PostgreSQL.
- **Conception / documentation** : analyse le cahier des charges, prépare modèle de données, arborescence et rapport de conception.
- **Tests / démo** : prépare scénarios de test, repère les bugs, construit le rapport final et la démonstration.

Les agents doivent réagir de manière humaine : motivation, stress, sentiment d'être écouté, fatigue, désaccords, charge perçue.

## Mécaniques importantes

Le jeu commence positivement : l'équipe s'est choisie volontairement, l'ambiance est bonne, les membres ont envie de réussir ensemble.

Les tensions apparaissent progressivement :

- deadline ;
- charge de travail ;
- ambiguïtés du cahier des charges ;
- désaccords de méthode ;
- problèmes techniques ;
- fatigue ;
- petits problèmes personnels ;
- intervention du BDE ou de l'équipe pédagogique.

Une mécanique de hasard peut être utilisée :

- `d20` pour résoudre une action incertaine ;
- `1d6` pour tirer un événement aléatoire.

Exemples d'événements :

- bug PostgreSQL ;
- mauvaise estimation ;
- tension d'équipe ;
- problème de pote ou de couple ;
- demande bonus du BDE ;
- recadrage pédagogique.

Le recadrage pédagogique permet de ramener le jeu dans les objectifs si les joueurs partent hors cadre :

- technologie interdite ;
- oubli du rapport de conception ;
- absence de tests ;
- trop de bonus ;
- fonctionnalité obligatoire ignorée ;
- usage de l'IA pour remplacer tout le travail ;
- management brutal ou injuste.

## Découpage proposé

Total : **8 sections / 12 séances de 1h**

### 1. Comprendre l'IA générative côté développeur

- Durée : 1 séance
- Contenus : cours, TP, slide
- Objectif : comprendre ce que l'IA peut générer, expliquer, transformer ou simuler.
- Notions : modèle, prompt, contexte, tokens, hallucinations, vérification.
- TP : tester des scènes simples de Lead BDE et identifier les incohérences.
- Fil rouge : première scène de simulation, sans état complexe.

### 2. Prompting structuré et réponses vérifiables

- Durée : 2 séances
- Contenus : cours, TP, slide
- Objectif : transformer une demande vague en prompt contrôlé.
- Notions : rôle, tâche, contexte, contraintes, format de sortie, critères de réussite.
- TP séance 1 : cadrer le maître du jeu Lead BDE.
- TP séance 2 : imposer une sortie structurée avec situation, réactions, état et choix.
- Fil rouge : le simulateur produit des tours plus stables et exploitables.

### 3. Présentation et conception de skills IA

- Durée : 2 séances
- Contenus : cours, TP, slide
- Objectif : comprendre et créer un skill IA.
- Notions : déclencheur, périmètre, règles, contraintes, exemples, critères de validation.
- TP séance 1 : analyser un skill existant.
- TP séance 2 : concevoir un skill `maitre-jeu-lead-bde` ou `agent-equipe-sae`.
- Fil rouge : les comportements des agents deviennent réutilisables et mieux cadrés.

### 4. Appeler une IA depuis une application web

- Durée : 1 séance
- Contenus : cours, TP, slide
- Objectif : connecter une interface web à une réponse IA.
- Notions : endpoint serveur, requête, payload, réponse JSON, état de chargement, erreurs.
- TP : créer une interface simple où le joueur envoie une action et reçoit la suite de la scène.
- Fil rouge : Lead BDE devient une mini-application interactive.

### 5. Assistant conversationnel et agents d'équipe

- Durée : 2 séances
- Contenus : cours, TP, slide
- Objectif : gérer l'historique et les réactions de plusieurs agents.
- Notions : messages système, historique, rôles, mémoire courte, cohérence de conversation.
- TP séance 1 : garder l'historique des tours.
- TP séance 2 : faire réagir plusieurs membres d'équipe selon leur profil.
- Fil rouge : l'équipe simulée réagit aux décisions du joueur.

### 6. Contexte métier et règles pédagogiques

- Durée : 1 séance
- Contenus : cours, TP, slide
- Objectif : donner à l'IA des règles de projet sans la laisser inventer le cadre.
- Notions : cahier des charges, stack imposée, livrables, règles d'évaluation, recadrage.
- TP : injecter les règles de la SAÉ et vérifier que l'IA respecte PHP / JS vanilla / PostgreSQL.
- Fil rouge : le jeu peut faire intervenir l'équipe pédagogique pour clarifier ou recadrer.

### 7. Recherche documentaire et RAG simplifié

- Durée : 2 séances
- Contenus : cours, TP, slide
- Objectif : faire répondre l'IA à partir de documents de référence.
- Notions : corpus, découpage, recherche de passages, contexte injecté, réponse sourcée.
- TP séance 1 : préparer un corpus avec cahier des charges, grille d'évaluation et règles.
- TP séance 2 : faire consulter ces documents avant de répondre au joueur.
- Fil rouge : Lead BDE peut vérifier si une décision respecte le cahier des charges.

### 8. Outils, hasard, sécurité et mini-projet

- Durée : 1 séance
- Contenus : cours, TP, slide, examen
- Objectif : finaliser un prototype jouable et contrôlé.
- Notions : outils, action contrôlée, jets de dés, validation, prompt injection, limites.
- TP / évaluation : intégrer un ou plusieurs outils simples.
- Exemples d'outils :
  - lancer un `d20` ;
  - tirer un événement `1d6` ;
  - mettre à jour les indicateurs ;
  - vérifier une action hors cadre ;
  - générer un bilan de demi-journée.
- Fil rouge : mini-démo finale de Lead BDE.

## Types de contenus à créer sur staging

Pour chaque section :

- `cours`
- `TP`
- `slide`

Pour la dernière section :

- `examen` en plus

## Proposition de métadonnées module

- `title` : `IA`
- `path` : `ia`
- `iconName` : `BrainCircuit`
- `sessionDurationMinutes` : `60`
- `description` : `IA générative appliquée au développement web : prompting, skills, agents, contexte métier, RAG simplifié et intégration dans une application web à travers un JDR réaliste de gestion de SAÉ.`

## Points à valider avant création des sections

- Nom définitif du fil rouge : `Lead BDE`, `Sprint BDE`, `SAÉ Lead` ou autre.
- Nombre exact de séances : proposition actuelle à 12 séances.
- Place de l'examen : dernière section intégrée ou section dédiée.
- Niveau de détail attendu dans la partie skills.
- Format final attendu : prototype jouable, prompt complet, skill complet, ou application web minimale.

## Prochaine action possible

Après validation, créer sur staging :

1. éditer le module `ia` avec `sessionDurationMinutes: 60` et la description finale ;
2. créer les 8 sections ;
3. ajouter les types `cours`, `TP`, `slide` partout ;
4. ajouter `examen` sur la dernière section.
