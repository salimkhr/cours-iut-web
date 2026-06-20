# Plan B — Skill `/pedagogy:module` (brainstorm de curriculum)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un nouveau skill local `/pedagogy:module` qui brainstorme le curriculum d'un module (sections ordonnées + objectifs + types de contenu), fait valider le plan, puis crée le squelette via les outils MCP du Plan A.

**Architecture:** Un seul fichier `.claude/skills/pedagogy-module/SKILL.md` (markdown + frontmatter), suivant le format des skills pedagogy existants. Le skill orchestre : cadrage → brainstorm → plan validé → appels MCP (`create_module`, `create_section`) → renvoi vers `/pedagogy:write`.

**Tech Stack:** Skill markdown (frontmatter `name`/`description`), s'appuie sur les outils MCP du Plan A et les skills `pedagogy-write` / références `pedagogy/reference/*`.

**Dépendance :** le Plan A (outils MCP) doit être implémenté et le serveur MCP connecté pour le chemin « création ». Sans MCP, le skill sort le plan en markdown.

**Note tests :** un skill est du contenu markdown ; « vérification » = invoquer `/pedagogy:module` et constater que le flux est respecté (critères d'acceptation en Task 2).

---

## Structure des fichiers

| Fichier | Responsabilité | Action |
|---|---|---|
| `.claude/skills/pedagogy-module/SKILL.md` | Flux de brainstorm de curriculum + orchestration MCP | **Créer** |

Pas de fichier de référence supplémentaire : le skill réutilise les principes de
`.claude/skills/pedagogy-write/SKILL.md` et les références `pedagogy/reference/*`.

---

## Task 1: Créer le skill `pedagogy-module`

**Files:**
- Create: `.claude/skills/pedagogy-module/SKILL.md`

- [ ] **Step 1: Écrire `.claude/skills/pedagogy-module/SKILL.md`**

```markdown
---
name: pedagogy-module
description: Brainstorm du curriculum d'un nouveau module (sections ordonnées + objectifs + types de contenu) pour le site de cours IUT BUT Informatique, puis création du squelette via les outils MCP.
---

# Skill — Brainstorm & création d'un module pédagogique

## Invocation

| Commande                   | Comportement                                  |
|----------------------------|-----------------------------------------------|
| `/pedagogy:module`         | Demande le sujet du module                    |
| `/pedagogy:module rust`    | Sujet « Rust » directement                    |

## Rôle

Concevoir le **curriculum** d'un nouveau module, puis créer son **squelette** (module + sections +
cours/TP/examen vides) via les outils MCP. Le **contenu** des cours/TP se rédige ensuite avec
`/pedagogy:write`. Ce skill ne rédige PAS le contenu : il structure et crée le squelette.

## Principes (hérités de pedagogy)

- Public : étudiants BUT Informatique, débutants à intermédiaires. Vouvoiement strict côté étudiant.
- Progression : chaque section s'appuie sur les précédentes ; expliciter les prérequis.
- Objectifs d'apprentissage formulés par capacité (« À la fin, vous saurez… »).
- Types de contenu créables : **cours**, **TP**, **examen** (slide/projet hors périmètre du builder).

## Flux

1. **Cadrage** — poser ces questions **une à la fois** (attendre la réponse avant la suivante) :
   - Sujet et intitulé du module (si non fourni).
   - Public visé (année BUT) et prérequis supposés.
   - Ampleur : nombre de séances/sections visé, et grande progression souhaitée.
2. **Brainstorm du curriculum** — proposer une **liste ordonnée de sections**, chacune avec :
   - un `title` clair,
   - 2-4 **objectifs d'apprentissage**,
   - les **types de contenu** (`cours` / `TP` / `examen`).
   Proposer, ajuster avec l'utilisateur, **faire valider le plan complet**.
3. **Création du squelette** (après validation) — via les outils MCP, dans l'ordre :
   - `create_module` avec `title` (et `description` si pertinent ; `iconName` optionnel).
   - pour chaque section, dans l'ordre : `create_section` avec `module`, `title`, `contentTypes`,
     `order`, `objectives`, `totalDuration`.
   Annoncer la progression (« Section 3/6 créée »).
4. **Conclusion** — indiquer le path du module et inviter à remplir le contenu :
   « Squelette créé. Lancez `/pedagogy:write cours` pour rédiger la première section. »

## Si le MCP n'est pas connecté

Ne pas bloquer : présenter le **plan de curriculum en markdown** (tableau sections / objectifs /
types) pour création manuelle ultérieure dans l'admin, et le signaler clairement.

## Garde-fous

- Ne jamais créer le squelette **avant** validation explicite du plan par l'utilisateur.
- Ne pas inventer de métadonnées admin (coefficients, SAE, intervenants) : laissées vides,
  `isExtra:true` par défaut côté MCP.
- Une seule `create_module` par module ; si le path existe déjà, le signaler et proposer un autre.
```

- [ ] **Step 2: Vérifier la structure du fichier**

Run: `ls .claude/skills/pedagogy-module/SKILL.md`
Expected: le fichier existe. Frontmatter `name: pedagogy-module` présent en tête.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/pedagogy-module/SKILL.md
git commit -m "feat(skill): /pedagogy:module — brainstorm de curriculum + création squelette MCP

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Vérification fonctionnelle du skill

Pas de code : invoquer le skill et constater le respect du flux. Le chemin « création » suppose le
Plan A implémenté + MCP connecté ; sinon vérifier le fallback markdown.

- [ ] **Step 1: Invocation et cadrage**

Lancer `/pedagogy:module rust`.
Expected : le skill pose les questions de cadrage **une à la fois** (public/prérequis, puis ampleur),
sans tout demander d'un coup.

- [ ] **Step 2: Brainstorm + validation**

Expected : le skill propose une liste **ordonnée** de sections, chacune avec objectifs + types de
contenu (`cours`/`TP`/`examen`), et **demande validation** avant toute création.

- [ ] **Step 3: Création (MCP connecté) ou fallback**

Expected, si MCP connecté : appels `create_module` puis `create_section` ×N, avec annonce de
progression, puis renvoi vers `/pedagogy:write`. Si MCP non connecté : le plan est sorti en markdown
et l'absence de MCP est signalée — pas de blocage.

---

## Auto-revue (effectuée à l'écriture)

- **Couverture spec** : §5 (flux, invocation, dépendance MCP, fallback) → Task 1 ; vérif §8 (skill
  produit un plan ordonné puis appelle les outils) → Task 2. OK.
- **Placeholders** : aucun ; le contenu complet du SKILL.md est fourni.
- **Cohérence** : noms d'outils MCP (`create_module`, `create_section`) et leurs arguments alignés
  sur le Plan A (Tasks 1-2) ; types de contenu limités à `cours`/`TP`/`examen` comme dans la spec ;
  `isExtra:true` et métadonnées vides cohérents avec le Plan A.
