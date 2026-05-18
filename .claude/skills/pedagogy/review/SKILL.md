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

```
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
