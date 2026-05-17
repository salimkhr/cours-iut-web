# Pedagogy Skill — Inter-Module Coherence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un 3ème sous-agent parallèle au mode révision du skill `pedagogy` qui analyse la continuité pédagogique entre le module N en cours de révision et le module N-1.

**Architecture:** Un seul fichier est modifié — `.claude/skills/pedagogy/SKILL.md` — en 4 endroits distincts : (1) Étape 0 reçoit la logique de détection de N-1, (2) l'instruction de dispatch devient conditionnelle, (3) le prompt du 3ème sous-agent est ajouté, (4) la Consolidation intègre le 3ème rapport dans le REVIEW.md.

**Tech Stack:** Claude Code skills (fichiers Markdown de prompt), outil Agent pour le dispatch, outils Read et Glob pour la détection de N-1.

---

## Fichier modifié

| Fichier | Rôle |
|---------|------|
| `.claude/skills/pedagogy/SKILL.md` | Seul fichier à modifier — 4 sections touchées |

---

### Task 1 — Détection de N-1 dans Étape 0

**Fichier :** `.claude/skills/pedagogy/SKILL.md` — section "Étape 0 — Collecte du dossier"

- [ ] **Lire la section Étape 0 actuelle**

  Confirmer que les étapes actuelles se terminent par :
  > "Passer **l'intégralité du contenu de chaque fichier** aux sous-agents, clairement séparé par fichier"

- [ ] **Ajouter l'étape 4 de détection de N-1 à la fin de l'Étape 0**

  Insérer après l'étape 3 existante :

  ```
  4. **Identifier le module N-1** :
     - Extraire le préfixe numérique du dossier cible
       (ex. `src/cours/javascript/2-les-evenements/` → préfixe `2`)
     - Utiliser Glob sur le répertoire matière pour trouver un dossier dont le nom
       commence par `{N-1}-` (ex. pour N=2, pattern `1-*` dans `src/cours/javascript/`)
     - **Si N = 1** : définir `MODULE_PRECEDENT = null`
     - **Si dossier N-1 trouvé** : lire chaque fichier présent (Cours.tsx, Slide.tsx,
       TP.tsx, Examen.tsx) avec l'outil Read ; stocker sous `CONTENU_N1_COURS`,
       `CONTENU_N1_SLIDE`, `CONTENU_N1_TP`. Fichiers absents = chaîne vide.
     - **Si N > 1 mais dossier N-1 introuvable** : définir `MODULE_PRECEDENT = null`,
       prévoir dans le REVIEW.md : "Module N-1 introuvable — vérification inter-modules ignorée."
  ```

- [ ] **Commiter**

  ```bash
  git add .claude/skills/pedagogy/SKILL.md
  git commit -m "feat(pedagogy): add N-1 detection step in Étape 0"
  ```

---

### Task 2 — Dispatch conditionnel du 3ème sous-agent

**Fichier :** `.claude/skills/pedagogy/SKILL.md` — instruction de dispatch

- [ ] **Localiser la ligne de dispatch**

  Trouver :
  > "Dispatcher **2 sous-agents simultanément** via l'outil Agent (même message, deux appels indépendants)."

- [ ] **Remplacer par la version conditionnelle**

  ```
  Dispatcher les sous-agents simultanément via l'outil Agent (même message, appels indépendants) :
  - **Toujours** : Sous-agent 1 (Pédagogue) + Sous-agent 2 (Étudiant en difficulté)
  - **Si `MODULE_PRECEDENT` n'est pas null** : ajouter Sous-agent 3 (Cohérence inter-modules)
  - **Si `MODULE_PRECEDENT` est null** : ne pas dispatcher le Sous-agent 3
  ```

- [ ] **Commiter**

  ```bash
  git add .claude/skills/pedagogy/SKILL.md
  git commit -m "feat(pedagogy): make sub-agent dispatch conditional on N-1 availability"
  ```

---

### Task 3 — Prompt du 3ème sous-agent

**Fichier :** `.claude/skills/pedagogy/SKILL.md` — ajouter après la section "Sous-agent 2"

- [ ] **Localiser la fin de la section Sous-agent 2**

  Repérer la dernière ligne du prompt de l'étudiant :
  > "Si tout est clair dans un fichier, écrire "Contenu accessible — aucun blocage identifié.""

- [ ] **Insérer la section Sous-agent 3 immédiatement après**

  ```
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
  ```

- [ ] **Commiter**

  ```bash
  git add .claude/skills/pedagogy/SKILL.md
  git commit -m "feat(pedagogy): add sub-agent 3 prompt for inter-module coherence"
  ```

---

### Task 4 — Mise à jour de la Consolidation

**Fichier :** `.claude/skills/pedagogy/SKILL.md` — section "Consolidation"

- [ ] **Localiser la section Consolidation**

  Trouver :
  > "### Consolidation"
  > "Présenter les deux rapports l'un après l'autre, clairement séparés."

- [ ] **Remplacer entièrement la section Consolidation**

  ```
  ### Consolidation

  Attendre les résultats de tous les sous-agents dispatchés, puis les présenter
  l'un après l'autre, clairement séparés.

  Enregistrer le rapport consolidé dans le dossier traité, sous le nom `REVIEW.md` :
  - Chemin : `[dossier_cible]/REVIEW.md` (ex. `src/cours/javascript/2-les-evenements/REVIEW.md`)
  - Si le fichier existe déjà, l'écraser
  - Format :

  ```markdown
  # REVIEW — [module] — [date]

  ---

  ## Rapport pédagogue
  [rapport sous-agent 1]

  ---

  ## Rapport étudiant
  [rapport sous-agent 2]

  ---

  ## Rapport cohérence inter-modules
  > Analyse de la continuité entre [NOM_N1] et [NOM_N]

  [rapport sous-agent 3]
  ```

  Si `MODULE_PRECEDENT` est null, remplacer le contenu de la section
  "Rapport cohérence inter-modules" par :

  ```
  > Premier module — aucun prérequis inter-modules à vérifier.
  ```
  ou
  ```
  > Module N-1 introuvable — vérification inter-modules ignorée.
  ```
  selon le cas détecté en Étape 0.

  Puis proposer : **"Souhaitez-vous que je réécrive les passages ciblés ?"**
  Si oui, réécrire uniquement les passages identifiés en expliquant chaque changement.
  ```

- [ ] **Commiter**

  ```bash
  git add .claude/skills/pedagogy/SKILL.md
  git commit -m "feat(pedagogy): update consolidation section for 3-agent report"
  ```

---

### Task 5 — Vérification manuelle

- [ ] **Tester sur un module N > 1**

  Ouvrir `src/cours/javascript/2-les-evenements/Cours.tsx` dans l'IDE, puis invoquer :
  ```
  /pedagogy review
  ```
  Vérifier que 3 sous-agents sont dispatchés simultanément et que `REVIEW.md` contient
  les 3 sections : "Rapport pédagogue", "Rapport étudiant", "Rapport cohérence inter-modules"
  avec les sous-sections 1, 2, 3.

- [ ] **Tester sur le module 1**

  Ouvrir `src/cours/javascript/1-le-dom/Cours.tsx`, invoquer `/pedagogy review`.
  Vérifier que seuls 2 sous-agents sont dispatchés et que le REVIEW.md contient :
  ```
  > Premier module — aucun prérequis inter-modules à vérifier.
  ```

- [ ] **Commiter si ajustements nécessaires**

  ```bash
  git add .claude/skills/pedagogy/SKILL.md
  git commit -m "fix(pedagogy): adjust inter-module detection after manual verification"
  ```
