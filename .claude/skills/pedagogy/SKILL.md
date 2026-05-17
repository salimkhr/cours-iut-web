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
- **Composants JSX imposés** : `Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`, `CodeWithPreviewCard`, `ImageCard`, `DiagramCard`, `SectionCard`. **Jamais** de `<p>`, `<ul>`, `<li>`, `<h2>`, `<code>` bruts.
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

### Étape 0 — Collecte du dossier (obligatoire avant tout dispatch)

Avant de dispatcher les sous-agents, **lire tous les fichiers du dossier cible** :

1. Identifier le dossier (ex. `src/cours/javascript/1-le-dom/`)
2. Lire **chaque fichier présent** avec l'outil Read : `Cours.tsx`, `Slide.tsx`, `TP.tsx`, `Examen.tsx`
3. Passer **l'intégralité du contenu de chaque fichier** aux sous-agents, clairement séparé par fichier
4. **Identifier le module N-1** :
   - Extraire le préfixe numérique entier du dossier cible (tous les chiffres consécutifs
     en tête de nom, ex. `11-twig` → préfixe `11`)
     (ex. `src/cours/javascript/2-les-evenements/` → préfixe `2`)
   - Utiliser Glob sur le répertoire matière pour trouver un dossier dont le nom
     commence par `{N-1}-` (ex. pour N=2, pattern `1-*` dans `src/cours/javascript/`)
   - **Si N = 1** : définir `MODULE_PRECEDENT = null`
   - **Si dossier N-1 trouvé** : lire chaque fichier présent (Cours.tsx, Slide.tsx,
     TP.tsx) avec l'outil Read ; stocker sous `CONTENU_N1_COURS`,
     `CONTENU_N1_SLIDE`, `CONTENU_N1_TP`. Fichiers absents = chaîne vide.
     (`CONTENU_N1_EXAMEN` n'est pas lu — non utilisé par le Sous-agent 3)
     Stocker le chemin absolu du dossier sous `MODULE_PRECEDENT`.
     Stocker le nom du dossier (ex. `1-le-dom`) sous `NOM_N1`.
   - **Si N > 1 mais dossier N-1 introuvable** : définir `MODULE_PRECEDENT = null`,
     stocker ce message dans `MODULE_PRECEDENT_ERREUR` : "Module N-1 introuvable — vérification inter-modules ignorée." (la Consolidation l'injectera à la place du rapport du Sous-agent 3)

Tous les fichiers sont **simultanément en révision** : Cours.tsx, TP.tsx, Slide.tsx sont tous évalués,
pas seulement l'un d'eux. Les sous-agents analysent chaque fichier individuellement **et** la cohérence
entre eux.

---

Dispatcher les sous-agents simultanément via l'outil Agent (même message, appels indépendants) :
- **Toujours** : Sous-agent 1 (Pédagogue) + Sous-agent 2 (Étudiant en difficulté)
- **Si `MODULE_PRECEDENT` n'est pas null** : ajouter Sous-agent 3 (Cohérence inter-modules)
- **Si `MODULE_PRECEDENT` est null** : ne pas dispatcher le Sous-agent 3

### Sous-agent 1 — Pédagogue expert

Prompt à utiliser (injecter `[CONTENU_COURS]`, `[CONTENU_SLIDE]`, `[CONTENU_TP]`) :

Tu es un expert en pédagogie universitaire spécialisé en informatique.

Tu reçois tous les fichiers d'un même module de cours. Analyse-les tous et produis un
rapport en 4 sections.

**Cours.tsx** :
[CONTENU_COURS]

**Slide.tsx** :
[CONTENU_SLIDE]

**TP.tsx** :
[CONTENU_TP]

## Rapport pédagogue

### Clarté et progression (Cours.tsx + Slide.tsx)
Pour chaque problème : [fichier / section] Problème : ... → Suggestion : ...
Chercher dans le Cours et les Slides : concepts introduits dans le désordre, jargon
non défini, sauts logiques, termes utilisés avant d'être expliqués.

### Guidage (TP.tsx)
Pour chaque problème : [section ou exercice] Problème : ... → Suggestion : ...
Chercher : exercices qui donnent la réponse directement, exercices sans ancrage,
absence de critère de validation, guidage inadapté à la position dans la séquence.

### Cohérence Cours → TP
Pour chaque problème : [Cours / TP] Problème : ... → Suggestion : ...
Chercher : concepts utilisés dans le TP mais absents du Cours, concepts enseignés dans
le Cours mais jamais mis en pratique dans le TP, nuances du Cours non reprises dans
le TP alors qu'elles éviteraient des erreurs fréquentes.

### Structure JSX et conventions (tous fichiers)
Pour chaque problème : [fichier / ligne] Problème : ... → Suggestion : ...
Chercher : balises HTML brutes, composants manquants, non-respect du vouvoyé,
infinitifs dans les consignes de TP, apostrophes non échappées.

Public cible : étudiants BUT Informatique débutants à intermédiaires.
Si aucun problème dans une section, écrire "RAS".

### Sous-agent 2 — Étudiant en difficulté

Prompt à utiliser (injecter `[CONTENU_COURS]`, `[CONTENU_SLIDE]`, `[CONTENU_TP]`) :

Tu es un étudiant BUT Informatique en difficulté. Tu lis les contenus dans l'ordre
où tu les recevrais : d'abord le Cours, puis les Slides, puis le TP.

**Cours.tsx** (tu lis ça en premier) :
[CONTENU_COURS]

**Slide.tsx** (tu lis ça ensuite, en cours) :
[CONTENU_SLIDE]

**TP.tsx** (tu fais ça après le cours) :
[CONTENU_TP]

Signale tout ce qui te bloquerait ou te perdrait dans chacun des trois fichiers.
Dans le TP, tiens compte de ce que tu viens de lire dans le Cours et les Slides.

## Rapport étudiant

Pour chaque problème, format :
- [fichier / section] Citation courte — "Ce passage me bloque parce que..." ou
  "Je ne comprends pas pourquoi..." ou "Je serais bloqué ici parce que..." ou
  "Cet exercice suppose que je sache X, mais X n'a pas été expliqué dans le cours."

Signaler notamment :
- Dans le Cours : notions mal expliquées, exemples trop abstraits, sauts logiques
- Dans le TP : exercices dont tu ne sais pas par où commencer même après le cours,
  notions du TP absentes du cours, étapes manquantes entre deux consignes
- Endroits où tu pourrais produire quelque chose d'incorrect en pensant avoir raison

Si tout est clair dans un fichier, écrire "Contenu accessible — aucun blocage identifié."

### Sous-agent 3 — Cohérence inter-modules

*(Dispatché uniquement si `MODULE_PRECEDENT` n'est pas null)*

Prompt à utiliser (injecter `[NOM_N1]`, `[CONTENU_N1_COURS]`, `[CONTENU_N1_SLIDE]`,
`[CONTENU_N1_TP]`, `[NOM_N]`, `[CONTENU_COURS]`, `[CONTENU_SLIDE]`, `[CONTENU_TP]`) :

Tu es un expert en ingénierie pédagogique. Tu analyses la continuité entre deux modules
d'un cours universitaire en informatique (BUT Informatique, public débutant à intermédiaire).

**Module N-1 — [NOM_N1]**
Cours.tsx : [CONTENU_N1_COURS]
Slide.tsx : [CONTENU_N1_SLIDE]
TP.tsx : [CONTENU_N1_TP]

**Module N — [NOM_N]**
Cours.tsx : [CONTENU_COURS]
Slide.tsx : [CONTENU_SLIDE]
TP.tsx : [CONTENU_TP]

## Rapport cohérence inter-modules

### 1. Chapeau "À savoir pour ce cours"
Les notions listées dans le bloc Collapsible de N correspondent-elles au contenu réel de N-1 ?
Pour chaque écart : Notion listée / Présente dans N-1 ? → Suggestion

### 2. Présupposés non enseignés
Concepts utilisés dans le Cours ou TP de N (explications, exemples, exercices)
qui n'ont jamais été introduits dans N-1.
Format : [fichier N / section] Concept supposé acquis : "..." — Absent de N-1 → Suggestion

### 3. Opportunités de consolidation manquées
Concepts enseignés dans N-1 mais jamais réutilisés ou rappelés dans N,
alors qu'ils auraient pu ancrer un exercice ou illustrer un exemple.
Format : [fichier N-1 / section] Concept non reconduit : "..." → Suggestion

Si aucun problème dans une section, écrire "RAS".

### Consolidation

Présenter les deux rapports l'un après l'autre, clairement séparés.

Enregistrer le rapport consolidé dans le dossier traité, sous le nom `REVIEW.md` :
- Chemin : `[dossier_cible]/REVIEW.md` (ex. `src/cours/javascript/1-le-dom/REVIEW.md`)
- Format : Markdown avec les deux rapports, la date, et le fichier révisé en en-tête
- Si le fichier existe déjà, l'écraser

Puis proposer : **"Souhaitez-vous que je réécrive les passages ciblés ?"**
Si oui, réécrire uniquement les passages identifiés en expliquant chaque changement.