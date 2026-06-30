---
id: pedagogie
version: 1.0.0
---

# Skill — Pédagogie multi-supports IUT

Ce skill guide la conception, la révision et la publication de contenus pédagogiques
pour le BUT Informatique. Il couvre trois supports interdépendants : le cours, les slides
et le TP.

## Déclenchement

Chargez ce skill avant toute tâche pédagogique non triviale.

**Clients MCP (Claude Web, ChatGPT, etc.) :**
1. `get_pedagogical_skill_manifest()` — obtenir la liste des documents disponibles.
2. `get_pedagogical_skill_document("main")` — charger ces instructions.
3. Charger les documents complémentaires selon le routage ci-dessous.

**Claude Code :** `/pedagogy:write`, `/pedagogy:review`, `/pedagogy:module`

## Routage par type de modification

### 1. Modification locale
Correction orthographique, reformulation d'une phrase, changement typographique, modification
visuelle sans effet pédagogique.

→ **Agent principal uniquement.** Aucun sous-agent.

### 2. Rédaction ou révision d'un seul support
Rédaction d'une page de cours, amélioration d'une explication, création d'un TP simple,
préparation de slides à partir d'un cours stable.

→ **Concepteur + Auditeur apprenant + consolidation.**
→ Ajouter le Garant de cohérence si le contenu dépend fortement du parcours.

### 3. Modification structurante
Changement d'objectif, ajout ou suppression d'une notion, changement d'ordre, nouvelle
évaluation, modification d'un prérequis, modification d'un TP ou de slides affectant les
compétences.

→ **Les trois agents + consolidation.**

### 4. Création ou révision d'une unité complète (cours + slides + TP)

→ **Les trois agents sont obligatoires.**

## Workflow principal

Pour les modifications structurantes et la création d'unité complète :

```
1.  Collecter le contexte (supports existants, curriculum si disponible).
2.  Produire le contrat d'entrée commun (voir section ci-dessous).
3.  [Concepteur] Concevoir ou réviser l'unité → carte d'alignement + proposition.
4a. [Auditeur apprenant] Analyser le brouillon.
4b. [Garant de cohérence] Analyser le même brouillon.
    (étapes 4a et 4b parallélisables)
5.  Fusionner les constats, supprimer les doublons.
6.  Arbitrer les recommandations contradictoires.
7.  Réviser le contenu final.
8.  Analyser les impacts sur les supports liés (voir section Impact).
9.  Appeler les outils MCP d'écriture appropriés.
10. Vérifier le résultat réel de chaque appel MCP.
```

## Contrat d'entrée commun

À transmettre aux trois agents avant leur analyse :

```yaml
task:
  mode: create | review | update
  requested_outputs:
    - course
    - slides
    - practical_work

audience:
  profile: "BUT Informatique 1ère/2ème/3ème année"
  initial_level: "débutant | intermédiaire | avancé"
  known_difficulties: "indisponible | [liste]"

learning_unit:
  title: "..."
  objective: "..."
  prerequisites: "indisponible | [liste]"
  expected_duration: "... séances"
  curriculum_position: "Module N / Section K"

related_materials:
  previous_courses: "indisponible | [contenu ou résumé]"
  next_course_objectives: "indisponible | [objectifs]"
  current_course: "indisponible | [contenu]"
  current_slides: "indisponible | [contenu]"
  current_practical_work: "indisponible | [contenu]"

constraints:
  editorial_format: "JSX composants imposés (charger ref-cours, ref-tp ou ref-slide)"
  technical_version: "indisponible | [version]"
  vocabulary: "indisponible | [termes imposés]"
  assessment_rules: "indisponible | [règles]"

available_mcp_capabilities:
  read: [get_pedagogical_skill_manifest, get_pedagogical_skill_document,
         list_modules, list_sections, get_content]
  create: [create_module, create_section]
  update: [save_content, insert_block, edit_block, delete_block, reorder_blocks]
```

Les champs indisponibles sont marqués "indisponible". Ils ne doivent jamais être inventés.

## Consolidation des constats

Format de décision produit par l'agent principal :

```yaml
decision:
  source_findings: ["auditeur-finding-1", "garant-finding-2"]
  severity: blocking | important | improvement
  affected_supports: [course, slides, practical_work]
  accepted_recommendation: "..."
  rejected_alternatives: ["..."]
  rationale: "..."
  required_updates: ["..."]
```

Règles d'arbitrage :
- Traiter les problèmes bloquants avant les autres.
- Ne pas appliquer une recommandation qui crée une incohérence détectée par le Garant.
- Distinguer les impacts apprenant des impacts curriculaires.
- Signaler explicitement les incertitudes.
- Produire une décision par constat important.

## Vérifications multi-supports obligatoires

Pour chaque unité révisée, vérifier :

### Objectifs
- Les trois supports poursuivent-ils le même objectif principal ?
- Le TP met-il réellement cet objectif en pratique ?
- Les slides représentent-elles fidèlement la séance prévue ?

### Prérequis
- Le TP utilise-t-il uniquement des notions déjà enseignées ou explicitement fournies ?
- Les slides utilisent-elles des termes absents du cours ?
- Les prérequis annoncés sont-ils suffisants ?

### Progression
- L'ordre des notions est-il cohérent entre les trois supports ?
- Le TP intervient-il au bon moment dans la progression ?
- Une difficulté est-elle introduite sans préparation ?

### Vocabulaire
- Les mêmes notions utilisent-elles les mêmes termes dans les trois supports ?
- Les noms des outils, commandes, étapes et livrables sont-ils identiques ?

### Exemples
- Les exemples sont-ils compatibles entre supports ?
- Le TP évite-t-il de recopier exactement l'exemple du cours ?

### Versions techniques
- Les commandes, interfaces, bibliothèques correspondent-elles à la même version dans les trois supports ?

## Analyse d'impact

Après modification d'un support, produire :

```markdown
# Impact sur les supports liés

## Cours
[modifications nécessaires ou aucune]

## Slides
[modifications nécessaires ou aucune]

## TP
[modifications nécessaires ou aucune]

## Autres unités du parcours
[impacts identifiés ou aucun]

## Modifications nécessaires
[liste ordonnée par priorité]

## Modifications seulement recommandées
[liste avec justification]
```

Le skill ne modifie jamais automatiquement plusieurs supports sans instruction explicite.
Il signale clairement les mises à jour nécessaires.

## Stratégie de repli pour clients web sans sous-agents

Lorsque le client ne dispose pas de sous-agents natifs (Claude Web, ChatGPT, etc.),
exécuter quatre passes successives dans la même session :

**Passe 1 — Conception :**
Charger `get_pedagogical_skill_document("concepteur")` et raisonner selon ce rôle.
Produire la carte d'alignement.

**Passe 2 — Audit apprenant :**
Charger `get_pedagogical_skill_document("auditeur-apprenant")` et raisonner selon ce rôle.
Produire les constats YAML.

**Passe 3 — Audit de cohérence :**
Charger `get_pedagogical_skill_document("garant-coherence")` et raisonner selon ce rôle.
Produire les constats YAML.

**Passe 4 — Consolidation et publication :**
Fusionner les constats des passes 2 et 3. Arbitrer. Réviser.
Appeler les outils MCP d'écriture si instruction explicite.

Les sous-agents Claude Code ne s'exécutent pas dans les clients web.
Cette stratégie de repli en quatre passes produit un résultat équivalent.

## Outils MCP disponibles

### Lecture du skill (tous les utilisateurs authentifiés)
- `get_pedagogical_skill_manifest()` — manifeste et liste des documents
- `get_pedagogical_skill_document(document_id)` — contenu d'un document

### Lecture des contenus (tous les utilisateurs authentifiés)
- `list_modules()` — modules disponibles
- `list_sections(module)` — sections d'un module
- `get_content(module, section, type)` — arbre de blocs

### Écriture (admins uniquement, après consolidation)
- `create_module` / `create_section` / `edit_section`
- `save_content` / `insert_block` / `edit_block` / `delete_block` / `reorder_blocks`

## Documents disponibles

Charger via `get_pedagogical_skill_document(id)` :

| id | Titre | Charger quand |
|----|-------|---------------|
| `main` | Instructions principales | Toujours |
| `concepteur` | Rôle — Concepteur | Conception ou révision structurante |
| `auditeur-apprenant` | Rôle — Auditeur apprenant | Toute révision |
| `garant-coherence` | Rôle — Garant de cohérence | Révision structurante ou check cohérence |
| `ref-cours` | Référence Cours | Rédaction ou révision de cours |
| `ref-tp` | Référence TP | Rédaction ou révision de TP |
| `ref-slide` | Référence Slides | Rédaction ou révision de slides |
| `ref-examen` | Référence Examen | Rédaction ou révision d'examens |
