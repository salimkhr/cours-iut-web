---
name: pedagogy-review
description: Révision et critique des contenus pédagogiques (Cours, TP, Slide, Examen) pour le site de cours IUT BUT Informatique. Dispatche les sous-agents selon le type de modification et produit un REVIEW.md avec cases à cocher.
---

# Skill — Révision de contenus pédagogiques IUT

## Invocation

```
/pedagogy:review        → révision du dossier de cours actif ou mentionné
```

---

## Étape 0 — Collecte du dossier (obligatoire avant tout dispatch)

1. Identifier le dossier cible (ex. `src/cours/javascript/2-les-evenements/`) ; stocker sous `DOSSIER_N` et `NOM_N`
2. Lire chaque fichier présent avec l'outil Read : `Cours.tsx`, `Slide.tsx`, `TP.tsx`, `Examen.tsx`
   - Stocker sous `CONTENU_COURS`, `CONTENU_SLIDE`, `CONTENU_TP`, `CONTENU_EXAMEN`
   - Les fichiers absents sont ignorés silencieusement ; noter `MANQUANT` pour les supports concernés
3. Dériver `[matiere]` depuis le dossier (ex. `javascript`)
4. Lire `reviews/[matiere]-curriculum.md` :
   - Si présent : `CURRICULUM_DISPONIBLE = true` ; stocker sous `CONTENU_CURRICULUM`
   - Si absent : `CURRICULUM_DISPONIBLE = false` ; `CURRICULUM_ERREUR = "Curriculum introuvable — lancez /pedagogy:sync sur les modules précédents"`

## Routage (choisir le workflow avant de dispatcher)

**Modification locale** (correction orthographique, reformulation, typographie) :
→ Agent principal uniquement — aucun sous-agent.

**Révision d'un seul support** (amélioration cours, nouveau TP simple, slides d'un cours stable) :
→ Concepteur + Auditeur apprenant + consolidation.
→ Ajouter le Garant si `CURRICULUM_DISPONIBLE = true` ET contenu dépend du parcours.

**Modification structurante** (objectif, notion, prérequis, évaluation) :
→ Les trois sous-agents + consolidation.

**Révision d'une unité complète (Cours + Slide + TP)** :
→ Les trois sous-agents sont **obligatoires**.

---

## Contrat d'entrée commun

Construire ce brief avant de dispatcher les sous-agents.
Marquer les champs inconnus comme "indisponible" — ne jamais inventer.

```yaml
task:
  mode: review
  requested_outputs: [cours présents]

audience:
  profile: "BUT Informatique"
  initial_level: "débutant à intermédiaire"

learning_unit:
  title: "[NOM_N]"
  curriculum_position: "[matiere] / [NOM_N]"

related_materials:
  previous_courses: "[CONTENU_CURRICULUM si disponible, sinon indisponible]"
  current_course: "[CONTENU_COURS ou MANQUANT]"
  current_slides: "[CONTENU_SLIDE ou MANQUANT]"
  current_practical_work: "[CONTENU_TP ou MANQUANT]"
```

---

## Sous-agent 1 — Concepteur d'unité pédagogique multi-supports

Prompt à utiliser (injecter le contrat d'entrée + contenus) :

```
Tu es un Concepteur d'unité pédagogique multi-supports (rôle : instructional_designer).
Tu conçois ou révises l'unité en raisonnant conjointement sur les trois supports.
Tu ne publies jamais directement les modifications.

[CONTRAT D'ENTRÉE]

**Cours.tsx** :
[CONTENU_COURS]

**Slide.tsx** :
[CONTENU_SLIDE]

**TP.tsx** :
[CONTENU_TP]

## Rapport Concepteur

Produis d'abord une carte d'alignement (public, objectif, prérequis, rôle des trois supports,
transitions). Ensuite, pour chaque problème de conception :

`- [ ] [fichier / section] Problème : ... → Suggestion : ...`

Sections à couvrir :
- Alignement des objectifs entre supports
- Progression et ordre des notions
- Rôle de chaque support (cours vs slides vs TP)
- Exemples (compatibilité, transfert)
- Transitions avec le parcours

Public cible : étudiants BUT Informatique débutants à intermédiaires.
Si aucun problème dans une section, écrire "RAS".
```

---

## Sous-agent 2 — Auditeur du point de vue d'un apprenant en difficulté

Prompt à utiliser (injecter le contrat d'entrée + contenus) :

```
Tu représentes un apprenant BUT Informatique sérieux mais fragile.
Tu as suivi les contenus précédents mais tu manques d'aisance.
Tu n'es PAS un apprenant qui refuse de travailler.

[CONTRAT D'ENTRÉE]

Lis dans l'ordre où tu recevrais les contenus :

**Cours.tsx** (avant la séance) :
[CONTENU_COURS]

**Slide.tsx** (pendant la séance) :
[CONTENU_SLIDE]

**TP.tsx** (après la séance) :
[CONTENU_TP]

## Rapport Auditeur apprenant

Pour chaque blocage identifié, utiliser ce format YAML :

```yaml
finding:
  severity: blocking | important | improvement
  support: course | slides | practical_work
  location: "[fichier / section]"
  learner_goal: "Ce que j'essaie de faire"
  obstacle: "Ce qui me bloque"
  implicit_knowledge: "Ce que le contenu suppose acquis mais n'a pas enseigné"
  learner_impact: "bloqué / confus / découragé"
  recommendation: "Suggestion concrète"
  confidence: high | medium | low
```

Si aucun blocage dans un support : "Support accessible — aucun blocage identifié."
```

---

## Sous-agent 3 — Garant de cohérence curriculaire et multi-supports

*(Dispatché si `CURRICULUM_DISPONIBLE = true` OU si révision d'unité complète)*

Prompt à utiliser (injecter contrat d'entrée + curriculum + contenus) :

```
Tu es le Garant de cohérence curriculaire et multi-supports.
Tu vérifies qu'une unité occupe la bonne place dans le parcours
et que ses trois supports sont alignés.

[CONTRAT D'ENTRÉE]

**Curriculum des modules précédents** :
[CONTENU_CURRICULUM ou "Curriculum non disponible — analyse limitée aux supports fournis"]

**Module — [NOM_N]**
Cours.tsx : [CONTENU_COURS]
Slide.tsx : [CONTENU_SLIDE]
TP.tsx : [CONTENU_TP]

## Rapport Garant de cohérence

Pour chaque problème, utiliser ce format YAML :

```yaml
finding:
  severity: blocking | important | improvement
  scope: curriculum | course | slides | practical_work | multi_support
  location: "[module / section / support]"
  observation: "Constat factuel"
  evidence: "Citation ou référence précise"
  curriculum_impact: "Impact sur le parcours (aucun si non applicable)"
  affected_supports: [course, slides, practical_work]
  recommendation: "Suggestion concrète"
  confidence: high | medium | low
```

Sections à couvrir :
1. Cohérence avec le curriculum précédent (notions présupposées, répétitions sans progression)
2. Cohérence multi-supports (objectifs, vocabulaire, exemples, versions techniques)
3. Analyse d'impact (modifications d'un support sur les autres)

Si aucun problème : "RAS — cohérence vérifiée."
```

---

## Consolidation

Attendre tous les sous-agents dispatchés, puis :

1. **Dédupliquer** : regrouper les constats portant sur le même problème.
2. **Arbitrer** : pour les recommandations contradictoires, conserver la plus précise ;
   signaler explicitement l'arbitrage.
3. **Prioriser** : traiter les `blocking` avant les `important` avant les `improvement`.
4. **Produire l'analyse d'impact** si supports manquants :

```markdown
# Impact sur les supports liés

## Supports modifiés nécessaires
[liste]

## Supports modifiés recommandés
[liste avec justification]
```

5. **Écrire le REVIEW.md** :
   - Dériver `[matiere]` et `[n-slug]` (ex. `javascript`, `2-les-evenements`)
   - Écrire dans `reviews/[matiere]-[n-slug]-REVIEW.md` (écraser si existant)

```
# REVIEW — [NOM_N] — [date]

---

## Rapport Concepteur
[rapport sous-agent 1, items en `- [ ]`]

---

## Rapport Auditeur apprenant
[rapport sous-agent 2, findings YAML + items `- [ ]`]

---

## Rapport Garant de cohérence
[rapport sous-agent 3, findings YAML + items `- [ ]` — ou CURRICULUM_ERREUR si absent]

---

## Analyse d'impact multi-supports
[si applicable]
```

6. **Invoquer `/pedagogy:sync`** sur le dossier cible après écriture.
7. **Ne pas proposer de réécriture.** Utiliser `/pedagogy:rewrite` pour corriger les points identifiés.
