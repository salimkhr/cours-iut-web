---
name: pedagogy-sync
description: À utiliser après création ou modification d'un contenu pédagogique pour tenir le fichier curriculum du module à jour.
---

# Skill — Synchronisation du curriculum pédagogique

## Invocation

```
/pedagogy:sync [module] [section]     → sur la section mentionnée ou active
```

## Étape 1 — Identification

Identifier `module` et `section` (slugs DB, via args, conversation ou question).

## Étape 2 — Lecture via MCP

`get_content(module, section, type)` pour chaque type parmi cours, slide, TP.
Types absents : ignorés silencieusement. **Aucun contenu en DB pour la section →
STOP** avec message explicite.

## Étape 3 — Extraction

Depuis les arbres de blocs :

**Concepts introduits** — notions nommées et expliquées : termes définis, mécanismes
décrits, distinctions établies.
Sources : blocs `text`, `heading`, `list`/`list-item`, `callout` (cours et slides).
Format : une ligne par concept (ex : « Portée des variables (scope) »).

**APIs / méthodes enseignées** — fonctions, méthodes, propriétés présentes dans les
exemples.
Sources : blocs `code` et `code-with-preview` (tous supports).
Format : `objet.méthode` ou `méthode` (ex : `document.querySelector`).

Ne pas inclure : notions mentionnées sans être expliquées, code d'infrastructure des
blocs.

## Étape 4 — Mise à jour du curriculum

1. Lire `reviews/[module]-curriculum.md` (créer avec l'en-tête `# Curriculum —
   [module]` si absent).
2. Section `## [section]` existante → remplacer intégralement ; sinon insérer à la
   position correcte (ordre des sections du module via `list_sections`).
3. Format de section :

```markdown
## [section] — [date YYYY-MM-DD]

### Concepts introduits
- [concept]

### APIs / méthodes enseignées
- [api]

---
```

## Étape 5 — Confirmation

Afficher : `Curriculum mis à jour — [module]/[section] : N concepts, M APIs.`

## Périmètre strict

Ce skill ne fait **pas** : juger la qualité, produire un REVIEW.md, proposer des
corrections, dispatcher des sous-agents.
