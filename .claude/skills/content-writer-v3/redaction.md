# Rédaction d'une section (mode `redaction`, spec § 2 étapes 4 à 7)

Prérequis : un plan validé (statut « Validé : … plan v<n> »). Sans plan validé, arrêtez
et proposez le mode `conception`. La rédaction suit le plan ; vous ne le réécrivez pas
en route sans l'accord de l'utilisateur (« Amender le plan », § 7).

## 0. Brouillons et écritures

Les rédacteurs n'écrivent sur aucun serveur (spec § 1 et § 3, amendés le 2026-10-28).
Chaque support vit dans un **brouillon** :

```
docs/plans/<module>/brouillons/<section>/
  plan-cours.md   plan-slides.md                  (extraits du plan, écrits par vous)
  cours.json   cours.md   cours-couverture.md
  slides.json  slides.md  slides-couverture.md
  tp.json      tp.md      tp-couverture.md      (examen.json en mode examen)
```

Le dossier est ignoré par git : il reste sur le disque pour la reprise, la prod garde la
version finale. Les `.json` sont écrits par les rédacteurs (garde `garde-redacteur.mjs`),
les `.md` par vous, avec le script `src/scripts/brouillon.ts` (aucun accès à la base) :

```bash
bun src/scripts/brouillon.ts valider    docs/plans/<m>/brouillons/<s>/cours.json
bun src/scripts/brouillon.ts exporter   docs/plans/<m>/brouillons/<s>/cours.json --titre "<titre du module> / <titre de la section>"
bun src/scripts/brouillon.ts couverture docs/plans/<m>/brouillons/<s>/cours.json > docs/plans/<m>/brouillons/<s>/cours-couverture.md
bun src/scripts/brouillon.ts deposer    <dossier du bac à sable> docs/plans/<m>/brouillons/<s>/cours.json docs/plans/<m>/brouillons/<s>/tp.json --titre "<…>"
bun src/scripts/brouillon.ts comparer   docs/plans/<m>/brouillons/<s>/cours.json <fichier relu en prod>
```

`exporter` produit le même texte qu'`export_content_compact` (mêmes marqueurs
`<!--id-->`, mêmes `id` qu'en prod) : c'est ce que lisent relecteurs et étudiants.

**Seul vous écrivez en prod**, et chaque écriture a sa confirmation explicite de
l'utilisateur, demandée juste avant, en une phrase qui dit quoi (outil, module, section,
type, nombre de blocs). Une confirmation ne vaut que pour l'écriture qu'elle nomme.

## 1. Ordre et liste de tâches

Cours → slides → TP, chacun **validé par l'utilisateur et écrit en prod** avant le
suivant (le rédacteur suivant reçoit l'export des supports validés). Un support absent
du plan est sauté. Pour chaque support, les tâches sont :

1. Rédaction (agent rédacteur)
2. Contrôle du rendu, validation, export, couverture
3. Relecture, cycle 1
4. Arbitrage, correction par le rédacteur
5. Relecture des blocs modifiés, cycle 2 (si besoin) ; désaccords restants
6. Validation du support par l'utilisateur, commit
7. Écriture en prod (confirmation), contrôle `comparer`
8. Relecture navigateur par l'utilisateur, corrections, commit

Puis, pour le TP : `cloture.md` (correction, puis clôture).

« Étape en cours » du statut est mise à jour à chaque tâche, sans commit (« cours :
relecture, cycle 1 », « TP : en attente de validation »…).

## 2. Lancer le rédacteur

Prompt de l'agent (`redacteur-cours`, `redacteur-slides` ou `redacteur-tp`), et rien
d'autre :

- mode `rédaction` (ou `examen`), module, section ;
- cours : chemin absolu de `plan-cours.md` ; slides : de `plan-slides.md` et
  `plan-cours.md` ; TP : du plan complet. Les extraits, vous les écrivez avant de lancer
  le rédacteur, par copie verbatim du plan validé : `plan-cours.md` = l'angle, la
  progression et « À voir absolument / à éviter » de la fiche de conception, puis la
  partie « Cours » du plan ; `plan-slides.md` = la partie « Slides ». Rien du TP, de
  l'état du fil rouge ni du `projectSpec` (spec § 4 : le rédacteur du cours n'a que le
  nom du domaine du fil rouge, et la garde lui refuse le plan complet). Réécrivez-les
  après chaque amendement du plan ;
- cours : les **cours des sections précédentes** dont le code est repris (classes,
  fonctions, conventions de l'`exampleDomain`), déposés par vous en
  `cours-precedent-<order>.md` : `get_content` (prod) de chaque cours, rangé dans un
  `tool-results`, puis extraction des `blocks` et `exporter` du script. Ce sont des
  exemples du domaine d'illustration, pas le fil rouge. Sans eux, le rédacteur invente
  l'API (test de PHP 7 : `$this->pdo` au lieu de `self::getPdo()`) ;
- chemin absolu du brouillon à écrire ;
- slides et TP : chemin absolu de l'export du cours validé (`cours.md`) ;
- `exampleDomain`, `universe` (fiche du collecteur) ; pour le cours et les slides, le
  **seul nom** du domaine du fil rouge ; pour le TP, `projectSpec`, état du fil rouge à
  l'entrée et budget TP avec son calcul ;
- verdicts actifs du format, plus `global` et le module, **recopiés verbatim** de la
  fiche (`SKILL.md` § 6, « Copie, jamais reformulation ») ;
- exemplaire du format (id), ou « aucun exemplaire » ;
- TP : la règle « jamais d'indice ni de solution » (`SKILL.md` § 6).

Le rédacteur du cours ne reçoit jamais le dépôt de référence ni l'état du fil rouge.

## 3. Contrôler le rendu du rédacteur

- Définition de terminé complète, chaque ✔ avec sa preuve.
- **Couverture** : sa liste de tâches couvre chaque repère du plan pour ce support
  (chaque `N`, chaque `S`, chaque `E` et `B`). Recomptez sur le brouillon : une section
  par `N` (ids `n1`…), une slide par `S`, une section par `E` et `B`.
- Relancez vous-même `valider`, puis `exporter` et `couverture`. `exporter` doit dire
  « <n> marqueurs pour <n> blocs ».
- **Écarts au plan** : chacun est lu. Un écart qui change un exemple, un message, un
  contrat, une durée ou une notion est présenté à l'utilisateur (une question par
  écart, avec votre recommandation) ; accepté, il amende le plan (§ 7). Un écart de
  forme (bloc différent pour la même intention) se décide ici et se note.
- TP : une notion manquante dans le cours validé est un retour au cours (§ 7), jamais
  une explication ajoutée au TP.

Rendu incomplet ou preuve fausse → relancez le rédacteur avec la liste de ce qui manque
(au plus deux relances, hors cycle).

## 4. Relecture (spec § 2 étape 5)

Lancez en parallèle, dans un même message, les agents applicables :

| Agent | cours | slides | TP |
|---|---|---|---|
| `relecteur-style` | oui | oui | oui |
| `relecteur-coherence` | oui | oui | oui |
| `etudiant-fragile` | mode lecture | non | mode exécution |
| `relecteur-contrat` | non | non | oui |
| `etudiant-rapide` | non | non | oui |

**Relecteurs**, en **mode brouillon** : leur prompt est celui de `SKILL.md` § 6, sauf
que l'export n'est pas collé : vous donnez son **chemin absolu** (`<support>.md`), qu'ils
lisent avec `Read`, avec le chemin du plan et le mode (« brouillon, première passe » ou
« brouillon, cycle 2 : ids <liste> »). Cohérence et contrat comparent aussi le support
au plan. Cohérence, pour les slides et le TP : chemin de l'export du cours validé.
Contrat : budget avec son calcul et durées du plan.

**Étudiants** : bac à sable comme en relecture (`SKILL.md` § 5, `bac-a-sable.md`), mais
les supports y sont déposés par le script, pas par `preparateur` (qui lit la prod) :

```bash
bun src/scripts/brouillon.ts deposer "<dir>" docs/plans/<m>/brouillons/<s>/cours.json docs/plans/<m>/brouillons/<s>/tp.json --titre "<…>"
```

Le fragile en mode lecture reçoit `cours.md` ; le fragile en mode exécution et le
rapide, `tp.md` et `cours.md`. `depart\` reçoit la branche `fin-tp-<n-1>` du dépôt de référence (§ 4 bis) ; sans
cette branche, les prompts le disent. Les liens
`/download/...` d'un brouillon se téléchargent comme dans `preparateur` (étape 3) ; s'il
y en a, lancez `preparateur` avec la mention « liens seulement » ou faites-le à la main
avec `curl` vers `fournis\`.

Avant de lancer un étudiant sur un TP, vérifiez que l'image a les extensions que le TP
exige (`docker exec … sh -c 'cd /work && php -m'` : `pdo_pgsql` pour un TP PDO
PostgreSQL). Il en manque une : dites-le à l'utilisateur, proposez le rebuild de l'image
(ajout de paquet dans `docker/etudiant-sandbox/Dockerfile`, avec son accord), ou lancez
les étudiants en le leur signalant comme limite d'environnement.

## 4 bis. Dépôt de référence : une branche par fin de TP

`fin-tp-<n>` est ce qu'un étudiant a à la fin du TP n, et part de `fin-tp-<n-1>`. `main`
est l'état final. Récupérez l'état d'entrée dans un clone local, jamais par le serveur
MCP, avec `git archive` ou `git worktree`, sans `.git` dans le bac à sable :

```bash
git -C <clone> archive fin-tp-<n-1> | tar -x -C "<dir>/depart"
```

Branche absente : dites-le à l'utilisateur et proposez de reconstruire l'état depuis les
énoncés des TP précédents, qui font foi sur `main`. Le clone exige ses identifiants : ne
les saisissez jamais.

## 5. Contrôle, arbitrage, correction

1. **Contrôle** des rapports : `SKILL.md` § 7 (couverture contre `<support>-couverture.md`,
   preuves recomptées, captures regardées).
2. **Arbitrage** : `SKILL.md` § 8, toutes les règles. En plus :
   - une remarque qui met en cause le plan lui-même (exemple faux, message qui ne
     correspond pas, contrat irréalisable, durée hors plage mesurée par le fragile) est
     un **amendement du plan** (§ 7), pas une correction du rédacteur ;
   - règle 5, premier exercice qui pratique la notion : la remarque part au cours. Si le
     cours est déjà validé et en prod, c'est un retour au cours (§ 7).
3. Nettoyage du bac à sable (`SKILL.md` § 9), preuve collée.
4. **Correction** : relancez le rédacteur en mode `correction`, cycle 1, avec les seules
   remarques **retenues** : `id`, problème, proposition arbitrée (déjà reformulée selon
   la règle 3, sans indice). Contrôlez son rendu (§ 3) : remarques appliquées, liste des
   ids modifiés, ajoutés, supprimés ; `valider`, `exporter`, `couverture`.

**Limite des boucles** (spec § 6) : deux cycles « relecture → correction » par support.

- Cycle 2 : relancez les agents qui avaient des remarques retenues, sur les **seuls ids
  modifiés ou ajoutés** (liste dans leur prompt) ; un étudiant refait seulement les
  exemples ou exercices touchés.
- Après le cycle 2, s'il reste des BLOQUANTS ou des MAJEURS retenus : arrêtez-vous et
  présentez chaque désaccord (bloc, remarque du relecteur, réponse du rédacteur, votre
  recommandation). L'utilisateur tranche ; la correction qui suit n'est plus relue par
  les agents, elle lui est montrée.
- Une remarque déjà écartée qui revient lui est remontée, jamais rejouée (règle 9).

Notez chaque cycle dans la rubrique « Rédaction » du fichier de section (`suivi.md`).

## 6. Validation, écriture en prod, relecture navigateur

**Validation du support.** Présentez : support, nombre de blocs, cycles faits, remarques
retenues et appliquées, écartées (une ligne chacune), désaccords tranchés, écarts au
plan, chemin de l'export. Une question : « Je valide ce support ? ». Une correction
demandée repart au rédacteur (mode correction, hors cycle) puis revient à vous. Validé :
statut (« Validé : … ; cours le <date> »), état du module, commit (`SKILL.md`,
« Commits »).

**Écriture en prod** (vous seul) :

1. `get_section` (prod) : la section existe et déclare le type. Notez `isAvailable` :
   s'il vaut `true`, prévenez l'utilisateur que les étudiants verront le support dès
   l'écriture. Vous ne modifiez jamais `isAvailable`.
2. Si le support est déjà en source `db` en prod : sa `version` doit être celle notée à
   votre dernière écriture (rubrique « Rédaction »). Sinon, quelqu'un l'a modifié (builder,
   skill `retouche`) : arrêtez-vous, montrez l'écart, l'utilisateur tranche avant tout
   écrasement.
3. Annoncez l'écriture en une phrase (`save_content`, module, section, type, nombre de
   blocs) et demandez la confirmation. Attendez un oui explicite.
4. `save_content` (prod) avec le tableau `blocks` lu dans le `.json` (`Read`), tel quel.
5. Contrôle : `get_content` (prod). Si la sortie est rangée dans un fichier
   `tool-results`, passez ce fichier tel quel à `comparer` (il déballe l'enveloppe MCP).
   Attendu : `IDENTIQUE`. Si elle revient en ligne (support de moins de 25 Ko environ),
   ne la recopiez pas dans un fichier : vérifiez que la `version` a augmenté de 1 et que
   les `id` racine et le nombre de blocs correspondent à `<support>-couverture.md`, et
   notez « comparaison partielle ». Un écart : montrez-le, ne réécrivez pas sans
   l'accord de l'utilisateur.
6. Notez `contentId`, `version` et la date dans la rubrique « Rédaction ».

Si le classifieur du mode automatique refuse l'écriture, redemandez la confirmation et
réessayez ; ne contournez jamais un hook.

**Relecture navigateur** (spec § 2 étape 7) : donnez à l'utilisateur l'adresse du
support (page de la section en prod ; une section non publiée reste visible d'un
admin). Phase « relecture navigateur ». Chaque correction qu'il demande repart au
rédacteur (mode correction, hors cycle), puis § 3, puis nouvelle écriture en prod (avec
la vérification de version et une confirmation). Son OK : statut, état du module,
commit, puis support suivant.

## 7. Amender le plan, revenir au cours

Un amendement du plan (écart accepté, remarque qui met le plan en cause, retour au
cours) se fait avec l'accord de l'utilisateur : version du plan + 1, une ligne par
changement dans « Relectures du plan », relecture des seuls repères touchés par
`relecteur-coherence` et `relecteur-contrat` en mode plan (`plan.md` § 4, dans sa limite
de deux cycles), validation, commit. Le support concerné repart ensuite au rédacteur en
mode correction.

Retour au cours alors que le cours est validé : c'est un amendement du plan du cours,
puis une correction du cours (cycle propre au cours, relu sur ses blocs modifiés),
validation, nouvelle écriture en prod ; les slides et le TP qui dépendent du passage
modifié sont signalés à l'utilisateur.

## 8. Définition de terminé, par support

- ✔/✘ rendu du rédacteur complet (couverture : <n repères du plan sur n>) ;
- ✔/✘ brouillon valide (`valider` : sortie collée) et export cohérent (« <n> marqueurs
  pour <n> blocs ») ;
- ✔/✘ relecture : rapports complets, au plus deux cycles, désaccords restants présentés ;
- ✔/✘ bac à sable supprimé (sorties de `bac-a-sable.md` § 6), s'il a servi ;
- ✔/✘ support validé par l'utilisateur (sa réponse citée), statut, état du module,
  commit (hash) ;
- ✔/✘ écriture prod confirmée (réponse citée), `comparer` : `IDENTIQUE`, `version`
  notée ;
- ✔/✘ relecture navigateur : OK de l'utilisateur (réponse citée), commit.
