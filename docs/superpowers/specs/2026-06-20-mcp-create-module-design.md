# Design — Création de module via MCP + skill `/pedagogy:module`

- **Date** : 2026-06-20
- **Statut** : validé en brainstorming, en attente de relecture avant plan
- **Auteur** : Salim + Claude

## 1. Contexte et objectif

Le serveur MCP (`src/app/api/mcp/route.ts`) sait éditer le **contenu** (arbre de blocs) d'un
cours/TP/examen existant, mais ne sait pas **créer la structure** : un module et ses sections.
Aujourd'hui ça passe par l'admin web (`POST /api/admin/modules`, `POST /api/admin/[id]/sections`).

Objectif : permettre, depuis Claude, de **créer un module avec ses sections et le squelette de ses
cours/TP**, piloté par un nouveau skill de **brainstorm de curriculum** `/pedagogy:module`.

Exemple visé : « créer un module Rust » → brainstorm du curriculum → création des sections →
squelette des cours/TP (vides), prêts à être remplis par `/pedagogy:write`.

### Non-objectifs (YAGNI)

- Pas de génération du **contenu pédagogique** ici : le MCP crée un **squelette vide**
  (`course_content` avec `blocks:[]`). Le remplissage reste `/pedagogy:write` + `insert_block`.
- Pas de métadonnées admin (coefficients par compétence, SAE, intervenants, responsable) :
  défautées vides, `isExtra:true`. À compléter dans l'admin web si besoin.
- Pas de `delete_module` / `delete_section` (parkés).
- Pas de support builder des types `slide` / `projet` (rendu distinct, sans blocs).

### Découpage en deux plans

L'implémentation est scindée en **deux plans** indépendants, dans l'ordre :

1. **Plan A — Outils MCP** (`create_module`, `create_section`, `edit_section`). Backend pur,
   testable seul, sans dépendance au skill.
2. **Plan B — Skill `/pedagogy:module`** (brainstorm de curriculum qui pilote les outils du Plan A).
   Dépend du Plan A.

## 2. Décisions actées (brainstorming)

| Décision | Choix |
|---|---|
| Niveau de création | **Squelette vide** (structure, pas de contenu) |
| Métadonnées | **Structure pédagogique seule** (admin défauté, `isExtra:true`) |
| Phase brainstorm | **Nouveau skill `/pedagogy:module`** |
| Granularité MCP | **Outils granulaires** : `create_module`, `create_section`, `edit_section` |
| `edit_section` | Édition **métadonnées** + `contentTypes` **additif seul** (retrait via `delete_content`) |
| Types de contenu db | **`cours` / `TP` / `examen`** uniquement (`slide`/`projet` parkés) |

## 3. Modèle de données (rappel)

- `modules` : `Module { title, path, iconName, description?, sections: Section[], coefficients[],
  associatedSae[], instructors[], manager?, isExtra?, updatedAt? }`.
- `Section { title, path, order, contents: ContentRef[], objectives?[], tags[], totalDuration,
  hasCorrection, isAvailable?, correctionIsAvailable?, examenIsLock?, icon? }`.
- `ContentRef { type: "cours"|"TP"|"slide"|"projet"|"examen", source: "file"|"db", contentId? }`.
- `course_content { moduleSlug, sectionSlug, contentType, blocks, version, createdAt, updatedAt }`.

Un module créé par MCP **n'a pas de `.tsx`** : chaque contenu doit être `source:"db"` dès la
création (sinon le rendu tente de charger un fichier inexistant), avec un `course_content` vide.

## 4. Nouveaux outils MCP (admin-only)

Ajoutés à `src/app/api/mcp/route.ts`, gatés par `isAdmin` comme les autres écritures. Validation
réutilisant les schémas Zod existants (`moduleFormSchema`, `sectionApiSchema`). Données
**applicatives** (`modules`, `course_content`) → accès Mongo direct autorisé (pas de l'auth).

### 4.1 `create_module`

- **Entrées** : `title` (requis), `iconName?` (défaut `"Code"`), `path?` (sinon dérivé kebab-case
  du titre), `description?`.
- **Effet** : insère un `Module` avec `sections:[]`, `coefficients:[]`, `associatedSae:[]`,
  `instructors:[]`, `isExtra:true`, `updatedAt:now`. Validé par `moduleFormSchema`.
- **Garde** : rejette si un module avec ce `path` existe déjà.
- **Retour** : `{ moduleId, path }`.

### 4.2 `create_section`

- **Entrées** : `module` (path), `title` (requis), `contentTypes: ("cours"|"TP"|"examen")[]` (≥1),
  `order?` (défaut = max(order existant)+1), `path?` (dérivé), `objectives?: string[]`,
  `totalDuration?` (défaut 1), `tags?: string[]`, `icon?`.
- **Effet** :
  1. Pour chaque `contentType` : crée un `course_content` vide (`blocks:[]`, `version:1`) et
     construit un `ContentRef {type, source:"db", contentId}`.
  2. `$push` la section (validée par `sectionApiSchema`) avec booléens défaut `false`
     (`hasCorrection`, `isAvailable`, `correctionIsAvailable`, `examenIsLock`).
  3. `revalidateTag` des contenus créés.
- **Gardes** : module introuvable → erreur ; `path` de section déjà présent dans le module → rejet.
- **Retour** : `{ sectionPath, order, contentIds }`.

### 4.3 `edit_section`

- **Entrées** : `module`, `sectionPath` (identifie la section), + champs optionnels :
  `title`, `newPath`, `order`, `objectives`, `totalDuration`, `tags`, `icon`,
  `isAvailable`, `hasCorrection`, `correctionIsAvailable`, `examenIsLock`,
  `addContentTypes?: ("cours"|"TP"|"examen")[]`.
- **Métadonnées** : champs fournis mis à jour (rename du `title`, nombre de séances via
  `totalDuration`, ordre, objectifs, flags…).
- **`addContentTypes` (additif seul)** : pour chaque type **absent** de la section, crée un
  `course_content` vide + ajoute le `ContentRef` db. Ne retire jamais (retrait = `delete_content`).
- **Rename de `path` (`newPath`)** : cascade — met à jour `sectionSlug` dans tous les
  `course_content` de cette section, met à jour `section.path`, et `revalidateTag` sur l'ancienne
  **et** la nouvelle clé. Sans cascade les contenus seraient orphelins.
- **Gardes** : module/section introuvable → erreur ; `newPath` déjà pris dans le module → rejet.
- **Retour** : `{ sectionPath }`.

## 5. Skill `/pedagogy:module`

Nouveau skill local `.claude/skills/pedagogy-module/SKILL.md`. Skill de **brainstorm de
curriculum** (discipline brainstorming : une question à la fois, proposer, faire valider), aligné
sur les principes pedagogy (public BUT Info, vouvoiement, exemples concrets, expliquer le pourquoi).

**Flux :**
1. Cadrage (1 question à la fois) : sujet du module, public/année, prérequis supposés, ampleur
   (nombre de séances/sections visé, progression).
2. Brainstorm du **curriculum** : liste **ordonnée** de sections, chacune avec `title`,
   **objectifs d'apprentissage**, et **types de contenu** (`cours`/`TP`/`examen`).
3. Présente le **plan structuré**, le fait valider.
4. Propose de **créer le squelette** via le MCP : `create_module` puis `create_section` ×N.
5. Conclut en renvoyant vers `/pedagogy:write <type>` pour remplir chaque contenu.

**Dépendance MCP** : le skill utilise les outils MCP comme chemin primaire (serveur connecté à
Claude). Si le MCP n'est pas connecté, il **sort le plan** (markdown) pour création manuelle.

**Invocation** : `/pedagogy:module` (demande le sujet) ou `/pedagogy:module rust` (sujet direct).

## 6. Flux complet (exemple Rust)

```
/pedagogy:module rust
  → cadrage : public BUT2, prérequis = bases prog, ~6 séances
  → brainstorm : 6 sections (Ownership, Borrowing & lifetimes, Structs & enums,
    Traits, Gestion d'erreurs, Concurrence), chacune {cours, TP} + objectifs
  → validation du plan
  → create_module("Rust", iconName, description)
  → create_section ×6  (chaque appel crée les course_content vides)
  → "Squelette créé. Lance /pedagogy:write cours pour la section Ownership."
```

## 7. Risques et points à vérifier

1. **`iconName`** : rendu via `iconMap[iconName]` avec **fallback `BookOpen`**. Défaut retenu
   `"Code"` (nom lucide déjà utilisé, présent dans `iconMap`). Le skill peut proposer mieux, mais
   aucune lecture de liste d'icônes n'est nécessaire — le fallback couvre les noms inconnus.
2. **Cascade de rename `newPath`** : bien revalider l'ancienne ET la nouvelle clé de cache, et
   couvrir tous les `contentType` de la section.
3. **`order` par défaut** : calculé sur les sections existantes au moment de l'appel (pas de course
   condition critique en usage mono-admin).
4. **Connexion MCP** : ces outils ne sont utilisables qu'une fois le serveur MCP déployé et
   connecté (cf. travail Scalekit en pause). En attendant, le skill peut sortir le plan.

## 8. Vérification

- **Build** : `bun run build` passe après ajout des 3 outils.
- **create_module** : rejette un `path` dupliqué ; crée bien `isExtra:true` + tableaux vides.
- **create_section** : crée N `course_content` vides + `ContentRef` db ; `order` auto correct ;
  `get_content` renvoie `blocks:[]` `source:"db"` pour chaque type.
- **edit_section** : rename `title` OK ; `totalDuration` mis à jour ; `addContentTypes` additif crée
  les contenus manquants sans toucher aux existants ; rename `newPath` cascade le `sectionSlug`.
- **Skill** : `/pedagogy:module rust` produit un plan ordonné cohérent, puis appelle les outils.
