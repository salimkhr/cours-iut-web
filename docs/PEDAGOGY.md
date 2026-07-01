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
1.  get_pedagogical_skill_manifest()
2.  get_pedagogical_skill_document("main")
3.  get_pedagogical_skill_document("concepteur")
4.  get_pedagogical_skill_document("auditeur-apprenant")
5.  get_pedagogical_skill_document("garant-coherence")
6.  [Passe 1] Raisonner en tant que Concepteur → carte d'alignement
7.  [Passe 2] Raisonner en tant qu'Auditeur apprenant → constats YAML
8.  [Passe 3] Raisonner en tant que Garant de cohérence → constats YAML
9.  [Passe 4] Consolider, arbitrer, réviser
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
- `list_modules()`, `list_sections(module)`, `get_migration_status()`
- `get_content(module, section, type)` — arbre JSON complet (verbeux)
- `search_content(query, module?, type?, limit?)` — recherche plein texte multi-sections
- `export_content_compact(module, section?, type?)` — export Markdown compact, annoté d'IDs de blocs

### Stratégie de lecture recommandée

Pour auditer ou résumer un contenu pédagogique :

1. `list_modules()` → identifier le module
2. `search_content(query, module?)` → trouver les sections pertinentes
3. `export_content_compact(module, section, type)` → lire le contenu complet

`export_content_compact` est 3-5× plus compact que `get_content` (JSON brut vs Markdown).
Les IDs de blocs dans les commentaires HTML (`<!--blockId-->`) permettent d'utiliser
`edit_block`, `insert_block` ou `reorder_blocks` sans relire le JSON brut.

> Le contenu dont la source est encore `file` (non migré) n'est pas accessible via ces
> deux outils. Utiliser `get_migration_status()` pour connaître l'état de migration.

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
