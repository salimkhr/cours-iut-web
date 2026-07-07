// Placeholders for Task 3+ implementation
import { connectToDB as _connectToDB } from "@/lib/mongodb";
import { v4 as _uuidv4 } from "uuid";
import * as _babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as _cheerio from "cheerio";
import type { Element as DOMElement, AnyNode } from "domhandler";
import * as _fs from "fs";
import * as _path from "path";
import type { Block as _Block } from "@/types/CourseContent";
import type { Db, ObjectId } from "mongodb";

// @babel/traverse et @babel/generator ont un bug ESM connu en Bun
// reason: used in Task 5 for parseFile
const _trav = (_traverse as unknown as { default: typeof _traverse }).default ?? _traverse;
const _gen = (_generate as unknown as { default: typeof _generate }).default ?? _generate;

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const _DRY_RUN   = args.includes("--dry-run");
const _MODULE_FILTER = args.find(a => a.startsWith("--module="))?.split("=")[1];
const _FILE_FILTER   = args.find(a => a.startsWith("--file="))?.split("=")[1];

// ── Sérialiseur inline (JSX → markdown) ─────────────────────────────────────

type CheerioAPI = ReturnType<typeof _cheerio.load>;

interface DataNodeWithText {
    type: "text";
    data: string;
}

const HTML_ENTITIES: Record<string, string> = {
    "&apos;": "'", "&rsquo;": "'", "&lsquo;": "'",
    "&quot;": '"',  "&amp;": "&",
    "&lt;": "<",    "&gt;": ">",
    "&nbsp;": " ",
};

function decodeEntities(text: string): string {
    return text.replace(/&[a-zA-Z]+;/g, m => HTML_ENTITIES[m] ?? m);
}

export function serializeInline($: CheerioAPI, el: DOMElement): string {
    let result = "";
    const recurse = (node: AnyNode): void => {
        if (node.type === "text") {
            result += decodeEntities((node as DataNodeWithText).data ?? "");
        } else if (node.type === "tag") {
            const tag = (node as DOMElement).tagName;
            const $node = $(node);
            switch (tag) {
                case "strong": case "b":
                    result += "**"; $node.contents().each((_, c) => recurse(c as AnyNode)); result += "**"; break;
                case "em": case "i":
                    result += "_";  $node.contents().each((_, c) => recurse(c as AnyNode)); result += "_";  break;
                case "Code":
                    result += "`" + $node.text().trim() + "`"; break;
                case "a":
                    result += "["; $node.contents().each((_, c) => recurse(c as AnyNode));
                    result += "](" + ($node.attr("href") ?? "") + ")"; break;
                default:
                    $node.contents().each((_, c) => recurse(c as AnyNode)); break;
            }
        }
    };
    $(el).contents().each((_, c) => recurse(c as AnyNode));
    return result.replace(/\s+/g, " ").trim();
}

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

// ── Alias locaux pour les imports préfixés _  ──────────────────────────────
const cheerio = _cheerio;
type CheerioElement = DOMElement;
const uuidv4 = _uuidv4;
type Block = _Block;

// ── Éléments à ignorer complètement ────────────────────────────────────────
const IGNORED_TAGS = new Set([
    "SectionCard", "CourseLinks", "SlideTitle",
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

        case "SlideText":
            return { id: uuidv4(), type: "text", props: { content: serializeInline($, el) }, children: [] };

        case "SlideCode": {
            const language = ($el.attr("language") ?? "").replace(/[{}'"]/g, "");
            const highlightRaw = ($el.attr("highlight") ?? "").replace(/[{}'"`]/g, "").trim();
            const code = extractTemplateLiteral($, el);
            const props: Record<string, unknown> = { language, code };
            if (highlightRaw) props.highlight = highlightRaw;
            return { id: uuidv4(), type: "code", props, children: [] };
        }

        case "SlideList": {
            const children = $el.children("SlideListItem").toArray()
                .map(li => convertElement($, li as CheerioElement))
                .filter(Boolean) as Block[];
            return { id: uuidv4(), type: "list", props: { ordered: false }, children };
        }

        case "SlideListItem":
            return { id: uuidv4(), type: "list-item", props: { text: serializeInline($, el) }, children: [] };

        case "SlideNote": {
            const raw = $.html(el);
            const tlMatch = raw.match(/\{`([\s\S]*?)`\}/);
            const content = tlMatch ? tlMatch[1].trim() : serializeInline($, el);
            return { id: uuidv4(), type: "slide-note", props: { content }, children: [] };
        }

        default:
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

        } else if (tag === "div" || tag === "SlidesScreen") {
            // Wrapper transparent — traverser les enfants directement
            const inner = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            blocks.push(...inner);
            i++;

        } else if (tag === "SlideScreen") {
            // Chaque slide = un bloc slide-screen avec titre + enfants
            const title = ($el.attr("title") ?? "").replace(/[{}'"`]/g, "");
            const innerEls = $el.children().toArray() as CheerioElement[];
            const children = groupByHeadings(innerEls, $);
            blocks.push({ id: uuidv4(), type: "slide-screen", props: { title }, children });
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

// ── Pipeline fichier → Babel → Block[] ─────────────────────────────────────
export function parseFile(filePath: string): { blocks: Block[]; warnings: string[] } {
    const warnings: string[] = [];
    const source = _fs.readFileSync(filePath, "utf-8");

    let ast: ReturnType<typeof _babelParser.parse>;
    try {
        ast = _babelParser.parse(source, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
        });
    } catch (err) {
        throw new Error(`Babel parse error: ${(err as Error).message}`);
    }

    // Cherche le premier ReturnStatement avec un argument JSX
    // reason: @babel/traverse et @babel/generator n'ont pas de .d.ts — on caste en unknown
    let jsxNode: unknown = null;
    _trav(ast, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ReturnStatement(p: any) {
            const arg = p.node.argument;
            if (arg && (arg.type === "JSXElement" || arg.type === "JSXFragment")) {
                jsxNode = arg;
                p.stop();
            }
        },
    });

    if (!jsxNode) {
        warnings.push("Aucun JSX trouvé dans le return");
        return { blocks: [], warnings };
    }

    // Resérialise le nœud AST → string JSX
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genResult = _gen(jsxNode as any, { concise: true }) as { code: string };
    const jsxCode = genResult.code;
    const blocks = parseJSXString(jsxCode);
    return { blocks, warnings };
}

export async function upsertContent(
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

export async function updateContentRef(
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

export function getAllTSXFiles(dir: string): string[] {
    let results: string[] = [];
    for (const entry of _fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = _path.join(dir, entry.name);
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

    if (_FILE_FILTER) {
        files = [_FILE_FILTER];
    } else {
        files = getAllTSXFiles("src/cours");
        if (_MODULE_FILTER) {
            files = files.filter(f => f.replace(/\\/g, "/").includes(`/cours/${_MODULE_FILTER}/`));
        }
    }

    if (files.length === 0) {
        console.warn("⚠ Aucun fichier trouvé.");
        return;
    }

    console.log(`${_DRY_RUN ? "[DRY-RUN] " : ""}Migration de ${files.length} fichier(s)...\n`);

    let db: Db | null = null;
    if (!_DRY_RUN) db = await _connectToDB();

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

        if (_DRY_RUN) {
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

if (import.meta.main) {
    main().catch(err => { console.error("Fatal:", err); process.exit(1); });
}
