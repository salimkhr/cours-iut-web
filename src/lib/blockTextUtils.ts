// src/lib/blockTextUtils.ts
// Utilitaires partagés pour search_content et export_content_compact (outils MCP).
// Côté serveur uniquement — pas de React/JSX/browser APIs.

import type { Block } from "@/types/CourseContent";

// ---------------------------------------------------------------------------
// normalizeForSearch
// ---------------------------------------------------------------------------

/** Normalise un texte pour la recherche : retire les accents, met en minuscules. */
export function normalizeForSearch(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/gu, "").toLowerCase();
}

// ---------------------------------------------------------------------------
// str — helper partagé
// ---------------------------------------------------------------------------

function str(v: unknown, fallback = ""): string {
    return typeof v === "string" ? v : fallback;
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
        case "slide-code-with-preview":
            return [str(p.code), str(p.secondaryCode)].filter(Boolean);

        case "diagram":
            return [str(p.header), str(p.chart)].filter(Boolean);

        case "table":
        case "slide-table": {
            const headers = Array.isArray(p.headers) ? (p.headers as string[]) : [];
            const rows = Array.isArray(p.rows) ? (p.rows as string[][]) : [];
            return [headers.join(" "), rows.flat().join(" ")].filter(Boolean);
        }

        case "section-card":
            return [str(p.title), str(p.description)].filter(Boolean);

        case "image-card":
        case "slide-image":
            return [str(p.alt), str(p.title)].filter(Boolean);

        case "slide-transition":
            return [str(p.eyebrow), str(p.title), str(p.subtitle)].filter(Boolean);

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

export type BlockVisitor = (block: Block, ctx: WalkContext) => boolean | void;

// ---------------------------------------------------------------------------
// walkBlocks
// ---------------------------------------------------------------------------

/**
 * Parcourt récursivement l'arbre de blocs en profondeur d'abord.
 * Quand le bloc courant est de type `section`, ses enfants reçoivent
 * `{ parentSectionTitle: block.props.title }`.
 * Pour tous les autres types, les enfants héritent du ctx courant.
 *
 * Le visiteur peut retourner `false` pour interrompre le parcours.
 * `walkBlocks` retourne `false` si le parcours a été interrompu, `true` sinon.
 */
export function walkBlocks(
    blocks: Block[],
    visitor: BlockVisitor,
    ctx: WalkContext = { parentSectionTitle: "" }
): boolean {
    for (const block of blocks) {
        const keep = visitor(block, ctx);
        if (keep === false) return false;
        if (block.children?.length) {
            const childCtx: WalkContext =
                block.type === "section"
                    ? { parentSectionTitle: (block.props.title as string) ?? "" }
                    : ctx;
            if (!walkBlocks(block.children, visitor, childCtx)) return false;
        }
    }
    return true;
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
        if (results.length >= maxResults) return false; // abort — quota atteint

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

/** Marque écrite à la place d'un contenu vide : le bloc garde son marqueur `<!--id-->`. */
const VIDE = "(vide)";

/** Au-delà, le contenu d'un `download-file` est tronqué (mention explicite). */
const DOWNLOAD_MAX_LIGNES = 400;
const DOWNLOAD_MAX_CARACTERES = 20000;

/** Bloc de code clôturé par une suite de backticks plus longue que toute suite du code. */
function fence(code: string, lang: string): string {
    const plusLongue = Math.max(0, ...(code.match(/`+/g) ?? []).map((s) => s.length));
    const ticks = "`".repeat(Math.max(3, plusLongue + 1));
    return `${ticks}${lang}\n${code}\n${ticks}`;
}

/** Indente chaque ligne non vide (contenu imbriqué dans un élément de liste ou un repliable). */
function indent(text: string, spaces: number): string {
    const pad = " ".repeat(spaces);
    return text.split("\n").map((l) => (l ? pad + l : l)).join("\n");
}

function tronquer(code: string): { code: string; mention: string | null } {
    const lignes = code.split("\n");
    let gardees = lignes.slice(0, DOWNLOAD_MAX_LIGNES);
    while (gardees.length > 1 && gardees.join("\n").length > DOWNLOAD_MAX_CARACTERES) {
        gardees = gardees.slice(0, Math.floor(gardees.length * 0.9));
    }
    if (gardees.length === lignes.length) return { code, mention: null };
    return {
        code: gardees.join("\n"),
        mention: `_(tronqué : ${gardees.length} lignes affichées sur ${lignes.length} ; contenu complet via get_content)_`,
    };
}

/** Élément de liste : son texte, puis TOUS ses enfants, indentés sous la puce. */
function renderListItem(
    child: Block,
    prefix: string,
    depth: number,
    limitations: Set<string>
): string {
    const text = str(child.props.text);
    const head = `<!--${child.id}-->\n${prefix} ${text || VIDE}`;
    const childParts = renderBlocks(child.children ?? [], depth, limitations);
    if (childParts.length === 0) return head;
    return [head, indent(childParts.join("\n\n"), prefix.length + 1)].join("\n\n");
}

/**
 * Rend un bloc en Markdown. Chaque bloc, même vide, émet son marqueur
 * `<!--id-->` (le nombre de marqueurs égale le nombre de blocs de l'arbre).
 * Les limitations rencontrées sont ajoutées dans le Set `limitations`.
 */
function renderBlock(block: Block, depth: number, limitations: Set<string>): string | null {
    const { id, type, props } = block;
    const children = block.children ?? [];
    const annotation = `<!--${id}-->`;

    switch (type) {
        case "text":
        case "slide-text": {
            const content = str(props.content);
            return `${annotation}\n${content || VIDE}`;
        }

        case "slide-note": {
            const content = str(props.content);
            if (!content) return `${annotation}\n_Note présentateur : ${VIDE}_`;
            return `${annotation}\n_Note présentateur : ${content}_`;
        }

        case "heading": {
            const level = Math.min(Math.max(Number(props.level) || 1, 1), 3);
            return `${annotation}\n${"#".repeat(level + 1)} ${str(props.text) || VIDE}`;
        }

        case "section": {
            const title = str(props.title) || VIDE;
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
            const items = children.map((child, i) =>
                renderListItem(child, ordered ? `${i + 1}.` : "-", depth, limitations)
            );
            if (items.length === 0) return `${annotation}\n_(liste ${VIDE})_`;
            return [annotation, ...items].join("\n\n");
        }

        case "list-item":
        case "slide-list-item":
            // Hors d'une liste (arbre invalide) : rendu comme une puce isolée.
            return renderListItem(block, "-", depth, limitations);

        case "callout": {
            const variant = str(props.variant) || "info";
            const label = CALLOUT_LABELS[variant] ?? "Info";
            const title = str(props.title);
            const heading = title
                ? `${annotation}\n> **${label} : ${title}**`
                : `${annotation}\n> **${label}**`;
            const childParts = renderBlocks(children, depth, limitations);
            if (childParts.length > 0) {
                return [heading, ...childParts].join("\n\n");
            }
            return heading;
        }

        case "collapsible": {
            // Replié à l'affichage : marqué comme tel (pas un titre), contenu indenté,
            // fin explicite pour savoir où s'arrête le repli.
            const title = str(props.title) || VIDE;
            const heading = `${annotation}\n> [repliable] ${title}`;
            const childParts = renderBlocks(children, depth, limitations);
            const body = childParts.length > 0 ? indent(childParts.join("\n\n"), 2) : `  ${VIDE}`;
            return [heading, body, "> [fin du repliable]"].join("\n\n");
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
            if (childParts.length > 0) {
                return [annotation, ...childParts].join("\n\n");
            }
            return annotation;
        }

        case "code": {
            const code = str(props.code);
            const lang = str(props.language);
            const filename = str(props.filename);
            const codeBlock = fence(code, lang);
            if (filename) {
                return `${annotation}\n_${filename}_\n${codeBlock}`;
            }
            return `${annotation}\n${codeBlock}`;
        }

        case "slide-code": {
            const code = str(props.code);
            const lang = str(props.language);
            return `${annotation}\n${fence(code, lang)}`;
        }

        case "code-with-preview":
        case "slide-code-with-preview": {
            limitations.add(
                "L'aperçu live des blocs code-with-preview n'est pas représentable en Markdown"
            );
            const code = str(props.code);
            const lang = str(props.language);
            const filename = str(props.filename);
            const codeBlock = fence(code, lang);
            const base = filename
                ? `${annotation}\n_${filename}_\n${codeBlock}`
                : `${annotation}\n${codeBlock}`;

            const secondaryCode = str(props.secondaryCode);
            const secondaryLang = str(props.secondaryLanguage);
            const parts = [base];

            if (secondaryCode) {
                const secondaryCodeBlock = fence(secondaryCode, secondaryLang);
                parts.push(secondaryCodeBlock);
            }

            parts.push("_(aperçu live non représentable)_");
            return parts.join("\n");
        }

        case "diagram": {
            const header = str(props.header);
            const chart = str(props.chart);
            const codeBlock = fence(chart, "mermaid");
            if (header) {
                return `${annotation}\n_${header}_\n${codeBlock}`;
            }
            return `${annotation}\n${codeBlock}`;
        }

        case "table":
        case "slide-table": {
            const headers = Array.isArray(props.headers) ? (props.headers as string[]) : [];
            const rows = Array.isArray(props.rows) ? (props.rows as string[][]) : [];
            if (headers.length === 0) return `${annotation}\n_(tableau ${VIDE})_`;
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

        case "image-card":
        case "slide-image": {
            const alt = str(props.alt);
            const src = str(props.src);
            const title = str(props.title);
            const titlePart = title ? ` "${title}"` : "";
            return `${annotation}\n![${alt}](${src}${titlePart})`;
        }

        case "slide-transition": {
            const eyebrow = str(props.eyebrow);
            const title = str(props.title);
            const subtitle = str(props.subtitle);
            const heading = [eyebrow, title].filter(Boolean).join(" ");
            return `${annotation}
## ${heading}${subtitle ? `

${subtitle}` : ""}`;
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
            const filename = str(props.filename) || VIDE;
            const language = str(props.language);
            const head = `${annotation}\n📎 Fichier à télécharger : \`${filename}\`${language ? ` (${language})` : ""}`;
            const code = str(props.code);
            if (!code) return `${head}\n_(contenu vide)_`;
            const { code: shown, mention } = tronquer(code);
            return [head, fence(shown, language), ...(mention ? [mention] : [])].join("\n");
        }

        case "file-tree": {
            const title = str(props.title);
            const paths = str(props.paths).trim();
            const head = `${annotation}\n_Arborescence${title ? ` : ${title}` : ""}_`;
            return paths ? `${head}\n${fence(paths, "text")}` : `${head}\n${VIDE}`;
        }

        case "input-card": {
            const title = str(props.title);
            const description = str(props.description);
            const filename = str(props.filename);
            const lines = [annotation, `**${title || VIDE}**`];
            if (description) lines.push(description);
            if (filename) lines.push(`_${filename}_`);
            lines.push(fence(str(props.code), str(props.language)));
            return lines.join("\n");
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
