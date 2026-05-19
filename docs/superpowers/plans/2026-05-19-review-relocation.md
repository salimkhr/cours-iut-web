# Review Relocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déplacer les fichiers REVIEW.md produits par `pedagogy-review` hors de `src/cours/` vers `reviews/` à la racine, et mettre à jour les deux skills concernés pour utiliser ce nouvel emplacement.

**Architecture:** Règle de dérivation unique : les deux derniers segments non vides du `dossier_cible` (ex. `src/cours/javascript/1-le-dom/`) deviennent `reviews/javascript-1-le-dom-REVIEW.md`. Cette règle est appliquée identiquement dans `pedagogy-review` (écriture) et `pedagogy-rewrite` (lecture + mise à jour).

**Tech Stack:** Markdown (fichiers SKILL.md), git

---

### Task 1 : Créer le dossier reviews/

**Files:**
- Create: `reviews/.gitkeep`

- [ ] **Step 1 : Créer le fichier `.gitkeep`**

  Créer `reviews/.gitkeep` avec un contenu vide.

- [ ] **Step 2 : Vérifier**

  ```
  ls reviews/
  ```
  Attendu : `.gitkeep` présent.

- [ ] **Step 3 : Commit**

  ```bash
  git add reviews/.gitkeep
  git commit -m "chore: add reviews/ directory for pedagogy REVIEW.md artifacts"
  ```

---

### Task 2 : Mettre à jour pedagogy-review — règle d'écriture

**Files:**
- Modify: `.claude/skills/pedagogy-review/SKILL.md`

Le bloc à modifier se trouve dans la section **Consolidation** (fin du fichier).

- [ ] **Step 1 : Repérer le bloc actuel**

  Dans `.claude/skills/pedagogy-review/SKILL.md`, trouver ces deux lignes dans la section Consolidation :
  ```
  - Chemin : `[dossier_cible]/REVIEW.md`
  - Si le fichier existe déjà, l'écraser
  ```

- [ ] **Step 2 : Remplacer par la règle de dérivation**

  Remplacer ces deux lignes par :
  ```
  - Dériver `[matiere]` et `[n-slug]` depuis les deux derniers segments non vides du chemin `dossier_cible`
    (ex. `src/cours/javascript/1-le-dom/` → `matiere=javascript`, `n-slug=1-le-dom`)
  - Écrire dans `reviews/[matiere]-[n-slug]-REVIEW.md` à la racine du projet
  - Créer le dossier `reviews/` s'il n'existe pas. Si le fichier existe déjà, l'écraser.
  ```

- [ ] **Step 3 : Vérifier**

  Lire `.claude/skills/pedagogy-review/SKILL.md` et confirmer que la section Consolidation contient bien `reviews/[matiere]-[n-slug]-REVIEW.md` et ne contient plus `[dossier_cible]/REVIEW.md`.

- [ ] **Step 4 : Commit**

  ```bash
  git add .claude/skills/pedagogy-review/SKILL.md
  git commit -m "feat(skill): pedagogy-review writes REVIEW.md to reviews/ instead of src/cours/"
  ```

---

### Task 3 : Mettre à jour pedagogy-rewrite — lecture et mise à jour

**Files:**
- Modify: `.claude/skills/pedagogy-rewrite/SKILL.md`

Deux endroits à modifier : **Étape 0** (lecture) et **Étape 3** (mise à jour).

- [ ] **Step 1 : Modifier l'Étape 0 — recherche du REVIEW.md**

  Dans `.claude/skills/pedagogy-rewrite/SKILL.md`, trouver le bloc :
  ```
  2. Chercher `REVIEW.md` dans ce dossier avec l'outil Read
     - **Si absent** : afficher "Aucun REVIEW.md trouvé dans [dossier] — lancez d'abord `/pedagogy:review`." et s'arrêter.
  3. Lire `REVIEW.md`
  ```

  Remplacer par :
  ```
  2. Dériver le chemin REVIEW depuis le dossier cible : extraire les deux derniers segments non vides
     (ex. `src/cours/javascript/1-le-dom/` → `reviews/javascript-1-le-dom-REVIEW.md`).
     Lire ce fichier avec l'outil Read.
     - **Si absent** : afficher "Aucun REVIEW.md trouvé pour ce module
       (`reviews/[matiere]-[n-slug]-REVIEW.md`) — lancez d'abord `/pedagogy:review` sur ce dossier."
       et s'arrêter.
  ```
  
  (Supprimer l'ancien step 3 `Lire REVIEW.md` devenu redondant — la lecture est maintenant dans le step 2.)

- [ ] **Step 2 : Renuméroter les steps suivants de l'Étape 0**

  Après la suppression de l'ancien step 3, les steps suivants passent de 4→3 et 5→4 :
  
  - Ancien step 4 (compter les items) → step 3
  - Ancien step 5 (lire les fichiers .tsx) → step 4

- [ ] **Step 3 : Modifier l'Étape 3 — mise à jour du REVIEW.md**

  Dans la section **Étape 3**, trouver :
  ```
  2. **Mettre à jour `REVIEW.md`** pour chaque item traité :
  ```

  Remplacer par :
  ```
  2. **Mettre à jour `reviews/[matiere]-[n-slug]-REVIEW.md`** pour chaque item traité :
  ```

- [ ] **Step 4 : Vérifier**

  Lire `.claude/skills/pedagogy-rewrite/SKILL.md` et confirmer :
  - Étape 0 contient `reviews/[matiere]-[n-slug]-REVIEW.md` pour la lecture
  - Étape 3 référence `reviews/[matiere]-[n-slug]-REVIEW.md` pour la mise à jour
  - Aucune occurrence de `REVIEW.md dans ce dossier` ne subsiste

- [ ] **Step 5 : Commit**

  ```bash
  git add .claude/skills/pedagogy-rewrite/SKILL.md
  git commit -m "feat(skill): pedagogy-rewrite reads and updates REVIEW.md from reviews/"
  ```

---

### Task 4 : Supprimer les REVIEW.md dans src/cours/

**Files:**
- Delete: `src/cours/javascript/1-le-dom/REVIEW.md`
- Delete: `src/cours/javascript/2-les-evenements/REVIEW.md`

- [ ] **Step 1 : Supprimer les deux fichiers**

  ```bash
  git rm src/cours/javascript/1-le-dom/REVIEW.md
  git rm src/cours/javascript/2-les-evenements/REVIEW.md
  ```

- [ ] **Step 2 : Vérifier**

  ```bash
  git status
  ```
  Attendu : les deux fichiers apparaissent en `deleted`.

- [ ] **Step 3 : Commit**

  ```bash
  git commit -m "chore: remove REVIEW.md from src/cours/ (moved to reviews/ convention)"
  ```
