# Spec — Skill local `/pedagogy`

| Champ     | Valeur                              |
|-----------|-------------------------------------|
| Date      | 16 mai 2026                         |
| Périmètre | Skill Claude Code local au projet   |
| Approche  | C — Skill principal + références par type |

---

## Objectif

Créer un skill local `/pedagogy` pour assister la rédaction et la révision des contenus pédagogiques du site de cours IUT BUT Informatique. Le skill couvre tous les types de contenu (Cours, TP, Slide, Examen) avec des règles différenciées par type, et propose deux modes distincts : écriture et révision.

---

## Architecture

```
.claude/skills/pedagogy/
  SKILL.md                  — orchestration, principes communs, dispatch
  reference/
    cours.md                — règles pour les cours théoriques
    tp.md                   — règles pour les TPs
    slide.md                — règles pour les slides
    examen.md               — règles pour les examens
```

---

## Invocation

| Commande                    | Comportement                                              |
|-----------------------------|-----------------------------------------------------------|
| `/pedagogy`                 | Mode auto : un fichier `src/cours/` est mentionné ou ouvert → révision ; sinon → écriture |
| `/pedagogy write`           | Force le mode écriture (demande le type si non précisé)  |
| `/pedagogy write tp`        | Mode écriture, type TP directement                       |
| `/pedagogy review`          | Force la révision du contenu actif                       |

---

## Principes communs (dans `SKILL.md`)

- **Public cible** : étudiants BUT Informatique 1ère et 2ème année, niveau débutant à intermédiaire en développement web
- **Langue** : français, vouvoyé strict dans toutes les instructions
- **Ton** : précis, bienveillant, sans condescendance
- **Exemples** : toujours concrets et ancrés dans un cas réel (pas de `foo`/`bar`)
- **Structure JSX** : utiliser exclusivement les composants du projet (`Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`, `CodeWithPreviewCard`, `ImageCard`, `DiagramCard`). Jamais de balises HTML brutes (`<p>`, `<ul>`, `<li>`, `<h2>`, `<code>`).

---

## Règles par type de contenu

### `cours.md` — Théorie

Structure imposée pour chaque concept :
1. **Contexte** — pourquoi ce concept existe, quel problème il résout
2. **Définition** — concept expliqué avec ses propres mots, sans jargon préalable
3. **Exemple minimal** — le cas le plus simple possible (`CodeCard`)
4. **Exemple complet** — cas réaliste avec `CodeCard` ou `CodeWithPreviewCard`
5. **Pièges courants** — erreurs fréquentes et comment les éviter

Règles supplémentaires :
- Chaque terme technique défini avant utilisation
- Progression linéaire : chaque section part de ce que l'étudiant sait déjà
- Pas de code brut — toujours dans un composant `CodeCard`

### `tp.md` — Exercices pratiques

**Schéma récurrent : définir → utiliser**
- **Étape 1 — Définir** : l'étudiant écrit la fonction ou la classe. La signature est imposée (nom, paramètres, type de retour attendu), pas le corps.
- **Étape 2 — Utiliser** : l'étudiant appelle ce qu'il vient de créer dans un contexte réel imposé (quel fichier, quel résultat observable). L'appel exact n'est pas donné.

**Niveau de guidage progressif :**
- Exercices 1–2 : **guidage fort** — fichier cible précisé, méthode/API imposée, résultat attendu décrit, critère de validation explicite. Étapes à l'impératif vouvoyé (`Créez`, `Ajoutez`, `Vérifiez`).
- Exercice 3+ : **guidage léger** — objectif fonctionnel + contraintes techniques uniquement. L'étudiant détermine les étapes lui-même.

Règles absolues :
- Jamais de code solution dans le TP
- Jamais d'infinitif (`Créer le fichier`) ni de futur (`Vous créerez`)
- Chaque exercice testable de manière autonome (pas de dépendance exercice N → exercice N+1)

**Projet cumulatif (PHP — Netflex) :**
Certains modules PHP sont construits sur un projet fil rouge (`Netflex`) qui évolue d'un TP à l'autre. Dans ce cas :
- Avant d'écrire ou de réviser un TP PHP, le skill **lit les TPs précédents** (`src/cours/php/`) pour établir l'état courant du projet (fichiers existants, classes/fonctions déjà définies, structure en place)
- Les exercices du TP en cours s'appuient sur cet état sans le répéter ni le contredire
- Le skill signale explicitement les prérequis Netflex en tête du TP : "À ce stade, votre projet contient…"
- En mode révision, le sous-agent `pedagogue` vérifie la cohérence avec les TPs précédents ; le sous-agent `student` signale si un exercice suppose du code jamais vu

### `slide.md` — Présentations

- 1 concept par slide, 5 lignes de texte maximum
- Titres en forme d'action ("Comment X fonctionne" plutôt que "X")
- Tout code commenté ligne par ligne
- Transition logique explicite entre chaque slide
- Pas de slide "fourre-tout"

### `examen.md` — Mini-projet

- Format **mini-projet** : un énoncé global avec un objectif fonctionnel clair
- Décomposé en **livrables** attendus (pas en questions indépendantes)
- Critères d'évaluation portant sur l'ensemble : fonctionnement, qualité du code, respect des contraintes
- Aucun livrable ne dépend d'un autre livrable non réalisé
- Aucune contrainte sur un concept non vu en cours

---

## Mode écriture

1. Si le type de contenu n'est pas précisé, le skill demande : Cours / TP / Slide / Examen ?
2. Il charge le fichier de référence correspondant
3. Il pose 1–2 questions de contexte si nécessaires (sujet, prérequis, durée estimée)
4. Il génère le contenu directement dans la structure JSX du projet
5. Pour les TP : applique systématiquement le schéma définir→utiliser avec guidage progressif

---

## Mode révision — 2 sous-agents en parallèle

Le mode révision dispatche toujours **2 sous-agents simultanément** :

### Sous-agent 1 : `pedagogue`

Persona : expert en pédagogie qui audite la qualité structurelle du contenu.

Critères analysés :
- **Progression** : les concepts sont-ils introduits dans le bon ordre ?
- **Guidage** : le niveau d'aide est-il adapté au type de contenu et à la position dans la séquence ?
- **Complétude** : y a-t-il des sauts logiques, des concepts supposés connus sans introduction ?
- **Structure JSX** : balises brutes, composants manquants, ordre de sections incorrect
- **Conventions** : vouvoyé, impératif, apostrophes échappées

Format de rapport :
```
## Rapport pédagogue

### Clarté et progression
- [ligne/section] Problème : ... → Suggestion : ...

### Guidage
- [ligne/section] Problème : ... → Suggestion : ...

### Structure JSX
- [ligne/section] Problème : ... → Suggestion : ...
```

### Sous-agent 2 : `student`

Persona : étudiant BUT Informatique en difficulté, lit le contenu pour la première fois.

Ce qu'il signale :
- "Je ne comprends pas ce mot / cette notion"
- "Je ne vois pas pourquoi on fait ça"
- "Je serais bloqué ici — je ne sais pas par où commencer"
- "Cet exercice demande quelque chose qui n'a pas été expliqué avant"
- "Je pourrais faire ceci différemment et penser que c'est correct"

Format de rapport :
```
## Rapport étudiant

- [ligne/section] "..." — Ce passage me bloque parce que...
- [ligne/section] "..." — Je ne comprends pas pourquoi...
```

### Consolidation

Les deux rapports sont présentés côte à côte. Après la consolidation, le skill propose :
> "Souhaitez-vous que je réécrive les passages ciblés ?"

Si oui, il réécrit uniquement les passages identifiés, en expliquant chaque changement.

---

## Fichiers à créer

| Fichier                                  | Rôle                                      |
|------------------------------------------|-------------------------------------------|
| `.claude/skills/pedagogy/SKILL.md`       | Point d'entrée, principes communs, dispatch |
| `.claude/skills/pedagogy/reference/cours.md`   | Règles Cours                        |
| `.claude/skills/pedagogy/reference/tp.md`      | Règles TP                           |
| `.claude/skills/pedagogy/reference/slide.md`   | Règles Slide                        |
| `.claude/skills/pedagogy/reference/examen.md`  | Règles Examen                       |
