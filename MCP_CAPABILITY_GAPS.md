# Lacunes de capacité MCP — Skill pédagogique

Dernière mise à jour : 2026-07-12.

Ce document liste les capacités encore manquantes pour automatiser les audits pédagogiques.
Il ne doit pas répéter les outils déjà disponibles dans le serveur MCP.

## Capacités disponibles à ne plus considérer comme des lacunes

- `get_content(module, section, type)` : retourne l'arbre de blocs complet.
- `export_content_compact(module, section?, type?)` : fournit un export Markdown compact, annoté avec les IDs de blocs.
- `search_content(query, module?, type?, limit?)` : recherche plein texte dans les contenus migrés.
- `get_migration_status()` : indique les contenus disponibles via la base et ceux encore hors migration.
- `list_block_types()` : expose les blocs disponibles, leurs propriétés et leurs règles de conteneur.

Conséquence pour les agents : utiliser `search_content` pour localiser, `export_content_compact`
pour lire, puis `get_content` seulement pour une vérification fine ou une écriture précise.

---

## 1. Accès au curriculum compilé

### Cas d'usage pédagogique

Le Garant de cohérence doit comparer une unité avec les notions déjà introduites dans les
sections précédentes du même module ou d'autres modules.

### Données nécessaires

Liste structurée des concepts, APIs, compétences, prérequis et évaluations par section.

### Outils actuellement disponibles

`list_modules`, `list_sections`, `search_content` et `export_content_compact`.

### Limitation constatée

Ces outils permettent de lire et rechercher les contenus, mais ils ne fournissent pas un
curriculum compilé, normalisé et directement exploitable par un agent.

### Impact sur le workflow

La cohérence inter-modules reste partiellement manuelle : l'agent peut rechercher une notion,
mais doit encore déduire lui-même si elle est introduite, mobilisée, évaluée ou seulement
mentionnée.

### Priorité

Haute

### Contournement actuel

Dans Claude Code : `/pedagogy:sync` maintient un fichier local `reviews/[matiere]-curriculum.md`.
Dans les clients web : utiliser `search_content` et `export_content_compact`, puis demander le
curriculum à l'utilisateur si la décision dépend d'un parcours complet.

### Options techniques

- Stocker un curriculum compilé dans MongoDB.
- Ajouter `get_curriculum(module?)` avec concepts, APIs, objectifs et prérequis par section.
- Mettre à jour ce curriculum après chaque modification validée de contenu.

---

## 2. Historique des versions d'un contenu

### Cas d'usage pédagogique

Détecter les modifications récentes pour évaluer leur impact sur le cours, les slides, le TP
ou les évaluations associées.

### Données nécessaires

Historique des versions d'un contenu et diff entre deux versions.

### Outils actuellement disponibles

`get_content` retourne la version courante, mais pas les versions précédentes.

### Limitation constatée

Impossible de comparer deux versions du même contenu via MCP.

### Impact sur le workflow

L'analyse d'impact repose sur le brief utilisateur ou sur l'historique Git local quand il est
accessible.

### Priorité

Moyenne

### Options techniques

- Stocker des snapshots ou diffs dans MongoDB.
- Ajouter `get_content_diff(module, section, type, from_version, to_version)`.

---

## 3. Relations entre sections et modules

### Cas d'usage pédagogique

Identifier automatiquement les contenus qui dépendent d'une section modifiée.

### Données nécessaires

Graphe de dépendances entre modules, sections et types de support.

### Outils actuellement disponibles

Les outils listent et lisent les contenus, mais ne modélisent pas explicitement les dépendances.

### Limitation constatée

Une section peut préparer, réutiliser ou évaluer une notion d'une autre section sans relation
structurée dans la base.

### Impact sur le workflow

L'analyse d'impact multi-supports reste manuelle ou fondée sur une recherche textuelle.

### Priorité

Moyenne

### Options techniques

- Ajouter un champ `dependsOn: [{ module, section, type }]`.
- Ajouter `get_related_content(module, section, type?)`.

---

## 4. Extraction structurée des objectifs et concepts

### Cas d'usage pédagogique

Comparer automatiquement objectifs, prérequis, notions, exemples, exercices et évaluations.

### Données nécessaires

Représentation structurée des objectifs observables, notions introduites, compétences mobilisées
et critères d'évaluation.

### Outils actuellement disponibles

`export_content_compact` expose un texte lisible ; l'extraction reste à la charge de l'agent.

### Limitation constatée

Deux agents peuvent extraire des concepts différents depuis le même texte, surtout lorsque les
titres sont vagues ou que les objectifs sont implicites.

### Impact sur le workflow

Les audits de cohérence restent moins reproductibles qu'une extraction structurée.

### Priorité

Basse à moyenne

### Options techniques

- Ajouter un champ éditorial `learningObjectives` / `taughtConcepts` par section.
- Ajouter `get_content_pedagogical_index(module, section?, type?)`.
