---
name: pedagogy-review
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
4. **Charger le curriculum de la matière** :
   - Dériver `[matiere]` depuis le dossier cible (ex. `src/cours/javascript/1-le-dom/` → `javascript`)
   - Lire `reviews/[matiere]-curriculum.md` avec l'outil Read
   - **Si le fichier existe** : stocker son contenu sous `CONTENU_CURRICULUM` ;
     définir `CURRICULUM_DISPONIBLE = true`
   - **Si absent** : définir `CURRICULUM_DISPONIBLE = false`,
     stocker dans `CURRICULUM_ERREUR` :
     "Curriculum introuvable pour [matiere] — lancez `/pedagogy:sync` sur les modules précédents
     pour activer la vérification inter-modules étendue."

Tous les fichiers sont **simultanément en révision** : Cours.tsx, TP.tsx, Slide.tsx sont tous évalués.

---

Dispatcher les sous-agents simultanément via l'outil Agent :
- **Toujours** : Sous-agent 1 (Pédagogue) + Sous-agent 2 (Étudiant en difficulté)
- **Si `CURRICULUM_DISPONIBLE` est true** : ajouter Sous-agent 3 (Cohérence inter-modules)
- **Si `CURRICULUM_DISPONIBLE` est false** : ne pas dispatcher le Sous-agent 3

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

---

## Consolidation

Attendre les résultats de tous les sous-agents dispatchés, puis écrire `REVIEW.md` :
- Dériver `[matiere]` et `[n-slug]` depuis les deux derniers segments non vides du chemin `dossier_cible`
  (ex. `src/cours/javascript/1-le-dom/` → `matiere=javascript`, `n-slug=1-le-dom`)
- Écrire dans `reviews/[matiere]-[n-slug]-REVIEW.md` à la racine du projet
- Créer le dossier `reviews/` s'il n'existe pas. Si le fichier existe déjà, l'écraser.

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

Si `CURRICULUM_DISPONIBLE` est false, remplacer le contenu cohérence par :
- `CURRICULUM_ERREUR` si défini
- Sinon : `> Curriculum absent — lancez \`/pedagogy:sync\` sur les modules précédents pour activer la vérification inter-modules.`

Après écriture du REVIEW.md, **invoquer `/pedagogy:sync`** sur le dossier cible pour mettre à jour
le curriculum avec le contenu du module qui vient d'être reviewé.

**Ne pas proposer de réécriture.** L'utilisateur lance `/pedagogy:rewrite` s'il souhaite corriger les points identifiés.
