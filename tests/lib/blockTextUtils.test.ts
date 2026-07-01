// tests/lib/blockTextUtils.test.ts
import { describe, it, expect } from "bun:test";
import type { Block } from "@/types/CourseContent";
import {
    normalizeForSearch,
    extractTextFields,
    walkBlocks,
    searchBlocks,
    blocksToMarkdown,
    type SearchMatch,
} from "@/lib/blockTextUtils";

// Helper concis pour créer un bloc de test minimal
function b(type: string, props: Record<string, unknown> = {}): Block {
    return { id: `test-${type}`, type, props };
}

// ---------------------------------------------------------------------------
// normalizeForSearch
// ---------------------------------------------------------------------------

describe("normalizeForSearch", () => {
    it("met en minuscules", () => {
        expect(normalizeForSearch("HELLO")).toBe("hello");
    });

    it("retire les accents", () => {
        expect(normalizeForSearch("éèêëàùîïôü")).toBe("eeeeauiiou");
    });

    it("cas mixte avec accents", () => {
        expect(normalizeForSearch("Événement")).toBe("evenement");
    });

    it("ne touche pas les chiffres et caractères spéciaux ASCII", () => {
        expect(normalizeForSearch("abc123!@#")).toBe("abc123!@#");
    });
});

// ---------------------------------------------------------------------------
// extractTextFields
// ---------------------------------------------------------------------------

describe("extractTextFields", () => {
    it("text → [props.content]", () => {
        const b: Block = { id: "b1", type: "text", props: { content: "hello" } };
        expect(extractTextFields(b)).toEqual(["hello"]);
    });

    it("section → [props.title]", () => {
        const b: Block = { id: "b2", type: "section", props: { title: "Mon titre" } };
        expect(extractTextFields(b)).toEqual(["Mon titre"]);
    });

    it("list-item → [props.text]", () => {
        const b: Block = { id: "b3", type: "list-item", props: { text: "item texte" } };
        expect(extractTextFields(b)).toEqual(["item texte"]);
    });

    it("code → [props.code, props.filename] quand les deux présents", () => {
        const b: Block = { id: "b4", type: "code", props: { code: "const x = 1;", filename: "index.js" } };
        expect(extractTextFields(b)).toEqual(["const x = 1;", "index.js"]);
    });

    it("code → [props.code] quand filename absent", () => {
        const b: Block = { id: "b5", type: "code", props: { code: "const x = 1;" } };
        expect(extractTextFields(b)).toEqual(["const x = 1;"]);
    });

    it("table → headers joints + rows aplaties jointes", () => {
        const b: Block = {
            id: "b6",
            type: "table",
            props: {
                headers: ["Col A", "Col B"],
                rows: [["r1a", "r1b"], ["r2a", "r2b"]],
            },
        };
        const fields = extractTextFields(b);
        expect(fields).toHaveLength(2);
        expect(fields[0]).toBe("Col A Col B");
        expect(fields[1]).toBe("r1a r1b r2a r2b");
    });

    it("diagram → [props.header, props.chart]", () => {
        const b: Block = {
            id: "b7",
            type: "diagram",
            props: { header: "Mon diagramme", chart: "graph TD\nA --> B" },
        };
        expect(extractTextFields(b)).toEqual(["Mon diagramme", "graph TD\nA --> B"]);
    });

    it("slide-note → [props.content]", () => {
        const b: Block = { id: "b8", type: "slide-note", props: { content: "Note présentateur" } };
        expect(extractTextFields(b)).toEqual(["Note présentateur"]);
    });

    it("type inconnu (divider) → []", () => {
        const b: Block = { id: "b9", type: "divider", props: {} };
        expect(extractTextFields(b)).toEqual([]);
    });

    it("callout → [props.title]", () => {
        const blk: Block = { id: "b10", type: "callout", props: { title: "Attention !", variant: "warning" } };
        expect(extractTextFields(blk)).toEqual(["Attention !"]);
    });

    it("slide-text → content", () => {
        const fields = extractTextFields(b("slide-text", { content: "Contenu slide" }));
        expect(fields).toContain("Contenu slide");
    });
    it("slide-list-item → text", () => {
        expect(extractTextFields(b("slide-list-item", { text: "Item slide" }))).toContain("Item slide");
    });
    it("code-with-preview → code uniquement", () => {
        const fields = extractTextFields(b("code-with-preview", { code: "<div>test</div>", language: "html" }));
        expect(fields).toContain("<div>test</div>");
    });
    it("section-card → title + description", () => {
        const fields = extractTextFields(b("section-card", { title: "Voir le cours", href: "/js", description: "Introduction" }));
        expect(fields).toContain("Voir le cours");
        expect(fields).toContain("Introduction");
    });
    it("image-card → alt + title", () => {
        const fields = extractTextFields(b("image-card", { src: "/img.png", alt: "Schéma DOM", title: "Fig 1" }));
        expect(fields).toContain("Schéma DOM");
        expect(fields).toContain("Fig 1");
    });
    it("quote → text + source", () => {
        const fields = extractTextFields(b("quote", { text: "La simplicité.", source: "Voltaire" }));
        expect(fields).toContain("La simplicité.");
        expect(fields).toContain("Voltaire");
    });
});

// ---------------------------------------------------------------------------
// walkBlocks
// ---------------------------------------------------------------------------

describe("walkBlocks", () => {
    it("visite tous les blocs (DFS, id dans l'ordre)", () => {
        const blocks: Block[] = [
            { id: "a", type: "text", props: { content: "A" } },
            {
                id: "sec", type: "section", props: { title: "S" }, children: [
                    { id: "b", type: "text", props: { content: "B" } },
                    { id: "c", type: "text", props: { content: "C" } },
                ],
            },
            { id: "d", type: "divider", props: {} },
        ];

        const visited: string[] = [];
        walkBlocks(blocks, (block) => { visited.push(block.id); });
        expect(visited).toEqual(["a", "sec", "b", "c", "d"]);
    });

    it("propage parentSectionTitle dans les enfants d'une section", () => {
        const blocks: Block[] = [
            {
                id: "sec", type: "section", props: { title: "Introduction" }, children: [
                    { id: "child1", type: "text", props: { content: "texte" } },
                ],
            },
        ];

        const contexts: Record<string, string> = {};
        walkBlocks(blocks, (block, ctx) => { contexts[block.id] = ctx.parentSectionTitle; });
        expect(contexts["sec"]).toBe("");
        expect(contexts["child1"]).toBe("Introduction");
    });

    it("les blocs frères d'une section n'héritent pas de son titre", () => {
        const blocks: Block[] = [
            {
                id: "sec", type: "section", props: { title: "Intro" }, children: [
                    { id: "child", type: "text", props: { content: "enfant" } },
                ],
            },
            { id: "sibling", type: "text", props: { content: "frère" } },
        ];

        const contexts: Record<string, string> = {};
        walkBlocks(blocks, (block, ctx) => { contexts[block.id] = ctx.parentSectionTitle; });
        expect(contexts["sibling"]).toBe("");
    });

    it("les enfants d'un collapsible héritent du parentSectionTitle courant, pas du titre du collapsible", () => {
        const blocks: Block[] = [
            {
                id: "sec", type: "section", props: { title: "Section A" }, children: [
                    {
                        id: "coll", type: "collapsible", props: { title: "Détails" }, children: [
                            { id: "inner", type: "text", props: { content: "contenu" } },
                        ],
                    },
                ],
            },
        ];

        const contexts: Record<string, string> = {};
        walkBlocks(blocks, (block, ctx) => { contexts[block.id] = ctx.parentSectionTitle; });
        // le collapsible lui-même est un enfant de section → parentSectionTitle = "Section A"
        expect(contexts["coll"]).toBe("Section A");
        // son enfant hérite du même ctx (collapsible ne crée pas un nouveau ctx)
        expect(contexts["inner"]).toBe("Section A");
    });

    it("retourne false et s'arrête quand le visiteur retourne false", () => {
        const blocks: Block[] = [
            { id: "a", type: "text", props: {} },
            { id: "b", type: "text", props: {} },
            { id: "c", type: "text", props: {} },
        ];
        const visited: string[] = [];
        const result = walkBlocks(blocks, (block) => {
            visited.push(block.id);
            if (block.id === "b") return false;
        });
        expect(result).toBe(false);
        expect(visited).toEqual(["a", "b"]);
    });
});

// ---------------------------------------------------------------------------
// searchBlocks
// ---------------------------------------------------------------------------

describe("searchBlocks", () => {
    const mkBlocks = (): Block[] => [
        { id: "t1", type: "text", props: { content: "Le DOM est un arbre d'objets" } },
        { id: "t2", type: "text", props: { content: "Les variables déclarées avec var" } },
        {
            id: "sec1", type: "section", props: { title: "Introduction au JavaScript" }, children: [
                { id: "t3", type: "text", props: { content: "JavaScript est un langage de script" } },
            ],
        },
        { id: "t4", type: "text", props: { content: "Autre contenu sans rapport" } },
    ];

    it("trouve un terme simple", () => {
        const results: SearchMatch[] = [];
        searchBlocks(mkBlocks(), "mod", "sec", "cours", normalizeForSearch("arbre"), 10, results);
        expect(results.length).toBe(1);
        expect(results[0].blockId).toBe("t1");
    });

    it("insensible à la casse (DOM trouve 'dom')", () => {
        const blocks: Block[] = [
            { id: "t1", type: "text", props: { content: "Le DOM est fondamental" } },
        ];
        const results: SearchMatch[] = [];
        searchBlocks(blocks, "mod", "sec", "cours", normalizeForSearch("dom"), 10, results);
        expect(results.length).toBe(1);
    });

    it("insensible aux accents ('déclarées' trouve avec 'declarees')", () => {
        const results: SearchMatch[] = [];
        searchBlocks(mkBlocks(), "mod", "sec", "cours", normalizeForSearch("declarees"), 10, results);
        expect(results.length).toBe(1);
        expect(results[0].blockId).toBe("t2");
    });

    it("respecte maxResults", () => {
        const blocks: Block[] = [
            { id: "a", type: "text", props: { content: "mot" } },
            { id: "b", type: "text", props: { content: "un mot ici" } },
            { id: "c", type: "text", props: { content: "encore mot" } },
        ];
        const results: SearchMatch[] = [];
        searchBlocks(blocks, "mod", "sec", "cours", normalizeForSearch("mot"), 2, results);
        expect(results.length).toBe(2);
    });

    it("rapporte parentSectionTitle pour les blocs dans une section", () => {
        const results: SearchMatch[] = [];
        // "langage" n'apparaît que dans t3, pas dans le titre de la section
        searchBlocks(mkBlocks(), "mod", "sec", "cours", normalizeForSearch("langage"), 10, results);
        expect(results.length).toBe(1);
        expect(results[0].blockId).toBe("t3");
        expect(results[0].parentSectionTitle).toBe("Introduction au JavaScript");
    });

    it("inclut un snippet avec contexte contenant le terme cherché", () => {
        const results: SearchMatch[] = [];
        searchBlocks(mkBlocks(), "mod", "sec", "cours", normalizeForSearch("dom"), 10, results);
        expect(results[0].snippet.toLowerCase()).toContain("dom");
    });

    it("ne matche pas quand le terme est absent", () => {
        const results: SearchMatch[] = [];
        searchBlocks(mkBlocks(), "mod", "sec", "cours", normalizeForSearch("inexistant"), 10, results);
        expect(results.length).toBe(0);
    });

    it("un seul résultat par bloc même si plusieurs champs matchent", () => {
        const blocks: Block[] = [
            { id: "code1", type: "code", props: { code: "mot", filename: "fichier_mot.js" } },
        ];
        const results: SearchMatch[] = [];
        searchBlocks(blocks, "mod", "sec", "cours", normalizeForSearch("mot"), 10, results);
        expect(results.length).toBe(1);
        expect(results[0].blockId).toBe("code1");
    });
});

// ---------------------------------------------------------------------------
// blocksToMarkdown
// ---------------------------------------------------------------------------

describe("blocksToMarkdown", () => {
    it("text → paragraphe avec <!--id-->", () => {
        const blocks: Block[] = [
            { id: "t1", type: "text", props: { content: "Bonjour le monde" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("<!--t1-->");
        expect(md).toContain("Bonjour le monde");
    });

    it("section → titre ## avec enfants et <!--id-->", () => {
        const blocks: Block[] = [
            {
                id: "s1", type: "section", props: { title: "Mon titre" }, children: [
                    { id: "t1", type: "text", props: { content: "Contenu" } },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("<!--s1-->");
        expect(md).toContain("## Mon titre");
        expect(md).toContain("Contenu");
    });

    it("list non ordonnée → '- item' avec <!--itemId--> ; annotation du container présente", () => {
        const blocks: Block[] = [
            {
                id: "lst1", type: "list", props: { ordered: false }, children: [
                    { id: "li1", type: "list-item", props: { text: "item un" } },
                    { id: "li2", type: "list-item", props: { text: "item deux" } },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("<!--lst1-->");
        expect(md).toContain("<!--li1-->");
        expect(md).toContain("- item un");
        expect(md).toContain("<!--li2-->");
        expect(md).toContain("- item deux");
    });

    it("list ordonnée → '1. item', '2. item'", () => {
        const blocks: Block[] = [
            {
                id: "lst2", type: "list", props: { ordered: true }, children: [
                    { id: "li1", type: "list-item", props: { text: "premier" } },
                    { id: "li2", type: "list-item", props: { text: "deuxième" } },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("1. premier");
        expect(md).toContain("2. deuxième");
    });

    it("code avec filename → contient _filename_ et le bloc de code", () => {
        const blocks: Block[] = [
            {
                id: "c1", type: "code",
                props: { code: "const x = 1;", language: "js", filename: "main.js" },
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("_main.js_");
        expect(md).toContain("```js");
        expect(md).toContain("const x = 1;");
    });

    it("diagram → bloc ```mermaid", () => {
        const blocks: Block[] = [
            {
                id: "d1", type: "diagram",
                props: { header: "Flux", chart: "graph TD\nA --> B" },
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("```mermaid");
        expect(md).toContain("graph TD");
    });

    it("table → tableau Markdown avec en-têtes et séparateur ---", () => {
        const blocks: Block[] = [
            {
                id: "tbl1", type: "table",
                props: {
                    headers: ["Nom", "Âge"],
                    rows: [["Alice", "30"], ["Bob", "25"]],
                },
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("| Nom | Âge |");
        expect(md).toContain("| --- | --- |");
        expect(md).toContain("| Alice | 30 |");
        expect(md).toContain("| Bob | 25 |");
    });

    it("callout avec variant tip → '> **Astuce — Titre**'", () => {
        const blocks: Block[] = [
            { id: "ca1", type: "callout", props: { variant: "tip", title: "Mon conseil" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("> **Astuce — Mon conseil**");
    });

    it("collapsible → '### <title>' avec enfants", () => {
        const blocks: Block[] = [
            {
                id: "col1", type: "collapsible", props: { title: "Voir plus" }, children: [
                    { id: "t1", type: "text", props: { content: "Contenu caché" } },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("### Voir plus");
        expect(md).toContain("Contenu caché");
    });

    it("divider → ---", () => {
        const blocks: Block[] = [
            { id: "div1", type: "divider", props: {} },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("---");
    });

    it("includeLimitations=true avec download-file → section Limitations en fin", () => {
        const blocks: Block[] = [
            { id: "dl1", type: "download-file", props: { filename: "fichier.zip", language: "zip" } },
        ];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("**Limitations de cet export :**");
        expect(md).toContain("download-file");
    });

    it("columns avec includeLimitations=true → section Limitations mentionnant columns", () => {
        const blocks: Block[] = [
            {
                id: "cols1", type: "columns", props: {}, children: [
                    {
                        id: "col1", type: "column", props: { span: 6 }, children: [
                            { id: "t1", type: "text", props: { content: "texte" } },
                        ],
                    },
                ],
            },
        ];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("**Limitations de cet export :**");
        expect(md.toLowerCase()).toContain("colonne");
    });

    it("quote avec source → blockquote + source", () => {
        const blocks: Block[] = [
            { id: "q1", type: "quote", props: { text: "Cogito ergo sum", source: "Descartes" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("> Cogito ergo sum");
        expect(md).toContain("> — Descartes");
    });

    it("image-card → syntaxe ![alt](src \"title\")", () => {
        const blocks: Block[] = [
            {
                id: "img1", type: "image-card",
                props: { alt: "Un chaton", src: "/images/chat.jpg", title: "Mon chat" },
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain('![Un chaton](/images/chat.jpg "Mon chat")');
    });

    it("slide-note → _Note présentateur : ..._", () => {
        const blocks: Block[] = [
            { id: "sn1", type: "slide-note", props: { content: "Insister sur ce point" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("_Note présentateur : Insister sur ce point_");
    });

    it("section-card → [title](href) — description", () => {
        const blocks: Block[] = [
            {
                id: "sc1", type: "section-card",
                props: { title: "TP 1", href: "/module/tp1", description: "Premier TP" },
            },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("[TP 1](/module/tp1) — Premier TP");
    });

    it("code-with-preview avec includeLimitations=true → 'aperçu live non représentable' + Limitations", () => {
        const blocks: Block[] = [
            {
                id: "cwp1", type: "code-with-preview",
                props: { code: "<h1>Titre</h1>", language: "html" },
            },
        ];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("aperçu live non représentable");
        expect(md).toContain("**Limitations de cet export :**");
    });

    it("slide → titre ## avec children", () => {
        const blocks: Block[] = [{
            id: "sl1", type: "slide", props: { title: "Slide intro" },
            children: [{ id: "st1", type: "slide-text", props: { content: "Corps slide" } }],
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("<!--sl1-->");
        expect(md).toContain("## Slide intro");
        expect(md).toContain("<!--st1-->");
        expect(md).toContain("Corps slide");
    });
    it("slide-list ordonnée → items numérotés", () => {
        const blocks: Block[] = [{
            id: "sl1", type: "slide-list", props: { ordered: true },
            children: [
                { id: "sli1", type: "slide-list-item", props: { text: "Point A" }, children: [] },
                { id: "sli2", type: "slide-list-item", props: { text: "Point B" }, children: [] },
            ],
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("<!--sl1-->");
        expect(md).toContain("<!--sli1-->");
        expect(md).toContain("1. Point A");
        expect(md).toContain("2. Point B");
    });
    it("callout info, empty title → **Info**", () => {
        const blocks: Block[] = [{ id: "ca1", type: "callout", props: { variant: "info", title: "" }, children: [] }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("> **Info**");
    });
    it("callout warning, title 'Danger' → **Attention — Danger**", () => {
        const blocks: Block[] = [{ id: "ca1", type: "callout", props: { variant: "warning", title: "Danger" }, children: [] }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("> **Attention — Danger**");
    });
    it("callout reminder, empty title → **Rappel**", () => {
        const blocks: Block[] = [{ id: "ca1", type: "callout", props: { variant: "reminder", title: "" }, children: [] }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("> **Rappel**");
    });
    it("text bloc vide → omis (pas de <!--id-->)", () => {
        const blocks: Block[] = [
            { id: "empty", type: "text", props: { content: "" } },
            { id: "nonempty", type: "text", props: { content: "Visible" } },
        ];
        const md = blocksToMarkdown(blocks);
        expect(md).not.toContain("<!--empty-->");
        expect(md).toContain("<!--nonempty-->");
        expect(md).toContain("Visible");
    });
});
