# Blocs à deux codes, aperçu exécutable et édition par l'étudiant

**Date :** 2026-08-09
**Statut :** design validé, prêt pour le plan d'implémentation

## 1. Objectif

Permettre à l'étudiant de **modifier le HTML, le CSS et le JS présentés dans le cours** et de
voir immédiatement l'effet de ses modifications, afin de comprendre comment le code
fonctionne.

Trois besoins pédagogiques ne sont pas couverts aujourd'hui :

1. **CSS** — l'étudiant voit la règle et son rendu, mais jamais le HTML auquel elle
   s'applique. Le lien sélecteur → élément reste invisible.
2. **JS** — l'iframe est en `sandbox=""`, donc aucun script ne s'exécute. Un aperçu JS est
   impossible.
3. **PHP** — aucun moyen de montrer un formulaire HTML à côté du script qui le traite.

## 2. Le problème central : l'extrait n'est pas un document

Le code présenté dans un cours est un **extrait**. Un exemple HTML montre
`<p class="intro">Bonjour</p>`, pas un document avec `<!doctype>`, `<head>` et `<body>`.
Un exemple JS montre `document.querySelector(...)`, sans le HTML sur lequel il agit.

Un extrait ne peut donc pas être envoyé tel quel à l'iframe. Il faut un **gabarit** : un
document complet dans lequel chaque extrait vient s'insérer à un emplacement défini. C'est le
rôle du champ `preview`, et celui des marqueurs `@edit`.

## 3. État de l'existant (vérifié)

- `previewSrcDoc(code, language, previewMarkup)` vit dans `blockRegistry.tsx:37`. Pour
  `language === "css"`, le `code` part dans un `<style>` et `preview` fournit le `<body>` —
  **le HTML d'accompagnement est donc déjà saisi en base pour les blocs CSS**, simplement
  jamais affiché.
- `blockRegistry.tsx:329` : si `preview` est vide, le bloc retombe sur un `CodeCard` simple.
  Le champ `preview` cumule donc deux rôles : contenu d'aperçu **et** interrupteur
  marche/arrêt.
- L'iframe est en `sandbox=""` (`blockRegistry.tsx:344`).
- Aucune CSP n'est définie dans le projet (ni `src/`, ni `next.config.ts`), contrairement à
  ce qu'indique CLAUDE.md §4. Rien ne bloque un script d'iframe côté application.
- `normalizeLanguage()` / `isKnownLanguage()` (`syntaxHighlighter.ts:64`) gèrent déjà les
  alias de langage.
- Les thèmes de code sont faits maison (`src/lib/codeTheme.ts`) parce que One Light/One Dark
  tombaient sous 4.5:1 et introduisaient un bleu froid interdit par DESIGN.md.

## 4. Décisions

| Sujet | Décision |
|---|---|
| Modèle | Étendre `code-with-preview`. Pas de nouveau type, pas de migration. |
| Disposition | Deux codes empilés à gauche, aperçu à droite. Les deux codes visibles simultanément. |
| Injection | Marqueurs `@edit:<langage>` dans le gabarit `preview`. |
| Édition | Les panneaux de code sont éditables (Monaco), l'aperçu se recalcule à la frappe. |
| Exécution JS | `sandbox="allow-scripts"` seul, jamais avec `allow-same-origin`. |
| Persistance | Aucune. Modifications éphémères + bouton « Réinitialiser ». |
| Cohérence visuelle | Thème Monaco dérivé de `codeTheme.ts` — même source que Prism. |

## 5. Modèle de données

```
"code-with-preview": {
    language: string              // existant
    code: string                  // existant
    preview?: string              // existant — gabarit du document ET interrupteur d'aperçu
    secondaryLanguage?: string    // nouveau
    secondaryCode?: string        // nouveau
}
```

Aucun champ `allowScripts` ni `editable` : le premier se déduit des langages présents, le
second de la règle du §7.

**Rétrocompatibilité active** : pour un bloc `css` ayant un `preview` mais pas de
`secondaryCode`, `preview` est affiché comme panneau HTML secondaire. Les blocs CSS
existants gagnent le second panneau sans ressaisie. Ne s'applique qu'à `css` : pour un bloc
`html`, `preview` remplace le document et l'afficher comme « second code » n'aurait pas de
sens.

## 6. Les marqueurs `@edit`

Le champ `preview` est un document HTML complet. Chaque marqueur y désigne l'endroit où un
code présenté doit être injecté. La syntaxe suit le contexte d'accueil :

| Emplacement | Marqueur |
|---|---|
| Dans `<style>` | `/* @edit:css */` |
| Dans le `<body>` | `<!-- @edit:html -->` |
| Dans `<script>` | `/* @edit:js */` |

Exemple de gabarit pour un cours de JS :

```html
<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><style>/* @edit:css */</style></head>
<body>
    <!-- @edit:html -->
    <script>/* @edit:js */</script>
</body>
</html>
```

Le bloc porte alors le HTML dans un panneau et le JS dans l'autre. Chacun est injecté à son
marqueur, ce qui rend les modifications de l'étudiant visibles dans l'aperçu.

**Résolution.** Un marqueur est apparié au code dont `normalizeLanguage()` correspond au
suffixe (`css`, `html`, `js` → `javascript`). Un marqueur sans code correspondant est
remplacé par une chaîne vide ; un code sans marqueur correspondant est ignoré — les deux cas
sont signalés à l'auteur par la validation plutôt que silencieusement absorbés.

**Sans marqueur.** Si `preview` n'en contient aucun, on conserve l'assemblage automatique
actuel (CSS dans `<style>`, HTML dans `<body>`). Le contenu existant continue donc de
fonctionner sans modification.

**Deux panneaux, pas trois.** Le bloc expose deux codes présentés. Le cas HTML + CSS + JS
simultanés est rare et ne justifie pas six champs de plus dans le builder. Il reste couvert
sans rien ajouter : le gabarit étant un document HTML complet, la troisième source s'y écrit
en dur — un `<style>` ou un `<script>` figé, qui agit sur l'aperçu sans occuper de panneau.
On présente les deux codes qui portent l'intention pédagogique, le reste est décor.

**Deux panneaux de même langage.** Cas de bord : si les deux codes partagent un langage
(deux extraits CSS), ils sont concaténés dans l'ordre des panneaux au marqueur correspondant.
Comportement prévisible, et sémantiquement juste pour du CSS comme du JS.

## 7. Règles de comportement

Deux règles **distinctes**, à ne pas confondre :

```
afficherAperçu   = preview non vide ET au moins une source exécutable
autoriserÉdition = afficherAperçu ET TOUTES les sources exécutables
```

Est exécutable un langage dont `normalizeLanguage()` donne l'un des **noms canoniques
Prism** suivants :

```ts
const RUNNABLE = new Set(["markup", "css", "javascript"]);
export const isRunnable = (lang) => RUNNABLE.has(normalizeLanguage(lang));
```

**Attention à `markup`.** `ALIASES` (`syntaxHighlighter.ts:46`) mappe `html → markup` et
`xml → markup` : `normalizeLanguage("html")` ne retourne donc **pas** `"html"`. Écrire
`RUNNABLE = new Set(["html", ...])` rendrait tout bloc HTML non exécutable et désactiverait
silencieusement son aperçu. C'est le piège principal de cette fonction.

Sont exclus, faute d'interpréteur navigateur : `php`, `rust`, `sql`, `bash`, `json`. Ainsi
que `typescript`, `jsx` et `tsx`, qui exigeraient une transpilation — hors périmètre.

L'édition est **conjonctive**. Dans un bloc PHP + HTML, éditer le HTML produirait un aperçu
trompeur puisque le PHP resterait inerte : aucun panneau n'est donc éditable, pas même celui
dont le langage le permettrait.

### Matrice des cas

| `language` | `secondaryCode` | `preview` | Aperçu | Édition | Rendu |
|---|---|---|---|---|---|
| tout | — | — | ✗ | ✗ | `CodeCard` *(inchangé)* |
| `html`/`css` | — | ✓ | ✓ | ✓ | un code + aperçu, code éditable |
| `css` | html | ✓ | ✓ | ✓ | deux codes + aperçu, les deux éditables |
| `javascript` | html | ✓ | ✓ | ✓ | idem, avec `allow-scripts` |
| `php` | html | — | ✗ | ✗ | deux codes empilés, lecture seule |
| `php` | html | ✓ | ✓ | ✗ | deux codes + aperçu figé |

**Effet sur le contenu déjà publié.** La *structure* ne bouge pas : sans `secondaryCode`, il
n'y a pas de second panneau, et sans marqueur l'assemblage reste celui d'aujourd'hui. En
revanche l'*éditabilité* s'ajoute rétroactivement : tout bloc `html` ou `css` doté d'un
`preview` devient modifiable au déploiement. C'est l'objectif énoncé au §1 — l'étudiant doit
pouvoir manipuler le code du cours — mais c'est un changement visible sur du contenu déjà
en ligne, et il doit être assumé comme tel.

## 8. Architecture

### `src/lib/previewDocument.ts` (nouveau)

Fonction pure, isomorphe (utilisable serveur et client) :

```
buildPreviewDocument({ language, code, secondaryLanguage, secondaryCode, preview })
    → { html: string, needsScripts: boolean, editable: boolean }
```

Elle classe les sources par langage normalisé, injecte chaque code à son marqueur (ou
retombe sur l'assemblage automatique), et retourne le document complet. `needsScripts`
détermine la valeur du `sandbox` ; `editable` applique la règle conjonctive du §7.

Cette extraction sort la logique d'assemblage de `blockRegistry.tsx` (fichier de rendu React
de 900+ lignes, non testable unitairement). Elle porte désormais **la décision d'exécuter du
script** : elle doit être couverte par des tests.

### `CodeWithPreviewCard`

- L'iframe descend du registre vers le composant : l'aperçu doit se recalculer dans le
  navigateur à chaque frappe, donc côté client. `blockRegistry` ne passe plus que les props
  brutes et n'a plus à connaître `CodePanel` / `PreviewPanel` / `previewSrcDoc`.
- Le composant identifie aujourd'hui ses panneaux par `typeof children === 'string'`,
  fragile dès qu'il y a deux codes. Remplacé par une collecte explicite : tous les
  `<CodePanel>` dans un tableau, le `<PreviewPanel>` à part.
- Chaque panneau porte son étiquette de langage, son bouton **Copier** (copier « le code »
  n'a plus de sens à deux) et, si le bloc est éditable, son bouton **Modifier**.
- « Modifier » déclenche le chargement dynamique de Monaco (`next/dynamic`) pour ce panneau,
  dans le mode de **son** langage. Un étudiant qui se contente de lire ne télécharge rien.
- Recalcul de l'aperçu avec un debounce de 300 ms.
- Bouton **Réinitialiser** dès qu'un panneau diffère de sa valeur d'origine.
- Mobile (< 640 px) : le jeu d'onglets existant gagne un onglet par code.

### Thème Monaco

Dérivé de `src/lib/codeTheme.ts`, la source déjà utilisée par Prism. Objectif : le passage
lecture → édition ne doit pas se voir. Importer un thème Monaco tout fait retomberait sous
4.5:1 et réintroduirait le bleu froid proscrit par DESIGN.md.

## 9. Sécurité

`sandbox="allow-scripts"` **uniquement** si `needsScripts` ; sinon `sandbox=""` strict.
Jamais `allow-same-origin` en parallèle : combinées, ces deux valeurs permettent au script de
retirer son propre sandbox. Le script reste en origine opaque, sans accès au DOM du site,
aux cookies ni à la session.

## 10. Limite acceptée

Un étudiant peut écrire `while(true){}`. L'iframe étant `srcdoc`, elle partage généralement
le processus de rendu de l'onglet : une boucle infinie peut **figer l'onglet**, rendant le
bouton « Réinitialiser » inatteignable — il faudra fermer l'onglet. Contenir cela exigerait
d'exécuter le JS dans un Web Worker avec timeout, chantier distinct. Risque assumé pour un
usage pédagogique encadré, mais réel : la fonctionnalité invite explicitement à écrire du JS.

## 11. Tests

- `previewDocument.test.ts` : injection à chaque marqueur (`css`, `html`, `js`) ; marqueur
  sans code correspondant → chaîne vide ; code sans marqueur → ignoré ; `needsScripts` ;
  `editable` conjonctif (php+html → false) ; assemblage automatique quand `preview` ne
  contient aucun marqueur.
- **Test de non-régression** : un `preview` sans marqueur produit exactement le même
  document qu'avant le changement.
- `blockSchemas` : les nouveaux champs sont bien optionnels.
- `blockDefs` : `secondaryCode` configuré sur 15 lignes, comme les autres champs de code
  (cf. `blockDefs.test.ts`).

## 12. Builder et MCP

Les deux surfaces sont **génériques** : rien à coder de spécifique, tout se déclare dans
`blockDefs`.

| Surface | Mécanisme | Conséquence |
|---|---|---|
| Builder | `api/admin/content/block-types/route.ts` mappe `blockDefs` → `fields` | le formulaire se génère seul |
| MCP `list_block_types` | mappe `blockDefs` (`api/mcp/route.ts:302`) | les champs sont annoncés seuls |
| MCP écriture | `validateBlockTree()` sur les schémas Zod | accepte les champs une fois déclarés |

### Piège : le schéma est dupliqué

`blockDefs.ts:244` porte un champ `schema:` **et** `blockSchemas.ts:60` a sa propre entrée
pour `code-with-preview`. Les deux doivent être mis à jour. N'en modifier qu'un produirait
une incohérence silencieuse entre le builder et la validation MCP.

### Le sélecteur de langage est anormalement restreint

`blockDefs.ts:250` : `options: ["html", "css", "php"]` — trois langages, alors que le bloc
`code` (ligne 230) et `slide-code` (ligne 385) en proposent onze :

```
javascript, typescript, html, css, php, sql, json, bash, jsx, tsx, rust
```

Aucun bloc JS n'est donc créable aujourd'hui, ni au builder ni via MCP. La correction n'est
pas d'ajouter `javascript` au coup par coup mais **d'aligner ce bloc sur la liste des onze**.
Le sélecteur n'a pas à filtrer : `isRunnable()` (§7) décide seul de l'aperçu et de
l'édition, et un langage non exécutable dégrade proprement en deux codes en lecture seule.

### Champs à déclarer

```
language          select   → les 11 langages, comme le bloc `code`
secondaryLanguage select   → mêmes options, optionnel
secondaryCode     textarea rows 15                (aligné sur `code`)
preview           textarea rows 10 — label à renommer en « Gabarit de l'aperçu »
```

### Édition du code dans le builder — constaté en session

Observé sur `/admin/content/html-css/1-rappel-de-html/cours` :

1. **Aucune coloration dans le panneau Propriétés.** Les champs `code` et `preview` sont des
   `textarea` nus. Le correcteur orthographique du navigateur souligne même le code en rouge
   (`spellCheck` non désactivé).
2. **Le modal Monaco n'est pas proposé.** `CourseEditCanvas.tsx:68` filtre en dur :
   `if (blk.type !== "code" && blk.type !== "code-runnable") return;`. `code-with-preview`
   en est exclu. De plus `onSave` écrit en dur dans la prop `code` (ligne 147) : le modal ne
   sait pas alimenter une autre clé.
3. **L'aperçu ne se régénère pas.** En modifiant `code`, le canvas se met à jour au blur
   (avec coloration), mais l'aperçu reste figé sur l'ancien rendu — parce que `previewSrcDoc`
   fait *remplacer* le code par `preview` quand ce dernier est rempli. Les deux champs
   contenaient le même `<p>Bonjour</p>` en double, et se désynchronisent dès qu'on touche
   l'un des deux.

Le point 3 est la justification empirique des marqueurs `@edit` : tant que `preview`
remplace le code au lieu de l'accueillir, éditer un code ne peut pas se voir dans l'aperçu.

### Champ de type `code` (nouveau)

Plutôt que d'étendre le filtre en dur du point 2, ajouter un type de champ au builder :

```ts
type: "text" | "textarea" | ... | "code"

// dans FieldDef :
languageFrom?: string   // clé de la prop portant le langage (ex. "secondaryLanguage")
language?: string       // langage fixe, pour le gabarit (toujours "html")
```

Le `DynamicPropsEditor` route ce type vers un composant `CodeField` réutilisant Monaco
(déjà présent dans le builder via `CodeEditorModal`), avec `spellCheck` désactivé.

Bénéfice au-delà de ce chantier : tous les blocs porteurs de code (`code`, `slide-code`,
`download-file`, `input-card`, `code-with-preview`) gagnent la coloration d'un coup, au lieu
d'allonger une liste de types codée en dur à chaque nouveau bloc.

Le thème Monaco dérivé de `codeTheme.ts` (§8) sert alors **les deux** surfaces — l'édition
admin et le bac à sable étudiant. Il est écrit une fois.

### La documentation embarquée est l'interface du MCP

`list_block_types` expose `description`, `label` et `placeholder` : c'est **tout** ce qu'un
agent connaît du bloc. Les marqueurs `@edit:` doivent donc y être décrits explicitement,
sinon aucun agent ne saura les produire — le code aura beau fonctionner, la fonctionnalité
restera inaccessible via MCP.

La `description` actuelle (« Code HTML/CSS affiché avec son rendu live côte à côte ») doit
mentionner le second panneau, le JS, et la syntaxe des marqueurs. Le `placeholder` du champ
`preview` doit montrer un gabarit avec ses marqueurs plutôt qu'un simple `<main>`.

## 13. Périmètre annexe

- `blockTextUtils` (bouton « Copier pour l'IA ») doit inclure le second code.

## 14. Hors périmètre

- Persistance serveur des modifications étudiantes.
- Aperçu live dans le builder admin.
- Exécution du JS en Web Worker.
- Le comportement « `preview` vide = pas d'aperçu » est conservé tel quel, même s'il rend
  inatteignable la logique de repli de `previewSrcDoc` (lignes 63-67) : c'est un choix
  délibéré du commit `da14c65`, hors sujet ici.
