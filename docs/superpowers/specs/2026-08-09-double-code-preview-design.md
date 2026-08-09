# Blocs à deux codes, aperçu exécutable et bac à sable étudiant

**Date :** 2026-08-09
**Statut :** design validé, prêt pour le plan d'implémentation

## 1. Problème

Le bloc `code-with-preview` n'accepte qu'un seul panneau de code. Trois besoins pédagogiques
ne sont pas couverts :

1. **CSS** — l'étudiant voit la règle CSS et son rendu, mais jamais le HTML auquel elle
   s'applique. Le lien sélecteur → élément reste invisible.
2. **JS** — l'iframe est en `sandbox=""`, donc aucun script ne s'exécute. Un aperçu JS est
   aujourd'hui impossible.
3. **PHP** — aucun moyen de montrer un formulaire HTML à côté du script qui le traite.

S'y ajoute une demande de bac à sable : permettre à l'étudiant de modifier l'exemple et de
voir l'aperçu réagir.

## 2. État de l'existant (vérifié)

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

## 3. Décisions

| Sujet | Décision |
|---|---|
| Modèle | Étendre `code-with-preview`. Pas de nouveau type, pas de migration. |
| Disposition | Deux codes empilés à gauche, aperçu à droite. Les deux codes visibles simultanément. |
| Exécution JS | `sandbox="allow-scripts"` seul, jamais avec `allow-same-origin`. |
| Édition | Monaco, chargé dynamiquement au clic sur « Modifier ». |
| Persistance | Aucune. Modifications éphémères + bouton « Réinitialiser ». |
| Cohérence visuelle | Thème Monaco dérivé de `codeTheme.ts` — même source que Prism. |

## 4. Modèle de données

```
"code-with-preview": {
    language: string              // existant
    code: string                  // existant
    preview?: string              // existant — contenu d'aperçu ET interrupteur
    secondaryLanguage?: string    // nouveau
    secondaryCode?: string        // nouveau
}
```

Aucun champ `allowScripts` ni `editable` : les deux se déduisent des langages présents.
Moins de champs à régler, donc moins d'occasions de se tromper.

**Rétrocompatibilité active** : pour un bloc `css` ayant un `preview` mais pas de
`secondaryCode`, `preview` est affiché comme panneau HTML secondaire. Les blocs CSS
existants gagnent le second panneau sans ressaisie. Ne s'applique qu'à `css` : pour un bloc
`html`, `preview` remplace le document et l'afficher comme « second code » n'aurait pas de
sens.

## 5. Règles de comportement

Deux règles **distinctes**, à ne pas confondre :

```
afficherAperçu = preview non vide ET au moins une source exécutable
autoriserÉdition = afficherAperçu ET TOUTES les sources exécutables
```

Est exécutable un langage dont `normalizeLanguage()` donne `html`, `css` ou `javascript`.
Ni PHP ni Rust : aucun interpréteur côté navigateur.

L'édition est **conjonctive**. Dans un bloc PHP + HTML, éditer le HTML produirait un aperçu
trompeur, puisque le PHP resterait inerte : aucun panneau n'est donc éditable, pas même
celui dont le langage le permettrait.

### Matrice des cas

| `language` | `secondaryCode` | `preview` | Aperçu | Édition | Rendu |
|---|---|---|---|---|---|
| tout | — | — | ✗ | ✗ | `CodeCard` *(inchangé)* |
| `html`/`css` | — | ✓ | ✓ | ✓ | un code + aperçu *(compat)* |
| `css` | html | ✓ | ✓ | ✓ | deux codes + aperçu éditable |
| `javascript` | html | ✓ | ✓ | ✓ | idem, avec `allow-scripts` |
| `php` | html | — | ✗ | ✗ | deux codes empilés, lecture seule |
| `php` | html | ✓ | ✓ | ✗ | deux codes + aperçu figé |

**Effet sur le contenu déjà publié.** La *structure* des blocs existants ne bouge pas : sans
`secondaryCode`, il n'y a pas de second panneau. En revanche leur *éditabilité* change —
un bloc `html` ou `css` disposant d'un `preview` remplit les deux conditions et devient donc
un bac à sable, sans intervention. C'est l'effet recherché, mais il est rétroactif : tous les
blocs à aperçu du site deviennent modifiables le jour du déploiement. Si ce n'est pas
souhaité, il faudra un champ `editable` explicite, écarté ici au nom du YAGNI — le rajouter
plus tard reste simple, l'inverse aussi.

## 6. Architecture

### `src/lib/previewDocument.ts` (nouveau)

Fonction pure, isomorphe (utilisable serveur et client) :

```
buildPreviewDocument({ language, code, secondaryLanguage, secondaryCode, preview })
    → { html: string, needsScripts: boolean, editable: boolean }
```

Elle classe les sources par langage normalisé, puis assemble : CSS dans `<style>`, HTML dans
`<body>`, JS dans `<script>`. `needsScripts` détermine la valeur du `sandbox`.

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
  n'a plus de sens à deux) et, si éditable, son bouton **Modifier**.
- « Modifier » déclenche le chargement dynamique de Monaco pour ce panneau, avec le mode du
  langage de **ce** panneau (`html`, `css` ou `javascript`).
- Recalcul de l'aperçu avec un debounce de 300 ms.
- Bouton **Réinitialiser** dès qu'un panneau a été touché.
- Mobile (< 640 px) : le jeu d'onglets existant gagne un onglet par code.

### Thème Monaco

Dérivé de `src/lib/codeTheme.ts`, la source déjà utilisée par Prism. Objectif : le passage
lecture → édition ne doit pas se voir. Importer un thème Monaco tout fait retomberait sous
4.5:1 et réintroduirait le bleu froid proscrit par DESIGN.md.

## 7. Sécurité

`sandbox="allow-scripts"` **uniquement** si `needsScripts` ; sinon `sandbox=""` strict.
Jamais `allow-same-origin` en parallèle : combinées, ces deux valeurs permettent au script de
retirer son propre sandbox. Le script reste en origine opaque, sans accès au DOM du site,
aux cookies ni à la session.

## 8. Limite acceptée

Un étudiant peut écrire `while(true){}`. L'iframe étant `srcdoc`, elle partage généralement
le processus de rendu de l'onglet : une boucle infinie peut **figer l'onglet**, rendant le
bouton « Réinitialiser » inatteignable — il faudra fermer l'onglet. Contenir cela
exigerait d'exécuter le JS dans un Web Worker avec timeout, chantier distinct. Risque assumé
pour un usage pédagogique encadré.

## 9. Tests

- `previewDocument.test.ts` : assemblage HTML/CSS/JS ; `needsScripts` ; `editable`
  conjonctif (php+html → false) ; cas hérités (`preview` seul, `code` seul) ;
  rétrocompatibilité CSS.
- `blockSchemas` : les nouveaux champs sont bien optionnels.
- `blockDefs` : `secondaryCode` configuré sur 15 lignes, comme les autres champs de code
  (cf. `blockDefs.test.ts`).

## 10. Périmètre annexe

- `blockTextUtils` (bouton « Copier pour l'IA ») doit inclure le second code.
- `blockDefs.fields` gagne `secondaryLanguage` et `secondaryCode`.

## 11. Hors périmètre

- Persistance serveur des modifications étudiantes.
- Aperçu live dans le builder admin.
- Exécution du JS en Web Worker.
- Le comportement « `preview` vide = pas d'aperçu » est conservé tel quel, même s'il rend
  inatteignable la logique de repli de `previewSrcDoc` (lignes 63-67) : c'est un choix
  délibéré du commit `da14c65`, hors sujet ici.
