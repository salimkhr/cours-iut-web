# Skill module-design — Concevoir un module pédagogique

À utiliser pour créer un nouveau module : brainstorm des sections, définition de
l'univers fil rouge, découpage en séances. Le livrable est un plan validé par
l'utilisateur PUIS le module créé en base (staging uniquement).

## Philosophie

- **L'apprentissage se joue dans le TP.** Le cours et les slides amorcent la première
  séance (`courseIntroMinutes`) ; tout le reste du temps est du TP. Concevez les
  sections autour de ce que l'étudiant FERA, pas de ce qu'il écoutera.
- **Public réel** : étudiants de BUT Informatique, niveaux hétérogènes. Une section
  se juge à ceci : l'étudiant fragile démarre, le rapide ne s'ennuie pas.
- **Un univers par module, fil rouge cumulatif** : le projet grossit de section en
  section. Chaque section déclare ce que le projet gagne à cette étape.
- **Modèle temporel** : durée de séance uniforme par module (`sessionDurationMinutes`).
  Le cours/slides n'ouvre QUE la première séance d'une section ; les séances
  suivantes sont 100 % TP.

## Workflow (6 étapes, dans l'ordre)

### 1. Cadrage
Collectez : matière/thème, niveau des étudiants (BUT 1/2/3, débutants ou non),
nombre total de séances, durée d'une séance. Par arguments ou questions.

### 2. Contexte — jamais de conception « de tête »
- `list_modules` : modules existants (éviter les doublons, situer le niveau).
- `list_sections` sur les modules prérequis : leurs `curriculum` disent ce que les
  étudiants savent VRAIMENT (pas ce qui était prévu).
- `list_verdicts` avec `format: "module-design"` : les critiques passées de
  l'utilisateur sur des conceptions. Les relire AVANT de proposer quoi que ce soit.

Si le serveur MCP est indisponible : ARRÊT immédiat avec message clair.

### 3. Découpage en sections
Brainstorm de la progression des notions avec l'utilisateur : liste des sections,
`totalDuration` (nombre de séances) et `courseIntroMinutes` par section, objectifs
et notions de chacune. Vérifiez : la somme des séances = le budget du module.
Le `brief` de chaque section est rempli SAUF `filRougeStep`.

### 4. Univers + plan d'avancement
Proposez 2-3 univers candidats (domaine + données types). Chacun est présenté avec
son plan d'avancement section par section : « section 1 : le projet affiche X ;
section 2 : on ajoute Y ; … fin de module : l'application fait Z ». L'utilisateur
choisit ; remplissez alors le `filRougeStep` de chaque brief.

### 5. Plan écrit
Restituez le plan complet dans la conversation : module (univers, durée de séance)
+ chaque section avec son brief complet. L'utilisateur valide, ou vous retournez
aux étapes 3/4.

### 6. Création en base — staging uniquement, après le « go » explicite
- `create_module` avec `universe` et `sessionDurationMinutes`.
- `create_section` pour chaque section avec `totalDuration`, `courseIntroMinutes`,
  `brief`, `objectives`, et les `contentTypes` (cours, TP, slide au minimum ;
  examen sur la dernière section du module).
- Restituez les slugs créés.
- JAMAIS d'écriture sur le serveur de production. Le passage en prod est une copie
  séparée, sur confirmation explicite de l'utilisateur.

## Clôture
Si l'utilisateur critique la conception (structure bancale, univers plat, mauvais
découpage), enregistrez sa critique VERBATIM via `add_verdict`
(`format: "module-design"`) avant de terminer.
