# Pedagogy Skill Split — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Découper le skill `pedagogy` en 3 sous-skills (`pedagogy:write`, `pedagogy:review`, `pedagogy:rewrite`) accessibles via la syntaxe namespace:skill de Claude Code.

**Architecture:** 3 sous-dossiers dans `.claude/skills/pedagogy/`, chacun avec son `SKILL.md`. Le `SKILL.md` racine est supprimé. Les fichiers `reference/` restent en place.

**Tech Stack:** Markdown (skill files Claude Code), PowerShell (opérations fichiers Windows)

**Spec de référence :** `docs/superpowers/specs/2026-05-18-pedagogy-skill-split-design.md`

---

## File Map

| Action | Fichier |
|--------|---------|
| Créer | `.claude/skills/pedagogy/write/SKILL.md` |
| Créer | `.claude/skills/pedagogy/review/SKILL.md` |
| Créer | `.claude/skills/pedagogy/rewrite/SKILL.md` |
| Supprimer | `.claude/skills/pedagogy/SKILL.md` |
| Inchangé | `.claude/skills/pedagogy/reference/cours.md` |
| Inchangé | `.claude/skills/pedagogy/reference/tp.md` |
| Inchangé | `.claude/skills/pedagogy/reference/slide.md` |
| Inchangé | `.claude/skills/pedagogy/reference/examen.md` |

---

### Task 1 : Créer `pedagogy/write/SKILL.md`

**Files:**
- Create: `.claude/skills/pedagogy/write/SKILL.md`

- [ ] **Step 1 : Créer le dossier et le fichier**

Créer `.claude/skills/pedagogy/write/SKILL.md` avec ce contenu exact :

```markdown
---
name: pedagogy:write
description: Rédaction de nouveaux contenus pédagogiques (Cours, TP, Slide, Examen) pour le site de cours IUT BUT Informatique.
---

# Skill — Rédaction de contenus pédagogiques IUT

## Invocation

| Commande                  | Comportement                                              |
|---------------------------|-----------------------------------------------------------|
| `/pedagogy:write`         | Demande le type (Cours / TP / Slide / Examen)             |
| `/pedagogy:write cours`   | Type Cours directement                                    |
| `/pedagogy:write tp`      | Type TP directement                                       |
| `/pedagogy:write slide`   | Type Slide directement                                    |
| `/pedagogy:write examen`  | Type Examen directement                                   |

---

## Principes communs

- **Public cible** : étudiants BUT Informatique 1ère/2ème/3eme année, débutants à intermédiaires en développement web
- **Langue** : français, **vouvoyé strict** dans toutes les instructions destinées aux étudiants
- **Ton** : précis, bienveillant, sans condescendance — expliquer le POURQUOI avant le COMMENT
- **Exemples** : toujours concrets et ancrés dans un cas réel. Jamais de `foo`, `bar`, `test1`, `exemple`
- **Composants JSX imposés** : `Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`, `CodeWithPreviewCard`, `ImageCard`, `DiagramCard`, `SectionCard`. **Jamais** de `<p>`, `<ul>`, `<li>`, `<h2>`, `<code>` bruts.
- **Apostrophes en JSX** : toujours échappées (`&apos;` ou `&rsquo;`). Guillemets : `&quot;`.
- **Structure de page** : `<article><section>` avec préfixes `A-`, `B-`, `C-` sur `<Heading level={2}>` et `1.`, `2.`, `3.` sur `<Heading level={3}>`

---

## Flux

1. Si le type de contenu n'est pas précisé, demander : **Cours / TP / Slide / Examen ?**
2. Lire le fichier de référence correspondant avec l'outil Read :
   - Cours  → `.claude/skills/pedagogy/reference/cours.md`
   - TP     → `.claude/skills/pedagogy/reference/tp.md`
   - Slide  → `.claude/skills/pedagogy/reference/slide.md`
   - Examen → `.claude/skills/pedagogy/reference/examen.md`
3. Poser **1–2 questions de contexte** avant de générer (sujet traité, cours précédent si type Cours, prérequis supposés)
4. Générer le contenu directement dans la structure JSX du projet en suivant scrupuleusement les règles du fichier de référence
```

- [ ] **Step 2 : Vérifier le frontmatter**

```powershell
Get-Content ".claude/skills/pedagogy/write/SKILL.md" | Select-Object -First 4
```

Expected :
```
---
name: pedagogy:write
description: Rédaction de nouveaux contenus pédagogiques...
---
```

- [ ] **Step 3 : Commit**

```bash
git add .claude/skills/pedagogy/write/
git commit -m "feat(skills): add pedagogy:write sub-skill"
```

---

### Task 2 : Créer `pedagogy/review/SKILL.md`

**Files:**
- Create: `.claude/skills/pedagogy/review/SKILL.md`

Différences clés par rapport au `SKILL.md` racine actuel :
1. Chaque item du rapport utilise `- [ ]` (case à cocher) — les sous-agents reçoivent cette consigne
2. La consolidation ne se termine **pas** par "Souhaitez-vous que je réécrive ?" — c'est `/pedagogy:rewrite`

- [ ] **Step 1 : Créer le fichier**

Créer `.claude/skills/pedagogy/review/SKILL.md` avec ce contenu exact :

````markdown
---
name: pedagogy:review
description: Révision et critique des contenus pédagogiques (Cours, TP, Slide, Examen) pour le site de cours IUT BUT Informatique. Dispatche 3 sous-agents en parallèle et produit un REVIEW.md avec cases à cocher.
---

# Skill — Révision de contenus pédagogiques IUT

## Invocation

```
/pedagogy:review        → révision du dossier de cours actif ou mentionné
```

---

## Étape 0 — Collecte du dossier (obligatoire avant tout dispatch)

Avant de dispatcher les sous-agents, **lire tous les fichiers du dossier cible** :

1. Identifier le dossier (ex. `src/cours/javascript/2-les-evenements/`) ; stocker son nom sous `NOM_N`
2. Lire **chaque fichier présent** avec l'outil Read : `Cours.tsx`, `Slide.tsx`, `TP.tsx`, `Examen.tsx` ;
   stocker sous `CONTENU_COURS`, `CONTENU_SLIDE`, `CONTENU_TP`, `CONTENU_EXAMEN`
3. Passer **l'intégralité du contenu de chaque fichier** aux sous-agents, clairement séparé par fichier
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

Tous les fichiers sont **simultanément en révision** : Cours.tsx, TP.tsx, Slide.tsx sont tous évalués.

---

Dispatcher les sous-agents simultanément via l'outil Agent :
- **Toujours** : Sous-agent 1 (Pédagogue) + Sous-agent 2 (Étudiant en difficulté)
- **Si `MODULE_PRECEDENT` n'est pas null** : ajouter Sous-agent 3 (Cohérence inter-modules)
- **Si `MODULE_PRECEDENT` est null** : ne pas dispatcher le Sous-agent 3

---

## Sous-agent 1 — Pédagogue expert

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
Pour chaque problème : `- [ ] [fichier / section] Problème : ... → Suggestion : ...`
Chercher : concepts introduits dans le désordre, jargon non défini, sauts logiques,
termes utilisés avant d'être expliqués.

### Guidage (TP.tsx)
Pour chaque problème : `- [ ] [section ou exercice] Problème : ... → Suggestion : ...`
Chercher : exercices qui donnent la réponse directement, exercices sans ancrage,
absence de critère de validation, guidage inadapté à la position dans la séquence.

### Cohérence Cours → TP
Pour chaque problème : `- [ ] [Cours / TP] Problème : ... → Suggestion : ...`
Chercher : concepts utilisés dans le TP mais absents du Cours, concepts enseignés
dans le Cours mais jamais mis en pratique dans le TP.

### Structure JSX et conventions (tous fichiers)
Pour chaque problème : `- [ ] [fichier / ligne] Problème : ... → Suggestion : ...`
Chercher : balises HTML brutes, composants manquants, non-respect du vouvoyé,
infinitifs dans les consignes, apostrophes non échappées.

Public cible : étudiants BUT Informatique débutants à intermédiaires.
Si aucun problème dans une section, écrire "RAS".

---

## Sous-agent 2 — Étudiant en difficulté

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

Pour chaque problème :
`- [ ] [fichier / section] Citation courte — "Ce passage me bloque parce que..." ou "Je ne comprends pas pourquoi..." ou "Cet exercice suppose que je sache X, mais X n'a pas été expliqué dans le cours."`

Si tout est clair dans un fichier, écrire "Contenu accessible — aucun blocage identifié."

---

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

---

## Consolidation

Attendre les résultats de tous les sous-agents dispatchés, puis écrire `REVIEW.md` :
- Chemin : `[dossier_cible]/REVIEW.md`
- Si le fichier existe déjà, l'écraser

```markdown
# REVIEW — [module] — [date]

---

## Rapport pédagogue
[rapport sous-agent 1, items en `- [ ]`]

---

## Rapport étudiant
[rapport sous-agent 2, items en `- [ ]`]

---

## Rapport cohérence inter-modules
> Analyse de la continuité entre [NOM_N1] et [NOM_N]

[rapport sous-agent 3, items en `- [ ]`]
```

Si `MODULE_PRECEDENT` est null, remplacer le contenu cohérence par :
- `MODULE_PRECEDENT_ERREUR` si défini
- Sinon : `> Premier module — aucun prérequis inter-modules à vérifier.`

**Ne pas proposer de réécriture.** L'utilisateur lance `/pedagogy:rewrite` s'il souhaite corriger les points identifiés.
````

- [ ] **Step 2 : Vérifier le frontmatter**

```powershell
Get-Content ".claude/skills/pedagogy/review/SKILL.md" | Select-Object -First 4
```

Expected :
```
---
name: pedagogy:review
description: Révision et critique des contenus pédagogiques...
---
```

- [ ] **Step 3 : Commit**

```bash
git add .claude/skills/pedagogy/review/
git commit -m "feat(skills): add pedagogy:review sub-skill with checkbox REVIEW.md format"
```

---

### Task 3 : Créer `pedagogy/rewrite/SKILL.md`

**Files:**
- Create: `.claude/skills/pedagogy/rewrite/SKILL.md`

- [ ] **Step 1 : Créer le fichier**

Créer `.claude/skills/pedagogy/rewrite/SKILL.md` avec ce contenu exact :

````markdown
---
name: pedagogy:rewrite
description: Réécriture guidée de contenus pédagogiques à partir d'un REVIEW.md. Regroupe les problèmes par thème, brainstorme 2-3 angles de correction par thème, réécrit et marque les items comme traités.
---

# Skill — Réécriture de contenus pédagogiques IUT

## Invocation

```
/pedagogy:rewrite        → sur un dossier contenant un REVIEW.md produit par /pedagogy:review
```

---

## Étape 0 — Vérification préalable

1. Identifier le dossier cible (mentionné dans la conversation ou dossier actif)
2. Chercher `REVIEW.md` dans ce dossier avec l'outil Read
   - **Si absent** : afficher "Aucun REVIEW.md trouvé dans [dossier] — lancez d'abord `/pedagogy:review`." et s'arrêter.
3. Lire `REVIEW.md`
4. Compter les items `[ ]` (non traités) et les items `[x]` (traités)
   - **Si tous les items sont `[x]`** : afficher "Tous les points sont déjà traités. Relancez `/pedagogy:review` pour une nouvelle révision." et s'arrêter.
5. Lire les fichiers de cours présents dans le dossier : `Cours.tsx`, `Slide.tsx`, `TP.tsx`, `Examen.tsx`

---

## Étape 1 — Regroupement par thème

Analyser les items `[ ]` et les regrouper en **3–5 thèmes transversaux**.

Exemples de thèmes (adapter au contenu réel) :
- "Jargon non défini avant utilisation"
- "Guidage trop fort dans les exercices"
- "Incohérence Cours → TP"
- "Balises HTML brutes / conventions JSX"
- "Présupposés non enseignés"

Ordonner par **priorité pédagogique** : les problèmes qui bloquent la compréhension fondamentale avant les problèmes de forme (JSX, conventions).

Présenter sous ce format :

```
Thèmes identifiés (ordonnés par priorité) :

1. [Nom du thème] — N items
   Items concernés : [référence courte de chaque item]

2. [Nom du thème] — N items
   Items concernés : ...
```

Attendre la confirmation de l'utilisateur (il peut réordonner ou exclure des thèmes) avant de continuer.

---

## Étape 2 — Brainstorm thème par thème

Pour chaque thème (un à la fois, dans l'ordre validé) :

1. Citer les items concernés (texte complet depuis REVIEW.md)
2. Proposer **2–3 angles de correction** :

```
Thème : [Nom]

Items concernés :
- [item 1 — texte complet]
- [item 2 — texte complet]

Angles de correction :

A — [Titre court]
   [Description, 2-3 phrases, compromis éventuels]

B — [Titre court]
   [Description, 2-3 phrases, compromis éventuels]

C — [Titre court] (si pertinent)
   [Description, 2-3 phrases, compromis éventuels]

Votre choix (A / B / C) ?
```

3. Attendre le choix avant de passer au thème suivant.

---

## Étape 3 — Réécriture et mise à jour REVIEW.md

Pour chaque thème dont l'angle a été validé :

1. **Réécrire les passages ciblés** dans les fichiers `.tsx` correspondants
   - Expliquer chaque changement en une phrase avant de l'appliquer
   - Utiliser les outils Edit/Write sur les fichiers du dossier cible
   - Respecter les composants JSX imposés (`Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`, etc.)
   - Respecter le vouvoyé strict dans les instructions de TP

2. **Mettre à jour `REVIEW.md`** pour chaque item traité :
   - Remplacer `- [ ]` par `- [x]`
   - Ajouter sous l'item : `  > Traité : [angle choisi — résumé en une phrase]`

Exemple de mise à jour dans REVIEW.md :
```
- [x] [TP / Exercice 2] Problème : guidage trop fort → Suggestion : ...
  > Traité : Angle B — consigne reformulée en objectif fonctionnel uniquement
```

3. Après traitement de tous les thèmes, afficher :

```
REVIEW.md mise à jour — [N] items traités, [M] items restants.
```

Si tous les items sont `[x]` :
```
REVIEW.md complète — tous les points ont été traités.
```

---

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| REVIEW.md absent | Message explicite + arrêt (Étape 0) |
| Tous les items déjà `[x]` | Message explicite + arrêt (Étape 0) |
| Fichier `.tsx` mentionné dans REVIEW.md absent | Signaler le fichier manquant, passer à l'item suivant |
| Utilisateur refuse tous les angles proposés | Proposer de sauter l'item ou de brainstormer un angle personnalisé |
````

- [ ] **Step 2 : Vérifier le frontmatter**

```powershell
Get-Content ".claude/skills/pedagogy/rewrite/SKILL.md" | Select-Object -First 4
```

Expected :
```
---
name: pedagogy:rewrite
description: Réécriture guidée de contenus pédagogiques...
---
```

- [ ] **Step 3 : Commit**

```bash
git add .claude/skills/pedagogy/rewrite/
git commit -m "feat(skills): add pedagogy:rewrite sub-skill"
```

---

### Task 4 : Supprimer le `SKILL.md` racine

**Files:**
- Delete: `.claude/skills/pedagogy/SKILL.md`

Prérequis : les Tasks 1–3 sont terminées (les 3 sous-skills existent et sont commités).

- [ ] **Step 1 : Supprimer le fichier**

```powershell
Remove-Item ".claude/skills/pedagogy/SKILL.md"
```

- [ ] **Step 2 : Vérifier la suppression**

```powershell
Test-Path ".claude/skills/pedagogy/SKILL.md"
```

Expected : `False`

- [ ] **Step 3 : Vérifier que les sous-dossiers sont intacts**

```powershell
Get-ChildItem ".claude/skills/pedagogy/" | Select-Object Name
```

Expected : `reference`, `review`, `rewrite`, `write` (pas de `SKILL.md` à la racine)

- [ ] **Step 4 : Commit**

```bash
git add -A
git commit -m "chore(skills): remove legacy pedagogy root SKILL.md (replaced by sub-skills)"
```

---

### Task 5 : Vérification finale

- [ ] **Step 1 : Recharger les plugins dans Claude Code**

Taper dans Claude Code : `/reload-plugins`

Expected : les 3 sous-skills apparaissent dans la liste disponible : `pedagogy:write`, `pedagogy:review`, `pedagogy:rewrite`

- [ ] **Step 2 : Smoke test `/pedagogy:write`**

Invoquer `/pedagogy:write`. Vérifier qu'il demande : "Cours / TP / Slide / Examen ?"

- [ ] **Step 3 : Smoke test `/pedagogy:review`**

Mentionner `src/cours/javascript/2-les-evenements/` et invoquer `/pedagogy:review`.
Vérifier qu'il exécute l'Étape 0 (lecture du dossier + identification N-1) et dispatche les sous-agents.

- [ ] **Step 4 : Smoke test `/pedagogy:rewrite` sans REVIEW.md**

Invoquer `/pedagogy:rewrite` sur un dossier sans `REVIEW.md`.
Expected : "Aucun REVIEW.md trouvé dans [...] — lancez d'abord `/pedagogy:review`."
