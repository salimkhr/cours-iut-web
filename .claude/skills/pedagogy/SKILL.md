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

Prompt à utiliser :

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
Chercher : balises HTML brutes, composants manquants, non-respect du vouvoyé,
infinitifs dans les consignes de TP, apostrophes non échappées.

Public cible : étudiants BUT Informatique débutants à intermédiaires.
Si aucun problème dans une section, écrire "RAS".

### Sous-agent 2 — Étudiant en difficulté

Prompt à utiliser :

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

### Consolidation

Présenter les deux rapports l'un après l'autre, clairement séparés.
Puis proposer : **"Souhaitez-vous que je réécrive les passages ciblés ?"**
Si oui, réécrire uniquement les passages identifiés en expliquant chaque changement.