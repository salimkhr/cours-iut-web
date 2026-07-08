# Refonte du skill `/pedagogy:write` — orchestration + références

Date : 2026-07-08
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

## Architecture — six chantiers

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

### 6. Nettoyage et régénération

- Supprimer `.claude/skills/pedagogy/reference/` (copie périmée des références, plus
  aucun skill n'y pointe — vérifié par grep).
- `bun run generate-skill` après modification des références/rôles pour régénérer
  `src/lib/skills/pedagogie.ts` (jamais éditer ce fichier à la main ; le manifest hash
  suit).

## Gestion d'erreurs

- Serveur MCP indisponible ou non connecté → arrêt en phase 2 avec message clair.
  Le skill ne génère jamais « de tête » sans contexte MCP.
- Boucle de calibrage bornée à 2 itérations : au-delà, livrer avec les réserves
  explicitement listées plutôt que de boucler.

## Validation

- `bun run build` après le chantier code (champ `universe`).
- Tests Zod du schema module si la suite existante couvre `module.schema.ts`.
- Test de bout en bout : générer un TP sur un module de staging
  (`cours-iut-staging`) et vérifier budget (80–100 %) + contrat de consigne sur chaque
  exercice.

## Hors périmètre

- `ref-slide` et `ref-examen` : mêmes principes applicables, mais chantier ultérieur
  (cohérent avec la décision du 2026-07-02).
- Les skills `pedagogy-review` / `pedagogy-rewrite` : non modifiés ici.
