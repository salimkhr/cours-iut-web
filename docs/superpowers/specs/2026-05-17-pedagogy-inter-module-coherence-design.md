# Design — Cohérence inter-modules dans le skill pedagogy

**Date :** 2026-05-17
**Skill cible :** `.claude/skills/pedagogy/SKILL.md`
**Statut :** Approuvé

---

## Contexte

Le skill `pedagogy` dispatche actuellement 2 sous-agents en mode révision :
- **Sous-agent 1** — Pédagogue expert (clarté, guidage, cohérence Cours↔TP, conventions JSX)
- **Sous-agent 2** — Étudiant en difficulté (blocages, présupposés manquants)

Ces deux agents analysent un module en isolation. Aucun ne vérifie la continuité avec le module précédent (N-1) : concepts supposés acquis mais jamais enseignés, chapeau "À savoir pour ce cours" inexact, opportunités de consolidation manquées.

---

## Objectif

Ajouter un **3ème sous-agent parallèle** dédié à l'analyse inter-modules, déclenché automatiquement à chaque révision.

---

## Approche retenue : 3ème sous-agent parallèle

Parallélisation maximale, séparation claire des responsabilités. Le 3ème agent reçoit le contenu complet de N et N-1 et produit un rapport focalisé uniquement sur la continuité entre les deux modules.

---

## Section 1 — Identification de N-1

Ajout dans la phase "Collecte du dossier" (Étape 0) du SKILL.md, après lecture des fichiers de N :

1. Extraire le préfixe numérique du dossier cible (ex. `2-les-evenements` → `2`)
2. Chercher dans le même répertoire matière un dossier dont le préfixe est `N-1` (ex. `1-le-dom`)
3. **Si trouvé :** lire tous ses fichiers présents (Cours.tsx, Slide.tsx, TP.tsx, Examen.tsx) et les transmettre au 3ème sous-agent
4. **Si N = 1 :** ne pas dispatcher le 3ème sous-agent — injecter directement dans le REVIEW.md :
   ```
   > Premier module — aucun prérequis inter-modules à vérifier.
   ```

La détection repose uniquement sur la convention de nommage `{n}-{slug}` déjà en place dans `src/cours/` — aucune configuration supplémentaire requise.

---

## Section 2 — Prompt du 3ème sous-agent

```
Tu es un expert en ingénierie pédagogique. Tu analyses la continuité entre deux modules
d'un cours universitaire en informatique (BUT Informatique, public débutant à intermédiaire).

**Module N-1 — [nom du dossier]**
Cours.tsx : [CONTENU]
Slide.tsx : [CONTENU]
TP.tsx : [CONTENU]

**Module N — [nom du dossier]**
Cours.tsx : [CONTENU]
Slide.tsx : [CONTENU]
TP.tsx : [CONTENU]

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

---

## Section 3 — Intégration dans le REVIEW.md

Structure du fichier consolidé après la modification :

```markdown
# REVIEW — [module] — [date]

---

## Rapport pédagogue
[rapport existant — sous-agent 1]

---

## Rapport étudiant
[rapport existant — sous-agent 2]

---

## Rapport cohérence inter-modules
> Analyse de la continuité entre [N-1] et [N]

[rapport du 3ème sous-agent]
```

Le 3ème sous-agent s'exécute en parallèle des deux existants. La consolidation attend les 3 résultats avant d'écrire le REVIEW.md.

---

## Fichier à modifier

- `.claude/skills/pedagogy/SKILL.md` — sections "Étape 0" et "Consolidation"

Aucun nouveau fichier de référence requis. Le prompt du 3ème sous-agent est injecté directement dans le SKILL.md comme les deux existants.

---

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| Module 1 (pas de N-1) | Message explicite dans REVIEW.md, pas de dispatch |
| N-1 existe mais certains fichiers sont absents | Passer uniquement les fichiers présents, signaler les absents dans le prompt |
| Modules non numérotés (convention non respectée) | Ne pas dispatcher, signaler l'impossibilité de détecter N-1 |
