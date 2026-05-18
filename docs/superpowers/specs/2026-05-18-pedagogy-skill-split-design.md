# Design — Découpage du skill `pedagogy` en 3 skills distincts

**Date :** 2026-05-18
**Statut :** Approuvé

---

## Contexte

Le skill `pedagogy` actuel dispose de deux modes (`write` et `review`) dans un seul `SKILL.md`.
La fin du mode `review` propose "Souhaitez-vous que je réécrive ?" — ce qui brouille la frontière
entre révision et réécriture.

L'objectif est de séparer ces responsabilités en 3 skills distincts, plus lisibles et maintenables
indépendamment.

---

## Architecture des fichiers

```
.claude/skills/
  pedagogy-write/
    SKILL.md              ← mode écriture de nouveaux contenus
  pedagogy-review/
    SKILL.md              ← révision (3 sous-agents, produit REVIEW.md)
  pedagogy-rewrite/
    SKILL.md              ← lit REVIEW.md, brainstorme par thème, réécrit, marque traité
  pedagogy-reference/     ← références partagées (inchangées)
    cours.md
    tp.md
    slide.md
    examen.md
```

Le dossier `.claude/skills/pedagogy/` actuel est **supprimé** une fois les 3 nouveaux créés.
Les chemins vers `pedagogy-reference/` remplacent les anciens `pedagogy/reference/`.

---

## Skill 1 — `/pedagogy-review`

### Comportement

Identique au mode révision actuel avec deux ajustements :

1. **Suppression** de la question finale "Souhaitez-vous que je réécrive ?" — c'est le rôle de `/pedagogy-rewrite`
2. **Format REVIEW.md enrichi** : chaque item reçoit un statut `[ ]` (non traité)

### Format REVIEW.md produit

```markdown
# REVIEW — [module] — [date]

## Rapport pédagogue
- [ ] [Cours / A-Introduction] Problème : jargon non défini → Suggestion : ...
- [ ] [TP / Exercice 2] Problème : guidage trop fort → Suggestion : ...

## Rapport étudiant
- [ ] [Cours / B-Exemples] "Je ne comprends pas pourquoi..." — ...

## Rapport cohérence inter-modules
- [ ] [TP / Exercice 1] Concept supposé acquis : "fetch" — Absent de N-1 → ...
```

### Ce qui est conservé

- Étape 0 : collecte du dossier + identification N-1
- 3 sous-agents en parallèle (Pédagogue, Étudiant, Cohérence inter-modules)
- Consolidation dans `REVIEW.md`

---

## Skill 2 — `/pedagogy-rewrite` (nouveau)

### Déclenchement

```
/pedagogy-rewrite        → sur un dossier contenant un REVIEW.md
```

### Flux en 4 étapes

**Étape 1 — Lecture**
- Lit `REVIEW.md` du dossier cible
- Lit tous les fichiers de cours présents (`Cours.tsx`, `TP.tsx`, `Slide.tsx`, `Examen.tsx`)
- Ne traite que les items `[ ]` (non cochés)

**Étape 2 — Regroupement par thème**
- Regroupe les items non traités en 3–5 thèmes transversaux
  (ex. "Guidage trop fort", "Jargon non défini", "Incohérence Cours→TP")
- Présente la liste des thèmes avec le nombre d'items par thème, ordonnés par priorité pédagogique
- Attend la validation de l'utilisateur avant de continuer

**Étape 3 — Brainstorm thème par thème**
Pour chaque thème (un à la fois) :
- Cite les items concernés
- Propose **2–3 angles de correction** avec leurs compromis
- Attend le choix de l'utilisateur avant de passer au thème suivant

**Étape 4 — Réécriture + mise à jour REVIEW.md**
Pour chaque thème validé :
- Réécrit les passages ciblés dans les fichiers `.tsx`, en expliquant chaque changement
- Coche les items traités dans `REVIEW.md` : `[ ]` → `[x]`
- Ajoute sous chaque item coché : `> Traité : [angle choisi]`

Si tous les items sont cochés en fin de session :
```
REVIEW.md complète — tous les points ont été traités.
```

---

## Skill 3 — `/pedagogy-write`

### Comportement

Extraction exacte du bloc "Mode écriture" actuel, sans modification de comportement.

### Invocation

```
/pedagogy-write              → demande le type (Cours / TP / Slide / Examen)
/pedagogy-write cours        → type direct
/pedagogy-write tp
/pedagogy-write slide
/pedagogy-write examen
```

### Ce qui change

- Chemin des références : `.claude/skills/pedagogy-reference/` au lieu de `.claude/skills/pedagogy/reference/`
- Tout le reste est identique : 1–2 questions de contexte, génération JSX, respect des conventions

---

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| `/pedagogy-rewrite` sans `REVIEW.md` dans le dossier | Message explicite : "Aucun REVIEW.md trouvé — lancez d'abord `/pedagogy-review`" |
| Tous les items déjà cochés `[x]` | Message : "Tous les points sont déjà traités. Relancez `/pedagogy-review` pour une nouvelle révision." |
| Dossier sans fichiers `.tsx` | Signaler les fichiers manquants, continuer avec ceux qui existent |
| N-1 introuvable lors du review | Comportement inchangé : message dans REVIEW.md, Sous-agent 3 non dispatché |

---

## Fichiers à créer / modifier / supprimer

| Action | Fichier |
|--------|---------|
| Créer | `.claude/skills/pedagogy-write/SKILL.md` |
| Créer | `.claude/skills/pedagogy-review/SKILL.md` |
| Créer | `.claude/skills/pedagogy-rewrite/SKILL.md` |
| Déplacer | `.claude/skills/pedagogy/reference/*.md` → `.claude/skills/pedagogy-reference/*.md` |
| Supprimer | `.claude/skills/pedagogy/SKILL.md` |
| Supprimer | `.claude/skills/pedagogy/reference/` (après déplacement) |
