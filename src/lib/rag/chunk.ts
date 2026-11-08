// src/lib/rag/chunk.ts
// RAG, étape 1 : découpe un contenu (arbre de blocs) en morceaux à vectoriser.
// Côté serveur uniquement.

import type { Block } from "@/types/CourseContent";
import { blocksToMarkdown } from "@/lib/blockTextUtils";
import { findAllIds } from "@/lib/blockTreeUtils";

export interface ChunkSource {
    moduleSlug: string;
    moduleTitle: string;
    sectionSlug: string;
    sectionTitle: string;
    contentType: string;
}

export interface RagChunk extends ChunkSource {
    /** Position du morceau dans le contenu, à partir de 0. */
    index: number;
    /** Chemin des titres de section, ex. « Tableaux › Associatifs ». */
    title: string;
    /** Blocs couverts par le morceau, pour retrouver l'original. */
    blockIds: string[];
    /** Texte vectorisé : ligne de contexte, puis le Markdown des blocs. */
    text: string;
    words: number;
}

/** Au-delà, une section est recoupée (sous-sections, sinon entre deux blocs). */
export const DEFAULT_MAX_WORDS = 600;

const TYPE_LABELS: Record<string, string> = { cours: "Cours", TP: "TP", examen: "Examen", slide: "Slides" };

/** Blocs dont le titre structure le contenu. */
const isSection = (block: Block) => block.type === "section" || block.type === "slide";

/** Morceau en construction : les blocs à rendre et les ids qu'il couvre. */
interface Draft {
    path: string[];
    blocks: Block[];
    ids: string[];
}

/** Markdown sans marqueurs d'id ni titres vides (`## (vide)`). */
const toMarkdown = (blocks: Block[]) =>
    blocksToMarkdown(blocks).replace(/<!--[^>]*-->\n?/g, "").replace(/^#+ \(vide\)\n*/gm, "").trim();
const countWords = (blocks: Block[]) => toMarkdown(blocks).split(/\s+/).filter(Boolean).length;
const add = (draft: Draft, blocks: Block[]) => {
    draft.blocks.push(...blocks);
    draft.ids.push(...findAllIds(blocks));
};

/**
 * Découpe une section. `prefix` porte ce qui la précède et doit la suivre
 * dans le même morceau (blocs isolés, introduction de la section parente).
 */
function chunkSection(section: Block, prefix: Draft, path: string[], maxWords: number): Draft[] {
    const title = String(section.props.title ?? "").trim() || "Introduction";
    const here = [...path, title];
    const whole: Draft = { path: here, blocks: [...prefix.blocks], ids: [...prefix.ids] };
    add(whole, [section]);
    if (countWords(whole.blocks) <= maxWords) return [whole];

    const children = section.children ?? [];
    const pending: Draft = { path: here, blocks: [...prefix.blocks], ids: [...prefix.ids, section.id] };

    if (children.some(isSection)) {
        const drafts: Draft[] = [];
        for (const child of children) {
            if (!isSection(child)) {
                add(pending, [child]);
                continue;
            }
            drafts.push(...chunkSection(child, { ...pending }, here, maxWords));
            pending.blocks = [];
            pending.ids = [];
        }
        if (pending.blocks.length > 0) add(drafts[drafts.length - 1], pending.blocks);
        return drafts;
    }

    // Pas de sous-section : on remplit chaque morceau jusqu'au seuil, sans couper un bloc.
    const drafts: Draft[] = [pending];
    for (const child of children) {
        const current = drafts[drafts.length - 1];
        const hasContent = current.blocks.length > prefix.blocks.length || drafts.length > 1;
        if (hasContent && countWords([...current.blocks, child]) > maxWords) {
            drafts.push({ path: [...here.slice(0, -1), `${title} (suite)`], blocks: [], ids: [] });
        }
        add(drafts[drafts.length - 1], [child]);
    }
    return drafts;
}

/** Découpe un contenu en morceaux : un par section de premier niveau, recoupée au-delà de `maxWords`. */
export function chunkContent(source: ChunkSource, blocks: Block[], maxWords = DEFAULT_MAX_WORDS): RagChunk[] {
    const drafts: Draft[] = [];
    let pending: Draft = { path: [], blocks: [], ids: [] };

    for (const block of blocks) {
        if (!isSection(block)) {
            add(pending, [block]);
            continue;
        }
        drafts.push(...chunkSection(block, pending, [], maxWords));
        pending = { path: [], blocks: [], ids: [] };
    }
    if (pending.blocks.length > 0) {
        if (drafts.length > 0) add(drafts[drafts.length - 1], pending.blocks);
        else drafts.push({ ...pending, path: [source.sectionTitle] });
    }

    const typeLabel = TYPE_LABELS[source.contentType] ?? source.contentType;
    return drafts.map((draft, index) => {
        const title = draft.path.join(" › ");
        const header = [source.moduleTitle, source.sectionTitle, typeLabel, title].join(" › ");
        return {
            ...source,
            index,
            title,
            blockIds: draft.ids,
            text: `${header}\n\n${toMarkdown(draft.blocks)}`,
            words: countWords(draft.blocks),
        };
    });
}
