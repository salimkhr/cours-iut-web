# Skills pédagogiques MCP — conception de module + rédaction de contenu

Date : 2026-07-14
Statut : validé (brainstorm avec l'utilisateur)
Note : conception from scratch, sans tenir compte des skills pédagogiques antérieurs
(supprimés du repo le 2026-07-14).

## Problème

Il faut deux skills pour produire les contenus pédagogiques du site (cours, TP, slides,
examen), accessibles depuis n'importe quel client MCP (Claude Code, claude.ai, web) :

- un skill de **conception de module** : brainstorm de la liste des sections, définition
  d'un univers thématique, découpage en séances ;
- un skill de **rédaction de contenu** : écrire les supports section par section, en
  calibrant la taille du contenu sur la durée de séance et le nombre de séances.

## Décisions de cadrage

| Sujet | Décision |
|-------|----------|
| Découpage | **2 skills séparés** : `module-design` (conception) et `content-writer` (rédaction) |
| Accès | **MCP uniquement** — manifeste + documents servis par le serveur, aucun wrapper local requis |
| Stockage | **Hybride** : repo (Markdown compilé) pour la structure stable (workflow, philosophie, invariants) ; MongoDB pour ce qui évolue (verdicts de calibrage, exemplaires) |
| Encodage de la qualité | **Approche « léger + calibrage vivant »** avec passerelle vers les exemplaires : documents courts + verdicts accumulés en DB ; un contenu jugé parfait peut être promu en exemplaire de référence |
| Livrable conception | Plan écrit validé en conversation, **puis** création module + sections en base dans la même session |
| Modèle temporel | Séance mixte : cours/slides en ouverture de la **1re séance uniquement**, TP sur tout le reste. Durée de séance uniforme par module |
| Granularité rédaction | Supports au choix à l'invocation (un seul, plusieurs, toute la section) ; ordre cours → slides → TP quand plusieurs |
| Examen | **TP indépendant hors fil rouge** en fin de module, remobilisant les notions des curriculums ; généré en autonomie (pas de validation de squelette) ; durée cible une séance |
| Flux d'écriture | Hybride : squelette validé en chat → écriture directe sur **staging** → relecture navigateur → corrections `edit_block` → copie vers prod sur confirmation |
| Staging → prod | Copie **via MCP par le skill** (`get_content` staging → `save_content` prod), confirmation explicite avant chaque écriture prod. Pas de chantier export/import pour l'instant |
| Outil de copie | **`get_content` uniquement** : il renvoie l'arbre de blocs JSON attendu par `save_content` (round-trip sans perte). `export_content_compact` renvoie du Markdown — outil de lecture seule, **jamais** utilisé pour une copie |
| Univers | **Un par module, fil rouge cumulatif**. TP = exercices guidés « classiques » d'abord, puis remise en pratique dans le fil rouge |
| Prod | **Jamais** écrite directement par les skills — toujours staging d'abord, prod sur confirmation |

## Architecture

```
Serveur MCP (staging + prod)
├── Skill « module-design »      → concevoir un module
│   └── documents : main (workflow + philosophie)
├── Skill « content-writer »     → rédiger cours / slides / TP / examen
│   └── documents : main (workflow + philosophie + grammaire des blocs + invariants)
├── Outils calibrage (MongoDB)
│   ├── add_verdict / list_verdicts / distill_verdicts   → la mémoire vivante
│   └── promote_exemplar / list_exemplars                → la passerelle exemplaires
└── Outils existants : modules, sections, contenus, blocs
```

**Répartition repo / MongoDB :**

- **Repo** : documents de workflow, philosophie pédagogique, grammaire des blocs,
  invariants — Markdown versionné en git, compilé (mécanisme type `generate-skill`)
  et servi via `get_pedagogical_skill_manifest` / `get_pedagogical_skill_document`.
- **MongoDB** : verdicts de calibrage et exemplaires promus — alimentables depuis
  n'importe quel client MCP, visibles immédiatement partout, sans déploiement.

**Cycle de vie d'une session** : le client charge le manifeste → charge le document
`main` du skill concerné → le workflow impose de lire `list_verdicts` et
`list_exemplars` avant toute production.

**Hygiène du calibrage** (garde-fou anti-inflation) : quand un motif revient dans 3+
verdicts, le workflow propose de le distiller — en annotation d'exemplaire ou en
invariant dans le document de format — puis marque les verdicts distillés
(`distill_verdicts`). Le calibrage reste court par construction.

## Modèle de données MongoDB

### Collection `pedagogy_verdicts`

```ts
{
    _id: ObjectId,
    date: Date,
    format: "cours" | "tp" | "slides" | "examen" | "module-design",
    moduleSlug?: string,           // contexte d'où vient le verdict
    verdict: string,               // la critique utilisateur, verbatim
    status: "active" | "distilled" // distilled = promu puis retiré des lectures
}
```

`list_verdicts` ne renvoie que les `active`, filtrables par format. Un verdict distillé
est marqué, pas supprimé (trace conservée, invisible du workflow).

### Collection `pedagogy_exemplars`

```ts
{
    _id: ObjectId,
    date: Date,
    format: "cours" | "tp" | "slides" | "examen",
    moduleSlug: string,
    sectionSlug: string,
    level: "debutant" | "intermediaire" | "avance", // pour choisir le plus proche
    snapshot: Block[],             // copie figée des blocs à la promotion
    annotations: string[]          // notes « pourquoi c'est bon », validées à la promotion
}
```

Le snapshot est **figé** : retoucher le contenu vivant ensuite ne modifie pas l'étalon
(pas de dérive silencieuse de la référence).

### Champs sur les collections existantes

- `Module.universe` : `{ name: string, description: string }` — fil rouge du module
  (domaine + données types). Toujours cumulatif, pas de champ `scope`.
- `Module.sessionDurationMinutes` : durée d'une séance, uniforme par module.
- `Section.sessionCount` : nombre de séances de la section.
- `Section.courseIntroMinutes` : temps cours/slides en ouverture de la 1re séance.
  Budget TP = `sessionCount × sessionDuration − courseIntroMinutes`.
- `Section.brief` — le **prévu**, écrit par le skill de conception :

```ts
brief?: {
    objectives: string[],   // ce que l'étudiant saura faire en fin de section
    notions: string[],      // notions à couvrir
    filRougeStep: string,   // ce que le TP ajoute au projet fil rouge
    notes?: string          // consignes libres (pièges, prérequis, insistances)
}
```

- `Section.curriculum` — le **réalisé**, mis à jour par le skill de rédaction après
  écriture : notions effectivement enseignées + APIs/fonctions vues. Le skill de la
  section N+1 le lit pour connaître les acquis réels.

Si le rédigé s'écarte du prévu (notion repoussée à la section suivante…), le skill le
signale et propose de mettre à jour les briefs concernés.

Tous ces champs sont exposés en lecture via `list_modules`/`list_sections`, en écriture
via `create_*`/`edit_*`.

### Visibilité admin

- **Formulaire module** : `universe` (nom + description) et `sessionDurationMinutes`,
  éditables.
- **Formulaire section** : `sessionCount`, `courseIntroMinutes`, `brief`, `curriculum`,
  éditables — correction manuelle possible sans session IA.
- **Page calibrage** (nouvelle page admin) : consultation des verdicts actifs et des
  exemplaires, avec suppression.

## Workflow — skill « module-design »

1. **Cadrage** — matière/thème, niveau des étudiants, nombre total de séances, durée
   d'une séance. Via arguments ou questions.
2. **Contexte** — `list_modules` + `list_sections` des modules existants (avec leurs
   `curriculum`) pour situer les prérequis réels ; `list_verdicts(format:
   "module-design")`.
3. **Découpage en sections** — brainstorm de la progression des notions : liste des
   sections, `sessionCount`, `courseIntroMinutes`, objectifs et notions de chaque
   section. Vérification du budget : somme des séances = budget du module. Le `brief`
   est rempli sauf l'étape fil rouge.
4. **Univers + plan d'avancement** — 2-3 univers candidats, chacun présenté avec son
   plan d'avancement section par section (« section 1 : le projet affiche X ;
   section 2 : on ajoute Y ; … fin de module : l'application fait Z »). L'utilisateur
   choisit ; le `filRougeStep` de chaque brief est alors rempli.
5. **Plan écrit** — restitution complète (module + univers + sections avec briefs
   complets), validation ou retour aux étapes 3/4.
6. **Création en base** — après le « go » : `create_module` + `create_section` × N sur
   **staging**, tous champs et briefs inclus. Restitution des slugs. Passage en prod
   par copie MCP, quand l'utilisateur le décide. Critique en fin de session →
   `add_verdict`.

## Workflow — skill « content-writer »

1. **Cadrage** — module + section cibles, supports demandés (cours, slides, TP — un
   seul, plusieurs ou tous). Si plusieurs : ordre cours → slides → TP, chacun validé
   avant le suivant.
2. **Contexte MCP** — jamais de génération « de tête » :
   - module : `universe`, `sessionDurationMinutes` ;
   - section : `brief`, `sessionCount`, `courseIntroMinutes` ;
   - `curriculum` des sections précédentes (acquis réels) ;
   - TP précédents du module (état d'avancement réel du fil rouge) ;
   - `list_block_types` (jamais de type deviné).
   Budgets : cours + slides = `courseIntroMinutes` ;
   TP = `sessionCount × sessionDuration − courseIntroMinutes`.
3. **Imprégnation** — `list_verdicts(format)` + `list_exemplars` (exemplaire le plus
   proche : même format, niveau voisin) avant d'écrire la moindre ligne.
4. **Squelette, validé en chat** — TP : liste d'exercices avec durée estimée, part
   « classique » vs part « fil rouge », somme dans **80–100 % du budget** (hors budget
   = bloquant, redimensionner). Cours/slides : plan des notions avec minutage.
   Validation utilisateur avant rédaction.
5. **Rédaction sur staging** — blocs écrits directement via MCP sur staging.
6. **Relecture navigateur** — l'utilisateur relit le rendu réel ; corrections via
   `edit_block`/`insert_block`/`delete_block`/`reorder_blocks` jusqu'à validation.
7. **Clôture** — mise à jour du `curriculum` de la section ; signalement des écarts au
   `brief` (+ proposition de mise à jour des briefs suivants) ; selon le retour
   utilisateur : `add_verdict` (déception) ou proposition de `promote_exemplar`
   (« c'est exactement ça ») ; proposition de copie vers prod (confirmation explicite).

### Cas particulier — l'examen

Structurellement un **TP indépendant** : mêmes règles de consigne qu'un TP (fichiers
cibles, résultat attendu, critères de validation), mais **hors fil rouge** — sujet
autonome avec son propre contexte, remobilisant les notions des `curriculum` du module.
Aucune dépendance au projet fil rouge (un étudiant ayant raté des séances n'est pas
pénalisé par un état de projet manquant). Généré en autonomie en fin de module (pas de
validation de squelette), durée cible une séance, relecture directe sur staging.

## Partie pédagogique (contenu des documents `main`)

Philosophie courte + invariants non négociables ; le calibrage affine le reste par
l'usage. Cette philosophie est un **brouillon d'amorçage** : les verdicts la feront
évoluer, les motifs récurrents y seront distillés.

### Philosophie (commune aux deux skills)

- **L'apprentissage se joue dans le TP.** Cours et slides sont des supports d'amorçage
  (les `courseIntroMinutes` de la 1re séance) ; le cours ne cherche pas l'exhaustivité,
  il donne le minimum pour démarrer le TP.
- **Public réel** : étudiants de BUT Informatique, niveaux hétérogènes. Calibrer pour
  que **l'étudiant fragile démarre** et que le rapide ne s'ennuie pas (exercices bonus
  en fin de TP, hors budget).
- **Code réaliste uniquement** : jamais de foo/bar/toto ; données et exemples puisent
  dans l'univers du module.
- **Progression dans chaque TP** : exercices guidés « classiques » pour installer le
  geste, puis remise en pratique dans le fil rouge où le guidage s'allège.
- **Voix d'enseignant** : ton direct, vouvoiement ; **impératif vouvoyé strict** dans
  les consignes de TP (« Créez », « Ouvrez », « Modifiez »… jamais d'infinitif ni de
  futur). Interdits : phrases creuses (« il est important de noter que »), conclusions
  plaquées, enthousiasme artificiel, listes sèches sans lien logique.
- **Structure** : le skill imbrique les blocs (sections/sous-parties) sans écrire de
  numérotation — elle est générée automatiquement par le rendu.

### Invariants non négociables (par format)

- **TP — contrat de consigne** : chaque exercice indique fichier(s) cible(s), noms
  exacts à créer, données d'entrée, **méthode/API imposée** (empêche le contournement
  de la notion visée), résultat observable (sortie verbatim ou description du rendu),
  critère de validation. Test : l'étudiant peut-il démarrer en moins de 2 minutes sans
  lever la main ?
- **TP — budget temps** : somme des durées estimées entre 80 et 100 % du budget.
  Hors plage = bloquant, redimensionner.
- **Cours** : chaque notion = un exemple univers minimal → une variante réaliste → une
  erreur fréquente commentée (anticiper le blocage plutôt que le subir).
- **Slides** : support de l'oral, pas un cours dupliqué — une idée par slide, le détail
  reste dans le cours écrit.
- **Examen** : contrat de consigne intégral, hors fil rouge, notions issues des
  curriculums uniquement (jamais une notion non enseignée).

### Grammaire des blocs

Quelle intention pédagogique appelle quel type (types réels de `src/lib/blockDefs.ts`) :

| Intention pédagogique | Bloc |
|---|---|
| Commande à exécuter dans le terminal | `code` avec `language: "bash"` (jamais dans un bloc texte) |
| Fichier à créer/modifier par l'étudiant | `code` avec `filename` renseigné (nom exact du contrat de consigne) |
| Résultat visuel attendu (HTML/CSS) | `code-with-preview` |
| Fichier de départ, assets, données fournies | `download-file` (jamais « recopiez ce long code ») |
| Piège / erreur fréquente | `callout` variant `warning` |
| Astuce, bonne pratique | `callout` variant `tip` |
| Rappel d'une notion d'une section précédente | `callout` variant `reminder` |
| Indice ou solution masquée | `collapsible` |
| Partie fil rouge d'un TP | `section` avec `projectRef: true` |
| Renvoi vers le cours depuis le TP | `section-card` |
| Schéma de concept (flux, arborescence, cycle) | `diagram` (Mermaid) |
| Comparaison / récapitulatif d'API | `table` |
| Mise en valeur de lignes clés | `code` avec `highlightLines` |
| Notes enseignant sur une slide | `slide-note` (jamais visible étudiant) |

Règles : `list_block_types` appelé avant toute écriture (la grammaire guide le choix,
l'outil MCP fait foi pour les props) ; un type inexistant n'est jamais inventé — si une
intention n'a pas de bloc adapté, le skill le signale au lieu de bricoler.

## Chantiers code (par ordre de dépendance)

1. **Champs DB** — `Module.universe`, `Section.sessionCount`,
   `Section.courseIntroMinutes`, `Section.brief`, `Section.curriculum`. Types
   TypeScript + schémas Zod + exposition dans les outils MCP existants.
2. **Collections calibrage** — `pedagogy_verdicts` et `pedagogy_exemplars` + 5 outils
   MCP : `add_verdict`, `list_verdicts` (actifs seulement, filtre format),
   `distill_verdicts` (marque `distilled` un lot), `promote_exemplar` (snapshot +
   annotations), `list_exemplars` (filtre format/niveau).
3. **Documents skill** — sources Markdown dans le repo, compilées et servies via le
   manifeste MCP : `module-design/main`, `content-writer/main`. Les instructions
   serveur MCP orientent tout client vers le bon document selon la tâche.
4. **Admin** — formulaires module/section enrichis + page calibrage.

## Gestion d'erreurs

- Serveur MCP indisponible → arrêt immédiat avec message clair ; jamais de génération
  « de tête ».
- Section sans `brief` à la rédaction → proposition de le co-construire en début de
  session (mini-étape de conception) ; pas de rédaction à l'aveugle.
- Budget temps hors 80–100 % au squelette → bloquant, redimensionnement avant rédaction.
- Copie staging → prod : toujours sur confirmation explicite, section par section,
  jamais en lot silencieux.
- Examen demandé avec des `curriculum` vides → signaler les sections non rédigées et
  s'arrêter.

## Validation

- `bun run build` + tests après chaque chantier code (schémas Zod, outils MCP).
- Recette de bout en bout : concevoir un **petit module réel** sur staging avec
  `module-design` → rédiger une section complète (cours + slides + TP) avec
  `content-writer` → vérifier budgets temps et contrat de consigne → générer l'examen
  → copier une section en prod.

## Hors périmètre

- Chantier export/import de modules (la copie MCP staging → prod suffit pour démarrer ;
  à développer plus tard si limites : volumétrie, images…).
- Formats secondaires (TD, fiche de synthèse, tutoriel, corrigé) — pourront s'ajouter
  plus tard par le même mécanisme.
- Wrappers locaux `.claude/skills/` — les skills sont MCP-only ; des wrappers pourront
  être ajoutés ensuite si le confort d'invocation le justifie.
