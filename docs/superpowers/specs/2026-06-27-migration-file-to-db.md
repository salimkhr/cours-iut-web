# Spec — Migration contenu `.tsx` → MongoDB

**Date :** 2026-06-27
**Périmètre :** script `script/migrateToDB.js` — lecture des fichiers `src/cours/` + écriture dans `course_content` + mise à jour des `ContentRef`.

---

## 1. Objectif

Convertir le contenu pédagogique stocké dans des fichiers `.tsx` (JSX React) en documents `CourseContent` (collection MongoDB `course_content`), afin que le builder web et le MCP server puissent lire et éditer ce contenu.

Les fichiers `.tsx` restent en place comme fallback : une section bascule en `source:"db"` uniquement quand la migration a réussi.

---

## 2. Flux général

```
src/cours/{moduleSlug}/{sectionSlug}/{Type}.tsx
          │
          ▼ Babel parse (typescript + jsx plugins)
       AST JSX
          │
          ▼ traverseJSX() → Block[]
    [{ id, type, props, children? }, ...]
          │
          ├─ --dry-run → affiche JSON, s'arrête
          │
          ▼ MongoDB upsert → course_content
    { moduleSlug, sectionSlug, contentType, blocks, version:1, ... }
          │
          ▼ MongoDB update → section.contents[]
    ContentRef: { source:"file" } → { source:"db", contentId }
```

**Dérivation des slugs depuis le chemin :**
- `src/cours/javascript/1-le-dom/Cours.tsx` → `moduleSlug:"javascript"`, `sectionSlug:"1-le-dom"`, `contentType:"cours"`
- Nom de fichier → contentType : `Cours.tsx`→`cours`, `TP.tsx`→`TP`, `Examen.tsx`→`examen`, `Slide.tsx`→`slide`

---

## 3. Mapping JSX → Block

### 3a. Structure (blocs conteneurs)

| JSX source | Block produit | Logique |
|---|---|---|
| `<article>` | ignoré | enfants extraits directement |
| `<section>` + `<Heading level={2}>` | `section` (Partie) | titre = texte du Heading, reste → `children[]` |
| `<Heading level={3}>` | `section` imbriqué (profondeur 1 → h3) | frères suivants jusqu'au prochain h3/h2 → `children[]` |
| `<Heading level={4}>` | `section` imbriqué (profondeur 2 → h4) | même logique, un cran plus profond |

**Algorithme de regroupement (récursif) :** quand un heading de niveau N est rencontré parmi les frères, tout ce qui suit jusqu'au prochain heading de niveau ≤ N constitue ses `children`. `<section>` JSX agit comme délimiteur naturel de h2.

### 3b. Blocs de contenu

| Composant JSX | `type` Block | Props extraites |
|---|---|---|
| `<Text>` | `text` | `content` : markdown inline reconstruit |
| `<CodeCard language="js">` | `code` | `language`, `code` (template literal) |
| `<List ordered>` | `list` | `ordered` (boolean) |
| `<ListItem>` | `list-item` | `text` : markdown inline |
| `<ImageCard src alt>` | `image-card` | `src`, `alt`, `title` (caption) |
| `<DiagramCard>` | `diagram` | `chart` (mermaid), `header` |
| `<Table>` / `<TableRow>` / `<TableCell>` | `table` / `table-row` / `table-cell` | structure imbriquée |
| `<CoursePrerequisites>` | `callout` | `variant:"info"`, enfants → `children[]` |

**Ignorés :** `<SectionCard>` (navigation dérivée de la DB), composants custom des dossiers `Exemple/`, tout composant non reconnu.

### 3c. Contenu inline (markdown reconstruit)

Les enfants mixtes de `<Text>` et `<ListItem>` (texte brut, `<strong>`, `<em>`, `` <Code> ``, `<a>`) sont sérialisés en markdown inline :
- `<strong>X</strong>` → `**X**`
- `<em>X</em>` → `_X_`
- `<Code>X</Code>` → `` `X` ``
- `<a href="…">X</a>` → `[X](…)`
- Entités HTML (`&apos;`, `&rsquo;`, `&quot;`) → caractères Unicode

---

## 4. Écriture MongoDB

### 4a. Upsert dans `course_content`

```js
db.collection("course_content").findOneAndReplace(
  { moduleSlug, sectionSlug, contentType },
  { moduleSlug, sectionSlug, contentType, blocks, version: 1,
    createdAt: new Date(), updatedAt: new Date() },
  { upsert: true, returnDocument: "after" }
)
```

Re-migration = écrasement. `version` repart à 1.

### 4b. Update du `ContentRef`

```js
db.collection("modules").updateOne(
  { "path": moduleSlug, "sections.path": sectionSlug },
  { $set: {
      "sections.$.contents.$[ref].source": "db",
      "sections.$.contents.$[ref].contentId": String(insertedId)
  }},
  { arrayFilters: [{ "ref.type": contentType }] }
)
```

Si l'update `ContentRef` échoue après un upsert réussi, la section reste en `source:"file"` (fallback intact). Le script logue l'erreur et continue.

---

## 5. Interface CLI

```bash
bun run migrate:db                         # migre tout src/cours/
bun run migrate:db --dry-run               # parse + affiche JSON, n'écrit pas
bun run migrate:db --module javascript     # un seul module
bun run migrate:db --file src/cours/javascript/1-le-dom/Cours.tsx
```

Script ajouté dans `package.json` :
```json
"migrate:db": "node script/migrateToDB.js"
```

---

## 6. Cas limites

| Situation | Comportement |
|---|---|
| Composant inconnu | Warning + ignoré, migration continue |
| Template literal avec expression JS (`` `${var}` ``) | Code extrait tel quel (expression non résolue), warning |
| `<Heading>` sans `<section>` parent | Traité comme `section` profondeur 0 |
| Fichier déjà migré | Upsert (écrase), log "updated" |
| Erreur Babel parse | Fichier skippé, log erreur, section reste `source:"file"` |

---

## 7. Sortie terminal

```
✓  javascript/1-le-dom/cours         42 blocs
✓  javascript/1-le-dom/TP            28 blocs
⚠  javascript/2-les-evenements/cours  3 composants inconnus ignorés
✗  php/9-symfony/cours               Erreur Babel (skippé)

Résultat : 48/50 fichiers migrés — 2 avertissements — 1 erreur
```

---

## 8. Hors périmètre

- Les fichiers `Exemple/*.tsx` (composants React interactifs) ne sont pas migrés — ils n'ont pas d'équivalent bloc.
- Les `Slide.tsx` peuvent être migrés mais leur rendu en mode builder n'est pas couvert par cette spec.
- Aucune modification du renderer existant (`source:"file"` continue de fonctionner après migration).
