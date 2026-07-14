# Réécriture complète du skill pédagogique — approche par exemplaires

Date : 2026-07-13
Statut : validé (brainstorm avec l'utilisateur)
Remplace : `2026-07-08-pedagogy-write-refonte-design.md` (la refonte write/review/rewrite/sync
est absorbée par la présente réécriture ; le plan de la spec du 2026-07-08 ne sera pas écrit).

## Problème

L'audit du 2026-07-12 juge le skill « robuste, mesurable et éprouvé » (notes 7,5 à 9,2/10),
mais l'usage réel contredit ces notes. Les contenus générés sont :

- **pédagogiquement plats** — structure respectée mais exemples prévisibles, pas de vraie
  progression de difficulté, pas d'anticipation des blocages étudiants ;
- **mécaniquement conformes** — l'agent coche les cases (contrat de consigne, gabarits,
  checklists) et produit du remplissage conforme, pas du contenu pensé ;
- **au style artificiel** — phrases creuses, listes sèches, conclusions plaquées, ton
  scolaire qui ne sonne pas comme un vrai enseignant.

Cause racine double :

1. **Sur-procéduralisation.** Le skill a été construit par accumulation défensive : chaque
   défaut observé a produit une règle, une checklist ou un document (26 documents, workflow
   12 étapes, 3 rôles, grille de scoring, cas limites). Plus le volume de règles augmente,
   plus l'agent optimise le respect des règles au détriment du fond. Les règles n'enseignent
   pas le goût.
2. **Philosophie pédagogique inversée.** Le skill actuel est centré sur le cours magistral
   structuré (gabarit contexte → définition → exemple minimal → exemple réaliste → pièges).
   La pédagogie réelle de l'auteur est **TP-centrique** : le cours est un support minimal,
   l'apprentissage se joue dans la manipulation de code réaliste (pas de foo/bar).

Contrainte de calibrage : il n'existe pas de corpus étalon (« je sais reconnaître une bonne
sortie, pas la montrer »). Le nouveau skill doit donc construire son étalon par itérations
avec l'utilisateur et capitaliser ses verdicts.

## Décisions de cadrage

| Sujet | Décision |
|-------|----------|
| Périmètre | Réécriture complète du skill canonique `skills/pedagogie/` |
| Approche | **B — tout par l'exemple** : le skill est un corpus d'exemplaires or annotés, co-construits en phase de bootstrap ; règles réduites au minimum |
| Formats couverts | Le cœur seul : cours, TP, slides, examen (les 4 types MCP natifs). TD, fiche de synthèse, tutoriel, corrigé, notes enseignant disparaissent du skill |
| Invariant unique | Le mécanisme d'exposition MCP (manifest + documents + `bun run generate-skill`), au contenu entièrement renouvelé |
| Unités sources | **2 unités réelles** de niveaux et matières différents (ex. une section débutant PHP ou HTML/CSS, une section avancée JavaScript), pour éviter la sur-spécialisation |
| Ordre de bootstrap par unité | **cours → TP → slides → examen** |
| Rôles | Un seul survit : l'**auditeur-apprenant** (test de démarrage, simulation temporelle). Le concepteur redevient inline (l'agent principal conçoit, l'exemplaire sous les yeux) ; le garant-cohérence est remplacé par exemplaires mono-unité + champ `curriculum` + review, et sera réintroduit si le bootstrap révèle des incohérences inter-supports (décision confirmée le 2026-07-13) |
| review / rewrite | Restent **séparés** : le REVIEW.md est une coupure de contexte (la review condense une lecture lourde en artefact compact ; le rewrite repart en session fraîche) |
| Curriculum | Devient un **champ DB sur `Section`**, exposé via MCP. Le skill `pedagogy-sync` est **supprimé** : write et rewrite mettent à jour le champ en fin de workflow |
| Wrappers locaux | 6 → **3** : `/pedagogy:write`, `/pedagogy:review`, `/pedagogy:rewrite`. Supprimés : `pedagogy-sync`, `pedagogy-module` (alias). `/pedagogy:plan` conservé hors périmètre |
| Acquis du 2026-07-08 | Contrat de consigne, budget temps 80-100 %, univers : non réinjectés d'office ; ils ne survivent que s'ils réémergent dans les annotations pendant le bootstrap |

## Architecture cible

### Structure de `skills/pedagogie/`

```
skills/pedagogie/
├── SKILL.md                  # ~100 lignes : philosophie, voix, workflow, routage
├── exemplaires/
│   ├── <unite-1>/
│   │   ├── cours.md          # exemplaire complet + annotations « pourquoi c'est bon »
│   │   ├── tp.md
│   │   ├── slides.md
│   │   └── examen.md
│   └── <unite-2>/
│       └── (mêmes 4 fichiers)
├── audit-apprenant.md        # le seul rôle : simulation de l'étudiant fragile
└── calibrage.md              # verdicts utilisateur accumulés (verbatim, datés)
```

Remplace : les 16 références, les 9 exemples M1, les 3 rôles, la checklist, la grille
d'évaluation et les cas limites actuels.

- **SKILL.md** : philosophie pédagogique (TP-centrique, code réaliste, cours minimal),
  voix d'enseignant (anti-style IA), workflow de rédaction et routage vers les exemplaires.
  Aucune checklist, aucun gabarit de structure imposé. La philosophie écrite au squelette
  initial est un **brouillon d'amorçage** : elle est réécrite en fin de bootstrap (après
  l'unité 2) à partir des verdicts réellement accumulés, pas l'inverse.
- **Exemplaires** : issus de 2 unités réelles complètes — ils encodent le style *et* la
  cohérence inter-supports. Les annotations sont la distillation des verdicts verbatim de
  l'utilisateur, pas des règles inventées par l'agent.
- **calibrage.md** : continue de vivre après le bootstrap. Chaque génération décevante y
  ajoute un verdict (date, format, citation). Un motif récurrent (2-3 occurrences) est
  promu en annotation d'exemplaire. **Règle d'hygiène** (inscrite dans SKILL.md) : les
  verdicts promus sont **retirés** du calibrage — il ne contient que les verdicts pas
  encore promus et reste court par construction. C'est le garde-fou contre la maladie
  qui a tué l'ancien skill : l'accumulation défensive de règles.

### Stockage et exposition

Les sources du skill (exemplaires compris) restent des fichiers Markdown du repo,
compilés dans `src/lib/skills/pedagogie.ts` par `bun run generate-skill` et servis aux
clients MCP par `get_pedagogical_skill_manifest` / `get_pedagogical_skill_document`.
Rien n'est stocké en MongoDB. Conséquence pour `calibrage.md` : les clients web le lisent
dans l'état du dernier déploiement ; son alimentation se fait via Claude Code (repo).

Les **unités sources restent des contenus vivants du site** : le bootstrap ne les
sacrifie pas, elles demeurent publiées et modifiables normalement.

### Rapport exemplaire ↔ unité réelle : snapshot annoté

Décision (2026-07-13) : l'exemplaire est une **copie figée et annotée** du contenu validé,
stockée dans `skills/pedagogie/exemplaires/`. L'unité source reste un contenu vivant du
site, publié et modifiable normalement — seul l'exemplaire est figé. L'alternative
« référence vivante » (annotations + pointeur, lecture via `export_content_compact`) est
écartée : une retouche anodine dans le builder modifierait l'étalon sans validation, et
les annotations commenteraient un texte disparu.

### Manifeste MCP

Documents exposés : `main`, les 8 exemplaires, `audit-apprenant`, `calibrage`.
Tous les ids `ref-*` et `example-*` actuels disparaissent.

### Chantier code — champ `curriculum` sur Section

Un champ `curriculum` sur `Section` (notions enseignées, APIs/fonctions utilisées — forme
exacte à définir au plan), lisible via `list_sections` et modifiable via `edit_section`
(ou outil dédié si `edit_section` ne convient pas). Même chemin d'implémentation que
`sessionDurationMinutes` et `universe` : `src/types/Section`, schéma Zod, outils MCP
(`src/app/api/mcp/route.ts`), admin si pertinent.

Les fichiers locaux `reviews/*-curriculum.md` sont supprimés ; la DB est la seule source.

### Workflow `/pedagogy:write` (6 étapes)

1. **Cadrage** — format + module/section cibles (args ou questions).
2. **Contexte MCP** — `list_modules` (univers, durée de séance), `list_sections`
   (dont champ `curriculum` des sections précédentes), contenus existants de la section,
   `list_block_types`.
3. **Imprégnation** — lire l'exemplaire du format (unité la plus proche en niveau/matière)
   + `calibrage.md`.
4. **Production** — rédaction en blocs.
5. **Confrontation** — relecture face à l'exemplaire, trois questions : même voix ? code
   aussi réaliste ? un étudiant démarre-t-il aussi vite ? Pour un TP ou un examen, audit
   apprenant en sous-agent.
6. **Écriture MCP** — écriture des blocs, **mise à jour du champ `curriculum`** de la
   section, restitution. Verdict utilisateur négatif → entrée dans `calibrage.md`.

### `/pedagogy:review` et `/pedagogy:rewrite`

- **review** : cible = module/section (slugs DB) ; collecte via MCP ; audit apprenant
  (rôle chargé depuis `skills/pedagogie/audit-apprenant.md`) + confrontation aux
  exemplaires ; sortie `reviews/[module]-[section]-REVIEW.md`, items `- [ ]`.
- **rewrite** : entrée unique = le REVIEW.md ; session fraîche ; corrections via
  `edit_block` / `insert_block` / `delete_block` / `reorder_blocks`
  (`list_block_types()` avant toute écriture) ; marquage `[x]` ; **mise à jour du champ
  `curriculum`** si les notions ont changé.
- Zéro règle de contenu dupliquée dans les wrappers : ils chargent `skills/pedagogie/`.

## Phase de bootstrap

Co-construction des 8 exemplaires, sur staging, à partir de sections réelles choisies au
démarrage via `list_modules`.

Boucle par contenu :

1. L'agent génère un premier jet avec le contexte MCP réel et l'état courant de la
   philosophie + `calibrage.md`.
2. L'utilisateur critique sans filtre, en langage naturel.
3. Chaque verdict est consigné **verbatim** dans `calibrage.md` (date, format, citation).
4. Itération jusqu'au « c'est exactement ça ».
5. Passe d'annotation : distillation des verdicts en notes dans l'exemplaire ;
   l'utilisateur valide les annotations.

Propriétés :

- effet cumulatif : dès le 2e contenu, la génération intègre les verdicts précédents ;
- après l'unité 1 (4 contenus), le skill est utilisable en production ; l'unité 2 affine ;
- double valeur : les exemplaires sont de vrais contenus publiables ;
- coût assumé : 2 à 4 itérations par contenu, plusieurs sessions.

## Démolition et tests

- **Démolition en dernier** : l'ancien skill reste fonctionnel pendant le bootstrap.
  Suppression (pas d'archivage, git suffit) : les 16 références, 9 exemples M1, 3 rôles,
  `tests/fixtures/pedagogie/prompts/`, `real-content-validation.json`, les wrappers
  `pedagogy-sync` et `pedagogy-module`, les fichiers `reviews/*-curriculum.md`.
- **Tests** : `tests/mcp/skill-exposure.test.ts` réécrit pour la nouvelle arborescence —
  même principe (source canonique ↔ module généré ↔ manifeste, aucun document orphelin).
  Tests de schéma/outil MCP pour le champ `curriculum`.
- `bun run generate-skill` après toute modification des sources ; `src/lib/skills/pedagogie.ts`
  n'est jamais édité à la main.

## Ordre de réalisation

1. Préalables : committer le travail en cours (lot M1-M5, working tree propre) et
   **générer la baseline** — une sortie de l'ancien skill archivée (même consigne que le
   critère final de validation), pendant qu'il fonctionne encore.
2. Chantier code `curriculum` (types, schéma, MCP, tests, build).
   (Le champ `universe` sur Module est déjà implémenté — vérifié le 2026-07-13 : types,
   schéma Zod, outils MCP, formulaire admin.)
3. Squelette du nouveau skill : SKILL.md (philosophie d'amorçage + workflow),
   `audit-apprenant.md`, `calibrage.md` vide, 3 wrappers réécrits.
4. Bootstrap unité 1 (cours → TP → slides → examen).
5. Bootstrap unité 2, puis réécriture de la philosophie du SKILL.md à partir des
   verdicts accumulés.
6. Démolition de l'ancien contenu + réécriture des tests + régénération MCP + mise à jour
   de `docs/PEDAGOGY.md` et des documents d'audit.

## Gestion d'erreurs

- Serveur MCP indisponible → arrêt en phase de contexte avec message clair ; jamais de
  génération « de tête ».
- Section sans contenu en DB pour review/rewrite → signaler et s'arrêter, pas de repli
  sur les fichiers `src/cours/`.
- Champ `curriculum` absent sur une section ancienne → le write le crée à la première
  écriture ; jamais d'invention de notions non présentes dans les blocs.

## Validation

- `bun run build` + tests après le chantier code `curriculum`.
- La validation du skill est le bootstrap lui-même : 8 exemplaires validés par
  « c'est exactement ça ».
- Critère final : dérouler write → review → rewrite sur une section **hors** des 2 unités
  sources et comparer à une sortie de l'ancien skill (même consigne).

## Hors périmètre

- `/pedagogy:plan` (et la conception de modules) : conservé tel quel.
- Les formats secondaires (TD, fiche de synthèse, tutoriel, corrigé, notes enseignant) :
  retirés du skill ; pourront revenir plus tard par le même mécanisme d'exemplaires.
- Le champ `universe` sur Module (déjà spécifié le 2026-07-08) : s'il n'est pas encore
  implémenté au moment du plan, il est repris comme prérequis du chantier code.
