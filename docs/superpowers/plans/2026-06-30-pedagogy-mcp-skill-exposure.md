# Exposition du Skill Pédagogique via MCP

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer une source canonique git-trackée pour le skill pédagogique et l'exposer via le serveur MCP (instructions serveur, ressources, prompt, outils) afin que les clients web (Claude web, ChatGPT) puissent charger la méthode pédagogique.

**Architecture:**
- `skills/pedagogie/` (nouveau, git-tracké) = source canonique des fichiers Markdown du skill.
- `scripts/generateSkillModule.js` lit ces fichiers et génère `src/lib/skills/pedagogie.ts` (gitignored, embarqué à la compilation).
- `src/app/api/mcp/route.ts` importe le module généré et expose instructions serveur + ressources MCP + prompt MCP + 2 outils de lecture en lecture seule.
- `.claude/skills/pedagogy-review/SKILL.md` (local, gitignored) est mis à jour pour les nouveaux rôles et la logique de routage.

**Tech Stack:** Node.js (scripts), `@modelcontextprotocol/sdk ^1.29.0` (`McpServer`, `ResourceTemplate`), Next.js Route Handler, bun lifecycle hooks (`prebuild`/`predev`), bun:test.

---

## État des lieux détecté

### Skill existant (`.claude/skills/`, gitignored, local)
- `pedagogy-write/SKILL.md` — rédige cours/TP/slide/examen ; lit les références dans `.claude/skills/pedagogy/reference/`
- `pedagogy-review/SKILL.md` — dispatche 3 sous-agents (pédagogue, étudiant, cohérence inter-modules conditionnelle) ; produit `reviews/[matiere]-[n-slug]-REVIEW.md`
- `pedagogy-rewrite/SKILL.md` — regroupe par thème, propose corrections, applique
- `pedagogy-sync/SKILL.md` — extrait concepts/APIs, met à jour `reviews/[matiere]-curriculum.md`
- `pedagogy-module/SKILL.md` — brainstorm + création squelette via MCP
- `.claude/skills/pedagogy/reference/{cours,tp,slide,examen}.md` — règles éditoriales

### MCP existant (`src/app/api/mcp/route.ts`, 708 lignes)
- SDK : `@modelcontextprotocol/sdk ^1.29.0` (exports : `McpServer`, `ResourceTemplate`)
- Transport : `WebStandardStreamableHTTPServerTransport` (stateless)
- Auth : Scalekit OAuth 2.0 + allowlist `MCP_ADMIN_EMAILS`
- 13 outils existants (5 lecture + 8 écriture admin)
- **Aucune** instruction serveur, ressource, ni prompt MCP actuellement

### Points bloquants pour les clients web
1. Le skill est dans `.claude/` (gitignored, local seulement)
2. Aucune instruction serveur ne mentionne le skill
3. Aucune ressource MCP n'expose les fichiers Markdown
4. Aucun outil ne permet de charger le manifeste ou un document du skill

---

## Fichiers créés ou modifiés

| Action | Fichier |
|--------|---------|
| Créer | `skills/pedagogie/manifest.json` |
| Créer | `skills/pedagogie/SKILL.md` |
| Créer | `skills/pedagogie/agents/concepteur.md` |
| Créer | `skills/pedagogie/agents/auditeur-apprenant.md` |
| Créer | `skills/pedagogie/agents/garant-coherence.md` |
| Créer | `skills/pedagogie/references/cours.md` |
| Créer | `skills/pedagogie/references/tp.md` |
| Créer | `skills/pedagogie/references/slide.md` |
| Créer | `skills/pedagogie/references/examen.md` |
| Créer | `scripts/generateSkillModule.js` |
| Créer | `src/lib/skills/` (répertoire) |
| Créer | `tests/mcp/skill-exposure.test.ts` |
| Créer | `MCP_CAPABILITY_GAPS.md` |
| Créer | `docs/PEDAGOGY.md` |
| Modifier | `package.json` (ajouter `prebuild`, `predev`, `generate-skill`) |
| Modifier | `src/app/api/mcp/route.ts` (instructions + ressources + prompt + 2 outils) |
| Modifier | `.claude/skills/pedagogy-review/SKILL.md` (rôles + routage) |
| Modifier | `.claude/skills/pedagogy-write/SKILL.md` (chemins références) |

---

## Task 1 : Créer les fichiers canoniques du skill

**Files:**
- Create: `skills/pedagogie/manifest.json`
- Create: `skills/pedagogie/SKILL.md`

- [ ] **Étape 1 : Créer le répertoire et le manifest**

```bash
mkdir -p skills/pedagogie/agents skills/pedagogie/references
```

Puis créer `skills/pedagogie/manifest.json` :

```json
{
  "id": "pedagogie",
  "name": "Pédagogie multi-supports",
  "version": "1.0.0",
  "description": "Skill pédagogique pour concevoir et réviser des cours, TPs et slides BUT Informatique.",
  "entrypoint": "SKILL.md",
  "supported_content_types": ["course", "slides", "practical_work"],
  "roles": [
    "instructional_designer",
    "struggling_learner_auditor",
    "curriculum_coherence_auditor"
  ],
  "documents": [
    {
      "id": "main",
      "title": "Instructions principales",
      "path": "SKILL.md",
      "uri": "skill://pedagogie/main",
      "purpose": "Orchestration, routage, workflow, vérifications multi-supports, fallback web",
      "load_when": ["always"]
    },
    {
      "id": "concepteur",
      "title": "Rôle — Concepteur d'unité pédagogique",
      "path": "agents/concepteur.md",
      "uri": "skill://pedagogie/concepteur",
      "purpose": "Rôle du Concepteur : carte d'alignement, vérifications, permissions",
      "load_when": ["design_unit", "create", "review_structural"]
    },
    {
      "id": "auditeur-apprenant",
      "title": "Rôle — Auditeur apprenant en difficulté",
      "path": "agents/auditeur-apprenant.md",
      "uri": "skill://pedagogie/auditeur-apprenant",
      "purpose": "Rôle de l'Auditeur : simulation apprenant fragile, format YAML des constats",
      "load_when": ["review", "review_structural"]
    },
    {
      "id": "garant-coherence",
      "title": "Rôle — Garant de cohérence curriculaire",
      "path": "agents/garant-coherence.md",
      "uri": "skill://pedagogie/garant-coherence",
      "purpose": "Rôle du Garant : cohérence parcours + multi-supports, format YAML des constats",
      "load_when": ["review_structural", "check_coherence"]
    },
    {
      "id": "ref-cours",
      "title": "Référence — Cours",
      "path": "references/cours.md",
      "uri": "skill://pedagogie/ref-cours",
      "purpose": "Règles éditoriales JSX pour la rédaction des cours",
      "load_when": ["create_course", "review_course"]
    },
    {
      "id": "ref-tp",
      "title": "Référence — TP",
      "path": "references/tp.md",
      "uri": "skill://pedagogie/ref-tp",
      "purpose": "Règles éditoriales JSX pour la rédaction des TPs",
      "load_when": ["create_practical_work", "review_practical_work"]
    },
    {
      "id": "ref-slide",
      "title": "Référence — Slides",
      "path": "references/slide.md",
      "uri": "skill://pedagogie/ref-slide",
      "purpose": "Règles éditoriales JSX pour la rédaction des slides",
      "load_when": ["create_slides", "review_slides"]
    },
    {
      "id": "ref-examen",
      "title": "Référence — Examen",
      "path": "references/examen.md",
      "uri": "skill://pedagogie/ref-examen",
      "purpose": "Règles éditoriales JSX pour la rédaction des examens",
      "load_when": ["create_exam", "review_exam"]
    }
  ],
  "updated_at": "2026-06-30T00:00:00Z",
  "content_hash": "placeholder"
}
```

- [ ] **Étape 2 : Créer `skills/pedagogie/SKILL.md`**

```markdown
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
```

- [ ] **Étape 3 : Commit intermédiaire**

```bash
git add skills/pedagogie/manifest.json skills/pedagogie/SKILL.md
git commit -m "feat(skill): créer répertoire canonique skills/pedagogie avec manifest et SKILL.md"
```

---

## Task 2 : Créer les définitions des trois rôles

**Files:**
- Create: `skills/pedagogie/agents/concepteur.md`
- Create: `skills/pedagogie/agents/auditeur-apprenant.md`
- Create: `skills/pedagogie/agents/garant-coherence.md`

- [ ] **Étape 1 : Créer `skills/pedagogie/agents/concepteur.md`**

```markdown
# Rôle — Concepteur d'unité pédagogique multi-supports

## Identité

Tu es un concepteur pédagogique expert. Tu raisonnes conjointement sur le cours, les slides
et le TP comme composants d'une même unité d'apprentissage. Tu ne publies jamais directement
les modifications : tu produis une proposition destinée à être auditée.

## Responsabilités

Tu conçois ou révises l'unité pédagogique. Pour chaque unité, tu vérifies :

### Public et niveau
- Qui sont les apprenants ? Quel est leur niveau initial ?
- Quels prérequis sont réellement acquis (pas seulement déclarés) ?

### Objectif
- Quelle compétence l'apprenant doit-il démontrer à l'issue de l'unité ?
- L'objectif est-il formulé comme une capacité observable ?

### Structure de l'unité
- Quelles notions doivent être expliquées, dans quel ordre ?
- Quels exemples illustrent chaque notion ?
- Quelles activités permettent de pratiquer ?
- Comment l'évaluation vérifie-t-elle la compétence ?

### Rôle des trois supports
- **Cours** : comprendre, disposer du contenu de référence, lire avant ou après la séance
- **Slides** : suivre, visualiser et rythmer la séance en présentiel
- **TP** : pratiquer et démontrer la compétence

### Transitions
- L'unité s'articule-t-elle bien avec la section précédente ?
- Prépare-t-elle correctement la section suivante ?

## Carte d'alignement (obligatoire avant toute rédaction ou révision importante)

```markdown
# Carte d'alignement — [Titre de l'unité]

## Public et niveau
[profil, niveau initial, difficultés connues]

## Objectif de l'unité
[compétence observable]

## Prérequis
[liste précise]

## Compétences visées
[liste hiérarchisée]

## Rôle du cours
[ce que le cours apporte spécifiquement]

## Rôle des slides
[ce que les slides apportent spécifiquement]

## Rôle du TP
[ce que le TP fait pratiquer]

## Activités et évaluation
[activités, critères de réussite visibles]

## Transition avec le parcours
[lien avec la section précédente et la suivante]
```

## Permissions

| Capacité | Autorisée |
|----------|-----------|
| Lecture du skill | ✓ |
| Lecture des contenus via MCP (get_content, list_sections) | ✓ |
| Outils de création MCP (create_module, create_section) | ✗ |
| Outils de modification MCP (save_content, insert_block, etc.) | ✗ |
```

- [ ] **Étape 2 : Créer `skills/pedagogie/agents/auditeur-apprenant.md`**

```markdown
# Rôle — Auditeur du point de vue d'un apprenant en difficulté

## Identité

Tu représentes un apprenant :
- sérieux, qui a suivi les contenus précédents ;
- manquant encore d'aisance ;
- susceptible d'être bloqué par un implicite, un saut ou une consigne ambiguë.

Tu n'es PAS un apprenant qui n'a rien lu ou qui refuse de travailler.

## Question principale

> Un apprenant ayant compris les contenus précédents, mais restant fragile,
> peut-il comprendre cette séquence et réaliser ce qui est demandé ?

## Ce que tu recherches

- Prérequis implicites non déclarés
- Termes utilisés avant d'être définis
- Étapes trop rapides pour un apprenant fragile
- Explications trop abstraites sans ancrage concret
- Changements brusques de difficulté
- Consignes ambiguës dans le TP
- Exemples insuffisants ou trop proches de la solution
- Slides trop denses (plus de 5 éléments par slide)
- TP impossible à démarrer sans aide externe
- Trop d'informations à mémoriser simultanément
- Moments où l'apprenant ne sait plus quoi faire
- Critères de réussite invisibles ou implicites
- Aides arrivant trop tard dans la progression

## Ordre de lecture

Lis les supports dans l'ordre où l'apprenant les recevrait :
1. Cours (avant la séance)
2. Slides (pendant la séance)
3. TP (après la séance)

## Format de sortie

Pour chaque problème identifié :

```yaml
finding:
  severity: blocking | important | improvement
  support: course | slides | practical_work
  location: "[fichier / section / numéro d'exercice]"
  learner_goal: "Ce que l'apprenant essaie de faire à ce moment"
  obstacle: "Ce qui le bloque concrètement"
  implicit_knowledge: "Ce que le contenu suppose acquis mais n'a pas enseigné"
  learner_impact: "Conséquence (bloqué / confus / découragé)"
  recommendation: "Suggestion concrète"
  confidence: high | medium | low
```

Si aucun blocage dans un support, écrire : "Support accessible — aucun blocage identifié."

## Permissions

| Capacité | Autorisée |
|----------|-----------|
| Lecture du skill | ✓ |
| Lecture des supports analysés | ✓ |
| Outils de création MCP | ✗ |
| Outils de modification MCP | ✗ |
```

- [ ] **Étape 3 : Créer `skills/pedagogie/agents/garant-coherence.md`**

```markdown
# Rôle — Garant de cohérence curriculaire et multi-supports

## Identité

Tu es un expert en ingénierie pédagogique. Tu vérifies qu'une unité occupe la bonne place
dans le parcours et que ses trois supports sont alignés entre eux et avec le curriculum.

## Question principale

> Cette unité occupe-t-elle la bonne place dans le parcours,
> et ses trois supports sont-ils alignés ?

## Ce que tu vérifies

### Cohérence du parcours (si curriculum disponible)
- Une notion est-elle utilisée avant son introduction dans le curriculum ?
- Une notion est-elle répétée sans progression ?
- Un objectif est-il déjà traité ailleurs dans le parcours ?
- Un prérequis est-il absent du curriculum précédent ?

### Cohérence multi-supports
- Le TP est-il sans lien avec l'objectif du cours ?
- Une slide contredit-elle le cours ?
- Une compétence est-elle évaluée dans le TP mais jamais enseignée dans le cours ?
- Le vocabulaire est-il stable entre les trois supports ?
- Les versions des outils, commandes ou bibliothèques sont-elles cohérentes ?
- Les exemples sont-ils compatibles entre supports ?
- Une modification d'un support a-t-elle des effets non reflétés dans les autres ?

### Signaux d'alerte spécifiques
- Rupture de difficulté injustifiée entre deux sections
- Différences d'exemples injustifiées entre supports
- Ancienne version d'un outil ou d'une commande
- Durées incompatibles entre les supports

## Format de sortie

Compatible avec le format de l'Auditeur apprenant :

```yaml
finding:
  severity: blocking | important | improvement
  scope: curriculum | course | slides | practical_work | multi_support
  location: "[module / section / support]"
  observation: "Constat factuel"
  evidence: "Citation ou référence précise dans les contenus"
  curriculum_impact: "Impact sur le parcours global (aucun si non applicable)"
  affected_supports: [course, slides, practical_work]
  recommendation: "Suggestion concrète"
  confidence: high | medium | low
```

Si aucun problème de cohérence, écrire : "RAS — cohérence vérifiée."

## Permissions

| Capacité | Autorisée |
|----------|-----------|
| Lecture du skill | ✓ |
| Lecture des supports analysés et du curriculum | ✓ |
| Outils de création MCP | ✗ |
| Outils de modification MCP | ✗ |
```

- [ ] **Étape 4 : Commit**

```bash
git add skills/pedagogie/agents/
git commit -m "feat(skill): ajouter les définitions des trois rôles pédagogiques"
```

---

## Task 3 : Copier les références éditoriales

**Files:**
- Create: `skills/pedagogie/references/cours.md`
- Create: `skills/pedagogie/references/tp.md`
- Create: `skills/pedagogie/references/slide.md`
- Create: `skills/pedagogie/references/examen.md`

- [ ] **Étape 1 : Copier les quatre fichiers de référence**

Les fichiers sources sont dans `.claude/skills/pedagogy/reference/` (gitignored, local).
Ils doivent être transcrits dans `skills/pedagogie/references/`.

Lire chaque fichier source avec l'outil Read, puis créer le fichier destination avec Write.

Sources → Destinations :
- `.claude/skills/pedagogy/reference/cours.md` → `skills/pedagogie/references/cours.md`
- `.claude/skills/pedagogy/reference/tp.md` → `skills/pedagogie/references/tp.md`
- `.claude/skills/pedagogy/reference/slide.md` → `skills/pedagogie/references/slide.md`
- `.claude/skills/pedagogy/reference/examen.md` → `skills/pedagogie/references/examen.md`

Conserver le contenu exact. Ne pas modifier.

- [ ] **Étape 2 : Vérifier les quatre fichiers**

```bash
ls skills/pedagogie/references/
# Attendu : cours.md  examen.md  slide.md  tp.md
wc -l skills/pedagogie/references/*.md
# Chaque fichier doit avoir > 10 lignes
```

- [ ] **Étape 3 : Commit**

```bash
git add skills/pedagogie/references/
git commit -m "feat(skill): copier les références éditoriales cours/TP/slide/examen dans la source canonique"
```

---

## Task 4 : Créer le script de génération du module TypeScript

**Files:**
- Create: `scripts/generateSkillModule.js`

Le script lit tous les documents référencés dans `manifest.json`, calcule leurs hashes,
met à jour le `manifest.json`, et génère `src/lib/skills/pedagogie.ts`.

- [ ] **Étape 1 : Vérifier que `src/lib/skills/` est bien gitignored**

```bash
git check-ignore src/lib/skills/pedagogie.ts
# Attendu : src/lib/skills/pedagogie.ts (la ligne est affichée si ignorée)
```

Si non ignoré, ajouter `src/lib/skills/` au `.gitignore` avant de continuer.

- [ ] **Étape 2 : Créer `scripts/generateSkillModule.js`**

```javascript
/* eslint-disable @typescript-eslint/no-require-imports */
// Génère src/lib/skills/pedagogie.ts à partir de skills/pedagogie/
// Exécuté automatiquement via prebuild et predev.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const SKILL_DIR = path.join(ROOT, 'skills', 'pedagogie');
const MANIFEST_FILE = path.join(SKILL_DIR, 'manifest.json');
const OUTPUT_FILE = path.join(ROOT, 'src', 'lib', 'skills', 'pedagogie.ts');

function hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}

function escapeTemplateLiteral(content) {
    return content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function readSkillFile(relativePath) {
    const fullPath = path.resolve(SKILL_DIR, relativePath);
    // Prévention de traversée de répertoire
    if (!fullPath.startsWith(SKILL_DIR + path.sep) && fullPath !== SKILL_DIR) {
        throw new Error(`Chemin interdit : ${relativePath}`);
    }
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Fichier manquant : ${fullPath}`);
    }
    return fs.readFileSync(fullPath, 'utf-8');
}

// Lecture du manifest
const manifest = JSON.parse(readSkillFile('manifest.json'));

// Chargement et hashage de tous les documents
const documents = {};
let combinedContent = '';

for (const doc of manifest.documents) {
    const content = readSkillFile(doc.path);
    const contentHash = hashContent(content);
    combinedContent += contentHash;
    documents[doc.id] = {
        id: doc.id,
        title: doc.title,
        uri: doc.uri,
        mimeType: 'text/markdown',
        content,
        contentHash,
        purpose: doc.purpose,
        load_when: doc.load_when,
    };
}

// Vérification d'intégrité : tous les chemins restent dans SKILL_DIR
for (const doc of manifest.documents) {
    const resolved = path.resolve(SKILL_DIR, doc.path);
    if (!resolved.startsWith(SKILL_DIR + path.sep)) {
        throw new Error(`Traversée de répertoire détectée pour le document "${doc.id}"`);
    }
}

// Mise à jour du manifest avec les hashes courants
const skillHash = hashContent(combinedContent);
const updatedManifest = {
    ...manifest,
    content_hash: skillHash,
    updated_at: new Date().toISOString(),
};
fs.writeFileSync(MANIFEST_FILE, JSON.stringify(updatedManifest, null, 2) + '\n');

// Génération du module TypeScript
const docEntries = Object.entries(documents).map(([id, doc]) => {
    return `    "${id}": {
        id: "${doc.id}",
        title: ${JSON.stringify(doc.title)},
        uri: ${JSON.stringify(doc.uri)},
        mimeType: "text/markdown" as const,
        content: \`${escapeTemplateLiteral(doc.content)}\`,
        contentHash: "${doc.contentHash}",
        purpose: ${JSON.stringify(doc.purpose)},
        load_when: ${JSON.stringify(doc.load_when)},
    }`;
}).join(',\n');

const tsContent = `// AUTO-GENERATED by scripts/generateSkillModule.js — ne pas éditer manuellement.
// Source canonique : skills/pedagogie/
// Régénérer avec : node scripts/generateSkillModule.js

export interface SkillDocument {
    id: string;
    title: string;
    uri: string;
    mimeType: "text/markdown";
    content: string;
    contentHash: string;
    purpose: string;
    load_when: string[];
}

export interface SkillManifestDoc {
    id: string;
    title: string;
    path: string;
    uri: string;
    purpose: string;
    load_when: string[];
}

export interface SkillManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    entrypoint: string;
    supported_content_types: string[];
    roles: string[];
    documents: SkillManifestDoc[];
    updated_at: string;
    content_hash: string;
}

export const SKILL_MANIFEST: SkillManifest = ${JSON.stringify(updatedManifest, null, 2)};

export const SKILL_DOCUMENTS: Record<string, SkillDocument> = {
${docEntries}
};

export const SKILL_HASH: string = "${skillHash}";
export const SKILL_VERSION: string = "${manifest.version}";
`;

// Création du répertoire de sortie si nécessaire
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, tsContent);
console.log(`Skill module généré : src/lib/skills/pedagogie.ts (hash : ${skillHash})`);
console.log(`Documents embarqués : ${Object.keys(documents).join(', ')}`);
```

- [ ] **Étape 3 : Exécuter le script pour la première fois**

```bash
node scripts/generateSkillModule.js
```

Résultat attendu :
```
Skill module généré : src/lib/skills/pedagogie.ts (hash : xxxxxxxxxxxx)
Documents embarqués : main, concepteur, auditeur-apprenant, garant-coherence, ref-cours, ref-tp, ref-slide, ref-examen
```

- [ ] **Étape 4 : Vérifier le fichier généré**

```bash
head -30 src/lib/skills/pedagogie.ts
# Doit commencer par : // AUTO-GENERATED by scripts/generateSkillModule.js
wc -l src/lib/skills/pedagogie.ts
# Doit être > 100 lignes
```

- [ ] **Étape 5 : Commit du script (pas du fichier généré)**

```bash
git add scripts/generateSkillModule.js
git commit -m "feat(build): script generateSkillModule.js — embarque skills/pedagogie/ dans un module TS"
```

---

## Task 5 : Mettre à jour package.json

**Files:**
- Modify: `package.json:5-25`

- [ ] **Étape 1 : Ajouter les hooks prebuild et predev**

Dans `package.json`, section `"scripts"`, ajouter :

```json
"generate-skill": "node scripts/generateSkillModule.js",
"prebuild": "node scripts/generateSkillModule.js",
"predev": "node scripts/generateSkillModule.js",
```

Le résultat dans `"scripts"` doit être :

```json
"scripts": {
  "generate-skill": "node scripts/generateSkillModule.js",
  "prebuild": "node scripts/generateSkillModule.js",
  "predev": "node scripts/generateSkillModule.js",
  "dev": "bunx next dev",
  "build": "bunx next build",
  "postbuild": "node scripts/postbuild.js",
  ...
}
```

- [ ] **Étape 2 : Vérifier que prebuild se déclenche automatiquement**

```bash
# Test sans lancer next build complet — juste le prebuild
bun run generate-skill
# Attendu : "Skill module généré : ..."
```

- [ ] **Étape 3 : Commit**

```bash
git add package.json
git commit -m "feat(build): ajouter prebuild/predev pour générer le module skill avant next build/dev"
```

---

## Task 6 : Mettre à jour le skill local `pedagogy-review`

**Files:**
- Modify: `.claude/skills/pedagogy-review/SKILL.md` (gitignored, local seulement)
- Modify: `.claude/skills/pedagogy-write/SKILL.md` (gitignored, local seulement)

Ces modifications sont locales (`.claude/` est gitignored). Elles mettent à jour le
comportement de Claude Code pour l'utilisateur courant.

- [ ] **Étape 1 : Réécrire `pedagogy-review/SKILL.md`**

Remplacer l'intégralité du fichier par :

```markdown
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
```

- [ ] **Étape 2 : Mettre à jour les chemins dans `pedagogy-write/SKILL.md`**

Dans `.claude/skills/pedagogy-write/SKILL.md`, ligne 36-40, remplacer :

```markdown
   - Cours  → `.claude/skills/pedagogy/reference/cours.md`
   - TP     → `.claude/skills/pedagogy/reference/tp.md`
   - Slide  → `.claude/skills/pedagogy/reference/slide.md`
   - Examen → `.claude/skills/pedagogy/reference/examen.md`
```

Par :

```markdown
   - Cours  → `skills/pedagogie/references/cours.md`
   - TP     → `skills/pedagogie/references/tp.md`
   - Slide  → `skills/pedagogie/references/slide.md`
   - Examen → `skills/pedagogie/references/examen.md`
```

---

## Task 7 : Modifier le serveur MCP — imports et instructions serveur

**Files:**
- Modify: `src/app/api/mcp/route.ts:1-2` (imports)
- Modify: `src/app/api/mcp/route.ts:139-141` (constructeur McpServer)

- [ ] **Étape 1 : Ajouter les imports du skill et ResourceTemplate**

En haut de `src/app/api/mcp/route.ts`, après la ligne 2, ajouter :

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    SKILL_MANIFEST,
    SKILL_DOCUMENTS,
    SKILL_VERSION,
    SKILL_HASH,
} from "@/lib/skills/pedagogie";
```

- [ ] **Étape 2 : Définir la constante SERVER_INSTRUCTIONS**

Après les imports (avant `export const runtime = "nodejs"`), ajouter :

```typescript
const SERVER_INSTRUCTIONS = `Ce serveur gère le référentiel pédagogique multi-supports du BUT Informatique.

Un skill pédagogique est disponible pour concevoir et réviser des cours, TPs et slides.

Chargement du skill :
1. Appelez get_pedagogical_skill_manifest() pour obtenir le manifeste et la liste des documents.
2. Appelez get_pedagogical_skill_document("main") pour charger les instructions principales.
3. Chargez les documents complémentaires indiqués selon la tâche.

Le skill couvre trois supports interdépendants : cours, slides, TP.

Pour toute modification structurante (changement d'objectif, nouvelle notion, nouveau TP),
chargez aussi les rôles : concepteur, auditeur-apprenant, garant-coherence.

Les outils d'écriture (save_content, insert_block, edit_block, delete_block, reorder_blocks)
ne doivent être appelés qu'après consolidation des audits pédagogiques.`;
```

- [ ] **Étape 3 : Ajouter les instructions au constructeur McpServer**

À la ligne 140 de `src/app/api/mcp/route.ts`, remplacer :

```typescript
    const server = new McpServer({ name: "cours-iut", version: "1.0.0" });
```

Par :

```typescript
    const server = new McpServer(
        { name: "cours-iut", version: "1.0.0" },
        { instructions: SERVER_INSTRUCTIONS }
    );
```

- [ ] **Étape 4 : Vérifier la compilation**

```bash
node scripts/generateSkillModule.js && bunx tsc --noEmit
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Étape 5 : Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): ajouter instructions serveur + import module skill pédagogique"
```

---

## Task 8 : Ajouter les ressources MCP

**Files:**
- Modify: `src/app/api/mcp/route.ts` (dans `buildMcpServer`, après ligne 141)

Ajouter les ressources MCP dans `buildMcpServer`, juste après la création du serveur
(après la ligne `const isAdmin = user.role === "admin";`) :

- [ ] **Étape 1 : Ajouter la ressource template `pedagogie-document`**

```typescript
    // ── Ressources MCP — skill pédagogique ───────────────────────────────────────

    // Liste des URIs exposées (manifest + tous les documents)
    const skillResourceList = [
        {
            uri: "skill://pedagogie/manifest",
            name: "Manifeste du skill pédagogique",
            description: "Manifeste JSON : version, documents disponibles, rôles et hash.",
            mimeType: "application/json",
        },
        ...SKILL_MANIFEST.documents.map((doc) => ({
            uri: doc.uri,
            name: doc.title,
            description: doc.purpose,
            mimeType: "text/markdown",
        })),
    ];

    server.resource(
        "pedagogie-document",
        new ResourceTemplate("skill://pedagogie/{id}", {
            list: async () => ({ resources: skillResourceList }),
        }),
        {
            description: "Document du skill pédagogique (manifeste, instructions principales, rôles des agents, références éditoriales). Lecture seule.",
        },
        async (uri, { id }) => {
            if (id === "manifest") {
                return {
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify(SKILL_MANIFEST, null, 2),
                        mimeType: "application/json",
                    }],
                };
            }
            const doc = SKILL_DOCUMENTS[id];
            if (!doc) {
                const available = Object.keys(SKILL_DOCUMENTS).join(", ");
                throw new Error(`Document inconnu : "${id}". Disponibles : ${available}`);
            }
            return {
                contents: [{
                    uri: uri.href,
                    text: doc.content,
                    mimeType: "text/markdown",
                }],
            };
        }
    );
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
bunx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): exposer les documents du skill pédagogique comme ressources MCP"
```

---

## Task 9 : Ajouter le prompt MCP

**Files:**
- Modify: `src/app/api/mcp/route.ts` (dans `buildMcpServer`, après les ressources)

- [ ] **Étape 1 : Ajouter le prompt `concevoir-unite-pedagogique`**

```typescript
    // ── Prompt MCP — workflow pédagogique ────────────────────────────────────────

    server.prompt(
        "concevoir-unite-pedagogique",
        {
            mode: z.enum([
                "design_curriculum",
                "design_unit",
                "create_course",
                "create_slides",
                "create_practical_work",
                "review_support",
                "review_unit",
                "check_coherence",
            ]).describe("Mode de travail pédagogique"),
            objective: z.string().optional().describe("Objectif pédagogique de l'unité"),
            audience: z.string().optional().describe("Public cible et niveau (ex: BUT Info 1ère année)"),
            requested_supports: z.array(z.enum(["course", "slides", "practical_work"]))
                .optional()
                .describe("Supports à produire"),
            context: z.string().optional().describe("Contexte additionnel"),
        },
        async ({ mode, objective, audience, requested_supports, context }) => {
            const mainDoc = SKILL_DOCUMENTS["main"];
            const docList = SKILL_MANIFEST.documents
                .map((d) => `- \`${d.id}\` : ${d.title} — ${d.purpose}`)
                .join("\n");

            const promptText = [
                `# Workflow pédagogique — ${mode}`,
                "",
                "## Instructions du skill",
                mainDoc.content,
                "",
                "## Paramètres de la tâche",
                `- Mode : ${mode}`,
                `- Objectif : ${objective ?? "non précisé"}`,
                `- Public : ${audience ?? "non précisé"}`,
                `- Supports demandés : ${requested_supports?.join(", ") ?? "tous"}`,
                `- Contexte : ${context ?? "aucun"}`,
                "",
                "## Documents disponibles",
                docList,
                "",
                "Chargez les documents nécessaires avec `get_pedagogical_skill_document(id)` avant de commencer.",
                "Les outils d'écriture ne doivent être appelés qu'après consolidation des audits.",
            ].join("\n");

            return {
                messages: [
                    { role: "user" as const, content: { type: "text" as const, text: promptText } },
                ],
            };
        }
    );
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
bunx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): ajouter le prompt MCP concevoir-unite-pedagogique"
```

---

## Task 10 : Ajouter les deux outils de lecture du skill

**Files:**
- Modify: `src/app/api/mcp/route.ts` (dans `buildMcpServer`, après le prompt)

- [ ] **Étape 1 : Ajouter `get_pedagogical_skill_manifest`**

```typescript
    // ── get_pedagogical_skill_manifest ────────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_manifest",
        "Use this when the user asks to design, write or review a course, practical exercise, slide deck or curriculum. Returns the manifest of the pedagogical skill with the list of documents to load before using content editing tools.",
        {},
        async () => ({
            content: [{
                type: "text" as const,
                text: JSON.stringify(SKILL_MANIFEST, null, 2),
            }],
        })
    );
```

- [ ] **Étape 2 : Ajouter `get_pedagogical_skill_document`**

```typescript
    // ── get_pedagogical_skill_document ────────────────────────────────────────────
    server.tool(
        "get_pedagogical_skill_document",
        "Use this to load a specific document from the pedagogical skill (main instructions, agent roles, editorial references). Call get_pedagogical_skill_manifest first to discover available document IDs.",
        {
            document_id: z.string().describe(
                "Identifiant du document du skill (ex: main, concepteur, auditeur-apprenant, garant-coherence, ref-cours, ref-tp, ref-slide, ref-examen)"
            ),
        },
        async ({ document_id }) => {
            const doc = SKILL_DOCUMENTS[document_id];
            if (!doc) {
                const available = Object.keys(SKILL_DOCUMENTS).join(", ");
                throw new Error(
                    `Document inconnu : "${document_id}". Documents disponibles : ${available}`
                );
            }
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        id: doc.id,
                        title: doc.title,
                        uri: doc.uri,
                        mime_type: doc.mimeType,
                        content: doc.content,
                        version: SKILL_VERSION,
                        content_hash: doc.contentHash,
                    }, null, 2),
                }],
            };
        }
    );
```

- [ ] **Étape 3 : Vérifier la compilation complète**

```bash
node scripts/generateSkillModule.js && bunx tsc --noEmit
```

Attendu : aucune erreur TypeScript.

- [ ] **Étape 4 : Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): ajouter get_pedagogical_skill_manifest et get_pedagogical_skill_document"
```

---

## Task 11 : Ajouter les tests

**Files:**
- Create: `tests/mcp/skill-exposure.test.ts`

- [ ] **Étape 1 : Vérifier que le module généré est disponible**

```bash
node scripts/generateSkillModule.js
ls src/lib/skills/pedagogie.ts
```

- [ ] **Étape 2 : Créer `tests/mcp/skill-exposure.test.ts`**

```typescript
import { describe, it, expect } from "bun:test";
import {
    SKILL_MANIFEST,
    SKILL_DOCUMENTS,
    SKILL_VERSION,
    SKILL_HASH,
} from "../../src/lib/skills/pedagogie";

describe("Skill pédagogique — manifeste", () => {
    it("contient les champs obligatoires", () => {
        expect(SKILL_MANIFEST.id).toBe("pedagogie");
        expect(typeof SKILL_MANIFEST.version).toBe("string");
        expect(SKILL_MANIFEST.supported_content_types).toContain("course");
        expect(SKILL_MANIFEST.supported_content_types).toContain("slides");
        expect(SKILL_MANIFEST.supported_content_types).toContain("practical_work");
        expect(SKILL_MANIFEST.roles).toContain("instructional_designer");
        expect(SKILL_MANIFEST.roles).toContain("struggling_learner_auditor");
        expect(SKILL_MANIFEST.roles).toContain("curriculum_coherence_auditor");
        expect(typeof SKILL_MANIFEST.content_hash).toBe("string");
        expect(SKILL_MANIFEST.content_hash).not.toBe("placeholder");
        expect(Array.isArray(SKILL_MANIFEST.documents)).toBe(true);
        expect(SKILL_MANIFEST.documents.length).toBeGreaterThan(0);
    });

    it("chaque document du manifeste a un id, uri et path valides", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            expect(typeof doc.id).toBe("string");
            expect(doc.uri).toMatch(/^skill:\/\/pedagogie\//);
            expect(typeof doc.path).toBe("string");
            expect(doc.path).not.toContain("..");
        }
    });

    it("SKILL_VERSION et SKILL_HASH correspondent au manifeste", () => {
        expect(SKILL_VERSION).toBe(SKILL_MANIFEST.version);
        expect(SKILL_HASH).toBe(SKILL_MANIFEST.content_hash);
    });
});

describe("Skill pédagogique — documents", () => {
    it("chaque document du manifeste est chargeable", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            const loaded = SKILL_DOCUMENTS[doc.id];
            expect(loaded).toBeDefined();
            expect(loaded.content.length).toBeGreaterThan(10);
            expect(loaded.mimeType).toBe("text/markdown");
        }
    });

    it("le document main contient les sections obligatoires", () => {
        const main = SKILL_DOCUMENTS["main"];
        expect(main).toBeDefined();
        expect(main.content).toContain("Routage");
        expect(main.content).toContain("Workflow principal");
        expect(main.content).toContain("Contrat d'entrée");
        expect(main.content).toContain("Consolidation");
        expect(main.content).toContain("fallback");
    });

    it("les trois rôles sont présents et non vides", () => {
        const roles = ["concepteur", "auditeur-apprenant", "garant-coherence"];
        for (const id of roles) {
            const doc = SKILL_DOCUMENTS[id];
            expect(doc).toBeDefined();
            expect(doc.content.length).toBeGreaterThan(100);
            expect(doc.contentHash).not.toBe("");
        }
    });

    it("les quatre références éditoriales sont présentes", () => {
        const refs = ["ref-cours", "ref-tp", "ref-slide", "ref-examen"];
        for (const id of refs) {
            const doc = SKILL_DOCUMENTS[id];
            expect(doc).toBeDefined();
            expect(doc.content.length).toBeGreaterThan(50);
        }
    });

    it("un document inconnu retourne undefined (non une erreur)", () => {
        expect(SKILL_DOCUMENTS["inexistant"]).toBeUndefined();
    });

    it("aucun document ne contient de données sensibles", () => {
        const sensitivePatterns = [
            /MONGODB_URI/,
            /SCALEKIT_/,
            /BETTER_AUTH_SECRET/,
            /MCP_ADMIN_EMAILS/,
        ];
        for (const [id, doc] of Object.entries(SKILL_DOCUMENTS)) {
            for (const pattern of sensitivePatterns) {
                if (pattern.test(doc.content)) {
                    throw new Error(`Document "${id}" contient un pattern sensible : ${pattern}`);
                }
            }
        }
    });

    it("les URIs des documents sont stables et sans double slash", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            const parts = doc.uri.replace("skill://", "").split("/");
            for (const part of parts) {
                expect(part.length).toBeGreaterThan(0);
            }
        }
    });

    it("les hashes des documents sont cohérents avec leur contenu", () => {
        const crypto = require("crypto");
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            const computed = crypto
                .createHash("sha256")
                .update(doc.content)
                .digest("hex")
                .slice(0, 12);
            expect(doc.contentHash).toBe(computed);
        }
    });
});

describe("Skill pédagogique — sécurité", () => {
    it("aucun document n'expose de chemin système absolu", () => {
        for (const [id, doc] of Object.entries(SKILL_DOCUMENTS)) {
            expect(doc.content).not.toMatch(/C:\\Users\\/);
            expect(doc.content).not.toMatch(/\/home\//);
        }
    });

    it("les IDs de documents ne contiennent pas de séparateurs de chemin", () => {
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            expect(doc.id).not.toContain("/");
            expect(doc.id).not.toContain("\\");
            expect(doc.id).not.toContain("..");
        }
    });
});
```

- [ ] **Étape 3 : Exécuter les tests**

```bash
node scripts/generateSkillModule.js && bun test tests/mcp/skill-exposure.test.ts
```

Résultat attendu : tous les tests PASS.

- [ ] **Étape 4 : Commit**

```bash
git add tests/mcp/skill-exposure.test.ts
git commit -m "test(mcp): tests d'exposition du skill pédagogique (manifeste, documents, sécurité)"
```

---

## Task 12 : Créer MCP_CAPABILITY_GAPS.md

**Files:**
- Create: `MCP_CAPABILITY_GAPS.md`

- [ ] **Étape 1 : Créer le fichier**

```markdown
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
```

- [ ] **Étape 2 : Commit**

```bash
git add MCP_CAPABILITY_GAPS.md
git commit -m "docs: MCP_CAPABILITY_GAPS.md — lacunes de capacité pour les audits pédagogiques automatiques"
```

---

## Task 13 : Créer la documentation PEDAGOGY.md

**Files:**
- Create: `docs/PEDAGOGY.md`

- [ ] **Étape 1 : Créer `docs/PEDAGOGY.md`**

```markdown
# Documentation — Système pédagogique multi-supports

## Vue d'ensemble

Ce projet expose un référentiel pédagogique pour concevoir et réviser des cours, TPs et
slides BUT Informatique. Le système fonctionne sur deux surfaces :

- **Claude Code** (local) : via les skills `/pedagogy:write`, `/pedagogy:review`, etc.
- **Clients MCP** (web) : via le serveur MCP à `/api/mcp` (Claude Web, ChatGPT, etc.)

## Source canonique

Les fichiers Markdown du skill sont dans `skills/pedagogie/` (git-tracké) :

```
skills/pedagogie/
├── manifest.json           — manifeste (version, documents, hashes)
├── SKILL.md                — instructions principales, routage, workflow
├── agents/
│   ├── concepteur.md       — rôle du Concepteur
│   ├── auditeur-apprenant.md — rôle de l'Auditeur apprenant
│   └── garant-coherence.md — rôle du Garant de cohérence
└── references/
    ├── cours.md            — règles JSX pour les cours
    ├── tp.md               — règles JSX pour les TPs
    ├── slide.md            — règles JSX pour les slides
    └── examen.md           — règles JSX pour les examens
```

## Les trois rôles pédagogiques

### Concepteur d'unité pédagogique
Raisonne conjointement sur les trois supports. Produit une carte d'alignement.
Ne publie pas directement (propose seulement).

### Auditeur du point de vue d'un apprenant en difficulté
Simule un apprenant sérieux mais fragile. Identifie les blocages réels.
N'appelle jamais les outils d'écriture MCP.

### Garant de cohérence curriculaire
Vérifie l'alignement entre les trois supports et la place dans le parcours.
N'appelle jamais les outils d'écriture MCP.

## Logique de routage

| Type de modification | Agents actifs |
|----------------------|---------------|
| Correction locale | Agent principal uniquement |
| Révision d'un seul support | Concepteur + Auditeur apprenant |
| Modification structurante | Les trois agents |
| Révision d'unité complète | Les trois agents (obligatoires) |

## Utilisation dans Claude Code

1. `/pedagogy:write [cours|tp|slide|examen]` — rédiger un support
2. `/pedagogy:review` — réviser un dossier (dispatche 2 ou 3 agents)
3. `/pedagogy:rewrite` — appliquer les corrections du REVIEW.md
4. `/pedagogy:sync` — mettre à jour le curriculum de la matière
5. `/pedagogy:module` — créer un nouveau module via MCP

## Utilisation via MCP (clients web)

### Découverte du skill

```
1. Connecter le serveur MCP (URL : /api/mcp, auth Scalekit OAuth 2.0).
2. Appeler get_pedagogical_skill_manifest() → manifeste JSON avec la liste des documents.
3. Appeler get_pedagogical_skill_document("main") → instructions principales.
4. Charger les documents complémentaires selon la tâche.
```

### Exemple de workflow complet (client web)

```
1. get_pedagogical_skill_manifest()
2. get_pedagogical_skill_document("main")
3. get_pedagogical_skill_document("concepteur")
4. get_pedagogical_skill_document("auditeur-apprenant")
5. get_pedagogical_skill_document("garant-coherence")
6. [Passe 1] Raisonner en tant que Concepteur → carte d'alignement
7. [Passe 2] Raisonner en tant qu'Auditeur apprenant → constats YAML
8. [Passe 3] Raisonner en tant que Garant de cohérence → constats YAML
9. [Passe 4] Consolider, arbitrer, réviser
10. save_content(...) ou insert_block(...) — si écriture demandée
11. Vérifier get_content(...) après chaque appel d'écriture
```

## Ressources MCP disponibles

Les fichiers du skill sont exposés comme ressources MCP en lecture seule :

| URI | Contenu |
|-----|---------|
| `skill://pedagogie/manifest` | Manifeste JSON |
| `skill://pedagogie/main` | Instructions principales |
| `skill://pedagogie/concepteur` | Rôle — Concepteur |
| `skill://pedagogie/auditeur-apprenant` | Rôle — Auditeur apprenant |
| `skill://pedagogie/garant-coherence` | Rôle — Garant de cohérence |
| `skill://pedagogie/ref-cours` | Référence Cours |
| `skill://pedagogie/ref-tp` | Référence TP |
| `skill://pedagogie/ref-slide` | Référence Slides |
| `skill://pedagogie/ref-examen` | Référence Examen |

## Prompts MCP

| Nom | Arguments |
|-----|-----------|
| `concevoir-unite-pedagogique` | `mode`, `objective?`, `audience?`, `requested_supports?`, `context?` |

## Outils MCP

### Lecture du skill (read-only, tous les utilisateurs authentifiés)
- `get_pedagogical_skill_manifest()` — manifeste et liste des documents
- `get_pedagogical_skill_document(document_id)` — contenu d'un document

### Lecture des contenus
- `list_modules()`, `list_sections(module)`, `get_content(module, section, type)`

### Écriture (admins uniquement)
- `create_module`, `create_section`, `edit_section`
- `save_content`, `insert_block`, `edit_block`, `delete_block`, `reorder_blocks`

## Mise à jour du skill

1. Modifier les fichiers Markdown dans `skills/pedagogie/`
2. Exécuter `node scripts/generateSkillModule.js` pour régénérer `src/lib/skills/pedagogie.ts`
3. Le hash dans `manifest.json` est mis à jour automatiquement
4. Lancer les tests : `bun test tests/mcp/skill-exposure.test.ts`
5. Committer les changements dans `skills/pedagogie/` et le `manifest.json` mis à jour

## Versionnement

La version du skill est dans `skills/pedagogie/manifest.json` (champ `version`).
Le hash de cohérence (`content_hash`) est calculé depuis les hashes de tous les documents.
Le même hash est exposé dans les réponses MCP pour permettre aux clients de vérifier la version.

## Tests

```bash
# Générer le module avant les tests
node scripts/generateSkillModule.js

# Tests d'exposition MCP
bun test tests/mcp/skill-exposure.test.ts

# Tests des utilitaires existants
bun test tests/lib/
```

## Limitations actuelles

Voir `MCP_CAPABILITY_GAPS.md` pour les fonctionnalités pédagogiques nécessaires mais
non encore disponibles via MCP (lecture des contenus en format lisible, curriculum compilé,
recherche par notion, historique des versions, relations entre sections).
```

- [ ] **Étape 2 : Commit**

```bash
git add docs/PEDAGOGY.md
git commit -m "docs: PEDAGOGY.md — documentation complète du système pédagogique multi-supports"
```

---

## Task 14 : Validation finale

- [ ] **Étape 1 : Générer le module skill**

```bash
node scripts/generateSkillModule.js
```

Attendu : `Skill module généré : src/lib/skills/pedagogie.ts (hash : xxxxxxxxxxxx)`

- [ ] **Étape 2 : Vérification TypeScript**

```bash
bunx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Étape 3 : Lint**

```bash
bun run lint
```

Attendu : aucune erreur (warnings tolérés si existants avant cette tâche).

- [ ] **Étape 4 : Tests unitaires complets**

```bash
bun test
```

Attendu : tous les tests PASS, aucune régression sur les tests existants.

- [ ] **Étape 5 : Vérifier la cohérence du manifest**

```bash
node -e "
const fs = require('fs');
const crypto = require('crypto');
const manifest = JSON.parse(fs.readFileSync('skills/pedagogie/manifest.json', 'utf-8'));
console.log('Version:', manifest.version);
console.log('Hash dans manifest:', manifest.content_hash);
console.log('Documents listés:', manifest.documents.map(d => d.id).join(', '));
let ok = true;
for (const doc of manifest.documents) {
  if (!fs.existsSync('skills/pedagogie/' + doc.path)) {
    console.error('MANQUANT:', doc.path);
    ok = false;
  }
}
if (ok) console.log('Tous les documents existent.');
"
```

Attendu : tous les documents existent.

- [ ] **Étape 6 : Vérifier qu'aucun outil existant n'est cassé**

```bash
bun test tests/lib/
```

Attendu : tous les tests des utilitaires existants PASS.

- [ ] **Étape 7 : Test de build complet**

```bash
bun run build
```

Attendu : le build se termine avec succès.
Le `prebuild` doit afficher `Skill module généré : ...` avant le build Next.js.

- [ ] **Étape 8 : Commit de clôture**

```bash
git add -p
git commit -m "feat(pedagogy): exposer le skill pédagogique via MCP — ressources, prompt, outils de lecture"
```

---

## Révision du plan vs spec

### Couverture de la spec

| Partie | Statut |
|--------|--------|
| Part 1 — Audit existant | ✓ Couvert (réalisé avant ce plan) |
| Part 2 — Trois rôles consolidés | ✓ Tasks 1, 2, 6 |
| Part 3 — Orchestrateur principal | ✓ SKILL.md workflow principal, Task 6 |
| Part 4 — Routage | ✓ SKILL.md + pedagogy-review Task 6 |
| Part 5 — Cohérence cours/TP/slides | ✓ SKILL.md sections "Vérifications" et "Impact" |
| Part 6 — Source canonique + manifest | ✓ Tasks 1-5 |
| Part 7 — Exposer via MCP | ✓ Tasks 7-10 |
| Part 8 — Compatibilité Claude Code + web | ✓ SKILL.md fallback + Tasks 6, 10 |
| Part 9 — Synchronisation source canonique | ✓ Scripts prebuild/predev Tasks 4-5 |
| Part 10 — Permissions | ✓ Fichiers agents (concepteur, auditeur, garant) |
| Part 11 — MCP_CAPABILITY_GAPS.md | ✓ Task 12 |
| Part 12 — Tests MCP | ✓ Task 11 |
| Part 13 — Scénarios validation | Note : scénarios 1-7 couverts par la doc et les tests |
| Part 14 — Documentation | ✓ Task 13 |
| Part 15 — Validation finale | ✓ Task 14 |

### Éléments non implémentés volontairement (hors périmètre)
- `search_pages`, `get_course_structure`, `light_content` — non demandés dans cette tâche
- Subagent-specific `.claude/agents/` files — `.claude/` est gitignored ; les rôles sont dans le skill

### Scan des placeholders
Aucun "TBD", "TODO", "implement later" dans le plan. Chaque étape contient le code complet.
