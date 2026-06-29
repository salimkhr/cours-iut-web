# Migration `.tsx` → MongoDB — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer `src/scripts/migrate-to-db.ts` — un script qui lit les fichiers `src/cours/**/*.tsx`, convertit le JSX en `Block[]` et écrit le résultat dans la collection MongoDB `course_content`, puis met à jour les `ContentRef` des sections.

**Architecture:** Le script réutilise la chaîne Babel → cheerio de `script/extractToMarkdown.js` : Babel parse le TSX, `@babel/generator` resérialise le nœud JSX retourné en string, cheerio le charge comme XML. Un dispatcher `convertElement` + un algorithme `groupByHeadings` produisent le `Block[]`. Les fonctions pures (deriveSlugs, serializeInline, groupByHeadings) sont testées unitairement avant l'intégration MongoDB.

**Tech Stack:** Bun (TypeScript natif), `@babel/parser` + `@babel/traverse` + `@babel/generator`, `cheerio`, `mongodb` driver (`connectToDB`), `uuid`.

---

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `src/scripts/migrate-to-db.ts` | Script principal (CLI + orchestrateur) |
| `src/scripts/migrate-to-db.test.ts` | Tests unitaires des fonctions pures |
| `package.json` | Ajout du script `migrate:db` |

---

## Task 1 : Setup fichier + entrée CLI

**Files:**
- Create: `src/scripts/migrate-to-db.ts`
- Modify: `package.json`

- [ ] **Créer `src/scripts/migrate-to-db.ts`** avec la structure de base et le parsing des arguments CLI :

```ts
import { connectToDB } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import * as babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import type { Block } from "@/types/CourseContent";

// @babel/traverse et @babel/generator ont un bug ESM connu en Bun
const traverse = (_traverse as unknown as { default: typeof _traverse }).default ?? _traverse;
const generate = (_generate as unknown as { default: typeof _generate }).default ?? _generate;

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN   = args.includes("--dry-run");
const MODULE_FILTER = args.find(a => a.startsWith("--module="))?.split("=")[1];
const FILE_FILTER   = args.find(a => a.startsWith("--file="))?.split("=")[1];

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
```

- [ ] **Ajouter le script dans `package.json`** (après `migrate-contents-refs`) :

```json
"migrate:db": "bunx dotenv-cli -e .env -e .env.local -- bun src/scripts/migrate-to-db.ts",
```

- [ ] **Vérifier que le fichier se parse sans erreur :**

```bash
bun run migrate:db --dry-run
```

Attendu : erreur `main is not defined` (normal, pas encore implémentée).

---

## Task 2 : Dérivation des slugs

**Files:**
- Modify: `src/scripts/migrate-to-db.ts`
- Create: `src/scripts/migrate-to-db.test.ts`

- [ ] **Écrire le test qui échoue** dans `src/scripts/migrate-to-db.test.ts` :

```ts
/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { deriveSlug } from "./migrate-to-db";

test("cours tsx", () => {
    expect(deriveSlug("src/cours/javascript/1-le-dom/Cours.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "1-le-dom",
        contentType: "cours",
    });
});

test("TP tsx", () => {
    expect(deriveSlug("src/cours/php/3-le-mvc/TP.tsx")).toEqual({
        moduleSlug: "php",
        sectionSlug: "3-le-mvc",
        contentType: "TP",
    });
});

test("Slide tsx", () => {
    expect(deriveSlug("src/cours/javascript/2-les-evenements/Slide.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "2-les-evenements",
        contentType: "slide",
    });
});

test("Examen tsx", () => {
    expect(deriveSlug("src/cours/javascript/6-examen/Examen.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "6-examen",
        contentType: "examen",
    });
});
```

- [ ] **Lancer les tests pour vérifier qu'ils échouent :**

```bash
bun test src/scripts/migrate-to-db.test.ts
```

Attendu : `Cannot find module './migrate-to-db'` ou `deriveSlug is not exported`.

- [ ] **Implémenter `deriveSlug` dans `migrate-to-db.ts`** (avant `main()`) :

```ts
export function deriveSlug(filePath: string): {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
} {
    // normalise les séparateurs Windows
    const normalized = filePath.replace(/\\/g, "/");
    // src/cours/{moduleSlug}/{sectionSlug}/{Type}.tsx
    const match = normalized.match(/src\/cours\/([^/]+)\/([^/]+)\/(\w+)\.tsx$/);
    if (!match) throw new Error(`Chemin inattendu : ${filePath}`);
    const [, moduleSlug, sectionSlug, typeName] = match;
    const typeMap: Record<string, string> = {
        Cours: "cours", TP: "TP", Examen: "examen", Slide: "slide",
    };
    const contentType = typeMap[typeName];
    if (!contentType) throw new Error(`Type inconnu : ${typeName}`);
    return { moduleSlug, sectionSlug, contentType };
}
```

- [ ] **Lancer les tests pour vérifier qu'ils passent :**

```bash
bun test src/scripts/migrate-to-db.test.ts
```

Attendu : 4 tests PASS.

- [ ] **Commit :**

```bash
git add src/scripts/migrate-to-db.ts src/scripts/migrate-to-db.test.ts package.json
git commit -m "feat(migrate): setup + deriveSlug"
```

---

## Task 3 : Sérialiseur inline (JSX → markdown)

**Files:**
- Modify: `src/scripts/migrate-to-db.ts`
- Modify: `src/scripts/migrate-to-db.test.ts`

- [ ] **Ajouter les tests qui échouent :**

```ts
import { serializeInline } from "./migrate-to-db";
import * as cheerio from "cheerio";

function loadEl(html: string) {
    const $ = cheerio.load(html, { xmlMode: true });
    return { $, el: $.root().children().first() };
}

test("serializeInline - texte brut", () => {
    const { $, el } = loadEl("<Text>Bonjour monde</Text>");
    expect(serializeInline($, el)).toBe("Bonjour monde");
});

test("serializeInline - strong + em", () => {
    const { $, el } = loadEl("<Text><strong>gras</strong> et <em>italique</em></Text>");
    expect(serializeInline($, el)).toBe("**gras** et _italique_");
});

test("serializeInline - Code inline", () => {
    const { $, el } = loadEl("<Text>voir <Code>document.getElementById</Code></Text>");
    expect(serializeInline($, el)).toBe("voir `document.getElementById`");
});

test("serializeInline - lien", () => {
    const { $, el } = loadEl(`<Text><a href="https://mdn.io">MDN</a></Text>`);
    expect(serializeInline($, el)).toBe("[MDN](https://mdn.io)");
});

test("serializeInline - entités HTML", () => {
    const { $, el } = loadEl("<Text>l&apos;élève &amp; le &quot;prof&quot;</Text>");
    expect(serializeInline($, el)).toBe("l'élève & le \"prof\"");
});
```

- [ ] **Lancer les tests pour vérifier qu'ils échouent :**

```bash
bun test src/scripts/migrate-to-db.test.ts
```

Attendu : 5 nouveaux tests FAIL.

- [ ] **Implémenter `serializeInline` dans `migrate-to-db.ts` :**

```ts
type CheerioAPI = ReturnType<typeof cheerio.load>;
type CheerioElement = cheerio.Element;

const HTML_ENTITIES: Record<string, string> = {
    "&apos;": "'", "&rsquo;": "'", "&lsquo;": "'",
    "&quot;": '"',  "&amp;": "&",
    "&lt;": "<",    "&gt;": ">",
    "&nbsp;": " ",
};

function decodeEntities(text: string): string {
    return text.replace(/&[a-zA-Z]+;/g, m => HTML_ENTITIES[m] ?? m);
}

export function serializeInline($: CheerioAPI, el: CheerioElement): string {
    let result = "";
    const recurse = (node: CheerioElement | cheerio.Text) => {
        if (node.type === "text") {
            result += decodeEntities((node as cheerio.Text).data ?? "");
        } else if (node.type === "tag") {
            const tag = (node as CheerioElement).tagName;
            const $node = $(node);
            switch (tag) {
                case "strong": case "b":
                    result += "**"; $node.contents().each((_, c) => recurse(c as CheerioElement)); result += "**"; break;
                case "em": case "i":
                    result += "_";  $node.contents().each((_, c) => recurse(c as CheerioElement)); result += "_";  break;
                case "Code":
                    result += "`" + $node.text().trim() + "`"; break;
                case "a":
                    result += "["; $node.contents().each((_, c) => recurse(c as CheerioElement));
                    result += "](" + ($node.attr("href") ?? "") + ")"; break;
                default:
                    $node.contents().each((_, c) => recurse(c as CheerioElement)); break;
            }
        }
    };
    $(el).contents().each((_, c) => recurse(c as CheerioElement));
    return result.replace(/\s+/g, " ").trim();
}
```

- [ ] **Lancer les tests :**

```bash
bun test src/scripts/migrate-to-db.test.ts
```

Attendu : 9 tests PASS.

- [ ] **Commit :**

```bash
git add src/scripts/migrate-to-db.ts src/scripts/migrate-to-db.test.ts
git commit -m "feat(migrate): serializeInline (markdown inline depuis cheerio)"
```

---

## Task 4 : Convertisseur JSX → Block[]

**Files:**
- Modify: `src/scripts/migrate-to-db.ts`
- Modify: `src/scripts/migrate-to-db.test.ts`

- [ ] **Ajouter les tests qui échouent :**

```ts
import { parseJSXString } from "./migrate-to-db";

test("Text → text block", () => {
    const blocks = parseJSXString(`<article><Text>Hello monde</Text></article>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("text");
    expect(blocks[0].props.content).toBe("Hello monde");
    expect(typeof blocks[0].id).toBe("string");
});

test("section + Heading level 2 → section block avec children", () => {
    const blocks = parseJSXString(`
        <article>
            <section>
                <Heading level={2}>A-Introduction</Heading>
                <Text>Premier paragraphe</Text>
            </section>
        </article>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("section");
    expect(blocks[0].props.title).toBe("A-Introduction");
    expect(blocks[0].children).toHaveLength(1);
    expect(blocks[0].children![0].type).toBe("text");
});

test("Heading level 3 imbriqué dans section", () => {
    const blocks = parseJSXString(`
        <article>
            <section>
                <Heading level={2}>A-Titre</Heading>
                <Heading level={3}>1. Sous-titre</Heading>
                <Text>Contenu</Text>
            </section>
        </article>`);
    expect(blocks[0].children).toHaveLength(1);
    expect(blocks[0].children![0].type).toBe("section");
    expect(blocks[0].children![0].props.title).toBe("1. Sous-titre");
});

test("CodeCard → code block", () => {
    const blocks = parseJSXString(`<article><CodeCard language="javascript">{\`const x = 1;\`}</CodeCard></article>`);
    expect(blocks[0].type).toBe("code");
    expect(blocks[0].props.language).toBe("javascript");
    expect(blocks[0].props.code).toBe("const x = 1;");
});

test("List ordered → list + list-item", () => {
    const blocks = parseJSXString(`
        <article>
            <List ordered={true}>
                <ListItem>Premier</ListItem>
                <ListItem>Deuxième</ListItem>
            </List>
        </article>`);
    expect(blocks[0].type).toBe("list");
    expect(blocks[0].props.ordered).toBe(true);
    expect(blocks[0].children).toHaveLength(2);
    expect(blocks[0].children![0].type).toBe("list-item");
    expect(blocks[0].children![0].props.text).toBe("Premier");
});

test("SectionCard → ignoré", () => {
    const blocks = parseJSXString(`<article><SectionCard title="X"/></article>`);
    expect(blocks).toHaveLength(0);
});
```

- [ ] **Lancer les tests pour vérifier qu'ils échouent :**

```bash
bun test src/scripts/migrate-to-db.test.ts
```

Attendu : 6 nouveaux tests FAIL.

- [ ] **Implémenter `parseJSXString` et ses helpers dans `migrate-to-db.ts` :**

```ts
// ── Éléments à ignorer complètement ────────────────────────────────────────
const IGNORED_TAGS = new Set([
    "SectionCard", "CourseLinks", "SlideTitle", "SlideNote",
]);

// ── Extraction du template literal dans un élément cheerio ─────────────────
function extractTemplateLiteral($: CheerioAPI, el: CheerioElement): string {
    const raw = $.html(el);
    const match = raw.match(/\{`([\s\S]*?)`\}/);
    return match ? match[1].trim() : "";
}

// ── Convertit un seul élément cheerio → Block | null ───────────────────────
function convertElement($: CheerioAPI, el: CheerioElement): Block | null {
    if (el.type !== "tag") return null;
    const tag = el.tagName;
    const $el = $(el);

    if (IGNORED_TAGS.has(tag)) return null;

    switch (tag) {
        case "Text":
            return { id: uuidv4(), type: "text", props: { content: serializeInline($, el) }, children: [] };

        case "CodeCard": {
            const language = ($el.attr("language") ?? "").replace(/[{}'"]/g, "");
            const code = extractTemplateLiteral($, el);
            return { id: uuidv4(), type: "code", props: { language, code }, children: [] };
        }

        case "CodeWithPreviewCard": {
            const language = ($el.attr("language") ?? "").replace(/[{}'"]/g, "");
            const $panel = $el.find("CodePanel").first();
            const code = extractTemplateLiteral($, $panel[0] as CheerioElement);
            return { id: uuidv4(), type: "code-with-preview", props: { language, code }, children: [] };
        }

        case "List": {
            const orderedAttr = $el.attr("ordered") ?? "";
            const ordered = orderedAttr === "{true}" || orderedAttr === "true";
            const children = $el.children("ListItem").toArray()
                .map(li => convertElement($, li as CheerioElement))
                .filter(Boolean) as Block[];
            return { id: uuidv4(), type: "list", props: { ordered }, children };
        }

        case "ListItem":
            return { id: uuidv4(), type: "list-item", props: { text: serializeInline($, el) }, children: [] };

        case "ImageCard": {
            const src   = ($el.attr("src") ?? "").replace(/[{}'"`]/g, "");
            const alt   = ($el.attr("alt") ?? "").replace(/[{}'"`]/g, "");
            const title = ($el.attr("caption") ?? $el.attr("title") ?? "").replace(/[{}'"`]/g, "");
            return { id: uuidv4(), type: "image-card", props: { src, alt, title }, children: [] };
        }

        case "DiagramCard": {
            const header = ($el.attr("title") ?? $el.attr("header") ?? "").replace(/[{}'"`]/g, "");
            const chart  = extractTemplateLiteral($, el);
            return { id: uuidv4(), type: "diagram", props: { header, chart }, children: [] };
        }

        case "Table": {
            const children = $el.children("TableRow").toArray()
                .map(row => {
                    const cells = $(row).children("TableHead, TableCell").toArray()
                        .map(cell => ({
                            id: uuidv4(), type: "table-cell",
                            props: { content: serializeInline($, cell as CheerioElement) },
                            children: [],
                        }));
                    return { id: uuidv4(), type: "table-row", props: {}, children: cells };
                });
            return { id: uuidv4(), type: "table", props: {}, children };
        }

        case "CoursePrerequisites": {
            const children = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            return { id: uuidv4(), type: "callout", props: { variant: "info" }, children };
        }

        default:
            // Traverse les wrappers inconnus (article, div, fragment, etc.)
            return null;
    }
}

// ── Algorithme de regroupement par heading ──────────────────────────────────
export function groupByHeadings(elements: CheerioElement[], $: CheerioAPI): Block[] {
    const blocks: Block[] = [];
    let i = 0;

    while (i < elements.length) {
        const el = elements[i];
        if (el.type !== "tag") { i++; continue; }
        const tag = el.tagName;
        const $el = $(el);

        if (tag === "section") {
            // La <section> JSX délimite un Heading level 2
            const $heading = $el.children("Heading").first();
            const title = $heading.length ? serializeInline($, $heading[0] as CheerioElement) : "";
            // Tous les autres enfants (hors le premier Heading) → children
            const rest = $el.children().toArray().filter(c =>
                !((c as CheerioElement).tagName === "Heading" && c === $heading[0])
            ) as CheerioElement[];
            const children = groupByHeadings(rest, $);
            blocks.push({ id: uuidv4(), type: "section", props: { title }, children });
            i++;

        } else if (tag === "Heading") {
            const level = parseInt(($el.attr("level") ?? "2").replace(/[{}]/g, ""), 10);
            const title = serializeInline($, el);
            // Collecte les frères suivants jusqu'au prochain heading de niveau ≤ level
            const childEls: CheerioElement[] = [];
            i++;
            while (i < elements.length) {
                const next = elements[i];
                if (next.type === "tag" && (next as CheerioElement).tagName === "Heading") {
                    const nextLevel = parseInt(($(next).attr("level") ?? "2").replace(/[{}]/g, ""), 10);
                    if (nextLevel <= level) break;
                }
                childEls.push(elements[i]);
                i++;
            }
            const children = groupByHeadings(childEls, $);
            blocks.push({ id: uuidv4(), type: "section", props: { title }, children });

        } else if (tag === "article") {
            // Transparent wrapper
            const inner = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            blocks.push(...inner);
            i++;

        } else {
            const block = convertElement($, el);
            if (block) blocks.push(block);
            i++;
        }
    }

    return blocks;
}

// ── Point d'entrée : JSX string → Block[] ──────────────────────────────────
export function parseJSXString(jsxCode: string): Block[] {
    const $ = cheerio.load(jsxCode, { xmlMode: true });
    const root = $.root().children().toArray() as CheerioElement[];
    return groupByHeadings(root, $);
}
```

- [ ] **Lancer les tests :**

```bash
bun test src/scripts/migrate-to-db.test.ts
```

Attendu : 15 tests PASS.

- [ ] **Commit :**

```bash
git add src/scripts/migrate-to-db.ts src/scripts/migrate-to-db.test.ts
git commit -m "feat(migrate): parseJSXString — convertisseur JSX → Block[]"
```

---

## Task 5 : Pipeline fichier → Babel → Block[]

**Files:**
- Modify: `src/scripts/migrate-to-db.ts`

- [ ] **Ajouter la fonction `parseFile` qui utilise Babel pour extraire le JSX retourné :**

```ts
export function parseFile(filePath: string): { blocks: Block[]; warnings: string[] } {
    const warnings: string[] = [];
    const source = fs.readFileSync(filePath, "utf-8");

    let ast: ReturnType<typeof babelParser.parse>;
    try {
        ast = babelParser.parse(source, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
        });
    } catch (err) {
        throw new Error(`Babel parse error: ${(err as Error).message}`);
    }

    // Cherche le premier ReturnStatement avec un argument JSX
    let jsxNode: babelParser.ParseResult<babelParser.File>["program"]["body"][0] | null = null;
    traverse(ast, {
        ReturnStatement(p) {
            const arg = p.node.argument;
            if (arg && (arg.type === "JSXElement" || arg.type === "JSXFragment")) {
                jsxNode = arg as typeof jsxNode;
                p.stop();
            }
        },
    });

    if (!jsxNode) {
        warnings.push("Aucun JSX trouvé dans le return");
        return { blocks: [], warnings };
    }

    // Resérialise le nœud AST → string JSX
    const { code: jsxCode } = generate(jsxNode as Parameters<typeof generate>[0], { concise: true });
    const blocks = parseJSXString(jsxCode);
    return { blocks, warnings };
}
```

- [ ] **Tester manuellement sur un vrai fichier (dry-run, pas de DB) :**

```bash
bun -e "
const { parseFile } = require('./src/scripts/migrate-to-db.ts');
const r = parseFile('src/cours/javascript/1-le-dom/Cours.tsx');
console.log(JSON.stringify(r.blocks.slice(0,2), null, 2));
console.log('warnings:', r.warnings);
"
```

Attendu : 2 blocs JSON affichés, `warnings: []`.

- [ ] **Commit :**

```bash
git add src/scripts/migrate-to-db.ts
git commit -m "feat(migrate): parseFile — Babel + cheerio → Block[]"
```

---

## Task 6 : Écriture MongoDB + mise à jour ContentRef

**Files:**
- Modify: `src/scripts/migrate-to-db.ts`

- [ ] **Ajouter les fonctions `upsertContent` et `updateContentRef` :**

```ts
import type { Db, ObjectId } from "mongodb";

async function upsertContent(
    db: Db,
    slugs: { moduleSlug: string; sectionSlug: string; contentType: string },
    blocks: Block[],
): Promise<string> {
    const now = new Date();
    const result = await db.collection("course_content").findOneAndReplace(
        { moduleSlug: slugs.moduleSlug, sectionSlug: slugs.sectionSlug, contentType: slugs.contentType },
        {
            moduleSlug: slugs.moduleSlug,
            sectionSlug: slugs.sectionSlug,
            contentType: slugs.contentType,
            blocks,
            version: 1,
            createdAt: now,
            updatedAt: now,
        },
        { upsert: true, returnDocument: "after" },
    );
    return String((result as { _id: ObjectId } | null)?._id ?? "");
}

async function updateContentRef(
    db: Db,
    slugs: { moduleSlug: string; sectionSlug: string; contentType: string },
    contentId: string,
): Promise<void> {
    await db.collection("modules").updateOne(
        { path: slugs.moduleSlug, "sections.path": slugs.sectionSlug },
        {
            $set: {
                "sections.$.contents.$[ref].source": "db",
                "sections.$.contents.$[ref].contentId": contentId,
            },
        },
        { arrayFilters: [{ "ref.type": slugs.contentType }] },
    );
}
```

- [ ] **Commit :**

```bash
git add src/scripts/migrate-to-db.ts
git commit -m "feat(migrate): upsertContent + updateContentRef"
```

---

## Task 7 : Orchestrateur principal + dry-run + résumé

**Files:**
- Modify: `src/scripts/migrate-to-db.ts`

- [ ] **Ajouter la fonction `getAllTSXFiles` et `main` :**

```ts
function getAllTSXFiles(dir: string): string[] {
    let results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getAllTSXFiles(fullPath));
        } else if (entry.isFile() && entry.name.match(/^(Cours|TP|Examen|Slide)\.tsx$/)) {
            results.push(fullPath);
        }
    }
    return results;
}

async function main() {
    let files: string[];

    if (FILE_FILTER) {
        files = [FILE_FILTER];
    } else {
        files = getAllTSXFiles("src/cours");
        if (MODULE_FILTER) {
            files = files.filter(f => f.includes(`/cours/${MODULE_FILTER}/`));
        }
    }

    if (files.length === 0) {
        console.warn("⚠ Aucun fichier trouvé.");
        return;
    }

    console.log(`${DRY_RUN ? "[DRY-RUN] " : ""}Migration de ${files.length} fichier(s)...\n`);

    let db: Db | null = null;
    if (!DRY_RUN) db = await connectToDB();

    const stats = { ok: 0, warn: 0, error: 0 };

    for (const filePath of files) {
        const rel = filePath.replace(/\\/g, "/").replace("src/cours/", "");
        let slugs: ReturnType<typeof deriveSlug>;
        try {
            slugs = deriveSlug(filePath);
        } catch {
            console.error(`✗  ${rel} — chemin non reconnu`);
            stats.error++; continue;
        }

        let blocks: Block[];
        let warnings: string[];
        try {
            ({ blocks, warnings } = parseFile(filePath));
        } catch (err) {
            console.error(`✗  ${rel} — ${(err as Error).message}`);
            stats.error++; continue;
        }

        if (DRY_RUN) {
            const warnStr = warnings.length ? `  ⚠ ${warnings.join(", ")}` : "";
            console.log(`✓  ${rel}  →  ${blocks.length} blocs (dry-run)${warnStr}`);
            stats.ok++;
            continue;
        }

        try {
            const contentId = await upsertContent(db!, slugs, blocks);
            await updateContentRef(db!, slugs, contentId);
            const warnStr = warnings.length ? `  ⚠ ${warnings.join(", ")}` : "";
            console.log(`✓  ${rel}  →  ${blocks.length} blocs${warnStr}`);
            if (warnings.length) stats.warn++;
            else stats.ok++;
        } catch (err) {
            console.error(`✗  ${rel} — DB: ${(err as Error).message}`);
            stats.error++;
        }
    }

    console.log(`\nRésultat : ${stats.ok} ok — ${stats.warn} avertissements — ${stats.error} erreurs`);
    process.exit(stats.error > 0 ? 1 : 0);
}
```

- [ ] **Lancer en dry-run sur un module :**

```bash
bun run migrate:db --dry-run --module=javascript
```

Attendu : liste de fichiers avec nombre de blocs, 0 erreurs.

- [ ] **Lancer en dry-run complet :**

```bash
bun run migrate:db --dry-run
```

Attendu : tous les fichiers listés, résumé final.

- [ ] **Commit :**

```bash
git add src/scripts/migrate-to-db.ts
git commit -m "feat(migrate): orchestrateur main — dry-run + résumé CLI"
```

---

## Task 8 : Migration réelle + vérification

**Files:** aucun nouveau fichier

- [ ] **Lancer la migration sur un seul fichier pour tester l'écriture DB :**

```bash
bun run migrate:db --file=src/cours/javascript/1-le-dom/Cours.tsx
```

Attendu :
```
✓  javascript/1-le-dom/Cours.tsx  →  N blocs
Résultat : 1 ok — 0 avertissements — 0 erreurs
```

- [ ] **Vérifier dans MongoDB que le document existe :**

```bash
bun -e "
const { connectToDB } = require('./src/lib/mongodb');
connectToDB().then(db =>
  db.collection('course_content')
    .findOne({ moduleSlug: 'javascript', sectionSlug: '1-le-dom', contentType: 'cours' })
    .then(d => console.log(JSON.stringify({ blockCount: d?.blocks?.length, version: d?.version }, null, 2)))
);
"
```

Attendu : `{ "blockCount": N, "version": 1 }`.

- [ ] **Vérifier que le ContentRef a basculé en `source: "db"` :**

```bash
bun -e "
const { connectToDB } = require('./src/lib/mongodb');
connectToDB().then(db =>
  db.collection('modules')
    .findOne({ path: 'javascript' })
    .then(m => {
      const s = m?.sections?.find(s => s.path === '1-le-dom');
      console.log(JSON.stringify(s?.contents, null, 2));
    })
);
"
```

Attendu : `[{ "type": "cours", "source": "db", "contentId": "..." }, ...]`.

- [ ] **Lancer la migration complète :**

```bash
bun run migrate:db
```

Attendu : résumé sans erreurs (ou avec avertissements sur les composants inconnus attendus).

- [ ] **Commit final :**

```bash
git add -A
git commit -m "feat(migrate): migration .tsx → MongoDB complète"
```
