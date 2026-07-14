# Skill content-writer — Rédiger cours, TP, slides, examen

À utiliser pour rédiger les supports d'une section existante (créée par
module-design ou à la main). Écrit sur staging uniquement ; la prod est une copie
séparée sur confirmation.

## Philosophie

- **L'apprentissage se joue dans le TP.** Le cours donne le minimum pour démarrer
  le TP — pas l'exhaustivité. Les slides portent l'oral d'ouverture.
- **Public réel** : BUT Informatique, niveaux hétérogènes. L'étudiant fragile doit
  démarrer chaque exercice en moins de 2 minutes sans lever la main ; le rapide
  trouve des exercices bonus en fin de TP (hors budget temps).
- **Code réaliste uniquement** : jamais de foo/bar/toto. Toutes les données et tous
  les exemples puisent dans l'`universe` du module.
- **Progression dans chaque TP** : exercices guidés « classiques » pour installer le
  geste, puis remise en pratique dans le fil rouge où le guidage s'allège.
- **Voix d'enseignant** : ton direct, vouvoiement. Impératif vouvoyé STRICT dans les
  consignes de TP (« Créez », « Ouvrez », « Modifiez » — jamais d'infinitif, jamais
  de futur). Interdits : phrases creuses (« il est important de noter que »),
  conclusions plaquées, enthousiasme artificiel, listes sèches sans lien logique.
- **Structure** : imbriquez les blocs (`section` et sous-parties) sans écrire de
  numérotation — elle est générée automatiquement par le rendu.

## Invariants non négociables

- **TP — contrat de consigne** : chaque exercice indique fichier(s) cible(s), noms
  exacts à créer, données d'entrée, méthode/API imposée (pour empêcher le
  contournement de la notion visée), résultat observable (sortie verbatim ou
  description précise du rendu), critère de validation.
- **TP — budget temps** : somme des durées estimées entre 80 et 100 % du budget.
  Hors plage = BLOQUANT : redimensionnez avant de rédiger.
- **Cours** : chaque notion = un exemple univers minimal → une variante réaliste →
  une erreur fréquente commentée (anticiper le blocage plutôt que le subir).
- **Slides** : support de l'oral, pas un cours dupliqué — une idée par slide, le
  détail reste dans le cours écrit.
- **Examen** : contrat de consigne intégral, HORS fil rouge, notions issues des
  `curriculum` uniquement (jamais une notion non enseignée).

## Grammaire des blocs

| Intention pédagogique | Bloc |
|---|---|
| Commande à exécuter dans le terminal | `code` avec `language: "bash"` (jamais dans un bloc texte) |
| Fichier à créer/modifier par l'étudiant | `code` avec `filename` renseigné (le nom exact du contrat de consigne) |
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

Appelez `list_block_types` avant toute écriture : la grammaire guide le choix,
l'outil fait foi pour les props exactes. Un type inexistant n'est JAMAIS inventé —
si une intention n'a pas de bloc adapté, signalez-le au lieu de bricoler.

## Workflow (7 étapes)

### 1. Cadrage
Module + section cibles, supports demandés (cours, slides, TP — un seul, plusieurs
ou tous). Si plusieurs : ordre cours → slides → TP, chacun validé avant le suivant.

### 2. Contexte MCP — jamais de génération « de tête »
- `list_modules` : `universe`, `sessionDurationMinutes` du module.
- `list_sections` : `brief` (le cahier des charges), `totalDuration`,
  `courseIntroMinutes` de la section cible ; `curriculum` des sections précédentes
  (les acquis réels).
- `export_content_compact` sur les TP des sections précédentes : l'état réel du
  projet fil rouge.
- `list_block_types`.

Budgets : cours + slides = `courseIntroMinutes` ;
TP = `totalDuration × sessionDurationMinutes − courseIntroMinutes`.

Section sans `brief` → proposez de le co-construire maintenant (mini-conception),
ne rédigez JAMAIS à l'aveugle. Serveur MCP indisponible → ARRÊT immédiat.

### 3. Imprégnation
- `list_verdicts` filtré sur le format à rédiger : relisez chaque critique.
- `list_exemplars` filtré sur le format : choisissez l'exemplaire le plus proche
  (niveau voisin), chargez-le avec `withSnapshot: true`, lisez ses annotations.
  Imitez sa voix, son niveau de détail, son réalisme — pas son sujet.

### 4. Squelette, validé en chat
- TP : liste d'exercices avec durée estimée chacun, part « classique » vs part
  « fil rouge », somme dans 80–100 % du budget. Hors plage = redimensionnez.
- Cours/slides : plan des notions avec minutage.
L'utilisateur valide ou amende AVANT toute rédaction.

### 5. Rédaction sur staging
Écrivez les blocs via `save_content` (première écriture) puis `insert_block` /
`edit_block` / `delete_block` / `reorder_blocks`. Staging uniquement.

### 6. Relecture navigateur
L'utilisateur relit le rendu réel. Corrigez via les outils de blocs jusqu'à son OK.

### 7. Clôture
- Mettez à jour le `curriculum` de la section via `edit_section` (notions
  effectivement enseignées + APIs vues — uniquement ce qui est dans les blocs).
- Signalez tout écart au `brief` et proposez la mise à jour des briefs suivants.
- Verdict utilisateur négatif → `add_verdict` (verbatim).
- « C'est exactement ça » → proposez `promote_exemplar` (annotations validées par
  l'utilisateur).
- Proposez la copie vers prod : relisez via `get_content` (staging) et rejouez via
  `save_content` (prod), avec confirmation explicite AVANT chaque écriture prod.
  `get_content` renvoie l'arbre de blocs JSON — jamais `export_content_compact`
  (Markdown, lecture seule) pour une copie.

## Cas particulier — l'examen

Structurellement un TP indépendant : mêmes règles de consigne, mais HORS fil rouge —
sujet autonome avec son propre contexte, remobilisant les notions des `curriculum`
du module. Aucune dépendance au projet fil rouge. Généré en fin de module, en
autonomie (pas de validation de squelette) ; durée cible = une séance. Si des
`curriculum` sont vides, signalez les sections non rédigées et arrêtez-vous.

## Hygiène du calibrage

Quand un motif revient dans 3 verdicts ou plus (`list_verdicts`), proposez à
l'utilisateur de le distiller : en annotation d'exemplaire ou en invariant de ce
document. Après validation, appelez `distill_verdicts` sur les verdicts concernés.
Le calibrage reste court par construction.
