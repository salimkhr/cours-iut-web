# Design — Skill `/pedagogy:sync` et curriculum par matière

**Date :** 2026-05-19
**Statut :** Approuvé

---

## Contexte

L'agent de cohérence inter-modules (`pedagogy:review`, Sous-agent 3) ne regarde que le module N-1.
Des concepts introduits au module 3 peuvent être mobilisés au module 5, créant des angles morts.

L'objectif est de donner à l'agent de cohérence une vue sur **tous les modules précédents**
sans charger leurs fichiers bruts en contexte — via un fichier `curriculum.md` par matière,
maintenu automatiquement.

---

## Nouveau fichier : `reviews/[matiere]-curriculum.md`

Un fichier par matière (ex. `reviews/javascript-curriculum.md`), une section par module,
ordonnée par numéro de module.

### Format

```markdown
# Curriculum — [matiere]

## [n-slug] — [date]

### Concepts introduits
- [notion pédagogique nommée et expliquée dans le cours]
- ...

### APIs / méthodes enseignées
- [fonction, méthode, propriété présente dans les CodeCard et exemples]
- ...

---

## [n-slug suivant] — [date]
...
```

### Règles

- Chaque section est horodatée à la date de la dernière sync
- Les sections sont séparées par `---`
- Si le fichier est absent lors d'une lecture, comportement de repli défini par le consommateur
- Un module absent du curriculum n'a simplement pas encore été synced

---

## Nouveau skill : `/pedagogy:sync`

### Invocation

```
/pedagogy:sync        → sur le dossier de cours mentionné ou actif
```

### Flux

**Étape 1 — Identification**
- Identifier le dossier cible
- Extraire `[matiere]` et `[n-slug]` depuis les deux derniers segments non vides du chemin
  (même règle que `pedagogy:review` et `pedagogy:rewrite`)

**Étape 2 — Lecture des fichiers**
- Lire `Cours.tsx`, `Slide.tsx`, `TP.tsx` présents dans le dossier (les absents sont ignorés)

**Étape 3 — Extraction**
Par inférence directe (pas de sous-agent) :
- **Concepts introduits** : notions pédagogiques nommées et expliquées dans les fichiers lus
- **APIs / méthodes enseignées** : fonctions, méthodes, propriétés présentes dans les `CodeCard`
  et exemples de code (balises `<Code>`, `<CodeCard>`, `<CodeWithPreviewCard>`)

**Étape 4 — Mise à jour du curriculum**
- Ouvrir `reviews/[matiere]-curriculum.md` (créer si absent)
- Si une section `## [n-slug]` existe déjà → la remplacer intégralement
- Sinon → l'ajouter à la position correcte (ordre numérique des modules)
- Horodater la section avec la date du jour

**Étape 5 — Confirmation**
Afficher :
```
Curriculum mis à jour — [matiere]/[n-slug] : N concepts, M APIs.
```

### Périmètre strict

Le skill **ne fait pas** :
- Juger la qualité du contenu
- Produire un REVIEW.md
- Proposer des corrections
- Dispatcher des sous-agents

---

## Changements dans `pedagogy:review`

### Sous-agent 3 — Cohérence inter-modules (modifié)

**Avant :** lire les fichiers bruts du module N-1 (`Cours.tsx`, `Slide.tsx`, `TP.tsx`)

**Après :** lire `reviews/[matiere]-curriculum.md` en entier.
Le sous-agent dispose ainsi de la vue complète de tous les modules précédents.

Comportement de repli si `reviews/[matiere]-curriculum.md` est absent :
- Conserver le comportement actuel : message dans REVIEW.md, sous-agent 3 non dispatché
- Message : "Curriculum introuvable pour [matiere] — lancez `/pedagogy:sync` sur les modules
  précédents pour activer la vérification inter-modules étendue."

Le sous-agent 3 est désormais dispatché **quel que soit N** (y compris N=1 si le curriculum
existe déjà depuis une session précédente).

### Appel sync en fin de consolidation

Après écriture du `REVIEW.md`, invoquer `/pedagogy:sync` sur le dossier cible pour mettre
à jour le curriculum avec le contenu du module qui vient d'être reviewé.

---

## Changements dans `pedagogy:rewrite`

### Appel sync en fin d'Étape 3

Après traitement du dernier thème et affichage du bilan
(`REVIEW.md mise à jour — N items traités`), invoquer `/pedagogy:sync` sur le dossier cible.

---

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| `reviews/[matiere]-curriculum.md` absent au moment du review | Message de repli dans REVIEW.md, sous-agent 3 non dispatché |
| Module N=1, curriculum vide | Sous-agent 3 dispatché si curriculum existe (sessions précédentes d'autres matières non applicable) — sinon message "Premier module, aucun prérequis inter-modules" |
| Fichiers `.tsx` absents lors du sync | Ignorer les absents, extraire depuis ceux qui existent |
| Section déjà présente dans curriculum | Remplacée intégralement (pas d'accumulation) |

---

## Fichiers à créer / modifier

| Action | Fichier |
|--------|---------|
| Créer | `.claude/skills/pedagogy-sync/SKILL.md` |
| Modifier | `.claude/skills/pedagogy-review/SKILL.md` |
| Modifier | `.claude/skills/pedagogy-rewrite/SKILL.md` |
| Généré à l'usage | `reviews/[matiere]-curriculum.md` |
