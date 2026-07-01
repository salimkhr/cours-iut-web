// src/lib/blockTextUtils.ts
// Utilitaires partagés pour search_content et export_content_compact (outils MCP).
// Côté serveur uniquement — pas de React/JSX/browser APIs.

import type { Block } from "@/types/CourseContent";

// ---------------------------------------------------------------------------
// normalizeForSearch
// ---------------------------------------------------------------------------

/** Normalise un texte pour la recherche : retire les accents, met en minuscules. */
export function normalizeForSearch(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// ---------------------------------------------------------------------------
// extractTextFields
// ---------------------------------------------------------------------------

/**
 * Retourne les champs textuels indexables d'un bloc (props uniquement, hors children).
 * Renvoie uniquement les valeurs non vides.
 */
export function extractTextFields(block: Block): string[] {
    const p = block.props;

    const str = (v: unknown): string => (typeof v === "string" ? v : "");

    switch (block.type) {
        case "text":
        case "slide-text":
        case "slide-note":
            return [str(p.content)].filter(Boolean);

        case "section":
        case "slide":
        case "collapsible":
            return [str(p.title)].filter(Boolean);

        case "list-item":
        case "slide-list-item":
            return [str(p.text)].filter(Boolean);

        case "code":
        case "slide-code":
        case "download-file":
            return [str(p.code), str(p.filename)].filter(Boolean);

        case "code-with-preview":
            return [str(p.code)].filter(Boolean);

        case "diagram":
            return [str(p.header), str(p.chart)].filter(Boolean);

        case "table": {
            const headers = Array.isArray(p.headers) ? (p.headers as string[]) : [];
            const rows = Array.isArray(p.rows) ? (p.rows as string[][]) : [];
            return [headers.join(" "), rows.flat().join(" ")].filter(Boolean);
        }

        case "section-card":
            return [str(p.title), str(p.description)].filter(Boolean);

        case "image-card":
            return [str(p.alt), str(p.title)].filter(Boolean);

        case "quote":
            return [str(p.text), str(p.source)].filter(Boolean);

        case "callout":
            return [str(p.title)].filter(Boolean);

        // divider, columns, column, list, slide-list, etc.
        default:
            return [];
    }
}

// ---------------------------------------------------------------------------
// WalkContext & BlockVisitor
// ---------------------------------------------------------------------------

export interface WalkContext {
    parentSectionTitle: string;
}

export type BlockVisitor = (block: Block, ctx: WalkContext) => void;

// ---------------------------------------------------------------------------
// walkBlocks
// ---------------------------------------------------------------------------

/**
 * Parcourt récursivement l'arbre de blocs en profondeur d'abord.
 * Quand le bloc courant est de type `section`, ses enfants reçoivent
 * `{ parentSectionTitle: block.props.title }`.
 * Pour tous les autres types, les enfants héritent du ctx courant.
 */
export function walkBlocks(
    blocks: Block[],
    visitor: BlockVisitor,
    ctx: WalkContext = { parentSectionTitle: "" }
): void {
    for (const block of blocks) {
        visitor(block, ctx);
        if (block.children && block.children.length > 0) {
            const childCtx: WalkContext =
                block.type === "section"
                    ? { parentSectionTitle: (block.props.title as string) ?? "" }
                    : ctx;
            walkBlocks(block.children, visitor, childCtx);
        }
    }
}

// ---------------------------------------------------------------------------
// SearchMatch
// ---------------------------------------------------------------------------

export interface SearchMatch {
    module: string;
    section: string;
    contentType: string;
    blockId: string;
    blockType: string;
    parentSectionTitle: string;
    snippet: string;
}

// ---------------------------------------------------------------------------
// searchBlocks
// ---------------------------------------------------------------------------

/**
 * Parcourt l'arbre via `walkBlocks` et accumule les blocs dont les champs
 * textuels contiennent `normalizedQuery`.
 * Un seul match par bloc (premier champ qui matche). S'arrête quand
 * `results.length >= maxResults`.
 *
 * @param blocks          Arbre de blocs à inspecter
 * @param moduleSlug      Slug du module (copié dans chaque SearchMatch)
 * @param sectionSlug     Slug de la section (copié dans chaque SearchMatch)
 * @param contentType     Type de contenu (copié dans chaque SearchMatch)
 * @param normalizedQuery Requête déjà normalisée via `normalizeForSearch`
 * @param maxResults      Nombre maximal de résultats à accumuler
 * @param results         Tableau de résultats à muter (ajout push)
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
                const start = Math.max(0, idx - 60);
                const end = Math.min(field.length, idx + normalizedQuery.length + 60);
                results.push({
                    module: moduleSlug,
                    section: sectionSlug,
                    contentType,
                    blockId: block.id,
                    blockType: block.type,
                    parentSectionTitle: ctx.parentSectionTitle,
                    snippet: field.slice(start, end),
                });
                break; // un seul match par bloc
            }
        }
    });
}

// ---------------------------------------------------------------------------
// blocksToMarkdown — helpers internes
// ---------------------------------------------------------------------------

const CALLOUT_LABELS: Record<string, string> = {
    info: "Info",
    warning: "Attention",
    tip: "Astuce",
    reminder: "Rappel",
};

function str(v: unknown): string {
    return typeof v === "string" ? v : "";
}

/**
 * Rend un bloc en Markdown. Retourne `null` si le bloc n'a pas de contenu à
 * émettre (ex. texte vide). Les limitations rencontrées sont ajoutées dans
 * le Set `limitations`.
 */
function renderBlock(block: Block, depth: number, limitations: Set<string>): string | null {
    const { id, type, props } = block;
    const children = block.children ?? [];
    const annotation = `<!--${id}-->`;

    switch (type) {
        case "text":
        case "slide-text": {
            const content = str(props.content);
            if (!content) return null;
            return `${annotation}\n${content}`;
        }

        case "slide-note": {
            const content = str(props.content);
            if (!content) return null;
            return `${annotation}\n_Note présentateur : ${content}_`;
        }

        case "section": {
            const title = str(props.title);
            const level = Math.min(2 + depth, 6);
            const hashes = "#".repeat(level);
            const heading = `${annotation}\n${hashes} ${title}`;
            const childParts = renderBlocks(children, depth + 1, limitations);
            return [heading, ...childParts].join("\n\n");
        }

        case "slide": {
            const title = str(props.title);
            const heading = `${annotation}\n## ${title}`;
            const childParts = renderBlocks(children, depth, limitations);
            return [heading, ...childParts].join("\n\n");
        }

        case "list":
        case "slide-list": {
            const ordered = !!(props.ordered as boolean | undefined);
            const items: string[] = [];
            for (const child of children) {
                const text = str(child.props.text);
                const prefix = ordered ? "1." : "-";
                items.push(`<!--${child.id}-->\n${prefix} ${text}`);
            }
            if (items.length === 0) return null;
            return items.join("\n\n");
        }

        case "callout": {
            const variant = str(props.variant) || "info";
            const label = CALLOUT_LABELS[variant] ?? "Info";
            const title = str(props.title);
            const heading = `${annotation}\n> **${label} — ${title}**`;
            const childParts = renderBlocks(children, depth, limitations);
            if (childParts.length > 0) {
                return [heading, ...childParts].join("\n\n");
            }
            return heading;
        }

        case "collapsible": {
            const title = str(props.title);
            const heading = `${annotation}\n### ${title}`;
            const childParts = renderBlocks(children, depth, limitations);
            if (childParts.length > 0) {
                return [heading, ...childParts].join("\n\n");
            }
            return heading;
        }

        case "columns": {
            limitations.add(
                "Les colonnes (layout multi-colonnes) ne sont pas représentables en Markdown linéaire"
            );
            const childParts = renderBlocks(children, depth, limitations);
            if (childParts.length > 0) {
                return [annotation, ...childParts].join("\n\n");
            }
            return annotation;
        }

        case "column": {
            // Pas de markup propre : on aplatit les enfants directement.
            const childParts = renderBlocks(children, depth, limitations);
            if (childParts.length === 0) return null;
            return childParts.join("\n\n");
        }

        case "code": {
            const code = str(props.code);
            const lang = str(props.language);
            const filename = str(props.filename);
            const codeBlock = `\`\`\`${lang}\n${code}\n\`\`\``;
            if (filename) {
                return `${annotation}\n_${filename}_\n${codeBlock}`;
            }
            return `${annotation}\n${codeBlock}`;
        }

        case "slide-code": {
            const code = str(props.code);
            const lang = str(props.language);
            return `${annotation}\n\`\`\`${lang}\n${code}\n\`\`\``;
        }

        case "code-with-preview": {
            limitations.add(
                "L'aperçu live des blocs code-with-preview n'est pas représentable en Markdown"
            );
            const code = str(props.code);
            const lang = str(props.language);
            const filename = str(props.filename);
            const codeBlock = `\`\`\`${lang}\n${code}\n\`\`\``;
            const base = filename
                ? `${annotation}\n_${filename}_\n${codeBlock}`
                : `${annotation}\n${codeBlock}`;
            return `${base}\n_(aperçu live non représentable)_`;
        }

        case "diagram": {
            const header = str(props.header);
            const chart = str(props.chart);
            const codeBlock = `\`\`\`mermaid\n${chart}\n\`\`\``;
            if (header) {
                return `${annotation}\n_${header}_\n${codeBlock}`;
            }
            return `${annotation}\n${codeBlock}`;
        }

        case "table": {
            const headers = Array.isArray(props.headers) ? (props.headers as string[]) : [];
            const rows = Array.isArray(props.rows) ? (props.rows as string[][]) : [];
            if (headers.length === 0) return annotation;
            const headerRow = `| ${headers.join(" | ")} |`;
            const separator = `| ${headers.map(() => "---").join(" | ")} |`;
            const dataRows = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
            const table = dataRows
                ? `${headerRow}\n${separator}\n${dataRows}`
                : `${headerRow}\n${separator}`;
            return `${annotation}\n${table}`;
        }

        case "section-card": {
            const title = str(props.title);
            const href = str(props.href);
            const description = str(props.description);
            const link = `[${title}](${href})`;
            return `${annotation}\n${link}${description ? ` — ${description}` : ""}`;
        }

        case "image-card": {
            const alt = str(props.alt);
            const src = str(props.src);
            const title = str(props.title);
            const titlePart = title ? ` "${title}"` : "";
            return `${annotation}\n![${alt}](${src}${titlePart})`;
        }

        case "quote": {
            const text = str(props.text);
            const source = str(props.source);
            const quoteLine = `> ${text}`;
            if (source) {
                return `${annotation}\n${quoteLine}\n> — ${source}`;
            }
            return `${annotation}\n${quoteLine}`;
        }

        case "download-file": {
            limitations.add(
                "Les fichiers téléchargeables (download-file) nécessitent un lien non exportable"
            );
            const filename = str(props.filename);
            const language = str(props.language);
            return `${annotation}\n📎 \`${filename}\` (${language})`;
        }

        case "divider":
            return `${annotation}\n---`;

        default: {
            limitations.add(
                `Le type de bloc "${type}" n'est pas pris en charge dans l'export Markdown`
            );
            const childParts = renderBlocks(children, depth, limitations);
            const header = `${annotation}\n_(bloc ${type})_`;
            if (childParts.length > 0) {
                return [header, ...childParts].join("\n\n");
            }
            return header;
        }
    }
}

function renderBlocks(blocks: Block[], depth: number, limitations: Set<string>): string[] {
    return blocks.flatMap((block) => {
        const rendered = renderBlock(block, depth, limitations);
        return rendered !== null ? [rendered] : [];
    });
}

// ---------------------------------------------------------------------------
// blocksToMarkdown — export public
// ---------------------------------------------------------------------------

/**
 * Sérialise un arbre de blocs en Markdown compact.
 *
 * - Chaque bloc est annoté de son ID : `<!--blockId-->` (sans espace).
 * - Les blocs sont séparés par `\n\n`.
 * - Si `includeLimitations=true` et que des blocs non représentables ont été
 *   rencontrés, une section "Limitations" est ajoutée en fin de document.
 */
export function blocksToMarkdown(blocks: Block[], includeLimitations = false): string {
    const limitations = new Set<string>();
    const parts = renderBlocks(blocks, 0, limitations);
    let result = parts.join("\n\n");

    if (includeLimitations && limitations.size > 0) {
        const limList = Array.from(limitations)
            .map((l) => `- ${l}`)
            .join("\n");
        result += `\n\n---\n**Limitations de cet export :**\n${limList}`;
    }

    return result;
}
