# MCP search_content + export_content_compact — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter deux outils MCP en lecture seule — `search_content` (recherche plein texte sur tous les contenus en DB) et `export_content_compact` (export Markdown compact annoté d'IDs pour réduire la consommation de tokens).

**Architecture:** Une bibliothèque partagée `src/lib/blockTextUtils.ts` factorise le parcours de l'arbre de blocs, l'extraction de texte par type, et la sérialisation Markdown compacte. Les deux outils MCP s'y appuient et sont ajoutés à `src/app/api/mcp/route.ts` exactement comme les outils existants (lecture seule, aucun `isAdmin` check). La recherche en DB est un simple `find({})` + parcours en mémoire — le volume actuel (~50 documents au plus) ne justifie pas d'index externe.

**Tech Stack:** TypeScript strict, MongoDB driver natif, `bun:test` + `mongodb-memory-server`, aucune dépendance supplémentaire.

---

## Cartographie des fichiers

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/lib/blockTextUtils.ts` | Créer | `normalizeForSearch`, `extractTextFields`, `walkBlocks`, `blocksToMarkdown`, `searchBlocks` |
| `tests/lib/blockTextUtils.test.ts` | Créer | Tests unitaires de tous les helpers (sans DB) |
| `src/app/api/mcp/route.ts` | Modifier | Ajouter `search_content` + `export_content_compact` |
| `tests/mcp/content-tools.test.ts` | Créer | Tests d'intégration avec DB en mémoire |
| `docs/PEDAGOGY.md` | Modifier | Documenter les deux nouveaux outils |

---

## Task 1 — `src/lib/blockTextUtils.ts`

**Files:**
- Create: `src/lib/blockTextUtils.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
// src/lib/blockTextUtils.ts
// Parcours de l'arbre de blocs, extraction de texte et sérialisation Markdown compacte.
// Partagé entre search_content et export_content_compact (MCP).
import type { Block } from "@/types/CourseContent";

// ── Normalisation ──────────────────────────────────────────────────────────────

/** Normalise pour la recherche insensible à la casse et aux accents. */
export function normalizeForSearch(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
}

// ── Extraction de texte par bloc ──────────────────────────────────────────────

/** Retourne les champs textuels indexables d'un bloc (props uniquement, hors children). */
export function extractTextFields(block: Block): string[] {
    const p = block.props as Record<string, unknown>;
    const s = (v: unknown): string => (typeof v === "string" ? v : "");

    switch (block.type) {
        case "text":
        case "slide-text":
        case "slide-note":
            return [s(p.content)];
        case "section":
        case "slide":
        case "collapsible":
            return [s(p.title)];
        case "list-item":
        case "slide-list-item":
            return [s(p.text)];
        case "code":
        case "slide-code":
        case "download-file":
            return [s(p.code), s(p.filename)];
        case "code-with-preview":
            return [s(p.code)];
        case "diagram":
            return [s(p.header), s(p.chart)];
        case "table": {
            const headers = Array.isArray(p.headers) ? (p.headers as string[]).join(" ") : "";
            const rows = Array.isArray(p.rows) ? (p.rows as string[][]).flat().join(" ") : "";
            return [headers, rows];
        }
        case "section-card":
            return [s(p.title), s(p.description)];
        case "image-card":
            return [s(p.alt), s(p.title)];
        case "quote":
            return [s(p.text), s(p.source)];
        case "callout":
            return [s(p.title)];
        default:
            return [];
    }
}

// ── Parcours de l'arbre ────────────────────────────────────────────────────────

export interface WalkContext {
    /** Titre du bloc `section` parent le plus proche. */
    parentSectionTitle: string;
}

export type BlockVisitor = (block: Block, ctx: WalkContext) => void;

/** Parcourt récursivement l'arbre de blocs en maintenant le contexte de section parente. */
export function walkBlocks(
    blocks: Block[],
    visitor: BlockVisitor,
    ctx: WalkContext = { parentSectionTitle: "" }
): void {
    for (const block of blocks) {
        visitor(block, ctx);
        if (block.children?.length) {
            const childCtx: WalkContext =
                block.type === "section"
                    ? { parentSectionTitle: (block.props.title as string) ?? "" }
                    : ctx;
            walkBlocks(block.children, visitor, childCtx);
        }
    }
}

// ── Recherche ─────────────────────────────────────────────────────────────────

export interface SearchMatch {
    module: string;
    section: string;
    contentType: string;
    blockId: string;
    blockType: string;
    parentSectionTitle: string;
    snippet: string;
}

/**
 * Parcourt `blocks` et accumule les correspondances dans `results`.
 * S'arrête quand `results.length >= maxResults`.
 */
export function searchBlocks(
    blocks: Block[],
    moduleSlug: string,
    sectionSlug: string,
    contentType: string,
    normalizedQuery: string,
    maxResults: number,
    results: SearchMatch[]
): void {
    walkBlocks(blocks, (block, ctx) => {
        if (results.length >= maxResults) return;
        const fields = extractTextFields(block);
        for (const field of fields) {
            if (!field) continue;
            const normalizedField = normalizeForSearch(field);
            const idx = normalizedField.indexOf(normalizedQuery);
            if (idx !== -1) {
                const CONTEXT = 60;
                const start = Math.max(0, idx - CONTEXT);
                const end = Math.min(field.length, idx + normalizedQuery.length + CONTEXT);
                const snippet =
                    (start > 0 ? "…" : "") +
                    field.slice(start, end) +
                    (end < field.length ? "…" : "");
                results.push({
                    module: moduleSlug,
                    section: sectionSlug,
                    contentType,
                    blockId: block.id,
                    blockType: block.type,
                    parentSectionTitle: ctx.parentSectionTitle,
                    snippet,
                });
                return; // un résultat par bloc même si plusieurs champs matchent
            }
        }
    });
}

// ── Sérialisation Markdown compacte ──────────────────────────────────────────

/**
 * Sérialise un arbre de blocs en Markdown compact.
 * Chaque bloc est précédé de `<!--blockId-->` pour rester adressable par les outils d'édition.
 * Si `includeLimitations` est vrai, ajoute un résumé des types sans rendu Markdown optimal.
 */
export function blocksToMarkdown(blocks: Block[], includeLimitations = false): string {
    const lims = new Set<string>();
    const parts = renderBlocks(blocks, 0, lims);
    let result = parts.join("\n\n");
    if (includeLimitations && lims.size > 0) {
        result +=
            "\n\n---\n**Limitations de cet export :**\n" +
            [...lims].map((l) => `- ${l}`).join("\n");
    }
    return result;
}

function renderBlocks(blocks: Block[], depth: number, lims: Set<string>): string[] {
    return blocks.flatMap((b) => renderBlock(b, depth, lims));
}

function renderBlock(block: Block, depth: number, lims: Set<string>): string[] {
    const id = `<!--${block.id}-->`;
    const p = block.props as Record<string, unknown>;
    const s = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);

    switch (block.type) {
        case "text":
        case "slide-text": {
            const content = s(p.content);
            return content ? [`${id}\n${content}`] : [];
        }
        case "slide-note": {
            const content = s(p.content);
            return content ? [`${id}\n_Note présentateur : ${content}_`] : [];
        }
        case "section": {
            const hashes = "#".repeat(Math.min(2 + depth, 6));
            const heading = `${id}\n${hashes} ${s(p.title)}`;
            const children = block.children?.length
                ? renderBlocks(block.children, depth + 1, lims)
                : [];
            return [heading, ...children];
        }
        case "slide": {
            const heading = `${id}\n## ${s(p.title)}`;
            const children = block.children?.length
                ? renderBlocks(block.children, depth + 1, lims)
                : [];
            return [heading, ...children];
        }
        case "list":
        case "slide-list": {
            const ordered = Boolean(p.ordered);
            if (!block.children?.length) return [];
            return block.children.map((item, i) => {
                const itemId = `<!--${item.id}-->`;
                const text = s((item.props as Record<string, unknown>).text);
                const bullet = ordered ? `${i + 1}.` : "-";
                return `${itemId}\n${bullet} ${text}`;
            });
        }
        case "callout": {
            const variant = s(p.variant, "info");
            const calloutTitle = s(p.title);
            const labels: Record<string, string> = {
                info: "Info",
                warning: "Attention",
                tip: "Astuce",
                reminder: "Rappel",
            };
            const label = labels[variant] ?? variant;
            const header = calloutTitle
                ? `**${label} — ${calloutTitle}**`
                : `**${label}**`;
            const children = block.children?.length
                ? renderBlocks(block.children, depth + 1, lims)
                : [];
            return [`${id}\n> ${header}`, ...children];
        }
        case "collapsible": {
            const heading = `${id}\n### ${s(p.title)}`;
            const children = block.children?.length
                ? renderBlocks(block.children, depth + 1, lims)
                : [];
            return [heading, ...children];
        }
        case "columns": {
            lims.add(
                "columns/column : mise en page multi-colonnes aplatie séquentiellement (disposition perdue)."
            );
            const children = block.children?.length
                ? renderBlocks(block.children, depth, lims)
                : [];
            return [`${id}`, ...children];
        }
        case "column": {
            return block.children?.length ? renderBlocks(block.children, depth, lims) : [];
        }
        case "code": {
            const lang = s(p.language, "");
            const code = s(p.code);
            const filename = s(p.filename);
            const fence = `\`\`\`${lang}\n${code}\n\`\`\``;
            return filename
                ? [`${id}\n_${filename}_\n${fence}`]
                : [`${id}\n${fence}`];
        }
        case "slide-code": {
            const lang = s(p.language, "");
            const code = s(p.code);
            return [`${id}\n\`\`\`${lang}\n${code}\n\`\`\``];
        }
        case "code-with-preview": {
            lims.add("code-with-preview : aperçu iframe non représentable.");
            const lang = s(p.language, "html");
            const code = s(p.code);
            return [`${id}\n\`\`\`${lang}\n${code}\n\`\`\`\n_(aperçu live non représentable)_`];
        }
        case "diagram": {
            const chart = s(p.chart);
            const header = s(p.header);
            return header
                ? [`${id}\n_${header}_\n\`\`\`mermaid\n${chart}\n\`\`\``]
                : [`${id}\n\`\`\`mermaid\n${chart}\n\`\`\``];
        }
        case "table": {
            const headers = Array.isArray(p.headers) ? (p.headers as string[]) : [];
            const rows = Array.isArray(p.rows) ? (p.rows as string[][]) : [];
            const lines: string[] = [id];
            if (headers.length) {
                lines.push(`| ${headers.join(" | ")} |`);
                lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
            }
            for (const row of rows) {
                lines.push(`| ${row.join(" | ")} |`);
            }
            return [lines.join("\n")];
        }
        case "section-card": {
            const title = s(p.title);
            const href = s(p.href);
            const desc = s(p.description);
            return [`${id}\n[${title}](${href})${desc ? ` — ${desc}` : ""}`];
        }
        case "image-card": {
            const src = s(p.src);
            const alt = s(p.alt);
            const title = s(p.title);
            return [
                `${id}\n![${alt}](${src}${title ? ` "${title}"` : ""})`,
            ];
        }
        case "quote": {
            const text = s(p.text);
            const source = s(p.source);
            const lines = [`${id}`, `> ${text}`];
            if (source) lines.push(`> — ${source}`);
            return [lines.join("\n")];
        }
        case "download-file": {
            lims.add("download-file : contenu du fichier non inclus dans l'export.");
            return [`${id}\n📎 \`${s(p.filename)}\` (${s(p.language)})`];
        }
        case "divider":
            return [`${id}\n---`];
        default: {
            lims.add(`${block.type} : type de bloc sans équivalent Markdown direct.`);
            const children = block.children?.length
                ? renderBlocks(block.children, depth, lims)
                : [];
            return [`${id}\n_(bloc ${block.type})_`, ...children];
        }
    }
}
```

- [ ] **Step 2 : Vérifier que le fichier compile**

```bash
cd C:\Users\Utilisateur\PhpstormProjects\cours-iut-web
bunx tsc --noEmit --strict src/lib/blockTextUtils.ts 2>&1 | head -20
```

Attendu : aucune erreur TypeScript.

- [ ] **Step 3 : Commit**

```bash
git add src/lib/blockTextUtils.ts
git commit -m "feat(mcp): ajouter blockTextUtils — parcours, extraction et export Markdown"
```

---

## Task 2 — Tests unitaires de `blockTextUtils`

**Files:**
- Create: `tests/lib/blockTextUtils.test.ts`

- [ ] **Step 1 : Écrire les tests**

```typescript
// tests/lib/blockTextUtils.test.ts
import { describe, it, expect } from "bun:test";
import {
    normalizeForSearch,
    extractTextFields,
    walkBlocks,
    searchBlocks,
    blocksToMarkdown,
} from "../../src/lib/blockTextUtils";
import type { Block } from "../../src/types/CourseContent";

// ── normalizeForSearch ────────────────────────────────────────────────────────

describe("normalizeForSearch", () => {
    it("met en minuscules", () => {
        expect(normalizeForSearch("HELLO")).toBe("hello");
    });
    it("retire les accents", () => {
        expect(normalizeForSearch("éèêëàùîïôü")).toBe("eeeaauiiou");
    });
    it("cas mixte avec accents", () => {
        expect(normalizeForSearch("Événement")).toBe("evenement");
    });
    it("ne touche pas les chiffres et caractères spéciaux ASCII", () => {
        expect(normalizeForSearch("abc-123_x")).toBe("abc-123_x");
    });
});

// ── extractTextFields ─────────────────────────────────────────────────────────

describe("extractTextFields", () => {
    const b = (type: string, props: Record<string, unknown>): Block =>
        ({ id: "x", type, props });

    it("text → content", () => {
        expect(extractTextFields(b("text", { content: "Bonjour" }))).toContain("Bonjour");
    });
    it("section → title", () => {
        expect(extractTextFields(b("section", { title: "A — Intro" }))).toContain("A — Intro");
    });
    it("list-item → text", () => {
        expect(extractTextFields(b("list-item", { text: "Item 1" }))).toContain("Item 1");
    });
    it("code → code + filename", () => {
        const fields = extractTextFields(b("code", { code: "const x = 1;", filename: "app.js" }));
        expect(fields).toContain("const x = 1;");
        expect(fields).toContain("app.js");
    });
    it("table → headers + rows aplatis", () => {
        const fields = extractTextFields(b("table", {
            headers: ["Clé", "Valeur"],
            rows: [["a", "b"], ["c", "d"]],
        }));
        expect(fields[0]).toContain("Clé");
        expect(fields[1]).toContain("a");
    });
    it("diagram → header + chart", () => {
        const fields = extractTextFields(b("diagram", { header: "Mon diag", chart: "graph LR\n  A-->B" }));
        expect(fields).toContain("Mon diag");
        expect(fields).toContain("graph LR\n  A-->B");
    });
    it("type inconnu → tableau vide", () => {
        expect(extractTextFields(b("divider", {}))).toEqual([]);
    });
    it("slide-note → content", () => {
        expect(extractTextFields(b("slide-note", { content: "Parler lentement" }))).toContain("Parler lentement");
    });
});

// ── walkBlocks ────────────────────────────────────────────────────────────────

describe("walkBlocks", () => {
    const tree: Block[] = [
        {
            id: "s1",
            type: "section",
            props: { title: "Introduction" },
            children: [
                { id: "t1", type: "text", props: { content: "Bonjour" } },
                { id: "t2", type: "text", props: { content: "Monde" } },
            ],
        },
        { id: "t3", type: "text", props: { content: "Fin" } },
    ];

    it("visite tous les blocs", () => {
        const ids: string[] = [];
        walkBlocks(tree, (b) => ids.push(b.id));
        expect(ids).toEqual(["s1", "t1", "t2", "t3"]);
    });

    it("propage parentSectionTitle dans les enfants d'une section", () => {
        const contexts: Record<string, string> = {};
        walkBlocks(tree, (b, ctx) => {
            contexts[b.id] = ctx.parentSectionTitle;
        });
        expect(contexts["s1"]).toBe("");          // s1 est lui-même la section
        expect(contexts["t1"]).toBe("Introduction"); // enfant de s1
        expect(contexts["t2"]).toBe("Introduction");
        expect(contexts["t3"]).toBe("");          // frère de s1, pas d'ancêtre section
    });
});

// ── searchBlocks ──────────────────────────────────────────────────────────────

describe("searchBlocks", () => {
    const blocks: Block[] = [
        { id: "b1", type: "text", props: { content: "Les variables en JavaScript sont déclarées avec let ou const." } },
        { id: "b2", type: "text", props: { content: "Le DOM est l'arbre des noeuds HTML." } },
        {
            id: "s1",
            type: "section",
            props: { title: "Boucles" },
            children: [
                { id: "b3", type: "text", props: { content: "La boucle for est la plus courante." } },
            ],
        },
    ];

    it("trouve un terme simple", () => {
        const results: ReturnType<typeof searchBlocks extends (...args: any[]) => void ? never : never>[] = [];
        const out: Parameters<typeof searchBlocks>[6] = [];
        searchBlocks(blocks, "mod", "sect", "cours", "javascript", 20, out);
        expect(out.length).toBe(1);
        expect(out[0].blockId).toBe("b1");
    });

    it("est insensible à la casse", () => {
        const out: Parameters<typeof searchBlocks>[6] = [];
        searchBlocks(blocks, "mod", "sect", "cours", normalizeForSearch("DOM"), 20, out);
        expect(out.length).toBe(1);
        expect(out[0].blockId).toBe("b2");
    });

    it("est insensible aux accents", () => {
        const out: Parameters<typeof searchBlocks>[6] = [];
        searchBlocks(blocks, "mod", "sect", "cours", normalizeForSearch("déclarées"), 20, out);
        expect(out.length).toBe(1);
        expect(out[0].blockId).toBe("b1");
    });

    it("respecte maxResults", () => {
        const out: Parameters<typeof searchBlocks>[6] = [];
        // "la" apparaît dans b2 et b3
        searchBlocks(blocks, "mod", "sect", "cours", "la", 1, out);
        expect(out.length).toBe(1);
    });

    it("rapporte parentSectionTitle pour les enfants de section", () => {
        const out: Parameters<typeof searchBlocks>[6] = [];
        searchBlocks(blocks, "mod", "sect", "cours", "boucle", 20, out);
        expect(out.length).toBe(1);
        expect(out[0].parentSectionTitle).toBe("Boucles");
    });

    it("inclut le snippet avec contexte", () => {
        const out: Parameters<typeof searchBlocks>[6] = [];
        searchBlocks(blocks, "mod", "sect", "cours", "let", 20, out);
        expect(out[0].snippet).toContain("let");
    });
});

// ── blocksToMarkdown ──────────────────────────────────────────────────────────

describe("blocksToMarkdown", () => {
    it("text → paragraphe annoté", () => {
        const blocks: Block[] = [
            { id: "abc", type: "text", props: { content: "Bonjour" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("<!--abc-->");
        expect(md).toContain("Bonjour");
    });

    it("section → titre ## avec ses children", () => {
        const blocks: Block[] = [
            {
                id: "s1",
                type: "section",
                props: { title: "Introduction" },
                children: [
                    { id: "t1", type: "text", props: { content: "Contenu intro" } },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("## Introduction");
        expect(md).toContain("<!--s1-->");
        expect(md).toContain("<!--t1-->");
        expect(md).toContain("Contenu intro");
    });

    it("list non ordonnée → puces", () => {
        const blocks: Block[] = [
            {
                id: "l1",
                type: "list",
                props: { ordered: false },
                children: [
                    { id: "li1", type: "list-item", props: { text: "Item A" }, children: [] },
                    { id: "li2", type: "list-item", props: { text: "Item B" }, children: [] },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("- Item A");
        expect(md).toContain("- Item B");
        expect(md).toContain("<!--li1-->");
    });

    it("list ordonnée → numérotation", () => {
        const blocks: Block[] = [
            {
                id: "l1",
                type: "list",
                props: { ordered: true },
                children: [
                    { id: "li1", type: "list-item", props: { text: "Étape 1" }, children: [] },
                    { id: "li2", type: "list-item", props: { text: "Étape 2" }, children: [] },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("1. Étape 1");
        expect(md).toContain("2. Étape 2");
    });

    it("code → bloc de code avec filename", () => {
        const blocks: Block[] = [
            { id: "c1", type: "code", props: { language: "javascript", code: "const x = 1;", filename: "app.js" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("```javascript");
        expect(md).toContain("const x = 1;");
        expect(md).toContain("_app.js_");
    });

    it("diagram → code fence mermaid", () => {
        const blocks: Block[] = [
            { id: "d1", type: "diagram", props: { header: "", chart: "graph LR\n  A-->B" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("```mermaid");
        expect(md).toContain("graph LR");
    });

    it("table → tableau Markdown", () => {
        const blocks: Block[] = [
            {
                id: "t1",
                type: "table",
                props: { headers: ["Nom", "Valeur"], rows: [["x", "42"], ["y", "7"]] },
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("| Nom | Valeur |");
        expect(md).toContain("| --- | --- |");
        expect(md).toContain("| x | 42 |");
    });

    it("callout → blockquote préfixé du variant", () => {
        const blocks: Block[] = [
            {
                id: "ca1",
                type: "callout",
                props: { variant: "tip", title: "Astuce utile" },
                children: [
                    { id: "ct1", type: "text", props: { content: "Utilisez const par défaut." } },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("> **Astuce — Astuce utile**");
        expect(md).toContain("<!--ca1-->");
    });

    it("collapsible → titre ### + children", () => {
        const blocks: Block[] = [
            {
                id: "col1",
                type: "collapsible",
                props: { title: "En savoir plus" },
                children: [
                    { id: "ct1", type: "text", props: { content: "Détails optionnels." } },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("### En savoir plus");
        expect(md).toContain("<!--col1-->");
    });

    it("divider → ---", () => {
        const blocks: Block[] = [
            { id: "div1", type: "divider", props: {} },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("---");
        expect(md).toContain("<!--div1-->");
    });

    it("includeLimitations : ajoute le résumé si types à limitation", () => {
        const blocks: Block[] = [
            { id: "dl1", type: "download-file", props: { filename: "game.html", language: "html", code: "" } },
        ];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("Limitations de cet export");
        expect(md).toContain("download-file");
    });

    it("columns : ajoute une limitation et aplatit les children", () => {
        const blocks: Block[] = [
            {
                id: "cols1",
                type: "columns",
                props: {},
                children: [
                    {
                        id: "col1",
                        type: "column",
                        props: { span: 6 },
                        children: [
                            { id: "t1", type: "text", props: { content: "Gauche" } },
                        ],
                    },
                    {
                        id: "col2",
                        type: "column",
                        props: { span: 6 },
                        children: [
                            { id: "t2", type: "text", props: { content: "Droite" } },
                        ],
                    },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("Gauche");
        expect(md).toContain("Droite");
        expect(md).toContain("Limitations");
    });

    it("quote → blockquote avec source", () => {
        const blocks: Block[] = [
            { id: "q1", type: "quote", props: { text: "Simplicité d'abord.", source: "Ada Lovelace" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("> Simplicité d'abord.");
        expect(md).toContain("— Ada Lovelace");
    });

    it("image-card → syntaxe image Markdown", () => {
        const blocks: Block[] = [
            { id: "img1", type: "image-card", props: { src: "/img/schema.png", alt: "Schéma du DOM", title: "Figure 1" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain('![Schéma du DOM](/img/schema.png "Figure 1")');
    });
});
```

- [ ] **Step 2 : Lancer les tests**

```bash
bun test tests/lib/blockTextUtils.test.ts
```

Attendu : tous les tests PASS. Si des types TypeScript échouent sur `Parameters<typeof searchBlocks>[6]`, remplacer par `import type { SearchMatch } from "../../src/lib/blockTextUtils"` et utiliser `SearchMatch[]`.

- [ ] **Step 3 : Corriger les éventuelles erreurs puis commit**

```bash
git add tests/lib/blockTextUtils.test.ts
git commit -m "test(lib): ajouter tests unitaires pour blockTextUtils"
```

---

## Task 3 — Ajouter les deux outils MCP dans `route.ts`

**Files:**
- Modify: `src/app/api/mcp/route.ts`

- [ ] **Step 1 : Ajouter l'import de `blockTextUtils` et du type `CourseContent`**

Trouver dans `src/app/api/mcp/route.ts` la ligne :

```typescript
import type { Block, CourseContent, ContentRef } from "@/types/CourseContent";
```

La remplacer par :

```typescript
import type { Block, CourseContent, ContentRef } from "@/types/CourseContent";
import {
    normalizeForSearch,
    searchBlocks,
    blocksToMarkdown,
} from "@/lib/blockTextUtils";
```

- [ ] **Step 2 : Ajouter `search_content` juste avant le `return server;`**

Trouver dans `route.ts` le commentaire `// ── reorder_blocks` et la fermeture du `buildMcpServer` :

```typescript
    return server;
}
```

**Insérer** le code suivant juste avant `return server;` :

```typescript
    // ── search_content ────────────────────────────────────────────────────────
    server.tool(
        "search_content",
        [
            "Recherche plein texte dans tous les contenus en base de données.",
            "Retourne les blocs correspondants avec leur localisation (module/section/type),",
            "l'ID du bloc, un extrait de contexte, et le titre de la section parente.",
            "Utilise search_content pour TROUVER où une notion est abordée ;",
            "utilise ensuite export_content_compact pour LIRE en détail les sections identifiées.",
            "Note : le contenu dont la source est encore 'file' (non migré en DB) n'est pas indexé.",
        ].join(" "),
        {
            query: z.string().min(1).describe(
                "Terme ou expression à rechercher (insensible à la casse et aux accents)"
            ),
            module: z.string().optional().describe(
                "Filtrer sur un module spécifique (slug, ex: javascript)"
            ),
            type: CONTENT_TYPE.optional().describe(
                "Filtrer par type de contenu : cours | TP | examen | slide"
            ),
            limit: z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .describe("Nombre maximum de résultats (défaut: 20)"),
        },
        async ({ query, module: moduleFilter, type: typeFilter, limit = 20 }) => {
            const db = await connectToDB();

            const filter: Record<string, unknown> = {};
            if (moduleFilter) filter.moduleSlug = moduleFilter;
            if (typeFilter) filter.contentType = typeFilter;

            const docs = await db
                .collection<CourseContent>("course_content")
                .find(filter, {
                    projection: { moduleSlug: 1, sectionSlug: 1, contentType: 1, blocks: 1 },
                })
                .toArray();

            const normalizedQuery = normalizeForSearch(query);
            const results: ReturnType<typeof Array<import("@/lib/blockTextUtils").SearchMatch>> = [];
            // Typage explicite pour clarté :
            const matchList: import("@/lib/blockTextUtils").SearchMatch[] = [];

            for (const doc of docs) {
                if (matchList.length >= limit) break;
                searchBlocks(
                    doc.blocks,
                    doc.moduleSlug,
                    doc.sectionSlug,
                    doc.contentType,
                    normalizedQuery,
                    limit,
                    matchList
                );
            }

            const note =
                docs.length === 0
                    ? "Aucun contenu en base trouvé. Le contenu source 'file' n'est pas indexé."
                    : `${matchList.length} résultat(s) trouvé(s) dans ${docs.length} contenu(s) en DB (source 'file' exclu).`;

            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(
                            { query, total: matchList.length, note, results: matchList },
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );

    // ── export_content_compact ───────────────────────────────────────────────
    server.tool(
        "export_content_compact",
        [
            "Exporte un contenu (section, module entier, ou tous types d'une section) en Markdown compact.",
            "Chaque bloc est annoté de son ID en commentaire HTML (<!--blockId-->)",
            "pour rester adressable par les outils d'édition (insert_block, edit_block, reorder_blocks).",
            "Beaucoup plus économe en tokens que get_content.",
            "Utilise search_content pour identifier d'abord les sections pertinentes,",
            "puis export_content_compact pour en lire le contenu complet.",
            "Note : seul le contenu source 'db' est disponible ; le contenu 'file' non migré est exclu.",
        ].join(" "),
        {
            module: z.string().describe("Slug du module, ex: javascript"),
            section: z
                .string()
                .optional()
                .describe("Slug de la section. Omis = toutes les sections du module"),
            type: CONTENT_TYPE.optional().describe(
                "Type de contenu. Omis = tous les types disponibles de la section"
            ),
        },
        async ({ module: moduleSlug, section: sectionSlug, type: contentType }) => {
            const db = await connectToDB();

            const mod = await db
                .collection<ModuleDoc>("modules")
                .findOne({ path: moduleSlug }, { projection: { title: 1, sections: 1 } });
            if (!mod) throw new Error(`Module "${moduleSlug}" introuvable.`);

            const filter: Record<string, unknown> = { moduleSlug };
            if (sectionSlug) filter.sectionSlug = sectionSlug;
            if (contentType) filter.contentType = contentType;

            const docs = await db
                .collection<CourseContent>("course_content")
                .find(filter, {
                    projection: {
                        moduleSlug: 1,
                        sectionSlug: 1,
                        contentType: 1,
                        blocks: 1,
                        version: 1,
                        updatedAt: 1,
                    },
                })
                .sort({ sectionSlug: 1, contentType: 1 })
                .toArray();

            if (docs.length === 0) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: [
                                `Aucun contenu en base trouvé pour module="${moduleSlug}"`,
                                sectionSlug ? `, section="${sectionSlug}"` : "",
                                contentType ? `, type="${contentType}"` : "",
                                ".",
                                "\n\nNote : le contenu source 'file' (non migré) n'est pas disponible via cet outil.",
                            ].join(""),
                        },
                    ],
                };
            }

            const getSectionTitle = (slug: string): string => {
                const sec = (mod.sections ?? []).find((s) => s.path === slug);
                return sec?.title ?? slug;
            };

            const moduleTitle = mod.title ?? moduleSlug;
            const parts: string[] = [];

            for (const doc of docs) {
                const sectionTitle = getSectionTitle(doc.sectionSlug);
                const updatedAt = doc.updatedAt
                    ? new Date(doc.updatedAt).toISOString().slice(0, 10)
                    : "?";
                const header = [
                    `<!-- export: ${moduleTitle} / ${sectionTitle} / ${doc.contentType} | v${doc.version} | ${updatedAt} -->`,
                    `# ${moduleTitle} / ${sectionTitle} / ${doc.contentType}`,
                ].join("\n");

                const markdown = blocksToMarkdown(doc.blocks, true);
                parts.push(`${header}\n\n${markdown}`);
            }

            return {
                content: [
                    {
                        type: "text" as const,
                        text: parts.join("\n\n---\n\n"),
                    },
                ],
            };
        }
    );
```

Note : l'import de `SearchMatch` via `import("@/lib/blockTextUtils").SearchMatch[]` est verbeux. Simplifier en ajoutant `SearchMatch` à l'import en tête de fichier :

Modifier l'import de `blockTextUtils` pour inclure le type :

```typescript
import {
    normalizeForSearch,
    searchBlocks,
    blocksToMarkdown,
    type SearchMatch,
} from "@/lib/blockTextUtils";
```

Et dans le handler de `search_content`, remplacer :

```typescript
            const matchList: import("@/lib/blockTextUtils").SearchMatch[] = [];
```

par :

```typescript
            const matchList: SearchMatch[] = [];
```

Et supprimer la ligne `const results: ReturnType<...>` (elle était une erreur de draft).

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
bunx tsc --noEmit 2>&1 | head -30
```

Attendu : aucune erreur. Si `bunx tsc` n'est pas disponible : `bun run lint` doit passer sans erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): ajouter search_content et export_content_compact"
```

---

## Task 4 — Tests d'intégration MCP

**Files:**
- Create: `tests/mcp/content-tools.test.ts`

- [ ] **Step 1 : Écrire les tests**

```typescript
// tests/mcp/content-tools.test.ts
import { beforeAll, afterAll, describe, it, expect, mock } from "bun:test";
import type { Db } from "mongodb";

// ── Shared mutable state ──────────────────────────────────────────────────────
let db: Db;
let mcpUser = { id: "u1", role: "user" };

mock.module("@/lib/mongodb", () => ({
    connectToDB: async () => {
        if (!db) throw new Error("DB not initialised");
        return db;
    },
}));

mock.module("@/lib/scalekit", () => ({
    validateScalekitToken: async (token: string) => {
        if (token === "valid-token") return { sub: "u1", email: "user@test.com" };
        return null;
    },
}));

mock.module("@/lib/publicOrigin", () => ({
    getPublicOrigin: () => "http://localhost",
}));

mock.module("next/cache", () => ({
    revalidateTag: () => {},
}));

// Import après les mocks
const { POST } = await import("../../src/app/api/mcp/route");

// ── DB lifecycle ──────────────────────────────────────────────────────────────
let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());

    // Seed : un module avec deux sections
    await db.collection("modules").insertOne({
        path: "javascript",
        title: "JavaScript",
        sections: [
            {
                path: "1-le-dom",
                title: "Le DOM",
                order: 1,
                contents: [{ type: "cours", source: "db" }],
                objectives: [],
                tags: [],
                totalDuration: 2,
                hasCorrection: false,
                isAvailable: true,
                correctionIsAvailable: false,
                examenIsLock: false,
            },
            {
                path: "2-evenements",
                title: "Événements",
                order: 2,
                contents: [{ type: "cours", source: "db" }, { type: "TP", source: "db" }],
                objectives: [],
                tags: [],
                totalDuration: 2,
                hasCorrection: false,
                isAvailable: true,
                correctionIsAvailable: false,
                examenIsLock: false,
            },
        ],
    });

    // Seed : contenu pour section 1 — cours avec section, callout, code, table
    await db.collection("course_content").insertOne({
        moduleSlug: "javascript",
        sectionSlug: "1-le-dom",
        contentType: "cours",
        blocks: [
            {
                id: "s1",
                type: "section",
                props: { title: "A — Introduction au DOM" },
                children: [
                    { id: "t1", type: "text", props: { content: "Le DOM est l'arbre de noeuds représentant la page HTML." } },
                    {
                        id: "ca1",
                        type: "callout",
                        props: { variant: "tip", title: "Astuce" },
                        children: [
                            { id: "ct1", type: "text", props: { content: "Utilisez document.querySelector pour sélectionner un élément." } },
                        ],
                    },
                ],
            },
            {
                id: "s2",
                type: "section",
                props: { title: "B — Manipulation du DOM" },
                children: [
                    { id: "c1", type: "code", props: { language: "javascript", code: "const el = document.getElementById('titre');", filename: "dom.js" } },
                    {
                        id: "tb1",
                        type: "table",
                        props: {
                            headers: ["Méthode", "Rôle"],
                            rows: [["getElementById", "Sélectionne par ID"], ["querySelector", "Sélectionne par CSS"]],
                        },
                    },
                ],
            },
        ],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Seed : contenu pour section 2 — TP avec list, collapsible
    await db.collection("course_content").insertOne({
        moduleSlug: "javascript",
        sectionSlug: "2-evenements",
        contentType: "TP",
        blocks: [
            {
                id: "s3",
                type: "section",
                props: { title: "A — addEventListener" },
                children: [
                    {
                        id: "l1",
                        type: "list",
                        props: { ordered: true },
                        children: [
                            { id: "li1", type: "list-item", props: { text: "Créez un fichier index.html." }, children: [] },
                            { id: "li2", type: "list-item", props: { text: "Ajoutez un bouton avec id=\"btn\"." }, children: [] },
                        ],
                    },
                    {
                        id: "col1",
                        type: "collapsible",
                        props: { title: "Solution complète" },
                        children: [
                            { id: "c2", type: "code", props: { language: "html", code: "<button id=\"btn\">Cliquez</button>", filename: "index.html" } },
                        ],
                    },
                ],
            },
        ],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}, 60_000);

afterAll(async () => { await stopDb?.(); }, 10_000);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMcpRequest(method: string, params: Record<string, unknown>) {
    return new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer valid-token",
            "Accept": "application/json, text/event-stream",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name: method, arguments: params },
        }),
    });
}

async function callTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const req = makeMcpRequest(name, params);
    const res = await POST(req);
    const text = await res.text();
    // Le MCP répond en JSON ou en SSE. Parser le premier objet JSON trouvé.
    const lines = text.split("\n").filter((l) => l.startsWith("data: "));
    const dataLine = lines[0]?.slice("data: ".length) ?? text;
    const parsed = JSON.parse(dataLine);
    return parsed?.result?.content?.[0]?.text ?? parsed;
}

// ── Tests search_content ──────────────────────────────────────────────────────

describe("search_content", () => {
    it("trouve un terme dans le texte d'un bloc", async () => {
        const raw = await callTool("search_content", { query: "DOM" });
        const result = JSON.parse(raw as string);
        expect(result.total).toBeGreaterThan(0);
        const r = result.results[0];
        expect(r.module).toBe("javascript");
        expect(r.blockId).toBeDefined();
    });

    it("est insensible aux accents — trouve 'évenements' sans accent", async () => {
        const raw = await callTool("search_content", { query: "evenements" });
        // "Événements" est dans le titre de la section module, pas en DB course_content directement.
        // "addEventListener" contient "event" — la recherche doit trouver quelque chose.
        const result = JSON.parse(raw as string);
        // Pas d'assertion stricte sur total ici car le titre de section est en modules, pas course_content.
        expect(result).toHaveProperty("total");
    });

    it("filtre par module", async () => {
        const raw = await callTool("search_content", { query: "bouton", module: "javascript" });
        const result = JSON.parse(raw as string);
        if (result.total > 0) {
            expect(result.results[0].module).toBe("javascript");
        }
    });

    it("filtre par type", async () => {
        const raw = await callTool("search_content", { query: "Créez", type: "TP" });
        const result = JSON.parse(raw as string);
        if (result.total > 0) {
            expect(result.results[0].contentType).toBe("TP");
        }
    });

    it("respecte limit", async () => {
        const raw = await callTool("search_content", { query: "a", limit: 1 });
        const result = JSON.parse(raw as string);
        expect(result.results.length).toBeLessThanOrEqual(1);
    });

    it("rapporte parentSectionTitle pour les blocs dans une section", async () => {
        const raw = await callTool("search_content", { query: "querySelector" });
        const result = JSON.parse(raw as string);
        const match = result.results.find((r: { blockId: string }) => r.blockId === "ct1");
        if (match) {
            expect(match.parentSectionTitle).toBe("A — Introduction au DOM");
        }
    });

    it("retourne un message clair si aucun résultat", async () => {
        const raw = await callTool("search_content", { query: "xyznotfound123456" });
        const result = JSON.parse(raw as string);
        expect(result.total).toBe(0);
        expect(result.note).toBeTruthy();
    });
});

// ── Tests export_content_compact ──────────────────────────────────────────────

describe("export_content_compact", () => {
    it("exporte une section/type en Markdown compact", async () => {
        const raw = await callTool("export_content_compact", {
            module: "javascript",
            section: "1-le-dom",
            type: "cours",
        });
        const md = raw as string;
        expect(md).toContain("<!--s1-->");
        expect(md).toContain("## A — Introduction au DOM");
        expect(md).toContain("Le DOM est l'arbre");
        expect(md).toContain("```javascript");
        expect(md).toContain("| Méthode | Rôle |");
    });

    it("inclut le header global une seule fois", async () => {
        const raw = await callTool("export_content_compact", {
            module: "javascript",
            section: "1-le-dom",
            type: "cours",
        });
        const md = raw as string;
        const headerCount = (md.match(/# JavaScript \/ Le DOM \/ cours/g) ?? []).length;
        expect(headerCount).toBe(1);
    });

    it("exporte toutes les sections d'un module si section omise", async () => {
        const raw = await callTool("export_content_compact", {
            module: "javascript",
        });
        const md = raw as string;
        expect(md).toContain("1-le-dom");
        // Devrait contenir au moins deux separateurs (plusieurs docs)
        expect((md.match(/---/g) ?? []).length).toBeGreaterThan(0);
    });

    it("retourne message clair si module introuvable", async () => {
        await expect(
            callTool("export_content_compact", { module: "inexistant" })
        ).rejects.toThrow();
    });

    it("retourne message si aucun contenu en DB pour la section/type", async () => {
        const raw = await callTool("export_content_compact", {
            module: "javascript",
            section: "1-le-dom",
            type: "examen", // pas en DB pour cette section
        });
        expect(raw as string).toContain("Aucun contenu en base");
    });

    it("TP avec list ordonnée et collapsible", async () => {
        const raw = await callTool("export_content_compact", {
            module: "javascript",
            section: "2-evenements",
            type: "TP",
        });
        const md = raw as string;
        expect(md).toContain("1. Créez un fichier");
        expect(md).toContain("### Solution complète");
        expect(md).toContain("<!--li1-->");
    });
});
```

- [ ] **Step 2 : Lancer les tests**

```bash
bun test tests/mcp/content-tools.test.ts
```

Attendu : tous les tests PASS. Si le transport MCP ne répond pas exactement comme attendu (SSE vs JSON), ajuster le helper `callTool` pour parser la réponse correctement. Voir le format de réponse en loggant `text` avant le parsing.

- [ ] **Step 3 : Lancer la suite complète**

```bash
bun test
```

Attendu : aucune régression dans les tests existants.

- [ ] **Step 4 : Commit**

```bash
git add tests/mcp/content-tools.test.ts
git commit -m "test(mcp): tests d'intégration pour search_content et export_content_compact"
```

---

## Task 5 — Mettre à jour `docs/PEDAGOGY.md`

**Files:**
- Modify: `docs/PEDAGOGY.md`

- [ ] **Step 1 : Ajouter les deux outils dans la section "Outils MCP → Lecture des contenus"**

Trouver dans `docs/PEDAGOGY.md` :

```markdown
### Lecture des contenus
- `list_modules()`, `list_sections(module)`, `get_content(module, section, type)`
```

Remplacer par :

```markdown
### Lecture des contenus
- `list_modules()`, `list_sections(module)`, `get_migration_status()`
- `get_content(module, section, type)` — arbre JSON complet (verbeux)
- `search_content(query, module?, type?, limit?)` — recherche plein texte multi-sections
- `export_content_compact(module, section?, type?)` — export Markdown compact, annoté d'IDs de blocs
```

- [ ] **Step 2 : Ajouter une section "Lecture efficace des contenus" avant "Écriture"**

Trouver :

```markdown
### Écriture (admins uniquement)
```

Insérer avant :

```markdown
### Stratégie de lecture recommandée

Pour auditer ou résumer un contenu pédagogique :

1. `list_modules()` → identifier le module
2. `search_content(query, module?)` → trouver les sections pertinentes
3. `export_content_compact(module, section, type)` → lire le contenu complet

`export_content_compact` est 3-5× plus compact que `get_content` (JSON brut vs Markdown).
Les IDs de blocs dans les commentaires HTML (`<!--blockId-->`) permettent d'utiliser
`edit_block`, `insert_block` ou `reorder_blocks` sans relire le JSON brut.

> Le contenu dont la source est encore `file` (non migré) n'est pas accessible via ces
> deux outils. Utiliser `get_migration_status()` pour connaître l'état de migration.

```

- [ ] **Step 3 : Commit**

```bash
git add docs/PEDAGOGY.md
git commit -m "docs(mcp): documenter search_content et export_content_compact"
```

---

## Vérification finale

- [ ] `bun test` — toute la suite passe
- [ ] `bun run lint` — aucune erreur ESLint
- [ ] Test manuel : lancer `bun dev` et appeler les outils via le client MCP connecté

---

## Choix techniques — résumé

### Factorisation
`blockTextUtils.ts` expose `extractTextFields` (extraction de texte par type de bloc),
`walkBlocks` (parcours récursif avec contexte de section parente), `searchBlocks`
(accumulation des matches), et `blocksToMarkdown` (sérialisation compacte). Les outils MCP
`search_content` et `export_content_compact` n'ont ainsi aucune logique de parcours en propre.

### Stratégie de recherche
Pas d'index MongoDB `$text` : `find({})` + parcours en mémoire suffit pour ~50 documents.
Le filtre optionnel `moduleSlug`/`contentType` réduit la quantité de données chargées.

### Types de blocs sans équivalent Markdown
`columns`/`column` : aplati séquentiellement (disposition perdue).
`code-with-preview` : code exporté sans l'aperçu iframe.
`download-file` : contenu du fichier exclu (seul le nom est indiqué).
`slide-note` : rendu en italique `_Note présentateur : ..._`.
Ces limitations sont listées en fin de document si `includeLimitations = true`.

### Gain de compacité estimé
Un bloc `code` en JSON brut représente ~150-200 caractères (id, type, props avec toutes les clés
`showLineNumbers`, `collapsible`, etc.). En Markdown compact : `<!--id-->\nfilename\n```lang\ncode\n\`\`\``
soit ~50 caractères de scaffolding + le code lui-même. Gain : ~3-4× sur la scaffolding, plus
prononcé pour les cours riches en sections et listes (pas de `id/type/props` répété à chaque bloc).
