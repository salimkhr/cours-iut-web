# Refonte du skill `/pedagogy:write` — orchestration + références

Date : 2026-07-08 (étendue le même jour au chantier 7 : alignement review/rewrite/sync)
Statut : validé (brainstorm avec l'utilisateur)

## Problème

Le skill `.claude/skills/pedagogy-write/SKILL.md` (42 lignes) est en retard sur tout
l'écosystème pédagogique : il demande le type, lit une référence, pose 1–2 questions et
« génère le contenu directement dans la structure JSX du projet ». Il ignore le pipeline
MCP (blocs MongoDB), les rôles concepteur/auditeur-apprenant/garant-cohérence, le contrat
d'entrée, le budget temps et le fil rouge — tout ce que la refonte du 2026-07-02 a mis en
place dans `skills/pedagogie/`.

Symptômes constatés sur les contenus générés :

- **TP sous-dimensionnés** — finis bien avant la fin de la séance, budget temps inexploité.
- **Consignes ambiguës** — l'étudiant ne sait pas quel fichier créer, quoi nommer, ni à
  quoi ressemble le résultat attendu.
- **Exemples pauvres** — génériques, trop simples, déconnectés d'un cas réel.

Cause racine : les règles de qualité existent dans `skills/pedagogie/references/*` mais le
skill write ne force pas leur application (pas de phase de conception, pas d'audit, pas de
collecte de contexte).

## Décisions de cadrage

| Sujet | Décision |
|-------|----------|
| Périmètre | Orchestration **et** références |
| Univers thématique | Un univers par module, stocké en DB (champ sur `Module`) |
| Calibrage TP | Grille de durées a priori + simulation par l'auditeur, cible 80–100 % du budget |
| Consignes | Contrat complet sur **tous** les exercices, y compris guidage léger |
| Orchestration | Pipeline complet systématique avec sous-agents à chaque rédaction |
| Architecture | A — pipeline dans `/pedagogy:write` (spécifique Claude Code), règles de contenu dans `skills/pedagogie/` (partagées avec les clients MCP web) |
| Boucle write→review→rewrite | Alignée dans la même refonte : review/rewrite/sync basculent sur MCP et chargent les rôles depuis `skills/pedagogie/` |

## Architecture — sept chantiers

### 1. Champ `universe` sur Module (code)

```ts
universe?: {
    name: string;         // "Netflex"
    description: string;  // domaine + données types : "catalogue de films : title, year, genre, rating…"
    scope: "module" | "tp"; // fil rouge annuel (projet unique) vs livrable par TP
}
```

- `universe.scope` remplace l'inférence « PHP → Netflex » codée en dur dans ref-tp :
  le module déclare lui-même son échelle de fil rouge.
- Champ **optionnel** : un module sans `universe` déclenche, à la rédaction, une question
  du skill (« quel univers pour ce module ? ») avec proposition de sauvegarde via
  `edit_module`.
- Fichiers touchés : `src/types/Module.ts`, `src/lib/schemas/module.schema.ts`,
  outils MCP `create_module` / `edit_module` / `list_modules`
  (`src/app/api/mcp/route.ts`), formulaire admin de module (champ name + textarea
  description + select scope). Même chemin que `sessionDurationMinutes`.

### 2. `skills/pedagogie/references/tp.md` — enrichissements

- **Contrat de consigne universel** : tout exercice, quel que soit le niveau de guidage,
  fournit : fichier(s) cible(s), noms exacts à créer, données d'entrée, résultat
  observable décrit précisément (sortie console verbatim, description du rendu), critère
  de validation. Le guidage léger ne retire que les étapes intermédiaires (« comment »),
  jamais le contrat.
- **Grille de dimensionnement** : exercice guidé ≈ 20–30 min, exercice léger ≈ 40–60 min.
  Le nombre d'exercices se déduit du budget. Cible : la somme des durées estimées couvre
  **80–100 % du budget** ; un TP finissable en 30 min sur une séance de 150 min est un
  constat bloquant.
- **Ancrage univers** : toutes les données, exemples et livrables puisent dans le champ
  `universe` du module (lu via `list_modules`). La section « Deux échelles de fil rouge »
  s'appuie sur `universe.scope` au lieu de l'exemple PHP en dur.

### 3. `skills/pedagogie/references/cours.md` — enrichissements

- Chaque notion est illustrée par au moins un exemple tiré de l'univers du module, avec
  progression (cas minimal → variante réaliste) et une erreur fréquente commentée.
- Interdiction des exemples hors univers, sauf nécessité technique justifiée.

### 4. Rôles

- **`concepteur.md`** : reçoit budget chiffré + univers dans le contrat d'entrée ;
  produit un squelette d'exercices avec **durée estimée par exercice** (grille) avant de
  rédiger ; la somme doit tomber dans 80–100 % du budget dès la conception.
- **`auditeur-apprenant.md`** — deux contrôles structurés supplémentaires :
  - **Simulation temporelle** : estime le temps réel étudiant par exercice, produit un
    verdict chiffré vs budget ; finding bloquant si < 80 % ou > 100 %.
  - **Test de démarrage** : pour chaque exercice — « puis-je démarrer en moins de
    2 minutes sans poser de question ? quel fichier ? quel nom ? qu'est-ce que je dois
    voir à la fin ? ». Toute réponse manquante = finding.

### 5. `.claude/skills/pedagogy-write/SKILL.md` — pipeline en 8 phases

1. **Cadrage** — type (Cours / TP / Slide / Examen) + module/section cibles, via args ou
   questions.
2. **Collecte MCP** — `list_modules` (`sessionDurationMinutes`, `isExtra`, `universe`),
   `list_sections` (`totalDuration`), `get_content` des supports existants de la
   section ; si `universe.scope === "module"`, reconstruction de l'état du fil rouge en
   lisant les TP des sections précédentes ; calcul du budget. Univers manquant →
   question + proposition `edit_module`.
3. **Contrat d'entrée** — format YAML du skill main, complété : budget chiffré, univers,
   état du fil rouge.
4. **Conception** — sous-agent **concepteur** (Task) : contrat + référence du type →
   carte d'alignement + squelette avec durées + brouillon en blocs.
5. **Audits** — sous-agents en parallèle : **auditeur-apprenant** toujours ;
   **garant-cohérence** si fil rouge annuel ou modification structurante.
6. **Consolidation + boucle calibrage** — arbitrage des findings (format `decision` du
   skill main) ; si verdict temps hors 80–100 % ou findings bloquants → retour au
   concepteur ; **max 2 itérations**, puis livraison en signalant les réserves restantes.
7. **Écriture MCP** — `save_content` / `insert_block` / … uniquement après consolidation ;
   `list_block_types()` appelé avant toute écriture (jamais de type deviné).
8. **Vérification** — relecture via `get_content`, contrôle que chaque bloc écrit
   correspond au contenu consolidé.

Le SKILL.md contient uniquement ce pipeline et le routage vers les références
(`skills/pedagogie/references/*`). Aucune règle de contenu dupliquée.

**Garde-fous anti-rationalisation** (pedagogy-write est un skill de discipline ; les
règles doivent résister à un agent pressé) :

- **Liste de red flags** — chacun signifie STOP : écrire des blocs avant consolidation ;
  deviner un type de bloc sans `list_block_types()` ; sauter l'auditeur-apprenant ;
  générer sans contexte MCP ; livrer un TP sous 80 % du budget sans le signaler.
- **Table excuse → réalité**, au minimum :
  | Excuse | Réalité |
  |--------|---------|
  | « C'est un petit TP, pas besoin d'audit » | Les TP courts sont précisément ceux qui sortaient sous-dimensionnés. |
  | « Je connais déjà les types de blocs » | Le schéma évolue ; un type deviné casse le renderer. |
  | « Une itération suffit, le budget est approximatif » | Le verdict chiffré de l'auditeur décide, pas l'intuition. |
  | « L'utilisateur est pressé, j'écris directement » | Le pipeline existe parce que l'écriture directe produisait du contenu inutilisable. |
- **Mini-flowchart de la boucle calibrage** — c'est une boucle de processus où l'agent
  risque de s'arrêter trop tôt : audits → verdict (80–100 % du budget + zéro finding
  bloquant ?) → oui : écriture MCP / non : retour concepteur (max 2 itérations) → au-delà :
  livraison avec réserves explicites.

### 6. Nettoyage et régénération

- Supprimer `.claude/skills/pedagogy/reference/` (copie périmée des références, plus
  aucun skill n'y pointe — vérifié par grep).
- `bun run generate-skill` après modification des références/rôles pour régénérer
  `src/lib/skills/pedagogie.ts` (jamais éditer ce fichier à la main ; le manifest hash
  suit).

### 7. Alignement de la boucle review → rewrite → sync

Constat : `pedagogy-review`, `pedagogy-rewrite` et `pedagogy-sync` vivent encore dans
l'ancien monde fichiers (`src/cours/**/*.tsx`, règles JSX, prompts de rôles dupliqués en
dur). Sans alignement, le contenu produit par le nouveau write (blocs en DB) serait
invisible pour review/rewrite et le curriculum décrocherait. Deux principes communs :

- **Lecture/écriture via MCP** — plus aucun accès `src/cours/*.tsx`. Si une section n'a
  pas de contenu en DB, le skill le signale et s'arrête (pas de repli silencieux sur les
  fichiers).
- **Zéro duplication de règles** — les prompts de rôles et les règles de contenu sont
  chargés depuis `skills/pedagogie/` (agents + références), jamais recopiés dans les
  SKILL.md. Les nouveaux contrôles (simulation temporelle, test de démarrage, contrat de
  consigne) s'appliquent ainsi automatiquement à la review.

**`pedagogy-review`** :

- Cible = module/section (slugs DB via args ou question), plus un dossier `src/cours/`.
- Collecte via MCP : `list_modules` (universe, durées), `list_sections`,
  `get_content` / `export_content_compact` pour chaque support (cours, slide, TP, examen).
- Les prompts des trois sous-agents sont construits en injectant : le document de rôle lu
  depuis `skills/pedagogie/agents/*.md` + le contrat d'entrée + les contenus exportés.
  Les prompts en dur actuels du SKILL.md sont supprimés.
- Sortie inchangée : `reviews/[module]-[section]-REVIEW.md` (slugs DB), items `- [ ]`.

**`pedagogy-rewrite`** :

- Lecture du contenu via `get_content` ; corrections via `edit_block` / `insert_block` /
  `delete_block` / `reorder_blocks` (`list_block_types()` avant toute écriture) au lieu
  d'Edit/Write sur `.tsx`.
- Les règles de réécriture renvoient aux références `skills/pedagogie/references/*`
  (dont le contrat de consigne universel) — plus de règles JSX en dur.
- Flux conservé : regroupement par thèmes → 2–3 angles par thème → validation → réécriture
  → marquage `[x]` + `> Traité`.
- L'exemple actuel « guidage trop fort → consigne reformulée en objectif fonctionnel
  uniquement » est remplacé : toute reformulation doit préserver le contrat de consigne.

**`pedagogy-sync`** :

- Extraction depuis les blocs DB (`get_content` : blocs `text`/`heading`/`list` pour les
  concepts, blocs `code` pour les APIs) au lieu des `.tsx`.
- Sortie inchangée : `reviews/[matiere]-curriculum.md`.

**Descriptions frontmatter (les 4 skills)** :

Les descriptions actuelles résument le workflow (« Regroupe les problèmes par thème,
brainstorme 2-3 angles… », « Dispatche les sous-agents… »). Phénomène documenté par le
skill writing-skills : l'agent suit alors la description au lieu de lire le corps du
skill. Toutes les descriptions sont réécrites en **déclencheurs uniquement**
(« À utiliser quand… »), sans résumé de processus. Exemples cibles :

- `pedagogy-write` : « À utiliser quand il faut rédiger un nouveau contenu pédagogique
  (Cours, TP, Slide, Examen) pour un module du site IUT. »
- `pedagogy-rewrite` : « À utiliser quand un REVIEW.md contient des items non traités
  à corriger. »
- `pedagogy-review` : « À utiliser quand un contenu pédagogique existant doit être
  critiqué ou audité avant correction. »
- `pedagogy-sync` : « À utiliser après création ou modification d'un contenu pour tenir
  le curriculum à jour. »

## Gestion d'erreurs

- Serveur MCP indisponible ou non connecté → arrêt en phase 2 avec message clair.
  Le skill ne génère jamais « de tête » sans contexte MCP.
- Boucle de calibrage bornée à 2 itérations : au-delà, livrer avec les réserves
  explicitement listées plutôt que de boucler.

## Validation

- `bun run build` après le chantier code (champ `universe`).
- Tests Zod du schema module si la suite existante couvre `module.schema.ts`.

### Protocole baseline (TDD appliqué aux skills)

1. **RED — baseline avant refonte** : générer un TP sur un module de staging avec le
   skill actuel et archiver le résultat comme baseline chiffrée : durée totale estimée
   vs budget, nombre d'exercices sans fichier cible / sans résultat observable / sans
   critère de validation, nombre d'exemples hors univers ou jouets.
2. **GREEN — même scénario après refonte** : rejouer exactement le même scénario
   (même module, même section, même consigne) avec le nouveau pipeline. Critères
   mesurables de réussite :
   - somme des durées estimées entre 80 et 100 % du budget ;
   - 100 % des exercices avec contrat de consigne complet (fichier, noms, entrée,
     résultat observable, critère de validation) ;
   - zéro donnée hors univers, zéro type de bloc inventé.
3. **REFACTOR** : si l'agent contourne une règle pendant le test, ajouter le
   contre-argument explicite dans la table excuse → réalité et rejouer.
4. **Boucle complète** : dérouler `/pedagogy:review` → `/pedagogy:rewrite` →
   `/pedagogy:sync` sur le contenu généré pour valider write → review → rewrite → sync
   de bout en bout.

## Hors périmètre

- `ref-slide` et `ref-examen` : mêmes principes applicables, mais chantier ultérieur
  (cohérent avec la décision du 2026-07-02).
- `pedagogy-plan` / `pedagogy-module` : non modifiés ici (déjà orientés MCP).
