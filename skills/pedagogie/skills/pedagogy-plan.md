# Skill — Plan de module pédagogique

## Objectif

Concevoir le plan d'un module BUT Informatique : définir les objectifs globaux et
brainstormer la liste ordonnée des sections. Afficher le plan dans le chat, puis créer
le module et les sections via MCP après validation explicite.

## Invocation

```
/pedagogy:plan                       → collecte le contexte
/pedagogy:plan "les tableaux JS"     → sujet pré-rempli
```

---

## Étape 1 — Collecte du contexte

Poser ces questions si les informations sont manquantes (en une seule fois) :

| Champ | Question | Exemples |
|-------|----------|---------|
| `sujet` | Quel est le sujet du module ? | "Les tableaux en JavaScript" |
| `matiere` | Quelle matière ? | `javascript`, `html-css`, `php`, `brainfuck` |
| `niveau` | Niveau des étudiants | débutant / intermédiaire / avancé |
| `volume` | Nombre de séances (2h chacune) | 3, 4, 6 |
| `prerequis` | Modules ou notions prérequis | "variables JS" — ou "aucun" |

Ne jamais inventer ces valeurs. Marquer "indisponible" si l'utilisateur ne répond pas.

---

## Étape 2 — Consultation MCP (optionnelle mais recommandée)

Si `list_modules` est disponible :

```
list_modules()
list_sections(module=[matiere])
```

Objectif : détecter les notions déjà enseignées, éviter les doublons et les manques
de prérequis. Si indisponible, continuer sans blocage (`CONTEXTE_MCP = indisponible`).

---

## Étape 3 — Brainstorm interne (ne pas afficher)

Raisonner en silence avant de produire le plan :

1. **Brainstorm libre** : 10-15 sections candidates sans filtre
2. **Filtre** : éliminer ce qui dépasse une séance de 2h, ce qui est hors périmètre,
   ce qui est déjà couvert (si CONTEXTE_MCP disponible)
3. **Ordre** : du concret vers l'abstrait, du problème vers la solution,
   prérequis avant dépendants
4. **Alignement** : chaque objectif global doit être couvert par au moins une section

---

## Étape 4 — Affichage du plan dans le chat

Produire le plan en markdown. Format imposé :

```markdown
# Plan — [Sujet] · [Matière] · [Niveau]

## Objectifs globaux du module

À l'issue de ce module, l'étudiant sera capable de :

1. [Objectif observable — verbe d'action + critère mesurable]
2. [Objectif observable]
3. [Objectif observable]
(3 à 5 objectifs maximum)

---

## Sections proposées

### Section 1 — [Titre]
- **Objectif** : [compétence spécifique couverte]
- **Notions clés** : [liste courte]
- **Durée estimée** : [N séance(s) de 2h]
- **Prérequis** : [sections précédentes ou "aucun"]
- **Type de contenu dominant** : Cours / TP / Cours + TP

### Section 2 — [Titre]
[même structure]

---

## Vérification d'alignement

| Objectif global | Couverte par |
|-----------------|--------------|
| [Objectif 1] | Section X, Section Y |
| [Objectif 2] | Section Z |

---

## Prochaine étape

Répondre **"oui"** (ou **"valider"**) pour créer le module et les sections via MCP.
Indiquer les modifications souhaitées pour réviser le plan avant création.
```

---

## Étape 5 — Attendre la validation explicite

Ne pas appeler les outils MCP d'écriture avant que l'utilisateur ait dit "oui",
"valider", "ok", "c'est bon" ou équivalent.

Si l'utilisateur modifie le plan (ajoute/supprime/renomme des sections), mettre à jour
le plan affiché et redemander la validation.

---

## Étape 6 — Création via MCP (après validation)

### 6a — Créer le module

```
create_module({
  title: "[Sujet]",
  matiere: "[matiere]",
  description: "[Objectifs globaux résumés en 1 phrase]"
})
```

Stocker le `moduleSlug` retourné.

### 6b — Créer chaque section dans l'ordre

```
create_section({
  moduleSlug: "[moduleSlug]",
  title: "[Titre de la section]",
  description: "[Objectif spécifique de la section]"
})
```

Attendre la confirmation de chaque appel avant le suivant.

### 6c — Vérifier

```
list_sections(module=[moduleSlug])
```

Afficher la liste résultante pour confirmer que toutes les sections ont été créées.

---

## Règles impératives

- **Jamais** appeler `create_module` ou `create_section` avant la validation explicite.
- **Jamais** inventer le `moduleSlug` — utiliser celui retourné par `create_module`.
- **Jamais** créer plus de sections que validées.
- Si un appel MCP échoue, afficher l'erreur et proposer de réessayer — ne pas continuer
  en silence.
- Chaque section doit couvrir exactement **une compétence principale**.
- Une section = maximum **une séance de 2h**.
