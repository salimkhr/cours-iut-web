# Design — Déplacement des REVIEW.md hors de src/cours/

**Date :** 2026-05-19
**Statut :** Approuvé

---

## Contexte

Les skills `pedagogy-review` et `pedagogy-rewrite` écrivent et lisent un fichier `REVIEW.md`
directement dans le dossier de cours cible (ex. `src/cours/javascript/1-le-dom/REVIEW.md`).
Ces fichiers sont des artefacts d'outil temporaires, pas du contenu pédagogique — leur
présence dans `src/cours/` est problématique (mélange de code source et d'artefacts d'audit).

---

## Décision

Les `REVIEW.md` sont déplacés dans un dossier dédié `reviews/` à la racine du projet.

---

## Règle de dérivation du chemin

À partir du `dossier_cible` fourni au skill, extraire les deux derniers segments non vides
du chemin et les joindre par `-` :

```
src/cours/javascript/1-le-dom/  →  reviews/javascript-1-le-dom-REVIEW.md
src/cours/javascript/2-les-evenements/  →  reviews/javascript-2-les-evenements-REVIEW.md
src/cours/php/3-pdo/  →  reviews/php-3-pdo-REVIEW.md
```

Un seul fichier REVIEW actif par module — écrasé à chaque nouvelle révision.

---

## Changements dans `pedagogy-review`

**Section Consolidation :**

Remplacer :
> Chemin : `[dossier_cible]/REVIEW.md` — Si le fichier existe déjà, l'écraser

Par :
> Dériver `[matiere]` et `[n-slug]` depuis les deux derniers segments du chemin `dossier_cible`.
> Écrire dans `reviews/[matiere]-[n-slug]-REVIEW.md` à la racine du projet.
> Créer le dossier `reviews/` s'il n'existe pas. Si le fichier existe déjà, l'écraser.

---

## Changements dans `pedagogy-rewrite`

**Étape 0 — Vérification préalable :**

Remplacer :
> Chercher `REVIEW.md` dans ce dossier avec l'outil Read

Par :
> Dériver le chemin REVIEW depuis le dossier cible : `reviews/[matiere]-[n-slug]-REVIEW.md`.
> Lire ce fichier avec l'outil Read.

Message d'erreur si absent :
> "Aucun REVIEW.md trouvé pour ce module (`reviews/[matiere]-[n-slug]-REVIEW.md`) — lancez d'abord `/pedagogy:review` sur ce dossier."

**Étape 3 — Réécriture et mise à jour :**

La mise à jour du REVIEW.md s'écrit dans `reviews/[matiere]-[n-slug]-REVIEW.md`, pas dans le dossier de cours.

---

## Nettoyage des fichiers existants

Supprimer les REVIEW.md actuellement dans `src/cours/` (déjà tous traités, contenu conservé dans git) :

| Fichier | Action |
|---------|--------|
| `src/cours/javascript/1-le-dom/REVIEW.md` | Supprimer |
| `src/cours/javascript/2-les-evenements/REVIEW.md` | Supprimer |

Créer `reviews/.gitkeep` pour que le dossier soit tracké par git.

---

## Fichiers à modifier

| Action | Fichier |
|--------|---------|
| Modifier | `.claude/skills/pedagogy-review/SKILL.md` |
| Modifier | `.claude/skills/pedagogy-rewrite/SKILL.md` |
| Supprimer | `src/cours/javascript/1-le-dom/REVIEW.md` |
| Supprimer | `src/cours/javascript/2-les-evenements/REVIEW.md` |
| Créer | `reviews/.gitkeep` |
