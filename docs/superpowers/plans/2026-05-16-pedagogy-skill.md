# Pedagogy Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer le skill local `/pedagogy` — 5 fichiers Markdown dans `.claude/skills/pedagogy/` — qui assiste la rédaction et la révision des contenus pédagogiques du site IUT BUT Informatique.

**Architecture:** Un `SKILL.md` principal orchestre la détection de mode (écriture / révision) et charge dynamiquement le fichier de référence du type de contenu concerné (cours, tp, slide, examen). Le mode révision dispatche 2 sous-agents en parallèle (pédagogue + étudiant en difficulté).

**Tech Stack:** Markdown uniquement — aucun code, aucune dépendance. Pas de tests automatisés ; la vérification est manuelle (invocation du skill).

---

## Fichiers

| Fichier | Action |
|---|---|
| `.claude/skills/pedagogy/SKILL.md` | Créer |
| `.claude/skills/pedagogy/reference/cours.md` | Créer |
| `.claude/skills/pedagogy/reference/tp.md` | Créer |
| `.claude/skills/pedagogy/reference/slide.md` | Créer |
| `.claude/skills/pedagogy/reference/examen.md` | Créer |

---

## Task 1 : Créer `SKILL.md` — orchestrateur principal

**Files:**
- Create: `.claude/skills/pedagogy/SKILL.md`

- [ ] **Step 1 : Créer le fichier**

Créer `.claude/skills/pedagogy/SKILL.md` avec ce contenu exact :

```markdown
---
name: pedagogy
description: Aide à la rédaction et à la révision des contenus pédagogiques (Cours, TP, Slide, Examen) pour le site de cours IUT BUT Informatique. Modes écriture et révision avec double perspective pédagogue/étudiant.
---

# Skill Pédagogie IUT

## Déclenchement et détection de mode

**Mode automatique :**
- Un fichier `src/cours/` est mentionné ou ouvert dans la conversation → **mode révision**
- Aucun fichier de cours dans le contexte → **mode écriture**

**Forçage via arguments :**
- `/pedagogy write` → mode écriture (demander le type si non précisé)
- `/pedagogy write cours` / `tp` / `slide` / `examen` → mode écriture, type direct
- `/pedagogy review` → mode révision sur le contenu actif

---

## Principes communs — appliqués dans tous les modes

- **Public cible** : étudiants BUT Informatique 1ère/2ème année, débutants à intermédiaires en développement web
- **Langue** : français, **vouvoyé strict** dans toutes les instructions destinées aux étudiants
- **Ton** : précis, bienveillant, sans condescendance — expliquer le POURQUOI avant le COMMENT
- **Exemples** : toujours concrets et ancrés dans un cas réel. Jamais de `foo`, `bar`, `test1`, `exemple`
- **Composants JSX imposés** : `Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`, `CodeWithPreviewCard`, `ImageCard`, `DiagramCard`. **Jamais** de `<p>`, `<ul>`, `<li>`, `<h2>`, `<code>` bruts.
- **Apostrophes en JSX** : toujours échappées (`&apos;` ou `&rsquo;`). Guillemets : `&quot;`.
- **Structure de page** : `<article><section>` avec préfixes `A-`, `B-`, `C-` sur `<Heading level={2}>` et `1.`, `2.`, `3.` sur `<Heading level={3}>`

---

## Mode écriture

1. Si le type de contenu n'est pas précisé, demander : **Cours / TP / Slide / Examen ?**
2. Lire le fichier de référence correspondant avec l'outil Read :
   - Cours → `.claude/skills/pedagogy/reference/cours.md`
   - TP → `.claude/skills/pedagogy/reference/tp.md`
   - Slide → `.claude/skills/pedagogy/reference/slide.md`
   - Examen → `.claude/skills/pedagogy/reference/examen.md`
3. Poser **1–2 questions de contexte** avant de générer (sujet traité, cours précédent si type Cours, prérequis supposés)
4. Générer le contenu directement dans la structure JSX du projet en suivant scrupuleusement les règles du fichier de référence

---

## Mode révision — 2 sous-agents en parallèle

Dispatcher **2 sous-agents simultanément** via l'outil Agent (même message, deux appels Agent indépendants).

### Sous-agent 1 — Pédagogue expert

```
Tu es un expert en pédagogie universitaire spécialisé en informatique. Lis le contenu
fourni et produis un rapport structuré en 3 sections :

## Rapport pédagogue

### Clarté et progression
Pour chaque problème : [section ou ligne] Problème : ... → Suggestion : ...
Chercher : concepts introduits dans le désordre, jargon non défini, sauts logiques,
termes utilisés avant d'être expliqués.

### Guidage
Pour chaque problème : [section ou ligne] Problème : ... → Suggestion : ...
Chercher : exercices qui donnent la réponse directement, exercices sans ancrage
(l'étudiant ne sait pas par où commencer), niveau d'aide inadapté à la position
dans la séquence pédagogique.

### Structure JSX et conventions
Pour chaque problème : [section ou ligne] Problème : ... → Suggestion : ...
Chercher : balises HTML brutes (<p>, <ul>, <li>, <code>), composants manquants,
non-respect du vouvoyé, infinitifs dans les consignes de TP, apostrophes non échappées.

Public cible : étudiants BUT Informatique débutants à intermédiaires.
Si aucun problème dans une section, écrire "RAS".
```

### Sous-agent 2 — Étudiant en difficulté

```
Tu es un étudiant BUT Informatique en difficulté qui lit ce contenu pour la première
fois. Tu n'as pas de connaissances préalables en dehors de ce qui a été explicitement
enseigné avant.

Lis le contenu ligne par ligne et signale tout ce qui te bloquerait ou te perdrait.

## Rapport étudiant

Pour chaque problème, format :
- [section/ligne] Citation courte du passage — "Ce passage me bloque parce que..." ou
  "Je ne comprends pas pourquoi..." ou "Je serais bloqué ici parce que..." ou
  "Cet exercice suppose que je sache X, mais X n'a pas été expliqué."

Signaler notamment :
- Mots ou notions utilisés sans définition
- Explications qui supposent un contexte non fourni
- Exercices dont tu ne sais pas par où commencer
- Étapes qui manquent entre deux consignes
- Endroits où tu pourrais faire quelque chose d'incorrect en pensant avoir raison

Si tout est clair, écrire "Contenu accessible — aucun blocage identifié."
```

### Consolidation

Présenter les deux rapports l'un après l'autre, clairement séparés.
Puis proposer : **"Souhaitez-vous que je réécrive les passages ciblés ?"**
Si oui, réécrire uniquement les passages identifiés en expliquant chaque changement.
```

- [ ] **Step 2 : Vérifier la structure**

Vérifier que le fichier contient bien les 4 sections principales :
- `## Déclenchement et détection de mode`
- `## Principes communs`
- `## Mode écriture`
- `## Mode révision`

- [ ] **Step 3 : Commit**

```bash
git add .claude/skills/pedagogy/SKILL.md
git commit -m "feat(skill): add pedagogy skill orchestrator"
```

---

## Task 2 : Créer `reference/cours.md`

**Files:**
- Create: `.claude/skills/pedagogy/reference/cours.md`

- [ ] **Step 1 : Créer le fichier**

```markdown
# Règles pédagogiques — Type : Cours

## Chapeau obligatoire "À savoir pour ce cours"

**Toujours présent en tête de cours, avant tout contenu.**

- Composant : `Collapsible` de shadcn/ui (`@/components/ui/collapsible`), collapsed par défaut
- Titre affiché sur le trigger : "À savoir pour ce cours"
- Style distinct du contenu : fond `bg-bridge-100/60 dark:bg-bridge-800/40`, bordure, icône ChevronDown
- Contenu : **3 à 5 notions** du ou des cours précédents
- Chaque notion = une phrase de rappel + un micro-exemple de code
  - ≤ 2 lignes de code → `<Code language="...">` inline
  - > 2 lignes → `<CodeCard language="..." title="...">` complet
- Maximum 10 lignes de code au total dans ce bloc
- **En mode écriture** : demander quel cours précède avant de générer ce bloc

Exemple de structure JSX du chapeau :
```tsx
<Collapsible className="mb-8 rounded-xl border border-bridge-300/50 bg-bridge-100/60 dark:bg-bridge-800/40 dark:border-bridge-600/40">
    <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 font-semibold text-brand-dark dark:text-brand-light">
        À savoir pour ce cours
        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180"/>
    </CollapsibleTrigger>
    <CollapsibleContent className="px-5 pb-5 flex flex-col gap-3">
        <Text><strong>Les boucles for</strong> répètent un bloc un nombre défini de fois.</Text>
        <Code language="js">for (let i = 0; i &lt; 3; i++) console.log(i);</Code>
        <Text><strong>Les tableaux</strong> stockent plusieurs valeurs dans une seule variable.</Text>
        <Code language="js">const fruits = [&apos;pomme&apos;, &apos;poire&apos;];</Code>
    </CollapsibleContent>
</Collapsible>
```

## Structure imposée pour chaque concept

Chaque concept du cours doit suivre cet ordre :

1. **Contexte** — pourquoi ce concept existe, quel problème concret il résout (1 `<Text>`)
2. **Définition** — explication en langage naturel, sans jargon préalable (1 `<Text>`)
3. **Exemple minimal** — le cas le plus simple possible (`<CodeCard>`)
4. **Exemple complet** — cas réaliste et utile (`<CodeCard>` ou `<CodeWithPreviewCard>`)
5. **Pièges courants** — 2 à 3 erreurs fréquentes avec explication (`<List>` non ordonnée)

## Règles supplémentaires

- Chaque terme technique **défini avant sa première utilisation**, jamais l'inverse
- Progression linéaire : chaque section repart de ce que l'étudiant vient d'apprendre
- Jamais de code brut dans le texte — toujours dans `<Code>` (inline) ou `<CodeCard>`
- Les `<CodeCard>` ont toujours un `title` descriptif ("Syntaxe de base", "Exemple complet", etc.)
- Un seul grand thème par `<section>`, préfixé `A-`, `B-`, `C-` sur le `<Heading level={2}>`
```

- [ ] **Step 2 : Commit**

```bash
git add .claude/skills/pedagogy/reference/cours.md
git commit -m "feat(skill): add cours reference rules for pedagogy skill"
```

---

## Task 3 : Créer `reference/tp.md`

**Files:**
- Create: `.claude/skills/pedagogy/reference/tp.md`

- [ ] **Step 1 : Créer le fichier**

```markdown
# Règles pédagogiques — Type : TP

## Schéma obligatoire : Définir → Utiliser

Chaque exercice suit **toujours** ce schéma en deux temps :

### Étape 1 — Définir
L'étudiant crée la fonction, la classe ou le module. Imposer :
- Le **nom exact** de la fonction/classe
- Les **paramètres** et leur type attendu (en commentaire ou en description)
- Le **type de retour** attendu
- **Ne jamais donner le corps** de la fonction

### Étape 2 — Utiliser
L'étudiant appelle ce qu'il vient de créer dans un contexte réel. Imposer :
- Le **fichier cible** où l'appel doit se faire
- Le **résultat observable** attendu (affichage console, rendu visuel, valeur retournée)
- **Ne jamais donner l'appel exact**

## Niveau de guidage progressif

### Exercices 1–2 : guidage fort

- Fichier cible précisé explicitement
- Méthode ou API à utiliser imposée
- Résultat attendu décrit avec précision
- Critère de validation explicite ("Vous devriez voir X dans la console / dans le navigateur")
- Chaque action formulée à l'**impératif vouvoyé** :
  `Créez`, `Ajoutez`, `Modifiez`, `Vérifiez`, `Ouvrez`, `Utilisez`, `Affichez`
- **Jamais d'infinitif** ("Créer le fichier...") ni de futur ("Vous créerez...")

### Exercices 3 et suivants : guidage léger

- Objectif fonctionnel uniquement ("Faites en sorte que...")
- Contraintes techniques listées (ex: "sans utiliser de boucle `for`", "en utilisant la méthode `reduce`")
- L'étudiant détermine lui-même les étapes
- Pas de numérotation des étapes — juste l'objectif et les contraintes

## Règles absolues

- **Jamais de code solution** dans le TP, même partiel
- **Chaque exercice testable de manière autonome** — pas de dépendance exercice N → N+1
- Chaque exercice guidé (1–2) doit toujours avoir : fichier cible + méthode/API + résultat attendu + critère de validation

## Projet cumulatif PHP — Netflex

Pour tout TP PHP appartenant au projet fil rouge Netflex :

1. **Avant d'écrire ou de réviser**, lire les fichiers TP des sessions précédentes dans
   `src/cours/php/` pour établir l'état courant du projet :
   - Fichiers existants dans le projet étudiant
   - Classes et fonctions déjà définies
   - Structure de base de données en place
   - Fonctionnalités déjà implémentées

2. **En tête du TP**, inclure un bloc récapitulatif :
   ```
   À ce stade, votre projet Netflex contient :
   - `index.php` — point d'entrée principal
   - `Movie.php` — classe Movie avec les propriétés id, title, year
   - `database.php` — connexion PDO à la base de données
   ```

3. Les exercices s'appuient sur cet état **sans répéter** ce qui existe déjà ni le **contredire**

4. **En mode révision** :
   - Sous-agent pédagogue : vérifie la cohérence avec les TPs précédents (rien ne suppose du code
     non encore introduit)
   - Sous-agent étudiant : signale si un exercice suppose du code qu'il n'a jamais écrit
```

- [ ] **Step 2 : Commit**

```bash
git add .claude/skills/pedagogy/reference/tp.md
git commit -m "feat(skill): add TP reference rules with Netflex handling for pedagogy skill"
```

---

## Task 4 : Créer `reference/slide.md`

**Files:**
- Create: `.claude/skills/pedagogy/reference/slide.md`

- [ ] **Step 1 : Créer le fichier**

```markdown
# Règles pédagogiques — Type : Slide

## Structure d'un slide

- **1 concept par slide** — jamais deux idées distinctes sur la même slide
- **5 lignes de texte maximum** (hors titre et code)
- **Titre en forme d'action** : "Comment X fonctionne" ou "Pourquoi utiliser X" plutôt que simplement "X"
- Formulations courtes : phrases nominales ou infinitives, pas de phrases complètes

## Code dans les slides

- Tout code dans un `<CodeCard>`, jamais brut
- Chaque ligne de code **commentée** si la slide a pour but d'expliquer le code
- Exemples courts : préférer 3 lignes éloquentes à 10 lignes compréhensibles seulement par des experts

## Transitions et enchaînement

- Chaque slide **prépare logiquement** la suivante : la conclusion d'une slide doit ouvrir la question que la suivante résout
- Pas de slide "fourre-tout" : si une slide liste plus de 3 éléments sans lien pédagogique fort, la découper
- La première slide d'une section annonce ce que l'étudiant saura faire à la fin

## Vérification en mode révision

- Signaler toute slide avec plus d'un concept principal
- Signaler les titres purement descriptifs (ex : "Les boucles") → suggérer un titre action
- Signaler les transitions abruptes entre slides (concept A puis concept B sans pont)
```

- [ ] **Step 2 : Commit**

```bash
git add .claude/skills/pedagogy/reference/slide.md
git commit -m "feat(skill): add slide reference rules for pedagogy skill"
```

---

## Task 5 : Créer `reference/examen.md`

**Files:**
- Create: `.claude/skills/pedagogy/reference/examen.md`

- [ ] **Step 1 : Créer le fichier**

```markdown
# Règles pédagogiques — Type : Examen (Mini-projet)

## Format général

L'examen est un **mini-projet** avec un objectif fonctionnel clair et réaliste.
Exemples d'objectifs : "Construire un gestionnaire de films", "Créer une calculatrice de notes".

Pas de questions indépendantes — l'étudiant reçoit un énoncé de projet et doit le réaliser.

## Structure de l'énoncé

1. **Contexte** (1 paragraphe) — la mise en situation du mini-projet, pourquoi il existe
2. **Livrables attendus** — liste numérotée de ce qui doit fonctionner à la fin
3. **Contraintes techniques** — liste des contraintes imposées (technologies, patterns, interdictions)
4. **Critères d'évaluation** — ce sur quoi l'étudiant sera noté

## Règles sur les livrables

- Chaque livrable décrit **ce qui doit fonctionner**, pas comment le faire
- Les livrables sont **indépendants** : un étudiant qui ne réalise pas le livrable 2 peut quand même
  réaliser le livrable 3
- Barème : global ou par livrable — jamais par ligne de code ou par fichier

## Règles absolues

- **Aucune contrainte technique sur un concept non vu en cours**
- **Aucun piège** : les cas limites testés doivent avoir été explicitement couverts dans les cours/TPs
- Le contexte doit donner suffisamment d'informations pour que l'étudiant comprenne ce qu'il construit
  sans ambiguïté

## Vérification en mode révision

- Vérifier que chaque contrainte technique correspond à un concept enseigné
- Vérifier que les livrables sont bien indépendants
- Signaler tout livrable qui suppose implicitement la réussite d'un autre
- Signaler tout jargon dans l'énoncé qui n'a pas été défini dans les cours
```

- [ ] **Step 2 : Commit**

```bash
git add .claude/skills/pedagogy/reference/examen.md
git commit -m "feat(skill): add examen reference rules for pedagogy skill"
```

---

## Task 6 : Vérification finale

- [ ] **Step 1 : Vérifier la structure complète**

```bash
find .claude/skills/pedagogy -type f | sort
```

Résultat attendu :
```
.claude/skills/pedagogy/SKILL.md
.claude/skills/pedagogy/reference/cours.md
.claude/skills/pedagogy/reference/examen.md
.claude/skills/pedagogy/reference/slide.md
.claude/skills/pedagogy/reference/tp.md
```

- [ ] **Step 2 : Vérifier le frontmatter de SKILL.md**

Ouvrir `.claude/skills/pedagogy/SKILL.md` et confirmer que les deux premières lignes sont :
```
---
name: pedagogy
```

- [ ] **Step 3 : Test manuel du mode écriture**

Dans Claude Code, taper `/pedagogy write tp`. Vérifier que le skill :
1. Demande le sujet / contexte
2. Génère un TP avec le schéma définir→utiliser
3. Respecte l'impératif vouvoyé sur les premiers exercices

- [ ] **Step 4 : Test manuel du mode révision**

Ouvrir un fichier de cours existant, taper `/pedagogy review`. Vérifier que le skill :
1. Dispatche 2 sous-agents
2. Produit un rapport pédagogue + un rapport étudiant
3. Propose de réécrire les passages ciblés

- [ ] **Step 5 : Commit final**

```bash
git add .
git commit -m "chore(skill): verify pedagogy skill structure complete"
```
