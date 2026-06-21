# Couleurs de module en base de données — Design

**Date :** 2026-06-21
**Statut :** Validé (brainstorming)
**Approche retenue :** A-inject — les variables `--color-{path}` existantes sont **conservées**
mais leurs **valeurs** sont injectées au runtime depuis Mongo via un `<style>` généré dans le
layout racine, qui override `:root`/`.dark` de `globals.css`.

> **Historique de décision :** l'approche A « pure » (renommage générique `--module-color` +
> wrappers `[data-module-theme]` partout + suppression du boilerplate) avait été retenue, puis
> abandonnée après cartographie : la couleur par-`path` est consommée de 3 façons dans ~25
> fichiers (classes `bg/text/border-${path}`, styles inline `var(--color-${path})`, lectures
> JS `getComputedStyle`), dont du hardcodé dans `src/cours/php/*`. A-inject livre le même
> résultat fonctionnel (DB + picker admin + auto-couleur) avec ~3 fichiers touchés et zéro
> régression. Le nettoyage du boilerplate CSS est reporté (hors périmètre).

## 1. Problème

Les couleurs de chaque module sont définies **en dur** dans `src/app/globals.css` :

- Pour chaque module (clé = `path` : `html-css`, `php`, `javascript`, `brainfuck`, plus
  `login`), deux variables CSS — `--color-{path}` en `:root` (light) et en `.dark` (dark).
- Pour chaque `path`, ~7 règles répétitives, identiques au nom de variable près :
  `.text-{path}`, `.bg-{path}`, `.border-{path}`, `.header-{path} h1/h2/h3`,
  `.header-{path} .bg-module`, `.header-{path} .text-module`, `.header-{path} a`,
  `.header-{path} [data-state=checked].bg-module`.

Conséquence : ajouter un module (via builder/MCP) impose de recopier ce pavé CSS à la main.
Et il est impossible de changer une couleur depuis l'espace admin.

**Objectif :** thème éditable par l'admin — un color picker (light + dark) par module,
persisté en base, plus assainissement du boilerplate CSS.

## 2. Contraintes existantes

- Les classes module sont du **CSS écrit à la main**, pas des utilities Tailwind générées.
- Une couleur venue de Mongo arrive au **runtime** : Tailwind ne peut pas générer d'utility
  pour un `path` arbitraire au build. Il faut donc injecter des **variables CSS au runtime**.
- Contraste : les commentaires de `globals.css` montrent des ratios vérifiés. Light = lisible
  sur fond crème `#f7ebd9` ET avec texte blanc. Dark = lisible sur fond sombre ET en fond
  avec texte sombre. Toute couleur assignée doit respecter ces contraintes.
- `login` **n'est pas** un module Mongo (pages login/register) → cas spécial, reste statique.
- Phase de build : pas d'appel DB synchrone au module-load (cf. CLAUDE.md §6).

## 3. Modèle de données

Ajout sur la collection `modules` et `src/types/Module.ts` :

```ts
colorLight?: string;  // hex 6 chars, ex. "#C13B1A"
colorDark?: string;   // hex 6 chars, ex. "#FF8568"
```

Optionnels : si absents, fallback CSS sur `--color-brand-primary`. Validation
`/^#[0-9a-fA-F]{6}$/` ajoutée à `moduleFormSchema` (`src/lib/schemas/module.schema.ts`).

## 4. Injection des couleurs au runtime

`globals.css` est **inchangé** : ses définitions `:root { --color-{path} }` et
`.dark { --color-{path} }` restent comme **valeurs par défaut/fallback**.

Le layout racine (`src/app/layout.tsx`, passé en `async`) lit `getModules()` et rend un
`<style>` qui **override** ces variables avec les valeurs de la base :

```tsx
const modules = await getModules();
const css = generateModuleThemeCss(modules); // chaîne CSS sanitizée

// premier enfant de <body> → après globals.css dans l'ordre source → override gagnant
<style id="module-theme-vars" dangerouslySetInnerHTML={{ __html: css }} />
```

CSS généré (exemple) :

```css
:root{--color-html-css:#C13B1A;--color-php:#3B3F7A;…}
.dark{--color-html-css:#FF8568;--color-php:#9198E5;…}
```

**Pourquoi ça override sans `!important` :** une balise `<style>` simple (sans `precedence`)
n'est pas hissée par React 19 ; placée en **premier enfant de `<body>`**, elle vient après le
CSS de `globals.css` (injecté dans `<head>`) dans l'ordre source. Spécificités égales
(`:root` vs `:root`, `.dark` vs `.dark`) → la dernière règle gagne.

**Sécurité :** `generateModuleThemeCss` sanitize strictement avant interpolation —
`path` doit matcher `^[a-z0-9-]+$` et chaque couleur `^#[0-9a-fA-F]{6}$` ; toute entrée non
conforme est ignorée (anti-injection CSS). Un module sans couleur n'émet aucune règle → il
retombe sur le défaut de `globals.css`.

## 5. Fichiers consommateurs

**Aucun changement.** Tous les usages existants continuent de fonctionner tels quels car les
noms de variables et de classes sont préservés :

- classes `bg-${path}` / `text-${path}` / `border-${path}` (~30 sites, dont `src/cours/php/*`)
- styles inline `var(--color-${path})` (~14 sites)
- lectures JS `getComputedStyle().getPropertyValue('--color-${path}')` (`HeroSection`,
  `SlideTitle`) — lisent désormais la valeur injectée par le layout

> `login` n'est pas dans `getModules()` → `--color-login` n'est jamais override, reste statique.

## 6. Color picker admin

Dans `EditModuleSheet`, nouvelle section « Couleurs » : deux `<input type="color">`
(clair / sombre) avec aperçu de pastille. Branchés via `react-hook-form` + `moduleFormSchema`.
Persistance via l'API existante `src/app/api/admin/modules/[moduleId]/route.ts` (updateOne)
— aucune nouvelle route. Avertissement de contraste **non bloquant** (nice-to-have v1).

## 7. Assignation automatique à la création + cas `login`

**Création (admin POST + MCP `create_module`) :** un helper
`src/lib/assignModuleColor.ts` choisit une paire `(colorLight, colorDark)` dans une
**palette curée de paires accessibles** (contraste pré-validé), en privilégiant une paire non
encore utilisée par un autre module ; si toutes sont prises, tirage aléatoire. Appliqué dans :

- `src/app/api/admin/modules/route.ts` (POST) — avant `insertOne`
- la branche `create_module` de `src/app/api/mcp/route.ts`

**`login` :** reste statique — `getModules()` ne le renvoie pas, donc `--color-login` n'est
jamais override et `globals.css` reste la source pour les pages login/register.

## 8. Migration

Script ponctuel `src/scripts/migrate-module-colors.ts` : écrit `colorLight`/`colorDark` sur les
5 modules existants à partir des valeurs actuelles de `globals.css` → **aucun changement
visuel** attendu.

| path        | colorLight | colorDark |
|-------------|------------|-----------|
| html-css    | #C13B1A    | #FF8568   |
| php         | #3B3F7A    | #9198E5   |
| javascript  | #7A6200    | #FFD93D   |
| brainfuck   | #6B21A8    | #C07AF8   |

## 9. Périmètre exclu (YAGNI v1)

- Pas de palette dérivée (nuances 50→900) par module.
- Pas de contrôle de contraste **bloquant** (simple avertissement).
- Pas de thématisation de `login` depuis la base.
- **Nettoyage du boilerplate `globals.css`** (pavés par-`path`) : reporté. A-inject les garde
  comme fallback ; un refactor générique ultérieur pourra les retirer.
- Pas de cache sur `getModules()` dans le layout (appel direct ; optimisation possible plus tard).

## 10. Tests

- `generateModuleThemeCss` : émet `:root`/`.dark` pour un module valide ; ignore un `path` ou
  une couleur non conforme (anti-injection) ; chaîne vide si aucun module n'a de couleur.
- Schema : `moduleFormSchema` rejette un hex invalide, accepte un hex valide, accepte l'absence.
- Assignation : deux créations successives n'obtiennent pas la même paire tant qu'il reste
  des paires libres.
- Migration : après run, `findOne({path})` renvoie les couleurs attendues.
- Visuel manuel : page module, slide, home cards, sheet admin — rendu identique en light/dark
  avant/après pour les 5 modules existants.
