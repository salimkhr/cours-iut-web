# Lacunes de capacité MCP — Skill pédagogique

Ce document liste les capacités nécessaires pour automatiser les audits pédagogiques
mais absentes du serveur MCP actuel. Aucune des fonctions listées ici n'est implémentée.

---

## 1. Lecture des contenus en format lisible

### Cas d'usage pédagogique
L'Auditeur apprenant et le Garant de cohérence doivent analyser le cours, le TP et les
slides. `get_content` retourne un arbre de blocs JSON, pas un texte lisible par un modèle.

### Données nécessaires
Contenu textuel des trois supports sous forme lisible (markdown ou texte structuré).

### Outils actuellement disponibles
`get_content(module, section, type)` — retourne `{ blocks: [...], source: "db" }`

### Limitation constatée
L'arbre de blocs JSON n'est pas directement exploitable pour une analyse pédagogique sans
transformation. Le modèle client doit interpréter la structure de blocs lui-même.

### Impact sur le workflow
Les agents d'audit reçoivent le contenu via le brief fourni manuellement par l'utilisateur,
pas via un appel MCP automatique.

### Priorité
Haute

### Contournement actuel
L'utilisateur copie-colle le contenu dans le brief ou l'agent lit les fichiers `.tsx` locaux
(Claude Code uniquement).

### Options techniques à étudier ultérieurement
- `render_content_as_text(module, section, type)` — transforme l'arbre de blocs en markdown.
- `get_content_summary(module, section, type)` — extrait les concepts clés.

---

## 2. Accès au curriculum compilé

### Cas d'usage pédagogique
Le Garant de cohérence doit comparer le contenu d'une unité avec le curriculum des unités
précédentes du même module ou d'autres modules.

### Données nécessaires
Liste des concepts et APIs enseignés dans chaque section de chaque module.

### Outils actuellement disponibles
`list_modules`, `list_sections` — structure seule, pas le contenu enseigné.

### Limitation constatée
Le curriculum compilé (`reviews/[matiere]-curriculum.md`) est généré localement par
`/pedagogy:sync` et n'est pas stocké dans MongoDB ni exposé via MCP.

### Impact sur le workflow
La vérification de cohérence inter-modules est indisponible dans les clients web.
Dans Claude Code, elle repose sur les fichiers locaux `reviews/`.

### Priorité
Haute

### Contournement actuel
Dans Claude Code : `/pedagogy:sync` génère et maintient `reviews/[matiere]-curriculum.md`.
Dans les clients web : l'utilisateur fournit le curriculum manuellement si disponible.

### Options techniques à étudier ultérieurement
- Stocker le curriculum dans MongoDB (nouvelle collection ou champ `taughtConcepts` dans `modules`).
- `get_curriculum(module)` — concepts et APIs par section.
- Appel automatique de `/pedagogy:sync` depuis le MCP après chaque mise à jour de contenu.

---

## 3. Recherche de contenu par notion

### Cas d'usage pédagogique
Vérifier qu'une notion est introduite avant d'être utilisée dans un TP ou un cours suivant.

### Données nécessaires
Recherche textuelle dans l'ensemble des contenus d'un module ou de la plateforme.

### Outils actuellement disponibles
Aucun outil de recherche textuelle.

### Limitation constatée
Impossible de vérifier automatiquement si un concept apparaît dans un contenu précédent.

### Impact sur le workflow
La détection des prérequis implicites repose entièrement sur la lecture manuelle.

### Priorité
Moyenne

### Contournement actuel
L'utilisateur fournit explicitement les contenus à comparer.

### Options techniques à étudier ultérieurement
- Indexation textuelle des blocs dans MongoDB.
- `search_content(query, module?)` — retourne les sections contenant le terme.

---

## 4. Historique des versions d'un contenu

### Cas d'usage pédagogique
Détecter les modifications récentes pour évaluer leur impact sur les autres supports.

### Données nécessaires
Historique des versions d'un `course_content` avec les différences entre versions.

### Outils actuellement disponibles
`get_content` retourne uniquement la version courante (`version: N`).

### Limitation constatée
Impossible de comparer deux versions du même contenu via le MCP.

### Impact sur le workflow
L'analyse d'impact repose sur la description manuelle des changements par l'utilisateur.

### Priorité
Basse

### Contournement actuel
L'utilisateur décrit les changements dans le brief initial.

### Options techniques à étudier ultérieurement
- Snapshots ou diffs stockés dans MongoDB.
- `get_content_diff(module, section, type, from_version, to_version)`.

---

## 5. Relations entre sections et modules

### Cas d'usage pédagogique
Identifier automatiquement les sections dépendant d'une section modifiée.

### Données nécessaires
Graphe de dépendances entre sections et modules.

### Outils actuellement disponibles
Aucune relation explicite modélisée dans le schéma `modules`.

### Limitation constatée
Les relations entre supports ne sont pas modélisées dans la base.

### Impact sur le workflow
L'analyse d'impact multi-supports est entièrement manuelle.

### Priorité
Basse

### Contournement actuel
L'utilisateur indique manuellement les contenus liés.

### Options techniques à étudier ultérieurement
- Champ `dependsOn: [{ module, section }]` dans `course_content`.
- `get_related_content(module, section)`.
