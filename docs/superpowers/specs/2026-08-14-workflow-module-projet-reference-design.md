# Workflow de module — spec projet, dépôt de référence, admin progressif

Date : 2026-08-14
Statut : validé (brainstorm avec l'utilisateur)
Remplace partiellement : `2026-07-14-skills-pedagogiques-mcp-design.md` (notion d'`universe`,
ordre des étapes de `module-design`).

## Problème

Deux constats de l'utilisateur, après plusieurs modules produits avec les skills
`module-design` / `content-writer` :

1. **Le projet fil rouge n'est pas assez pensé**, donc il s'intègre mal au cours. Le cours
   finit par prendre l'exemple du TP, si bien qu'un copier-coller suffit à l'étudiant.
2. **L'agent tâtonne techniquement** : le format de l'arbre de blocs attendu par
   `save_content` n'est documenté nulle part (verdict du 2026-07-15, jamais appliqué).

À quoi s'ajoute un constat d'interface : gérer un module, c'est aujourd'hui une ligne dans
`ModulesList`, un `Dialog` listant les sections et un formulaire de 15 champs dans un panneau
latéral (`EditModuleSheet`). Aucune page dédiée, aucune notion d'étape ni d'avancement. La
conception (univers, briefs) est noyée entre les coefficients et les couleurs.

**Cause racine.** Le projet du module tient dans `universe { name, description }` — deux
phrases. On ne peut pas mal remplir un champ qui n'existe pas, et rien dans l'interface ne
demande de penser le projet. La règle « le cours prend un autre thème » est une consigne de
prose, déjà enregistrée en verdict, déjà ignorée.

## Décisions de cadrage

| Sujet | Décision |
|-------|----------|
| Portée | Modèle de données **+** admin **+** skill. Le skill consomme les données, il ne les réinvente plus en conversation |
| Source de vérité | La base : `projectSpec`, `exampleDomain`, `plannedNotions`, briefs. Le skill lit, propose, écrit en brouillon |
| Qui conçoit | **L'agent propose, l'utilisateur valide dans l'admin.** L'agent ne peut jamais écrire un statut `validated` |
| Projet de référence | Un **dépôt GitLab privé par module** contenant la **version finale seule** du projet. L'agent le code, l'utilisateur le relit et le valide |
| Granularité du dépôt | Version finale uniquement — pas de checkpoint par section. L'agent déduit l'état intermédiaire à la lecture du final |
| Interface | **Un seul écran** `/admin/modules/[slug]`, progressif : assistant guidé quand le module est vide, tableau de pilotage quand il est mûr. Pas deux UI à maintenir |
| Ordre des étapes | Cadrage → notions → **projet** → **code de référence** → sections → briefs → pilotage. Le découpage se déduit du projet codé, il ne le précède pas |
| Portes bloquantes | Deux, et deux seulement : validation de la spec projet, validation du dépôt de référence |
| Avancement | **Dérivé**, jamais stocké : brief rempli, blocs présents, `isAvailable`, `correctionIsAvailable` |
| Séparation cours / TP | Invariant dur : le cours illustre avec `exampleDomain`, jamais avec le domaine du projet |
| Écriture | Staging uniquement, comme aujourd'hui. La prod reste une copie sur confirmation explicite |

## Architecture

```
Module (MongoDB)
├── plannedNotions[]        notions à couvrir — posées AVANT le projet
├── projectSpec             le projet fil rouge
│   ├── name, pitch, finalDeliverable, entities[]
│   ├── status              draft | validated      ← porte 1
│   └── referenceRepo
│       ├── url             projet GitLab privé
│       └── status          draft | validated      ← porte 2
├── exampleDomain           domaine d'illustration RÉSERVÉ au cours
│   └── name, description
└── Section.brief
    ├── filRougeStep        ce que le projet gagne (existant)
    ├── filRougeOutcome     état observable en fin de section
    └── providedBase        base fournie si le fil rouge démarre ici
```

Les deux portes en séquence :

```
spec projet (texte) ──validée──► l'agent code le projet de référence
                                            │
                        projet de référence ─validé──► rédaction cours/TP autorisée
```

Coder le projet avant de rédiger, c'est le point clé : on découpe un code réel en sections au
lieu de parier sur un découpage de notions abstraites, et chaque « résultat observable » de
TP sort du code cible plutôt que d'une invention.

## Modèle de données

### Module

`universe { name, description }` devient `projectSpec` :

| Champ | Type | Rôle |
|---|---|---|
| `name` | `string` | Nom du projet (« Gestion de restaurant ») |
| `pitch` | `string` | Une phrase : ce qu'est l'application |
| `finalDeliverable` | `string` | Ce que l'application fait à la fin du module |
| `entities[]` | `string[]` | Matière manipulée (`Order`, `Table`, `Plat` ; ou `page`, `formulaire` selon la matière) |
| `status` | `"draft" \| "validated"` | Porte 1 |
| `referenceRepo.url` | `string?` | URL du projet GitLab privé |
| `referenceRepo.status` | `"draft" \| "validated"` | Porte 2 |

Deux champs frères :

- `exampleDomain { name, description }` — domaine d'illustration du cours, distinct du projet.
- `plannedNotions: string[]` — notions à couvrir sur le module, posées à l'étape 2.

`entities[]` reste volontairement libre : « entité » parle pour Rust ou PHP, moins pour
HTML/CSS. Le champ cadre la spec avant le code ; le code fait foi ensuite.

### Section

`brief` gagne deux champs à côté de `filRougeStep` :

- `filRougeOutcome: string` — l'état observable du projet à la fin de la section (ce qui
  tourne, pas ce qu'on a appris).
- `providedBase: string?` — la base de code fournie si le fil rouge démarre à cette section
  (verdict du 2026-07-14 : le fil rouge ne commence pas forcément en section 1).

### Migration

Les modules existants : `universe` → `projectSpec` en `status: "validated"`,
`finalDeliverable` et `entities` vides, `referenceRepo` absent. Rien ne casse en lecture ;
la page module les affiche comme incomplets et la rédaction reste ouverte tant qu'aucun
`referenceRepo` n'est déclaré (voir « Outils MCP » ci-dessous).

## Interface admin

Écran unique `/admin/modules/[slug]`, à trois âges :

```
MODULE VIDE                    MODULE EN COURS                MODULE MÛR
┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│ ● Cadrage      ✓   │         │ Rust · 12 séances  │         │ Rust · 12 séances  │
│ ● Notions      ✓   │         ├────────────────────┤         ├────────────────────┤
│ ○ Projet    ← ici  │  ────►  │ PROJET  ⚠ brouillon│  ────►  │ PROJET ✓  [éditer] │
│   Livrable [     ] │         │ [Relire et valider]│         │ RÉFÉRENCE ✓ ↗      │
│   Entités  [     ] │         ├────────────────────┤         ├────────────────────┤
│   Exemples [     ] │         │ # Sec  br co sl TP │         │ # Sec  br co sl TP │
│ ○ Référence        │         │ 1 Bases ● ●  ○  ○  │         │ 1 Bases ● ●  ●  ●  │
│ ○ Sections         │         │ 2 Owner ● ○  ○  ○  │         │ 2 Owner ● ●  ●  ●  │
│      [ Continuer ] │         └────────────────────┘         └────────────────────┘
└────────────────────┘
   assistant guidé               les étapes franchies            pilotage pur
                                 se replient en lignes
```

| # | Étape | Contenu | Débloque |
|---|---|---|---|
| 1 | Cadrage | séances, `sessionDurationMinutes`, niveau, prérequis | — |
| 2 | Notions | `plannedNotions[]` — progression à couvrir, sans sections | — |
| 3 | **Projet** | `projectSpec` + `exampleDomain` → **Valider** | le code |
| 4 | **Référence** | lien GitLab, aperçu de l'arbre → **Valider** | la rédaction |
| 5 | Sections | découpage déduit du code : chaque section = une tranche | — |
| 6 | Briefs | `filRougeStep`, `filRougeOutcome`, `providedBase` | — |
| 7 | Pilotage | tableau sections × supports | — |

Règles d'affichage :

- Une étape non franchie s'affiche dépliée avec son appel à l'action ; franchie, elle se
  replie en ligne et se rouvre au clic.
- Les étapes 3 et 4 sont les seules bloquantes. Le reste est du remplissage.
- Le tableau de pilotage ne stocke aucun statut. Par section et par support : *briefé* (brief
  rempli), *rédigé* (blocs présents), *publié* (`isAvailable`), *corrigé*
  (`correctionIsAvailable`).
### Plus de surfaces flottantes

Tout s'édite en place dans la page. Les seules modales conservées sont les `AlertDialog` de
confirmation destructive, qui est leur usage légitime.

| Existant | Devient |
|---|---|
| `/admin/modules` + `ModulesList` | **Reste** l'index : recherche, ajout, visibilité. L'icône « Gérer les sections » devient un lien vers `/admin/modules/[slug]` |
| `Dialog` de `AdminModule.tsx` | **Supprimé** — la page le remplace |
| `EditModuleSheet` + `AdminSheetHeader` | **Démontés** — les réglages annexes (couleurs, coefficients, intervenants, SAÉ) deviennent une dernière étape repliée en bas de page |
| `ModuleFormFields` | **Conservé**, remonté tel quel dans l'étape « Réglages » de la page |
| `SectionForm` / `EditSectionButton` | **Démontés** — créer et éditer une section se fait en ligne dans le tableau |
| `AdminSection.tsx` | **Réutilisé** comme ligne du tableau : il porte déjà les liens builder et les switches Publiée / Correction / Verrou examen. Enrichi des badges d'avancement |
| `AlertDialog` de suppression | **Conservés** tels quels |
| `/admin/content/[module]/[section]/[type]` | **Inchangé** — le builder reste la cible des liens |

### Contraintes d'implémentation

Issues du passage par `ui-ux-pro-max` (règle CLAUDE.md section 11) :

- **Étapes repliables** : `Collapsible` (`src/components/ui/collapsible.tsx`). Pas
  d'`Accordion` dans le projet, et pas de `div onClick` maison.
- **Indicateur de progression obligatoire** : « Étape 3 sur 7 » plus une frise de pastilles.
  Un processus multi-étapes sans indication d'avancement est un défaut d'UX identifié.
- **Tableau sémantique** : composants `Table…` via `AdminDataTable`. Rappel CLAUDE.md :
  **pas de `@tanstack/react-table`**, colonnes déclarées en `AdminColumn<TData>`.
- **Formulaires** : `react-hook-form` + `zodResolver`, `Label` lié par `htmlFor`, message
  d'erreur sous le champ — le pattern de `ModuleFormFields`. Jamais de placeholder en guise
  de label.
- **Cibles tactiles** ≥ 44 px (`size-11` / `min-h-11`, déjà l'usage du projet),
  `aria-label` sur tout bouton icône, focus visible au clavier.
- Contraste et lisibilité vérifiés en clair **et** en sombre.

## Outils MCP

| Outil | Changement |
|---|---|
| `push_project_reference` | **nouveau** — crée/écrit le projet GitLab privé du module et y pousse les fichiers. Réutilise `ensurePrivateProject` + `commitFiles` de `src/lib/gitlab.ts` ; renseigne `referenceRepo.url` et force `referenceRepo.status: "draft"`. **Refuse si `projectSpec.status !== "validated"`** — c'est ce qui fait de la porte 1 une porte |
| `get_project_reference` | **nouveau** — lit l'arbre de fichiers et le contenu du projet de référence |
| `create_module` / `edit_module` | acceptent `projectSpec`, `exampleDomain`, `plannedNotions`. **Forcent `status: "draft"`** : un agent ne valide jamais |
| `get_module` | renvoie les nouveaux champs |
| `save_content`, `insert_block`, `edit_block`, `delete_block`, `reorder_blocks` | refusent si le module déclare un `referenceRepo` dont le `status` n'est pas `validated`, avec un message qui nomme l'étape manquante |

Le verrou ne s'applique qu'aux modules qui déclarent un `referenceRepo` : les modules migrés,
qui n'en ont pas, restent modifiables. Un module conçu par le nouveau workflow en a un dès
l'étape 4, donc la porte se ferme d'elle-même.

## Prompts MCP

Décision ajoutée le 2026-08-14, après relecture du plan d'implémentation.

Le serveur MCP n'expose aujourd'hui que deux types d'objets : des *tools* (fonctions) et des
*resources* (les documents de skill, servis en lecture passive — l'agent doit deviner où il en
est dans un document de plusieurs milliers de mots). Le protocole MCP prévoit un troisième type,
les *prompts* : un item nommé et paramétré que le client (Claude Desktop, claude.ai) affiche
dans une palette et invoque directement, sans que l'utilisateur ait à formuler une phrase libre.

**Un prompt par étape de l'écran admin**, plus un pour la rédaction :

| Prompt | Étape | Argument(s) |
|---|---|---|
| `module_cadrage` | Cadrage | `module` |
| `module_notions` | Notions | `module` |
| `module_projet` | Projet | `module` |
| `module_reference` | Code de référence | `module` |
| `module_sections` | Sections | `module` |
| `module_briefs` | Briefs | `module` |
| `module_reglages` | Réglages | `module` |
| `content_writer` | (rédaction, hors écran module) | `module`, `section` |

Chaque prompt d'étape pointe l'agent vers le titre `###` exact de la section correspondante
dans `module-design/main.md` et lui interdit d'en déborder sans validation explicite — il ne
duplique jamais le contenu du document. `module_reglages` fait exception : c'est de la saisie
factuelle (couleurs, coefficients, intervenants, SAÉ) sans jugement pédagogique, donc son
message ne référence aucun document de skill et pointe directement vers `edit_module`.

Les six titres du document `module-design` sont donc un contrat avec ces prompts : `Cadrage`,
`Notions`, `Projet`, `Code de référence`, `Sections`, `Briefs`. Toute reformulation d'un titre
doit être répercutée sur le prompt correspondant.

## Skill

### `module-design`

Le workflow passe aux 7 étapes ci-dessus. Deux changements de fond :

- **Étape 4** : l'agent *code* le projet de référence complet et le pousse via
  `push_project_reference`, puis s'arrête : « relis le dépôt et valide dans l'admin ».
- **Étape 5** : l'agent *relit son propre code* (`get_project_reference`) pour proposer le
  découpage. Chaque section est une tranche de fichiers/fonctionnalités, pas une liste de
  notions. Le budget en séances vient du cadrage ; la somme des séances = budget du module.

L'agent écrit toujours en brouillon et s'arrête aux portes. Il ne demande plus à l'utilisateur
de choisir entre 2-3 univers en conversation : il propose une spec, elle est relue dans l'admin.

### `content-writer`

Deux invariants durs remplacent des consignes de prose :

- **Le cours illustre avec `exampleDomain`, jamais avec le domaine du projet.** Un exemple de
  cours qui touche au domaine du projet est un défaut bloquant. C'est la traduction dure du
  verdict du 2026-07-14 (« le cours prend d'autres exemples que le projet fil rouge »).
- **Le TP vise l'état du dépôt de référence à cette section.** L'agent lit le code cible avant
  d'écrire le squelette ; le « résultat observable » de chaque exercice sort du code réel.

L'étape 2 (contexte MCP) lit désormais `projectSpec`, `exampleDomain` et
`get_project_reference` en plus des sections et briefs.

### Manques techniques

À ajouter au document `content-writer` :

- **Un exemple minimal d'arbre de blocs** (`id`, `type`, `props`, `children`) tel qu'attendu
  par `save_content` — application du verdict du 2026-07-15, qui note que le rédacteur doit
  aujourd'hui lire un `get_content` d'une section existante pour deviner la structure JSON.
- **Un tableau « quel outil quand »** : `save_content` (première écriture, écrase tout) vs
  `insert_block` / `edit_block` (retouche) ; `get_content` (JSON, round-trip) vs
  `export_content_compact` (Markdown, lecture seule).

Les documents restent compilés par `bun run generate-skill` depuis `skills/*/main.md` vers
`src/lib/skills/pedagogy.ts` — ne jamais éditer le fichier généré.

## Chantiers

Découpage en quatre lots, dans cet ordre. Chacun est livrable et testable seul.

1. **Socle données + MCP** — schémas Zod (`module.schema.ts`, `section.schema.ts`), migration
   `universe` → `projectSpec`, outils `push_project_reference` / `get_project_reference`,
   évolution de `create_module` / `edit_module` / `get_module`, verrou sur les outils
   d'écriture de contenu.
2. **Admin — écran progressif** — route `/admin/modules/[slug]`, étapes repliables, les deux
   boutons de validation, tableau de pilotage à états dérivés.
3. **Skill — réécriture** — `module-design` sur les 7 étapes, `content-writer` sur les deux
   invariants durs, exemple d'arbre de blocs et tableau des outils. Régénération.
4. **Démontage des surfaces flottantes** — suppression du `Dialog` de `AdminModule`, de
   `EditModuleSheet` et de `SectionForm` / `EditSectionButton` ; édition en place partout.

## Tests

- `src/lib/schemas/module.schema.test.ts` et `section.schema.test.ts` : validation des
  nouveaux champs, refus d'un `status` invalide.
- Test du verrou : un module avec `referenceRepo.status: "draft"` refuse `save_content` ; un
  module migré sans `referenceRepo` l'accepte.
- Test de forçage : `create_module` / `edit_module` appelés avec `status: "validated"`
  écrivent bien `draft`.
- `tests/mcp/skill-exposure.test.ts` : le manifeste expose les documents régénérés.
- Migration : script `--dry-run` avec sauvegarde JSON dans `backups/`, conforme à l'usage des
  scripts de `src/scripts/`.

## Hors périmètre

- Checkpoints par section dans le dépôt de référence (version finale seule, décidé).
- Génération automatique des sections à partir du code : l'agent *propose*, l'utilisateur
  valide — pas de dérivation automatique.
- Refonte de `push_correction` : le dossier `fil-rouge/` des corrections reste écrit comme
  aujourd'hui.
- Copie staging → prod : inchangée.
