# Couleurs de module en base de données — Design

**Date :** 2026-06-21
**Statut :** Validé (brainstorming)
**Approche retenue :** A — Variables CSS injectées au runtime + CSS générique

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

## 4. Système CSS générique

Dans `globals.css`, suppression de tous les pavés par-`path` (sauf `login`, voir §7) et
remplacement par **un seul** jeu de règles :

```css
[data-module-theme] {
    --module-accent: var(--module-accent-l, var(--color-brand-primary));
}
.dark [data-module-theme] {
    --module-accent: var(--module-accent-d, var(--color-brand-primary));
}

/* helpers génériques (remplacent .text-{path} / .bg-{path} / .border-{path}
   et les .header-{path} .text-module / .bg-module / .border-module) */
.text-module   { color: var(--module-accent); }
.bg-module     { background: var(--module-accent); }
.border-module { border-color: var(--module-accent); }

/* auto-coloration du contenu pédagogique (ex .header-{path} h1/h2/h3/a) */
.module-prose :is(h1, h2, h3) { color: var(--module-accent); }
.module-prose h1 { text-align: center; }
.module-prose a  { color: var(--module-accent); text-decoration: underline; }
.module-prose [data-state="checked"].bg-module { background: var(--module-accent); }
```

**Astuce light/dark :** le wrapper porte les deux valeurs brutes en inline style
(`--module-accent-l`, `--module-accent-d`). Comme `--module-accent` est résolu **sur le
wrapper** (scope `[data-module-theme]`), le choix light/dark suit l'ancêtre `.dark` et chaque
carte de la home reste indépendante.

## 5. Application du thème (fichiers consommateurs)

Partout où il y avait `header-${path}`, `bg-${path}` ou `text-${path}`, on enveloppe avec :

```tsx
// On n'injecte la variable que si la couleur existe : mettre '' la rendrait
// invalide à la résolution et le fallback var(..., brand-primary) ne s'appliquerait pas.
const themeStyle = {
    ...(m.colorLight ? { '--module-accent-l': m.colorLight } : {}),
    ...(m.colorDark ? { '--module-accent-d': m.colorDark } : {}),
} as React.CSSProperties;

<div data-module-theme style={themeStyle}>
```

Fichiers à adapter :

- `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` (lignes ~187, ~243) — wrapper + `module-prose`
- `src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx` (ligne ~40) — wrapper + `module-prose`
- `src/components/admin/AdminModule.tsx` (ligne ~43) — wrapper (remplace `header-${path}`)
- `src/components/Cards/ModuleCard.tsx` — wrapper + `.bg-module`/`.text-module` (remplace `bg-${path}`/`text-${path}`)
- `src/components/admin/EditModuleSheet.tsx` — `AdminSheetHeader` et bouton submit : wrapper + `.bg-module`
- Vérifier les autres usages de `text-{path}`/`bg-{path}`/`border-{path}` (ex. `SectionCard`,
  `ContentSidebarNav`, `AdminSheetHeader`) et les basculer sur `.text-module`/`.bg-module` sous wrapper.

> Note : les composants de contenu utilisent déjà `.text-module`/`.bg-module`/`.border-module`.
> Ces classes deviennent globales (plus besoin de l'ancêtre `.header-{path}`), donc **zéro
> changement** dans ces composants tant qu'un ancêtre `[data-module-theme]` fournit l'accent.

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

**`login` :** reste statique. On conserve `--color-login` et un petit bloc dédié
(`.header-login`/équivalent) dans `globals.css` pour les pages login/register, qui ne sont pas
des modules Mongo.

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

## 10. Tests

- Migration : après run, `findOne({path})` renvoie les couleurs attendues.
- Schema : `moduleFormSchema` rejette un hex invalide, accepte un hex valide.
- Assignation : deux créations successives n'obtiennent pas la même paire tant qu'il reste
  des paires libres.
- Visuel manuel : page module, slide, home cards, sheet admin — rendu identique en light/dark
  avant/après pour les 5 modules existants.
