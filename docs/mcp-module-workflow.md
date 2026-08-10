# Workflow MCP — Créer un module et ses sections

Workflow opérationnel pour créer la **structure** d'un module (module + sections +
squelette vide des contenus) via les outils MCP de `src/app/api/mcp/route.ts`. Le
remplissage des contenus (cours/TP/slides/examen) est hors périmètre — voir le skill
`content-writer` (§ Skills embarqués).

## Pré-requis

- Connecteur MCP **staging** actif (jamais la prod directement — cf. § Clôture).
- Rôle admin résolu via l'allowlist `MCP_ADMIN_EMAILS` (sinon les outils d'écriture
  répondent `Forbidden`).
- Si le serveur MCP est injoignable : **arrêt immédiat**, ne pas improviser la
  conception « de tête ».

## Outils MCP utilisés

| Outil | Rôle |
|---|---|
| `list_modules` | Modules existants — éviter les doublons, situer le niveau |
| `get_module` | Métadonnées complètes d'un module (pour vérifier ce qui a déjà été créé) |
| `list_sections` | Sections d'un module + statut file/db de leurs contenus |
| `get_section` | Métadonnées complètes d'une section (`brief`, `curriculum`, etc.) |
| `list_verdicts` (`format: "module-design"`) | Critiques passées de l'utilisateur sur des conceptions — à lire avant de proposer quoi que ce soit |
| `create_module` | Crée le module (`isExtra: true`, `isVisible: false` par défaut) |
| `create_section` | Ajoute une section + crée le squelette vide (`course_content`, `blocks: []`) pour chaque `contentType` |
| `edit_module` / `edit_section` | Corrige après coup (édition, pas de recréation) |
| `add_verdict` | Enregistre une critique verbatim en clôture |

Les outils `create_module`/`create_section` sont **idempotents en échec** : un slug déjà
pris lève une erreur explicite plutôt que d'écraser — c'est ce qui permet la reprise
(§ Reprise).

## Le point fragile n°1 : le plan n'est persisté nulle part avant l'écriture en base

Entre le brainstorm (sections, univers, briefs) et l'appel à `create_module`, le plan
n'existe que dans la conversation. Si la session s'arrête là (contexte compacté,
session fermée, crash), **le plan validé est perdu** — seule trace : la mémoire
auto (si elle a été écrite, ce qui n'est pas garanti pour un plan aussi long).

Un module fait typiquement 8 à 13 sections rédigées sur plusieurs sessions (cf. le
module Rust : sections 1-7 sur une session, 8-11 en pause). Il faut donc un
**checkpoint explicite, écrit avant le premier `create_module`**, qui survit à la
session.

## Le point fragile n°2 : le résultat final du fil rouge n'est jamais précisé

Le skill `module-design` (§ Skills embarqués) ne demande qu'un « plan d'avancement »
sous forme de one-liners par section (« section 1 : le projet affiche X ; section 2 :
on ajoute Y ; … fin de module : l'application fait Z »). Ce Z n'est jamais formalisé :
pas de liste de fonctionnalités, pas d'architecture de fichiers, pas de modèle de
données arrêté. Le découpage en sections se fait donc en avançant pas à pas, sans
cible vérifiable — le risque est un projet qui dérive (fonctionnalités orphelines,
notions annoncées dans un `brief` mais jamais construites, incohérences entre
sections rédigées à des sessions différentes). C'est exactement le type d'écart
relevé après coup sur le module Rust (brief « tuples » vs fil rouge en `String`,
comparaison Java/Python promise puis absente).

La correction : une étape dédiée, **avant** le découpage en sections, qui produit
une spécification précise et validée du résultat final, puis un découpage qui en est
la dérivation *en arrière* — pas une suite d'ajouts inventés au fil de l'eau.

## Le fichier de checkpoint

Un fichier par module, dans `docs/module-plans/<slug-module>.md`, écrit **avant**
tout appel d'écriture MCP et mis à jour après chaque `create_section` réussi.

Template :

```markdown
---
module: <slug>
status: draft | validated | creating | done
---

# Module <titre> (<slug>)

## Cadrage
- Niveau : BUT 1/2/3, débutants ou non
- Séances totales : N × <sessionDurationMinutes> min
- Types de contenu par défaut : cours, TP, slide (examen sur la dernière section)

## Univers (fil rouge)
- Nom :
- Description (domaine + données types) :

## Résultat final visé (précis, validé par l'utilisateur AVANT le découpage)
- Fonctionnalités finales (ce que l'application fait, du point de vue utilisateur) :
  1. ...
  2. ...
- Architecture finale (fichiers/modules qui existent à la fin, rôle de chacun) :
  - `<fichier>` : ...
- Modèle de données final (entités, champs clés, types) :
  - ...
- Explicitement hors scope (ce que le module NE construit PAS, pour couper court
  à toute extension non prévue en cours de rédaction) :
  - ...

## Trajectoire (dérivée EN ARRIÈRE depuis le résultat final)
Traçabilité obligatoire : chaque ligne du "Résultat final visé" est introduite par
exactement une section ci-dessous. Aucune ligne orpheline (jamais construite),
aucune section qui introduit un élément absent du résultat final.

1. <section 1> : ajoute <sous-ensemble> — trace: [fonctionnalité/fichier/champ concerné]
2. <section 2> : ajoute ...
...
N. <dernière section> : le fil rouge correspond exactement au "Résultat final visé"
   (aucune ligne du résultat final non tracée, aucune section hors trace)

## Sections

- [ ] 1. <titre> (`path: <slug-section>`) — totalDuration: N, courseIntroMinutes: N
      brief: { objectives: [...], notions: [...], filRougeStep: "...", notes: "..." }
      contentTypes: [cours, TP, slide]
- [ ] 2. ...

## Création en base (rempli au fur et à mesure)

- [ ] create_module → moduleId=..., path=...
- [ ] create_section 1 → path=...
- [ ] create_section 2 → path=...
```

Règles :
- Le fichier est écrit dès que le plan est **validé par l'utilisateur** (fin de
  l'étape « Découpage + univers » ci-dessous), pas avant — pas la peine de committer
  des brouillons instables.
- Chaque case de la section « Création en base » est cochée **immédiatement après**
  le retour réussi de l'outil correspondant, avec le slug/ID retourné. Ne jamais
  cocher par anticipation.
- `status: done` une fois toutes les sections créées ; le fichier reste comme trace
  du plan (utile pour retrouver un `brief` original en cas d'écart constaté plus
  tard).

## Workflow détaillé

### 1. Cadrage
Collecter en conversation : matière/thème, niveau, nombre total de séances, durée
d'une séance. Rien à persister ici.

### 2. Contexte — jamais de conception « de tête »
- `list_modules` : modules existants.
- `list_sections` sur les modules prérequis : leurs `curriculum` disent ce que les
  étudiants savent réellement.
- `list_verdicts` avec `format: "module-design"` : lire chaque critique passée
  avant de proposer quoi que ce soit.

### 3. Choix de l'univers
Proposer 2-3 univers candidats (domaine + description + données types). L'utilisateur
choisit — sans encore fixer le résultat final : l'univers cadre le thème, pas
l'aboutissement.

### 4. Spécification précise du résultat final — **avant** le découpage en sections
Décrire et faire valider par l'utilisateur, de façon concrète et vérifiable, ce que
le projet fil rouge est **à la fin du module** :
- la liste des fonctionnalités finales (pas un adjectif vague type « complet ») ;
- l'architecture finale : fichiers/modules qui existent, rôle de chacun ;
- le modèle de données final : entités, champs clés, types ;
- ce qui est explicitement hors scope.

Ne pas passer à l'étape 5 tant que cette spec n'est pas validée — c'est elle qui sert
de référence à chaque `brief.filRougeStep` rédigé ensuite, et à la relecture de
clôture (§ 8).

**Cette spec reste un outil de planification interne, jamais un contenu diffusé aux
étudiants.** Elle sert à vérifier la cohérence globale du fil rouge (checkpoint,
traçabilité), pas de plan de cours à afficher. Chaque section, une fois rédigée par
`content-writer`, n'expose dans son cours/TP que le sous-ensemble nécessaire à son
propre exercice (son `filRougeStep`) — pas l'architecture finale complète, pas les
étapes à venir. Un étudiant en section 3 ne doit voir ni le modèle de données de la
section 8, ni un TP qui annonce « nous construisons vers X » : il reçoit la base dont
il a besoin pour travailler maintenant, point.

### 5. Découpage en sections — dérivé en arrière depuis le résultat final
Partir de la spec validée et la décomposer en étapes : « quelle section introduit
cette fonctionnalité/ce fichier/ce champ ? », jusqu'à couvrir l'intégralité de la
spec. Pour chaque section : `totalDuration`, `courseIntroMinutes`, objectifs/notions,
`brief.filRougeStep` (formulé comme une trace explicite vers un ou plusieurs éléments
du résultat final).

Vérifier deux choses avant de continuer :
- somme des séances = budget du module ;
- **traçabilité complète** : chaque ligne de la spec finale est couverte par au moins
  une section, et aucune section n'introduit un élément absent de la spec (sinon,
  soit la spec était incomplète — la corriger et refaire une passe —, soit la
  section dérive hors sujet).

### 6. Plan écrit → **checkpoint**
Restituer le plan complet en conversation (univers, résultat final, trajectoire,
sections). Dès l'accord de l'utilisateur (le « go »), **écrire immédiatement**
`docs/module-plans/<slug>.md` (`status: validated`) avant tout appel MCP d'écriture.

### 7. Création en base — staging uniquement
1. `create_module` avec `universe` et `sessionDurationMinutes`. Cocher la ligne
   correspondante du checkpoint avec le `moduleId`/`path` retourné.
2. `create_section` pour chaque section, dans l'ordre du plan, avec
   `totalDuration`, `courseIntroMinutes`, `brief`, `objectives`, `contentTypes`.
   Cocher au fur et à mesure.
3. Passer `status: done` une fois la dernière section créée.

Ne jamais paralléliser ces appels : `create_section` dérive `order` du max courant
et un `edit_section` peut renommer/cascader — un ordre séquentiel garanti évite les
races sur le tableau `sections` du document module.

### 8. Clôture
- Une fois toutes les sections **rédigées** (hors périmètre de ce document, cf.
  skill `content-writer`) : relire le fil rouge final via `export_content_compact`
  sur le dernier TP et le comparer ligne à ligne au « Résultat final visé » du
  checkpoint. Tout écart va dans le checkpoint (section dédiée « Écarts constatés »,
  même format que la mémoire du module Rust) — la spec figée sert de référence
  fiable pour juger d'une dérive, la mémoire de la conversation non.
- Verdict négatif de l'utilisateur sur la conception → `add_verdict`
  (`format: "module-design"`, verbatim). Un écart entre spec finale et rédaction
  réelle qui revient plusieurs fois est un candidat naturel de verdict.
- Le module reste `isVisible: false` (brouillon) tant que le contenu n'est pas
  rédigé — activation via `edit_module` ou l'admin, décision utilisateur.
- **Jamais** d'écriture sur le serveur MCP de production : la copie staging → prod
  est une action séparée, sur confirmation explicite (cf. mémoire
  `feedback_no_action_without_confirmation_prod`).

## Reprise après interruption

La base Mongo (staging) est la source de vérité de ce qui est **fait** ; le
checkpoint est la source de vérité de ce qui était **prévu**. Reprendre :

1. Lire `docs/module-plans/<slug>.md` — récupérer le plan et les cases déjà cochées.
2. `get_module` sur le slug : si absent, le module n'a jamais été créé → reprendre à
   `create_module`.
3. `list_sections` sur le module : comparer les `path` retournés à la liste des
   sections du checkpoint. Les sections déjà présentes ne sont **jamais** recréées
   (le `path` unique fait échouer `create_section` avec une erreur explicite —
   c'est le filet de sécurité si le checkpoint et la base divergent).
4. Cocher rétroactivement le checkpoint si des cases n'avaient pas été mises à jour
   avant l'interruption (arrivé si l'appel a réussi mais que la session s'est
   arrêtée avant l'écriture du fichier).
5. Reprendre `create_section` sur la première section manquante, dans l'ordre du
   plan.

Si le checkpoint n'existe pas mais que le module existe déjà en base (session
précédente sans ce workflow) : reconstruire un checkpoint a posteriori via
`get_module` + `list_sections` (`status: done` si toutes les sections attendues
sont présentes, sinon `status: creating` avec la liste des manquantes).

## Skills embarqués (complémentaires à ce document)

Le serveur MCP expose deux skills pédagogiques versionnés
(`get_pedagogical_skill_manifest` / `get_pedagogical_skill_document`), sources
canoniques dans `skills/module-design/main.md` et `skills/content-writer/main.md` :

- **`module-design`** : la même logique de conception que les étapes 1-3 ci-dessus,
  en plus détaillé (philosophie, garde-fous). Ce document ajoute deux éléments
  absents du skill : le **checkpoint de reprise** et l'étape 4 de **spécification
  précise du résultat final** (le skill ne demande qu'un one-liner de plan
  d'avancement, insuffisant pour vérifier la cohérence d'un fil rouge sur 8-13
  sections).
- **`content-writer`** : rédaction du contenu d'une section une fois créée (hors
  périmètre de ce document).

## Pense-bête

- Types de contenu créables via `create_section` : `cours`, `TP`, `examen`, `slide`.
- `create_section` sans `path` dérive le slug du `title` (kebab-case, sans accents) —
  vérifier qu'il correspond à celui du checkpoint avant de cocher.
- `edit_section` avec `addContentTypes` est **additif seulement** : pour retirer un
  type de contenu, passer par `delete_content` (`removeRef: true`), pas par
  `edit_section`.
- Une section sans `brief` ne doit jamais être rédigée « à l'aveugle » par
  `content-writer` plus tard — le checkpoint doit donc contenir un `brief` complet,
  `filRougeStep` inclus (il se déduit directement de la trace vers le résultat
  final, étape 5 — plus de raison de le laisser vide une fois la spec validée).
- Ne jamais dériver le découpage en sections avant d'avoir fait valider la spec du
  résultat final (étape 4) : la valider **après coup**, en la déduisant des sections
  déjà écrites, inverse le contrôle et ne détecte plus rien.
- Le « Résultat final visé » est un document de pilotage, pas un support de cours :
  ne jamais le coller tel quel dans un bloc de contenu étudiant. Chaque section ne
  diffuse que sa propre base de travail (son `filRougeStep`), jamais l'aboutissement
  ni les sections suivantes.
