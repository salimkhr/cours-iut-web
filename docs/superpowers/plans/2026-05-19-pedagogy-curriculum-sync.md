# Pedagogy Curriculum Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer le skill `/pedagogy:sync` qui génère un `reviews/[matiere]-curriculum.md` par matière, et mettre à jour `pedagogy:review` et `pedagogy:rewrite` pour lire/écrire ce curriculum automatiquement.

**Architecture:** Un nouveau skill dédié extrait les concepts et APIs d'un module et maintient une entrée par module dans `reviews/[matiere]-curriculum.md`. `pedagogy:review` charge ce fichier pour donner au Sous-agent 3 une vue sur tous les modules précédents, puis appelle sync en fin de consolidation. `pedagogy:rewrite` appelle sync en fin de réécriture.

**Tech Stack:** Markdown (fichiers SKILL.md), convention de nommage `reviews/[matiere]-curriculum.md`

---

### Task 1 : Créer le skill `pedagogy-sync`

**Files:**
- Create: `.claude/skills/pedagogy-sync/SKILL.md`

- [ ] **Step 1 : Créer le dossier et le fichier SKILL.md**

  Créer `.claude/skills/pedagogy-sync/SKILL.md` avec le contenu suivant :

  ```markdown
  ---
  name: pedagogy-sync
  description: Génère ou met à jour l'entrée d'un module dans reviews/[matiere]-curriculum.md en extrayant les concepts introduits et APIs enseignées depuis les fichiers de cours.
  ---

  # Skill — Synchronisation du curriculum pédagogique

  ## Invocation

  ` ` `
  /pedagogy:sync        → sur le dossier de cours mentionné ou actif
  ` ` `

  ---

  ## Étape 1 — Identification

  1. Identifier le dossier cible (mentionné dans la conversation ou dossier actif)
  2. Extraire `[matiere]` et `[n-slug]` depuis les deux derniers segments non vides du chemin
     (ex. `src/cours/javascript/1-le-dom/` → `matiere=javascript`, `n-slug=1-le-dom`)

  ---

  ## Étape 2 — Lecture des fichiers

  Lire avec l'outil Read tous les fichiers présents parmi :
  - `[dossier_cible]/Cours.tsx`
  - `[dossier_cible]/Slide.tsx`
  - `[dossier_cible]/TP.tsx`

  Les fichiers absents sont ignorés silencieusement.

  ---

  ## Étape 3 — Extraction

  À partir des fichiers lus, extraire par inférence directe :

  **Concepts introduits**
  Notions pédagogiques nommées et expliquées dans le cours : termes techniques définis,
  mécanismes décrits, distinctions établies.
  Sources prioritaires : `<Text>`, `<ListItem>`, `<Heading>` dans Cours.tsx et Slide.tsx.
  Format : une ligne par concept, formulé comme une notion
  (ex. "Portée des variables (scope)", "Différence HTMLCollection vs NodeList")

  **APIs / méthodes enseignées**
  Fonctions, méthodes, propriétés présentes dans les exemples de code.
  Sources prioritaires : `<Code>`, `<CodeCard>`, `<CodeWithPreviewCard>` dans tous les fichiers.
  Format : `objet.méthode` ou `méthode` selon le contexte
  (ex. `document.querySelector`, `element.classList.add`, `Array.prototype.map`)

  Ne pas inclure :
  - Les concepts ou APIs mentionnés en passant sans être expliqués
  - Les imports et déclarations internes aux composants JSX

  ---

  ## Étape 4 — Mise à jour du curriculum

  1. Lire `reviews/[matiere]-curriculum.md` avec l'outil Read
     - Si absent : le fichier sera créé à l'étape suivante avec l'en-tête `# Curriculum — [matiere]`
  2. Si une section `## [n-slug]` existe déjà → la remplacer intégralement
  3. Sinon → insérer la section à la position correcte (ordre numérique croissant du préfixe de module)
  4. Écrire le fichier complet avec l'outil Write en respectant ce format de section :

  ` ` `markdown
  ## [n-slug] — [date YYYY-MM-DD]

  ### Concepts introduits
  - [concept 1]
  - [concept 2]

  ### APIs / méthodes enseignées
  - [api 1]
  - [api 2]

  ---
  ` ` `

  ---

  ## Étape 5 — Confirmation

  Afficher :
  ` ` `
  Curriculum mis à jour — [matiere]/[n-slug] : N concepts, M APIs.
  ` ` `

  ---

  ## Périmètre strict

  Ce skill ne fait **pas** :
  - Juger la qualité du contenu pédagogique
  - Produire un REVIEW.md
  - Proposer des corrections
  - Dispatcher des sous-agents
  ```

- [ ] **Step 2 : Vérifier**

  Lire `.claude/skills/pedagogy-sync/SKILL.md` et confirmer :
  - Le frontmatter `name: pedagogy-sync` est présent
  - Les 5 étapes sont présentes
  - La section "Périmètre strict" est présente

---

### Task 2 : Mettre à jour `pedagogy-review` — chargement du curriculum

**Files:**
- Modify: `.claude/skills/pedagogy-review/SKILL.md`

Ce task remplace la logique de lecture N-1 (fichiers bruts) par la lecture du curriculum.

- [ ] **Step 1 : Remplacer l'étape 4 de l'Étape 0**

  Dans `.claude/skills/pedagogy-review/SKILL.md`, trouver le bloc :
  ```
  4. **Identifier le module N-1** :
     - Extraire le préfixe numérique entier du dossier cible (ex. `11-twig` → préfixe `11`)
     - Utiliser Glob sur le répertoire matière pour trouver un dossier dont le nom commence par `{N-1}-`
       (ex. pour N=2, pattern `1-*` dans `src/cours/javascript/`)
       Seul le dossier N-1 est recherché — pas N-2 ni plus.
     - **Si N = 1** : définir `MODULE_PRECEDENT = null`
     - **Si dossier N-1 trouvé** : lire chaque fichier présent (Cours.tsx, Slide.tsx, TP.tsx) avec Read ;
       stocker sous `CONTENU_N1_COURS`, `CONTENU_N1_SLIDE`, `CONTENU_N1_TP`. Fichiers absents = chaîne vide.
       Stocker le chemin absolu sous `MODULE_PRECEDENT`, le nom du dossier sous `NOM_N1`.
     - **Si N > 1 mais dossier N-1 introuvable** : définir `MODULE_PRECEDENT = null`,
       stocker dans `MODULE_PRECEDENT_ERREUR` : "Module N-1 introuvable — vérification inter-modules ignorée."
  ```

  Remplacer par :
  ```
  4. **Charger le curriculum de la matière** :
     - Dériver `[matiere]` depuis le dossier cible (ex. `src/cours/javascript/1-le-dom/` → `javascript`)
     - Lire `reviews/[matiere]-curriculum.md` avec l'outil Read
     - **Si le fichier existe** : stocker son contenu sous `CONTENU_CURRICULUM` ;
       définir `CURRICULUM_DISPONIBLE = true`
     - **Si absent** : définir `CURRICULUM_DISPONIBLE = false`,
       stocker dans `CURRICULUM_ERREUR` :
       "Curriculum introuvable pour [matiere] — lancez `/pedagogy:sync` sur les modules précédents
       pour activer la vérification inter-modules étendue."
  ```

- [ ] **Step 2 : Mettre à jour la condition de dispatch du Sous-agent 3**

  Trouver :
  ```
  - **Si `MODULE_PRECEDENT` n'est pas null** : ajouter Sous-agent 3 (Cohérence inter-modules)
  - **Si `MODULE_PRECEDENT` est null** : ne pas dispatcher le Sous-agent 3
  ```

  Remplacer par :
  ```
  - **Si `CURRICULUM_DISPONIBLE` est true** : ajouter Sous-agent 3 (Cohérence inter-modules)
  - **Si `CURRICULUM_DISPONIBLE` est false** : ne pas dispatcher le Sous-agent 3
  ```

- [ ] **Step 3 : Remplacer le prompt du Sous-agent 3**

  Trouver le bloc complet :
  ```
  ## Sous-agent 3 — Cohérence inter-modules

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
  Pour chaque écart : `- [ ] Notion listée / Présente dans N-1 ? → Suggestion`

  ### 2. Présupposés non enseignés
  Format : `- [ ] [fichier N / section] Concept supposé acquis : "..." — Absent de N-1 → Suggestion`

  ### 3. Opportunités de consolidation manquées
  Format : `- [ ] [fichier N-1 / section] Concept non reconduit : "..." → Suggestion`

  Si aucun problème dans une section, écrire "RAS".
  ```

  Remplacer par :
  ```
  ## Sous-agent 3 — Cohérence inter-modules

  *(Dispatché uniquement si `CURRICULUM_DISPONIBLE` est true)*

  Prompt à utiliser (injecter `[CONTENU_CURRICULUM]`, `[NOM_N]`, `[CONTENU_COURS]`,
  `[CONTENU_SLIDE]`, `[CONTENU_TP]`) :

  Tu es un expert en ingénierie pédagogique. Tu analyses la continuité entre tous les modules
  précédents et le module en cours de révision, dans un cours universitaire en informatique
  (BUT Informatique, public débutant à intermédiaire).

  **Curriculum des modules précédents** :
  [CONTENU_CURRICULUM]

  **Module N — [NOM_N]**
  Cours.tsx : [CONTENU_COURS]
  Slide.tsx : [CONTENU_SLIDE]
  TP.tsx : [CONTENU_TP]

  ## Rapport cohérence inter-modules

  ### 1. Chapeau "À savoir pour ce cours"
  Pour chaque écart : `- [ ] Notion listée / Présente dans les modules précédents ? → Suggestion`

  ### 2. Présupposés non enseignés
  Format : `- [ ] [fichier N / section] Concept supposé acquis : "..." — Absent du curriculum → Suggestion`

  ### 3. Opportunités de consolidation manquées
  Format : `- [ ] [module précédent / concept] Concept introduit mais non réutilisé dans ce module → Suggestion`

  Si aucun problème dans une section, écrire "RAS".
  ```

- [ ] **Step 4 : Mettre à jour la section Consolidation — message de repli**

  Trouver :
  ```
  Si `MODULE_PRECEDENT` est null, remplacer le contenu cohérence par :
  - `MODULE_PRECEDENT_ERREUR` si défini
  - Sinon : `> Premier module — aucun prérequis inter-modules à vérifier.`

  **Ne pas proposer de réécriture.** L'utilisateur lance `/pedagogy:rewrite` s'il souhaite corriger les points identifiés.
  ```

  Remplacer par :
  ```
  Si `CURRICULUM_DISPONIBLE` est false, remplacer le contenu cohérence par :
  - `CURRICULUM_ERREUR` si défini
  - Sinon : `> Curriculum absent — lancez \`/pedagogy:sync\` sur les modules précédents pour activer la vérification inter-modules.`

  Après écriture du REVIEW.md, **invoquer `/pedagogy:sync`** sur le dossier cible pour mettre à jour
  le curriculum avec le contenu du module qui vient d'être reviewé.

  **Ne pas proposer de réécriture.** L'utilisateur lance `/pedagogy:rewrite` s'il souhaite corriger les points identifiés.
  ```

- [ ] **Step 5 : Vérifier**

  Lire `.claude/skills/pedagogy-review/SKILL.md` et confirmer :
  - Aucune occurrence de `MODULE_PRECEDENT` ne subsiste
  - Aucune occurrence de `CONTENU_N1_COURS` ne subsiste
  - `CURRICULUM_DISPONIBLE` apparaît dans la condition de dispatch et dans la consolidation
  - `CONTENU_CURRICULUM` apparaît dans le prompt du Sous-agent 3
  - La ligne `invoquer /pedagogy:sync` est présente dans la consolidation

---

### Task 3 : Mettre à jour `pedagogy-rewrite` — appel sync en fin de réécriture

**Files:**
- Modify: `.claude/skills/pedagogy-rewrite/SKILL.md`

- [ ] **Step 1 : Ajouter l'appel sync après le bilan de l'Étape 3**

  Dans `.claude/skills/pedagogy-rewrite/SKILL.md`, trouver :
  ```
  Si tous les items sont `[x]` :
  ```
  REVIEW.md complète — tous les points ont été traités.
  ```

  ---
  ```

  Remplacer par :
  ```
  Si tous les items sont `[x]` :
  ```
  REVIEW.md complète — tous les points ont été traités.
  ```

  4. **Invoquer `/pedagogy:sync`** sur le dossier cible pour mettre à jour le curriculum.

  ---
  ```

- [ ] **Step 2 : Vérifier**

  Lire `.claude/skills/pedagogy-rewrite/SKILL.md` et confirmer que la ligne
  `Invoquer /pedagogy:sync` est présente à la fin de l'Étape 3, avant `---`.
